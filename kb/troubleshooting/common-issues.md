---
title: "dsh-orchestrator Common Issues"
category: troubleshooting
service: dsh-orchestrator
tags: [troubleshooting, dsh, claude-code, google]
created: "2026-08-26"
last_updated: "2026-08-26"
description: "Diagnoses Claude login, Google compatibility, permission, provider, and preset failures."
---

# dsh-orchestrator Common Issues

## The Google delegation tool is absent

**Symptoms:** The preset contains no `subagent_gemini` or Antigravity tool.

**Root cause:** This is intentional. Gemini CLI no longer serves individual Google AI Pro/Ultra accounts. Antigravity has no ACP and its account terms prohibit third-party orchestration.

**Resolution:**

Use Antigravity directly, or wait for Google to publish an official terms-safe protocol. Do not proxy Google OAuth, copy tokens, or add a headless Antigravity wrapper.

**Prevention:** Keep the Google exclusion asserted in tests and revisit it only through an ADR plus legal/security review.

## A vendor login page opens

**Symptoms:** The child asks to authenticate instead of returning a result.

**Root cause:** Native Claude Code account state is absent or expired. The bundle cannot authenticate on the child's behalf.

**Resolution:** Stop DSH and complete the native login interactively:

```bash
claude auth login
```

**Prevention:** Run native keyless smoke tests before installing the DSH bundle.

## Delegation tool is missing

**Symptoms:** The parent has no `subagent_claude_code` tool.

**Root cause:** The session uses another preset, the preset was copied to the wrong `DSH_HOME`, or its provider bundle did not load.

**Resolution:** Confirm the bundle is listed in the profile, copy `softspark-orchestrator` into that profile's user preset root, restart DSH, and create a new session with the preset selected.

**Prevention:** Verify the provider inventory and preset selection in the isolated-profile smoke test.

## A tool request is rejected

**Symptoms:** Claude can answer but cannot perform an operation requiring permission.

**Root cause:** Fail-closed defaults are active. Claude uses `dontAsk`.

**Resolution:** Prefer a standalone task that stays within native policy. Do not forward an API key or weaken permissions as a workaround. A different permission mode requires explicit approval and security review.

**Prevention:** Design delegated roles with non-overlapping, pre-authorized workspace responsibilities.

## A delegation loses parent context

**Symptoms:** The child does not know earlier conversation details.

**Root cause:** The Claude provider intentionally reports `inheritsParentContext: false`.

**Resolution:** Put all required context, constraints, paths, and expected output into the standalone delegation prompt.

**Prevention:** Treat each child call as a fresh one-shot task.

## Dependency or signature audit fails

**Symptoms:** `npm audit` reports a vulnerability, missing signature, or unattested package.

**Root cause:** The exact upstream dependency graph changed or the registry cannot supply signature metadata.

**Resolution:** Preserve the full report, verify against the lockfile, and review the affected upstream package. Do not suppress a high-severity finding or bypass signature checks without a documented decision.

**Prevention:** Keep exact versions, Dependabot review, and release audits mandatory.
