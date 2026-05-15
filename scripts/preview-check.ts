import { appendFile } from "node:fs/promises";
import { pathToFileURL } from "node:url";
import type { MobileConnectorId } from "../packages/integrations/src/mobile-connectors.js";
import { createPreviewCheckFromCapture } from "../packages/integrations/src/preview-check.js";
import {
  buildPreviewCheckNotificationPlan,
  sendPreviewCheckNotifications,
  type NotificationFetcher
} from "../packages/integrations/src/preview-notifications.js";
import { capturePreviewViewports } from "./preview-capture.js";

export type PreviewCheckArgs = {
  url: string;
  outputDir: string;
  validationLogPath: string;
  notifyConnectors: MobileConnectorId[];
};

export type PreviewCheckLogInput = {
  command: string;
  captureOutput: string;
  url?: string;
};

export type PreviewCheckDependencies = {
  capture?: (url: string, outputDir: string) => Promise<string>;
  env?: Record<string, string | undefined>;
  fetcher?: NotificationFetcher;
};

export function parsePreviewCheckArgs(argv: string[]): PreviewCheckArgs {
  const args = argv.slice(2);
  const notifyIndex = args.indexOf("--notify");
  const notifyConnectors =
    notifyIndex >= 0
      ? (args[notifyIndex + 1] ?? "")
          .split(",")
          .map((item) => item.trim())
          .filter((item): item is MobileConnectorId => item === "telegram" || item === "discord")
      : [];
  const positional = notifyIndex >= 0 ? args.slice(0, notifyIndex) : args;
  const [url = "http://127.0.0.1:3100/", outputDir = "output/playwright", validationLogPath = "llm-wiki/validation-log.md"] =
    positional;

  return {
    url,
    outputDir,
    validationLogPath,
    notifyConnectors
  };
}

export function buildPreviewCheckLogEntry(input: PreviewCheckLogInput): string {
  const summary = createPreviewCheckFromCapture({
    url: input.url ?? "http://127.0.0.1:3100/",
    captureOutput: input.captureOutput
  });

  return [
    "",
    `## ${new Date().toISOString()} Preview Check 자동 기록`,
    `- 명령: \`${input.command}\``,
    `- 결과: ${summary.ok ? "PASS" : "WARNING"}.`,
    "- 상세:",
    ...input.captureOutput.split("\n").map((line) => `  - ${line}`),
    "- 통합 검사:",
    ...summary.checks.map((check) => `  - ${check}`),
    ...summary.errors.map((error) => `  - error=${error}`)
  ].join("\n");
}

export async function runPreviewCheck(args: PreviewCheckArgs, dependencies: PreviewCheckDependencies = {}): Promise<string> {
  const capture = dependencies.capture ?? capturePreviewViewports;
  const captureOutput = await capture(args.url, args.outputDir);
  const entry = buildPreviewCheckLogEntry({
    command: "npm run preview:check",
    captureOutput,
    url: args.url
  });

  await appendFile(args.validationLogPath, `${entry}\n`, "utf8");
  if (args.notifyConnectors.length) {
    const plans = buildPreviewCheckNotificationPlan({
      captureOutput,
      connectors: args.notifyConnectors
    });
    const results = await sendPreviewCheckNotifications({
      plans,
      env: dependencies.env ?? process.env,
      fetcher: dependencies.fetcher
    });
    const notificationEntry = results
      .map((result) => {
        const reason = result.reason ? ` reason=${result.reason}` : "";
        return `notify=${result.connectorId} status=${result.status}${reason}`;
      })
      .join("\n");
    await appendFile(args.validationLogPath, `${notificationEntry}\n`, "utf8");
  }

  return captureOutput;
}

if (import.meta.url === pathToFileURL(process.argv[1] ?? "").href) {
  runPreviewCheck(parsePreviewCheckArgs(process.argv))
    .then((output) => {
      console.log(output);
      console.log("validationLog=llm-wiki/validation-log.md");
    })
    .catch((error: unknown) => {
      console.error(error instanceof Error ? error.message : String(error));
      process.exitCode = 1;
    });
}
