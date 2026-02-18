-- V3: Perfil e preferências por usuário

ALTER TABLE users
    ADD COLUMN avatar_url      VARCHAR(500),
    ADD COLUMN language        VARCHAR(5)   NOT NULL DEFAULT 'pt',
    ADD COLUMN theme           VARCHAR(10)  NOT NULL DEFAULT 'light',
    ADD COLUMN sidebar_visible BOOLEAN      NOT NULL DEFAULT TRUE,
    ADD COLUMN updated_at      TIMESTAMP    NOT NULL DEFAULT NOW();
