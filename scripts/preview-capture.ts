import { mkdir } from "node:fs/promises";
import { dirname } from "node:path";
import { pathToFileURL } from "node:url";

export type PreviewCaptureArgs = {
  url: string;
  screenshotPath: string;
};

export type CapturedConsoleError = {
  type: string;
  text: string;
};

export type ViewportCaptureTarget = {
  name: "desktop" | "mobile";
  viewport: {
    width: number;
    height: number;
  };
  screenshotPath: string;
};

export function parsePreviewCaptureArgs(argv: string[]): PreviewCaptureArgs {
  const [, , url, screenshotPath] = argv;

  if (!url || !screenshotPath) {
    throw new Error("Usage: node dist/scripts/preview-capture.js <local-url> <screenshot-path>");
  }

  return { url, screenshotPath };
}

export function formatCaptureSuccess(screenshotPath: string, consoleErrors: CapturedConsoleError[]): string {
  return [
    `screenshot=${screenshotPath}`,
    `consoleErrors=${consoleErrors.length}`,
    ...consoleErrors.map((error) => `${error.type}: ${error.text}`)
  ].join("\n");
}

export function createViewportCaptureTargets(outputDir: string): ViewportCaptureTarget[] {
  return [
    {
      name: "desktop",
      viewport: { width: 1440, height: 960 },
      screenshotPath: `${outputDir}/goal-mode-desktop.png`
    },
    {
      name: "mobile",
      viewport: { width: 390, height: 844 },
      screenshotPath: `${outputDir}/goal-mode-mobile.png`
    }
  ];
}

export async function capturePreview(args: PreviewCaptureArgs): Promise<string> {
  const { chromium } = await import("playwright");
  const consoleErrors: CapturedConsoleError[] = [];

  await mkdir(dirname(args.screenshotPath), { recursive: true });

  const browser = await chromium.launch({ headless: true });
  try {
    const page = await browser.newPage({ viewport: { width: 1440, height: 960 } });
    page.on("console", (message) => {
      if (message.type() === "error") {
        consoleErrors.push({ type: message.type(), text: message.text() });
      }
    });

    await page.goto(args.url, { waitUntil: "networkidle" });
    await page.screenshot({ path: args.screenshotPath, fullPage: true });

    return formatCaptureSuccess(args.screenshotPath, consoleErrors);
  } finally {
    await browser.close();
  }
}

export async function capturePreviewViewports(url: string, outputDir: string): Promise<string> {
  const { chromium } = await import("playwright");
  const targets = createViewportCaptureTargets(outputDir);
  const lines: string[] = [];
  const browser = await chromium.launch({ headless: true });

  try {
    for (const target of targets) {
      const consoleErrors: CapturedConsoleError[] = [];
      await mkdir(dirname(target.screenshotPath), { recursive: true });
      const page = await browser.newPage({ viewport: target.viewport });
      page.on("console", (message) => {
        if (message.type() === "error") {
          consoleErrors.push({ type: message.type(), text: message.text() });
        }
      });
      await page.goto(url, { waitUntil: "networkidle" });
      await page.screenshot({ path: target.screenshotPath, fullPage: true });
      await page.close();
      lines.push(`viewport=${target.name}`);
      lines.push(formatCaptureSuccess(target.screenshotPath, consoleErrors));
    }
  } finally {
    await browser.close();
  }

  return lines.join("\n");
}

if (import.meta.url === pathToFileURL(process.argv[1] ?? "").href) {
  const [, , url, screenshotPathOrMode] = process.argv;
  const capture = screenshotPathOrMode === "--all"
    ? capturePreviewViewports(url ?? "", "output/playwright")
    : capturePreview(parsePreviewCaptureArgs(process.argv));

  capture
    .then((output) => {
      console.log(output);
    })
    .catch((error: unknown) => {
      console.error(error instanceof Error ? error.message : String(error));
      process.exitCode = 1;
    });
}
