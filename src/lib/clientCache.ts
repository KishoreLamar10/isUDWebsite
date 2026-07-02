'use client';

// In-memory, per-tab cache for client-fetched data. Lives only as long as the
// JS runtime does (cleared on hard refresh or sign-out), so it never needs to
// persist across users on a shared machine.
const cache = new Map<string, unknown>();

export function getCached<T>(key: string): T | undefined {
  return cache.get(key) as T | undefined;
}

export function setCached<T>(key: string, data: T) {
  cache.set(key, data);
}

export function clearClientCache() {
  cache.clear();
}
