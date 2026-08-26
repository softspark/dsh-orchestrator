---
title: "DSH Orchestrator Configuration"
category: reference
service: dsh-orchestrator
tags: [configuration, dsh, acp]
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
| `@deepseek-ai/dsh-subagent-acp` | `0.1.1-rc.2` |

## Providers

Claude registers as `claude-code`, uses `permissionMode: dontAsk`, and uses an empty explicit environment overlay. The official Agent SDK selects its packaged Claude Code executable.

Gemini registers as `gemini` and starts the portable `gemini --acp` command from the DSH launch PATH, uses `permission: reject`, and uses an empty explicit environment overlay.

## Tools

| Tool | Provider | Background mode | Depth |
|---|---|---|---|
| `subagent_claude_code` | `claude-code` | `one-shot` | `provider-managed` |
| `subagent_gemini` | `gemini` | `one-shot` | `provider-managed` |

Do not add model aliases or API credentials to these rows. Native vendor settings remain authoritative.
