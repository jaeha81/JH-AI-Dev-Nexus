export type SessionHandoffInput = {
  productName: string;
  completedWork: string[];
  pendingWork: string[];
  validationCommands: string[];
  changedFiles: string[];
};

export type SessionHandoffPlan = {
  moduleId: "session-handoff";
  summary: string;
  wikiUpdates: string[];
  commands: string[];
  nextSessionPrompt: string;
};

export type SessionHandoffContextInput = {
  productName: string;
  sessionBriefText?: string;
  currentStateText?: string;
  handoffText?: string;
  validationLogText?: string;
  gitStatusText?: string;
};

const wikiUpdates = [
  "llm-wiki/session-brief.md",
  "llm-wiki/handoff-prompt.md",
  "llm-wiki/current-state.md",
  "llm-wiki/validation-log.md"
];

const obsidianSaveCommand =
  "powershell -ExecutionPolicy Bypass -File D:\\ai프로젝트\\JH-Agent-Room\\scripts\\save-codex-session.ps1";

function bulletList(items: string[]): string {
  return items.length ? items.map((item) => `- ${item}`).join("\n") : "- None";
}

function unique(items: string[]): string[] {
  return [...new Set(items)];
}

function sanitizeItem(item: string): string {
  return item
    .replace(/sk-[A-Za-z0-9_-]+/g, "[redacted-secret]")
    .replace(/token=[^\s]+/gi, "token=[redacted-secret]")
    .trim();
}

function extractSectionBullets(content: string, headings: string[]): string[] {
  const lines = content.split(/\r?\n/);
  const bullets: string[] = [];
  let active = false;

  for (const rawLine of lines) {
    const line = rawLine.trim();
    const heading = line.replace(/^#+\s*/, "").toLowerCase();

    if (line.startsWith("#")) {
      active = headings.some((item) => heading.includes(item.toLowerCase()));
      continue;
    }

    if (active && line.startsWith("- ")) {
      bullets.push(sanitizeItem(line.slice(2).replace(/^`|`$/g, "")));
    }
  }

  return bullets.filter(Boolean);
}

function extractValidationCommands(...contents: string[]): string[] {
  const commands: string[] = [];

  for (const content of contents) {
    for (const match of content.matchAll(/`([^`]+)`/g)) {
      const command = sanitizeItem(match[1] ?? "");
      if (/^(npm(\.cmd)?\s|node\s)/.test(command)) {
        commands.push(command);
      }
    }
  }

  return unique(commands).slice(-8);
}

function parseChangedFiles(gitStatusText: string): string[] {
  return unique(
    gitStatusText
      .split(/\r?\n/)
      .filter((line) => line.trim())
      .map((line) => line.slice(3).trim().replace(/^"|"$/g, ""))
      .filter((filePath) => filePath && !filePath.startsWith(".env"))
  );
}

export function createSessionHandoffInputFromContext(input: SessionHandoffContextInput): SessionHandoffInput {
  const sessionBriefText = input.sessionBriefText ?? "";
  const currentStateText = input.currentStateText ?? "";
  const handoffText = input.handoffText ?? "";
  const validationLogText = input.validationLogText ?? "";

  const completedWork = unique([
    ...extractSectionBullets(sessionBriefText, ["Latest Completed Work", "Completed Work"]),
    ...extractSectionBullets(currentStateText, ["Latest Completed Work", "Completed Work"]),
    ...extractSectionBullets(handoffText, ["Latest Completed Work", "Completed Work"])
  ]);
  const pendingWork = unique([
    ...extractSectionBullets(sessionBriefText, ["Next Work", "Next Goal", "Remaining Required Verification"]),
    ...extractSectionBullets(currentStateText, ["Next Work", "Next Goal", "Remaining Required Verification"]),
    ...extractSectionBullets(handoffText, ["Next Work", "Next Goal", "Remaining Required Verification"])
  ]);
  const validationCommands = extractValidationCommands(sessionBriefText, handoffText, validationLogText);
  const changedFiles = parseChangedFiles(input.gitStatusText ?? "");

  return {
    productName: input.productName,
    completedWork,
    pendingWork,
    validationCommands,
    changedFiles
  };
}

export function createSessionHandoffPrompt(input: SessionHandoffInput): string {
  return [
    "작업 이어서 재개.",
    "",
    "현재 개발 기준:",
    `- 본 프로그램은 ${input.productName}다.`,
    "- JH AI Dev Nexus는 Agent Room 대시보드가 아니라 PC 설치형 AI 개발 운영 프로그램이다.",
    "- Agent Room은 본체가 아니라 collaboration-module이다.",
    "- Codex가 메인 개발자/오케스트레이터로 직접 구현, 테스트, 검증, LLM Wiki 갱신까지 진행한다.",
    "- Goal Mode로 계속 진행한다.",
    "- TDD 필수: 실패 테스트 먼저 작성 -> RED 확인 -> 구현 -> GREEN 확인.",
    "",
    "최근 완료:",
    bulletList(input.completedWork),
    "",
    "변경 파일:",
    bulletList(input.changedFiles),
    "",
    "검증 명령:",
    bulletList(input.validationCommands),
    "",
    "다음 작업:",
    bulletList(input.pendingWork),
    "",
    "주의:",
    "- secret/API key/token 값은 절대 노출하지 말 것.",
    "- 자동 배포, 무제한 명령 실행, 위험한 자동 클릭은 차단 또는 후순위로 분리할 것."
  ].join("\n");
}

export function createSessionHandoffPlan(input: SessionHandoffInput): SessionHandoffPlan {
  const summary = [
    `${input.productName} session handoff`,
    `completed=${input.completedWork.length}`,
    `pending=${input.pendingWork.length}`,
    `changedFiles=${input.changedFiles.length}`
  ].join(" ");

  return {
    moduleId: "session-handoff",
    summary,
    wikiUpdates,
    commands: ["npm.cmd run wiki:check", obsidianSaveCommand],
    nextSessionPrompt: createSessionHandoffPrompt(input)
  };
}
