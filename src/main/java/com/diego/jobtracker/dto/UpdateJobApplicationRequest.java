package com.diego.jobtracker.dto;

import com.diego.jobtracker.model.ApplicationStatus;
import jakarta.validation.constraints.NotNull;

public record UpdateJobApplicationRequest(
        @NotNull(message = "status is required")
        ApplicationStatus status
) {}