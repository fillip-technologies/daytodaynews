// Unsaved article edits, kept in this browser so a refresh, a crash or a failed
// save never loses what was typed. One draft per article ("new" for a story
// not created yet). Storage can be missing or full (private windows), so every
// access is guarded and the editor works without it.

const PREFIX = "dtn:article-draft:";

export type StoredDraft<T> = { savedAt: number; values: T };

export const draftKey = (articleId?: string) => `${PREFIX}${articleId || "new"}`;

export function readDraft<T>(key: string): StoredDraft<T> | null {
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return null;
    const draft = JSON.parse(raw) as Partial<StoredDraft<T>>;
    return typeof draft.savedAt === "number" && draft.values && typeof draft.values === "object"
      ? (draft as StoredDraft<T>)
      : null;
  } catch {
    return null;
  }
}

/** Saves the values (already JSON). False when the browser refused. */
export function writeDraft(key: string, valuesJson: string): boolean {
  try {
    window.localStorage.setItem(key, `{"savedAt":${Date.now()},"values":${valuesJson}}`);
    return true;
  } catch {
    return false;
  }
}

export function clearDraft(key: string) {
  try {
    window.localStorage.removeItem(key);
  } catch {
    // Nothing stored, or storage unavailable.
  }
}

/** A readable reason a save request failed before the server could answer. */
export function saveFailureMessage(error: unknown): string {
  const message = error instanceof Error ? error.message : String(error);
  const kept = "Your changes are kept in this browser, so nothing is lost.";
  if (/failed to find server action|older or newer deployment/i.test(message)) {
    return `The site was updated while this page was open. ${kept} Refresh the page (your changes come back) and save again.`;
  }
  if (/unexpected response/i.test(message)) {
    return `The server gave an unexpected answer: usually the login expired or the server was restarting. ${kept} Open the admin in a new tab, log in if asked, then come back and save again.`;
  }
  if (/body exceeded|payload too large|413/i.test(message)) {
    return `The article is too large to send in one go. ${kept} Remove very long pasted content and try again.`;
  }
  if (/failed to fetch|networkerror|network request failed|load failed/i.test(message)) {
    return `Could not reach the server (internet or server down). ${kept} Try Save again in a moment.`;
  }
  return `Could not save: ${message || "unknown error"}. ${kept}`;
}
