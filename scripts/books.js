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

// Store current filter settings
let currentBookFilter = {
  genre: 'all',
  minRating: 3,
  isActive: false,
};

// Cache for recently shown books to prevent duplicates
let recentBooksCache = [];
const MAX_CACHE_SIZE = 20;

// Get a random book from curated list (instant results) - NO DUPLICATES
async function getRandomCuratedBook() {
  const curatedBooks = await loadCuratedBooks();

  // Pick a random book from curated list
  const randomIndex = Math.floor(Math.random() * curatedBooks.length);
  const book = curatedBooks[randomIndex];

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

// Simplified and reliable book fetching using Google Books API
async function getRandomHardcoverBook() {
  try {
    // Use Google Books API for reliable, modern books with covers
    const searchTerms = [
      'fiction bestseller 2024',
      'novel bestseller 2023',
      'best fiction books 2024',
      'award winning novels 2023',
      'popular novels 2022',
      'contemporary novel bestseller',
      'literary fiction bestseller 2024',
      'thriller novel bestseller 2023',
      'mystery novel bestseller 2024',
      'romance novel bestseller 2023',
      'historical fiction bestseller 2024',
      'crime fiction bestseller 2023'
    ];

    const randomTerm = searchTerms[Math.floor(Math.random() * searchTerms.length)];
    console.log(`Searching Google Books for: ${randomTerm}`);

    const url = `/api/googlebooks/volumes?q=${encodeURIComponent(randomTerm)}&maxResults=40&orderBy=relevance`;

    const response = await fetch(url);
    const data = await response.json();

    if (data.items && data.items.length > 0) {
      console.log(`Found ${data.items.length} books from Google Books`);

      // Filter for quality books with covers and good metadata
      const qualityBooks = data.items.filter(book => {
        const volumeInfo = book.volumeInfo;
        const title = volumeInfo.title?.toLowerCase() || '';
        const description = volumeInfo.description?.toLowerCase() || '';

        // Exclude academic, reference, and educational books
        const excludePatterns = [
          'who\'s who', 'encyclopedia', 'dictionary', 'handbook', 'guide to',
          'teaching', 'education', 'academic', 'reference', 'textbook',
          'study', 'research', 'analysis', 'criticism', 'theory',
          'history of', 'introduction to', 'fictions of', 'useful fictions',
          'creating identity', 'idealism', 'mestizos', 'states firms',
          'international who', 'science fiction and fantasy literature'
        ];

        const isAcademic = excludePatterns.some(pattern =>
          title.includes(pattern) || description.includes(pattern)
        );

        return (
          volumeInfo.title &&
          volumeInfo.authors &&
          volumeInfo.authors.length > 0 &&
          volumeInfo.publishedDate &&
          volumeInfo.imageLinks && // Must have cover
          volumeInfo.description && // Must have description
          volumeInfo.description.length > 50 && // Description must be substantial
          !isAcademic && // Exclude academic/reference books
          (!volumeInfo.averageRating || volumeInfo.averageRating >= 3.0) && // Optional rating, but if present must be decent
          parseInt(volumeInfo.publishedDate.substring(0, 4)) >= 2000 // Modern books
        );
      });

      console.log(`After filtering: ${qualityBooks.length} quality books with covers from 2000+`);

      if (qualityBooks.length > 0) {
        // Filter out recently shown books
        const availableBooks = qualityBooks.filter(book => {
          const bookId = book.id;
          return !recentBooksCache.includes(bookId);
        });

        // If we filtered out all books, use the original list
        const booksToChooseFrom = availableBooks.length > 0 ? availableBooks : qualityBooks;

        // Pick a random quality book
        const randomBook = booksToChooseFrom[Math.floor(Math.random() * booksToChooseFrom.length)];
        const volumeInfo = randomBook.volumeInfo;

        // Add to cache
        recentBooksCache.push(randomBook.id);
        if (recentBooksCache.length > MAX_CACHE_SIZE) {
          recentBooksCache.shift(); // Remove oldest
        }

        return {
          title: volumeInfo.title,
          authors: volumeInfo.authors.map(author => ({ name: author })),
          description: volumeInfo.description.length > 500
            ? volumeInfo.description.substring(0, 497) + '...'
            : volumeInfo.description,
          first_publish_year: parseInt(volumeInfo.publishedDate.substring(0, 4)),
          rating: volumeInfo.averageRating,
          cover_url: (volumeInfo.imageLinks.large || volumeInfo.imageLinks.medium || volumeInfo.imageLinks.thumbnail).replace('http://', 'https://'),
          googleBooksId: randomBook.id,
          source: 'googlebooks',
        };
      }
    }

    // Fallback: Try a more specific search for recent novels
    console.log('Primary search failed, trying fallback search...');
    const fallbackTerms = [
      'best novels 2023',
      'award winning novels 2024',
      'popular fiction books 2022',
      'contemporary novels 2023',
      'literary novels 2024'
    ];
    const fallbackTerm = fallbackTerms[Math.floor(Math.random() * fallbackTerms.length)];
    const fallbackUrl = `/api/googlebooks/volumes?q=${encodeURIComponent(fallbackTerm)}&maxResults=40&orderBy=newest`;

    const fallbackResponse = await fetch(fallbackUrl);
    const fallbackData = await fallbackResponse.json();

    if (fallbackData.items && fallbackData.items.length > 0) {
      const fallbackBooks = fallbackData.items.filter(book => {
        const volumeInfo = book.volumeInfo;
        const title = volumeInfo.title?.toLowerCase() || '';
        const description = volumeInfo.description?.toLowerCase() || '';

        // Exclude academic, reference, and educational books
        const excludePatterns = [
          'who\'s who', 'encyclopedia', 'dictionary', 'handbook', 'guide to',
          'teaching', 'education', 'academic', 'reference', 'textbook',
          'study', 'research', 'analysis', 'criticism', 'theory',
          'history of', 'introduction to', 'fictions of', 'useful fictions',
          'creating identity', 'idealism', 'mestizos', 'states firms',
          'international who', 'science fiction and fantasy literature'
        ];

        const isAcademic = excludePatterns.some(pattern =>
          title.includes(pattern) || description.includes(pattern)
        );

        return (
          volumeInfo.title &&
          volumeInfo.authors &&
          volumeInfo.authors.length > 0 &&
          volumeInfo.imageLinks &&
          volumeInfo.description &&
          volumeInfo.description.length > 50 &&
          !isAcademic &&
          parseInt(volumeInfo.publishedDate?.substring(0, 4) || '2000') >= 2000
        );
      });

      if (fallbackBooks.length > 0) {
        console.log(`Fallback found ${fallbackBooks.length} quality books`);

        // Filter out recently shown books
        const availableBooks = fallbackBooks.filter(book => {
          const bookId = book.id;
          return !recentBooksCache.includes(bookId);
        });

        // If we filtered out all books, use the original list
        const booksToChooseFrom = availableBooks.length > 0 ? availableBooks : fallbackBooks;

        const randomBook = booksToChooseFrom[Math.floor(Math.random() * booksToChooseFrom.length)];
        const volumeInfo = randomBook.volumeInfo;

        // Add to cache
        recentBooksCache.push(randomBook.id);
        if (recentBooksCache.length > MAX_CACHE_SIZE) {
          recentBooksCache.shift(); // Remove oldest
        }

        return {
          title: volumeInfo.title,
          authors: volumeInfo.authors.map(author => ({ name: author })),
          description: volumeInfo.description.length > 500
            ? volumeInfo.description.substring(0, 497) + '...'
            : volumeInfo.description,
          first_publish_year: parseInt(volumeInfo.publishedDate?.substring(0, 4) || '2000'),
          rating: volumeInfo.averageRating || null,
          cover_url: (volumeInfo.imageLinks.large || volumeInfo.imageLinks.medium || volumeInfo.imageLinks.thumbnail).replace('http://', 'https://'),
          googleBooksId: randomBook.id,
          source: 'googlebooks',
        };
      }
    }

  } catch (error) {
    console.error('Error fetching from Google Books:', error);
  }

  return null;
}

async function showRandomBook() {
  const bookResult = document.getElementById('book-result');
  if (!bookResult) return;

  console.log('Fetching fresh random book from API...');

  // Show elegant loading state
  bookResult.style.display = 'block';
  showBookLoadingState();

  // Get book directly from Hardcover API
  let finalBook = null;

  try {
    finalBook = await getRandomHardcoverBook();
    if (finalBook) {
      const authorNames = finalBook.authors.map(author => author.name || author).join(', ');
      console.log(`Found book: "${finalBook.title}" by ${authorNames} (${finalBook.first_publish_year})`);
    }
  } catch (error) {
    console.log('Error fetching book from Hardcover:', error);
  }

  if (finalBook) {
    // Now load all the book data and display everything together
    displayBook(finalBook);
  } else {
    // Show no results if Hardcover fails
    console.log('No book found, showing no results message');
    displayNoBookResults();
  }
}

function showBookLoadingState() {
  // Clear all content and show loading message
  document.getElementById('book-title').textContent =
    '📚 Finding your next read...';
  document.getElementById('book-description').textContent = '';
  document.getElementById('book-author').textContent = '';
  document.getElementById('book-year').textContent = '';
  document.getElementById('book-rating').textContent = '';

  const cover = document.getElementById('book-cover');
  if (cover) cover.style.display = 'none';

  const goodreadsLink = document.getElementById('goodreads-link');
  if (goodreadsLink) goodreadsLink.style.display = 'none';

  const previewBtn = document.getElementById('preview-btn');
  if (previewBtn) previewBtn.style.display = 'none';
}

// Clean up unused functions - keeping only the essential ones

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
  // Simplified - just show a random book (no filtering needed)
  await showRandomBook();
}

async function getFilteredHardcoverBooks() {
  const { genre, minRating } = currentBookFilter;

  // Build search query based on genre with modern focus
  let query = '';
  if (genre === 'all') {
    const genres = [
      '2024 bestseller fiction',
      '2023 bestseller fiction',
      'modern contemporary fiction',
      'popular fiction 2024',
      'new york times bestseller fiction',
      'award winning fiction 2023',
    ];
    query = genres[Math.floor(Math.random() * genres.length)];
  } else {
    query = `${genre} books 2024`;
  }

  try {
    const url = `/api/hardcover/search?q=${encodeURIComponent(query)}&per_page=25&page=1`;

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
          const currentYear = new Date().getFullYear();
          const publishYear = book.release_year || book.first_publish_year;

          return (
            rating >= minRating &&
            hasImage &&
            hasAuthors &&
            book.title &&
            book.description &&
            publishYear >= (currentYear - 10) // Only books from last 10 years
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
    'book-year',
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

  // Display publication year
  const yearElement = document.getElementById('book-year');
  if (yearElement) {
    if (book.first_publish_year) {
      yearElement.textContent = `Published ${book.first_publish_year}`;
      yearElement.style.display = 'block';
    } else {
      yearElement.style.display = 'none';
    }
  }

  // Handle rating display with stars
  const ratingElement = document.getElementById('book-rating');
  if (book.rating) {
    ratingElement.innerHTML = createBookStarRating(book.rating);
  } else {
    ratingElement.textContent = '';
  }

  // Display cover image - simplified for Google Books
  const cover = document.getElementById('book-cover');
  if (cover) {
    if (book.cover_url) {
      console.log('Loading cover from:', book.cover_url);
      cover.onload = () => {
        console.log('Cover loaded successfully');
        cover.style.display = 'block';
        const bookResultElement = document.getElementById('book-result');
        if (bookResultElement) {
          bookResultElement.scrollIntoView({
            behavior: 'smooth',
            block: 'center',
          });
        }
      };
      cover.onerror = () => {
        console.log('Cover failed to load');
        cover.style.display = 'none';
        const bookResultElement = document.getElementById('book-result');
        if (bookResultElement) {
          bookResultElement.scrollIntoView({
            behavior: 'smooth',
            block: 'center',
          });
        }
      };
      cover.src = book.cover_url;
      cover.alt = `Cover of ${book.title}`;
    } else {
      cover.style.display = 'none';
      const bookResultElement = document.getElementById('book-result');
      if (bookResultElement) {
        bookResultElement.scrollIntoView({
          behavior: 'smooth',
          block: 'center',
        });
      }
    }
  }

  // Set up Goodreads button
  const goodreadsBtn = document.getElementById('goodreads-link');
  if (goodreadsBtn) {
    goodreadsBtn.style.display = 'inline-block';
    goodreadsBtn.onclick = () => {
      const searchQuery = `"${book.title}" ${book.authors.map(author => author.name || author).join(' ')}`;
      window.open(
        `https://www.goodreads.com/search?q=${encodeURIComponent(searchQuery)}`,
        '_blank'
      );
    };
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
        coverElement.src = coverUrl.replace('http://', 'https://');
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
