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

// Make curatedBooks globally available
window.curatedBooks = curatedBooks;
