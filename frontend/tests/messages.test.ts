import { describe, expect, it } from "vitest";

import en from "../messages/en.json";
import hi from "../messages/hi.json";
import te from "../messages/te.json";

function paths(value: unknown, prefix = ""): string[] {
  if (typeof value !== "object" || value === null) {
    return [prefix];
  }

  return Object.entries(value).flatMap(([key, child]) =>
    paths(child, prefix ? `${prefix}.${key}` : key),
  );
}

describe("translation catalogs", () => {
  it.each([
    ["Hindi", hi],
    ["Telugu", te],
  ])(
    "keeps %s keys aligned with English",
    (_language: string, messages: unknown) => {
      expect(paths(messages).sort()).toEqual(paths(en).sort());
    },
  );
});
