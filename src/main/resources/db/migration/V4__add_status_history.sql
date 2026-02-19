-- V4: Histórico de mudanças de status por candidatura

CREATE TABLE status_history (
    id             BIGSERIAL PRIMARY KEY,
    application_id BIGINT       NOT NULL REFERENCES job_applications(id) ON DELETE CASCADE,
    user_id        BIGINT       NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    from_status    VARCHAR(50),
    to_status      VARCHAR(50)  NOT NULL,
    changed_at     TIMESTAMP    NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_status_history_application_id ON status_history(application_id);
CREATE INDEX idx_status_history_user_id        ON status_history(user_id);
CREATE INDEX idx_status_history_changed_at     ON status_history(changed_at DESC);

-- Backfill para candidaturas já existentes
INSERT INTO status_history (application_id, user_id, from_status, to_status, changed_at)
SELECT
    ja.id,
    ja.user_id,
    NULL,
    ja.status::VARCHAR(50),
    COALESCE(ja.updated_at, NOW())
FROM job_applications ja;
