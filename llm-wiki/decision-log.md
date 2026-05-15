# 결정 기록

## 2026-05-16
- 결정: TypeScript, Node.js, Vitest, Markdown으로 시작.
- 이유: 로컬 CLI, web dashboard, adapter module 구축에 가장 낮은 복잡도.
- 대안: Python/FastAPI 우선.
- 상태: API server가 필요해질 때까지 보류.

## 2026-05-16
- 결정: 상태를 고정 `llm-wiki` Markdown 파일에 저장.
- 이유: Codex와 Claude Code 사이의 반복 context 복사를 줄이기 위함.
- 대안: database-first 상태 저장.
- 상태: 보류.

## 2026-05-16
- 결정: Telegram과 Discord는 공통 external mobile connector registry로 추가.
- 이유: 모바일 접근은 허용하되 chat app에서 직접 명령 실행되는 위험을 막기 위함.
- 대안: full bot runtime 즉시 구현.
- 상태: dashboard/preview 기반이 생길 때까지 보류.

## 2026-05-16
- 결정: JH Goal Mode는 core generator + CLI + 정적 dashboard로 구현.
- 이유: 현재 repo에 app router나 component system이 없으므로 없는 framework를 중복 생성하지 않기 위함.
- 대안: React dashboard 전체 scaffold.
- 상태: web dashboard shell 도입 시 확장.

## 2026-05-16
- 결정: Provider adapter skeleton은 metadata registry까지만 구현.
- 이유: OpenAI/Anthropic 연결 라인은 보이게 하되 유료 API 호출과 secret 노출을 피하기 위함.
- 대안: SDK client 즉시 구현.
- 상태: runtime call과 secret handling 요구가 명시 승인될 때까지 보류.

## 2026-05-16
- 결정: 사용자 검토용 문서는 한국어를 기본으로 유지.
- 이유: 사용자가 영어 문서를 확인하기 어렵기 때문.
- 대안: 영어 원문 유지.
- 상태: LLM Wiki와 계획 문서부터 한국어화.

## 2026-05-16
- 결정: preview/error-check는 먼저 `dry-run` skeleton으로 구현.
- 이유: 실제 browser capture와 network check는 dev server, browser 권한, screenshot 저장 정책이 필요하기 때문.
- 대안: Playwright 기반 실제 capture 즉시 구현.
- 상태: local URL 검증과 오류 요약 구조까지 완료. 실제 capture는 다음 단계.

## 2026-05-16
- 결정: 정적 Goal Mode dashboard는 Node.js 내장 `http` server로 preview한다.
- 이유: 추가 dependency 없이 `apps/web-dashboard` 파일을 로컬에서 확인할 수 있음.
- 대안: Vite/Next dev server 도입.
- 상태: `npm run preview:dashboard`로 `http://127.0.0.1:3100` 제공.

## 2026-05-16
- 결정: screenshot capture는 Playwright를 dev dependency로 추가해 구현.
- 이유: 실제 browser rendering, screenshot 저장, console error 수집을 자동화하기 위함.
- 대안: 정적 HTML 테스트만 유지.
- 상태: `npm run preview:capture`로 desktop screenshot 저장과 console error count 확인 가능.

## 2026-05-16
- 결정: desktop/mobile capture를 별도 script `preview:capture:all`로 제공.
- 이유: 반응형 layout 검증을 개발자 명령 하나로 수행하기 위함.
- 대안: 단일 desktop screenshot만 유지.
- 상태: desktop/mobile screenshot과 console error count 확인 완료.

## 2026-05-16
- 결정: `preview:check`는 capture 실행과 validation log 기록을 하나로 묶는다.
- 이유: 사용자에게 검증 결과를 따로 정리시키지 않고 다음 세션 source of truth에 남기기 위함.
- 대안: screenshot만 생성하고 수동 기록.
- 상태: `llm-wiki/validation-log.md` append 완료.

## 2026-05-16
- 결정: screenshot artifact는 preview server의 `/artifacts/playwright/` 경로로 제공한다.
- 이유: 사용자가 dashboard 우측 panel에서 desktop/mobile 결과를 바로 열어볼 수 있어야 함.
- 대안: 파일 경로만 문서에 기록.
- 상태: `image/png` 응답 확인 완료.
