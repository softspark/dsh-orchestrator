# dsh-orchestrator

[![License: Apache-2.0](https://img.shields.io/badge/license-Apache--2.0-blue.svg)](LICENSE)
[![DSH community plugin](https://img.shields.io/badge/DSH-community%20plugin-4b8bbe.svg)](https://github.com/topics/dsh-plugin)

`@softspark/dsh-orchestrator` is a config-only DeepSeek Harness bundle and agent preset. It lets one DSH parent delegate standalone tasks to Claude Code through its native Max/Pro login and to Gemini through the official GitHub Copilot CLI ACP server.

The package does not implement OAuth, read credential files, accept provider API keys, or call model APIs directly. It is an independently maintained SoftSpark community integration. It is unofficial and is not affiliated with or endorsed by Anthropic, DeepSeek, GitHub, Google, or Microsoft.

## Status

Version `2.0.0` is a release candidate targeting DSH `0.1.2-rc.1`. The currently published `1.1.0` targets DSH `0.1.1-rc.2`. The [verification record](kb/procedures/verification-2026-09-06.md) distinguishes registry checks from candidate runtime checks.

Historical `1.1.0` pre-tag verification on 2026-09-04 passed 15 tests and both native delegation markers on DSH `0.1.1-rc.2`. It also checked session sandbox inheritance. These results do not certify the new candidate or substitute for its post-release tests.

## Requirements

- Node.js 22.19.0 or newer.
- npm for repository verification.
- `pnpm` for the DSH profile plugin manager.
- DeepSeek Harness `0.1.2-rc.1` for candidate `2.0.0`.
- `@softspark/dsh-codex@1.5.0` installed before this bundle when Codex is the parent. Use the local candidate tarball until that version is published.
- The [profile-level Claude SDK override](kb/howto/setup.md#3-apply-the-reviewed-claude-sdk-compatibility-override) to `0.3.263`. The DSH provider's bundled older CLI is refused by current Claude models even when the standalone CLI is up to date. Installing this package alone does not apply that override.
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

`cordis.patch.yml` enables the opt-in dynamic-tool bridge on the existing
`llm-codex` row, then registers dormant Claude and Copilot ACP host-plane
providers. `agent-presets/softspark-orchestrator/agent.cordis.yml` derives from
the DSH standard preset and grants only selected sessions their static
delegation tools. Installing the bundle starts no vendor process.

DSH applies bundle patches in profile order. Install dsh-codex before
dsh-orchestrator. The Codex provider remains safe with dynamic tools disabled
when it is installed without this orchestration bundle.

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

Use an isolated `DSH_HOME` before modifying a regular profile. Apply the SDK override from the setup guide after installing dsh-codex and before installing this bundle.

```bash
dsh plugin --profile web add file:/path/to/softspark-dsh-codex-1.5.0.tgz --save-exact --ignore-scripts
dsh plugin --profile web add "file:$(pwd)" --ignore-scripts

PRESET_ROOT="${DSH_HOME:-$HOME/.dsh}/.agent-presets"
test ! -e "$PRESET_ROOT/softspark-orchestrator"
mkdir -p "$PRESET_ROOT"
cp -R agent-presets/softspark-orchestrator "$PRESET_ROOT/softspark-orchestrator"
```

Restart DSH, create a new session, and select `SoftSpark Orchestrator`. Existing sessions keep the preset generation with which they started.

## Install a published release

The current published pair below requires DSH `0.1.1-rc.2`. For DSH `0.1.2-rc.1`, use the local candidates above until both new versions are published. Copy the installed preset into the profile's user preset root:

```bash
dsh plugin --profile web add @softspark/dsh-codex@1.4.0 --save-exact
dsh plugin --profile web add @softspark/dsh-orchestrator@1.1.0 --save-exact

DSH_ROOT="${DSH_HOME:-$HOME/.dsh}"
PROFILE_ROOT="$DSH_ROOT/profiles/web"
PRESET_ROOT="$DSH_ROOT/.agent-presets"
test ! -e "$PRESET_ROOT/softspark-orchestrator"
mkdir -p "$PRESET_ROOT"
cp -R "$PROFILE_ROOT/node_modules/@softspark/dsh-orchestrator/agent-presets/softspark-orchestrator" \
  "$PRESET_ROOT/softspark-orchestrator"
```

Both supported release lines discover user presets from configured roots and `$DSH_HOME/.agent-presets`; installing a bundle does not automatically add its embedded preset directory. Restart DSH, then select `SoftSpark Orchestrator` for a new session.

If dsh-orchestrator loads without an earlier `llm-codex` row, DSH logs
`patch: entry "llm-codex" not found` and skips the override. It does not insert
or own a Codex provider. Install the exact dsh-codex package first and restart
the profile.

## Configuration

| Component | Setting | Value |
|---|---|---|
| Codex parent | provider row | existing `llm-codex` from `@softspark/dsh-codex@1.4.0` |
| Codex parent | sandbox and approval fallback | `workspace-write`, `untrusted` |
| Codex parent | session permission inheritance | `true`; each knob follows the session on its own, see below |
| Codex parent | API-key auth | `false` |
| Codex parent | dynamic tools | `true` only in this later bundle layer |
| Codex parent | request, turn, and tool timeouts | `30000`, `600000`, `600000` ms |
| Claude provider | registry name | `claude-code` |
| Claude provider | permission mode | `dontAsk`, fixed for the provider instance |
| Claude provider | explicit environment | `{}` |
| Claude tool | background mode | `one-shot` |
| Claude tool | depth | `provider-managed` |
| Copilot provider | command | `copilot --acp --stdio` |
| Copilot provider | model | `gemini-3.6-flash` |
| Copilot provider | permissions | `reject`, no available tools |
| Copilot provider | session AI credit cap | `30` |
| Copilot tool | background mode | `one-shot` |
| Copilot tool | depth | `provider-managed` |

### Session permission inheritance

`inheritSessionPermissions: true` lets a Codex thread follow the DSH session it
serves instead of always using the configured fallback. The sandbox and the
approval policy are inherited **independently**, not as a pair:

| Session state | Resulting Codex thread |
|---|---|
| DSH `danger-full-access` preset (`danger-full-access` + `never`) | `danger-full-access`, `never` |
| DSH `workspace-write` preset (`workspace-write` + `ask`) | `workspace-write`, `untrusted` — the fallback |
| a full-access sandbox paired with an interactive approval policy | `danger-full-access`, `untrusted` |
| a read-only sandbox | `read-only`, `untrusted` |
| no, malformed, or unreadable session state | the configured fallback |

The session's latest valid `sandbox/mode` becomes the thread sandbox. Its
latest `approval/policy` becomes Codex `never` only when the session policy is
`never`; every other policy, the interactive `ask` included, keeps the
configured fallback, because app-server approvals have their own UI path.

A widened preset therefore widens the Codex child that session starts. Review
the presets a profile offers before enabling this. Permissions resolve once,
when the thread is created — matching DSH, which pins `sandbox/mode` and
`approval/policy` into a session at creation so later changes never alter a
live session.

The optional `subagent_codex` row remains disabled because Codex is the intended parent provider. The orchestration override repeats the complete intended static dsh-codex config because DSH replaces a targeted row's `config` rather than deep-merging it. DSH scrubs credential-shaped ambient variables before spawning children. Native vendor settings and account state remain authoritative.

## Security boundaries

- No provider credential input or custom OAuth.
- Dynamic-tool execution is enabled only when this bundle follows the exact dsh-codex layer.
- No npm lifecycle scripts.
- Codex keeps its reviewed `workspace-write` and `untrusted` fallbacks unless the session's own DSH permission state overrides them, one knob at a time.
- Claude runs with the fixed `dontAsk` permission mode and denies operations that native policy has not already authorized.
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
| [Codex dynamic-tools ADR](kb/decisions/adr-003-enable-codex-dynamic-tools.md) | Bundle ownership, ordering, and bridge activation decision |
| [Release SOP](kb/procedures/sop-release.md) | Versioned publication workflow |

## License

Apache-2.0. See [LICENSE](LICENSE) and [NOTICE](NOTICE).
