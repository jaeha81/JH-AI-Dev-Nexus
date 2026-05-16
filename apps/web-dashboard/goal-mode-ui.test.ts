import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("JH Goal Mode dashboard UI", () => {
  it("presents JH Dev Nexus as the installable AI development operating program", () => {
    const html = readFileSync("apps/web-dashboard/index.html", "utf8");
    const script = readFileSync("apps/web-dashboard/goal-mode.js", "utf8");

    expect(html).toContain("JH AI Dev Nexus");
    expect(html).toContain("AI Development Operating Program");
    expect(html).toContain('id="nexusModules"');
    expect(html).toContain('id="moduleSummary"');
    expect(html).toContain("Agent Room");
    expect(html).toContain("Session Handoff");
    expect(html).toContain("IDE Adapters");
    expect(html).toContain("tmux 2x2");
    expect(script).toContain("/api/modules");
    expect(script).toContain("loadNexusModules");
    expect(script).toContain("renderNexusModules");
    expect(script).toContain("renderStaticNexusModuleFallback");
    expect(script).toContain("content-type");
    expect(script).not.toContain("const nexusModules = [");
  });

  it("exposes task input, generated prompt outputs, copy buttons, and history areas", () => {
    const html = readFileSync("apps/web-dashboard/index.html", "utf8");

    expect(html).toContain("JH Goal Mode");
    expect(html).toContain("Goal Mode Active");
    expect(html).toContain('id="goalModeStatus"');
    expect(html).toContain('data-i18n="goalModeActive"');
    expect(html).toContain('id="languageSelect"');
    expect(html).toContain('value="ko" selected');
    expect(html).toContain('value="en"');
    expect(html).toContain('data-i18n="taskRequest"');
    expect(html).toContain('id="task"');
    expect(html).toContain('id="codexOutput"');
    expect(html).toContain('id="claudeOutput"');
    expect(html).toContain('data-copy="codexOutput"');
    expect(html).toContain('data-copy="claudeOutput"');
    expect(html).toContain('id="history"');
    expect(html).toContain('id="previewArtifacts"');
    expect(html).toContain('id="mobileReadiness"');
    expect(html).toContain('id="mobileReadinessStatus"');
    expect(html).toContain('id="providerReadiness"');
    expect(html).toContain('id="providerReadinessStatus"');
    expect(html).toContain("OPENAI_API_KEY");
    expect(html).toContain("ANTHROPIC_API_KEY");
    expect(html).toContain("provider:dry-run");
    expect(html).toContain("provider:runtime-plan");
    expect(html).toContain('id="providerRuntimePlanCommand"');
    expect(html).toContain('data-copy-text="providerRuntimePlanCommand"');
    expect(html).toContain('id="sessionHandoff"');
    expect(html).toContain('id="sessionHandoffCommand"');
    expect(html).toContain('id="nextSessionPrompt"');
    expect(html).toContain('data-copy-text="sessionHandoffCommand"');
    expect(html).toContain('data-copy-text="nextSessionPrompt"');
    expect(html).toContain('id="mobileSetupGuide"');
    expect(html).toContain("TELEGRAM_BOT_TOKEN");
    expect(html).toContain("DISCORD_WEBHOOK_URL");
    expect(html).toContain("mobile:status");
    expect(html).toContain('id="mobileStatusCommand"');
    expect(html).toContain('data-copy-text="mobileStatusCommand"');
    expect(html).toContain("/artifacts/playwright/goal-mode-desktop.png");
    expect(html).toContain("/artifacts/playwright/goal-mode-mobile.png");
    expect(html).toContain('id="recentValidation"');
    expect(html).toContain('id="validationStatus"');
    expect(html).toContain('id="strictVerification"');
    expect(html).toContain('id="safeMode"');
  });

  it("keeps localStorage-backed history, clipboard copy, and validation loading behavior in the dashboard script", () => {
    const script = readFileSync("apps/web-dashboard/goal-mode.js", "utf8");

    expect(script).toContain("localStorage");
    expect(script).toContain("jh-goal-mode-history");
    expect(script).toContain("jh-goal-mode-language");
    expect(script).toContain("applyLanguage");
    expect(script).toContain("taskPlaceholder");
    expect(script).toContain("navigator.clipboard.writeText");
    expect(script).toContain("copyText");
    expect(script).toContain("/api/modules");
    expect(script).toContain("/api/preview-validation");
    expect(script).toContain("/api/mobile-readiness");
    expect(script).toContain("/api/provider-readiness");
    expect(script).toContain("/api/session-handoff");
    expect(script).toContain("renderRecentValidation");
    expect(script).toContain("renderMobileReadiness");
    expect(script).toContain("renderProviderReadiness");
    expect(script).toContain("renderSessionHandoff");
    expect(script).toContain("Task request is required.");
  });

  it("keeps setup guide copy buttons readable in narrow side panels", () => {
    const styles = readFileSync("apps/web-dashboard/styles.css", "utf8");

    expect(styles).toContain(".setup-guide .copy-row");
    expect(styles).toContain("white-space: nowrap");
    expect(styles).toContain(".module-grid article");
    expect(styles).toContain("overflow-wrap: anywhere");
  });
});
