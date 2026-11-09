-- ==============================================================================
-- TCC Clearance System - Fix Profile Backfill & Student Constraints
-- Run this in Supabase SQL Editor to resolve the onboarding redirect issue:
-- https://supabase.com/dashboard/project/fornjwndjhelppqzviab/sql/new
-- ==============================================================================

-- 1. Backfill any existing users from auth.users into public.profiles
insert into public.profiles (id, email, full_name, avatar_url, role)
select
  id,
  email,
  coalesce(raw_user_meta_data->>'full_name', raw_user_meta_data->>'name', split_part(email, '@', 1)),
  coalesce(raw_user_meta_data->>'avatar_url', raw_user_meta_data->>'picture', ''),
  'student'
from auth.users
on conflict (id) do update
set
  email = excluded.email,
  full_name = coalesce(excluded.full_name, public.profiles.full_name),
  avatar_url = coalesce(excluded.avatar_url, public.profiles.avatar_url),
  updated_at = now();

-- 2. Ensure profiles allows INSERT by the authenticated user
drop policy if exists "Users insert own profile" on public.profiles;
create policy "Users insert own profile" on public.profiles
  for insert with check (auth.uid() = id);

-- 3. Add UNIQUE constraint on students(profile_id) so upsert works seamlessly
do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conname = 'students_profile_id_key'
  ) then
    alter table public.students add constraint students_profile_id_key unique (profile_id);
  end if;
end $$;

-- 4. Fix RLS update policy for students table to include WITH CHECK (required for upsert)
drop policy if exists "Students update own record" on public.students;
create policy "Students update own record" on public.students
  for update
  using (profile_id = auth.uid())
  with check (profile_id = auth.uid());

-- 5. Fix RLS insert policy for students
drop policy if exists "Students insert own record" on public.students;
create policy "Students insert own record" on public.students
  for insert with check (profile_id = auth.uid());

-- 6. Ensure device table allows update for rebinding
drop policy if exists "Students update own devices" on public.student_devices;
create policy "Students update own devices" on public.student_devices
  for update
  using (
    student_id in (select id from public.students where profile_id = auth.uid())
  )
  with check (
    student_id in (select id from public.students where profile_id = auth.uid())
  );
