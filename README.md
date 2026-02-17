# Job Tracker (API + Web)

Aplicação fullstack para registrar e acompanhar candidaturas de emprego.

## Visão Geral

Este repositório contém:
- `job-tracker-api` (raiz): backend REST em Spring Boot
- `job-tracker-web`: frontend em React + TypeScript + Vite

Funcionalidades principais:
- CRUD de candidaturas (`company`, `role`, `status`, `appliedDate`)
- Filtro por status, busca e paginação
- Dashboard e estatísticas de conversão
- Tema claro/escuro
- Internacionalização (PT/EN)

## Stack

Backend:
- Java 21
- Spring Boot 3
- Spring Web
- Spring Validation
- Spring Data JPA
- Spring Security (config aberto para rotas da API no ambiente atual)
- H2 Database (em memória)
- SpringDoc OpenAPI (Swagger)

Frontend:
- React 19 + TypeScript
- Vite
- Tailwind CSS
- React Router

## Pré-requisitos

- Java 21+
- Node.js 20+ e npm

## Como Rodar Localmente

### 1) Backend (porta 8080)

Na raiz do projeto:

```bash
./mvnw spring-boot:run
```

URLs úteis:
- API: `http://localhost:8080`
- Swagger UI: `http://localhost:8080/swagger-ui/index.html`
- H2 Console: `http://localhost:8080/h2-console`

Config H2 Console:
- JDBC URL: `jdbc:h2:mem:jobtrackerdb`
- User: `sa`
- Password: vazio

### 2) Frontend (porta 5173)

Em outro terminal:

```bash
cd job-tracker-web
npm install
npm run dev
```

App Web:
- `http://localhost:5173`

## Scripts Úteis

Backend (raiz):

```bash
./mvnw test
./mvnw spring-boot:run
```

Frontend (`job-tracker-web`):

```bash
npm run dev
npm run lint
npm run build
npm run preview
```

## Endpoints da API

- `GET /health`
- `GET /applications`
- `POST /applications`
- `GET /applications/{id}`
- `PUT /applications/{id}`
- `PATCH /applications/{id}/status`
- `DELETE /applications/{id}`

Status possíveis:
- `APPLIED`
- `INTERVIEW`
- `OFFER`
- `REJECTED`
