import { describe, expect, it } from "vitest";
import { createPreviewCapturePlan } from "./preview-capture.js";

describe("preview capture", () => {
  it("creates a safe Playwright capture plan for local preview URLs", () => {
    const plan = createPreviewCapturePlan({
      url: "http://127.0.0.1:3100",
      outputDir: "output/playwright",
      fileName: "goal-mode.png"
    });

    expect(plan.ok).toBe(true);
    expect(plan.url).toBe("http://127.0.0.1:3100/");
    expect(plan.screenshotPath.endsWith("output\\playwright\\goal-mode.png") || plan.screenshotPath.endsWith("output/playwright/goal-mode.png")).toBe(true);
    expect(plan.command).toEqual({
      executable: "node",
      args: ["dist/scripts/preview-capture.js", "http://127.0.0.1:3100/", plan.screenshotPath]
    });
  });

  it("rejects non-local preview URLs before browser execution", () => {
    const plan = createPreviewCapturePlan({
      url: "https://example.com",
      outputDir: "output/playwright",
      fileName: "blocked.png"
    });

    expect(plan.ok).toBe(false);
    expect(plan.errors).toContain("Only localhost or 127.0.0.1 preview URLs are allowed.");
    expect(plan.command).toBeUndefined();
  });

  it("rejects output paths outside output/playwright", () => {
    const plan = createPreviewCapturePlan({
      url: "http://localhost:3100",
      outputDir: "../outside",
      fileName: "bad.png"
    });

    expect(plan.ok).toBe(false);
    expect(plan.errors).toContain("Screenshots must be written under output/playwright.");
  });
});
