For quick local testing you can temporarily disable RLS (not recommended in prod):

```
alter table public.events disable row level security;
```

Or create an additional policy allowing authenticated users to insert rows:

```
create policy "insert own events" on public.events for insert with check (auth.uid() = user_id);
```