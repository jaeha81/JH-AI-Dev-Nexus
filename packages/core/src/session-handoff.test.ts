import { describe, expect, it } from "vitest";
import { createSessionHandoffPlan, createSessionHandoffPrompt } from "./session-handoff.js";

describe("Session Handoff module", () => {
  it("creates a safe session handoff plan with wiki and Obsidian commands", () => {
    const plan = createSessionHandoffPlan({
      productName: "JH AI Dev Nexus",
      completedWork: ["Added Session Handoff tests"],
      pendingWork: ["Implement Session Handoff module"],
      validationCommands: ["npm.cmd test"],
      changedFiles: ["packages/core/src/session-handoff.ts"]
    });

    expect(plan.moduleId).toBe("session-handoff");
    expect(plan.summary).toContain("JH AI Dev Nexus");
    expect(plan.wikiUpdates).toEqual([
      "llm-wiki/session-brief.md",
      "llm-wiki/handoff-prompt.md",
      "llm-wiki/current-state.md",
      "llm-wiki/validation-log.md"
    ]);
    expect(plan.commands).toContain("npm.cmd run wiki:check");
    expect(plan.commands).toContain(
      "powershell -ExecutionPolicy Bypass -File D:\\ai프로젝트\\JH-Agent-Room\\scripts\\save-codex-session.ps1"
    );
    expect(plan.nextSessionPrompt).toContain("작업 이어서 재개");
    expect(JSON.stringify(plan)).not.toContain("sk-");
    expect(JSON.stringify(plan)).not.toContain("token=");
  });

  it("generates a next-session prompt that preserves Dev Nexus identity", () => {
    const prompt = createSessionHandoffPrompt({
      productName: "JH AI Dev Nexus",
      completedWork: ["Session Handoff module planned"],
      pendingWork: ["Run full verification"],
      validationCommands: ["npm.cmd run typecheck", "npm.cmd test"],
      changedFiles: ["apps/cli/src/commands.ts"]
    });

    expect(prompt).toContain("본 프로그램은 JH AI Dev Nexus다");
    expect(prompt).toContain("Agent Room은 본체가 아니라 collaboration-module이다");
    expect(prompt).toContain("Session Handoff module planned");
    expect(prompt).toContain("Run full verification");
    expect(prompt).toContain("npm.cmd test");
  });
});
