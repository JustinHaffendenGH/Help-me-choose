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

  // State for search filtering
  let currentSearchQuery = '';
  let currentListId = 'default';
  let activeModalItem = null;
  let activeModalType = null;

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

  async function readFavorites(type = 'movies'){
    if (window.StorageService) {
      return await window.StorageService.getFavorites(type);
    }
    return [];
  }

  async function saveFavorites(list, type = 'movies'){
    if (window.StorageService) {
      await window.StorageService.saveFavorites(list, type);
    }
  }

  async function renderListsNav() {
    if (!window.StorageService) return;
    const lists = await window.StorageService.getLists();
    const navContainer = document.getElementById('lists-nav-container');
    if (!navContainer) return;
    
    // Clear dynamic pills
    const dynamicPills = navContainer.querySelectorAll('.dynamic-pill');
    dynamicPills.forEach(p => p.remove());
    
    const insertBeforeTarget = document.getElementById('btn-create-list');
    
    // Add custom lists
    lists.forEach(list => {
      const btn = document.createElement('button');
      btn.className = `list-pill btn-secondary dynamic-pill ${currentListId === list.id ? 'active btn-primary' : ''}`;
      // Basic styling matching the existing pill
      btn.style.padding = '0.5rem 1rem';
      btn.style.borderRadius = '20px';
      if (currentListId === list.id) {
        btn.style.border = '1px solid var(--accent)';
        btn.style.background = 'var(--accent)';
      }
      btn.textContent = list.name;
      btn.dataset.listId = list.id;
      
      btn.addEventListener('click', () => {
        document.querySelectorAll('.list-pill').forEach(b => {
          b.classList.remove('active', 'btn-primary');
          b.classList.add('btn-secondary');
          b.style.border = '';
          b.style.background = '';
        });
        btn.classList.add('active', 'btn-primary');
        btn.classList.remove('btn-secondary');
        btn.style.border = '1px solid var(--accent)';
        btn.style.background = 'var(--accent)';
        currentListId = list.id;
        renderAllSections();
      });
      
      navContainer.insertBefore(btn, insertBeforeTarget);
    });
    
    // Wire up Default Pill
    const defaultPill = navContainer.querySelector('[data-list-id="default"]');
    if (defaultPill && !defaultPill.dataset.wired) {
      defaultPill.dataset.wired = 'true';
      defaultPill.addEventListener('click', () => {
        document.querySelectorAll('.list-pill').forEach(b => {
          b.classList.remove('active', 'btn-primary');
          b.classList.add('btn-secondary');
          b.style.border = '';
          b.style.background = '';
        });
        defaultPill.classList.add('active', 'btn-primary');
        defaultPill.classList.remove('btn-secondary');
        defaultPill.style.border = '1px solid var(--accent)';
        defaultPill.style.background = 'var(--accent)';
        currentListId = 'default';
        renderAllSections();
      });
    }
  }

  // Handle list folder assignment
  async function openListModal(item, type) {
    activeModalItem = item;
    activeModalType = type;
    const modal = document.getElementById('list-assign-modal');
    const checkboxesContainer = document.getElementById('list-assign-checkboxes');
    if (!modal || !checkboxesContainer || !window.StorageService) return;
    
    const lists = await window.StorageService.getLists();
    
    checkboxesContainer.innerHTML = '';
    
    if (lists.length === 0) {
      checkboxesContainer.innerHTML = '<p style="color: var(--text-muted);">You have no custom folders yet. Create one first!</p>';
    } else {
      lists.forEach(list => {
        const label = document.createElement('label');
        label.style.display = 'flex';
        label.style.alignItems = 'center';
        label.style.gap = '0.5rem';
        label.style.cursor = 'pointer';
        
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.value = list.id;
        // Check if item is already in list
        checkbox.checked = item.listIds && item.listIds.includes(list.id);
        
        checkbox.addEventListener('change', async (e) => {
           let favs = await readFavorites(activeModalType);
           let target = favs.find(f => f.id === activeModalItem.id);
           if (!target) return; // shouldn't happen
           if (!target.listIds) target.listIds = [];
           
           if (e.target.checked) {
             if (!target.listIds.includes(list.id)) target.listIds.push(list.id);
           } else {
             target.listIds = target.listIds.filter(id => id !== list.id);
           }
           
           // Keep memory synced for modal lifespan
           activeModalItem.listIds = target.listIds;
           await saveFavorites(favs, activeModalType);
        });
        
        label.appendChild(checkbox);
        label.append(list.name);
        checkboxesContainer.appendChild(label);
      });
    }
    
    modal.showModal();
  }

  // Set up Create Button & Modal Listeners
  function setupListModalListeners() {
    // New Folder creation dialog logic
    const createBtn = document.getElementById('btn-create-list');
    const folderModal = document.getElementById('new-folder-modal');
    const folderInput = document.getElementById('new-folder-input');
    const cancelFolderBtn = document.getElementById('cancel-folder-btn');
    const submitFolderBtn = document.getElementById('submit-folder-btn');

    if (createBtn && folderModal) {
      // Delegate opening modal
      createBtn.addEventListener('click', (e) => {
        e.preventDefault();
        if (folderInput) folderInput.value = '';
        folderModal.showModal();
        if (folderInput) folderInput.focus();
      });

      // Handle Cancel
      if (cancelFolderBtn) {
        cancelFolderBtn.addEventListener('click', (e) => {
          e.preventDefault();
          folderModal.close();
        });
      }

      // Handle Submit
      const submitFolder = async (e) => {
        if (e) e.preventDefault();
        const name = folderInput ? folderInput.value : '';
        if (name && name.trim()) {
           if (!window.StorageService) return;
           const lists = await window.StorageService.getLists();
           // Prevent exact duplicate names
           if (!lists.some(l => l.name.toLowerCase() === name.trim().toLowerCase())) {
             lists.push({ id: `list_${Date.now()}`, name: name.trim() });
             await window.StorageService.saveLists(lists);
             await renderListsNav();
           }
           folderModal.close();
        }
      };

      if (submitFolderBtn) submitFolderBtn.addEventListener('click', submitFolder);
      if (folderInput) {
        folderInput.addEventListener('keydown', (e) => {
          if (e.key === 'Enter') submitFolder(e);
        });
      }
    }
    
    // Existing Assigment Modal Close Button
    const closeBtn = document.getElementById('close-list-modal');
    if (closeBtn) {
      closeBtn.addEventListener('click', () => {
         const modal = document.getElementById('list-assign-modal');
         if (modal) modal.close();
         // Re-render in case filter hides it now
         renderAllSections();
      });
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
      // Fallback if poster fails to load
      img.addEventListener('error', function onImgErr() {
        img.removeEventListener('error', onImgErr);
        img.src = '/assets/cinema.png';
      });
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

    const listBtn = document.createElement('button');
    listBtn.textContent = '📁';
    listBtn.title = 'Add to folder';
    listBtn.className = 'small-btn secondary';
    listBtn.addEventListener('click', () => openListModal(item, 'movies'));

    actions.append(openLink, trailerBtn, listBtn, removeBtn);
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
      // Fallback if food image fails to load
      img.addEventListener('error', function onImgErr() {
        img.removeEventListener('error', onImgErr);
        img.src = '/assets/food.png';
      });

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

    const listBtn = document.createElement('button');
    listBtn.textContent = '📁';
    listBtn.title = 'Add to folder';
    listBtn.className = 'small-btn secondary';
    listBtn.addEventListener('click', () => openListModal(item, 'food'));

    actions.append(viewBtn, locationBtn, listBtn, removeBtn);
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
      // Fallback if book cover fails to load
      img.addEventListener('error', function onImgErr() {
        img.removeEventListener('error', onImgErr);
        img.src = '/assets/Read.svg';
      });

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

    const listBtn = document.createElement('button');
    listBtn.textContent = '📁';
    listBtn.title = 'Add to folder';
    listBtn.className = 'small-btn secondary';
    listBtn.addEventListener('click', () => openListModal(item, 'books'));

    actions.append(viewBtn, buyBtn, listBtn, removeBtn);
    meta.appendChild(actions);
    card.append(img, meta);
    return card;
  }

  async function renderSection(type){
    const grid = document.getElementById(`${type}-grid`);
    const countEl = document.getElementById(`${type}-count`);
    const empty = document.getElementById(`${type}-empty`);

    if(!grid) return;
    // Support runtime filtering
    const baseList = await readFavorites(type);
    
    // Apply list filtering first
    let listFilteredByTab = baseList;
    if (currentListId !== 'default') {
      listFilteredByTab = baseList.filter(item => item.listIds && item.listIds.includes(currentListId));
    }
    
    const query = (currentSearchQuery || '').trim().toLowerCase();
    let list = listFilteredByTab;
    if(query){
      list = listFilteredByTab.filter(item => {
        // gather searchable fields depending on type
        let haystack = '';
        if(type === 'movies'){
          haystack = [item.title, item.overview, item.tagline, item.genres && item.genres.join(' ')].filter(Boolean).join(' ').toLowerCase();
        } else if(type === 'food') {
          haystack = [item.name, item.cuisine, item.location, item.address, item.tags && item.tags.join(' ')].filter(Boolean).join(' ').toLowerCase();
        } else if(type === 'books') {
          const authors = Array.isArray(item.authors) ? item.authors.map(a => (a.name || a)).join(' ') : '';
          haystack = [item.title, authors, item.description, item.subtitle, item.categories && item.categories.join(' ')].filter(Boolean).join(' ').toLowerCase();
        }
        return haystack.includes(query);
      });
    }
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

  async function renderAllSections(){
    await renderListsNav();
    await Promise.all([
      renderSection('movies'),
      renderSection('food'),
      renderSection('books')
    ]);

    // Update meta info for search results
    if(currentSearchQuery){
      updateSearchMeta();
    } else {
      const meta = document.getElementById('favorites-search-meta');
      if(meta) meta.textContent = '';
    }
  }

  async function removeFavorite(id, type = 'movies'){
    const favs = await readFavorites(type);
    const list = favs.filter(i => i.id !== id);
    await saveFavorites(list, type);
    await renderSection(type);
  }

  async function clearSection(type){
    await saveFavorites([], type);
    await renderSection(type);
    const aria = document.getElementById('aria-live');
    if(aria) aria.textContent = `Cleared ${type} favorites`;
  }

  async function clearAllSections(){
    await saveFavorites([], 'movies');
    await saveFavorites([], 'food');
    await saveFavorites([], 'books');
    await renderAllSections();
    const aria = document.getElementById('aria-live');
    if(aria) aria.textContent = 'Cleared all favorites';
  }

  async function exportAll(){
    const data = {
      movies: await readFavorites('movies'),
      food: await readFavorites('food'),
      books: await readFavorites('books'),
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

  async function exportSection(type){
    const data = {
      [type]: await readFavorites(type),
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
    }
    
    // Run migration first
    migrateLegacyFavorites();

    // Section-specific controls
    ['movies', 'food', 'books'].forEach(type => {
      const clearBtn = document.querySelector(`[data-type="${type}"].clear-section-btn`);
      if (clearBtn) {
        clearBtn.addEventListener('click', ()=>{
          if(confirm(`Clear all ${type} favorites?`)) clearSection(type);
        });
      }
    });

    // --- Search / Filter wiring ---
    const searchInput = document.getElementById('favorites-search');
    const clearBtn = document.getElementById('favorites-search-clear');
    const meta = document.getElementById('favorites-search-meta');

    if(searchInput){
      searchInput.addEventListener('input', (e)=>{
        const val = e.target.value;
        currentSearchQuery = val;
        if(val){
          if(clearBtn) clearBtn.style.display = '';
        } else {
          if(clearBtn) clearBtn.style.display = 'none';
        }
        debouncedFilter();
      });
    }

    if(clearBtn){
      clearBtn.addEventListener('click', ()=>{
        currentSearchQuery = '';
        if(searchInput){
          searchInput.value = '';
          searchInput.focus();
        }
        clearBtn.style.display = 'none';
        renderAllSections();
      });
    }

    function updateNoResultsState(){
      // If query is active and every section is empty -> show a global no-results message
      const query = (currentSearchQuery || '').trim();
      let totalVisible = 0;
      ['movies','food','books'].forEach(type => {
        const grid = document.getElementById(`${type}-grid`);
        if(grid) totalVisible += grid.children.length;
      });
      if(meta){
        if(query && totalVisible === 0){
          meta.textContent = `No favorites match "${query}"`;
        }
      }
    }

    function updateSearchMeta(){
      const query = (currentSearchQuery || '').trim();
      if(!meta) return;
      if(!query){
        meta.textContent = '';
        return;
      }
      let counts = [];
      ['movies','food','books'].forEach(type => {
        const grid = document.getElementById(`${type}-grid`);
        if(grid){
          const len = grid.children.length;
          if(len) counts.push(`${len} ${type}`);
        }
      });
      if(counts.length){
        meta.textContent = `Showing ${counts.join(', ')} for "${query}"`;
      } else {
        meta.textContent = `No favorites match "${query}"`;
      }
    }
    window.updateSearchMeta = updateSearchMeta; // debug hook

    function filterNow(){
      renderAllSections();
      updateNoResultsState();
    }

    let filterTimer = null;
    function debouncedFilter(){
      if(filterTimer) clearTimeout(filterTimer);
      filterTimer = setTimeout(filterNow, 140); // small debounce
    }

    // expose for debugging
    window.forceFilterFavorites = filterNow;

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
  const initApp = () => {
    wireUp();
    setupListModalListeners(); // Attach modal logic immediately
    const waitAuth = () => {
      if (window.StorageService) {
        window.StorageService.onAuthChange((user) => {
          renderAllSections();
        });
      } else {
        setTimeout(waitAuth, 50);
      }
    };
    waitAuth();
  };

  if(document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', initApp);
  } else {
    initApp();
  }

})();
