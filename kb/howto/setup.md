---
title: "How to Set Up DSH Orchestrator"
category: howto
service: dsh-orchestrator
version: "1.0.0"
tags: [setup, dsh, native-login, github-copilot, gemini]
last_updated: "2026-09-06"
created: "2026-08-26"
description: "Install the local bundle and preset after completing native vendor logins."
---

# How to Set Up DSH Orchestrator

## Prerequisites

- Node.js `22.19.0` or newer within major 22.
- DSH `0.1.2-rc.1` for candidate `2.0.0`.
- The `@softspark/dsh-codex@1.5.0` candidate tarball, built locally until published.
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
dsh plugin --profile web add file:/path/to/softspark-dsh-codex-1.5.0.tgz --save-exact --ignore-scripts
```

The bundle order is part of the contract. dsh-orchestrator targets the
`llm-codex` row created by this earlier layer.

### 3. Apply the reviewed Claude SDK compatibility override

DSH `0.1.2-rc.1` pins Claude Agent SDK `0.3.241`, whose bundled Claude Code
`2.1.241` is refused by current models requiring at least `2.1.251`. Updating
the standalone `claude` command does not update that SDK binary. This release
was qualified with SDK `0.3.263` and its bundled Claude Code `2.1.263`.

Set this override in the profile root before installing the orchestrator. Keep
the existing override entries; the commands below merge only this provider's
SDK selector through pnpm's configuration API:

```sh
PROFILE_DIR="${DSH_HOME:-$HOME/.dsh}/profiles/web"
OVERRIDES="$(pnpm --dir "$PROFILE_DIR" config get --location project --json overrides)"
OVERRIDES="$(node --input-type=module -e '
const current = process.argv[1].trim();
const overrides = current === "" ? {} : JSON.parse(current);
if (overrides === null || Array.isArray(overrides) || typeof overrides !== "object") throw new Error("Invalid overrides object");
overrides["@deepseek-ai/dsh-subagent-claude-code@0.1.2-rc.1>@anthropic-ai/claude-agent-sdk"] = "0.3.263";
console.log(JSON.stringify(overrides));
' "$OVERRIDES")"
pnpm --dir "$PROFILE_DIR" config set --location project --json overrides "$OVERRIDES"
```

The npm `overrides` field in this repository applies to development installs
only. Dependency overrides do not propagate when this bundle is installed
into another project; the profile configuration above is required there.
Native vendor login state and the providers' empty `env` overlays stay owned
by their existing configuration.

### 4. Install the local orchestration bundle

```sh
dsh plugin --profile web add "file:$(pwd)"
```

The previous published line below requires DSH `0.1.1-rc.2` and dsh-codex `1.4.0`. Do not install it into the candidate's newer host:

```sh
dsh plugin --profile web add @softspark/dsh-orchestrator@1.1.0 --save-exact
```

### 5. Copy the preset without overwriting

```sh
test ! -e "${DSH_HOME:-$HOME/.dsh}/.agent-presets/softspark-orchestrator"
mkdir -p "${DSH_HOME:-$HOME/.dsh}/.agent-presets"
cp -R agent-presets/softspark-orchestrator "${DSH_HOME:-$HOME/.dsh}/.agent-presets/softspark-orchestrator"
```

### 6. Restart and select the preset

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
| DSH warns that `llm-codex` was not found | Install the `@softspark/dsh-codex@1.5.0` candidate first, reinstall this bundle so it follows that layer, and restart DSH. |
