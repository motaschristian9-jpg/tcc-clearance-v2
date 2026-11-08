import { describe, it, expect } from 'vitest';
import {
  generateKeyPair,
  exportPublicKey,
  importPublicKey,
  signData,
  verifyData,
} from '../src/lib/crypto/webcrypto';
import {
  createAttendanceToken,
  parseAttendanceToken,
  verifyAttendanceToken,
  getCurrentTimeWindow,
} from '../src/lib/crypto/tokens';

describe('WebCrypto ECDSA P-256 Cryptographic Primitives', () => {
  it('generates an ECDSA P-256 key pair and exports/imports public key', async () => {
    const keyPair = await generateKeyPair(true);
    expect(keyPair.privateKey).toBeDefined();
    expect(keyPair.publicKey).toBeDefined();
    expect(keyPair.publicKey.algorithm.name).toBe('ECDSA');

    const exportedSpki = await exportPublicKey(keyPair.publicKey);
    expect(typeof exportedSpki).toBe('string');
    expect(exportedSpki.length).toBeGreaterThan(50);

    const reimportedKey = await importPublicKey(exportedSpki);
    expect(reimportedKey).toBeDefined();
    expect(reimportedKey.type).toBe('public');
  });

  it('signs and verifies arbitrary string data', async () => {
    const keyPair = await generateKeyPair(true);
    const data = 'TCC_STUDENT_2023-01842_CIT_DAY1_MORNING_IN';

    const signature = await signData(data, keyPair.privateKey);
    expect(typeof signature).toBe('string');
    expect(signature.length).toBeGreaterThan(20);

    const isValid = await verifyData(data, signature, keyPair.publicKey);
    expect(isValid).toBe(true);

    // Tampering test
    const isTamperedValid = await verifyData(data + '_TAMPERED', signature, keyPair.publicKey);
    expect(isTamperedValid).toBe(false);
  });
});

describe('30-Second Rotating Attendance QR Token Engine', () => {
  it('creates and parses a compact attendance token', async () => {
    const keyPair = await generateKeyPair(true);
    const nowMs = 1773000000000;

    const token = await createAttendanceToken(
      {
        studentSchoolId: '2023-01842',
        eventId: 'cit-intramurals-2026',
        department: 'CIT',
        lat: 8.5412,
        lng: 124.7561,
        nowMs,
      },
      keyPair.privateKey
    );

    expect(token).toContain('.');
    const parts = token.split('.');
    expect(parts.length).toBe(2);

    const parsed = parseAttendanceToken(token);
    expect(parsed).not.toBeNull();
    expect(parsed?.payload.s).toBe('2023-01842');
    expect(parsed?.payload.e).toBe('cit-intramurals-2026');
    expect(parsed?.payload.d).toBe('CIT');
    expect(parsed?.payload.lat).toBeCloseTo(8.5412);
  });

  it('verifies a valid token within current time window', async () => {
    const keyPair = await generateKeyPair(true);
    const nowMs = 1773000000000;

    const token = await createAttendanceToken(
      {
        studentSchoolId: '2023-01842',
        eventId: 'cit-intramurals-2026',
        department: 'CIT',
        nowMs,
      },
      keyPair.privateKey
    );

    const result = await verifyAttendanceToken(token, keyPair.publicKey, {
      nowMs,
      expectedEventId: 'cit-intramurals-2026',
    });

    expect(result.isValid).toBe(true);
    expect(result.code).toBe('VALID');
    expect(result.payload?.s).toBe('2023-01842');
  });

  it('accepts tokens within 1 time window drift (tolerance = 1 window = ~30s)', async () => {
    const keyPair = await generateKeyPair(true);
    const creationTime = 1773000000000; // window N
    const scanTime = creationTime + 28 * 1000; // 28s later (still in window or adjacent window)

    const token = await createAttendanceToken(
      {
        studentSchoolId: '2023-01842',
        eventId: 'cit-intramurals-2026',
        department: 'CIT',
        nowMs: creationTime,
      },
      keyPair.privateKey
    );

    const result = await verifyAttendanceToken(token, keyPair.publicKey, {
      nowMs: scanTime,
      expectedEventId: 'cit-intramurals-2026',
      windowTolerance: 1,
    });

    expect(result.isValid).toBe(true);
    expect(result.code).toBe('VALID');
  });

  it('rejects expired tokens older than tolerance (> 60s)', async () => {
    const keyPair = await generateKeyPair(true);
    const creationTime = 1773000000000;
    const scanTime = creationTime + 95 * 1000; // 95s later (3 windows later)

    const token = await createAttendanceToken(
      {
        studentSchoolId: '2023-01842',
        eventId: 'cit-intramurals-2026',
        department: 'CIT',
        nowMs: creationTime,
      },
      keyPair.privateKey
    );

    const result = await verifyAttendanceToken(token, keyPair.publicKey, {
      nowMs: scanTime,
      expectedEventId: 'cit-intramurals-2026',
      windowTolerance: 1,
    });

    expect(result.isValid).toBe(false);
    expect(result.code).toBe('EXPIRED');
    expect(result.reason).toContain('expired');
  });

  it('detects forged tokens signed by an imposter or modified payload', async () => {
    const legitimateKeyPair = await generateKeyPair(true);
    const imposterKeyPair = await generateKeyPair(true);
    const nowMs = 1773000000000;

    // Imposter signs their own token claiming to be legitimate student
    const forgedToken = await createAttendanceToken(
      {
        studentSchoolId: '2023-01842',
        eventId: 'cit-intramurals-2026',
        department: 'CIT',
        nowMs,
      },
      imposterKeyPair.privateKey
    );

    // Scanner checks against legitimate student's registered public key
    const result = await verifyAttendanceToken(forgedToken, legitimateKeyPair.publicKey, {
      nowMs,
      expectedEventId: 'cit-intramurals-2026',
    });

    expect(result.isValid).toBe(false);
    expect(result.code).toBe('FORGED');
    expect(result.reason).toContain('signature invalid');
  });

  it('detects mismatched event ID', async () => {
    const keyPair = await generateKeyPair(true);
    const nowMs = 1773000000000;

    const token = await createAttendanceToken(
      {
        studentSchoolId: '2023-01842',
        eventId: 'cba-days-2025',
        department: 'CBA',
        nowMs,
      },
      keyPair.privateKey
    );

    const result = await verifyAttendanceToken(token, keyPair.publicKey, {
      nowMs,
      expectedEventId: 'cit-intramurals-2026',
    });

    expect(result.isValid).toBe(false);
    expect(result.code).toBe('MALFORMED');
    expect(result.reason).toContain('Event mismatch');
  });
});
