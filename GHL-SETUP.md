# Contractor Map — GoHighLevel Setup Guide

## Quick Start: CSV Import

1. Open the app → Filter by region/trade if needed → Click **Export CSV**
2. In GHL → **Contacts → Import** → Upload the CSV
3. Map columns: Company Name, Phone, Email, Address, Website, Tags
4. Tags include `trade:roofing`, `region:nj`, `status:contacted`, etc.

## Full API Integration (Contacts + Opportunities)

### Step 1: Get your GHL API Key
- GHL → Settings → Business Profile → **API Keys**
- Copy the key (starts with `eyJ...`)

### Step 2: Get your Location ID
- Look at your GHL URL bar: `app.gohighlevel.com/location/XXXXXX/...`
- Copy the `XXXXXX` part

### Step 3: Deploy the Cloudflare Worker
1. Go to [dash.cloudflare.com](https://dash.cloudflare.com) → Workers & Pages → Create
2. Click "Create Worker", name it `ghl-proxy`
3. Replace all default code with the contents of `ghl-worker.js`
4. Click Deploy
5. Your URL: `https://ghl-proxy.YOUR-NAME.workers.dev`

### Step 4: Configure in the App
1. Click **GHL Sync** in the header
2. Paste your API Key, Location ID, and Worker URL
3. Click **Test Connection**

### Step 5: Set Up Pipeline
1. In GHL, create a pipeline (Opportunities → Pipelines) with stages like:
   - Contacted
   - Follow Up
   - Closed / Won
   - Not Interested
2. Back in the app → Click **Load Pipelines** → Select your pipeline
3. Map your app statuses to pipeline stages (auto-matched when possible)
4. Click **Save Settings**

### Step 6: Push to GHL
- Click **Push All to GHL** to bulk-sync all contractors
- After that, any status change auto-syncs in real-time

## Tags in GHL

Contractors are tagged with:
- `contractor-map` (source)
- `trade-roofing`, `trade-pool`, `trade-fencing`, etc.
- `status-contacted`, `status-follow_up`, etc.
- `region-nj`, `region-fl`

Use these tags to build Smart Lists and automations in GHL.

## Embedding in a GHL Site

```html
<iframe
  src="https://YOUR-HOSTED-URL/index.html?apikey=YOUR_GOOGLE_MAPS_KEY"
  style="width:100%;height:90vh;border:none;border-radius:8px;"
  allow="geolocation"
></iframe>
```

Host on GitHub Pages, Cloudflare Pages, or Netlify (all free).
