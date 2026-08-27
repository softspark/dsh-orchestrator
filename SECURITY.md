# Security Policy

## Supported versions

`@softspark/dsh-orchestrator` has not been published. Version `0.1.0` receives security fixes on `main`.

## Reporting a vulnerability

Email **biuro@softspark.eu**. Do not open a public issue.

Include the affected commit, reproduction steps, impact, and a minimal proof of concept. Remove credentials, authorization headers, vendor account state, prompts, workspace contents, and personal data before sending the report.

SoftSpark will acknowledge a report within 48 hours and coordinate remediation and disclosure with the reporter.

## Security design

### Credentials

Claude Code and GitHub Copilot CLI own login, refresh, credential storage, and account state. This package neither reads credential files nor accepts tokens, cookies, authorization headers, provider API keys, or OAuth configuration.

Both provider rows use `env: {}`. Credential-shaped ambient environment variables are scrubbed by the DSH subprocess boundary before explicit configuration is applied. Copilot authenticates from its native system credential-store entry.

### Permissions

Claude runs with `permissionMode: dontAsk`. Requests that still need human approval fail closed. Changing Claude to `bypassPermissions` requires explicit user approval and a separate security review.

Copilot ACP runs with `permission: reject` and an empty tool catalog. The launch arguments also disable custom instructions, remote control/export, built-in MCP servers, `ask_user`, and auto-update. Removing any of those restrictions requires explicit approval and a separate security review.

### Process and workspace

The official providers start fresh child processes in the parent workspace and own cancellation and process-tree teardown. A child receives a standalone task, not parent conversation context. Cancellation cannot roll back file or external-system effects already completed. The current Copilot role is reasoning, review, and test planning, not workspace mutation.

### Network and telemetry

The package contains configuration only and adds no model HTTP client, telemetry, analytics, crash upload, or remote logger. Claude Code, GitHub Copilot CLI, DSH, and their upstream services retain their own network and telemetry behavior. Prompts sent to `subagent_gemini_copilot` leave the computer through GitHub's Copilot service and its selected hosted model.

### Direct Google exclusion

The package contains no Gemini CLI, Antigravity, Google OAuth, Google API, proxy, or Google token integration. Gemini is reached only through GitHub Copilot's documented ACP mode. Do not add a direct Google route without a new terms, protocol, and security review.

### Upstream Copilot artifact

Copilot CLI is a separately installed prerequisite and is not redistributed by this package. During the `1.0.80` macOS arm64 review, the npm tarballs matched their registry SHA-512 values, the GitHub release archive matched Homebrew SHA-256 `2346bb691981c2997d65c1c5bc3cef1aeddc9edd37dcb2f970b911aa597e59f6`, and both channels contained binary SHA-256 `fe779da7dd2342c1d23f0744873fa27d0251eaaee4dc6637fa53093639c0f3c9`. Apple `codesign --verify` nevertheless reported an invalid embedded signature. Install only from an official GitHub channel, pin the reviewed version, disable auto-update, and repeat this review before upgrading.

## Scope

Provider composition, preset permissions, packaging, release automation, and validation are in scope. Upstream vulnerabilities should also be reported to the affected vendor; dependency reports demonstrating an exploitable path through this package remain in scope.
