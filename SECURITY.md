# Security Model

`jacobdanderson.net` is a public, static portfolio. It has no browser login, account-management, role, promotion, or demotion workflow. The old dormant admin schema, password code, cookie session, and account-identity route were removed because no frontend or public API used them.

The supporting backend exposes only liveness and database-readiness responses:

- `GET /healthz` and `GET /api/healthz`
- `GET /readyz` and `GET /api/readyz`
- `GET /_dbinfo`, disabled by default and protected by a strong internal key when explicitly enabled

Unknown and retired identity routes return `404`. Any future authenticated feature must introduce an explicit authorization model, CSRF/origin controls, session revocation, audit logging, promotion/demotion tests, and a reviewed reverse-proxy allowlist before it is exposed.

## Operational boundaries

- Production binds to an exact loopback IP unless an explicit `ALLOW_PUBLIC_LISTENER=true` exception is supplied. The checked-in systemd unit fixes that exception to false and trusts only exact host-local proxy IPs.
- Configure Vault AppRole completely or not at all. A configured Vault failure stops startup and never falls back to `MONGODB_URI`.
- Use HTTPS for remote Vault endpoints. Vault addresses, credentials, tokens, MongoDB URIs, responses, and requests are bounded; control characters and redirects are rejected.
- Keep diagnostics disabled for normal operation. Loopback and forwarded headers never authorize diagnostics, and enabled keys must be 32 to 512 bytes.
- Keep production environment files outside the repository with mode `0600`.
- The public reverse proxy should expose only the documented health/readiness routes, never `/_dbinfo` or retired account paths.
- Production uses an atomic direct Node/systemd/Nginx release with exact IPv4/IPv6 deployment-identity checks and automatic rollback; there is no production container path.

Report security issues privately to the repository owner rather than opening a public issue with exploit details.
