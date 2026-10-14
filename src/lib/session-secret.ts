// Signing key for admin session tokens, shared by lib/auth (server) and the
// proxy (src/middleware.ts). Kept free of Node-only imports so both can use it.

const MIN_LENGTH = 32;

let key: Uint8Array | undefined;

/**
 * The HMAC key for session JWTs. There is deliberately no fallback: a default
 * written in the source would let anyone who has the code forge an admin
 * session, so a missing or short JWT_SECRET is a configuration error.
 */
export function getJwtSecret(): Uint8Array {
  if (key) return key;
  const secret = process.env.JWT_SECRET ?? "";
  if (secret.length < MIN_LENGTH) {
    throw new Error(
      `JWT_SECRET must be a random value of at least ${MIN_LENGTH} characters (e.g. \`openssl rand -base64 48\`).`,
    );
  }
  key = new TextEncoder().encode(secret);
  return key;
}
