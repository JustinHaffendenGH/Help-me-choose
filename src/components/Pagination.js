import { createElement, on } from '../utils/index.js';

/**
 * Pagination Component - Navigate between pages
 *
 * Features:
 * - Previous/next buttons
 * - Page number indicators
 * - Current page highlighting
 * - Customizable items per page
 *
 * @example
 * const pagination = new Pagination({
 *   currentPage: 1,
 *   totalPages: 10,
 *   onPageChange: (page) => console.log('Go to page:', page)
 * });
 * document.body.appendChild(pagination.render());
 */
export class Pagination {
  constructor(options = {}) {
    this.currentPage = options.currentPage || 1;
    this.totalPages = options.totalPages || 1;
    this.visiblePages = options.visiblePages || 5;
    this.onPageChange = options.onPageChange || (() => {});

    this.element = null;
  }

  /**
   * Render the pagination
   * @returns {HTMLElement} The rendered pagination
   */
  render() {
    this.element = createElement('div', {
      class: 'pagination',
    });

    // Previous button
    const prevBtn = createElement('button', {
      class: `pagination-btn ${this.currentPage === 1 ? 'disabled' : ''}`,
      type: 'button',
      disabled: this.currentPage === 1,
    });
    prevBtn.textContent = '← Previous';

    on(prevBtn, 'click', () => {
      if (this.currentPage > 1) {
        this.goToPage(this.currentPage - 1);
      }
    });

    this.element.appendChild(prevBtn);

    // Page numbers
    const pageContainer = createElement('div', {
      class: 'pagination-pages',
    });

    const pages = this.getVisiblePages();
    pages.forEach((page) => {
      if (page === '...') {
        const dots = createElement('span', {
          class: 'pagination-dots',
        });
        dots.textContent = '...';
        pageContainer.appendChild(dots);
      } else {
        const pageBtn = createElement('button', {
          class: `pagination-page ${page === this.currentPage ? 'active' : ''}`,
          type: 'button',
        });
        pageBtn.textContent = page;

        on(pageBtn, 'click', () => {
          this.goToPage(page);
        });

        pageContainer.appendChild(pageBtn);
      }
    });

    this.element.appendChild(pageContainer);

    // Next button
    const nextBtn = createElement('button', {
      class: `pagination-btn ${this.currentPage === this.totalPages ? 'disabled' : ''}`,
      type: 'button',
      disabled: this.currentPage === this.totalPages,
    });
    nextBtn.textContent = 'Next →';

    on(nextBtn, 'click', () => {
      if (this.currentPage < this.totalPages) {
        this.goToPage(this.currentPage + 1);
      }
    });

    this.element.appendChild(nextBtn);

    // Info
    const info = createElement('div', {
      class: 'pagination-info',
    });
    info.textContent = `Page ${this.currentPage} of ${this.totalPages}`;
    this.element.appendChild(info);

    return this.element;
  }

  /**
   * Get visible page numbers
   * @private
   */
  getVisiblePages() {
    const pages = [];
    const halfVisible = Math.floor(this.visiblePages / 2);

    let startPage = Math.max(1, this.currentPage - halfVisible);
    let endPage = Math.min(this.totalPages, this.currentPage + halfVisible);

    // Adjust if near start or end
    if (startPage === 1) {
      endPage = Math.min(this.totalPages, this.visiblePages);
    } else if (endPage === this.totalPages) {
      startPage = Math.max(1, this.totalPages - this.visiblePages + 1);
    }

    // Add first page if not included
    if (startPage > 1) {
      pages.push(1);
      if (startPage > 2) {
        pages.push('...');
      }
    }

    // Add page numbers
    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }

    // Add last page if not included
    if (endPage < this.totalPages) {
      if (endPage < this.totalPages - 1) {
        pages.push('...');
      }
      pages.push(this.totalPages);
    }

    return pages;
  }

  /**
   * Go to page
   * @param {number} page - Page number
   */
  goToPage(page) {
    if (page < 1 || page > this.totalPages) return;

    this.currentPage = page;
    this.onPageChange(page);

    if (this.element) {
      const parent = this.element.parentNode;
      if (parent) {
        parent.replaceChild(this.render(), this.element);
      }
    }
  }

  /**
   * Set total pages
   * @param {number} total - Total pages
   */
  setTotalPages(total) {
    this.totalPages = total;
    if (this.currentPage > total) {
      this.currentPage = total;
    }
    if (this.element) {
      const parent = this.element.parentNode;
      if (parent) {
        parent.replaceChild(this.render(), this.element);
      }
    }
  }

  /**
   * Get current page
   * @returns {number} Current page
   */
  getCurrentPage() {
    return this.currentPage;
  }

  /**
   * Destroy pagination
   */
  destroy() {
    if (this.element && this.element.parentNode) {
      this.element.parentNode.removeChild(this.element);
    }
    this.element = null;
  }
}

export default Pagination;
