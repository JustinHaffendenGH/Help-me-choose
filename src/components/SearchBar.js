import { createElement, on, addClass, removeClass } from '../utils/index.js';

/**
 * SearchBar Component - Reusable search input with debouncing
 *
 * Features:
 * - Real-time search with debouncing
 * - Clear button
 * - Placeholder support
 * - Event callbacks
 *
 * @example
 * const search = new SearchBar({
 *   placeholder: 'Search movies...',
 *   debounceDelay: 300,
 *   onSearch: (query) => console.log('Searching:', query),
 *   onClear: () => console.log('Cleared')
 * });
 * document.body.appendChild(search.render());
 */
export class SearchBar {
  constructor(options = {}) {
    this.placeholder = options.placeholder || 'Search...';
    this.debounceDelay = options.debounceDelay || 300;
    this.value = options.value || '';
    this.searchIcon = options.searchIcon || '🔍';
    this.clearIcon = options.clearIcon || '✕';

    // Callbacks
    this.onSearch = options.onSearch || (() => {});
    this.onClear = options.onClear || (() => {});
    this.onChange = options.onChange || (() => {});

    this.element = null;
    this.input = null;
    this.debounceTimer = null;
  }

  /**
   * Render the search bar
   * @returns {HTMLElement} The rendered search bar
   */
  render() {
    this.element = createElement('div', {
      class: 'search-bar',
    });

    // Search icon
    const icon = createElement('span', { class: 'search-icon' });
    icon.textContent = this.searchIcon;
    this.element.appendChild(icon);

    // Input field
    this.input = createElement('input', {
      type: 'text',
      class: 'search-input',
      placeholder: this.placeholder,
      value: this.value,
    });

    on(this.input, 'input', (e) => {
      this.value = e.target.value;
      this.onChange(this.value);
      this.updateClearButton();
      this.debounce(() => {
        this.onSearch(this.value);
      });
    });

    on(this.input, 'keydown', (e) => {
      if (e.key === 'Escape') {
        this.clear();
      }
    });

    this.element.appendChild(this.input);

    // Clear button
    const clearBtn = createElement('button', {
      class: 'search-clear-btn',
      type: 'button',
      title: 'Clear search',
    });
    clearBtn.innerHTML = this.clearIcon;
    clearBtn.style.display = this.value ? 'flex' : 'none';

    on(clearBtn, 'click', () => {
      this.clear();
    });

    this.element.appendChild(clearBtn);
    this.clearBtn = clearBtn;

    return this.element;
  }

  /**
   * Debounce function calls
   * @private
   */
  debounce(fn) {
    clearTimeout(this.debounceTimer);
    this.debounceTimer = setTimeout(fn, this.debounceDelay);
  }

  /**
   * Update clear button visibility
   * @private
   */
  updateClearButton() {
    if (this.clearBtn) {
      this.clearBtn.style.display = this.value ? 'flex' : 'none';
    }
  }

  /**
   * Clear search field
   */
  clear() {
    this.value = '';
    if (this.input) {
      this.input.value = '';
      this.input.focus();
    }
    this.updateClearButton();
    this.onClear();
  }

  /**
   * Set search value
   * @param {string} value - New value
   */
  setValue(value) {
    this.value = value;
    if (this.input) {
      this.input.value = value;
    }
    this.updateClearButton();
  }

  /**
   * Get search value
   * @returns {string} Current search value
   */
  getValue() {
    return this.value;
  }

  /**
   * Focus input
   */
  focus() {
    if (this.input) {
      this.input.focus();
    }
  }

  /**
   * Destroy search bar
   */
  destroy() {
    clearTimeout(this.debounceTimer);
    if (this.element && this.element.parentNode) {
      this.element.parentNode.removeChild(this.element);
    }
    this.element = null;
    this.input = null;
  }
}

export default SearchBar;
