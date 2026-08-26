---
title: "dsh-orchestrator Implementation Plan"
category: planning
service: dsh-orchestrator
tags: [planning, dsh, public-module, release]
created: "2026-08-26"
last_updated: "2026-08-26"
description: "Tracks the public SoftSpark module foundation and release readiness gates."
---

# dsh-orchestrator Implementation Plan

## Objective

Ship a public, config-only DSH bundle that exposes native Claude Code and Gemini CLI subscription-backed subagents without accepting provider credentials.

## Success criteria

- Apache-2.0 public repository governance matches other SoftSpark modules.
- DSH and provider versions are exact and lockfile reproducible.
- Published files contain only the preset, patch, public documentation, and license notices.
- Tests cover composition, preset enablement, no-key policy, lifecycle-script policy, and version sync.
- Source, dependency, signature, permission, SARIF, package, and multi-OS CI gates pass.
- Isolated-profile smoke tests exercise both native logins without provider API keys.

## Phases

| Phase | Deliverable | Status |
|---|---|---|
| 1 | Provider patch and standard-derived preset | complete |
| 2 | Public repository governance and Apache notices | complete |
| 3 | Deterministic validation, tests, audit, and CI | complete |
| 4 | Exact lockfile and dependency/signature audit | complete |
| 5 | Isolated DSH profile, preset, and bridge smoke | in progress: composition works; vendor logins pending |
| 6 | Tag, provenance publish, and post-release verification | pending |

## Release blockers

- Claude Code native login must be active.
- Gemini CLI native login must be active and ACP-capable.
- The isolated DSH profile must load both providers and return exact marker prompts.
- Every release command in `kb/procedures/sop-release.md` must pass from a clean checkout.

## Evidence

- 11/11 tests pass with 100 percent line and 91.67 percent branch coverage.
- Source audit, SARIF, permission audit, and dependency audit report zero findings.
- 459 dependencies have verified registry signatures and 58 have verified attestations.
- Tarball: 11.6 kB, SHA-256 `7c3f6af2fde0f0b48f0f1d8fcb5072d5eb862359a4634eab5db3ac8f28cb12fc`.
- The isolated DSH profile discovers `softspark-orchestrator` as the default preset and the Codex dynamic bridge completes a real `todo_write` roundtrip.
