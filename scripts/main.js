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

// Store current filter settings
let currentFilter = {
    genre: 'all',
    minRating: 0,
    isActive: false
};

const TMDB_API_KEY = 'e2a3d53d839bb5d20ef4dca2d7c5ec3b'; // My Api key.

async function getRandomTMDbMovie() {
    let attempts = 0;
    const maxAttempts = 15; // Try up to 15 different pages for better results
    
    while (attempts < maxAttempts) {
        const randomPage = Math.floor(Math.random() * 500) + 1;
        const url = `https://api.themoviedb.org/3/movie/popular?api_key=${TMDB_API_KEY}&language=en-US&page=${randomPage}`;
        
        try {
            const response = await fetch(url);
            const data = await response.json();
            
            if (data.results && data.results.length > 0) {
                let filtered = data.results.filter(
                    m => m.vote_average >= 5 && m.vote_count >= 100 && m.title
                );

                // Apply current filter if active
                if (currentFilter.isActive) {
                    filtered = filtered.filter(movie => {
                        const matchesGenre = currentFilter.genre === 'all' || movie.genre_ids.includes(parseInt(currentFilter.genre));
                        const matchesRating = movie.vote_average >= currentFilter.minRating;
                        return matchesGenre && matchesRating;
                    });
                }

                if (filtered.length > 0) {
                    const randomIndex = Math.floor(Math.random() * filtered.length);
                    return filtered[randomIndex];
                }
            }
        } catch (error) {
            console.error("Error fetching movies:", error);
        }
        
        attempts++;
    }
    
    return null; // Return null if no movie found after all attempts
}

async function getMovieExternalIDs(movieId) {
    try {
        const url = `https://api.themoviedb.org/3/movie/${movieId}/external_ids?api_key=${TMDB_API_KEY}`;
        const response = await fetch(url);
        const data = await response.json();
        return data; // contains imdb_id if available
    } catch (error) {
        console.error('Error fetching external IDs:', error);
        return null;
    }
}

// Helper to update IMDb link element
async function updateImdbLink(movie) {
    const imdbLink = document.getElementById('imdb-link');
    if (!imdbLink) return;

    if (!movie || !movie.id) {
        imdbLink.style.display = 'none';
        imdbLink.href = '#';
        return;
    }

    const external = await getMovieExternalIDs(movie.id);
    if (external && external.imdb_id) {
        imdbLink.href = `https://www.imdb.com/title/${external.imdb_id}/`;
        imdbLink.style.display = 'inline-block';
    } else {
        imdbLink.style.display = 'none';
        imdbLink.href = '#';
    }
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
        if (moviePoster && posterUrl) {
            moviePoster.onload = function() {
                movieResult.scrollIntoView({ behavior: 'smooth', block: 'center' });
            };
            moviePoster.src = posterUrl;
            moviePoster.style.display = 'block';
        } else {
            movieResult.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
        // Update IMDb link
        updateImdbLink(movie);
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
        const imdbLink = document.getElementById('imdb-link');
        if (imdbLink) {
            imdbLink.style.display = 'none';
        }
        movieResult.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
}

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

    // Store the current filter settings
    currentFilter = {
        genre: genre,
        minRating: minRating,
        isActive: true
    };

    // Get a random movie with the new filter applied
    showRandomTMDbMovie();
}

function displayRandomFilteredMovie(movies) {
    const movieResult = document.getElementById('movie-result');
    if (!movieResult) {
        console.error("movie-result div not found");
        return;
    }

    if (movies.length > 0) {
        // Select a random movie from the filtered list
        const randomIndex = Math.floor(Math.random() * movies.length);
        const movie = movies[randomIndex];

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
        
        // Update IMDb link
        updateImdbLink(movie);
        
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
        const imdbLink = document.getElementById('imdb-link');
        if (imdbLink) {
            imdbLink.style.display = 'none';
        }
    }

    // Show the movie-result div
    movieResult.style.display = 'block';
}

window.addEventListener('DOMContentLoaded', function() {
    // Next Movie button functionality
    const nextMovieBtn = document.getElementById('next-movie-btn');
    if (nextMovieBtn) {
        nextMovieBtn.onclick = function() {
            showRandomTMDbMovie();
        };
    }
});
