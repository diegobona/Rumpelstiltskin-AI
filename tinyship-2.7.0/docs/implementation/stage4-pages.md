# Stage 4 content pages

Scope: three English TanStack routes. Metadata remains in `page-registry.ts`, rendered only through `seoHead`. The supplied titles/H1 and meme description are unchanged. New routes automatically enter the sitemap; the home navigation still reads the same six registry entries.

## Facts and sources

Checked 2026-10-14:

- [AFI Catalog](https://catalog.afi.com/Film/57804-RUMPELSTILTSKIN): 1987 film, Cannon Movie Tales, David Irving (director/writer), Billy Barty (Rumpelstiltskin), Amy Irving (Katie).
- [Know Your Meme](https://knowyourmeme.com/memes/ai-rumpelstiltskin-tip-toein-in-my-jordans): attributed Instagram upload date and account credits; subsequent music edits and spread. The precise upload date is explicitly attributed, because the linked original Instagram post could not be independently fetched.
- [Angela Yang / NBC News, published by NBC Los Angeles](https://www.nbclosangeles.com/entertainment/entertainment-news/ai-generated-rumpelstiltskin-meme/3952695/): AI origin and mistaken film attribution. Search returned the article; direct opening was restricted.

Sources appear beside the relevant paragraphs. The explanation of why the old-film appearance encouraged the association is presented as an explanation, not measured causal research. No fabricated original-film timestamp, claim that Billy Barty performed the viral dance, unverified original model/prompt, absolute first creator, engagement statistics or music release year is included.

The exact user-supplied page F title is retained; its opening paragraph corrects the misleading “1987 scene” attribution. Page D's requested description retains “30 seconds”; visible copy explicitly says that rendering takes minutes and a 30-second turnaround is not guaranteed.

## Tutorial and prose

The guide uses actual maker labels and behavior. The current tool has one included dance sequence, so the second step explains that preset and optional princess selection instead of inventing a template dropdown. Generation uses account credits and a signed-in session. The result is a 10-second MP4; no guaranteed delivery time is claimed.

Four actual local UI screenshots use a generic illustrative input, not the user's portrait. Processing and completed controls are demonstrated with local mocked responses, explicitly identified in captions; no generated result is presented as evidence. All four PNGs have native and declared dimensions of at least 300×300. No account or upload was created for the captures.

The humanizer skill was used in embedded mode: final prose only, supported facts preserved, no invented anecdotes, decorative conclusions or forced parallel claims. User-specified headings and metadata take precedence over stylistic edits.

## Verification

Passed: TanStack typecheck, production Cloudflare build and source guard, 9 SEO unit tests, and 9 targeted E2E tests (Stage 4, Stage 3, homepage). Actual `curl --compressed` confirms all three pages expose the requested titles/H1/H2, one description/canonical and indexable HTML with no keywords. The sitemap contains exactly seven public URLs. Six desktop/mobile visual checks show no page overflow, runtime errors or POSTs. Evidence: `test-results/stage4-ssr-check.json`, `stage4-sitemap.xml`, `stage4-visual-check.json` and the three raw HTML files.

Playwright output is now isolated to `test-results/playwright-seo` so its cleanup does not remove manually saved artifacts. Its initial default cleanup removed earlier manual test outputs; all five generated video originals were recovered from existing result URLs with matching prior byte sizes. Durable private copies now live in ignored `artifacts/private/videos/`, and the original `test-results` video paths were restored. The screenshot capture script is retained under `scripts/manual/` with an explicit recovered audit. This phase makes no paid generation requests and does not deploy to Cloudflare.
