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
const TMDB_API_KEY = process.env.TMDB_API_KEY;
const GOOGLE_BOOKS_API_KEY = process.env.GOOGLE_BOOKS_API_KEY;
const HARDCOVER_API_KEY = process.env.HARDCOVER_API_KEY;

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
    const { lat, lng, radius = 1500, type = 'restaurant', keyword, cuisine, price } = req.query;
    if (!lat || !lng) return res.status(400).json({ error: 'lat and lng query params required' });

    // Map incoming filter params into Places API params
    const qs = new URLSearchParams({ location: `${lat},${lng}`, radius: String(radius), type, key: GOOGLE_KEY });
    // Use 'keyword' or 'cuisine' (keyword is more general search term)
    if (keyword) qs.append('keyword', keyword);
    else if (cuisine) qs.append('keyword', cuisine);

    // Map price like '$', '$$' to numeric minprice/maxprice (0-4 scale supported by Places API)
    if (price && price !== 'all') {
      const priceMap = { '$': 0, '$$': 1, '$$$': 2, '$$$$': 3 };
      const mapped = priceMap[price] !== undefined ? priceMap[price] : null;
      if (mapped !== null) {
        // Use the same value for minprice and maxprice to approximate the level
        qs.append('minprice', String(mapped));
        qs.append('maxprice', String(mapped));
      }
    }
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

// Proxy for TMDb endpoints (keeps API key server-side)
app.get('/api/tmdb/popular', async (req, res) => {
  try {
    if (!TMDB_API_KEY) return res.status(500).json({ error: 'Missing TMDB_API_KEY in server environment' });
    const page = req.query.page || '1';
    const url = `https://api.themoviedb.org/3/movie/popular?api_key=${TMDB_API_KEY}&language=en-US&page=${encodeURIComponent(page)}`;
    const cacheKey = `tmdb:popular:${page}`;
    const cached = getCached(cacheKey);
    if (cached) return res.json(cached);
    const r = await fetch(url);
    if (!r.ok) return res.status(502).send(await r.text());
    const json = await r.json();
    setCached(cacheKey, json, 2 * 60 * 1000);
    return res.json(json);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Server error', detail: err.message });
  }
});

// Proxy for TMDb external IDs (keeps API key server-side)
app.get('/api/tmdb/movie/:id/external_ids', async (req, res) => {
  try {
    if (!TMDB_API_KEY) return res.status(500).json({ error: 'Missing TMDB_API_KEY in server environment' });
    const movieId = req.params.id;
    if (!movieId) return res.status(400).json({ error: 'movie id required' });
    const url = `https://api.themoviedb.org/3/movie/${encodeURIComponent(movieId)}/external_ids?api_key=${TMDB_API_KEY}`;
    const cacheKey = `tmdb:external:${movieId}`;
    const cached = getCached(cacheKey);
    if (cached) return res.json(cached);
    const r = await fetch(url);
    if (!r.ok) return res.status(502).send(await r.text());
    const json = await r.json();
    setCached(cacheKey, json, 2 * 60 * 1000);
    return res.json(json);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Server error', detail: err.message });
  }
});

// Proxy for Google Books volumes endpoint
app.get('/api/googlebooks/volumes', async (req, res) => {
  try {
    if (!GOOGLE_BOOKS_API_KEY) return res.status(500).json({ error: 'Missing GOOGLE_BOOKS_API_KEY in server environment' });
    const q = req.query.q || '';
    const maxResults = req.query.maxResults || '10';
    const url = `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(q)}&maxResults=${encodeURIComponent(maxResults)}&key=${GOOGLE_BOOKS_API_KEY}`;
    const cacheKey = `gbooks:${q}:${maxResults}`;
    const cached = getCached(cacheKey);
    if (cached) return res.json(cached);
    const r = await fetch(url);
    if (!r.ok) return res.status(502).send(await r.text());
    const json = await r.json();
    setCached(cacheKey, json, 2 * 60 * 1000);
    return res.json(json);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Server error', detail: err.message });
  }
});

// Proxy for Hardcover API search
app.get('/api/hardcover/search', async (req, res) => {
  try {
    if (!HARDCOVER_API_KEY) return res.status(500).json({ error: 'Missing HARDCOVER_API_KEY in server environment' });
    const query = req.query.q || 'bestseller';
    const perPage = req.query.per_page || '10';
    const page = req.query.page || '1';
    const graphqlQuery = `
      query SearchBooks {
        search(query: "${query}", query_type: "Book", per_page: ${perPage}, page: ${page}) {
          results
        }
      }
    `;
    const cacheKey = `hardcover:${query}:${perPage}:${page}`;
    const cached = getCached(cacheKey);
    if (cached) return res.json(cached);
    const response = await fetch('https://api.hardcover.app/v1/graphql', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${HARDCOVER_API_KEY}`
      },
      body: JSON.stringify({ query: graphqlQuery })
    });
    if (!response.ok) return res.status(502).send(await response.text());
    const json = await response.json();
    setCached(cacheKey, json, 2 * 60 * 1000);
    return res.json(json);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Server error', detail: err.message });
  }
});

// Google Places search proxy (for food.js)
app.get('/api/places/search', async (req, res) => {
  try {
    if (!GOOGLE_KEY) return res.status(500).json({ error: 'Missing GOOGLE_API_KEY in server environment' });

    const { query, location = '40.7128,-74.0060', type = 'restaurant' } = req.query;
    if (!query) return res.status(400).json({ error: 'query parameter required' });

    // Use Google Places Text Search API
    const url = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(query)}&location=${location}&type=${type}&key=${GOOGLE_KEY}`;

    const cacheKey = `places_search_${query}_${location}_${type}`;
    let data = getCached(cacheKey);

    if (!data) {
      const response = await fetch(url);
      data = await response.json();
      setCached(cacheKey, data, 5 * 60 * 1000); // Cache for 5 minutes
    }

    res.json(data);
  } catch (error) {
    console.error('Places search error:', error);
    res.status(500).json({ error: 'Failed to search places' });
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

// Foursquare Places proxy (optional). Requires FOURSQUARE_API_KEY in .env
// Foursquare support removed per user request.
