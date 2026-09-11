/** Generates a unique identifier for a new resume item. */
export function newId(): string {
  return crypto.randomUUID();
}
