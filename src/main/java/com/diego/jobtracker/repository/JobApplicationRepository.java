// src/main/java/com/diego/jobtracker/repository/JobApplicationRepository.java
package com.diego.jobtracker.repository;

import com.diego.jobtracker.model.ApplicationStatus;
import com.diego.jobtracker.model.JobApplication;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.Optional;

public interface JobApplicationRepository extends JpaRepository<JobApplication, Long> {
    Page<JobApplication> findByUserId(Long userId, Pageable pageable);
    Page<JobApplication> findByUserIdAndStatus(Long userId, ApplicationStatus status, Pageable pageable);
    Page<JobApplication> findByUserIdAndFollowUpDateLessThanEqual(Long userId, LocalDate followUpDate, Pageable pageable);
    Page<JobApplication> findByUserIdAndFollowUpDateLessThan(Long userId, LocalDate followUpDate, Pageable pageable);
    Page<JobApplication> findByUserIdAndStatusAndFollowUpDateLessThanEqual(Long userId, ApplicationStatus status, LocalDate followUpDate, Pageable pageable);
    Page<JobApplication> findByUserIdAndStatusAndFollowUpDateLessThan(Long userId, ApplicationStatus status, LocalDate followUpDate, Pageable pageable);
    Optional<JobApplication> findByIdAndUserId(Long id, Long userId);
    boolean existsByIdAndUserId(Long id, Long userId);
}
