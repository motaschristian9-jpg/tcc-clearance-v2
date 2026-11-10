-- ==============================================================================
-- TCC Clearance System - Account Login & Student Authentication Tables
-- Project: https://fornjwndjhelppqzviab.supabase.co
-- Based on: Docs/5. Database Schema — TCC Event Clearance App.pdf
-- ==============================================================================

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- 1. Departments Table (8 TCC Academic Departments)
create table if not exists public.departments (
  id uuid primary key default uuid_generate_v4(),
  code text unique not null,
  name text not null,
  active boolean default true,
  created_at timestamptz default now()
);

-- Seed 8 TCC Academic Departments
insert into public.departments (code, name)
values
  ('CIT', 'College of Information Technology'),
  ('CBA', 'College of Business Administration'),
  ('CED', 'College of Education'),
  ('CCJPS', 'College of Criminal Justice & Public Safety'),
  ('CHM', 'College of Hospitality Management'),
  ('CAS', 'College of Arts and Sciences'),
  ('COM', 'College of Maritime'),
  ('CLIS', 'College of Library & Information Science')
on conflict (code) do update set name = excluded.name;

-- 2. Profiles Table (One row per Google OAuth user)
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  full_name text,
  avatar_url text,
  role text not null default 'student' check (role in ('student', 'officer', 'head')),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Trigger: Automatically create profile on new Supabase auth.users signup via Google
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, full_name, avatar_url, role)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name', ''),
    coalesce(new.raw_user_meta_data->>'avatar_url', new.raw_user_meta_data->>'picture', ''),
    'student'
  )
  on conflict (id) do update
  set
    email = excluded.email,
    full_name = coalesce(excluded.full_name, public.profiles.full_name),
    avatar_url = coalesce(excluded.avatar_url, public.profiles.avatar_url),
    updated_at = now();
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- 3. Sections Table
create table if not exists public.sections (
  id uuid primary key default uuid_generate_v4(),
  department_id uuid references public.departments(id) on delete cascade,
  year_level int not null check (year_level between 1 and 4),
  name text not null, -- e.g. "3A", "3B", "1A"
  school_year text not null default '2025-2026',
  created_at timestamptz default now(),
  constraint unique_section unique (department_id, year_level, name, school_year)
);

-- 4. Students Table (Official Academic Details linked to Google Profile)
create table if not exists public.students (
  id uuid primary key default uuid_generate_v4(),
  profile_id uuid references public.profiles(id) on delete cascade,
  school_id_no text unique not null, -- 8 digits unhyphenated, e.g. "20241373"
  full_name text not null,
  department_id text not null, -- e.g. "CIT"
  section_id text not null, -- e.g. "3A"
  year_level text not null default '3',
  photo_path text,
  thumb_path text,
  photo_status text not null default 'accepted' check (photo_status in ('accepted', 'needs_retake')),
  status text not null default 'approved' check (status in ('pending', 'approved', 'rejected')),
  rejection_reason text,
  consent_at timestamptz default now(),
  school_year text not null default '2025-2026',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 5. Student Devices Table (One active device per student policy - AC5)
create table if not exists public.student_devices (
  id uuid primary key default uuid_generate_v4(),
  student_id uuid references public.students(id) on delete cascade,
  device_id text not null,
  device_name text,
  public_key text,
  status text not null default 'active' check (status in ('active', 'revoked')),
  last_login_at timestamptz default now(),
  created_at timestamptz default now(),
  revoked_at timestamptz,
  revoked_by uuid references public.profiles(id)
);

-- 6. Device Reset Requests Table (For transferring pass to a new phone via OTP)
create table if not exists public.device_reset_requests (
  id uuid primary key default uuid_generate_v4(),
  student_id uuid references public.students(id) on delete cascade,
  new_device_id text not null,
  new_public_key text,
  new_photo_path text,
  status text not null default 'approved' check (status in ('pending', 'approved', 'rejected')),
  reviewed_by uuid references public.profiles(id),
  reviewed_at timestamptz,
  reason text default 'User initiated device transfer via OTP verification',
  created_at timestamptz default now()
);

-- 8. Audit Logs Table (General security and administrative audit)
create table if not exists public.audit_logs (
  id uuid primary key default uuid_generate_v4(),
  actor_profile_id uuid references public.profiles(id) on delete set null,
  action text not null,
  target_type text not null,
  target_id text,
  details jsonb,
  created_at timestamptz default now()
);

-- 9. Storage Setup for Student Face Photos
insert into storage.buckets (id, name, public)
values ('student-photos', 'student-photos', true)
on conflict (id) do update set public = true;

-- Storage Policies: allow public read of photos, authenticated users can upload
drop policy if exists "Public Access to Student Photos" on storage.objects;
create policy "Public Access to Student Photos"
  on storage.objects for select
  using (bucket_id = 'student-photos');

drop policy if exists "Authenticated users can upload student photos" on storage.objects;
create policy "Authenticated users can upload student photos"
  on storage.objects for insert
  with check (bucket_id = 'student-photos' and auth.role() = 'authenticated');

-- 10. Enable Row Level Security (RLS)
alter table public.departments enable row level security;
alter table public.profiles enable row level security;
alter table public.sections enable row level security;
alter table public.students enable row level security;
alter table public.student_devices enable row level security;
alter table public.device_reset_requests enable row level security;
alter table public.audit_logs enable row level security;

-- 11. Row Level Security Policies
-- Departments & Sections: Read access for all authenticated users
drop policy if exists "Allow read departments" on public.departments;
create policy "Allow read departments" on public.departments for select using (true);

drop policy if exists "Allow read sections" on public.sections;
create policy "Allow read sections" on public.sections for select using (true);

-- Profiles: Users can view and update their own profile
drop policy if exists "Users read own profile" on public.profiles;
create policy "Users read own profile" on public.profiles
  for select using (auth.uid() = id);

drop policy if exists "Users update own profile" on public.profiles;
create policy "Users update own profile" on public.profiles
  for update using (auth.uid() = id);

-- Students: Student can read, insert and update own record
drop policy if exists "Students read own record" on public.students;
create policy "Students read own record" on public.students
  for select using (profile_id = auth.uid());

drop policy if exists "Students insert own record" on public.students;
create policy "Students insert own record" on public.students
  for insert with check (profile_id = auth.uid());

drop policy if exists "Students update own record" on public.students;
create policy "Students update own record" on public.students
  for update using (profile_id = auth.uid());

-- Student Devices: Student can view and register own devices
drop policy if exists "Students read own devices" on public.student_devices;
create policy "Students read own devices" on public.student_devices
  for select using (
    student_id in (select id from public.students where profile_id = auth.uid())
  );

drop policy if exists "Students insert own devices" on public.student_devices;
create policy "Students insert own devices" on public.student_devices
  for insert with check (
    student_id in (select id from public.students where profile_id = auth.uid())
  );

drop policy if exists "Students update own devices" on public.student_devices;
create policy "Students update own devices" on public.student_devices
  for update using (
    student_id in (select id from public.students where profile_id = auth.uid())
  );

-- Device Reset Requests: Student can view and submit reset requests
drop policy if exists "Students read own reset requests" on public.device_reset_requests;
create policy "Students read own reset requests" on public.device_reset_requests
  for select using (
    student_id in (select id from public.students where profile_id = auth.uid())
  );

drop policy if exists "Students insert reset requests" on public.device_reset_requests;
create policy "Students insert reset requests" on public.device_reset_requests
  for insert with check (
    student_id in (select id from public.students where profile_id = auth.uid())
  );

