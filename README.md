# Job Tracker (API + Web)

Aplicação fullstack para organizar candidaturas de emprego com autenticação por usuário, histórico de status e dashboard com métricas.

## Funcionalidades atuais

- Cadastro e login de usuários (sessão por cookie `HttpOnly`)
- CRUD completo de candidaturas
- Histórico de mudanças de status
- Prioridade (`HIGH`, `MEDIUM`, `LOW`) e data de follow-up
- Alertas de follow-up atrasado no sino (Topbar)
- Visualização em cards e Kanban (drag-and-drop entre status)
- Import/Export de CSV
- Backup/Restore em JSON
- Dashboard com métricas, recentes e follow-ups pendentes
- Estatísticas com resumo simplificado para leitura leiga

## Stack

- Backend: Spring Boot 3.5.9, Java 21, Maven
- Frontend: React 19 + TypeScript + Vite + Tailwind v4
- Auth: JWT no backend + cookie `HttpOnly` no navegador
- Banco: PostgreSQL (dev/prod via Docker) + H2 (local sem Docker e testes)
- Migrations: Flyway

## Estrutura

- API: raiz do repositório
- Frontend: `job-tracker-web/`

## Rodar 100% com Docker (recomendado)

### 1) Criar arquivo de ambiente

```bash
cp .env.example .env
```

### 2) Subir tudo

```bash
docker compose up --build -d
```

### 3) Conferir containers

```bash
docker compose ps
```

### 4) URLs

- Web: `http://localhost:5173`
- API: `http://localhost:8080`
- Healthcheck: `http://localhost:8080/health`
- Swagger: `http://localhost:8080/swagger-ui/index.html`

## Docker no dia a dia

### Parar sem remover

```bash
docker compose stop
```

### Subir novamente

```bash
docker compose start
```

### Rebuild após mudanças

```bash
docker compose up --build -d backend frontend
```

### Parar e remover containers/rede

```bash
docker compose down
```

### Reset completo (apaga dados do PostgreSQL)

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

Backend (perfil local com H2):

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

## Atualizando o projeto local

```bash
git pull
docker compose up --build -d
```
