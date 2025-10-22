import { createElement } from '../utils/index.js';

/**
 * Badge Component - Small tag/badge for ratings, genres, status
 *
 * Variants: 'default', 'success', 'warning', 'danger', 'info'
 * Sizes: 'sm', 'md', 'lg'
 *
 * @example
 * const badge = new Badge({
 *   text: 'Action',
 *   variant: 'info',
 *   size: 'sm'
 * });
 * document.body.appendChild(badge.render());
 */
export class Badge {
  constructor(options = {}) {
    this.text = options.text || 'Badge';
    this.variant = options.variant || 'default'; // 'default', 'success', 'warning', 'danger', 'info'
    this.size = options.size || 'md'; // 'sm', 'md', 'lg'
    this.icon = options.icon || null;
    this.className = options.className || '';

    this.element = null;
  }

  /**
   * Render the badge
   * @returns {HTMLElement} The rendered badge
   */
  render() {
    const classes = [
      'badge',
      `badge-${this.variant}`,
      `badge-${this.size}`,
      this.className,
    ]
      .filter(Boolean)
      .join(' ');

    this.element = createElement('span', {
      class: classes,
    });

    // Icon
    if (this.icon) {
      const iconEl = createElement('span', {
        class: 'badge-icon',
      });
      iconEl.textContent = this.icon;
      this.element.appendChild(iconEl);
    }

    // Text
    const textEl = createElement('span', {
      class: 'badge-text',
    });
    textEl.textContent = this.text;
    this.element.appendChild(textEl);

    return this.element;
  }

  /**
   * Set badge text
   * @param {string} text - New text
   */
  setText(text) {
    this.text = text;
    if (this.element) {
      const textEl = this.element.querySelector('.badge-text');
      if (textEl) {
        textEl.textContent = text;
      }
    }
  }

  /**
   * Set badge variant
   * @param {string} variant - New variant
   */
  setVariant(variant) {
    if (this.element) {
      this.element.classList.remove(`badge-${this.variant}`);
      this.element.classList.add(`badge-${variant}`);
    }
    this.variant = variant;
  }

  /**
   * Update badge
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
   * Destroy badge
   */
  destroy() {
    if (this.element && this.element.parentNode) {
      this.element.parentNode.removeChild(this.element);
    }
    this.element = null;
  }
}

export default Badge;
