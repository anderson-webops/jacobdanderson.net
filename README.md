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
npm run smoke:hydrated-head
npm run artifact:build
npm run artifact:verify
RUNTIME_ARTIFACT_MONGO_URI=mongodb://127.0.0.1:27017 npm run artifact:smoke
```

Use Node `26.13.0` and npm `12.2.1`. The supported MongoDB server is `9.0.4`, the version CI runs the artifact acceptance against with the locked MongoDB 7 driver. The root lockfile governs the monorepo build. `back-end/package-lock.json` separately governs the exact standalone production install copied into the runtime artifact.

The locked install verifies and patches the exact `vite-plugin-vue-layouts-next` 3.3.1 import for audited `brace-expansion` 5.0.12. Unexpected upstream bytes stop the install for review.

Both dependency graphs use the patched Minimatch 11 glob API, including the
standalone backend's development lint tooling. CI audits both full and
production-only graphs. TypeScript stays on 6.0 while the maintained ESLint
parser's supported peer range excludes TypeScript 7.

The frontend installs Unhead 3 independently of ViteSSG's legacy head renderer.
Each server route gets a fresh head; `onPageRendered` serializes its metadata
through Unhead's document transformer. ViteSSG's `useHead` stays disabled, so its
internal Unhead 2 never receives an incompatible instance. Regression tests cover
metadata deduplication, route isolation, preserved document content and reactive
browser updates.

Critical CSS uses the independently named Beasties 0.5 renderer after the
document head transform; ViteSSG's legacy CSS integration stays disabled.
Each route receives a fresh renderer and retains its complete stylesheet.
The production-browser check verifies tracker integrity and CORS, single
hydration/navigation pageviews, administration privacy, and rejected bad pins
using the approved tracker bytes and a synthetic collector.

The public site has no application account, session, role, promotion, or demotion system. Project administration is a narrow host-authenticated operation, not a general application login.
