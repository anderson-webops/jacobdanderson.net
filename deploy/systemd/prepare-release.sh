#!/usr/bin/env bash
set -euo pipefail

system_path=/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin
node_bin_dir="${NODE_BIN_DIR:-/usr/bin}"
if [[ "$node_bin_dir" != /* ]] || [[ ! -x "$node_bin_dir/node" ]] || [[ ! -x "$node_bin_dir/npm" ]]; then
	echo "NODE_BIN_DIR must be an absolute directory containing executable node and npm binaries." >&2
	exit 1
fi
node_bin_dir_real="$(cd -- "$node_bin_dir" && pwd -P)"
PATH="$node_bin_dir_real:$system_path"
export PATH
export PUPPETEER_SKIP_DOWNLOAD=true

if [[ $# -ne 1 ]]; then
	echo "Usage: prepare-release.sh /path/to/clean/tagged/source-checkout" >&2
	exit 2
fi
if [[ ${EUID:-$(id -u)} -eq 0 ]]; then
	echo "Build release artifacts as an unprivileged maintainer or CI user, not root." >&2
	exit 1
fi

candidate="$(cd -- "$1" && pwd -P)"
if [[ ! -f "$candidate/package-lock.json" ]] || ! git -C "$candidate" rev-parse --is-inside-work-tree >/dev/null 2>&1; then
	echo "Candidate must be a complete Git checkout with the committed root lockfile." >&2
	exit 1
fi
if [[ -n "$(git -C "$candidate" status --porcelain)" ]]; then
	echo "Candidate checkout must be clean before release artifact preparation." >&2
	exit 1
fi
if [[ "$(node --version)" != "v24.18.1" || "$(npm --version)" != "12.0.2" ]]; then
	echo "Preparation requires Node 24.18.1 and npm 12.0.2." >&2
	exit 1
fi
if [[ -z "${RUNTIME_ARTIFACT_MONGO_URI:-}" ]]; then
	echo "Set RUNTIME_ARTIFACT_MONGO_URI to an isolated synthetic acceptance database." >&2
	exit 1
fi

SOURCE_COMMIT="$(git -C "$candidate" rev-parse HEAD)"
SOURCE_TAG="$(git -C "$candidate" describe --tags --exact-match 2>/dev/null || true)"
export SOURCE_COMMIT SOURCE_TAG
if [[ -z "$SOURCE_TAG" ]]; then
	echo "Release artifacts must be built from an exact reviewed tag." >&2
	exit 1
fi
export RUNTIME_ARTIFACT_EXPECT_COMMIT="$SOURCE_COMMIT"
export RUNTIME_ARTIFACT_REQUIRE_CLEAN=true
export RUNTIME_ARTIFACT_REQUIRE_MONGO=true
unset NODE_ENV

cd -- "$candidate"
npm ci --include=dev --include=optional --strict-allow-scripts
npm audit
npm audit --omit=dev
npm audit signatures
npm run verify:native-lock
npm run verify:platform-install
npm run lint
npm run typecheck
npm test
npm run a11y
NODE_ENV=production npm run build
npm run smoke:backend-runtime
npm run artifact:build
npm run artifact:verify
npm run artifact:smoke
npm audit --prefix .runtime-artifact/back-end --omit=dev
npm run artifact:pack
npm run artifact:archive-smoke
echo "Prepared immutable runtime archive for $SOURCE_TAG at $SOURCE_COMMIT. Production must use the root-installed archive promoter."
