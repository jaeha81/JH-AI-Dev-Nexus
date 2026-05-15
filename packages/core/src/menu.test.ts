import { describe, expect, it } from "vitest";
import { getHarnessMenu } from "./menu.js";

describe("harness menu", () => {
  it("exposes MVP and extension menu groups without duplicate ids", () => {
    const menu = getHarnessMenu();
    const ids = menu.map((item) => item.id);

    expect(ids).toContain("dashboard");
    expect(ids).toContain("jh-goal-mode");
    expect(ids).toContain("telegram");
    expect(ids).toContain("discord");
    expect(ids).toContain("external-mobile");
    expect(ids).toContain("llm-providers");
    expect(ids).toContain("github");
    expect(ids).toContain("obsidian-llm-wiki");
    expect(ids).toContain("preview-errors");
    expect(ids).toContain("tmux-2x2");
    expect(new Set(ids).size).toBe(ids.length);
  });
});
