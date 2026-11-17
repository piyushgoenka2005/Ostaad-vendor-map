import { cookies } from "next/headers";

export const SESSION_COOKIE_NAME = "ostaad_map_session";
const SESSION_TTL_SECONDS = 60 * 60 * 24 * 7; // 7 days
const SIGNING_SALT = "ostaad-vendor-map-session-v1";

interface SessionPayload {
  v: 1;
  iat: number;
  exp: number;
}

export function getConfiguredPassword(): string {
  return (process.env.MAP_ACCESS_PASSWORD ?? "").trim();
}

export function isAuthEnabled(): boolean {
  return getConfiguredPassword().length > 0;
}

function toBase64Url(input: string): string {
  const bytes = new TextEncoder().encode(input);
  let binary = "";
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

function fromBase64Url(input: string): string {
  const padded = input.replace(/-/g, "+").replace(/_/g, "/") + "=".repeat((4 - (input.length % 4)) % 4);
  const binary = atob(padded);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return new TextDecoder().decode(bytes);
}

function bytesToHex(buffer: ArrayBuffer): string {
  return Array.from(new Uint8Array(buffer))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

function constantTimeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let mismatch = 0;
  for (let i = 0; i < a.length; i++) {
    mismatch |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return mismatch === 0;
}

async function signString(message: string, secret: string): Promise<string> {
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(`${SIGNING_SALT}:${secret}`),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const signature = await crypto.subtle.sign("HMAC", key, encoder.encode(message));
  return bytesToHex(signature);
}

export async function verifyPassword(candidate: string): Promise<boolean> {
  const expected = getConfiguredPassword();
  if (!expected) return true;
  // Hash both sides before constant-time comparison so length differences don't leak timing
  const [candSig, expSig] = await Promise.all([
    signString(candidate, expected),
    signString(expected, expected),
  ]);
  return constantTimeEqual(candSig, expSig);
}

export async function createSessionToken(): Promise<string> {
  const secret = getConfiguredPassword();
  const now = Math.floor(Date.now() / 1000);
  const payload: SessionPayload = {
    v: 1,
    iat: now,
    exp: now + SESSION_TTL_SECONDS,
  };
  const encoded = toBase64Url(JSON.stringify(payload));
  const sig = await signString(encoded, secret);
  return `${encoded}.${sig}`;
}

export async function verifySessionToken(token: string | undefined | null): Promise<boolean> {
  if (!isAuthEnabled()) return true;
  if (!token) return false;

  const dotIdx = token.indexOf(".");
  if (dotIdx <= 0) return false;

  const encoded = token.slice(0, dotIdx);
  const providedSig = token.slice(dotIdx + 1);
  if (!encoded || !providedSig) return false;

  try {
    const expectedSig = await signString(encoded, getConfiguredPassword());
    if (!constantTimeEqual(providedSig, expectedSig)) {
      return false;
    }

    const parsed = JSON.parse(fromBase64Url(encoded)) as Partial<SessionPayload>;
    if (parsed.v !== 1 || typeof parsed.exp !== "number") {
      return false;
    }

    const now = Math.floor(Date.now() / 1000);
    return parsed.exp > now;
  } catch {
    return false;
  }
}

export async function getAuthStatus(): Promise<{
  authenticated: boolean;
  devMode: boolean;
}> {
  if (!isAuthEnabled()) {
    return { authenticated: true, devMode: true };
  }

  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  const authenticated = await verifySessionToken(token);
  return { authenticated, devMode: false };
}

export function getSessionCookieOptions() {
  return {
    name: SESSION_COOKIE_NAME,
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_TTL_SECONDS,
  };
}
