import { createElement, on, addClass, removeClass } from '../utils/index.js';

/**
 * Button Component - Reusable button with variants and states
 *
 * Variants: 'primary', 'secondary', 'danger'
 * Sizes: 'sm', 'md', 'lg'
 * States: 'normal', 'loading', 'disabled'
 *
 * @example
 * const btn = new Button({
 *   text: 'Click me',
 *   variant: 'primary',
 *   size: 'md',
 *   onClick: () => console.log('Clicked!')
 * });
 * document.body.appendChild(btn.render());
 */
export class Button {
  constructor(options = {}) {
    this.text = options.text || 'Button';
    this.variant = options.variant || 'primary'; // 'primary', 'secondary', 'danger'
    this.size = options.size || 'md'; // 'sm', 'md', 'lg'
    this.disabled = options.disabled || false;
    this.loading = options.loading || false;
    this.icon = options.icon || null;
    this.type = options.type || 'button'; // 'button', 'submit', 'reset'
    this.title = options.title || '';
    this.className = options.className || '';

    // Callback
    this.onClick = options.onClick || (() => {});

    this.element = null;
  }

  /**
   * Render the button
   * @returns {HTMLElement} The rendered button
   */
  render() {
    const classes = [
      'btn',
      `btn-${this.variant}`,
      `btn-${this.size}`,
      this.disabled ? 'btn-disabled' : '',
      this.loading ? 'btn-loading' : '',
      this.className,
    ]
      .filter(Boolean)
      .join(' ');

    this.element = createElement('button', {
      class: classes,
      type: this.type,
      title: this.title,
      disabled: this.disabled || this.loading,
    });

    // Icon and text
    if (this.icon) {
      const iconEl = createElement('span', { class: 'btn-icon' });
      iconEl.textContent = this.icon;
      this.element.appendChild(iconEl);
    }

    const textEl = createElement('span', { class: 'btn-text' });
    textEl.textContent = this.loading ? 'Loading...' : this.text;
    this.element.appendChild(textEl);

    // Click handler
    on(this.element, 'click', (e) => {
      if (this.disabled || this.loading) {
        e.preventDefault();
        return;
      }
      this.onClick(e);
    });

    return this.element;
  }

  /**
   * Set button text
   * @param {string} text - New text
   */
  setText(text) {
    this.text = text;
    this.updateText();
  }

  /**
   * Set loading state
   * @param {boolean} loading - Loading state
   */
  setLoading(loading) {
    this.loading = loading;
    if (this.element) {
      const textEl = this.element.querySelector('.btn-text');
      if (textEl) {
        textEl.textContent = loading ? 'Loading...' : this.text;
      }
      this.element.disabled = loading || this.disabled;
      if (loading) {
        addClass(this.element, 'btn-loading');
      } else {
        removeClass(this.element, 'btn-loading');
      }
    }
  }

  /**
   * Set disabled state
   * @param {boolean} disabled - Disabled state
   */
  setDisabled(disabled) {
    this.disabled = disabled;
    if (this.element) {
      this.element.disabled = disabled || this.loading;
      if (disabled) {
        addClass(this.element, 'btn-disabled');
      } else {
        removeClass(this.element, 'btn-disabled');
      }
    }
  }

  /**
   * Set button variant
   * @param {string} variant - 'primary', 'secondary', 'danger'
   */
  setVariant(variant) {
    if (this.element) {
      removeClass(this.element, `btn-${this.variant}`);
      addClass(this.element, `btn-${variant}`);
    }
    this.variant = variant;
  }

  /**
   * Update text display
   * @private
   */
  updateText() {
    if (this.element) {
      const textEl = this.element.querySelector('.btn-text');
      if (textEl) {
        textEl.textContent = this.loading ? 'Loading...' : this.text;
      }
    }
  }

  /**
   * Trigger click event
   */
  click() {
    if (this.element) {
      this.element.click();
    }
  }

  /**
   * Destroy button
   */
  destroy() {
    if (this.element && this.element.parentNode) {
      this.element.parentNode.removeChild(this.element);
    }
    this.element = null;
  }
}

export default Button;
