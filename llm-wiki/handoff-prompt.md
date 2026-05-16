# 다음 세션 인계 프롬프트

## 요약
- Repository: `https://github.com/jaeha81/JH-AI-Dev-Nexus.git`
- Local path: `D:\ai프로젝트(코덱스)\JH-AI Dev Nexus`
- 현재 목표: JH Dev Nexus Harness MVP를 계속 확장.

## 현재 상태
- core config/menu/wiki module 존재.
- CLI command skeleton 존재.
- LLM Wiki 고정 문서 존재.
- 컨텍스트 절약용 `llm-wiki/session-brief.md` 존재. 다음 작업자는 먼저 이 파일을 읽고 긴 로그는 tail/검색만 사용.
- test, typecheck, build, wiki check, audit 통과 이력 있음.
- Telegram/Discord external mobile connector registry 존재.
- mobile connector는 상태 조회, 링크 전달, 알림만 허용.
- mobile connector는 shell 실행과 deploy 실행 차단.
- CLI `mobile:status`로 Telegram/Discord 알림 설정 준비 여부를 secret 값 없이 확인 가능.
- dashboard 우측 패널과 `/api/mobile-readiness`에서도 Telegram/Discord 준비 상태 확인 가능.
- dashboard 우측 패널에 모바일 알림 설정 안내 존재. 필요한 env 이름과 `mobile:status` 확인 명령만 표시.
- 모바일 설정 안내의 `mobile:status` 확인 명령은 복사 버튼으로 복사 가능.
- JH Goal Mode는 Codex `/goal`과 Claude Code Goal Mode prompt 생성 가능.
- JH Goal Mode는 CLI `status`와 dashboard 첫 화면에서 active 상태를 명시.
- 정적 dashboard 위치: `apps/web-dashboard/index.html`.
- dashboard 설정에 한국어/English 언어 선택기 존재. 기본값은 한국어이며 `localStorage`에 저장.
- 언어 선택은 dashboard 주요 문구와 Goal Mode prompt 제목/상태 메시지에 적용.
- Provider registry는 `openai`, `anthropic`을 지원.
- Provider registry는 env variable name만 노출하고 secret value는 노출하지 않음.
- Provider 위험 기능 차단: `secret:read`, `billing:modify`, `production:deploy`.
- 사용자 검토용 문서는 한국어 기준으로 정리됨.
- Preview check module 존재.
- CLI `preview` 명령은 `localhost` 또는 `127.0.0.1` URL만 허용.
- CLI `preview <local-url>` 명령은 dry-run 결과와 함께 다음 실제 검사 명령 및 `capture-summary` 안내를 표시.
- Preview check는 desktop/mobile screenshot capture 후 `validation-log.md`에 자동 기록.
- Dashboard preview server 존재.
- 실행 명령: `npm run preview:dashboard`
- URL: `http://127.0.0.1:3100`
- Playwright capture script 존재.
- 실행 명령: `npm run preview:capture`
- desktop/mobile 동시 capture 명령: `npm run preview:capture:all`
- 통합 검증 명령: `npm run preview:check`
- CLI plan 명령: `node dist/apps/cli/src/index.js preview:capture:all http://127.0.0.1:3100`
- CLI preview check 안내: `node dist/apps/cli/src/index.js preview:check`
- artifact URL:
  - `http://127.0.0.1:3100/artifacts/playwright/goal-mode-desktop.png`
  - `http://127.0.0.1:3100/artifacts/playwright/goal-mode-mobile.png`
- validation result API:
  - `http://127.0.0.1:3100/api/preview-validation`
- preview check notification plan:
  - `node dist/scripts/preview-check.js --notify telegram,discord`
  - Telegram/Discord 전송 함수를 호출.
  - secret 값이 없으면 외부 전송하지 않고 `skipped`로 기록.
  - secret 값이 있으면 Telegram chat id와 Discord webhook으로 알림 전송 시도.
  - desktop/mobile 캡처 결과를 `capture-summary` 통합 검사로 기록.
- screenshot 산출물: `output/playwright/goal-mode.png`
- desktop/mobile 산출물:
  - `output/playwright/goal-mode-desktop.png`
  - `output/playwright/goal-mode-mobile.png`
- dashboard 우측 panel은 최근 Preview Check 검증 결과를 표시.
- 마지막 확인 결과: console error 0개, prompt generation/history/validation panel 동작 확인.

## 다음 명령
- 문서 한국어화 후 검증:
  - `npm run typecheck`
  - `npm test`
  - `npm run build`
  - `npm run wiki:check`
- 다음 구현 후보:
  - Telegram/Discord secret 설정 후 실제 모바일 수신 확인
  - `preview:capture` 결과와 CLI `preview` 검증 결과 통합 고도화
- 구현 후 다시 실행:
  - `npm run typecheck`
  - `npm test`
  - `npm run build`
  - `npm run wiki:check`

## 역할 분리
- Codex: 구현, 테스트, 검증, LLM Wiki 갱신.
- Claude Code: 긴 UI 초안, 대안 설계, 장문 리팩터링 보조만 선택 사용.

## 알려진 이슈
- `.git/HEAD.lock` 생성 실패로 feature branch 생성 불가.
- branch 권한 문제가 해결되기 전까지 initial `main`에서 진행.
- PowerShell profile execution policy warning이 계속 출력됨.

## 2026-05-16 추가 인계
- Telegram/Discord 알림 전송은 외부 서비스가 실패 HTTP status를 반환하면 `failed`로 기록한다.
- 실패 기록에는 status code만 포함하며 token/webhook 같은 secret 값은 포함하지 않는다.
- 관련 테스트: `packages/integrations/src/preview-notifications.test.ts`.

## 2026-05-16 Provider Runtime Send Handoff
- Added `sendProviderRuntimeRequest` in `packages/providers/src/provider-runtime.ts`.
- The function never opens network by itself; callers must inject `fetcher`.
- OpenAI uses `Authorization: Bearer ...`; Anthropic uses `x-api-key` plus `anthropic-version: 2023-06-01`.
- Tests cover success, blocked capability no-network behavior, and secret non-exposure in returned result objects.
- Next candidates: add CLI wrapper around runtime send only if an explicit safe fetch/runtime boundary is defined, or continue with Telegram/Discord real-secret send tests.

## 2026-05-16 Dev Nexus Program Identity Handoff
- Current direction: Codex directly drives `JH AI Dev Nexus` as an installable AI development operating program, not as an Agent Room dashboard.
- Agent Room is now represented as a collaboration module only.
- Added `packages/core/src/nexus-modules.ts` and tests.
- Dashboard first screen now includes Nexus module cards for Goal Mode, LLM Wiki, providers, Telegram/mobile, GitHub, Obsidian, preview, plugins, skills, IDE adapters, tmux 2x2, templates, and Agent Room.
- Next recommended work: add CLI/API exposure for the module registry, then add settings/enable-disable state for MVP modules.
- Required verification remains: `npm.cmd run typecheck`, `npm.cmd test`, `npm.cmd run build`, `npm.cmd run wiki:check`, and `npm.cmd run preview:check` for dashboard changes.

## 2026-05-16 Session Handoff Module Handoff
- Current direction remains: `JH AI Dev Nexus` is the installable AI development operating program; Agent Room is only a collaboration module.
- Added a formal Session Handoff module:
  - `packages/core/src/session-handoff.ts`
  - `packages/core/src/session-handoff.test.ts`
  - `session-handoff` entry in Nexus module registry and menu
  - CLI command `session:handoff`
  - dashboard API `/api/session-handoff`
  - dashboard Session Handoff panel with copy command and next-session prompt copy control
- The module exposes safe command plans only. It does not automatically execute Obsidian writes, commits, pushes, deploys, or secret reads.
- Next recommended work after verification: connect Session Handoff to richer current-session collection from validation logs and changed-file summaries.

## 2026-05-16 Session Handoff Context Collection Handoff
- Completed the next recommended work: Session Handoff now collects from LLM Wiki context, validation log text, and `git status --short` changed-file summaries.
- Core function: `createSessionHandoffInputFromContext`.
- CLI: `session:handoff` now uses current local context by default, with test injection support.
- Dashboard API: `/api/session-handoff` now uses the same collector and includes current changed-file summary counts.
- Safety: `.env` changed paths are filtered, obvious `sk-*` and `token=` values are redacted, and validation commands are capped to recent entries.
- Verification complete: `typecheck`, `test`, `build`, `wiki:check`, and `preview:check` passed.
- Next recommended work: improve the dashboard Session Handoff panel UX so long prompts are collapsed or summarized while preserving copy support.

## 2026-05-16 Session Handoff Panel UX Handoff
- Completed the next recommended UX work.
- Dashboard Session Handoff now shows a short next-session prompt summary and keeps the full prompt inside a collapsed `details` block.
- Full prompt copy remains available through `data-copy-text="nextSessionPrompt"`.
- Added static UI tests for the summary/details controls and prompt body height constraint.
- Verification complete: `typecheck`, `test`, `build`, `wiki:check`, and `preview:check` passed; desktop/mobile screenshots show the prompt collapsed and no console errors.
- Next recommended work: continue Dev Nexus module maturity by adding a concise command/status summary for handoff actions or begin the next MVP module selected by the user.

## 2026-05-16 Nexus Module Registry CLI/API Handoff
- Completed the requested module registry exposure work.
- CLI command: `node dist/apps/cli/src/index.js modules`.
- Dashboard API: `GET /api/modules`, served by `readNexusModulesJson()` in the preview server.
- Dashboard behavior: module cards now fetch `/api/modules` and render registry data; stale server HTML fallback is handled without user-visible JSON parse errors.
- Verification complete: `typecheck`, `test`, `build`, `wiki:check`, and `preview:check` passed; desktop/mobile screenshots show `14 modules / MVP 7`.
- Next recommended work: restart the Dev Nexus preview server on port 3100 so the live `/api/modules` route is served by the updated compiled server instead of the stale fallback process.

## 2026-05-17 Nexus Module Operational Status Handoff
- Completed the requested module registry status work.
- Core registry: every module now has `enabled`, `configured`, `missingRequirements`, and `status`.
- Summary: `getNexusModuleSummary()` now returns enabled/configured/ready/needs-configuration/disabled counts.
- CLI command: `node dist/apps/cli/src/index.js modules` now prints per-module operational status, config flags, and missing requirements.
- Dashboard: module cards now render a compact status console using `/api/modules`; screenshots were refreshed by `preview:check`.
- Verification complete: RED targeted tests failed for missing status contract, then `typecheck`, full `test`, `build`, `wiki:check`, and approved `preview:check` passed.
- Remaining risk: local PowerShell profile and global git ignore permission warnings still appear during commands; they are environment warnings, not feature failures.

## 2026-05-17 Runtime Module Readiness Handoff
- Completed runtime env-derived readiness for configurable Nexus modules.
- `getNexusModules({ env })` and `getNexusModuleSummary({ env })` now calculate readiness from env presence while returning only env names/missing requirements, never values.
- CLI `modules` passes runtime env by default and supports injected env in tests.
- Dashboard `/api/modules` passes runtime env into the same calculation.
- Added safe config metadata for `AGENT_ROOM_BASE_URL`.
- Verification complete: RED injected-env tests failed first, then `typecheck`, full `test`, `build`, `wiki:check`, and approved `preview:check` passed.
- Next recommended work: add module enable-disable settings storage and dashboard/API controls.

## 2026-05-17 Module Enable-Disable Settings Handoff
- Completed module enable-disable settings storage and dashboard/API controls.
- Core settings model: `packages/core/src/nexus-module-settings.ts`.
- Storage: `.agent/module-settings.json`, containing only `{ disabledModuleIds: string[] }`.
- API: `GET /api/module-settings` returns settings; `POST /api/module-settings` accepts `{ moduleId, enabled }`.
- Dashboard: each module card now has an Enable/Disable button that updates settings and reloads `/api/modules`.
- Safety: settings parser filters duplicate ids and secret-like strings; disabled modules override env-derived readiness with `status=disabled`.
- Verification complete: RED targeted tests failed first, then `typecheck`, full `test`, `build`, `wiki:check`, and approved `preview:check` passed.
- Next recommended work: add CLI wrappers for module enable/disable or improve dashboard module grouping/filtering.
