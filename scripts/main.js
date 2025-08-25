// Curated popular books list (expanded)
const popularBooks = [
  // Harry Potter series
  { title: "Harry Potter and the Sorcerer's Stone", author: "J.K. Rowling" },
  { title: "Harry Potter and the Chamber of Secrets", author: "J.K. Rowling" },
  { title: "Harry Potter and the Prisoner of Azkaban", author: "J.K. Rowling" },
  { title: "Harry Potter and the Goblet of Fire", author: "J.K. Rowling" },
  { title: "Harry Potter and the Order of the Phoenix", author: "J.K. Rowling" },
  { title: "Harry Potter and the Half-Blood Prince", author: "J.K. Rowling" },
  { title: "Harry Potter and the Deathly Hallows", author: "J.K. Rowling" },
  // Lord of the Rings
  { title: "The Fellowship of the Ring", author: "J.R.R. Tolkien" },
  { title: "The Two Towers", author: "J.R.R. Tolkien" },
  { title: "The Return of the King", author: "J.R.R. Tolkien" },
  // Stephen King
  { title: "Carrie", author: "Stephen King" },
  { title: "The Shining", author: "Stephen King" },
  { title: "It", author: "Stephen King" },
  { title: "Misery", author: "Stephen King" },
  { title: "The Stand", author: "Stephen King" },
  { title: "Pet Sematary", author: "Stephen King" },
  // Agatha Christie
  { title: "Murder on the Orient Express", author: "Agatha Christie" },
  { title: "And Then There Were None", author: "Agatha Christie" },
  { title: "The Murder of Roger Ackroyd", author: "Agatha Christie" },
  // Suzanne Collins
  { title: "The Hunger Games", author: "Suzanne Collins" },
  { title: "Catching Fire", author: "Suzanne Collins" },
  { title: "Mockingjay", author: "Suzanne Collins" },
  // Dan Brown
  { title: "The Da Vinci Code", author: "Dan Brown" },
  { title: "Angels & Demons", author: "Dan Brown" },
  { title: "Inferno", author: "Dan Brown" },
  // More popular fiction
  { title: "The Girl on the Train", author: "Paula Hawkins" },
  { title: "Gone Girl", author: "Gillian Flynn" },
  { title: "Twilight", author: "Stephenie Meyer" },
  { title: "New Moon", author: "Stephenie Meyer" },
  { title: "Eclipse", author: "Stephenie Meyer" },
  { title: "Breaking Dawn", author: "Stephenie Meyer" },
  { title: "The Fault in Our Stars", author: "John Green" },
  { title: "The Alchemist", author: "Paulo Coelho" },
  { title: "To Kill a Mockingbird", author: "Harper Lee" },
  { title: "The Great Gatsby", author: "F. Scott Fitzgerald" },
  { title: "Pride and Prejudice", author: "Jane Austen" },
  { title: "1984", author: "George Orwell" },
  { title: "The Catcher in the Rye", author: "J.D. Salinger" },
  { title: "The Kite Runner", author: "Khaled Hosseini" },
  // Andy Weir books
  { title: "The Martian", author: "Andy Weir" },
  { title: "Artemis", author: "Andy Weir" },
  { title: "Project Hail Mary", author: "Andy Weir" },
  // Dean Koontz books (author only, for API lookup)
  { title: "", author: "Dean Koontz" },
  // Odd Thomas series by Dean Koontz
  { title: "Odd Thomas", author: "Dean Koontz" },
  { title: "Forever Odd", author: "Dean Koontz" },
  { title: "Brother Odd", author: "Dean Koontz" },
  { title: "Odd Hours", author: "Dean Koontz" },
  { title: "Odd Apocalypse", author: "Dean Koontz" },
  { title: "Deeply Odd", author: "Dean Koontz" },
  { title: "Saint Odd", author: "Dean Koontz" },
  // Added by request
  { title: "Johnny Got His Gun", author: "Dalton Trumbo" },
  // Top 100 authors (author only, for API lookup)
  { title: "", author: "J.K. Rowling" },
  { title: "", author: "Stephen King" },
  { title: "", author: "Agatha Christie" },
  { title: "", author: "James Patterson" },
  { title: "", author: "John Grisham" },
  { title: "", author: "Dan Brown" },
  { title: "", author: "Nora Roberts" },
  { title: "", author: "Paulo Coelho" },
  { title: "", author: "George R.R. Martin" },
  { title: "", author: "J.R.R. Tolkien" },
  { title: "", author: "Suzanne Collins" },
  { title: "", author: "Margaret Atwood" },
  { title: "", author: "Haruki Murakami" },
  { title: "", author: "Harper Lee" },
  { title: "", author: "Gillian Flynn" },
  { title: "", author: "C.S. Lewis" },
  { title: "", author: "Ernest Hemingway" },
  { title: "", author: "F. Scott Fitzgerald" },
  { title: "", author: "Jane Austen" },
  { title: "", author: "Mark Twain" },
  { title: "", author: "Charles Dickens" },
  { title: "", author: "Leo Tolstoy" },
  { title: "", author: "Emily Brontë" },
  { title: "", author: "Charlotte Brontë" },
  { title: "", author: "Oscar Wilde" },
  { title: "", author: "Virginia Woolf" },
  { title: "", author: "J.D. Salinger" },
  { title: "", author: "Khaled Hosseini" },
  { title: "", author: "Stephenie Meyer" },
  { title: "", author: "John Green" },
  { title: "", author: "E.L. James" },
  { title: "", author: "Michael Connelly" },
  { title: "", author: "Dean Koontz" },
  { title: "", author: "Andy Weir" },
  { title: "", author: "Ken Follett" },
  { title: "", author: "David Baldacci" },
  { title: "", author: "Jeffrey Archer" },
  { title: "", author: "Terry Pratchett" },
  { title: "", author: "Isaac Asimov" },
  { title: "", author: "Arthur C. Clarke" },
  { title: "", author: "Ray Bradbury" },
  { title: "", author: "Philip K. Dick" },
  { title: "", author: "Neil Gaiman" },
  { title: "", author: "Jules Verne" },
  { title: "", author: "H.G. Wells" },
  { title: "", author: "Robert Ludlum" },
  { title: "", author: "Tom Clancy" },
  { title: "", author: "Wilbur Smith" },
  { title: "", author: "Robin Cook" },
  { title: "", author: "Patricia Cornwell" },
  { title: "", author: "Mary Higgins Clark" },
  { title: "", author: "Jack Higgins" },
  { title: "", author: "Lee Child" },
  { title: "", author: "Stieg Larsson" },
  { title: "", author: "Jo Nesbø" },
  { title: "", author: "Camilla Läckberg" },
  { title: "", author: "Fredrik Backman" },
  { title: "", author: "Colleen Hoover" },
  { title: "", author: "Sally Rooney" },
  { title: "", author: "Tana French" },
  { title: "", author: "Donna Tartt" },
  { title: "", author: "Jhumpa Lahiri" },
  { title: "", author: "Chimamanda Ngozi Adichie" },
  { title: "", author: "Kazuo Ishiguro" },
  { title: "", author: "Salman Rushdie" },
  { title: "", author: "Orhan Pamuk" },
  { title: "", author: "Elif Shafak" },
  { title: "", author: "Alice Munro" },
  { title: "", author: "Toni Morrison" },
  { title: "", author: "Maya Angelou" },
  { title: "", author: "Zadie Smith" },
  { title: "", author: "Ian McEwan" },
  { title: "", author: "Hilary Mantel" },
  { title: "", author: "Margaret Mitchell" },
  { title: "", author: "Louisa May Alcott" },
  { title: "", author: "Jodi Picoult" },
  { title: "", author: "Nicholas Sparks" },
  { title: "", author: "Danielle Steel" },
  { title: "", author: "Barbara Kingsolver" },
  { title: "", author: "Amy Tan" },
  { title: "", author: "Celeste Ng" },
  { title: "", author: "Lisa Jewell" },
  { title: "", author: "Ruth Ware" },
  { title: "", author: "Liane Moriarty" },
  { title: "", author: "Helen Fielding" },
  { title: "", author: "Sophie Kinsella" },
  { title: "", author: "Jojo Moyes" },
  { title: "", author: "Eoin Colfer" },
  { title: "", author: "Rick Riordan" },
  { title: "", author: "Veronica Roth" },
  { title: "", author: "Cassandra Clare" },
  { title: "", author: "Ransom Riggs" },
  { title: "", author: "Victoria Aveyard" },
  { title: "", author: "Marissa Meyer" },
  { title: "", author: "Sarah J. Maas" },
  { title: "", author: "Brandon Sanderson" },
  { title: "", author: "Patrick Rothfuss" },
  { title: "", author: "George Orwell" },
  { title: "", author: "Aldous Huxley" },
  { title: "", author: "William Golding" },
  { title: "", author: "Joseph Heller" },
  { title: "", author: "Kurt Vonnegut" },
  { title: "", author: "Douglas Adams" }
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
    const book = await getRandomBook();
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
