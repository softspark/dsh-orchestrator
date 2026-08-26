---
title: "ADR-001: Native Subscription Subagents"
category: decisions
service: dsh-orchestrator
tags: [dsh, claude-code, gemini, subscriptions]
last_updated: "2026-08-26"
created: "2026-08-26"
description: "Use native Claude Code and Gemini CLI processes as DSH subagents without provider API keys."
---

# ADR-001: Native Subscription Subagents

## Status

Accepted.

## Context

One local DSH window must delegate work to Claude Code and Gemini CLI while each product uses its own paid account. DSH must not receive provider API keys, copy cached credentials, or implement OAuth.

## Decision

Register the official DSH Claude Code provider and the DSH ACP provider on the host plane. Run Gemini CLI as an ACP server through the portable `gemini --acp` command under a verified Node 22 PATH. Expose two static, one-shot tools from a standard-derived preset:

- `subagent_claude_code`, provider `claude-code`, permission mode `dontAsk`.
- `subagent_gemini`, provider `gemini`, ACP permission policy `reject`.

Both provider configurations use `env: {}`. Vendor CLIs remain the only owners of account login and credential persistence.

## Consequences

- Native subscription access requires a completed vendor login before DSH starts.
- Each delegation receives a standalone task and workspace path, not parent conversation state.
- Each call creates a fresh child process and product session.
- Interactive permission prompts cannot block DSH. Requests that need approval fail closed.
- Version upgrades require compatibility validation against DSH `0.1.1-rc.2`.

## Rejected options

- Direct Anthropic or Google API clients, because they require separate API credentials.
- Custom OAuth brokers, because they duplicate vendor authentication and expand the credential boundary.
- Ambient API-key forwarding, because it makes child authority depend on unrelated shell state.
