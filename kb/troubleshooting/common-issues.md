---
title: "dsh-orchestrator Common Issues"
category: troubleshooting
service: dsh-orchestrator
tags: [troubleshooting, dsh, claude-code, google, github-copilot, gemini]
created: "2026-08-26"
last_updated: "2026-09-04"
description: "Diagnoses Claude and Copilot login, model, permission, provider, and preset failures."
---

# dsh-orchestrator Common Issues

## Codex lists a delegation tool but does not call it

**Symptoms:** The request context or preset contains `subagent_claude_code` or
`subagent_gemini_copilot`, but Codex reports that the tool is unavailable or not
callable.

**Root cause:** The dsh-orchestrator bundle loaded without an earlier
`llm-codex` row, its patch was ordered before dsh-codex, or a stale `1.0.0`
orchestrator bundle left dsh-codex in stable mode with
`experimentalDynamicTools: false`.

**Resolution:** Install the exact packages in order and restart DSH:

```bash
dsh plugin --profile web add @softspark/dsh-codex@1.4.0 --save-exact
dsh plugin --profile web add @softspark/dsh-orchestrator@1.1.0 --save-exact
dsh --profile web --dump-default-config
```

Confirm the composed `llm-codex` config contains
`experimentalDynamicTools: true`. A standalone orchestrator layer cannot create
the missing Codex provider. DSH `0.1.1-rc.2` logs a missing-target warning and
skips that override.

**Prevention:** Keep the two exact SoftSpark packages in that bundle order and
run the network-free composition test plus real-client marker smoke for every
release.

## The Gemini delegation tool is absent

**Symptoms:** The preset contains `subagent_gemini_copilot`, but DSH cannot start its provider or the tool is missing.

**Root cause:** The official Copilot CLI is not on the DSH process `PATH`, an IDE shim shadows it, the preset is stale, or the provider bundle did not load.

**Resolution:**

Run `copilot --no-auto-update --version` in the same environment that starts DSH. Install and authenticate the official CLI, restart DSH, and create a new session with the refreshed preset.

**Prevention:** Keep the official CLI before IDE shims on `PATH` and pin reviewed versions.

## A vendor login page opens

**Symptoms:** The child asks to authenticate instead of returning a result.

**Root cause:** Native Claude Code or GitHub Copilot account state is absent or expired. The bundle cannot authenticate on the child's behalf.

**Resolution:** Stop DSH and complete the native login interactively:

```bash
claude auth login
copilot login
```

**Prevention:** Run native keyless smoke tests before installing the DSH bundle.

## Delegation tool is missing

**Symptoms:** The parent has no `subagent_claude_code` or `subagent_gemini_copilot` tool.

**Root cause:** The session uses another preset, the preset was copied to the wrong `DSH_HOME`, or its provider bundle did not load.

**Resolution:** Confirm the bundle is listed in the profile, copy `softspark-orchestrator` into that profile's user preset root, restart DSH, and create a new session with the preset selected.

**Prevention:** Verify the provider inventory and preset selection in the isolated-profile smoke test.

## A tool request is rejected

**Symptoms:** Claude can answer but cannot perform an operation requiring permission.

**Root cause:** Fail-closed defaults are active. Claude uses `dontAsk`; Copilot rejects ACP permission requests and exposes no tools.

**Resolution:** Prefer a standalone task that stays within native policy. Do not forward an API key or weaken permissions as a workaround. A different permission mode requires explicit approval and security review.

**Prevention:** Design delegated roles with non-overlapping, pre-authorized workspace responsibilities.

## A delegation loses parent context

**Symptoms:** The child does not know earlier conversation details.

**Root cause:** The external providers intentionally report `inheritsParentContext: false`.

**Resolution:** Put all required context, constraints, paths, and expected output into the standalone delegation prompt.

**Prevention:** Treat each child call as a fresh one-shot task.

## Copilot rejects the Gemini model

**Symptoms:** The child exits with a model-unavailable or policy error.

**Root cause:** `gemini-3.6-flash` is unavailable on the current Copilot plan, is disabled by organization policy, or its preview/availability status changed.

**Resolution:** Verify the model in Copilot CLI and GitHub's supported-model documentation. Change the pinned model only through a reviewed ADR update and compatibility smoke test. Do not substitute a Google API key.

**Prevention:** Run the keyless Copilot marker test before packaging and after vendor policy changes.

## Dependency or signature audit fails

**Symptoms:** `npm audit` reports a vulnerability, missing signature, or unattested package.

**Root cause:** The exact upstream dependency graph changed or the registry cannot supply signature metadata.

**Resolution:** Preserve the full report, verify against the lockfile, and review the affected upstream package. Do not suppress a high-severity finding or bypass signature checks without a documented decision.

**Prevention:** Keep exact versions, Dependabot review, and release audits mandatory.
