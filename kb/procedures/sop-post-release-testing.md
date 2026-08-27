---
title: "SOP: Post-Release Testing"
category: procedures
service: dsh-orchestrator
tags: [sop, post-release, smoke-test, github-copilot, gemini]
last_updated: "2026-08-27"
created: "2026-08-26"
description: "Verify the published bundle in an isolated DSH profile without changing production state."
---

# SOP: Post-Release Testing

## Purpose

Confirm that the published artifact registers Claude and Copilot ACP providers and exposes both intended preset tools.

## Prerequisites

- Native Claude Code login already verified.
- Native GitHub Copilot CLI login and `gemini-3.6-flash` availability already verified.
- A disposable `DSH_HOME` and workspace under `/private/tmp`.
- Provider API-key variables unset for the smoke process.

## Procedure

1. Install the exact published version into the disposable profile.
2. Copy `softspark-orchestrator` into the disposable preset root.
3. Start DSH with telemetry disabled.
4. Confirm both provider rows load without starting a child.
5. Create a new session using the preset.
6. Delegate an exact marker prompt to Claude.
7. Delegate an exact marker prompt through `subagent_gemini_copilot` and confirm the child has no tools.
8. Cancel one disposable delegation and confirm the child exits.
9. Stop DSH and inspect the disposable profile for unexpected credentials or logs.

## Verification

Both markers return through their named tools, no provider API key is present, Copilot reports the pinned Gemini model, and the process tree is quiescent after shutdown.

## Rollback

Stop the disposable profile. Preserve sanitized failure evidence, then remove the temporary workspace using the approved cleanup process. Do not modify native vendor login state.
