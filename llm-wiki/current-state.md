# 현재 상태

## 구현 완료
- 빈 GitHub repository를 로컬에 clone함.
- MVP plan 작성.
- TypeScript tooling 추가.
- core tests를 먼저 작성하고 TDD 흐름으로 구현.
- core config, menu, wiki check, CLI skeleton 추가.
- LLM Wiki 고정 문서 생성.
- `vite/esbuild` 취약점 대응을 위해 Vitest를 `4.1.6`으로 업그레이드.
- Telegram/Discord 외부 모바일 connector registry 추가.
- CLI `mobile` 명령 추가.
- `.env.example` 추가. 실제 secret 값 없음.
- JH Goal Mode core generator 추가.
- CLI `goal` 명령 추가.
- CLI `status`에 `Mode: JH Goal Mode`, `Goal Mode active: true` 표시 추가.
- `apps/web-dashboard` 아래 정적 Goal Mode dashboard 추가.
- dashboard 첫 화면에 `Goal Mode Active` 상태 표시 추가.
- dashboard 설정에 한국어/English 언어 선택기 추가.
- 언어 선택값은 `localStorage`에 저장되며 기본값은 한국어.
- 언어 선택은 dashboard 주요 문구와 Goal Mode prompt 제목/상태 메시지에 적용.
- OpenAI/GPT와 Anthropic provider adapter skeleton 추가.
- CLI `provider` 명령 추가.
- preview/error-check dry-run skeleton 추가.
- CLI `preview` 명령 추가.
- local dashboard preview server 추가.
- `npm run preview:dashboard` 명령 추가.
- Playwright 기반 `preview:capture` script 추가.
- Goal Mode dashboard screenshot capture와 UI generation 동작 확인 완료.
- desktop/mobile 동시 screenshot capture 추가.
- CLI `preview:capture:all` plan 명령 추가.
- `preview:check` 명령 추가. desktop/mobile capture 후 `validation-log.md` 자동 기록.
- dashboard 우측 panel에 desktop/mobile screenshot artifact 링크 추가.
- preview server가 `/artifacts/playwright/*.png`를 안전하게 제공.
- dashboard 우측 panel에 최근 preview check 검증 결과 표시 추가.
- preview server가 `/api/preview-validation`으로 `validation-log.md`의 최근 Preview Check 기록을 JSON 제공.
- `session-brief.md` 추가. 다음 작업자는 긴 로그 전체 재독 대신 압축 진입점을 먼저 확인.
- `preview:check --notify telegram,discord` 옵션 추가. Telegram/Discord 전송 함수를 호출함.
- Telegram/Discord secret 값이 없으면 외부 전송 없이 `skipped`로 기록함.
- Telegram/Discord secret 값이 있으면 Telegram chat id와 Discord webhook으로 알림 전송을 시도함.
- CLI `mobile:status` 명령 추가. Telegram/Discord 준비 여부와 누락 env 이름만 표시하며 secret 값은 노출하지 않음.
- dashboard 우측 패널에 모바일 알림 준비 상태 추가.
- preview server가 `/api/mobile-readiness`로 Telegram/Discord 준비 상태를 JSON 제공.
- dashboard 우측 패널에 모바일 알림 설정 안내 추가. 필요한 env 이름과 `mobile:status` 확인 명령만 표시.
- dashboard 모바일 설정 안내에 `mobile:status` 명령 복사 버튼 추가.
- `preview:check`가 desktop/mobile 캡처 결과를 통합 검사 요약(`capture-summary`)으로 검증 기록에 함께 남김.
- CLI `preview:check` 안내에 `summary=capture-summary` 표시.
- CLI `preview <local-url>` 안내에 `next=npm run preview:check`, `summary=capture-summary` 표시.

## 진행 중
- dashboard 최근 검증 결과 panel 검증 완료.

## 다음 작업
- Telegram/Discord secret 설정 후 실제 모바일 수신 확인.
- `preview:capture` 결과를 CLI `preview` 검증 결과와 통합.
- Telegram/Discord 실제 transport는 connector registry 뒤에 안전장치 포함 후 추가.
- provider runtime call layer는 secret 처리와 dry-run 안전장치 확정 후 추가.

## 막힌 지점
- `.git/HEAD.lock` 생성 권한 문제로 feature branch 생성 실패.
- PowerShell execution policy가 `Microsoft.PowerShell_profile.ps1` 로드를 차단해 매 명령마다 profile warning 출력.

## 2026-05-16 추가 진행
- Telegram/Discord 알림 전송이 HTTP 실패 응답(예: 401/500)을 받으면 `sent`가 아니라 `failed`로 기록하도록 보강.
- 실패 사유에는 HTTP status만 남기고 bot token, webhook URL 같은 secret 값은 노출하지 않음.
- TDD로 실패 테스트를 먼저 추가한 뒤 구현했고, 전체 검증을 다시 통과함.

## 2026-05-16 Provider Runtime Send Update
- Provider runtime send function added with injected fetch only.
- OpenAI send uses Bearer authorization; Anthropic send uses x-api-key and anthropic-version headers.
- Runtime send results include HTTP status and response text but do not expose secret values.

## 2026-05-16 Dev Nexus Program Identity Update
- Reframed the dashboard from Agent Room/Goal Mode-only framing to `JH AI Dev Nexus` as an installable AI development operating program.
- Added Nexus module registry covering Goal Mode, LLM Wiki, providers, Telegram/mobile, GitHub, Obsidian, preview, plugins, skills, IDE adapters, tmux 2x2, templates, and Agent Room as a collaboration module.
- Dashboard now shows module cards and keeps Agent Room explicitly scoped as a module, not the program core.
- Claude Code was not needed for this implementation step.

## 2026-05-16 Session Handoff Module Update
- Added `packages/core/src/session-handoff.ts` with safe handoff plan generation.
- Session Handoff generates current-session summary text, LLM Wiki update targets, Obsidian session save command, and next-session prompt.
- Added Session Handoff to Nexus module registry and menu as an MVP memory module.
- Added CLI command `session:handoff`.
- Added dashboard/API exposure through `/api/session-handoff`, a Session Handoff panel, copy command, and next-session prompt copy control.
- Obsidian integration is exposed as a safe command plan only; no automatic write, commit, push, deploy, or secret exposure is performed by the dashboard/CLI plan.

## 2026-05-16 Session Handoff Context Collection Update
- Added context collection for Session Handoff from `llm-wiki/session-brief.md`, `llm-wiki/current-state.md`, `llm-wiki/handoff-prompt.md`, `llm-wiki/validation-log.md`, and `git status --short` text.
- CLI `session:handoff` and dashboard `/api/session-handoff` now build handoff plans from current session context instead of fixed placeholder lists.
- The collector filters `.env` paths from changed-file summaries, redacts obvious secret/token patterns, and limits validation command output to recent entries.
- Verification: `npm.cmd run typecheck`, `npm.cmd test`, `npm.cmd run build`, `npm.cmd run wiki:check`, `npm.cmd run preview:check` all PASS.

## 2026-05-16 Session Handoff Panel UX Update
- Dashboard Session Handoff no longer prints the full next-session prompt inline by default.
- Added a compact summary line with a collapsed `<details>` prompt body and preserved full prompt copy support.
- Added CSS constraints so the prompt body has a bounded scroll area when expanded.
- Verification: `npm.cmd run typecheck`, `npm.cmd test`, `npm.cmd run build`, `npm.cmd run wiki:check`, and `npm.cmd run preview:check` all PASS with desktop/mobile consoleErrors=0.

## 2026-05-16 Nexus Module Registry CLI/API Update
- CLI now exposes the Nexus module registry through `modules`, including summary counts and module id/policy/role lines.
- Dashboard preview server now exposes `/api/modules` with `{ summary, modules }` JSON from `packages/core/src/nexus-modules.ts`.
- Dashboard module cards now load from `/api/modules`; if a stale preview server returns HTML for that route, the UI falls back to existing static cards and computes the visible summary.
- Verification: `npm.cmd run typecheck`, `npm.cmd test`, `npm.cmd run build`, `npm.cmd run wiki:check`, and `npm.cmd run preview:check` all PASS; screenshots show `14 modules / MVP 7` with no visible JSON parse error.
