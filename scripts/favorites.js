// scripts/favorites.js
(function(){
  'use strict';

  const STORAGE_KEY = 'favorites';

  function readFavorites(){
    try{
      const raw = localStorage.getItem(STORAGE_KEY) || '[]';
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [];
    }catch(e){
      console.error('Failed to parse favorites from localStorage', e);
      return [];
    }
  }

  function saveFavorites(list){
    try{
      localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
    }catch(e){
      console.error('Failed to save favorites', e);
    }
  }

  function createCard(item){
    const card = document.createElement('article');
    card.className = 'favorite-card';
    card.setAttribute('role','listitem');

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
    } else {
      openLink.href = item.url || (item.id ? `movies.html?id=${item.id}` : '#');
    }
    openLink.textContent = item.imdb_id ? 'IMDb' : 'Open';
    openLink.className = 'small-btn';

    const removeBtn = document.createElement('button');
    removeBtn.textContent = 'Remove';
    removeBtn.className = 'small-btn secondary';
    removeBtn.addEventListener('click', ()=>{
      removeFavorite(item.id);
      // after removal, move focus sensibly
      setTimeout(()=>{
        const next = card.nextElementSibling || document.getElementById('clear-all');
        if(next) next.focus();
      }, 40);
    });

    actions.append(openLink, removeBtn);
    meta.appendChild(actions);
    card.append(img, meta);
    return card;
  }

  function renderFavorites(list){
    const root = document.getElementById('favorites-root');
    const countEl = document.getElementById('favorites-count');
    const empty = document.getElementById('empty-state');
    const aria = document.getElementById('aria-live');

    if(!root) return;
    root.innerHTML = '';
    
    if(!list || list.length === 0){
      if(empty) empty.style.display = '';
      if(countEl) countEl.textContent = `(0)`;
      if(aria) aria.textContent = 'No favorites';
      return;
    }

    if(empty) empty.style.display = 'none';
    if(countEl) countEl.textContent = `(${list.length})`;
    if(aria) aria.textContent = `${list.length} favorites`;

    const wrapper = document.createElement('div');
    wrapper.className = 'favorites-grid';
    wrapper.setAttribute('role','list');

    list.forEach(item => {
      const c = createCard(item);
      wrapper.appendChild(c);
    });

    root.appendChild(wrapper);
  }

  function removeFavorite(id){
    const list = readFavorites().filter(i => i.id !== id);
    saveFavorites(list);
    renderFavorites(list);
  }

  function clearAll(){
    saveFavorites([]);
    renderFavorites([]);
    const aria = document.getElementById('aria-live');
    if(aria) aria.textContent = 'Cleared all favorites';
  }

  function exportJSON(){
    const list = readFavorites();
    const blob = new Blob([JSON.stringify(list, null, 2)], {type:'application/json'});
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'favorites.json';
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }

  function importJSON(file){
    if(!file) return;
    const reader = new FileReader();
    reader.onload = function(e){
      try{
        const parsed = JSON.parse(e.target.result);
        if(Array.isArray(parsed)){
          saveFavorites(parsed);
          renderFavorites(parsed);
          const aria = document.getElementById('aria-live');
          if(aria) aria.textContent = 'Imported favorites';
        } else {
          alert('Imported file must be an array of favorites');
        }
      }catch(err){
        alert('Failed to import JSON: ' + err.message);
      }
    };
    reader.readAsText(file);
  }

  function wireUp(){
    const clearBtn = document.getElementById('clear-all');
    const exportBtn = document.getElementById('export-json');
    const importInput = document.getElementById('import-file');
    
    if (clearBtn) {
      clearBtn.addEventListener('click', ()=>{
        if(confirm('Clear all favorites?')) clearAll();
      });
    }
    
    if (exportBtn) {
      exportBtn.addEventListener('click', exportJSON);
    }
    
    if (importInput) {
      importInput.addEventListener('change', function(){
        const f = this.files && this.files[0];
        importJSON(f);
        this.value = '';
      });
    }

    // initial render
    renderFavorites(readFavorites());
  }

  // initialize when DOM ready
  if(document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', wireUp);
  } else {
    wireUp();
  }

})();
