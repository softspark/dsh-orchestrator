---
title: "dsh-orchestrator Implementation Plan"
category: planning
service: dsh-orchestrator
tags: [planning, dsh, public-module, release, github-copilot, gemini]
created: "2026-08-26"
last_updated: "2026-09-01"
description: "Tracks the public SoftSpark module foundation and release readiness gates."
---

# dsh-orchestrator Implementation Plan

## Objective

Ship a public, config-only DSH bundle that exposes Claude Code and GitHub Copilot Gemini subscription-backed delegation without accepting provider credentials.

## Success criteria

- Apache-2.0 public repository governance matches other SoftSpark modules.
- DSH and provider versions are exact and lockfile reproducible.
- Published files contain only the preset, patch, public documentation, and license notices.
- Tests cover composition, preset enablement, no-key policy, lifecycle-script policy, and version sync.
- Source, dependency, signature, permission, SARIF, package, and multi-OS CI gates pass.
- Isolated-profile smoke tests exercise the supported Claude native login without provider API keys.
- Copilot Gemini uses official ACP, native GitHub OAuth, no child tools, and no direct Google credentials.

## Phases

| Phase | Deliverable | Status |
|---|---|---|
| 1 | Provider patch and standard-derived preset | complete |
| 2 | Public repository governance and Apache notices | complete |
| 3 | Deterministic validation, tests, audit, and CI | complete |
| 4 | Exact lockfile and dependency/signature audit | complete |
| 5 | Isolated DSH profile, preset, bridge, and Claude Max delegation smoke | complete |
| 6 | GitHub Copilot ACP provider, Gemini smoke, ADR, and security evidence | complete |
| 7 | Tag, provenance publish, and post-release verification | complete |
| 8 | Prepare 1.0.1 Codex dynamic-tool composition correction | complete |
| 9 | Run fresh 1.0.1 Claude and Copilot Gemini pre-tag marker smokes | complete |
| 10 | Tag, provenance publish, and exact-registry 1.0.1 post-release verification | complete |

## Release blockers

- Every release command in `kb/procedures/sop-release.md` must pass from a clean checkout.

## Evidence

- 12/12 tests pass with 100 percent line and 92.59 percent branch coverage.
- Source audit, SARIF, permission audit, and dependency audit report zero findings.
- Repository graph: 459 dependencies have verified registry signatures and 58 have verified attestations.
- Published package: `@softspark/dsh-orchestrator@1.0.0`, 12.6 kB, shasum `2aa5f556b999a311529592448d2e5c35c9cb3507`, SLSA provenance v1.
- Clean registry install: 460 verified signatures, 59 attestations, and 0 vulnerabilities.
- The isolated DSH profile discovers `softspark-orchestrator` as the default preset and the Codex dynamic bridge completes a real `todo_write` roundtrip.
- Codex delegated a standalone marker task to Claude Max and completed the parent turn with the expected orchestration marker, with provider API keys absent.
- Codex called `subagent_gemini_copilot`, the child returned `GEMINI_COPILOT_CHILD_OK`, and the parent completed with `CODEX_GEMINI_ORCHESTRATION_OK`.
- Post-release cancellation accepted the request and ended the delegated turn as `aborted`; the process tree was quiescent after shutdown.
- Direct Google integration remains excluded; the supported Gemini route is GitHub Copilot's official ACP server.
- Version `1.0.1` targets the existing `llm-codex` row from a later bundle layer and enables the bounded dynamic-tool bridge without changing dsh-codex's standalone default.
- A network-free test composes the real patch through DSH `0.1.1-rc.2`, verifies the complete Codex config, and records warning-and-skip behavior when the earlier row is absent.
- The fresh 1.0.1 pre-tag profile produced `CLAUDE_CODE_CHILD_OK` through `subagent_claude_code`, then `CODEX_CLAUDE_ORCHESTRATION_OK` from the Codex parent.
- The fresh 1.0.1 pre-tag profile produced `GEMINI_COPILOT_CHILD_OK` through `subagent_gemini_copilot`, then `CODEX_GEMINI_ORCHESTRATION_OK` from the Codex parent.
- Published package: `@softspark/dsh-orchestrator@1.0.1`, eight files, shasum `7573aeedc5a5204732bd9cfb7d80aeb3e9ca0be0`, SLSA provenance v1.
- The exact registry package produced `POST_RELEASE_CLAUDE_CHILD_OK` and `POST_RELEASE_CODEX_CLAUDE_OK` through the Claude tool, plus `POST_RELEASE_GEMINI_CHILD_OK` and `POST_RELEASE_CODEX_GEMINI_OK` through the Copilot Gemini tool.
