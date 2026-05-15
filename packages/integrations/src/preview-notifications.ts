import {
  getMobileConnectors,
  isMobileCapabilityAllowed,
  type BlockedMobileCapability,
  type MobileCapability,
  type MobileConnectorId
} from "./mobile-connectors.js";

export type PreviewNotificationInput = {
  captureOutput: string;
  connectors: MobileConnectorId[];
  capabilityOverride?: MobileCapability | BlockedMobileCapability;
};

export type PreviewNotificationPlan = {
  connectorId: MobileConnectorId;
  allowed: boolean;
  requiredSecrets: string[];
  message: string;
};

export type NotificationFetchResponse = {
  ok: boolean;
  status: number;
};

export type NotificationFetcher = (
  url: string,
  init: {
    method: "POST";
    headers: Record<string, string>;
    body: string;
  }
) => Promise<NotificationFetchResponse>;

export type SendPreviewNotificationsInput = {
  plans: PreviewNotificationPlan[];
  env: Record<string, string | undefined>;
  fetcher?: NotificationFetcher;
};

export type SendPreviewNotificationResult = {
  connectorId: MobileConnectorId;
  status: "sent" | "skipped" | "failed";
  reason?: string;
};

function detailValue(lines: string[], viewport: string, key: string): string | undefined {
  const start = lines.findIndex((line) => line === `viewport=${viewport}`);
  if (start < 0) return undefined;
  const nextViewport = lines.findIndex((line, index) => index > start && line.startsWith("viewport="));
  const end = nextViewport < 0 ? lines.length : nextViewport;
  const prefix = `${key}=`;

  return lines.slice(start + 1, end).find((line) => line.startsWith(prefix))?.slice(prefix.length);
}

function buildMessage(captureOutput: string): string {
  const lines = captureOutput.split("\n").map((line) => line.trim()).filter(Boolean);
  const desktopErrors = detailValue(lines, "desktop", "consoleErrors") ?? "unknown";
  const mobileErrors = detailValue(lines, "mobile", "consoleErrors") ?? "unknown";
  const status = desktopErrors === "0" && mobileErrors === "0" ? "PASS" : "WARNING";

  return [
    `Preview Check ${status}`,
    `desktop consoleErrors=${desktopErrors}`,
    `mobile consoleErrors=${mobileErrors}`
  ].join("\n");
}

export function buildPreviewCheckNotificationPlan(input: PreviewNotificationInput): PreviewNotificationPlan[] {
  const connectors = getMobileConnectors();
  const capability = input.capabilityOverride ?? "notify:send";

  return input.connectors.map((connectorId) => {
    const connector = connectors.find((item) => item.id === connectorId);
    const requiredSecrets = connector?.secrets ?? [];
    const allowed = isMobileCapabilityAllowed(connectorId, capability);

    return {
      connectorId,
      allowed,
      requiredSecrets,
      message: allowed
        ? buildMessage(input.captureOutput)
        : `Preview Check notification blocked: capability ${capability} is not allowed.`
    };
  });
}

function hasRequiredSecrets(plan: PreviewNotificationPlan, env: Record<string, string | undefined>): boolean {
  return plan.requiredSecrets.every((secretName) => Boolean(env[secretName]?.trim()));
}

function telegramChatIds(env: Record<string, string | undefined>): string[] {
  return (env.TELEGRAM_ALLOWED_CHAT_IDS ?? "")
    .split(",")
    .map((chatId) => chatId.trim())
    .filter(Boolean);
}

function assertDeliveryAccepted(connectorLabel: string, response: NotificationFetchResponse): void {
  if (!response.ok) {
    throw new Error(`${connectorLabel} delivery failed with status ${response.status}.`);
  }
}

async function sendTelegram(
  plan: PreviewNotificationPlan,
  env: Record<string, string | undefined>,
  fetcher: NotificationFetcher
): Promise<void> {
  const token = env.TELEGRAM_BOT_TOKEN;
  if (!token) throw new Error("Missing Telegram token.");

  for (const chatId of telegramChatIds(env)) {
    const response = await fetcher(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ chat_id: chatId, text: plan.message })
    });
    assertDeliveryAccepted("Telegram", response);
  }
}

async function sendDiscord(
  plan: PreviewNotificationPlan,
  env: Record<string, string | undefined>,
  fetcher: NotificationFetcher
): Promise<void> {
  const webhookUrl = env.DISCORD_WEBHOOK_URL;
  if (!webhookUrl) throw new Error("Missing Discord webhook URL.");

  const response = await fetcher(webhookUrl, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ content: plan.message })
  });
  assertDeliveryAccepted("Discord", response);
}

export async function sendPreviewCheckNotifications(
  input: SendPreviewNotificationsInput
): Promise<SendPreviewNotificationResult[]> {
  const fetcher =
    input.fetcher ??
    (async (url, init) => {
      const response = await fetch(url, init);
      return { ok: response.ok, status: response.status };
    });

  const results: SendPreviewNotificationResult[] = [];

  for (const plan of input.plans) {
    if (!plan.allowed) {
      results.push({ connectorId: plan.connectorId, status: "skipped", reason: "Notification is not allowed." });
      continue;
    }
    if (!hasRequiredSecrets(plan, input.env)) {
      results.push({ connectorId: plan.connectorId, status: "skipped", reason: "Missing required secrets." });
      continue;
    }

    try {
      if (plan.connectorId === "telegram") {
        await sendTelegram(plan, input.env, fetcher);
      } else {
        await sendDiscord(plan, input.env, fetcher);
      }
      results.push({ connectorId: plan.connectorId, status: "sent" });
    } catch (error) {
      results.push({
        connectorId: plan.connectorId,
        status: "failed",
        reason: error instanceof Error ? error.message : String(error)
      });
    }
  }

  return results;
}
