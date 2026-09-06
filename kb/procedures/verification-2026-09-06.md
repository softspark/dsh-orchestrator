---
title: "dsh-orchestrator verification on 2026-09-06"
category: procedures
service: dsh-orchestrator
version: "2.0.0"
tags: [verification, release, provenance, compatibility]
created: "2026-09-06"
last_updated: "2026-09-06"
description: "Published 2.0.0 verification with preserved historical and pre-release runtime evidence."
---

# Verification on 2026-09-06

## Published artifact: 2.0.0

- [Public release](https://github.com/softspark/dsh-orchestrator/releases/tag/v2.0.0); npm `latest` resolves to `2.0.0`.
- [Publish workflow](https://github.com/softspark/dsh-orchestrator/actions/runs/34055175195) passed on `68786d158b1c1e2bba084fe1f28af49e1159d322`.
- Registry metadata identifies SLSA provenance v1. A new npm 11.13.0 artifact-inspection consumer installed the exact Codex 1.5.0/orchestrator 2.0.0 pair with lifecycle scripts and automatic peer installation disabled. It verified **109 registry signatures and 14 attestations**; its dependency audit reported zero vulnerabilities.
- All **3** shipped runtime/configuration, declaration and map files were compared byte-for-byte with the qualified candidate tarball and matched. `cordis.patch.yml` SHA-256: `79ba1d23b48a97f1f494789977e42024cd7005f4ac479fff140b9f56f20f1ada`.
- Expected preset files, LICENSE, NOTICE and bundle configuration exist. Source, tests, KB and .github do not ship.
- No paid model calls were repeated in this artifact-verification pass. The unchanged runtime files retain the pre-release qualification recorded below; registry signatures and provenance were checked independently against the actual published versions.


## Earlier published artifact: 1.1.0

- npm integrity: `sha512-5ANFM4XFlB3e56wiN5RCsYlpkcKYNBZMGf64DD0LcAC/aXh6IntQwusNqJbmMN990rBOJ1x6fawO0lBI/3MAfg==`.
- npm metadata identifies the eight-file public package, SLSA provenance v1 and registry signatures.
- A clean installation of `dsh-orchestrator@1.1.0` and `dsh-codex@1.4.0`, with lifecycle scripts disabled, passed cryptographic checks: 461 signatures and 60 attestations. Dependency audit reported zero vulnerabilities.
- The historical `1.0.1` post-release markers and `1.1.0` pre-tag markers remain historical records. They are not restated as a new registry runtime test.
- A new pnpm `11.24.0` registry install of the exact pair into DSH `0.1.1-rc.2` booted the web host. The composed Codex service returned `DSH_HOST_CODEX_OK` and Copilot Gemini returned `DSH_GEMINI_CHILD_OK`. Claude returned `invalid-success` with exit code 1 using the older bundled SDK. These current runtime results do not rewrite the historical successful release record.

## Pre-release qualification: 2.0.0

- Node `22.22.2`, npm `11.13.0`, pnpm `11.24.0`, DSH `0.1.2-rc.1`, dsh-codex `1.5.0` candidate, Copilot CLI `1.0.80`.
- Final checks in the original repository passed: required files, version sync, KB, license, package, configuration, lint, all 16 tests, source audit, permission audit and package dry run. Tests use the real DSH composition API and resolve the provider's actual SDK to verify the `0.3.263` override.
- This package ships configuration only. Node coverage describes test code; it is not a claim of runtime code coverage. The host composition and native provider checks are the runtime evidence.
- Candidate dependency audit: zero vulnerabilities, 526 verified signatures and 79 attestations.
- Both candidate tarballs installed into an isolated `web` profile, Codex first, with pnpm `11.24.0`. DSH loaded `claude-code` and `copilot-gemini`; installing the bundles itself started no vendor child.
- Through the actual composed host, Codex returned `DSH_HOST_CODEX_OK`, and Copilot Gemini returned `DSH_GEMINI_CHILD_OK` with `completed`. The parent and child handles were disposed after the run.
- The first Claude delegation failed because DSH pins SDK `0.3.241`, which embeds Claude Code `2.1.241`. The native standalone CLI was already `2.1.263` and authenticated with Claude Max. A direct official-SDK diagnostic confirmed HTTP 400: the account's model requires CLI `2.1.251` or newer.
- A targeted profile-root pnpm override to SDK `0.3.263` fixed the failure. The same composed profile then returned `DSH_CLAUDE_CHILD_OK` and `DSH_GEMINI_CHILD_OK`, both with `completed`, followed by parent/child disposal. This qualification requires the documented profile override; installing the bundle alone does not apply it.

## Limits and release gate

Version `2.0.0` is published and its registry artifact is independently verified
above. Service-level native delegation is preserved in the qualification above;
the Codex parent calling both named tools, parent-tool cancellation and browser
restart checks are recorded in the [Codex verification record](https://github.com/softspark/dsh-codex/blob/main/kb/procedures/verification-2026-09-06.md).
This artifact-verification pass did not repeat vendor model calls or claim a
fresh complete registry-profile runtime SOP. The documented profile-root SDK
override is still required. These providers are not compatible with DSH
`0.1.1-rc.2`.

All tests used disposable DSH profiles with telemetry disabled. The user's regular DSH installation has not been located or changed.
