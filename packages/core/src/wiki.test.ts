import { describe, expect, it } from "vitest";
import { getRequiredWikiDocuments } from "./wiki.js";

describe("LLM Wiki documents", () => {
  it("requires a compact session brief so agents do not need to reread long logs", () => {
    expect(getRequiredWikiDocuments()).toContain("session-brief.md");
  });
});
