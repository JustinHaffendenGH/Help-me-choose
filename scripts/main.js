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

// Google Books API configuration 
const GOOGLE_BOOKS_API_KEY = 'AIzaSyBDTaZh_q4O7CgY4WzPPvUB5xOJC002XhQ';

// Curated list of great books for instant results - EXPANDED
const curatedBooks = [
    // Contemporary Fiction
    { 
        title: "Where the Crawdads Sing", 
        author: "Delia Owens", 
        year: 2018, 
        rating: 4.4,
        genre: "Mystery",
        description: "A girl who raised herself in the marshes becomes a murder suspect."
    },
    { 
        title: "Normal People", 
        author: "Sally Rooney", 
        year: 2018, 
        rating: 4.0,
        genre: "Contemporary Fiction",
        description: "Complex relationship between two Irish teenagers through school and university."
    },
    { 
        title: "Little Fires Everywhere", 
        author: "Celeste Ng", 
        year: 2017, 
        rating: 4.1,
        genre: "Contemporary Fiction",
        description: "Two families in 1990s Ohio clash over secrets and identity."
    },
    { 
        title: "The Vanishing Half", 
        author: "Brit Bennett", 
        year: 2020, 
        rating: 4.3,
        genre: "Contemporary Fiction",
        description: "Twin sisters choose different worlds, affecting their daughters."
    },
    { 
        title: "Anxious People", 
        author: "Fredrik Backman", 
        year: 2020, 
        rating: 4.2,
        genre: "Contemporary Fiction",
        description: "A failed bank robbery reveals everyone's humanity."
    },
    { 
        title: "The Paper Palace", 
        author: "Miranda Cowley Heller", 
        year: 2021, 
        rating: 4.0,
        genre: "Contemporary Fiction",
        description: "A woman must choose between her husband and childhood love."
    },
    { 
        title: "Malibu Rising", 
        author: "Taylor Jenkins Reid", 
        year: 2021, 
        rating: 4.2,
        genre: "Contemporary Fiction",
        description: "Four siblings throw a party that changes everything in 1983 Malibu."
    },
    { 
        title: "Remarkably Bright Creatures", 
        author: "Shelby Van Pelt", 
        year: 2022, 
        rating: 4.3,
        genre: "Contemporary Fiction",
        description: "A widow, a young man, and a clever octopus."
    },
    { 
        title: "A Little Life", 
        author: "Hanya Yanagihara", 
        year: 2015, 
        rating: 4.3,
        genre: "Contemporary Fiction",
        description: "Four friends in NYC exploring trauma, love, and survival."
    },
    { 
        title: "The Goldfinch", 
        author: "Donna Tartt", 
        year: 2013, 
        rating: 4.0,
        genre: "Contemporary Fiction",
        description: "A boy's life changed by tragedy and a stolen painting."
    },

    // Historical Fiction
    { 
        title: "The Seven Husbands of Evelyn Hugo", 
        author: "Taylor Jenkins Reid", 
        year: 2017, 
        rating: 4.3,
        genre: "Historical Fiction",
        description: "A Hollywood icon reveals secrets about her seven marriages."
    },
    { 
        title: "The Song of Achilles", 
        author: "Madeline Miller", 
        year: 2011, 
        rating: 4.3,
        genre: "Historical Fiction",
        description: "Achilles and Patroclus during the Trojan War."
    },
    { 
        title: "The Four Winds", 
        author: "Kristin Hannah", 
        year: 2021, 
        rating: 4.4,
        genre: "Historical Fiction",
        description: "A woman fights for survival during the Great Depression."
    },
    { 
        title: "The Lincoln Highway", 
        author: "Amor Towles", 
        year: 2021, 
        rating: 4.2,
        genre: "Historical Fiction",
        description: "An epic 1950s road trip adventure."
    },
    { 
        title: "Lessons in Chemistry", 
        author: "Bonnie Garmus", 
        year: 2022, 
        rating: 4.4,
        genre: "Historical Fiction",
        description: "A 1960s female scientist becomes a TV cooking star."
    },
    { 
        title: "The Book Thief", 
        author: "Markus Zusak", 
        year: 2005, 
        rating: 4.4,
        genre: "Historical Fiction",
        description: "A girl steals books during WWII in Nazi Germany."
    },

    // Fantasy
    { 
        title: "Circe", 
        author: "Madeline Miller", 
        year: 2018, 
        rating: 4.2,
        genre: "Fantasy",
        description: "The story of the witch Circe from Greek mythology."
    },
    { 
        title: "The Invisible Life of Addie LaRue", 
        author: "V.E. Schwab", 
        year: 2020, 
        rating: 4.2,
        genre: "Fantasy",
        description: "A woman cursed to be forgotten by everyone she meets."
    },
    { 
        title: "The Midnight Library", 
        author: "Matt Haig", 
        year: 2020, 
        rating: 4.2,
        genre: "Fantasy",
        description: "A library where Nora explores different versions of her life."
    },
    { 
        title: "The Priory of the Orange Tree", 
        author: "Samantha Shannon", 
        year: 2019, 
        rating: 4.2,
        genre: "Fantasy",
        description: "Epic fantasy about dragons, queens, and ancient magic."
    },
    { 
        title: "The Atlas Six", 
        author: "Olivie Blake", 
        year: 2022, 
        rating: 4.1,
        genre: "Fantasy",
        description: "Six magicians compete for an exclusive society."
    },
    { 
        title: "The Night Circus", 
        author: "Erin Morgenstern", 
        year: 2011, 
        rating: 4.2,
        genre: "Fantasy",
        description: "A magical competition between two illusionists."
    },
    { 
        title: "The Hobbit", 
        author: "J.R.R. Tolkien", 
        year: 1937, 
        rating: 4.3,
        genre: "Fantasy",
        description: "A hobbit's quest to reclaim treasure from a dragon."
    },

    // Romance
    { 
        title: "People We Meet on Vacation", 
        author: "Emily Henry", 
        year: 2021, 
        rating: 4.3,
        genre: "Romance",
        description: "Best friends take one last vacation together."
    },
    { 
        title: "It Ends with Us", 
        author: "Colleen Hoover", 
        year: 2016, 
        rating: 4.4,
        genre: "Romance",
        description: "A woman's complicated relationship story."
    },
    { 
        title: "Book Lovers", 
        author: "Emily Henry", 
        year: 2022, 
        rating: 4.2,
        genre: "Romance",
        description: "A literary agent and a grumpy editor during vacation."
    },
    { 
        title: "The Love Hypothesis", 
        author: "Ali Hazel", 
        year: 2021, 
        rating: 4.3,
        genre: "Romance",
        description: "A PhD student in a fake relationship with a professor."
    },
    { 
        title: "Beach Read", 
        author: "Emily Henry", 
        year: 2020, 
        rating: 4.1,
        genre: "Romance",
        description: "Two writers challenge each other to write outside their genres."
    },

    // Thriller/Mystery
    { 
        title: "The Silent Patient", 
        author: "Alex Michaelides", 
        year: 2019, 
        rating: 4.1,
        genre: "Thriller",
        description: "A psychotherapist obsessed with a woman who won't speak."
    },
    { 
        title: "The Guest List", 
        author: "Lucy Foley", 
        year: 2020, 
        rating: 4.0,
        genre: "Thriller",
        description: "A wedding on a remote island turns deadly."
    },
    { 
        title: "Gone Girl", 
        author: "Gillian Flynn", 
        year: 2012, 
        rating: 4.0,
        genre: "Thriller",
        description: "A husband becomes suspect when his wife disappears."
    },
    { 
        title: "The Girl on the Train", 
        author: "Paula Hawkins", 
        year: 2015, 
        rating: 3.9,
        genre: "Thriller",
        description: "An unreliable narrator in a missing person case."
    },
    { 
        title: "Big Little Lies", 
        author: "Liane Moriarty", 
        year: 2014, 
        rating: 4.2,
        genre: "Thriller",
        description: "Three women's lives unravel to a deadly incident."
    },
    { 
        title: "Verity", 
        author: "Colleen Hoover", 
        year: 2018, 
        rating: 4.3,
        genre: "Thriller",
        description: "A writer discovers a disturbing manuscript."
    },
    { 
        title: "The Thursday Murder Club", 
        author: "Richard Osman", 
        year: 2020, 
        rating: 4.2,
        genre: "Mystery",
        description: "Four friends investigate cold cases in their retirement community."
    },

    // Science Fiction
    { 
        title: "Project Hail Mary", 
        author: "Andy Weir", 
        year: 2021, 
        rating: 4.5,
        genre: "Science Fiction",
        description: "A man alone on a spaceship must save humanity."
    },
    { 
        title: "Klara and the Sun", 
        author: "Kazuo Ishiguro", 
        year: 2021, 
        rating: 3.9,
        genre: "Science Fiction",
        description: "An artificial friend caring for a sick girl."
    },
    { 
        title: "The Martian", 
        author: "Andy Weir", 
        year: 2011, 
        rating: 4.4,
        genre: "Science Fiction",
        description: "An astronaut stranded on Mars fights for survival."
    },

    // Horror
    { 
        title: "The Institute", 
        author: "Stephen King", 
        year: 2019, 
        rating: 4.1,
        genre: "Horror",
        description: "Children with psychic abilities held captive."
    },
    { 
        title: "Mexican Gothic", 
        author: "Silvia Moreno-Garcia", 
        year: 2020, 
        rating: 4.0,
        genre: "Horror",
        description: "Gothic horror set in 1950s Mexico."
    },

    // Memoir/Biography
    { 
        title: "Educated", 
        author: "Tara Westover", 
        year: 2018, 
        rating: 4.4,
        genre: "Memoir",
        description: "From survivalist family to Cambridge PhD."
    },
    { 
        title: "Becoming", 
        author: "Michelle Obama", 
        year: 2018, 
        rating: 4.5,
        genre: "Memoir",
        description: "Former First Lady's journey to the White House."
    },
    { 
        title: "Untamed", 
        author: "Glennon Doyle", 
        year: 2020, 
        rating: 4.3,
        genre: "Memoir",
        description: "Breaking free from societal expectations."
    },
    { 
        title: "Born a Crime", 
        author: "Trevor Noah", 
        year: 2016, 
        rating: 4.4,
        genre: "Memoir",
        description: "Growing up in apartheid South Africa."
    },

    // Self-Help/Non-Fiction
    { 
        title: "Atomic Habits", 
        author: "James Clear", 
        year: 2018, 
        rating: 4.4,
        genre: "Self-Help",
        description: "Building good habits and breaking bad ones."
    },
    { 
        title: "The Midnight Library", 
        author: "Matt Haig", 
        year: 2020, 
        rating: 4.2,
        genre: "Philosophy",
        description: "Exploring infinite possibilities of life."
    },

    // Dystopian
    { 
        title: "The Handmaid's Tale", 
        author: "Margaret Atwood", 
        year: 1985, 
        rating: 4.1,
        genre: "Dystopian",
        description: "Women forced into reproductive servitude."
    },
    { 
        title: "1984", 
        author: "George Orwell", 
        year: 1949, 
        rating: 4.4,
        genre: "Dystopian",
        description: "Surveillance and rebellion in a totalitarian society."
    },
    { 
        title: "The Hunger Games", 
        author: "Suzanne Collins", 
        year: 2008, 
        rating: 4.3,
        genre: "Dystopian",
        description: "A girl volunteers for a deadly televised competition."
    },

    // Classic Literature
    { 
        title: "To Kill a Mockingbird", 
        author: "Harper Lee", 
        year: 1960, 
        rating: 4.5,
        genre: "Classic Literature",
        description: "Justice and race in the American South."
    },
    { 
        title: "Pride and Prejudice", 
        author: "Jane Austen", 
        year: 1813, 
        rating: 4.3,
        genre: "Classic Literature",
        description: "Elizabeth Bennet and Mr. Darcy's romance."
    },
    { 
        title: "The Great Gatsby", 
        author: "F. Scott Fitzgerald", 
        year: 1925, 
        rating: 4.2,
        genre: "Classic Literature",
        description: "Jazz Age excess and the American Dream."
    },

    // Young Adult
    { 
        title: "The Fault in Our Stars", 
        author: "John Green", 
        year: 2012, 
        rating: 4.2,
        genre: "Young Adult",
        description: "Two teens with cancer fall in love."
    },
    { 
        title: "Eleanor Oliphant Is Completely Fine", 
        author: "Gail Honeyman", 
        year: 2017, 
        rating: 4.2,
        genre: "Contemporary Fiction",
        description: "A socially awkward woman's journey to connection."
    },
    
    // Children's Books
    { 
        title: "Wonder", 
        author: "R.J. Palacio", 
        year: 2012, 
        rating: 4.4,
        genre: "Children's",
        description: "A boy with facial differences starts mainstream school for the first time."
    },
    { 
        title: "Dog Man: Unleashed", 
        author: "Dav Pilkey", 
        year: 2016, 
        rating: 4.7,
        genre: "Children's",
        description: "A dog-headed cop fights crime with humor and heart."
    },
    { 
        title: "Diary of a Wimpy Kid", 
        author: "Jeff Kinney", 
        year: 2007, 
        rating: 4.1,
        genre: "Children's",
        description: "Middle schooler Greg Heffley's hilarious adventures and misadventures."
    },
    { 
        title: "The Wild Robot", 
        author: "Peter Brown", 
        year: 2016, 
        rating: 4.6,
        genre: "Children's",
        description: "A robot stranded on an island learns to adapt and care for an orphaned gosling."
    },
    { 
        title: "New Kid", 
        author: "Jerry Craft", 
        year: 2019, 
        rating: 4.5,
        genre: "Children's",
        description: "Graphic novel about a Black student navigating a new prep school."
    },
    { 
        title: "Wings of Fire: The Dragonet Prophecy", 
        author: "Tui T. Sutherland", 
        year: 2012, 
        rating: 4.6,
        genre: "Children's",
        description: "Five dragonets must fulfill an ancient prophecy to save their world."
    },
    { 
        title: "Hatchet", 
        author: "Gary Paulsen", 
        year: 1987, 
        rating: 4.0,
        genre: "Children's",
        description: "A boy survives alone in the Canadian wilderness after a plane crash."
    },
    { 
        title: "The One and Only Ivan", 
        author: "Katherine Applegate", 
        year: 2012, 
        rating: 4.3,
        genre: "Children's",
        description: "A silverback gorilla tells his story of captivity and friendship."
    },
    { 
        title: "Restart", 
        author: "Gordon Korman", 
        year: 2017, 
        rating: 4.4,
        genre: "Children's",
        description: "A boy with amnesia gets a chance to reinvent himself completely."
    },
    { 
        title: "Fish in a Tree", 
        author: "Lynda Mullaly Hunt", 
        year: 2015, 
        rating: 4.5,
        genre: "Children's",
        description: "A girl with dyslexia discovers her unique strengths and talents."
    },
    { 
        title: "The Girl Who Drank the Moon", 
        author: "Kelly Barnhill", 
        year: 2016, 
        rating: 4.2,
        genre: "Children's",
        description: "A witch accidentally gives a baby magical powers in this fantasy tale."
    },
    { 
        title: "Ghost", 
        author: "Jason Reynolds", 
        year: 2016, 
        rating: 4.4,
        genre: "Children's",
        description: "A boy joins a track team and learns to run from his problems instead of away from them."
    }
];

// Book preloading system
let bookCache = {
    google: [],
    openLibrary: [],
    isPreloading: false,
    lastShownBooks: [] // Track recently shown books to avoid duplicates
};

// Initialize preloading when page loads
window.addEventListener('DOMContentLoaded', function() {
    // Existing movie field clearing code...
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

    // Shuffle curatedBooks array for more randomness on each reload
    function shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
    }

    if (window.location.pathname.includes('books.html')) {
        shuffleArray(curatedBooks);
        preloadBooks();
    }
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

function createStarRating(rating) {
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

function createBookStarRating(rating) {
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

function formatDateToUK(dateString) {
    // Convert YYYY-MM-DD to DD/MM/YYYY format
    if (!dateString) return 'Unknown';
    
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString; // Return original if invalid
    
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    
    return `${day}/${month}/${year}`;
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
            movieRelease.textContent = "Release date: " + formatDateToUK(movie.release_date);
        }
        const movieRating = document.getElementById('movie-rating');
        if (movieRating) {
            movieRating.innerHTML = createStarRating(movie.vote_average);
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
            movieRelease.textContent = "Release date: " + formatDateToUK(movie.release_date);
        }
        const movieRating = document.getElementById('movie-rating');
        if (movieRating) {
            movieRating.innerHTML = createStarRating(movie.vote_average);
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
            // Reset filters when using main discover button
            currentBookFilter.isActive = false;
            showRandomBook();
        };
    }

    // Next Book button functionality
    const nextBookBtn = document.getElementById('next-book-btn');
    if (nextBookBtn) {
        nextBookBtn.onclick = function() {
            // Check if filters are active, if so use filtered search
            if (currentBookFilter.isActive) {
                showRandomFilteredBook();
            } else {
                showRandomBook();
            }
        };
    }
});

// Open Library API functions for random book search - Improved for speed and quality
// === BOOK PRELOADING SYSTEM ===

async function preloadBooks() {
    if (bookCache.isPreloading) return;
    
    bookCache.isPreloading = true;
    console.log('Starting book preloading...');
    
    // Preload books in background
    const preloadPromises = [];
    
    // Preload Google Books
    if (GOOGLE_BOOKS_API_KEY) {
        preloadPromises.push(preloadGoogleBooks());
    }
    
    // Preload Open Library books
    preloadPromises.push(preloadOpenLibraryBooks());
    
    // Run preloading in parallel
    await Promise.allSettled(preloadPromises);
    
    bookCache.isPreloading = false;
    console.log('Book preloading completed');
}

async function preloadGoogleBooks() {
    try {
        const searches = [
            'bestseller fiction 2020..2024',
            'popular novels recent',
            'award winning books',
            'contemporary literature',
            'new releases fiction',
            'literary fiction',
            'popular books 2023',
            'romance novels',
            'fantasy books',
            'mystery thriller books'
        ];
        
        for (const searchTerm of searches) {
            if (bookCache.google.length >= 20) break; // Increased cache size
            
            const url = `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(searchTerm)}&maxResults=10&key=${GOOGLE_BOOKS_API_KEY}&langRestrict=en&orderBy=relevance`;
            
            const response = await fetch(url);
            const data = await response.json();
            
            if (data.items) {
                const goodBooks = data.items.filter(item => {
                    const volumeInfo = item.volumeInfo;
                    return volumeInfo.description && 
                           volumeInfo.authors && 
                           volumeInfo.averageRating >= 3.5;
                }).map(item => {
                    const volumeInfo = item.volumeInfo;
                    return {
                        title: volumeInfo.title,
                        authors: volumeInfo.authors || ['Unknown Author'],
                        description: volumeInfo.description?.substring(0, 400) + (volumeInfo.description?.length > 400 ? '...' : ''),
                        first_publish_year: volumeInfo.publishedDate ? parseInt(volumeInfo.publishedDate.substring(0, 4)) : null,
                        rating: volumeInfo.averageRating || null,
                        cover_url: volumeInfo.imageLinks?.large || volumeInfo.imageLinks?.medium || volumeInfo.imageLinks?.thumbnail,
                        googleBooksId: item.id,
                        source: 'google'
                    };
                });
                
                bookCache.google.push(...goodBooks);
            }
            
            // Small delay between requests
            await new Promise(resolve => setTimeout(resolve, 100));
        }
    } catch (error) {
        console.log('Error preloading Google Books:', error);
    }
}

async function preloadOpenLibraryBooks() {
    try {
        const searches = [
            { q: 'fiction', publish_year: 2022 },
            { q: 'fantasy', publish_year: 2021 },
            { q: 'mystery', publish_year: 2023 },
            { q: 'romance', publish_year: 2023 },
            { q: 'thriller', publish_year: 2022 },
            { q: 'science fiction', publish_year: 2021 },
            { q: 'historical fiction', publish_year: 2023 },
            { q: 'contemporary fiction', publish_year: 2022 },
            { q: 'literary fiction', publish_year: 2021 },
            { q: 'young adult', publish_year: 2023 }
        ];
        
        for (const search of searches) {
            if (bookCache.openLibrary.length >= 20) break; // Increased from 10
            
            const url = `https://openlibrary.org/search.json?q=${search.q}&publish_year=${search.publish_year}&language=eng&limit=20`; // Increased from 10 to 20
            
            const response = await fetch(url);
            const data = await response.json();
            
            if (data.docs) {
                const goodBooks = data.docs.filter(book => 
                    book.cover_i && 
                    book.title && 
                    book.author_name &&
                    book.first_publish_year >= 2020
                ).map(book => formatBookData(book));
                
                bookCache.openLibrary.push(...goodBooks);
            }
            
            // Small delay between requests
            await new Promise(resolve => setTimeout(resolve, 200));
        }
    } catch (error) {
        console.log('Error preloading Open Library books:', error);
    }
}

// Get a book from cache or fallback to real-time search
function getCachedBook(source) {
    const cache = bookCache[source];
    if (cache && cache.length > 0) {
        // Pick a random book from cache for more variety
        const randomIndex = Math.floor(Math.random() * cache.length);
        return cache.splice(randomIndex, 1)[0];
    }
    return null;
}

// === BOOK SEARCH FUNCTIONS ===

// Get a random book from curated list (instant results) - NO DUPLICATES
function getRandomCuratedBook() {
    // Filter out recently shown books to avoid duplicates
    const availableBooks = curatedBooks.filter(book => 
        !bookCache.lastShownBooks.includes(book.title)
    );
    
    // If we've shown too many books, reset the tracking
    if (availableBooks.length === 0) {
        bookCache.lastShownBooks = [];
        // Use all books again
        const randomIndex = Math.floor(Math.random() * curatedBooks.length);
        const book = curatedBooks[randomIndex];
        bookCache.lastShownBooks.push(book.title);
        return createBookObject(book);
    }
    
    const randomIndex = Math.floor(Math.random() * availableBooks.length);
    const book = availableBooks[randomIndex];
    
    // Track this book to avoid showing it again soon
    bookCache.lastShownBooks.push(book.title);
    
    // Keep only last 20 shown books in memory
    if (bookCache.lastShownBooks.length > 20) {
        bookCache.lastShownBooks.shift();
    }
    
    return createBookObject(book);
}

function createBookObject(book) {
    return {
        title: book.title,
        authors: [{name: book.author}],
        description: book.description || `A highly rated book by ${book.author}, published in ${book.year}.`,
        first_publish_year: book.year,
        rating: book.rating,
        cover_id: null, // Will try to get from Google Books
        key: null,
        source: 'curated'
    };
}

// Google Books API search - now uses cache first
async function getRandomGoogleBook() {
    // Try cached book first for instant results
    const cachedBook = getCachedBook('google');
    if (cachedBook) {
        // Trigger background preloading to refill cache
        if (!bookCache.isPreloading && bookCache.google.length < 3) {
            preloadGoogleBooks();
        }
        return cachedBook;
    }
    
    // Skip Google Books if no API key
    if (!GOOGLE_BOOKS_API_KEY) {
        return null;
    }
    
    const searchTerms = [
        'bestseller fiction 2020..2024',
        'award winning novels recent',
        'popular fiction books',
        'contemporary literature',
        'new releases fiction',
        'literary fiction',
        'popular books 2023',
        'romance novels',
        'fantasy books',
        'mystery thriller books',
        'science fiction books',
        'historical fiction',
        'young adult novels',
        'book club recommendations'
    ];
    
    try {
        const randomTerm = searchTerms[Math.floor(Math.random() * searchTerms.length)];
        const startIndex = Math.floor(Math.random() * 500); // Increased from 100 to 500
        
        const url = `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(randomTerm)}&startIndex=${startIndex}&maxResults=20&key=${GOOGLE_BOOKS_API_KEY}&langRestrict=en&orderBy=relevance`;
        
        const response = await fetch(url);
        const data = await response.json();
        
        if (data.items && data.items.length > 0) {
            // Filter for books with good ratings and published after 2010
            const filteredBooks = data.items.filter(item => {
                const volumeInfo = item.volumeInfo;
                const publishedDate = volumeInfo.publishedDate;
                const year = publishedDate ? parseInt(publishedDate.substring(0, 4)) : 0;
                const hasRating = volumeInfo.averageRating && volumeInfo.averageRating >= 3.5;
                const hasDescription = volumeInfo.description;
                const recentBook = year >= 2010;
                
                return hasRating && hasDescription && recentBook && volumeInfo.authors;
            });
            
            if (filteredBooks.length > 0) {
                const randomBook = filteredBooks[Math.floor(Math.random() * filteredBooks.length)];
                const volumeInfo = randomBook.volumeInfo;
                
                return {
                    title: volumeInfo.title,
                    authors: volumeInfo.authors || ['Unknown Author'],
                    description: volumeInfo.description?.substring(0, 400) + (volumeInfo.description?.length > 400 ? '...' : ''),
                    first_publish_year: volumeInfo.publishedDate ? parseInt(volumeInfo.publishedDate.substring(0, 4)) : null,
                    rating: volumeInfo.averageRating || null,
                    cover_url: volumeInfo.imageLinks?.large || volumeInfo.imageLinks?.medium || volumeInfo.imageLinks?.thumbnail,
                    googleBooksId: randomBook.id,
                    source: 'google'
                };
            }
        }
    } catch (error) {
        console.log('Google Books API error:', error);
    }
    
    return null;
}

// Enhanced Open Library search (existing function)
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
            } else if (result.status === 'rejected') {
                console.log('Search strategy failed:', result.reason);
            }
        }
    } catch (error) {
        console.error('Error in parallel book search:', error);
    }
    
    // Fallback to a simple recent search if parallel search fails
    try {
        return await getSimpleRecentBook();
    } catch (fallbackError) {
        console.error('Fallback search also failed:', fallbackError);
        return null;
    }
}

async function getPopularRecentBooks() {
    // Focus on popular, well-rated books from recent years with simpler search
    const currentYear = new Date().getFullYear();
    const recentYear = currentYear - Math.floor(Math.random() * 5); // Last 5 years for very recent books
    
    // Use simpler search parameters that work more reliably
    const url = `https://openlibrary.org/search.json?q=fiction&publish_year=${recentYear}&language=eng&limit=30`; // Increased from 20 to 30
    
    try {
        const response = await fetch(url);
        if (!response.ok) throw new Error(`API Error: ${response.status}`);
        
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
    // Search for known bestseller lists and popular books with simpler parameters
    const bestsellerTerms = ['fiction', 'fantasy', 'mystery', 'romance', 'thriller', 'science fiction', 'historical fiction', 'contemporary fiction', 'literary fiction', 'young adult'];
    const randomTerm = bestsellerTerms[Math.floor(Math.random() * bestsellerTerms.length)];
    
    const url = `https://openlibrary.org/search.json?q=${encodeURIComponent(randomTerm)}&language=eng&limit=30`; // Increased from 15 to 30
    
    try {
        const response = await fetch(url);
        if (!response.ok) throw new Error(`API Error: ${response.status}`);
        
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
    // Search popular genres for featured/trending books with simpler parameters
    const genres = ['fantasy', 'mystery', 'romance', 'thriller', 'science fiction', 'historical fiction', 'contemporary fiction', 'literary fiction', 'horror', 'adventure'];
    const randomGenre = genres[Math.floor(Math.random() * genres.length)];
    
    const url = `https://openlibrary.org/search.json?q=subject:${randomGenre}&language=eng&limit=30`; // Increased from 20 to 30
    
    try {
        const response = await fetch(url);
        if (!response.ok) throw new Error(`API Error: ${response.status}`);
        
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
        rating: book.ratings_average || null,
        source: 'openlibrary'
    };
}

async function showRandomBook() {
    const bookResult = document.getElementById('book-result');
    if (!bookResult) return;
    
    // Show elegant loading state
    bookResult.style.display = 'block';
    showBookLoadingState();
    
    // INSTANT RESULT: Get curated book for base data
    const curatedBook = getRandomCuratedBook();
    let finalBook = curatedBook;
    
    // Flag to prevent multiple updates
    let hasUpdated = false;
    
    // PARALLEL API CALLS: Try to get better results from APIs (but don't display yet)
    const promises = [
        getRandomGoogleBook(),
        getRandomOpenLibraryBook()
    ];
    
    try {
        const results = await Promise.allSettled(promises);
        
        // Only update if we haven't already updated and we get a significantly better result
        if (!hasUpdated) {
            // Collect successful results
            const validBooks = [];
            
            results.forEach((result, index) => {
                if (result.status === 'fulfilled' && result.value) {
                    validBooks.push(result.value);
                }
            });
            
            // If we got API results, pick the best one but only replace curated books 50% of the time
            if (validBooks.length > 0) {
                // Give curated books priority - only replace 50% of the time
                const shouldUseApiBook = Math.random() < 0.5;
                
                if (shouldUseApiBook) {
                    // Prioritize Google Books for speed and quality, then Open Library
                    const bestBook = validBooks.find(book => book.source === 'google') || 
                                   validBooks.find(book => book.source === 'openlibrary') || 
                                   validBooks[0];
                    
                    // Only replace if the API book has a good description and wasn't recently shown
                    if (bestBook && 
                        bestBook.description && 
                        bestBook.description !== 'No description available.' &&
                        !bookCache.lastShownBooks.includes(bestBook.title)) {
                        
                        // Add to recently shown to prevent duplicates
                        bookCache.lastShownBooks.push(bestBook.title);
                        if (bookCache.lastShownBooks.length > 20) {
                            bookCache.lastShownBooks.shift();
                        }
                        
                        finalBook = bestBook;
                        hasUpdated = true;
                    }
                }
            }
        }
        
    } catch (error) {
        console.log('Error fetching books:', error);
        // Keep the curated book that we already have
    }
    
    // Now load all the book data and display everything together
    await displayBookWithLoadingSequence(finalBook);
    
    // Trigger background preloading to keep cache full
    if (!bookCache.isPreloading && 
        (bookCache.google.length < 3 || bookCache.openLibrary.length < 3)) {
        setTimeout(() => preloadBooks(), 1000); // Delay to not interfere with current search
    }
}

function showBookLoadingState() {
    // Clear all content and show loading message
    document.getElementById('book-title').textContent = '📚 Finding your next read...';
    document.getElementById('book-description').textContent = '';
    document.getElementById('book-author').textContent = '';
    document.getElementById('book-rating').textContent = '';
    
    const cover = document.getElementById('book-cover');
    if (cover) cover.style.display = 'none';
    
    const goodreadsLink = document.getElementById('goodreads-link');
    if (goodreadsLink) goodreadsLink.style.display = 'none';
    
    const previewBtn = document.getElementById('preview-btn');
    if (previewBtn) previewBtn.style.display = 'none';
}

async function displayBookWithLoadingSequence(book) {
    if (!book) return;
    
    // Prepare all the content first
    const bookData = {
        title: book.title || 'No title available',
        authors: 'Unknown author',
        description: book.description || 'No description available.',
        publishInfo: '',
        coverUrl: null,
        previewConfig: null
    };
    
    // Prepare authors
    if (book.authors && book.authors.length > 0) {
        bookData.authors = book.authors.map(author => author.name || author).join(', ');
        bookData.authors = `By ${bookData.authors}`;
    }
    
    // Prepare publication info and rating
    if (book.first_publish_year) {
        bookData.publishInfo = `Published ${book.first_publish_year}`;
    }
    if (book.rating) {
        // Store rating separately for star display
        bookData.rating = book.rating;
        bookData.hasRating = true;
    } else {
        bookData.hasRating = false;
    }
    
    // Prepare cover URL
    if (book.cover_asset) {
        bookData.coverUrl = book.cover_asset; // Local asset
    } else if (book.cover_url) {
        bookData.coverUrl = book.cover_url; // Google Books cover
    } else if (book.cover_id) {
        bookData.coverUrl = `https://covers.openlibrary.org/b/id/${book.cover_id}-L.jpg`; // Open Library cover
    }
    
    // Prepare preview button config
    const previewBtn = document.getElementById('preview-btn');
    if (previewBtn) {
        if (book.googleBooksId) {
            bookData.previewConfig = {
                text: 'View on Google Books',
                url: `https://books.google.com/books?id=${book.googleBooksId}`
            };
        } else if (book.key) {
            bookData.previewConfig = {
                text: 'View on Open Library',
                url: `https://openlibrary.org${book.key}`
            };
        } else {
            // For curated books, search on Google
            const searchQuery = `"${book.title}" "${book.authors[0]}" book`;
            bookData.previewConfig = {
                text: 'Search on Google',
                url: `https://www.google.com/search?q=${encodeURIComponent(searchQuery)}`
            };
        }
    }
    
    // Try to get better description if needed
    if (book.source === 'curated') {
        try {
            const betterDescription = await getBetterDescription(book);
            if (betterDescription && betterDescription.length > bookData.description.length) {
                bookData.description = betterDescription;
            }
        } catch (error) {
            console.log('Could not get better description:', error);
        }
    }
    
    // Load cover image if available (but don't wait for it to display content)
    let coverLoaded = false;
    const cover = document.getElementById('book-cover');
    
    if (cover && bookData.coverUrl) {
        const coverPromise = new Promise((resolve) => {
            const img = new Image();
            img.onload = () => {
                cover.src = bookData.coverUrl;
                cover.alt = `Cover of ${bookData.title}`;
                coverLoaded = true;
                resolve(true);
            };
            img.onerror = () => {
                coverLoaded = false;
                resolve(false);
            };
            img.src = bookData.coverUrl;
        });
        
        // Wait up to 2 seconds for cover to load, then proceed anyway
        await Promise.race([
            coverPromise,
            new Promise(resolve => setTimeout(resolve, 2000))
        ]);
    } else if (cover && book.source === 'curated') {
        // Try to get cover from Google Books for curated books
        try {
            await searchCoverForCuratedBookSynchronous(book, cover);
            coverLoaded = cover.src && cover.src !== '';
        } catch (error) {
            console.log('Could not load curated book cover:', error);
        }
    }
    
    // Now display everything at once with a smooth reveal
    displayAllBookContent(bookData, coverLoaded);
}

function displayAllBookContent(bookData, coverLoaded) {
    // Display all text content at once
    document.getElementById('book-title').textContent = bookData.title;
    document.getElementById('book-description').textContent = bookData.description;
    document.getElementById('book-author').textContent = bookData.authors;
    
    // Handle rating display with stars
    const ratingElement = document.getElementById('book-rating');
    if (bookData.hasRating) {
        if (bookData.publishInfo) {
            // If we have publish year, show it as text and stars separately
            ratingElement.innerHTML = bookData.publishInfo + '<br>' + createBookStarRating(bookData.rating);
        } else {
            // If no publish year, just show stars
            ratingElement.innerHTML = createBookStarRating(bookData.rating);
        }
    } else {
        // No rating available, just show publish info if any
        ratingElement.textContent = bookData.publishInfo || '';
    }
    
    // Display cover if loaded
    const cover = document.getElementById('book-cover');
    if (cover && coverLoaded) {
        cover.style.display = 'block';
    }
    
    // Setup preview button
    const previewBtn = document.getElementById('preview-btn');
    if (previewBtn && bookData.previewConfig) {
        previewBtn.style.display = 'inline-block';
        previewBtn.textContent = bookData.previewConfig.text;
        previewBtn.onclick = () => {
            window.open(bookData.previewConfig.url, '_blank');
        };
    }

    // Setup Goodreads link
    const goodreadsLink = document.getElementById('goodreads-link');
    if (goodreadsLink && bookData.title && bookData.authors) {
        // Build Goodreads search URL
        const searchQuery = `${bookData.title} ${bookData.authors.replace('By ', '')}`;
        goodreadsLink.href = `https://www.goodreads.com/search?q=${encodeURIComponent(searchQuery)}`;
        goodreadsLink.style.display = 'inline-block';
    }
    
    // Smooth scroll to result
    const bookResult = document.getElementById('book-result');
    if (bookResult) {
        bookResult.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
}

// Helper function to get better description synchronously
async function getBetterDescription(book) {
    // For curated books, try Google Books first
    if (book.source === 'curated' && GOOGLE_BOOKS_API_KEY) {
        try {
            const searchQuery = `"${book.title}" "${book.authors[0]}"`;
            const url = `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(searchQuery)}&maxResults=5&key=${GOOGLE_BOOKS_API_KEY}`;
            
            const response = await fetch(url);
            const data = await response.json();
            
            if (data.items && data.items.length > 0) {
                const bestMatch = data.items.find(item => 
                    item.volumeInfo.title && 
                    item.volumeInfo.title.toLowerCase().includes(book.title.toLowerCase().substring(0, 10))
                ) || data.items[0];
                
                const volumeInfo = bestMatch.volumeInfo;
                if (volumeInfo.description) {
                    let betterDescription = volumeInfo.description;
                    betterDescription = betterDescription.replace(/<[^>]*>/g, '');
                    if (betterDescription.length > 400) {
                        betterDescription = betterDescription.substring(0, 397) + '...';
                    }
                    return betterDescription;
                }
            }
        } catch (error) {
            console.log('Could not fetch Google Books description:', error);
        }
    }
    
    // Try Open Library work page
    if (book.key) {
        try {
            const workUrl = `https://openlibrary.org${book.key}.json`;
            const response = await fetch(workUrl);
            
            if (response.ok) {
                const workData = await response.json();
                let betterDescription = null;
                
                if (workData.description) {
                    if (typeof workData.description === 'string') {
                        betterDescription = workData.description;
                    } else if (workData.description.value) {
                        betterDescription = workData.description.value;
                    }
                }
                
                if (betterDescription) {
                    betterDescription = betterDescription.replace(/\n/g, ' ').trim();
                    if (betterDescription.length > 400) {
                        betterDescription = betterDescription.substring(0, 397) + '...';
                    }
                    return betterDescription;
                }
            }
        } catch (error) {
            console.log('Could not fetch Open Library description:', error);
        }
    }
    
    return null;
}

// Synchronous version of cover search for loading sequence
async function searchCoverForCuratedBookSynchronous(book, coverElement) {
    if (!GOOGLE_BOOKS_API_KEY) return false;
    
    try {
        const searchQuery = `${book.title} ${book.authors[0].name || book.authors[0]}`;
        const url = `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(searchQuery)}&maxResults=1&key=${GOOGLE_BOOKS_API_KEY}`;
        
        const response = await fetch(url);
        const data = await response.json();
        
        if (data.items && data.items.length > 0 && data.items[0].volumeInfo.imageLinks) {
            const imageLinks = data.items[0].volumeInfo.imageLinks;
            const coverUrl = imageLinks.large || imageLinks.medium || imageLinks.thumbnail;
            
            if (coverUrl) {
                return new Promise((resolve) => {
                    const img = new Image();
                    img.onload = () => {
                        coverElement.src = coverUrl;
                        coverElement.alt = `Cover of ${book.title}`;
                        resolve(true);
                    };
                    img.onerror = () => {
                        resolve(false);
                    };
                    img.src = coverUrl;
                });
            }
        }
    } catch (error) {
        console.log('Could not fetch cover for curated book:', error);
    }
    
    return false;
}

function displayBook(book) {
    if (!book) return;
    
    // Display book information
    document.getElementById('book-title').textContent = book.title || 'No title available';
    
    // Display description
    const description = book.description || 'No description available.';
    document.getElementById('book-description').textContent = description;
    
    // Display authors
    let authors = 'Unknown author';
    if (book.authors && book.authors.length > 0) {
        authors = book.authors.map(author => author.name || author).join(', ');
    }
    document.getElementById('book-author').textContent = `By ${authors}`;
    
    // Display publication year and rating if available
    let publishInfo = '';
    if (book.first_publish_year) {
        publishInfo = `Published ${book.first_publish_year}`;
    }
    
    // Handle rating display with stars
    const ratingElement = document.getElementById('book-rating');
    if (book.rating) {
        if (publishInfo) {
            // If we have publish year, show it as text and stars separately
            ratingElement.innerHTML = publishInfo + '<br>' + createBookStarRating(book.rating);
        } else {
            // If no publish year, just show stars
            ratingElement.innerHTML = createBookStarRating(book.rating);
        }
    } else {
        // No rating available, just show publish info if any
        ratingElement.textContent = publishInfo;
    }
    
    // Display cover image with better error handling
    const cover = document.getElementById('book-cover');
    if (cover) {
        let coverUrl = null;
        
        // Determine cover URL based on source
        if (book.cover_url) {
            // Google Books cover
            coverUrl = book.cover_url;
        } else if (book.cover_id) {
            // Open Library cover
            coverUrl = `https://covers.openlibrary.org/b/id/${book.cover_id}-L.jpg`;
        } else if (book.source === 'curated') {
            // Try to get cover from Google Books for curated books
            searchCoverForCuratedBook(book, cover);
            // Don't set coverUrl here, let the search function handle it
        }
        
        if (coverUrl) {
            cover.onload = function() {
                cover.style.display = 'block';
                const bookResultElement = document.getElementById('book-result');
                if (bookResultElement) {
                    bookResultElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }
            };
            cover.onerror = function() {
                cover.style.display = 'none';
                const bookResultElement = document.getElementById('book-result');
                if (bookResultElement) {
                    bookResultElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }
            };
            cover.src = coverUrl;
            cover.alt = `Cover of ${book.title}`;
        } else {
            // If no cover, scroll immediately
            const bookResultElement = document.getElementById('book-result');
            if (bookResultElement) {
                bookResultElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
        }
    }
    
    // Set up preview button based on source
    const previewBtn = document.getElementById('preview-btn');
    if (previewBtn) {
        previewBtn.style.display = 'inline-block';
        
        if (book.googleBooksId) {
            previewBtn.textContent = 'View on Google Books';
            previewBtn.onclick = () => {
                window.open(`https://books.google.com/books?id=${book.googleBooksId}`, '_blank');
            };
        } else if (book.key) {
            previewBtn.textContent = 'View on Open Library';
            previewBtn.onclick = () => {
                window.open(`https://openlibrary.org${book.key}`, '_blank');
            };
        } else {
            // For curated books, search on Google
            previewBtn.textContent = 'Search on Google';
            previewBtn.onclick = () => {
                const searchQuery = `"${book.title}" "${book.authors[0]}" book`;
                window.open(`https://www.google.com/search?q=${encodeURIComponent(searchQuery)}`, '_blank');
            };
        }
    }
    
    // Try to get better description for curated books
    if (book.source === 'curated') {
        getBookDescription(book);
    }
}

// Helper function to search for cover images for curated books
async function searchCoverForCuratedBook(book, coverElement) {
    // Skip if no Google Books API key
    if (!GOOGLE_BOOKS_API_KEY) {
        return;
    }
    
    try {
        const searchQuery = `${book.title} ${book.authors[0].name || book.authors[0]}`;
        const url = `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(searchQuery)}&maxResults=1&key=${GOOGLE_BOOKS_API_KEY}`;
        
        const response = await fetch(url);
        const data = await response.json();
        
        if (data.items && data.items.length > 0 && data.items[0].volumeInfo.imageLinks) {
            const imageLinks = data.items[0].volumeInfo.imageLinks;
            const coverUrl = imageLinks.large || imageLinks.medium || imageLinks.thumbnail;
            
            if (coverUrl) {
                coverElement.onload = function() {
                    coverElement.style.display = 'block';
                    const bookResultElement = document.getElementById('book-result');
                    if (bookResultElement) {
                        bookResultElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    }
                };
                coverElement.onerror = function() {
                    coverElement.style.display = 'none';
                };
                coverElement.src = coverUrl;
                coverElement.alt = `Cover of ${book.title}`;
            }
        }
    } catch (error) {
        console.log('Could not fetch cover for curated book:', error);
    }
}

async function getBookDescription(book) {
    const descriptionElement = document.getElementById('book-description');
    if (!descriptionElement) return;
    
    // Set a default description first
    let description = 'No description available.';
    
    // Try to use first_sentence from the initial search
    if (book.first_sentence && book.first_sentence.length > 0) {
        description = Array.isArray(book.first_sentence) ? book.first_sentence[0] : book.first_sentence;
    }
    
    // Display the initial description
    descriptionElement.textContent = description;
    
    // For curated books, try Google Books first
    if (book.source === 'curated' && GOOGLE_BOOKS_API_KEY) {
        try {
            const searchQuery = `"${book.title}" "${book.authors[0]}"`;
            const url = `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(searchQuery)}&maxResults=5&key=${GOOGLE_BOOKS_API_KEY}`;
            
            const response = await fetch(url);
            const data = await response.json();
            
            if (data.items && data.items.length > 0) {
                // Find the best match by title similarity
                const bestMatch = data.items.find(item => 
                    item.volumeInfo.title && 
                    item.volumeInfo.title.toLowerCase().includes(book.title.toLowerCase().substring(0, 10))
                ) || data.items[0];
                
                const volumeInfo = bestMatch.volumeInfo;
                if (volumeInfo.description) {
                    let betterDescription = volumeInfo.description;
                    
                    // Clean up HTML tags if present
                    betterDescription = betterDescription.replace(/<[^>]*>/g, '');
                    
                    // Limit length if too long
                    if (betterDescription.length > 400) {
                        betterDescription = betterDescription.substring(0, 397) + '...';
                    }
                    
                    descriptionElement.textContent = betterDescription;
                    return; // Success, no need to try Open Library
                }
            }
        } catch (error) {
            console.log('Could not fetch Google Books description:', error);
        }
    }
    
    // Try to get a better description from Open Library work page
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
                    
                    descriptionElement.textContent = betterDescription;
                    return;
                }
            }
        } catch (error) {
            console.log('Could not fetch detailed description:', error);
        }
    }
    
    // For curated books without success, try a broader Google Books search
    if (book.source === 'curated' && description === 'No description available.' && GOOGLE_BOOKS_API_KEY) {
        try {
            const authorLastName = book.authors[0].split(' ').pop();
            const searchQuery = `${book.title} ${authorLastName}`;
            const url = `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(searchQuery)}&maxResults=10&key=${GOOGLE_BOOKS_API_KEY}`;
            
            const response = await fetch(url);
            const data = await response.json();
            
            if (data.items && data.items.length > 0) {
                // Look for any book with a good description
                for (const item of data.items) {
                    const volumeInfo = item.volumeInfo;
                    if (volumeInfo.description && volumeInfo.description.length > 100) {
                        let foundDescription = volumeInfo.description;
                        
                        // Clean up HTML tags if present
                        foundDescription = foundDescription.replace(/<[^>]*>/g, '');
                        
                        // Limit length if too long
                        if (foundDescription.length > 400) {
                            foundDescription = foundDescription.substring(0, 397) + '...';
                        }
                        
                        descriptionElement.textContent = foundDescription;
                        break;
                    }
                }
            }
        } catch (error) {
            console.log('Could not fetch broader Google Books description:', error);
        }
    }
}

// Book filtering functionality
let currentBookFilter = {
    genre: 'all',
    minRating: 3,
    isActive: false
};

function applyBookFilters() {
    const genre = document.getElementById('genre').value;
    const minRating = parseFloat(document.getElementById('rating').value);

    // Store the current filter settings
    currentBookFilter = {
        genre: genre,
        minRating: minRating,
        isActive: true
    };

    // Get a random book with the new filter applied
    showRandomFilteredBook();
}

async function showRandomFilteredBook() {
    const bookResult = document.getElementById('book-result');
    if (!bookResult) return;
    
    // Show loading state
    bookResult.style.display = 'block';
    showBookLoadingState();
    
    try {
        // Get filtered books from APIs
        const promises = [
            getFilteredGoogleBooks(),
            getFilteredOpenLibraryBooks()
        ];
        
        const results = await Promise.allSettled(promises);
        let allBooks = [];
        
        // Collect books from all successful API calls
        results.forEach(result => {
            if (result.status === 'fulfilled' && result.value && result.value.length > 0) {
                allBooks = allBooks.concat(result.value);
            }
        });
        
        // If no API results, fall back to filtered curated books
        if (allBooks.length === 0) {
            allBooks = getFilteredCuratedBooks();
        }
        
        if (allBooks.length > 0) {
            // Select random book from filtered results
            const randomIndex = Math.floor(Math.random() * allBooks.length);
            const book = allBooks[randomIndex];
            displayBook(book);
        } else {
            displayNoBookResults();
        }
        
    } catch (error) {
        console.error('Error getting filtered books:', error);
        // Fallback to curated books
        const curatedBooks = getFilteredCuratedBooks();
        if (curatedBooks.length > 0) {
            const randomIndex = Math.floor(Math.random() * curatedBooks.length);
            displayBook(curatedBooks[randomIndex]);
        } else {
            displayNoBookResults();
        }
    }
}

async function getFilteredGoogleBooks() {
    const { genre, minRating } = currentBookFilter;
    
    // Build search query based on genre
    let query = 'subject:';
    if (genre === 'all') {
        const genres = ['fiction', 'mystery', 'romance', 'fantasy', 'science', 'history'];
        query += genres[Math.floor(Math.random() * genres.length)];
    } else {
        query += genre;
    }
    
    // Add quality filters
    query += '+inauthor:*&orderBy=relevance&maxResults=20';
    
    try {
        const response = await fetch(`https://www.googleapis.com/books/v1/volumes?q=${query}`);
        const data = await response.json();
        
        if (data.items) {
            const filteredBooks = data.items.filter(item => {
                const volumeInfo = item.volumeInfo;
                const rating = volumeInfo.averageRating || 0;
                const hasImage = volumeInfo.imageLinks && volumeInfo.imageLinks.thumbnail;
                const hasAuthors = volumeInfo.authors && volumeInfo.authors.length > 0;
                
                return rating >= minRating && hasImage && hasAuthors && volumeInfo.title;
            }).map(item => ({
                title: item.volumeInfo.title,
                authors: item.volumeInfo.authors,
                description: item.volumeInfo.description || 'No description available.',
                image: item.volumeInfo.imageLinks?.thumbnail?.replace('http:', 'https:'),
                rating: item.volumeInfo.averageRating,
                goodreadsUrl: `https://www.goodreads.com/search?q=${encodeURIComponent(item.volumeInfo.title)}`,
                previewUrl: item.volumeInfo.previewLink,
                source: 'google'
            }));
            
            return filteredBooks;
        }
    } catch (error) {
        console.error('Error fetching filtered Google books:', error);
    }
    
    return [];
}

async function getFilteredOpenLibraryBooks() {
    const { genre, minRating } = currentBookFilter;
    
    // Build search query based on genre
    let query = '';
    if (genre === 'all') {
        const subjects = ['fiction', 'mystery', 'romance', 'fantasy', 'science', 'history'];
        query = `subject:${subjects[Math.floor(Math.random() * subjects.length)]}`;
    } else {
        query = `subject:${genre}`;
    }
    
    try {
        const response = await fetch(`https://openlibrary.org/search.json?${query}&has_fulltext=true&limit=20`);
        const data = await response.json();
        
        if (data.docs) {
            const filteredBooks = data.docs.filter(book => {
                const rating = book.ratings_average || 0;
                return rating >= minRating && 
                       book.cover_i && 
                       book.title && 
                       book.author_name &&
                       book.author_name.length > 0;
            }).map(book => ({
                title: book.title,
                authors: book.author_name,
                description: book.first_sentence ? book.first_sentence.join(' ') : 'No description available.',
                image: `https://covers.openlibrary.org/b/id/${book.cover_i}-M.jpg`,
                rating: book.ratings_average,
                goodreadsUrl: `https://www.goodreads.com/search?q=${encodeURIComponent(book.title)}`,
                previewUrl: `https://openlibrary.org${book.key}`,
                source: 'openlibrary'
            }));
            
            return filteredBooks;
        }
    } catch (error) {
        console.error('Error fetching filtered Open Library books:', error);
    }
    
    return [];
}

function getFilteredCuratedBooks() {
    const { genre, minRating } = currentBookFilter;
    
    return curatedBooks.filter(book => {
        // Safely check genre match with null/undefined protection
        const bookGenre = book.genre || '';
        const genreMatch = genre === 'all' || 
                          bookGenre.toLowerCase().includes(genre.toLowerCase()) ||
                          (genre === 'young-adult' && bookGenre.toLowerCase().includes('young adult')) ||
                          (genre === 'self-help' && bookGenre.toLowerCase().includes('self-help'));
        
        // Check rating match with null/undefined protection
        const bookRating = book.rating || 0;
        const ratingMatch = bookRating >= minRating;
        
        return genreMatch && ratingMatch;
    });
}

function displayNoBookResults() {
    const bookResult = document.getElementById('book-result');
    const bookTitle = document.getElementById('book-title');
    const bookDescription = document.getElementById('book-description');
    const bookCover = document.getElementById('book-cover');
    
    if (bookTitle) bookTitle.textContent = 'No books found';
    if (bookDescription) bookDescription.textContent = 'Try adjusting your filters to find more books.';
    if (bookCover) bookCover.style.display = 'none';
    
    // Hide other elements
    const elements = ['book-author', 'book-rating', 'goodreads-link', 'preview-btn'];
    elements.forEach(id => {
        const element = document.getElementById(id);
        if (element) element.style.display = 'none';
    });
}

// ============================================
// FOOD PAGE FUNCTIONALITY
// ============================================

// Curated list of great restaurants for instant results
const curatedFoods = [
    // Fast Food Chains
    {
        title: "McDonald's",
        cuisine: "Fast Food",
        price: "$",
        rating: 4.1,
        description: "World-famous fast food chain serving burgers, fries, chicken nuggets, and more. Open 24/7 with breakfast, lunch, and dinner options.",
        location: "Multiple Locations",
        image: "https://images.unsplash.com/photo-1571091718767-18b5b1457add?w=500&q=80&fm=jpg&crop=entropy&cs=tinysrgb",
        website: "https://www.mcdonalds.com/us/en-us/full-menu.html"
    },
    {
        title: "KFC",
        cuisine: "Fast Food",
        price: "$",
        rating: 4.0,
        description: "Kentucky Fried Chicken - Famous for their crispy fried chicken, mashed potatoes, coleslaw, and biscuits.",
        location: "Multiple Locations",
        image: "https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=500&q=80&fm=jpg&crop=entropy&cs=tinysrgb",
        website: "https://www.kfc.com/menu"
    },
    {
        title: "Burger King",
        cuisine: "Fast Food",
        price: "$",
        rating: 4.0,
        description: "Home of the Whopper - Flame-grilled burgers, chicken sandwiches, fries, and onion rings.",
        location: "Multiple Locations",
        image: "https://images.unsplash.com/photo-1571091718767-18b5b1457add?w=500&q=80&fm=jpg&crop=entropy&cs=tinysrgb",
        website: "https://www.bk.com/menu"
    },
    {
        title: "Subway",
        cuisine: "Fast Food",
        price: "$",
        rating: 4.2,
        description: "Fresh submarine sandwiches made to order with your choice of meats, cheeses, vegetables, and sauces.",
        location: "Multiple Locations",
        image: "https://images.unsplash.com/photo-1509722747041-616f39b57569?w=500&q=80&fm=jpg&crop=entropy&cs=tinysrgb",
        website: "https://www.subway.com/en-US/Menu"
    },

    // Pizza Chains
    {
        title: "Pizza Hut",
        cuisine: "Pizza",
        price: "$$",
        rating: 4.1,
        description: "America's favorite pizza with pan pizza, thin 'n crispy, hand-tossed, and specialty pizzas.",
        location: "Multiple Locations",
        image: "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=500&q=80&fm=jpg&crop=entropy&cs=tinysrgb",
        website: "https://www.pizzahut.com/menu"
    },
    {
        title: "Domino's Pizza",
        cuisine: "Pizza",
        price: "$$",
        rating: 4.2,
        description: "Fast pizza delivery with hand-tossed, thin crust, and deep dish pizzas. Famous for their 30-minute guarantee.",
        location: "Multiple Locations",
        image: "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=500&q=80&fm=jpg&crop=entropy&cs=tinysrgb",
        website: "https://www.dominos.com/en/pages/order/menu.jsp"
    },
    {
        title: "Papa John's",
        cuisine: "Pizza",
        price: "$$",
        rating: 4.3,
        description: "Better ingredients, better pizza - fresh dough, sauce from vine-ripened tomatoes, and quality cheese.",
        location: "Multiple Locations",
        image: "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=500&q=80&fm=jpg&crop=entropy&cs=tinysrgb",
        website: "https://www.papajohns.com/order/menu"
    },

    // Chicken Chains
    {
        title: "Popeyes Louisiana Kitchen",
        cuisine: "Chicken",
        price: "$",
        rating: 4.1,
        description: "Louisiana-style fried chicken, red beans and rice, jambalaya, and signature spicy chicken sandwiches.",
        location: "Multiple Locations",
        image: "https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=500&q=80&fm=jpg&crop=entropy&cs=tinysrgb",
        website: "https://www.popeyes.com/menu"
    },
    {
        title: "Chick-fil-A",
        cuisine: "Chicken",
        price: "$",
        rating: 4.4,
        description: "Chicken sandwiches, waffle fries, nuggets, and milkshakes. Famous for their waffle-cut fries and polite service.",
        location: "Multiple Locations",
        image: "https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=500&q=80&fm=jpg&crop=entropy&cs=tinysrgb",
        website: "https://www.chick-fil-a.com/menu"
    },

    // Coffee Chains
    {
        title: "Starbucks",
        cuisine: "Coffee",
        price: "$$",
        rating: 4.2,
        description: "Premium coffee, espresso drinks, pastries, sandwiches, and seasonal specials. Perfect for coffee lovers.",
        location: "Multiple Locations",
        image: "https://images.unsplash.com/photo-1559496417-e7f25cb247f3?w=500&q=80&fm=jpg&crop=entropy&cs=tinysrgb",
        website: "https://www.starbucks.com/menu"
    },
    {
        title: "Dunkin'",
        cuisine: "Coffee",
        price: "$",
        rating: 4.1,
        description: "Donuts, coffee, bagels, breakfast sandwiches, and iced coffee. America's favorite all-day stop.",
        location: "Multiple Locations",
        image: "https://images.unsplash.com/photo-1559496417-e7f25cb247f3?w=500&q=80&fm=jpg&crop=entropy&cs=tinysrgb",
        website: "https://www.dunkindonuts.com/en/menu"
    },

    // Mexican Chains
    {
        title: "Taco Bell",
        cuisine: "Mexican",
        price: "$",
        rating: 4.0,
        description: "Crunchwrap Supremes, burritos, tacos, nachos, and Mexican-inspired fast food favorites.",
        location: "Multiple Locations",
        image: "https://images.unsplash.com/photo-1551504734-5ee1c4a1479b?w=500&q=80&fm=jpg&crop=entropy&cs=tinysrgb",
        website: "https://www.tacobell.com/food"
    },
    {
        title: "Chipotle Mexican Grill",
        cuisine: "Mexican",
        price: "$$",
        rating: 4.3,
        description: "Build-your-own burritos, bowls, tacos, and salads with fresh ingredients and customizable options.",
        location: "Multiple Locations",
        image: "https://images.unsplash.com/photo-1551504734-5ee1c4a1479b?w=500&q=80&fm=jpg&crop=entropy&cs=tinysrgb",
        website: "https://www.chipotle.com/menu"
    },

    // Sandwich Chains
    {
        title: "Panera Bread",
        cuisine: "Sandwiches",
        price: "$$",
        rating: 4.2,
        description: "Artisan breads, soups, salads, sandwiches, and bakery items. Famous for their bread bowls and cafe atmosphere.",
        location: "Multiple Locations",
        image: "https://images.unsplash.com/photo-1509722747041-616f39b57569?w=500&q=80&fm=jpg&crop=entropy&cs=tinysrgb",
        website: "https://www.panerabread.com/en-us/menu.html"
    },
    {
        title: "Jimmy John's",
        cuisine: "Sandwiches",
        price: "$",
        rating: 4.1,
        description: "Gourmet sandwiches, wraps, and subs made fresh daily. Famous for their fast delivery and quality ingredients.",
        location: "Multiple Locations",
        image: "https://images.unsplash.com/photo-1509722747041-616f39b57569?w=500&q=80&fm=jpg&crop=entropy&cs=tinysrgb",
        website: "https://www.jimmyjohns.com/menu"
    },

    // Ice Cream Chains
    {
        title: "Dairy Queen",
        cuisine: "Ice Cream",
        price: "$",
        rating: 4.2,
        description: "Soft serve ice cream, Blizzards, cakes, burgers, fries, and Arctic Rush slushies.",
        location: "Multiple Locations",
        image: "https://images.unsplash.com/photo-1565958011703-44f9829ba187?w=500&q=80&fm=jpg&crop=entropy&cs=tinysrgb",
        website: "https://www.dairyqueen.com/en-us/menu/"
    },
    {
        title: "Baskin Robbins",
        cuisine: "Ice Cream",
        price: "$",
        rating: 4.1,
        description: "31 flavors of ice cream, cakes, sundaes, and frozen treats. World-famous for their variety.",
        location: "Multiple Locations",
        image: "https://images.unsplash.com/photo-1565958011703-44f9829ba187?w=500&q=80&fm=jpg&crop=entropy&cs=tinysrgb",
        website: "https://www.baskinrobbins.com/en/menu"
    },

    // Asian Chains
    {
        title: "Panda Express",
        cuisine: "Chinese",
        price: "$",
        rating: 4.0,
        description: "American Chinese cuisine with orange chicken, Beijing beef, fried rice, and chow mein.",
        location: "Multiple Locations",
        image: "https://images.unsplash.com/photo-1563379091339-03246963d7d7?w=500&q=80&fm=jpg&crop=entropy&cs=tinysrgb",
        website: "https://www.pandaexpress.com/menu"
    },
    {
        title: "PF Chang's",
        cuisine: "Chinese",
        price: "$$$",
        rating: 4.3,
        description: "Upscale Chinese-American dining with dim sum, wok dishes, and Asian-inspired cuisine.",
        location: "Multiple Locations",
        image: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=500&q=80&fm=jpg&crop=entropy&cs=tinysrgb",
        website: "https://www.pfchangs.com/menu"
    },

    // Breakfast Chains
    {
        title: "IHOP",
        cuisine: "Breakfast",
        price: "$$",
        rating: 4.1,
        description: "International House of Pancakes - Famous for pancakes, waffles, omelettes, and all-day breakfast.",
        location: "Multiple Locations",
        image: "https://images.unsplash.com/photo-1551218808-94e220e084d2?w=500&q=80&fm=jpg&crop=entropy&cs=tinysrgb",
        website: "https://www.ihop.com/en/menu"
    },
    {
        title: "Denny's",
        cuisine: "Breakfast",
        price: "$",
        rating: 4.0,
        description: "All-day breakfast, burgers, sandwiches, and comfort food. Open 24/7 in many locations.",
        location: "Multiple Locations",
        image: "https://images.unsplash.com/photo-1551218808-94e220e084d2?w=500&q=80&fm=jpg&crop=entropy&cs=tinysrgb",
        website: "https://www.dennys.com/food/"
    },

    // Seafood Chains
    {
        title: "Red Lobster",
        cuisine: "Seafood",
        price: "$$$",
        rating: 4.2,
        description: "Seafood restaurant with lobster, shrimp, fish, and signature Cheddar Bay Biscuits.",
        location: "Multiple Locations",
        image: "https://images.unsplash.com/photo-1559847844-5315695dadae?w=500&q=80&fm=jpg&crop=entropy&cs=tinysrgb",
        website: "https://www.redlobster.com/menu"
    },
    {
        title: "Long John Silver's",
        cuisine: "Seafood",
        price: "$",
        rating: 3.9,
        description: "Fast seafood with fish, shrimp, clams, hushpuppies, and fries.",
        location: "Multiple Locations",
        image: "https://images.unsplash.com/photo-1559847844-5315695dadae?w=500&q=80&fm=jpg&crop=entropy&cs=tinysrgb",
        website: "https://www.ljsilvers.com/menu"
    }
];

// Food filtering functionality
let currentFoodFilter = {
    cuisine: 'all',
    price: 'all',
    isActive: false
};

// Get random curated food - now uses generated local restaurants
function getRandomCuratedFood() {
    // Use mock location to generate restaurants instead of old static data
    const mockLocation = { lat: 40.7128, lng: -74.0060 }; // NYC as default
    const localRestaurants = generateLocalRestaurants(mockLocation);
    const yelpRestaurants = generateYelpRestaurants(mockLocation);
    const allRestaurants = [...localRestaurants, ...yelpRestaurants];
    
    if (allRestaurants.length > 0) {
        const randomIndex = Math.floor(Math.random() * allRestaurants.length);
        return allRestaurants[randomIndex];
    }
    
    // Ultimate fallback - should never reach here
    return {
        title: "Local Diner",
        cuisine: "American",
        price: "$$",
        rating: 4.0,
        description: "Classic American diner with comfort food.",
        location: "123 Main St, Downtown",
        image: "https://images.unsplash.com/photo-1551782450-17144efb9c50?w=500&q=80&fm=jpg&crop=entropy&cs=tinysrgb",
        place_id: "emergency_fallback_diner",
        website: "https://www.localdiner.com"
    };
}

// Food cache system
let foodCache = {
    google: [],
    yelp: [],
    isPreloading: false,
    lastShownFoods: [], // Track recently shown foods to avoid duplicates
    userLocation: null,
    locationPermission: false
};

// Get user's location
async function getUserLocation() {
    return new Promise((resolve, reject) => {
        if (!navigator.geolocation) {
            reject(new Error('Geolocation is not supported by this browser.'));
            return;
        }

        navigator.geolocation.getCurrentPosition(
            (position) => {
                foodCache.userLocation = {
                    lat: position.coords.latitude,
                    lng: position.coords.longitude
                };
                foodCache.locationPermission = true;
                resolve(foodCache.userLocation);
            },
            (error) => {
                console.log('Location access denied:', error.message);
                foodCache.locationPermission = false;
                reject(error);
            },
            {
                enableHighAccuracy: true,
                timeout: 10000,
                maximumAge: 300000 // 5 minutes
            }
        );
    });
}

// Google Places API for food with location
async function getRandomGooglePlacesFood() {
    try {
        // Prefer server proxy nearby search when available (keeps keys secret).
        const location = foodCache.userLocation || { lat: 40.7128, lng: -74.0060 }; // Default to NYC

        try {
            const resp = await fetch(`/api/nearby?lat=${encodeURIComponent(location.lat)}&lng=${encodeURIComponent(location.lng)}&radius=1500&type=restaurant`);
            if (resp.ok) {
                const json = await resp.json();
                // Map Google Places results to our food object shape
                if (json && Array.isArray(json.results) && json.results.length > 0) {
                    const mapped = json.results.map(r => ({
                        title: r.name,
                        description: r.vicinity || r.formatted_address || '',
                        cuisine: (r.types && r.types[0]) || 'Restaurant',
                        price: r.price_level ? '$'.repeat(r.price_level) : '$$',
                        rating: r.rating || null,
                        image: null,
                        photo_reference: r.photos && r.photos[0] && r.photos[0].photo_reference ? r.photos[0].photo_reference : null,
                        place_id: r.place_id || null,
                        website: r.website || '#',
                        types: r.types || [],
                        vicinity: r.vicinity,
                        formatted_address: r.formatted_address
                    }));

                        // Debug: log a sample mapped result so we can verify presence of photo_reference
                        try {
                            console.log('getRandomGooglePlacesFood - mapped sample:', mapped[0]);
                        } catch (e) {
                            // ignore
                        }
                    const randomIndex = Math.floor(Math.random() * mapped.length);
                    return mapped[randomIndex];
                }
            }
        } catch (proxyErr) {
            // Proxy may not be running or returned an error — fall through to local generator
            console.warn('Nearby proxy fetch failed, falling back to local generator:', proxyErr);
        }

        // Final fallback: use local generated mock restaurants
        const localRestaurants = generateLocalRestaurants(location);
        if (localRestaurants.length > 0) {
            const randomIndex = Math.floor(Math.random() * localRestaurants.length);
            return localRestaurants[randomIndex];
        }
        return null;
    } catch (error) {
        console.log('Error generating local restaurants:', error);
        return null;
    }
}

// Filtered versions with location
async function getFilteredGooglePlacesFoods() {
    if (!foodCache.locationPermission || !foodCache.userLocation) {
        return [];
    }

    // Similar to above but with cuisine/price filters
    return [];
}

// Main food display function
async function showRandomFood() {
    const foodResult = document.getElementById('food-result');
    if (!foodResult) return;

    // Show elegant loading state
    foodResult.style.display = 'block';
    showFoodLoadingState();

    try {
        // First, try to get user's location if we haven't already
        if (!foodCache.locationPermission && foodCache.userLocation === null) {
            try {
                await getUserLocation();
                console.log('User location obtained:', foodCache.userLocation);
            } catch (locationError) {
                console.log('Location access denied, using curated foods');
                // Continue with curated foods if location is denied
            }
        }

        let finalFood = null;

        // PARALLEL API CALLS: Always try to get local restaurants
        const promises = [
            getRandomGooglePlacesFood()
        ];

        try {
            const results = await Promise.allSettled(promises);

            // Collect successful results
            const validFoods = [];

            results.forEach((result, index) => {
                if (result.status === 'fulfilled' && result.value) {
                    validFoods.push(result.value);
                }
            });

            if (validFoods.length > 0) {
                // Use local restaurant if available
                finalFood = validFoods[Math.floor(Math.random() * validFoods.length)];
                const locationType = foodCache.userLocation ? '🎯 Using LOCAL' : '🏙️ Using MOCK LOCAL';
                console.log(locationType, 'restaurant:', finalFood.title, 'at', finalFood.location);
            }
        } catch (apiError) {
            console.log('Error fetching local restaurants:', apiError);
        }

        // FALLBACK: Use local restaurants with mock location if no results
        if (!finalFood) {
            const mockLocation = { lat: 40.7128, lng: -74.0060 }; // NYC as fallback
            const localRestaurants = generateLocalRestaurants(mockLocation);
            if (localRestaurants.length > 0) {
                finalFood = localRestaurants[Math.floor(Math.random() * localRestaurants.length)];
                console.log('🏙️ Using FALLBACK local restaurant (mock location):', finalFood.title);
            }
        }

        // Load all the food data and display everything together
        await displayFoodWithLoadingSequence(finalFood);

        // Trigger background preloading to keep cache full
        if (!foodCache.isPreloading &&
            (foodCache.google.length < 3)) {
            setTimeout(() => preloadFoods(), 1000); // Delay to not interfere with current search
        }

    } catch (error) {
        console.log('Error in showRandomFood:', error);
        // Ultimate fallback to local restaurants with mock location
        const mockLocation = { lat: 40.7128, lng: -74.0060 }; // NYC as fallback
        const localRestaurants = generateLocalRestaurants(mockLocation);
        if (localRestaurants.length > 0) {
            const fallbackFood = localRestaurants[Math.floor(Math.random() * localRestaurants.length)];
            await displayFoodWithLoadingSequence(fallbackFood);
            console.log('🚨 Using EMERGENCY fallback local restaurant:', fallbackFood.title);
        }
    }
}

// Display food with loading sequence
async function displayFoodWithLoadingSequence(food) {
    if (!food) return;

    // Prepare food data
    const foodData = {
        title: food.title,
        description: food.description,
        cuisine: food.cuisine,
        price: food.price,
        rating: food.rating,
        image: food.image || food.photos?.[0]?.getUrl?.() || null,
        fallbackImage: food.fallbackImage
    };

    // Helper: gather potential API-sourced image URLs (Google Places Photo / Yelp image)
    function getApiImageCandidates(item) {
        const candidates = [];

        // Google Places photo_reference -> prefer server proxy first (keeps keys secret).
        // Proxy endpoint: /api/photo?photoreference=PHOTO_REF&maxwidth=1200
        if (item.photo_reference) {
            // Proxy URL (recommended)
            candidates.push(`/api/photo?photoreference=${encodeURIComponent(item.photo_reference)}&maxwidth=1200`);

            // If no proxy is available or running, fall back to client-side key (if present).
            const key = window.GOOGLE_PLACES_API_KEY || null;
            if (key) {
                candidates.push(`https://maps.googleapis.com/maps/api/place/photo?maxwidth=1200&photoreference=${encodeURIComponent(item.photo_reference)}&key=${key}`);
            } else {
                console.warn('Google Places photo_reference present but GOOGLE_PLACES_API_KEY not set on window. Proxy will be used if running.');
            }
        }

        // If Places SDK format (photos array with getUrl), try that result (may be synchronous)
        if (item.photos && Array.isArray(item.photos) && item.photos[0]) {
            try {
                if (typeof item.photos[0].getUrl === 'function') {
                    const url = item.photos[0].getUrl({ maxWidth: 1200 });
                    if (url) candidates.push(url);
                }
            } catch (e) {
                // ignore
            }
        }

    // (Yelp removed) direct image fields are not used

        return candidates.filter(Boolean);
    }

    // Display all text content at once
    document.getElementById('food-title').textContent = foodData.title;
    document.getElementById('food-description').textContent = foodData.description;
    document.getElementById('food-cuisine').textContent = `Cuisine: ${foodData.cuisine}`;
    document.getElementById('food-price').textContent = `Price Range: ${foodData.price}`;

    // Add location indicator to show if it's local or curated
    const isLocal = food.place_id && (food.place_id.startsWith('local_') || food.place_id.startsWith('yelp_'));
    const hasRealLocation = foodCache.userLocation !== null;
    
    let locationIndicator;
    if (isLocal && hasRealLocation) {
        locationIndicator = '📍 Local Restaurant (Real Location)';
    } else if (isLocal && !hasRealLocation) {
        locationIndicator = '🏙️ Local Restaurant (Mock Location)';
    } else {
        locationIndicator = '🏛️ Curated Selection';
    }
    
    document.getElementById('food-cuisine').textContent = `Cuisine: ${foodData.cuisine} • ${locationIndicator}`;

    // Handle rating display with stars
    const ratingElement = document.getElementById('food-rating');
    if (foodData.rating) {
        ratingElement.innerHTML = createFoodStarRating(foodData.rating);
    } else {
        ratingElement.textContent = 'Rating: Not available';
    }

    // Display image using a robust sequential loader to avoid showing broken placeholders
    const foodImage = document.getElementById('food-image');
    if (foodImage) {
        // Helper: try loading a list of URLs sequentially and resolve the first that succeeds
        async function tryLoadSequential(urls) {
            for (const url of urls) {
                if (!url) continue;
                try {
                    await new Promise((resolve, reject) => {
                        const tester = new Image();
                        tester.crossOrigin = 'anonymous';
                        tester.onload = () => resolve(true);
                        tester.onerror = () => reject(new Error('load failed'));
                        tester.src = url;
                    });
                    return url; // first successful URL
                } catch (e) {
                    // try next
                }
            }
            return null;
        }

    // Build prioritized list of candidate images
    const candidates = [];

    // API image candidates (Google Places) are preferred when available
    const apiCandidates = getApiImageCandidates(food);
    for (const u of apiCandidates) candidates.push(u);

    // (Debug removed) Candidate logging and overlay were used during troubleshooting and
    // removed for normal operation.

    if (foodData.image) candidates.push(foodData.image);
    if (foodData.fallbackImage) candidates.push(foodData.fallbackImage);

        // Branded fallbacks
        const brandedFallbacks = {
            'mcdonald': 'https://images.unsplash.com/photo-1551782450-17144efb9c50?w=500&q=80&fm=jpg&crop=entropy&cs=tinysrgb',
            'kfc': 'https://images.unsplash.com/photo-1513639776629-7b61b0ac49cb?w=500&q=80&fm=jpg&crop=entropy&cs=tinysrgb',
            'pizza hut': 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=500&q=80&fm=jpg&crop=entropy&cs=tinysrgb',
            'burger king': 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=500&q=80&fm=jpg&crop=entropy&cs=tinysrgb',
            'starbucks': 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=500&q=80&fm=jpg&crop=entropy&cs=tinysrgb',
            'taco bell': 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=500&q=80&fm=jpg&crop=entropy&cs=tinysrgb',
            'subway': 'https://images.unsplash.com/photo-1509722747041-616f39b57569?w=500&q=80&fm=jpg&crop=entropy&cs=tinysrgb',
            'dunkin': 'https://images.unsplash.com/photo-1559496417-e7f25cb247f3?w=500&q=80&fm=jpg&crop=entropy&cs=tinysrgb',
            'chipotle': 'https://images.unsplash.com/photo-1551782450-a2132b4ba21d?w=500&q=80&fm=jpg&crop=entropy&cs=tinysrgb',
            'domino': 'https://images.unsplash.com/photo-1571066811602-716837d681de?w=500&q=80&fm=jpg&crop=entropy&cs=tinysrgb'
        };

        const nameKey = (foodData.title || '').toLowerCase();
        for (const [k, url] of Object.entries(brandedFallbacks)) {
            if (nameKey.includes(k)) candidates.push(url);
        }

        // Cuisine fallbacks
        const cuisineFallbacks = {
            'Fast Food': 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=500&q=80&fm=jpg&crop=entropy&cs=tinysrgb',
            'Chicken': 'https://images.unsplash.com/photo-1513639776629-7b61b0ac49cb?w=500&q=80&fm=jpg&crop=entropy&cs=tinysrgb',
            'Pizza': 'https://images.unsplash.com/photo-1571066811602-716837d681de?w=500&q=80&fm=jpg&crop=entropy&cs=tinysrgb',
            'Coffee': 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=500&q=80&fm=jpg&crop=entropy&cs=tinysrgb',
            'Mexican': 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=500&q=80&fm=jpg&crop=entropy&cs=tinysrgb',
            'Sandwiches': 'https://images.unsplash.com/photo-1509722747041-616f39b57569?w=500&q=80&fm=jpg&crop=entropy&cs=tinysrgb',
            'Ice Cream': 'https://images.unsplash.com/photo-1567206563064-6f60f40a2b57?w=500&q=80&fm=jpg&crop=entropy&cs=tinysrgb',
            'Chinese': 'https://images.unsplash.com/photo-1563379091339-03246963d7d7?w=500&q=80&fm=jpg&crop=entropy&cs=tinysrgb',
            'Breakfast': 'https://images.unsplash.com/photo-1551782450-17144efb9c50?w=500&q=80&fm=jpg&crop=entropy&cs=tinysrgb',
            'Seafood': 'https://images.unsplash.com/photo-1559847844-5315695dadae?w=500&q=80&fm=jpg&crop=entropy&cs=tinysrgb'
        };
        if (cuisineFallbacks[foodData.cuisine]) candidates.push(cuisineFallbacks[foodData.cuisine]);

        // Generic final fallback
        candidates.push('https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=500&q=80&fm=jpg&crop=entropy&cs=tinysrgb');

        // Try loading sequentially and use the first that succeeds
        const workingUrl = await tryLoadSequential(candidates);
        if (workingUrl) {
            foodImage.src = workingUrl;
            foodImage.alt = `Image of ${foodData.title}`;
            foodImage.style.display = 'block';
            const foodResultElement = document.getElementById('food-result');
            if (foodResultElement) {
                foodResultElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
            // Debug overlay: show which URL was used (helpful during testing)
            try {
                let debugEl = document.getElementById('image-source-debug');
                if (!debugEl) {
                    debugEl = document.createElement('div');
                    debugEl.id = 'image-source-debug';
                    debugEl.style.cssText = 'font-size:0.75rem;color:#333;background:rgba(255,255,255,0.9);padding:6px;border-radius:6px;margin-top:8px;display:inline-block;max-width:96%;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;';
                    foodResultElement.appendChild(debugEl);
                }
                debugEl.textContent = `Image source: ${workingUrl}`;
            } catch (e) {
                // ignore overlay failures
            }
        } else {
            // If none of the remote sources worked, hide the image to avoid ugly placeholders
            foodImage.style.display = 'none';
            const foodResultElement = document.getElementById('food-result');
            if (foodResultElement) {
                foodResultElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
        }
    }

    // Show action buttons
    const menuLink = document.getElementById('menu-link');
    if (menuLink) {
        if (food.website && food.website !== '#') {
            menuLink.style.display = 'inline-block';
            menuLink.href = food.website;
            menuLink.target = '_blank';
            menuLink.textContent = 'View Menu';
        } else {
            // Create a Google search link for the restaurant menu
            const searchQuery = encodeURIComponent(`${food.title} ${food.location || ''} menu`);
            menuLink.style.display = 'inline-block';
            menuLink.href = `https://www.google.com/search?q=${searchQuery}`;
            menuLink.target = '_blank';
            menuLink.textContent = 'Find Menu';
        }
    }

    const directionsBtn = document.getElementById('directions-btn');
    if (directionsBtn) {
        directionsBtn.style.display = 'inline-block';
        directionsBtn.onclick = () => {
            const address = food.formatted_address || food.vicinity || '';
            const query = encodeURIComponent(`${foodData.title} ${address}`);
            window.open(`https://www.google.com/maps/search/?api=1&query=${query}`, '_blank');
        };
    }
}

// Create food star rating (0-5 scale)
function createFoodStarRating(rating) {
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

// Food loading state
function showFoodLoadingState() {
    // Clear all content and show loading message
    document.getElementById('food-title').textContent = '🍽️ Finding your next meal...';
    document.getElementById('food-description').textContent = '';
    document.getElementById('food-cuisine').textContent = '';
    document.getElementById('food-price').textContent = '';
    document.getElementById('food-rating').textContent = '';

    // Hide image and buttons
    const foodImage = document.getElementById('food-image');
    if (foodImage) foodImage.style.display = 'none';

    const menuLink = document.getElementById('menu-link');
    if (menuLink) menuLink.style.display = 'none';

    const directionsBtn = document.getElementById('directions-btn');
    if (directionsBtn) directionsBtn.style.display = 'none';
}

// Apply food filters
function applyFoodFilters() {
    const cuisine = document.getElementById('cuisine').value;
    const price = document.getElementById('price').value;

    // Store the current filter settings
    currentFoodFilter = {
        cuisine: cuisine,
        price: price,
        isActive: true
    };

    // Get a random food with the new filter applied
    showRandomFilteredFood();
}

// Show filtered food
async function showRandomFilteredFood() {
    const foodResult = document.getElementById('food-result');
    if (!foodResult) return;

    // Show loading state
    foodResult.style.display = 'block';
    showFoodLoadingState();

    try {
        // First, ensure we have location if possible
        if (!foodCache.locationPermission && foodCache.userLocation === null) {
            try {
                await getUserLocation();
            } catch (locationError) {
                console.log('Location access denied for filtered search');
            }
        }

        let finalFood = null;

        // Try to get filtered local restaurants first
        if (foodCache.locationPermission && foodCache.userLocation) {
            const promises = [
                getFilteredGooglePlacesFoods(),
                getFilteredYelpFoods()
            ];

            const results = await Promise.allSettled(promises);

            // Collect successful results
            const validFoods = [];
            results.forEach((result, index) => {
                if (result.status === 'fulfilled' && result.value) {
                    validFoods.push(...result.value);
                }
            });

            if (validFoods.length > 0) {
                // Filter by our criteria
                const filteredFoods = validFoods.filter(food => {
                    const { cuisine, price } = currentFoodFilter;

                    // Cuisine filter
                    if (cuisine !== 'all' && !food.types?.some(type =>
                        type.toLowerCase().includes(cuisine.toLowerCase()))) {
                        return false;
                    }

                    // Price filter
                    if (price !== 'all') {
                        const foodPrice = food.price_level || food.price;
                        if (!foodPrice) return false;

                        const priceMap = {'$': 1, '$$': 2, '$$$': 3, '$$$$': 4};
                        const filterPrice = priceMap[price];
                        if (foodPrice !== filterPrice) return false;
                    }

                    return true;
                });

                if (filteredFoods.length > 0) {
                    finalFood = filteredFoods[Math.floor(Math.random() * filteredFoods.length)];
                }
            }
        }

        // Fallback to filtered curated foods if no local results
        if (!finalFood) {
            const curatedFood = getRandomCuratedFood();
            // Apply basic filtering to curated foods
            const { cuisine, price } = currentFoodFilter;

            // Simple cuisine matching for curated foods
            if (cuisine !== 'all' && !curatedFood.cuisine.toLowerCase().includes(cuisine.toLowerCase())) {
                // Get another curated food that might match
                finalFood = getRandomCuratedFood();
            } else {
                finalFood = curatedFood;
            }

            // Price filtering for curated foods
            if (price !== 'all' && finalFood.price !== price) {
                // Try to find a matching price, but don't loop forever
                for (let i = 0; i < 5; i++) {
                    const testFood = getRandomCuratedFood();
                    if (testFood.price === price) {
                        finalFood = testFood;
                        break;
                    }
                }
            }
        }

        await displayFoodWithLoadingSequence(finalFood);

    } catch (error) {
        console.log('Error fetching filtered foods:', error);
        // Fallback to curated food
        const curatedFood = getRandomCuratedFood();
        await displayFoodWithLoadingSequence(curatedFood);
    }
}

// (Mock generator removed) The real `getRandomGooglePlacesFood` implementation above
// queries the server proxy `/api/nearby` and will be used instead. Mock local
// restaurants are generated by `generateLocalRestaurants()` when needed.

// Yelp API for food
async function getRandomYelpFood() {
    // Yelp integration disabled for now. Return null so client uses Google/local sources only.
    return null;
}

// Generate realistic local restaurants based on user location
function generateLocalRestaurants(userLocation) {
    // Create location-based restaurant names and descriptions
    const localChains = [
        { name: "Downtown Grill", cuisine: "American", price: "$$", rating: 4.3, desc: "Classic American grill with burgers, steaks, and local favorites." },
        { name: "City Center Bistro", cuisine: "French", price: "$$$", rating: 4.6, desc: "Elegant French bistro featuring classic dishes and fine wines." },
        { name: "Metro Pizza Co.", cuisine: "Pizza", price: "$$", rating: 4.4, desc: "Authentic wood-fired pizzas with fresh local ingredients." },
        { name: "Urban Sushi", cuisine: "Japanese", price: "$$$", rating: 4.5, desc: "Fresh sushi and Japanese cuisine in the heart of the city." },
        { name: "Riverside Cafe", cuisine: "Cafe", price: "$", rating: 4.2, desc: "Cozy riverside cafe with great coffee and light meals." },
        { name: "Harbor Seafood", cuisine: "Seafood", price: "$$$", rating: 4.7, desc: "Fresh seafood dishes with ocean views and local catches." },
        { name: "Market Street BBQ", cuisine: "BBQ", price: "$$", rating: 4.5, desc: "Slow-smoked BBQ with authentic Southern flavors." },
        { name: "Central Perk Coffee", cuisine: "Coffee", price: "$", rating: 4.1, desc: "Local coffee shop with artisanal brews and pastries." },
        { name: "Boulevard Burgers", cuisine: "Fast Food", price: "$", rating: 4.0, desc: "Gourmet burgers and fries with creative toppings." },
        { name: "Corner Thai", cuisine: "Thai", price: "$$", rating: 4.3, desc: "Authentic Thai cuisine with spicy curries and fresh herbs." }
    ];

    // Generate location-specific addresses based on coordinates
    const generateAddress = (lat, lng) => {
        const streets = ["Main St", "Oak Ave", "Maple Dr", "Pine St", "Cedar Ln", "Elm St", "Washington Blvd", "Lincoln Ave", "Jefferson St", "Madison Dr"];
        const areas = ["Downtown", "Midtown", "Uptown", "West End", "East Side", "North District", "South Plaza", "Central Business District"];

        const street = streets[Math.floor(Math.random() * streets.length)];
        const number = Math.floor(Math.random() * 900) + 100;
        const area = areas[Math.floor(Math.random() * areas.length)];

        return `${number} ${street}, ${area}`;
    };

    // Create restaurant objects with realistic data
    return localChains.map(chain => ({
        title: chain.name,
        cuisine: chain.cuisine,
        price: chain.price,
        rating: chain.rating,
        description: chain.desc,
        location: generateAddress(userLocation.lat, userLocation.lng),
        image: getCuisineImage(chain.cuisine),
        place_id: `local_${chain.name.toLowerCase().replace(/\s+/g, '_')}_${Date.now()}`,
        website: `https://www.${chain.name.toLowerCase().replace(/\s+/g, '')}.com`,
        types: ["restaurant", chain.cuisine.toLowerCase()],
        price_level: chain.price.length
    }));
}

// Generate additional restaurants from "Yelp" data
function generateYelpRestaurants(userLocation) {
    // Yelp mock generator disabled while Yelp integration is removed.
    return [];
}

// Get appropriate image for cuisine type
function getCuisineImage(cuisine) {
    const cuisineImages = {
        'American': 'https://images.unsplash.com/photo-1551782450-17144efb9c50?w=500&q=80&fm=jpg&crop=entropy&cs=tinysrgb',
        'French': 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=500&q=80&fm=jpg&crop=entropy&cs=tinysrgb',
        'Pizza': 'https://images.unsplash.com/photo-1571066811602-716837d681de?w=500&q=80&fm=jpg&crop=entropy&cs=tinysrgb',
        'Japanese': 'https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=500&q=80&fm=jpg&crop=entropy&cs=tinysrgb',
        'Cafe': 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=500&q=80&fm=jpg&crop=entropy&cs=tinysrgb',
        'Seafood': 'https://images.unsplash.com/photo-1559847844-5315695dadae?w=500&q=80&fm=jpg&crop=entropy&cs=tinysrgb',
        'BBQ': 'https://images.unsplash.com/photo-1529193591184-b1d58069ecdd?w=500&q=80&fm=jpg&crop=entropy&cs=tinysrgb',
        'Coffee': 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=500&q=80&fm=jpg&crop=entropy&cs=tinysrgb',
        'Fast Food': 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=500&q=80&fm=jpg&crop=entropy&cs=tinysrgb',
        'Thai': 'https://images.unsplash.com/photo-1559847844-d1bfe345eff?w=500&q=80&fm=jpg&crop=entropy&cs=tinysrgb',
        'Mexican': 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=500&q=80&fm=jpg&crop=entropy&cs=tinysrgb',
        'Healthy': 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=500&q=80&fm=jpg&crop=entropy&cs=tinysrgb',
        'Indian': 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=500&q=80&fm=jpg&crop=entropy&cs=tinysrgb',
        'Mediterranean': 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=500&q=80&fm=jpg&crop=entropy&cs=tinysrgb',
        'Chinese': 'https://images.unsplash.com/photo-1563379091339-03246963d7d7?w=500&q=80&fm=jpg&crop=entropy&cs=tinysrgb',
        'Italian': 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=500&q=80&fm=jpg&crop=entropy&cs=tinysrgb',
        'Vegan': 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=500&q=80&fm=jpg&crop=entropy&cs=tinysrgb'
    };

    return cuisineImages[cuisine] || 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=500&q=80&fm=jpg&crop=entropy&cs=tinysrgb';
}

// Filtered versions
async function getFilteredGooglePlacesFoods() {
    if (!foodCache.locationPermission || !foodCache.userLocation) {
        return [];
    }
    try {
        // Try using proxy nearby search with optional keyword from current filters
        const loc = foodCache.userLocation;
        const keyword = currentFoodFilter && currentFoodFilter.cuisine && currentFoodFilter.cuisine !== 'all' ? `&keyword=${encodeURIComponent(currentFoodFilter.cuisine)}` : '';
        try {
            const resp = await fetch(`/api/nearby?lat=${encodeURIComponent(loc.lat)}&lng=${encodeURIComponent(loc.lng)}&radius=1500&type=restaurant${keyword}`);
            if (resp.ok) {
                const json = await resp.json();
                if (json && Array.isArray(json.results)) {
                    return json.results.map(r => ({
                        title: r.name,
                        description: r.vicinity || r.formatted_address || '',
                        cuisine: (r.types && r.types[0]) || 'Restaurant',
                        price: r.price_level ? '$'.repeat(r.price_level) : '$$',
                        rating: r.rating || null,
                        image: null,
                        photo_reference: r.photos && r.photos[0] && r.photos[0].photo_reference ? r.photos[0].photo_reference : null,
                        place_id: r.place_id || null,
                        website: r.website || '#',
                        types: r.types || [],
                        vicinity: r.vicinity,
                        formatted_address: r.formatted_address
                    }));
                }
            }
        } catch (proxyErr) {
            console.warn('Filtered nearby proxy failed, falling back to mock list:', proxyErr);
        }

        // Fallback to combining generated local and yelp mock restaurants
        const localRestaurants = generateLocalRestaurants(foodCache.userLocation);
        const yelpRestaurants = generateYelpRestaurants(foodCache.userLocation);
        const allRestaurants = [...localRestaurants, ...yelpRestaurants];
        return allRestaurants;

    } catch (error) {
        console.log('Error fetching filtered Google Places foods:', error);
        return [];
    }
}

async function getFilteredYelpFoods() {
    // Yelp disabled
    return [];
}

// Preload foods function
async function preloadFoods() {
    if (foodCache.isPreloading) return;

    foodCache.isPreloading = true;
    console.log('Starting food preloading...');

    // For now, just preload from curated list
    // In future, this could preload from APIs
    // Remove artificial delay - preloading should be instant
    foodCache.isPreloading = false;
}

// Initialize food page functionality
window.addEventListener('DOMContentLoaded', function() {
    // Food page specific initialization
    if (document.getElementById('food-result')) {
        // Initialize location status
        updateLocationStatus();

        // Random Food button functionality
        const randomFoodBtn = document.getElementById('Random-food-button');
        if (randomFoodBtn) {
            randomFoodBtn.onclick = function() {
                // Reset filters when using main discover button
                currentFoodFilter.isActive = false;
                showRandomFood();
            };
        }

        // Next Food button functionality
        const nextFoodBtn = document.getElementById('next-food-btn');
        if (nextFoodBtn) {
            nextFoodBtn.onclick = function() {
                // Check if filters are active, if so use filtered search
                if (currentFoodFilter.isActive) {
                    showRandomFilteredFood();
                } else {
                    showRandomFood();
                }
            };
        }
    }
});

// Update location status indicator
async function updateLocationStatus() {
    const locationIndicator = document.getElementById('location-status');
    const locationIcon = document.getElementById('location-icon');
    const locationText = document.getElementById('location-text');

    if (!locationIndicator) return;

    // Set initial checking state
    locationIndicator.className = 'location-indicator location-checking';
    locationIcon.textContent = '⏳';
    locationText.textContent = 'Checking location access...';

    try {
        // Try to get location
        if (!foodCache.locationPermission && foodCache.userLocation === null) {
            await getUserLocation();
        }

        if (foodCache.locationPermission && foodCache.userLocation) {
            // Location granted
            locationIndicator.className = 'location-indicator location-granted';
            locationIcon.textContent = '✅';
            locationText.textContent = `Local restaurants available! 🌟 (Lat: ${foodCache.userLocation.lat.toFixed(2)}, Lng: ${foodCache.userLocation.lng.toFixed(2)})`;
        } else {
            // Location denied
            locationIndicator.className = 'location-indicator location-denied';
            locationIcon.textContent = '❌';
            locationText.textContent = 'Location access denied - showing local restaurants from NYC area';
        }
    } catch (error) {
        // Location denied or error
        locationIndicator.className = 'location-indicator location-denied';
        locationIcon.textContent = '❌';
        locationText.textContent = 'Location access denied - showing local restaurants from NYC area';
    }
}
