// Clear movie result fields on page load
window.addEventListener('DOMContentLoaded', function() {
    document.getElementById('movie-title').textContent = "";
    document.getElementById('movie-overview').textContent = "";
    document.getElementById('movie-release').textContent = "";
    document.getElementById('movie-rating').textContent = "";
    document.getElementById('movie-poster').style.display = 'none';
    document.getElementById('trailer-btn').style.display = 'none';
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
    const randomPage = Math.floor(Math.random() * 500) + 1;
    const url = `https://api.themoviedb.org/3/movie/popular?api_key=${TMDB_API_KEY}&language=en-US&page=${randomPage}`;
    const response = await fetch(url);
    const data = await response.json();
    if (data.results && data.results.length > 0) {
        // Filter movies with rating above 5 and at least 100 votes
        const filtered = data.results.filter(
            m => m.vote_average >= 5 && m.vote_count >= 100 && m.title
        );
        if (filtered.length > 0) {
            const randomIndex = Math.floor(Math.random() * filtered.length);
            return filtered[randomIndex];
        }
    }
    return null;
}

async function showRandomTMDbMovie() {
    const movie = await getRandomTMDbMovie();
    const movieResult = document.getElementById('movie-result');
    movieResult.style.display = 'block'; // Ensure the div is visible

    if (movie) {
        const posterUrl = movie.poster_path ? `https://image.tmdb.org/t/p/w500${movie.poster_path}` : '';
        const movieTitle = document.getElementById('movie-title');
        if (movieTitle) {
            movieTitle.textContent = movie.title;
        }
        const movieOverview = document.getElementById('movie-overview');
        if (movieOverview) {
            movieOverview.textContent = movie.overview;
        }
        const movieRelease = document.getElementById('movie-release');
        if (movieRelease) {
            movieRelease.textContent = "Release date: " + movie.release_date;
        }
        const movieRating = document.getElementById('movie-rating');
        if (movieRating) {
            movieRating.textContent = "Average rating: " + movie.vote_average.toFixed(1);
        }
        const moviePoster = document.getElementById('movie-poster');
        if (moviePoster) {
            moviePoster.src = posterUrl;
            moviePoster.style.display = 'block';
        }
        
        // Show and update trailer button
        const trailerBtn = document.getElementById('trailer-btn');
        if (trailerBtn) {
            trailerBtn.style.display = 'inline-block';
            trailerBtn.onclick = () => {
                const query = encodeURIComponent(`${movie.title} trailer`);
                window.open(`https://www.youtube.com/results?search_query=${query}`, '_blank');
            };
        }
    } else {
        const movieTitle = document.getElementById('movie-title');
        if (movieTitle) {
            movieTitle.textContent = "Sorry, we couldn't find a movie for you.";
        }
        const movieOverview = document.getElementById('movie-overview');
        if (movieOverview) {
            movieOverview.textContent = "";
        }
        const movieRelease = document.getElementById('movie-release');
        if (movieRelease) {
            movieRelease.textContent = "";
        }
        const movieRating = document.getElementById('movie-rating');
        if (movieRating) {
            movieRating.textContent = "";
        }
        const moviePoster = document.getElementById('movie-poster');
        if (moviePoster) {
            moviePoster.style.display = 'none';
        }
        const trailerBtn = document.getElementById('trailer-btn');
        if (trailerBtn) {
            trailerBtn.style.display = 'none';
        }
    }
}

const genreMap = {
    28: "Action",
    12: "Adventure",
    16: "Animation",
    35: "Comedy",
    80: "Crime",
    99: "Documentary",
    18: "Drama",
    10751: "Family",
    14: "Fantasy",
    27: "Horror",
    10402: "Music",
    9648: "Mystery",
    10749: "Romance",
    878: "Science Fiction",
    10770: "TV Movie",
    53: "Thriller",
    10752: "War",
    37: "Western"
};

async function fetchMovies() {
    const TMDB_API_KEY = 'e2a3d53d839bb5d20ef4dca2d7c5ec3b'; // Replace with your API key
    const url = `https://api.themoviedb.org/3/movie/popular?api_key=${TMDB_API_KEY}&language=en-US&page=1`;

    try {
        const response = await fetch(url);
        const data = await response.json();

        if (!data.results || !Array.isArray(data.results)) {
            throw new Error("Invalid movie data");
        }

        return data.results; // Return the list of movies
    } catch (error) {
        console.error("Error fetching movies:", error);
        return [];
    }
}

function applyFilters() {
    const genre = document.getElementById('genre').value;
    const minRating = parseFloat(document.getElementById('rating').value);

    try {
        fetchMovies().then(movies => {
            // Filter movies based on genre and rating
            const filteredMovies = movies.filter(movie => {
                const matchesGenre = genre === 'all' || movie.genre_ids.includes(parseInt(genre));
                const matchesRating = movie.vote_average >= minRating;
                return matchesGenre && matchesRating;
            });

            // Display filtered movies
            displayMovies(filteredMovies);
        });
    } catch (error) {
        console.error("Error applying filters:", error);
    }
}

function displayMovies(movies) {
    const movieResult = document.getElementById('movie-result');
    if (!movieResult) {
        console.error("movie-result div not found");
        return;
    }

    if (movies.length > 0) {
        const movie = movies[0]; // Display only the first movie from the filtered list

        // Update existing elements instead of replacing innerHTML
        const movieTitle = document.getElementById('movie-title');
        if (movieTitle) {
            movieTitle.textContent = movie.title;
        }
        const movieOverview = document.getElementById('movie-overview');
        if (movieOverview) {
            movieOverview.textContent = movie.overview;
        }
        const movieRelease = document.getElementById('movie-release');
        if (movieRelease) {
            movieRelease.textContent = "Release date: " + movie.release_date;
        }
        const movieRating = document.getElementById('movie-rating');
        if (movieRating) {
            movieRating.textContent = "Average rating: " + movie.vote_average.toFixed(1);
        }
        const moviePoster = document.getElementById('movie-poster');
        if (moviePoster && movie.poster_path) {
            moviePoster.src = `https://image.tmdb.org/t/p/w500${movie.poster_path}`;
            moviePoster.style.display = 'block';
        }
        
        // Show and update trailer button
        const trailerBtn = document.getElementById('trailer-btn');
        if (trailerBtn) {
            trailerBtn.style.display = 'inline-block';
            trailerBtn.onclick = () => {
                const query = encodeURIComponent(`${movie.title} trailer`);
                window.open(`https://www.youtube.com/results?search_query=${query}`, '_blank');
            };
        }
    } else {
        // Clear content if no movies found
        const movieTitle = document.getElementById('movie-title');
        if (movieTitle) {
            movieTitle.textContent = "No movies found matching the filter criteria.";
        }
        const movieOverview = document.getElementById('movie-overview');
        if (movieOverview) {
            movieOverview.textContent = "";
        }
        const movieRelease = document.getElementById('movie-release');
        if (movieRelease) {
            movieRelease.textContent = "";
        }
        const movieRating = document.getElementById('movie-rating');
        if (movieRating) {
            movieRating.textContent = "";
        }
        const moviePoster = document.getElementById('movie-poster');
        if (moviePoster) {
            moviePoster.style.display = 'none';
        }
        const trailerBtn = document.getElementById('trailer-btn');
        if (trailerBtn) {
            trailerBtn.style.display = 'none';
        }
    }

    // Show the movie-result div
    movieResult.style.display = 'block';
}
