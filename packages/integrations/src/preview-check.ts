export type PreviewCheckMode = "dry-run" | "capture-summary";

export type PreviewErrorSource = "console" | "network";

export type PreviewError = {
  source: PreviewErrorSource;
  message: string;
};

export type PreviewCheckInput = {
  url: string;
  mode: PreviewCheckMode;
};

export type PreviewCheckResult = {
  ok: boolean;
  url: string;
  mode: PreviewCheckMode;
  checks: string[];
  errors: string[];
};

export type PreviewCaptureSummaryInput = {
  url: string;
  captureOutput: string;
};

export function isLocalPreviewUrl(value: string): boolean {
  try {
    const url = new URL(value);
    return url.protocol === "http:" && (url.hostname === "127.0.0.1" || url.hostname === "localhost");
  } catch {
    return false;
  }
}

export function createPreviewCheck(input: PreviewCheckInput): PreviewCheckResult {
  if (!isLocalPreviewUrl(input.url)) {
    return {
      ok: false,
      url: input.url,
      mode: input.mode,
      checks: ["url:rejected", "network:not-called", "screenshot:not-captured"],
      errors: ["Only localhost or 127.0.0.1 preview URLs are allowed."]
    };
  }

  const url = new URL(input.url);

  return {
    ok: true,
    url: url.toString(),
    mode: input.mode,
    checks: ["url:local", "network:not-called", "screenshot:not-captured"],
    errors: []
  };
}

export function summarizePreviewErrors(errors: PreviewError[]): string[] {
  return errors.map((error) => `${error.source}: ${error.message}`);
}

function captureValue(lines: string[], viewport: string, key: string): string | undefined {
  const start = lines.findIndex((line) => line === `viewport=${viewport}`);
  if (start < 0) return undefined;
  const nextViewport = lines.findIndex((line, index) => index > start && line.startsWith("viewport="));
  const end = nextViewport < 0 ? lines.length : nextViewport;
  const prefix = `${key}=`;

  return lines.slice(start + 1, end).find((line) => line.startsWith(prefix))?.slice(prefix.length);
}

export function createPreviewCheckFromCapture(input: PreviewCaptureSummaryInput): PreviewCheckResult {
  const base = createPreviewCheck({ url: input.url, mode: "capture-summary" });
  if (!base.ok) return base;

  const lines = input.captureOutput.split("\n").map((line) => line.trim()).filter(Boolean);
  const checks = ["url:local"];
  const errors: string[] = [];

  for (const viewport of ["desktop", "mobile"]) {
    const screenshot = captureValue(lines, viewport, "screenshot");
    const consoleErrors = captureValue(lines, viewport, "consoleErrors");

    if (screenshot) {
      checks.push(`${viewport}:screenshot:captured`);
    } else {
      errors.push(`${viewport} screenshot was not captured.`);
    }

    if (consoleErrors === "0") {
      checks.push(`${viewport}:console:clean`);
    } else if (consoleErrors) {
      errors.push(`${viewport} console errors: ${consoleErrors}`);
    } else {
      errors.push(`${viewport} console error count was not captured.`);
    }
  }

  return {
    ok: errors.length === 0,
    url: base.url,
    mode: "capture-summary",
    checks,
    errors
  };
}
