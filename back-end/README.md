# Portfolio visibility API

This compiled Express service provides bounded liveness, MongoDB readiness, public project-card visibility, and a narrowly protected visibility mutation. It has no application login, account, role, promotion, or demotion routes.

Run locally:

```bash
npm run -w back-end server:once
```

Production runs `back-end/dist/server.js` from the accepted immutable runtime artifact on `127.0.0.1:3003`. Nginx owns public routing, Basic authentication, throttling, and injection of the host-only mutation key plus semantic audit identity. Public and administrative database admission use separate no-queue limits, and each slot remains held until the protected operation settles rather than until the HTTP client disconnects.

See [SECURITY.md](../SECURITY.md), [HEALTHCHECKS.md](../HEALTHCHECKS.md), and [DEPLOYMENT.md](../DEPLOYMENT.md).
