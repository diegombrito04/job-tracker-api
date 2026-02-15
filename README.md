# Job Tracker API

API simples para registrar candidaturas de emprego (company, role, status, appliedDate).

## Requisitos
- Java 21+
- Maven (ou use o Maven Wrapper)

## Rodar local
```bash
./mvnw spring-boot:run
```

## Endpoints

### Criar candidatura

```bash
curl -X POST http://localhost:8080/applications \
  -H "Content-Type: application/json" \
  -d '{"company":"Amazon","role":"Backend Intern","status":"APPLIED","appliedDate":"2026-02-15"}'
```

### Listar (com paginação e ordenação)

```bash
curl "http://localhost:8080/applications?page=0&size=5&sort=appliedDate,desc"
```

### Filtrar por status

```bash
curl "http://localhost:8080/applications?status=APPLIED"
```

### Atualizar só o status

```bash
curl -X PATCH http://localhost:8080/applications/1/status \
  -H "Content-Type: application/json" \
  -d '{"status":"INTERVIEW"}'
```
