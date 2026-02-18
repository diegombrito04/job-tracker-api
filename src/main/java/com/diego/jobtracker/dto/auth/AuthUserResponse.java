package com.diego.jobtracker.dto.auth;

import com.diego.jobtracker.model.User;

public record AuthUserResponse(
        Long id,
        String name,
        String email,
        String avatarUrl,
        String language,
        String theme,
        Boolean sidebarVisible
) {
    public static AuthUserResponse fromUser(User user) {
        return new AuthUserResponse(
                user.getId(),
                user.getName(),
                user.getEmail(),
                user.getAvatarUrl(),
                user.getLanguage(),
                user.getTheme(),
                user.getSidebarVisible()
        );
    }
}
