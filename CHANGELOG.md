# Changelog

All notable changes follow Keep a Changelog and Semantic Versioning.

## [Unreleased]

### Added

- Initial DSH bundle for native Claude Code subscription-backed delegation.
- Standard-derived `softspark-orchestrator` preset with static delegation tools.
- Deterministic repository, license, package, and composition validation.
- Public governance, multi-OS CI, security audit, SARIF, provenance publishing, and release SOPs.
- Built-in Node test coverage for provider, preset, package, credential, and lifecycle invariants.
- GitHub Copilot CLI ACP provider pinned to Gemini 3.6 Flash with keyless GitHub subscription authentication.
- Fail-closed `subagent_gemini_copilot` one-shot tool with no child tools, remote export, built-in MCP servers, custom instructions, or auto-update.
- ADR-002 and public setup, security, troubleshooting, and release evidence for the Copilot route.
- Public community-plugin badge, DSH discovery metadata, and pinned npm installation instructions including preset activation.

### Changed

- Reintroduced Gemini only through GitHub Copilot's official ACP server; direct Google, Gemini CLI, and Antigravity routes remain excluded.

### Fixed

- CI and publish workflows now write raw SARIF JSON without npm lifecycle output prefixes.
- Provider-argument tests accept Git's CRLF checkout on Windows.
- SARIF artifact upload uses the Node.js 24 based `actions/upload-artifact@v7` runtime.
