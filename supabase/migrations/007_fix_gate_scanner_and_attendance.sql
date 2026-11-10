-- ==============================================================================
-- TCC Clearance System - Gate Scanner Verification & Attendance Policies
-- Migration: 007_fix_gate_scanner_and_attendance.sql
-- ==============================================================================

-- 1. Allow gate scanner terminals (including anon sessions) to verify student profiles and photos
drop policy if exists "Allow gate student verification" on public.students;
create policy "Allow gate student verification" on public.students
  for select to anon, authenticated
  using (true);

-- 2. Ensure public.attendance table exists
create table if not exists public.attendance (
  id uuid primary key default uuid_generate_v4(),
  student_id uuid references public.students(id) on delete cascade,
  slot_id uuid,
  event_id text default 'intramurals-2026',
  method text default 'qr',
  status text default 'valid',
  signature jsonb,
  serial_no text,
  scanned_at timestamptz default now(),
  created_at timestamptz default now()
);

-- Enable RLS on attendance
alter table public.attendance enable row level security;

-- 3. Allow gate scanner terminals to read and record attendance
drop policy if exists "Allow gate attendance read" on public.attendance;
create policy "Allow gate attendance read" on public.attendance
  for select to anon, authenticated
  using (true);

drop policy if exists "Allow gate attendance insert" on public.attendance;
create policy "Allow gate attendance insert" on public.attendance
  for insert to anon, authenticated
  with check (true);

-- 4. Enable public read and upload to student-photos storage bucket
insert into storage.buckets (id, name, public)
values ('student-photos', 'student-photos', true)
on conflict (id) do update set public = true;

drop policy if exists "Public student photos read" on storage.objects;
create policy "Public student photos read" on storage.objects
  for select to anon, authenticated
  using (bucket_id = 'student-photos');

drop policy if exists "Public student photos upload" on storage.objects;
create policy "Public student photos upload" on storage.objects
  for insert to anon, authenticated
  with check (bucket_id = 'student-photos');
