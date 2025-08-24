// Main JavaScript file

// Function to navigate to the selected page.
function goToPage() {
  const select = document.getElementById('page-select');
  const page = select.value;
  window.location.href = page;
}

// Movie suggestion functionality.
const movies = ["Inception", "The Matrix", "Interstellar", "Titanic", "Jurassic Park"];

// Function to get a random movie.
function getRandomMovie() {
    const randomIndex = Math.floor(Math.random() * movies.length);
    return movies[randomIndex];
}

// Function to display a random movie.
function showRandomMovie() {
    const movie = getRandomMovie();
    const resultElement = document.getElementById('movie-result');
    resultElement.textContent = movie;
}