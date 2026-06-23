-- Make projects shared across all users.
-- Run in the Supabase SQL editor.

-- user_id no longer required on insert
alter table projects alter column user_id drop not null;

-- everyone can read/write/update/delete any project
drop policy if exists "Users can view own projects" on projects;
drop policy if exists "Users can insert own projects" on projects;
drop policy if exists "Users can update own projects" on projects;
drop policy if exists "Users can delete own projects" on projects;

create policy "Authenticated can read projects"
  on projects for select to authenticated using (true);

create policy "Authenticated can write projects"
  on projects for all to authenticated using (true) with check (true);
