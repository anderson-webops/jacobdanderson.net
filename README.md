# jacobdanderson.net

Personal site, content hub, and narrowly scoped readiness API for `jacobdanderson.net`.

## Repo Layout

- `front-end/` - Vite SSG application
- `back-end/` - Express service for liveness and MongoDB readiness only
- `HEALTHCHECKS.md` - monitor endpoints and expected `200`/`503` behavior
- `SECURITY.md` - authentication/authorization boundary and backend threat model
- `DEPLOYMENT.md` - production toolchain, service, and promotion guidance

## Common Commands

```bash
npm ci --include=optional --strict-allow-scripts
npm run dev
npm run server
npm run serve
npm run build
npm run up
```

## Operational Notes

- The root `package-lock.json` is the authoritative lockfile for the repo. Keep it updated whenever dependencies change.
- The public site has no login, account, role, promotion, or demotion workflow. The backend does not accept content mutations.
- Use `npm run server` and `npm run serve` when you want the readiness service and front-end started separately.
- Use [`HEALTHCHECKS.md`](./HEALTHCHECKS.md) for deployment monitor targets instead of `/`.
