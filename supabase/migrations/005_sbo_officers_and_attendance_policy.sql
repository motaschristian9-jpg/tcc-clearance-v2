-- ==============================================================================
-- TCC Clearance System - SBO Officer Policies & Permissions
-- Migration: 005_sbo_officers_and_attendance_policy.sql
-- ==============================================================================

-- 1. Helper function: Check if current authenticated user is an SBO Officer or Admin Head
create or replace function public.is_sbo_officer()
returns boolean as $$
begin
  return exists (
    select 1 from public.profiles
    where id = auth.uid()
    and role in ('officer', 'head')
  );
end;
$$ language plpgsql security definer;

-- 2. Allow SBO officers to read and manage attendance records across all students
drop policy if exists "SBO officers manage all attendance" on public.attendance;
create policy "SBO officers manage all attendance" on public.attendance
  for all using (
    public.is_sbo_officer()
  )
  with check (
    public.is_sbo_officer()
  );

-- 3. Allow SBO officers to view all student profiles for gate verification
drop policy if exists "SBO officers view all students" on public.students;
create policy "SBO officers view all students" on public.students
  for select using (
    public.is_sbo_officer()
  );

-- 4. Audit Log function for gate attendance scans
create or replace function public.log_gate_scan(
  p_student_id uuid,
  p_slot_id uuid,
  p_event_id uuid,
  p_officer_id uuid,
  p_method text default 'qr'
)
returns uuid as $$
declare
  v_attendance_id uuid;
begin
  insert into public.attendance (
    student_id,
    slot_id,
    event_id,
    method,
    status,
    scanned_at
  )
  values (
    p_student_id,
    p_slot_id,
    p_event_id,
    p_method,
    'valid',
    now()
  )
  on conflict (student_id, slot_id) do update set
    scanned_at = now(),
    method = excluded.method
  returning id into v_attendance_id;

  return v_attendance_id;
end;
$$ language plpgsql security definer;

