# Stage 2: homepage and AutoDL MiniMax H3

Implemented locally on 2026-10-14 in TinyShip's TanStack Start app. No remote website deployment. Initial verification and subsequent paid live checks are distinguished below and in `autodl-video.md`.

## Rendered result

The supplied title and description are preserved verbatim in `page-registry.ts`. The built Cloudflare Worker returned HTTP 200 to curl, with these actual headings in its HTML:

```text
H1 Rumpelstiltskin AI Video Maker
H2 How to Make a Rumpelstiltskin AI Video
H2 Rumpelstiltskin AI Video Examples
H2 Rumpelstiltskin AI FAQ
H2 More AI Video Tools
```

There is one H1, one canonical (`https://rumpelstiltskin-ai.co/`) and zero keywords meta tags. The H1 precedes the maker, which precedes the three-sentence introduction and the four H2 sections. Four illustrated steps, three 1254×1254 example images and five FAQ paragraphs are rendered on the server. Example images are labelled illustrative stills; they are not provider-generated video results.

Tool labels, template descriptions, buttons, consent text, credit cost, generation-time note, result placeholder and download instructions are present in initial SSR HTML. Selected filenames, photo previews, task progress/errors and completed video results update after interaction. These updates do not hide static copy behind client rendering.

The six exact home navigation links read from the shared registry in the supplied order. They have no `nofollow` or new-window target. Their metadata is stored with their routes and keywords for later stages. Those six routes remain uncreated, as requested, and sitemap contains only the active homepage. When their route files are created, automatic discovery activates their registry URLs.

## Generation integration

Selected workflow: [AutoDL MiniMax H3 `minimax_h3_lightx2v_v5`](https://www.autodl.art/large-model/comfyui/minimax_h3_lightx2v_v5). The homepage takes a required dancer photo and optional princess photo, with a fixed barn reference. The current 10-second template uses five shots: shush (0–1.8s), frightened princess close-up (1.8–3s), measured dance (3–6.5s), footwork detail (6.5–8.2s), then dancer medium shot (8.2–10s). Reference costumes are preserved. The earlier trial videos used preceding prompt revisions and do not verify this latest template.

The homepage uses TinyShip's existing authenticated R2 upload, video submission, polling and credit/refund services. The shared AutoDL adapter sends `prompt`, ordered `ref_image_0` / `ref_image_1` / `ref_image_2`, `duration: 10`, `resolution: "768p横"` and an optional seed. The server supplies the prompt, fixed scene and default princess. Submission and polling use the official asynchronous ComfyUI endpoints; the token stays server-side. More protocol details are in `autodl-video.md`.

New accounts receive 40 credits through the existing Better Auth user-create hook and credit service, covering one H3 video (the default duration is now 10 seconds). Local D1 HTTP registration returned 200, established a session and returned an authenticated balance of 40. The new hook also has focused unit coverage. Local D1 migrations were applied only to `.wrangler/state`; no remote database was changed.

Live use requires `AUTODL_API_KEY`, `R2_PUBLIC_URL`, a configured R2 binding and a strong `BETTER_AUTH_SECRET`. Use the root `.env` for the existing local workflow and the TanStack `.dev.vars.example` for Worker local variables; deployed secrets belong in Cloudflare Worker secrets. Initial verification used a temporary local auth secret and unconfigured video/storage variables; the follow-up below records the subsequent R2 connection. Readiness returns a boolean, never credentials; with missing video/storage configuration, the SSR tool explains temporary unavailability and disables submission.

The initial checks did not submit a paid provider job. The subsequent AutoDL live check described in `autodl-video.md` generated one 5.17-second, 768×1344 clip and identified a download CORS restriction, now handled through an authenticated same-origin download route. Rendering took about four minutes. The fixed title/description use the supplied “in seconds” wording; the tool explains that an asynchronous render may take minutes. Existing TinyShip task storage is an in-memory Map, so durable task records and retention of expiring provider video URLs remain necessary for reliable production operation across Worker instances/restarts. No new queue or storage service was introduced in this phase.

## Verification

- TanStack TypeScript: exit 0.
- Cloudflare client + Worker build and centralized-SEO source guard: exit 0.
- SEO/video/provider focused tests: 43 passed; signup-bonus tests: 3 passed.
- Built-Worker HTTP acceptance: 14 passed, covering homepage and all nine foundation requirements.
- Edge browser: photo preview, template change, consent, disabled unconfigured generation and initial download states passed; no page errors.
- Desktop 1440px and mobile 375px reviewed; mobile scroll width equals viewport width. All seven local images loaded with their correct natural dimensions.
- Curl artifacts: `test-results/homepage.html`, `homepage-headers.txt`, `home-ssr-check.json`.
- Browser artifacts: `test-results/home-desktop.png`, `home-mobile.png`, `home-browser-check.json`.

The agent additionally ran existing credit tests and found one pre-existing stale assertion at `tests/unit/credits/utils.test.ts:120` (eight transaction codes expected, eleven already defined). It was not changed; no full-suite pass is claimed.

## Added files

```text
apps/tanstack-app/src/lib/page-registry.ts
apps/tanstack-app/src/lib/home-copy.ts
apps/tanstack-app/src/lib/dance-service.ts
apps/tanstack-app/src/lib/dance-generation.ts
apps/tanstack-app/src/components/home-content.tsx
apps/tanstack-app/src/components/dance-maker.tsx
apps/tanstack-app/src/home.css
apps/tanstack-app/public/images/dance/step-upload.svg
apps/tanstack-app/public/images/dance/step-template.svg
apps/tanstack-app/public/images/dance/step-generate.svg
apps/tanstack-app/public/images/dance/step-download.svg
apps/tanstack-app/public/images/dance/example-barn.png
apps/tanstack-app/public/images/dance/example-couple.png
apps/tanstack-app/public/images/dance/example-pet.png
libs/ai/autodl-video.ts
tests/unit/ai/autodl-video.test.ts
tests/unit/ai/autodl-video-api.test.ts
tests/unit/ai/dance-generation.test.ts
tests/unit/ai/dance-maker-ssr.test.ts
tests/unit/credits/signup-bonus.test.ts
tests/e2e/specs/homepage.spec.ts
docs/superpowers/plans/2026-10-14-homepage.md
docs/implementation/autodl-video.md
docs/implementation/homepage.md
```

## Modified files

```text
apps/tanstack-app/src/routes/index.tsx
apps/tanstack-app/src/lib/site-copy.ts
apps/tanstack-app/src/lib/sitemap.server.ts
apps/tanstack-app/src/routeTree.gen.ts
apps/tanstack-app/src/routes/api/video-generate/index.ts
apps/tanstack-app/src/routes/api/video-generate/status.ts
apps/tanstack-app/.dev.vars.example
config/aiVideo.ts
config/credits.ts
libs/auth/auth.ts
libs/ai/config.ts
libs/ai/types.ts
libs/ai/video.ts
libs/ai/video-task-store.ts
env.example
tests/e2e/seo.config.ts
tests/e2e/specs/seo-foundation.spec.ts
apps/next-app/app/api/video-generate/route.ts
apps/next-app/app/api/video-generate/status/route.ts
apps/nuxt-app/server/api/video-generate.post.ts
apps/nuxt-app/server/api/video-generate/status.get.ts
```

The Next/Nuxt API edits only synchronize shared provider support and validation; no pages were built in those apps. Build output, test output and local D1 state are generated artifacts, not source additions.

## R2 connection follow-up (2026-10-14)

Later upload regression: the development outbound override also received the remote-binding WebSocket handshake. Passing its Upgrade header to native Node fetch caused `UND_ERR_INVALID_ARG`, then the R2 upload timed out before any AutoDL task existed. `cloudflare-proxy.cjs` now delegates upgrades to the installed Miniflare `fetch` implementation, preserving the 101 response and bidirectional frames while retaining Node proxy support for ordinary HTTP. The user's selected photos did not need to be reloaded. A local socket regression reproduced the failure and passed after the fix; a real anonymous image upload/public read passed with identical bytes and unchanged free allowance. This changes local preview transport only, with no deployment or video-generation charge. Evidence: `test-results/r2-upload-fix.json`; reproduction: `tests/unit/cloudflare/preview-transport.test.ts`; live check: `scripts/manual/r2-upload-check.mjs`. Remote-binding behavior follows the [Cloudflare local-development documentation](https://developers.cloudflare.com/workers/local-development/).

The user created `rumpelstiltskin-ai-uploads` and supplied the public development URL `https://pub-7344a28ff09f475d9e99f883230bb927.r2.dev`. Bucket metadata was read through the logged-in Wrangler account, then the local configuration was connected to this existing bucket with `remote: true`. The website itself was not deployed and D1 remains local.

The user's existing AutoDL key was preserved in the ignored `.dev.vars`. The public R2 URL was filled in, and the placeholder local auth secret was replaced with a random 32-byte secret. No credential values were printed or stored in source files. Worker binding types were generated in `apps/tanstack-app/worker-configuration.d.ts`.

Actual authenticated `POST /api/upload` returned 200. An anonymous GET of its returned public photo URL returned 200 with `image/png`; the downloaded bytes exactly matched the original 1254×1254 illustration. New local test-account credit balance remained 40. Evidence is in `test-results/r2-live-check.json`. One diagnostic object was also uploaded using Wrangler's R2 CLI to distinguish bucket permissions from development-network forwarding. Both generated test pictures were removed after the check; the recorded public URL is historical evidence and will no longer load. No AutoDL generation request was made during this connection check.

The saved preview launcher was restarted and verified in Edge: authenticated login returned 200, photo preview/template/consent worked, the Generate video button became enabled and the unavailable message disappeared. There were no page errors. `test-results/r2-browser-check.json` and `r2-connected-tool.png` record this check. The Generate button was not clicked, so AutoDL balance was not consumed.

This computer's Windows system HTTP proxy was enabled, but Wrangler 4.85 bypassed it in its preview WebSocket and workerd R2 forwarding. The development-only `scripts/cloudflare-proxy.cjs` uses Node's existing proxy support and Miniflare's `outboundService` for `ProxyWorker`; it does not alter installed dependencies, system settings or deployed application code. `scripts/cloudflare-preview.mjs` reads the enabled Windows proxy address without exposing credentials, bypasses the proxy for localhost and launches the standard Wrangler local runtime with the configured remote R2 binding. An explicit `--local` must not be added: it disables remote bindings in this installed Wrangler version.

After building, the repeatable local preview command from `apps/tanstack-app` is:

```powershell
node scripts/cloudflare-preview.mjs
```

The package's `preview:cf` script builds and runs this launcher. Preview remains at `http://127.0.0.1:7002/`; local authentication URL overrides stay confined to the preview process. The `r2.dev` address is for testing; switch to a custom resource domain before production delivery.

This follow-up modified `wrangler.jsonc`, `package.json`, the upload route's public-URL explanation and ignored `.dev.vars`; added `scripts/cloudflare-preview.mjs`, `scripts/cloudflare-proxy.cjs` and generated `worker-configuration.d.ts`. Typecheck and Cloudflare build passed before the network verification; both launcher scripts passed syntax checks.
