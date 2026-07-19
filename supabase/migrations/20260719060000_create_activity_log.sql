create table if not exists public.activity_log (
  id uuid primary key default gen_random_uuid(),
  event_type text not null,
  source text not null,
  flight_number text,
  details jsonb,
  created_at timestamptz not null default now()
);

alter table public.activity_log enable row level security;

create policy "Authenticated users can view activity log"
  on public.activity_log
  for select
  to authenticated
  using (true);
