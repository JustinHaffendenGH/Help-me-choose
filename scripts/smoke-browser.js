// Headless smoke test: load movies.html, run showRandomTMDbMovie(), capture streaming debug outputs
const fs = require('fs');
const path = require('path');
const jsdom = require('jsdom');
const { JSDOM } = jsdom;

const htmlPath = path.join(__dirname, '..', 'movies.html');
const html = fs.readFileSync(htmlPath, 'utf8');

async function runOne(iterations = 3) {
  const dom = new JSDOM(html, {
    url: 'http://localhost:3000/movies.html',
    runScripts: 'dangerously',
    resources: 'usable'
  });

  // Polyfill fetch in the JSDOM window using node-fetch
  try {
    const nodeFetch = require('node-fetch');
    // wrap node-fetch so relative URLs are resolved against the JSDOM window.location
    dom.window.fetch = function(input, init) {
      try {
        const resolved = new URL(input, dom.window.location.href).toString();
        return nodeFetch(resolved, init);
      } catch (e) {
        return nodeFetch(input, init);
      }
    };
    // some code expects global fetch
    dom.window.window = dom.window;
  } catch (e) {
    console.error('Failed to polyfill fetch in JSDOM:', e);
  }

  // stub scrollIntoView to avoid errors in headless environment
  try {
    if (!dom.window.Element.prototype.scrollIntoView) {
      dom.window.Element.prototype.scrollIntoView = function() { /* no-op for tests */ };
    }
  } catch (e) {
    // ignore
  }
  // Capture console.debug outputs
  const logs = [];
  dom.window.console.debug = function() {
    logs.push(Array.from(arguments).join(' '));
  };
  dom.window.console.error = function() {
    logs.push('[ERR] ' + Array.from(arguments).join(' '));
  };

  // Wait for scripts to load
  await new Promise((res) => setTimeout(res, 800));

  // call showRandomTMDbMovie a few times
  for (let i = 0; i < iterations; i++) {
    try {
      if (typeof dom.window.showRandomTMDbMovie === 'function') {
        await dom.window.showRandomTMDbMovie();
        // allow time for async network to resolve
        await new Promise((res) => setTimeout(res, 800));
      } else {
        console.error('showRandomTMDbMovie not defined');
        break;
      }
    } catch (e) {
      console.error('error calling showRandomTMDbMovie', e);
    }
  }

  // print collected logs
  console.log('\n--- Collected console.debug outputs ---\n');
  logs.forEach((l) => console.log(l));
}

runOne(4).catch((e) => { console.error('smoke test failed', e); process.exit(2); });
