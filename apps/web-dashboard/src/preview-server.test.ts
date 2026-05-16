import { describe, expect, it } from "vitest";
import {
  createPreviewServerConfig,
  getContentType,
  readMobileReadinessJson,
  readSessionHandoffJson,
  readProviderReadinessJson,
  readRecentValidationResults,
  resolvePreviewArtifact,
  resolvePreviewAsset
} from "./preview-server.js";

describe("web dashboard preview server", () => {
  it("creates a localhost-only preview server config", () => {
    const config = createPreviewServerConfig();

    expect(config.host).toBe("127.0.0.1");
    expect(config.port).toBe(3100);
    expect(config.rootDir.endsWith("apps\\web-dashboard") || config.rootDir.endsWith("apps/web-dashboard")).toBe(true);
  });

  it("resolves root path to index.html", () => {
    const resolved = resolvePreviewAsset("/", "D:/workspace/apps/web-dashboard");

    expect(resolved.ok).toBe(true);
    expect(resolved.filePath.endsWith("index.html")).toBe(true);
  });

  it("blocks path traversal outside dashboard root", () => {
    const resolved = resolvePreviewAsset("/../package.json", "D:/workspace/apps/web-dashboard");

    expect(resolved.ok).toBe(false);
    if (resolved.ok) throw new Error("Expected traversal to be blocked");
    expect(resolved.error).toBe("Preview asset path is outside dashboard root.");
  });

  it("returns content types for dashboard assets", () => {
    expect(getContentType("index.html")).toBe("text/html; charset=utf-8");
    expect(getContentType("styles.css")).toBe("text/css; charset=utf-8");
    expect(getContentType("goal-mode.js")).toBe("text/javascript; charset=utf-8");
    expect(getContentType("goal-mode.png")).toBe("image/png");
  });

  it("resolves playwright artifacts under output/playwright only", () => {
    const resolved = resolvePreviewArtifact("/artifacts/playwright/goal-mode-mobile.png", "D:/workspace/output/playwright");

    expect(resolved.ok).toBe(true);
    expect(resolved.filePath.endsWith("goal-mode-mobile.png")).toBe(true);
  });

  it("blocks artifact path traversal", () => {
    const resolved = resolvePreviewArtifact("/artifacts/playwright/../secret.txt", "D:/workspace/output/playwright");

    expect(resolved.ok).toBe(false);
    if (resolved.ok) throw new Error("Expected artifact traversal to be blocked");
    expect(resolved.error).toBe("Preview artifact path is outside output/playwright.");
  });

  it("reads the latest preview check validation entries for dashboard display", () => {
    const log = [
      "# 검증 기록",
      "",
      "## 2026-05-15T17:31:25.225Z Preview Check 자동 기록",
      "- 명령: `npm run preview:check`",
      "- 결과: PASS.",
      "- 상세:",
      "  - viewport=desktop",
      "  - screenshot=output/playwright/goal-mode-desktop.png",
      "  - consoleErrors=0",
      "  - viewport=mobile",
      "  - screenshot=output/playwright/goal-mode-mobile.png",
      "  - consoleErrors=0",
      "",
      "## 2026-05-15T17:32:43.018Z Preview Check 자동 기록",
      "- 명령: `npm run preview:check`",
      "- 결과: PASS.",
      "- 상세:",
      "  - viewport=desktop",
      "  - screenshot=output/playwright/goal-mode-desktop.png",
      "  - consoleErrors=0"
    ].join("\n");

    const results = readRecentValidationResults(log, 1);

    expect(results).toEqual([
      {
        title: "2026-05-15T17:32:43.018Z Preview Check 자동 기록",
        command: "npm run preview:check",
        status: "PASS",
        details: [
          "viewport=desktop",
          "screenshot=output/playwright/goal-mode-desktop.png",
          "consoleErrors=0"
        ]
      }
    ]);
  });

  it("builds mobile readiness JSON without exposing secret values", () => {
    const json = readMobileReadinessJson({
      TELEGRAM_BOT_TOKEN: "telegram-secret",
      TELEGRAM_ALLOWED_CHAT_IDS: "123",
      DISCORD_WEBHOOK_URL: "",
      DISCORD_ALLOWED_CHANNEL_IDS: undefined
    });

    expect(JSON.parse(json)).toEqual({
      connectors: [
        { connectorId: "telegram", ready: true, missingSecrets: [] },
        {
          connectorId: "discord",
          ready: false,
          missingSecrets: ["DISCORD_WEBHOOK_URL", "DISCORD_ALLOWED_CHANNEL_IDS"]
        }
      ]
    });
    expect(json).not.toContain("telegram-secret");
    expect(json).not.toContain("123");
  });

  it("builds provider readiness JSON without exposing secret values or calling network", () => {
    const json = readProviderReadinessJson({
      OPENAI_API_KEY: "sk-secret-value",
      ANTHROPIC_API_KEY: ""
    });

    expect(JSON.parse(json)).toEqual({
      providers: [
        {
          ok: true,
          providerId: "openai",
          capability: "prompt:generate",
          ready: true,
          missingEnv: [],
          network: "not-called",
          errors: []
        },
        {
          ok: true,
          providerId: "anthropic",
          capability: "prompt:generate",
          ready: false,
          missingEnv: ["ANTHROPIC_API_KEY"],
          network: "not-called",
          errors: []
        }
      ]
    });
    expect(json).not.toContain("sk-secret-value");
  });

  it("builds session handoff JSON for dashboard commands without exposing secrets", () => {
    const json = readSessionHandoffJson();
    const payload = JSON.parse(json);

    expect(payload.moduleId).toBe("session-handoff");
    expect(payload.wikiUpdates).toContain("llm-wiki/handoff-prompt.md");
    expect(payload.commands).toContain("npm.cmd run wiki:check");
    expect(payload.commands.join("\n")).toContain("save-codex-session.ps1");
    expect(payload.nextSessionPrompt).toContain("작업 이어서 재개");
    expect(json).not.toContain("sk-secret-value");
    expect(json).not.toContain("token=");
  });

  it("builds session handoff JSON from current session context", () => {
    const json = readSessionHandoffJson({
      currentStateText: ["## Latest Completed Work", "- Added dashboard context handoff"].join("\n"),
      handoffText: ["## Next Work", "- Inspect handoff panel"].join("\n"),
      validationLogText: ["## Preview Check", "- command: `npm.cmd run preview:check`", "- status: PASS"].join("\n"),
      gitStatusText: " M apps/web-dashboard/src/preview-server.ts"
    });

    const payload = JSON.parse(json);

    expect(payload.nextSessionPrompt).toContain("Added dashboard context handoff");
    expect(payload.nextSessionPrompt).toContain("Inspect handoff panel");
    expect(payload.nextSessionPrompt).toContain("npm.cmd run preview:check");
    expect(payload.nextSessionPrompt).toContain("apps/web-dashboard/src/preview-server.ts");
  });
});
