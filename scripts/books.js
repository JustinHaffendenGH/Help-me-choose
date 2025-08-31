// Books functionality
// Note: shuffleArray and createBookStarRating are now available globally from utils.js

// Load curated books data
let curatedBooksData = null;

async function loadCuratedBooks() {
  if (curatedBooksData) return curatedBooksData;

  try {
    // Use the curatedBooks array that's now available globally
    if (window.curatedBooks) {
      curatedBooksData = window.curatedBooks;
      return curatedBooksData;
    }
    // Fallback to loading from JSON if global not available
    const response = await fetch('./scripts/data/curated-books.json');
    curatedBooksData = await response.json();
    return curatedBooksData;
  } catch (error) {
    console.error('Error loading curated books:', error);
    // Fallback to empty array
    return [];
  }
}

// Book preloading system
let bookCache = {
  hardcover: [],
  isPreloading: false,
  lastShownBooks: [], // Track recently shown books to avoid duplicates
};

// Store current filter settings
let currentBookFilter = {
  genre: 'all',
  minRating: 3,
  isActive: false,
};

async function preloadBooks() {
  if (bookCache.isPreloading) return;

  bookCache.isPreloading = true;
  console.log('Starting book preloading...');

  // Preload books in background
  const preloadPromises = [];

  // Preload Hardcover books
  preloadPromises.push(preloadHardcoverBooks());

  // Run preloading in parallel
  await Promise.allSettled(preloadPromises);

  bookCache.isPreloading = false;
  console.log('Book preloading completed');
}

async function preloadHardcoverBooks() {
  try {
    const searches = [
      'bestseller fiction',
      'popular novels',
      'award winning books',
      'contemporary literature',
      'new releases fiction',
      'literary fiction',
      'popular books',
      'romance novels',
      'fantasy books',
      'mystery thriller books',
    ];

    for (const searchTerm of searches) {
      if (bookCache.hardcover.length >= 20) break;

      const url = `/api/hardcover/search?q=${encodeURIComponent(searchTerm)}&per_page=10&page=1`;

      const response = await fetch(url);
      const data = await response.json();

      if (
        data.data &&
        data.data.search &&
        data.data.search.results &&
        data.data.search.results.hits
      ) {
        const goodBooks = data.data.search.results.hits
          .filter((hit) => {
            const book = hit.document;
            return (
              book.title &&
              book.author_names &&
              book.description &&
              book.rating >= 3.5
            );
          })
          .map((hit) => {
            const book = hit.document;
            return {
              title: book.title,
              authors: book.author_names || ['Unknown Author'],
              description:
                book.description?.substring(0, 400) +
                (book.description?.length > 400 ? '...' : ''),
              first_publish_year: book.release_year || null,
              rating: book.rating || null,
              cover_url: book.image?.url || null,
              hardcoverSlug: book.slug,
              source: 'hardcover',
            };
          });

        bookCache.hardcover.push(...goodBooks);
      }

      // Small delay between requests
      await new Promise((resolve) => setTimeout(resolve, 100));
    }
  } catch (error) {
    console.log('Error preloading Hardcover books:', error);
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
async function getRandomCuratedBook() {
  const curatedBooks = await loadCuratedBooks();

  // Filter out recently shown books to avoid duplicates
  const availableBooks = curatedBooks.filter(
    (book) => !bookCache.lastShownBooks.includes(book.title)
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
    authors: [{ name: book.author }],
    description:
      book.description ||
      `A highly rated book by ${book.author}, published in ${book.year}.`,
    first_publish_year: book.year,
    rating: book.rating,
    cover_id: null, // Will try to get from Google Books
    key: null,
    source: 'curated',
  };
}

// Google Books API search - now uses cache first
async function getRandomHardcoverBook() {
  // Try cached book first for instant results
  const cachedBook = getCachedBook('hardcover');
  if (cachedBook) {
    // Trigger background preloading to refill cache
    if (!bookCache.isPreloading && bookCache.hardcover.length < 3) {
      preloadHardcoverBooks();
    }
    return cachedBook;
  }

  // Fallback to a direct search if cache is empty
  try {
    const searchTerm = 'bestseller fiction';
    const url = `/api/hardcover/search?q=${encodeURIComponent(searchTerm)}&per_page=10&page=1`;

    const response = await fetch(url);
    const data = await response.json();

    if (
      data.data &&
      data.data.search &&
      data.data.search.results &&
      data.data.search.results.hits &&
      data.data.search.results.hits.length > 0
    ) {
      const books = data.data.search.results.hits.filter((hit) => {
        const book = hit.document;
        return (
          book.title &&
          book.author_names &&
          book.description &&
          book.rating >= 3.5
        );
      });

      if (books.length > 0) {
        const randomHit = books[Math.floor(Math.random() * books.length)];
        const book = randomHit.document;
        return {
          title: book.title,
          authors: book.author_names || ['Unknown Author'],
          description:
            book.description?.substring(0, 400) +
            (book.description?.length > 400 ? '...' : ''),
          first_publish_year: book.release_year || null,
          rating: book.rating || null,
          cover_url: book.image?.url || null,
          hardcoverSlug: book.slug,
          source: 'hardcover',
        };
      }
    }
  } catch (error) {
    console.error('Error in getRandomHardcoverBook fallback:', error);
  }

  return null;
}

async function getBestsellerBooks() {
  // Search for known bestseller lists and popular books with simpler parameters
  const bestsellerTerms = [
    'fiction',
    'fantasy',
    'mystery',
    'romance',
    'thriller',
    'science fiction',
    'historical fiction',
    'contemporary fiction',
    'literary fiction',
    'young adult',
  ];
  const randomTerm =
    bestsellerTerms[Math.floor(Math.random() * bestsellerTerms.length)];

  const url = `https://openlibrary.org/search.json?q=${encodeURIComponent(randomTerm)}&language=eng&limit=30`; // Increased from 15 to 30

  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`API Error: ${response.status}`);

    const data = await response.json();

    if (data.docs && data.docs.length > 0) {
      const goodBooks = data.docs.filter(
        (book) =>
          book.cover_i &&
          book.title &&
          book.author_name &&
          book.first_publish_year >= 2000 &&
          book.title.length > 3 &&
          !book.title.toLowerCase().includes('test')
      );

      if (goodBooks.length > 0) {
        const randomBook =
          goodBooks[Math.floor(Math.random() * goodBooks.length)];
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
  const genres = [
    'fantasy',
    'mystery',
    'romance',
    'thriller',
    'science fiction',
    'historical fiction',
    'contemporary fiction',
    'literary fiction',
    'horror',
    'adventure',
  ];
  const randomGenre = genres[Math.floor(Math.random() * genres.length)];

  const url = `https://openlibrary.org/search.json?q=subject:${randomGenre}&language=eng&limit=30`; // Increased from 20 to 30

  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`API Error: ${response.status}`);

    const data = await response.json();

    if (data.docs && data.docs.length > 0) {
      const recentBooks = data.docs.filter(
        (book) =>
          book.cover_i &&
          book.title &&
          book.author_name &&
          book.first_publish_year >= 2010 && // More recent for this method
          book.title.length > 3 &&
          !book.title.toLowerCase().includes('test')
      );

      if (recentBooks.length > 0) {
        const randomBook =
          recentBooks[Math.floor(Math.random() * recentBooks.length)];
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
      const books = data.docs.filter(
        (book) => book.cover_i && book.title && book.author_name
      );
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
    authors: book.author_name ? book.author_name.map((name) => ({ name })) : [],
    cover_id: book.cover_i,
    first_publish_year: book.first_publish_year,
    key: book.key,
    first_sentence: book.first_sentence || [],
    rating: book.ratings_average || null,
    source: 'openlibrary',
  };
}

async function showRandomBook() {
  const bookResult = document.getElementById('book-result');
  if (!bookResult) return;

  // Show elegant loading state
  bookResult.style.display = 'block';
  showBookLoadingState();

  // Get book from Hardcover API
  let finalBook = null;

  try {
    finalBook = await getRandomHardcoverBook();
  } catch (error) {
    console.log('Error fetching book from Hardcover:', error);
  }

  if (finalBook) {
    // Now load all the book data and display everything together
    await displayBookWithLoadingSequence(finalBook);
  } else {
    // Show no results if Hardcover fails
    displayNoBookResults();
  }

  // Trigger background preloading to keep cache full
  if (!bookCache.isPreloading && bookCache.hardcover.length < 3) {
    setTimeout(() => preloadBooks(), 1000); // Delay to not interfere with current search
  }
}

function showBookLoadingState() {
  // Clear all content and show loading message
  document.getElementById('book-title').textContent =
    '📚 Finding your next read...';
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
    previewConfig: null,
  };

  // Prepare authors
  if (book.authors && book.authors.length > 0) {
    bookData.authors = book.authors
      .map((author) => author.name || author)
      .join(', ');
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
        url: `https://books.google.com/books?id=${book.googleBooksId}`,
      };
    } else if (book.key) {
      bookData.previewConfig = {
        text: 'View on Open Library',
        url: `https://openlibrary.org${book.key}`,
      };
    } else {
      // For curated books, search on Google
      const searchQuery = `"${book.title}" "${book.authors[0]}" book`;
      bookData.previewConfig = {
        text: 'Search on Google',
        url: `https://www.google.com/search?q=${encodeURIComponent(searchQuery)}`,
      };
    }
  }

  // Try to get better description if needed
  if (book.source === 'curated') {
    try {
      const betterDescription = await getBetterDescription(book);
      if (
        betterDescription &&
        betterDescription.length > bookData.description.length
      ) {
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
      new Promise((resolve) => setTimeout(resolve, 2000)),
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
  document.getElementById('book-description').textContent =
    bookData.description;
  document.getElementById('book-author').textContent = bookData.authors;

  // Handle rating display with stars
  const ratingElement = document.getElementById('book-rating');
  if (bookData.hasRating) {
    if (bookData.publishInfo) {
      // If we have publish year, show it as text and stars separately
      ratingElement.innerHTML =
        bookData.publishInfo + '<br>' + createBookStarRating(bookData.rating);
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
        const bestMatch =
          data.items.find(
            (item) =>
              item.volumeInfo.title &&
              item.volumeInfo.title
                .toLowerCase()
                .includes(book.title.toLowerCase().substring(0, 10))
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

    if (
      data.items &&
      data.items.length > 0 &&
      data.items[0].volumeInfo.imageLinks
    ) {
      const imageLinks = data.items[0].volumeInfo.imageLinks;
      const coverUrl =
        imageLinks.large || imageLinks.medium || imageLinks.thumbnail;

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

function applyBookFilters() {
  const genre = document.getElementById('genre').value;
  const minRating = parseFloat(document.getElementById('rating').value);

  // Store the current filter settings
  currentBookFilter = {
    genre: genre,
    minRating: minRating,
    isActive: true,
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
    // Get filtered books from Hardcover API
    const filteredBooks = await getFilteredHardcoverBooks();

    if (filteredBooks && filteredBooks.length > 0) {
      // Select random book from filtered results
      const randomIndex = Math.floor(Math.random() * filteredBooks.length);
      const book = filteredBooks[randomIndex];
      displayBook(book);
    } else {
      displayNoBookResults();
    }
  } catch (error) {
    console.error('Error getting filtered books:', error);
    displayNoBookResults();
  }
}

async function getFilteredHardcoverBooks() {
  const { genre, minRating } = currentBookFilter;

  // Build search query based on genre
  let query = '';
  if (genre === 'all') {
    const genres = [
      'bestseller fiction',
      'popular novels',
      'award winning books',
      'contemporary literature',
      'new releases fiction',
      'literary fiction',
    ];
    query = genres[Math.floor(Math.random() * genres.length)];
  } else {
    query = `${genre} books`;
  }

  try {
    const url = `/api/hardcover/search?q=${encodeURIComponent(query)}&per_page=20&page=1`;

    const response = await fetch(url);
    const data = await response.json();

    if (
      data.data &&
      data.data.search &&
      data.data.search.results &&
      data.data.search.results.hits
    ) {
      const filteredBooks = data.data.search.results.hits
        .filter((hit) => {
          const book = hit.document;
          const rating = book.rating || 0;
          const hasImage = book.image && book.image.url;
          const hasAuthors = book.author_names && book.author_names.length > 0;

          return (
            rating >= minRating &&
            hasImage &&
            hasAuthors &&
            book.title &&
            book.description
          );
        })
        .map((hit) => {
          const book = hit.document;
          return {
            title: book.title,
            authors: book.author_names || ['Unknown Author'],
            description:
              book.description?.substring(0, 400) +
              (book.description?.length > 400 ? '...' : ''),
            first_publish_year: book.release_year || null,
            rating: book.rating || null,
            cover_url: book.image?.url || null,
            hardcoverSlug: book.slug,
            source: 'hardcover',
          };
        });

      return filteredBooks;
    }
  } catch (error) {
    console.error('Error fetching filtered Hardcover books:', error);
  }

  return [];
}

function displayNoBookResults() {
  const bookResult = document.getElementById('book-result');
  const bookTitle = document.getElementById('book-title');
  const bookDescription = document.getElementById('book-description');
  const bookCover = document.getElementById('book-cover');

  if (bookTitle) bookTitle.textContent = 'No books found';
  if (bookDescription)
    bookDescription.textContent =
      'Try adjusting your filters to find more books.';
  if (bookCover) bookCover.style.display = 'none';

  // Hide other elements
  const elements = [
    'book-author',
    'book-rating',
    'goodreads-link',
    'preview-btn',
  ];
  elements.forEach((id) => {
    const element = document.getElementById(id);
    if (element) element.style.display = 'none';
  });
}

function displayBook(book) {
  if (!book) return;

  // Display book information
  document.getElementById('book-title').textContent =
    book.title || 'No title available';

  // Display description
  const description = book.description || 'No description available.';
  document.getElementById('book-description').textContent = description;

  // Display authors
  let authors = 'Unknown author';
  if (book.authors && book.authors.length > 0) {
    authors = book.authors.map((author) => author.name || author).join(', ');
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
      ratingElement.innerHTML =
        publishInfo + '<br>' + createBookStarRating(book.rating);
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
      cover.onload = function () {
        cover.style.display = 'block';
        const bookResultElement = document.getElementById('book-result');
        if (bookResultElement) {
          bookResultElement.scrollIntoView({
            behavior: 'smooth',
            block: 'center',
          });
        }
      };
      cover.onerror = function () {
        cover.style.display = 'none';
        const bookResultElement = document.getElementById('book-result');
        if (bookResultElement) {
          bookResultElement.scrollIntoView({
            behavior: 'smooth',
            block: 'center',
          });
        }
      };
      cover.src = coverUrl;
      cover.alt = `Cover of ${book.title}`;
    } else {
      // If no cover, scroll immediately
      const bookResultElement = document.getElementById('book-result');
      if (bookResultElement) {
        bookResultElement.scrollIntoView({
          behavior: 'smooth',
          block: 'center',
        });
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
        window.open(
          `https://books.google.com/books?id=${book.googleBooksId}`,
          '_blank'
        );
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
        window.open(
          `https://www.google.com/search?q=${encodeURIComponent(searchQuery)}`,
          '_blank'
        );
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

    if (
      data.items &&
      data.items.length > 0 &&
      data.items[0].volumeInfo.imageLinks
    ) {
      const imageLinks = data.items[0].volumeInfo.imageLinks;
      const coverUrl =
        imageLinks.large || imageLinks.medium || imageLinks.thumbnail;

      if (coverUrl) {
        coverElement.onload = function () {
          coverElement.style.display = 'block';
          const bookResultElement = document.getElementById('book-result');
          if (bookResultElement) {
            bookResultElement.scrollIntoView({
              behavior: 'smooth',
              block: 'center',
            });
          }
        };
        coverElement.onerror = function () {
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
    description = Array.isArray(book.first_sentence)
      ? book.first_sentence[0]
      : book.first_sentence;
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
        const bestMatch =
          data.items.find(
            (item) =>
              item.volumeInfo.title &&
              item.volumeInfo.title
                .toLowerCase()
                .includes(book.title.toLowerCase().substring(0, 10))
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
        if (
          betterDescription &&
          betterDescription.length > description.length
        ) {
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
  if (
    book.source === 'curated' &&
    description === 'No description available.'
  ) {
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
async function initBooks() {
  // Shuffle curated books on page load
  if (window.location.pathname.includes('books.html')) {
    const curatedBooks = await loadCuratedBooks();
    shuffleArray(curatedBooks);
    preloadBooks();
  }

  // Next Book button functionality
  const nextBookBtn = document.getElementById('next-book-btn');
  if (nextBookBtn) {
    nextBookBtn.onclick = function () {
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
    randomBookBtn.onclick = function () {
      // Reset filters when using main discover button
      currentBookFilter.isActive = false;
      showRandomBook();
    };
  }
}

// Make functions globally available
window.showRandomBook = showRandomBook;
window.applyBookFilters = applyBookFilters;
window.showRandomFilteredBook = showRandomFilteredBook;
window.initBooks = initBooks;

// Initialize books functionality when page loads
document.addEventListener('DOMContentLoaded', function() {
  initBooks();
});
