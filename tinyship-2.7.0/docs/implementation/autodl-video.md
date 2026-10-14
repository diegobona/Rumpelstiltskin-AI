# AutoDL MiniMax H3 video

The shared TinyShip video layer now supports `autodl` as an asynchronous provider,
using the model identifier `minimax-h3` and the existing task/status/refund flow.
The configured cost is 40 TinyShip credits per generation.

The selected workflow is `minimax_h3_lightx2v_v5`. Its official `input_rules`
and `output_example` were read on 2026-10-14 through the public
[workflow metadata endpoint](https://www.autodl.art/api/v1/comfyui/workflows/minimax_h3_lightx2v_v5).
The [workflow page](https://www.autodl.art/large-model/comfyui/minimax_h3_lightx2v_v5)
and [ComfyUI API documentation](https://www.autodl.art/docs/comfyui_api/)
describe the same asynchronous service.

This workflow accepts one required reference image, up to eight optional images,
and a required prompt. It supports 1–10 seconds. The homepage always supplies
three ordered images: uploaded dancer, uploaded/default princess, fixed barn.
Reference images guide identity and setting; they do not guarantee exact motion.

| Shared option | AutoDL request field |
| --- | --- |
| `prompt` | `prompt` |
| `referenceImageUrls[0]` (dancer) | `ref_image_0` |
| `referenceImageUrls[1]` (princess) | `ref_image_1` |
| `referenceImageUrls[2]` (scene) | `ref_image_2` |
| `duration` (default 10) | `duration` |
| `size` (default `768p横`) | `resolution` |
| `seed` (optional) | `seed` |

Supported resolutions are 480p, 768p and 1080p, each in portrait (`竖`),
landscape (`横`) and square (`(1:1)`). Image URLs must be public HTTP(S) URLs for
JPEG, PNG, or WebP content. The app's upload flow checks image content before
submission. Prompt length is 1–20000 characters and seed is an integer from
1 through 999999999999999.

Set the server-only `AUTODL_API_KEY` to a token created in the **ComfyUI** group.
The adapter sends the token directly in `Authorization`; it does not add `Bearer`.
`AUTODL_VIDEO_WORKFLOW_ID` optionally overrides the verified default; an override
must expose the same request fields and constraints. No provider credentials are
included in the public `aiVideoConfig`. A server function may expose the boolean
`isAutodlVideoConfigured()` to the page.

Submission uses `POST https://autodl.art/api/v1/comfyui/comfyui_workflow/{workflow_id}`.
Polling uses `GET https://autodl.art/api/v1/comfyui/comfyui_workflow/result/{task_id}`.
Only `code: "Success"` envelopes are accepted. `QUEUED` and `RUNNING` mean
processing; `SUCCESS` and the workflow's documented `completed` mean success;
`FAILED` is terminal and triggers the existing refund flow. Completed tasks with
no valid video result are also marked failed. Query transport errors and unknown
statuses remain retryable errors rather than refunding a possibly active task.

Result extraction reads only the documented `data.results` entries and accepts
HTTP(S) video/MP4 URLs. The response's `duration` is processing time and is not
reported as video duration. Result URLs expire quickly: production storage and
durable task records are still needed to retain results across Worker instances
and restarts. The current task store is the existing in-memory TinyShip store.

Validation runs before credit consumption. Submission failure and terminal task
failure reuse the existing credit refund paths. The initial adapter tests mock
HTTP responses in `tests/unit/ai/autodl-video.test.ts`. A subsequent explicitly
requested live check is recorded below.

## Current three-image homepage template (2026-10-14)

The browser submits `{ danceTemplate: 'rumpelstiltskin-v2', dancerImageUrl,
princessImageUrl? }`. The authenticated TanStack route creates the provider
options using `src/lib/dance-template.ts` before validation and charging. It
fills default image URLs using `R2_PUBLIC_URL` and the fixed keys below. The
client cannot override the template's scene, prompt, model, duration or resolution.
The optional princess uses its own existing authenticated R2 upload.

`src/lib/dance-prompt.ts` contains the user's latest 10-second, five-shot
template verbatim: shush from 0–1.8 seconds, frightened princess close-up from
1.8–3 seconds, measured dance from 3–6.5 seconds, footwork detail from
6.5–8.2 seconds, then dancer medium shot from 8.2–10 seconds. Dancing begins
only after the princess reaction. The prompt requests readable, controlled
tiptoe side-steps, fear rather than amusement, and stable shots with hard cuts.
Character identity, reference costumes and the compact straw corner are preserved.
The three ordered reference images and API settings remain unchanged.

The shared adapter also accepts up to nine `referenceImageUrls`; when supplied,
this ordered array replaces the legacy `firstFrameUrl` fallback completely.
Invalid arrays or durations fail before credit consumption. Local `.dev.vars`
and both environment examples now select the new workflow rather than `_15s`.

### Three-image live verification

This recorded trial used the previous single-continuous-shot template with its
formal-outfit override. It does not verify the current five-shot prompt.

One real generation used the user-provided costume/dancer image as the uploaded
dancer, the default princess and the fixed barn. Authenticated submission, polling,
playback and same-origin download all succeeded. Edge and FFprobe confirm
10.125 seconds, 1344×768, H.264/AAC; the MP4 is 6,099,443 bytes. Exactly one paid
generation POST was sent and 40 test-account credits were consumed. The complete
browser run took 393 seconds including auth, upload and download. The first
preflight run lost its R2 download connection before forwarding any generation
request; repeating it through the existing local proxy succeeded.

Evidence: `test-results/autodl-three-image-check.json`,
`test-results/rumpelstiltskin-ai-three-image.mp4`, and
`test-results/autodl-three-image-frames.jpg`. The frames show the requested barn,
dark formal outfit, right-side seated princess and continuous shush/dance shot.
However the model cropped the dancer's feet despite the full-body instructions.
This proves the three-image API flow, not exact choreography or complete visual
compliance. No additional paid generations were made to hide or retry this result.

Independent browser mocks verified optional princess replacement/removal, both
upload validations, separate image URLs, cache reuse, and desktop/mobile layout,
without consuming credits (`test-results/multi-image-ui-*`).

## Historical one-image prompts and live check (2026-10-14)

The three presets use H3's image-to-video structure from the
[MiniMax H3 prompt guide](https://huggingface.co/MiniMaxAI/MiniMax-H3/blob/main/docs/VIDEO_PROMPT_WRITING_GUIDE_base_en.md):
an opening image-alignment instruction, a visual/action description, an ambient
sound field and a background music field. The visual description preserves the
photo's subject, clothing or fur, background and composition, then describes a
short sequence of visible movements with a static camera. The shush preset raises
a hand toward the mouth, lowers it, then asks for two small shuffle steps. The
other presets request a gentle barn shuffle or tiptoe steps. A meme name alone
does not specify its choreography; this workflow produces prompted variations,
and exact motion transfer would require a suitable reference-video workflow.

One authenticated live generation used the shush preset, an actual R2 photo URL,
`minimax_h3_lightx2v_v5_15s`, 5 seconds and `768p竖`. AutoDL accepted the job and
returned a completed video that Edge loaded as 5.166667 seconds, 768×1344. The
render took about four minutes. The local account's 40 trial credits were consumed
once. Signup and signin were exercised through the actual browser forms. Evidence
is stored in `test-results/autodl-live-check.json`; it contains the temporary
signed asset URL but no API token. This is the only paid generation used for this
check.

The provider's output server permits browser playback but blocked direct
JavaScript downloads through CORS. `/api/video-generate/download` now streams the
clip through the application's origin after authentication. It permits only
HTTPS MP4 outputs from the observed AutoDL output host and directory, rejects
redirects and invalid URLs, and sends no browser credentials upstream. The client
retains the completed result if download fails, so a download retry does not
submit another generation job.

Local preview uses the existing Windows proxy for both R2 and main-Worker
outbound requests. Its auth callback URL matches `http://127.0.0.1:7002`; these
overrides affect local preview only. No website deployment or remote D1 database
creation was performed.

The browser download check reused the captured result and intercepted the
generation submission locally, making **zero additional provider generation
calls**. The actual authenticated download endpoint returned 200 and saved a
4,929,669-byte MP4. Anonymous access returned 401; an invalid destination returned
400. Edge showed no tool errors, and the local account balance remained zero.
`test-results/autodl-download-check.json` records this check;
`test-results/rumpelstiltskin-ai-shush.mp4` is the saved output. FFprobe confirms
H.264 video, AAC audio, 768×1344 and a duration of 5.166667 seconds. Sampled frames
show the shush pose lowering into playful movement; precise original-meme dance
timing is not guaranteed.

Local preview buffers outbound POST bodies so Node 24 can handle a 401 without
attempting to replay a non-repeatable stream. The installed Workers runtime
rejects `redirect: 'error'`, so the download fetch uses `manual` and rejects
non-2xx responses instead. Both changes were verified in the actual runtime.

Verification: 75 focused video/provider/SSR/download-validation tests passed;
TanStack typecheck and Cloudflare build exited 0; both preview scripts passed
syntax checks. Curl with gzip decompression confirms the homepage's H1, all four
H2s, intro and upload/template/generate/download copy in the server HTML.

Files changed for this live integration follow-up:

- `apps/tanstack-app/src/lib/dance-generation.ts`
- `apps/tanstack-app/src/lib/home-copy.ts`
- `apps/tanstack-app/src/components/dance-maker.tsx`
- `apps/tanstack-app/src/routes/api/video-generate/download.ts` (new)
- `apps/tanstack-app/src/lib/video-download.ts` (new)
- `apps/tanstack-app/src/routeTree.gen.ts` (generated)
- `apps/tanstack-app/scripts/cloudflare-preview.mjs`
- `apps/tanstack-app/scripts/cloudflare-proxy.cjs`
- `tests/unit/ai/dance-generation.test.ts`
- `tests/unit/ai/video-download.test.ts` (new)
- `docs/implementation/autodl-video.md`
- `docs/implementation/homepage.md`

Manual browser scripts and captured evidence are under the ignored `test-results`
directory. The live generation script is deliberately excluded from automated
tests to avoid accidental paid calls.

## Published meme template and 10-second revision

After the user rejected the subtle movement of the first sample, the homepage
templates were revised using MakeViral's publicly documented
[You dance template](https://www.makeviral.ai/templates/ai-rumpelstiltskin-dance)
and the bent-knee movement description in
[AI Rap Duo's tested prompt guide](https://airapduo.io/guides/how-to-make-the-rumpelstiltskin-ai-video).
The adapted H3 prompt now has five timed shots: a shushing dancer (0–2s), the
watcher's reaction (2–3s), an energetic raised-heel dance (3–7s), feet (7–8s),
then the dancer's grin while moving (8–10s). The previous fixed-camera, gentle
sway and preserve-background constraints were removed. Default duration is 10
seconds in both the homepage request and shared video configuration; the existing
40-credit per-generation trial policy is unchanged.

MakeViral's new-scene mode generates a dressed barn still before its video step;
its exact-recast mode also supplies the trend video. This app currently uses the
uploaded photo directly as H3's first image. The prompt therefore establishes the
barn and separate watcher in the sequence, without pretending an unavailable
reference video was submitted. The two-stage source workflow and direct-image
adaptation are distinct, and choreography/identity fidelity still requires
actual sample inspection.

One new paid verification run submitted the adapted default barn template with
`duration: 10`. Edge played and downloaded a 10.125-second, 768×1344 H.264/AAC
video, 7,947,075 bytes. The sampled frames show the shush, watcher's reaction,
full-body footwork, feet insert and final grin. Timing and generated supporting
details are approximate; this is not a shot-for-shot recast of the original
reference reel. Evidence: `test-results/autodl-meme-10s-check.json`,
`test-results/autodl-meme-10s-frames.jpg` and
`test-results/rumpelstiltskin-ai-meme-10s.mp4`. Only one provider POST was made for
this revision. Both signup/signin and the actual download endpoint were exercised.

The revision passed 31 focused provider/client/SSR/credit tests, TanStack typecheck
and the Cloudflare build. Curl confirms the supplied H1 and the 10-second credit
hint in SSR HTML, with no keywords meta. Source changes are `config/aiVideo.ts`,
the signup-bonus comment in `config/credits.ts`, `dance-generation.ts`,
`home-copy.ts`, the corresponding three video tests and these implementation docs.

## User-supplied fixed references (14 October 2026)

The user supplied three images for the multi-image revision. The original PNG
bytes are preserved under `apps/tanstack-app/public/images/references/`:

- `barn-scene.png`: attachment 1, the fixed environment reference (`@Image3`).
- `princess-default.png`: attachment 3, the default princess reference (`@Image2`)
  when the user does not upload a princess photo. The source screenshot includes
  player controls; the prompt must exclude those overlays from the result.
- `costume-reference.png`: attachment 2, retained from the previous outfit specification.
  The current template preserves reference outfits instead. This file is not a
  fourth image in the generation request. The dancer's identity comes
  from the required uploaded photo (`@Image1`).

The two fixed API references were uploaded into the user's existing
`rumpelstiltskin-ai-uploads` bucket using the project's authenticated Wrangler CLI:

| Reference | Public URL | Bytes | SHA-256 |
| --- | --- | ---: | --- |
| Environment | `https://pub-7344a28ff09f475d9e99f883230bb927.r2.dev/references/rumpelstiltskin-v2/barn-scene.png` | 2701281 | `c2bb8bf57263320954c59b994dbaa747bbac78616935e1bfb28fdc69f5b03855` |
| Default princess | `https://pub-7344a28ff09f475d9e99f883230bb927.r2.dev/references/rumpelstiltskin-v2/princess-default.png` | 382652 | `853218657c2f4509ec12431df97955a02f7b3111cfbca03e3962983792c316fe` |

Both previously absent keys returned HTTP 200 for public HEAD and GET after
upload, with `Content-Type: image/png`. Downloaded bytes and SHA-256 hashes match
the local originals exactly. This asset upload did not deploy or restart the
website, create a bucket, modify secrets, or submit a paid video generation.
