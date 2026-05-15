export type HarnessMenuItem = {
  id: string;
  label: string;
  phase: "mvp" | "extension" | "placeholder";
};

export function getHarnessMenu(): HarnessMenuItem[] {
  return [
    { id: "dashboard", label: "Dashboard", phase: "mvp" },
    { id: "jh-goal-mode", label: "JH Goal Mode", phase: "mvp" },
    { id: "session-handoff", label: "Session Handoff", phase: "mvp" },
    { id: "telegram", label: "Telegram", phase: "extension" },
    { id: "discord", label: "Discord", phase: "extension" },
    { id: "external-mobile", label: "External Mobile", phase: "extension" },
    { id: "llm-providers", label: "LLM Providers", phase: "mvp" },
    { id: "github", label: "GitHub", phase: "extension" },
    { id: "obsidian-llm-wiki", label: "Obsidian / LLM Wiki", phase: "mvp" },
    { id: "preview-errors", label: "Preview / Capture / Errors", phase: "extension" },
    { id: "plugins", label: "Plugins", phase: "extension" },
    { id: "skills", label: "Skills", phase: "extension" },
    { id: "templates", label: "Templates", phase: "extension" },
    { id: "framework-harness", label: "Framework Harness", phase: "placeholder" },
    { id: "ide-adapters", label: "IDE Adapters", phase: "extension" },
    { id: "tmux-2x2", label: "tmux 2x2", phase: "extension" },
    { id: "settings-upgrade", label: "Settings / Upgrade", phase: "mvp" }
  ];
}
