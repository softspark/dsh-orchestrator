---
title: "SOP: Post-Release Testing"
category: procedures
service: dsh-orchestrator
version: "1.0.0"
tags: [sop, post-release, smoke-test, github-copilot, gemini]
last_updated: "2026-09-06"
created: "2026-08-26"
description: "Verify the published bundle in an isolated DSH profile without changing production state."
---

# SOP: Post-Release Testing

## Purpose

Confirm that the published artifact registers Claude and Copilot ACP providers and exposes both intended preset tools.

## Prerequisites

- Native Claude Code login already verified.
- Native GitHub Copilot CLI login and `gemini-3.6-flash` availability already verified.
- A disposable `DSH_HOME` and workspace under `/private/tmp`.
- Provider API-key variables unset for the smoke process.
- For `2.0.0`, the [reviewed profile SDK override](../howto/setup.md#3-apply-the-reviewed-claude-sdk-compatibility-override) must resolve to `0.3.263`. The repository's npm override does not configure a consumer's pnpm profile.

## Registry and installation gates

Set `RELEASE_VERSION` to the exact published version and select its documented DSH and dsh-codex pair. Version `1.1.0` uses DSH `0.1.1-rc.2` and dsh-codex `1.4.0`; version `2.0.0` uses DSH `0.1.2-rc.1` and dsh-codex `1.5.0`.

```sh
npm view "@softspark/dsh-orchestrator@$RELEASE_VERSION" version dist.integrity dist.attestations dist.signatures --json
SMOKE_DIR="$(mktemp -d)"
cd "$SMOKE_DIR"
npm init -y
npm install --ignore-scripts --save-exact "@softspark/dsh-orchestrator@$RELEASE_VERSION"
npm audit signatures
npm audit --audit-level=high --ignore-scripts
npm pack --dry-run --ignore-scripts "@softspark/dsh-orchestrator@$RELEASE_VERSION"
```

Require a SLSA provenance v1 attestation, successful cryptographic signature verification, no high/critical dependency finding, and the documented eight-file package surface. A registry metadata response alone is not signature verification. The isolated install must contain no unexpected source, tests, KB, credentials, or lifecycle scripts.

## Runtime procedure

1. Set `DSH_HOME` to a disposable path. Install the exact dsh-codex version for the release's DSH host with `dsh plugin --profile web add <exact-package> --save-exact --ignore-scripts`.
2. Install the exact published dsh-orchestrator version after dsh-codex.
3. Copy `softspark-orchestrator` into the disposable preset root.
4. Dump the default profile config and confirm `llm-codex` has `experimentalDynamicTools: true` plus the complete reviewed config.
5. Start DSH with telemetry disabled.
6. Confirm both external provider rows load without starting a child.
7. Create a new session using the preset.
8. Delegate an exact marker prompt to Claude.
9. Delegate an exact marker prompt through `subagent_gemini_copilot` and confirm the child has no tools.
10. Cancel one disposable delegation and confirm the child exits.
11. Stop DSH and inspect the disposable profile for unexpected credentials or logs.

## Verification

The config dump proves the bridge is enabled by the orchestrator layer, both markers return through their named tools, no provider API key is present, Copilot reports the pinned Gemini model, and the process tree is quiescent after shutdown.

## Verification records

Record registry integrity, provenance, signature counts, Node/npm/pnpm/DSH/native CLI versions, profile install order, observed markers, cancellation and teardown in a dated file under `kb/procedures/`. Link it from the GitHub Release after publication. Record every blocked or unexecuted check explicitly; local candidate evidence never certifies the registry artifact. The [2026-09-06 record](verification-2026-09-06.md) covers the current audit.

## Historical release evidence

Version `1.0.1` passed this procedure on 2026-09-01. The exact npm registry package ran on DSH `0.1.1-rc.2` after `@softspark/dsh-codex@1.0.0`; Claude Code returned `POST_RELEASE_CLAUDE_CHILD_OK`, GitHub Copilot Gemini returned `POST_RELEASE_GEMINI_CHILD_OK`, both Codex parent turns completed with their expected markers, and DSH stopped cleanly.

## Rollback

Stop the disposable profile. Preserve sanitized failure evidence, then remove the temporary workspace using the approved cleanup process. Do not modify native vendor login state.
