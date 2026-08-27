---
title: "DSH Orchestrator Configuration"
category: reference
service: dsh-orchestrator
tags: [configuration, dsh, claude-code, github-copilot, gemini, acp]
last_updated: "2026-08-27"
created: "2026-08-26"
description: "Exact provider and tool configuration contract for the orchestration bundle."
---

# DSH Orchestrator Configuration

## Package contract

| Dependency | Required version |
|---|---|
| `@deepseek-ai/dsh` peer | `0.1.1-rc.2` |
| `@deepseek-ai/dsh-subagent-acp` | `0.1.1-rc.2` |
| `@deepseek-ai/dsh-subagent-claude-code` | `0.1.1-rc.2` |

## Providers

Claude registers as `claude-code`, uses `permissionMode: dontAsk`, and uses an empty explicit environment overlay. The official Agent SDK selects its packaged Claude Code executable.

Copilot registers as `copilot-gemini`, launches `copilot --acp --stdio`, pins `gemini-3.6-flash`, rejects permission requests, and exposes no child tools. Remote features, custom instructions, built-in MCP servers, `ask_user`, and auto-update are disabled. The empty environment overlay prevents this bundle from forwarding credentials.

No direct Google provider is registered. Google AI Pro/Ultra, Gemini CLI, Antigravity, Google OAuth, and Gemini API keys are outside this contract.

## Tools

| Tool | Provider | Background mode | Depth |
|---|---|---|---|
| `subagent_claude_code` | `claude-code` | `one-shot` | `provider-managed` |
| `subagent_gemini_copilot` | `copilot-gemini` | `one-shot` | `provider-managed` |

The Copilot model is explicit because it defines the tool's role and credit multiplier. Do not add API credentials to either row. Native vendor settings remain authoritative for authentication.
