import { createElement, on, addClass, removeClass } from '../utils/index.js';

/**
 * Card Component - Reusable card for displaying content items
 *
 * Variants: 'movie', 'food', 'book'
 * Supports images, titles, descriptions, ratings, and action buttons
 *
 * @example
 * const card = new Card({
 *   variant: 'movie',
 *   title: 'Inception',
 *   image: '/path/to/image.jpg',
 *   rating: 8.8,
 *   description: 'A mind-bending thriller',
 *   data: { id: 'tt1375666' },
 *   onFavorite: (item) => console.log('Favorited:', item)
 * });
 * document.body.appendChild(card.render());
 */
export class Card {
  constructor(options = {}) {
    this.variant = options.variant || 'movie'; // 'movie', 'food', 'book'
    this.title = options.title || 'Untitled';
    this.image = options.image || '';
    this.rating = options.rating || null;
    this.description = options.description || '';
    this.data = options.data || {};
    this.isFavorited = options.isFavorited || false;

    // Callbacks
    this.onFavorite = options.onFavorite || (() => {});
    this.onClick = options.onClick || (() => {});

    this.element = null;
  }

  /**
   * Render the card element
   * @returns {HTMLElement} The rendered card
   */
  render() {
    this.element = createElement('div', {
      class: `card card-${this.variant}`,
    });

    // Image container
    const imageContainer = createElement('div', { class: 'card-image-container' });
    if (this.image) {
      const img = createElement('img', {
        class: 'card-image',
        src: this.image,
        alt: this.title,
        loading: 'lazy',
      });
      imageContainer.appendChild(img);
    } else {
      const placeholder = createElement('div', {
        class: 'card-image-placeholder',
      });
      placeholder.textContent = this.getPlaceholderText();
      imageContainer.appendChild(placeholder);
    }
    this.element.appendChild(imageContainer);

    // Content container
    const content = createElement('div', { class: 'card-content' });

    // Title
    const title = createElement('h3', { class: 'card-title' });
    title.textContent = this.title;
    content.appendChild(title);

    // Rating (if applicable)
    if (this.rating !== null) {
      const ratingEl = createElement('div', { class: 'card-rating' });
      ratingEl.textContent = `★ ${this.formatRating(this.rating)}`;
      content.appendChild(ratingEl);
    }

    // Description
    if (this.description) {
      const desc = createElement('p', { class: 'card-description' });
      desc.textContent = this.truncateText(this.description, 100);
      content.appendChild(desc);
    }

    // Action buttons
    const actions = createElement('div', { class: 'card-actions' });

    // Favorite button
    const favoriteBtn = createElement('button', {
      class: `card-action-btn favorite-btn ${this.isFavorited ? 'favorited' : ''}`,
      title: this.isFavorited ? 'Remove from favorites' : 'Add to favorites',
    });
    favoriteBtn.innerHTML = this.isFavorited ? '♥' : '♡';
    on(favoriteBtn, 'click', (e) => {
      e.stopPropagation();
      this.toggleFavorite();
    });
    actions.appendChild(favoriteBtn);

    // View button
    const viewBtn = createElement('button', {
      class: 'card-action-btn view-btn',
      title: 'View details',
    });
    viewBtn.textContent = 'View';
    on(viewBtn, 'click', (e) => {
      e.stopPropagation();
      this.onClick(this.data);
    });
    actions.appendChild(viewBtn);

    content.appendChild(actions);
    this.element.appendChild(content);

    // Click handler for card
    on(this.element, 'click', () => {
      this.onClick(this.data);
    });

    return this.element;
  }

  /**
   * Toggle favorite status
   */
  toggleFavorite() {
    this.isFavorited = !this.isFavorited;
    this.updateFavoriteButton();
    this.onFavorite({
      ...this.data,
      isFavorited: this.isFavorited,
    });
  }

  /**
   * Update favorite button appearance
   * @private
   */
  updateFavoriteButton() {
    if (!this.element) return;

    const favBtn = this.element.querySelector('.favorite-btn');
    if (favBtn) {
      favBtn.innerHTML = this.isFavorited ? '♥' : '♡';
      favBtn.classList.toggle('favorited', this.isFavorited);
      favBtn.title = this.isFavorited ? 'Remove from favorites' : 'Add to favorites';
    }
  }

  /**
   * Format rating display
   * @private
   */
  formatRating(rating) {
    if (typeof rating === 'number') {
      return rating.toFixed(1);
    }
    return rating;
  }

  /**
   * Truncate text to max length
   * @private
   */
  truncateText(text, maxLength) {
    if (text.length > maxLength) {
      return text.substring(0, maxLength) + '...';
    }
    return text;
  }

  /**
   * Get placeholder emoji for card type
   * @private
   */
  getPlaceholderText() {
    const placeholders = {
      movie: '🎬',
      food: '🍽️',
      book: '📖',
    };
    return placeholders[this.variant] || '📦';
  }

  /**
   * Update card data
   * @param {Object} updates - Properties to update
   */
  update(updates) {
    Object.assign(this, updates);
    if (this.element) {
      const parent = this.element.parentNode;
      if (parent) {
        parent.replaceChild(this.render(), this.element);
      }
    }
  }

  /**
   * Destroy card and remove event listeners
   */
  destroy() {
    if (this.element && this.element.parentNode) {
      this.element.parentNode.removeChild(this.element);
    }
    this.element = null;
  }
}

export default Card;
