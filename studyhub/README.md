# StudyHub

Deployment-ready SPA for Netlify with Supabase backend.

## Configuration

Create a `.env` file in project root (for dev):

```
VITE_SUPABASE_URL=https://ipwmezklivfqegskczlx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imlwd21lemtsaXZmcWVnc2tjemx4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM5NTczODksImV4cCI6MjA2OTUzMzM4OX0.ylmGI6yUfZtEtgIaS4FYQqAI6vJsIblAeYsob9ECXBY
OPENAI_API_KEY=sk-... # Netlify environment variable
```

On Netlify, set environment variables:
- `OPENAI_API_KEY`
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

## Supabase

1. In SQL editor, run `sql/schema.sql` to create tables and RLS policies.
2. Auth Providers → Enable Google. Add OAuth credentials. Scopes: `openid email profile https://www.googleapis.com/auth/calendar`. Set redirect to your site URL.
3. Auth → URL config → Site URL = your Netlify domain.

## Run locally

```
npm install
npm run dev
```

## Build

```
npm run build
```

## Deploy to Netlify

- Push repo and connect or upload the zip. Build command: `npm run build`, publish dir: `dist`.
