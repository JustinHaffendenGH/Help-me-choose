// QA script to inspect provider => finalHref for movies across regions
// Run with: node scripts/qa-providers.js
const fetch = require('node-fetch');

// Minimal copies of mapping/deep-link logic from scripts/movies.js
function getProviderUrl(providerName) {
  if (!providerName) return 'https://www.google.com/search?q=' + encodeURIComponent('streaming');
  const key = normalizeProviderName(providerName);
  const providerUrls = {
    'netflix': 'https://www.netflix.com',
    'disney+': 'https://www.disneyplus.com',
    'disney plus': 'https://www.disneyplus.com',
    'disneyplus': 'https://www.disneyplus.com',
    'hulu': 'https://www.hulu.com',
    'amazon prime video': 'https://www.amazon.com/primevideo',
    'amazon prime': 'https://www.amazon.com/primevideo',
    'prime video': 'https://www.amazon.com/primevideo',
    'primevideo': 'https://www.amazon.com/primevideo',
    'hbo max': 'https://www.hbomax.com',
    'hbo': 'https://www.hbomax.com',
    'max': 'https://www.hbomax.com',
    'apple tv+': 'https://tv.apple.com',
    'apple tv': 'https://tv.apple.com',
    'paramount+': 'https://www.paramountplus.com',
    'paramount plus': 'https://www.paramountplus.com',
    'paramountplus': 'https://www.paramountplus.com',
    'peacock': 'https://www.peacocktv.com',
    'crunchyroll': 'https://www.crunchyroll.com',
    'funimation': 'https://www.funimation.com',
    'youtube': 'https://www.youtube.com',
    'youtube premium': 'https://www.youtube.com/premium',
    'tubi': 'https://www.tubi.tv',
    'pluto tv': 'https://www.pluto.tv',
    'pluto.tv': 'https://www.pluto.tv',
    'roku channel': 'https://www.roku.com/channel',
    'roku': 'https://www.roku.com',
    'amc+': 'https://www.amcplus.com',
    'amc plus': 'https://www.amcplus.com',
    'shudder': 'https://www.shudder.com',
    'criterion channel': 'https://www.criterionchannel.com',
    'kanopy': 'https://www.kanopy.com',
    'hoopla': 'https://www.hoopladigital.com',
    'acorn tv': 'https://www.acorn.tv',
    'acorn': 'https://www.acorn.tv',
    'britbox': 'https://www.britbox.com',
    'mubi': 'https://mubi.com',
    'fandor': 'https://www.fandor.com',
    'sundance now': 'https://www.sundancenow.com',
    'ifc films unlimited': 'https://www.ifcfilmsunlimited.com',
    'starz': 'https://www.starz.com',
    'discovery+': 'https://www.discoveryplus.com',
    'discovery plus': 'https://www.discoveryplus.com'
  };
  if (providerUrls[key]) return providerUrls[key];
  const cleaned = key.replace(/\+/g, ' plus').replace(/\s+/g, ' ').trim();
  if (providerUrls[cleaned]) return providerUrls[cleaned];
  return `https://www.google.com/search?q=${encodeURIComponent(providerName + ' streaming')}`;
}

function normalizeProviderName(providerName) {
  if (!providerName) return '';
  let s = providerName.trim().toLowerCase();
  s = s.replace(/\(.*?\)/g, '');
  s = s.replace(/[\*\|\/:,]/g, ' ');
  s = s.replace(/\+/g, ' plus').replace(/\s+/g, ' ').trim();
  s = s.replace(/\b(amazon channel|amazon prime channel|amazon channel)\b/g, '');
  s = s.replace(/\b(standard with ads|basic with ads|with ads|with ads?)\b/g, '');
  s = s.replace(/\b(roku premium channel|premium channel|channel)\b/g, '');
  s = s.replace(/\b(available to purchase|buy|rental|rent)\b/g, '');
  s = s.replace(/\b(\(free\)|free)\b/g, '');
  s = s.replace(/\s+/g, ' ').trim();
  if (s.includes('netflix')) return 'netflix';
  if (s.includes('disney')) return 'disney+';
  if (s.includes('hulu')) return 'hulu';
  if (s.includes('amazon') || s.includes('primevideo') || s.includes('prime video') || s.includes('prime')) return 'amazon prime video';
  if (s.includes('hbo') || s.includes('max')) return 'hbo max';
  if (s.includes('apple')) return 'apple tv+';
  if (s.includes('paramount')) return 'paramount+';
  if (s.includes('peacock')) return 'peacock';
  if (s.includes('roku')) return 'roku';
  if (s.includes('amc')) return 'amc+';
  if (s.includes('starz')) return 'starz';
  if (s.includes('google play') || s.includes('play.google')) return 'google play';
  if (s.includes('rakuten')) return 'rakuten tv';
  if (s.includes('pathe')) return 'pathe thuis';
  if (s.includes('vudu')) return 'vudu';
  if (s.includes('mubi')) return 'mubi';
  if (s.includes('peacock')) return 'peacock';
  if (s.includes('tubi')) return 'tubi';
  if (s.includes('pluto')) return 'pluto tv';
  return s;
}

function getProviderDeepLink(providerName, movieTitle, region) {
  if (!providerName || !movieTitle) return null;
  const titleQ = encodeURIComponent(movieTitle.trim());
  const key = normalizeProviderName(providerName);
  const r = (region || '').toUpperCase();
  const providerDomainByRegion = {
    'netflix': { US: 'www.netflix.com', GB: 'www.netflix.com', AU: 'www.netflix.com' },
    'amazon prime video': { US: 'www.amazon.com', GB: 'www.amazon.co.uk', AU: 'www.amazon.com.au' },
    'prime video': { US: 'www.amazon.com', GB: 'www.amazon.co.uk', AU: 'www.amazon.com.au' },
    'disney+': { US: 'www.disneyplus.com', GB: 'www.disneyplus.com', AU: 'www.disneyplus.com' },
    'hulu': { US: 'www.hulu.com' },
    'hbo max': { US: 'www.hbomax.com', GB: 'www.hbomax.com' },
    'apple tv+': { US: 'tv.apple.com', GB: 'tv.apple.com' },
    'paramount+': { US: 'www.paramountplus.com', GB: 'www.paramountplus.com' },
    'peacock': { US: 'www.peacocktv.com' },
    'roku': { US: 'www.roku.com', GB: 'www.roku.com', AU: 'www.roku.com' },
    'amc+': { US: 'www.amcplus.com' },
    'mubi': { US: 'mubi.com', GB: 'mubi.com' },
  'rakuten tv': { US: 'rakuten.tv', GB: 'rakuten.tv', AU: 'rakuten.tv' },
  'rakuten': { US: 'rakuten.tv', GB: 'rakuten.tv', AU: 'rakuten.tv' },
  'pathe thuis': { NL: 'pathe-thuis.nl' },
  'pathe-thuis': { NL: 'pathe-thuis.nl' },
  'google play': { US: 'play.google.com', GB: 'play.google.com', AU: 'play.google.com' },
  'google play movies': { US: 'play.google.com', GB: 'play.google.com', AU: 'play.google.com' },
  'sky store': { GB: 'www.skystore.com' },
  'chili': { US: 'www.chili.com', GB: 'www.chili.com', AU: 'www.chili.com' },
  'vudu': { US: 'www.vudu.com' }
  ,
  'philo': { US: 'www.philo.com' },
  'fubo tv': { US: 'www.fubo.tv' },
  'fubo': { US: 'www.fubo.tv' },
  'youtube tv': { US: 'tv.youtube.com' },
  'now tv': { GB: 'www.nowtv.com' },
  'hotstar': { IN: 'www.hotstar.com' },
  'bbc iplayer': { GB: 'www.bbc.co.uk' },
  'viaplay': { SE: 'www.viaplay.se', FI: 'www.viaplay.fi', DK: 'www.viaplay.dk', NO: 'www.viaplay.no', US: 'www.viaplay.com' }
  };
  const basePatterns = {
    'netflix': (domain) => `https://${domain}/search?q=${titleQ}`,
    'disney+': (domain) => `https://${domain}/search?q=${titleQ}`,
    'disney plus': (domain) => `https://${domain}/search?q=${titleQ}`,
    'hulu': (domain) => `https://${domain}/search?q=${titleQ}`,
    'amazon prime video': (domain) => `https://${domain}/s?k=${titleQ}&i=instant-video`,
    'prime video': (domain) => `https://${domain}/s?k=${titleQ}&i=instant-video`,
    'hbo max': (domain) => `https://${domain}/search?q=${titleQ}`,
    'hbo': (domain) => `https://${domain}/search?q=${titleQ}`,
    'max': (domain) => `https://${domain}/search?q=${titleQ}`,
    'apple tv+': (domain) => `https://${domain}/search?term=${titleQ}`,
    'apple tv': (domain) => `https://${domain}/search?term=${titleQ}`,
    'paramount+': (domain) => `https://${domain}/search/?q=${titleQ}`,
    'peacock': (domain) => `https://${domain}/search?q=${titleQ}`,
  'philo': (domain) => `https://${domain}/search?q=${titleQ}`,
  'fubo tv': (domain) => `https://${domain}/search?q=${titleQ}`,
  'fubo': (domain) => `https://${domain}/search?q=${titleQ}`,
  'youtube tv': (domain) => `https://${domain}/search?q=${titleQ}`,
  'now tv': (domain) => `https://${domain}/search?q=${titleQ}`,
  'hotstar': (domain) => `https://${domain}/search?q=${titleQ}`,
  'bbc iplayer': (domain) => `https://${domain}/search?q=${titleQ}`,
  'viaplay': (domain) => `https://${domain}/search?q=${titleQ}`,
  'rakuten tv': (domain) => `https://${domain}/search?q=${titleQ}`,
  'rakuten': (domain) => `https://${domain}/search?q=${titleQ}`,
  'pathe thuis': (domain) => `https://${domain}/search?query=${titleQ}`,
  'pathe-thuis': (domain) => `https://${domain}/search?query=${titleQ}`,
  'google play': (domain) => `https://${domain}/store/search?q=${titleQ}&c=movies`,
  'google play movies': (domain) => `https://${domain}/store/search?q=${titleQ}&c=movies`,
  'sky store': (domain) => `https://${domain}/search?q=${titleQ}`,
  'chili': (domain) => `https://${domain}/search?q=${titleQ}`,
  'vudu': (domain) => `https://${domain}/search?q=${titleQ}`,
  // variant aliases
  'netflix standard with ads': (domain) => `https://${domain}/search?q=${titleQ}`,
  'netflix standard': (domain) => `https://${domain}/search?q=${titleQ}`,
  'netflix basic with ads': (domain) => `https://${domain}/search?q=${titleQ}`,
  'amazon prime video with ads': (domain) => `https://${domain}/s?k=${titleQ}&i=instant-video`,
  'paramount+ amazon channel': (domain) => `https://${domain}/search/?q=${titleQ}`,
  'amc+ amazon channel': (domain) => `https://${domain}/search?q=${titleQ}`,
  'amc plus amazon channel': (domain) => `https://${domain}/search?q=${titleQ}`,
  'starz amazon channel': (domain) => `https://${domain}/search?q=${titleQ}`,
  'starz roku premium channel': (domain) => `https://${domain}/search?q=${titleQ}`,
    'tubi': (domain) => `https://${domain}/search?query=${titleQ}`,
    'pluto tv': (domain) => `https://${domain}/search?query=${titleQ}`,
    'roku': (domain) => `https://${domain}/search?q=${titleQ}`,
    'amc+': (domain) => `https://${domain}/search?q=${titleQ}`,
    'mubi': (domain) => `https://${domain}/search?q=${titleQ}`
  };
  if (basePatterns[key]) {
    const domainMap = providerDomainByRegion[key];
    const domain = domainMap ? (domainMap[r] || domainMap['US'] || Object.values(domainMap)[0]) : null;
    if (domain) return basePatterns[key](domain);
    const fallback = basePatterns[key]('www.' + (key.replace(/\s|\+/g, '') || ''));
    return fallback;
  }
  const cleaned = key.replace(/\+/g, ' plus').replace(/\s+/g, ' ').trim();
  if (basePatterns[cleaned]) {
    const domainMap = providerDomainByRegion[cleaned] || providerDomainByRegion[key];
    const domain = domainMap ? (domainMap[r] || domainMap['US'] || Object.values(domainMap)[0]) : null;
    if (domain) return basePatterns[cleaned](domain);
    return basePatterns[cleaned]('www.' + cleaned.replace(/\s/g, ''));
  }
  return null;
}

async function fetchJson(path) {
  const res = await fetch(`http://localhost:3000${path}`);
  if (!res.ok) throw new Error(`Failed to fetch ${path}: ${res.status}`);
  return res.json();
}

(async function run() {
  try {
    const popular = await fetchJson('/api/tmdb/popular?page=1');
    const movies = (popular.results || []).slice(0, 10);
    const regions = ['US','GB','AU'];

    for (const movie of movies) {
      console.log('\n== Movie:', movie.title, `(${movie.id})`);
      for (const r of regions) {
        const providers = await fetchJson(`/api/tmdb/movie/${movie.id}/watch/providers`);
        const regionData = providers.results[r] || providers.results['US'] || Object.values(providers.results||{})[0];
        console.log(`-- region=${r} (${regionData ? (regionData.link||'no-link') : 'no-data'})`);
        if (regionData && regionData.flatrate && regionData.flatrate.length) {
          for (const p of regionData.flatrate) {
            const providerName = p.provider_name;
            const providerUrl = getProviderUrl(providerName);
            const deep = getProviderDeepLink(providerName, movie.title, r);
            const final = deep || (regionData && regionData.link) ? regionData.link : providerUrl;
            console.log('   ', providerName, '=>', final);
          }
        } else {
          console.log('   no flatrate providers');
        }
      }
    }
  } catch (err) {
    console.error('QA run failed:', err);
    process.exitCode = 2;
  }
})();
