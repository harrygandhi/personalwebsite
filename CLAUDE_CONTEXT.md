# Harry Gandhi Personal Website — Context Document

*Last updated: 2026-05-02 (post-riffle slowdown + hero refresh + poem text)*

## Overview

Personal blog/portfolio at **harrygandhi.com**. Static HTML site with Notion as CMS, deployed via Netlify with auto-deploy from GitHub. Font: Brygada 1918. Favicon: custom sunflower PNG (transparent background).

The site currently has four pages:
1. **`index.html`** — Landing page with bio and blossom hero animation
2. **`writing.html`** — Essays/poem masonry grid with sunflower loading animation
3. **`blog-post.html`** — Individual essay reader, served at clean URLs `/writing/[slug]`
4. **`magic.html`** — Interactive card trick with optional "red pill" reveal branch

---

## Infrastructure

| Layer | Detail |
|-------|--------|
| **GitHub** | `https://github.com/harrygandhi/personalwebsite.git` (branch: `main`) |
| **Hosting** | Netlify (auto-deploys on push to `main`) |
| **Domain** | harrygandhi.com (Netlify DNS; nameservers at Bluehost: `dns1-4.p04.nsone.net`) |
| **CMS** | Notion API (key + database ID stored as Netlify env vars: `NOTION_API_KEY`, `NOTION_DATABASE_ID`) |
| **Email** | MailerLite (API key + group ID hardcoded in each HTML file) |
| **Serverless** | Netlify Functions at `netlify/functions/notion.js` — proxies Notion API |

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
  to = "/blog-post.html"
  status = 200
```

### Local Development
- `python -m http.server 8000` from project root, then open `http://localhost:8000/...`
- For Notion-backed pages, you need `netlify dev` (`npx netlify dev`) to proxy `/api/notion/*` to the serverless function
- The magic page is fully client-side and works with the simple Python server

---

## File Structure

```
Personal Website/
  index.html                       # Landing/home page
  writing.html                     # Essays/writing page
  blog-post.html                   # Individual essay reader (served at /writing/:slug)
  magic.html                       # Interactive card trick (standalone, no nav)
  magic-clip.mp4                   # 40s trimmed clip of Wesley Wang's film (3.4 MB, 720p)
  netlify.toml                     # Netlify build/redirect config
  netlify/
    functions/
      notion.js                    # Serverless Notion API proxy
  favicon.png                      # Sunflower favicon (transparent)
  sunflowerfavicon.png             # Source favicon image
  hero-bw.png.png                  # B&W botanical illustrations (homepage)
  hero-color.png.png               # Color botanical illustrations (blossom animation)
  justsunflower-bw.png             # B&W sunflower (loading animation)
  justsunflower-color.png          # Color sunflower (loading animation)
  hak1-8.jpeg/jpg                  # Hilma af Klint art images (writing page demo)
  sunflower-*.png                  # Unused legacy sunflower images
  .gitignore                       # Excludes full 139MB source video
  CLAUDE_CONTEXT.md                # This file
  Personal Website Setup Guide.md  # Original setup notes
```

---

## Pages — Detailed

### 1. `index.html` — Landing Page

**Background:** `#ece8e2` (warm beige)

**Layout (desktop):**
- Left 50% (fixed): Botanical illustration hero with blossom animation — B&W base, color version fades in on 12s `@keyframes blossom` loop. Current illustrations feature anemone, lily of valley, butterfly, alnus, and esoteric circular diagrams (updated 2026-05-02; replaced the earlier hero showing red clover/brown knapweed/digitalis purpurea).
- Right 50%: Centered intro text (max-width 460px) with credit text absolutely positioned at bottom, left-aligned with intro

**Layout (mobile, <900px):**
- Hero hidden (`display:none` on `.left-hero`)
- Full-width intro
- Hamburger menu (edge-to-edge, subscribe input hidden)
- Credit text stretches to full width, left-aligned

**Nav:** Fixed top-right with `Home`, `Writing`, `Magic` links + email subscribe form. Auto-hides on scroll down, returns on scroll up.

**Bio mentions:** Lumen Labs, 1517 Fund, contact email. Ends with "PS: Want to see a **magic trick**?" with 60px top margin separating it from the bio.

**Credit:** "Made with ❤️ by Harry, Nazifa, Om and Claude" — left-aligned with intro paragraph.

---

### 2. `writing.html` — Essays Page

**Background:** `#faf8f5` (off-white)

**Layout (desktop):**
- Left 50%: Scrollable masonry grid of essay cards
- Right 50% (fixed): Poem text with watercolor brush stroke highlights (SVG filter with feTurbulence/feDisplacementMap)

**Layout (mobile, <900px):**
- Poem appears first (`order:-1`), then single-column grid (`order:1`)
- Body uses `display:flex;flex-direction:column` for the reorder
- No credit text on this page

**Loading animation:** Sunflower fill-up (see "Loading Animation" section below) vertically and horizontally centered in the left grid via `min-height:100vh`.

**Poem opening line:** "Writings about moments in the in-between spaces," (updated 2026-05-02 from the previous "I write about moments in...").

**Card types** (from Notion `Card Type` property):

| Type | Class | Clickable | Tape | Notes |
|------|-------|-----------|------|-------|
| `text` | `.card` | Yes → `/writing/[slug]` | Yes | Color variants: sage/rose/gold/lavender |
| `image` | `.card-img` | Yes → `/writing/[slug]` | Yes | `overflow:visible` so tape shows |
| `art-only` | `.art-card` | No | No | Pure image postcard |
| `quote` | `.card-quote` | No | Yes | Poem/quote with `#fiction` tag |

**Tape effect:** Translucent rectangle (`rgba(200,190,170,0.4)`) at `top:-7px`, cycling through 3 positions/rotations.

**Notion database properties:**
- `Title` (title), `Slug` (rich_text), `Preview` (rich_text), `Author` (rich_text)
- `Card Type` (select), `Card Color` (select), `Card Image` (files)
- `Status` (select) — must be "Published" to appear
- `Order` (number) — sort ascending

---

### 3. `blog-post.html` — Essay Reader

**Background:** `#faf8f5`

**Clean URLs:** Served at `/writing/:slug` via Netlify rewrite. JS parses slug from `window.location.pathname`, queries the Notion database to find the matching page ID, then fetches page metadata and blocks.

**Important:** Because pages are served from `/writing/[slug]`, all asset references inside `blog-post.html` must use **absolute paths** (e.g. `/favicon.png`, `/justsunflower-bw.png`). Relative paths would resolve to `/writing/...` and break.

**Loading animation:** Full-screen sunflower fill-up animation (`position:fixed`, centered) overlaid on the page. Fades out (0.6s opacity transition) once content is rendered. Footer/subscribe/star hidden until then.

**Layout (desktop):**
- Max-width 1060px page, content column max-width 540px pushed right
- Margin notes positioned absolutely to the left of content (`right:calc(100% + 48px)`)

**Layout (mobile, <900px):**
- Full-width content
- Margin notes hidden; tap on orange-highlighted text opens a slide-up **bottom sheet**

**Annotation system:**
1. In Notion, orange-colored text becomes annotation triggers
2. `richTextToHTML()` groups consecutive orange segments into `<span class="a" data-trigger="...">`
3. An inline database named "Annotations" at the bottom of each Notion page provides the popup content
4. Database columns: `Trigger` (title), `Label` (text), `Body` (text), `Phonetic` (text), `Link` (url), `Image` (files/url/text)
5. `fetchAnnotations()` queries via `/api/notion/database/{dbId}`
6. `wireUpAnnotations()` creates margin note elements and wires hover (desktop) / click (mobile) handlers

**Desktop annotation behavior:**
- Hover orange text → margin note fades in at the same Y-position
- Mouse can move to the note (600ms hide delay)
- Only one note shown at a time

**Mobile annotation behavior:**
- Tap orange text → overlay slides up from bottom
- White card with rounded top corners on semi-transparent backdrop
- Body scroll locked while open
- Dismiss via X button or backdrop tap

**Notion block rendering** (`blocksToHTML`):
- `heading_1/2` → `<h2>`, `heading_3` → `<h3>`
- `paragraph` → `<p>`
- `bulleted/numbered_list_item` → `<ul>/<ol>` (adjacent wrappers deduped)
- `quote` → `<blockquote>` with orange left border
- `divider` → `<hr>`
- `image` → `<img>`
- `callout` → renders as `.refs` box (used for "References & Inspiration")
- `child_database` → skipped (handled separately for annotations)
- Pagination: `start_cursor` loop fetches all blocks

**Footer:** `<hr>` divider, subscribe form, "Made with ❤️" credit, decorative star.

---

### 4. `magic.html` — Interactive Card Trick

**Background:** `#f4f1ec` (warm beige). **No navigation bar** — standalone fullscreen experience.

**Smooth dark-mode transition:** When the user enters the reveal branch (clicks "here's" in the magician quote), `body.reveal-mode` is added, swapping CSS variables for a near-black background and light text. Transition is 0.9s on `background` + `color`.

#### Flow

**Main path:**
1. `"Welcome. I've been waiting for you."` (click to advance)
2. `"You ready for a magic trick?"` — [Yes] [No]
3. `"I'm going to attempt something no computer has ever done before."`
4. `"We're going to have a little fun with your subconscious — and reveal how it shapes the choices you make."`
5. `"In a moment, I'll riffle through a deck of cards. Your job: pick one."`
6. `"Ready?"`
7. `"Here goes."` (auto-advance 1.8s)
8. **First riffle** — 75ms/card, 40-card deck, 3 consecutive force cards at the 60% mark
9. `"...that was a bit fast, wasn't it?"`
10. `"Let me try again. Watch closely."` (auto-advance 2.2s)
11. **Second riffle** — 95ms/card, pattern at 60% mark: **force, doozy, force** (two distinct sightings of the same card with a brief doozy between them)
12. `"Got one?"`
13. `"Remember your card."`
14. `"What fascinates me about the mind is how deeply its subconscious is woven into the fabric of reality."`
15. `"So I'm going to read it — and guess the card you chose."`
16. `"I'll show you a few images. Pick the one that speaks to you."`
17. `"Choose quickly — we want your subconscious, not your conscious mind, doing the work."`
18. **4 rounds of procedurally generated images** with countdown bar
19. `"Fascinating. Your choices tell me a lot about you."`
20. `"You have a beautiful mind — and it tells me the kind of card you'd choose."`
21. `"I have it."` (auto-advance 2.5s)
22. **Card reveal animation** + `"Was this your card?"` — [Yes — how did you do that?] [No — you missed it.]

**Branch A — User says No:**
- `"Then I'm just another muggle computer after all."` → jumps to final scene via `goN(4)`

**Branch B — User says Yes (the threshold):**
- `"A magician never reveals their secrets — but if you really want to know, [here's] how it works."` *(with hint: "or click anywhere else to keep the magic alive")*
- **B1 — Click anywhere besides "here's":** jumps to final scene
- **B2 — Click "here's":** triggers `enterRevealMode()` → background fades to dark over 0.9s

**Reveal branch (after clicking "here's"):**
- `"Are you sure? Once you see the reveal, you can't unsee it."` — [Yes, give me this forbidden knowledge.] [Nope, I'll stay in blissful ignorance.]
- **Blue pill:** jumps to final scene via `goN(3)` (still in dark mode)
- **Red pill:** advances to video scene

**Video scene (full-screen, dark):**
- Tap-to-play gate with "Watch closely." + play icon (no fade — sharp cut on play)
- 40-second clip from Wesley Wang's "nothing, except everything." — opens with the "1 in 3 people pick 7" force demonstration
- No controls, no scrubbing
- At **39.5 seconds** the video pauses on the last frame
- Holds for 2 seconds, then scene fades to reveal paragraph

**Reveal paragraph (scrollable scene in dark mode):**
```
One in three? Not one in ten?

This is because of something magicians call the force — the same tactic used
to give you the illusion of choice in my magic trick. Your card was decided
before you ever began — placed in the deck three times, each appearance held
on screen a fraction longer than the others. Just long enough for your eye
to catch it, and your mind to claim it as a choice.

The images, the rounds, the talk of subconscious patterns? Theater. Or, in
magic, we call it misdirection.

The interesting question isn't how the trick works. It's how often it works
elsewhere — in the partner you "chose," the career you "fell into," the next
thing you're about to do.

Free will is real. But it's rarer and quieter than we think.

If this resonated, watch Wesley Wang's full film here.

[Return to Homepage]
```

The "here" link opens the full YouTube video in a new tab.

**Final scene (all paths except the red-pill terminal):**
- `"Thanks for letting me in."` — [Return to Homepage]

**Decline path (user says "No" at the start):**
- `"A pity. We were going to have some fun with your mind — and your free will. But the choice, of course, is yours."` — [Return to Trick] [Return to Homepage]

#### Magic trick mechanics

**The force:** `pickForce()` chooses a random card (rank 2–10) at page load. `buildDeck(forceCard, pattern)` constructs a 40-card deck with force cards placed at the 60% mark according to a pattern array:
- **Deck 1** (first riffle): `[true, true, true]` — 3 consecutive forces
- **Deck 2** (second riffle): `[true, false, true]` — force, doozy, force (gap creates two distinct impressions)

**Doozy cards:** `doozy()` generates random rank/suit with the **opposite** color treatment so the force card visually pops.

**Riffle timing:** Cards fade in/out with longer hold times on force cards:
- First riffle: 80ms base + 35ms extra for force = 115ms force / 80ms doozy
- Second riffle: 105ms base + 55ms extra for force = 160ms force / 105ms doozy

**Playing card pips:** `pipsHTML(rank, suit)` renders the correct number of suit symbols in standard playing card layouts. `PIP_POS` defines `[left%, top%, flipped?]` arrays for ranks 1–10. Face cards (A, J, Q, K) fall back to a single large center suit symbol.

**Pip sizes:**
- Desktop: 1.9rem (riffle), 2.3rem (reveal card)
- Mobile: 1.5rem (riffle), 1.8rem (reveal card)

**Procedurally generated images:** `genImg(cv, seed)` uses a seeded PRNG (`m32`) with **16 color palettes** and **12 generation styles**: flowing curves, concentric circles, geometric shapes, radial blobs, mirrored ellipses, interference patterns, organic blobs, diagonal stripes, layered circle grids, spirograph curves, voronoi cells, layered waves. Each round shows 4 unique images with a 2.5-second countdown.

**Countdown bar:** 4px tall track 14px below the image grid, animates via `@keyframes countdown` using `transform: scaleX(1)` → `scaleX(0)` over 2.5s.

#### Scene navigation system

- `window.go()` — advance one scene with standard 500ms fade-out
- `window.goSharp()` — advance one scene with no fade (used for cinematic cuts)
- `window.goN(n)` — advance n scenes (used to skip branch scenes)
- `window.enterRevealMode()` — adds `.reveal-mode` class to body for dark mode

---

## Serverless Proxy (`netlify/functions/notion.js`)

Proxies Notion API requests with CORS headers. Routes:

| Endpoint | Action |
|----------|--------|
| `POST /api/notion/database` | Query main blog database (Published, sorted by Order) |
| `POST /api/notion/database/:id` | Query inline database by ID (for annotations) |
| `GET /api/notion/page/:id` | Get page metadata |
| `GET /api/notion/blocks/:id` | Get child blocks (supports `?start_cursor=` pagination) |

Environment variables (in Netlify dashboard):
- `NOTION_API_KEY` — Notion integration token
- `NOTION_DATABASE_ID` — Main blog database ID

---

## Shared Patterns Across Pages

**Nav:** Home / Writing / Magic / subscribe input + button.
- Fixed-position on home and writing pages, hides on scroll down
- Normal flow on blog-post (no fixed-position nav)
- Magic page has **no nav** at all

**Hamburger menu (mobile):** 3-span button animates to X on `.open`. Nav gets translucent background. Subscribe input hidden on mobile (`display:none !important`).

**MailerLite:** Same API key/group ID on all pages. `subscribe(inputId)` POSTs to `https://connect.mailerlite.com/api/subscribers`.

**Favicon:** `favicon.png` (transparent sunflower). Blog-post.html uses absolute path `/favicon.png`.

**Font:** Brygada 1918 from Google Fonts (weights 400–700, with italic).

---

## Loading Animation (writing.html and blog-post.html)

Two stacked sunflower images (`justsunflower-bw.png` base, `justsunflower-color.png` overlay). The color overlay uses an animated `clip-path` to create a "fill up from the bottom" effect.

**Current keyframes** (after the "no drain" refactor):

```css
@keyframes fillUp {
  0%, 8% { clip-path: inset(100% 0 0 0); }   /* hold grey at start of cycle */
  85%, 100% { clip-path: inset(0 0 0 0); }   /* fill up, hold full color */
}
```

**Pattern user sees** (2.8s loop):
1. ~0.22s grey hold
2. ~2.16s color fills up from bottom
3. ~0.42s full color hold
4. **Instant snap** back to grey at the loop boundary
5. Repeat

Previous behavior used a "drain down" return (clip-path reversing); the new version replaces it with an instant snap-to-grey, which is more cinematic and avoids the inverse-fill effect.

---

## Design Decisions & Known Details

- **No CSS framework** — all styles inline in each HTML file's `<style>` block
- **No build step** — plain HTML/CSS/JS served directly
- **Mobile breakpoints:** 900px (most pages), 500px (magic page card sizing)
- **Touch targets:** 44px minimum on mobile nav links and buttons
- **Card masonry:** CSS `column-count` — fills left column first, then right
- **Color palette:** Orange accent `#c47a3a`, beige bg `#ece8e2` (home) / off-white `#faf8f5` (writing/blog), warm `#f4f1ec` (magic light mode), near-black `#0a0a0a` (magic dark mode), text `#1a1a1a`
- **Tape on image cards** requires `overflow:visible` (was previously clipped by `overflow:hidden`)
- **Writing page** has no credit text (removed intentionally)
- **Home page credit** is left-aligned with intro using `left:50%;transform:translateX(-50%);max-width:460px`
- **Blog post nav** is not fixed (normal document flow)
- **Blog post clean URLs:** `/writing/:slug` via Netlify rewrite. JS looks up slug → page ID via DB query.
- **Absolute paths in blog-post.html** required for images and favicon
- **Magic page has no nav** — standalone experience with "Return to Homepage" button at end
- **Favicon caching:** Browsers cache favicons aggressively — hard refresh (Ctrl+Shift+R) or incognito may be needed after updates
- **Magic page video** (`magic-clip.mp4`) is a 3.4MB / 720p / 40-second trim of Wesley Wang's "nothing, except everything." (used with copyright awareness; if it ever needs removing, the reveal branch can fall back to the paragraph alone)
- **Source video** (the full 139MB 1080p file) is gitignored

---

## Pending Future Work (discussed, not started)

- **Tag-based filtering** on writing page (Notion `Tags` multi-select property + filter chips above masonry grid)
- **Multi-image hero animation** on home page (cycle through 4 botanical illustration color variants — currently uses just one B&W↔color pair)
- Zapier auto-email integration
- MailerLite welcome email automation

## Recently Completed
- Poem opening line changed: "I write about moments in..." → "Writings about moments in..." ✓ (2026-05-02)
- Home page hero refreshed with new botanical illustration (anemone, butterfly, lily of valley, etc.) ✓ (2026-05-02)
- Magic riffle slowed: first riffle 75→80ms/card, second riffle 95→105ms/card ✓ (2026-05-02)

---

## Git History (most recent first)

```
62b3047 Refine magic riffle and loading animation behavior
a48e99e Add reveal branch to magic page with video gate and refined copy
e5bd91d Update bio copy and Lumen Labs link on home page
611160e Update context document with all recent changes
24e0ce5 Update favicon with new transparent sunflower image
1a2f645 Update favicon with transparent background
b55ece1 Fix favicon path on blog posts, vertically center writing loading animation
a39f554 Add sunflower loading animation to writing page, bigger loading text, new favicon
9f20b24 Fix sunflower loading paths, update hero B&W image
ecc23ac Add sunflower loading animation to blog post page
5bed5c4 Clean blog post URLs, loading state, remove filler text
91545ef Add pip layouts to cards, more image variety, tune riffle speed
69525bc Slow down card riffle speed by 10ms per card
f38f663 Increase spacing before magic trick PS line on home page
fd21a9e Add magic trick page and link it from nav and home page
9b0e15f Update poem text, intro copy, card layout, and favicon
1326aaa Align credit left on home page, remove from writing page, fix image card tape
f96b104 Fix mobile issues: annotations, poem order, hero image, nav, credit placement
b50eb00 Add favicon, mobile hamburger menu, bottom-sheet annotations, and polish
12f34f4 Add image support to margin note annotations
c1bf482 Add #fiction tag to quote cards and match heading font size with essay cards
8a248e6 Add Notion API integration, Netlify deployment, and full site redesign
254e4ca Initial commit: add personal website files
```
