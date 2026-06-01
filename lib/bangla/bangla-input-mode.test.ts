import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  banglaInputModeStorageKey,
  getBanglaInputMode,
  setBanglaInputMode
} from "./bangla-input-mode";

class MemoryStorage {
  private values = new Map<string, string>();

  getItem(key: string) {
    return this.values.get(key) ?? null;
  }

  setItem(key: string, value: string) {
    this.values.set(key, value);
  }
}

describe("bangla input mode", () => {
  it("defaults to unicode", () => {
    assert.equal(getBanglaInputMode(null), "unicode");
    assert.equal(getBanglaInputMode(new MemoryStorage()), "unicode");
  });

  it("persists bijoy mode in localStorage", () => {
    const storage = new MemoryStorage();

    setBanglaInputMode("bijoy", storage);

    assert.equal(storage.getItem(banglaInputModeStorageKey), "bijoy");
    assert.equal(getBanglaInputMode(storage), "bijoy");
  });
});
