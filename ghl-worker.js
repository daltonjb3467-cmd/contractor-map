/**
 * GHL API Proxy — Cloudflare Worker
 *
 * This Worker sits between your Contractor Map app and the GoHighLevel API.
 * It solves the CORS problem (browsers can't call GHL API directly).
 *
 * ═══════════════════════════════════════════════════════════════
 * SETUP INSTRUCTIONS:
 * ═══════════════════════════════════════════════════════════════
 *
 * 1. Go to https://dash.cloudflare.com → Workers & Pages → Create
 * 2. Click "Create Worker"
 * 3. Name it something like "ghl-proxy"
 * 4. Replace ALL the default code with THIS entire file
 * 5. Click "Deploy"
 * 6. Your Worker URL will be: https://ghl-proxy.YOUR-NAME.workers.dev
 * 7. Paste that URL into the GHL Sync settings in your Contractor Map app
 *
 * FREE TIER: 100,000 requests/day — more than enough
 * ═══════════════════════════════════════════════════════════════
 */

const GHL_BASE = 'https://services.leadconnectorhq.com';

// IMPORTANT: Set this to your actual app's domain for security.
// For local file:// testing, use '*'. For production, use your actual domain.
const ALLOWED_ORIGINS = ['*'];

function corsHeaders(request) {
  const origin = request.headers.get('Origin') || '*';
  return {
    'Access-Control-Allow-Origin': ALLOWED_ORIGINS[0] === '*' ? '*' : origin,
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, X-GHL-API-Key, X-GHL-Location',
    'Access-Control-Max-Age': '86400',
  };
}

export default {
  async fetch(request, env) {
    // Handle CORS preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: corsHeaders(request) });
    }

    const url = new URL(request.url);

    // Health check
    if (url.pathname === '/' || url.pathname === '/health') {
      return new Response(JSON.stringify({ status: 'ok', service: 'GHL API Proxy' }), {
        headers: { ...corsHeaders(request), 'Content-Type': 'application/json' }
      });
    }

    // Only proxy /ghl/* routes
    if (!url.pathname.startsWith('/ghl')) {
      return new Response(JSON.stringify({ error: 'Not found. Use /ghl/contacts/ etc.' }), {
        status: 404,
        headers: { ...corsHeaders(request), 'Content-Type': 'application/json' }
      });
    }

    // Extract GHL API key from custom header
    const apiKey = request.headers.get('X-GHL-API-Key');
    if (!apiKey) {
      return new Response(JSON.stringify({ error: 'Missing X-GHL-API-Key header' }), {
        status: 401,
        headers: { ...corsHeaders(request), 'Content-Type': 'application/json' }
      });
    }

    // Build the GHL API URL
    const ghlPath = url.pathname.replace('/ghl', '');
    const ghlUrl = `${GHL_BASE}${ghlPath}${url.search}`;

    // Forward the request to GHL
    const ghlHeaders = {
      'Authorization': `Bearer ${apiKey}`,
      'Version': '2021-07-28',
      'Content-Type': 'application/json',
    };

    let body = null;
    if (request.method !== 'GET' && request.method !== 'HEAD') {
      body = await request.text();
    }

    try {
      const ghlResponse = await fetch(ghlUrl, {
        method: request.method,
        headers: ghlHeaders,
        body: body || undefined,
      });

      const responseText = await ghlResponse.text();

      return new Response(responseText, {
        status: ghlResponse.status,
        headers: {
          ...corsHeaders(request),
          'Content-Type': 'application/json',
        }
      });
    } catch (error) {
      return new Response(JSON.stringify({ error: `Proxy error: ${error.message}` }), {
        status: 502,
        headers: { ...corsHeaders(request), 'Content-Type': 'application/json' }
      });
    }
  }
};
