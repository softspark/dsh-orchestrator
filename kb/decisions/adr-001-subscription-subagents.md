---
title: "ADR-001: Native Subscription Subagents"
category: decisions
service: dsh-orchestrator
tags: [dsh, claude-code, subscriptions, google]
last_updated: "2026-08-26"
created: "2026-08-26"
description: "Use native Claude Code as a DSH subagent and reject unsupported Google subscription proxying."
---

# ADR-001: Native Subscription Subagents

## Status

Accepted.

## Context

One local DSH window must delegate work to Claude Code through its paid account. DSH must not receive provider API keys, copy cached credentials, or implement OAuth. Google AI Pro/Ultra moved from Gemini CLI to Antigravity, which has no ACP and prohibits third-party use of account login. See the [Gemini CLI transition](https://github.com/google-gemini/gemini-cli/discussions/28017), [Antigravity ACP request](https://github.com/google-antigravity/antigravity-cli/issues/31), and [Antigravity Terms](https://antigravity.google/terms).

## Decision

Register the official DSH Claude Code provider on the host plane. Expose one static, one-shot tool from a standard-derived preset:

- `subagent_claude_code`, provider `claude-code`, permission mode `dontAsk`.
- No Google tool. Revisit only after Google provides a terms-safe protocol intended for third-party orchestration.

The Claude provider uses `env: {}`. Claude Code remains the only owner of account login and credential persistence.

## Consequences

- Native subscription access requires a completed Claude login before DSH starts.
- Each delegation receives a standalone task and workspace path, not parent conversation state.
- Each call creates a fresh child process and product session.
- Interactive permission prompts cannot block DSH. Requests that need approval fail closed.
- Version upgrades require compatibility validation against DSH `0.1.1-rc.2`.

## Rejected options

- Direct Anthropic or Google API clients, because they require separate API credentials.
- Custom OAuth brokers, because they duplicate vendor authentication and expand the credential boundary.
- Ambient API-key forwarding, because it makes child authority depend on unrelated shell state.
