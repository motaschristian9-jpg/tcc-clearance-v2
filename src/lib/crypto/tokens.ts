import { AttendanceTokenPayload, VerificationResult } from '@/types/crypto';
import { signData, verifyData, bytesToBase64Url, base64UrlToBytes } from './webcrypto';

const WINDOW_SECONDS = 30;
const DEFAULT_WINDOW_TOLERANCE = 1; // Allows current window ± 1 window (up to ~60s)

/**
 * Calculates the current 30-second time window index.
 */
export function getCurrentTimeWindow(nowMs: number = Date.now()): number {
  return Math.floor(nowMs / 1000 / WINDOW_SECONDS);
}

/**
 * Generates a signed, rotating attendance QR token string.
 * Format: `<base64url-payload>.<base64url-signature>` (~100-150 characters)
 */
export async function createAttendanceToken(
  params: {
    studentSchoolId: string;
    eventId: string;
    department: string;
    lat?: number;
    lng?: number;
    nowMs?: number;
  },
  privateKey: CryptoKey
): Promise<string> {
  const timeWindow = getCurrentTimeWindow(params.nowMs);

  const payload: AttendanceTokenPayload = {
    v: 1,
    s: params.studentSchoolId,
    t: timeWindow,
    e: params.eventId,
    d: params.department,
    ...(params.lat !== undefined && params.lng !== undefined
      ? { lat: params.lat, lng: params.lng }
      : {}),
  };

  const jsonString = JSON.stringify(payload);
  const encoder = new TextEncoder();
  const payloadB64 = bytesToBase64Url(encoder.encode(jsonString));
  const signatureB64 = await signData(payloadB64, privateKey);

  return `${payloadB64}.${signatureB64}`;
}

/**
 * Parses a raw token string into its payload and signature components.
 */
export function parseAttendanceToken(tokenString: string): {
  payload: AttendanceTokenPayload;
  payloadB64: string;
  signatureB64: string;
} | null {
  const parts = tokenString.trim().split('.');
  if (parts.length !== 2) {
    return null;
  }

  const [payloadB64, signatureB64] = parts;
  try {
    const bytes = base64UrlToBytes(payloadB64);
    const decoder = new TextDecoder();
    const jsonString = decoder.decode(bytes);
    const payload = JSON.parse(jsonString) as AttendanceTokenPayload;

    if (!payload.s || typeof payload.t !== 'number' || !payload.e) {
      return null;
    }

    return { payload, payloadB64, signatureB64 };
  } catch {
    return null;
  }
}

/**
 * Offline verification of an attendance token against the student's public key.
 */
export async function verifyAttendanceToken(
  tokenString: string,
  publicKey: CryptoKey,
  options: {
    nowMs?: number;
    windowTolerance?: number;
    expectedEventId?: string;
  } = {}
): Promise<VerificationResult> {
  const parsed = parseAttendanceToken(tokenString);
  if (!parsed) {
    return {
      isValid: false,
      code: 'MALFORMED',
      reason: 'Malformed or unreadable token structure',
    };
  }

  const { payload, payloadB64, signatureB64 } = parsed;

  // 1. Check Event ID match
  if (options.expectedEventId && payload.e !== options.expectedEventId) {
    return {
      isValid: false,
      code: 'MALFORMED',
      reason: `Event mismatch: token is for event "${payload.e}", current is "${options.expectedEventId}"`,
      payload,
    };
  }

  // 2. Check 30-second Time Window Drift
  const nowMs = options.nowMs ?? Date.now();
  const currentWindow = getCurrentTimeWindow(nowMs);
  const tolerance = options.windowTolerance ?? DEFAULT_WINDOW_TOLERANCE;
  const windowDiff = Math.abs(currentWindow - payload.t);

  if (windowDiff > tolerance) {
    const expiredBySeconds = (currentWindow - payload.t) * WINDOW_SECONDS;
    return {
      isValid: false,
      code: 'EXPIRED',
      reason: `QR token expired (${expiredBySeconds}s offset). Student must present their live rotating pass.`,
      payload,
    };
  }

  // 3. Cryptographic Signature Verification using WebCrypto ECDSA P-256
  const isSignatureValid = await verifyData(payloadB64, signatureB64, publicKey);
  if (!isSignatureValid) {
    return {
      isValid: false,
      code: 'FORGED',
      reason: 'Cryptographic signature invalid. Token was forged or device key does not match.',
      payload,
    };
  }

  return {
    isValid: true,
    code: 'VALID',
    payload,
  };
}
