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

## Upstream integration

Vitesse `a8785264f83c2ebe1b3cf689296775a4949957c8` is merged into this
monorepo's history. `docs/upstream-vitesse.json` records all 92 changed paths
since the shared ancestor, their maintained local targets and the reason for
each integration or application-specific replacement. `npm run verify:upstream`
requires the actual merged ancestry and complete exact path accounting; CI runs
it with full history before artifact acceptance.

Framework updates are mapped into `front-end/`. Keep actual portfolio content,
branding, privacy, administration, npm lockfiles and direct-deployment contracts
when reconciling future starter changes. The hello/counter pages, demo locales,
optional service worker, container deployment and external starter branding are
not application features. Pinia state is serialized or hydrated from the explicit
SSG request context, with independent-request regression coverage. Generated
routes use Vue Router 5; the superseded pages plugin is no longer installed.

The dependency graph also verifies JS-YAML 5 through the actual lint consumer,
KaTeX 0.19 through the Markdown math extension, and the formatter's updated worker
pool with a single-thread CLI fixture. Unused legacy overrides are retired rather
than installing unused packages. Linux binding declarations match actual resolved
native consumers; stale or unconsumed declarations fail validation. CI verifies
that the combined workspace graph stays valid after standalone backend checks.
