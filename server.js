// Minimal Node/Express proxy for Google Places and Yelp
// Usage: copy .env.example -> .env, set keys, npm install, npm start

const express = require('express');
const fetch = require('node-fetch');
const dotenv = require('dotenv');
const cors = require('cors');
const path = require('path');

dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());

const GOOGLE_KEY = process.env.GOOGLE_API_KEY;

// Serve static files from project root so a single process can serve the site + proxy
app.use(express.static(path.join(__dirname)));

// Simple in-memory cache for JSON API responses
const cache = new Map();
function getCached(key) {
  const entry = cache.get(key);
  if (!entry) return null;
  if (Date.now() > entry.expires) {
    cache.delete(key);
    return null;
  }
  return entry.value;
}
function setCached(key, value, ttlMs) {
  cache.set(key, { value, expires: Date.now() + ttlMs });
}

// Nearby search proxy with caching
app.get('/api/nearby', async (req, res) => {
  try {
    if (!GOOGLE_KEY) return res.status(500).json({ error: 'Missing GOOGLE_API_KEY in server environment' });
    const { lat, lng, radius = 1500, type = 'restaurant', keyword } = req.query;
    if (!lat || !lng) return res.status(400).json({ error: 'lat and lng query params required' });

    const qs = new URLSearchParams({ location: `${lat},${lng}`, radius: String(radius), type, key: GOOGLE_KEY });
    if (keyword) qs.append('keyword', keyword);
    const url = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?${qs.toString()}`;

    // Cache key uses the full URL
    const cacheKey = `nearby:${url}`;
    const cached = getCached(cacheKey);
    if (cached) return res.json(cached);

    const r = await fetch(url);
    if (!r.ok) {
      const text = await r.text();
      return res.status(502).send(text);
    }
    const json = await r.json();

    // Cache successful responses for 2 minutes
    setCached(cacheKey, json, 2 * 60 * 1000);
    return res.json(json);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Server error', detail: err.message });
  }
});

// Photo proxy - will fetch the photo and stream it back (don't cache image bytes here)
app.get('/api/photo', async (req, res) => {
  try {
    if (!GOOGLE_KEY) return res.status(500).json({ error: 'Missing GOOGLE_API_KEY in server environment' });
    const { photoreference, maxwidth = 400 } = req.query;
    if (!photoreference) return res.status(400).json({ error: 'photoreference query param required' });

    const url = `https://maps.googleapis.com/maps/api/place/photo?maxwidth=${encodeURIComponent(maxwidth)}&photoreference=${encodeURIComponent(photoreference)}&key=${GOOGLE_KEY}`;

    // Fetch the photo URL. Google returns a redirect to the image; node-fetch will follow and return the image body.
    const r = await fetch(url);
    if (!r.ok) {
      const text = await r.text();
      return res.status(502).send(text);
    }

  // Forward content-type and add CORS + cache headers to help browser image loading
  const contentType = r.headers.get('content-type') || 'image/jpeg';
  res.setHeader('Content-Type', contentType);
  // Allow requests from any origin (local dev). In production scope this down to your domain.
  res.setHeader('Access-Control-Allow-Origin', '*');
  // Expose Content-Type (not strictly necessary) and any other headers
  res.setHeader('Access-Control-Expose-Headers', 'Content-Type');
  // Cache images for a short time to reduce repeated requests (1 minute)
  res.setHeader('Cache-Control', 'public, max-age=60');

  // Stream body
  r.body.pipe(res);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Server error', detail: err.message });
  }
});

// Yelp proxy removed for now (disabled until a Yelp API key is provided)

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Proxy + static server listening on http://localhost:${PORT}`));
