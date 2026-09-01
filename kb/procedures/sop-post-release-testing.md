---
title: "SOP: Post-Release Testing"
category: procedures
service: dsh-orchestrator
tags: [sop, post-release, smoke-test, github-copilot, gemini]
last_updated: "2026-08-31"
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

1. Install `@softspark/dsh-codex@1.0.0` into the disposable profile.
2. Install the exact published dsh-orchestrator version after dsh-codex.
3. Copy `softspark-orchestrator` into the disposable preset root.
4. Dump the default profile config and confirm `llm-codex` has `experimentalDynamicTools: true` plus the complete reviewed config.
5. Start DSH with telemetry disabled.
6. Confirm both external provider rows load without starting a child.
7. Create a new session using the preset.
8. Delegate an exact marker prompt to Claude.
9. Delegate an exact marker prompt through `subagent_gemini_copilot` and confirm the child has no tools.
10. Cancel one disposable delegation and confirm the child exits.
11. Stop DSH and inspect the disposable profile for unexpected credentials or logs.

## Verification

The config dump proves the bridge is enabled by the orchestrator layer, both markers return through their named tools, no provider API key is present, Copilot reports the pinned Gemini model, and the process tree is quiescent after shutdown.

## Rollback

Stop the disposable profile. Preserve sanitized failure evidence, then remove the temporary workspace using the approved cleanup process. Do not modify native vendor login state.
