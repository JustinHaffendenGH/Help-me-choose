import { createElement, on, addClass, removeClass } from '../utils/index.js';

/**
 * Modal Component - Dialog/modal popup
 *
 * Features:
 * - Backdrop overlay
 * - Close button
 * - ESC key to close
 * - Customizable title and content
 * - Callback handlers
 *
 * @example
 * const modal = new Modal({
 *   title: 'Confirm Action',
 *   content: 'Are you sure?',
 *   buttons: [
 *     { text: 'Cancel', variant: 'secondary', onClick: () => modal.close() },
 *     { text: 'Confirm', variant: 'primary', onClick: () => console.log('Done') }
 *   ]
 * });
 * modal.show();
 */
export class Modal {
  constructor(options = {}) {
    this.title = options.title || '';
    this.content = options.content || '';
    this.buttons = options.buttons || [];
    this.closeOnBackdrop = options.closeOnBackdrop !== false;
    this.closeOnEscape = options.closeOnEscape !== false;
    this.width = options.width || 'auto';

    // Callbacks
    this.onOpen = options.onOpen || (() => {});
    this.onClose = options.onClose || (() => {});

    this.element = null;
    this.backdrop = null;
    this.isOpen = false;
  }

  /**
   * Render the modal
   * @returns {HTMLElement} The rendered modal
   * @private
   */
  render() {
    // Backdrop
    this.backdrop = createElement('div', {
      class: 'modal-backdrop',
    });

    on(this.backdrop, 'click', (e) => {
      if (e.target === this.backdrop && this.closeOnBackdrop) {
        this.close();
      }
    });

    // Modal container
    this.element = createElement('div', {
      class: 'modal',
    });
    this.element.style.width = this.width;

    // Header
    const header = createElement('div', {
      class: 'modal-header',
    });

    const titleEl = createElement('h2', {
      class: 'modal-title',
    });
    titleEl.textContent = this.title;
    header.appendChild(titleEl);

    const closeBtn = createElement('button', {
      class: 'modal-close-btn',
      type: 'button',
      title: 'Close',
    });
    closeBtn.innerHTML = '✕';

    on(closeBtn, 'click', () => {
      this.close();
    });

    header.appendChild(closeBtn);
    this.element.appendChild(header);

    // Content
    const contentEl = createElement('div', {
      class: 'modal-content',
    });

    if (typeof this.content === 'string') {
      contentEl.textContent = this.content;
    } else if (this.content instanceof HTMLElement) {
      contentEl.appendChild(this.content);
    }

    this.element.appendChild(contentEl);

    // Footer with buttons
    if (this.buttons && this.buttons.length > 0) {
      const footer = createElement('div', {
        class: 'modal-footer',
      });

      this.buttons.forEach((btnConfig) => {
        const btn = createElement('button', {
          class: `btn btn-${btnConfig.variant || 'primary'}`,
          type: 'button',
        });
        btn.textContent = btnConfig.text || 'Button';

        on(btn, 'click', () => {
          if (btnConfig.onClick) {
            btnConfig.onClick();
          }
        });

        footer.appendChild(btn);
      });

      this.element.appendChild(footer);
    }

    this.backdrop.appendChild(this.element);

    // Keyboard handler
    this.keyHandler = (e) => {
      if (e.key === 'Escape' && this.closeOnEscape && this.isOpen) {
        this.close();
      }
    };

    return this.backdrop;
  }

  /**
   * Show the modal
   */
  show() {
    if (this.isOpen) return;

    if (!this.backdrop) {
      this.render();
    }

    document.body.appendChild(this.backdrop);
    document.addEventListener('keydown', this.keyHandler);
    addClass(document.body, 'modal-open');

    this.isOpen = true;
    this.onOpen();
  }

  /**
   * Close the modal
   */
  close() {
    if (!this.isOpen) return;

    if (this.backdrop && this.backdrop.parentNode) {
      this.backdrop.parentNode.removeChild(this.backdrop);
    }

    document.removeEventListener('keydown', this.keyHandler);
    removeClass(document.body, 'modal-open');

    this.isOpen = false;
    this.onClose();
  }

  /**
   * Toggle modal visibility
   */
  toggle() {
    if (this.isOpen) {
      this.close();
    } else {
      this.show();
    }
  }

  /**
   * Check if modal is open
   * @returns {boolean} Open status
   */
  getIsOpen() {
    return this.isOpen;
  }

  /**
   * Destroy modal
   */
  destroy() {
    this.close();
    this.element = null;
    this.backdrop = null;
  }
}

export default Modal;
