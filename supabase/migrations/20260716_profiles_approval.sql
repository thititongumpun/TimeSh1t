-- Run in the Supabase SQL editor.
-- Also enable Authentication -> Sign In / Up -> "Allow new users to sign up" (email provider).
-- Gates new signups behind manual approval: profiles tracks approval state, a trigger
-- populates it on signup, and restrictive policies block unapproved users from data tables.

create table profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text not null,
  approved boolean not null default false,
  requested_at timestamptz not null default now()
);

alter table profiles enable row level security;

-- Users can read their own row only. No insert/update/delete policies here —
-- writes happen via the handle_new_user trigger or the dashboard only.
create policy "own profile" on profiles
  for select
  using (auth.uid() = id);

-- Populate profiles on signup.
create function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into profiles (id, email) values (new.id, new.email);
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Existing dashboard-provisioned users are already trusted, so backfill them as approved.
insert into profiles (id, email, approved)
select id, email, true from auth.users
on conflict (id) do nothing;

create function public.is_approved()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (select 1 from profiles where id = auth.uid() and approved);
$$;

-- Restrictive policies AND with the existing permissive own-rows policies created in the
-- dashboard, so we don't touch those — this just adds the "must be approved" requirement
-- on top. profiles itself is excluded: an unapproved user must still read their own row.
create policy "approved users only" on projects
  as restrictive
  for all
  using (public.is_approved())
  with check (public.is_approved());

create policy "approved users only" on timesheets
  as restrictive
  for all
  using (public.is_approved())
  with check (public.is_approved());

create policy "approved users only" on archived_timesheets
  as restrictive
  for all
  using (public.is_approved())
  with check (public.is_approved());

create policy "approved users only" on monthly_summaries
  as restrictive
  for all
  using (public.is_approved())
  with check (public.is_approved());

create policy "approved users only" on vehicles
  as restrictive
  for all
  using (public.is_approved())
  with check (public.is_approved());
