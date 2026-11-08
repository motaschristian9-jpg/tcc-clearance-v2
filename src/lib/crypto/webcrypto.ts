/**
 * WebCrypto ECDSA P-256 Cryptographic Primitives
 * Optimized for fast, secure client-side signing and offline verification.
 */

// ECDSA P-256 using SHA-256 algorithm configuration
const ECDSA_ALGO: EcKeyGenParams = {
  name: 'ECDSA',
  namedCurve: 'P-256',
};

const SIGN_ALGO: EcdsaParams = {
  name: 'ECDSA',
  hash: { name: 'SHA-256' },
};

/**
 * Base64URL string encoding and decoding helpers
 */
export function bytesToBase64Url(bytes: Uint8Array): string {
  let binary = '';
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  const base64 = btoa(binary);
  return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

export function base64UrlToBytes(base64url: string): Uint8Array {
  let base64 = base64url.replace(/-/g, '+').replace(/_/g, '/');
  while (base64.length % 4) {
    base64 += '=';
  }
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

/**
 * Generates an ECDSA P-256 key pair for student or officer device binding.
 * @param extractablePrivate If false, private key cannot be extracted out of the browser.
 */
export async function generateKeyPair(extractablePrivate: boolean = false): Promise<CryptoKeyPair> {
  return await crypto.subtle.generateKey(
    ECDSA_ALGO,
    extractablePrivate,
    ['sign', 'verify']
  );
}

/**
 * Exports a Public CryptoKey to a compact Base64URL SPKI string.
 */
export async function exportPublicKey(key: CryptoKey): Promise<string> {
  const spkiBuffer = await crypto.subtle.exportKey('spki', key);
  return bytesToBase64Url(new Uint8Array(spkiBuffer));
}

/**
 * Imports a Base64URL SPKI string back into a public CryptoKey for verification.
 */
export async function importPublicKey(spkiBase64Url: string): Promise<CryptoKey> {
  const bytes = base64UrlToBytes(spkiBase64Url);
  return await crypto.subtle.importKey(
    'spki',
    bytes.buffer as ArrayBuffer,
    ECDSA_ALGO,
    true,
    ['verify']
  );
}

/**
 * Signs raw UTF-8 string data using an ECDSA P-256 private key.
 * Returns the Base64URL signature.
 */
export async function signData(data: string, privateKey: CryptoKey): Promise<string> {
  const encoder = new TextEncoder();
  const dataBytes = encoder.encode(data);
  const signatureBuffer = await crypto.subtle.sign(SIGN_ALGO, privateKey, dataBytes.buffer as ArrayBuffer);
  return bytesToBase64Url(new Uint8Array(signatureBuffer));
}

/**
 * Verifies raw UTF-8 string data against an ECDSA signature using a public key.
 */
export async function verifyData(
  data: string,
  signatureBase64Url: string,
  publicKey: CryptoKey
): Promise<boolean> {
  try {
    const encoder = new TextEncoder();
    const dataBytes = encoder.encode(data);
    const signatureBytes = base64UrlToBytes(signatureBase64Url);
    return await crypto.subtle.verify(
      SIGN_ALGO,
      publicKey,
      signatureBytes.buffer as ArrayBuffer,
      dataBytes.buffer as ArrayBuffer
    );
  } catch {
    return false;
  }
}
