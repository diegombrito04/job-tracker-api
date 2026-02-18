# Job Tracker (API + Web)

Aplicação fullstack para registrar, organizar e acompanhar candidaturas de emprego.

## Stack

- Backend: Spring Boot 3.5.9, Java 21, Maven
- Frontend: React 19 + TypeScript + Vite + Tailwind v4
- Auth: JWT assinado no backend + cookie `HttpOnly` (sem token no `localStorage`)
- Banco: PostgreSQL (Docker/dev/prod) + H2 (execução local sem Docker e testes)
- Migrations: Flyway

## Estrutura

- API: raiz do repositório
- Web: `job-tracker-web/`

## Executar 100% com Docker (recomendado)

### 1) Criar arquivo de ambiente

```bash
cp .env.example .env
```

### 2) Subir aplicação completa

```bash
docker compose up --build -d
```

### 3) Conferir status

```bash
docker compose ps
```

### 4) Acessos

- Web: `http://localhost:5173`
- API healthcheck: `http://localhost:8080/health`
- Swagger: `http://localhost:8080/swagger-ui/index.html`

## Comandos Docker (dia a dia)

### Parar sem remover containers

```bash
docker compose stop
```

### Voltar a rodar rápido

```bash
docker compose start
```

### Parar e remover containers/rede

```bash
docker compose down
```

### Rebuild de backend/frontend

```bash
docker compose build backend frontend
docker compose up -d
```

### Reset completo (apaga volume do banco)

```bash
docker compose down -v --remove-orphans
docker compose up --build -d
```

### Logs

```bash
docker compose logs -f
docker compose logs -f backend
docker compose logs -f frontend
docker compose logs -f postgres
```

### pgAdmin (opcional)

```bash
docker compose --profile tools up -d pgadmin
```

- URL: `http://localhost:5050`
- Login padrão: `admin@jobtracker.local`
- Senha padrão: `admin`

## Desenvolvimento sem Docker (opcional)

Backend com H2:

```bash
./mvnw spring-boot:run
```

Frontend:

```bash
cd job-tracker-web
npm install
npm run dev
```

## Testes

```bash
./mvnw test
```
