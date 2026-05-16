import { describe, expect, it } from "vitest";
import { runCommand } from "./commands.js";

describe("CLI commands", () => {
  it("returns status summary with app name and wiki document count", () => {
    const result = runCommand(["status"]);

    expect(result.exitCode).toBe(0);
    expect(result.stdout).toContain("JH Dev Nexus Harness");
    expect(result.stdout).toContain("LLM Wiki docs: 7");
    expect(result.stdout).toContain("Mode: JH Goal Mode");
    expect(result.stdout).toContain("Goal Mode active: true");
  });

  it("returns menu ids for menu command", () => {
    const result = runCommand(["menu"]);

    expect(result.exitCode).toBe(0);
    expect(result.stdout).toContain("dashboard");
    expect(result.stdout).toContain("discord");
    expect(result.stdout).toContain("external-mobile");
    expect(result.stdout).toContain("session-handoff");
    expect(result.stdout).toContain("tmux-2x2");
  });

  it("returns Nexus module registry summary without exposing secrets", () => {
    const result = runCommand(["modules"]);

    expect(result.exitCode).toBe(0);
    expect(result.stdout).toContain("total=14");
    expect(result.stdout).toContain("mvpReady=");
    expect(result.stdout).toContain("module=goal-mode policy=mvp role=orchestration-core");
    expect(result.stdout).toContain("module=agent-room policy=adapter-only role=collaboration-module");
    expect(result.stdout).not.toContain("sk-");
    expect(result.stdout).not.toContain("token=");
  });

  it("returns registered mobile connectors", () => {
    const result = runCommand(["mobile"]);

    expect(result.exitCode).toBe(0);
    expect(result.stdout).toContain("telegram");
    expect(result.stdout).toContain("discord");
    expect(result.stdout).toContain("shell:execute=false");
  });

  it("returns mobile notification readiness without secret values", () => {
    const result = runCommand(["mobile:status"]);

    expect(result.exitCode).toBe(0);
    expect(result.stdout).toContain("telegram ready=false");
    expect(result.stdout).toContain("discord ready=false");
    expect(result.stdout).toContain("missing=TELEGRAM_BOT_TOKEN,TELEGRAM_ALLOWED_CHAT_IDS");
    expect(result.stdout).toContain("missing=DISCORD_WEBHOOK_URL,DISCORD_ALLOWED_CHANNEL_IDS");
    expect(result.stdout).not.toContain("sk-");
  });

  it("returns provider registry without secret values", () => {
    const result = runCommand(["provider"]);

    expect(result.exitCode).toBe(0);
    expect(result.stdout).toContain("openai");
    expect(result.stdout).toContain("anthropic");
    expect(result.stdout).toContain("OPENAI_API_KEY");
    expect(result.stdout).toContain("ANTHROPIC_API_KEY");
    expect(result.stdout).toContain("secret:read=false");
    expect(result.stdout).not.toContain("sk-");
  });

  it("returns provider dry-run status without calling network", () => {
    const result = runCommand(["provider:dry-run", "openai", "prompt:generate"], { env: {} });

    expect(result.exitCode).toBe(0);
    expect(result.stdout).toContain("provider=openai");
    expect(result.stdout).toContain("capability=prompt:generate");
    expect(result.stdout).toContain("network=not-called");
    expect(result.stdout).toContain("missing=OPENAI_API_KEY");
    expect(result.stdout).not.toContain("sk-");
  });

  it("rejects provider dry-run for blocked capabilities", () => {
    const result = runCommand(["provider:dry-run", "anthropic", "production:deploy"]);

    expect(result.exitCode).toBe(1);
    expect(result.stdout).toContain("network=not-called");
    expect(result.stderr).toContain("Capability production:deploy is not allowed for provider anthropic.");
  });

  it("rejects provider dry-run for unknown providers with a clear message", () => {
    const result = runCommand(["provider:dry-run", "unknown", "prompt:generate"], {
      env: {
        OPENAI_API_KEY: "sk-secret-value"
      }
    });

    expect(result.exitCode).toBe(1);
    expect(result.stdout).toContain("provider=unknown");
    expect(result.stdout).toContain("network=not-called");
    expect(result.stderr).toContain("Unknown provider: unknown.");
    expect(result.stdout).not.toContain("sk-secret-value");
    expect(result.stderr).not.toContain("sk-secret-value");
  });

  it("returns provider runtime request plan without exposing secret values", () => {
    const result = runCommand(["provider:runtime-plan", "openai", "prompt:generate", "Summarize status"], {
      env: {
        OPENAI_API_KEY: "sk-secret-value"
      }
    });

    expect(result.exitCode).toBe(0);
    expect(result.stdout).toContain("provider=openai");
    expect(result.stdout).toContain("capability=prompt:generate");
    expect(result.stdout).toContain("network=ready-to-call");
    expect(result.stdout).toContain("url=https://api.openai.com/v1/responses");
    expect(result.stdout).toContain("authorizationEnv=OPENAI_API_KEY");
    expect(result.stdout).not.toContain("sk-secret-value");
  });

  it("returns dry-run preview check for local URLs", () => {
    const result = runCommand(["preview", "http://127.0.0.1:3100"]);

    expect(result.exitCode).toBe(0);
    expect(result.stdout).toContain("url=http://127.0.0.1:3100/");
    expect(result.stdout).toContain("mode=dry-run");
    expect(result.stdout).toContain("network:not-called");
    expect(result.stdout).toContain("next=npm run preview:check");
    expect(result.stdout).toContain("summary=capture-summary");
  });

  it("rejects non-local preview URLs", () => {
    const result = runCommand(["preview", "https://example.com"]);

    expect(result.exitCode).toBe(1);
    expect(result.stderr).toContain("Only localhost or 127.0.0.1 preview URLs are allowed.");
  });

  it("returns preview capture command plan for local URLs", () => {
    const result = runCommand(["preview:capture", "http://127.0.0.1:3100"]);

    expect(result.exitCode).toBe(0);
    expect(result.stdout).toContain("url=http://127.0.0.1:3100/");
    expect(result.stdout).toContain("screenshot=");
    expect(result.stdout).toContain("command=node dist/scripts/preview-capture.js");
  });

  it("returns all-viewport preview capture command plan for local URLs", () => {
    const result = runCommand(["preview:capture:all", "http://127.0.0.1:3100"]);

    expect(result.exitCode).toBe(0);
    expect(result.stdout).toContain("url=http://127.0.0.1:3100/");
    expect(result.stdout).toContain("desktop=output/playwright/goal-mode-desktop.png");
    expect(result.stdout).toContain("mobile=output/playwright/goal-mode-mobile.png");
    expect(result.stdout).toContain("command=npm run preview:capture:all");
  });

  it("returns preview check command plan", () => {
    const result = runCommand(["preview:check"]);

    expect(result.exitCode).toBe(0);
    expect(result.stdout).toContain("command=npm run preview:check");
    expect(result.stdout).toContain("validationLog=llm-wiki/validation-log.md");
    expect(result.stdout).toContain("summary=capture-summary");
  });

  it("returns a safe session handoff command plan without writing secrets", () => {
    const result = runCommand(["session:handoff"]);

    expect(result.exitCode).toBe(0);
    expect(result.stdout).toContain("module=session-handoff");
    expect(result.stdout).toContain("wiki=llm-wiki/session-brief.md,llm-wiki/handoff-prompt.md,llm-wiki/current-state.md,llm-wiki/validation-log.md");
    expect(result.stdout).toContain("command=npm.cmd run wiki:check");
    expect(result.stdout).toContain("save-codex-session.ps1");
    expect(result.stdout).toContain("nextSessionPrompt=");
    expect(result.stdout).not.toContain("sk-");
    expect(result.stdout).not.toContain("token=");
  });

  it("builds session handoff from supplied current session context", () => {
    const result = runCommand(["session:handoff"], {
      sessionContext: {
        currentStateText: ["## Latest Completed Work", "- Added context collector"].join("\n"),
        handoffText: ["## Next Work", "- Wire collector into CLI"].join("\n"),
        validationLogText: ["## Preview Check", "- command: `npm.cmd run preview:check`", "- status: PASS"].join("\n"),
        gitStatusText: " M apps/cli/src/commands.ts"
      }
    });

    expect(result.exitCode).toBe(0);
    expect(result.stdout).toContain("Added context collector");
    expect(result.stdout).toContain("Wire collector into CLI");
    expect(result.stdout).toContain("npm.cmd run preview:check");
    expect(result.stdout).toContain("apps/cli/src/commands.ts");
  });

  it("generates JH Goal Mode prompts from CLI args", () => {
    const result = runCommand(["goal", "Add provider adapter tests"]);

    expect(result.exitCode).toBe(0);
    expect(result.stdout).toContain("/goal");
    expect(result.stdout).toContain("You are operating in JH Goal Mode.");
    expect(result.stdout).toContain("Recommended Route");
  });

  it("rejects blank JH Goal Mode generation", () => {
    const result = runCommand(["goal", "   "]);

    expect(result.exitCode).toBe(1);
    expect(result.stderr).toContain("Task request is required.");
  });

  it("rejects unknown commands safely", () => {
    const result = runCommand(["shell", "rm", "-rf"]);

    expect(result.exitCode).toBe(1);
    expect(result.stderr).toContain("Unknown command");
  });
});
