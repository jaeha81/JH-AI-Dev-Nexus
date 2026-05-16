# Codex Context Management And Agent Room Rule

## Purpose

This document stores the full Codex-side operating rule so `AGENTS.md` can stay small. Read only the section needed for the current task.

## Core Rule

Use only the context needed for the current session task.

- Start with compressed context: LLM Wiki, Obsidian summaries, handoff notes, current-state notes, and Agent Room records.
- Do not scan the whole project, long logs, full HTML responses, or large source files just in case.
- Expand from summaries to source files only when the current task lacks enough evidence.
- For cumulative logs such as `validation-log.md`, use tail or search by default.
- For large source files, use search and targeted line ranges before full-file reads.

## Goal Mode And Plan Mode

Goal Mode and Plan Mode may need more context than normal work, but they are not broad-scan modes.

- Goal Mode: read enough related tests, production files, and verification output to support implementation and completion claims.
- Plan Mode: read required planning instructions and documents only to the level needed for the plan.
- In both modes, start narrow and expand step by step.
- If a mode forces additional context reading, state briefly why it is needed and what range will be read.

## Goal Mode Context Compression Handoff

If Goal Mode work is likely to hit context compression or session compaction, Codex must not silently continue as if nothing changed.

Required flow:

1. Notify the user that context compression is likely or has become necessary.
2. Stop taking new implementation scope unless the user explicitly asks to continue in the current session.
3. Summarize the current work state: completed changes, remaining work, verification results, dirty files, stale server or local-only risks.
4. Update the LLM Wiki handoff layer with concise facts only:
   - `llm-wiki/session-brief.md`
   - `llm-wiki/current-state.md`
   - `llm-wiki/handoff-prompt.md`
   - `llm-wiki/validation-log.md` when new verification was run
5. Use Obsidian session saving only in these cases:
   - final development work is complete and the result is worth preserving as a session record
   - the user identifies the state as an important save point
   - the user explicitly asks for `세션 종료`, `종료 저장`, `오늘 세션 저장`, or equivalent session-end saving
6. For normal context compression handoff, update LLM Wiki and provide the next-session prompt; do not run Obsidian saving unless one of the above conditions applies.
7. Give the user a ready-to-paste next-session command prompt that includes:
   - repository path
   - current goal
   - files to read first, using tail/search guidance for large wiki files
   - remaining tasks
   - exact verification commands already run and still required
   - warning to preserve uncommitted changes

Template for the next-session prompt:

```text
D:\ai프로젝트(코덱스)\JH-AI Dev Nexus 에서 Goal Mode로 계속 개발.
현재 목표: <goal>.
먼저 AGENTS.md와 codex-knowledge/context-management.md의 관련 섹션을 확인.
그 다음 llm-wiki/session-brief.md, llm-wiki/handoff-prompt.md, llm-wiki/current-state.md는 전체 읽기 대신 tail/search로 최신 섹션만 확인.
git status로 미커밋 변경을 먼저 확인하고 기존 변경을 보존.
남은 작업: <remaining work>.
검증 기준: <commands>.
TDD가 필요한 변경은 실패 테스트 -> RED 확인 -> 구현 -> GREEN -> 전체 검증 순서로 진행.
```

## Obsidian And LLM Wiki

Obsidian and LLM Wiki are context compression and session continuity layers.

- Prefer them before raw project-wide exploration.
- Update them after meaningful implementation, verification, handoff, or sync work.
- Keep updates concise and factual.
- Do not duplicate long logs or large source excerpts into startup files.

## Agent Room Role

Agent Room is the integrated operations group for user, Obsidian, Codex, and Claude.

It is not the Dev Nexus application core, but it is a core JH ecosystem control and synchronization channel.

The user works across multiple PCs. Codex must treat PC-specific state, local path differences, stale servers, uncommitted work, and session handoff notes as synchronization variables that may affect the next machine.

Record or share these items through Agent Room when applicable:

- Codex operating rule changes.
- Context usage policy changes.
- Goal Mode or Plan Mode behavior changes.
- Session-specific anomalies.
- PC-specific differences across home PC, office PC, and laptop.
- Multi-PC handoff risks such as unpushed commits, local-only files, stale dev servers, or path differences.
- Same-day work summaries needed by other agents.
- Verification results that affect handoff or sync.
- User instructions that should become long-term operating rules.

## Startup File Policy

`AGENTS.md` should remain a pointer file.

- Put only short startup rules and links there.
- Store full explanations in `codex-knowledge/` or another knowledge document.
- Avoid adding large process text directly to startup files because it increases context load every session.
- Keep the main Codex `AGENTS.md` operation portable for multi-PC work: it should point to durable knowledge and sync records, not embed long machine-specific context.
