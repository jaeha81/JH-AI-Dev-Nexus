import { describe, expect, it } from "vitest";
import { createDefaultConfig, getRequiredSecretNames } from "./config.js";

describe("harness config", () => {
  it("creates a safe default local config without secret values", () => {
    const config = createDefaultConfig();

    expect(config.appName).toBe("JH Dev Nexus Harness");
    expect(config.local.host).toBe("127.0.0.1");
    expect(config.local.port).toBe(3100);
    expect(config.secrets).toEqual({
      openai: "OPENAI_API_KEY",
      anthropic: "ANTHROPIC_API_KEY",
      telegram: "TELEGRAM_BOT_TOKEN",
      telegramAllowedChatIds: "TELEGRAM_ALLOWED_CHAT_IDS",
      github: "GITHUB_TOKEN",
      obsidianVaultPath: "OBSIDIAN_VAULT_PATH",
      discordWebhookUrl: "DISCORD_WEBHOOK_URL",
      discordAllowedChannelIds: "DISCORD_ALLOWED_CHANNEL_IDS"
    });
  });

  it("lists required secret environment variable names only", () => {
    expect(getRequiredSecretNames()).toEqual([
      "OPENAI_API_KEY",
      "ANTHROPIC_API_KEY",
      "TELEGRAM_BOT_TOKEN",
      "TELEGRAM_ALLOWED_CHAT_IDS",
      "GITHUB_TOKEN",
      "OBSIDIAN_VAULT_PATH",
      "DISCORD_WEBHOOK_URL",
      "DISCORD_ALLOWED_CHANNEL_IDS"
    ]);
  });
});
