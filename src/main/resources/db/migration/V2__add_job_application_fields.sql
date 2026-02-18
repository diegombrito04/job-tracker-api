-- V2: Enriquecimento das candidaturas

ALTER TABLE job_applications
    ADD COLUMN notes       TEXT,
    ADD COLUMN job_url     VARCHAR(500),
    ADD COLUMN salary      VARCHAR(100),
    ADD COLUMN updated_at  TIMESTAMP;
