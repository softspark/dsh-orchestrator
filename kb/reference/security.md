---
title: "DSH Orchestrator Security Boundaries"
category: reference
service: dsh-orchestrator
tags: [security, credentials, permissions]
last_updated: "2026-08-26"
created: "2026-08-26"
description: "Credential, permission, process, and workspace boundaries for child agents."
---

# DSH Orchestrator Security Boundaries

## Credentials

The repository contains no provider key, token, OAuth client, credential path, or login implementation. The Claude provider row uses `env: {}`. DSH preserves ordinary child process facts such as `HOME` but scrubs credential-shaped ambient variables. Claude Code may use only the native account state it owns.

## Permissions

- Claude `dontAsk` denies operations that native policy has not already authorized.
- No child permission request is surfaced as a blocking human dialog.
- Changing Claude to `bypassPermissions` requires explicit user approval and a dedicated security review.

Google AI Pro/Ultra and free individual accounts are unsupported in Gemini CLI, while Antigravity has no ACP and prohibits third-party use of account login. The repository therefore contains no Google provider, credentials, proxy, custom OAuth, or headless wrapper.

## Process and workspace

Each delegation starts a fresh process in the parent workspace. A child can observe or modify files only according to its vendor runtime and permission configuration. Cancellation does not roll back effects already committed by the child.

## Data flow

Prompts and model-visible workspace content leave the computer through the selected vendor CLI. DSH does not make that traffic local. Review repository sensitivity before delegating, even when authentication itself stays local.

## Logging

Do not attach credentials, complete session logs, private prompts, or proprietary file contents to issues. Keep DSH telemetry disabled unless a separate policy explicitly authorizes it.
