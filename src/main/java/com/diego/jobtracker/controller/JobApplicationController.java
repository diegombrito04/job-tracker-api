package com.diego.jobtracker.controller;

import com.diego.jobtracker.dto.UpdateJobApplicationRequest;
import com.diego.jobtracker.model.ApplicationStatus;
import com.diego.jobtracker.model.JobApplication;
import com.diego.jobtracker.repository.JobApplicationRepository;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

@RestController
@RequestMapping("/applications")
public class JobApplicationController {

    private final JobApplicationRepository repository;

    public JobApplicationController(JobApplicationRepository repository) {
        this.repository = repository;
    }

    @GetMapping("/ping")
    public String ping() {
        return "applications ok";
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public JobApplication create(@Valid @RequestBody JobApplication jobApplication) {
        // garante que não vem id “forçado” do client
        jobApplication.setId(null);
        return repository.save(jobApplication);
    }

    // GET /applications?page=0&size=10&sort=appliedDate,desc
    // GET /applications?status=APPLIED&page=0&size=10&sort=appliedDate,desc
    @GetMapping
    public Page<JobApplication> list(
            @RequestParam(required = false) ApplicationStatus status,
            Pageable pageable
    ) {
        if (status != null) {
            return repository.findByStatus(status, pageable);
        }
        return repository.findAll(pageable);
    }

    @GetMapping("/{id}")
    public JobApplication getById(@PathVariable Long id) {
        return repository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Application not found"
                ));
    }

    // PATCH /applications/1/status
    // body: {"status":"INTERVIEW"}
    @PatchMapping("/{id}/status")
    public JobApplication updateStatus(
            @PathVariable Long id,
            @Valid @RequestBody UpdateJobApplicationRequest body
    ) {
        JobApplication app = repository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Application not found"
                ));

        // record -> accessor é body.status() (não getStatus())
        app.setStatus(body.status());
        return repository.save(app);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Long id) {
        if (!repository.existsById(id)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Application not found");
        }
        repository.deleteById(id);
    }
}