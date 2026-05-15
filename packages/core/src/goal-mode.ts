export type GoalTaskCategory =
  | "new feature"
  | "bug fix"
  | "refactor"
  | "UI/UX"
  | "backend/API"
  | "database/storage"
  | "automation"
  | "documentation"
  | "test/verification"
  | "deployment/environment";

export type ExecutionRoute =
  | "Claude first"
  | "Codex first"
  | "Claude -> Codex -> Claude"
  | "Codex -> Claude Review";

export type RiskLevel = "low" | "medium" | "high";

export type GoalModeInput = {
  task: string;
  projectName?: string;
  targetFolder?: string;
  allowedScope?: string;
  forbiddenActions?: string;
  verificationCommands?: string[];
  riskLevel?: RiskLevel;
  strictVerification?: boolean;
  safeMode?: boolean;
};

export type GoalModePackage = {
  category: GoalTaskCategory;
  recommendedRoute: ExecutionRoute;
  codexPrompt: string;
  claudePrompt: string;
  verificationChecklist: string[];
  stopCondition: string;
  finalReportTemplate: string;
  riskIndicators: string[];
  warnings: string[];
};

export type GoalModePhase = "planning" | "red" | "green" | "verification" | "documentation";

export type GoalModeStatus = {
  mode: "JH Goal Mode";
  active: boolean;
  activeTask: string;
  phase: GoalModePhase;
  rules: string[];
};

export function createGoalModeStatus(input: { activeTask: string; phase: GoalModePhase }): GoalModeStatus {
  return {
    mode: "JH Goal Mode",
    active: true,
    activeTask: input.activeTask,
    phase: input.phase,
    rules: [
      "TDD first",
      "Report progress without pausing unless user approval is required",
      "Ask for design confirmation only when UI changes",
      "Run verification before completion"
    ]
  };
}

export function validateGoalInput(input: GoalModeInput): { ok: true } | { ok: false; error: string } {
  if (!input.task.trim()) {
    return { ok: false, error: "Task request is required." };
  }

  return { ok: true };
}

export function classifyGoalTask(task: string): GoalTaskCategory {
  const text = task.toLowerCase();

  if (/\b(fix|bug|broken|error|failing|regression)\b/.test(text)) return "bug fix";
  if (/\b(ui|ux|layout|button|screen|mobile|responsive|dark mode|design)\b/.test(text)) return "UI/UX";
  if (/\b(api|route|endpoint|server|backend)\b/.test(text)) return "backend/API";
  if (/\b(database|db|storage|sqlite|postgres|row|table|migration)\b/.test(text)) return "database/storage";
  if (/\b(automation|scheduled|cron|bot|workflow)\b/.test(text)) return "automation";
  if (/\b(doc|docs|readme|guide|manual)\b/.test(text)) return "documentation";
  if (/\b(test|verify|verification|qa|coverage)\b/.test(text)) return "test/verification";
  if (/\b(deploy|deployment|env|environment|production|release)\b/.test(text)) return "deployment/environment";
  if (/\b(refactor|cleanup|restructure|rename)\b/.test(text)) return "refactor";

  return "new feature";
}

export function generateGoalModePackage(input: GoalModeInput): GoalModePackage {
  const valid = validateGoalInput(input);
  if (!valid.ok) {
    throw new Error(valid.error);
  }

  const normalized = normalizeInput(input);
  const category = classifyGoalTask(normalized.task);
  const riskIndicators = detectRiskIndicators(normalized.task);
  const recommendedRoute = selectExecutionRoute(category, normalized.riskLevel, riskIndicators);
  const warnings = buildWarnings(normalized.safeMode, riskIndicators);
  const verificationChecklist = buildVerificationChecklist(
    normalized.verificationCommands,
    normalized.strictVerification
  );
  const stopCondition = buildStopCondition(normalized.safeMode);
  const finalReportTemplate = buildFinalReportTemplate();

  return {
    category,
    recommendedRoute,
    codexPrompt: buildCodexPrompt(normalized, category, recommendedRoute, verificationChecklist, stopCondition, finalReportTemplate),
    claudePrompt: buildClaudePrompt(normalized, category, recommendedRoute, verificationChecklist, stopCondition, finalReportTemplate),
    verificationChecklist,
    stopCondition,
    finalReportTemplate,
    riskIndicators,
    warnings
  };
}

function normalizeInput(input: GoalModeInput): Required<GoalModeInput> {
  return {
    task: input.task.trim(),
    projectName: input.projectName?.trim() || "JH Dev Nexus",
    targetFolder: input.targetFolder?.trim() || "current workspace",
    allowedScope: input.allowedScope?.trim() || "Only files directly required for this task",
    forbiddenActions:
      input.forbiddenActions?.trim() ||
      "No secret exposure, no production deployment, no destructive database access",
    verificationCommands:
      input.verificationCommands && input.verificationCommands.length > 0
        ? input.verificationCommands
        : ["npm run typecheck", "npm test", "npm run build"],
    riskLevel: input.riskLevel ?? "medium",
    strictVerification: input.strictVerification ?? true,
    safeMode: input.safeMode ?? true
  };
}

function selectExecutionRoute(
  category: GoalTaskCategory,
  riskLevel: RiskLevel,
  riskIndicators: string[]
): ExecutionRoute {
  if (riskLevel === "high" || riskIndicators.length > 0) return "Claude -> Codex -> Claude";
  if (category === "documentation" || category === "UI/UX") return "Claude first";
  if (category === "bug fix" || category === "test/verification") return "Codex first";
  return "Codex -> Claude Review";
}

function detectRiskIndicators(task: string): string[] {
  const text = task.toLowerCase();
  const indicators: string[] = [];

  if (/\b(secret|api keys?|token|credential|password)\b/.test(text)) indicators.push("secrets/API keys");
  if (/\b(production|deploy|release|billing|payment)\b/.test(text)) indicators.push("production/deployment");
  if (/\b(user data|personal data|pii|customer)\b/.test(text)) indicators.push("user data");
  if (/\b(delete|drop|truncate|wipe)\b/.test(text) && /\b(database|db|row|table|storage)\b/.test(text)) {
    indicators.push("database deletion");
  }

  return indicators;
}

function buildWarnings(safeMode: boolean, riskIndicators: string[]): string[] {
  const warnings: string[] = [];

  if (safeMode) {
    warnings.push("Safe mode active: destructive and production-related instructions are blocked.");
  }

  for (const indicator of riskIndicators) {
    warnings.push(`Risk indicator detected: ${indicator}.`);
  }

  return warnings;
}

function buildVerificationChecklist(commands: string[], strictVerification: boolean): string[] {
  const commandChecks = commands.map((command) => `Run ${command}`);
  const checks = [
    ...commandChecks,
    "Confirm Codex /goal prompt generation works",
    "Confirm Claude Code Goal Mode prompt generation works",
    "Confirm copy buttons work",
    "Confirm history/log behavior works",
    "Confirm existing commands and routes are not broken"
  ];

  if (strictVerification) {
    checks.push("Do not claim success unless static validation or build confirms the feature works");
  }

  return checks;
}

function buildStopCondition(safeMode: boolean): string {
  const base =
    "Stop if the task requires missing secrets, API keys, paid services, production credentials, destructive database access, or external permissions.";

  if (!safeMode) return base;

  return `${base} Safe mode blocks destructive actions, production deployment, secret exposure, and irreversible data changes.`;
}

function buildFinalReportTemplate(): string {
  return [
    "1. Completed Work",
    "- ...",
    "",
    "2. Files Changed",
    "- ...",
    "",
    "3. Added JH Goal Mode Features",
    "- ...",
    "",
    "4. Verification Run",
    "- ...",
    "",
    "5. Result",
    "- ...",
    "",
    "6. Remaining Risks",
    "- ...",
    "",
    "7. Recommended Next Step",
    "- ..."
  ].join("\n");
}

function buildCodexPrompt(
  input: Required<GoalModeInput>,
  category: GoalTaskCategory,
  route: ExecutionRoute,
  checklist: string[],
  stopCondition: string,
  finalReport: string
): string {
  return [
    "/goal",
    "",
    "Objective",
    `- ${input.task}`,
    "",
    "Context to inspect first",
    "- Read AGENTS.md, CLAUDE.md, README, package files, app routes, components, API routes, storage logic, command palette logic, prompt templates, and workspace configuration if present.",
    "- Identify existing command center, prompt generator, agent selector, slash-command panel, or workflow dashboard before editing.",
    "",
    "Scope",
    `- Project: ${input.projectName}`,
    `- Target folder: ${input.targetFolder}`,
    `- Category: ${category}`,
    `- Recommended route: ${route}`,
    `- Allowed scope: ${input.allowedScope}`,
    `- Forbidden files/actions: ${input.forbiddenActions}`,
    `- Risk level: ${input.riskLevel}`,
    "",
    "Implementation Requirements",
    "- Keep changes modular.",
    "- Reuse existing structures.",
    "- Do not introduce unnecessary dependencies.",
    "- Validate user input.",
    "- Preserve existing features.",
    input.safeMode ? "- Safe mode is active: block destructive and production-related instructions." : "- Safe mode is off.",
    "",
    "Verification",
    ...checklist.map((item) => `- ${item}`),
    "",
    "Stop Condition",
    `- ${stopCondition}`,
    "",
    "Final Report",
    finalReport
  ].join("\n");
}

function buildClaudePrompt(
  input: Required<GoalModeInput>,
  category: GoalTaskCategory,
  route: ExecutionRoute,
  checklist: string[],
  stopCondition: string,
  finalReport: string
): string {
  return [
    "You are operating in JH Goal Mode.",
    "",
    "Objective",
    `- ${input.task}`,
    "",
    "Before You Edit",
    "- Inspect existing project structure and reuse current patterns.",
    "- Do not rewrite the whole app unless explicitly required.",
    "- Do not expose secrets or perform destructive operations.",
    "",
    "Scope",
    `- Project: ${input.projectName}`,
    `- Target folder: ${input.targetFolder}`,
    `- Category: ${category}`,
    `- Recommended route: ${route}`,
    `- Allowed scope: ${input.allowedScope}`,
    `- Forbidden files/actions: ${input.forbiddenActions}`,
    `- Risk level: ${input.riskLevel}`,
    "",
    "Execution Plan",
    "- Identify relevant files.",
    "- Make the smallest safe change.",
    "- Keep Codex verification handoff clear.",
    "",
    "Implementation Requirements",
    "- Keep changes modular.",
    "- Reuse existing UI, state, storage, and template logic.",
    "- Store generated prompts using the simplest existing persistence pattern.",
    "",
    "Verification Loop",
    ...checklist.map((item) => `- ${item}`),
    "",
    "Stop Condition",
    `- ${stopCondition}`,
    "",
    "Final Report",
    finalReport
  ].join("\n");
}
