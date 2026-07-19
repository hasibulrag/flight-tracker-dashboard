create table if not exists public.tracked_flights (
  id uuid primary key default gen_random_uuid(),
  flight_number text not null,
  origin text not null,
  destination text not null,
  gate text,
  last_status text not null default 'on_time'
    check (last_status in ('on_time', 'delayed', 'cancelled')),
  delay_minutes integer not null default 0,
  customer_email text,
  customer_whatsapp text,
  active boolean not null default true,
  last_updated timestamptz not null default now()
);

alter table public.tracked_flights enable row level security;

create policy "Authenticated users can view tracked flights"
  on public.tracked_flights
  for select
  to authenticated
  using (true);
