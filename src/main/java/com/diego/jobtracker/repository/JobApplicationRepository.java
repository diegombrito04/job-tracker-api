// src/main/java/com/diego/jobtracker/repository/JobApplicationRepository.java
package com.diego.jobtracker.repository;

import com.diego.jobtracker.model.ApplicationStatus;
import com.diego.jobtracker.model.JobApplication;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

public interface JobApplicationRepository extends JpaRepository<JobApplication, Long> {
    Page<JobApplication> findByStatus(ApplicationStatus status, Pageable pageable);
}
