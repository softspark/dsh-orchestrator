---
title: "SOP: Release"
category: procedures
service: dsh-orchestrator
tags: [sop, release, npm]
last_updated: "2026-08-26"
created: "2026-08-26"
description: "Prepare and publish a provenance-enabled dsh-orchestrator release."
---

# SOP: Release

## Purpose

Publish a reviewed package whose tag, manifest, documentation, and DSH compatibility evidence agree.

## Prerequisites

- Green `main` branch and clean worktree.
- Approved compatibility evidence for all exact DSH provider versions.
- npm trusted publishing configured for the GitHub `npm` environment.

## Procedure

1. Move relevant changelog entries from `Unreleased` to the target version.
2. Update `package.json` without adding lifecycle scripts.
3. Run the complete pre-commit SOP.
4. Review `npm run package:check` output and license notices.
5. Create and push the signed tag `v<package-version>` after approval.
6. Let `.github/workflows/publish.yml` verify and publish with provenance.

## Verification

The workflow succeeds, the registry version equals the Git tag, and provenance is present.

## Rollback

Do not reuse or overwrite a published version. Deprecate a defective version, restore the last known-good setup, and publish a corrected patch version.
