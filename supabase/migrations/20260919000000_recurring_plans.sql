create extension if not exists pgcrypto;

create table if not exists public.recurring_plans (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null check (length(trim(title)) > 0),
  description text not null default '',
  category text not null check (category in ('study','work','project','health','life')),
  start_date date not null,
  recurrence_type text not null check (recurrence_type in ('daily','interval_days','weekly','interval_weeks','monthly')),
  interval_value integer not null default 1 check (interval_value > 0),
  weekdays integer[] not null default '{}',
  day_of_month integer check (day_of_month between 1 and 31),
  end_date date,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (end_date is null or end_date >= start_date),
  check (recurrence_type not in ('weekly','interval_weeks') or cardinality(weekdays) > 0),
  check (recurrence_type <> 'monthly' or day_of_month is not null)
);

create table if not exists public.recurring_plan_completions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  plan_id uuid not null references public.recurring_plans(id) on delete cascade,
  occurrence_date date not null,
  completed_at timestamptz not null default now(),
  unique (plan_id, occurrence_date)
);

create index if not exists recurring_plans_user_id_idx on public.recurring_plans(user_id);
create index if not exists recurring_plan_completions_user_date_idx on public.recurring_plan_completions(user_id, occurrence_date desc);

alter table public.recurring_plans enable row level security;
alter table public.recurring_plan_completions enable row level security;

drop policy if exists "Users manage their recurring plans" on public.recurring_plans;
create policy "Users manage their recurring plans" on public.recurring_plans for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
drop policy if exists "Users manage their recurring completions" on public.recurring_plan_completions;
create policy "Users manage their recurring completions" on public.recurring_plan_completions for all using (auth.uid() = user_id) with check (auth.uid() = user_id and exists (select 1 from public.recurring_plans p where p.id = plan_id and p.user_id = auth.uid()));

grant select, insert, update, delete on public.recurring_plans to authenticated;
grant select, insert, update, delete on public.recurring_plan_completions to authenticated;

do $$ begin
  alter publication supabase_realtime add table public.recurring_plans;
exception when duplicate_object then null; end $$;
do $$ begin
  alter publication supabase_realtime add table public.recurring_plan_completions;
exception when duplicate_object then null; end $$;
