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
