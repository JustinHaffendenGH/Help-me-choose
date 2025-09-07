// Movie-related functionality
// Note: createStarRating and formatDateToUK are now available globally from utils.js

// Store current filter settings
let currentFilter = {
  genre: 'all',
  minRating: 0,
  isActive: false,
};

// TMDB API key removed from client and moved server-side. Use /api/tmdb endpoints.
const TMDB_API_KEY = null;

async function getRandomTMDbMovie() {
  let attempts = 0;
  const maxAttempts = 15; // Try up to 15 different pages for better results

  while (attempts < maxAttempts) {
    const randomPage = Math.floor(Math.random() * 500) + 1;
    // Use server-side proxy to avoid exposing TMDb API key
    const url = `/api/tmdb/popular?page=${randomPage}`;

    try {
      const response = await fetch(url);
      const data = await response.json();

      if (data.results && data.results.length > 0) {
        let filtered = data.results.filter(
          (m) => m.vote_average >= 5 && m.vote_count >= 100 && m.title
        );

        // Apply current filter if active
        if (currentFilter.isActive) {
          filtered = filtered.filter((movie) => {
            const matchesGenre =
              currentFilter.genre === 'all' ||
              movie.genre_ids.includes(parseInt(currentFilter.genre));
            const matchesRating = movie.vote_average >= currentFilter.minRating;
            return matchesGenre && matchesRating;
          });
        }

        if (filtered.length > 0) {
          const randomIndex = Math.floor(Math.random() * filtered.length);
          return filtered[randomIndex];
        }
      }
    } catch (error) {
      console.error('Error fetching movies:', error);
    }

    attempts++;
  }

  return null; // Return null if no movie found after all attempts
}

async function getMovieExternalIDs(movieId) {
  try {
    // Use server proxy for external IDs
    const url = `/api/tmdb/movie/${movieId}/external_ids`;
    const response = await fetch(url);
    const data = await response.json();
    return data; // contains imdb_id if available
  } catch (error) {
    console.error('Error fetching external IDs:', error);
    return null;
  }
}

// Helper to update IMDb link element
async function updateImdbLink(movie) {
  const imdbLink = document.getElementById('imdb-link');
  if (!imdbLink) return;

  if (!movie || !movie.id) {
    imdbLink.style.display = 'none';
    imdbLink.href = '#';
    return;
  }

  const external = await getMovieExternalIDs(movie.id);
  if (external && external.imdb_id) {
    imdbLink.href = `https://www.imdb.com/title/${external.imdb_id}/`;
    imdbLink.style.display = 'inline-block';
  } else {
    imdbLink.style.display = 'none';
    imdbLink.href = '#';
  }
}

// Determine user's region (ISO 3166-1 alpha-2) with override support
function getUserRegion() {
  // 1) user override
  const override = (localStorage.getItem('regionOverride') || '').trim();
  if (override) return override.toUpperCase();

  // 2) navigator.language (e.g. en-GB)
  const locale = (navigator.language || navigator.userLanguage || '').toLowerCase();
  if (locale && locale.includes('-')) {
    const parts = locale.split('-');
    const maybeCountry = parts[parts.length - 1];
    if (maybeCountry && maybeCountry.length === 2) return maybeCountry.toUpperCase();
  }

  // 3) default
  return 'US';
}

// Fetch streaming availability for a movie and return the data for the requested region
async function getMovieStreamingData(movieId, region) {
  try {
    const response = await fetch(`/api/tmdb/movie/${movieId}/watch/providers`);
    if (!response.ok) {
      console.error('Failed to fetch streaming data');
      return null;
    }
    const data = await response.json();
    if (!data.results) return null;

    const r = (region || '').toUpperCase();
    if (r && data.results[r]) return data.results[r];
    if (data.results['US']) return data.results['US'];

    // fallback to first available
    return Object.values(data.results || {})[0] || null;
  } catch (error) {
    console.error('Error fetching streaming data:', error);
    return null;
  }
}

// Map provider names to their actual URLs
function getProviderUrl(providerName) {
  if (!providerName) {
    return 'https://www.google.com/search?q=' + encodeURIComponent('streaming');
  }

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

  // try cleaned variants (replace + with ' plus', collapse whitespace)
  const cleaned = key.replace(/\+/g, ' plus').replace(/\s+/g, ' ').trim();
  if (providerUrls[cleaned]) return providerUrls[cleaned];

  // Fallback to a helpful web search rather than a '#' anchor
  return `https://www.google.com/search?q=${encodeURIComponent(providerName + ' streaming')}`;
}

// Normalize noisy provider names from TMDb into canonical lookup keys.
function normalizeProviderName(providerName) {
  if (!providerName) return '';
  let s = providerName.trim().toLowerCase();

  // Remove parenthetical notes and extra punctuation
  s = s.replace(/\(.*?\)/g, '');
  s = s.replace(/[\*\|\/:,]/g, ' ');

  // Normalize plus sign, collapse whitespace
  s = s.replace(/\+/g, ' plus').replace(/\s+/g, ' ').trim();

  // Strip common suffixes/prefixes that break hostname generation
  s = s.replace(/\b(amazon channel|amazon prime channel|amazon channel)\b/g, '');
  s = s.replace(/\b(standard with ads|basic with ads|with ads|with ads?)\b/g, '');
  s = s.replace(/\b(roku premium channel|premium channel|channel)\b/g, '');
  s = s.replace(/\b(available to purchase|buy|rental|rent)\b/g, '');
  s = s.replace(/\b(\(free\)|free)\b/g, '');

  s = s.replace(/\s+/g, ' ').trim();

  // Heuristic canonical mapping by substring
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

  // Default: cleaned whitespace string
  return s;
}

// Convert a normalized provider key into a friendly display label.
function prettyProviderLabel(normalizedKey, originalName) {
  if (!normalizedKey) return originalName || '';
  const map = {
    'netflix': 'Netflix',
    'disney+': 'Disney+',
    'disney plus': 'Disney+',
    'hulu': 'Hulu',
    'amazon prime video': 'Amazon Prime Video',
    'prime video': 'Amazon Prime Video',
    'hbo max': 'HBO Max',
    'apple tv+': 'Apple TV+',
    'paramount+': 'Paramount+',
    'peacock': 'Peacock',
    'roku': 'Roku',
    'amc+': 'AMC+',
    'starz': 'Starz',
    'google play': 'Google Play',
    'rakuten tv': 'Rakuten TV',
    'pathe thuis': 'Pathé Thuis',
    'vudu': 'Vudu',
    'mubi': 'MUBI',
    'tubi': 'Tubi',
    'pluto tv': 'Pluto TV',
    'philo': 'Philo',
    'fubo tv': 'FuboTV',
    'youtube tv': 'YouTube TV',
    'now tv': 'Now TV',
    'hotstar': 'Hotstar',
    'bbc iplayer': 'BBC iPlayer',
    'viaplay': 'Viaplay'
  };
  if (map[normalizedKey]) return map[normalizedKey];

  // Fallback: title-case the original name for nicer display
  const src = originalName || normalizedKey;
  return src.replace(/\b\w+/g, (w) => w[0].toUpperCase() + w.slice(1).toLowerCase());
}

// Best-effort provider-specific deep links for a given movie title.
// Returns an absolute URL string or null if none known.
function getProviderDeepLink(providerName, movieTitle, region) {
  if (!providerName || !movieTitle) return null;
  const titleQ = encodeURIComponent(movieTitle.trim());
  const key = normalizeProviderName(providerName);
  const r = (region || '').toUpperCase();

  // region-specific provider domains for higher-quality deep links
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
  // Additional providers and regional domains
  'philo': { US: 'www.philo.com' },
  'fubo tv': { US: 'www.fubo.tv' },
  'fubo': { US: 'www.fubo.tv' },
  'youtube tv': { US: 'tv.youtube.com' },
  'now tv': { GB: 'www.nowtv.com' },
  'hotstar': { IN: 'www.hotstar.com' },
  'bbc iplayer': { GB: 'www.bbc.co.uk' },
  'viaplay': { SE: 'www.viaplay.se', FI: 'www.viaplay.fi', DK: 'www.viaplay.dk', NO: 'www.viaplay.no', US: 'www.viaplay.com' }
  };

  // additional normalized aliases handled below
  // e.g. 'netflix standard with ads' => netflix

  // patterns that are invariant (use domain above when present)
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

  // direct lookup using normalized key
  if (basePatterns[key]) {
    const domainMap = providerDomainByRegion[key];
    const domain = domainMap ? (domainMap[r] || domainMap['US'] || Object.values(domainMap)[0]) : null;
    if (domain) return basePatterns[key](domain);
    // If no region-specific domain, fall back to a single known domain used in getProviderUrl
    const fallback = basePatterns[key]('www.' + (key.replace(/\s|\+/g, '') || ''));
    return fallback;
  }

  // try cleaned variants
  const cleaned = key.replace(/\+/g, ' plus').replace(/\s+/g, ' ').trim();
  if (basePatterns[cleaned]) {
    const domainMap = providerDomainByRegion[cleaned] || providerDomainByRegion[key];
    const domain = domainMap ? (domainMap[r] || domainMap['US'] || Object.values(domainMap)[0]) : null;
    if (domain) return basePatterns[cleaned](domain);
    return basePatterns[cleaned]('www.' + cleaned.replace(/\s/g, ''));
  }

  return null;
}

// Display streaming availability
function displayStreamingAvailability(streamingData, movie, region) {
  const streamingContainer = document.getElementById('streaming-availability');
  if (!streamingContainer) return;

  if (!streamingData) {
    streamingContainer.style.display = 'none';
    return;
  }

  let streamingHTML = '<div class="streaming-section"><h4>🎬 Where to Watch</h4>';
  
  // Only show streaming services (subscription)
  if (streamingData.flatrate && streamingData.flatrate.length > 0) {
    streamingHTML += '<div class="streaming-type"><div class="provider-list">';
    // Deduplicate providers by normalized provider key so we show one badge per service.
    const seen = {};
    const deduped = [];
    streamingData.flatrate.forEach((provider) => {
      const norm = normalizeProviderName(provider.provider_name || '');
      if (!seen[norm]) {
        seen[norm] = provider;
        deduped.push(provider);
      } else {
        // Prefer an entry that includes a logo_path over one that doesn't
        const existing = seen[norm];
        if ((!existing.logo_path || existing.logo_path.length === 0) && provider.logo_path) {
          const idx = deduped.indexOf(existing);
          if (idx >= 0) deduped[idx] = provider;
          seen[norm] = provider;
        }
      }
    });

    deduped.forEach(provider => {
      const providerUrlRaw = getProviderUrl(provider.provider_name);
      let providerUrl = providerUrlRaw;
      if (providerUrl && !/^https?:\/\//i.test(providerUrl)) {
        providerUrl = 'https://' + providerUrl.replace(/^\/*/, '');
      }

      const normalized = normalizeProviderName(provider.provider_name || '');
      let displayName = prettyProviderLabel(normalized, provider.provider_name || '');
      if (/roku/i.test(provider.provider_name || '')) {
        providerUrl = 'https://www.roku.com/';
        displayName = 'Roku';
      }

      // Prefer a provider-specific deep link for this movie when possible (use normalized key)
      const deep = getProviderDeepLink(normalized, movie?.title || '', region) || getProviderDeepLink(provider.provider_name, movie?.title || '', region);
      let finalHref;
      if (/^roku$/i.test(displayName)) {
        finalHref = 'https://www.roku.com/';
      } else if (deep) {
        finalHref = deep;
      } else if (streamingData && streamingData.link) {
        finalHref = streamingData.link;
      } else {
        finalHref = providerUrl;
      }

      if (finalHref && !/^https?:\/\//i.test(finalHref)) {
        finalHref = 'https://' + finalHref.replace(/^\/*/, '');
      }

      try { console.debug('Provider link:', provider.provider_name, '=>', finalHref, 'display:', displayName, 'normalized:', normalized); } catch (e) {}

      streamingHTML += `
        <a href="${finalHref}" target="_blank" rel="noopener noreferrer" class="streaming-provider" title="${displayName}">
          <img src="https://image.tmdb.org/t/p/w45${provider.logo_path}" alt="${displayName}" />
          <span>${displayName}</span>
        </a>
      `;
    });
    streamingHTML += '</div></div>';
  }

  streamingHTML += '</div>';
  
  if (streamingData.flatrate && streamingData.flatrate.length > 0) {
    streamingContainer.innerHTML = streamingHTML;
    streamingContainer.style.display = 'block';
  } else {
    // Professional message when no subscription streaming platforms are found
    streamingContainer.innerHTML = `
      <div class="streaming-section">
        <h4>🎬 Where to Watch</h4>
        <p class="no-streams">We couldn't find subscription streaming options for this title at the moment. You may still be able to rent or purchase it through major digital retailers.</p>
      </div>
    `;
    streamingContainer.style.display = 'block';
  }
}

async function showRandomTMDbMovie() {
  const movie = await getRandomTMDbMovie();
  const movieResult = document.getElementById('movie-result');
  movieResult.style.display = 'block'; // Ensure the div is visible

  if (movie) {
    const posterUrl = movie.poster_path
      ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
      : '';
    const movieTitle = document.getElementById('movie-title');
    if (movieTitle) {
      movieTitle.textContent = movie.title;
    }
    const movieOverview = document.getElementById('movie-overview');
    if (movieOverview) {
      movieOverview.textContent = movie.overview;
    }
    const movieRelease = document.getElementById('movie-release');
    if (movieRelease) {
      movieRelease.textContent =
        'Release date: ' + formatDateToUK(movie.release_date);
    }
    const movieRating = document.getElementById('movie-rating');
    if (movieRating) {
      movieRating.innerHTML = createStarRating(movie.vote_average);
    }
    const moviePoster = document.getElementById('movie-poster');
    if (moviePoster && posterUrl) {
      moviePoster.onload = function () {
        movieResult.scrollIntoView({ behavior: 'smooth', block: 'center' });
      };
      moviePoster.src = posterUrl;
      moviePoster.style.display = 'block';
    } else {
      movieResult.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
    // Update IMDb link
    updateImdbLink(movie);
    
  // Fetch and display streaming availability (region-aware)
  window.currentMovieId = movie.id;
  // keep the full movie object handy for deep-link generation
  window.currentMovie = movie;
  const region = getUserRegion();
  const streamingData = await getMovieStreamingData(movie.id, region);
  displayStreamingAvailability(streamingData, movie, region);
    
    // Show and update trailer button
    const trailerBtn = document.getElementById('trailer-btn');
    if (trailerBtn) {
      trailerBtn.style.display = 'inline-block';
      trailerBtn.onclick = () => {
        const query = encodeURIComponent(`${movie.title} trailer`);
        window.open(
          `https://www.youtube.com/results?search_query=${query}`,
          '_blank'
        );
      };
    }
  } else {
    const movieTitle = document.getElementById('movie-title');
    if (movieTitle) {
      movieTitle.textContent = "Sorry, we couldn't find a movie for you.";
    }
    const movieOverview = document.getElementById('movie-overview');
    if (movieOverview) {
      movieOverview.textContent = '';
    }
    const movieRelease = document.getElementById('movie-release');
    if (movieRelease) {
      movieRelease.textContent = '';
    }
    const movieRating = document.getElementById('movie-rating');
    if (movieRating) {
      movieRating.textContent = '';
    }
    const moviePoster = document.getElementById('movie-poster');
    if (moviePoster) {
      moviePoster.style.display = 'none';
    }
    const trailerBtn = document.getElementById('trailer-btn');
    if (trailerBtn) {
      trailerBtn.style.display = 'none';
    }
    const imdbLink = document.getElementById('imdb-link');
    if (imdbLink) {
      imdbLink.style.display = 'none';
    }
    movieResult.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }
}

async function fetchMovies() {
  // Server-side proxy will handle TMDb API key
  const url = `/api/tmdb/popular?page=1`;

  try {
    const response = await fetch(url);
    const data = await response.json();

    if (!data.results || !Array.isArray(data.results)) {
      throw new Error('Invalid movie data');
    }

    return data.results; // Return the list of movies
  } catch (error) {
    console.error('Error fetching movies:', error);
    return [];
  }
}

function applyFilters() {
  const genre = document.getElementById('genre').value;
  const minRating = parseFloat(document.getElementById('rating').value);

  // Store the current filter settings
  currentFilter = {
    genre: genre,
    minRating: minRating,
    isActive: true,
  };

  // Get a random movie with the new filter applied
  showRandomTMDbMovie();
}

function displayRandomFilteredMovie(movies) {
  const movieResult = document.getElementById('movie-result');
  if (!movieResult) {
    console.error('movie-result div not found');
    return;
  }

  if (movies.length > 0) {
    // Select a random movie from the filtered list
    const randomIndex = Math.floor(Math.random() * movies.length);
    const movie = movies[randomIndex];

    // Update existing elements instead of replacing innerHTML
    const movieTitle = document.getElementById('movie-title');
    if (movieTitle) {
      movieTitle.textContent = movie.title;
    }
    const movieOverview = document.getElementById('movie-overview');
    if (movieOverview) {
      movieOverview.textContent = movie.overview;
    }
    const movieRelease = document.getElementById('movie-release');
    if (movieRelease) {
      movieRelease.textContent =
        'Release date: ' + formatDateToUK(movie.release_date);
    }
    const movieRating = document.getElementById('movie-rating');
    if (movieRating) {
      movieRating.innerHTML = createStarRating(movie.vote_average);
    }
    const moviePoster = document.getElementById('movie-poster');
    if (moviePoster && movie.poster_path) {
      moviePoster.src = `https://image.tmdb.org/t/p/w500${movie.poster_path}`;
      moviePoster.style.display = 'block';
    }

    // Update IMDb link
    updateImdbLink(movie);

    // Show and update trailer button
    const trailerBtn = document.getElementById('trailer-btn');
    if (trailerBtn) {
      trailerBtn.style.display = 'inline-block';
      trailerBtn.onclick = () => {
        const query = encodeURIComponent(`${movie.title} trailer`);
        window.open(
          `https://www.youtube.com/results?search_query=${query}`,
          '_blank'
        );
      };
    }
  } else {
    // Clear content if no movies found
    const movieTitle = document.getElementById('movie-title');
    if (movieTitle) {
      movieTitle.textContent = 'No movies found matching the filter criteria.';
    }
    const movieOverview = document.getElementById('movie-overview');
    if (movieOverview) {
      movieOverview.textContent = '';
    }
    const movieRelease = document.getElementById('movie-release');
    if (movieRelease) {
      movieRelease.textContent = '';
    }
    const movieRating = document.getElementById('movie-rating');
    if (movieRating) {
      movieRating.textContent = '';
    }
    const moviePoster = document.getElementById('movie-poster');
    if (moviePoster) {
      moviePoster.style.display = 'none';
    }
    const trailerBtn = document.getElementById('trailer-btn');
    if (trailerBtn) {
      trailerBtn.style.display = 'none';
    }
    const imdbLink = document.getElementById('imdb-link');
    if (imdbLink) {
      imdbLink.style.display = 'none';
    }
  }

  // Show the movie-result div
  movieResult.style.display = 'block';
}

// Favorites system (localStorage) - use canonical 'favorites' key for compatibility
const FAV_KEY = 'favorites';

function loadFavorites() {
  try {
    const raw = localStorage.getItem(FAV_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (e) {
    console.error('Failed to load favorites', e);
    return [];
  }
}

function saveFavorites(list) {
  try {
    localStorage.setItem(FAV_KEY, JSON.stringify(list || []));
  } catch (e) {
    console.error('Failed to save favorites', e);
  }
}

function isFavorite(movieId) {
  const favs = loadFavorites();
  return favs.some((m) => m.id === movieId);
}

async function toggleFavorite(movie) {
  if (!movie || !movie.id) return;
  let favs = loadFavorites();
  const existing = favs.findIndex((m) => m.id === movie.id);
  if (existing >= 0) {
    favs.splice(existing, 1);
  } else {
    // Fetch external IDs to get IMDb ID
    const external = await getMovieExternalIDs(movie.id);
    const imdbId = external && external.imdb_id ? external.imdb_id : null;
    
    // Store a minimal snapshot
    // Store a compatible shape used by the standalone favorites page.
    favs.unshift({
      id: movie.id,
      title: movie.title,
      poster: movie.poster || '',
      poster_path: movie.poster_path || '',
      url: `movies.html?id=${movie.id}`,
      imdb_id: imdbId,
      addedAt: Date.now()
    });
    // keep list reasonable size
    if (favs.length > 200) favs = favs.slice(0, 200);
  }
  saveFavorites(favs);
  updateFavToggleUI(movie.id);
}

function updateFavToggleUI(currentMovieId) {
  const btn = document.getElementById('fav-toggle-btn');
  if (!btn) return;
  const heart = btn.querySelector('.heart-path');
  if (isFavorite(currentMovieId)) {
    btn.classList.add('fav-pressed');
    btn.setAttribute('aria-pressed', 'true');
    btn.setAttribute('aria-label', 'Remove from favorites');
    // visual fill handled via CSS transition in styles/main.css
    btn.title = 'Remove from favorites';
  } else {
    btn.classList.remove('fav-pressed');
    btn.setAttribute('aria-pressed', 'false');
    btn.setAttribute('aria-label', 'Save to favorites');
    // visual fill handled via CSS transition in styles/main.css
    btn.title = 'Save to favorites';
  }
}

// Wire up favorites buttons when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  const favToggle = document.getElementById('fav-toggle-btn');
  // open-favs is a semantic anchor now and intentionally has no in-page handler

  if (favToggle) {
    favToggle.addEventListener('click', async () => {
      // Toggle favorite for the current movie if present
      const movie = window.currentMovie || (window.currentMovieId ? { id: window.currentMovieId, title: document.getElementById('movie-title')?.textContent || '' } : null);
      if (movie) await toggleFavorite(movie);
    });
  }

  // Keep the fav toggle in-sync if user navigates between movies
  const nextBtn = document.getElementById('next-movie-btn');
  if (nextBtn) nextBtn.addEventListener('click', () => setTimeout(() => updateFavToggleUI(window.currentMovieId), 600));
  // The `open-favs` anchor intentionally has no JS handler so it always
  // navigates to `favorites.html`. Re-add an event listener here only if
  // you later reintroduce an in-page panel.
});


// Region is auto-detected by `getUserRegion()`; no UI override is provided.

// Initialize movie functionality
function initMovies() {
  // Next Movie button functionality
  const nextMovieBtn = document.getElementById('next-movie-btn');
  if (nextMovieBtn) {
    nextMovieBtn.onclick = function () {
      showRandomTMDbMovie();
    };
  }
}

// Make functions globally available
window.showRandomTMDbMovie = showRandomTMDbMovie;
window.applyFilters = applyFilters;
window.initMovies = initMovies;

// Initialize movies functionality when page loads
document.addEventListener('DOMContentLoaded', function() {
  initMovies();
});
