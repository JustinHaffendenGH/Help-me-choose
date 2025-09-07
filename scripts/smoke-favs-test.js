/* smoke-favs-test.js — quick headless smoke test for favorites page */
const fs = require('fs');
const path = require('path');
const { JSDOM } = require('jsdom');

(async function(){
  const html = fs.readFileSync(path.join(__dirname, '..', 'favorites.html'), 'utf8');
  const dom = new JSDOM(html, { runScripts: 'dangerously', resources: 'usable', url: 'http://localhost/' });
  const { window } = dom;
  // provide minimal globals used by script
  window.confirm = () => true;
  window.alert = (msg) => { /* no-op */ };

  // seed localStorage
  const sample = [{ id: 42, title: 'Test Movie', poster: '', poster_path: '/test.jpg', url: 'movies.html?id=42', addedAt: Date.now() }];
  window.localStorage.setItem('favorites', JSON.stringify(sample));

  // load the favorites script file content and run it in the jsdom window
  const scriptSrc = fs.readFileSync(path.join(__dirname, 'favorites.js'), 'utf8');
  const scriptEl = window.document.createElement('script');
  scriptEl.textContent = scriptSrc;
  window.document.body.appendChild(scriptEl);

  // wait a short time for DOM to update
  await new Promise(r => setTimeout(r, 200));

  const root = window.document.getElementById('favorites-root');
  if(!root) return console.error('FAILED: favorites-root not found');
  const items = root.querySelectorAll('.favorite-card');
  if(items.length === 1 && items[0].textContent.includes('Test Movie')){
    console.log('PASS: favorites rendered as expected');
    process.exit(0);
  } else {
    console.error('FAIL: unexpected render - items:', items.length);
    process.exit(2);
  }
})();
