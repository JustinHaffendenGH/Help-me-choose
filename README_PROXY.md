wwhaProxy README

Purpose
- Small Node/Express proxy to keep Google and Yelp API keys off the client and to simplify local testing.

Quick start
1. Copy `.env.example` to `.env` and add your keys:
  - `GOOGLE_API_KEY` (Places API key)
  - (Optional) `YELP_API_KEY` (Yelp Fusion API key) — disabled by default

2. Install dependencies and run:

```bash
cd "${PWD}"
npm install
Proxy server quick reference

This project includes a small Node/Express proxy (`server.js`) that:
- Proxies Google Places Nearby Search (`/api/nearby`) using the server-side `GOOGLE_API_KEY` from `.env`.
- Proxies Place Photos (`/api/photo`) so you don't expose the Google key in the browser.

Quick start

1. Copy the example env and set your key:

  cp .env.example .env
  # Edit .env and add your GOOGLE_API_KEY

2. Start in the foreground (useful for development):

  npm start

3. Start in background (daemon):

  npm run start:daemon

  Logs are written to `proxy.log` in the project root.

4. Stop the background proxy:

  npm run stop:daemon

Troubleshooting

- If `http://localhost:3000` refuses to connect, check the log:

  tail -n 80 proxy.log

- If port 3000 is already in use:

  lsof -i :3000 -Pn -sTCP:LISTEN

  # Kill any lingering processes (replace <PID> with the PID shown)
  kill <PID>

Security notes

- Keep your `.env` out of version control. `.env.example` shows the needed keys but not their values.
- In production, restrict `Access-Control-Allow-Origin` to your domain instead of `*`.
