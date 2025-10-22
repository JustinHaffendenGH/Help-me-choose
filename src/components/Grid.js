import { createElement, on } from '../utils/index.js';

/**
 * Grid Component - Responsive grid layout for displaying multiple cards
 *
 * Features:
 * - Auto-fit responsive columns
 * - Customizable gap and column width
 * - Support for different grid layouts
 * - Handles empty state
 *
 * @example
 * const grid = new Grid({
 *   columns: 4,
 *   gap: '1.5rem',
 *   items: cardComponents
 * });
 * document.body.appendChild(grid.render());
 */
export class Grid {
  constructor(options = {}) {
    this.columns = options.columns || 4;
    this.gap = options.gap || '1.5rem';
    this.items = options.items || [];
    this.minWidth = options.minWidth || '250px';
    this.autoFit = options.autoFit !== false; // Auto-fit by default
    this.element = null;
  }

  /**
   * Render the grid
   * @returns {HTMLElement} The rendered grid
   */
  render() {
    this.element = createElement('div', {
      class: 'grid',
    });

    // Set grid CSS custom properties
    if (this.autoFit) {
      this.element.style.setProperty(
        '--grid-template',
        `auto-fit(minmax(${this.minWidth}, 1fr))`
      );
    } else {
      this.element.style.setProperty(
        '--grid-template',
        `repeat(${this.columns}, 1fr)`
      );
    }
    this.element.style.setProperty('--grid-gap', this.gap);

    if (this.items.length === 0) {
      const empty = createElement('div', { class: 'grid-empty' });
      empty.textContent = 'No items found';
      this.element.appendChild(empty);
    } else {
      this.items.forEach((item) => {
        const itemElement = typeof item.render === 'function' 
          ? item.render() 
          : item;
        this.element.appendChild(itemElement);
      });
    }

    return this.element;
  }

  /**
   * Add item to grid
   * @param {Card|HTMLElement} item - Item to add
   * @param {number} index - Position to insert (optional)
   */
  addItem(item, index = null) {
    if (index !== null && index < this.items.length) {
      this.items.splice(index, 0, item);
    } else {
      this.items.push(item);
    }

    if (this.element) {
      this.rerender();
    }
  }

  /**
   * Remove item from grid
   * @param {number} index - Index to remove
   */
  removeItem(index) {
    if (index >= 0 && index < this.items.length) {
      this.items.splice(index, 1);
      if (this.element) {
        this.rerender();
      }
    }
  }

  /**
   * Clear all items
   */
  clear() {
    this.items = [];
    if (this.element) {
      this.element.innerHTML = '';
      const empty = createElement('div', { class: 'grid-empty' });
      empty.textContent = 'No items found';
      this.element.appendChild(empty);
    }
  }

  /**
   * Update items and rerender
   * @param {Array} items - New items
   */
  setItems(items) {
    this.items = items || [];
    if (this.element) {
      this.rerender();
    }
  }

  /**
   * Update grid columns
   * @param {number} columns - Number of columns
   */
  setColumns(columns) {
    this.columns = columns;
    if (this.element) {
      this.element.style.setProperty(
        '--grid-template',
        `repeat(${this.columns}, 1fr)`
      );
    }
  }

  /**
   * Re-render grid
   * @private
   */
  rerender() {
    if (!this.element) return;

    const parent = this.element.parentNode;
    if (parent) {
      parent.replaceChild(this.render(), this.element);
    }
  }

  /**
   * Get current items
   * @returns {Array} Items in grid
   */
  getItems() {
    return [...this.items];
  }

  /**
   * Get item count
   * @returns {number} Number of items
   */
  getCount() {
    return this.items.length;
  }

  /**
   * Destroy grid
   */
  destroy() {
    if (this.element && this.element.parentNode) {
      this.element.parentNode.removeChild(this.element);
    }
    this.element = null;
    this.items = [];
  }
}

export default Grid;
