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
npm audit signatures
npm run lint
npm run typecheck
npm test
npm run a11y
npm run build
npm run artifact:build
npm run artifact:verify
RUNTIME_ARTIFACT_MONGO_URI=mongodb://127.0.0.1:27017 npm run artifact:smoke
```

Use Node `24.18.1` and npm `12.0.2`. The supported MongoDB server is `9.0.4`, the version CI runs the artifact acceptance against; the `mongodb` driver `7.6.0` supports MongoDB 4.4 through 9.0. The root lockfile governs the monorepo build. `back-end/package-lock.json` separately governs the exact standalone production install copied into the runtime artifact.

The locked install verifies and patches the exact `vite-plugin-vue-layouts-next` 3.3.1 import for audited `brace-expansion` 5.0.12. Unexpected upstream bytes stop the install for review.

The public site has no application account, session, role, promotion, or demotion system. Project administration is a narrow host-authenticated operation, not a general application login.
