// scripts/favorites.js
(function(){
  'use strict';

  const UI_VERSION = '2.2.0'; // Increment when making structural UI changes
  console.log('[favorites.js] UI version loaded:', UI_VERSION);

  const STORAGE_KEYS = {
    movies: 'favorites-movies',
    food: 'favorites-food',
    books: 'favorites-books',
    legacy: 'favorites'
  };

  // Migration function for legacy favorites
  function migrateLegacyFavorites(){
    try{
      const legacyData = localStorage.getItem(STORAGE_KEYS.legacy);
      if(legacyData){
        console.log('Migrating legacy favorites to new system...');
        const parsed = JSON.parse(legacyData);
        if(Array.isArray(parsed) && parsed.length > 0){
          // Migrate to movies favorites
          localStorage.setItem(STORAGE_KEYS.movies, JSON.stringify(parsed));
          localStorage.removeItem(STORAGE_KEYS.legacy);
          console.log(`Migrated ${parsed.length} movie favorites`);
        }
      }
    }catch(e){
      console.error('Failed to migrate legacy favorites', e);
    }
  }

  function readFavorites(type = 'movies'){
    try{
      const key = STORAGE_KEYS[type];
      if(!key){
        console.error(`Invalid favorites type: ${type}`);
        return [];
      }
      const raw = localStorage.getItem(key) || '[]';
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [];
    }catch(e){
      console.error(`Failed to parse ${type} favorites from localStorage`, e);
      return [];
    }
  }

  function saveFavorites(list, type = 'movies'){
    try{
      const key = STORAGE_KEYS[type];
      if(!key){
        console.error(`Invalid favorites type: ${type}`);
        return;
      }
      localStorage.setItem(key, JSON.stringify(list));
    }catch(e){
      console.error(`Failed to save ${type} favorites`, e);
    }
  }

  function createCard(item, type = 'movies'){
    switch(type){
      case 'movies':
        return createMovieCard(item);
      case 'food':
        return createFoodCard(item);
      case 'books':
        return createBookCard(item);
      default:
        console.error(`Unknown card type: ${type}`);
        return createMovieCard(item);
    }
  }

  function createMovieCard(item){
    const card = document.createElement('article');
    card.className = 'favorite-card movie-card';
    card.setAttribute('role','listitem');
    card.dataset.favKind = 'movie';

    const img = document.createElement('img');
    // prefer `poster` (site-friendly path), fallback to `poster_path` (TMDb path)
    if (item.poster) {
      img.src = item.poster;
    } else if (item.poster_path) {
      img.src = item.poster_path.startsWith('http') ? item.poster_path : `https://image.tmdb.org/t/p/w500${item.poster_path}`;
    } else {
      img.src = '';
    }
    img.alt = item.title ? `${item.title} poster` : 'Poster';
    img.loading = 'lazy';

    const meta = document.createElement('div');
    meta.className = 'meta';

    const title = document.createElement('h3');
    title.className = 'title';
    title.textContent = item.title || 'Untitled';

    meta.appendChild(title);

    const actions = document.createElement('div');
    actions.className = 'actions';

    const openLink = document.createElement('a');
    // Create IMDB link if we have an imdb_id, otherwise use movie page
    if (item.imdb_id) {
      openLink.href = `https://www.imdb.com/title/${item.imdb_id}`;
      openLink.target = '_blank';
      openLink.rel = 'noopener noreferrer';
      openLink.textContent = 'IMDb';
      openLink.className = 'small-btn imdb-btn';
    } else {
      openLink.href = item.url || (item.id ? `movies.html?id=${item.id}` : '#');
      openLink.textContent = 'Open';
      openLink.className = 'small-btn';
    }

    // Add trailer button for movies (only if we have a movie ID)
    const trailerBtn = document.createElement('button');
    trailerBtn.textContent = 'Trailer';
    trailerBtn.className = 'small-btn trailer-btn';
    trailerBtn.addEventListener('click', () => {
      if (item.id) {
        watchTrailer(item);
      } else {
        // Fallback to YouTube search if no ID available
        const query = encodeURIComponent(`${item.title} trailer`);
        window.open(`https://www.youtube.com/results?search_query=${query}`, '_blank');
      }
    });

    const removeBtn = document.createElement('button');
    removeBtn.textContent = 'Remove';
    removeBtn.className = 'small-btn secondary';
    removeBtn.addEventListener('click', ()=>{
      removeFavorite(item.id, 'movies');
      // after removal, move focus sensibly
      setTimeout(()=>{
        const next = card.nextElementSibling || document.getElementById('clear-all');
        if(next) next.focus();
      }, 40);
    });

    actions.append(openLink, trailerBtn, removeBtn);
    meta.appendChild(actions);
    card.append(img, meta);
    return card;
  }

  function createFoodCard(item){
    const card = document.createElement('article');
    card.className = 'favorite-card food-card';
    card.setAttribute('role','listitem');
    card.dataset.favKind = 'food';

    const img = document.createElement('img');
    img.src = item.image || 'assets/food.png';
    img.alt = item.name ? `${item.name}` : 'Food';
    img.loading = 'lazy';

    const meta = document.createElement('div');
    meta.className = 'meta';

    const title = document.createElement('h3');
    title.className = 'title';
    title.textContent = item.name || 'Untitled';

    meta.appendChild(title);

    // Add cuisine and rating info below title  
    if (item.cuisine) {
      const cuisine = document.createElement('div');
      cuisine.className = 'cuisine-badge';
      cuisine.textContent = item.cuisine;
      meta.appendChild(cuisine);
    }

    if (item.rating) {
      const rating = document.createElement('div');
      rating.className = 'rating';
      rating.innerHTML = `⭐ ${item.rating}`;
      meta.appendChild(rating);
    }

    const actions = document.createElement('div');
    actions.className = 'actions';

    // View/Open button (similar to IMDb button for movies)
    const viewBtn = document.createElement('a');
    if (item.url) {
      viewBtn.href = item.url;
      viewBtn.target = '_blank';
      viewBtn.rel = 'noopener noreferrer';
      viewBtn.textContent = 'View';
      viewBtn.className = 'small-btn';
    } else {
      viewBtn.href = 'food.html';
      viewBtn.textContent = 'Browse';
      viewBtn.className = 'small-btn';
    }

    // Maps/Location button (if we have location data)
    const locationBtn = document.createElement('button');
    locationBtn.textContent = 'Location';
    locationBtn.className = 'small-btn location-btn';
    locationBtn.addEventListener('click', () => {
      if (item.address || item.location) {
        const query = encodeURIComponent(`${item.name} ${item.address || item.location || ''}`);
        window.open(`https://www.google.com/maps/search/${query}`, '_blank');
      } else {
        alert('Location information not available');
      }
    });

    const removeBtn = document.createElement('button');
    removeBtn.textContent = 'Remove';
    removeBtn.className = 'small-btn secondary';
    removeBtn.addEventListener('click', ()=>{
      removeFavorite(item.id, 'food');
      setTimeout(()=>{
        const next = card.nextElementSibling || document.getElementById('clear-all');
        if(next) next.focus();
      }, 40);
    });

    actions.append(viewBtn, locationBtn, removeBtn);
    meta.appendChild(actions);
    card.append(img, meta);
    return card;
  }

  function createBookCard(item){
    const card = document.createElement('article');
    card.className = 'favorite-card book-card';
    card.setAttribute('role','listitem');
    card.dataset.favKind = 'book';

    const img = document.createElement('img');
    img.src = item.cover || 'assets/books.png';
    img.alt = item.title ? `${item.title} cover` : 'Book cover';
    img.loading = 'lazy';

    const meta = document.createElement('div');
    meta.className = 'meta';

    const title = document.createElement('h3');
    title.className = 'title';
    title.textContent = item.title || 'Untitled';

    meta.appendChild(title);

    // Add author info below title
    if (item.authors && item.authors.length > 0) {
      const authors = document.createElement('div');
      authors.className = 'authors';
      const authorNames = item.authors.map(a => a.name || a).join(', ');
      authors.textContent = `by ${authorNames}`;
      meta.appendChild(authors);
    }

    // Add rating if available
    if (item.rating) {
      const rating = document.createElement('div');
      rating.className = 'rating';
      rating.innerHTML = `⭐ ${item.rating}`;
      meta.appendChild(rating);
    }

    const actions = document.createElement('div');
    actions.className = 'actions';

    // View/Details button (similar to IMDb button for movies)
    const viewBtn = document.createElement('a');
    if (item.isbn || item.googleId) {
      // Link to Google Books or other book service
      const bookId = item.googleId || item.isbn;
      viewBtn.href = `https://books.google.com/books?id=${bookId}`;
      viewBtn.target = '_blank';
      viewBtn.rel = 'noopener noreferrer';
      viewBtn.textContent = 'View';
      viewBtn.className = 'small-btn';
    } else {
      viewBtn.href = 'books.html';
      viewBtn.textContent = 'Browse';
      viewBtn.className = 'small-btn';
    }

    // Buy/Find button
    const buyBtn = document.createElement('button');
    buyBtn.textContent = 'Find';
    buyBtn.className = 'small-btn buy-btn';
    buyBtn.addEventListener('click', () => {
      const query = encodeURIComponent(`${item.title} ${item.authors ? 'by ' + item.authors.map(a => a.name || a).join(' ') : ''} buy book`);
      window.open(`https://www.google.com/search?q=${query}`, '_blank');
    });

    const removeBtn = document.createElement('button');
    removeBtn.textContent = 'Remove';
    removeBtn.className = 'small-btn secondary';
    removeBtn.addEventListener('click', ()=>{
      removeFavorite(item.id, 'books');
      setTimeout(()=>{
        const next = card.nextElementSibling || document.getElementById('clear-all');
        if(next) next.focus();
      }, 40);
    });

    actions.append(viewBtn, buyBtn, removeBtn);
    meta.appendChild(actions);
    card.append(img, meta);
    return card;
  }

  function renderSection(type){
    const grid = document.getElementById(`${type}-grid`);
    const countEl = document.getElementById(`${type}-count`);
    const empty = document.getElementById(`${type}-empty`);

    if(!grid) return;

    const list = readFavorites(type);
    grid.innerHTML = '';

    if(countEl) countEl.textContent = `(${list.length})`;

    if(!list || list.length === 0){
      if(empty) empty.style.display = '';
      return;
    }

    if(empty) empty.style.display = 'none';

    list.forEach(item => {
      const card = createCard(item, type);
      grid.appendChild(card);
    });
  }

  function renderAllSections(){
    renderSection('movies');
    renderSection('food');
    renderSection('books');
  }

  function removeFavorite(id, type = 'movies'){
    const list = readFavorites(type).filter(i => i.id !== id);
    saveFavorites(list, type);
    renderSection(type);
  }

  function clearSection(type){
    saveFavorites([], type);
    renderSection(type);
    const aria = document.getElementById('aria-live');
    if(aria) aria.textContent = `Cleared ${type} favorites`;
  }

  function clearAllSections(){
    saveFavorites([], 'movies');
    saveFavorites([], 'food');
    saveFavorites([], 'books');
    renderAllSections();
    const aria = document.getElementById('aria-live');
    if(aria) aria.textContent = 'Cleared all favorites';
  }

  function exportAll(){
    const data = {
      movies: readFavorites('movies'),
      food: readFavorites('food'),
      books: readFavorites('books'),
      exportDate: new Date().toISOString(),
      version: '2.0'
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], {type:'application/json'});
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'all-favorites.json';
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }

  function exportSection(type){
    const data = {
      [type]: readFavorites(type),
      exportDate: new Date().toISOString(),
      version: '2.0'
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], {type:'application/json'});
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${type}-favorites.json`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }

  function importFavorites(file){
    if(!file) return;
    const reader = new FileReader();
    reader.onload = function(e){
      try{
        const parsed = JSON.parse(e.target.result);
        
        // Handle legacy format (array of movies)
        if(Array.isArray(parsed)){
          saveFavorites(parsed, 'movies');
          renderSection('movies');
          const aria = document.getElementById('aria-live');
          if(aria) aria.textContent = 'Imported movie favorites';
          return;
        }
        
        // Handle new format (object with multiple types)
        if(parsed.movies){
          saveFavorites(parsed.movies, 'movies');
        }
        if(parsed.food){
          saveFavorites(parsed.food, 'food');
        }
        if(parsed.books){
          saveFavorites(parsed.books, 'books');
        }
        
        renderAllSections();
        const aria = document.getElementById('aria-live');
        if(aria) aria.textContent = 'Imported all favorites successfully';
      }catch(err){
        alert('Failed to import JSON: ' + err.message);
      }
    };
    reader.readAsText(file);
  }

  function wireUp(){
    // Check if we need to force re-render due to code updates
    const currentVersion = '2.2.0';
    const lastVersion = localStorage.getItem('favorites-ui-version');
    if (lastVersion !== currentVersion) {
      console.log('Updating favorites UI to version', currentVersion);
      localStorage.setItem('favorites-ui-version', currentVersion);
      // Force re-render after version update
      setTimeout(() => renderAllSections(), 100);
    }
    
    // Run migration first
    migrateLegacyFavorites();

    // Global controls
    const clearAllBtn = document.getElementById('clear-all-types');
    const exportAllBtn = document.getElementById('export-all');
    const importInput = document.getElementById('import-all');
    
    if (clearAllBtn) {
      clearAllBtn.addEventListener('click', ()=>{
        if(confirm('Clear all favorites across all sections?')) clearAllSections();
      });
    }
    
    if (exportAllBtn) {
      exportAllBtn.addEventListener('click', exportAll);
    }
    
    if (importInput) {
      importInput.addEventListener('change', function(){
        const f = this.files && this.files[0];
        importFavorites(f);
        this.value = '';
      });
    }

    // Section-specific controls
    ['movies', 'food', 'books'].forEach(type => {
      const clearBtn = document.querySelector(`[data-type="${type}"].clear-section-btn`);
      if (clearBtn) {
        clearBtn.addEventListener('click', ()=>{
          if(confirm(`Clear all ${type} favorites?`)) clearSection(type);
        });
      }
    });

  // Trailer functionality (copied from movies.js for favorites page)
  async function getMovieTrailer(movieId) {
    try {
      const response = await fetch(`/api/tmdb/movie/${movieId}/videos`);
      const data = await response.json();
      
      if (data.results && data.results.length > 0) {
        // Look for YouTube trailers first, then teasers, then any video
        const trailer = data.results.find(video => 
          video.site === 'YouTube' && 
          (video.type === 'Trailer' || video.type === 'Teaser')
        ) || data.results.find(video => video.site === 'YouTube') || data.results[0];
        
        return trailer;
      }
      return null;
    } catch (error) {
      console.error('Error fetching movie trailer:', error);
      return null;
    }
  }

  function openTrailerModal(videoKey, movieTitle) {
    const modal = document.getElementById('trailer-modal');
    const iframe = document.getElementById('trailer-iframe');
    const titleElement = document.getElementById('trailer-title');
    
    if (!modal || !iframe) return;
    
    // Set the YouTube embed URL
    const embedUrl = `https://www.youtube.com/embed/${videoKey}?autoplay=1&rel=0&modestbranding=1`;
    iframe.src = embedUrl;
    
    // Update title
    if (titleElement && movieTitle) {
      titleElement.textContent = `${movieTitle} - Trailer`;
    }
    
    // Show modal with animation
    modal.style.display = 'flex';
    // Force reflow before adding show class for smooth animation
    modal.offsetHeight;
    modal.classList.add('show');
    
    // Prevent body scrolling
    document.body.style.overflow = 'hidden';
  }

  function closeTrailerModal() {
    const modal = document.getElementById('trailer-modal');
    const iframe = document.getElementById('trailer-iframe');
    
    if (!modal) return;
    
    // Hide modal with animation
    modal.classList.remove('show');
    
    setTimeout(() => {
      modal.style.display = 'none';
      // Stop video playback by clearing src
      if (iframe) {
        iframe.src = '';
      }
      // Restore body scrolling
      document.body.style.overflow = '';
    }, 300); // Match CSS transition duration
  }

  async function watchTrailer(movie) {
    if (!movie || !movie.id) {
      alert('Sorry, trailer information is not available for this movie.');
      return;
    }
    
    // Find the trailer button that was clicked and show loading state
    const trailerBtns = document.querySelectorAll('.trailer-btn');
    let clickedBtn = null;
    
    // Find which button was clicked by looking for the movie with matching ID
    trailerBtns.forEach(btn => {
      const card = btn.closest('.favorite-card');
      const titleElement = card?.querySelector('.title');
      if (titleElement && titleElement.textContent === movie.title) {
        clickedBtn = btn;
      }
    });
    
    if (clickedBtn) {
      clickedBtn.textContent = 'Loading...';
      clickedBtn.disabled = true;
    }
    
    try {
      const trailer = await getMovieTrailer(movie.id);
      
      if (trailer && trailer.key) {
        openTrailerModal(trailer.key, movie.title);
      } else {
        // Fallback to YouTube search if no trailer found
        const query = encodeURIComponent(`${movie.title} trailer`);
        window.open(`https://www.youtube.com/results?search_query=${query}`, '_blank');
      }
    } catch (error) {
      console.error('Error playing trailer:', error);
      alert('Sorry, we couldn\'t load the trailer. Please try again later.');
    } finally {
      // Restore button state
      if (clickedBtn) {
        clickedBtn.textContent = 'Trailer';
        clickedBtn.disabled = false;
      }
    }
  }

  // Close modal when clicking outside or pressing Escape
  document.addEventListener('click', function(e) {
    const modal = document.getElementById('trailer-modal');
    if (e.target === modal) {
      closeTrailerModal();
    }
  });

  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
      closeTrailerModal();
    }
  });

  // Make trailer functions globally available
  window.closeTrailerModal = closeTrailerModal;
  window.watchTrailer = watchTrailer;
  
  // Force re-render function for testing
  window.forceRerenderFavorites = function() {
    console.log('Force re-rendering all favorites...');
    renderAllSections();
  };

    // Initial render
    renderAllSections();

    // Fallback: ensure a second re-render after load to defeat any stale cached markup scenarios
    setTimeout(() => {
      const movieCards = document.querySelectorAll('.favorite-card.movie-card');
      const foodCards = document.querySelectorAll('.favorite-card.food-card');
      const bookCards = document.querySelectorAll('.favorite-card.book-card');
      // If we somehow have fewer enhanced elements for food/books but movies exist, re-render
      if (movieCards.length && (foodCards.length || bookCards.length)) {
        // Check for missing action buttons (heuristic)
        const needsFoodUpgrade = Array.from(foodCards).some(c => !c.querySelector('.actions'));
        const needsBookUpgrade = Array.from(bookCards).some(c => !c.querySelector('.actions'));
        if (needsFoodUpgrade || needsBookUpgrade) {
          console.log('[favorites.js] Detected incomplete upgrade, forcing secondary re-render');
          renderAllSections();
        }
      }
    }, 400);
  }

  // Initialize when DOM ready
  if(document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', wireUp);
  } else {
    wireUp();
  }

})();
