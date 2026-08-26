# Security Policy

## Supported versions

`@softspark/dsh-orchestrator` has not been published. Version `0.1.0` receives security fixes on `main`.

## Reporting a vulnerability

Email **biuro@softspark.eu**. Do not open a public issue.

Include the affected commit, reproduction steps, impact, and a minimal proof of concept. Remove credentials, authorization headers, vendor account state, prompts, workspace contents, and personal data before sending the report.

SoftSpark will acknowledge a report within 48 hours and coordinate remediation and disclosure with the reporter.

## Security design

### Credentials

Claude Code and Gemini CLI own login, refresh, credential storage, and account state. This package neither reads credential files nor accepts tokens, cookies, authorization headers, provider API keys, or OAuth configuration.

Both provider rows use `env: {}`. Credential-shaped ambient environment variables are scrubbed by the DSH subprocess boundary before explicit configuration is applied.

### Permissions

Claude runs with `permissionMode: dontAsk`. Gemini ACP runs with `permission: reject`. Requests that still need human approval fail closed. Changing Claude to `bypassPermissions` or Gemini to `allow` requires explicit user approval and a separate security review.

### Process and workspace

The official providers start fresh child processes in the parent workspace and own cancellation and process-tree teardown. A child receives a standalone task, not parent conversation context. Cancellation cannot roll back file or external-system effects already completed.

### Network and telemetry

The package contains configuration only and adds no model HTTP client, telemetry, analytics, crash upload, or remote logger. Claude Code, Gemini CLI, DSH, and their upstream services retain their own network and telemetry behavior.

## Scope

Provider composition, preset permissions, packaging, release automation, and validation are in scope. Upstream vulnerabilities should also be reported to the affected vendor; dependency reports demonstrating an exploitable path through this package remain in scope.
