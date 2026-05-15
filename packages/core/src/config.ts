export type HarnessConfig = {
  appName: string;
  local: {
    host: string;
    port: number;
  };
  secrets: {
    openai: string;
    anthropic: string;
    telegram: string;
    telegramAllowedChatIds: string;
    github: string;
    obsidianVaultPath: string;
    discordWebhookUrl: string;
    discordAllowedChannelIds: string;
  };
};

export function createDefaultConfig(): HarnessConfig {
  return {
    appName: "JH Dev Nexus Harness",
    local: {
      host: "127.0.0.1",
      port: 3100
    },
    secrets: {
      openai: "OPENAI_API_KEY",
      anthropic: "ANTHROPIC_API_KEY",
      telegram: "TELEGRAM_BOT_TOKEN",
      telegramAllowedChatIds: "TELEGRAM_ALLOWED_CHAT_IDS",
      github: "GITHUB_TOKEN",
      obsidianVaultPath: "OBSIDIAN_VAULT_PATH",
      discordWebhookUrl: "DISCORD_WEBHOOK_URL",
      discordAllowedChannelIds: "DISCORD_ALLOWED_CHANNEL_IDS"
    }
  };
}

export function getRequiredSecretNames(): string[] {
  const { secrets } = createDefaultConfig();

  return [
    secrets.openai,
    secrets.anthropic,
    secrets.telegram,
    secrets.telegramAllowedChatIds,
    secrets.github,
    secrets.obsidianVaultPath,
    secrets.discordWebhookUrl,
    secrets.discordAllowedChannelIds
  ];
}
