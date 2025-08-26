// Curated popular books list (sorted by genre)
const popularBooks = [
  // Biography
  { title: "Steve Jobs", author: "Walter Isaacson", genre: "biography" },
  { title: "Becoming", author: "Michelle Obama", genre: "biography" },
  // Children's
  { title: "Charlotte's Web", author: "E.B. White", genre: "children" },
  { title: "Matilda", author: "Roald Dahl", genre: "children" },
  // Classic
  { title: "Moby-Dick", author: "Herman Melville", genre: "classic" },
  { title: "Jane Eyre", author: "Charlotte Brontë", genre: "classic" },
  // Fantasy
  { title: "Harry Potter and the Sorcerer's Stone", author: "J.K. Rowling", genre: "fantasy" },
  { title: "The Hobbit", author: "J.R.R. Tolkien", genre: "fantasy" },
  // Fiction
  { title: "To Kill a Mockingbird", author: "Harper Lee", genre: "fiction" },
  { title: "The Great Gatsby", author: "F. Scott Fitzgerald", genre: "fiction" },
  { title: "1984", author: "George Orwell", genre: "fiction" },
  // History
  { title: "The Diary of a Young Girl", author: "Anne Frank", genre: "history" },
  { title: "Team of Rivals", author: "Doris Kearns Goodwin", genre: "history" },
  // Mystery
  { title: "Gone Girl", author: "Gillian Flynn", genre: "mystery" },
  { title: "The Girl with the Dragon Tattoo", author: "Stieg Larsson", genre: "mystery" },
  // Non-Fiction
  { title: "Sapiens: A Brief History of Humankind", author: "Yuval Noah Harari", genre: "nonfiction" },
  { title: "Educated", author: "Tara Westover", genre: "nonfiction" },
  // Romance
  { title: "Pride and Prejudice", author: "Jane Austen", genre: "romance" },
  { title: "Me Before You", author: "Jojo Moyes", genre: "romance" },
  // Science
  { title: "A Brief History of Time", author: "Stephen Hawking", genre: "science" },
  { title: "The Selfish Gene", author: "Richard Dawkins", genre: "science" },
  // Self-Help
  { title: "The 7 Habits of Highly Effective People", author: "Stephen R. Covey", genre: "self-help" },
  { title: "Atomic Habits", author: "James Clear", genre: "self-help" },
  // Thriller
  { title: "The Da Vinci Code", author: "Dan Brown", genre: "thriller" },
  { title: "The Silence of the Lambs", author: "Thomas Harris", genre: "thriller" },
  // Young Adult
  { title: "The Fault in Our Stars", author: "John Green", genre: "young-adult" },
  { title: "The Hunger Games", author: "Suzanne Collins", genre: "young-adult" },
  // Rick Riordan books (Percy Jackson, Heroes of Olympus, Kane Chronicles, Trials of Apollo)
  // Percy Jackson & the Olympians
  { title: "The Lightning Thief", author: "Rick Riordan", genre: "young-adult" },
  { title: "The Sea of Monsters", author: "Rick Riordan", genre: "young-adult" },
  { title: "The Titan's Curse", author: "Rick Riordan", genre: "young-adult" },
  { title: "The Battle of the Labyrinth", author: "Rick Riordan", genre: "young-adult" },
  { title: "The Last Olympian", author: "Rick Riordan", genre: "young-adult" },
  // Heroes of Olympus
  { title: "The Lost Hero", author: "Rick Riordan", genre: "young-adult" },
  { title: "The Son of Neptune", author: "Rick Riordan", genre: "young-adult" },
  { title: "The Mark of Athena", author: "Rick Riordan", genre: "young-adult" },
  { title: "The House of Hades", author: "Rick Riordan", genre: "young-adult" },
  { title: "The Blood of Olympus", author: "Rick Riordan", genre: "young-adult" },
  // Kane Chronicles
  { title: "The Red Pyramid", author: "Rick Riordan", genre: "young-adult" },
  { title: "The Throne of Fire", author: "Rick Riordan", genre: "young-adult" },
  { title: "The Serpent's Shadow", author: "Rick Riordan", genre: "young-adult" },
  // Trials of Apollo
  { title: "The Hidden Oracle", author: "Rick Riordan", genre: "young-adult" },
  { title: "The Dark Prophecy", author: "Rick Riordan", genre: "young-adult" },
  { title: "The Burning Maze", author: "Rick Riordan", genre: "young-adult" },
  { title: "The Tyrant's Tomb", author: "Rick Riordan", genre: "young-adult" },
  { title: "The Tower of Nero", author: "Rick Riordan", genre: "young-adult" }
];

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

    // Next Book button functionality
    const nextBookBtn = document.getElementById('next-book-btn');
    if (nextBookBtn) {
        nextBookBtn.onclick = function() {
            showRandomBook();
        };
    }

    // Random Book button functionality
    const randomBookBtn = document.getElementById('Random-book-button');
    if (randomBookBtn) {
        randomBookBtn.onclick = function() {
            showRandomBook();
        };
    }
});

// Google Books API Key
const GOOGLE_BOOKS_API_KEY = 'AIzaSyBDTaZh_q4O7CgY4WzPPvUB5xOJC002XhQ'; // User's provided key

// Shuffle and cycle through all books before repeating
let shuffledBooks = [];
let bookIndex = 0;
function shuffleBooks() {
    shuffledBooks = popularBooks.slice();
    for (let i = shuffledBooks.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffledBooks[i], shuffledBooks[j]] = [shuffledBooks[j], shuffledBooks[i]];
    }
    bookIndex = 0;
}

// Call shuffleBooks once on load
shuffleBooks();

async function getRandomBook() {
    // Pick a random book from the curated list
    if (bookIndex >= shuffledBooks.length) {
        shuffleBooks();
    }
    const bookChoice = shuffledBooks[bookIndex++];
    // Search for all books by the author
    const query = encodeURIComponent(`inauthor:${bookChoice.author}`);
    const url = `https://www.googleapis.com/books/v1/volumes?q=${query}&printType=books&maxResults=20&langRestrict=en&key=${GOOGLE_BOOKS_API_KEY}`;
    try {
        const response = await fetch(url);
        const data = await response.json();
        if (data.items && data.items.length > 0) {
            // Pick a random book from the author's results
            const randomIndex = Math.floor(Math.random() * data.items.length);
            return data.items[randomIndex];
        }
    } catch (error) {
        console.error('Error fetching book from Google Books API:', error);
    }
    return null;
}

// Show random book in the template
async function showRandomBook() {
    let book = await getRandomBook();
    const bookResult = document.getElementById('book-result');
    bookResult.style.display = 'block';
        let attempts = 0;
        while (book && (!book.volumeInfo.imageLinks || !book.volumeInfo.imageLinks.thumbnail) && attempts < 10) {
            book = await getRandomBook();
            attempts++;
        }
        if (book && book.volumeInfo) {
        const info = book.volumeInfo;
        // Limit description to 300 characters
        let description = info.description || '';
        if (description.length > 300) {
            description = description.substring(0, 297) + '...';
        }
        document.getElementById('book-title').textContent = info.title || 'No title';
        document.getElementById('book-description').textContent = description;
        document.getElementById('book-author').textContent = info.authors ? 'By ' + info.authors.join(', ') : '';
        document.getElementById('book-rating').textContent = info.averageRating ? 'Average rating: ' + info.averageRating : '';
        const cover = document.getElementById('book-cover');
        let coverUrl = null;
        if (info.imageLinks) {
            coverUrl = info.imageLinks.extraLarge || info.imageLinks.large || info.imageLinks.medium || info.imageLinks.thumbnail;
        }
        if (cover && coverUrl) {
            cover.src = coverUrl;
            cover.style.display = 'block';
        } else if (cover) {
            cover.style.display = 'none';
        }
        // Goodreads link (if industryIdentifiers has ISBN)
        const goodreadsLink = document.getElementById('goodreads-link');
        if (goodreadsLink && info.industryIdentifiers) {
            const isbn = info.industryIdentifiers.find(id => id.type === 'ISBN_13' || id.type === 'ISBN_10');
            if (isbn) {
                goodreadsLink.href = `https://www.goodreads.com/search?q=${isbn.identifier}`;
                goodreadsLink.style.display = 'inline-block';
            } else {
                goodreadsLink.style.display = 'none';
            }
        }
        // Preview button
        const previewBtn = document.getElementById('preview-btn');
        if (previewBtn && info.previewLink) {
            previewBtn.style.display = 'inline-block';
            previewBtn.onclick = () => {
                window.open(info.previewLink, '_blank');
            };
        } else if (previewBtn) {
            previewBtn.style.display = 'none';
        }
        bookResult.scrollIntoView({ behavior: 'smooth', block: 'center' });
    } else {
        document.getElementById('book-title').textContent = "Sorry, we couldn't find a book for you.";
        document.getElementById('book-description').textContent = "";
        document.getElementById('book-author').textContent = "";
        document.getElementById('book-rating').textContent = "";
        const cover = document.getElementById('book-cover');
        if (cover) cover.style.display = 'none';
        const goodreadsLink = document.getElementById('goodreads-link');
        if (goodreadsLink) goodreadsLink.style.display = 'none';
        const previewBtn = document.getElementById('preview-btn');
        if (previewBtn) previewBtn.style.display = 'none';
        bookResult.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
}

// Book filter system logic
window.addEventListener('DOMContentLoaded', function() {
    const applyFiltersBtn = document.querySelector('.filters button');
    if (applyFiltersBtn) {
        applyFiltersBtn.addEventListener('click', function() {
            const genre = document.getElementById('genre').value;
            const minRating = parseFloat(document.getElementById('rating').value);
            // Filter curated list by genre and rating
            let filteredBooks = popularBooks.filter(book => {
                // Genre match (if not 'all')
                let genreMatch = genre === 'all' || (book.genre && book.genre === genre);
                // Rating match (if available)
                let ratingMatch = !book.rating || book.rating >= minRating;
                return genreMatch && ratingMatch;
            });
            // If no match, fallback to all
            if (filteredBooks.length === 0) filteredBooks = popularBooks;
            // Pick a random book from filtered list
            const bookChoice = filteredBooks[Math.floor(Math.random() * filteredBooks.length)];
            // API search: include genre in query if not 'all'
            let query = `inauthor:${bookChoice.author}`;
            if (genre !== 'all') query += `+subject:${genre}`;
            // Fetch from Google Books API
            const url = `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(query)}&printType=books&maxResults=20&langRestrict=en&key=${GOOGLE_BOOKS_API_KEY}`;
            fetch(url)
                .then(response => response.json())
                .then(data => {
                    let items = data.items || [];
                    // Filter API results by rating
                    items = items.filter(item => {
                        const info = item.volumeInfo;
                        return !info.averageRating || info.averageRating >= minRating;
                    });
                    // Pick a random book with image
                    let book = null;
                    let attempts = 0;
                    while (items.length > 0 && attempts < 10) {
                        const candidate = items[Math.floor(Math.random() * items.length)];
                        if (candidate.volumeInfo.imageLinks && candidate.volumeInfo.imageLinks.thumbnail) {
                            book = candidate;
                            break;
                        }
                        attempts++;
                    }
                    // Show result
                    showBookResult(book);
                });
        });
    }
});

function showBookResult(book) {
    const bookResult = document.getElementById('book-result');
    bookResult.style.display = 'block';
    if (book && book.volumeInfo) {
        const info = book.volumeInfo;
        let description = info.description || '';
        if (description.length > 300) {
            description = description.substring(0, 297) + '...';
        }
        document.getElementById('book-title').textContent = info.title || 'No title';
        document.getElementById('book-description').textContent = description;
        document.getElementById('book-author').textContent = info.authors ? 'By ' + info.authors.join(', ') : '';
        document.getElementById('book-rating').textContent = info.averageRating ? 'Average rating: ' + info.averageRating : '';
        const cover = document.getElementById('book-cover');
        let coverUrl = null;
        if (info.imageLinks) {
            coverUrl = info.imageLinks.extraLarge || info.imageLinks.large || info.imageLinks.medium || info.imageLinks.thumbnail;
        }
        if (cover && coverUrl) {
            cover.src = coverUrl;
            cover.style.display = 'block';
        } else if (cover) {
            cover.style.display = 'none';
        }
        const goodreadsLink = document.getElementById('goodreads-link');
        if (goodreadsLink && info.industryIdentifiers) {
            const isbn = info.industryIdentifiers.find(id => id.type === 'ISBN_13' || id.type === 'ISBN_10');
            if (isbn) {
                goodreadsLink.href = `https://www.goodreads.com/search?q=${isbn.identifier}`;
                goodreadsLink.style.display = 'inline-block';
            } else {
                goodreadsLink.style.display = 'none';
            }
        }
        const previewBtn = document.getElementById('preview-btn');
        if (previewBtn && info.previewLink) {
            previewBtn.style.display = 'inline-block';
            previewBtn.onclick = () => {
                window.open(info.previewLink, '_blank');
            };
        } else if (previewBtn) {
            previewBtn.style.display = 'none';
        }
        bookResult.scrollIntoView({ behavior: 'smooth', block: 'center' });
    } else {
        document.getElementById('book-title').textContent = "Sorry, we couldn't find a book for you.";
        document.getElementById('book-description').textContent = "";
        document.getElementById('book-author').textContent = "";
        document.getElementById('book-rating').textContent = "";
        const cover = document.getElementById('book-cover');
        if (cover) cover.style.display = 'none';
        const goodreadsLink = document.getElementById('goodreads-link');
        if (goodreadsLink) goodreadsLink.style.display = 'none';
        const previewBtn = document.getElementById('preview-btn');
        if (previewBtn) previewBtn.style.display = 'none';
        bookResult.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
}
