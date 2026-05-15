# 프로젝트 개요

## 목적
- JH 작업 흐름을 Codex 중심으로 운영하는 로컬 개발 하네스를 구축한다.

## 핵심 범위
- 로컬 CLI와 대시보드 기반 구조.
- OpenAI/GPT와 Anthropic용 LLM provider adapter 라인.
- LLM Wiki 기반 상태 관리.
- preview, 검증, plugin, skill, Telegram, Discord, GitHub, Obsidian, tmux, IDE adapter 확장 지점.
- Telegram/Discord 기반 외부 모바일 연결 라인.

## MVP 범위
- core config.
- menu registry.
- CLI `status`, `menu`, `wiki:check`.
- CLI `mobile` connector 조회.
- JH Goal Mode 기반 Codex/Claude Code prompt 생성.
- Goal Mode용 정적 workspace dashboard.
- OpenAI/Anthropic provider registry.
- 고정 LLM Wiki 문서 구조.

## 제외 범위
- API key 하드코딩.
- 자동 배포.
- Telegram shell 실행.
- Discord shell 실행.
- 네이티브 모바일 앱.
- Claude Code 또는 Codex 직접 자동 실행 bridge.
- 실제 OpenAI/Anthropic 유료 API 호출.

## 주요 기술 스택
- TypeScript.
- Node.js.
- Vitest.
- Markdown LLM Wiki.
