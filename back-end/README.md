# Readiness API

This service supports deployment liveness and MongoDB readiness checks. It has no browser authentication, account-management, administrator, promotion, demotion, or content-mutation routes.

Run locally with a protected `back-end/.env`:

```bash
npm run -w back-end server:once
```

Production starts the compiled service with environment variables supplied by systemd:

```bash
npm run -w back-end build
npm run -w back-end start
```

See [`../SECURITY.md`](../SECURITY.md), [`../HEALTHCHECKS.md`](../HEALTHCHECKS.md), and [`../DEPLOYMENT.md`](../DEPLOYMENT.md) for the enforced boundaries.
