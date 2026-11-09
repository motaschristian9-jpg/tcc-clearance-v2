-- ==============================================================================
-- TCC Clearance System - Events, Days, Slots & Attendance Schema + Seed
-- Project: https://fornjwndjhelppqzviab.supabase.co
-- Based on: Docs/5. Database Schema — TCC Event Clearance App.pdf
-- ==============================================================================

-- 1. Events Table
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

-- 2. Event Departments Junction Table
create table if not exists public.event_departments (
  event_id uuid references public.events(id) on delete cascade,
  department_id text not null,
  primary key (event_id, department_id)
);

-- 3. Event Days Table
create table if not exists public.event_days (
  id uuid primary key default uuid_generate_v4(),
  event_id uuid references public.events(id) on delete cascade,
  day_no int not null,
  date text not null, -- e.g. "Nov 10, 2026"
  created_at timestamptz default now()
);

-- 4. Slots Table
create table if not exists public.slots (
  id uuid primary key default uuid_generate_v4(),
  event_day_id uuid references public.event_days(id) on delete cascade,
  order_no int not null,
  label text not null, -- e.g. "Morning In", "Morning Out"
  start_time text,
  end_time text,
  signer_name text,
  signer_position text,
  created_at timestamptz default now()
);

-- 5. Attendance Records Table
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
  synced_at timestamptz default now(),
  constraint unique_student_slot unique (student_id, slot_id)
);

-- 6. Enable Row Level Security (RLS)
alter table public.events enable row level security;
alter table public.event_departments enable row level security;
alter table public.event_days enable row level security;
alter table public.slots enable row level security;
alter table public.attendance enable row level security;

-- 7. RLS Policies
-- Events, Days, Slots: Readable by all authenticated users
drop policy if exists "Allow read events" on public.events;
create policy "Allow read events" on public.events for select using (true);

drop policy if exists "Allow read event_departments" on public.event_departments;
create policy "Allow read event_departments" on public.event_departments for select using (true);

drop policy if exists "Allow read event_days" on public.event_days;
create policy "Allow read event_days" on public.event_days for select using (true);

drop policy if exists "Allow read slots" on public.slots;
create policy "Allow read slots" on public.slots for select using (true);

-- Attendance: Students can read their own attendance records
drop policy if exists "Students read own attendance" on public.attendance;
create policy "Students read own attendance" on public.attendance
  for select using (
    student_id in (select id from public.students where profile_id = auth.uid())
  );

drop policy if exists "Allow insert attendance" on public.attendance;
create policy "Allow insert attendance" on public.attendance
  for insert with check (
    student_id in (select id from public.students where profile_id = auth.uid())
  );

-- ==============================================================================
-- 8. Seed: CIT Intramurals 2026 (5-Day College Event)
-- ==============================================================================
do $$
declare
  v_event_id uuid;
  v_day_id uuid;
  v_day_record record;
  v_days text[] := array['Nov 10', 'Nov 11', 'Nov 12', 'Nov 13', 'Nov 14'];
  v_day_num int;
begin
  -- Check if CIT Intramurals already exists
  select id into v_event_id from public.events where name = 'CIT Intramurals 2026' limit 1;

  if v_event_id is null then
    -- Insert Event
    insert into public.events (name, description, school_year, status)
    values ('CIT Intramurals 2026', '5-Day College Event · TCC Sports Complex', '2025-2026', 'published')
    returning id into v_event_id;

    -- Link to CIT Department
    insert into public.event_departments (event_id, department_id)
    values (v_event_id, 'CIT')
    on conflict do nothing;

    -- Create 5 Days with 4 slots each
    for v_day_num in 1..5 loop
      insert into public.event_days (event_id, day_no, date)
      values (v_event_id, v_day_num, v_days[v_day_num])
      returning id into v_day_id;

      -- Slot 1: Morning In
      insert into public.slots (event_day_id, order_no, label, start_time, end_time, signer_position)
      values (v_day_id, 1, 'Morning In', '07:30 AM', '08:30 AM', 'SBO Officer');

      -- Slot 2: Morning Out
      insert into public.slots (event_day_id, order_no, label, start_time, end_time, signer_position)
      values (v_day_id, 2, 'Morning Out', '11:30 AM', '12:30 PM', 'SBO Officer');

      -- Slot 3: Afternoon In
      insert into public.slots (event_day_id, order_no, label, start_time, end_time, signer_position)
      values (v_day_id, 3, 'Afternoon In', '01:00 PM', '02:00 PM', 'SBO Officer');

      -- Slot 4: Afternoon Out
      insert into public.slots (event_day_id, order_no, label, start_time, end_time, signer_position)
      values (v_day_id, 4, 'Afternoon Out', '04:30 PM', '05:30 PM', 'SBO Officer');
    end loop;
  end if;
end $$;

