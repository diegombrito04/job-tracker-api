package com.diego.jobtracker.dto;

import com.diego.jobtracker.model.ApplicationStatus;
import com.diego.jobtracker.model.StatusHistory;

import java.time.LocalDateTime;

public record StatusHistoryResponse(
        Long id,
        ApplicationStatus fromStatus,
        ApplicationStatus toStatus,
        LocalDateTime changedAt
) {
    public static StatusHistoryResponse fromEntity(StatusHistory history) {
        return new StatusHistoryResponse(
                history.getId(),
                history.getFromStatus(),
                history.getToStatus(),
                history.getChangedAt()
        );
    }
}
