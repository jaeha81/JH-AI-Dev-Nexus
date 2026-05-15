import { resolve } from "node:path";
import { isLocalPreviewUrl } from "./preview-check.js";

export type PreviewCapturePlanInput = {
  url: string;
  outputDir: string;
  fileName: string;
};

export type PreviewCaptureCommand = {
  executable: "node";
  args: string[];
};

export type PreviewCapturePlan = {
  ok: boolean;
  url: string;
  screenshotPath: string;
  command?: PreviewCaptureCommand;
  errors: string[];
};

export function createPreviewCapturePlan(input: PreviewCapturePlanInput): PreviewCapturePlan {
  const errors: string[] = [];

  if (!isLocalPreviewUrl(input.url)) {
    errors.push("Only localhost or 127.0.0.1 preview URLs are allowed.");
  }

  const outputRoot = resolve("output", "playwright");
  const requestedOutputDir = resolve(input.outputDir);
  const screenshotPath = resolve(requestedOutputDir, input.fileName);

  if (!requestedOutputDir.startsWith(outputRoot)) {
    errors.push("Screenshots must be written under output/playwright.");
  }

  const normalizedUrl = isLocalPreviewUrl(input.url) ? new URL(input.url).toString() : input.url;

  if (errors.length > 0) {
    return {
      ok: false,
      url: normalizedUrl,
      screenshotPath,
      errors
    };
  }

  return {
    ok: true,
    url: normalizedUrl,
    screenshotPath,
    command: {
      executable: "node",
      args: ["dist/scripts/preview-capture.js", normalizedUrl, screenshotPath]
    },
    errors
  };
}
