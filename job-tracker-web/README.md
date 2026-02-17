# Job Tracker Web

Frontend do projeto Job Tracker.

## Stack

- React 19
- TypeScript
- Vite
- Tailwind CSS
- React Router

## Requisitos

- Node.js 20+
- npm

## Executar em desenvolvimento

```bash
npm install
npm run dev
```

App:
- `http://localhost:5173`

Por padrão, o frontend consome a API em `http://localhost:8080`.

## Variáveis de ambiente

Você pode configurar a URL da API com:
- `VITE_API_URL`
- ou `VITE_API_BASE_URL`

Exemplo em `.env`:

```env
VITE_API_URL=http://localhost:8080
```

## Scripts

```bash
npm run dev
npm run lint
npm run build
npm run preview
```
