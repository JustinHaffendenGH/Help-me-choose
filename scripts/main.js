// Clear movie result fields on page load
window.addEventListener('DOMContentLoaded', function() {
    const movieTitle = document.getElementById('movie-title');
    if (movieTitle) movieTitle.textContent = "";
    const movieOverview = document.getElementById('movie-overview');
    if (movieOverview) movieOverview.textContent = "";
    const movieRelease = document.getElementById('movie-release');
    if (movieRelease) movieRelease.textContent = "";
    const movieRating = document.getElementById('movie-rating');
    if (movieRating) movieRating.textContent = "";
    const moviePoster = document.getElementById('movie-poster');
    if (moviePoster) moviePoster.style.display = 'none';
    const trailerBtn = document.getElementById('trailer-btn');
    if (trailerBtn) trailerBtn.style.display = 'none';
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

    // Random Book button functionality
    const randomBookBtn = document.getElementById('Random-book-button');
    if (randomBookBtn) {
        randomBookBtn.onclick = function() {
            showRandomBook();
        };
    }

    // Next Book button functionality
    const nextBookBtn = document.getElementById('next-book-btn');
    if (nextBookBtn) {
        nextBookBtn.onclick = function() {
            showRandomBook();
        };
    }
});

// Open Library API functions for random book search - Improved for speed and quality
async function getRandomOpenLibraryBook() {
    // Use a more direct approach similar to the movie API
    // Try multiple fast methods in parallel for better results
    const promises = [
        getPopularRecentBooks(),
        getBestsellerBooks(),
        getFeaturedBooks()
    ];
    
    // Race the promises - use whichever returns first with a good result
    try {
        const results = await Promise.allSettled(promises);
        
        // Find the first successful result with a good book
        for (const result of results) {
            if (result.status === 'fulfilled' && result.value) {
                return result.value;
            }
        }
    } catch (error) {
        console.error('Error in parallel book search:', error);
    }
    
    // Fallback to a simple recent search if parallel search fails
    return await getSimpleRecentBook();
}

async function getPopularRecentBooks() {
    // Focus on popular, well-rated books from recent years
    const currentYear = new Date().getFullYear();
    const recentYear = currentYear - Math.floor(Math.random() * 5); // Last 5 years for very recent books
    
    const url = `https://openlibrary.org/search.json?q=*&publish_year=${recentYear}&language=eng&has_fulltext=false&sort=rating&limit=20`;
    
    try {
        const response = await fetch(url);
        if (!response.ok) throw new Error('API Error');
        
        const data = await response.json();
        
        if (data.docs && data.docs.length > 0) {
            // Get only high-quality books with covers
            const qualityBooks = data.docs.filter(book => 
                book.cover_i && 
                book.title && 
                book.author_name && 
                book.title.length > 3 && // Avoid short/weird titles
                book.title.length < 100 && // Avoid super long titles
                !book.title.toLowerCase().includes('test') && // Avoid test entries
                book.ratings_average > 3 // Only well-rated books
            );
            
            if (qualityBooks.length > 0) {
                const randomBook = qualityBooks[Math.floor(Math.random() * qualityBooks.length)];
                return formatBookData(randomBook);
            }
        }
    } catch (error) {
        console.error('Error in getPopularRecentBooks:', error);
    }
    
    return null;
}

async function getBestsellerBooks() {
    // Search for known bestseller lists and popular books
    const bestsellerTerms = ['fiction bestseller', 'fantasy bestseller', 'mystery bestseller', 'romance bestseller'];
    const randomTerm = bestsellerTerms[Math.floor(Math.random() * bestsellerTerms.length)];
    
    const url = `https://openlibrary.org/search.json?q=${encodeURIComponent(randomTerm)}&language=eng&sort=rating&limit=15`;
    
    try {
        const response = await fetch(url);
        if (!response.ok) throw new Error('API Error');
        
        const data = await response.json();
        
        if (data.docs && data.docs.length > 0) {
            const goodBooks = data.docs.filter(book => 
                book.cover_i && 
                book.title && 
                book.author_name && 
                book.first_publish_year >= 2000 &&
                book.title.length > 3 &&
                !book.title.toLowerCase().includes('test')
            );
            
            if (goodBooks.length > 0) {
                const randomBook = goodBooks[Math.floor(Math.random() * goodBooks.length)];
                return formatBookData(randomBook);
            }
        }
    } catch (error) {
        console.error('Error in getBestsellerBooks:', error);
    }
    
    return null;
}

async function getFeaturedBooks() {
    // Search popular genres for featured/trending books
    const genres = ['fantasy', 'mystery', 'romance', 'thriller', 'science fiction'];
    const randomGenre = genres[Math.floor(Math.random() * genres.length)];
    
    const url = `https://openlibrary.org/search.json?q=subject:${randomGenre}&language=eng&sort=rating&limit=20`;
    
    try {
        const response = await fetch(url);
        if (!response.ok) throw new Error('API Error');
        
        const data = await response.json();
        
        if (data.docs && data.docs.length > 0) {
            const recentBooks = data.docs.filter(book => 
                book.cover_i && 
                book.title && 
                book.author_name && 
                book.first_publish_year >= 2010 && // More recent for this method
                book.title.length > 3 &&
                !book.title.toLowerCase().includes('test')
            );
            
            if (recentBooks.length > 0) {
                const randomBook = recentBooks[Math.floor(Math.random() * recentBooks.length)];
                return formatBookData(randomBook);
            }
        }
    } catch (error) {
        console.error('Error in getFeaturedBooks:', error);
    }
    
    return null;
}

async function getSimpleRecentBook() {
    // Simple fallback - just get any decent recent book
    const currentYear = new Date().getFullYear();
    const randomYear = currentYear - Math.floor(Math.random() * 10);
    
    const url = `https://openlibrary.org/search.json?q=fiction&publish_year=${randomYear}&language=eng&limit=10`;
    
    try {
        const response = await fetch(url);
        const data = await response.json();
        
        if (data.docs && data.docs.length > 0) {
            const books = data.docs.filter(book => book.cover_i && book.title && book.author_name);
            if (books.length > 0) {
                const randomBook = books[Math.floor(Math.random() * books.length)];
                return formatBookData(randomBook);
            }
        }
    } catch (error) {
        console.error('Error in getSimpleRecentBook:', error);
    }
    
    return null;
}

function formatBookData(book) {
    return {
        title: book.title,
        authors: book.author_name ? book.author_name.map(name => ({name})) : [],
        cover_id: book.cover_i,
        first_publish_year: book.first_publish_year,
        key: book.key,
        first_sentence: book.first_sentence || [],
        rating: book.ratings_average || null
    };
}

async function showRandomBook() {
    const bookResult = document.getElementById('book-result');
    if (!bookResult) return;
    
    // Show loading state
    bookResult.style.display = 'block';
    document.getElementById('book-title').textContent = 'Finding a great book...';
    document.getElementById('book-description').textContent = '';
    document.getElementById('book-author').textContent = '';
    document.getElementById('book-rating').textContent = '';
    
    const cover = document.getElementById('book-cover');
    if (cover) cover.style.display = 'none';
    
    const goodreadsLink = document.getElementById('goodreads-link');
    if (goodreadsLink) goodreadsLink.style.display = 'none';
    
    const previewBtn = document.getElementById('preview-btn');
    if (previewBtn) previewBtn.style.display = 'none';
    
    // Get book with improved speed and quality
    const book = await getRandomOpenLibraryBook();
    
    if (book) {
        // Display basic book information first
        document.getElementById('book-title').textContent = book.title || 'No title available';
        
        // Display authors
        let authors = 'Unknown author';
        if (book.authors && book.authors.length > 0) {
            authors = book.authors.map(author => author.name || author).join(', ');
        }
        document.getElementById('book-author').textContent = `By ${authors}`;
        
        // Display publication year and rating if available
        let publishInfo = '';
        if (book.first_publish_year) {
            publishInfo = `First published ${book.first_publish_year}`;
        }
        if (book.rating) {
            publishInfo += book.first_publish_year ? ` • Rating: ${book.rating.toFixed(1)}` : `Rating: ${book.rating.toFixed(1)}`;
        }
        document.getElementById('book-rating').textContent = publishInfo;
        
        // Try to get a better description from the book's details page
        await getBookDescription(book);
        
        // Display cover image with better error handling
        if (cover && book.cover_id) {
            const coverUrl = `https://covers.openlibrary.org/b/id/${book.cover_id}-L.jpg`;
            cover.onload = function() {
                cover.style.display = 'block';
                // Scroll to result after image loads (like movies)
                bookResult.scrollIntoView({ behavior: 'smooth', block: 'center' });
            };
            cover.onerror = function() {
                cover.style.display = 'none';
                // Still scroll if image fails to load
                bookResult.scrollIntoView({ behavior: 'smooth', block: 'center' });
            };
            cover.src = coverUrl;
            cover.alt = `Cover of ${book.title}`;
        } else {
            // If no cover, scroll immediately
            bookResult.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
        
        // Set up Open Library link
        if (previewBtn && book.key) {
            previewBtn.style.display = 'inline-block';
            previewBtn.textContent = 'View on Open Library';
            previewBtn.onclick = () => {
                window.open(`https://openlibrary.org${book.key}`, '_blank');
            };
        }
        
    } else {
        // Error state - make it more user-friendly
        document.getElementById('book-title').textContent = "Hmm, having trouble finding books right now";
        document.getElementById('book-description').textContent = "Please try again in a moment!";
        document.getElementById('book-author').textContent = "";
        document.getElementById('book-rating').textContent = "";
        
        // Still scroll to show the error message
        bookResult.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
}

async function getBookDescription(book) {
    // Set a default description first
    let description = 'No description available.';
    
    // Try to use first_sentence from the initial search
    if (book.first_sentence && book.first_sentence.length > 0) {
        description = Array.isArray(book.first_sentence) ? book.first_sentence[0] : book.first_sentence;
    }
    
    // Display the initial description
    document.getElementById('book-description').textContent = description;
    
    // Try to get a better description from the book's work page
    if (book.key) {
        try {
            const workUrl = `https://openlibrary.org${book.key}.json`;
            const response = await fetch(workUrl);
            
            if (response.ok) {
                const workData = await response.json();
                
                // Check for description in the work data
                let betterDescription = null;
                
                if (workData.description) {
                    if (typeof workData.description === 'string') {
                        betterDescription = workData.description;
                    } else if (workData.description.value) {
                        betterDescription = workData.description.value;
                    }
                }
                
                // If we found a better description, update it
                if (betterDescription && betterDescription.length > description.length) {
                    // Clean up the description
                    betterDescription = betterDescription.replace(/\n/g, ' ').trim();
                    
                    // Limit length if too long
                    if (betterDescription.length > 400) {
                        betterDescription = betterDescription.substring(0, 397) + '...';
                    }
                    
                    // Update the description on the page
                    document.getElementById('book-description').textContent = betterDescription;
                }
            }
        } catch (error) {
            console.log('Could not fetch detailed description:', error);
            // Keep the original description - no need to show error to user
        }
    }
}
