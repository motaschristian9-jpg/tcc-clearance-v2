-- ==============================================================================
-- TCC Clearance System - Complete PostgreSQL Schema for Supabase
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

-- Seed 8 TCC Departments
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
  role text not null default 'student' check (role in ('student', 'officer', 'head')),
  created_at timestamptz default now()
);

-- Automatically create profile on new Supabase auth.users signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, role)
  values (new.id, new.email, 'student')
  on conflict (id) do nothing;
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

-- 4. Students Table
create table if not exists public.students (
  id uuid primary key default uuid_generate_v4(),
  profile_id uuid references public.profiles(id) on delete cascade,
  school_id_no text unique not null, -- 8 digits unhyphenated, e.g. "20241373"
  full_name text not null,
  department_id text not null, -- e.g. "CIT"
  section_id text not null, -- e.g. "3A"
  photo_path text,
  thumb_path text,
  photo_status text not null default 'accepted' check (photo_status in ('accepted', 'needs_retake')),
  status text not null default 'approved' check (status in ('pending', 'approved', 'rejected')),
  rejection_reason text,
  consent_at timestamptz default now(),
  school_year text not null default '2025-2026',
  created_at timestamptz default now()
);

-- 5. Student Devices Table (One active device per student policy - AC5)
create table if not exists public.student_devices (
  id uuid primary key default uuid_generate_v4(),
  student_id uuid references public.students(id) on delete cascade,
  device_id text not null,
  public_key text,
  status text not null default 'active' check (status in ('active', 'revoked')),
  created_at timestamptz default now(),
  revoked_at timestamptz,
  revoked_by uuid references public.profiles(id)
);

-- 6. Device Reset Requests Table
create table if not exists public.device_reset_requests (
  id uuid primary key default uuid_generate_v4(),
  student_id uuid references public.students(id) on delete cascade,
  new_device_id text not null,
  new_public_key text,
  new_photo_path text,
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  reviewed_by uuid references public.profiles(id),
  reviewed_at timestamptz,
  reason text,
  created_at timestamptz default now()
);

-- 7. Events Table
create table if not exists public.events (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  description text,
  school_year text not null default '2025-2026',
  status text not null default 'published' check (status in ('draft', 'published', 'archived')),
  location_check text not null default 'off' check (location_check in ('off', 'flag', 'block')),
  approved_by_name text,
  approved_on timestamptz,
  created_by uuid references public.profiles(id),
  published_by uuid references public.profiles(id),
  version int not null default 1,
  created_at timestamptz default now()
);

-- 8. Event Departments Junction Table
create table if not exists public.event_departments (
  event_id uuid references public.events(id) on delete cascade,
  department_id text not null,
  primary key (event_id, department_id)
);

-- 9. Event Days Table
create table if not exists public.event_days (
  id uuid primary key default uuid_generate_v4(),
  event_id uuid references public.events(id) on delete cascade,
  day_no int not null,
  date text not null, -- e.g. "Nov 10, 2026"
  created_at timestamptz default now()
);

-- 10. Slots Table
create table if not exists public.slots (
  id uuid primary key default uuid_generate_v4(),
  event_day_id uuid references public.event_days(id) on delete cascade,
  order_no int not null,
  label text not null, -- e.g. "Time In", "Time Out"
  start_time text,
  end_time text,
  signer_name text,
  signer_position text,
  created_at timestamptz default now()
);

-- 11. Attendance Records Table
create table if not exists public.attendance (
  id uuid primary key default uuid_generate_v4(),
  client_uuid uuid unique not null default uuid_generate_v4(),
  event_id uuid references public.events(id) on delete cascade,
  slot_id uuid references public.slots(id) on delete cascade,
  student_id uuid references public.students(id) on delete cascade,
  scanned_at timestamptz default now(),
  method text not null default 'qr' check (method in ('qr', 'manual')),
  location_flag text not null default 'none' check (location_flag in ('none', 'ok', 'far', 'unknown')),
  status text not null default 'valid' check (status in ('valid', 'duplicate', 'voided')),
  serial_no text,
  signature text,
  synced_at timestamptz default now()
);

-- Row Level Security (RLS)
alter table public.departments enable row level security;
alter table public.profiles enable row level security;
alter table public.sections enable row level security;
alter table public.students enable row level security;
alter table public.student_devices enable row level security;
alter table public.device_reset_requests enable row level security;
alter table public.events enable row level security;
alter table public.event_departments enable row level security;
alter table public.event_days enable row level security;
alter table public.slots enable row level security;
alter table public.attendance enable row level security;

-- RLS Policies
-- Departments, Sections, Events, Days & Slots: Read access for all authenticated users
create policy "Allow read departments" on public.departments for select using (true);
create policy "Allow read sections" on public.sections for select using (true);
create policy "Allow read events" on public.events for select using (true);
create policy "Allow read event_departments" on public.event_departments for select using (true);
create policy "Allow read event_days" on public.event_days for select using (true);
create policy "Allow read slots" on public.slots for select using (true);

-- Profiles: Users can read and update own profile
create policy "Users read own profile" on public.profiles
  for select using (auth.uid() = id);

-- Students: Student can read and insert/update own student record
create policy "Students read own record" on public.students
  for select using (profile_id = auth.uid());

create policy "Students insert own record" on public.students
  for insert with check (profile_id = auth.uid());

create policy "Students update own record" on public.students
  for update using (profile_id = auth.uid());

-- Student Devices: Student can read and register own devices
create policy "Students read own devices" on public.student_devices
  for select using (
    student_id in (select id from public.students where profile_id = auth.uid())
  );

create policy "Students insert own devices" on public.student_devices
  for insert with check (
    student_id in (select id from public.students where profile_id = auth.uid())
  );

-- Attendance: Students can read own attendance records
create policy "Students read own attendance" on public.attendance
  for select using (
    student_id in (select id from public.students where profile_id = auth.uid())
  );
