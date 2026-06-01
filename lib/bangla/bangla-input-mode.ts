"use client";

import { useCallback, useSyncExternalStore } from "react";

export const banglaInputModeStorageKey = "banglaInputMode";
export const defaultBanglaInputMode = "unicode";
export const banglaInputModeChangeEvent = "bangla-input-mode-change";

export const banglaInputModes = ["unicode", "bijoy"] as const;

export type BanglaInputMode = (typeof banglaInputModes)[number];

type StorageLike = Pick<Storage, "getItem" | "setItem">;

export function isBanglaInputMode(value: unknown): value is BanglaInputMode {
  return value === "unicode" || value === "bijoy";
}

function browserStorage(): StorageLike | null {
  if (typeof window === "undefined") return null;

  try {
    return window.localStorage;
  } catch {
    return null;
  }
}

export function getBanglaInputMode(
  storage: StorageLike | null = browserStorage()
): BanglaInputMode {
  if (!storage) return defaultBanglaInputMode;

  try {
    const storedMode = storage.getItem(banglaInputModeStorageKey);
    return isBanglaInputMode(storedMode) ? storedMode : defaultBanglaInputMode;
  } catch {
    return defaultBanglaInputMode;
  }
}

export function setBanglaInputMode(
  mode: BanglaInputMode,
  storage: StorageLike | null = browserStorage()
) {
  if (storage) {
    storage.setItem(banglaInputModeStorageKey, mode);
  }

  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent(banglaInputModeChangeEvent, { detail: mode }));
  }

  return mode;
}

function subscribeToBanglaInputMode(listener: () => void) {
  if (typeof window === "undefined") return () => {};

  window.addEventListener("storage", listener);
  window.addEventListener(banglaInputModeChangeEvent, listener);

  return () => {
    window.removeEventListener("storage", listener);
    window.removeEventListener(banglaInputModeChangeEvent, listener);
  };
}

export function useBanglaInputMode() {
  const mode = useSyncExternalStore(
    subscribeToBanglaInputMode,
    () => getBanglaInputMode(),
    () => defaultBanglaInputMode
  );
  const setMode = useCallback((nextMode: BanglaInputMode) => {
    setBanglaInputMode(nextMode);
  }, []);

  return [mode, setMode] as const;
}
