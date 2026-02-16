# Job Tracker API

API REST para registrar e acompanhar candidaturas de emprego (company, role, status, appliedDate).

## Tech Stack
- Java 21
- Spring Boot
- Spring Web + Validation
- Spring Data JPA
- H2 Database
- SpringDoc OpenAPI (Swagger UI)

## Como rodar

Na pasta do projeto:
```bash
./mvnw spring-boot:run
```

A API sobe em:
* http://localhost:8080

Swagger UI:
* http://localhost:8080/swagger-ui/index.html

H2 Console:
* http://localhost:8080/h2-console

### Config do H2 Console
* JDBC URL: `jdbc:h2:file:./data/jobtrackerdb` (ou `jdbc:h2:mem:jobtrackerdb` se você estiver usando mem)
* User: `sa`
* Password: (vazio)

## Endpoints

### Health check
* `GET /health`

### Criar candidatura
* `POST /applications`

Exemplo:
```bash
curl -X POST http://localhost:8080/applications \
  -H "Content-Type: application/json" \
  -d '{"company":"Amazon","role":"Backend Intern","status":"APPLIED","appliedDate":"2026-02-15"}'
```

### Listar candidaturas (com paginação e ordenação)
* `GET /applications?page=0&size=5&sort=appliedDate,desc`

Exemplo:
```bash
curl "http://localhost:8080/applications?page=0&size=5&sort=appliedDate,desc"
```

### Filtrar por status
* `GET /applications?status=APPLIED`

Exemplo:
```bash
curl "http://localhost:8080/applications?status=APPLIED"
```

### Buscar por ID
* `GET /applications/{id}`

Exemplo:
```bash
curl "http://localhost:8080/applications/1"
```

### Atualizar apenas o status
* `PATCH /applications/{id}/status`

Exemplo:
```bash
curl -i -X PATCH http://localhost:8080/applications/1/status \
  -H "Content-Type: application/json" \
  -d '{"status":"INTERVIEW"}'
```

### Deletar
* `DELETE /applications/{id}`

Exemplo:
```bash
curl -X DELETE http://localhost:8080/applications/1
```

## Status possíveis
* `APPLIED`
* `INTERVIEW`
* `OFFER`
* `REJECTED`