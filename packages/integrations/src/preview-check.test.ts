import { describe, expect, it } from "vitest";
import {
  createPreviewCheck,
  createPreviewCheckFromCapture,
  isLocalPreviewUrl,
  summarizePreviewErrors
} from "./preview-check.js";

describe("preview check", () => {
  it("accepts local preview URLs only", () => {
    expect(isLocalPreviewUrl("http://127.0.0.1:3100")).toBe(true);
    expect(isLocalPreviewUrl("http://localhost:5173/goal")).toBe(true);
    expect(isLocalPreviewUrl("https://example.com")).toBe(false);
    expect(isLocalPreviewUrl("not-a-url")).toBe(false);
  });

  it("creates a safe dry-run preview check without network access", () => {
    const result = createPreviewCheck({
      url: "http://127.0.0.1:3100",
      mode: "dry-run"
    });

    expect(result.ok).toBe(true);
    expect(result.url).toBe("http://127.0.0.1:3100/");
    expect(result.mode).toBe("dry-run");
    expect(result.checks).toEqual(["url:local", "network:not-called", "screenshot:not-captured"]);
    expect(result.errors).toEqual([]);
  });

  it("rejects non-local preview URLs", () => {
    const result = createPreviewCheck({
      url: "https://example.com",
      mode: "dry-run"
    });

    expect(result.ok).toBe(false);
    expect(result.errors).toContain("Only localhost or 127.0.0.1 preview URLs are allowed.");
  });

  it("summarizes console and network errors", () => {
    const summary = summarizePreviewErrors([
      { source: "console", message: "ReferenceError: app is not defined" },
      { source: "network", message: "GET /api/status 500" }
    ]);

    expect(summary).toEqual([
      "console: ReferenceError: app is not defined",
      "network: GET /api/status 500"
    ]);
  });

  it("integrates desktop and mobile capture output into preview checks", () => {
    const result = createPreviewCheckFromCapture({
      url: "http://127.0.0.1:3100",
      captureOutput: [
        "viewport=desktop",
        "screenshot=output/playwright/goal-mode-desktop.png",
        "consoleErrors=0",
        "viewport=mobile",
        "screenshot=output/playwright/goal-mode-mobile.png",
        "consoleErrors=0"
      ].join("\n")
    });

    expect(result.ok).toBe(true);
    expect(result.mode).toBe("capture-summary");
    expect(result.checks).toEqual([
      "url:local",
      "desktop:screenshot:captured",
      "desktop:console:clean",
      "mobile:screenshot:captured",
      "mobile:console:clean"
    ]);
    expect(result.errors).toEqual([]);
  });

  it("reports capture summary problems as preview errors", () => {
    const result = createPreviewCheckFromCapture({
      url: "http://127.0.0.1:3100",
      captureOutput: "viewport=desktop\nconsoleErrors=2"
    });

    expect(result.ok).toBe(false);
    expect(result.errors).toContain("desktop console errors: 2");
    expect(result.errors).toContain("mobile screenshot was not captured.");
  });
});
