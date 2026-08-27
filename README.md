# dsh-orchestrator

[![CI](https://github.com/softspark/dsh-orchestrator/actions/workflows/ci.yml/badge.svg)](https://github.com/softspark/dsh-orchestrator/actions/workflows/ci.yml)
[![License: Apache-2.0](https://img.shields.io/badge/license-Apache--2.0-blue.svg)](LICENSE)

`@softspark/dsh-orchestrator` is a config-only DeepSeek Harness bundle and agent preset. It lets one DSH parent delegate standalone tasks to Claude Code through its native Max/Pro login and to Gemini through the official GitHub Copilot CLI ACP server.

The package does not implement OAuth, read credential files, accept provider API keys, or call model APIs directly. It is a SoftSpark integration and is not affiliated with or endorsed by Anthropic, DeepSeek, GitHub, Google, or Microsoft.

## Status

Version `0.1.0` targets DSH `0.1.1-rc.2` and remains pre-release until publication is explicitly approved.

Verified locally: 12/12 tests, 100 percent line coverage, 92.59 percent branch coverage, zero source or dependency findings, 459 verified registry signatures, and 58 attestations. An isolated DSH profile completes Codex-to-Claude Max and Codex-to-Copilot-Gemini delegation without provider API keys.

## Requirements

- Node.js 22.19.0 or newer.
- npm for repository verification.
- `pnpm` for the DSH profile plugin manager.
- DeepSeek Harness `0.1.1-rc.2`.
- Claude Code authenticated through `claude auth login`.
- GitHub Copilot CLI `1.0.80` or a separately reviewed compatible version, authenticated through `copilot login` with an active Copilot plan.

No Anthropic, DeepSeek, Google, Gemini, or GitHub API key is required by this package. GitHub Copilot usage consumes the plan's AI credits.

## Architecture

```text
DSH parent session
    |
    +-- subagent_claude_code --> official DSH Claude provider --> Claude Code native login
    |
    +-- subagent_gemini_copilot --> official GitHub Copilot ACP --> Gemini 3.6 Flash
```

`cordis.patch.yml` registers dormant Claude and Copilot ACP host-plane providers. `agent-presets/softspark-orchestrator/agent.cordis.yml` derives from the DSH standard preset and grants only selected sessions their static delegation tools. Installing the bundle starts no vendor process.

## Gemini route

[Gemini CLI stopped serving individual Google AI Pro/Ultra and free accounts](https://github.com/google-gemini/gemini-cli/discussions/28017) on 2026-06-18. This package still registers no Google provider and does not use Antigravity, Google OAuth, Google AI Pro/Ultra, or Gemini API keys. Gemini runs through [GitHub Copilot CLI's official ACP server](https://docs.github.com/en/copilot/reference/copilot-cli-reference/acp-server), using GitHub authentication, GitHub plan policy, and GitHub AI credits.

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
| Claude provider | explicit environment | `{}` |
| Claude tool | background mode | `one-shot` |
| Claude tool | depth | `provider-managed` |
| Copilot provider | command | `copilot --acp --stdio` |
| Copilot provider | model | `gemini-3.6-flash` |
| Copilot provider | permissions | `reject`, no available tools |
| Copilot provider | session AI credit cap | `30` |
| Copilot tool | background mode | `one-shot` |
| Copilot tool | depth | `provider-managed` |

The optional `subagent_codex` row remains disabled because Codex is the intended parent provider. DSH scrubs credential-shaped ambient variables before spawning children. Native vendor settings and account state remain authoritative.

## Security boundaries

- No provider credential input or custom OAuth.
- No npm lifecycle scripts.
- Claude denies operations that native policy has not already authorized.
- Copilot receives no tools, rejects permission requests, disables remote export/control, built-in MCP servers, custom instructions, and auto-update.
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
| [Common issues](kb/troubleshooting/common-issues.md) | Login, Google compatibility, and tool discovery failures |
| [Copilot Gemini ADR](kb/decisions/adr-002-github-copilot-gemini-acp.md) | Terms-safe protocol, model, permissions, and upstream artifact risk |
| [Release SOP](kb/procedures/sop-release.md) | Versioned publication workflow |

## License

Apache-2.0. See [LICENSE](LICENSE) and [NOTICE](NOTICE).
