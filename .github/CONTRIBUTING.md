# Contributing

## Workflow

1. Fork the repository and branch from `main`.
2. Use Conventional Commits and one logical change per commit.
3. Update tests and documentation with every configuration change.
4. Run all local gates before opening a pull request.

## Local gates

```bash
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

## Engineering rules

- Keep all DSH/provider versions exact until compatibility is revalidated.
- Never add provider API keys, credential paths, token forwarding, or custom OAuth.
- Keep provider rows on the host plane and tool rows in the preset.
- Keep Claude `dontAsk`, Gemini `reject`, and Codex subagent disabled unless an approved design changes them.
- Keep npm lifecycle scripts absent.
- Tests must not modify native login state or an active DSH profile.

Report security issues through [SECURITY.md](../SECURITY.md).
