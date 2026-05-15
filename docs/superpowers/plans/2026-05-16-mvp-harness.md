# JH Dev Nexus MVP 하네스 구현 계획

> **Agent 작업자 필수 지침:** 이 계획을 구현할 때는 `superpowers:subagent-driven-development` 또는 `superpowers:executing-plans`를 사용한다. 각 단계는 checkbox 형식으로 추적한다.

**목표:** Codex 중심 로컬 개발 하네스의 첫 번째 테스트 가능한 MVP skeleton을 만든다.

**구조:** TypeScript 기반 monorepo 형태로 시작하되 runtime은 작게 유지한다. `packages/core`는 config, menu, LLM Wiki state path를 담당한다. `apps/cli`는 core API를 사용해 status/menu/wiki command를 제공한다.

**기술 스택:** Node.js, TypeScript, Vitest, Markdown LLM Wiki.

---

### Task 1: 프로젝트 tooling과 core test

**파일:**
- 생성: `package.json`
- 생성: `tsconfig.json`
- 생성: `vitest.config.ts`
- 생성: `packages/core/src/config.test.ts`
- 생성: `packages/core/src/menu.test.ts`
- 생성: `apps/cli/src/commands.test.ts`

- [ ] **Step 1: config, menu, CLI command output에 대한 실패 테스트 작성**

실행: `npm test`
예상: `packages/core/src/config.ts`, `packages/core/src/menu.ts`, `apps/cli/src/commands.ts`가 없어서 FAIL.

- [ ] **Step 2: 최소 core와 CLI module 구현**

테스트가 요구하는 export만 생성한다.

- [ ] **Step 3: 테스트 실행**

실행: `npm test`
예상: PASS.

### Task 2: LLM Wiki 기본 문서

**파일:**
- 생성: `llm-wiki/project-overview.md`
- 생성: `llm-wiki/agent-registry.md`
- 생성: `llm-wiki/current-state.md`
- 생성: `llm-wiki/decision-log.md`
- 생성: `llm-wiki/validation-log.md`
- 생성: `llm-wiki/handoff-prompt.md`

- [ ] **Step 1: 고정 LLM Wiki 문서 생성**

각 파일은 사용자 prompt에서 요구한 최소 section을 포함한다.

- [ ] **Step 2: 문서 존재 검증**

실행: `npm run wiki:check`
예상: PASS. 6개 문서 목록 출력.

### Task 3: 검증

**파일:**
- 수정: `llm-wiki/validation-log.md`
- 수정: `llm-wiki/current-state.md`
- 수정: `llm-wiki/handoff-prompt.md`

- [ ] **Step 1: 전체 검증 실행**

실행: `npm run typecheck`, `npm test`, `npm run build`, `npm run wiki:check`.

- [ ] **Step 2: 결과 기록**

검증 결과와 다음 세션 인계 내용을 LLM Wiki에 기록한다.
