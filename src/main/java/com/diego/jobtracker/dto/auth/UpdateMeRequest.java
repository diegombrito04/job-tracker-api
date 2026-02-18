package com.diego.jobtracker.dto.auth;

public record UpdateMeRequest(
        String name,
        String avatarUrl,
        String language,
        String theme,
        Boolean sidebarVisible
) {
}
