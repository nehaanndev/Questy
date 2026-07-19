import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";
import { afterEach } from "vitest";

// Node 25 can expose a non-Web-Storage localStorage stub inside jsdom.
// Keep browser behavior intact while giving tests the standard storage contract.
if (typeof window !== "undefined" && typeof window.localStorage?.clear !== "function") {
  const entries = new Map<string, string>();
  Object.defineProperty(window, "localStorage", {
    configurable: true,
    value: {
      clear: () => entries.clear(),
      getItem: (key: string) => entries.get(key) ?? null,
      key: (index: number) => [...entries.keys()][index] ?? null,
      removeItem: (key: string) => entries.delete(key),
      setItem: (key: string, value: string) => entries.set(key, String(value)),
      get length() { return entries.size; },
    },
  });
}

afterEach(() => cleanup());
