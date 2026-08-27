---
title: "DSH Orchestrator Architecture"
category: reference
service: dsh-orchestrator
tags: [architecture, dsh, subagents, github-copilot, acp]
last_updated: "2026-08-27"
created: "2026-08-26"
description: "Architecture of the config-only DSH bundle and its agent preset."
---

# DSH Orchestrator Architecture

## Components

| Plane | File | Responsibility |
|---|---|---|
| Host | `cordis.patch.yml` | Registers dormant Claude Code and GitHub Copilot ACP providers. |
| Agent | `agent-presets/softspark-orchestrator/agent.cordis.yml` | Exposes static delegation tools to sessions selecting this preset. |
| Vendor | Claude Code | Owns login state, models, native settings, tools, and product network calls. |
| Vendor | GitHub Copilot CLI | Owns GitHub login state, ACP, hosted Gemini selection, product network calls, and AI-credit accounting. |

## Request flow

1. Codex, or another configured DSH parent model, calls one named delegation tool.
2. `dsh-tool-subagent` selects the provider fixed in that tool row.
3. The selected provider starts a fresh child in the parent session workspace.
4. The child receives a standalone text task.
5. DSH returns committed final assistant text or a bounded failure result.
6. Disposal closes the child and escalates process termination when required.

## Composition rules

Provider names are process-global and unique. Tool names are static and unique inside the preset. Out-of-process providers use `maxDepth: provider-managed` because they do not advertise DSH depth enforcement. The optional Codex subagent row remains disabled because Codex is the intended parent provider.

## Provider boundaries

Claude receives its native `dontAsk` policy. Copilot Gemini receives an empty tool catalog, rejects permission requests, and cannot load custom instructions or built-in MCP servers. Both providers receive only a standalone task and the workspace path.

## Scope limits

The module does not implement model APIs, credential storage, conversation replay, child pooling, interactive permission UI, image generation, or an active-profile installer.
