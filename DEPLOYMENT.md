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

The exact copied artifact is tested in a clean temporary directory with no source or development dependencies. Acceptance starts from a synthetic v2.11.0 database containing the retained `slug_1` uniqueness index and saved visibility data, then covers the in-place upgrade, health/readiness, a real read/write, semantic audit persistence, fresh-database convergence, incompatible-index rejection, dependency failure, graceful shutdown, and a deliberately removed runtime module. The application never drops, renames, or rewrites the retained uniqueness index.

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
- `/usr/local/sbin/jacobdanderson-prepare-legacy-rollback`
- `/usr/local/libexec/jacobdanderson/verify-runtime-artifact.mjs`
- `/usr/local/libexec/jacobdanderson/extract-runtime-artifact.py`
- `/usr/local/libexec/jacobdanderson/legacy-runtime-artifact.mjs`

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

## One-time v2.11.0 transition

The first artifact-format activation must preserve the exact healthy v2.11.0 runtime at commit `d807a52a7b41ae7774cc528c82ab218fbf423475`. After installing the reviewed helpers, capture it before any service, release pointer, or database change:

```bash
sudo /usr/local/sbin/jacobdanderson-prepare-legacy-rollback \
  d807a52a7b41ae7774cc528c82ab218fbf423475
```

Installing the reviewed helpers transfers the site and release roots to the root-only artifact promotion boundary and creates a persistent root-only deployment lock. Retire the legacy checkout adapter at that cutover; it must not continue writing releases or the `current` symlink.

The root-installed capture helper accepts only that exact deployment identity and its reviewed source manifests. While holding the same lock used by promotion, it preflights file count and byte limits before copying, rejects special files and escaping links, makes the selected live runtime and its path ancestors root-owned and non-writable, hashes it again, and then performs a bounded file-by-file copy. It copies only the compiled backend, static frontend, production dependency tree, and package manifests into `/srv/jacobdanderson.net/legacy-releases/`; rescans the now-immutable source after the copy; records every path, mode, link target, size, and SHA-256; and seals the result as a root-owned rollback tree. It does not execute the old checkout, install packages, access credentials, or alter MongoDB.

Record the returned sealed path and manifest digest. The promoter accepts that path only while `current` still identifies the exact hardened v2.11.0 checkout. It compares every selected active runtime path, hash, size, and link target with the sealed tree before mutation. Once the first candidate succeeds, later promotions accept only verified artifact-format releases, although a failed first activation can restore and retain the sealed v2.11.0 tree for another reviewed attempt.

## Promote and roll back

Download the release archive and checksum to a root-controlled staging location. Verify the GitHub release/tag/commit relationship, then invoke only the installed helper:

```bash
sudo /usr/local/sbin/jacobdanderson-promote-release \
  /root/staging/jacobdanderson.net-runtime.tar.gz \
  <candidate-full-40-hex-commit> \
  <full-64-hex-sha256> \
  <expected-current-full-40-hex-commit>
```

For the one-time transition, append the sealed v2.11.0 rollback path returned by `jacobdanderson-prepare-legacy-rollback`.

The helper holds the exclusive deployment lock for the complete transaction. It requires a non-dangling current release that matches the caller-supplied expected commit, copies the supplied archive into a root-owned mode `0600` file under the protected release root, verifies the supplied digest against that stable copy, and extracts only those verified bytes. It safely extracts only regular files into a root-owned staging directory, independently verifies every artifact path/hash/mode and source identity, and installs the release at `/srv/jacobdanderson.net/releases/<commit>`. New, pre-existing, selected, and rollback release trees must all be root-owned and non-writable by other users. Immediately before the atomic `current` switch, it rechecks the exact symlink value and resolved target. It then restarts the API, validates Nginx, and requires readiness plus exact deployment identity over local IPv4 and IPv6 TLS.

Rollback is allowed only to a previously verified, root-owned, non-writable artifact release or the exact separately sealed v2.11.0 rollback tree. The promoter refuses a caller-supplied current identity mismatch, an unsealed checkout, a different legacy version, or a legacy capture whose public and prepared deployment identities differ.

MongoDB data and audit records remain external state and are not synchronized during promotion or rollback. The v2.12-series compatibility change retains the established unique `slug_1` index by name and specification. Startup creates the new audit indexes only after that compatibility gate succeeds. No migration ledger edit, index drop, index rename, deduplication, or record rewrite is part of this release contract.
