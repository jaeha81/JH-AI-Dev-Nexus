const requiredMessage = "Task request is required.";
const storageKey = "jh-goal-mode-history";
const languageStorageKey = "jh-goal-mode-language";

const $ = (id) => document.getElementById(id);

const translations = {
  ko: {
    goalModeActive: "Goal Mode 활성화",
    modeFlow: "TDD -> 구현 -> 검증 -> 위키 갱신",
    language: "언어",
    taskPlaceholder: "개발 작업을 입력하세요...",
    taskRequest: "작업 요청",
    project: "프로젝트",
    targetFolder: "대상 폴더",
    allowedScope: "허용 범위",
    forbidden: "금지 사항",
    verification: "검증",
    risk: "위험도",
    strictVerification: "엄격 검증",
    safeMode: "안전 모드",
    generate: "Goal 프롬프트 생성",
    generatedPrompts: "생성된 프롬프트",
    copy: "복사",
    route: "경로",
    noTask: "생성된 작업 없음.",
    checklist: "체크리스트",
    history: "기록",
    previewArtifacts: "미리보기 산출물",
    mobileReadiness: "모바일 알림 준비",
    providerReadiness: "AI Provider 준비",
    sessionHandoff: "Session Handoff",
    mobileSetupGuide: "설정 안내",
    mobileSetupGuideText: "실제 모바일 수신 전 아래 env 값을 설정한 뒤 mobile:status를 다시 확인하세요.",
    providerSetupGuide: "Provider 설정 안내",
    providerSetupGuideText: "실제 AI 호출 전 env 값을 설정한 뒤 provider:dry-run과 provider:runtime-plan으로 먼저 확인하세요.",
    loadingMobileReadiness: "모바일 설정 확인 중...",
    loadingProviderReadiness: "AI provider 설정 확인 중...",
    loadingSessionHandoff: "세션 인계 준비 중...",
    mobileReadyCount: (ready, total) => `모바일 알림 준비 ${ready}/${total}.`,
    providerReadyCount: (ready, total) => `AI provider 준비 ${ready}/${total}.`,
    mobileReadinessUnavailable: "모바일 알림 준비 상태를 사용할 수 없습니다.",
    providerReadinessUnavailable: "AI provider 준비 상태를 사용할 수 없습니다.",
    sessionHandoffUnavailable: "세션 인계 상태를 사용할 수 없습니다.",
    sessionHandoffReady: "세션 인계 명령 준비 완료.",
    sessionHandoffGuide: "Session Save / New Session",
    sessionHandoffGuideText: "검증 후 LLM Wiki를 갱신하고 Obsidian 세션 저장 명령을 실행한 뒤 다음 세션 프롬프트로 재개합니다.",
    ready: "준비됨",
    missing: "누락",
    desktopScreenshot: "데스크톱 스크린샷",
    mobileScreenshot: "모바일 스크린샷",
    recentValidation: "최근 검증",
    loadingValidation: "검증 결과 불러오는 중...",
    generating: "생성 중...",
    generated: "생성 완료.",
    copied: "복사됨.",
    noRisk: "위험 신호가 감지되지 않았습니다.",
    noValidation: "아직 미리보기 검사 결과가 없습니다.",
    validationCount: (count) => `최근 미리보기 검사 결과 ${count}개.`,
    validationUnavailable: "검증 결과를 사용할 수 없습니다.",
    taskRequired: "작업 요청이 필요합니다.",
    objective: "목표",
    context: "먼저 확인할 컨텍스트",
    scope: "범위",
    implementation: "구현 요구사항",
    verificationTitle: "검증",
    stopCondition: "중단 조건",
    finalReport: "최종 보고",
    beforeEdit: "수정 전 확인",
    executionPlan: "실행 계획",
    verificationLoop: "검증 루프"
  },
  en: {
    goalModeActive: "Goal Mode Active",
    modeFlow: "TDD -> implementation -> verification -> wiki update",
    language: "Language",
    taskPlaceholder: "Paste a raw development task...",
    taskRequest: "Task Request",
    project: "Project",
    targetFolder: "Target Folder",
    allowedScope: "Allowed Scope",
    forbidden: "Forbidden",
    verification: "Verification",
    risk: "Risk",
    strictVerification: "Strict verification",
    safeMode: "Safe mode",
    generate: "Generate Goal Prompts",
    generatedPrompts: "Generated Prompts",
    copy: "Copy",
    route: "Route",
    noTask: "No task generated.",
    checklist: "Checklist",
    history: "History",
    previewArtifacts: "Preview Artifacts",
    mobileReadiness: "Mobile Readiness",
    providerReadiness: "AI Provider Readiness",
    sessionHandoff: "Session Handoff",
    mobileSetupGuide: "Setup Guide",
    mobileSetupGuideText: "Set these env values before real mobile delivery, then run mobile:status again.",
    providerSetupGuide: "Provider Setup Guide",
    providerSetupGuideText: "Set env values before real AI calls, then run provider:dry-run and provider:runtime-plan first.",
    loadingMobileReadiness: "Checking mobile settings...",
    loadingProviderReadiness: "Checking AI provider settings...",
    loadingSessionHandoff: "Preparing session handoff...",
    mobileReadyCount: (ready, total) => `${ready}/${total} mobile notification channel(s) ready.`,
    providerReadyCount: (ready, total) => `${ready}/${total} AI provider(s) ready.`,
    mobileReadinessUnavailable: "Mobile readiness is unavailable.",
    providerReadinessUnavailable: "AI provider readiness is unavailable.",
    sessionHandoffUnavailable: "Session handoff is unavailable.",
    sessionHandoffReady: "Session handoff command is ready.",
    sessionHandoffGuide: "Session Save / New Session",
    sessionHandoffGuideText: "After verification, update LLM Wiki, run the Obsidian session save command, then resume from the next-session prompt.",
    ready: "Ready",
    missing: "Missing",
    desktopScreenshot: "Desktop screenshot",
    mobileScreenshot: "Mobile screenshot",
    recentValidation: "Recent Validation",
    loadingValidation: "Loading validation results...",
    generating: "Generating...",
    generated: "Generated.",
    copied: "Copied.",
    noRisk: "No risk indicators detected.",
    noValidation: "No preview check results yet.",
    validationCount: (count) => `${count} recent preview check result(s).`,
    validationUnavailable: "Validation results unavailable.",
    taskRequired: "Task request is required.",
    objective: "Objective",
    context: "Context to inspect first",
    scope: "Scope",
    implementation: "Implementation Requirements",
    verificationTitle: "Verification",
    stopCondition: "Stop Condition",
    finalReport: "Final Report",
    beforeEdit: "Before You Edit",
    executionPlan: "Execution Plan",
    verificationLoop: "Verification Loop"
  }
};

function currentLanguage() {
  const stored = localStorage.getItem(languageStorageKey);
  return stored === "en" ? "en" : "ko";
}

function text(key) {
  return translations[currentLanguage()][key];
}

function applyLanguage(language) {
  const normalized = language === "en" ? "en" : "ko";
  localStorage.setItem(languageStorageKey, normalized);
  document.documentElement.lang = normalized;
  $("languageSelect").value = normalized;
  document.querySelectorAll("[data-i18n]").forEach((node) => {
    const value = translations[normalized][node.dataset.i18n];
    if (typeof value === "string") node.textContent = value;
  });
  $("task").placeholder = translations[normalized].taskPlaceholder;
}

function renderModuleOperationalState(module) {
  const state = document.createElement("div");
  state.className = `module-status status-${module.status || "needs-configuration"}`;

  const status = document.createElement("small");
  status.textContent = `status=${module.status || "needs-configuration"}`;
  state.appendChild(status);

  const flags = document.createElement("small");
  flags.textContent = `enabled=${Boolean(module.enabled)} configured=${Boolean(module.configured)}`;
  state.appendChild(flags);

  const missing = document.createElement("small");
  const missingRequirements = module.missingRequirements || [];
  missing.textContent = `missing=${missingRequirements.length ? missingRequirements.join(", ") : "none"}`;
  state.appendChild(missing);

  return state;
}

function renderNexusModules(payload) {
  const modules = payload.modules || [];
  const summary = payload.summary || {};
  const list = $("nexusModules");
  list.classList.add("status-console");
  list.replaceChildren();

  modules.forEach((module) => {
    const article = document.createElement("article");
    article.dataset.moduleId = module.id;

    const title = document.createElement("strong");
    title.textContent = module.label;
    article.appendChild(title);

    const detail = document.createElement("span");
    detail.textContent = module.outputs?.[0] || module.role;
    article.appendChild(detail);

    const policy = document.createElement("small");
    policy.textContent = module.mvpPolicy;
    article.appendChild(policy);

    article.appendChild(renderModuleOperationalState(module));

    list.appendChild(article);
  });

  $("moduleSummary").textContent = `${summary.total || modules.length} modules / ready ${summary.ready || 0} / config ${summary.needsConfiguration || 0}`;
}

function renderStaticNexusModuleFallback() {
  const cards = Array.from($("nexusModules").querySelectorAll("article"));
  const mvpReady = cards.filter((card) => card.querySelector("small")?.textContent === "mvp").length;
  $("moduleSummary").textContent = `${cards.length} modules / MVP ${mvpReady}`;
}

async function loadNexusModules() {
  try {
    const response = await fetch("/api/modules");
    if (!response.ok) throw new Error(`Module registry request failed: ${response.status}`);
    const contentType = response.headers.get("content-type") || "";
    if (!contentType.includes("application/json")) {
      renderStaticNexusModuleFallback();
      return;
    }
    const payload = await response.json();
    renderNexusModules(payload);
  } catch (error) {
    renderStaticNexusModuleFallback();
  }
}

function classifyTask(task) {
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

function detectRisk(task) {
  const text = task.toLowerCase();
  const risks = [];
  if (/\b(secret|api keys?|token|credential|password)\b/.test(text)) risks.push("secrets/API keys");
  if (/\b(production|deploy|release|billing|payment)\b/.test(text)) risks.push("production/deployment");
  if (/\b(user data|personal data|pii|customer)\b/.test(text)) risks.push("user data");
  if (/\b(delete|drop|truncate|wipe)\b/.test(text) && /\b(database|db|row|table|storage)\b/.test(text)) {
    risks.push("database deletion");
  }
  return risks;
}

function selectRoute(category, riskLevel, risks) {
  if (riskLevel === "high" || risks.length) return "Claude -> Codex -> Claude";
  if (category === "documentation" || category === "UI/UX") return "Claude first";
  if (category === "bug fix" || category === "test/verification") return "Codex first";
  return "Codex -> Claude Review";
}

function finalReport() {
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

function generate(input) {
  const task = input.task.trim();
  if (!task) throw new Error(text("taskRequired") || requiredMessage);

  const category = classifyTask(task);
  const risks = detectRisk(task);
  const route = selectRoute(category, input.riskLevel, risks);
  const commands = input.verificationCommands.split(",").map((item) => item.trim()).filter(Boolean);
  const checklist = [
    ...commands.map((command) => `Run ${command}`),
    "Confirm Codex /goal prompt generation works",
    "Confirm Claude Code Goal Mode prompt generation works",
    "Confirm copy buttons work",
    "Confirm history/log behavior works",
    "Confirm existing routes and major features are not broken"
  ];
  if (input.strictVerification) {
    checklist.push("Do not claim success unless static validation or build confirms the feature works");
  }
  const stopCondition =
    "Stop if the task requires missing secrets, API keys, paid services, production credentials, destructive database access, or external permissions.";
  const commonScope = [
    `- Project: ${input.projectName}`,
    `- Target folder: ${input.targetFolder}`,
    `- Category: ${category}`,
    `- Recommended route: ${route}`,
    `- Allowed scope: ${input.allowedScope}`,
    `- Forbidden files/actions: ${input.forbiddenActions}`,
    `- Risk level: ${input.riskLevel}`
  ].join("\n");
  const codexPrompt = [
    "/goal",
    "",
    text("objective"),
    `- ${task}`,
    "",
    text("context"),
    "- Read AGENTS.md, CLAUDE.md, README, package files, app routes, components, API routes, storage logic, command palette logic, prompt templates, and workspace configuration if present.",
    "",
    text("scope"),
    commonScope,
    "",
    text("implementation"),
    "- Keep changes modular.",
    "- Reuse existing structures.",
    "- Do not introduce unnecessary dependencies.",
    "- Validate user input.",
    input.safeMode ? "- Safe mode is active: block destructive and production-related instructions." : "- Safe mode is off.",
    "",
    text("verificationTitle"),
    ...checklist.map((item) => `- ${item}`),
    "",
    text("stopCondition"),
    `- ${stopCondition}`,
    "",
    text("finalReport"),
    finalReport()
  ].join("\n");
  const claudePrompt = [
    "You are operating in JH Goal Mode.",
    "",
    text("objective"),
    `- ${task}`,
    "",
    text("beforeEdit"),
    "- Inspect existing project structure and reuse current patterns.",
    "- Do not rewrite the whole app unless explicitly required.",
    "",
    text("scope"),
    commonScope,
    "",
    text("executionPlan"),
    "- Identify relevant files.",
    "- Make the smallest safe change.",
    "- Keep Codex verification handoff clear.",
    "",
    text("implementation"),
    "- Keep changes modular.",
    "- Reuse existing UI, state, storage, and template logic.",
    "",
    text("verificationLoop"),
    ...checklist.map((item) => `- ${item}`),
    "",
    text("stopCondition"),
    `- ${stopCondition}`,
    "",
    text("finalReport"),
    finalReport()
  ].join("\n");

  return { category, route, risks, checklist, codexPrompt, claudePrompt };
}

function renderHistory() {
  const history = JSON.parse(localStorage.getItem(storageKey) || "[]");
  $("history").innerHTML = history
    .slice(0, 8)
    .map((item) => `<li>${item.category}: ${item.task}</li>`)
    .join("");
}

function saveHistory(entry) {
  const history = JSON.parse(localStorage.getItem(storageKey) || "[]");
  localStorage.setItem(storageKey, JSON.stringify([entry, ...history].slice(0, 20)));
  renderHistory();
}

function renderRecentValidation(results) {
  const list = $("recentValidation");
  list.replaceChildren();

  if (!results.length) {
    $("validationStatus").textContent = text("noValidation");
    return;
  }

  $("validationStatus").textContent = text("validationCount")(results.length);
  results.forEach((result) => {
    const article = document.createElement("article");
    article.className = "validation-item";

    const title = document.createElement("strong");
    title.textContent = result.title;
    article.appendChild(title);

    const meta = document.createElement("p");
    meta.textContent = `${result.status} - ${result.command}`;
    article.appendChild(meta);

    const details = document.createElement("ul");
    result.details.forEach((detail) => {
      const item = document.createElement("li");
      item.textContent = detail;
      details.appendChild(item);
    });
    article.appendChild(details);
    list.appendChild(article);
  });
}

async function loadRecentValidation() {
  try {
    const response = await fetch("/api/preview-validation");
    if (!response.ok) throw new Error(`Validation request failed: ${response.status}`);
    const payload = await response.json();
    renderRecentValidation(payload.results || []);
  } catch (error) {
    $("validationStatus").textContent = error instanceof Error ? error.message : text("validationUnavailable");
  }
}

function renderMobileReadiness(connectors) {
  const list = $("mobileReadiness");
  list.replaceChildren();
  const readyCount = connectors.filter((connector) => connector.ready).length;
  $("mobileReadinessStatus").textContent = text("mobileReadyCount")(readyCount, connectors.length);

  connectors.forEach((connector) => {
    const article = document.createElement("article");
    article.className = "validation-item";

    const title = document.createElement("strong");
    title.textContent = `${connector.connectorId} - ${connector.ready ? text("ready") : text("missing")}`;
    article.appendChild(title);

    const detail = document.createElement("p");
    detail.textContent = connector.missingSecrets.length
      ? `missing=${connector.missingSecrets.join(",")}`
      : "missing=none";
    article.appendChild(detail);

    list.appendChild(article);
  });
}

async function loadMobileReadiness() {
  try {
    const response = await fetch("/api/mobile-readiness");
    if (!response.ok) throw new Error(`Mobile readiness request failed: ${response.status}`);
    const payload = await response.json();
    renderMobileReadiness(payload.connectors || []);
  } catch (error) {
    $("mobileReadinessStatus").textContent =
      error instanceof Error ? error.message : text("mobileReadinessUnavailable");
  }
}

function renderProviderReadiness(providers) {
  const list = $("providerReadiness");
  list.replaceChildren();
  const readyCount = providers.filter((provider) => provider.ready).length;
  $("providerReadinessStatus").textContent = text("providerReadyCount")(readyCount, providers.length);

  providers.forEach((provider) => {
    const article = document.createElement("article");
    article.className = "validation-item";

    const title = document.createElement("strong");
    title.textContent = `${provider.providerId} - ${provider.ready ? text("ready") : text("missing")}`;
    article.appendChild(title);

    const detail = document.createElement("p");
    detail.textContent = [
      `capability=${provider.capability}`,
      `network=${provider.network}`,
      provider.missingEnv.length ? `missing=${provider.missingEnv.join(",")}` : "missing=none"
    ].join(" ");
    article.appendChild(detail);

    list.appendChild(article);
  });
}

async function loadProviderReadiness() {
  try {
    const response = await fetch("/api/provider-readiness");
    if (!response.ok) throw new Error(`Provider readiness request failed: ${response.status}`);
    const payload = await response.json();
    renderProviderReadiness(payload.providers || []);
  } catch (error) {
    $("providerReadinessStatus").textContent =
      error instanceof Error ? error.message : text("providerReadinessUnavailable");
  }
}

function summarizeNextSessionPrompt(prompt) {
  const lines = prompt.split("\n").map((line) => line.trim()).filter(Boolean);
  const firstLine = lines[0] || "Next session prompt ready.";
  const capped = firstLine.length > 80 ? `${firstLine.slice(0, 77)}...` : firstLine;
  return `${capped} (${lines.length} lines)`;
}

function renderSessionHandoff(plan) {
  const list = $("sessionHandoff");
  list.replaceChildren();
  $("sessionHandoffStatus").textContent = text("sessionHandoffReady");
  $("nextSessionPrompt").textContent = plan.nextSessionPrompt;
  $("nextSessionPromptSummary").textContent = summarizeNextSessionPrompt(plan.nextSessionPrompt);

  const article = document.createElement("article");
  article.className = "validation-item";

  const title = document.createElement("strong");
  title.textContent = plan.summary;
  article.appendChild(title);

  const detail = document.createElement("p");
  detail.textContent = `wiki=${plan.wikiUpdates.join(",")}`;
  article.appendChild(detail);

  const commands = document.createElement("ul");
  plan.commands.forEach((command) => {
    const item = document.createElement("li");
    item.textContent = command;
    commands.appendChild(item);
  });
  article.appendChild(commands);
  list.appendChild(article);
}

async function loadSessionHandoff() {
  try {
    const response = await fetch("/api/session-handoff");
    if (!response.ok) throw new Error(`Session handoff request failed: ${response.status}`);
    const payload = await response.json();
    renderSessionHandoff(payload);
  } catch (error) {
    $("sessionHandoffStatus").textContent =
      error instanceof Error ? error.message : text("sessionHandoffUnavailable");
  }
}

$("generate").addEventListener("click", () => {
  $("message").textContent = text("generating");
  try {
    const result = generate({
      task: $("task").value,
      projectName: $("projectName").value,
      targetFolder: $("targetFolder").value,
      allowedScope: $("allowedScope").value,
      forbiddenActions: $("forbiddenActions").value,
      verificationCommands: $("verificationCommands").value,
      riskLevel: $("riskLevel").value,
      strictVerification: $("strictVerification").checked,
      safeMode: $("safeMode").checked
    });
    $("codexOutput").value = result.codexPrompt;
    $("claudeOutput").value = result.claudePrompt;
    $("route").textContent = result.route;
    $("category").textContent = result.category;
    $("checklist").innerHTML = result.checklist.map((item) => `<li>${item}</li>`).join("");
    $("warnings").innerHTML = result.risks.length
      ? result.risks.map((item) => `<li>${item}</li>`).join("")
      : `<li>${text("noRisk")}</li>`;
    saveHistory({ task: $("task").value.trim(), category: result.category, route: result.route });
    $("message").textContent = text("generated");
  } catch (error) {
    $("message").textContent = error.message;
  }
});

$("languageSelect").addEventListener("change", (event) => {
  applyLanguage(event.target.value);
});

document.querySelectorAll("[data-copy]").forEach((button) => {
  button.addEventListener("click", async () => {
    const target = $(button.dataset.copy);
    await navigator.clipboard.writeText(target.value);
    $("message").textContent = text("copied");
  });
});

document.querySelectorAll("[data-copy-text]").forEach((button) => {
  button.addEventListener("click", async () => {
    const copyText = $(button.dataset.copyText).textContent;
    await navigator.clipboard.writeText(copyText);
    $("message").textContent = text("copied");
  });
});

applyLanguage(currentLanguage());
loadNexusModules();
renderHistory();
loadRecentValidation();
loadMobileReadiness();
loadProviderReadiness();
loadSessionHandoff();
