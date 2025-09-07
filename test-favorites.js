// Test script to add some favorites for debugging
const testFavorites = [
  {
    id: 'tt1234567',
    title: 'Test Movie 1',
    poster: '',
    poster_path: '/test1.jpg',
    url: 'movies.html?id=tt1234567',
    addedAt: Date.now()
  },
  {
    id: 'tt7654321',
    title: 'Test Movie 2',
    poster: '',
    poster_path: '/test2.jpg',
    url: 'movies.html?id=tt7654321',
    addedAt: Date.now() - 1000
  }
];

localStorage.setItem('favorites', JSON.stringify(testFavorites));
console.log('Added test favorites:', testFavorites);
console.log('localStorage now contains:', localStorage.getItem('favorites'));
