import { Langfuse } from "langfuse";

let _langfuse: Langfuse | null = null;

/**
 * Returns a singleton Langfuse client, or null if credentials are not configured.
 * Safe to call in any environment — returns null when keys are absent.
 */
export function getLangfuse(): Langfuse | null {
  if (!process.env.LANGFUSE_PUBLIC_KEY || !process.env.LANGFUSE_SECRET_KEY) {
    return null;
  }
  try {
    if (!_langfuse) {
      _langfuse = new Langfuse({
        publicKey: process.env.LANGFUSE_PUBLIC_KEY,
        secretKey: process.env.LANGFUSE_SECRET_KEY,
        baseUrl: process.env.LANGFUSE_HOST || "https://cloud.langfuse.com",
      });
    }
    return _langfuse;
  } catch {
    return null;
  }
}

/** Reset the singleton — for testing only. */
export function _resetLangfuseClient(): void {
  _langfuse = null;
}
