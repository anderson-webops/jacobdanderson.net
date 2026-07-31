# Production Deployment

The public site is a Vite SSG bundle. The optional Express service exists only for liveness and MongoDB readiness; it is not an authentication or content API.

## Toolchain

- Node `24.18.1`
- npm `12.0.2`
- Root `package-lock.json` is authoritative

Install and validate with:

```bash
npm ci --include=optional --strict-allow-scripts
npm run verify:native-lock
npm run test
npm run lint
npm run typecheck
npm run build
npm run smoke:backend-runtime
```

## Backend service

Use the hardened unit in `deploy/systemd/jacobdanderson-api.service`. Store runtime values in `/etc/jacobdanderson/api.env` with owner-only permissions. Bind to `127.0.0.1:3003`, and set `TRUST_PROXY_IPS=loopback` when Nginx is the only caller.

Choose one database-secret path:

- Vault: set `VAULT_ADDR`, `VAULT_ROLE_ID`, and `VAULT_SECRET_ID` together.
- Environment: leave both AppRole values empty and set `MONGODB_URI`.

Do not enable `ENABLE_INTERNAL_DIAGNOSTICS` during normal operation. When temporarily enabled, set a unique `INTERNAL_DIAGNOSTICS_KEY` of at least 32 characters and access the route only over the host-local listener.

## Promotion

Build with `SOURCE_COMMIT` and `SOURCE_TAG` so `/deployment.json` identifies the deployed source. After promotion, run:

```bash
LIVE_SMOKE_EXPECT_COMMIT=<commit-prefix> npm run smoke:live
```

Validate the Nginx and systemd configurations before reloading them. The checked-in reverse-proxy example allowlists only health/readiness API routes and returns `404` for diagnostics and retired account paths.
