---
title: "SOP: Release"
category: procedures
service: dsh-orchestrator
tags: [sop, release, npm]
last_updated: "2026-08-27"
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
- npm trusted publishing configured for the GitHub `npm` environment.

## Procedure

1. Move relevant changelog entries from `Unreleased` to the target version.
2. Update `package.json` without adding lifecycle scripts.
3. Run the complete pre-commit SOP.
4. Review `npm run package:check` output, license notices, Copilot CLI hashes, and upstream signature status.
5. Create and push the signed tag `v<package-version>` after approval.
6. Let `.github/workflows/publish.yml` verify and publish with provenance.

## Verification

The workflow succeeds, the registry version equals the Git tag, and provenance is present.

## Rollback

Do not reuse or overwrite a published version. Deprecate a defective version, restore the last known-good setup, and publish a corrected patch version.
