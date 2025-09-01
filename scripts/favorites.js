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
    img.width = 120;
    img.height = 180;

    const title = document.createElement('h3');
    title.textContent = item.title || 'Untitled';

  const openLink = document.createElement('a');
  // prefer explicit url saved by movies.js, otherwise fall back to id-based link
  openLink.href = item.url || (item.id ? `movies.html?id=${item.id}` : '#');
    openLink.textContent = 'Open';
    openLink.className = 'home-btn';
    openLink.style.marginRight = '0.5rem';

    const removeBtn = document.createElement('button');
    removeBtn.textContent = 'Remove';
    removeBtn.className = 'apply-filters-btn';
    removeBtn.addEventListener('click', ()=>{
      removeFavorite(item.id);
      // after removal, move focus sensibly
      setTimeout(()=>{
        const next = card.nextElementSibling || document.getElementById('clear-all');
        if(next) next.focus();
      }, 40);
    });

    const meta = document.createElement('div');
    meta.className = 'favorite-meta';
    meta.append(openLink, removeBtn);

    card.append(img, title, meta);
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
      empty.style.display = '';
      countEl.textContent = `(0)`;
      aria.textContent = 'No favorites';
      return;
    }

    empty.style.display = 'none';
    countEl.textContent = `(${list.length})`;
    aria.textContent = `${list.length} favorites`; // announce

    const wrapper = document.createElement('div');
    wrapper.setAttribute('role','list');
    wrapper.style.display = 'grid';
    wrapper.style.gridTemplateColumns = 'repeat(auto-fit, minmax(220px, 1fr))';
    wrapper.style.gap = '1rem';

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
    document.getElementById('clear-all').addEventListener('click', ()=>{
      if(confirm('Clear all favorites?')) clearAll();
    });
    document.getElementById('export-json').addEventListener('click', exportJSON);
    document.getElementById('import-file').addEventListener('change', function(){
      const f = this.files && this.files[0];
      importJSON(f);
      this.value = '';
    });

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
