# 세션 브리프

## 목적
- 다음 작업자가 긴 `validation-log.md`와 중복된 handoff 문서를 매번 전체 재독하지 않도록 하는 압축 진입점.
- 상세 근거가 필요할 때만 원문 문서를 부분 검색하거나 tail로 확인한다.

## 현재 완료
- Goal Mode dashboard 존재.
- Goal Mode는 현재 작업 운용 상태로 명시됨. CLI `status`와 dashboard 첫 화면에 active 상태를 표시.
- dashboard 설정에 한국어/English 언어 선택기 추가. 기본값은 한국어이며 `localStorage`에 저장.
- 언어 선택은 dashboard 주요 문구와 Goal Mode prompt 제목/상태 메시지에 적용.
- `preview:check`는 desktop/mobile screenshot 생성 후 `llm-wiki/validation-log.md`에 자동 기록.
- dashboard 우측 panel은 screenshot artifact link와 최근 Preview Check 결과를 표시.
- preview server는 다음 local endpoint를 제공한다.
  - `/artifacts/playwright/goal-mode-desktop.png`
  - `/artifacts/playwright/goal-mode-mobile.png`
  - `/api/preview-validation`
- `preview:check --notify telegram,discord` 옵션은 Telegram/Discord 전송 함수를 호출한다.
- secret 값이 없으면 외부 전송을 하지 않고 `skipped`로 기록한다.
- secret 값이 있으면 Telegram chat id와 Discord webhook으로 알림 전송을 시도한다.
- CLI `mobile:status`는 Telegram/Discord 알림 설정 준비 여부를 secret 값 없이 표시한다.
- dashboard 우측 패널도 `/api/mobile-readiness`로 Telegram/Discord 준비 상태를 표시한다.
- dashboard 우측 패널에 모바일 알림 설정 안내 추가. 필요한 env 이름과 `mobile:status` 확인 명령만 표시한다.
- 모바일 설정 안내의 `mobile:status` 확인 명령은 복사 버튼으로 클립보드 복사 가능.
- `preview:check` 기록은 desktop/mobile 캡처 결과를 통합 검사 요약(`capture-summary`)으로 함께 남긴다.
- CLI `preview <local-url>`는 dry-run 결과와 함께 다음 실제 검사 명령(`npm run preview:check`) 및 `capture-summary` 안내를 표시한다.

## 최근 검증
- `npm run typecheck`: PASS
- `npm test`: PASS
- `npm run build`: PASS
- `npm run wiki:check`: PASS
- `npm run preview:check`: PASS, desktop/mobile consoleErrors 0
- `node dist/scripts/preview-check.js --notify telegram,discord`: PASS, secret 없음으로 알림 skipped 기록 확인
- CLI `preview:check` 안내에 `summary=capture-summary` 표시.
- CLI `preview` 안내에 `next=npm run preview:check`, `summary=capture-summary` 표시.
- Goal Mode 상태 표시 검증: CLI status와 dashboard screenshot PASS.
- 언어 선택 UI 검증: default Korean dashboard screenshot PASS, consoleErrors 0.
- CLI `mobile:status` 검증: missing env 이름만 표시, secret 값 미노출.
- dashboard mobile readiness 검증: API 200, desktop/mobile screenshot PASS, consoleErrors 0.
- dashboard mobile setup guide 검증: desktop screenshot PASS, 긴 env 이름 줄바꿈 확인.
- dashboard mobile setup command copy 검증: UI test PASS, desktop screenshot PASS.

## 다음 후보
- Telegram/Discord secret 설정 후 실제 모바일 수신 확인.
- `preview:capture` 결과와 CLI `preview` 검증 결과 통합 고도화.

## 컨텍스트 절약 규칙
- 시작 시 이 파일을 먼저 읽고, 세부 확인이 필요할 때만 `current-state.md`, `handoff-prompt.md`, `validation-log.md`를 부분 조회한다.
- `validation-log.md`는 전체 읽기 금지. 최근 결과는 `Get-Content -Tail 40` 또는 `/api/preview-validation` 사용.
- 명령 출력은 PASS/FAIL과 실패 원인만 요약한다.

## 2026-05-16 추가 작업
- Telegram/Discord 알림 전송 실패 감지를 보강했다. 외부 서비스가 401/500 등을 반환하면 성공이 아니라 실패로 남긴다.
- 실패 메시지에는 secret 값이 들어가지 않도록 테스트로 확인했다.
# 2026-05-16 Codex Resume Brief

## Must Read First
- `llm-wiki/session-brief.md`
- `llm-wiki/handoff-prompt.md`
- `llm-wiki/current-state.md`
- `llm-wiki/validation-log.md` tail only

## Current Product Definition
- The product is `JH AI Dev Nexus`.
- It is an installable AI development operating program, not an Agent Room dashboard.
- Agent Room is only a collaboration module inside the larger program.
- Codex is the main developer/orchestrator and should directly implement, test, verify, and update LLM Wiki.
- Claude Code is optional support only. Use Claude by writing a task instruction when long refactor, alternate design, or auxiliary implementation is actually needed.

## Latest Completed Work
- Added Nexus module registry in `packages/core/src/nexus-modules.ts`.
- Added tests in `packages/core/src/nexus-modules.test.ts`.
- Updated dashboard identity to `JH AI Dev Nexus - AI Development Operating Program`.
- Added readable Nexus module cards for Goal Mode, LLM Wiki, providers, Telegram/mobile, GitHub, Obsidian, preview, plugins, skills, IDE adapters, tmux 2x2, templates, and Agent Room as `collaboration-module`.
- Saved session memory through Brain API to `C:\Users\user1\Documents\Obsidian Vault\sessions\2026-05-15-07-51-08.md`.

## Latest Verification
- `npm.cmd run typecheck`: PASS
- `npm.cmd test`: PASS, 16 files / 78 tests
- `npm.cmd run build`: PASS
- `npm.cmd run wiki:check`: PASS
- `npm.cmd run preview:check`: PASS, desktop/mobile consoleErrors=0

## Next Goal Mode Task
- Implement a formal `Session Handoff` module in Dev Nexus.
- It should support current session summary generation, LLM Wiki update, Obsidian session save command integration, next-session prompt generation, dashboard command visibility, and CLI/API exposure if small enough.
- Use TDD: write failing tests first, confirm RED, implement, confirm GREEN, run full verification.
- Required final commands: `npm.cmd run typecheck`, `npm.cmd test`, `npm.cmd run build`, `npm.cmd run wiki:check`.
- If dashboard changes: also run `npm.cmd run preview:check` and inspect screenshots.

## Known Context
- Dev Nexus preview server may be running on `http://127.0.0.1:3100`.
- Agent Room also used port 3100 earlier; ensure the running server is Dev Nexus before preview verification.
- JH-Agent-Room deadline reminder task was disabled after spam prevention work.
- Do not treat Agent Room as the program core.

## 2026-05-16 Session Handoff Resume Brief

## Latest Completed Work
- Implemented formal Session Handoff module for `JH AI Dev Nexus`.
- Core API: `createSessionHandoffPlan` and `createSessionHandoffPrompt`.
- Module registry/menu: added `session-handoff` as an MVP memory module.
- CLI: added `session:handoff`, exposing wiki targets, safe commands, and next-session prompt without secret values.
- Dashboard/API: added `/api/session-handoff`, Session Handoff side panel, copy command, and next-session prompt copy control.

## Verification So Far
- RED confirmed for missing core module, registry, CLI, dashboard API, UI panel, and menu entry.
- GREEN confirmed for targeted Session Handoff tests.
- `npm.cmd run typecheck`: PASS
- `npm.cmd test`: PASS, 17 files / 82 tests

## Remaining Required Verification
- `npm.cmd run build`
- `npm.cmd run wiki:check`
- `npm.cmd run preview:check`
- Inspect desktop/mobile screenshots because the dashboard changed.

## Final Verification Update
- `npm.cmd run build`: PASS
- `npm.cmd run wiki:check`: PASS
- `npm.cmd run preview:check`: PASS, desktop/mobile consoleErrors=0
- Visual check: Session Handoff panel renders on desktop/mobile after restarting the Dev Nexus preview server; `/api/session-handoff` returns JSON.

## 2026-05-16 Session Handoff Context Collection Brief

## Latest Completed Work
- Added `createSessionHandoffInputFromContext` to collect handoff input from session brief, current state, handoff prompt, validation log, and git status text.
- Wired CLI `session:handoff` to read current LLM Wiki context and changed-file summaries.
- Wired dashboard `/api/session-handoff` to use the same context collector.
- Added tests for context collection, secret/path filtering, recent validation command limits, CLI integration, and dashboard API integration.

## Verification
- `npm.cmd run typecheck`: PASS
- `npm.cmd test`: PASS, 17 files / 86 tests
- `npm.cmd run build`: PASS
- `npm.cmd run wiki:check`: PASS
- `npm.cmd run preview:check`: PASS, desktop/mobile consoleErrors=0

## Next Work
- Improve Session Handoff panel presentation so long generated prompts are summarized first and full text remains copyable without dominating the dashboard column.

## 2026-05-16 Session Handoff Panel UX Brief

## Latest Completed Work
- Replaced always-visible next-session prompt output with a collapsed `details` block.
- Added `nextSessionPromptSummary` and `summarizeNextSessionPrompt` so the side panel shows a short line count summary first.
- Kept full next-session prompt copy support through the existing copy button.
- Added bounded prompt body styling with `max-height: 220px` for expanded state.

## Verification
- `npm.cmd run typecheck`: PASS
- `npm.cmd test`: PASS, 17 files / 86 tests
- `npm.cmd run build`: PASS
- `npm.cmd run wiki:check`: PASS
- `npm.cmd run preview:check`: PASS, desktop/mobile consoleErrors=0

## Next Work
- Consider adding a smaller command summary under Session Handoff if the command list grows beyond the current wiki/save pair.

## 2026-05-16 Nexus Module Registry CLI/API Brief

## Latest Completed Work
- Exposed the Nexus module registry through the CLI command `modules`.
- Added dashboard API JSON through `/api/modules`.
- Changed the dashboard module section to load module data from `/api/modules`.
- Added a dashboard fallback for stale preview servers that return HTML instead of module JSON, preserving visible static cards without showing a JSON parse error.

## Verification
- RED confirmed for missing CLI `modules`, missing `readNexusModulesJson`, and missing `/api/modules` dashboard loading.
- GREEN confirmed for targeted CLI/API/dashboard tests.
- `npm.cmd run typecheck`: PASS
- `npm.cmd test`: PASS, 17 files / 88 tests
- `npm.cmd run build`: PASS
- `npm.cmd run wiki:check`: PASS
- `npm.cmd run preview:check`: PASS, desktop/mobile consoleErrors=0

## Note
- A stale server was already listening on `127.0.0.1:3100` and returned HTML for `/api/modules`; the dashboard fallback now prevents visible UI breakage, while the updated preview server code exposes the JSON endpoint after restart.

## 2026-05-17 Nexus Module Operational Status Brief

## Latest Completed Work
- Added operational state fields to each Nexus module: `enabled`, `configured`, `missingRequirements`, and `status`.
- Added summary counts for enabled/configured/ready/needs-configuration/disabled modules.
- Updated CLI `modules` output so it reads as an operations console with status flags and missing requirements.
- Updated dashboard module rendering to show status, enabled/configured flags, and missing requirements per card.

## Verification
- RED confirmed for missing status fields and missing CLI/API/dashboard status rendering.
- GREEN confirmed for targeted core/CLI/API/dashboard tests.
- `npm.cmd run typecheck`: PASS
- `npm.cmd test`: PASS, 17 files / 89 tests
- `npm.cmd run build`: PASS
- `npm.cmd run wiki:check`: PASS
- `npm.cmd run preview:check`: PASS after browser launch approval, desktop/mobile consoleErrors=0

## Note
- PowerShell profile execution policy warnings and user git ignore permission warnings still appear around commands, but they did not block verification.
