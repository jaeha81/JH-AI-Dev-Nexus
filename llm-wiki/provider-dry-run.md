# Provider Dry Run

## 2026-05-16
- Added `provider:dry-run` CLI command for safe provider readiness checks.
- The command reports provider id, capability, readiness, missing env name, and `network=not-called`.
- It does not call OpenAI, Anthropic, or any external network.
- Blocked capabilities such as `production:deploy` fail before any runtime call path.
- Secret values are not returned by the provider dry-run result or CLI output.

## Verification
- RED: `npm.cmd test -- packages/providers/src/provider-registry.test.ts apps/cli/src/commands.test.ts` failed because `createProviderDryRun` and `provider:dry-run` did not exist.
- GREEN: focused provider and CLI tests passed after implementation.

## 2026-05-16 Dashboard Provider Readiness
- Added dashboard provider readiness panel backed by `/api/provider-readiness`.
- Panel shows OpenAI/Anthropic readiness, missing env names, capability, and `network=not-called`.
- Secret values are not returned by the API or rendered in the dashboard.
- Preview check captured desktop/mobile screenshots with consoleErrors=0.

## 2026-05-16 Unknown Provider Guard
- Added clear error handling for unknown provider ids in `provider:dry-run`.
- Unknown provider now returns `Unknown provider: <id>.` while keeping `network=not-called`.
- Secret values remain absent from stdout/stderr.

## 2026-05-16 Provider Runtime Plan
- Added provider runtime request builder for safe pre-call planning.
- Added CLI `provider:runtime-plan <provider> <capability> <prompt>`.
- Runtime plan shows endpoint, method, model, and authorization env name only.
- Runtime plan does not expose API key values and does not perform the network call.
- Blocked capabilities and missing env stop before runtime execution.

## 2026-05-16 Dashboard Runtime Plan Shortcut
- Added provider runtime-plan copy command to the dashboard provider setup guide.
- Dashboard now gives both safe checks: `provider:dry-run` and `provider:runtime-plan`.
- Visual check confirms both copy buttons remain readable in the right panel.
