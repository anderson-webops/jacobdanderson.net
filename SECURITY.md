# Security Model

`jacobdanderson.net` is a public static portfolio. It has no application accounts, browser sessions, roles, promotion, or demotion workflow.

The loopback-only API exposes:

- `GET|HEAD /healthz` and `/api/healthz`
- `GET|HEAD /readyz` and `/api/readyz`
- `GET|HEAD /api/projects/visibility`
- `PATCH /api/admin/projects/:slug`, only when explicitly enabled
- `GET /_dbinfo`, disabled by default and separately keyed when temporarily enabled

## Project-visibility boundary

The public visibility list is bounded to the source-controlled project catalog. Unknown slugs and extra JSON fields are rejected. The browser fails closed and displays no project cards when saved visibility cannot be loaded.

Production Nginx authenticates `/admin` and mutations with Basic authentication, delays failed authentication, and enforces connection/request limits. It removes caller-supplied authorization and internal headers. For an accepted mutation it injects:

- a separate host-only proxy key
- the authenticated Basic-auth username as the bounded audit actor
- an Nginx-generated request ID

The backend additionally requires an exact loopback peer, performs timing-safe key comparison, permits only catalog slugs, serializes mutation work, and writes both attempt and result audit events. Public database work has a fixed four-operation admission limit and administrative database work has a separate one-operation limit. Each slot remains leased until its protected database promise settles, even if the client disconnects. Excess work receives an immediate `503` rather than consuming an in-process queue.

## Database and runtime boundary

- Configure exactly one credential source: a complete Vault AppRole configuration or `MONGODB_URI`. Ambiguous, partial, or failed configuration stops startup.
- Remote Vault uses HTTPS. Credentials, tokens, Mongo URIs, requests, and responses remain bounded and are never logged.
- The MongoDB client uses a maximum three-connection pool, one concurrent connection attempt, bounded selection/socket/operation waits, idle connection retirement, and coalesced short-lived readiness results.
- The service binds to `127.0.0.1:3003`; the checked-in systemd unit fixes loopback proxy trust and public-listener opt-out.
- The measured runtime uses a 64 MiB V8 old-space ceiling, systemd soft pressure at 128 MiB, and a 160 MiB hard limit.
- Environment files remain outside releases as root-owned mode `0600`.

## Release trust

Production activates only a reviewed runtime archive with an expected full commit and SHA-256. The promoter copies caller-supplied bytes into root-only storage, verifies the external digest on that stable copy, and extracts only the verified copy. A root-installed extractor rejects traversal, duplicate paths, links, devices, and oversized expansion. A separate root-installed verifier checks the independent required-path list, every file hash and mode, source identity, toolchain, production dependency set, and absence of credentials/source metadata. Every new, reused, selected, or rollback release tree must be root-owned and non-writable by other users. The promoter never executes scripts from the candidate checkout or archive.

Report vulnerabilities privately to the repository owner. Do not open a public issue containing exploit details.
