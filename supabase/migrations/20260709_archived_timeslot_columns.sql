-- Run in the Supabase SQL editor.
-- Mirrors 20260707_timeslot_columns.sql on the archive table so start_time/end_time
-- survive archiving. Whatever routine copies timesheets -> archived_timesheets must
-- also carry these two columns, or archived rows lose their working hours.
alter table archived_timesheets
  add column start_time time,
  add column end_time time;

alter table archived_timesheets add constraint archived_timesheets_time_window check (
  (start_time is null and end_time is null)
  or (start_time >= '09:00' and end_time <= '18:00' and start_time < end_time)
);
