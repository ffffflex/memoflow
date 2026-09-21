create table if not exists public.recurring_plan_adjustments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  plan_id uuid not null references public.recurring_plans(id) on delete cascade,
  effective_date date not null,
  shift_days integer not null default 1 check (shift_days > 0),
  created_at timestamptz not null default now(),
  unique (plan_id, effective_date)
);

create index if not exists recurring_plan_adjustments_user_plan_date_idx
  on public.recurring_plan_adjustments(user_id, plan_id, effective_date);

alter table public.recurring_plan_adjustments enable row level security;

drop policy if exists "Users manage their recurring adjustments" on public.recurring_plan_adjustments;
create policy "Users manage their recurring adjustments"
  on public.recurring_plan_adjustments for all
  using (auth.uid() = user_id)
  with check (
    auth.uid() = user_id
    and exists (
      select 1 from public.recurring_plans p
      where p.id = plan_id and p.user_id = auth.uid()
    )
  );

grant select, insert, update, delete on public.recurring_plan_adjustments to authenticated;

do $$ begin
  alter publication supabase_realtime add table public.recurring_plan_adjustments;
exception when duplicate_object then null; end $$;
