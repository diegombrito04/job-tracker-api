// src/main/java/com/diego/jobtracker/controller/JobApplicationController.java
package com.diego.jobtracker.controller;

import com.diego.jobtracker.dto.UpsertJobApplicationRequest;
import com.diego.jobtracker.dto.UpdateJobApplicationRequest;
import com.diego.jobtracker.model.ApplicationStatus;
import com.diego.jobtracker.model.JobApplication;
import com.diego.jobtracker.repository.JobApplicationRepository;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

@RestController
@RequestMapping("/applications")
@CrossOrigin(origins = {"http://localhost:5173"})
public class JobApplicationController {

    private final JobApplicationRepository repository;

    public JobApplicationController(JobApplicationRepository repository) {
        this.repository = repository;
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
            @PageableDefault(size = 10) Pageable pageable
    ) {
        if (status != null) {
            return repository.findByStatus(status, pageable);
        }
        return repository.findAll(pageable);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public JobApplication create(@Valid @RequestBody JobApplication jobApplication) {
        jobApplication.setId(null); // garante que não vem id "forçado"
        return repository.save(jobApplication);
    }

    @GetMapping("/{id}")
    public JobApplication getById(@PathVariable(name = "id") long id) {
        return repository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Application not found"));
    }

    @PatchMapping("/{id}/status")
    public JobApplication updateStatus(
            @PathVariable(name = "id") long id,
            @Valid @RequestBody UpdateJobApplicationRequest body
    ) {
        JobApplication app = repository.findById(id)
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
            @Valid @RequestBody UpsertJobApplicationRequest body
    ) {
        JobApplication app = repository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Application not found"));

        app.setCompany(body.company().trim());
        app.setRole(body.role().trim());
        app.setStatus(body.status());
        app.setAppliedDate(body.appliedDate()); // pode ser null se você quiser permitir
        return repository.save(app);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable(name = "id") long id) {
        if (!repository.existsById(id)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Application not found");
        }
        repository.deleteById(id);
    }
}
