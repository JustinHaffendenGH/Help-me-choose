// Theme Toggle Logic

function initTheme() {
    const savedTheme = localStorage.getItem('theme');
    
    // Check if there is a saved theme in localStorage
    if (savedTheme) {
        document.documentElement.setAttribute('data-theme', savedTheme);
    } else {
        // Check system preference if no saved theme
        if (window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches) {
            document.documentElement.setAttribute('data-theme', 'light');
        }
    }
}

function toggleTheme() {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    let newTheme = 'dark';
    
    if (currentTheme !== 'light') {
        newTheme = 'light';
    }

    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
    
    // Update button icons
    updateThemeIcon();
}

function updateThemeIcon() {
    const btn = document.getElementById('theme-toggle-btn');
    if (!btn) return;
    
    const isLight = document.documentElement.getAttribute('data-theme') === 'light';
    btn.innerHTML = isLight ? '🌙' : '☀️';
    btn.setAttribute('aria-label', isLight ? 'Switch to dark mode' : 'Switch to light mode');
}

// Initialize theme immediately to prevent FOUC
initTheme();

// Set up event listeners once DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    updateThemeIcon();
    
    const themeBtn = document.getElementById('theme-toggle-btn');
    if (themeBtn) {
        themeBtn.addEventListener('click', toggleTheme);
    }
});
