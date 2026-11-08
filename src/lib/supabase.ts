import { createClient, SupabaseClient, User, Session } from '@supabase/supabase-js';

// Retrieve credentials from Vite environment or localStorage for instant sandbox testing
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
    supabaseInstance = null; // reset to reinitialize
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
 * Saves a registered student profile to Supabase
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
    const { data, error } = await supabase
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

    if (error) {
      console.warn('Error saving student to Supabase:', error.message);
      return null;
    }
    return data;
  } catch (err) {
    console.warn('Supabase save failed:', err);
    return null;
  }
}

export type { User, Session };

