# Production Deployment

The public site is a Vite SSG bundle served by host Nginx. The optional Express API runs directly under systemd on `127.0.0.1:3003`. Production does not use Docker and does not build or install dependencies from a live checkout.

## Pinned toolchain and artifact

- Node `24.18.1`
- npm `12.0.2`
- source/build lock: `package-lock.json`
- standalone backend runtime lock: `back-end/package-lock.json`

`npm run artifact:build` creates `.runtime-artifact/` containing only:

- `front-end/dist/`
- compiled `back-end/dist/`
- the standalone backend manifest and lock
- production backend dependencies
- `.runtime-manifest.json` with source identity, required paths, complete hashes/modes, entrypoints, dependency names, native bindings, static assets, external state, and writable-path declarations

The exact copied artifact is tested in a clean temporary directory with no source or development dependencies. Acceptance covers missing configuration, health/readiness, a real synthetic MongoDB read/write, semantic audit persistence, dependency failure, graceful shutdown, and a deliberately removed runtime module.

`npm run artifact:pack` produces:

- `jacobdanderson.net-runtime.tar.gz`
- `jacobdanderson.net-runtime.tar.gz.sha256`

CI publishes both as one short-retention workflow artifact. A release-worthy tag must attach those same reviewed files as GitHub release assets.

After packing, `npm run artifact:archive-smoke` verifies the checksum, safely extracts the final archive into a new temporary directory, and repeats the complete runtime acceptance suite against those unpacked bytes. Release preparation fails unless both the pre-pack tree and the exact post-pack archive pass.

## One-time host installation

From a reviewed source revision, the host operator installs the service unit and the root-owned promotion components:

```bash
sudo deploy/systemd/install-api-unit.sh
```

The installer refuses to preserve an existing environment file unless it is a regular root:root mode `0600` file. It installs:

- `/usr/local/sbin/jacobdanderson-promote-release`
- `/usr/local/libexec/jacobdanderson/verify-runtime-artifact.mjs`
- `/usr/local/libexec/jacobdanderson/extract-runtime-artifact.py`

These files are the trusted promotion boundary. Never invoke a promoter from an unprivileged checkout with sudo.

The checked-in unit preserves the established `/srv/jacobdanderson.net/current` path and port 3003. It fixes loopback binding/trust, starts compiled code only, makes release trees read-only to the service, limits tasks/file descriptors, caps V8 old space at 64 MiB, and applies measured 128/160 MiB systemd memory thresholds.

Choose exactly one database credential source in `/etc/jacobdanderson/api.env`:

- complete Vault AppRole: `VAULT_ADDR`, `VAULT_ROLE_ID`, and `VAULT_SECRET_ID`
- direct environment: `MONGODB_URI`, with both AppRole values empty

Keep diagnostics disabled normally. Project administration remains disabled until both Nginx gates are installed.

## Nginx

Install `deploy/nginx/jacobdanderson-rate-limits.conf.example` in the Nginx `http` context, then use `deploy/nginx/jacobdanderson.conf.example` as the full virtual-server contract. Hosts retaining their existing TLS server can use `jacobdanderson-api.locations.conf` only if the same rate-limit zones are loaded.

The edge contract:

- preserves IPv4 and IPv6 listeners
- uses current `http2 on` syntax
- has four exact probe locations so `^~ /api/` cannot shadow them
- clears caller-controlled auth/internal headers
- limits public and administrative request/connection work
- delays Basic-auth failures
- injects `$remote_user` and `$request_id` only for authorized mutations
- serves static files from `/srv/jacobdanderson.net/current/front-end/dist`

Validate the complete effective graph before reload:

```bash
sudo nginx -t
```

## Promote and roll back

Download the release archive and checksum to a root-controlled staging location. Verify the GitHub release/tag/commit relationship, then invoke only the installed helper:

```bash
sudo /usr/local/sbin/jacobdanderson-promote-release \
  /root/staging/jacobdanderson.net-runtime.tar.gz \
  <full-40-hex-commit> \
  <full-64-hex-sha256>
```

The helper first copies the supplied archive into a root-owned mode `0600` file under the protected release root, verifies the supplied digest against that stable copy, and extracts only those verified bytes. It safely extracts only regular files into a root-owned staging directory, independently verifies every artifact path/hash/mode and source identity, and installs the release at `/srv/jacobdanderson.net/releases/<commit>`. New, pre-existing, selected, and rollback release trees must all be root-owned and non-writable by other users. The helper then atomically changes `current`, restarts the API, validates Nginx, and requires readiness plus exact deployment identity over local IPv4 and IPv6 TLS.

Rollback is allowed only to a previously verified, root-owned, non-writable artifact release. The first transition from a legacy source-checkout release therefore requires a reviewed supervised migration plan. Do not weaken the helper or relabel an unverified legacy checkout merely to pass that gate.

MongoDB data and audit records remain external state and are not synchronized during promotion or rollback. No schema migration is part of this release contract.
