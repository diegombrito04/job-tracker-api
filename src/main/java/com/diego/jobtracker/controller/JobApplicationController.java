// src/main/java/com/diego/jobtracker/controller/JobApplicationController.java
package com.diego.jobtracker.controller;

import com.diego.jobtracker.dto.StatusHistoryResponse;
import com.diego.jobtracker.dto.UpsertJobApplicationRequest;
import com.diego.jobtracker.dto.UpdateJobApplicationRequest;
import com.diego.jobtracker.model.ApplicationPriority;
import com.diego.jobtracker.model.ApplicationStatus;
import com.diego.jobtracker.model.JobApplication;
import com.diego.jobtracker.model.StatusHistory;
import com.diego.jobtracker.model.User;
import com.diego.jobtracker.repository.JobApplicationRepository;
import com.diego.jobtracker.repository.StatusHistoryRepository;
import com.diego.jobtracker.repository.UserRepository;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.time.LocalDate;

@RestController
@RequestMapping("/applications")
public class JobApplicationController {

    private final JobApplicationRepository repository;
    private final StatusHistoryRepository statusHistoryRepository;
    private final UserRepository userRepository;

    public JobApplicationController(
            JobApplicationRepository repository,
            StatusHistoryRepository statusHistoryRepository,
            UserRepository userRepository
    ) {
        this.repository = repository;
        this.statusHistoryRepository = statusHistoryRepository;
        this.userRepository = userRepository;
    }

    @GetMapping("/ping")
    public String ping() {
        return "applications ok";
    }

    /**
     * Lista com paginação (e filtro opcional por status)
     * Ex:
     *  /applications?page=0&size=5&sort=appliedDate,desc
     *  /applications?status=APPLIED&page=0&size=5
     */
    @SuppressWarnings("null")
    @GetMapping
    public Page<JobApplication> list(
            @RequestParam(name = "status", required = false) ApplicationStatus status,
            @RequestParam(name = "followUpDue", required = false, defaultValue = "false") boolean followUpDue,
            @RequestParam(name = "followUpOverdue", required = false, defaultValue = "false") boolean followUpOverdue,
            Authentication authentication,
            @PageableDefault(size = 10) Pageable pageable
    ) {
        User currentUser = requireCurrentUser(authentication);
        LocalDate today = LocalDate.now();

        if (followUpOverdue) {
            if (status != null) {
                return repository.findByUserIdAndStatusAndFollowUpDateLessThan(
                        currentUser.getId(),
                        status,
                        today,
                        pageable
                );
            }
            return repository.findByUserIdAndFollowUpDateLessThan(currentUser.getId(), today, pageable);
        }

        if (followUpDue) {
            if (status != null) {
                return repository.findByUserIdAndStatusAndFollowUpDateLessThanEqual(
                        currentUser.getId(),
                        status,
                        today,
                        pageable
                );
            }
            return repository.findByUserIdAndFollowUpDateLessThanEqual(currentUser.getId(), today, pageable);
        }
        if (status != null) {
            return repository.findByUserIdAndStatus(currentUser.getId(), status, pageable);
        }
        return repository.findByUserId(currentUser.getId(), pageable);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public JobApplication create(
            @Valid @RequestBody UpsertJobApplicationRequest body,
            Authentication authentication
    ) {
        User currentUser = requireCurrentUser(authentication);
        JobApplication app = new JobApplication();
        app.setCompany(body.company().trim());
        app.setRole(body.role().trim());
        app.setStatus(body.status());
        app.setPriority(body.priority() == null ? ApplicationPriority.MEDIUM : body.priority());
        app.setAppliedDate(body.appliedDate());
        app.setFollowUpDate(body.followUpDate());
        app.setNotes(body.notes());
        app.setJobUrl(body.jobUrl());
        app.setSalary(body.salary());
        app.setUser(currentUser);
        JobApplication saved = repository.save(app);
        recordStatusChange(currentUser, saved, null, saved.getStatus());
        return saved;
    }

    @GetMapping("/{id}")
    public JobApplication getById(
            @PathVariable(name = "id") long id,
            Authentication authentication
    ) {
        User currentUser = requireCurrentUser(authentication);
        return repository.findByIdAndUserId(id, currentUser.getId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Application not found"));
    }

    @PatchMapping("/{id}/status")
    public JobApplication updateStatus(
            @PathVariable(name = "id") long id,
            Authentication authentication,
            @Valid @RequestBody UpdateJobApplicationRequest body
    ) {
        User currentUser = requireCurrentUser(authentication);
        JobApplication app = repository.findByIdAndUserId(id, currentUser.getId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Application not found"));

        ApplicationStatus previousStatus = app.getStatus();
        if (previousStatus == body.status()) {
            return app;
        }
        app.setStatus(body.status());
        JobApplication saved = repository.save(app);
        recordStatusChange(currentUser, saved, previousStatus, saved.getStatus());
        return saved;
    }

    /**
     * Atualiza campos principais (edição no front)
     * PUT /applications/{id}
     */
    @PutMapping("/{id}")
    public JobApplication update(
            @PathVariable(name = "id") long id,
            Authentication authentication,
            @Valid @RequestBody UpsertJobApplicationRequest body
    ) {
        User currentUser = requireCurrentUser(authentication);
        JobApplication app = repository.findByIdAndUserId(id, currentUser.getId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Application not found"));

        ApplicationStatus previousStatus = app.getStatus();
        app.setCompany(body.company().trim());
        app.setRole(body.role().trim());
        app.setStatus(body.status());
        app.setPriority(body.priority() == null ? ApplicationPriority.MEDIUM : body.priority());
        app.setAppliedDate(body.appliedDate());
        app.setFollowUpDate(body.followUpDate());
        app.setNotes(body.notes());
        app.setJobUrl(body.jobUrl());
        app.setSalary(body.salary());
        JobApplication saved = repository.save(app);
        if (previousStatus != saved.getStatus()) {
            recordStatusChange(currentUser, saved, previousStatus, saved.getStatus());
        }
        return saved;
    }

    @GetMapping("/{id}/history")
    public List<StatusHistoryResponse> history(
            @PathVariable(name = "id") long id,
            Authentication authentication
    ) {
        User currentUser = requireCurrentUser(authentication);
        if (!repository.existsByIdAndUserId(id, currentUser.getId())) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Application not found");
        }

        return statusHistoryRepository
                .findByApplicationIdAndUserIdOrderByChangedAtDesc(id, currentUser.getId())
                .stream()
                .map(StatusHistoryResponse::fromEntity)
                .toList();
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(
            @PathVariable(name = "id") long id,
            Authentication authentication
    ) {
        User currentUser = requireCurrentUser(authentication);
        if (!repository.existsByIdAndUserId(id, currentUser.getId())) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Application not found");
        }
        repository.deleteById(id);
    }

    private User requireCurrentUser(Authentication authentication) {
        if (authentication == null || authentication.getName() == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Unauthorized");
        }

        return userRepository.findByEmail(authentication.getName())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Unauthorized"));
    }

    private void recordStatusChange(
            User user,
            JobApplication application,
            ApplicationStatus fromStatus,
            ApplicationStatus toStatus
    ) {
        StatusHistory history = new StatusHistory();
        history.setUser(user);
        history.setApplication(application);
        history.setFromStatus(fromStatus);
        history.setToStatus(toStatus);
        statusHistoryRepository.save(history);
    }
}
