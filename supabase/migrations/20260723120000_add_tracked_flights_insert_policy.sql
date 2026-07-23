create policy "Authenticated users can insert tracked flights"
on public.tracked_flights
for insert
to authenticated
with check (true);
