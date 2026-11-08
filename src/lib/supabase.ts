import { createClient, SupabaseClient, User, Session } from '@supabase/supabase-js';

// Retrieve credentials from Vite environment or localStorage
const envUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const envAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

const storedUrl = typeof window !== 'undefined' ? localStorage.getItem('TCC_SUPABASE_URL') : null;
const storedAnonKey = typeof window !== 'undefined' ? localStorage.getItem('TCC_SUPABASE_ANON_KEY') : null;

const SUPABASE_URL = (envUrl && envUrl.trim().length > 0 ? envUrl : storedUrl) || '';
const SUPABASE_ANON_KEY = (envAnonKey && envAnonKey.trim().length > 0 ? envAnonKey : storedAnonKey) || '';

let supabaseInstance: SupabaseClient | null = null;

export function isSupabaseConfigured(): boolean {
  return (
    Boolean(SUPABASE_URL && SUPABASE_ANON_KEY) &&
    SUPABASE_URL.startsWith('http') &&
    SUPABASE_ANON_KEY.length > 10
  );
}

export function setSupabaseConfig(url: string, anonKey: string) {
  if (typeof window !== 'undefined') {
    localStorage.setItem('TCC_SUPABASE_URL', url.trim());
    localStorage.setItem('TCC_SUPABASE_ANON_KEY', anonKey.trim());
    supabaseInstance = null;
    window.location.reload();
  }
}

export function clearSupabaseConfig() {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('TCC_SUPABASE_URL');
    localStorage.removeItem('TCC_SUPABASE_ANON_KEY');
    supabaseInstance = null;
    window.location.reload();
  }
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
  if (!supabase) return null;

  try {
    const { data, error } = await supabase
      .from('students')
      .select('*')
      .eq('profile_id', profileId)
      .maybeSingle();

    if (error && error.code !== 'PGRST116') {
      console.warn('Error fetching student profile from Supabase:', error.message);
      return null;
    }
    return data;
  } catch (err) {
    console.warn('Supabase fetch failed:', err);
    return null;
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
  school_id_no: string;
  full_name: string;
  department_id: string;
  section_id: string;
  photo_path?: string;
  school_year?: string;
}) {
  const supabase = getSupabase();
  if (!supabase) return null;

  try {
    // 1. Upsert student record
    const { data: student, error: studentError } = await supabase
      .from('students')
      .upsert({
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
      })
      .select()
      .single();

    if (studentError) {
      console.warn('Error saving student to Supabase:', studentError.message);
      return null;
    }

    // 2. Bind current device (AC5)
    if (student?.id) {
      const currentDeviceId = getOrCreateDeviceId();
      await supabase.from('student_devices').insert({
        student_id: student.id,
        device_id: currentDeviceId,
        status: 'active',
      });
    }

    return student;
  } catch (err) {
    console.warn('Supabase save failed:', err);
    return null;
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

export type { User, Session };
