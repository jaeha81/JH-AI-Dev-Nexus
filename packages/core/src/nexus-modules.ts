export type NexusModulePolicy = "mvp" | "adapter-only" | "placeholder" | "deferred";

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
  inputs: string[];
  outputs: string[];
  connectsTo: string[];
  blockedActions: string[];
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
    inputs: ["message queue", "review status", "handoff event"],
    outputs: ["collaboration state", "review queue summary"],
    connectsTo: ["goal-mode", "llm-wiki"],
    blockedActions: ["reminder spam", "unbounded queue writes"]
  }
];

export function getNexusModules(): readonly NexusModule[] {
  return nexusModules;
}

export function getNexusModuleSummary() {
  const blockedActions = Array.from(new Set(nexusModules.flatMap((module) => module.blockedActions))).sort();

  return {
    total: nexusModules.length,
    mvpReady: nexusModules.filter((module) => module.mvpPolicy === "mvp").length,
    adapterOnly: nexusModules.filter((module) => module.mvpPolicy === "adapter-only").length,
    placeholder: nexusModules.filter((module) => module.mvpPolicy === "placeholder").length,
    deferred: nexusModules.filter((module) => module.mvpPolicy === "deferred").length,
    blockedActions
  };
}
