// Clear movie result fields on page load
window.addEventListener('DOMContentLoaded', function() {
    document.getElementById('movie-title').textContent = "";
    document.getElementById('movie-overview').textContent = "";
    document.getElementById('movie-release').textContent = "";
    document.getElementById('movie-rating').textContent = "";
    document.getElementById('movie-poster').style.display = 'none';
});
// Coded by RedEyedMonster.

// Main JavaScript file

// Function to navigate to the selected page.
function goToPage() {
  const select = document.getElementById('page-select');
  const page = select.value;
  window.location.href = page;
}

const TMDB_API_KEY = 'e2a3d53d839bb5d20ef4dca2d7c5ec3b'; // My Api key.

async function getRandomTMDbMovie() {
    // TMDb has many pages of popular movies, so pick a random page
    const randomPage = Math.floor(Math.random() * 500) + 1;
    const url = `https://api.themoviedb.org/3/movie/popular?api_key=${TMDB_API_KEY}&language=en-US&page=${randomPage}`;
    const response = await fetch(url);
    const data = await response.json();
        if (data.results && data.results.length > 0) {
            const randomIndex = Math.floor(Math.random() * data.results.length);
            return data.results[randomIndex]; // Return the whole movie object
        } else {
            return null;
        }
}

async function showRandomTMDbMovie() {
    const movie = await getRandomTMDbMovie();
    if (movie) {
        const posterUrl = movie.poster_path ? `https://image.tmdb.org/t/p/w500${movie.poster_path}` : '';
        document.getElementById('movie-title').textContent = movie.title;
        document.getElementById('movie-overview').textContent = movie.overview;
        document.getElementById('movie-release').textContent = "Release date: " + movie.release_date;
        document.getElementById('movie-rating').textContent = "Average rating: " + movie.vote_average;
        document.getElementById('movie-poster').src = posterUrl;
        document.getElementById('movie-poster').style.display = posterUrl ? 'block' : 'none';
    } else {
        document.getElementById('movie-title').textContent = "Sorry, we couldn't find a movie for you.";
        document.getElementById('movie-overview').textContent = "";
        document.getElementById('movie-release').textContent = "";
        document.getElementById('movie-rating').textContent = "";
        document.getElementById('movie-poster').style.display = 'none';
    }

}