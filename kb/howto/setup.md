---
title: "How to Set Up DSH Orchestrator"
category: howto
service: dsh-orchestrator
tags: [setup, dsh, native-login, github-copilot, gemini]
last_updated: "2026-08-31"
created: "2026-08-26"
description: "Install the local bundle and preset after completing native vendor logins."
---

# How to Set Up DSH Orchestrator

## Prerequisites

- Node.js `22.19.0` or newer within major 22.
- DSH `0.1.1-rc.2`.
- `@softspark/dsh-codex@1.0.0` available from npm.
- Claude Code signed in through `claude auth login`.
- GitHub Copilot CLI `1.0.80` installed from an official channel and signed in through `copilot login`.
- An active GitHub Copilot plan with CLI access and `gemini-3.6-flash` enabled.
- No Anthropic, Google, Gemini, or GitHub API key is required.

Verify that `copilot` is the real CLI rather than an IDE shim:

```sh
copilot --no-auto-update --version
```

## Steps

### 1. Verify repository gates

```sh
npm run verify
npm run package:check
```

### 2. Install the Codex parent bundle first

```sh
dsh plugin --profile web add @softspark/dsh-codex@1.0.0 --save-exact
```

The bundle order is part of the contract. dsh-orchestrator targets the
`llm-codex` row created by this earlier layer.

### 3. Install the local orchestration bundle

```sh
dsh plugin --profile web add "file:$(pwd)"
```

For the published patch release, use:

```sh
dsh plugin --profile web add @softspark/dsh-orchestrator@1.0.1 --save-exact
```

### 4. Copy the preset without overwriting

```sh
test ! -e "${DSH_HOME:-$HOME/.dsh}/.agent-presets/softspark-orchestrator"
mkdir -p "${DSH_HOME:-$HOME/.dsh}/.agent-presets"
cp -R agent-presets/softspark-orchestrator "${DSH_HOME:-$HOME/.dsh}/.agent-presets/softspark-orchestrator"
```

### 5. Restart and select the preset

Restart the `web` profile, create a new session, and select `SoftSpark Orchestrator`.

## Verification

Run `dsh --profile web --dump-default-config` and confirm the composed
`llm-codex` row contains `experimentalDynamicTools: true`. Then confirm that
the parent sees `subagent_claude_code` and `subagent_gemini_copilot`. Delegate
exact marker prompts to each tool. Login must be completed interactively
outside DSH.

## Troubleshooting

| Problem | Resolution |
|---|---|
| Gemini tool is absent | Confirm the official Copilot CLI is on the DSH process `PATH`, then restart and select a new preset session. |
| Codex lists a delegation tool but will not call it | Confirm dsh-codex was installed before dsh-orchestrator and inspect the config dump for `experimentalDynamicTools: true`. |
| Gemini model is unavailable | Check Copilot plan and organization policy; do not add a Google API key as a fallback. |
| Permission request fails | Expected under fail-closed defaults; adjust native settings, not provider keys. |
| Tool is absent | Select the `softspark-orchestrator` preset in a new session. |
| DSH warns that `llm-codex` was not found | Install `@softspark/dsh-codex@1.0.0` first, reinstall this bundle so it follows that layer, and restart DSH. |
