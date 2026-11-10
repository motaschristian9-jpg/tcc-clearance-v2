import { createClient, SupabaseClient, User, Session } from '@supabase/supabase-js';
import { EventDay, TimeSlotType, DayAttendance, SboOfficerSession } from '@/types/attendance';

// Retrieve credentials from Vite environment
const SUPABASE_URL = (import.meta.env.VITE_SUPABASE_URL as string | undefined) || '';
const SUPABASE_ANON_KEY = (import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined) || '';

let supabaseInstance: SupabaseClient | null = null;

export function isSupabaseConfigured(): boolean {
  return (
    Boolean(SUPABASE_URL && SUPABASE_ANON_KEY) &&
    SUPABASE_URL.startsWith('http') &&
    SUPABASE_ANON_KEY.length > 10
  );
}

export function getSupabase(): SupabaseClient | null {
  if (!isSupabaseConfigured()) {
    return null;
  }
  if (!supabaseInstance) {
    supabaseInstance = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    });
  }
  return supabaseInstance;
}

/**
 * Initiates Google OAuth Sign-in through Supabase
 */
export async function signInWithGoogle() {
  const supabase = getSupabase();
  if (!supabase) {
    throw new Error(
      'Supabase credentials are not configured. Please supply VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.'
    );
  }

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: window.location.origin,
      queryParams: {
        access_type: 'offline',
        prompt: 'consent',
      },
    },
  });

  if (error) {
    throw error;
  }

  return data;
}

/**
 * Signs out current Supabase user
 */
export async function signOutUser() {
  const supabase = getSupabase();
  if (supabase) {
    await supabase.auth.signOut();
  }
}

/**
 * Unique device identifier for one-device-per-student policy (AC5)
 */
export function getOrCreateDeviceId(): string {
  if (typeof window === 'undefined') return 'server';
  let deviceId = localStorage.getItem('TCC_DEVICE_ID');
  if (!deviceId) {
    deviceId = 'dev_' + Math.random().toString(36).substring(2, 12) + '_' + Date.now().toString(36);
    localStorage.setItem('TCC_DEVICE_ID', deviceId);
  }
  return deviceId;
}

/**
 * Checks if a registered student profile exists for this Google user
 */
export async function fetchStudentProfile(profileId: string) {
  const supabase = getSupabase();
  let localFallback: any = null;

  if (typeof window !== 'undefined') {
    const raw = localStorage.getItem(`TCC_STUDENT_${profileId}`);
    if (raw) {
      try {
        localFallback = JSON.parse(raw);
      } catch {
        localFallback = null;
      }
    }
  }

  if (!supabase) return localFallback;

  try {
    const { data, error } = await supabase
      .from('students')
      .select('*')
      .eq('profile_id', profileId)
      .maybeSingle();

    if (error && error.code !== 'PGRST116') {
      console.warn('Error fetching student profile from Supabase:', error.message);
      return localFallback;
    }

    if (data) {
      if (typeof window !== 'undefined') {
        localStorage.setItem(`TCC_STUDENT_${profileId}`, JSON.stringify(data));
      }
      return data;
    }

    return localFallback;
  } catch (err) {
    console.warn('Supabase fetch failed, using local cache:', err);
    return localFallback;
  }
}

/**
 * Uploads student captured photo to Supabase storage bucket `student-photos`
 */
export async function uploadStudentPhoto(userId: string, dataUrl: string): Promise<string> {
  const supabase = getSupabase();
  if (!supabase) return dataUrl;

  try {
    const res = await fetch(dataUrl);
    const blob = await res.blob();
    const filePath = `avatars/${userId}_${Date.now()}.jpg`;

    const { error: uploadError } = await supabase.storage
      .from('student-photos')
      .upload(filePath, blob, {
        contentType: 'image/jpeg',
        upsert: true,
      });

    if (uploadError) {
      console.warn('Storage upload error, using local fallback:', uploadError.message);
      return dataUrl;
    }

    const { data } = supabase.storage.from('student-photos').getPublicUrl(filePath);
    return data.publicUrl || dataUrl;
  } catch (err) {
    console.warn('Photo upload exception, falling back to dataUrl:', err);
    return dataUrl;
  }
}

/**
 * Saves a registered student profile to Supabase and binds their current device
 */
export async function saveStudentProfileToSupabase(payload: {
  profile_id: string;
  email?: string;
  school_id_no: string;
  full_name: string;
  department_id: string;
  section_id: string;
  photo_path?: string;
  school_year?: string;
}) {
  const supabase = getSupabase();
  const currentDeviceId = getOrCreateDeviceId();

  // Create local profile object immediately so user is never lost
  const localRecord = {
    id: 'local_' + payload.profile_id,
    profile_id: payload.profile_id,
    school_id_no: payload.school_id_no,
    full_name: payload.full_name,
    department_id: payload.department_id,
    section_id: payload.section_id,
    photo_path: payload.photo_path || '',
    photo_status: 'accepted',
    status: 'approved',
    consent_at: new Date().toISOString(),
    school_year: payload.school_year || '2025-2026',
  };

  if (typeof window !== 'undefined') {
    localStorage.setItem(`TCC_STUDENT_${payload.profile_id}`, JSON.stringify(localRecord));
    if (payload.school_id_no) {
      localStorage.setItem(`TCC_STUDENT_RECORD_${payload.school_id_no}`, JSON.stringify(localRecord));
      if (payload.photo_path) {
        localStorage.setItem(`TCC_STUDENT_PHOTO_${payload.school_id_no}`, payload.photo_path);
      }
    }
  }

  if (!supabase) return localRecord;

  try {
    // 0. Ensure public.profiles contains this user
    await supabase.from('profiles').upsert(
      {
        id: payload.profile_id,
        email: payload.email || '',
        full_name: payload.full_name,
        role: 'student',
      },
      { onConflict: 'id' }
    );

    // 1. Upsert student record
    const { data: student, error: studentError } = await supabase
      .from('students')
      .upsert(
        {
          profile_id: payload.profile_id,
          school_id_no: payload.school_id_no,
          full_name: payload.full_name,
          department_id: payload.department_id,
          section_id: payload.section_id,
          photo_path: payload.photo_path || '',
          photo_status: 'accepted',
          status: 'approved',
          consent_at: new Date().toISOString(),
          school_year: payload.school_year || '2025-2026',
        },
        { onConflict: 'profile_id' }
      )
      .select()
      .maybeSingle();

    if (studentError) {
      console.warn('Error saving student to Supabase:', studentError.message);
      return localRecord;
    }

    const savedRecord = student || localRecord;

    // Cache the verified Supabase record locally
    if (typeof window !== 'undefined') {
      localStorage.setItem(`TCC_STUDENT_${payload.profile_id}`, JSON.stringify(savedRecord));
      if (payload.school_id_no) {
        localStorage.setItem(`TCC_STUDENT_RECORD_${payload.school_id_no}`, JSON.stringify(savedRecord));
        if (payload.photo_path) {
          localStorage.setItem(`TCC_STUDENT_PHOTO_${payload.school_id_no}`, payload.photo_path);
        }
      }
    }

    // 2. Bind current device (AC5)
    if (savedRecord?.id) {
      await supabase.from('student_devices').insert({
        student_id: savedRecord.id,
        device_id: currentDeviceId,
        status: 'active',
      });
    }

    return savedRecord;
  } catch (err) {
    console.warn('Supabase save failed, persisted locally:', err);
    return localRecord;
  }
}

/**
 * Verifies if current device is authorized or requires OTP verification (AC5)
 */
export async function checkDeviceAuthorization(studentId: string): Promise<{
  isAuthorized: boolean;
  activeDeviceId?: string;
}> {
  const supabase = getSupabase();
  const currentDeviceId = getOrCreateDeviceId();

  if (!supabase) {
    return { isAuthorized: true, activeDeviceId: currentDeviceId };
  }

  try {
    const { data: devices, error } = await supabase
      .from('student_devices')
      .select('*')
      .eq('student_id', studentId)
      .eq('status', 'active');

    if (error || !devices || devices.length === 0) {
      // First device for this student
      return { isAuthorized: true, activeDeviceId: currentDeviceId };
    }

    // Check if current device matches an active registered device
    const matchesCurrent = devices.some((d) => d.device_id === currentDeviceId);
    return {
      isAuthorized: matchesCurrent,
      activeDeviceId: devices[0].device_id,
    };
  } catch {
    return { isAuthorized: true, activeDeviceId: currentDeviceId };
  }
}

/**
 * Rebinds device after successful OTP verification
 */
export async function rebindStudentDevice(studentId: string): Promise<boolean> {
  const supabase = getSupabase();
  const currentDeviceId = getOrCreateDeviceId();

  if (!supabase) return true;

  try {
    // Revoke old devices
    await supabase
      .from('student_devices')
      .update({ status: 'revoked', revoked_at: new Date().toISOString() })
      .eq('student_id', studentId)
      .eq('status', 'active');

    // Register new active device
    await supabase.from('student_devices').insert({
      student_id: studentId,
      device_id: currentDeviceId,
      status: 'active',
    });

    return true;
  } catch (err) {
    console.warn('Failed to rebind device:', err);
    return false;
  }
}

/**
 * Fetches real published clearance events from Supabase for a student's department
 */
export async function fetchPublishedEvents(department: string) {
  const supabase = getSupabase();
  if (!supabase) return [];

  try {
    const { data: events, error } = await supabase
      .from('events')
      .select('*')
      .eq('status', 'published');

    if (error || !events || events.length === 0) {
      return [];
    }

    return events.map((ev: { id: string; name: string; description?: string; school_year?: string; status?: string }) => ({
      id: ev.id,
      title: ev.name,
      category: ev.description || `${department} Clearance`,
      dateRange: 'School Year ' + (ev.school_year || '2025-2026'),
      venue: 'TCC Campus',
      totalSlots: 20,
      clearedSlots: 0,
      status: 'ongoing' as const,
      isDownloadedOffline: false,
    }));
  } catch (err) {
    console.warn('Failed to fetch events from Supabase:', err);
    return [];
  }
}

/**
 * Look up a student's photo by school ID (checks local cache first, then Supabase)
 */
export async function fetchStudentPhotoBySchoolId(schoolId: string): Promise<string | null> {
  if (!schoolId || schoolId === '---') return null;

  // 1. Check local storage cache
  if (typeof window !== 'undefined') {
    const cached = localStorage.getItem(`TCC_STUDENT_PHOTO_${schoolId}`);
    if (cached) return cached;

    const recordStr = localStorage.getItem(`TCC_STUDENT_RECORD_${schoolId}`);
    if (recordStr) {
      try {
        const record = JSON.parse(recordStr);
        if (record.photo_path) return record.photo_path;
        if (record.photoDataUrl) return record.photoDataUrl;
      } catch {}
    }
  }

  // 2. Query Supabase
  const supabase = getSupabase();
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('students')
        .select('photo_path')
        .eq('school_id_no', schoolId)
        .maybeSingle();

      if (!error && data?.photo_path) {
        if (typeof window !== 'undefined') {
          localStorage.setItem(`TCC_STUDENT_PHOTO_${schoolId}`, data.photo_path);
        }
        return data.photo_path;
      }
    } catch (err) {
      console.warn('Failed to fetch student photo from Supabase:', err);
    }
  }

  return null;
}

/**
 * Record an approved gate attendance stamp to Supabase and student local cache
 */
export async function recordAttendanceToSupabase(params: {
  schoolId: string;
  day: EventDay;
  slot: TimeSlotType;
  officer: SboOfficerSession;
  eventId?: string;
  timeFormatted?: string;
}) {
  const { schoolId, day, slot, officer, eventId } = params;
  const timeFormatted = params.timeFormatted || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  // Update student-keyed local storage
  if (typeof window !== 'undefined') {
    const studentRecordsKey = `TCC_ATTENDANCE_RECORDS_${schoolId}`;
    try {
      const existing = localStorage.getItem(studentRecordsKey);
      let records: DayAttendance[] = existing ? JSON.parse(existing) : [];
      if (!Array.isArray(records) || records.length === 0) {
        const globalSaved = localStorage.getItem('TCC_ATTENDANCE_RECORDS');
        records = globalSaved ? JSON.parse(globalSaved) : [];
      }
      if (!Array.isArray(records) || records.length === 0) {
        records = [
          { day: 'Day 1', date: 'Nov 10', slots: {}, cleared: false },
          { day: 'Day 2', date: 'Nov 11', slots: {}, cleared: false },
          { day: 'Day 3', date: 'Nov 12', slots: {}, cleared: false },
          { day: 'Day 4', date: 'Nov 13', slots: {}, cleared: false },
          { day: 'Day 5', date: 'Nov 14', slots: {}, cleared: false },
        ];
      }

      if (Array.isArray(records) && records.length > 0) {
        const updated = records.map((rec) => {
          if (rec.day === day) {
            const newSlots = { ...rec.slots, [slot]: timeFormatted };
            const newOfficers = {
              ...(rec.slotOfficers || {}),
              [slot]: {
                time: timeFormatted,
                officerName: officer.name,
                officerPosition: officer.position,
                department: officer.department,
                stationCode: officer.stationCode,
              },
            };
            const isCleared =
              rec.scanMode === '2-slots'
                ? !!(newSlots['morning-in'] && newSlots['afternoon-out'])
                : !!(
                    newSlots['morning-in'] &&
                    newSlots['morning-out'] &&
                    newSlots['afternoon-in'] &&
                    newSlots['afternoon-out']
                  );
            return {
              ...rec,
              slots: newSlots,
              slotOfficers: newOfficers,
              cleared: isCleared,
            };
          }
          return rec;
        });

        localStorage.setItem(studentRecordsKey, JSON.stringify(updated));
        localStorage.setItem('TCC_ATTENDANCE_RECORDS', JSON.stringify(updated));
      }

      window.dispatchEvent(new Event('tcc-attendance-updated'));
    } catch {}
  }

  // Push to Supabase if available
  const supabase = getSupabase();
  if (!supabase) return;

  try {
    const { data: student } = await supabase
      .from('students')
      .select('id, profile_id')
      .eq('school_id_no', schoolId)
      .maybeSingle();

    if (student) {
      const serial = `${eventId || 'tcc'}_${day}_${slot}_${schoolId}`;
      await supabase.from('attendance').insert({
        student_id: student.id,
        method: 'qr',
        status: 'valid',
        scanned_at: new Date().toISOString(),
        serial_no: serial,
        signature: JSON.stringify({
          day,
          slot,
          officerName: officer.name,
          officerPosition: officer.position,
          department: officer.department,
          stationCode: officer.stationCode,
          time: timeFormatted,
        }),
      });
    }
  } catch (err) {
    console.warn('Failed to record attendance to Supabase:', err);
  }
}

/**
 * Fetch and merge student attendance records from Supabase and local cache
 */
export async function fetchStudentAttendanceFromSupabase(params: {
  studentDbId?: string | null;
  schoolId?: string;
  baseRecords: DayAttendance[];
}): Promise<DayAttendance[]> {
  const { studentDbId, schoolId, baseRecords } = params;
  let records = [...baseRecords];

  // 1. Merge with student-specific local storage
  if (typeof window !== 'undefined' && schoolId) {
    try {
      const studentLocal = localStorage.getItem(`TCC_ATTENDANCE_RECORDS_${schoolId}`);
      if (studentLocal) {
        const parsed: DayAttendance[] = JSON.parse(studentLocal);
        if (Array.isArray(parsed) && parsed.length > 0) {
          records = parsed;
        }
      }
    } catch {}
  }

  // 2. Fetch from Supabase
  const supabase = getSupabase();
  if (supabase && (studentDbId || schoolId)) {
    try {
      let targetStudentId = studentDbId;
      if (!targetStudentId && schoolId) {
        const { data: student } = await supabase
          .from('students')
          .select('id')
          .eq('school_id_no', schoolId)
          .maybeSingle();
        targetStudentId = student?.id;
      }

      if (targetStudentId) {
        const { data: dbAttendance } = await supabase
          .from('attendance')
          .select('*')
          .eq('student_id', targetStudentId);

        if (dbAttendance && dbAttendance.length > 0) {
          records = records.map((r) => ({
            ...r,
            slots: { ...r.slots },
            slotOfficers: { ...(r.slotOfficers || {}) },
          }));

          dbAttendance.forEach((row: { signature?: string | null }) => {
            if (row.signature) {
              try {
                const sig = JSON.parse(row.signature);
                const rec = records.find((r) => r.day === sig.day);
                if (rec && sig.slot) {
                  const sKey = sig.slot as TimeSlotType;
                  rec.slots[sKey] = sig.time;
                  if (!rec.slotOfficers) rec.slotOfficers = {};
                  rec.slotOfficers[sKey] = {
                    time: sig.time,
                    officerName: sig.officerName,
                    officerPosition: sig.officerPosition,
                    department: sig.department,
                    stationCode: sig.stationCode,
                  };
                  rec.cleared =
                    rec.scanMode === '2-slots'
                      ? !!(rec.slots['morning-in'] && rec.slots['afternoon-out'])
                      : !!(
                          rec.slots['morning-in'] &&
                          rec.slots['morning-out'] &&
                          rec.slots['afternoon-in'] &&
                          rec.slots['afternoon-out']
                        );
                }
              } catch {}
            }
          });

          // Cache in student-specific localStorage
          if (typeof window !== 'undefined') {
            if (schoolId) {
              localStorage.setItem(`TCC_ATTENDANCE_RECORDS_${schoolId}`, JSON.stringify(records));
            }
            localStorage.setItem('TCC_ATTENDANCE_RECORDS', JSON.stringify(records));
          }
        }
      }
    } catch (err) {
      console.warn('Failed to load student attendance from Supabase:', err);
    }
  }

  return records;
}

export type { User, Session };
