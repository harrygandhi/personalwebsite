# Harry's Blog — Setup Guide

## Architecture Overview

```
Notion Database (you write here)
        │
        ├──→ Notion API ──→ Your Website (index.html + blog-post.html)
        │
        └──→ Zapier/Make ──→ MailerLite ──→ Subscriber Emails
```

---

## Step 1: Create Your Notion Database

Create a new **full-page database** in Notion with these properties:

| Property Name | Type | Description |
|---|---|---|
| `Title` | Title (default) | Essay title |
| `Slug` | Text | URL-friendly ID, e.g. `onto-death` |
| `Preview` | Text | 1-2 sentence preview shown on postcards |
| `Author` | Text | Leave blank for yourself, or add guest author name |
| `Status` | Select | Options: `Draft`, `Published` |
| `Published Date` | Date | When you publish |
| `Card Type` | Select | `text`, `image`, `art-only` |
| `Card Image` | Files & Media | Cover image for image-type cards |
| `Card Color` | Select | `white`, `sage`, `rose`, `gold`, `lavender` (for highlighted essays) |
| `Order` | Number | Sort order on homepage (lower = first) |

### Art-only cards (no essay, just decoration)
For Hilma af Klint postcards or other art, create entries with:
- `Card Type` = `art-only`
- `Card Image` = the artwork
- `Status` = `Published`
- Leave `Slug`, `Preview`, etc. blank

---

## Step 2: Set Up Notion API

1. Go to [notion.so/my-integrations](https://www.notion.so/my-integrations)
2. Click **"New integration"**
3. Name it `Blog Website`
4. Select your workspace
5. Copy the **Internal Integration Secret** (starts with `ntn_...`)
6. Go to your database in Notion → click `⋯` menu → **Connections** → add your integration

### Important: This is a PUBLIC content API key
Since your blog is public, the API key will be visible in your frontend code. This is fine because:
- The integration only has **read access** to the specific database you shared with it
- It cannot modify your data
- It cannot access any other pages in your workspace

If you prefer to keep the key hidden, you can set up a small serverless function (Cloudflare Worker, Vercel Edge Function) as a proxy. But for a personal blog, it's not necessary.

---

## Step 3: Configure Your Website

In `index.html`, replace these two values near the top of the `<script>` section:

```javascript
const NOTION_API_KEY = 'ntn_YOUR_KEY_HERE';
const NOTION_DATABASE_ID = 'YOUR_DATABASE_ID_HERE';
```

To find your database ID:
- Open your database in Notion as a full page
- The URL will look like: `notion.so/YOUR_WORKSPACE/abc123def456?v=...`
- The database ID is the 32-character hex string: `abc123def456...`
- Format it with dashes: `abc123de-f456-...` (8-4-4-4-12)

---

## Step 4: Set Up MailerLite (Free, up to 1,000 subscribers)

1. Sign up at [mailerlite.com](https://www.mailerlite.com)
2. Go to **Integrations** → **API** → copy your **API key**
3. Create a **Subscriber Group** called "Blog Subscribers"
4. Note the **Group ID** (you'll need it for the subscribe form)

### Connect the subscribe form
The nav bar has an email input + Subscribe button. Update the button's onclick handler with your MailerLite API key and group ID. (This is already wired up in the code — just add your credentials.)

---

## Step 5: Set Up Auto-Email on Publish (Zapier)

1. Sign up at [zapier.com](https://zapier.com) (free tier: 100 tasks/month)
2. Create a new Zap:

**Trigger:** Notion → "Updated Database Item"
- Connect your Notion account
- Select your blog database
- Set filter: `Status` changed to `Published`

**Action:** MailerLite → "Send Campaign"
- Connect your MailerLite account
- Subject: `New essay: {{Title}}`
- Content: Use MailerLite's email builder with:
  - Essay title
  - Preview text
  - "Read more" link to `https://harrygandhi.com/blog-post.html?slug={{Slug}}`

3. Turn on the Zap. Now every time you flip an essay to "Published" in Notion, subscribers get an email.

---

## Step 6: Deploy

### Option A: GitHub Pages (free)
1. Push your files to a GitHub repo
2. Enable GitHub Pages in Settings
3. Point your domain's DNS to GitHub

### Option B: Netlify (free)
1. Drag and drop your folder to [netlify.com](https://netlify.com)
2. Add custom domain

### Option C: Vercel (free)
1. Import from GitHub
2. Auto-deploys on push

### Files to deploy:
```
index.html          ← Homepage with postcard grid
blog-post.html      ← Individual essay page
hak1.jpeg - hak6.jpeg  ← Hilma af Klint postcards
```

---

## Workflow Summary

### Publishing a new essay:
1. Write in Notion (your normal workflow)
2. Set `Status` to `Published`, fill in `Slug`, `Preview`, `Published Date`
3. Your website automatically shows the new essay
4. Zapier detects the change → MailerLite sends email to subscribers

### Adding hover margin notes (annotations):
1. In your essay, **highlight the trigger text** and change its color to **orange** in Notion
2. At the **bottom of the same page**, create an **inline database** (type `/database` → "Table - Inline")
3. Name it "Annotations" (the name doesn't matter technically, but it keeps things consistent)
4. Add these columns to the database:

| Column | Type | Required? |
|---|---|---|
| Trigger | Title (default first column) | Yes — must match the orange text exactly |
| Label | Text | Yes — e.g., "Definition", "[ 1 ]", "Footnote" |
| Body | Text | Yes — the popup content |
| Phonetic | Text | No — e.g., `/ˌdefəˈniSHən/` |
| Link | URL | No — optional link shown at bottom of popup |

5. Add a row for each orange-highlighted phrase in your essay
6. The `Trigger` value must **match the orange text exactly** (case-insensitive)

**Example:**

If your essay contains the orange text `"pellentesque orci amet porta"`, your Annotations database row would be:

| Trigger | Label | Body | Phonetic | Link |
|---|---|---|---|---|
| pellentesque orci amet porta | Definition | The act of accumulating... | /pɛlɛnˈtɛskweɪ/ | https://en.wiktionary.org/... |

**Tips:**
- Not every essay needs annotations — they're completely optional
- If there's no Annotations database on a page, the essay renders normally without popups
- You can have as many or as few annotations per essay as you want
- The orange color in Notion is specifically what triggers annotation styling on the website

### Adding an art postcard:
1. Create a new row in the database
2. Set `Card Type` to `art-only`
3. Upload the image to `Card Image`
4. Set `Status` to `Published`

### Sending a manual email:
1. Go to MailerLite dashboard
2. Create a new campaign
3. Write your email
4. Send to "Blog Subscribers" group

---

## Color Reference (for Card Color property)

| Color Name | Hex | Use For |
|---|---|---|
| `white` | `#ffffff` | Default essays |
| `sage` | `#d4dbc8` | Nature/introspection essays |
| `rose` | `#dfc8c4` | Personal/emotional essays |
| `gold` | `#ddd5b8` | Seminal/important essays |
| `lavender` | `#cec8d8` | Philosophical essays |
