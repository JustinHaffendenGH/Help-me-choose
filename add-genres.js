// Script to add genres to books in main.js
const fs = require('fs');

// Define genres for each book by title
const bookGenres = {
    'The Seven Husbands of Evelyn Hugo': 'Historical Fiction',
    'Where the Crawdads Sing': 'Mystery',
    'The Midnight Library': 'Fantasy',
    'Project Hail Mary': 'Science Fiction',
    'The Song of Achilles': 'Historical Fiction',
    'Circe': 'Fantasy',
    'The Invisible Life of Addie LaRue': 'Fantasy',
    'Normal People': 'Contemporary Fiction',
    'Educated': 'Memoir',
    'The Silent Patient': 'Thriller',
    'The Guest List': 'Thriller',
    'Klara and the Sun': 'Science Fiction',
    'The Sanatorium': 'Thriller',
    'The Four Winds': 'Historical Fiction',
    'The Vanishing Half': 'Contemporary Fiction',
    'Such a Fun Age': 'Contemporary Fiction',
    'The Priory of the Orange Tree': 'Fantasy',
    'Anxious People': 'Contemporary Fiction',
    'The Institute': 'Horror',
    'Little Fires Everywhere': 'Contemporary Fiction',
    'The Handmaids Tale': 'Dystopian',
    'Big Little Lies': 'Thriller',
    'Gone Girl': 'Thriller',
    'The Girl on the Train': 'Thriller',
    'We Need to Talk About Kevin': 'Thriller',
    'People We Meet on Vacation': 'Romance',
    'It Ends with Us': 'Romance',
    'Verity': 'Thriller',
    'The Atlas Six': 'Fantasy',
    'Book Lovers': 'Romance',
    'The Love Hypothesis': 'Romance',
    'The Spanish Love Deception': 'Romance',
    'The Paper Palace': 'Contemporary Fiction',
    'Malibu Rising': 'Contemporary Fiction',
    'The Thursday Murder Club': 'Mystery',
    'Atomic Habits': 'Self-Help',
    'Becoming': 'Memoir',
    'Untamed': 'Memoir',
    'The Midnight Girls': 'Fantasy',
    'Tomorrow, and Tomorrow, and Tomorrow': 'Contemporary Fiction',
    'Lessons in Chemistry': 'Historical Fiction',
    'Remarkably Bright Creatures': 'Contemporary Fiction',
    'The Lincoln Highway': 'Historical Fiction',
    'A Little Life': 'Contemporary Fiction',
    'The Goldfinch': 'Contemporary Fiction',
    'The Night Circus': 'Fantasy',
    'The Alchemist': 'Philosophy',
    'To Kill a Mockingbird': 'Classic Literature',
    '1984': 'Dystopian',
    'Carrie': 'Horror',
    'The Shining': 'Horror',
    'It': 'Horror',
    'Misery': 'Horror'
};

// Read the main.js file
const content = fs.readFileSync('./scripts/main.js', 'utf8');
let modifiedContent = content;

// Add genres by replacing the rating line with rating + genre
Object.entries(bookGenres).forEach(([title, genre]) => {
    const titleEscaped = title.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    
    // Look for pattern: title: "Title", ... rating: X.X, then add genre before description
    const pattern = new RegExp(
        `(title: "${titleEscaped}",\\s*[\\s\\S]*?rating: [\\d\\.]+),\\s*(description:)`,
        'g'
    );
    
    modifiedContent = modifiedContent.replace(pattern, `$1,\n        genre: "${genre}",\n        $2`);
});

// Write the modified content back
fs.writeFileSync('./scripts/main.js', modifiedContent);

console.log('Successfully added genres to all books in main.js');
