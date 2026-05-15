import { describe, expect, it } from "vitest";
import {
  createViewportCaptureTargets,
  formatCaptureSuccess,
  parsePreviewCaptureArgs
} from "./preview-capture.js";

describe("preview capture script", () => {
  it("parses url and screenshot path arguments", () => {
    expect(parsePreviewCaptureArgs(["node", "preview-capture.js", "http://127.0.0.1:3100/", "output/playwright/goal-mode.png"])).toEqual({
      url: "http://127.0.0.1:3100/",
      screenshotPath: "output/playwright/goal-mode.png"
    });
  });

  it("formats capture success output", () => {
    expect(formatCaptureSuccess("output/playwright/goal-mode.png", [])).toContain("screenshot=output/playwright/goal-mode.png");
    expect(formatCaptureSuccess("output/playwright/goal-mode.png", [])).toContain("consoleErrors=0");
  });

  it("creates desktop and mobile capture targets", () => {
    expect(createViewportCaptureTargets("output/playwright")).toEqual([
      {
        name: "desktop",
        viewport: { width: 1440, height: 960 },
        screenshotPath: "output/playwright/goal-mode-desktop.png"
      },
      {
        name: "mobile",
        viewport: { width: 390, height: 844 },
        screenshotPath: "output/playwright/goal-mode-mobile.png"
      }
    ]);
  });
});
