# Job Tracker Web

Frontend do Job Tracker.

## Stack

- React 19
- TypeScript
- Vite
- Tailwind CSS
- React Router

## Requisitos

- Node.js 20+
- npm

## Funcionalidades da UI

- Login/cadastro e sessão por cookie `HttpOnly`
- Dashboard com métricas e candidaturas recentes
- Cards de candidatura com filtros, busca e ordenação
- Modo Kanban com drag-and-drop de status
- Histórico de status por candidatura
- Follow-up (due/overdue), com notificações no sino da Topbar
- Import/Export CSV e Backup/Restore JSON
- Estatísticas com resumo simplificado

## Desenvolvimento local

```bash
npm install
npm run dev
```

- App: `http://localhost:5173`
- API padrão (sem Docker): `http://localhost:8080`

## Docker (pela raiz do repositório)

```bash
docker compose up --build -d
```

- Frontend: `http://localhost:5173`
- O Nginx do frontend faz proxy de `/api` para o backend.

## Autenticação

- O frontend usa sessão por cookie `HttpOnly`.
- Não armazena token JWT no `localStorage`.
- Requisições autenticadas enviam `credentials: "include"`/`withCredentials: true`.

## Variáveis de ambiente

- `VITE_API_URL`
- `VITE_API_BASE_URL`

Com Docker Compose, o valor recomendado é:

```env
VITE_API_URL=/api
```

Se fizer alterações no frontend e não refletir no browser, execute:

```bash
docker compose up --build -d frontend
```

## Scripts

```bash
npm run dev
npm run lint
npm run build
npm run preview
```
