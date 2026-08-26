# dsh-orchestrator

[![CI](https://github.com/softspark/dsh-orchestrator/actions/workflows/ci.yml/badge.svg)](https://github.com/softspark/dsh-orchestrator/actions/workflows/ci.yml)
[![License: Apache-2.0](https://img.shields.io/badge/license-Apache--2.0-blue.svg)](LICENSE)

`@softspark/dsh-orchestrator` is a config-only DeepSeek Harness bundle and agent preset. It lets one DSH parent delegate standalone tasks to Claude Code and Gemini CLI while each vendor CLI uses its own native subscription login.

The package does not implement OAuth, read credential files, accept provider API keys, or call model APIs directly. It is an official SoftSpark integration and is not affiliated with or endorsed by Anthropic, Google, or DeepSeek.

## Status

Version `0.1.0` targets DSH `0.1.1-rc.2` and remains pre-release until the full isolated-profile smoke procedure passes for both providers.

Verified locally: 11/11 tests, 100 percent line coverage, 91.67 percent branch coverage, zero source or dependency findings, 459 verified registry signatures, 58 attestations, and an 11.6 kB tarball. An isolated DSH profile loads this preset as the default and has completed a Codex-to-DSH tool roundtrip; Claude and Gemini delegation smokes remain gated only by their native user logins.

## Requirements

- Node.js 22.19.0 or newer.
- npm for repository verification.
- `pnpm` for the DSH profile plugin manager.
- DeepSeek Harness `0.1.1-rc.2`.
- Claude Code authenticated through `claude auth login`.
- Gemini CLI with native ACP support, authenticated through `gemini` and `Sign in with Google`.
- A launch `PATH` where both `gemini` and Node 22 resolve correctly.

No Anthropic, Gemini, Google, or DeepSeek API key is required by this package.

## Architecture

```text
DSH parent session
    |
    +-- subagent_claude_code --> official DSH Claude provider --> Claude Code native login
    |
    +-- subagent_gemini ------> official DSH ACP provider -----> gemini --acp native login
```

`cordis.patch.yml` registers dormant host-plane providers. `agent-presets/softspark-orchestrator/agent.cordis.yml` derives from the DSH standard preset and grants only its selected sessions the two static delegation tools. Installing the bundle starts no vendor process.

## Source verification

```bash
git clone https://github.com/softspark/dsh-orchestrator.git
cd dsh-orchestrator
npm ci --ignore-scripts
npm run verify
npm run lint
npm run test:coverage
npm run audit
npm run audit:permissions
npm run audit:dependencies
npm run audit:signatures
npm run package:check
```

## Local installation

Use an isolated `DSH_HOME` before modifying a regular profile.

```bash
dsh plugin --profile web add "file:$(pwd)"

PRESET_ROOT="${DSH_HOME:-$HOME/.dsh}/.agent-presets"
test ! -e "$PRESET_ROOT/softspark-orchestrator"
mkdir -p "$PRESET_ROOT"
cp -R agent-presets/softspark-orchestrator "$PRESET_ROOT/softspark-orchestrator"
```

Restart DSH, create a new session, and select `SoftSpark Orchestrator`. Existing sessions keep the preset generation with which they started.

## Configuration

| Component | Setting | Value |
|---|---|---|
| Claude provider | registry name | `claude-code` |
| Claude provider | permission mode | `dontAsk` |
| Gemini provider | registry name | `gemini` |
| Gemini provider | command | `gemini` |
| Gemini provider | arguments | `--acp` |
| Gemini provider | permission policy | `reject` |
| Both providers | explicit environment | `{}` |
| Both tools | background mode | `one-shot` |
| Both tools | depth | `provider-managed` |

The optional `subagent_codex` row remains disabled because Codex is the intended parent provider. DSH scrubs credential-shaped ambient variables before spawning children. Native vendor settings and account state remain authoritative.

## Security boundaries

- No provider credential input or custom OAuth.
- No npm lifecycle scripts.
- Claude denies operations that native policy has not already authorized.
- Gemini ACP permission requests are rejected.
- Each delegation receives a standalone task and workspace cwd, not parent conversation history.
- Child effects completed before cancellation are not rolled back.
- Prompts and workspace content selected by a child may leave the computer through that vendor CLI.

Report vulnerabilities privately through [SECURITY.md](SECURITY.md).

## Documentation

| Document | Purpose |
|---|---|
| [Architecture](kb/reference/architecture.md) | Planes, request flow, and scope limits |
| [Configuration](kb/reference/configuration.md) | Exact providers and tool bindings |
| [Security](kb/reference/security.md) | Credential and permission boundaries |
| [Setup](kb/howto/setup.md) | Native login and isolated installation |
| [Common issues](kb/troubleshooting/common-issues.md) | Node, login, ACP, and tool discovery failures |
| [Release SOP](kb/procedures/sop-release.md) | Versioned publication workflow |

## License

Apache-2.0. See [LICENSE](LICENSE) and [NOTICE](NOTICE).
