// Tiny typed localStorage helper used by the mock data layer and persisted stores.
// SSR/Node-safe (returns fallback when window is unavailable).

export function readJSON<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    return raw == null ? fallback : (JSON.parse(raw) as T);
  } catch {
    return fallback;
  }
}

export function writeJSON<T>(key: string, value: T): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* quota / serialization errors are non-fatal for a prototype */
  }
}

export function removeKey(key: string): void {
  if (typeof window === 'undefined') return;
  window.localStorage.removeItem(key);
}

export const STORAGE_KEYS = {
  materials: 'reframe.materials',
  quotes: 'reframe.quotes',
  users: 'reframe.users',
  session: 'reframe.session',
  scene: 'reframe.scene',
  palette: 'reframe.palette',
  cart: 'reframe.cart',
} as const;
