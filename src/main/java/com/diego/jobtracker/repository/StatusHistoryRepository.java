package com.diego.jobtracker.repository;

import com.diego.jobtracker.model.StatusHistory;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface StatusHistoryRepository extends JpaRepository<StatusHistory, Long> {
    List<StatusHistory> findByApplicationIdAndUserIdOrderByChangedAtDesc(Long applicationId, Long userId);
}
