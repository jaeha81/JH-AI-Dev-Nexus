export type MobileConnectorId = "telegram" | "discord";

export type MobileCapability = "status:read" | "link:relay" | "notify:send";

export type BlockedMobileCapability = "shell:execute" | "deploy:run";

export type MobileConnector = {
  id: MobileConnectorId;
  label: string;
  surface: "external-mobile";
  secrets: string[];
  allowedCapabilities: MobileCapability[];
  blockedCapabilities: BlockedMobileCapability[];
};

export type MobileConnectorReadiness = {
  connectorId: MobileConnectorId;
  ready: boolean;
  missingSecrets: string[];
};

const mobileConnectors: MobileConnector[] = [
  {
    id: "telegram",
    label: "Telegram",
    surface: "external-mobile",
    secrets: ["TELEGRAM_BOT_TOKEN", "TELEGRAM_ALLOWED_CHAT_IDS"],
    allowedCapabilities: ["status:read", "link:relay", "notify:send"],
    blockedCapabilities: ["shell:execute", "deploy:run"]
  },
  {
    id: "discord",
    label: "Discord",
    surface: "external-mobile",
    secrets: ["DISCORD_WEBHOOK_URL", "DISCORD_ALLOWED_CHANNEL_IDS"],
    allowedCapabilities: ["status:read", "link:relay", "notify:send"],
    blockedCapabilities: ["shell:execute", "deploy:run"]
  }
];

export function getMobileConnectors(): readonly MobileConnector[] {
  return mobileConnectors;
}

export function getMobileSecretNames(): string[] {
  return mobileConnectors.flatMap((connector) => connector.secrets);
}

export function isMobileCapabilityAllowed(
  connectorId: MobileConnectorId,
  capability: MobileCapability | BlockedMobileCapability
): boolean {
  const connector = mobileConnectors.find((item) => item.id === connectorId);

  return connector?.allowedCapabilities.includes(capability as MobileCapability) ?? false;
}

export function getMobileConnectorReadiness(
  env: Record<string, string | undefined> = process.env
): MobileConnectorReadiness[] {
  return mobileConnectors.map((connector) => {
    const missingSecrets = connector.secrets.filter((secretName) => !env[secretName]?.trim());

    return {
      connectorId: connector.id,
      ready: missingSecrets.length === 0,
      missingSecrets
    };
  });
}
