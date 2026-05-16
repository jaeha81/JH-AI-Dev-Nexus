import { describe, expect, it } from "vitest";
import {
  createSessionHandoffInputFromContext,
  createSessionHandoffPlan,
  createSessionHandoffPrompt
} from "./session-handoff.js";

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

  it("collects handoff input from wiki context, validation logs, and git status text", () => {
    const input = createSessionHandoffInputFromContext({
      productName: "JH AI Dev Nexus",
      sessionBriefText: [
        "## Latest Completed Work",
        "- Captured session brief context"
      ].join("\n"),
      currentStateText: [
        "## Latest Completed Work",
        "- Added Session Handoff panel",
        "- Connected API exposure",
        "",
        "## Next Work",
        "- Connect handoff to validation logs"
      ].join("\n"),
      handoffText: [
        "## Remaining Required Verification",
        "- `npm.cmd run build`",
        "- `npm.cmd run wiki:check`"
      ].join("\n"),
      validationLogText: [
        "## 2026-05-16 Preview Check",
        "- command: `npm.cmd run preview:check`",
        "- status: PASS",
        "  - consoleErrors=0"
      ].join("\n"),
      gitStatusText: [
        " M packages/core/src/session-handoff.ts",
        "?? packages/core/src/session-handoff.test.ts",
        " M .env"
      ].join("\n")
    });

    expect(input.completedWork).toContain("Added Session Handoff panel");
    expect(input.completedWork).toContain("Captured session brief context");
    expect(input.pendingWork).toContain("Connect handoff to validation logs");
    expect(input.validationCommands).toEqual([
      "npm.cmd run build",
      "npm.cmd run wiki:check",
      "npm.cmd run preview:check"
    ]);
    expect(input.changedFiles).toEqual([
      "packages/core/src/session-handoff.ts",
      "packages/core/src/session-handoff.test.ts"
    ]);
  });

  it("keeps validation commands focused on the most recent entries", () => {
    const input = createSessionHandoffInputFromContext({
      productName: "JH AI Dev Nexus",
      validationLogText: Array.from({ length: 14 }, (_, index) => `- command: \`npm.cmd test -- file-${index}.test.ts\``).join(
        "\n"
      )
    });

    expect(input.validationCommands).toHaveLength(8);
    expect(input.validationCommands[0]).toBe("npm.cmd test -- file-6.test.ts");
    expect(input.validationCommands[7]).toBe("npm.cmd test -- file-13.test.ts");
  });
});
