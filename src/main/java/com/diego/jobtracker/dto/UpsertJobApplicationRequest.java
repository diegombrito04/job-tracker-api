// src/main/java/com/diego/jobtracker/dto/UpsertJobApplicationRequest.java
package com.diego.jobtracker.dto;

import com.diego.jobtracker.model.ApplicationStatus;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.time.LocalDate;

public record UpsertJobApplicationRequest(
        @NotBlank(message = "company is required")
        String company,

        @NotBlank(message = "role is required")
        String role,

        @NotNull(message = "status is required")
        ApplicationStatus status,

        // deixa opcional (pode ser null). Se quiser obrigar, troca pra @NotNull.
        LocalDate appliedDate
) {}
