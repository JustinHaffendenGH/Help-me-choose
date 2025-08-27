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

// Google Books API configuration - using a test key (you'll need to get your own)
const GOOGLE_BOOKS_API_KEY = 'AIzaSyBDTaZh_q4O7CgY4WzPPvUB5xOJC002XhQ';

// Curated list of great books for instant results - EXPANDED
const curatedBooks = [
    { 
        title: "The Seven Husbands of Evelyn Hugo", 
        author: "Taylor Jenkins Reid", 
        year: 2017, 
        rating: 4.3,
        description: "A reclusive Hollywood icon reveals her secrets to an unknown journalist, including the truth about her seven marriages and the love of her life."
    },
    { 
        title: "Where the Crawdads Sing", 
        author: "Delia Owens", 
        year: 2018, 
        rating: 4.4,
        description: "A mystery about a young woman who grows up isolated in the marshes of North Carolina and becomes the prime suspect in a murder case."
    },
    { 
        title: "The Midnight Library", 
        author: "Matt Haig", 
        year: 2020, 
        rating: 4.1,
        description: "Between life and death is a library where Nora Seed can explore infinite versions of the life she could have lived."
    },
    { 
        title: "Project Hail Mary", 
        author: "Andy Weir", 
        year: 2021, 
        rating: 4.5,
        description: "A lone astronaut must save humanity from extinction in this thrilling science fiction adventure about friendship and sacrifice."
    },
    { 
        title: "Klara and the Sun", 
        author: "Kazuo Ishiguro", 
        year: 2021, 
        rating: 4.0,
        description: "An artificial friend observes the human world with growing understanding in this moving story about love and hope."
    },
    { 
        title: "The Thursday Murder Club", 
        author: "Richard Osman", 
        year: 2020, 
        rating: 4.2,
        description: "Four retirees meet weekly to investigate cold cases, but find themselves hunting a killer when a real murder occurs in their community."
    },
    { 
        title: "The Invisible Life of Addie LaRue", 
        author: "V.E. Schwab", 
        year: 2020, 
        rating: 4.2,
        description: "A young woman makes a deal to live forever but is cursed to be forgotten by everyone she meets, until she finds someone who remembers her."
    },
    { 
        title: "The Silent Patient", 
        author: "Alex Michaelides", 
        year: 2019, 
        rating: 4.1,
        description: "A woman refuses to speak after allegedly murdering her husband, and a psychotherapist becomes obsessed with treating her."
    },
    { 
        title: "Educated", 
        author: "Tara Westover", 
        year: 2018, 
        rating: 4.4,
        description: "A memoir about a woman who grows up in a survivalist family and doesn't attend school until she educates herself enough to reach Harvard and Cambridge."
    },
    { 
        title: "Circe", 
        author: "Madeline Miller", 
        year: 2018, 
        rating: 4.3,
        description: "The story of the Greek goddess who transforms from a minor deity into a powerful witch, finding her voice and strength in a man's world."
    },
    { 
        title: "The Song of Achilles", 
        author: "Madeline Miller", 
        year: 2011, 
        rating: 4.4,
        description: "A reimagining of Homer's Iliad, told through the eyes of Patroclus as he falls in love with the golden prince Achilles."
    },
    { 
        title: "Normal People", 
        author: "Sally Rooney", 
        year: 2018,         
        rating: 3.9,
        description: "The complex relationship between two Irish teenagers as they navigate friendship, love, and class differences from high school to college."
    },
    { 
        title: "The Poppy War", 
        author: "R.F. Kuang", 
        year: 2018, 
        rating: 4.2,
        description: "A dark fantasy inspired by 20th-century Chinese history, following a war orphan who discovers her shamanic powers at a military academy."
    },
    { 
        title: "The Ten Thousand Doors of January", 
        author: "Alix E. Harrow", 
        year: 2019, 
        rating: 4.1,
        description: "A young woman discovers magical doors to other worlds in this lush fantasy about belonging, family, and the power of words."
    },
    { 
        title: "The Priory of the Orange Tree", 
        author: "Samantha Shannon", 
        year: 2019, 
        rating: 4.2,
        description: "An epic high fantasy featuring dragons, queens, and magic, inspired by medieval history and Arthurian legend."
    },
    { 
        title: "Mexican Gothic", 
        author: "Silvia Moreno-Garcia", 
        year: 2020, 
        rating: 4.0,
        description: "A young woman investigates her cousin's disturbing letter from a decaying English mansion in 1950s Mexico in this atmospheric horror novel."
    },
    { 
        title: "The House in the Cerulean Sea", 
        author: "TJ Klune", 
        year: 2020, 
        rating: 4.4,
        description: "A caseworker investigates a magical orphanage and finds a family he never knew he was looking for in this heartwarming fantasy."
    },
    { 
        title: "Red, White & Royal Blue", 
        author: "Casey McQuiston", 
        year: 2019, 
        rating: 4.3,
        description: "The son of the first female US president falls in love with the Prince of Wales in this enemies-to-lovers romantic comedy."
    },
    { 
        title: "The Vanishing Half", 
        author: "Brit Bennett", 
        year: 2020, 
        rating: 4.2,
        description: "Twin sisters take different paths in life, one living as white and the other as black, exploring identity and family across generations."
    },
    { 
        title: "Such a Fun Age", 
        author: "Kiley Reid", 
        year: 2019, 
        rating: 4.0,
        description: "A young black babysitter and her white employer navigate race, class, and privilege when a misunderstanding threatens their relationship."
    },
    { 
        title: "The Water Dancer", 
        author: "Ta-Nehisi Coates", 
        year: 2019, 
        rating: 4.1,
        description: "A young slave discovers a mysterious power called conduction that allows him to travel through time and space in this historical fantasy."
    },
    { 
        title: "The Testaments", 
        author: "Margaret Atwood", 
        year: 2019, 
        rating: 4.1,
        description: "The long-awaited sequel to The Handmaid's Tale, told through the eyes of three women from different backgrounds in Gilead."
    },
    { 
        title: "The Institute", 
        author: "Stephen King", 
        year: 2019, 
        rating: 4.1,
        description: "Children with psychic abilities are held captive in a secret facility where they're trained to use their powers for dark purposes."
    },
    { 
        title: "The Starless Sea", 
        author: "Erin Morgenstern", 
        year: 2019, 
        rating: 4.0,
        description: "A graduate student discovers a mysterious book that tells his own story and leads him to an underground world of stories and magic."
    },
    { 
        title: "Ninth House", 
        author: "Leigh Bardugo", 
        year: 2019, 
        rating: 4.1,
        description: "A Yale student monitors the occult activities of secret societies while investigating a murder connected to the supernatural underworld."
    },
    { 
        title: "The Giver of Stars", 
        author: "Jojo Moyes", 
        year: 2019, 
        rating: 4.2,
        description: "Based on true events, this novel follows the Pack Horse Librarians who brought books to remote areas of Kentucky during the Great Depression."
    },
    { 
        title: "The Nickel Boys", 
        author: "Colson Whitehead", 
        year: 2019, 
        rating: 4.2,
        description: "A devastating novel about a reform school in Jim Crow-era Florida, based on the real story of the Dozier School for Boys."
    },
    { 
        title: "The Dutch House", 
        author: "Ann Patchett", 
        year: 2019, 
        rating: 4.2,
        description: "A sweeping family saga about a brother and sister who are exiled from their childhood home and the house that haunts their memories."
    },
    { 
        title: "The Guest List", 
        author: "Lucy Foley", 
        year: 2020, 
        rating: 4.0,
        description: "A psychological thriller set at a wedding on a remote island, where old grudges and dark secrets lead to murder."
    },
    { 
        title: "Beach Read", 
        author: "Emily Henry", 
        year: 2020, 
        rating: 4.2,
        description: "Two rival writers with opposite genres challenge each other to write outside their comfort zones during a summer by the lake."
    },
    { 
        title: "The Four Winds", 
        author: "Kristin Hannah", 
        year: 2021, 
        rating: 4.4,
        description: "A powerful novel about a woman's struggle to save her family during the Great Depression and Dust Bowl era in Texas."
    },
    { 
        title: "The Sanatorium", 
        author: "Sarah Pearse", 
        year: 2021, 
        rating: 4.0,
        description: "A detective investigates a disappearance at a luxury hotel in the Swiss Alps that was once a sinister sanatorium."
    },
    { 
        title: "The Push", 
        author: "Ashley Audrain", 
        year: 2021, 
        rating: 4.1,
        description: "A psychological thriller about motherhood, exploring the fear that something might be wrong with your child."
    },
    { 
        title: "People We Meet on Vacation", 
        author: "Emily Henry", 
        year: 2021, 
        rating: 4.3,
        description: "Best friends take one last vacation together to repair their friendship in this romantic comedy about love and second chances."
    },
    { 
        title: "It Ends with Us", 
        author: "Colleen Hoover", 
        year: 2016, 
        rating: 4.4,
        description: "A young woman's relationship with a charming neurosurgeon becomes complicated when her first love returns to her life."
    },
    { 
        title: "Verity", 
        author: "Colleen Hoover", 
        year: 2018, 
        rating: 4.3,
        description: "A struggling writer is hired to complete a bestselling author's series and discovers a disturbing manuscript that reveals dark secrets."
    },
    { 
        title: "The Atlas Six", 
        author: "Olivie Blake", 
        year: 2022, 
        rating: 4.1,
        description: "Six young magicians compete for a place in an exclusive society that guards lost knowledge of the ancient world."
    },
    { 
        title: "Book Lovers", 
        author: "Emily Henry", 
        year: 2022, 
        rating: 4.2,
        description: "A literary agent keeps running into the same grumpy editor during her small-town vacation in this enemies-to-lovers romance."
    },
    { 
        title: "The Love Hypothesis", 
        author: "Ali Hazel", 
        year: 2021, 
        rating: 4.3,
        description: "A third-year PhD student enters a fake relationship with a professor to convince her best friend she's over her ex."
    },
    { 
        title: "The Spanish Love Deception", 
        author: "Elena Armas", 
        year: 2021, 
        rating: 4.2,
        description: "An academic needs a date for her sister's wedding and reluctantly asks her colleague who she claims to hate."
    },
    { 
        title: "The Paper Palace", 
        author: "Miranda Cowley Heller", 
        year: 2021, 
        rating: 4.0,
        description: "A woman must choose between her husband and her childhood love during one pivotal day at her family's summer house."
    },
    { 
        title: "Malibu Rising", 
        author: "Taylor Jenkins Reid", 
        year: 2021, 
        rating: 4.2,
        description: "The four famous Riva siblings throw an epic party that will change their lives forever in 1983 Malibu."
    },
    { 
        title: "The Thursday Murder Club", 
        author: "Richard Osman", 
        year: 2020, 
        rating: 4.2,
        description: "Four unlikely friends meet weekly to investigate cold cases and find themselves solving a murder in their retirement community."
    },
    { 
        title: "Atomic Habits", 
        author: "James Clear", 
        year: 2018, 
        rating: 4.4,
        description: "A practical guide to building good habits and breaking bad ones through small changes that deliver remarkable results."
    },
    { 
        title: "Becoming", 
        author: "Michelle Obama", 
        year: 2018, 
        rating: 4.5,
        description: "The former First Lady's intimate memoir chronicles her journey from childhood on Chicago's South Side to the White House."
    },
    { 
        title: "Untamed", 
        author: "Glennon Doyle", 
        year: 2020, 
        rating: 4.3,
        description: "A powerful memoir about breaking free from societal expectations and living authentically as your truest self."
    },
    { 
        title: "The Midnight Girls", 
        author: "Alicia Jasinska", 
        year: 2022, 
        rating: 4.2,
        description: "A dark fairy tale retelling of three witches and the girls who serve them in a world inspired by Slavic folklore."
    },
    { 
        title: "Tomorrow, and Tomorrow, and Tomorrow", 
        author: "Gabrielle Zevin", 
        year: 2022, 
        rating: 4.3,
        description: "A moving story about friendship and creativity, following two game designers over decades of collaboration and rivalry."
    },
    { 
        title: "Lessons in Chemistry", 
        author: "Bonnie Garmus", 
        year: 2022, 
        rating: 4.4,
        description: "A quirky, empowering tale of a female scientist in the 1960s who becomes an unlikely TV cooking star."
    },
    { 
        title: "Remarkably Bright Creatures", 
        author: "Shelby Van Pelt", 
        year: 2022, 
        rating: 4.3,
        description: "A heartwarming novel about a widow, a young man, and a clever octopus whose lives intertwine in unexpected ways."
    },
    { 
        title: "The Lincoln Highway", 
        author: "Amor Towles", 
        year: 2021, 
        rating: 4.2,
        description: "An epic road trip adventure set in 1950s America, filled with unforgettable characters and twists."
    },
    { 
        title: "A Little Life", 
        author: "Hanya Yanagihara", 
        year: 2015, 
        rating: 4.3,
        description: "A powerful, emotional story of four friends in New York City, exploring trauma, love, and survival."
    },
    { 
        title: "The Goldfinch", 
        author: "Donna Tartt", 
        year: 2013, 
        rating: 4.0,
        description: "A Pulitzer Prize-winning novel about a boy whose life is changed by a tragic accident and a stolen painting."
    },
    { 
        title: "The Night Circus", 
        author: "Erin Morgenstern", 
        year: 2011, 
        rating: 4.2,
        description: "A magical competition between two young illusionists set in a mysterious, wandering circus."
    },
    { 
        title: "The Alchemist", 
        author: "Paulo Coelho", 
        year: 1988, 
        rating: 4.3,
        description: "A philosophical fable about following your dreams, as a young shepherd journeys to find his destiny."
    },
    { 
        title: "To Kill a Mockingbird", 
        author: "Harper Lee", 
        year: 1960, 
        rating: 4.5,
        description: "A classic novel of justice and race in the American South, seen through the eyes of young Scout Finch."
    },
    { 
        title: "1984", 
        author: "George Orwell", 
        year: 1949, 
        rating: 4.4,
        description: "A dystopian masterpiece about surveillance, truth, and rebellion in a totalitarian society."
    },
    // --- Added books for minimum 100 curated entries ---
            { title: "Carrie", author: "Stephen King", year: 1974, rating: 4.0, description: "A bullied teenager discovers her telekinetic powers with terrifying consequences." },
            { title: "The Shining", author: "Stephen King", year: 1977, rating: 4.3, description: "A family heads to an isolated hotel for the winter where an evil presence influences the father into violence." },
            { title: "It", author: "Stephen King", year: 1986, rating: 4.2, description: "A group of children face a shape-shifting monster that emerges from the sewer every 27 years." },
            { title: "Misery", author: "Stephen King", year: 1987, rating: 4.1, description: "A famous author is held captive by his psychotic fan after a car accident." },
            { title: "The Green Mile", author: "Stephen King", year: 1996, rating: 4.4, description: "A death row supervisor witnesses supernatural events after a gentle giant is sentenced to death." },
            { title: "Harry Potter and the Philosopher's Stone", author: "J.K. Rowling", year: 1997, rating: 4.5, description: "A young boy discovers he is a wizard and attends Hogwarts School of Witchcraft and Wizardry." },
            { title: "Harry Potter and the Chamber of Secrets", author: "J.K. Rowling", year: 1998, rating: 4.4, description: "Harry returns to Hogwarts and faces a mysterious monster hidden in the school's chamber." },
            { title: "Harry Potter and the Prisoner of Azkaban", author: "J.K. Rowling", year: 1999, rating: 4.5, description: "Harry learns about Sirius Black, an escaped prisoner who may hold secrets about his past." },
            { title: "Harry Potter and the Goblet of Fire", author: "J.K. Rowling", year: 2000, rating: 4.5, description: "Harry competes in a dangerous magical tournament and faces Lord Voldemort." },
            { title: "Harry Potter and the Order of the Phoenix", author: "J.K. Rowling", year: 2003, rating: 4.5, description: "Harry and his friends form a secret group to fight against the rising threat of Voldemort." },
            { title: "Harry Potter and the Half-Blood Prince", author: "J.K. Rowling", year: 2005, rating: 4.5, description: "Harry discovers a mysterious book and learns more about Voldemort's past." },
            { title: "Harry Potter and the Deathly Hallows", author: "J.K. Rowling", year: 2007, rating: 4.6, description: "Harry, Ron, and Hermione go on a quest to destroy Voldemort's Horcruxes." },
            { title: "Gangsta Granny", author: "David Walliams", year: 2011, rating: 4.2, description: "A boy discovers his grandmother is an international jewel thief." },
            { title: "Mr Stink", author: "David Walliams", year: 2009, rating: 4.1, description: "A girl befriends a homeless man and learns about kindness and acceptance." },
            { title: "Billionaire Boy", author: "David Walliams", year: 2010, rating: 4.0, description: "A boy who has everything except a friend learns the true value of friendship." },
            { title: "Ratburger", author: "David Walliams", year: 2012, rating: 4.1, description: "A girl and her pet rat face a villainous burger shop owner." },
            { title: "Awful Auntie", author: "David Walliams", year: 2014, rating: 4.2, description: "A young girl battles her evil aunt for her inheritance." },
            { title: "The Boy in the Dress", author: "David Walliams", year: 2008, rating: 4.0, description: "A boy breaks gender norms and finds acceptance." },
            { title: "Grandpa's Great Escape", author: "David Walliams", year: 2015, rating: 4.3, description: "A boy helps his grandfather escape from a care home." },
            { title: "Demon Dentist", author: "David Walliams", year: 2013, rating: 4.1, description: "A mysterious dentist hands out strange gifts to children." },
            { title: "The World's Worst Children", author: "David Walliams", year: 2016, rating: 4.2, description: "Ten tales of hilariously horrible children." },
            { title: "The World's Worst Teachers", author: "David Walliams", year: 2019, rating: 4.1, description: "Ten tales of truly terrible teachers." },
            { title: "The World's Worst Parents", author: "David Walliams", year: 2020, rating: 4.1, description: "Ten tales of the world's worst parents." },
            { title: "Matilda", author: "Roald Dahl", year: 1988, rating: 4.3, description: "A gifted girl uses her powers to overcome her cruel parents and headmistress." },
            { title: "Charlie and the Chocolate Factory", author: "Roald Dahl", year: 1964, rating: 4.4, description: "A poor boy wins a tour of a magical chocolate factory."},
            { title: "The BFG", author: "Roald Dahl", year: 1982, rating: 4.3, description: "A girl befriends a big friendly giant and helps him stop evil giants." },
            { title: "James and the Giant Peach", author: "Roald Dahl", year: 1961, rating: 4.2, description: "A boy escapes his cruel aunts on a magical peach." },
            { title: "Fantastic Mr Fox", author: "Roald Dahl", year: 1970, rating: 4.1, description: "A clever fox outwits three farmers." },
            { title: "The Witches", author: "Roald Dahl", year: 1983, rating: 4.2, description: "A boy and his grandmother battle child-hating witches." },
            { title: "The Twits", author: "Roald Dahl", year: 1980, rating: 4.1, description: "A nasty couple get their comeuppance from clever animals." },
            { title: "Northern Lights", author: "Philip Pullman", year: 1995, rating: 4.2, description: "A girl embarks on a journey to the Arctic to rescue her friend." },
            { title: "The Subtle Knife", author: "Philip Pullman", year: 1997, rating: 4.2, description: "Lyra and Will discover a knife that can cut between worlds." },
            { title: "The Amber Spyglass", author: "Philip Pullman", year: 2000, rating: 4.3, description: "Lyra and Will must save the universe from destruction." },
            { title: "Percy Jackson & the Olympians: The Lightning Thief", author: "Rick Riordan", year: 2005, rating: 4.2, description: "A boy discovers he is a demigod and must prevent a war among the gods." },
            { title: "Percy Jackson & the Olympians: Sea of Monsters", author: "Rick Riordan", year: 2006, rating: 4.2, description: "Percy and friends search for the mythical Golden Fleece." },
            { title: "Percy Jackson & the Olympians: The Titan's Curse", author: "Rick Riordan", year: 2007, rating: 4.3, description: "Percy must rescue a goddess from the clutches of a monster." },
            { title: "Percy Jackson & the Olympians: The Battle of the Labyrinth", author: "Rick Riordan", year: 2008, rating: 4.3, description: "Percy and friends navigate a deadly maze to stop an evil army." },
            { title: "Percy Jackson & the Olympians: The Last Olympian", author: "Rick Riordan", year: 2009, rating: 4.4, description: "Percy faces his final battle against the Titans." },
            { title: "The Hunger Games", author: "Suzanne Collins", year: 2008, rating: 4.3, description: "A girl fights for survival in a televised death match." },
            { title: "Catching Fire", author: "Suzanne Collins", year: 2009, rating: 4.4, description: "Katniss returns to the arena for a second deadly competition." },
            { title: "Mockingjay", author: "Suzanne Collins", year: 2010, rating: 4.2, description: "Katniss leads a rebellion against a tyrannical government." },
            { title: "Twilight", author: "Stephenie Meyer", year: 2005, rating: 3.9, description: "A teenage girl falls in love with a vampire." },
            { title: "New Moon", author: "Stephenie Meyer", year: 2006, rating: 3.8, description: "Bella faces heartbreak and danger as her vampire boyfriend leaves town." },
            { title: "Eclipse", author: "Stephenie Meyer", year: 2007, rating: 3.9, description: "Bella must choose between her love for a vampire and a werewolf." },
            { title: "Breaking Dawn", author: "Stephenie Meyer", year: 2008, rating: 3.9, description: "Bella and Edward face new challenges as they start a family." },
            { title: "Diary of a Wimpy Kid", author: "Jeff Kinney", year: 2007, rating: 4.1, description: "A middle schooler chronicles his life in a hilarious diary." },
            { title: "The Fault in Our Stars", author: "John Green", year: 2012, rating: 4.2, description: "Two teens with cancer fall in love and search for meaning." },
            { title: "Wonder", author: "R.J. Palacio", year: 2012, rating: 4.4, description: "A boy with facial differences navigates school and acceptance." },
            { title: "The Maze Runner", author: "James Dashner", year: 2009, rating: 4.0, description: "Teens wake up in a mysterious maze with no memory of their past." },
            { title: "Divergent", author: "Veronica Roth", year: 2011, rating: 4.2, description: "A girl discovers she doesn't fit into her dystopian society's strict factions." },
            { title: "Insurgent", author: "Veronica Roth", year: 2012, rating: 4.1, description: "Tris and her friends fight for survival against a corrupt government." },
            { title: "Allegiant", author: "Veronica Roth", year: 2013, rating: 3.7, description: "Tris and Four discover the truth about their world." },
            { title: "The Book Thief", author: "Markus Zusak", year: 2005, rating: 4.4, description: "A young girl steals books and shares them during WWII in Nazi Germany." },
            { title: "Life of Pi", author: "Yann Martel", year: 2001, rating: 4.1, description: "A boy survives a shipwreck and shares a lifeboat with a tiger." },
            { title: "The Kite Runner", author: "Khaled Hosseini", year: 2003, rating: 4.3, description: "A story of friendship and redemption set in Afghanistan." },
            { title: "A Game of Thrones", author: "George R.R. Martin", year: 1996, rating: 4.5, description: "Noble families vie for control of the Iron Throne in a fantasy world." },
            { title: "A Clash of Kings", author: "George R.R. Martin", year: 1998, rating: 4.4, description: "The battle for the Iron Throne intensifies as new players emerge." },
            { title: "A Storm of Swords", author: "George R.R. Martin", year: 2000, rating: 4.5, description: "Betrayal and war threaten the Seven Kingdoms." },
            { title: "A Feast for Crows", author: "George R.R. Martin", year: 2005, rating: 4.2, description: "The aftermath of war brings new challenges to Westeros." },
            { title: "A Dance with Dragons", author: "George R.R. Martin", year: 2011, rating: 4.3, description: "Daenerys and Jon Snow face new threats in the North and East." },
            { title: "The Girl on the Train", author: "Paula Hawkins", year: 2015, rating: 4.0, description: "A woman becomes entangled in a missing persons investigation." },
            { title: "Gone Girl", author: "Gillian Flynn", year: 2012, rating: 4.1, description: "A woman's disappearance turns into a twisted psychological thriller." },
            { title: "The Da Vinci Code", author: "Dan Brown", year: 2003, rating: 4.0, description: "A symbologist uncovers a religious mystery hidden in works of art." },
            { title: "Angels & Demons", author: "Dan Brown", year: 2000, rating: 4.0, description: "A Harvard symbologist races to prevent a terrorist attack on the Vatican." },
            { title: "The Lost Symbol", author: "Dan Brown", year: 2009, rating: 3.9, description: "A quest for a legendary secret hidden in Washington, D.C." },
            { title: "Inferno", author: "Dan Brown", year: 2013, rating: 3.9, description: "A race against time to stop a global plague." },
            { title: "Origin", author: "Dan Brown", year: 2017, rating: 3.8, description: "A discovery that could change the future of humanity." },
            { title: "The Secret Garden", author: "Frances Hodgson Burnett", year: 1911, rating: 4.2, description: "A lonely girl discovers a hidden, magical garden." },
            { title: "Anne of Green Gables", author: "L.M. Montgomery", year: 1908, rating: 4.3, description: "An imaginative orphan finds a home in Avonlea." },
            { title: "Little Women", author: "Louisa May Alcott", year: 1868, rating: 4.2, description: "Four sisters grow up during the American Civil War." },
            { title: "Pride and Prejudice", author: "Jane Austen", year: 1813, rating: 4.3, description: "A witty romantic tale of manners and marriage." },
            { title: "Jane Eyre", author: "Charlotte Brontë", year: 1847, rating: 4.2, description: "An orphaned girl overcomes hardship to find love and independence." },
            { title: "Wuthering Heights", author: "Emily Brontë", year: 1847, rating: 4.1, description: "A tale of passion and revenge on the Yorkshire moors." },
            { title: "Dracula", author: "Bram Stoker", year: 1897, rating: 4.0, description: "A vampire terrorizes Victorian England." },
            { title: "Frankenstein", author: "Mary Shelley", year: 1818, rating: 4.0, description: "A scientist creates a monster in his quest to conquer death." },
            { title: "The Hobbit", author: "J.R.R. Tolkien", year: 1937, rating: 4.3, description: "A hobbit embarks on a quest to reclaim a lost treasure from a dragon." },
            { title: "The Lord of the Rings: The Fellowship of the Ring", author: "J.R.R. Tolkien", year: 1954, rating: 4.5, description: "A group sets out to destroy a powerful ring and save Middle-earth." },
            { title: "The Lord of the Rings: The Two Towers", author: "J.R.R. Tolkien", year: 1954, rating: 4.5, description: "The fellowship is split as evil forces gather strength." },
            { title: "The Lord of the Rings: The Return of the King", author: "J.R.R. Tolkien", year: 1955, rating: 4.6, description: "The final battle for Middle-earth begins." }
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

    // Random Book button functionality
    const randomBookBtn = document.getElementById('Random-book-button');
    if (randomBookBtn) {
        randomBookBtn.onclick = function() {
            showRandomBook();
        };
    }

    // Next Book button functionality
    const nextBookBtn = document.getElementById('next-book-btn');
    if (nextBookBtn) {
        nextBookBtn.onclick = function() {
            showRandomBook();
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
                           volumeInfo.averageRating >= 3.5 &&
                           volumeInfo.description.length > 100;
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
        authors: [book.author],
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
                const hasDescription = volumeInfo.description && volumeInfo.description.length > 50;
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
            
            // If we got API results, pick the best one but only if it's significantly better
            if (validBooks.length > 0) {
                // Prioritize Google Books for speed and quality, then Open Library
                const bestBook = validBooks.find(book => book.source === 'google') || 
                               validBooks.find(book => book.source === 'openlibrary') || 
                               validBooks[0];
                
                // Only replace if the API book has a good description and wasn't recently shown
                if (bestBook && 
                    bestBook.description && 
                    bestBook.description !== 'No description available.' &&
                    bestBook.description.length > 100 &&
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
        bookData.publishInfo += book.first_publish_year ? ` • Rating: ${book.rating.toFixed(1)}` : `Rating: ${book.rating.toFixed(1)}`;
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
    if (book.source === 'curated' || (book.description && book.description.length < 100)) {
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
    document.getElementById('book-rating').textContent = bookData.publishInfo;
    
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
                if (volumeInfo.description && volumeInfo.description.length > 50) {
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
        const searchQuery = `${book.title} ${book.authors[0]}`;
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
    if (book.rating) {
        publishInfo += book.first_publish_year ? ` • Rating: ${book.rating.toFixed(1)}` : `Rating: ${book.rating.toFixed(1)}`;
    }
    document.getElementById('book-rating').textContent = publishInfo;
    
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
    
    // Try to get better description for curated and some API books
    if (book.source === 'curated' || (book.description && book.description.length < 100)) {
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
        const searchQuery = `${book.title} ${book.authors[0]}`;
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
                if (volumeInfo.description && volumeInfo.description.length > 50) {
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
