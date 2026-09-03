# Harry Gandhi Personal Website — Context Document

*Last updated: 2026-09-03*

## Overview

Personal blog/portfolio at **harrygandhi.com**. Static HTML site with Notion as CMS, deployed via Netlify with auto-deploy from GitHub. Font: Brygada 1918. Favicon: custom sunflower PNG (transparent background).

Seven pages:
1. **`index.html`** — Home / landing page with bio + botanical hero
2. **`writing.html`** — Essays masonry grid + poem
3. **`blog-post.html`** — Individual essay reader, served at clean URLs `/writing/[slug]`
4. **`magic.html`** — Interactive card trick + Wesley Wang film reveal
5. **`h3ll0.html`** — Semi-private (unlisted) contact page at `/h3ll0`
6. **`404.html`** — Custom 404 page (butterfly postcard)
7. **`momentary.html`** — "Momentary Notes": generative music + ink kaleidoscope at `/momentary`, linked from the main nav **(built, not yet committed)**

---

## Infrastructure

| Layer | Detail |
|-------|--------|
| **GitHub** | `https://github.com/harrygandhi/personalwebsite.git` (branch: `main`) |
| **Hosting** | Netlify (auto-deploys on push to `main`) |
| **Domain** | harrygandhi.com — Netlify DNS, nameservers at Bluehost (`dns1-4.p04.nsone.net`) |
| **CMS** | Notion API (env vars: `NOTION_API_KEY`, `NOTION_DATABASE_ID`) |
| **Email** | MailerLite (API key + group ID `181258728256833207` hardcoded in each HTML file) |
| **Serverless** | Netlify Functions at `netlify/functions/` |

### Netlify Config (`netlify.toml`)
```toml
[build]
  publish = "."
  functions = "netlify/functions"

[[redirects]]
  from = "/api/notion/*"
  to = "/.netlify/functions/notion/:splat"
  status = 200

[[redirects]]
  from = "/writing/:slug"
  to = "/.netlify/functions/blog-render/:slug"
  status = 200
```

### Local Development
- `python -m http.server 8000` from project root, then open `http://localhost:8000/...`
  - For blog-post page, use `?slug=xxx` query param (JS reads it as fallback) — the local server can't reach Notion, so demo content shows, but side-art and layout work
- For full Notion-backed testing, use `npx netlify dev` (Netlify CLI)
- `.claude/launch.json` has two entries: **"Netlify Dev"** (port 8888, for anything Notion-backed) and **"Static"** (port 8000, plain `python -m http.server` — enough for momentary, 404 and h3ll0, and much faster to start)

---

## File Structure

```
Personal Website/
  index.html                       # Landing/home page
  writing.html                     # Essays/writing page
  blog-post.html                   # Individual essay reader (served at /writing/:slug)
  magic.html                       # Interactive card trick (standalone, no nav)
  momentary.html                   # "Momentary Notes" — generative music + kaleidoscope (no nav on the page itself)
  h3ll0.html                       # Semi-private contact page (noindex)
  404.html                         # Custom 404 (butterfly postcard)
  magic-clip.mp4                   # 40s Wesley Wang clip (3.4 MB, gitignored source)
  netlify.toml                     # Netlify build/redirect config
  netlify/
    functions/
      notion.js                    # Notion API proxy
      blog-render.js               # SSR blog post meta tag injection for /writing/:slug
  favicon.png                      # Sunflower favicon (transparent)
  sunflowerfavicon.png             # Source favicon image
  og-image.png                     # 1200x630 shrubbery — shared OG image for all pages
  shrubbery-color.png              # Source landscape botanical (used for og-image and 404)
  shrubbery-bw.png                 # B&W version
  butterfly.png / butterfly-new.png # 404 page hero
  hero-bw.png.png / hero-color.png.png # Home hero (blossom animation base)
  hero1.png .. hero4.png           # Newer hero variants (hero3/4 currently used)
  justsunflower-bw.png             # B&W sunflower (loading animation on blog/writing)
  justsunflower-color.png          # Color sunflower (loading animation)
  hello-portrait.jpg               # h3ll0 page headshot (400x400, sepia filter)
  wallpapersunflower.png           # (Personal use; kept locally)
  side-art/
    into-nature.jpg                # Example side art for the "into-nature" essay
  hak1-8.jpeg/jpg                  # Hilma af Klint art (writing page demo fallback)
  .gitignore                       # Excludes the full 139MB Wesley Wang video + wallpapers
  CLAUDE_CONTEXT.md                # This file
  Personal Website Setup Guide.md  # Original setup notes
```

---

## Notion Database — Blog Posts

Columns used by the site:

| Property | Type | Purpose |
|----------|------|---------|
| `Title` | title | Essay title |
| `Slug` | rich_text | URL slug — /writing/[slug] |
| `Preview` | rich_text | Preview text on cards + meta description for OG |
| `Author` | rich_text | Author name |
| `Status` | select | Only "Published" essays appear |
| `Published Date` | date | Sorting + display |
| `Card Type` | select | text / image / art-only / quote |
| `Card Color` | select | sage / rose / gold / lavender / white |
| `Card Image` | files | Thumbnail on writing grid + OG image override |
| `Featured` | checkbox | Anchors essay to top of grid |
| `Feature Order` | number | Position among featured essays (odd → left col, even → right col) |
| `Side Art` | files | Optional per-essay decorative image on blog post left margin |
| `Compact Spacing` | checkbox | Tightens paragraph margins (poems etc.) |
| `Order` | number | **DEPRECATED** — old sorting field, still in DB but ignored by code |

### Annotations sub-database (inline in each essay)
Each essay page can have an inline database named anything at the bottom:

| Property | Type | Purpose |
|----------|------|---------|
| `Trigger` | title | The exact text (matches Notion orange highlight in the essay) |
| `Label` | rich_text | Small title on the annotation popup (e.g., "Definition") |
| `Body` | rich_text | Popup body text (now supports paragraphs + bullet points via `•`) |
| `Phonetic` | rich_text | Optional (e.g., "/dɪˈfɪnɪʃən/") |
| `Link` | url | Optional external link |
| `Image` | files/url/text | Optional image in the popup |

---

## Pages — Detailed

### 1. `index.html` — Landing Page

**Background:** `#faf8f5` (matches writing page)

**Layout (desktop):**
- Left 50% (fixed): botanical hero with blossom animation — B&W base, color version fades in on 12s cycle (`@keyframes blossom`, color visible ~62.5% of cycle)
- Right 50%: centered intro text (max-width 460px) + credit at bottom

**Layout (mobile <900px):**
- Hero hidden
- Full-width intro
- Hamburger → full-page menu (edge-to-edge, black text centered)
- Credit text `max-width:460px` matches intro's left edge

**Nav:** Fixed top-right — Home, Writing links + email subscribe input.
- Hover: rugged hand-drawn underline sweeps in from left to right (via `#roughline` SVG filter, 0.3s clip-path animation)
- No "Magic" link — the magic page is unlisted, only linked via the PS

**PS line:** *"PS: Don't click this. It's for muggles only."* — "this" is a tie-dye sparkle link that opens `magic.html` in a new tab. Six colored star glyphs animate around the word on hover, and the word itself cycles through tie-dye hues.

**Credit:** "Made with ❤️ by Harry, Nazifa, Om and Claude"

**Hero loader:** Same sunflower fill-up animation as writing/blog pages. Skipped entirely if cached; when shown, holds for 1.5s minimum before fading out.

---

### 2. `writing.html` — Essays Page

**Background:** `#faf8f5`

**Layout (desktop):**
- Left 50%: masonry grid (two explicit columns via flex, not CSS columns)
- Right 50% (fixed): poem heading *"Scribbles about moments / in the in-between spaces, / … / For this is where beauty lies."* with watercolor brush strokes on "in-between" (yellow) and "beauty" (green)

**Layout (mobile <900px):**
- Poem appears first (`order:-1`), then single-column card grid
- `body { display:flex; flex-direction:column }` enables the reorder
- No credit text on this page

**Loading animation:** Sunflower fill-up centered in the left grid via `min-height:100vh`. See "Loading Animation" section.

**Sort order** (client-side in `renderPosts`):
1. **Featured essays** first, sorted by `Feature Order` ascending
2. **Unfeatured essays** by `Published Date` descending

**Column distribution:**
- Featured with odd `Feature Order` → **left column** (top-down)
- Featured with even `Feature Order` → **right column** (top-down)
- Unfeatured essays: distributed to whichever column has **less accumulated height** (`estHeight()` per card type — art ~460, image ~300, text/quote scale with preview length)
- Special rule: when placing an art-only card, avoid stacking within 350px of the previous art in the same column — switch columns if needed

**Card types** (from Notion `Card Type`):

| Type | CSS Class | Clickable | Tape | Notes |
|------|-----------|-----------|------|-------|
| `text` | `.card` | Yes → `/writing/[slug]` | Yes | Color variants |
| `image` | `.card-img` | Yes → `/writing/[slug]` | Yes | `overflow:visible` for tape |
| `art-only` | `.art-card` | No | No | Pure image postcard |
| `quote` | `.card-quote` | No | Yes | With `#fiction` tag |

**Meta line on cards:** `by {author} · {formatted date}` — shows both if present, either alone if only one. Art-only cards skip.

**Tape effect:** Translucent rectangle at `top:-7px`, cycles through 3 positions.

---

### 3. `blog-post.html` — Essay Reader

**Background:** `#faf8f5`

**Clean URLs:** Served at `/writing/:slug` via the `blog-render` Netlify function. The function fetches the essay from Notion (by slug), injects proper OG/Twitter meta tags, and returns the enriched HTML. Client-side JS then loads the content as before.

**Important:** All asset references (images, favicon) inside `blog-post.html` must use **absolute paths** (`/favicon.png`, `/side-art/…`) because the page is served from `/writing/[slug]`.

**Loading animation:** Full-screen sunflower fill-up overlay while content fetches. Fades out when ready.

**Layout (desktop):**
- Max-width 1060px page, content column max-width 540px pushed right (`margin-left:auto`)
- Margin notes positioned absolutely to the left of content (`right:calc(100% + 48px)`)
- Optional **side art** (see below) sits fixed in the empty left area

**Layout (mobile <900px):**
- Full-width content
- Margin notes hidden; tap orange text opens a **bottom sheet** (slide-up)
- Side art hidden

**Annotation system:**
1. Orange-colored text in Notion → detected in `richTextToHTML()`, wrapped as `<span class="a" data-trigger="...">`
2. Inline "Annotations" database at bottom of each Notion page stores popup content
3. Body supports **paragraphs and bullet points** — `formatAnnotationBody()` splits on newlines, groups `•`-prefixed lines into `<ul>`
4. Hover on desktop shows margin note; tap on mobile opens bottom sheet
5. Only one margin note visible at a time (600ms hide delay when moving cursor between text and popup)

**Notion block rendering** (`blocksToHTML`):
- Headings, paragraphs, lists (with dedup of adjacent list wrappers), quotes, dividers, images, callouts (as References box)
- Skips `child_database` blocks
- Pagination via `start_cursor` loop

**Per-post options (Notion):**
- **`Side Art`** (Files & Media): decorative image fixed to left of content column, `mix-blend-mode:multiply` so white bg blends with cream. Falls back to `/side-art/[slug].jpg` local file if Notion field empty. Hidden on mobile.
- **`Compact Spacing`** (checkbox): adds `.compact` class to `.body`, drops `p { margin-bottom }` from 20px to 4px. For poems / list-like posts.

**Footer:** hr, subscribe form, "Made with ❤️" credit, decorative star.

---

### 4. `magic.html` — Interactive Card Trick

**Background:** `#f4f1ec` (warm cream). **No navigation.**

**Smooth dark-mode transition:** clicking "here's" in the magician quote adds `body.reveal-mode` (near-black bg + light text, 0.9s cross-fade). Persists through the reveal branch.

#### Flow (summary — full script in git history)

Main path: welcome → yes/no → intro lines → **first riffle (92ms/card, 3 consecutive force cards)** → "…that was a bit fast" → **second riffle (117ms/card, 2 force cards back-to-back — no doozy between)** → "Got one?" → subconscious framing → 4 image rounds → "I have it." → **card reveal** → "Was this your card?"

**Yes branch** → magician quote with "here's" link → dark mode → "Are you sure?" → red pill → tap-to-play → 40s Wesley Wang clip (pauses on last frame 2s, then fades) → **reveal paragraph** (dark mode) with link to full film → Return to Homepage

**Blue pill (unsure)** → skips video, jumps to final scene
**No branch** → "Then I'm just another muggle computer after all." → final scene
**Click anywhere else on magician quote** → keeps magic alive, jumps to final scene

**Final scene:** "Thanks for letting me in." → **[ Try again ]** [ Return to Homepage ]. "Try again" restarts the trick with a fresh force card and different opening text ("Welcome again." / "You ready for another try?"). Only one retry allowed — subsequent final scenes hide the button.

#### Mechanics

- **Force card:** picked at page load (`pickForce()`) from ranks 2–10, random suit. Rebuilt on Try Again.
- **buildDeck(fc, pattern):** 40-card deck with force cards placed at 60% mark per pattern array.
  - Deck 1: `[true, true, true]` — 3 consecutive
  - Deck 2: `[true, true]` — 2 consecutive (doozy removed)
- **Doozy cards:** random rank/suit with opposite color treatment to make force stand out.
- **Riffle timing:**
  - First: 92ms base + 35ms extra on force = 127ms force / 92ms doozy
  - Second: 117ms base + 55ms extra on force = 172ms force / 117ms doozy
- **Playing card pips:** `pipsHTML(rank, suit)` uses standard playing card layouts. Mobile: 1.5rem riffle, 1.8rem reveal.
- **Procedural images:** `genImg()` uses seeded PRNG (`m32`) with 16 palettes and 12 styles.
- **Countdown bar:** 4px tall, 14px below image grid, animates via `@keyframes countdown` (transform:scaleX) over 2.5s.

#### Scene navigation

- `window.go()` — advance one scene with 500ms fade-out
- `window.goSharp()` — advance with no fade (video → reveal cut)
- `window.goN(n)` — advance n scenes (skip branches)
- `window.enterRevealMode()` — adds `.reveal-mode` for dark theme

---

### 5. `h3ll0.html` — Semi-Private Contact Page

Unlisted contact card at `harrygandhi.com/h3ll0`. `<meta name="robots" content="noindex, nofollow">` so search engines skip it.

**Layout:** Centered card, max-width 420px:
- Circular headshot (`hello-portrait.jpg`, 120px, `filter:sepia(0.85)`)
- "Hi, I'm Harry."
- "Here's where you'll find me."
- Contact rows (each with brand logo SVG + label + handle):
  - **Signal** → signal.me/#eu/harry.1089 (hover: Signal blue #3A76F0)
  - **Email** → mailto:harry.m.gandhi@gmail.com (hover: Gmail red #EA4335)
  - **X / Twitter** → x.com/TheHarryGandhi (hover: black)
  - **LinkedIn** → linkedin.com/in/harrygandhi (hover: LinkedIn blue #0A66C2)
  - **Website** → harrygandhi.com (hover: site orange #c47a3a)
- Footer: "Made with ❤️ by Harry, Nazifa, Om and Claude"

Icon color transitions smoothly (0.2s) on hover; row background tints in the brand color.

**Personal-use QR + wallpapers** (local only, gitignored):
- `hello-qr.png` — 1000x1000 standalone QR for `/h3ll0`
- `lockscreen-light.png` — 1290x2796 iPhone wallpaper (cream bg, dark QR, sunflower motif below)
- Regeneration script at `scratchpad/make_qr_and_wallpapers.py`

---

### 6. `404.html` — Custom 404

Netlify serves this automatically for missing routes.

**Layout (centered, no-scroll):**
- Big "404" (`clamp(64px, 12vh, 128px)` — scales with viewport height)
- Italic subtitle: *"This page seems to live in the in-between."*
- **Butterfly postcard** (`butterfly-new.png`, landscape 1195x880) with 3 pieces of scotch tape (top-left, top-right, bottom-center — same tape style as writing cards)
- **← back home** link (orange with rugged hover)
- Footer: "Made with ❤️"

**No-scroll design:** `html,body { overflow:hidden; height:100dvh }`. All sizes use `clamp()` with `vh` so content scales to any viewport. Image capped at `max-height:34vh` so it always fits.

**Tab title:** `Error 404`

---

### 7. `momentary.html` — "Momentary Notes"

**Status: built and verified locally, NOT yet committed or deployed.** Lives at `/momentary` (Netlify serves `.html` at the extensionless path automatically) and is **linked from the main nav as "Momentary Notes"** on index, writing and blog-post — so unlike magic, this one is meant to be found. Was called `screensaver.html` with the working title "Stillness" through most of its build; both names are gone.

**Background:** `#faf8f5`. Ink `#1a1a1a`, single accent `#c47a3a`. **No nav** (same as magic).

#### The music — generative, not a file

There is no audio file. A Web Audio engine composes continuously, so it never repeats and the page ships zero audio bytes. This was a deliberate call: hosting a real Hideyuki Hashimoto recording (the original reference) on the site would be copyright infringement.

**Reference points (Harry's):** Bertrand Chamayou, Hideyuki Hashimoto, Hania Rani — especially Chamayou's *Song for Octave*. What that shaped, concretely: 46 BPM, a repeating **motif cell** rather than a wandering melody, an **arpeggiated left-hand ostinato** running under the rests, added-9th voicings, and a lot more pedal. Nobody involved can actually listen to the output, so this is "built toward the described characteristics of that repertoire", not a verified resemblance.

- **Voice:** felt-piano approximation — six inharmonic partials (`PARTIALS`), each with its own decay so upper partials die first; lowpass whose cutoff opens with velocity; short filtered noise burst as the hammer. Low notes ring longer (`base = 5.6 * (330/f)^0.40`).
- **Reverb:** procedurally generated impulse response, `makeIR(4.6, 3.1)` — noise with exponential decay and a soft early build. No IR file needed.
- **Pad:** triangle pairs detuned ±6 cents through a slow-LFO lowpass, one per chord.
- **Composition:** D natural minor (`SCALE`, `ROOT = 62`), four progressions, **46 BPM**, 16 pulses (~10.4s) per chord.
- **Motif (`motif`, `newMotif()`):** a cell of 3–5 scale degrees, restated against each chord with variation — a note occasionally dropped, the interval occasionally inverted, sometimes moved an octave. This replaced a random walk, which meandered; repetition-with-variation is what makes the repertoire sound deliberate.
- **Ostinato (`OST_PATTERNS`, `ostOn`):** quarter-note broken chord well below the tune, midi 45–60, low velocity. Deliberately runs *through* the melody's rests — it is what holds the piece together when the right hand stops. On for ~72% of chords so it comes and goes.
- Chord roll reaches a 9th over the top ~45% of the time, for the open colour this music sits in.
- **Scheduling:** standard lookahead scheduler — `setInterval` 200ms, 1.7s horizon, so tab throttling can't cause gaps. Re-anchors if the clock runs away.

#### The breath (cycles)

Every 20–24 chords (~3.1–3.7 min) the music stops completely so the paper returns to a clean slate.

1. Last chord rings for 1.5s, then `damp` ramps it to true zero by `TAIL_SEC` (3.0s).
2. **`QUIET_MIN`/`QUIET_MAX` (9.5–13)** of held silence. Measured: **13.2s**, peak `2.4e-4`.
3. The figure dissolves over the first three quarters of the silence and the sheet sits blank for the last quarter. Measured: a smooth monotonic ramp over **11.5s**, darkest pixel 209 → 250, ending at exactly the cream reference.
4. Music returns on a 12s warm-up curve (`warmSpan`).

**The dissolve is done at blit time, not on the canvas** (`dissolveNow()` → `ctx.globalAlpha` on the flattened wedge, smoothstep). This matters: an alpha fade is multiplicative, so ink lands on 1/255 and sits there as a ghost — fading the canvas alone produced `0.63 → 0.52` then an instant snap to blank when the hard clear landed. The canvas fade still runs underneath (it keeps the layers from saturating), and the hard clear still fires, but by then the figure is already drawn at zero opacity so it is invisible.

**`damp` sits AFTER the convolver** — that placement is the whole trick. Damping before it would leave a 4.6s reverb tail running into the "silence".

#### Optional audio file slot

`const AUDIO_FILE = null` at the top of the script. Set it to a path and the engine is bypassed: the file plays through a `MediaElementSource` → `AnalyserNode`, and the visuals are driven by spectral-flux onset detection instead of note events. Same visual vocabulary either way. `FILE_LOOP` controls looping.

#### The visualiser

Pitch class → angle within the wedge; pitch height → radius. The same note always lands in the same place, so a repeated phrase redraws over itself and the figure rhymes with the music.

- **Kaleidoscope:** everything is drawn into narrow wedge canvases of size `R`, then blitted around the circle rotated **and** mirrored with `multiply` blending — `2 × SEG` blits per frame. Ink darkens where copies overlap, like overlapping washes.
- **Two ink layers.** `wedgeA` holds marks worth keeping (bass, chord tones, melody at velocity ≥ 0.46); `wedgeB` holds the incidental ones (quiet off-beat notes, bells, the ostinato, the orbiter tracery) and fades `FLEETING` (4.5×) faster. So the figure keeps its bones while its surface keeps moving. They are flattened into `wedgeC` once per frame, which keeps the blit count identical to the single-layer version. Measured separation: mean layer alpha 0.81 vs 0.13. The module-level `wc` is a *pointer* to whichever context is current — `stamp()` sets it per note, the frame loop sets it around `drawPulses`/`drawOrbiters`.
- **Gestures** (chosen by `pc % 4`, so each pitch class always draws the same shape): concentric ring, seam-to-seam chevron, spoke, faceted cell. Gestures deliberately touch the mirror seams (angle 0 and `wedgeAngle`) so they join up across copies — that is what makes it read as one figure rather than marks scattered in a pie slice.
- **Orbiters:** 4–7 slow points tracing Lissajous figures in polar space, drawing a hairline each frame. These build the fine guilloche lattice between note stamps. All ink.
- **Pulses:** expanding rings on bass notes. Linear expansion (an ease-out made them decelerate into the rim and pile up a visible ring over a long cycle).
- **`SPIN = 0`** — global rotation is currently OFF. Was `0.031` rad/s. Holding it still means every stroke lands on the same spot each time, so the lattice reads crisp rather than smeared. One constant to bring it back.
- **`R`** = `0.38 × min(W,H)` landscape, `min(W*0.50, H*0.32)` portrait — deliberately small, for white space at the edges.
- Paper grain (static noise tile, multiply) + soft vignette over the top.

#### No intro screen

The page opens straight onto the patterns. **Consequence: there is no user gesture, so browsers block audio.** Handled by starting the context anyway, drawing the patterns regardless, showing the play triangle honestly, and resuming on the first `pointerdown`/`keydown`/`wheel`/`touchstart` anywhere. Opening master fade is 8s and the composition warms up over 28s (`warmSpan`) so it arrives rather than switching on.

#### Chrome (fades after idle — 11s first time, 3.8s after)

- **Bottom left:** the transport (play/pause + volume), at the very bottom.
- **Right, about a sixth of the way up** (`bottom: max(16vh, 96px)`): three italic paragraphs — one crediting the reference artists, one on the music being momentary, and a closing line on its own — with "← Take me back" → `/` beneath them. The three artist names link out to their sites in new tabs (`bertrand-chamayou.com/en/`, `hideyukihashimoto.com`, `haniarani.com`), styled as inherited-colour text with a faint underline that goes orange on hover.
- Under 640px the two corners would collide, so the words sit above the transport and everything goes left-aligned.
- **Transport:** play/pause + volume bar (speaker glyph + orange fill). Play button is modelled on [Bailey Latimer's "Pulsing Play Button"](https://codepen.io/baileylatimer/pen/gOPWKZo) — a 32px filled ink disc with the glyph knocked out in cream, plus a second disc of the same colour behind it scaling `1 → 1.5` while fading `1 → 0` (`@keyframes pulse-border`, 1500ms ease-out). **The pulse only runs while audio is blocked**, never once playing, so it never invites a click that does nothing.
- Keyboard: `space` = play/pause, `f` = fullscreen (no button for it).

---

## Serverless Functions (`netlify/functions/`)

### `notion.js` — Notion API proxy

Routes:
| Endpoint | Action |
|----------|--------|
| `POST /api/notion/database` | Query main blog database (Published only) |
| `POST /api/notion/database/:id` | Query inline database (annotations) |
| `GET /api/notion/page/:id` | Get page metadata |
| `GET /api/notion/blocks/:id` | Get child blocks (paginated) |

Env vars: `NOTION_API_KEY`, `NOTION_DATABASE_ID`

### `blog-render.js` — SSR meta tag injection for /writing/:slug

- Extracts slug from URL path
- Queries Notion by slug for the essay
- Fetches `blog-post.html` template via HTTPS
- **Strips any existing OG/twitter/description meta tags** (prevents duplicates from overriding)
- Injects fresh title, description, og:image, twitter:card meta tags
- Defaults `og:image` to `/og-image.png` (shrubbery) so every share preview has the same rich image; Notion `Card Image` overrides per essay
- 5-minute cache for reasonable propagation

Result: shared blog post URLs on WhatsApp/iMessage/Telegram/Slack show the essay title + preview + shrubbery image.

---

## Shared Patterns

**Nav:**
- Home + Writing links + subscribe form
- Home + Writing + **Momentary Notes** links, then the subscribe form
- Fixed-position on home and writing pages; normal flow on blog-post; **no nav on magic or momentary** (the pages themselves are chrome-free)
- **`blog-post.html` nav links must be absolute** (`/index.html`, not `index.html`) — it is served from `/writing/[slug]`, so relative links resolve inside `/writing/`
- Hides on scroll down, shows on scroll up
- Hover: hand-drawn underline sweep (uses `#roughline` SVG filter)
- Mobile: hamburger → full-page overlay, edge-to-edge, links centered

**Mobile hamburger:** 3 spans → animates to X on `.open`. `nav.menu-open` covers viewport with z-index:100.

**MailerLite subscribe:** Same API key/group across pages. `subscribe(inputId)` POSTs email to `connect.mailerlite.com/api/subscribers`.

**Favicon:** `favicon.png` (transparent sunflower). Blog-post uses absolute path `/favicon.png`.

**Font:** Brygada 1918 from Google Fonts (weights 400–700, italic variants).

**OG image:** `og-image.png` (1200x630, cropped from shrubbery-color.png). Used by index, writing, and (by default) all blog posts.

**SVG filters (used across pages):**
- `#watercolor` — soft brush-stroke effect on "in-between" and "beauty" (writing page)
- `#roughline` — thin hand-drawn wobble for nav underlines + intro link hovers

---

## Loading Animation (writing + blog-post pages)

Two stacked sunflower images (`justsunflower-bw.png` base, `justsunflower-color.png` overlay). Color layer uses animated `clip-path` for bottom-up fill.

```css
@keyframes fillUp {
  0%, 8% { clip-path: inset(100% 0 0 0); }
  85%, 100% { clip-path: inset(0 0 0 0); }
}
```

Pattern (2.8s loop):
1. ~0.22s grey hold
2. ~2.16s color fills up
3. ~0.42s color hold
4. Instant snap back to grey at loop boundary → repeat

Home page uses the same sunflower asset with **1.5s minimum display** if shown, or **skipped entirely if hero images are cached**.

---

## Design Decisions & Gotchas

- **No CSS framework**, no build step — plain HTML/CSS/JS inline styles
- **Mobile breakpoint:** 900px (magic page also has 500px for card sizing)
- **Touch targets:** 44px minimum on mobile
- **Card masonry:** two explicit flex columns (not CSS `column-count`) so we can custom-place featured essays and balance heights
- **Color palette:** cream `#faf8f5` (bg), ink `#1a1a1a` (text), orange accent `#c47a3a`, `#EAE9E7` (h3ll0/404 bg)
- **Blog post clean URLs:** `/writing/:slug` via Netlify rewrite → `blog-render` function
- **Absolute paths in blog-post.html** required because served from `/writing/[slug]`
- **Favicon caching:** browsers cache aggressively — hard refresh (Ctrl+Shift+R) or incognito after updates
- **Notion file URLs** are AWS S3 signed and expire ~1 hour after generation. Handled correctly because JS refetches on every page load, but this is why the shared OG image is served from our own domain (never expires)
- **WhatsApp/social preview caching:** platforms cache previews for days — a bad initial share sticks until cache expires. Add `?v=1` to bypass, or wait

### Canvas + Web Audio gotchas (learned building Momentary Notes)

- **`destination-out` fading never reaches zero.** Fading a canvas by filling with `rgba(0,0,0,α)` in `destination-out` is multiplicative on the alpha channel, so it plateaus at 1/255 and leaves a permanent ghost. Anything drawn under an old symmetry then gets re-tiled at the new sector width and shows as pale wedges. Fix: ramp the fade rate up, then `clearRect` once at a moment the clear is invisible.
- **Autoplay needs a gesture.** Any page without a click-through opens with a suspended `AudioContext`. Don't assume it is running — reflect the real state in the UI and resume on first interaction. `resume()` is async, so wait ~900ms before concluding it was refused, or the UI flashes.
- **Browsers restore form values across reloads.** A `<input type="range">` came back at the viewer's old value while the JS variable held the default, so the page played at one volume while the slider showed another. `autocomplete="off"` plus setting `.value` from JS at boot.
- **A canvas alpha fade cannot reach zero.** `destination-out` is multiplicative, so ink plateaus at 1/255 and stays as a visible ghost — the figure appears to fade a little, then jump-cut when you finally clear it. If you need a real fade to the background, do it at draw time with `globalAlpha` on the composited result, where the value reaches zero exactly.
- **Anything drawn every frame accumulates into a wash.** Continuously drawn coloured elements (orbiters, slowly-expanding rings) build up into visible colour films over a multi-minute cycle, even at very low alpha. Discrete one-shot marks don't. Keep continuous elements neutral; save colour for stamps.
- **Ease-out expansion piles up at the end.** An expanding ring with `1 - (1-u)^n` decelerates into its final radius and deposits a dense ring there. Linear expansion never lingers.
- **Pause must freeze the visuals too**, or the animation keeps drawing and fading in silence. Gate on a `userPaused` flag, not on audio state — audio can be suspended simply because it hasn't been unlocked yet.

---

## Pending Future Work (discussed, not done)

- **Commit and deploy `momentary.html`** — built, working, and already wired into the nav, but still uncommitted. Open questions Harry may want to revisit: the label reads "Take me back" (he once wrote "Take me home"); the play disc is filled all the time rather than only while pulsing; with sound blocked a first-time visitor sees a nearly blank page until they click, since no notes means no ink; and with `SPIN = 0` the orange bass spines now land in the same place every cycle and accumulate into four strong radial lines, where rotation used to smear them.
- **Tag-based filtering** on writing page (Notion `Tags` multi-select + filter chips)
- **Multi-image hero animation** on home (cycle through 4 color variants — currently just B&W↔color pair)
- **Zapier auto-email** integration
- **MailerLite welcome email** automation
- **"Try again" button on magic finalS** — was discussed but never landed (only the slower riffle + doozy removal shipped from that round). Details: pick new force card, reset scene index to 0, use "Welcome again." / "You ready for another try?" for scenes 0 and 1 based on `attemptCount` counter. Only one retry allowed. Change `const forceCard`/`const deck1`/`const deck2` to `let` to support reassignment.

---

## Recently Completed (rough reverse chronological)

- **`momentary.html`** — "Momentary Notes", generative music + ink kaleidoscope; added to the main nav (uncommitted; see section 7)
- **Fixed broken nav links on essay pages** — `blog-post.html` is served at `/writing/:slug` with no `<base>`, so its relative `index.html` / `writing.html` nav links resolved to `/writing/index.html` and `/writing/writing.html`, both 404. Now absolute. Pre-existing bug, found while adding the new nav item
- Second riffle: dropped doozy between force cards (`[true, false, true]` → `[true, true]`)
- Slowed riffle timing (+12ms each)
- Annotation body supports paragraphs + bullet points via `formatAnnotationBody()`
- Compact Spacing checkbox for poems (tighter paragraph margins)
- Per-essay Side Art (Notion Files field + local `/side-art/[slug].jpg` fallback)
- Writing page heading: "Writings" → "Scribbles"
- Blog post OG image defaults to shrubbery (was often blank)
- Home page mobile footer alignment + rugged underline hover on intro links
- Prevent art cards from stacking in same column
- Published dates added to writing grid cards
- Featured + Feature Order sorting with odd-left/even-right column placement
- Contact page (`/h3ll0`) with brand-tinted hover states + SVG logos
- 404 page with butterfly postcard, no-scroll layout, taped edges
- Rename `/hello-a7c2f` → `/h3ll0`
- Semi-private contact page + local QR + iPhone wallpapers (personal use)

---

## Git History (recent 30, newest first)

```
9d87fff Second riffle: drop the doozy between the two force cards
679f9c0 Magic trick: slower riffle + Try again button on final scene
a5132de Support bullet points and paragraphs in annotation bodies
af5d39a Add per-post Compact Spacing toggle for poems
77054ed Add optional per-essay side art to blog posts
0ae2473 Change writing page heading from "Writings" to "Scribbles"
1c1b5d3 Blog post share previews now always include the shrubbery OG image
cdf9432 Home page polish: mobile footer alignment + link hover underline
cf6e896 Prevent art cards from stacking in the same column (fix)
7b84d80 Add published dates to cards and avoid art-card adjacency
c86b8c2 Balance writing columns by estimated card heights, not card counts
01a2af8 Sort writing page by Featured + Feature Order, then Published Date
e64994f Add brand-colored logos and footers to contact & 404 pages
00f0751 Fix 404 alignment — center postcard and back-home link cleanly
77cc9cf No-scroll 404 that scales to any viewport
4232f99 Replace 404 image with landscape butterfly-new, add third piece of tape
cc76a1c Add on-brand 404 page
6b15934 Rename /hello-a7c2f -> /h3ll0, drop WhatsApp, add Website button
c9ae1b5 Remove "Nice to meet you." line from /hello page
8881706 Add sepia filter to /hello contact page portrait
5e4f98f Remove QR and lock screen wallpapers from the deployed site
e5ef9ea Add semi-private /hello-a7c2f contact page + QR wallpapers
51fd879 Update home page PS line — magic trick reverse psychology
e398e2a Swap OG image to shrubbery, update meta descriptions and magic page title
ccf249e Add OG image for site homepage and writing page
720b655 Hold hero loader for 1.5s minimum when shown; skip entirely if cached
5d8ed01 Add sunflower loader overlay to home page hero
8c6201e Strip fallback OG tags before injecting per-essay ones
bba8d8b Drop " — Harry Gandhi" suffix from shared link previews
4bc052c Render proper OG meta tags for shared blog post URLs
```

Full log via `git log --oneline`.

---

## For Future Me

- Site is stable, well-tested across mobile/desktop
- All aesthetic decisions have been made and iterated on — cream bg, Brygada 1918, orange accent, botanical/scrapbook feel
- The user (Harry) iterates in small batches — expect several rounds of "let me see" then "let's tweak X"
- Always offer to preview locally before pushing when the change is visible
- Server-side Netlify Function changes aren't observable in Python http.server previews — verify via `curl` after deploy
- Favicon and OG image previews cache aggressively — mention this when relevant
- Keep other pending working-tree changes (favicon.png, hak file deletions, .claude/) untouched during commits — commit only what was intentionally changed
- Momentary Notes went through many aesthetic rounds. Things Harry rejected along the way, so don't re-propose them: cartoonish nature drawings in SVG; coloured ink blotches in the card hues (they read as "faded stains"); a bare outline ring pulsing around the play button. What he liked: abstract geometric kaleidoscope line-work, cream paper with dark ink only, and the filled-disc play button from the CodePen reference
- For anything canvas- or audio-timed, measure rather than eyeball — tap an `AnalyserNode` for real output level and sample `getImageData` luminance for "is the page actually blank". Several bugs on that page only showed up as numbers (silence that was 9.7s instead of 5–7s; a canvas that stalled at 249.6 instead of 250)
- The in-app browser pane's fps readings drop hard while it is capturing screenshots — don't trust a low number taken alongside screenshot calls; re-measure on its own
