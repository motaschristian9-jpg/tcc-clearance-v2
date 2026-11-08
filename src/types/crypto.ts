export interface AttendanceTokenPayload {
  v: number;            // Version (e.g. 1)
  s: string;            // Student School ID or UUID (e.g. "2023-01842")
  t: number;            // Time window index: Math.floor(Date.now() / 1000 / 30)
  e: string;            // Event ID
  d: string;            // Department (e.g. "CIT")
  lat?: number;         // Optional Geolocation Latitude
  lng?: number;         // Optional Geolocation Longitude
}

export interface VerificationResult {
  isValid: boolean;
  code: 'VALID' | 'EXPIRED' | 'FORGED' | 'UNKNOWN_STUDENT' | 'MALFORMED' | 'LOCATION_DRIFT';
  reason?: string;
  payload?: AttendanceTokenPayload;
}
