import { mkdtemp, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import { buildPreviewCheckLogEntry, parsePreviewCheckArgs, runPreviewCheck } from "./preview-check.js";

const tempDirs: string[] = [];

afterEach(async () => {
  await Promise.all(tempDirs.map((dir) => rm(dir, { recursive: true, force: true })));
  tempDirs.length = 0;
});

describe("preview check script", () => {
  it("parses preview check args with defaults", () => {
    expect(parsePreviewCheckArgs(["node", "preview-check.js"])).toEqual({
      url: "http://127.0.0.1:3100/",
      outputDir: "output/playwright",
      validationLogPath: "llm-wiki/validation-log.md",
      notifyConnectors: []
    });
  });

  it("parses Telegram and Discord notification targets", () => {
    expect(parsePreviewCheckArgs(["node", "preview-check.js", "--notify", "telegram,discord"])).toMatchObject({
      notifyConnectors: ["telegram", "discord"]
    });
  });

  it("builds Korean validation log entry from capture output", () => {
    const entry = buildPreviewCheckLogEntry({
      command: "npm run preview:check",
      captureOutput: [
        "viewport=desktop",
        "screenshot=output/playwright/goal-mode-desktop.png",
        "consoleErrors=0",
        "viewport=mobile",
        "screenshot=output/playwright/goal-mode-mobile.png",
        "consoleErrors=0"
      ].join("\n")
    });

    expect(entry).toContain("## ");
    expect(entry).toContain("Preview Check 자동 기록");
    expect(entry).toContain("명령: `npm run preview:check`");
    expect(entry).toContain("결과: PASS.");
    expect(entry).toContain("consoleErrors=0");
    expect(entry).toContain("통합 검사:");
    expect(entry).toContain("desktop:console:clean");
  });

  it("records notification delivery results without requiring real secrets", async () => {
    const tempDir = await mkdtemp(join(tmpdir(), "preview-check-"));
    tempDirs.push(tempDir);
    const validationLogPath = join(tempDir, "validation-log.md");

    await runPreviewCheck(
      {
        url: "http://127.0.0.1:3100/",
        outputDir: "output/playwright",
        validationLogPath,
        notifyConnectors: ["telegram", "discord"]
      },
      {
        capture: async () => "viewport=desktop\nconsoleErrors=0\nviewport=mobile\nconsoleErrors=0",
        env: {}
      }
    );

    const log = await readFile(validationLogPath, "utf8");

    expect(log).toContain("notify=telegram status=skipped reason=Missing required secrets.");
    expect(log).toContain("notify=discord status=skipped reason=Missing required secrets.");
  });
});
