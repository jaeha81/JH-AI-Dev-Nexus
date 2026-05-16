import { execFileSync } from "node:child_process";
import { createReadStream, existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { createServer, type IncomingMessage } from "node:http";
import { dirname, extname, join, normalize, resolve } from "node:path";
import {
  createDefaultNexusModuleSettings,
  parseNexusModuleSettingsJson,
  setNexusModuleEnabled,
  stringifyNexusModuleSettings,
  type NexusModuleSettings
} from "../../../packages/core/src/nexus-module-settings.js";
import { getNexusModules, getNexusModuleSummary } from "../../../packages/core/src/nexus-modules.js";
import {
  createSessionHandoffInputFromContext,
  createSessionHandoffPlan,
  type SessionHandoffContextInput
} from "../../../packages/core/src/session-handoff.js";
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

function readTextIfExists(filePath: string): string {
  return existsSync(filePath) ? readFileSync(filePath, "utf8") : "";
}

function readGitStatusText(): string {
  try {
    return execFileSync("git", ["status", "--short"], { encoding: "utf8" });
  } catch {
    return "";
  }
}

function readDefaultSessionContext(): Omit<SessionHandoffContextInput, "productName"> {
  return {
    sessionBriefText: readTextIfExists(resolve("llm-wiki", "session-brief.md")),
    currentStateText: readTextIfExists(resolve("llm-wiki", "current-state.md")),
    handoffText: readTextIfExists(resolve("llm-wiki", "handoff-prompt.md")),
    validationLogText: readTextIfExists(resolve("llm-wiki", "validation-log.md")),
    gitStatusText: readGitStatusText()
  };
}

function readRequestBody(request: IncomingMessage): Promise<string> {
  return new Promise((resolveBody, reject) => {
    let body = "";
    request.on("data", (chunk) => {
      body += String(chunk);
      if (body.length > 4096) {
        reject(new Error("Request body is too large."));
        request.destroy();
      }
    });
    request.on("end", () => resolveBody(body));
    request.on("error", reject);
  });
}

export function readNexusModuleSettingsJson(settings: NexusModuleSettings = createDefaultNexusModuleSettings()): string {
  return stringifyNexusModuleSettings(settings);
}

export function updateNexusModuleSettingsJson(settings: NexusModuleSettings, body: string): string {
  const parsed = JSON.parse(body) as { moduleId?: unknown; enabled?: unknown };
  if (typeof parsed.moduleId !== "string" || typeof parsed.enabled !== "boolean") {
    throw new Error("moduleId and enabled are required.");
  }

  return stringifyNexusModuleSettings(setNexusModuleEnabled(settings, parsed.moduleId, parsed.enabled));
}

function readNexusModuleSettingsFile(settingsPath = resolve(".agent", "module-settings.json")): NexusModuleSettings {
  return existsSync(settingsPath)
    ? parseNexusModuleSettingsJson(readFileSync(settingsPath, "utf8"))
    : createDefaultNexusModuleSettings();
}

function writeNexusModuleSettingsFile(settings: NexusModuleSettings, settingsPath = resolve(".agent", "module-settings.json")) {
  mkdirSync(dirname(settingsPath), { recursive: true });
  writeFileSync(settingsPath, stringifyNexusModuleSettings(settings), "utf8");
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

export function readNexusModulesJson(
  env: Record<string, string | undefined> = process.env,
  settings: NexusModuleSettings = readNexusModuleSettingsFile()
): string {
  return JSON.stringify({
    summary: getNexusModuleSummary({ env, settings }),
    settings,
    modules: getNexusModules({ env, settings })
  });
}

export function readSessionHandoffJson(context = readDefaultSessionContext()): string {
  return JSON.stringify(
    createSessionHandoffPlan(createSessionHandoffInputFromContext({
      productName: "JH AI Dev Nexus",
      ...context
    }))
  );
}

export function startPreviewServer(config = createPreviewServerConfig()): ReturnType<typeof createServer> {
  const server = createServer((request, response) => {
    const requestedUrl = new URL(request.url ?? "/", `http://${config.host}:${config.port}`);
    if (requestedUrl.pathname === "/api/modules") {
      response.writeHead(200, { "content-type": "application/json; charset=utf-8" });
      response.end(readNexusModulesJson());
      return;
    }

    if (requestedUrl.pathname === "/api/module-settings") {
      if (request.method === "GET") {
        response.writeHead(200, { "content-type": "application/json; charset=utf-8" });
        response.end(readNexusModuleSettingsJson(readNexusModuleSettingsFile()));
        return;
      }

      if (request.method === "POST") {
        readRequestBody(request)
          .then((body) => {
            const updated = updateNexusModuleSettingsJson(readNexusModuleSettingsFile(), body);
            writeNexusModuleSettingsFile(parseNexusModuleSettingsJson(updated));
            response.writeHead(200, { "content-type": "application/json; charset=utf-8" });
            response.end(updated);
          })
          .catch((error: unknown) => {
            response.writeHead(400, { "content-type": "application/json; charset=utf-8" });
            response.end(JSON.stringify({ error: error instanceof Error ? error.message : "Invalid module settings." }));
          });
        return;
      }

      response.writeHead(405, { "content-type": "application/json; charset=utf-8" });
      response.end(JSON.stringify({ error: "Method not allowed." }));
      return;
    }

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
