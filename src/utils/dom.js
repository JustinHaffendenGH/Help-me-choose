/**
 * DOM Utilities Module
 * Provides helper functions for common DOM manipulation tasks
 */

/**
 * Safely query a single element
 * @param {string} selector - CSS selector
 * @param {Element} [context=document] - Context element to query within
 * @returns {Element|null} Found element or null
 */
export function querySelector(selector, context = document) {
  try {
    return context.querySelector(selector);
  } catch (error) {
    console.error(`Invalid selector: ${selector}`, error);
    return null;
  }
}

/**
 * Safely query multiple elements
 * @param {string} selector - CSS selector
 * @param {Element} [context=document] - Context element to query within
 * @returns {Element[]} Array of found elements
 */
export function querySelectorAll(selector, context = document) {
  try {
    return Array.from(context.querySelectorAll(selector));
  } catch (error) {
    console.error(`Invalid selector: ${selector}`, error);
    return [];
  }
}

/**
 * Create an element with attributes and children
 * @param {string} tag - HTML tag name
 * @param {Object} [attrs={}] - Element attributes
 * @param {Array|string} [children=[]] - Child elements or text
 * @returns {Element} Created element
 */
export function createElement(tag, attrs = {}, children = []) {
  const element = document.createElement(tag);
  
  // Set attributes
  Object.entries(attrs).forEach(([key, value]) => {
    if (key === 'class') {
      element.className = value;
    } else if (key === 'style' && typeof value === 'object') {
      Object.assign(element.style, value);
    } else if (key.startsWith('data-')) {
      element.dataset[key.replace('data-', '')] = value;
    } else if (key.startsWith('on')) {
      // Handle event listeners via data attributes
      element.setAttribute(key, value);
    } else {
      element.setAttribute(key, value);
    }
  });
  
  // Add children
  const childArray = Array.isArray(children) ? children : [children];
  childArray.forEach(child => {
    if (typeof child === 'string') {
      element.appendChild(document.createTextNode(child));
    } else if (child instanceof Element) {
      element.appendChild(child);
    }
  });
  
  return element;
}

/**
 * Add event listener to element
 * @param {Element|string} target - Element or selector
 * @param {string} event - Event type
 * @param {Function} handler - Event handler
 * @param {Object} [options] - Listener options
 */
export function on(target, event, handler, options = {}) {
  const element = typeof target === 'string' ? querySelector(target) : target;
  if (element) {
    element.addEventListener(event, handler, options);
  }
}

/**
 * Remove event listener from element
 * @param {Element|string} target - Element or selector
 * @param {string} event - Event type
 * @param {Function} handler - Event handler
 */
export function off(target, event, handler) {
  const element = typeof target === 'string' ? querySelector(target) : target;
  if (element) {
    element.removeEventListener(event, handler);
  }
}

/**
 * Add class to element
 * @param {Element|string} target - Element or selector
 * @param {string} className - Class name(s) to add
 */
export function addClass(target, className) {
  const element = typeof target === 'string' ? querySelector(target) : target;
  if (element) {
    element.classList.add(...className.split(' ').filter(Boolean));
  }
}

/**
 * Remove class from element
 * @param {Element|string} target - Element or selector
 * @param {string} className - Class name(s) to remove
 */
export function removeClass(target, className) {
  const element = typeof target === 'string' ? querySelector(target) : target;
  if (element) {
    element.classList.remove(...className.split(' ').filter(Boolean));
  }
}

/**
 * Toggle class on element
 * @param {Element|string} target - Element or selector
 * @param {string} className - Class name to toggle
 * @param {boolean} [force] - Force add/remove
 * @returns {boolean} Whether class is present
 */
export function toggleClass(target, className, force) {
  const element = typeof target === 'string' ? querySelector(target) : target;
  if (element) {
    return element.classList.toggle(className, force);
  }
  return false;
}

/**
 * Set multiple attributes on element
 * @param {Element|string} target - Element or selector
 * @param {Object} attrs - Attributes to set
 */
export function setAttributes(target, attrs) {
  const element = typeof target === 'string' ? querySelector(target) : target;
  if (element) {
    Object.entries(attrs).forEach(([key, value]) => {
      if (value === null || value === undefined) {
        element.removeAttribute(key);
      } else {
        element.setAttribute(key, value);
      }
    });
  }
}

/**
 * Get attribute value
 * @param {Element|string} target - Element or selector
 * @param {string} attr - Attribute name
 * @returns {string|null} Attribute value
 */
export function getAttribute(target, attr) {
  const element = typeof target === 'string' ? querySelector(target) : target;
  return element ? element.getAttribute(attr) : null;
}

/**
 * Set text content
 * @param {Element|string} target - Element or selector
 * @param {string} text - Text content
 */
export function setText(target, text) {
  const element = typeof target === 'string' ? querySelector(target) : target;
  if (element) {
    element.textContent = text;
  }
}

/**
 * Set HTML content (sanitized)
 * @param {Element|string} target - Element or selector
 * @param {string} html - HTML content
 */
export function setHTML(target, html) {
  const element = typeof target === 'string' ? querySelector(target) : target;
  if (element) {
    element.innerHTML = html;
  }
}

/**
 * Check if element has class
 * @param {Element|string} target - Element or selector
 * @param {string} className - Class name
 * @returns {boolean}
 */
export function hasClass(target, className) {
  const element = typeof target === 'string' ? querySelector(target) : target;
  return element ? element.classList.contains(className) : false;
}

/**
 * Hide element
 * @param {Element|string} target - Element or selector
 */
export function hide(target) {
  const element = typeof target === 'string' ? querySelector(target) : target;
  if (element) {
    element.style.display = 'none';
  }
}

/**
 * Show element
 * @param {Element|string} target - Element or selector
 * @param {string} [display='block'] - Display value
 */
export function show(target, display = 'block') {
  const element = typeof target === 'string' ? querySelector(target) : target;
  if (element) {
    element.style.display = display;
  }
}

/**
 * Get computed style value
 * @param {Element|string} target - Element or selector
 * @param {string} prop - CSS property
 * @returns {string|null}
 */
export function getStyle(target, prop) {
  const element = typeof target === 'string' ? querySelector(target) : target;
  return element ? window.getComputedStyle(element).getPropertyValue(prop) : null;
}

/**
 * Delegate event handler
 * @param {Element|string} target - Parent element or selector
 * @param {string} event - Event type
 * @param {string} selector - Selector for delegated elements
 * @param {Function} handler - Event handler
 */
export function delegate(target, event, selector, handler) {
  const element = typeof target === 'string' ? querySelector(target) : target;
  if (!element) return;
  
  element.addEventListener(event, (e) => {
    const delegateTarget = e.target.closest(selector);
    if (delegateTarget && element.contains(delegateTarget)) {
      handler.call(delegateTarget, e);
    }
  });
}

export default {
  querySelector,
  querySelectorAll,
  createElement,
  on,
  off,
  addClass,
  removeClass,
  toggleClass,
  setAttributes,
  getAttribute,
  setText,
  setHTML,
  hasClass,
  hide,
  show,
  getStyle,
  delegate,
};
