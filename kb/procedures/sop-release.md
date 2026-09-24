---
title: "SOP: Release"
category: procedures
service: dsh-orchestrator
version: "1.1.0"
tags: [sop, release, npm, local-gates]
last_updated: "2026-09-24"
created: "2026-08-26"
description: "Prepare a dsh-orchestrator release and publish it with the single local release command."
---

# SOP: Release

```bash
npm run release -- X.Y.Z             # gates, pack smoke, signed tag, push, watch publish
npm run release -- X.Y.Z --dry-run   # everything up to the tag, then prints the rest
```

## Purpose

Publish a reviewed package whose tag, manifest, documentation, and DSH compatibility evidence agree.

`scripts/release.sh` is the only supported way to create a release tag. GitHub Actions no longer tests anything: there is no CI on pushes or pull requests, and `publish.yml` only turns a tag into an npm package and a GitHub Release. A tag made by hand ships whatever the commit holds, gated or not. The shared model is the SoftSpark SOP "Local Release Gates, Publish-Only CI"; this page keeps what is specific to dsh-orchestrator.

## Prerequisites

- The first public release of every SoftSpark module is `1.0.0`; `0.x` tags and publications are forbidden. Subsequent releases follow Semantic Versioning from the latest published tag.
- Approved compatibility evidence for all exact DSH provider versions.
- The profile-root Claude SDK override from the setup guide is applied and its effective dependency is verified. Repository `overrides` alone do not configure downstream profiles.
- Reviewed provenance and live smoke evidence for the separately installed Copilot CLI version.
- Fresh isolated-profile evidence that a Codex parent invoked `subagent_claude_code` and received the exact Claude child marker through the native Claude Code login.
- Fresh isolated-profile evidence that a Codex parent invoked `subagent_gemini_copilot` and received the exact Gemini child marker through the native GitHub Copilot login.
- npm trusted publishing configured for the GitHub `npm` environment.
- Git configured to SSH-sign tags.

## Procedure

1. Move relevant changelog entries from `Unreleased` to `## [X.Y.Z] - YYYY-MM-DD`.
2. Update `package.json` and `package-lock.json` without adding lifecycle scripts.
3. Run the complete pre-commit SOP.
4. Install the exact release candidate with dsh-codex into a clean isolated DSH profile, select `softspark-orchestrator`, and run both marker delegations. A missing vendor login, unavailable provider/model, absent tool call, or wrong child marker blocks the tag. Do not substitute an API key or a different provider route.
5. Review `npm run package:check` output, license notices, Copilot CLI hashes, and upstream signature status.
6. Commit `chore: release vX.Y.Z` and push `main`.
7. Run `npm run release -- X.Y.Z` only after both marker smokes pass. It stops at the first failure and logs to `${TMPDIR:-/tmp}/dsh-orchestrator-release-X.Y.Z/`:

| Step | What it checks or does |
|---|---|
| 1. Preconditions | on `main`, clean tree, `main` equals `origin/main` after a fetch, `X.Y.Z` is semver, `vX.Y.Z` exists neither locally nor on origin |
| 2. Version and notes | `verify-version-sync.mjs --tag vX.Y.Z` (manifest and both lockfile fields), a dated `## [X.Y.Z]` CHANGELOG heading, `HEAD` is `chore: release vX.Y.Z` |
| 3. Gates | `npm ci --ignore-scripts`, `verify`, `lint`, `test:coverage`, `audit:dependencies` (high and critical block), `audit:signatures`, `audit`, `audit:permissions`, SARIF generation, `package:check`, publish controls in `publish.yml` (`--provenance`, `id-token: write`, `--ignore-scripts`) |
| 4. Linux run | not applicable, see below |
| 5. Build and smoke | `npm pack`; the bundle patch named in `package.json` and both preset files must be in the tarball, byte-identical to the checkout, and parse as YAML; no tests, scripts or KB ship |
| 6. Tag and push | SSH-signed tag `vX.Y.Z` (`Release vX.Y.Z`) on `HEAD`, push `main`, then `git push origin refs/tags/vX.Y.Z` |
| 7. Watch publish | `gh run watch` on the tag's `publish.yml` run, then `npm view @softspark/dsh-orchestrator@X.Y.Z` and the GitHub Release |

**Why there is no Linux run.** The package ships YAML configuration and documentation only. The gate is `node --check`, `node --test` over file contents, and npm audits; nothing depends on the shell, file system layout or native modules. The old CI also ran the tests on Linux and Windows; for this package that matrix bought nothing a single run does not.

**SARIF is no longer uploaded.** CI used to push the audit SARIF to GitHub code scanning. The script writes it to the log directory instead.

## What publish.yml still does

On a `v*` tag, in the `npm` environment: checkout, Node `22.19.0`, `verify-version-sync.mjs --tag` (the tag must equal every version surface), `npm publish --provenance --access public --ignore-scripts`, and the GitHub Release. Nothing is installed or built: the tarball is configuration and docs.

## Verification

The script confirms the publish run succeeded, the registry version equals the Git tag, and the GitHub Release exists. Check provenance with the post-release SOP.

## Rollback

Do not reuse or overwrite a published version. Deprecate a defective version, restore the last known-good setup, and publish a corrected patch version through the same script.
