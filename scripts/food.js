// Food functionality
import { shuffleArray, createStarRating } from './utils.js';

// Load curated foods data
let curatedFoodsData = null;

async function loadCuratedFoods() {
    if (curatedFoodsData) return curatedFoodsData;

    try {
        const response = await fetch('./scripts/data/curated-foods.json');
        curatedFoodsData = await response.json();
        return curatedFoodsData;
    } catch (error) {
        console.error('Error loading curated foods:', error);
        // Fallback to empty array
        return [];
    }
}

// Food preloading system
let foodCache = {
    googlePlaces: [],
    openFoodFacts: [],
    isPreloading: false,
    lastShownFoods: [] // Track recently shown foods to avoid duplicates
};

// Store current filter settings
let currentFoodFilter = {
    cuisine: 'all',
    minRating: 3,
    isActive: false
};

// Store user's location
let userLocation = {
    lat: 40.7128, // Default to NYC
    lng: -74.0060,
    isSet: false
};

// Get user's current location
async function getUserLocation() {
    return new Promise((resolve, reject) => {
        if (!navigator.geolocation) {
            console.log('Geolocation is not supported by this browser');
            resolve(userLocation); // Return default location
            return;
        }

        navigator.geolocation.getCurrentPosition(
            (position) => {
                userLocation = {
                    lat: position.coords.latitude,
                    lng: position.coords.longitude,
                    isSet: true
                };
                console.log('User location obtained:', userLocation);
                resolve(userLocation);
            },
            (error) => {
                console.log('Error getting location:', error.message);
                resolve(userLocation); // Return default location
            },
            {
                enableHighAccuracy: true,
                timeout: 10000,
                maximumAge: 300000 // 5 minutes
            }
        );
    });
}

// Get location string for API calls
function getLocationString() {
    return `${userLocation.lat},${userLocation.lng}`;
}

export async function preloadFoods() {
    if (foodCache.isPreloading) return;

    // Ensure we have user's location before preloading
    if (!userLocation.isSet) {
        await getUserLocation();
    }

    foodCache.isPreloading = true;
    console.log('Starting food preloading...');

    // Preload foods in background
    const preloadPromises = [];

    // Preload Google Places food via server proxy
    preloadPromises.push(preloadGooglePlacesFoods());

    // Preload Open Food Facts
    preloadPromises.push(preloadOpenFoodFactsFoods());

    // Run preloading in parallel
    await Promise.allSettled(preloadPromises);

    foodCache.isPreloading = false;
    console.log('Food preloading completed');
}

async function preloadGooglePlacesFoods() {
    try {
        const cuisines = [
            'italian', 'chinese', 'mexican', 'indian', 'japanese', 'french',
            'thai', 'greek', 'spanish', 'korean', 'vietnamese', 'lebanese',
            'turkish', 'moroccan', 'brazilian', 'peruvian', 'ethiopian'
        ];

        for (const cuisine of cuisines) {
            if (foodCache.googlePlaces.length >= 20) break; // Increased cache size

            const url = `/api/places/search?query=${cuisine}+restaurant&location=${getLocationString()}&type=restaurant`;

            const response = await fetch(url);
            const data = await response.json();

            if (data.results) {
                const goodFoods = data.results.filter(place => {
                    return place.rating >= 4.0 &&
                           place.photos &&
                           place.photos.length > 0 &&
                           place.price_level;
                }).map(place => ({
                    name: place.name,
                    cuisine: cuisine,
                    rating: place.rating,
                    price_level: place.price_level,
                    vicinity: place.vicinity,
                    photo_reference: place.photos[0].photo_reference,
                    place_id: place.place_id,
                    description: `A highly-rated ${cuisine} restaurant with ${place.rating} stars. ${place.price_level ? '$$'.repeat(place.price_level) : ''}`,
                    source: 'googleplaces'
                }));

                foodCache.googlePlaces.push(...goodFoods);
            }

            // Small delay between requests
            await new Promise(resolve => setTimeout(resolve, 100));
        }
    } catch (error) {
        console.log('Error preloading Google Places foods:', error);
    }
}

async function preloadOpenFoodFactsFoods() {
    try {
        const categories = [
            'en:pizza', 'en:pasta', 'en:rice', 'en:chicken', 'en:beef',
            'en:fish', 'en:vegetarian', 'en:vegan', 'en:desserts', 'en:soups',
            'en:salads', 'en:sandwiches', 'en:burgers', 'en:tacos', 'en:sushi'
        ];

        for (const category of categories) {
            if (foodCache.openFoodFacts.length >= 20) break; // Increased cache size

            const url = `https://world.openfoodfacts.org/cgi/search.pl?search_terms=${category}&search_simple=1&action=process&json=1&page_size=10`;

            const response = await fetch(url);
            const data = await response.json();

            if (data.products) {
                const goodFoods = data.products.filter(product =>
                    product.product_name &&
                    product.image_url &&
                    product.nutriscore_grade &&
                    product.nutriscore_grade !== 'unknown'
                ).map(product => ({
                    name: product.product_name,
                    category: category.replace('en:', ''),
                    nutriscore: product.nutriscore_grade,
                    image_url: product.image_url,
                    brands: product.brands,
                    ingredients: product.ingredients_text,
                    description: product.ingredients_text ? 
                        `Made with: ${product.ingredients_text.substring(0, 100)}${product.ingredients_text.length > 100 ? '...' : ''}` : 
                        `A ${category.replace('en:', '')} product with nutrition score ${product.nutriscore_grade.toUpperCase()}.`,
                    source: 'openfoodfacts'
                }));

                foodCache.openFoodFacts.push(...goodFoods);
            }

            // Small delay between requests
            await new Promise(resolve => setTimeout(resolve, 200));
        }
    } catch (error) {
        console.log('Error preloading Open Food Facts:', error);
    }
}

// Get a food from cache or fallback to real-time search
function getCachedFood(source) {
    const cache = foodCache[source];
    if (cache && cache.length > 0) {
        // Pick a random food from cache for more variety
        const randomIndex = Math.floor(Math.random() * cache.length);
        return cache.splice(randomIndex, 1)[0];
    }
    return null;
}

// Get a random food from curated list (instant results) - NO DUPLICATES
async function getRandomCuratedFood() {
    const curatedFoods = await loadCuratedFoods();

    // Filter out recently shown foods to avoid duplicates
    const availableFoods = curatedFoods.filter(food =>
        !foodCache.lastShownFoods.includes(food.name)
    );

    // If we've shown too many foods, reset the tracking
    if (availableFoods.length === 0) {
        foodCache.lastShownFoods = [];
        // Use all foods again
        const randomIndex = Math.floor(Math.random() * curatedFoods.length);
        const food = curatedFoods[randomIndex];
        foodCache.lastShownFoods.push(food.name);
        return createFoodObject(food);
    }

    const randomIndex = Math.floor(Math.random() * availableFoods.length);
    const food = availableFoods[randomIndex];

    // Track this food to avoid showing it again soon
    foodCache.lastShownFoods.push(food.name);

    // Keep only last 20 shown foods in memory
    if (foodCache.lastShownFoods.length > 20) {
        foodCache.lastShownFoods.shift();
    }

    return createFoodObject(food);
}

function createFoodObject(food) {
    return {
        name: food.name,
        cuisine: food.cuisine,
        description: food.description || `A delicious ${food.cuisine} dish.`,
        rating: food.rating,
        source: 'curated'
    };
}

// Google Places API search - now uses cache first
async function getRandomGooglePlacesFood() {
    // Try cached food first for instant results
    const cachedFood = getCachedFood('googlePlaces');
    if (cachedFood) {
        // Trigger background preloading to refill cache
        if (!foodCache.isPreloading && foodCache.googlePlaces.length < 3) {
            preloadGooglePlacesFoods();
        }
        return cachedFood;
    }

    // Fallback to real-time search
    const cuisines = [
        'italian', 'chinese', 'mexican', 'indian', 'japanese', 'french',
        'thai', 'greek', 'spanish', 'korean', 'vietnamese', 'lebanese'
    ];

    try {
        const randomCuisine = cuisines[Math.floor(Math.random() * cuisines.length)];
        const url = `/api/places/search?query=${randomCuisine}+restaurant&location=${getLocationString()}&type=restaurant`;

        const response = await fetch(url);
        const data = await response.json();

        if (data.results && data.results.length > 0) {
            // Filter for high-quality restaurants
            const goodRestaurants = data.results.filter(place =>
                place.rating >= 4.0 &&
                place.photos &&
                place.photos.length > 0 &&
                place.price_level
            );

            if (goodRestaurants.length > 0) {
                const randomRestaurant = goodRestaurants[Math.floor(Math.random() * goodRestaurants.length)];

                return {
                    name: randomRestaurant.name,
                    cuisine: randomCuisine,
                    rating: randomRestaurant.rating,
                    price_level: randomRestaurant.price_level,
                    vicinity: randomRestaurant.vicinity,
                    photo_reference: randomRestaurant.photos[0].photo_reference,
                    place_id: randomRestaurant.place_id,
                    description: `A highly-rated ${randomCuisine} restaurant with ${randomRestaurant.rating} stars. ${randomRestaurant.price_level ? '$$'.repeat(randomRestaurant.price_level) : ''}`,
                    source: 'googleplaces'
                };
            }
        }
    } catch (error) {
        console.log('Google Places API error:', error);
    }

    return null;
}

// Open Food Facts search
async function getRandomOpenFoodFactsFood() {
    // Try cached food first
    const cachedFood = getCachedFood('openFoodFacts');
    if (cachedFood) {
        // Trigger background preloading to refill cache
        if (!foodCache.isPreloading && foodCache.openFoodFacts.length < 3) {
            preloadOpenFoodFactsFoods();
        }
        return cachedFood;
    }

    // Fallback to real-time search
    const categories = [
        'en:pizza', 'en:pasta', 'en:rice', 'en:chicken', 'en:beef',
        'en:fish', 'en:vegetarian', 'en:vegan', 'en:desserts', 'en:soups'
    ];

    try {
        const randomCategory = categories[Math.floor(Math.random() * categories.length)];
        const url = `https://world.openfoodfacts.org/cgi/search.pl?search_terms=${randomCategory}&search_simple=1&action=process&json=1&page_size=20`;

        const response = await fetch(url);
        const data = await response.json();

        if (data.products && data.products.length > 0) {
            // Filter for products with good data
            const goodProducts = data.products.filter(product =>
                product.product_name &&
                product.image_url &&
                product.nutriscore_grade &&
                product.nutriscore_grade !== 'unknown'
            );

            if (goodProducts.length > 0) {
                const randomProduct = goodProducts[Math.floor(Math.random() * goodProducts.length)];

                return {
                    name: randomProduct.product_name,
                    category: randomCategory.replace('en:', ''),
                    nutriscore: randomProduct.nutriscore_grade,
                    image_url: randomProduct.image_url,
                    brands: randomProduct.brands,
                    ingredients: randomProduct.ingredients_text,
                    description: randomProduct.ingredients_text ? 
                        `Made with: ${randomProduct.ingredients_text.substring(0, 100)}${randomProduct.ingredients_text.length > 100 ? '...' : ''}` : 
                        `A ${randomCategory.replace('en:', '')} product with nutrition score ${randomProduct.nutriscore_grade.toUpperCase()}.`,
                    source: 'openfoodfacts'
                };
            }
        }
    } catch (error) {
        console.log('Open Food Facts API error:', error);
    }

    return null;
}

export async function showRandomFood() {
    const foodResult = document.getElementById('food-result');
    if (!foodResult) return;

    // Ensure we have user's location
    if (!userLocation.isSet) {
        await getUserLocation();
    }

    // Show elegant loading state
    foodResult.style.display = 'block';
    showFoodLoadingState();

    // Flag to prevent multiple updates
    let hasUpdated = false;

    // PRIORITIZE REAL LOCAL RESTAURANTS: Try to get results from APIs first
    const promises = [
        getRandomGooglePlacesFood(),
        getRandomOpenFoodFactsFood()
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

        // If we got API results, use the best one (prioritize Google Places for local restaurants)
        if (validFoods.length > 0) {
            const bestFood = validFoods.find(food => food.source === 'googleplaces') ||
                           validFoods.find(food => food.source === 'openfoodfacts') ||
                           validFoods[0];

            displayFood(bestFood);
            hasUpdated = true;

            // Trigger background preloading to keep cache fresh
            if (!foodCache.isPreloading) {
                setTimeout(() => preloadFoods(), 1000);
            }
            return;
        }
    } catch (error) {
        console.log('API search error:', error);
    }

    // FALLBACK: Use curated food only if APIs fail
    console.log('Using curated food as fallback');
    const curatedFood = await getRandomCuratedFood();
    displayFood(curatedFood);

    // Trigger background preloading to keep cache fresh
    if (!foodCache.isPreloading) {
        setTimeout(() => preloadFoods(), 1000);
    }
}

function showFoodLoadingState() {
    // Clear all content and show loading message
    const locationText = userLocation.isSet ? 'Finding your next meal...' : 'Getting your location...';
    document.getElementById('food-title').textContent = `🍽️ ${locationText}`;
    document.getElementById('food-description').textContent = '';
    document.getElementById('food-price').textContent = '';
    document.getElementById('food-rating').textContent = '';

    const cover = document.getElementById('food-image');
    if (cover) cover.style.display = 'none';

    const menuLink = document.getElementById('menu-link');
    if (menuLink) menuLink.style.display = 'none';

    const directionsBtn = document.getElementById('directions-btn');
    if (directionsBtn) directionsBtn.style.display = 'none';
}

async function displayFoodWithLoadingSequence(food) {
    if (!food) return;

    // Prepare all the content first
    const foodData = {
        title: food.name || 'No name available',
        cuisine: 'Unknown cuisine',
        description: food.description || 'No description available.',
        rating: food.rating || null,
        coverUrl: null,
        recipeConfig: null,
        yelpConfig: null
    };

    // Prepare cuisine
    if (food.cuisine) {
        foodData.cuisine = food.cuisine.charAt(0).toUpperCase() + food.cuisine.slice(1);
    } else if (food.category) {
        foodData.cuisine = food.category.charAt(0).toUpperCase() + food.category.slice(1);
    }

    // Prepare rating
    if (food.rating) {
        foodData.hasRating = true;
    } else if (food.nutriscore) {
        // Convert nutriscore to rating
        const nutriscoreMap = { 'a': 5, 'b': 4, 'c': 3, 'd': 2, 'e': 1 };
        foodData.rating = nutriscoreMap[food.nutriscore.toLowerCase()] || 3;
        foodData.hasRating = true;
        foodData.nutriscore = food.nutriscore.toUpperCase();
    } else {
        foodData.hasRating = false;
    }

    // Prepare cover URL
    if (food.photo_reference) {
        // Google Places photo
        foodData.coverUrl = `/api/photo?photoreference=${food.photo_reference}&maxwidth=400`;
    } else if (food.image_url) {
        // Open Food Facts image
        foodData.coverUrl = food.image_url;
    }

    // Prepare directions button config
    const directionsBtn = document.getElementById('directions-btn');
    if (directionsBtn) {
        foodData.directionsConfig = {
            text: 'Get Directions',
            url: `https://www.google.com/search?q=${encodeURIComponent(foodData.title + ' near me')}`
        };
    }

    // Prepare menu link config
    const menuLink = document.getElementById('menu-link');
    if (menuLink && food.place_id) {
        foodData.menuConfig = {
            url: `https://www.yelp.com/search?find_desc=${encodeURIComponent(foodData.title)}`
        };
    }

    // Load cover image if available (but don't wait for it to display content)
    let coverLoaded = false;
    const cover = document.getElementById('food-image');

    if (cover && foodData.coverUrl) {
        const coverPromise = new Promise((resolve) => {
            const img = new Image();
            img.onload = () => {
                cover.src = foodData.coverUrl;
                cover.alt = `Image of ${foodData.title}`;
                coverLoaded = true;
                resolve(true);
            };
            img.onerror = () => {
                coverLoaded = false;
                resolve(false);
            };
            img.src = foodData.coverUrl;
        });

        // Wait up to 2 seconds for cover to load, then proceed anyway
        await Promise.race([
            coverPromise,
            new Promise(resolve => setTimeout(resolve, 2000))
        ]);
    }

    // Now display everything at once with a smooth reveal
    displayAllFoodContent(foodData, coverLoaded);
}

function displayAllFoodContent(foodData, coverLoaded) {
    // Display all text content at once
    document.getElementById('food-title').textContent = foodData.title;
    document.getElementById('food-description').textContent = foodData.description;
    document.getElementById('food-price').textContent = foodData.cuisine;

    // Handle rating display with stars
    const ratingElement = document.getElementById('food-rating');
    if (foodData.hasRating) {
        let ratingText = createStarRating(foodData.rating);
        if (foodData.nutriscore) {
            ratingText += ` (Nutri-Score: ${foodData.nutriscore})`;
        }
        ratingElement.innerHTML = ratingText;
    } else {
        ratingElement.textContent = '';
    }

    // Display cover if loaded
    const cover = document.getElementById('food-image');
    if (cover && coverLoaded) {
        cover.style.display = 'block';
    }

    // Setup directions button
    const directionsBtn = document.getElementById('directions-btn');
    if (directionsBtn && foodData.directionsConfig) {
        directionsBtn.style.display = 'inline-block';
        directionsBtn.textContent = foodData.directionsConfig.text;
        directionsBtn.onclick = () => {
            window.open(foodData.directionsConfig.url, '_blank');
        };
    }

    // Setup menu link
    const menuLink = document.getElementById('menu-link');
    if (menuLink && foodData.menuConfig) {
        menuLink.href = foodData.menuConfig.url;
        menuLink.style.display = 'inline-block';
    }

    // Smooth scroll to result
    const foodResult = document.getElementById('food-result');
    if (foodResult) {
        foodResult.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
}

export function applyFoodFilters() {
    const cuisine = document.getElementById('cuisine').value;
    // Food page doesn't have rating filter, so use a default minimum rating
    const minRating = 3.0;

    // Store the current filter settings
    currentFoodFilter = {
        cuisine: cuisine,
        minRating: minRating,
        isActive: true
    };

    // Get a random food with the new filter applied
    showRandomFilteredFood();
}

export async function showRandomFilteredFood() {
    const foodResult = document.getElementById('food-result');
    if (!foodResult) return;

    // Ensure we have user's location
    if (!userLocation.isSet) {
        await getUserLocation();
    }

    // Show loading state
    foodResult.style.display = 'block';
    showFoodLoadingState();

    try {
        // Get filtered foods from APIs
        const promises = [
            getFilteredGooglePlacesFoods(),
            getFilteredOpenFoodFactsFoods()
        ];

        const results = await Promise.allSettled(promises);
        let allFoods = [];

        // Collect foods from all successful API calls
        results.forEach(result => {
            if (result.status === 'fulfilled' && result.value && result.value.length > 0) {
                allFoods = allFoods.concat(result.value);
            }
        });

        // If no API results, fall back to filtered curated foods
        if (allFoods.length === 0) {
            allFoods = await getFilteredCuratedFoods();
        }

        if (allFoods.length > 0) {
            // Select random food from filtered results
            const randomIndex = Math.floor(Math.random() * allFoods.length);
            const food = allFoods[randomIndex];
            displayFood(food);
        } else {
            displayNoFoodResults();
        }

    } catch (error) {
        console.error('Error getting filtered foods:', error);
        // Fallback to curated foods
        const curatedFoodsFiltered = await getFilteredCuratedFoods();
        if (curatedFoodsFiltered.length > 0) {
            const randomIndex = Math.floor(Math.random() * curatedFoodsFiltered.length);
            displayFood(curatedFoodsFiltered[randomIndex]);
        } else {
            displayNoFoodResults();
        }
    }
}

async function getFilteredGooglePlacesFoods() {
    const { cuisine, minRating } = currentFoodFilter;

    // Build search query based on cuisine
    let query = '';
    if (cuisine === 'all') {
        const cuisines = ['italian', 'chinese', 'mexican', 'indian', 'japanese', 'french', 'thai', 'greek'];
        query = cuisines[Math.floor(Math.random() * cuisines.length)];
    } else {
        query = cuisine;
    }

    try {
        const response = await fetch(`/api/places/search?query=${query}+restaurant&location=${getLocationString()}&type=restaurant`);
        const data = await response.json();

        if (data.results) {
            const filteredFoods = data.results.filter(place => {
                const rating = place.rating || 0;
                const hasImage = place.photos && place.photos.length > 0;
                const hasPrice = place.price_level;

                return rating >= minRating && hasImage && hasPrice;
            }).map(place => ({
                name: place.name,
                cuisine: query,
                rating: place.rating,
                price_level: place.price_level,
                vicinity: place.vicinity,
                photo_reference: place.photos[0].photo_reference,
                place_id: place.place_id,
                description: `A highly-rated ${query} restaurant with ${place.rating} stars. ${place.price_level ? '$$'.repeat(place.price_level) : ''}`,
                source: 'googleplaces'
            }));

            return filteredFoods;
        }
    } catch (error) {
        console.error('Error fetching filtered Google Places foods:', error);
    }

    return [];
}

async function getFilteredOpenFoodFactsFoods() {
    const { cuisine, minRating } = currentFoodFilter;

    // Build search query based on cuisine
    let query = '';
    if (cuisine === 'all') {
        const categories = ['en:pizza', 'en:pasta', 'en:rice', 'en:chicken', 'en:beef', 'en:fish'];
        query = categories[Math.floor(Math.random() * categories.length)];
    } else {
        // Map cuisine to Open Food Facts category
        const cuisineMap = {
            'italian': 'en:pizza',
            'chinese': 'en:rice',
            'mexican': 'en:tacos',
            'indian': 'en:rice',
            'japanese': 'en:sushi',
            'french': 'en:pasta',
            'thai': 'en:rice',
            'greek': 'en:salads'
        };
        query = cuisineMap[cuisine] || 'en:pizza';
    }

    try {
        const response = await fetch(`https://world.openfoodfacts.org/cgi/search.pl?search_terms=${query}&search_simple=1&action=process&json=1&page_size=20`);
        const data = await response.json();

        if (data.products) {
            const filteredFoods = data.products.filter(product => {
                const rating = product.nutriscore_grade ? ({'a':5,'b':4,'c':3,'d':2,'e':1}[product.nutriscore_grade.toLowerCase()] || 3) : 0;
                const hasImage = product.image_url;
                const hasName = product.product_name;

                return rating >= minRating && hasImage && hasName;
            }).map(product => ({
                name: product.product_name,
                category: query.replace('en:', ''),
                nutriscore: product.nutriscore_grade,
                image_url: product.image_url,
                brands: product.brands,
                ingredients: product.ingredients_text,
                description: product.ingredients_text ? 
                    `Made with: ${product.ingredients_text.substring(0, 100)}${product.ingredients_text.length > 100 ? '...' : ''}` : 
                    `A ${query.replace('en:', '')} product with nutrition score ${product.nutriscore_grade.toUpperCase()}.`,
                source: 'openfoodfacts'
            }));

            return filteredFoods;
        }
    } catch (error) {
        console.error('Error fetching filtered Open Food Facts foods:', error);
    }

    return [];
}

async function getFilteredCuratedFoods() {
    const { cuisine, minRating } = currentFoodFilter;
    const curatedFoods = await loadCuratedFoods();

    return curatedFoods.filter(food => {
        // Safely check cuisine match
        const foodCuisine = food.cuisine || '';
        const cuisineMatch = cuisine === 'all' ||
                          foodCuisine.toLowerCase().includes(cuisine.toLowerCase());

        // Check rating match
        const foodRating = food.rating || 0;
        const ratingMatch = foodRating >= minRating;

        return cuisineMatch && ratingMatch;
    });
}

function displayNoFoodResults() {
    const foodResult = document.getElementById('food-result');
    const foodTitle = document.getElementById('food-title');
    const foodDescription = document.getElementById('food-description');
    const foodCover = document.getElementById('food-image');

    if (foodTitle) foodTitle.textContent = 'No foods found';
    if (foodDescription) foodDescription.textContent = 'Try adjusting your filters to find more foods.';
    if (foodCover) foodCover.style.display = 'none';

    // Hide other elements
    const elements = ['food-price', 'food-rating', 'menu-link', 'directions-btn'];
    elements.forEach(id => {
        const element = document.getElementById(id);
        if (element) element.style.display = 'none';
    });
}

function displayFood(food) {
    if (!food) return;

    // Display food information
    document.getElementById('food-title').textContent = food.name || 'No name available';

    // Display description
    const description = food.description || 'No description available.';
    document.getElementById('food-description').textContent = description;

    // Display cuisine (using food-price element since food-cuisine doesn't exist)
    let cuisine = 'Unknown cuisine';
    if (food.cuisine) {
        cuisine = food.cuisine.charAt(0).toUpperCase() + food.cuisine.slice(1);
    } else if (food.category) {
        cuisine = food.category.charAt(0).toUpperCase() + food.category.slice(1);
    }
    const priceElement = document.getElementById('food-price');
    if (priceElement) {
        priceElement.textContent = cuisine;
    }

    // Handle rating display with stars
    const ratingElement = document.getElementById('food-rating');
    if (food.rating) {
        let ratingText = createStarRating(food.rating);
        if (food.nutriscore) {
            ratingText += ` (Nutri-Score: ${food.nutriscore.toUpperCase()})`;
        }
        ratingElement.innerHTML = ratingText;
    } else if (food.nutriscore) {
        // Convert nutriscore to rating
        const nutriscoreMap = { 'a': 5, 'b': 4, 'c': 3, 'd': 2, 'e': 1 };
        const rating = nutriscoreMap[food.nutriscore.toLowerCase()] || 3;
        ratingElement.innerHTML = createStarRating(rating) + ` (Nutri-Score: ${food.nutriscore.toUpperCase()})`;
    } else {
        ratingElement.textContent = '';
    }

    // Display cover image with better error handling
    const cover = document.getElementById('food-image');
    if (cover) {
        let coverUrl = null;

        // Determine cover URL based on source
        if (food.photo_reference) {
            // Google Places photo
            coverUrl = `/api/photo?photoreference=${food.photo_reference}&maxwidth=400`;
        } else if (food.image_url) {
            // Open Food Facts image
            coverUrl = food.image_url;
        }

        if (coverUrl) {
            cover.onload = function() {
                cover.style.display = 'block';
                const foodResultElement = document.getElementById('food-result');
                if (foodResultElement) {
                    foodResultElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }
            };
            cover.onerror = function() {
                cover.style.display = 'none';
                const foodResultElement = document.getElementById('food-result');
                if (foodResultElement) {
                    foodResultElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }
            };
            cover.src = coverUrl;
            cover.alt = `Image of ${food.name}`;
        } else {
            // If no cover, scroll immediately
            const foodResultElement = document.getElementById('food-result');
            if (foodResultElement) {
                foodResultElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
        }
    }

    // Set up directions button
    const directionsBtn = document.getElementById('directions-btn');
    if (directionsBtn) {
        directionsBtn.style.display = 'inline-block';
        directionsBtn.textContent = 'Get Directions';
        directionsBtn.onclick = () => {
            const searchQuery = `${food.name} near me`;
            window.open(`https://www.google.com/search?q=${encodeURIComponent(searchQuery)}`, '_blank');
        };
    }

    // Set up menu link
    const menuLink = document.getElementById('menu-link');
    if (menuLink) {
        menuLink.style.display = 'inline-block';
        const searchQuery = food.name;
        menuLink.href = `https://www.yelp.com/search?find_desc=${encodeURIComponent(searchQuery)}`;
    }
}

// Initialize food functionality
export async function initFoods() {
    // Get user's location first
    if (window.location.pathname.includes('food.html')) {
        await getUserLocation();
        preloadFoods();
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

    // Random Food button functionality
    const randomFoodBtn = document.getElementById('Random-food-button');
    if (randomFoodBtn) {
        randomFoodBtn.onclick = function() {
            // Reset filters when using main discover button
            currentFoodFilter.isActive = false;
            showRandomFood();
        };
    }
}
