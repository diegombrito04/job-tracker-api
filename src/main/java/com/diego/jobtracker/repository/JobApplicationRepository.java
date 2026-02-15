package com.diego.jobtracker.repository;

import com.diego.jobtracker.model.ApplicationStatus;
import com.diego.jobtracker.model.JobApplication;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface JobApplicationRepository extends JpaRepository<JobApplication, Long> {

    List<JobApplication> findByStatus(ApplicationStatus status);

    Page<JobApplication> findByStatus(ApplicationStatus status, Pageable pageable);
}