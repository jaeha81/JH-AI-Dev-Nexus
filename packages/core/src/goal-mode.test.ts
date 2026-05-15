import { describe, expect, it } from "vitest";
import { classifyGoalTask, createGoalModeStatus, generateGoalModePackage, validateGoalInput } from "./goal-mode.js";

describe("JH Goal Mode", () => {
  it("rejects blank task ideas", () => {
    const result = validateGoalInput({ task: "   " });

    expect(result.ok).toBe(false);
    if (result.ok) throw new Error("Expected validation failure");
    expect(result.error).toBe("Task request is required.");
  });

  it("classifies task requests into practical work categories", () => {
    expect(classifyGoalTask("Fix API route failing when database row is missing")).toBe("bug fix");
    expect(classifyGoalTask("Improve mobile button spacing and dark mode layout")).toBe("UI/UX");
    expect(classifyGoalTask("Write README docs and verification checklist")).toBe("documentation");
  });

  it("generates Codex and Claude Goal Mode prompts with required starts", () => {
    const result = generateGoalModePackage({
      task: "Add Telegram login status panel with tests",
      projectName: "JH Dev Nexus",
      targetFolder: "apps/web-dashboard",
      allowedScope: "Goal Mode and dashboard only",
      forbiddenActions: "No production deploy, no secret exposure",
      verificationCommands: ["npm run typecheck", "npm test"],
      riskLevel: "medium",
      strictVerification: true,
      safeMode: true
    });

    expect(result.codexPrompt.startsWith("/goal\n\n")).toBe(true);
    expect(result.claudePrompt.startsWith("You are operating in JH Goal Mode.")).toBe(true);
    expect(result.codexPrompt).toContain("Objective");
    expect(result.codexPrompt).toContain("Stop Condition");
    expect(result.claudePrompt).toContain("Before You Edit");
    expect(result.recommendedRoute).toBe("Codex -> Claude Review");
    expect(result.verificationChecklist).toContain("Run npm run typecheck");
    expect(result.verificationChecklist).toContain("Run npm test");
    expect(result.warnings).toContain("Safe mode active: destructive and production-related instructions are blocked.");
  });

  it("warns for sensitive or destructive task content", () => {
    const result = generateGoalModePackage({
      task: "Delete production database rows and rotate API keys",
      projectName: "JH Dev Nexus",
      targetFolder: "packages/core",
      allowedScope: "planning only",
      forbiddenActions: "No production data access",
      verificationCommands: ["npm test"],
      riskLevel: "high",
      strictVerification: true,
      safeMode: true
    });

    expect(result.riskIndicators).toContain("secrets/API keys");
    expect(result.riskIndicators).toContain("production/deployment");
    expect(result.riskIndicators).toContain("database deletion");
    expect(result.stopCondition).toContain("missing secrets");
  });

  it("exposes active operating status for ongoing development", () => {
    const status = createGoalModeStatus({
      activeTask: "Connect preview check notifications",
      phase: "verification"
    });

    expect(status.mode).toBe("JH Goal Mode");
    expect(status.active).toBe(true);
    expect(status.activeTask).toBe("Connect preview check notifications");
    expect(status.phase).toBe("verification");
    expect(status.rules).toContain("TDD first");
    expect(status.rules).toContain("Report progress without pausing unless user approval is required");
  });
});
