-- Run in the Supabase SQL editor.
-- Vehicles for the Park autofill: type + license plate, one default per user per type.
create table vehicles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  vehicle_type text not null check (vehicle_type in ('car', 'motorcycle')),
  license_plate text not null,
  is_default boolean not null default false,
  inserted_at timestamptz not null default now(),
  unique (user_id, license_plate)
);

-- At most one default vehicle per user per type.
create unique index vehicles_one_default
  on vehicles (user_id, vehicle_type)
  where is_default;

alter table vehicles enable row level security;

create policy "own vehicles" on vehicles
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
