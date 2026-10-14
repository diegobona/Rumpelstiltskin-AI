# Stage 1 SEO Foundation Implementation Plan

> Execute directly in the current workspace with bounded parallel tasks. The user requested quick implementation and TanStack-only scope.

**Goal:** Deliver the nine requested SEO/SSR foundations without business pages.

**Architecture:** Keep TinyShip shared auth/database/AI/payment adapters and API routes. Activate a small English-only SSR route tree, one SEO head generator, request-level domain normalization, and a sitemap derived from actual indexable routes.

**Tech stack:** Existing TanStack Start, React, Vite, Cloudflare plugin and Wrangler.

- [x] Verify installed framework APIs and TinyShip official setup/deployment skills.
- [x] Add HTTP acceptance scenarios before implementation.
- [x] Replace the localized demo route tree with homepage and existing resource routes; preserve demos outside active source.
- [x] Generate all page metadata from `src/lib/seo.ts`; forbid keywords.
- [x] Add www-to-apex 301 request middleware and default resource noindex policy.
- [x] Serve permissive robots.txt and automatic sitemap.xml, initially homepage only.
- [x] Add an SSR 404 with a homepage link.
- [x] Run focused unit/HTTP checks, TanStack typecheck and Cloudflare build/preview. Report deployment limitations separately from local verification.

No Next/Nuxt parity or unrelated business-flow tests: the user explicitly selected TanStack and this phase only.
