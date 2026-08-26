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

The repository contains no provider key, token, OAuth client, credential path, or login implementation. Both provider rows use `env: {}`. DSH preserves ordinary child process facts such as `HOME` but scrubs credential-shaped ambient variables. The vendor CLI may use only the native account state it owns.

## Permissions

- Claude `dontAsk` denies operations that native policy has not already authorized.
- Gemini `reject` cancels ACP permission requests.
- No child permission request is surfaced as a blocking human dialog.
- Changing Gemini to `allow` or Claude to `bypassPermissions` requires explicit user approval and a dedicated security review.

## Process and workspace

Each delegation starts a fresh process in the parent workspace. A child can observe or modify files only according to its vendor runtime and permission configuration. Cancellation does not roll back effects already committed by the child.

## Data flow

Prompts and model-visible workspace content leave the computer through the selected vendor CLI. DSH does not make that traffic local. Review repository sensitivity before delegating, even when authentication itself stays local.

## Logging

Do not attach credentials, complete session logs, private prompts, or proprietary file contents to issues. Keep DSH telemetry disabled unless a separate policy explicitly authorizes it.
