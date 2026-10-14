# Stage 1: single-language SSR and SEO foundation

Completed locally on 2026-10-14. Scope: TinyShip's TanStack Start app, targeting Cloudflare Workers. No AI business pages were implemented and no remote deployment was performed.

## Acceptance results

| Requirement | Result |
| --- | --- |
| One reusable SEO entry | `seoHead({ title, description, canonical, og })` builds every page head. The build source guard rejects inline page metadata. |
| Full SSR | `startInstance.defaultSsr` and the root/home route SSR options are true. Raw production Workers HTML contains the homepage H1 and body; resource pages and 404 also render H1 server-side. |
| Domain and canonical | Primary origin is `https://rumpelstiltskin-ai.co`. Global request middleware redirects www to the apex with HTTP 301, preserving the path/query. Each rendered page has one canonical, without query or fragment. |
| robots | `User-agent: *`, `Allow: /`, canonical sitemap URL; no Disallow rules. |
| Automatic sitemap | Server-only Vite glob discovers active static page routes and excludes resource/layout/API/noindex routes. Current output contains only `/`. Published URLs for future parameterized routes can be supplied from their content source. |
| 404 | Unknown paths return HTTP 404 with a server-rendered heading and homepage link. |
| No keywords metadata | SEO options have no keywords field; source guard and HTML tests enforce its absence. |
| One language | English HTML and resource routes without a language prefix. Former `$lang` routes are archived outside `src`; no language selector or detection is mounted. |
| Resources noindex | Authentication, account/admin, payment/checkout/pricing, privacy/terms and related resource paths default to `noindex, follow`; middleware also applies `X-Robots-Tag`. |

The privacy/account/pricing classifications are defaults for future routes, not newly written business or policy pages.

## Adding a public page

Use TinyShip's existing file route convention and the central SEO helper:

```tsx
import { createFileRoute } from '@tanstack/react-router'
import { seoHead } from '@/lib/seo'

export const Route = createFileRoute('/about')({
  head: () => seoHead({
    title: 'About | Rumpelstiltskin AI',
    description: 'About Rumpelstiltskin AI.',
    canonical: '/about',
    og: { type: 'website' },
  }),
  component: AboutPage,
})
```

The route is discovered by sitemap without maintaining a second page list. Keep static text in the rendered component or server-loaded data; do not disable SSR. Resource path defaults cannot accidentally be overridden to index by `noindex: false`.

## Verification

- TanStack `tsc --noEmit`: exit 0.
- `node scripts/cloudflare-vite.mjs build`: exit 0, Cloudflare client + Worker artifacts emitted.
- Vitest SEO unit checks: 9/9 passed.
- Playwright HTTP acceptance checks against Vite/Workers development: 12/12 passed.
- The same HTTP checks against the built Worker using Wrangler local preview: 12/12 passed.
- Curl against the built Worker: HTTP 200, H1 visible, body visible, canonical count 1, keywords meta count 0.

Observed H1 in the curl HTML:

```html
<h1 class="text-4xl font-semibold tracking-tight">Rumpelstiltskin AI</h1>
```

The raw response is saved in `test-results/seo-home.html`; headers are in `test-results/seo-home-headers.txt`.

The repo pins pnpm 9.4.0. This machine's fallback pnpm 11 ignores the old overrides configuration, so dependencies were installed with `npx --yes pnpm@9.4.0 install --frozen-lockfile`; the lockfile was preserved. Commands below avoid implicitly reinstalling dependencies through that fallback.

From `apps/tanstack-app`:

```powershell
node ../../node_modules/typescript/bin/tsc --noEmit
node scripts/cloudflare-vite.mjs build
node ../../node_modules/wrangler/bin/wrangler.js dev --config dist/server/wrangler.json --port 7002 --local --local-upstream localhost
```

Wrangler's local upstream normally derives from custom-domain configuration and rewrites Host and redirect locations. For the www acceptance branch, run a second local Worker with the production www upstream:

```powershell
node ../../node_modules/wrangler/bin/wrangler.js dev --config dist/server/wrangler.json --port 7003 --inspector-port 9231 --local --host www.rumpelstiltskin-ai.co --local-upstream www.rumpelstiltskin-ai.co
```

From the monorepo root:

```powershell
node node_modules/vitest/vitest.mjs run tests/unit/seo/foundation.test.ts
$env:SEO_TEST_BASE_URL = 'http://127.0.0.1:7002'
$env:SEO_TEST_WWW_BASE_URL = 'http://127.0.0.1:7003'
node node_modules/@playwright/test/cli.js test --config tests/e2e/seo.config.ts
curl.exe -sS 'http://127.0.0.1:7002/'
```

The original compatibility date, `2026-03-17`, was retained: the installed workerd only supports dates through `2026-05-01`. No dependency upgrade was needed. Production build emits bundle-size and mixed-import warnings, but the built Worker serves all checked routes correctly.

## Changed files

Paths below are relative to the monorepo root.

New foundation modules:

- `apps/tanstack-app/src/lib/site.ts`
- `apps/tanstack-app/src/lib/site-copy.ts`
- `apps/tanstack-app/src/lib/sitemap.ts`
- `apps/tanstack-app/src/lib/sitemap.server.ts`
- `apps/tanstack-app/src/start.ts`
- `apps/tanstack-app/src/routes/robots[.]txt.ts`
- `apps/tanstack-app/src/routes/sitemap[.]xml.ts`
- `apps/tanstack-app/scripts/cloudflare-vite.mjs`
- `apps/tanstack-app/scripts/verify-seo.mjs`

Updated application files:

- `apps/tanstack-app/src/lib/seo.ts`
- `apps/tanstack-app/src/lib/auth-guard.ts`
- `apps/tanstack-app/src/hooks/use-translation.ts`
- `apps/tanstack-app/src/routes/__root.tsx`
- `apps/tanstack-app/src/routes/index.tsx`
- `apps/tanstack-app/src/routes/payment-success.tsx`
- `apps/tanstack-app/src/routes/payment-cancel.tsx`
- `apps/tanstack-app/src/routeTree.gen.ts` (framework generated)
- `apps/tanstack-app/src/components/global-header.tsx`
- `apps/tanstack-app/src/components/site-footer.tsx`
- `apps/tanstack-app/src/components/login-form.tsx`
- `apps/tanstack-app/src/components/signup-form.tsx`
- `apps/tanstack-app/src/components/social-auth.tsx`
- `apps/tanstack-app/src/components/phone-login-form.tsx`
- `apps/tanstack-app/package.json`
- `apps/tanstack-app/vite.config.ts`
- `apps/tanstack-app/wrangler.jsonc`
- `config.ts` (app name only)

Existing authentication pages adapted into the new English route tree:

- `apps/tanstack-app/src/routes/(auth)/route.tsx`
- `apps/tanstack-app/src/routes/(auth)/signin.tsx`
- `apps/tanstack-app/src/routes/(auth)/signup.tsx`
- `apps/tanstack-app/src/routes/(auth)/forgot-password.tsx`
- `apps/tanstack-app/src/routes/(auth)/reset-password.tsx`
- `apps/tanstack-app/src/routes/(auth)/cellphone.tsx`
- `apps/tanstack-app/src/routes/(auth)/wechat.tsx`

Preserved template source, outside active routing and compilation:

- `apps/tanstack-app/scaffold/routes/`: original localized demo routes, language layout and payment redirect wrappers, 55 files.
- `apps/tanstack-app/scaffold/components/`: inactive admin/dashboard demo components, 9 files.

Tests and documentation:

- `tests/unit/seo/foundation.test.ts`
- `tests/e2e/seo.config.ts`
- `tests/e2e/specs/seo-foundation.spec.ts`
- `tests/e2e/TEST-CATALOG.md`
- `docs/superpowers/plans/2026-10-14-seo-foundation.md`
- `docs/implementation/seo-foundation.md`

Installation created local ignored `.env` from the supplied example and framework-generated dependency artifacts. Shared auth/database/payment/AI/storage adapters and API implementations were reused.

## Framework sources checked

- [TinyShip official Cloudflare deployment guide](https://docs.tinyship.cn/zh-CN/user-guide/deployment/cloudflare-workers)
- [TinyShip official Agent Skills](https://github.com/TinyshipCN/tinyship-skills)
- [TanStack Start middleware](https://tanstack.com/start/latest/docs/framework/react/guide/middleware)
- [TanStack selective SSR](https://tanstack.com/start/latest/docs/framework/react/guide/selective-ssr)
- [Cloudflare TanStack Start guide](https://developers.cloudflare.com/workers/framework-guides/web-apps/tanstack-start/)

Installed framework declarations were used where current web documentation describes newer APIs.
