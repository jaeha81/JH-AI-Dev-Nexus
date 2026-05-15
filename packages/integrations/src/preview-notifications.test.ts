import { describe, expect, it } from "vitest";
import {
  buildPreviewCheckNotificationPlan,
  sendPreviewCheckNotifications
} from "./preview-notifications.js";

describe("preview check mobile notifications", () => {
  it("builds safe Telegram and Discord notification plans without secret values", () => {
    const plans = buildPreviewCheckNotificationPlan({
      captureOutput: [
        "viewport=desktop",
        "screenshot=output/playwright/goal-mode-desktop.png",
        "consoleErrors=0",
        "viewport=mobile",
        "screenshot=output/playwright/goal-mode-mobile.png",
        "consoleErrors=0"
      ].join("\n"),
      connectors: ["telegram", "discord"]
    });

    expect(plans).toHaveLength(2);
    expect(plans.map((plan) => plan.connectorId)).toEqual(["telegram", "discord"]);
    expect(plans.every((plan) => plan.allowed)).toBe(true);
    expect(plans[0].requiredSecrets).toEqual(["TELEGRAM_BOT_TOKEN", "TELEGRAM_ALLOWED_CHAT_IDS"]);
    expect(plans[1].requiredSecrets).toEqual(["DISCORD_WEBHOOK_URL", "DISCORD_ALLOWED_CHANNEL_IDS"]);
    expect(plans[0].message).toContain("Preview Check PASS");
    expect(plans[0].message).toContain("desktop consoleErrors=0");
    expect(plans[0].message).toContain("mobile consoleErrors=0");
    expect(plans[0].message).not.toContain("sk-");
  });

  it("marks plans blocked when notify capability is unavailable", () => {
    const plans = buildPreviewCheckNotificationPlan({
      captureOutput: "viewport=desktop\nconsoleErrors=1",
      connectors: ["telegram"],
      capabilityOverride: "shell:execute"
    });

    expect(plans).toEqual([
      {
        connectorId: "telegram",
        allowed: false,
        requiredSecrets: ["TELEGRAM_BOT_TOKEN", "TELEGRAM_ALLOWED_CHAT_IDS"],
        message: "Preview Check notification blocked: capability shell:execute is not allowed."
      }
    ]);
  });

  it("skips real delivery when required secrets are missing", async () => {
    const plans = buildPreviewCheckNotificationPlan({
      captureOutput: "viewport=desktop\nconsoleErrors=0\nviewport=mobile\nconsoleErrors=0",
      connectors: ["telegram", "discord"]
    });
    const calls: unknown[] = [];

    const results = await sendPreviewCheckNotifications({
      plans,
      env: {},
      fetcher: async (...args) => {
        calls.push(args);
        return { ok: true, status: 200 };
      }
    });

    expect(calls).toEqual([]);
    expect(results.map((result) => result.status)).toEqual(["skipped", "skipped"]);
    expect(results[0].reason).toBe("Missing required secrets.");
  });

  it("sends Telegram and Discord notifications through injected fetcher", async () => {
    const plans = buildPreviewCheckNotificationPlan({
      captureOutput: "viewport=desktop\nconsoleErrors=0\nviewport=mobile\nconsoleErrors=0",
      connectors: ["telegram", "discord"]
    });
    const calls: Array<{ url: string; body: unknown }> = [];

    const results = await sendPreviewCheckNotifications({
      plans,
      env: {
        TELEGRAM_BOT_TOKEN: "telegram-token",
        TELEGRAM_ALLOWED_CHAT_IDS: "123,456",
        DISCORD_WEBHOOK_URL: "https://discord.example/webhook",
        DISCORD_ALLOWED_CHANNEL_IDS: "ops"
      },
      fetcher: async (url, init) => {
        calls.push({ url: String(url), body: JSON.parse(String(init?.body)) });
        return { ok: true, status: 200 };
      }
    });

    expect(results.map((result) => result.status)).toEqual(["sent", "sent"]);
    expect(calls).toHaveLength(3);
    expect(calls[0]).toMatchObject({
      url: "https://api.telegram.org/bottelegram-token/sendMessage",
      body: { chat_id: "123", text: plans[0].message }
    });
    expect(calls[1]).toMatchObject({
      url: "https://api.telegram.org/bottelegram-token/sendMessage",
      body: { chat_id: "456", text: plans[0].message }
    });
    expect(calls[2]).toMatchObject({
      url: "https://discord.example/webhook",
      body: { content: plans[1].message }
    });
  });

  it("reports delivery failure when a mobile service rejects the request", async () => {
    const plans = buildPreviewCheckNotificationPlan({
      captureOutput: "viewport=desktop\nconsoleErrors=0\nviewport=mobile\nconsoleErrors=0",
      connectors: ["telegram", "discord"]
    });

    const results = await sendPreviewCheckNotifications({
      plans,
      env: {
        TELEGRAM_BOT_TOKEN: "telegram-token",
        TELEGRAM_ALLOWED_CHAT_IDS: "123",
        DISCORD_WEBHOOK_URL: "https://discord.example/webhook",
        DISCORD_ALLOWED_CHANNEL_IDS: "ops"
      },
      fetcher: async (url) => ({
        ok: false,
        status: String(url).includes("telegram") ? 401 : 500
      })
    });

    expect(results).toEqual([
      {
        connectorId: "telegram",
        status: "failed",
        reason: "Telegram delivery failed with status 401."
      },
      {
        connectorId: "discord",
        status: "failed",
        reason: "Discord delivery failed with status 500."
      }
    ]);
    expect(JSON.stringify(results)).not.toContain("telegram-token");
    expect(JSON.stringify(results)).not.toContain("webhook");
  });
});
