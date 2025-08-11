### StudyHub — Netlify + Supabase

- Frontend: Vite + React + TS + Tailwind
- Backend: Supabase (Auth + Postgres + Storage + Realtime)
- Serverless: Netlify Functions (OpenAI, Google Calendar)

#### 1) Configuration env

Créez `.env` à la racine en copiant `.env.example` et renseignez:
- `VITE_SUPABASE_URL` = votre URL Supabase
- `VITE_SUPABASE_ANON_KEY` = votre anon key
- `VITE_SITE_URL` = `http://localhost:5173` en local, puis votre domaine Netlify en prod
- `OPENAI_API_KEY` = clé OpenAI

#### 2) Schéma Supabase (SQL)

Exécutez dans SQL Editor Supabase:

```sql
-- Enable extensions
create extension if not exists "uuid-ossp";

-- Tables
create table if not exists public.events (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) on delete cascade,
  title text not null,
  start_at timestamp not null,
  end_at timestamp,
  category text,
  color text,
  details jsonb,
  created_at timestamp default now()
);

create table if not exists public.courses (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) on delete cascade,
  title text,
  file_name text,
  content text,
  created_at timestamp default now()
);

create table if not exists public.qcms (
  id uuid primary key default uuid_generate_v4(),
  course_id uuid references public.courses(id) on delete cascade,
  question text,
  options text[],
  answer int,
  created_at timestamp default now()
);

create table if not exists public.flashcards (
  id uuid primary key default uuid_generate_v4(),
  course_id uuid references public.courses(id) on delete cascade,
  front text,
  back text,
  created_at timestamp default now()
);

create table if not exists public.summaries (
  id uuid primary key default uuid_generate_v4(),
  course_id uuid references public.courses(id) on delete cascade,
  content text,
  created_at timestamp default now()
);

-- Groups & chat
create table if not exists public.groups (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  owner_id uuid references auth.users(id) on delete cascade,
  created_at timestamp default now()
);

create table if not exists public.group_members (
  id uuid primary key default uuid_generate_v4(),
  group_id uuid references public.groups(id) on delete cascade,
  user_id uuid references auth.users(id) on delete cascade,
  created_at timestamp default now(),
  unique(group_id, user_id)
);

create table if not exists public.messages (
  id uuid primary key default uuid_generate_v4(),
  group_id uuid references public.groups(id) on delete cascade,
  user_id uuid references auth.users(id) on delete cascade,
  content text not null,
  created_at timestamp default now()
);

-- SRS reviews
create table if not exists public.srs_reviews (
  id uuid primary key default uuid_generate_v4(),
  card_id uuid references public.flashcards(id) on delete cascade,
  grade int check (grade in (0,1,2)),
  created_at timestamp default now()
);

-- Storage buckets
insert into storage.buckets (id, name, public) values ('courses','courses', true) on conflict do nothing;
insert into storage.buckets (id, name, public) values ('media','media', true) on conflict do nothing;

-- RLS
alter table public.events enable row level security;
create policy "events_owner" on public.events for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

alter table public.courses enable row level security;
create policy "courses_owner" on public.courses for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

alter table public.qcms enable row level security;
create policy "qcms_owner" on public.qcms for select using (exists(select 1 from public.courses c where c.id = course_id and c.user_id = auth.uid()));
create policy "qcms_ins" on public.qcms for insert with check (exists(select 1 from public.courses c where c.id = course_id and c.user_id = auth.uid()));

alter table public.flashcards enable row level security;
create policy "flashcards_owner_sel" on public.flashcards for select using (exists(select 1 from public.courses c where c.id = course_id and c.user_id = auth.uid()));
create policy "flashcards_owner_ins" on public.flashcards for insert with check (exists(select 1 from public.courses c where c.id = course_id and c.user_id = auth.uid()));

alter table public.summaries enable row level security;
create policy "summaries_owner" on public.summaries for all using (exists(select 1 from public.courses c where c.id = course_id and c.user_id = auth.uid())) with check (exists(select 1 from public.courses c where c.id = course_id and c.user_id = auth.uid()));

alter table public.groups enable row level security;
create policy "groups_sel" on public.groups for select using (exists(select 1 from public.group_members gm where gm.group_id = id and gm.user_id = auth.uid()));
create policy "groups_ins" on public.groups for insert with check (true);

alter table public.group_members enable row level security;
create policy "gm_sel" on public.group_members for select using (user_id = auth.uid());
create policy "gm_ins" on public.group_members for insert with check (user_id = auth.uid());

alter table public.messages enable row level security;
create policy "msg_sel" on public.messages for select using (exists(select 1 from public.group_members gm where gm.group_id = group_id and gm.user_id = auth.uid()));
create policy "msg_ins" on public.messages for insert with check (exists(select 1 from public.group_members gm where gm.group_id = group_id and gm.user_id = auth.uid()));
```

#### 3) Activer Google OAuth (corrige l'erreur Unsupported provider)

Dans Supabase → Authentication → Providers → Google:
- Activez Google
- Client ID / Secret (Google Cloud Oauth 2.0)
- Authorized redirect URLs: `VITE_SITE_URL/auth/callback` (ex: `https://votre-site.netlify.app/auth/callback`)
- Scopes: `email profile https://www.googleapis.com/auth/calendar`
- Advanced: cochez la persistance des tokens/provider (si dispo) pour récupérer `access_token`

#### 4) Règles Storage

Autorisez l'upload pour les utilisateurs authentifiés sur le bucket `courses`.

#### 5) Lancer en local

```bash
npm i
npm run dev
```

#### 6) Déployer sur Netlify

- Créez un site, reliez ce repo, configurez les variables env:
  - `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, `VITE_SITE_URL` (URL Netlify), `OPENAI_API_KEY`
- Build command: `npm run build`
- Publish dir: `dist`
- Functions: `netlify/functions`

#### 7) Correctifs inclus

- Google OAuth: bouton + scopes Calendar, message explicite si provider non activé
- Calendrier: CRUD complet (création par sélection, drag/drop/move, suppression), option de sync Google (si token dispo)
- Import: extraction PDF avec pdf.js, TXT, upload Storage, appel IA côté serverless, insertion QCM/flashcards/résumé
- Groupes & Chat: tables créées, realtime Abonnements sur `messages`
- UI: thème sombre/clair, Apple-like (cards, arrondis, flou, animations)

#### 8) Sécurité & 2FA

- UI pour activer TOTP (selon disponibilité des méthodes MFA dans votre projet Supabase)

```
