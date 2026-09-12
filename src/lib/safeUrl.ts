const ALLOWED_PROTOCOLS = ["http:", "https:", "mailto:"];
const HAS_SCHEME = /^[a-z][a-z0-9+.-]*:/i;

/**
 * Normalizes a user-typed URL into an href that is safe to put in the resume
 * document, or null when it cannot be one. Bare hosts ("cvpeers.com") are
 * assumed https; anything outside the allowed protocols — javascript:, data:,
 * file: — is refused so committed data can never turn into a script sink.
 * Parsing with URL (rather than matching strings) closes the tab/newline
 * bypasses, which the parser strips before the protocol is read.
 */
export function toSafeHref(rawUrl: string): string | null {
  const trimmed = rawUrl.trim();
  if (trimmed.length === 0) return null;
  const candidate = HAS_SCHEME.test(trimmed) ? trimmed : `https://${trimmed}`;
  let parsed: URL;
  try {
    parsed = new URL(candidate);
  } catch {
    return null;
  }
  if (!ALLOWED_PROTOCOLS.includes(parsed.protocol)) return null;
  return parsed.href;
}
