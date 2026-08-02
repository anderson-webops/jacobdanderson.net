#!/usr/bin/env bash
set -euo pipefail

PATH=/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin
export PATH

release_root="${RELEASE_ROOT:-/srv/jacobdanderson.net/releases}"
current_link="${CURRENT_LINK:-/srv/jacobdanderson.net/current}"
service_name="${SERVICE_NAME:-jacobdanderson-api.service}"
api_ready_url="${API_READY_URL:-http://127.0.0.1:3003/readyz}"
site_health_url="${SITE_HEALTH_URL:-https://jacobdanderson.net/deployment.json}"
site_resolve_ipv4="${SITE_RESOLVE_IPV4:-jacobdanderson.net:443:127.0.0.1}"
site_resolve_ipv6="${SITE_RESOLVE_IPV6:-jacobdanderson.net:443:[::1]}"

if [[ $# -ne 1 ]]; then
	echo "Usage: promote-release.sh /srv/jacobdanderson.net/releases/<prepared-release>" >&2
	exit 2
fi
if [[ ${EUID:-$(id -u)} -ne 0 ]]; then
	echo "Run promotion with root privileges." >&2
	exit 1
fi

release_root_real="$(cd -- "$release_root" && pwd -P)"
candidate="$(cd -- "$1" && pwd -P)"
case "$candidate/" in
	"$release_root_real/"*) ;;
	*) echo "Candidate must resolve beneath $release_root_real: $candidate" >&2; exit 1 ;;
esac

for required_file in \
	back-end/dist/server.js \
	front-end/dist/index.html \
	front-end/dist/deployment.json \
	.jacobdanderson-release-prepared.json; do
	if [[ ! -f "$candidate/$required_file" ]]; then
		echo "Prepared release is missing $required_file." >&2
		exit 1
	fi
done
if ! cmp -s "$candidate/front-end/dist/deployment.json" "$candidate/.jacobdanderson-release-prepared.json"; then
	echo "Prepared release metadata does not match the public deployment identity." >&2
	exit 1
fi
if [[ -e "$current_link" && ! -L "$current_link" ]]; then
	echo "Refusing to replace non-symlink deployment path: $current_link" >&2
	exit 1
fi

previous_target="$(readlink -f -- "$current_link" 2>/dev/null || true)"
next_link="${current_link}.next.$$"
response_ipv4="$(mktemp)"
response_ipv6="$(mktemp)"
cleanup() {
	if [[ -L "$next_link" ]]; then unlink -- "$next_link"; fi
	rm -f -- "$response_ipv4" "$response_ipv6"
}
trap cleanup EXIT

activate_target() {
	local target="$1"
	ln -s -- "$target" "$next_link"
	mv -Tf -- "$next_link" "$current_link"
}

wait_for_target() {
	local target="$1"
	local attempt
	for attempt in {1..30}; do
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

activate_target "$candidate"
if nginx -t && systemctl restart "$service_name" && systemctl reload nginx && wait_for_target "$candidate"; then
	echo "Promoted $candidate and verified API readiness plus exact IPv4/IPv6 source identity."
	exit 0
fi

echo "Candidate health failed; restoring the previous release." >&2
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
