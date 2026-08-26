---
title: "dsh-orchestrator Common Issues"
category: troubleshooting
service: dsh-orchestrator
tags: [troubleshooting, dsh, claude-code, gemini, acp]
created: "2026-08-26"
last_updated: "2026-08-26"
description: "Diagnoses Node, native login, ACP, permission, provider, and preset failures."
---

# dsh-orchestrator Common Issues

## Gemini reports an ESM syntax error

**Symptoms:** Gemini exits before ACP initialization with `Unexpected token import`, or `node --version` reports an old release.

**Root cause:** The `gemini` shebang resolved an unsupported Node executable from the DSH launch `PATH`.

**Resolution:**

```bash
command -v node
node --version
command -v gemini
gemini --version
```

Launch DSH from a shell where Node 22 precedes older system installations.

**Prevention:** Keep CI and the DSH launcher on Node 22.19.0 or newer.

## A vendor login page opens

**Symptoms:** The child asks to authenticate instead of returning a result.

**Root cause:** Native Claude Code or Gemini CLI account state is absent or expired. The bundle cannot authenticate on the child's behalf.

**Resolution:** Stop DSH and complete the native login interactively:

```bash
claude auth login
gemini
```

For Gemini select `Sign in with Google`, not an API-key flow.

**Prevention:** Run native keyless smoke tests before installing the DSH bundle.

## Delegation tool is missing

**Symptoms:** The parent has no `subagent_claude_code` or `subagent_gemini` tool.

**Root cause:** The session uses another preset, the preset was copied to the wrong `DSH_HOME`, or its provider bundle did not load.

**Resolution:** Confirm the bundle is listed in the profile, copy `softspark-orchestrator` into that profile's user preset root, restart DSH, and create a new session with the preset selected.

**Prevention:** Verify the provider inventory and preset selection in the isolated-profile smoke test.

## A tool request is rejected

**Symptoms:** Claude or Gemini can answer but cannot perform an operation requiring permission.

**Root cause:** Fail-closed defaults are active. Claude uses `dontAsk` and Gemini ACP uses `reject`.

**Resolution:** Prefer a standalone task that stays within native policy. Do not forward an API key or weaken permissions as a workaround. A different permission mode requires explicit approval and security review.

**Prevention:** Design delegated roles with non-overlapping, pre-authorized workspace responsibilities.

## A delegation loses parent context

**Symptoms:** The child does not know earlier conversation details.

**Root cause:** Both providers intentionally report `inheritsParentContext: false`.

**Resolution:** Put all required context, constraints, paths, and expected output into the standalone delegation prompt.

**Prevention:** Treat each child call as a fresh one-shot task.

## Dependency or signature audit fails

**Symptoms:** `npm audit` reports a vulnerability, missing signature, or unattested package.

**Root cause:** The exact upstream dependency graph changed or the registry cannot supply signature metadata.

**Resolution:** Preserve the full report, verify against the lockfile, and review the affected upstream package. Do not suppress a high-severity finding or bypass signature checks without a documented decision.

**Prevention:** Keep exact versions, Dependabot review, and release audits mandatory.
