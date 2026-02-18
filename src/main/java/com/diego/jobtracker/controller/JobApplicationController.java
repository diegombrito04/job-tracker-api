// src/main/java/com/diego/jobtracker/controller/JobApplicationController.java
package com.diego.jobtracker.controller;

import com.diego.jobtracker.dto.UpsertJobApplicationRequest;
import com.diego.jobtracker.dto.UpdateJobApplicationRequest;
import com.diego.jobtracker.model.ApplicationStatus;
import com.diego.jobtracker.model.JobApplication;
import com.diego.jobtracker.model.User;
import com.diego.jobtracker.repository.JobApplicationRepository;
import com.diego.jobtracker.repository.UserRepository;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

@RestController
@RequestMapping("/applications")
public class JobApplicationController {

    private final JobApplicationRepository repository;
    private final UserRepository userRepository;

    public JobApplicationController(
            JobApplicationRepository repository,
            UserRepository userRepository
    ) {
        this.repository = repository;
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
            Authentication authentication,
            @PageableDefault(size = 10) Pageable pageable
    ) {
        User currentUser = requireCurrentUser(authentication);
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
        app.setAppliedDate(body.appliedDate());
        app.setNotes(body.notes());
        app.setJobUrl(body.jobUrl());
        app.setSalary(body.salary());
        app.setUser(currentUser);
        return repository.save(app);
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

        app.setStatus(body.status());
        return repository.save(app);
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

        app.setCompany(body.company().trim());
        app.setRole(body.role().trim());
        app.setStatus(body.status());
        app.setAppliedDate(body.appliedDate());
        app.setNotes(body.notes());
        app.setJobUrl(body.jobUrl());
        app.setSalary(body.salary());
        return repository.save(app);
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
}
