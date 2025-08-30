// Books functionality
import { curatedBooks } from './data/curated-books.js';
import { shuffleArray, createBookStarRating } from './utils.js';

// Book preloading system
let bookCache = {
    google: [],
    openLibrary: [],
    isPreloading: false,
    lastShownBooks: [] // Track recently shown books to avoid duplicates
};

// Store current filter settings
let currentBookFilter = {
    genre: 'all',
    minRating: 3,
    isActive: false
};

export async function preloadBooks() {
    if (bookCache.isPreloading) return;

    bookCache.isPreloading = true;
    console.log('Starting book preloading...');

    // Preload books in background
    const preloadPromises = [];

    // Preload Google Books via server proxy (no client key required)
    preloadPromises.push(preloadGoogleBooks());

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

            const url = `/api/googlebooks/volumes?q=${encodeURIComponent(searchTerm)}&maxResults=10&langRestrict=en&orderBy=relevance`;

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

    // Client may not have an API key; use server proxy which does the work.

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

    const url = `/api/googlebooks/volumes?q=${encodeURIComponent(randomTerm)}&startIndex=${startIndex}&maxResults=20&langRestrict=en&orderBy=relevance`;

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
                const hasAuthors = volumeInfo.authors;

                return hasRating && hasDescription && recentBook && hasAuthors;
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

export async function showRandomBook() {
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
    // For curated books, try Google Books first via server proxy
    if (book.source === 'curated') {
        try {
            const searchQuery = `"${book.title}" "${book.authors[0]}"`;
            const url = `/api/googlebooks/volumes?q=${encodeURIComponent(searchQuery)}&maxResults=5`;

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
    // Use server proxy to search Google Books for covers (no client key required)

    try {
        const searchQuery = `${book.title} ${book.authors[0].name || book.authors[0]}`;
    const url = `/api/googlebooks/volumes?q=${encodeURIComponent(searchQuery)}&maxResults=1`;

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

export function applyBookFilters() {
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

export async function showRandomFilteredBook() {
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
        const curatedBooksFiltered = getFilteredCuratedBooks();
        if (curatedBooksFiltered.length > 0) {
            const randomIndex = Math.floor(Math.random() * curatedBooksFiltered.length);
            displayBook(curatedBooksFiltered[randomIndex]);
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
    const response = await fetch(`/api/googlebooks/volumes?q=${encodeURIComponent(query)}`);
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
    // Use server proxy to search Google Books for covers (no client key required)

    try {
        const searchQuery = `${book.title} ${book.authors[0].name || book.authors[0]}`;
    const url = `/api/googlebooks/volumes?q=${encodeURIComponent(searchQuery)}&maxResults=1`;

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
    if (book.source === 'curated') {
        try {
            const searchQuery = `"${book.title}" "${book.authors[0]}"`;
            const url = `/api/googlebooks/volumes?q=${encodeURIComponent(searchQuery)}&maxResults=5`;

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
    if (book.source === 'curated' && description === 'No description available.') {
        try {
            const authorLastName = book.authors[0].split(' ').pop();
            const searchQuery = `${book.title} ${authorLastName}`;
            const url = `/api/googlebooks/volumes?q=${encodeURIComponent(searchQuery)}&maxResults=10`;

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

// Initialize books functionality
export function initBooks() {
    // Shuffle curated books on page load
    if (window.location.pathname.includes('books.html')) {
        shuffleArray(curatedBooks);
        preloadBooks();
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

    // Random Book button functionality
    const randomBookBtn = document.getElementById('Random-book-button');
    if (randomBookBtn) {
        randomBookBtn.onclick = function() {
            // Reset filters when using main discover button
            currentBookFilter.isActive = false;
            showRandomBook();
        };
    }
}
