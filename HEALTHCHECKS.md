# Health Checks

Use these endpoints for monitoring. They do not require auth and do not redirect.

## Back-end (Express API)
- `GET /healthz`
  - returns `200 {"ok":true}`
- `GET /readyz`
  - returns `200 {"ready":true,"components":{"db":{"ok":true,"state":1}}}` when Mongo is connected and pingable
  - returns a generic `503 {"ready":false,...}` without database errors or credentials when Mongo is unavailable
- `GET /_dbinfo`
  - disabled by default and expected to return `404`
  - when explicitly enabled, requires a strong `x-internal-diagnostics-key`; loopback and forwarded headers never authorize it

## Public API Mirrors
- `GET /api/healthz`
  - same payload as `/healthz`
- `GET /api/readyz`
  - same payload as `/readyz`

Prefer `/api/healthz` and `/api/readyz` for public monitors on this site. Do not use `/`, login pages, or `/_dbinfo`.
