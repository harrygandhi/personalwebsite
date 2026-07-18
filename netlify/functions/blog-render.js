/**
 * Renders blog-post.html with proper Open Graph meta tags injected
 * for the requested essay slug. This is what social media crawlers see
 * when they hit /writing/[slug] — the essay title, description, and image
 * end up in the initial HTML response so the shared link preview is rich.
 *
 * The regular page functionality (JS fetching content client-side) still
 * works exactly as before — this function just enriches the initial HTML.
 */
const NOTION_API_KEY = process.env.NOTION_API_KEY;
const NOTION_DATABASE_ID = process.env.NOTION_DATABASE_ID;
const NOTION_VERSION = '2022-06-28';
const SITE_URL = process.env.URL || 'https://harrygandhi.com';

function escapeHtml(s) {
  return String(s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}
function escapeAttr(s) {
  return String(s || '')
    .replace(/&/g, '&amp;').replace(/"/g, '&quot;')
    .replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

async function fetchEssayBySlug(slug) {
  const res = await fetch(
    `https://api.notion.com/v1/databases/${NOTION_DATABASE_ID}/query`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${NOTION_API_KEY}`,
        'Notion-Version': NOTION_VERSION,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        filter: {
          and: [
            { property: 'Status', select: { equals: 'Published' } },
            { property: 'Slug', rich_text: { equals: slug } }
          ]
        },
        page_size: 1
      })
    }
  );
  if (!res.ok) return null;
  const data = await res.json();
  return data.results?.[0] || null;
}

function extractMeta(essay) {
  const props = essay.properties || {};
  const title = props.Title?.title?.[0]?.plain_text || 'Article';
  const preview = (props.Preview?.rich_text || []).map(t => t.plain_text).join('') || '';
  const author = props.Author?.rich_text?.[0]?.plain_text || 'Harry Gandhi';
  const imageFile = props['Card Image']?.files?.[0];
  const imageUrl = imageFile?.file?.url || imageFile?.external?.url || '';
  return { title, preview, author, imageUrl };
}

function buildMetaBlock({ title, preview, author, imageUrl, slug }) {
  const fullTitle = `${title} — Harry Gandhi`;
  const description = preview || `An essay by ${author} on harrygandhi.com`;
  const url = `${SITE_URL}/writing/${encodeURIComponent(slug)}`;
  const parts = [
    `<meta name="description" content="${escapeAttr(description)}">`,
    `<meta property="og:title" content="${escapeAttr(fullTitle)}">`,
    `<meta property="og:description" content="${escapeAttr(description)}">`,
    `<meta property="og:type" content="article">`,
    `<meta property="og:url" content="${escapeAttr(url)}">`,
    `<meta property="og:site_name" content="Harry Gandhi">`,
    `<meta name="twitter:card" content="${imageUrl ? 'summary_large_image' : 'summary'}">`,
    `<meta name="twitter:title" content="${escapeAttr(fullTitle)}">`,
    `<meta name="twitter:description" content="${escapeAttr(description)}">`
  ];
  if (imageUrl) {
    parts.push(`<meta property="og:image" content="${escapeAttr(imageUrl)}">`);
    parts.push(`<meta name="twitter:image" content="${escapeAttr(imageUrl)}">`);
  }
  return parts.join('\n');
}

exports.handler = async (event) => {
  // Extract slug from either the rewritten function path or the friendly URL
  const rawPath = event.path || '';
  const slug = decodeURIComponent(
    rawPath
      .replace(/^\/\.netlify\/functions\/blog-render\/?/, '')
      .replace(/^\/writing\/?/, '')
      .replace(/\/$/, '')
  );

  // Fetch the base HTML template. We fetch via HTTPS so we always get the
  // deployed version — no filesystem juggling needed.
  let html;
  try {
    const htmlRes = await fetch(`${SITE_URL}/blog-post.html`);
    if (!htmlRes.ok) throw new Error(`blog-post.html fetch ${htmlRes.status}`);
    html = await htmlRes.text();
  } catch (e) {
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'text/plain' },
      body: `Failed to load template: ${e.message}`
    };
  }

  // Try to enrich the HTML with essay-specific meta tags.
  if (slug) {
    try {
      const essay = await fetchEssayBySlug(slug);
      if (essay) {
        const meta = extractMeta(essay);
        const fullTitle = `${meta.title} — Harry Gandhi`;
        // Replace the placeholder <title>
        html = html.replace(
          /<title>[^<]*<\/title>/,
          `<title>${escapeHtml(fullTitle)}</title>`
        );
        // Inject OG / Twitter meta tags right after <title>
        html = html.replace(
          /<\/title>/,
          `</title>\n${buildMetaBlock({ ...meta, slug })}`
        );
      }
    } catch (e) {
      // Non-fatal — serve the base HTML so the client-side JS still runs
      console.error('blog-render enrich error:', e);
    }
  }

  return {
    statusCode: 200,
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      // Short cache so updates to essay titles propagate reasonably quickly
      'Cache-Control': 'public, max-age=300, s-maxage=300'
    },
    body: html
  };
};
