#!/usr/bin/env bash
set -euo pipefail

PATH=/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin
export PATH

installed_promoter="${INSTALLED_PROMOTER:-/usr/local/sbin/jacobdanderson-promote-release}"
installed_verifier="${INSTALLED_VERIFIER:-/usr/local/libexec/jacobdanderson/verify-runtime-artifact.mjs}"
installed_extractor="${INSTALLED_EXTRACTOR:-/usr/local/libexec/jacobdanderson/extract-runtime-artifact.py}"
release_root="${RELEASE_ROOT:-/srv/jacobdanderson.net/releases}"
current_link="${CURRENT_LINK:-/srv/jacobdanderson.net/current}"
service_name="${SERVICE_NAME:-jacobdanderson-api.service}"
api_ready_url="${API_READY_URL:-http://127.0.0.1:3003/readyz}"
site_health_url="${SITE_HEALTH_URL:-https://jacobdanderson.net/deployment.json}"
site_resolve_ipv4="${SITE_RESOLVE_IPV4:-jacobdanderson.net:443:127.0.0.1}"
site_resolve_ipv6="${SITE_RESOLVE_IPV6:-jacobdanderson.net:443:[::1]}"

if [[ $# -ne 3 ]]; then
	echo "Usage: jacobdanderson-promote-release <runtime.tar.gz> <40-hex-commit> <64-hex-sha256>" >&2
	exit 2
fi
if [[ ${EUID:-$(id -u)} -ne 0 ]]; then
	echo "Run the installed promotion helper with root privileges." >&2
	exit 1
fi

script_real="$(readlink -f -- "$0")"
if [[ "$script_real" != "$installed_promoter" && "${ALLOW_UNINSTALLED_PROMOTER_FOR_TESTS:-false}" != "true" ]]; then
	echo "Refusing to promote from an unprivileged source checkout. Install and invoke $installed_promoter." >&2
	exit 1
fi
if [[ ! -f "$installed_verifier" || -L "$installed_verifier" ]]; then
	echo "The root-installed runtime verifier is missing or is a symbolic link." >&2
	exit 1
fi
if [[ "$(stat -c '%u:%g:%a' -- "$installed_verifier")" != "0:0:644" ]]; then
	echo "The root-installed runtime verifier must be root:root mode 0644." >&2
	exit 1
fi
if [[ ! -f "$installed_extractor" || -L "$installed_extractor" || "$(stat -c '%u:%g:%a' -- "$installed_extractor")" != "0:0:755" ]]; then
	echo "The root-installed archive extractor must be a root:root mode 0755 regular file." >&2
	exit 1
fi
if [[ ! -x /usr/bin/node || "$(/usr/bin/node --version)" != "v24.18.1" ]]; then
	echo "Promotion requires Node 24.18.1 at /usr/bin/node." >&2
	exit 1
fi

archive_argument="$1"
expected_commit="${2,,}"
expected_digest="${3,,}"
if [[ ! -f "$archive_argument" || -L "$archive_argument" ]]; then
	echo "Runtime archive must be a regular file, not a link." >&2
	exit 1
fi
if [[ ! "$expected_commit" =~ ^[a-f0-9]{40}$ ]]; then
	echo "Expected commit must be a full 40-character lowercase hexadecimal revision." >&2
	exit 2
fi
if [[ ! "$expected_digest" =~ ^[a-f0-9]{64}$ ]]; then
	echo "Expected digest must be a full lowercase SHA-256 value." >&2
	exit 2
fi
archive="$(realpath -e -- "$archive_argument")"
if [[ ! -f "$archive" || -L "$archive" ]]; then
	echo "Runtime archive must resolve to a regular file, not a link." >&2
	exit 1
fi

install -d -o root -g root -m 0755 -- "$release_root"
release_root_real="$(realpath -e -- "$release_root")"
candidate="$release_root_real/$expected_commit"
protected_archive="$(mktemp "$release_root_real/.archive-${expected_commit:0:12}.XXXXXX")"
staging=""
next_link=""
response_ipv4=""
response_ipv6=""

# shellcheck disable=SC2329 # Invoked by the EXIT trap.
cleanup() {
	if [[ -n "${next_link:-}" && -L "$next_link" ]]; then unlink -- "$next_link"; fi
	case "${staging:-}/" in
		"$release_root_real/".staging-*/)
			if [[ -d "$staging" ]]; then rm -rf -- "$staging"; fi
			;;
	esac
	case "${protected_archive:-}" in
		"$release_root_real/".archive-*) rm -f -- "$protected_archive" ;;
	esac
	if [[ -n "${response_ipv4:-}" ]]; then rm -f -- "$response_ipv4"; fi
	if [[ -n "${response_ipv6:-}" ]]; then rm -f -- "$response_ipv6"; fi
}
trap cleanup EXIT

install -o root -g root -m 0600 -- "$archive" "$protected_archive"
if [[ ! -f "$protected_archive" || -L "$protected_archive" || "$(stat -c '%u:%g:%a' -- "$protected_archive")" != "0:0:600" ]]; then
	echo "Protected runtime archive copy must be a root:root mode 0600 regular file." >&2
	exit 1
fi
actual_digest="$(sha256sum -- "$protected_archive" | awk '{print $1}')"
if [[ "$actual_digest" != "$expected_digest" ]]; then
	echo "Runtime archive SHA-256 does not match the reviewed release digest." >&2
	exit 1
fi

staging="$(mktemp -d "$release_root_real/.staging-${expected_commit:0:12}.XXXXXX")"
next_link="${current_link}.next.$$"
response_ipv4="$(mktemp)"
response_ipv6="$(mktemp)"

"$installed_extractor" "$protected_archive" "$staging"

assert_trusted_tree() {
	local tree="$1"
	local label="$2"
	if [[ ! -d "$tree" || -L "$tree" ]]; then
		echo "$label is not a real release directory." >&2
		return 1
	fi
	if [[ -n "$(find "$tree" \( ! -user root -o ! -group root -o -perm /022 \) -print -quit)" ]]; then
		echo "$label is not entirely root-owned and non-writable by other users." >&2
		return 1
	fi
}

RUNTIME_ARTIFACT_EXPECT_COMMIT="$expected_commit" RUNTIME_ARTIFACT_REQUIRE_CLEAN=true \
	/usr/bin/node "$installed_verifier" "$staging"
assert_trusted_tree "$staging" "Extracted runtime artifact"

if [[ -e "$candidate" ]]; then
	assert_trusted_tree "$candidate" "Existing release"
	RUNTIME_ARTIFACT_EXPECT_COMMIT="$expected_commit" RUNTIME_ARTIFACT_REQUIRE_CLEAN=true \
		/usr/bin/node "$installed_verifier" "$candidate"
	if ! cmp -s -- "$staging/.runtime-manifest.json" "$candidate/.runtime-manifest.json"; then
		echo "Existing release for this commit has different immutable contents." >&2
		exit 1
	fi
	rm -rf -- "$staging"
	staging=""
else
	mv -- "$staging" "$candidate"
	staging=""
fi

if [[ -e "$current_link" && ! -L "$current_link" ]]; then
	echo "Refusing to replace non-symlink deployment path: $current_link" >&2
	exit 1
fi
previous_target="$(readlink -f -- "$current_link" 2>/dev/null || true)"
if [[ -n "$previous_target" ]]; then
	case "$previous_target/" in
		"$release_root_real/"*) ;;
		*) echo "Current release resolves outside $release_root_real; supervised migration is required." >&2; exit 1 ;;
	esac
	if [[ ! -d "$previous_target" || -L "$previous_target" ]]; then
		echo "Current rollback target is not a real release directory." >&2
		exit 1
	fi
	assert_trusted_tree "$previous_target" "Current rollback target"
	RUNTIME_ARTIFACT_REQUIRE_CLEAN=true /usr/bin/node "$installed_verifier" "$previous_target"
fi

activate_target() {
	local target="$1"
	ln -s -- "$target" "$next_link"
	mv -Tf -- "$next_link" "$current_link"
}

wait_for_target() {
	local target="$1"
	local attempt
	for attempt in {1..30}; do
		: "$attempt"
		if curl --noproxy '*' --fail --silent --show-error --max-time 5 "$api_ready_url" >/dev/null \
			&& curl --noproxy '*' --ipv4 --fail --silent --show-error --max-time 5 \
				--resolve "$site_resolve_ipv4" "$site_health_url" --output "$response_ipv4" \
			&& curl --noproxy '*' --ipv6 --fail --silent --show-error --max-time 5 \
				--resolve "$site_resolve_ipv6" "$site_health_url" --output "$response_ipv6" \
			&& cmp -s "$target/front-end/dist/deployment.json" "$response_ipv4" \
			&& cmp -s "$target/front-end/dist/deployment.json" "$response_ipv6"; then
			return 0
		fi
		sleep 1
	done
	return 1
}

assert_trusted_tree "$candidate" "Selected candidate"
activate_target "$candidate"
if nginx -t && systemctl restart "$service_name" && systemctl reload nginx && wait_for_target "$candidate"; then
	echo "Promoted immutable runtime artifact $expected_commit and verified API readiness plus exact IPv4/IPv6 source identity."
	exit 0
fi

echo "Candidate health failed; restoring the verified previous release." >&2
if [[ -n "$previous_target" ]]; then
	activate_target "$previous_target"
	systemctl restart "$service_name"
	nginx -t && systemctl reload nginx
	if ! wait_for_target "$previous_target"; then
		echo "The previous release was restored but did not pass readiness and identity checks." >&2
	fi
else
	unlink -- "$current_link"
	systemctl stop "$service_name"
	nginx -t && systemctl reload nginx
fi
exit 1
