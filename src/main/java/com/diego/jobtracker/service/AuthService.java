package com.diego.jobtracker.service;

import com.diego.jobtracker.dto.auth.AuthResponse;
import com.diego.jobtracker.dto.auth.AuthUserResponse;
import com.diego.jobtracker.dto.auth.LoginRequest;
import com.diego.jobtracker.dto.auth.RegisterRequest;
import com.diego.jobtracker.dto.auth.UpdateMeRequest;
import com.diego.jobtracker.model.User;
import com.diego.jobtracker.repository.UserRepository;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public AuthService(
            UserRepository userRepository,
            PasswordEncoder passwordEncoder
    ) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    public AuthResponse register(RegisterRequest request) {
        String email = normalizeEmail(request.email());
        if (userRepository.existsByEmail(email)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Email already in use");
        }

        User user = new User();
        user.setName(request.name().trim());
        user.setEmail(email);
        user.setPasswordHash(passwordEncoder.encode(request.password()));
        user.setLanguage("pt");
        user.setTheme("light");
        user.setSidebarVisible(true);
        User saved = userRepository.save(user);

        return toAuthResponse(saved);
    }

    public AuthResponse login(LoginRequest request) {
        String email = normalizeEmail(request.email());
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid credentials"));

        if (!passwordEncoder.matches(request.password(), user.getPasswordHash())) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid credentials");
        }

        return toAuthResponse(user);
    }

    public AuthUserResponse me(String email) {
        User user = userRepository.findByEmail(normalizeEmail(email))
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "User not found"));
        return AuthUserResponse.fromUser(user);
    }

    public AuthUserResponse updateMe(String email, UpdateMeRequest request) {
        User user = userRepository.findByEmail(normalizeEmail(email))
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "User not found"));

        if (request.name() != null) {
            String name = request.name().trim();
            if (name.isBlank()) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Name cannot be blank");
            }
            user.setName(name);
        }

        if (request.avatarUrl() != null) {
            String avatar = request.avatarUrl().trim();
            user.setAvatarUrl(avatar.isBlank() ? null : avatar);
        }

        if (request.language() != null) {
            String language = request.language().trim().toLowerCase();
            if (!language.equals("pt") && !language.equals("en")) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid language");
            }
            user.setLanguage(language);
        }

        if (request.theme() != null) {
            String theme = request.theme().trim().toLowerCase();
            if (!theme.equals("light") && !theme.equals("dark")) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid theme");
            }
            user.setTheme(theme);
        }

        if (request.sidebarVisible() != null) {
            user.setSidebarVisible(request.sidebarVisible());
        }

        User saved = userRepository.save(user);
        return AuthUserResponse.fromUser(saved);
    }

    private AuthResponse toAuthResponse(User user) {
        return new AuthResponse(AuthUserResponse.fromUser(user));
    }

    private String normalizeEmail(String email) {
        return email == null ? "" : email.trim().toLowerCase();
    }
}
