// Input checks for the public forms (contact, pitch, newsletter). Everything
// from a reader is untrusted: trim it, cap its length and check its format
// before it reaches the database or an email.

const EMAIL = /^[^\s@<>()[\]\\,;:"]+@[^\s@<>()[\]\\,;:"]+\.[^\s@<>()[\]\\,;:"]{2,}$/;

/** Removes control characters (keeping newlines and tabs) and trims. */
export function cleanText(value: unknown, maxLength: number): string {
  if (typeof value !== "string") return "";
  return value.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, "").trim().slice(0, maxLength);
}

/** A single-line value: control characters and line breaks removed (safe for email subjects). */
export function cleanLine(value: unknown, maxLength: number): string {
  return cleanText(value, maxLength).replace(/[\r\n\t]+/g, " ");
}

export function isEmail(value: string): boolean {
  return value.length <= 254 && EMAIL.test(value);
}

export function cleanEmail(value: unknown): string | null {
  const email = cleanLine(value, 254).toLowerCase();
  return isEmail(email) ? email : null;
}

/** An absolute http(s) URL, or null. */
export function cleanHttpUrl(value: unknown, maxLength = 2048): string | null {
  const text = cleanLine(value, maxLength);
  if (!text) return null;
  try {
    const url = new URL(text);
    return url.protocol === "https:" || url.protocol === "http:" ? url.toString() : null;
  } catch {
    return null;
  }
}

export const FORM_LIMITS = {
  name: 100,
  subject: 150,
  topic: 100,
  idea: 200,
  message: 5000,
} as const;
