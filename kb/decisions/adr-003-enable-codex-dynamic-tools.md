---
title: "ADR-003: Enable Codex Dynamic Tools in the Orchestrator Bundle"
category: decisions
service: dsh-orchestrator
tags: [dsh, codex, dynamic-tools, composition, orchestration]
created: "2026-08-31"
last_updated: "2026-09-04"
description: "Enable the opt-in dsh-codex dynamic-tool bridge from the later dsh-orchestrator bundle layer."
---

# ADR-003: Enable Codex Dynamic Tools in the Orchestrator Bundle

## Status

Accepted.

## Context

The `softspark-orchestrator` preset exposes `subagent_claude_code` and
`subagent_gemini_copilot`, but a Codex parent can call those DSH tools only when
the separately installed `@softspark/dsh-codex` provider enables its
experimental dynamic-tool bridge. The `@softspark/dsh-codex` bundle correctly
defaults that bridge to `false`. Installing both `1.0.0` packages therefore
produces a visible preset and tool catalog while Codex treats the delegation
tools as unavailable.

DSH `0.1.1-rc.2` applies bundle patches in profile order. A later patch can
replace the complete `config` of an existing row by targeting its stable `id`.
If the target is absent, DSH emits a loader warning and skips that patch.

## Constraints

- `@softspark/dsh-codex` must remain safe when installed alone, with
  `experimentalDynamicTools: false` by default.
- ai-toolkit must not own or edit a user's profile `cordis.patch.yml`.
- This package remains config-only and must not read credentials or implement a
  model client.
- The supported composition is pinned to DSH `0.1.1-rc.2` and exact SoftSpark
  package releases.
- Bundle order must place `@softspark/dsh-codex` before
  `@softspark/dsh-orchestrator` so the target row exists before this override.
- The override must repeat the full intended static provider config because DSH
  replaces `config` rather than deep-merging it. `cwd` remains omitted so
  dsh-codex resolves it from the DSH process working directory.
- Standalone dsh-orchestrator installation cannot fail the whole DSH boot when
  `llm-codex` is absent because the pinned DSH patch contract is warning-and-skip.

## Options

### Option 1: Keep the status quo and require a manual profile patch

Users add `experimentalDynamicTools: true` to their own profile after installing
both packages.

- Benefit: no package changes.
- Cost: installation is incomplete by default, user profiles drift, and the
  documented delegation flow fails until an undocumented manual step is added.

### Option 2: Make ai-toolkit own the profile patch

The ai-toolkit DSH lifecycle writes or merges the active profile's
`cordis.patch.yml`.

- Benefit: one installer could configure the bridge.
- Cost: it expands ai-toolkit ownership into user-authored Cordis configuration,
  creates collision and rollback risk, and couples this module's behavior to one
  installer.

### Option 3: Enable dynamic tools by default in dsh-codex

Change the provider package so every installation exposes DSH tools to Codex.

- Benefit: no composition-specific override is required.
- Cost: a low-level provider silently gains a broader experimental execution
  surface for users who did not install or request orchestration.

### Option 4: Override the Codex row from dsh-orchestrator

Add an id-targeted patch for `llm-codex` in the later orchestrator bundle layer.
The patch supplies the complete intended static dsh-codex config and sets
`experimentalDynamicTools: true`.

- Benefit: the package that exposes delegation tools also opts its Codex parent
  into the bridge required to call them.
- Cost: bundle order becomes an explicit compatibility requirement, and a
  standalone orchestrator installation only emits a missing-target warning.

## Decision

Choose Option 4. The `dsh-orchestrator` bundle will target `llm-codex` with this
complete intended static configuration:

```yaml
- id: llm-codex
  name: '@softspark/dsh-codex'
  config:
    provider: codex
    command: codex
    sandbox: workspace-write
    approvalPolicy: untrusted
    inheritSessionPermissions: true
    allowApiKeyAuth: false
    experimentalDynamicTools: true
    dynamicToolTimeoutMs: 600000
    requestTimeoutMs: 30000
    turnTimeoutMs: 600000
```

The profile bundle order is part of the public contract. Install dsh-codex
before dsh-orchestrator. The patch does not insert a new Codex provider when the
target row is missing.

## Consequences

### Positive

- A supported Codex parent receives the DSH tools exposed by the selected
  orchestrator preset without a manual profile edit.
- dsh-codex remains safe and unbridged when installed without this bundle.
- ai-toolkit keeps ownership limited to packages, preset files, and lifecycle
  state.
- Timeouts, sandbox and approval fallbacks, explicit session inheritance, and
  API-key rejection are explicit in one composition contract.
- A session keeps its own permission level instead of silently running its Codex
  thread wider or narrower than the session the user selected.

- The sandbox and the approval policy are inherited independently, so a preset
  pairing a full-access sandbox with an interactive approval policy yields
  `danger-full-access` with the `untrusted` approval fallback. The presets a
  profile offers become part of the security boundary.
- Inheritance needs `@softspark/dsh-codex` 1.4.0 or newer. An older package
  keeps the unknown key and ignores it, with no warning, because schemastery
  does not reject undeclared keys.
- The same key on the Claude row would be inert for the same reason:
  `dsh-subagent-claude-code` resolves four declared fields and none of them is
  this one. It is therefore not set there.

### Negative

- Reordering the two SoftSpark bundles prevents the override from applying.
- Installing dsh-orchestrator without dsh-codex logs a warning and leaves no
  Codex parent route. The Claude and Copilot providers may still register, but
  the documented Codex orchestration flow is unavailable.
- Dynamic tools use an experimental Codex app-server capability and require a
  real-client qualification for every supported Codex upgrade.

## Failure Mode and Revisit Trigger

The primary failure mode is a DSH patch-contract or row-id change that makes the
override skip, replace the wrong entry, or stop applying after the dsh-codex
layer. Revisit this decision when DSH changes bundle composition semantics,
dsh-codex changes the `llm-codex` id or config schema, Codex stabilizes a safer
dynamic-tool contract, or DSH adds a fail-loud dependency declaration between
bundles.
