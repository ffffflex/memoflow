create extension if not exists pgcrypto;

create table if not exists public.memos (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null default '',
  content text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.leetcode_problems (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  problem_number integer not null check (problem_number > 0),
  title text not null,
  difficulty text not null check (difficulty in ('easy', 'medium', 'hard')),
  topic text not null default '',
  planned_date date not null,
  completed boolean not null default false,
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists memos_user_updated_idx
  on public.memos (user_id, updated_at desc);
create index if not exists leetcode_user_planned_idx
  on public.leetcode_problems (user_id, planned_date);
create index if not exists leetcode_user_completed_idx
  on public.leetcode_problems (user_id, completed_at desc)
  where completed = true;

alter table public.memos enable row level security;
alter table public.leetcode_problems enable row level security;

drop policy if exists "Users can select own memos" on public.memos;
drop policy if exists "Users can insert own memos" on public.memos;
drop policy if exists "Users can update own memos" on public.memos;
drop policy if exists "Users can delete own memos" on public.memos;

create policy "Users can select own memos" on public.memos
  for select to authenticated using (auth.uid() = user_id);
create policy "Users can insert own memos" on public.memos
  for insert to authenticated with check (auth.uid() = user_id);
create policy "Users can update own memos" on public.memos
  for update to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "Users can delete own memos" on public.memos
  for delete to authenticated using (auth.uid() = user_id);

drop policy if exists "Users can select own LeetCode problems" on public.leetcode_problems;
drop policy if exists "Users can insert own LeetCode problems" on public.leetcode_problems;
drop policy if exists "Users can update own LeetCode problems" on public.leetcode_problems;
drop policy if exists "Users can delete own LeetCode problems" on public.leetcode_problems;

create policy "Users can select own LeetCode problems" on public.leetcode_problems
  for select to authenticated using (auth.uid() = user_id);
create policy "Users can insert own LeetCode problems" on public.leetcode_problems
  for insert to authenticated with check (auth.uid() = user_id);
create policy "Users can update own LeetCode problems" on public.leetcode_problems
  for update to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "Users can delete own LeetCode problems" on public.leetcode_problems
  for delete to authenticated using (auth.uid() = user_id);

grant select, insert, update, delete on public.memos to authenticated;
grant select, insert, update, delete on public.leetcode_problems to authenticated;

do $$
begin
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'memos'
  ) then
    alter publication supabase_realtime add table public.memos;
  end if;
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'leetcode_problems'
  ) then
    alter publication supabase_realtime add table public.leetcode_problems;
  end if;
end $$;
