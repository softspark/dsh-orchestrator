---
title: "ADR-002: Gemini Through GitHub Copilot ACP"
category: decisions
service: dsh-orchestrator
tags: [dsh, github-copilot, gemini, acp, subscriptions]
last_updated: "2026-08-27"
created: "2026-08-27"
description: "Use GitHub Copilot's official ACP server for fail-closed Gemini delegation without Google credentials."
---

# ADR-002: Gemini Through GitHub Copilot ACP

## Status

Accepted.

## Context

DSH needs a Gemini reviewer/tester without a Gemini API key or unsupported reuse of a Google consumer login. GitHub documents Copilot CLI ACP as an integration surface for custom frontends and multi-agent systems, documents OAuth login through the native CLI, and lists Gemini models for Copilot. This is a GitHub service route, not a Google AI Pro/Ultra entitlement.

Primary references:

- [Copilot CLI ACP server](https://docs.github.com/en/copilot/reference/copilot-cli-reference/acp-server)
- [Copilot CLI command reference](https://docs.github.com/en/copilot/reference/copilot-cli-reference/cli-command-reference)
- [Supported Copilot models](https://docs.github.com/en/copilot/reference/ai-models/supported-models)
- [Copilot plans](https://docs.github.com/en/copilot/get-started/plans)

## Decision

Register `@deepseek-ai/dsh-subagent-acp` as `copilot-gemini` and launch the separately installed `copilot` command with:

- ACP over stdio.
- Model `gemini-3.6-flash`.
- Empty available-tool catalog and `permission: reject`.
- Custom instructions, built-in MCP servers, `ask_user`, remote control, and remote export disabled.
- Auto-update disabled and a 30 AI-credit session ceiling.
- Empty explicit environment overlay.

Expose the provider as the one-shot `subagent_gemini_copilot` tool. GitHub Copilot CLI remains the sole owner of OAuth and credential persistence. Calls consume GitHub Copilot AI credits and remain subject to the user's plan and organization policy.

## Security evidence

Version `1.0.80` was installed without lifecycle scripts after its npm SHA-512 and GitHub/Homebrew SHA-256 matched official metadata. The npm and GitHub release channels contained an identical macOS arm64 binary. Apple signature verification failed for that upstream binary despite the hash matches; the package does not redistribute it, auto-update stays disabled, and each upgrade requires renewed review.

## Consequences

- Copilot must be installed, on `PATH`, and authenticated before DSH starts.
- An IDE terminal shim is not sufficient; `copilot --version` must execute the official CLI.
- Gemini receives the standalone task and workspace path, but no DSH parent history.
- The configured role cannot read or modify workspace files through Copilot tools.
- Copilot and the hosted Gemini model receive prompt content over the network.
- Image generation is not part of this text ACP contract.

## Rejected options

- Gemini API, because it requires a separate key and billing boundary.
- Gemini CLI consumer authentication, because individual consumer access was discontinued.
- Antigravity automation, because no official ACP integration exists for this use.
- Copilot BYOK providers, because the goal is subscription-backed GitHub authentication without provider keys.
- Permission auto-approval or `--allow-all`, because Gemini's role does not require local execution authority.
