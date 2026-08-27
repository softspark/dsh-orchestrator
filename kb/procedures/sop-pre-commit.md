---
title: "SOP: Pre-Commit Verification"
category: procedures
service: dsh-orchestrator
tags: [sop, pre-commit, verification]
last_updated: "2026-08-27"
created: "2026-08-26"
description: "Required local gates before committing DSH orchestration changes."
---

# SOP: Pre-Commit Verification

## Purpose

Prevent invalid composition, licensing, packaging, or credential changes from entering history.

## Prerequisites

- Node.js major 22.
- No active DSH profile uses the working tree under test.

## Procedure

1. Inspect `git diff` for API keys, tokens, credential paths, custom OAuth, lifecycle scripts, and permission weakening.
2. Run:

   ```sh
   npm run verify
   npm run package:check
   git diff --check
   ```

3. Confirm only intended package files appear in the dry-run tarball.
4. Confirm `subagent_codex` remains disabled and both external tools retain `maxDepth: provider-managed`.
5. Confirm Copilot retains `permission: reject`, the empty tool catalog, disabled remote/custom/MCP features, the pinned model, and the AI-credit ceiling.

## Verification

Every command exits zero and the package dry run contains no KB, scripts, generated toolkit files, credentials, or editor state.

## Rollback

Restore only the files owned by the current change using a reversible Git operation. Never reset unrelated user work.
