import { createDefaultConfig } from "../../../packages/core/src/config.js";
import { createGoalModeStatus, generateGoalModePackage, validateGoalInput } from "../../../packages/core/src/goal-mode.js";
import { getHarnessMenu } from "../../../packages/core/src/menu.js";
import { checkWikiDocuments, getRequiredWikiDocuments } from "../../../packages/core/src/wiki.js";
import { createSessionHandoffPlan } from "../../../packages/core/src/session-handoff.js";
import {
  getMobileConnectorReadiness,
  getMobileConnectors,
  isMobileCapabilityAllowed
} from "../../../packages/integrations/src/mobile-connectors.js";
import { createPreviewCheck } from "../../../packages/integrations/src/preview-check.js";
import { createPreviewCapturePlan } from "../../../packages/integrations/src/preview-capture.js";
import {
  createProviderDryRun,
  getProviderRegistry,
  isProviderCapabilityAllowed
} from "../../../packages/providers/src/provider-registry.js";
import { createProviderRuntimeRequest } from "../../../packages/providers/src/provider-runtime.js";
import type {
  BlockedProviderCapability,
  ProviderCapability,
  ProviderId
} from "../../../packages/providers/src/provider-types.js";

export type CommandResult = {
  exitCode: number;
  stdout: string;
  stderr: string;
};

export type CommandDependencies = {
  env?: Record<string, string | undefined>;
};

export function runCommand(args: string[], dependencies: CommandDependencies = {}): CommandResult {
  const [command, ...rest] = args;

  if (command === "status") {
    const config = createDefaultConfig();
    const goalStatus = createGoalModeStatus({
      activeTask: "Continue JH Dev Nexus MVP development",
      phase: "verification"
    });
    return {
      exitCode: 0,
      stdout: [
        config.appName,
        `Local: ${config.local.host}:${config.local.port}`,
        `LLM Wiki docs: ${getRequiredWikiDocuments().length}`,
        `Mode: ${goalStatus.mode}`,
        `Goal Mode active: ${goalStatus.active}`,
        `Goal Mode phase: ${goalStatus.phase}`,
        `Goal Mode task: ${goalStatus.activeTask}`
      ].join("\n"),
      stderr: ""
    };
  }

  if (command === "menu") {
    return {
      exitCode: 0,
      stdout: getHarnessMenu().map((item) => item.id).join("\n"),
      stderr: ""
    };
  }

  if (command === "mobile") {
    return {
      exitCode: 0,
      stdout: getMobileConnectors()
        .map((connector) => {
          const shellAllowed = isMobileCapabilityAllowed(connector.id, "shell:execute");
          return [
            connector.id,
            `surface=${connector.surface}`,
            `capabilities=${connector.allowedCapabilities.join(",")}`,
            `shell:execute=${shellAllowed}`
          ].join(" ");
        })
        .join("\n"),
      stderr: ""
    };
  }

  if (command === "mobile:status") {
    return {
      exitCode: 0,
      stdout: getMobileConnectorReadiness()
        .map((item) => {
          const missing = item.missingSecrets.length ? item.missingSecrets.join(",") : "none";
          return `${item.connectorId} ready=${item.ready} missing=${missing}`;
        })
        .join("\n"),
      stderr: ""
    };
  }

  if (command === "provider") {
    return {
      exitCode: 0,
      stdout: getProviderRegistry()
        .map((provider) => {
          const secretReadAllowed = isProviderCapabilityAllowed(provider.id, "secret:read");
          return [
            provider.id,
            `label=${provider.label}`,
            `envKey=${provider.envKey}`,
            `defaultModel=${provider.defaultModel}`,
            `status=${provider.status}`,
            `allowed=${provider.allowedCapabilities.join(",")}`,
            `blocked=${provider.blockedCapabilities.join(",")}`,
            `secret:read=${secretReadAllowed}`
          ].join(" ");
        })
        .join("\n"),
      stderr: ""
    };
  }

  if (command === "provider:dry-run") {
    const [providerId = "openai", capability = "prompt:generate"] = rest;
    const result = createProviderDryRun({
      providerId: providerId as ProviderId,
      capability: capability as ProviderCapability | BlockedProviderCapability,
      env: dependencies.env
    });
    const missing = result.missingEnv.length ? result.missingEnv.join(",") : "none";
    const stdout = [
      `provider=${result.providerId}`,
      `capability=${result.capability}`,
      `ready=${result.ready}`,
      `missing=${missing}`,
      `network=${result.network}`
    ].join("\n");

    return {
      exitCode: result.ok ? 0 : 1,
      stdout,
      stderr: result.errors.join("\n")
    };
  }

  if (command === "provider:runtime-plan") {
    const [providerId = "openai", capability = "prompt:generate", ...promptParts] = rest;
    const result = createProviderRuntimeRequest({
      providerId: providerId as ProviderId,
      capability: capability as ProviderCapability | BlockedProviderCapability,
      prompt: promptParts.join(" ").trim() || "Hello",
      env: dependencies.env
    });
    const stdout = [
      `provider=${result.providerId}`,
      `capability=${result.capability}`,
      `network=${result.network}`,
      ...(result.request
        ? [
            `url=${result.request.url}`,
            `method=${result.request.method}`,
            `authorizationEnv=${result.request.headers.authorizationEnv}`,
            `model=${result.request.body.model}`
          ]
        : [])
    ].join("\n");

    return {
      exitCode: result.ok ? 0 : 1,
      stdout,
      stderr: result.errors.join("\n")
    };
  }

  if (command === "preview") {
    const [url] = rest;
    const result = createPreviewCheck({
      url: url ?? "",
      mode: "dry-run"
    });

    if (!result.ok) {
      return {
        exitCode: 1,
        stdout: [
          `url=${result.url}`,
          `mode=${result.mode}`,
          `checks=${result.checks.join(",")}`
        ].join("\n"),
        stderr: result.errors.join("\n")
      };
    }

    return {
      exitCode: 0,
      stdout: [
        `url=${result.url}`,
        `mode=${result.mode}`,
        `checks=${result.checks.join(",")}`,
        "next=npm run preview:check",
        "summary=capture-summary"
      ].join("\n"),
      stderr: ""
    };
  }

  if (command === "preview:capture") {
    const [url, fileName = "goal-mode.png"] = rest;
    const plan = createPreviewCapturePlan({
      url: url ?? "",
      outputDir: "output/playwright",
      fileName
    });

    if (!plan.ok || !plan.command) {
      return {
        exitCode: 1,
        stdout: [`url=${plan.url}`, `screenshot=${plan.screenshotPath}`].join("\n"),
        stderr: plan.errors.join("\n") || "Preview capture command could not be created."
      };
    }

    return {
      exitCode: 0,
      stdout: [
        `url=${plan.url}`,
        `screenshot=${plan.screenshotPath}`,
        `command=${plan.command.executable} ${plan.command.args.join(" ")}`
      ].join("\n"),
      stderr: ""
    };
  }

  if (command === "preview:capture:all") {
    const [url] = rest;
    const desktopPlan = createPreviewCapturePlan({
      url: url ?? "",
      outputDir: "output/playwright",
      fileName: "goal-mode-desktop.png"
    });
    const mobilePlan = createPreviewCapturePlan({
      url: url ?? "",
      outputDir: "output/playwright",
      fileName: "goal-mode-mobile.png"
    });

    if (!desktopPlan.ok || !mobilePlan.ok) {
      return {
        exitCode: 1,
        stdout: [`url=${desktopPlan.url}`].join("\n"),
        stderr: [...desktopPlan.errors, ...mobilePlan.errors].join("\n")
      };
    }

    return {
      exitCode: 0,
      stdout: [
        `url=${desktopPlan.url}`,
        "desktop=output/playwright/goal-mode-desktop.png",
        "mobile=output/playwright/goal-mode-mobile.png",
        "command=npm run preview:capture:all"
      ].join("\n"),
      stderr: ""
    };
  }

  if (command === "preview:check") {
    return {
      exitCode: 0,
      stdout: [
        "command=npm run preview:check",
        "url=http://127.0.0.1:3100/",
        "desktop=output/playwright/goal-mode-desktop.png",
        "mobile=output/playwright/goal-mode-mobile.png",
        "validationLog=llm-wiki/validation-log.md",
        "summary=capture-summary"
      ].join("\n"),
      stderr: ""
    };
  }

  if (command === "session:handoff") {
    const plan = createSessionHandoffPlan({
      productName: "JH AI Dev Nexus",
      completedWork: ["Generate current session summary", "Prepare LLM Wiki update plan"],
      pendingWork: ["Review generated handoff prompt", "Run required verification before session close"],
      validationCommands: ["npm.cmd run typecheck", "npm.cmd test", "npm.cmd run build", "npm.cmd run wiki:check"],
      changedFiles: []
    });

    return {
      exitCode: 0,
      stdout: [
        `module=${plan.moduleId}`,
        `summary=${plan.summary}`,
        `wiki=${plan.wikiUpdates.join(",")}`,
        ...plan.commands.map((item) => `command=${item}`),
        `nextSessionPrompt=${plan.nextSessionPrompt}`
      ].join("\n"),
      stderr: ""
    };
  }

  if (command === "goal") {
    const task = rest.join(" ");
    const valid = validateGoalInput({ task });

    if (!valid.ok) {
      return {
        exitCode: 1,
        stdout: "",
        stderr: valid.error
      };
    }

    const goal = generateGoalModePackage({
      task,
      projectName: "JH Dev Nexus",
      targetFolder: "current workspace",
      allowedScope: "Only the files needed for this task",
      forbiddenActions: "No secret exposure, no production deploy, no destructive database access",
      verificationCommands: ["npm run typecheck", "npm test", "npm run build"],
      riskLevel: "medium",
      strictVerification: true,
      safeMode: true
    });

    return {
      exitCode: 0,
      stdout: [
        "Recommended Route",
        goal.recommendedRoute,
        "",
        "Codex Prompt",
        goal.codexPrompt,
        "",
        "Claude Code Prompt",
        goal.claudePrompt,
        "",
        "Verification Checklist",
        ...goal.verificationChecklist.map((item) => `- ${item}`)
      ].join("\n"),
      stderr: ""
    };
  }

  if (command === "wiki:check") {
    const result = checkWikiDocuments();
    return {
      exitCode: result.ok ? 0 : 1,
      stdout: `Found wiki docs: ${result.found.join(", ")}`,
      stderr: result.missing.length > 0 ? `Missing wiki docs: ${result.missing.join(", ")}` : ""
    };
  }

  return {
    exitCode: 1,
    stdout: "",
    stderr: `Unknown command: ${command ?? ""}`.trim()
  };
}
