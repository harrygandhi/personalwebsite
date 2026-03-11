# Harry Gandhi Personal Website - Context Document

## Overview

Personal blog/portfolio at **harrygandhi.com**. Static HTML site with Notion as CMS, deployed via Netlify with auto-deploy from GitHub. Font: Brygada 1918. Emoji favicon: sunflower.

---

## Infrastructure

| Layer | Detail |
|-------|--------|
| **GitHub** | `https://github.com/harrygandhi/personalwebsite.git` (branch: `main`) |
| **Hosting** | Netlify (auto-deploys on push to `main`) |
| **Domain** | harrygandhi.com (Netlify DNS, nameservers updated at Bluehost: `dns1-4.p04.nsone.net`) |
| **CMS** | Notion API (key + database ID stored as Netlify env vars: `NOTION_API_KEY`, `NOTION_DATABASE_ID`) |
| **Email** | MailerLite (API key + group ID hardcoded in each HTML file) |
| **Serverless** | Netlify Functions at `netlify/functions/notion.js` - proxies Notion API |

### Netlify Config (`netlify.toml`)
- Publish dir: `.` (root)
- Functions dir: `netlify/functions`
- Redirect: `/api/notion/*` -> `/.netlify/functions/notion/:splat` (status 200)

---

## File Structure

```
Personal Website/
  index.html          # Landing/home page
  writing.html        # Essays/writing page
  blog-post.html      # Individual essay reader
  netlify.toml        # Netlify build config
  netlify/
    functions/
      notion.js       # Serverless Notion API proxy
  hero-bw.png.png     # B&W hero image (blossom animation)
  hero-color.png.png  # Color hero image (blossom animation)
  hak1-8.jpeg/jpg     # Art images (Hilma af Klint)
  sunflower-*.png     # Unused sunflower images
```

---

## Pages

### 1. `index.html` - Landing Page
**Background:** `#ece8e2` (warm beige)

**Layout (desktop):**
- Left 50%: Fixed hero image with "blossom" animation (B&W fades to color on 12s loop via `@keyframes blossom`)
- Right 50%: Centered bio text (max-width 460px) + credit text at bottom

**Layout (mobile, <900px):**
- Hero image hidden (`display:none`)
- Full-width bio text
- Hamburger menu (edge-to-edge, subscribe hidden)
- Credit text left-aligned, static position

**Key elements:**
- Nav: Home, Writing, Subscribe (email input + button via MailerLite)
- Bio mentions: Lumen Labs, 1517 Fund, contact email
- Credit: "Made with heart by Harry, Nazifa, Om and Claude" - left-aligned with intro text
- Nav hides on scroll down, shows on scroll up (disabled when mobile menu is open)

---

### 2. `writing.html` - Essays Page
**Background:** `#faf8f5` (off-white)

**Layout (desktop):**
- Left 50%: Scrollable masonry grid (2 columns, `column-count:2`) of essay cards
- Right 50%: Fixed poem text with watercolor brush stroke highlights (SVG filter)

**Layout (mobile, <900px):**
- Poem appears first (`order:-1`), then single-column card grid (`order:1`)
- Body is `display:flex;flex-direction:column` for ordering to work
- No credit text on this page

**Card types (from Notion `Card Type` property):**

| Type | CSS Class | Clickable | Tape | Notes |
|------|-----------|-----------|------|-------|
| `text` | `.card` | Yes (links to blog-post.html) | Yes | Supports color variants (sage/rose/gold/lavender) |
| `image` | `.card-img` | Yes | Yes | `overflow:visible` so tape shows; image + overlay |
| `art-only` | `.art-card` | No | No | Pure image postcard |
| `quote` | `.card-quote` | No | Yes | Poem/quote with `#fiction` tag |

**Tape effect:** Translucent rectangle (`rgba(200,190,170,0.4)`) positioned at `top:-7px`, cycling through 3 positions (left/right/center) via `tapeStyles[i%3]`.

**Notion database properties used:**
- `Title` (title) - essay name
- `Slug` (rich_text) - URL slug
- `Preview` (rich_text) - card preview text
- `Author` (rich_text) - author name
- `Card Type` (select) - text/image/art-only/quote
- `Card Color` (select) - sage/rose/gold/lavender/white
- `Card Image` (files) - image for image/art/quote cards
- `Status` (select) - must be "Published" to appear
- `Order` (number) - sort order (ascending)

**Watercolor brush strokes:** SVG `<filter id="watercolor">` with `feTurbulence` + `feDisplacementMap` for organic edges. Applied via `.wc` class with `.wc-yellow` and `.wc-green` variants.

---

### 3. `blog-post.html` - Essay Reader
**Background:** `#faf8f5`

**Layout (desktop):**
- Max-width 1060px page container
- Content column (max-width 540px) pushed right (`margin-left:auto`)
- Margin notes appear to the left of content (absolutely positioned, `right:calc(100% + 48px)`)

**Layout (mobile, <900px):**
- Full-width content
- Margin notes hidden (`display:none`)
- Bottom sheet for annotations (slide-up from bottom on tap)

**Annotation system:**
1. In Notion, orange-colored text is detected as annotation triggers
2. `richTextToHTML()` groups consecutive orange segments into `<span class="a" data-trigger="...">` elements
3. An inline database named "Annotations" at the bottom of each Notion page stores annotation data
4. Database columns: `Trigger` (title), `Label` (text), `Body` (text), `Phonetic` (text), `Link` (url), `Image` (files/url/text)
5. `fetchAnnotations()` queries this inline database via `/api/notion/database/{dbId}`
6. `wireUpAnnotations()` creates margin note elements and wires hover (desktop) / click (mobile) handlers

**Desktop annotation behavior:**
- Hover orange text -> margin note fades in (positioned at same Y as trigger)
- Mouse can move to margin note (600ms hide delay)
- Only one note visible at a time

**Mobile annotation behavior (bottom sheet):**
- Tap orange text -> overlay slides up from bottom
- Semi-transparent backdrop, white card with rounded top corners
- Shows: label, phonetic, image, body text, link
- Dismiss: tap backdrop or X button
- Body scroll locked when open

**Image annotations:** Support for `Image` property in Notion (Files & Media, URL, or rich_text). Rendered as `<img class="mn-img">` in margin notes and `<img class="bs-img">` in bottom sheet.

**Footer:** Subscribe form (email + button) + credit text + decorative star

**Notion block rendering** (`blocksToHTML`):
- heading_1/2 -> `<h2>`, heading_3 -> `<h3>`
- paragraph -> `<p>`
- bulleted/numbered lists (with dedup of adjacent list wrappers)
- quote -> `<blockquote>` with orange left border
- divider -> `<hr>`
- image -> `<img>`
- callout -> renders as `.refs` box (used for "References & Inspiration")
- child_database -> skipped (handled separately for annotations)
- Pagination: fetches all blocks with `start_cursor` loop

**Demo fallback:** When no Notion page ID in URL, shows static placeholder content with 4 demo annotations (including one with an image).

---

## Serverless Proxy (`netlify/functions/notion.js`)

Proxies requests to Notion API with CORS headers. Routes:

| Endpoint | Action |
|----------|--------|
| `POST /api/notion/database` | Query main blog database (Published, sorted by Order) |
| `POST /api/notion/database/:id` | Query inline database by ID (for annotations) |
| `GET /api/notion/page/:id` | Get page metadata |
| `GET /api/notion/blocks/:id` | Get child blocks (supports `?start_cursor=` pagination) |

Environment variables (set in Netlify dashboard):
- `NOTION_API_KEY` - Notion integration token
- `NOTION_DATABASE_ID` - Main blog database ID

---

## Shared Patterns Across All Pages

**Nav:** Fixed position (except blog-post which is normal flow), hides on scroll down, shows on scroll up. Contains Home, Writing links + subscribe input/button.

**Hamburger menu (mobile):** 3-span button, animates to X on `.open`. Nav gets `background` on mobile for readability. Subscribe input/button hidden on mobile (`display:none !important`).

**MailerLite integration:** Same API key and group ID on all pages. `subscribe()` function POSTs to `https://connect.mailerlite.com/api/subscribers`. On blog-post, `subscribe(inputId)` takes an input ID parameter since there are two subscribe forms (nav + footer).

**Favicon:** Sunflower emoji via SVG data URI in `<link rel="icon">`.

**Font:** Brygada 1918 from Google Fonts (weights 400-700, italic).

---

## Design Decisions & Known Details

- **No CSS framework** - all styles are inline in each HTML file's `<style>` block
- **No build step** - plain HTML/CSS/JS served directly
- **Mobile breakpoint:** 900px
- **Touch targets:** 44px minimum height on mobile nav links and buttons
- **Card masonry:** CSS `column-count` (not JS masonry library). Fills left column first, then right
- **Color palette:** Orange accent `#c47a3a`, backgrounds `#ece8e2` (home) / `#faf8f5` (writing/blog), text `#1a1a1a`
- **Tape on image cards:** Required `overflow:visible` on `.card-img` (was `overflow:hidden` which clipped the tape at `top:-7px`)
- **Writing page has no credit text** (removed intentionally)
- **Home page credit is left-aligned** with intro text using `left:50%;transform:translateX(-50%);max-width:460px` to match intro centering
- **Blog post nav** is not fixed (normal document flow), unlike home and writing pages

---

## Git History

```
1326aaa Align credit left on home page, remove from writing page, fix image card tape
f96b104 Fix mobile issues: annotations, poem order, hero image, nav, credit placement
b50eb00 Add favicon, mobile hamburger menu, bottom-sheet annotations, and polish
12f34f4 Add image support to margin note annotations
c1bf482 Add #fiction tag to quote cards and match heading font size with essay cards
8a248e6 Add Notion API integration, Netlify deployment, and full site redesign
254e4ca Initial commit: add personal website files
```

---

## Potential Future Work (not started)
- Zapier auto-email integration
- MailerLite welcome email automation
- Additional Notion properties/features
