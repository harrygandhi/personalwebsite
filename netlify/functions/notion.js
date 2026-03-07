const NOTION_API_KEY = process.env.NOTION_API_KEY;
const NOTION_DATABASE_ID = process.env.NOTION_DATABASE_ID;
const NOTION_VERSION = '2022-06-28';

const headers = {
  'Authorization': `Bearer ${NOTION_API_KEY}`,
  'Notion-Version': NOTION_VERSION,
  'Content-Type': 'application/json'
};

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Content-Type': 'application/json'
};

exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 204, headers: corsHeaders, body: '' };
  }

  const path = event.path.replace('/.netlify/functions/notion', '').replace('/api/notion', '');
  const segments = path.split('/').filter(Boolean);

  try {
    let url, method, body;

    if (segments[0] === 'database' && segments.length === 1) {
      // Query the main blog database
      url = `https://api.notion.com/v1/databases/${NOTION_DATABASE_ID}/query`;
      method = 'POST';
      body = JSON.stringify({
        filter: { property: 'Status', select: { equals: 'Published' } },
        sorts: [{ property: 'Order', direction: 'ascending' }]
      });
    } else if (segments[0] === 'database' && segments[1]) {
      // Query an inline database (for annotations)
      url = `https://api.notion.com/v1/databases/${segments[1]}/query`;
      method = 'POST';
      body = JSON.stringify({});
    } else if (segments[0] === 'page' && segments[1]) {
      // Get page metadata
      url = `https://api.notion.com/v1/pages/${segments[1]}`;
      method = 'GET';
    } else if (segments[0] === 'blocks' && segments[1]) {
      // Get page blocks (with pagination via query param)
      const params = event.queryStringParameters || {};
      let qs = `page_size=100`;
      if (params.start_cursor) qs += `&start_cursor=${params.start_cursor}`;
      url = `https://api.notion.com/v1/blocks/${segments[1]}/children?${qs}`;
      method = 'GET';
    } else {
      return { statusCode: 400, headers: corsHeaders, body: JSON.stringify({ error: 'Invalid endpoint' }) };
    }

    const fetchOptions = { method, headers };
    if (body) fetchOptions.body = body;

    const res = await fetch(url, fetchOptions);
    const data = await res.json();

    return {
      statusCode: res.status,
      headers: corsHeaders,
      body: JSON.stringify(data)
    };
  } catch (e) {
    return {
      statusCode: 500,
      headers: corsHeaders,
      body: JSON.stringify({ error: 'Proxy error', message: e.message })
    };
  }
};
