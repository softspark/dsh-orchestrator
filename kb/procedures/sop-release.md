---
title: "SOP: Release"
category: procedures
service: dsh-orchestrator
tags: [sop, release, npm]
last_updated: "2026-08-31"
created: "2026-08-26"
description: "Prepare and publish a provenance-enabled dsh-orchestrator release."
---

# SOP: Release

## Purpose

Publish a reviewed package whose tag, manifest, documentation, and DSH compatibility evidence agree.

## Prerequisites

- The first public release of every SoftSpark module is `1.0.0`; `0.x` tags and publications are forbidden. Subsequent releases follow Semantic Versioning from the latest published tag.
- Green `main` branch and clean worktree.
- Approved compatibility evidence for all exact DSH provider versions.
- Reviewed provenance and live smoke evidence for the separately installed Copilot CLI version.
- Fresh isolated-profile evidence that a Codex parent invoked `subagent_claude_code` and received the exact Claude child marker through the native Claude Code login.
- Fresh isolated-profile evidence that a Codex parent invoked `subagent_gemini_copilot` and received the exact Gemini child marker through the native GitHub Copilot login.
- npm trusted publishing configured for the GitHub `npm` environment.

## Procedure

1. Move relevant changelog entries from `Unreleased` to the target version.
2. Update `package.json` without adding lifecycle scripts.
3. Run the complete pre-commit SOP.
4. Install the exact release candidate with dsh-codex into a clean isolated DSH profile, select `softspark-orchestrator`, and run both marker delegations. A missing vendor login, unavailable provider/model, absent tool call, or wrong child marker blocks the tag. Do not substitute an API key or a different provider route.
5. Review `npm run package:check` output, license notices, Copilot CLI hashes, and upstream signature status.
6. Create and push the signed tag `v<package-version>` only after both marker smokes and all static gates pass.
7. Let `.github/workflows/publish.yml` verify and publish with provenance.

## Verification

The workflow succeeds, the registry version equals the Git tag, and provenance is present.

## Rollback

Do not reuse or overwrite a published version. Deprecate a defective version, restore the last known-good setup, and publish a corrected patch version.
