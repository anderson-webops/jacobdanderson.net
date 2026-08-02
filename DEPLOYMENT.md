# Production Deployment

The public site is a Vite SSG bundle served directly by host Nginx. The optional Express service runs directly under systemd and exists only for liveness and MongoDB readiness; it is not an authentication or content API. Production Docker artifacts are intentionally absent.

## Toolchain

- Node `24.18.1`
- npm `12.0.2`
- Root `package-lock.json` is authoritative

Each release is a complete Git checkout beneath `/srv/jacobdanderson.net/releases`. The `/srv/jacobdanderson.net/current` symlink selects the active release for both Nginx and systemd.

## Prepare a release

Create the checkout as the unprivileged `jacobdanderson` deployment user, then run:

```bash
deploy/systemd/prepare-release.sh /srv/jacobdanderson.net/releases/<release>
```

Preparation requires a clean checkout and the exact Node/npm toolchain. It performs a clean install, full and production dependency audits, registry signature checks, Linux ARM64 glibc/musl lock verification, linting, type checking, all tests, accessibility checks, the production build, static-output checks, and a compiled-backend fail-closed smoke test. It then replaces development dependencies with a clean production-only install and writes an ignored preparation marker matching `front-end/dist/deployment.json`.

## Backend service

Install the unit once with:

```bash
sudo deploy/systemd/install-api-unit.sh
```

The installer preserves an existing `/etc/jacobdanderson/api.env` unless `--force-env` is explicitly supplied. Keep that file owned by root with mode `0600`. The unit fixes the production listener to `127.0.0.1:3003`, disables public-listener opt-in, starts only compiled code from the active release, and runs without service capabilities.

Choose one database-secret path:

- Vault: set `VAULT_ADDR`, `VAULT_ROLE_ID`, and `VAULT_SECRET_ID` together.
- Environment: leave both AppRole values empty and set `MONGODB_URI`.

A configured Vault failure remains fail-closed. Do not enable `ENABLE_INTERNAL_DIAGNOSTICS` during normal operation. When temporarily enabled, use a unique `INTERNAL_DIAGNOSTICS_KEY` between 32 and 512 bytes and access the route only over the host-local listener.

## Nginx edge

Use `deploy/nginx/jacobdanderson.conf.example` as the host virtual-server contract and add the certificate paths managed by the host. It listens on both IPv4 and IPv6, serves `front-end/dist` from the active release, exposes only the four documented health/readiness paths, blocks diagnostics and retired account paths, and adds the production security-header policy.

Validate the finished host configuration before any reload:

```bash
sudo nginx -t
```

The older `deploy/nginx/jacobdanderson-api.locations.conf` remains a narrowly scoped include for hosts that already own the surrounding TLS virtual server. The full example is the source of truth for a new direct deployment.

## Promote and roll back

Promote a prepared checkout as root:

```bash
sudo deploy/systemd/promote-release.sh /srv/jacobdanderson.net/releases/<release>
```

Promotion atomically replaces the `current` symlink, restarts the API, validates and reloads Nginx, checks database readiness, and requires the exact deployment identity over local IPv4 and IPv6 TLS. If any check fails, the script restores and re-verifies the previous release. It refuses to replace a non-symlink `current` path.

After promotion, verify the public route and both authoritative address families:

```bash
LIVE_SMOKE_EXPECT_COMMIT=<commit-prefix> npm run smoke:live
curl -4 --fail https://jacobdanderson.net/deployment.json
curl -6 --fail https://jacobdanderson.net/deployment.json
```

Static preview services may run the checked-in build command, but they are not the production runtime contract and do not require Docker.
