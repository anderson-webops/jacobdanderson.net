# Repository Guidelines

## Scope and architecture

- `front-end/` is the Vue/Vite SSG site. Pages are in `src/pages`, shared UI in `src/components`, and curated project data in `src/data/otherProjects.ts`.
- `back-end/` is the loopback Express API using the direct MongoDB driver. Keep the backend catalog synchronized with the frontend catalog.
- The site has no application account, session, role, promotion, or demotion system. Do not reintroduce one without a separately reviewed authorization design.
- Production is direct Nginx plus systemd. Do not add a production Docker path.

## Toolchain and dependency rules

- Use Node `24.18.1` and npm `12.0.2`.
- The root `package-lock.json` is authoritative for development and builds. `back-end/package-lock.json` is authoritative for the standalone production dependency tree.
- Keep optional Linux ARM64/x64 glibc and musl bindings aligned with the exact resolved esbuild, OXC parser/formatter, Rolldown, Rollup, Unrs, and Lightning CSS versions.
- Before dependency delivery, run a clean locked install, full and production audits, registry signatures, native/platform checks, lint, types, tests, accessibility, build, and runtime artifact acceptance.

## Security and release rules

- Preserve loopback-only API binding, exact proxy trust, fixed database concurrency, bounded MongoDB timeouts/pool size, fail-closed project visibility, semantic mutation audit records, and Nginx-generated admin identity.
- Keep secrets and writable database state outside immutable artifacts.
- Production promotion is archive-only. Never execute `deploy/systemd/promote-release.sh` directly with sudo from a checkout. Install it and its verifier/extractor once through the reviewed installer, then invoke the root-owned helper with the reviewed archive, full commit, and SHA-256.
- Do not move a published tag or force-push shared history. This repository stays on the stable `v2.x` line unless an intentional breaking change justifies `v3`.

## Validation

```bash
npm ci --include=optional --strict-allow-scripts
npm audit
npm audit --omit=dev
npm audit signatures
npm run verify:native-lock
npm run verify:platform-install
npm run lint
npm run typecheck
npm test
npm run a11y
npm run build
npm run artifact:build
npm run artifact:verify
RUNTIME_ARTIFACT_MONGO_URI=<synthetic-mongodb-uri> npm run artifact:smoke
npm run smoke:promotion
npm run artifact:pack
RUNTIME_ARTIFACT_MONGO_URI=<synthetic-mongodb-uri> npm run artifact:archive-smoke
```

## Delivery

- After a coherent validated change, commit and push directly to the default branch unless branch protection requires a pull request or the user explicitly asks for one.
- For a material deployable milestone, create a new annotated semver tag and GitHub release, attach the verified runtime archive and checksum, and verify the uploaded assets. Never leave a generated pull request or branch open after safe integration.
- Source delivery is not production deployment. Do not access or mutate the production host from this task. Provide a bounded server-AI handoff when activation remains.
