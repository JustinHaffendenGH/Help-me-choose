import { createElement } from '../utils/index.js';

/**
 * Loader Component - Loading spinner and skeleton loaders
 *
 * Types: 'spinner', 'skeleton', 'pulse'
 * Sizes: 'sm', 'md', 'lg'
 *
 * @example
 * // Spinner
 * const loader = new Loader({ type: 'spinner', size: 'lg' });
 * document.body.appendChild(loader.render());
 *
 * // Skeleton
 * const skeleton = new Loader({ type: 'skeleton', lines: 3 });
 * document.body.appendChild(skeleton.render());
 */
export class Loader {
  constructor(options = {}) {
    this.type = options.type || 'spinner'; // 'spinner', 'skeleton', 'pulse'
    this.size = options.size || 'md'; // 'sm', 'md', 'lg'
    this.lines = options.lines || 3; // For skeleton loader
    this.message = options.message || '';
    this.className = options.className || '';

    this.element = null;
  }

  /**
   * Render the loader
   * @returns {HTMLElement} The rendered loader
   */
  render() {
    const classes = [
      'loader',
      `loader-${this.type}`,
      `loader-${this.size}`,
      this.className,
    ]
      .filter(Boolean)
      .join(' ');

    this.element = createElement('div', {
      class: classes,
    });

    if (this.type === 'spinner') {
      this.renderSpinner();
    } else if (this.type === 'skeleton') {
      this.renderSkeleton();
    } else if (this.type === 'pulse') {
      this.renderPulse();
    }

    return this.element;
  }

  /**
   * Render spinner loader
   * @private
   */
  renderSpinner() {
    const spinner = createElement('div', {
      class: 'loader-spinner',
    });

    for (let i = 0; i < 12; i++) {
      const dot = createElement('div', {
        class: 'loader-spinner-dot',
      });
      spinner.appendChild(dot);
    }

    this.element.appendChild(spinner);

    if (this.message) {
      const msg = createElement('p', {
        class: 'loader-message',
      });
      msg.textContent = this.message;
      this.element.appendChild(msg);
    }
  }

  /**
   * Render skeleton loader
   * @private
   */
  renderSkeleton() {
    const skeleton = createElement('div', {
      class: 'loader-skeleton',
    });

    // Create skeleton lines
    for (let i = 0; i < this.lines; i++) {
      const line = createElement('div', {
        class: 'skeleton-line',
      });

      // Vary width for more natural look
      if (i === this.lines - 1) {
        line.style.width = '70%';
      }

      skeleton.appendChild(line);
    }

    this.element.appendChild(skeleton);

    if (this.message) {
      const msg = createElement('p', {
        class: 'loader-message',
      });
      msg.textContent = this.message;
      this.element.appendChild(msg);
    }
  }

  /**
   * Render pulse loader
   * @private
   */
  renderPulse() {
    const pulse = createElement('div', {
      class: 'loader-pulse',
    });

    const pulseItem = createElement('div', {
      class: 'loader-pulse-item',
    });

    pulse.appendChild(pulseItem);
    this.element.appendChild(pulse);

    if (this.message) {
      const msg = createElement('p', {
        class: 'loader-message',
      });
      msg.textContent = this.message;
      this.element.appendChild(msg);
    }
  }

  /**
   * Set message
   * @param {string} message - New message
   */
  setMessage(message) {
    this.message = message;
    if (this.element) {
      const msgEl = this.element.querySelector('.loader-message');
      if (msgEl) {
        msgEl.textContent = message;
      }
    }
  }

  /**
   * Show loader
   */
  show() {
    if (this.element) {
      this.element.style.display = 'flex';
    }
  }

  /**
   * Hide loader
   */
  hide() {
    if (this.element) {
      this.element.style.display = 'none';
    }
  }

  /**
   * Destroy loader
   */
  destroy() {
    if (this.element && this.element.parentNode) {
      this.element.parentNode.removeChild(this.element);
    }
    this.element = null;
  }
}

export default Loader;
