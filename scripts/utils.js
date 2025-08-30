// Utility functions for the website

// Shuffle array in place using Fisher-Yates algorithm
export function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

// Navigate to the selected page
export function goToPage() {
    const select = document.getElementById('page-select');
    const page = select.value;
    window.location.href = page;
}

// Create star rating HTML for movies (0-10 scale converted to 0-5 stars)
export function createStarRating(rating) {
    // Convert rating from 0-10 scale to 0-5 stars
    const starRating = (rating / 10) * 5;
    const fullStars = Math.floor(starRating);
    const hasHalfStar = starRating % 1 >= 0.5;
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

    let starsHTML = '';

    // Add full stars
    for (let i = 0; i < fullStars; i++) {
        starsHTML += '<span class="star full">★</span>';
    }

    // Add half star if needed
    if (hasHalfStar) {
        starsHTML += '<span class="star half">☆</span>';
    }

    // Add empty stars
    for (let i = 0; i < emptyStars; i++) {
        starsHTML += '<span class="star empty">☆</span>';
    }

    return `<div class="star-rating">${starsHTML} <span class="rating-text">(${rating.toFixed(1)}/10)</span></div>`;
}

// Create star rating HTML for books (0-5 scale)
export function createBookStarRating(rating) {
    // Books already use 0-5 scale, no conversion needed
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

    let starsHTML = '';

    // Add full stars
    for (let i = 0; i < fullStars; i++) {
        starsHTML += '<span class="star full">★</span>';
    }

    // Add half star if needed
    if (hasHalfStar) {
        starsHTML += '<span class="star half">☆</span>';
    }

    // Add empty stars
    for (let i = 0; i < emptyStars; i++) {
        starsHTML += '<span class="star empty">☆</span>';
    }

    return `<div class="star-rating">${starsHTML} <span class="rating-text">(${rating.toFixed(1)}/5)</span></div>`;
}

// Format date from YYYY-MM-DD to DD/MM/YYYY
export function formatDateToUK(dateString) {
    // Convert YYYY-MM-DD to DD/MM/YYYY format
    if (!dateString) return 'Unknown';

    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString; // Return original if invalid

    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();

    return `${day}/${month}/${year}`;
}
