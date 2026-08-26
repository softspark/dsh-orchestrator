---
title: "How to Set Up DSH Orchestrator"
category: howto
service: dsh-orchestrator
tags: [setup, dsh, native-login]
last_updated: "2026-08-26"
created: "2026-08-26"
description: "Install the local bundle and preset after completing native vendor logins."
---

# How to Set Up DSH Orchestrator

## Prerequisites

- Node.js `22.19.0` or newer within major 22.
- DSH `0.1.1-rc.2`.
- Claude Code signed in through `claude auth login`.
- Gemini CLI `0.55.1` signed in with the Google account carrying the intended subscription.
- No Anthropic, Gemini, or Google API key is required.

## Steps

### 1. Verify repository gates

```sh
npm run verify
npm run package:check
```

### 2. Install the local bundle

```sh
dsh plugin --profile web add "file:$(pwd)"
```

### 3. Copy the preset without overwriting

```sh
test ! -e "${DSH_HOME:-$HOME/.dsh}/.agent-presets/softspark-orchestrator"
mkdir -p "${DSH_HOME:-$HOME/.dsh}/.agent-presets"
cp -R agent-presets/softspark-orchestrator "${DSH_HOME:-$HOME/.dsh}/.agent-presets/softspark-orchestrator"
```

### 4. Restart and select the preset

Restart the `web` profile, create a new session, and select `SoftSpark Orchestrator`.

## Verification

Confirm that the parent sees `subagent_claude_code` and `subagent_gemini`. Delegate a read-only marker prompt to each provider. A login prompt means the corresponding vendor CLI must be authenticated interactively outside DSH.

## Troubleshooting

| Problem | Resolution |
|---|---|
| Gemini starts under an old Node | Launch DSH with a PATH where `gemini` resolves through Node 22. |
| Permission request fails | Expected under fail-closed defaults; adjust native settings, not provider keys. |
| Tool is absent | Select the `softspark-orchestrator` preset in a new session. |
