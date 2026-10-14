# Stage 3: public tool pages and comparison

Implemented 2026-10-14 in TinyShip's TanStack Start app. Local built Cloudflare
preview runs at `http://127.0.0.1:7002`; no remote website deployment.

The shared `page-registry.ts` contains the supplied A/B/C titles and H1s and the
verbatim page A description. Page B's description continues from the existing
registry; page C's description describes the actual comparison columns, because
the stage-three request did not supply B/C description text. Each route calls
the existing `seoHead` helper with its own registry path and enables full SSR.
Homepage links and sitemap still consume the same registry.

A and B reuse the existing DanceMaker and provider readiness loader. The maker
now accepts a `returnTo` pathname, so sign-in links on each tool page return to
that page. The default princess image has 300×300 HTML dimensions; all static
reference and example files have native width and height at least 300 pixels.
User-selected photos stay in the interactive upload area and are not published
as public page examples. The A/B text and examples follow the specified heading
orders; examples are explicitly illustrative stills.

The comparison uses a real table with six tool rows: this site, MakeViral,
Rumpel Video, Rumpelstiltskin.info, Rumpelstiltskin-ai.com and
Rumpelstiltskin-ai.org. Public official pages were reviewed on 2026-10-14.
Unknown values are shown in English as **Not publicly disclosed** (未公开).
External wait times are labelled provider claims; the current site's several
minutes estimate comes from its recorded local generation tests. Video duration
is never used as a render-time estimate.

Official references:

- MakeViral: https://www.makeviral.ai/templates/ai-rumpelstiltskin-dance and
  https://www.makeviral.ai/pricing (0 signup credits).
- Rumpel Video: https://rumpelstiltskinvideo.com/ (one 4-second 480p preview after
  email verification; sign-in required; render time depends on queue).
- Rumpelstiltskin.info: https://rumpelstiltskin.info/ (paid credits, sign-in,
  no published fixed wait-time promise).
- Rumpelstiltskin-ai.com: https://www.rumpelstiltskin-ai.com/ (five muted,
  low-resolution watermarked previews per day without an account; full-export
  sign-in policy and render time not clearly disclosed).
- Rumpelstiltskin-ai.org: https://rumpelstiltskin-ai.org/ (pay per video;
  claimed typical 2–4 minute wait; free allowance/login rules not clearly stated).

The A title's “No Signup” and description's “under a minute” are the exact supplied
text. They do not describe the current authenticated, multi-minute workflow.
Visible tool copy, FAQs and the comparison state the actual behavior.

Verification: TanStack typecheck and Cloudflare production build passed;
17 focused SEO/maker/template unit tests passed; six HTTP/JavaScript-disabled
browser tests passed for the homepage and three new pages. Checks cover unique
title/description/canonical/H1, exact H2 order, FAQs, all three home links, semantic
comparison table, alt text, native image sizes, page-specific sign-in return URLs,
and automatic sitemap discovery of exactly four published pages. The initial
stage-three checks failed against the old preview (404/missing sitemap URLs)
before the new build, then passed after implementation.

Raw HTML and extracted metadata are saved in `test-results/stage3-*.html`,
`test-results/stage3-ssr-check.json` and `test-results/stage3-sitemap.xml`.
No new paid video generation was needed for this page work.

Visual verification: all three routes passed at desktop 1440px and mobile 390px
in Edge. H1s wrap without clipping; document/body widths equal the viewport.
The comparison table scrolls inside its own container on mobile. A/B local photo
previews and consent-dependent submit states work. No console/page errors or
POST requests occurred. Evidence: `test-results/stage3-visual-check.json` and
`stage3-visual-*.png`.
