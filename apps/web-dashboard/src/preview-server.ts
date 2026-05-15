import { createReadStream, existsSync, readFileSync } from "node:fs";
import { createServer } from "node:http";
import { extname, join, normalize, resolve } from "node:path";
import { createSessionHandoffPlan } from "../../../packages/core/src/session-handoff.js";
import { getMobileConnectorReadiness } from "../../../packages/integrations/src/mobile-connectors.js";
import { createProviderDryRun } from "../../../packages/providers/src/provider-registry.js";

export type PreviewServerConfig = {
  host: "127.0.0.1";
  port: number;
  rootDir: string;
};

export type ResolvedPreviewAsset =
  | { ok: true; filePath: string }
  | { ok: false; filePath: string; error: string };

export type RecentValidationResult = {
  title: string;
  command: string;
  status: string;
  details: string[];
};

export function createPreviewServerConfig(): PreviewServerConfig {
  return {
    host: "127.0.0.1",
    port: 3100,
    rootDir: resolve("apps", "web-dashboard")
  };
}

export function resolvePreviewAsset(requestPath: string, rootDir: string): ResolvedPreviewAsset {
  const root = resolve(rootDir);
  const cleanPath = requestPath === "/" ? "index.html" : requestPath.replace(/^\/+/, "");
  const filePath = resolve(root, normalize(cleanPath));

  if (!filePath.startsWith(root)) {
    return {
      ok: false,
      filePath,
      error: "Preview asset path is outside dashboard root."
    };
  }

  return {
    ok: true,
    filePath
  };
}

export function resolvePreviewArtifact(requestPath: string, outputDir: string): ResolvedPreviewAsset {
  const root = resolve(outputDir);
  const cleanPath = requestPath.replace(/^\/artifacts\/playwright\/?/, "");
  const filePath = resolve(root, normalize(cleanPath));

  if (!filePath.startsWith(root)) {
    return {
      ok: false,
      filePath,
      error: "Preview artifact path is outside output/playwright."
    };
  }

  return {
    ok: true,
    filePath
  };
}

export function getContentType(filePath: string): string {
  const extension = extname(filePath).toLowerCase();

  if (extension === ".html") return "text/html; charset=utf-8";
  if (extension === ".css") return "text/css; charset=utf-8";
  if (extension === ".js") return "text/javascript; charset=utf-8";
  if (extension === ".json") return "application/json; charset=utf-8";
  if (extension === ".png") return "image/png";

  return "application/octet-stream";
}

function parseBulletValue(line: string, label: string): string | undefined {
  const prefix = `- ${label}: `;
  if (!line.startsWith(prefix)) return undefined;
  return line.slice(prefix.length).replace(/^`|`$/g, "").replace(/\.$/, "");
}

export function readRecentValidationResults(logContent: string, limit = 3): RecentValidationResult[] {
  return logContent
    .split(/\n(?=## )/)
    .filter((section) => section.includes("Preview Check 자동 기록"))
    .map((section) => {
      const lines = section.split("\n").map((line) => line.trimEnd());
      const title = lines[0].replace(/^##\s+/, "");
      const command = lines.map((line) => parseBulletValue(line, "명령")).find(Boolean) ?? "";
      const status = lines.map((line) => parseBulletValue(line, "결과")).find(Boolean) ?? "UNKNOWN";
      const details = lines
        .filter((line) => line.trimStart().startsWith("- ") && line.startsWith("  - "))
        .map((line) => line.trim().replace(/^- /, ""));

      return { title, command, status, details };
    })
    .slice(-limit)
    .reverse();
}

function readValidationLogJson(): string {
  const logPath = resolve("llm-wiki", "validation-log.md");
  const results = existsSync(logPath) ? readRecentValidationResults(readFileSync(logPath, "utf8")) : [];
  return JSON.stringify({ results });
}

export function readMobileReadinessJson(env: Record<string, string | undefined> = process.env): string {
  return JSON.stringify({ connectors: getMobileConnectorReadiness(env) });
}

export function readProviderReadinessJson(env: Record<string, string | undefined> = process.env): string {
  return JSON.stringify({
    providers: [
      createProviderDryRun({ providerId: "openai", capability: "prompt:generate", env }),
      createProviderDryRun({ providerId: "anthropic", capability: "prompt:generate", env })
    ]
  });
}

export function readSessionHandoffJson(): string {
  return JSON.stringify(
    createSessionHandoffPlan({
      productName: "JH AI Dev Nexus",
      completedWork: ["Current session summary generation"],
      pendingWork: ["Update LLM Wiki", "Save Obsidian session", "Start next session from generated prompt"],
      validationCommands: ["npm.cmd run typecheck", "npm.cmd test", "npm.cmd run build", "npm.cmd run wiki:check"],
      changedFiles: []
    })
  );
}

export function startPreviewServer(config = createPreviewServerConfig()): ReturnType<typeof createServer> {
  const server = createServer((request, response) => {
    const requestedUrl = new URL(request.url ?? "/", `http://${config.host}:${config.port}`);
    if (requestedUrl.pathname === "/api/provider-readiness") {
      response.writeHead(200, { "content-type": "application/json; charset=utf-8" });
      response.end(readProviderReadinessJson());
      return;
    }

    if (requestedUrl.pathname === "/api/session-handoff") {
      response.writeHead(200, { "content-type": "application/json; charset=utf-8" });
      response.end(readSessionHandoffJson());
      return;
    }

    if (requestedUrl.pathname === "/api/mobile-readiness") {
      response.writeHead(200, { "content-type": "application/json; charset=utf-8" });
      response.end(readMobileReadinessJson());
      return;
    }

    if (requestedUrl.pathname === "/api/preview-validation") {
      response.writeHead(200, { "content-type": "application/json; charset=utf-8" });
      response.end(readValidationLogJson());
      return;
    }

    if (requestedUrl.pathname.startsWith("/artifacts/playwright/")) {
      const resolvedArtifact = resolvePreviewArtifact(requestedUrl.pathname, resolve("output", "playwright"));

      if (!resolvedArtifact.ok || !existsSync(resolvedArtifact.filePath)) {
        response.writeHead(resolvedArtifact.ok ? 404 : 403, { "content-type": "text/plain; charset=utf-8" });
        response.end(resolvedArtifact.ok ? "Preview artifact not found." : resolvedArtifact.error);
        return;
      }

      response.writeHead(200, { "content-type": getContentType(resolvedArtifact.filePath) });
      createReadStream(resolvedArtifact.filePath).pipe(response);
      return;
    }

    const resolved = resolvePreviewAsset(requestedUrl.pathname, config.rootDir);

    if (!resolved.ok) {
      response.writeHead(403, { "content-type": "text/plain; charset=utf-8" });
      response.end(resolved.error);
      return;
    }

    const filePath = existsSync(resolved.filePath) ? resolved.filePath : join(config.rootDir, "index.html");

    response.writeHead(200, { "content-type": getContentType(filePath) });
    createReadStream(filePath).pipe(response);
  });

  server.listen(config.port, config.host);
  return server;
}
