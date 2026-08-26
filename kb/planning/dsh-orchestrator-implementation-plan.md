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

Ship a public, config-only DSH bundle that exposes native Claude Code subscription-backed delegation without accepting provider credentials.

## Success criteria

- Apache-2.0 public repository governance matches other SoftSpark modules.
- DSH and provider versions are exact and lockfile reproducible.
- Published files contain only the preset, patch, public documentation, and license notices.
- Tests cover composition, preset enablement, no-key policy, lifecycle-script policy, and version sync.
- Source, dependency, signature, permission, SARIF, package, and multi-OS CI gates pass.
- Isolated-profile smoke tests exercise the supported Claude native login without provider API keys.

## Phases

| Phase | Deliverable | Status |
|---|---|---|
| 1 | Provider patch and standard-derived preset | complete |
| 2 | Public repository governance and Apache notices | complete |
| 3 | Deterministic validation, tests, audit, and CI | complete |
| 4 | Exact lockfile and dependency/signature audit | complete |
| 5 | Isolated DSH profile, preset, bridge, and Claude Max delegation smoke | complete |
| 6 | Tag, provenance publish, and post-release verification | pending |

## Release blockers

- Every release command in `kb/procedures/sop-release.md` must pass from a clean checkout.

## Evidence

- 11/11 tests pass with 100 percent line and 91.30 percent branch coverage.
- Source audit, SARIF, permission audit, and dependency audit report zero findings.
- 457 dependencies have verified registry signatures and 57 have verified attestations.
- Tarball: 11.6 kB, SHA-256 `aef37276aacfb40a1d54e8e473c1b9d835e96c83ebe29a8b776c97ff541e9011`.
- The isolated DSH profile discovers `softspark-orchestrator` as the default preset and the Codex dynamic bridge completes a real `todo_write` roundtrip.
- Codex delegated a standalone marker task to Claude Max and completed the parent turn with the expected orchestration marker, with provider API keys absent.
- Google delegation is intentionally excluded until Google offers a terms-safe third-party protocol.
