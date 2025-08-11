-- Enable extensions
create extension if not exists "uuid-ossp";

-- Users table (mirror of auth.users via foreign keys)
-- We will use auth.uid() for RLS scoping

create table if not exists public.events (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
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
  user_id uuid not null references auth.users(id) on delete cascade,
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
  answer integer,
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

create table if not exists public.groups (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  owner_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamp default now()
);

create table if not exists public.group_members (
  group_id uuid references public.groups(id) on delete cascade,
  user_id uuid references auth.users(id) on delete cascade,
  role text default 'member',
  created_at timestamp default now(),
  primary key (group_id, user_id)
);

create table if not exists public.messages (
  id uuid primary key default uuid_generate_v4(),
  group_id uuid references public.groups(id) on delete cascade,
  user_id uuid references auth.users(id) on delete cascade,
  content text not null,
  created_at timestamp default now()
);

-- RLS
alter table public.events enable row level security;
alter table public.courses enable row level security;
alter table public.qcms enable row level security;
alter table public.flashcards enable row level security;
alter table public.summaries enable row level security;
alter table public.groups enable row level security;
alter table public.group_members enable row level security;
alter table public.messages enable row level security;

create policy "Users can see own events" on public.events for select using (auth.uid() = user_id);
create policy "Users can insert own events" on public.events for insert with check (auth.uid() = user_id);
create policy "Users can update own events" on public.events for update using (auth.uid() = user_id);
create policy "Users can delete own events" on public.events for delete using (auth.uid() = user_id);

create policy "Users see own courses" on public.courses for select using (auth.uid() = user_id);
create policy "Users insert own courses" on public.courses for insert with check (auth.uid() = user_id);
create policy "Users update own courses" on public.courses for update using (auth.uid() = user_id);
create policy "Users delete own courses" on public.courses for delete using (auth.uid() = user_id);

create policy "Cascade qcms via courses" on public.qcms for select using (exists (select 1 from courses c where c.id = course_id and c.user_id = auth.uid()));
create policy "Insert qcms via courses" on public.qcms for insert with check (exists (select 1 from courses c where c.id = course_id and c.user_id = auth.uid()));
create policy "Update qcms via courses" on public.qcms for update using (exists (select 1 from courses c where c.id = course_id and c.user_id = auth.uid()));
create policy "Delete qcms via courses" on public.qcms for delete using (exists (select 1 from courses c where c.id = course_id and c.user_id = auth.uid()));

create policy "Cascade flashcards via courses" on public.flashcards for select using (exists (select 1 from courses c where c.id = course_id and c.user_id = auth.uid()));
create policy "Insert flashcards via courses" on public.flashcards for insert with check (exists (select 1 from courses c where c.id = course_id and c.user_id = auth.uid()));
create policy "Update flashcards via courses" on public.flashcards for update using (exists (select 1 from courses c where c.id = course_id and c.user_id = auth.uid()));
create policy "Delete flashcards via courses" on public.flashcards for delete using (exists (select 1 from courses c where c.id = course_id and c.user_id = auth.uid()));

create policy "Cascade summaries via courses" on public.summaries for select using (exists (select 1 from courses c where c.id = course_id and c.user_id = auth.uid()));
create policy "Insert summaries via courses" on public.summaries for insert with check (exists (select 1 from courses c where c.id = course_id and c.user_id = auth.uid()));
create policy "Update summaries via courses" on public.summaries for update using (exists (select 1 from courses c where c.id = course_id and c.user_id = auth.uid()));
create policy "Delete summaries via courses" on public.summaries for delete using (exists (select 1 from courses c where c.id = course_id and c.user_id = auth.uid()));

create policy "Group owners and members can see groups" on public.groups for select using (exists (select 1 from group_members gm where gm.group_id = id and gm.user_id = auth.uid()) or owner_id = auth.uid());
create policy "Owner can insert group" on public.groups for insert with check (owner_id = auth.uid());
create policy "Owner can update group" on public.groups for update using (owner_id = auth.uid());
create policy "Owner can delete group" on public.groups for delete using (owner_id = auth.uid());

create policy "Members see group memberships" on public.group_members for select using (user_id = auth.uid());
create policy "Owner inserts memberships" on public.group_members for insert with check (exists (select 1 from groups g where g.id = group_id and g.owner_id = auth.uid()));
create policy "Owner updates memberships" on public.group_members for update using (exists (select 1 from groups g where g.id = group_id and g.owner_id = auth.uid()));
create policy "Owner deletes memberships" on public.group_members for delete using (exists (select 1 from groups g where g.id = group_id and g.owner_id = auth.uid()));

create policy "Members see messages" on public.messages for select using (exists (select 1 from group_members gm where gm.group_id = group_id and gm.user_id = auth.uid()));
create policy "Members post messages" on public.messages for insert with check (exists (select 1 from group_members gm where gm.group_id = group_id and gm.user_id = auth.uid()));
create policy "Members can delete own messages" on public.messages for delete using (auth.uid() = user_id);