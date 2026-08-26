---
title: "DSH Orchestrator Configuration"
category: reference
service: dsh-orchestrator
tags: [configuration, dsh, claude-code]
last_updated: "2026-08-26"
created: "2026-08-26"
description: "Exact provider and tool configuration contract for the orchestration bundle."
---

# DSH Orchestrator Configuration

## Package contract

| Dependency | Required version |
|---|---|
| `@deepseek-ai/dsh` peer | `0.1.1-rc.2` |
| `@deepseek-ai/dsh-subagent-claude-code` | `0.1.1-rc.2` |

## Providers

Claude registers as `claude-code`, uses `permissionMode: dontAsk`, and uses an empty explicit environment overlay. The official Agent SDK selects its packaged Claude Code executable.

No Google provider is registered. Individual Gemini CLI access has ended and Antigravity does not provide a terms-safe ACP integration.

## Tools

| Tool | Provider | Background mode | Depth |
|---|---|---|---|
| `subagent_claude_code` | `claude-code` | `one-shot` | `provider-managed` |

Do not add model aliases or API credentials to these rows. Native vendor settings remain authoritative.
