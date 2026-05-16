import { describe, expect, it } from "vitest";
import { getNexusModules, getNexusModuleSummary } from "./nexus-modules.js";

describe("Nexus module registry", () => {
  it("defines the installable AI development OS modules from the master prompt", () => {
    const modules = getNexusModules();

    expect(modules.map((module) => module.id)).toEqual([
      "goal-mode",
      "session-handoff",
      "llm-wiki",
      "providers",
      "telegram-mobile",
      "github",
      "obsidian",
      "preview-check",
      "plugin-system",
      "skill-registry",
      "ide-adapters",
      "tmux-grid",
      "templates",
      "agent-room"
    ]);
    expect(modules.every((module) => module.owner === "codex")).toBe(true);
    expect(modules.find((module) => module.id === "providers")?.blockedActions).toContain("secret exposure");
    expect(modules.find((module) => module.id === "ide-adapters")?.mvpPolicy).toBe("adapter-only");
    expect(modules.find((module) => module.id === "agent-room")?.role).toBe("collaboration-module");
  });

  it("summarizes module readiness without exposing secrets or claiming risky automation", () => {
    const summary = getNexusModuleSummary();

    expect(summary.total).toBe(14);
    expect(summary.mvpReady).toBeGreaterThan(0);
    expect(summary.enabled).toBeGreaterThan(0);
    expect(summary.configured).toBeGreaterThan(0);
    expect(summary.ready).toBeGreaterThan(0);
    expect(summary.needsConfiguration).toBeGreaterThan(0);
    expect(summary.disabled).toBeGreaterThanOrEqual(0);
    expect(summary.blockedActions).toContain("unlimited command execution");
    expect(JSON.stringify(summary)).not.toContain("API_KEY=");
    expect(JSON.stringify(summary)).not.toContain("token=");
  });

  it("tracks operational status for each module without exposing secret values", () => {
    const modules = getNexusModules();

    expect(
      modules.every(
        (module) =>
          typeof module.enabled === "boolean" &&
          typeof module.configured === "boolean" &&
          Array.isArray(module.missingRequirements) &&
          ["ready", "needs-configuration", "disabled"].includes(module.status)
      )
    ).toBe(true);
    expect(modules.find((module) => module.id === "goal-mode")).toMatchObject({
      enabled: true,
      configured: true,
      status: "ready",
      missingRequirements: []
    });
    expect(modules.find((module) => module.id === "plugin-system")).toMatchObject({
      enabled: false,
      configured: false,
      status: "disabled"
    });
    expect(modules.find((module) => module.id === "providers")?.missingRequirements).toEqual([
      "OPENAI_API_KEY or ANTHROPIC_API_KEY"
    ]);
    expect(JSON.stringify(modules)).not.toContain("sk-secret-value");
    expect(JSON.stringify(modules)).not.toContain("token=");
  });
});
