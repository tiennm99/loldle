import { beforeEach, vi } from "vitest";

/**
 * Minimal spec-shaped localStorage stub.
 * `key(i)` and `length` are required: clearExpiredCache iterates by index.
 */
class LocalStorageStub {
  #store = new Map();

  get length() {
    return this.#store.size;
  }

  key(i) {
    return [...this.#store.keys()][i] ?? null;
  }

  getItem(k) {
    return this.#store.has(k) ? this.#store.get(k) : null;
  }

  setItem(k, v) {
    this.#store.set(k, String(v));
  }

  removeItem(k) {
    this.#store.delete(k);
  }

  clear() {
    this.#store.clear();
  }
}

beforeEach(() => {
  vi.stubGlobal("localStorage", new LocalStorageStub());
});
