#!/usr/bin/env bash
set -euo pipefail

PATH=/usr/sbin:/usr/bin:/sbin:/bin
export PATH

script_dir="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"
unit_dest="${UNIT_DEST:-/etc/systemd/system/jacobdanderson-api.service}"
env_dest="${ENV_DEST:-/etc/jacobdanderson/api.env}"
promoter_dest="${PROMOTER_DEST:-/usr/local/sbin/jacobdanderson-promote-release}"
verifier_dest="${VERIFIER_DEST:-/usr/local/libexec/jacobdanderson/verify-runtime-artifact.mjs}"
extractor_dest="${EXTRACTOR_DEST:-/usr/local/libexec/jacobdanderson/extract-runtime-artifact.py}"
dry_run=false
force_env=false

usage() {
	cat <<'USAGE'
Install the direct jacobdanderson.net API unit without starting it.

Usage: install-api-unit.sh [--dry-run] [--force-env]

  --dry-run    Print commands without changing the host.
  --force-env  Replace the target env file with the fail-closed example.
USAGE
}

while [[ $# -gt 0 ]]; do
	case "$1" in
		--dry-run) dry_run=true ;;
		--force-env) force_env=true ;;
		-h|--help) usage; exit 0 ;;
		*) echo "Unknown option: $1" >&2; usage >&2; exit 2 ;;
	esac
	shift
done

run() {
	if [[ "$dry_run" == true ]]; then
		printf ' %q' "$@"
		printf '\n'
		return 0
	fi
	"$@"
}

if [[ "$dry_run" == false ]]; then
	if [[ ! -x /usr/bin/node || "$(/usr/bin/node --version)" != "v24.18.1" ]]; then
		echo "The systemd runtime requires Node 24.18.1 at /usr/bin/node." >&2
		exit 1
	fi
	if ! id jacobdanderson >/dev/null 2>&1; then
		echo "Create the unprivileged jacobdanderson service account before installing the unit." >&2
		exit 1
	fi
	if [[ -e "$env_dest" ]]; then
		if [[ -L "$env_dest" || ! -f "$env_dest" || "$(stat -c '%u:%g:%a' -- "$env_dest")" != "0:0:600" ]]; then
			echo "Existing $env_dest must be a root:root mode 0600 regular file before it can be preserved." >&2
			exit 1
		fi
	fi
fi

run install -D -m 0644 "$script_dir/jacobdanderson-api.service" "$unit_dest"
run install -D -o root -g root -m 0755 "$script_dir/promote-release.sh" "$promoter_dest"
run install -D -o root -g root -m 0644 "$script_dir/../../scripts/verify-runtime-artifact.mjs" "$verifier_dest"
run install -D -o root -g root -m 0755 "$script_dir/extract-runtime-artifact.py" "$extractor_dest"
if [[ "$force_env" == true || ! -e "$env_dest" ]]; then
	run install -D -o root -g root -m 0600 "$script_dir/jacobdanderson-api.env.example" "$env_dest"
else
	echo "Keeping existing $env_dest. Use --force-env only when replacing it intentionally."
fi
run systemctl daemon-reload
echo "Review $env_dest and the Nginx contract. Promote only reviewed CI runtime archives through $promoter_dest."
