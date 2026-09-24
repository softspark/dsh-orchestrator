#!/usr/bin/env bash
# Release @softspark/dsh-orchestrator. The only supported way to create a release tag.
#
#   npm run release -- X.Y.Z             gates, pack smoke, tag, push, watch publish
#   npm run release -- X.Y.Z --dry-run   everything up to the tag; prints the rest
#   scripts/release.sh --gates-only      the gate alone
#
# GitHub Actions only publishes the tag; nothing there re-runs these checks, so
# a tag made by hand ships whatever was on the commit. See
# kb/procedures/sop-release.md.
#
# No Linux container step: the package ships YAML configuration and docs only,
# and the gate is node --check, node --test over file contents, and npm audits.
# Nothing in it depends on the shell, the file system layout or native modules.
set -euo pipefail

REPO_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$REPO_DIR"

PKG="@softspark/dsh-orchestrator"
GH_REPO="softspark/dsh-orchestrator"
BRANCH="main"

die()  { printf 'release: %s\n' "$*" >&2; exit 1; }
step() { printf '\n== %s\n' "$*"; }

# One gate per line on screen, full output in the log. A failure prints the
# tail so the cause is visible without opening the file.
LOG=""
run() {
  local name="$1"; shift
  printf '  %-44s ' "$name"
  printf '\n### %s\n$ %s\n' "$name" "$*" >>"$LOG"
  if "$@" >>"$LOG" 2>&1; then
    echo ok
  else
    echo FAILED
    printf -- '--- last 40 lines of %s\n' "$LOG"
    tail -n 40 "$LOG"
    exit 1
  fi
}

sarif() { node scripts/audit.mjs --sarif >"$SARIF"; }

# The publish job is the one place provenance and script-free publishing can be
# lost. Comments are stripped first so prose cannot satisfy the check.
check_publish_controls() {
  local code
  code="$(sed 's/#.*//' .github/workflows/publish.yml)"
  printf '%s' "$code" | grep -q -- '--provenance' || { echo "publish.yml lost --provenance"; return 1; }
  printf '%s' "$code" | grep -q 'id-token: write' || { echo "publish.yml lost id-token: write"; return 1; }
  printf '%s' "$code" | grep -q -- 'npm publish.*--ignore-scripts' || { echo "publish.yml lost --ignore-scripts"; return 1; }
}

gates() {
  run "npm ci --ignore-scripts"              npm ci --ignore-scripts
  run "verify (files, versions, KB, config)" npm run verify
  run "lint (node --check)"                  npm run lint
  run "test:coverage"                        npm run test:coverage
  run "audit:dependencies (high+)"           npm run audit:dependencies
  run "audit:signatures"                     npm run audit:signatures
  run "audit (source rules)"                 npm run audit
  run "audit:permissions"                    npm run audit:permissions
  run "SARIF report"                         sarif
  run "package:check (npm pack --dry-run)"   npm run package:check
  run "publish controls in publish.yml"      check_publish_controls
  # Summary only; a format change must not fail a green gate.
  grep -E '^# (tests|pass|fail) [0-9]+' "$LOG" | paste -sd ' ' - | sed 's/^/  suite: /' || true
}

# The tarball the tag will publish, built here and loaded once the way DSH
# loads it: the bundle patch named in package.json and the preset files must be
# in the tarball, byte-identical to the reviewed checkout, and parse as YAML.
# `run` calls this in an `if`, where set -e does not apply: every step carries
# its own `|| return 1`.
pack_smoke() {
  local work tarball f
  work="$(mktemp -d)" || return 1
  tarball="$(npm pack --ignore-scripts --pack-destination "$work" | tail -n 1)" || return 1
  tar -xzf "$work/$tarball" -C "$work" || return 1
  (cd "$work/package" && find . -type f | sed 's#^\./##' | sort) || return 1
  for f in cordis.patch.yml agent-presets/softspark-orchestrator/agent.cordis.yml \
           agent-presets/softspark-orchestrator/preset.yml LICENSE NOTICE README.md CHANGELOG.md; do
    cmp -s "$f" "$work/package/$f" || { echo "missing or different in tarball: $f"; return 1; }
  done
  ! find "$work/package" -path '*/tests/*' -o -path '*/scripts/*' -o -path '*/kb/*' | grep -q . \
    || { echo "tarball ships tests, scripts or KB"; return 1; }
  node --input-type=module -e "
    import { readFile } from 'node:fs/promises';
    import { parse } from 'yaml';
    const root = process.argv[1];
    const manifest = JSON.parse(await readFile(root + '/package.json', 'utf8'));
    const patch = manifest.dsh?.bundle?.patch;
    if (!patch) throw new Error('package.json names no dsh.bundle.patch');
    for (const file of [patch, 'agent-presets/softspark-orchestrator/agent.cordis.yml', 'agent-presets/softspark-orchestrator/preset.yml']) {
      const doc = parse(await readFile(root + '/' + file, 'utf8'));
      if (doc === null || typeof doc !== 'object') throw new Error(file + ' is not a YAML mapping');
      console.log('parsed ' + file);
    }
  " "$work/package" || return 1
  rm -rf "$work"
}

watch_publish() {
  local version="$1" tag="$2" run_id="" i
  for i in $(seq 1 30); do
    run_id="$(gh run list --repo "$GH_REPO" --workflow publish.yml --branch "$tag" \
      --json databaseId --jq '.[0].databaseId // empty')"
    [ -n "$run_id" ] && break
    sleep 10
  done
  [ -n "$run_id" ] || die "no publish run appeared for $tag"
  gh run watch "$run_id" --repo "$GH_REPO" --exit-status || die "publish run $run_id failed"
  # A fresh version can 404 for a minute or two after publish succeeds.
  for i in $(seq 1 30); do
    [ "$(npm view "$PKG@$version" version 2>/dev/null)" = "$version" ] && break
    [ "$i" = 30 ] && die "$PKG@$version is not on the registry"
    sleep 10
  done
  gh release view "$tag" --repo "$GH_REPO" >/dev/null || die "no GitHub Release for $tag"
  echo "published: $PKG@$version, GitHub Release $tag"
}

usage() { sed -n '2,6p' "$0" | sed 's/^# \{0,1\}//'; exit 2; }

VERSION="" DRY_RUN=0 GATES_ONLY=0
for arg in "$@"; do
  case "$arg" in
    --dry-run)    DRY_RUN=1 ;;
    --gates-only) GATES_ONLY=1 ;;
    -h|--help)    usage ;;
    -*)           die "unknown option: $arg" ;;
    *)            [ -z "$VERSION" ] || die "one version only"; VERSION="$arg" ;;
  esac
done

TMP_ROOT="${TMPDIR:-/tmp}"; TMP_ROOT="${TMP_ROOT%/}"

if [ "$GATES_ONLY" = 1 ]; then
  LOG="$TMP_ROOT/dsh-orchestrator-gates.log"; : >"$LOG"
  SARIF="$TMP_ROOT/dsh-orchestrator-audit.sarif"
  step "Gates (log: $LOG)"
  gates
  exit 0
fi

[ -n "$VERSION" ] || usage
TAG="v$VERSION"
OUT="$TMP_ROOT/dsh-orchestrator-release-$VERSION"
mkdir -p "$OUT"
LOG="$OUT/gates.log"; : >"$LOG"
SARIF="$OUT/audit.sarif"

step "1. Preconditions"
echo "$VERSION" | grep -Eq '^[0-9]+\.[0-9]+\.[0-9]+$' || die "not a semver X.Y.Z: $VERSION"
[ "$(git branch --show-current)" = "$BRANCH" ] || die "not on $BRANCH"
[ -z "$(git status --porcelain)" ] || die "working tree is not clean"
git fetch --quiet origin
[ "$(git rev-parse HEAD)" = "$(git rev-parse "origin/$BRANCH")" ] || die "$BRANCH differs from origin/$BRANCH"
! git rev-parse -q --verify "refs/tags/$TAG" >/dev/null || die "tag $TAG exists locally"
! git ls-remote --exit-code --tags origin "refs/tags/$TAG" >/dev/null || die "tag $TAG exists on origin"
echo "  $BRANCH at $(git rev-parse --short HEAD), clean, in sync; $TAG is free"

step "2. Version and notes"
[ "$(node -p "require('./package.json').version")" = "$VERSION" ] || die "package.json is not $VERSION"
# package.json and both package-lock.json fields.
node scripts/verify-version-sync.mjs --tag "$TAG" || die "version surfaces disagree"
grep -Eq "^## \[$VERSION\] - [0-9]{4}-[0-9]{2}-[0-9]{2}$" CHANGELOG.md || die "CHANGELOG.md has no dated '## [$VERSION] - YYYY-MM-DD' heading"
[ "$(git log -1 --format=%s)" = "chore: release v$VERSION" ] || die "HEAD is not 'chore: release v$VERSION'"
echo "  package.json, lockfile, CHANGELOG.md and HEAD say $VERSION"

step "3. Gates (log: $LOG)"
gates

step "4. Linux run: not applicable (configuration-only package, see header)"

step "5. Build and smoke"
run "npm pack + config load smoke" pack_smoke

if [ "$DRY_RUN" = 1 ]; then
  step "Dry run: would now"
  echo "  git tag -s $TAG -m 'Release $TAG'   # SSH-signed, on $(git rev-parse --short HEAD)"
  echo "  git push origin $BRANCH"
  echo "  git push origin refs/tags/$TAG"
  echo "  gh run watch <publish.yml run for $TAG>; npm view $PKG@$VERSION; gh release view $TAG"
  exit 0
fi

step "6. Tag and push"
git tag -s "$TAG" -m "Release $TAG"
[ "$(git rev-list -n 1 "$TAG")" = "$(git rev-parse HEAD)" ] || die "$TAG does not point at HEAD"
[ "$(git log -1 --format=%s "$TAG")" = "chore: release v$VERSION" ] || die "$TAG is not on the release commit"
git push origin "$BRANCH"
git push origin "refs/tags/$TAG"

step "7. Watch publish"
watch_publish "$VERSION" "$TAG"
