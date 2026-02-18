package com.diego.jobtracker.controller;

import com.diego.jobtracker.dto.auth.AuthResponse;
import com.diego.jobtracker.dto.auth.AuthUserResponse;
import com.diego.jobtracker.dto.auth.LoginRequest;
import com.diego.jobtracker.dto.auth.RegisterRequest;
import com.diego.jobtracker.dto.auth.UpdateMeRequest;
import com.diego.jobtracker.security.JwtService;
import com.diego.jobtracker.service.AuthService;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseCookie;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/auth")
public class AuthController {

    private final AuthService authService;
    private final JwtService jwtService;

    @Value("${app.auth.cookie.name:jt_session}")
    private String authCookieName;

    @Value("${app.auth.cookie.secure:false}")
    private boolean authCookieSecure;

    @Value("${app.auth.cookie.same-site:Lax}")
    private String authCookieSameSite;

    @Value("${app.auth.cookie.path:/}")
    private String authCookiePath;

    @Value("${app.auth.cookie.domain:}")
    private String authCookieDomain;

    public AuthController(AuthService authService, JwtService jwtService) {
        this.authService = authService;
        this.jwtService = jwtService;
    }

    @PostMapping("/register")
    @ResponseStatus(HttpStatus.CREATED)
    public AuthResponse register(
            @Valid @RequestBody RegisterRequest request,
            HttpServletResponse response
    ) {
        AuthResponse authResponse = authService.register(request);
        writeSessionCookie(response, authResponse.user().email());
        return authResponse;
    }

    @PostMapping("/login")
    public AuthResponse login(
            @Valid @RequestBody LoginRequest request,
            HttpServletResponse response
    ) {
        AuthResponse authResponse = authService.login(request);
        writeSessionCookie(response, authResponse.user().email());
        return authResponse;
    }

    @PostMapping("/logout")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void logout(HttpServletResponse response) {
        clearSessionCookie(response);
    }

    @GetMapping("/me")
    public AuthUserResponse me(Authentication authentication) {
        return authService.me(authentication.getName());
    }

    @PatchMapping("/me")
    public AuthUserResponse updateMe(
            Authentication authentication,
            @RequestBody UpdateMeRequest request
    ) {
        return authService.updateMe(authentication.getName(), request);
    }

    private void writeSessionCookie(HttpServletResponse response, String email) {
        String token = jwtService.generateToken(email);
        long maxAgeSeconds = Math.max(1L, jwtService.getExpirationMs() / 1000L);

        ResponseCookie.ResponseCookieBuilder builder = ResponseCookie.from(authCookieName, token)
                .httpOnly(true)
                .secure(authCookieSecure)
                .sameSite(authCookieSameSite)
                .path(authCookiePath)
                .maxAge(maxAgeSeconds);

        if (authCookieDomain != null && !authCookieDomain.isBlank()) {
            builder.domain(authCookieDomain.trim());
        }

        response.addHeader(HttpHeaders.SET_COOKIE, builder.build().toString());
    }

    private void clearSessionCookie(HttpServletResponse response) {
        ResponseCookie.ResponseCookieBuilder builder = ResponseCookie.from(authCookieName, "")
                .httpOnly(true)
                .secure(authCookieSecure)
                .sameSite(authCookieSameSite)
                .path(authCookiePath)
                .maxAge(0);

        if (authCookieDomain != null && !authCookieDomain.isBlank()) {
            builder.domain(authCookieDomain.trim());
        }

        response.addHeader(HttpHeaders.SET_COOKIE, builder.build().toString());
    }
}
