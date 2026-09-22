# jacobdanderson.net

Public Vite SSG portfolio plus a small loopback-only Express API for health, readiness, and curated project-card visibility.

## Layout

- `front-end/`: Vue static site, unlisted project index, and Basic-auth-gated administration UI.
- `back-end/`: direct MongoDB-driver API with bounded reads, one serialized mutation path, and durable semantic audit records.
- `deploy/`: direct Nginx and systemd contracts. Production does not use Docker.
- `HEALTHCHECKS.md`: monitor behavior.
- `SECURITY.md`: authentication, authorization, and data boundaries.
- `DEPLOYMENT.md`: immutable runtime artifact and rollback workflow.

## Local validation

```bash
npm ci --include=optional --strict-allow-scripts
npm audit
npm audit --omit=dev
npm run lint
npm run typecheck
npm test
npm run a11y
npm run build
npm run artifact:build
npm run artifact:verify
RUNTIME_ARTIFACT_MONGO_URI=mongodb://127.0.0.1:27017 npm run artifact:smoke
```

Use Node `24.18.1` and npm `12.0.2`. The root lockfile governs the monorepo build. `back-end/package-lock.json` separately governs the exact standalone production install copied into the runtime artifact.

The public site has no application account, session, role, promotion, or demotion system. Project administration is a narrow host-authenticated operation, not a general application login.
