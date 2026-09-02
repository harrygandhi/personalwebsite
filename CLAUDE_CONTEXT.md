# Harry Gandhi Personal Website — Context Document

*Last updated: 2026-08-25*

## Overview

Personal blog/portfolio at **harrygandhi.com**. Static HTML site with Notion as CMS, deployed via Netlify with auto-deploy from GitHub. Font: Brygada 1918. Favicon: custom sunflower PNG (transparent background).

Six pages:
1. **`index.html`** — Home / landing page with bio + botanical hero
2. **`writing.html`** — Essays masonry grid + poem
3. **`blog-post.html`** — Individual essay reader, served at clean URLs `/writing/[slug]`
4. **`magic.html`** — Interactive card trick + Wesley Wang film reveal
5. **`h3ll0.html`** — Semi-private (unlisted) contact page at `/h3ll0`
6. **`404.html`** — Custom 404 page (butterfly postcard)

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
- `.claude/launch.json` has "Netlify Dev" preconfigured

---

## File Structure

```
Personal Website/
  index.html                       # Landing/home page
  writing.html                     # Essays/writing page
  blog-post.html                   # Individual essay reader (served at /writing/:slug)
  magic.html                       # Interactive card trick (standalone, no nav)
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
- Fixed-position on home and writing pages; normal flow on blog-post; **no nav on magic**
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

---

## Pending Future Work (discussed, not done)

- **Tag-based filtering** on writing page (Notion `Tags` multi-select + filter chips)
- **Multi-image hero animation** on home (cycle through 4 color variants — currently just B&W↔color pair)
- **Zapier auto-email** integration
- **MailerLite welcome email** automation
- **"Try again" button on magic finalS** — was discussed but never landed (only the slower riffle + doozy removal shipped from that round). Details: pick new force card, reset scene index to 0, use "Welcome again." / "You ready for another try?" for scenes 0 and 1 based on `attemptCount` counter. Only one retry allowed. Change `const forceCard`/`const deck1`/`const deck2` to `let` to support reassignment.

---

## Recently Completed (rough reverse chronological)

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
