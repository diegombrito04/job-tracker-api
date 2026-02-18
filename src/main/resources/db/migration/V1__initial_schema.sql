-- V1: Schema inicial do Job Tracker

CREATE TABLE users (
    id            BIGSERIAL PRIMARY KEY,
    name          VARCHAR(120)  NOT NULL,
    email         VARCHAR(160)  NOT NULL UNIQUE,
    password_hash VARCHAR(255)  NOT NULL,
    created_at    TIMESTAMP     NOT NULL DEFAULT NOW()
);

CREATE TABLE job_applications (
    id           BIGSERIAL PRIMARY KEY,
    company      VARCHAR(255) NOT NULL,
    role         VARCHAR(255) NOT NULL,
    status       VARCHAR(50)  NOT NULL,
    applied_date DATE,
    user_id      BIGINT       NOT NULL REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX idx_job_applications_user_id ON job_applications(user_id);
CREATE INDEX idx_job_applications_status  ON job_applications(status);
