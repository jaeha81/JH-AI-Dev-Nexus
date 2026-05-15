# 에이전트 등록부

## Main Harness
- 책임: 명령 라우팅, 상태 갱신, 검증 요청.
- 입력: 사용자 명령, 메뉴 이벤트, 설정.
- 출력: 작업 라우팅 결과, 상태 갱신.
- 연결 대상: 모든 하위 에이전트.

## Sub Agent 목록
- Provider Agent: OpenAI/Anthropic provider adapter 메타데이터와 추후 호출 라인 담당.
- Telegram Agent: 상태 조회, 링크 전달, 알림만 담당.
- Discord Agent: webhook 알림, 채널 제한 상태 조회/링크 전달만 담당.
- External Mobile Agent: Telegram, Discord, 향후 모바일 채널의 공통 안전 경계 담당.
- GitHub Agent: repo, branch, PR, issue, Actions 상태 담당.
- Obsidian / LLM Wiki Agent: Markdown 상태 문서 담당.
- Preview Agent: 로컬 URL, screenshot, console error 요약 담당.
- Plugin Agent: manifest loading, enable/disable, 권한 검사 담당.
- Skill Agent: registry, install metadata, enable 상태, validation 담당.
- Template Agent: design, user, developer, admin template 담당.
- IDE Adapter Agent: VS Code, Cursor AI, Antigravity, Claude Code, Codex 명령/문서 연결 담당.
- tmux Agent: 2x2 dev/log/test/command layout 담당.
- Validation Agent: typecheck, lint, test, build, 보안 점검 담당.
- Goal Mode Agent: 자연어 작업 분류, 실행 route 선택, Codex/Claude Code prompt 생성, 검증 checklist와 stop condition 생성 담당.

## 외부 모바일 안전 경계
- 허용: `status:read`, `link:relay`, `notify:send`.
- 차단: `shell:execute`, `deploy:run`.
- secret 환경변수:
  - `TELEGRAM_BOT_TOKEN`
  - `TELEGRAM_ALLOWED_CHAT_IDS`
  - `DISCORD_WEBHOOK_URL`
  - `DISCORD_ALLOWED_CHANNEL_IDS`

## Provider 안전 경계
- 허용: `prompt:generate`, `prompt:classify`, `text:summarize`.
- 차단: `secret:read`, `billing:modify`, `production:deploy`.
- secret 환경변수:
  - `OPENAI_API_KEY`
  - `ANTHROPIC_API_KEY`

## 중복 금지 기준
- 각 에이전트는 하나의 module boundary만 소유한다.
- 공유 상태는 각 agent prompt에 복사하지 않고 LLM Wiki에 저장한다.
