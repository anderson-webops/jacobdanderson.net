#!/usr/bin/env bash
set -euo pipefail

PATH=/usr/sbin:/usr/bin:/sbin:/bin
export PATH
unset NODE_OPTIONS NODE_PATH
umask 077

legacy_commit=d807a52a7b41ae7774cc528c82ab218fbf423475
site_root=/srv/jacobdanderson.net
current_link=/srv/jacobdanderson.net/current
release_root=/srv/jacobdanderson.net/releases
legacy_root=/srv/jacobdanderson.net/legacy-releases
legacy_tool=/usr/local/libexec/jacobdanderson/legacy-runtime-artifact.mjs
deploy_lock=/srv/jacobdanderson.net/.deploy.lock

if [[ $# -ne 1 || "$1" != "$legacy_commit" ]]; then
	echo "Usage: jacobdanderson-prepare-legacy-rollback $legacy_commit" >&2
	exit 2
fi
if [[ ${EUID:-$(id -u)} -ne 0 ]]; then
	echo "Prepare the one-time legacy rollback tree with root privileges." >&2
	exit 1
fi
if [[ ! -f "$deploy_lock" || -L "$deploy_lock" || "$(stat -c '%u:%g:%a' -- "$deploy_lock")" != "0:0:600" ]]; then
	echo "The deployment lock must be a root:root mode 0600 regular file." >&2
	exit 1
fi
exec 9<>"$deploy_lock"
if ! flock -n 9; then
	echo "Another jacobdanderson.net capture or promotion is already running." >&2
	exit 1
fi
if [[ ! -x /usr/bin/node || "$(/usr/bin/node --version)" != "v24.18.1" ]]; then
	echo "Legacy preparation requires Node 24.18.1 at /usr/bin/node." >&2
	exit 1
fi
if [[ ! -f "$legacy_tool" || -L "$legacy_tool" || "$(stat -c '%u:%g:%a' -- "$legacy_tool")" != "0:0:644" ]]; then
	echo "The root-installed legacy verifier is missing or has unsafe metadata." >&2
	exit 1
fi
if [[ ! -d "$site_root" || -L "$site_root" || "$(stat -c '%u:%g' -- "$site_root")" != "0:0" \
	|| -n "$(find "$site_root" -maxdepth 0 -perm /022 -print -quit)" ]]; then
	echo "The site root must be root-owned and non-writable by other users before capture." >&2
	exit 1
fi
if [[ ! -d "$release_root" || -L "$release_root" || "$(stat -c '%u:%g:%a' -- "$release_root")" != "0:0:755" ]]; then
	echo "The release root must be a root:root mode 0755 directory before capture." >&2
	exit 1
fi
if [[ ! -L "$current_link" ]]; then
	echo "The active v2.11.0 deployment must be selected through the current symlink." >&2
	exit 1
fi
current_link_value="$(readlink -- "$current_link")"
current_target="$(readlink -f -- "$current_link")"
release_root_real="$(realpath -e -- "$release_root")"
case "$current_target/" in
	"$release_root_real/"*) ;;
	*) echo "The active v2.11.0 release is outside the reviewed release root." >&2; exit 1 ;;
esac
if [[ ! -d "$legacy_root" || -L "$legacy_root" || "$(stat -c '%u:%g:%a' -- "$legacy_root")" != "0:0:755" ]]; then
	echo "The protected legacy release root is missing or has unsafe metadata." >&2
	exit 1
fi

capture_result="$(/usr/bin/node "$legacy_tool" capture "$current_target" "$legacy_root" "$legacy_commit")"
if [[ ! -L "$current_link" \
	|| "$(readlink -- "$current_link")" != "$current_link_value" \
	|| "$(readlink -f -- "$current_link" 2>/dev/null || true)" != "$current_target" ]]; then
	echo "The current release changed while its rollback tree was captured." >&2
	exit 1
fi
printf '%s\n' "$capture_result"
