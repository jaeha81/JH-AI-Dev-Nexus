import { describe, expect, it } from "vitest";
import {
  getMobileConnectorReadiness,
  getMobileConnectors,
  getMobileSecretNames,
  isMobileCapabilityAllowed
} from "./mobile-connectors.js";

describe("mobile external connectors", () => {
  it("registers Telegram and Discord as mobile-safe channels", () => {
    const connectors = getMobileConnectors();

    expect(connectors.map((connector) => connector.id)).toEqual(["telegram", "discord"]);
    expect(connectors.every((connector) => connector.surface === "external-mobile")).toBe(true);
  });

  it("limits mobile capabilities to status, link relay, and notifications", () => {
    expect(isMobileCapabilityAllowed("telegram", "status:read")).toBe(true);
    expect(isMobileCapabilityAllowed("telegram", "link:relay")).toBe(true);
    expect(isMobileCapabilityAllowed("discord", "notify:send")).toBe(true);
    expect(isMobileCapabilityAllowed("discord", "shell:execute")).toBe(false);
    expect(isMobileCapabilityAllowed("telegram", "deploy:run")).toBe(false);
  });

  it("returns environment variable names without secret values", () => {
    expect(getMobileSecretNames()).toEqual([
      "TELEGRAM_BOT_TOKEN",
      "TELEGRAM_ALLOWED_CHAT_IDS",
      "DISCORD_WEBHOOK_URL",
      "DISCORD_ALLOWED_CHANNEL_IDS"
    ]);
  });

  it("reports mobile connector readiness without exposing secret values", () => {
    const readiness = getMobileConnectorReadiness({
      TELEGRAM_BOT_TOKEN: "telegram-secret",
      TELEGRAM_ALLOWED_CHAT_IDS: "123",
      DISCORD_WEBHOOK_URL: "",
      DISCORD_ALLOWED_CHANNEL_IDS: undefined
    });

    expect(readiness).toEqual([
      {
        connectorId: "telegram",
        ready: true,
        missingSecrets: []
      },
      {
        connectorId: "discord",
        ready: false,
        missingSecrets: ["DISCORD_WEBHOOK_URL", "DISCORD_ALLOWED_CHANNEL_IDS"]
      }
    ]);
    expect(JSON.stringify(readiness)).not.toContain("telegram-secret");
    expect(JSON.stringify(readiness)).not.toContain("123");
  });
});
