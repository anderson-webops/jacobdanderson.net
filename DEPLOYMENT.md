# Runtime Artifact Contract

The portfolio is a Vite SSG site with a loopback-only Express API and external MongoDB state. Production uses its existing direct Nginx and systemd topology.

## Build Identity

The versioned source contract is `deploy/runtime-artifact.json`. Builds use Node `26.13.1` and the independent `webops-locked-npm-v1` npm `12.2.2` profile from `build-toolchain/`. The bootstrap verifies its reviewed local archives, independent lock, complete installed payload, signatures and full/production audits before selecting its paired executables.

The root `package-lock.json` governs source and static builds. `back-end/package-lock.json` separately governs the production API installation. The SDK and development dependencies remain outside runtime archives.

## Artifact Acceptance

The archive contains the compiled backend, complete production dependency tree, static site, deployment identity and a hashed `.runtime-manifest.json`. Its required paths are checked independently of the archive's own inventory. Release preparation preserves a clean exact source revision, annotated semver identity and current default-branch correspondence.

Acceptance exercises the exact unpacked archive independently of the source checkout, development dependencies and real providers. Existing fixtures cover GET/HEAD liveness and readiness, synthetic MongoDB, static output, dependency failure, missing runtime modules, graceful shutdown, failed promotion and recovery from unchanged retained bytes.

The archive and checksum become deployment-ready only after the corresponding exact-tag CI and uploaded-asset verification pass. The runtime manifest includes the SDK profile, lock and payload identity used for the build.

The release also publishes the runtime manifest, versioned source contract and digest-bound provenance as separate JSON assets. They identify the exact source, SDK and archive independently of the archive's internal inventory.

## Gallery Sites

The `gallerySites` map in the [runtime contract](deploy/runtime-artifact.json) pairs each gallery origin with its static home document and media path. Photos uses `photos.jacobdanderson.net`; `galleryAliases` maps the previous `pictures` hostname to it. Both gallery homepages are built into the same release under `front-end/dist/.gallery-sites/` and reuse the existing gallery assets and preview/full-size URLs. Each has its own canonical URL, sitemap and robots policy.

Each [gallery virtual host](deploy/nginx/jacobdanderson-gallery-sites.conf.example) serves its own `/admin` document. Protected access uses the portfolio’s existing Nginx password file, actor, request ID and proxy key. Only the matching collection’s public media and protected gallery operations are routed. Browser credentials stay in memory on the origin where they were entered.

Uploads, favorites, visibility, manual order within favorites or other visible items, and confirmed deletion use the same loopback API and MongoDB collection on all three sites. Existing records retain newest-first order until moved. Hiding an image atomically changes its collection discriminator so prior readers also omit it; showing it restores its position. Public media requires cache revalidation, and hidden previews require authentication. Existing clients may retain media fetched under the previous one-day cache policy. No database backfill or additional credential store is required.

## Retained Compatibility

The current retained release is `v2.14.7`, commit `9109c6f4008c35f08e7f3f563a0f56d9c87adc0d`, built with Node `26.13.0` and npm `12.2.1`. Its unchanged archive must remain recoverable under the updated runtime, with bounded explicit retained-release verification and an exact expected-current identity.

The earlier `v2.14.0` Node 24 archive at `c30a8664619fe000567a425be161e76db9f15353` remains a separate recovery fixture. Its SHA-256 is `e25c739132c2e2b5ada2f4d0a4cb988cad7862d99428e71fc17b99aa0bca1929`. Historical capture checks remain scoped to their original release. Retained toolchains are accepted only in their explicit recovery context; new candidate artifacts require the current SDK identity.

## Runtime Invariants

Host-controlled users, paths, protected configuration, loopback binding, exact proxy trust, IPv4/IPv6 edge listeners and administration gates remain authoritative. The source helpers preserve archive-only preparation, independent extraction and verification, bounded work, atomic release selection, readiness and exact served identity, and genuine prior-runtime recovery.

MongoDB visibility and semantic audit records remain external to releases. Existing supported schemas and the unique `slug_1` index retain their compatibility contract; this toolchain release includes no production data transformation.

Installed-helper support and protected current/rollback acceptance remain host prerequisites. Source publication, host activation and independent public acceptance are recorded separately.
