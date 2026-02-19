-- V5: prioridade e data de follow-up por candidatura

ALTER TABLE job_applications
    ADD COLUMN priority VARCHAR(20) NOT NULL DEFAULT 'MEDIUM',
    ADD COLUMN follow_up_date DATE;

CREATE INDEX idx_job_applications_priority       ON job_applications(priority);
CREATE INDEX idx_job_applications_follow_up_date ON job_applications(follow_up_date);
