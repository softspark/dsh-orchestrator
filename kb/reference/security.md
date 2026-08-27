---
title: "DSH Orchestrator Security Boundaries"
category: reference
service: dsh-orchestrator
tags: [security, credentials, permissions, github-copilot, gemini]
last_updated: "2026-08-27"
created: "2026-08-26"
description: "Credential, permission, process, and workspace boundaries for child agents."
---

# DSH Orchestrator Security Boundaries

## Credentials

The repository contains no provider key, token, OAuth client, credential path, or login implementation. Both provider rows use `env: {}`. DSH preserves ordinary child process facts such as `HOME` but scrubs credential-shaped ambient variables. Each vendor CLI may use only the native account state it owns.

## Permissions

- Claude `dontAsk` denies operations that native policy has not already authorized.
- Copilot `permission: reject` declines every ACP permission request and the CLI receives an empty available-tool catalog.
- Copilot custom instructions, built-in MCP servers, `ask_user`, remote control/export, and auto-update are disabled.
- No child permission request is surfaced as a blocking human dialog.
- Changing Claude to `bypassPermissions` requires explicit user approval and a dedicated security review.

The repository contains no direct Google provider, credentials, proxy, custom OAuth, or headless Antigravity wrapper. Gemini runs as a model hosted behind GitHub Copilot's documented ACP interface and GitHub authentication boundary.

## Process and workspace

Each delegation starts a fresh process in the parent workspace. A child can observe or modify files only according to its vendor runtime and permission configuration. Cancellation does not roll back effects already committed by the child.

## Data flow

Prompts and model-visible workspace content leave the computer through the selected vendor CLI. DSH does not make that traffic local. Copilot Gemini has no file tools, but the standalone prompt itself still reaches GitHub and the hosted model. Review repository sensitivity before delegating.

## Logging

Do not attach credentials, complete session logs, private prompts, or proprietary file contents to issues. Keep DSH telemetry disabled unless a separate policy explicitly authorizes it.

## Upstream verification

The separately installed Copilot CLI `1.0.80` macOS arm64 artifact matched official npm and GitHub/Homebrew hashes during review, but its embedded Apple signature did not pass `codesign --verify`. The bundle neither installs nor redistributes that binary. Keep auto-update disabled and repeat provenance, static, and platform-signature checks before changing the accepted version.
