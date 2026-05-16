import { createDefaultConfig } from "./config.js";
import {
  createDefaultNexusModuleSettings,
  isNexusModuleEnabled,
  type NexusModuleSettings
} from "./nexus-module-settings.js";

export type NexusModulePolicy = "mvp" | "adapter-only" | "placeholder" | "deferred";
export type NexusModuleStatus = "ready" | "needs-configuration" | "disabled";

export type NexusModuleRole =
  | "orchestration-core"
  | "memory-module"
  | "provider-module"
  | "mobile-module"
  | "source-control-module"
  | "knowledge-module"
  | "verification-module"
  | "extension-module"
  | "ide-module"
  | "terminal-module"
  | "template-module"
  | "collaboration-module";

export type NexusModule = {
  id: string;
  label: string;
  role: NexusModuleRole;
  owner: "codex";
  mvpPolicy: NexusModulePolicy;
  enabled: boolean;
  configured: boolean;
  missingRequirements: string[];
  status: NexusModuleStatus;
  inputs: string[];
  outputs: string[];
  connectsTo: string[];
  blockedActions: string[];
};

export type NexusModuleRuntimeOptions = {
  env?: Record<string, string | undefined>;
  settings?: NexusModuleSettings;
};

const sharedBlockedActions = [
  "secret exposure",
  "production deploy",
  "unlimited command execution",
  "unsafe auto click"
];

const nexusModules: NexusModule[] = [
  {
    id: "goal-mode",
    label: "Goal Mode",
    role: "orchestration-core",
    owner: "codex",
    mvpPolicy: "mvp",
    enabled: true,
    configured: true,
    missingRequirements: [],
    status: "ready",
    inputs: ["user goal", "project scope", "verification commands"],
    outputs: ["Codex work plan", "Claude handoff", "verification checklist"],
    connectsTo: ["llm-wiki", "preview-check", "agent-room"],
    blockedActions: sharedBlockedActions
  },
  {
    id: "session-handoff",
    label: "Session Handoff",
    role: "memory-module",
    owner: "codex",
    mvpPolicy: "mvp",
    enabled: true,
    configured: true,
    missingRequirements: [],
    status: "ready",
    inputs: ["completed work", "pending work", "validation commands", "changed files"],
    outputs: ["session summary", "LLM Wiki update plan", "Obsidian save command", "next-session prompt"],
    connectsTo: ["goal-mode", "llm-wiki", "obsidian"],
    blockedActions: ["secret exposure", "automatic commit", "automatic push", "unapproved vault overwrite"]
  },
  {
    id: "llm-wiki",
    label: "LLM Wiki",
    role: "memory-module",
    owner: "codex",
    mvpPolicy: "mvp",
    enabled: true,
    configured: true,
    missingRequirements: [],
    status: "ready",
    inputs: ["project state", "validation log", "handoff prompt"],
    outputs: ["session memory", "next-session handoff"],
    connectsTo: ["goal-mode", "obsidian"],
    blockedActions: ["overwrite canonical docs without validation"]
  },
  {
    id: "providers",
    label: "Anthropic / GPT Providers",
    role: "provider-module",
    owner: "codex",
    mvpPolicy: "mvp",
    enabled: true,
    configured: false,
    missingRequirements: ["OPENAI_API_KEY or ANTHROPIC_API_KEY"],
    status: "needs-configuration",
    inputs: ["provider id", "capability", "prompt", "env names"],
    outputs: ["dry-run result", "runtime request plan", "sanitized response"],
    connectsTo: ["goal-mode", "preview-check"],
    blockedActions: ["secret exposure", "billing modification", "production deploy"]
  },
  {
    id: "telegram-mobile",
    label: "Telegram / Mobile",
    role: "mobile-module",
    owner: "codex",
    mvpPolicy: "mvp",
    enabled: true,
    configured: false,
    missingRequirements: ["TELEGRAM_BOT_TOKEN or DISCORD_WEBHOOK_URL"],
    status: "needs-configuration",
    inputs: ["status request", "link", "notification event"],
    outputs: ["readiness status", "safe notification", "mobile access guide"],
    connectsTo: ["goal-mode", "preview-check"],
    blockedActions: ["shell execution", "deploy execution", "secret exposure"]
  },
  {
    id: "github",
    label: "GitHub Line",
    role: "source-control-module",
    owner: "codex",
    mvpPolicy: "adapter-only",
    enabled: true,
    configured: false,
    missingRequirements: ["GitHub connector auth"],
    status: "needs-configuration",
    inputs: ["repo path", "branch", "PR or issue id"],
    outputs: ["status summary", "verification route", "handoff note"],
    connectsTo: ["llm-wiki", "goal-mode"],
    blockedActions: ["force push", "destructive reset", "secret exposure"]
  },
  {
    id: "obsidian",
    label: "Obsidian",
    role: "knowledge-module",
    owner: "codex",
    mvpPolicy: "adapter-only",
    enabled: true,
    configured: false,
    missingRequirements: ["Obsidian vault path"],
    status: "needs-configuration",
    inputs: ["wiki path", "session summary"],
    outputs: ["vault-openable markdown", "session record"],
    connectsTo: ["llm-wiki"],
    blockedActions: ["overwrite vault notes without user request"]
  },
  {
    id: "preview-check",
    label: "Development Preview",
    role: "verification-module",
    owner: "codex",
    mvpPolicy: "mvp",
    enabled: true,
    configured: true,
    missingRequirements: [],
    status: "ready",
    inputs: ["local preview URL", "viewport", "validation command"],
    outputs: ["screenshot", "console error report", "validation log entry"],
    connectsTo: ["goal-mode", "telegram-mobile"],
    blockedActions: ["external URL crawling", "unsafe auto click"]
  },
  {
    id: "plugin-system",
    label: "Plugin System",
    role: "extension-module",
    owner: "codex",
    mvpPolicy: "placeholder",
    enabled: false,
    configured: false,
    missingRequirements: ["plugin manifest registry"],
    status: "disabled",
    inputs: ["plugin manifest", "settings"],
    outputs: ["enabled plugin list", "safe permissions"],
    connectsTo: ["skill-registry"],
    blockedActions: ["unreviewed code execution"]
  },
  {
    id: "skill-registry",
    label: "Skill Registry",
    role: "extension-module",
    owner: "codex",
    mvpPolicy: "placeholder",
    enabled: false,
    configured: false,
    missingRequirements: ["skill install metadata"],
    status: "disabled",
    inputs: ["skill manifest", "skill docs"],
    outputs: ["installed skills", "validation result"],
    connectsTo: ["plugin-system", "goal-mode"],
    blockedActions: ["install without validation"]
  },
  {
    id: "ide-adapters",
    label: "IDE Adapters",
    role: "ide-module",
    owner: "codex",
    mvpPolicy: "adapter-only",
    enabled: true,
    configured: false,
    missingRequirements: ["selected IDE adapter"],
    status: "needs-configuration",
    inputs: ["selected IDE", "project path", "command template"],
    outputs: ["launch command", "handoff document"],
    connectsTo: ["goal-mode", "templates"],
    blockedActions: ["direct IDE internal automation"]
  },
  {
    id: "tmux-grid",
    label: "tmux 2x2",
    role: "terminal-module",
    owner: "codex",
    mvpPolicy: "adapter-only",
    enabled: true,
    configured: false,
    missingRequirements: ["tmux runtime"],
    status: "needs-configuration",
    inputs: ["workspace", "dev command", "test command"],
    outputs: ["dev/log/test/command layout plan"],
    connectsTo: ["preview-check"],
    blockedActions: ["unlimited command execution"]
  },
  {
    id: "templates",
    label: "Design / User / Developer Templates",
    role: "template-module",
    owner: "codex",
    mvpPolicy: "mvp",
    enabled: true,
    configured: true,
    missingRequirements: [],
    status: "ready",
    inputs: ["template type", "theme", "target workflow"],
    outputs: ["UI template", "developer template", "user template"],
    connectsTo: ["goal-mode", "ide-adapters"],
    blockedActions: ["overwrite user templates without confirmation"]
  },
  {
    id: "agent-room",
    label: "Agent Room",
    role: "collaboration-module",
    owner: "codex",
    mvpPolicy: "adapter-only",
    enabled: true,
    configured: false,
    missingRequirements: ["Agent Room queue endpoint"],
    status: "needs-configuration",
    inputs: ["message queue", "review status", "handoff event"],
    outputs: ["collaboration state", "review queue summary"],
    connectsTo: ["goal-mode", "llm-wiki"],
    blockedActions: ["reminder spam", "unbounded queue writes"]
  }
];

function hasSetting(env: Record<string, string | undefined>, name: string): boolean {
  return Boolean(env[name]?.trim());
}

function withRuntimeStatus(
  module: NexusModule,
  env: Record<string, string | undefined>,
  settings: NexusModuleSettings
): NexusModule {
  const { secrets } = createDefaultConfig();
  const cloned = { ...module, missingRequirements: [...module.missingRequirements] };

  if (!isNexusModuleEnabled(settings, cloned.id)) {
    return {
      ...cloned,
      enabled: false,
      configured: false,
      missingRequirements: ["disabled by user setting"],
      status: "disabled"
    };
  }

  if (!cloned.enabled || cloned.status === "disabled") return cloned;

  if (cloned.id === "providers") {
    const configured = hasSetting(env, secrets.openai) || hasSetting(env, secrets.anthropic);
    return {
      ...cloned,
      configured,
      missingRequirements: configured ? [] : [`${secrets.openai} or ${secrets.anthropic}`],
      status: configured ? "ready" : "needs-configuration"
    };
  }

  if (cloned.id === "telegram-mobile") {
    const telegramConfigured = hasSetting(env, secrets.telegram) && hasSetting(env, secrets.telegramAllowedChatIds);
    const discordConfigured = hasSetting(env, secrets.discordWebhookUrl) && hasSetting(env, secrets.discordAllowedChannelIds);
    const configured = telegramConfigured || discordConfigured;
    return {
      ...cloned,
      configured,
      missingRequirements: configured
        ? []
        : [
            `${secrets.telegram}+${secrets.telegramAllowedChatIds} or ${secrets.discordWebhookUrl}+${secrets.discordAllowedChannelIds}`
          ],
      status: configured ? "ready" : "needs-configuration"
    };
  }

  if (cloned.id === "github") {
    const configured = hasSetting(env, secrets.github);
    return {
      ...cloned,
      configured,
      missingRequirements: configured ? [] : [secrets.github],
      status: configured ? "ready" : "needs-configuration"
    };
  }

  if (cloned.id === "obsidian") {
    const configured = hasSetting(env, secrets.obsidianVaultPath);
    return {
      ...cloned,
      configured,
      missingRequirements: configured ? [] : [secrets.obsidianVaultPath],
      status: configured ? "ready" : "needs-configuration"
    };
  }

  if (cloned.id === "agent-room") {
    const configured = hasSetting(env, secrets.agentRoomBaseUrl);
    return {
      ...cloned,
      configured,
      missingRequirements: configured ? [] : [secrets.agentRoomBaseUrl],
      status: configured ? "ready" : "needs-configuration"
    };
  }

  return cloned;
}

export function getNexusModules(options: NexusModuleRuntimeOptions = {}): readonly NexusModule[] {
  return nexusModules.map((module) =>
    withRuntimeStatus(module, options.env ?? {}, options.settings ?? createDefaultNexusModuleSettings())
  );
}

export function getNexusModuleSummary(options: NexusModuleRuntimeOptions = {}) {
  const modules = getNexusModules(options);
  const blockedActions = Array.from(new Set(modules.flatMap((module) => module.blockedActions))).sort();

  return {
    total: modules.length,
    mvpReady: modules.filter((module) => module.mvpPolicy === "mvp").length,
    adapterOnly: modules.filter((module) => module.mvpPolicy === "adapter-only").length,
    placeholder: modules.filter((module) => module.mvpPolicy === "placeholder").length,
    deferred: modules.filter((module) => module.mvpPolicy === "deferred").length,
    enabled: modules.filter((module) => module.enabled).length,
    configured: modules.filter((module) => module.configured).length,
    ready: modules.filter((module) => module.status === "ready").length,
    needsConfiguration: modules.filter((module) => module.status === "needs-configuration").length,
    disabled: modules.filter((module) => module.status === "disabled").length,
    blockedActions
  };
}
