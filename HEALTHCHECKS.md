# Health Checks

Use these endpoints for monitoring. They do not require auth and do not redirect.

## Back-end (Express API)
- `GET /healthz` returns `200 {"ok":true}`.
- `HEAD /healthz` returns `200` with no body.
- `GET /readyz` returns `200 {"ok":true}` when Mongo is connected and pingable.
- `GET /readyz` returns `503 {"ok":false}` when Mongo is unavailable.
- `HEAD /readyz` performs the same check and returns the same status with no body.
- `GET /_dbinfo`
  - disabled by default and expected to return `404`
  - when explicitly enabled, requires a strong `x-internal-diagnostics-key`; loopback and forwarded headers never authorize it

## Public API Mirrors
- `GET /api/healthz`
  - same payload as `/healthz`
- `GET /api/readyz`
  - same payload as `/readyz`

The public probes do not authenticate, redirect, set cookies, or expose secrets,
database names, host details, process metrics, environment information, or
component diagnostics. Prefer `/api/healthz` and `/api/readyz` for public
monitors on this site. Do not use `/`, login pages, or `/_dbinfo`.
