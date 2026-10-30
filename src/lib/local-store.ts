import { useSyncExternalStore } from "react";

// Tiny localStorage store for per-browser conveniences (preferred agent, the
// Hold). Falls back to memory when the browser blocks storage, and notifies
// subscribers on writes from this tab and from other tabs.

const memory = new Map<string, string | null>();
const listeners = new Set<() => void>();

export function readLocal(key: string): string | null {
  try {
    return window.localStorage.getItem(key);
  } catch {
    return memory.get(key) ?? null;
  }
}

/** Returns false when the value could only be kept in memory. */
export function writeLocal(key: string, value: string | null): boolean {
  let persisted = true;
  try {
    if (value === null) window.localStorage.removeItem(key);
    else window.localStorage.setItem(key, value);
  } catch {
    persisted = false;
    memory.set(key, value);
  }
  listeners.forEach((listener) => listener());
  return persisted;
}

function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  window.addEventListener("storage", listener);
  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", listener);
  };
}

/** Current value of a key; `null` during server rendering and hydration. */
export function useLocalValue(key: string): string | null {
  return useSyncExternalStore(
    subscribe,
    () => readLocal(key),
    () => null,
  );
}

function probe(): boolean {
  try {
    const key = "marisship:probe";
    window.localStorage.setItem(key, key);
    window.localStorage.removeItem(key);
    return true;
  } catch {
    return false;
  }
}

const noop = () => () => {};

/** False when the browser blocks localStorage. */
export function useStorageAvailable(): boolean {
  return useSyncExternalStore(noop, probe, () => true);
}
