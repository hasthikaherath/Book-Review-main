require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const User = require('./models/User');
const Book = require('./models/Book');
const Review = require('./models/Review');
const DiaryEntry = require('./models/DiaryEntry');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/aether_reads';

const SEED_BOOKS = [
  {
    externalId: 'OL893415W',
    isbn: '978-0441172719',
    title: 'Dune',
    author: 'Frank Herbert',
    publishedYear: 1965,
    pageCount: 688,
    genres: ['Sci-Fi', 'Speculative', 'Philosophy'],
    coverUrl: 'https://covers.openlibrary.org/b/id/8934151-L.jpg',
    description: 'Set on the desert planet Arrakis, Dune is the story of Paul Atreides, heir to a noble family tasked with ruling an inhospitable world where the only thing of value is the spice melange, a substance capable of extending life and enhancing consciousness.',
    likesCount: 142,
    dislikesCount: 6,
    favoritesCount: 98,
    ratingSum: 48,
    ratingCount: 10,
  },
  {
    externalId: 'OL20892614W',
    isbn: '978-0593135204',
    title: 'Project Hail Mary',
    author: 'Andy Weir',
    publishedYear: 2021,
    pageCount: 496,
    genres: ['Sci-Fi', 'Astrophysics'],
    coverUrl: 'https://covers.openlibrary.org/b/id/10522071-L.jpg',
    description: 'Ryland Grace is the sole survivor on a desperate, last-chance interstellar mission—and if he fails, humanity and the Earth itself will perish. Except that right now, he does not know that.',
    likesCount: 189,
    dislikesCount: 8,
    favoritesCount: 134,
    ratingSum: 68,
    ratingCount: 14,
  },
  {
    externalId: 'OL17362669W',
    isbn: '978-0765382030',
    title: 'The Three-Body Problem',
    author: 'Liu Cixin',
    publishedYear: 2008,
    pageCount: 416,
    genres: ['Sci-Fi', 'Astrophysics', 'Philosophy'],
    coverUrl: 'https://covers.openlibrary.org/b/id/8302506-L.jpg',
    description: 'Set against the backdrop of China’s Cultural Revolution, a secret military project sends signals into space to establish contact with aliens. An alien civilization on the brink of destruction captures the signal.',
    likesCount: 126,
    dislikesCount: 14,
    favoritesCount: 84,
    ratingSum: 44,
    ratingCount: 10,
  },
  {
    externalId: 'OL27258W',
    isbn: '978-0441569595',
    title: 'Neuromancer',
    author: 'William Gibson',
    publishedYear: 1984,
    pageCount: 271,
    genres: ['Cyberpunk', 'Sci-Fi'],
    coverUrl: 'https://covers.openlibrary.org/b/id/8739161-L.jpg',
    description: 'Case was the sharpest data-thief in the matrix—until he crossed the wrong employers and they crippled his nervous system, banishing him from cyberspace. Now a mysterious new employer offers him a last-chance run.',
    likesCount: 115,
    dislikesCount: 9,
    favoritesCount: 79,
    ratingSum: 39,
    ratingCount: 9,
  },
  {
    externalId: 'OL21636494W',
    isbn: '978-0593318171',
    title: 'Klara and the Sun',
    author: 'Kazuo Ishiguro',
    publishedYear: 2021,
    pageCount: 303,
    genres: ['Literary', 'Speculative', 'Philosophy'],
    coverUrl: 'https://covers.openlibrary.org/b/id/10543261-L.jpg',
    description: 'From her place in the store, Klara, an Artificial Friend with outstanding observational qualities, watches carefully the behavior of those who come in to browse and of those who pass on the street outside.',
    likesCount: 97,
    dislikesCount: 11,
    favoritesCount: 64,
    ratingSum: 36,
    ratingCount: 8,
  },
  {
    externalId: 'OL1964321W',
    isbn: '978-0553283686',
    title: 'Hyperion',
    author: 'Dan Simmons',
    publishedYear: 1989,
    pageCount: 482,
    genres: ['Sci-Fi', 'Speculative', 'Literary'],
    coverUrl: 'https://covers.openlibrary.org/b/id/8314112-L.jpg',
    description: 'On the world called Hyperion, beyond the line of the Hegemony of Man, waits the creature called the Shrike. On the eve of Armageddon, seven pilgrims set forth on a final voyage to Hyperion seeking answers.',
    likesCount: 131,
    dislikesCount: 5,
    favoritesCount: 92,
    ratingSum: 49,
    ratingCount: 10,
  },
  {
    externalId: 'OL46125W',
    isbn: '978-0553293357',
    title: 'Foundation',
    author: 'Isaac Asimov',
    publishedYear: 1951,
    pageCount: 255,
    genres: ['Sci-Fi', 'Philosophy'],
    coverUrl: 'https://covers.openlibrary.org/b/id/7222246-L.jpg',
    description: 'For twelve thousand years the Galactic Empire has ruled supreme. Now it is dying. Only Hari Seldon, creator of the revolutionary science of psychohistory, can see into the future.',
    likesCount: 118,
    dislikesCount: 7,
    favoritesCount: 76,
    ratingSum: 45,
    ratingCount: 10,
  },
  {
    externalId: 'OL59864W',
    isbn: '978-0441478125',
    title: 'The Left Hand of Darkness',
    author: 'Ursula K. Le Guin',
    publishedYear: 1969,
    pageCount: 304,
    genres: ['Sci-Fi', 'Literary', 'Philosophy'],
    coverUrl: 'https://covers.openlibrary.org/b/id/8235118-L.jpg',
    description: 'A lone human emissary is sent to Winter, an icy planet whose inhabitants have an ambisexual physiology, to facilitate its inclusion in a growing intergalactic civilization.',
    likesCount: 109,
    dislikesCount: 4,
    favoritesCount: 88,
    ratingSum: 43,
    ratingCount: 9,
  },
  {
    externalId: 'OL20165798W',
    isbn: '978-1101947883',
    title: 'Exhalation',
    author: 'Ted Chiang',
    publishedYear: 2019,
    pageCount: 368,
    genres: ['Speculative', 'Philosophy', 'Sci-Fi'],
    coverUrl: 'https://covers.openlibrary.org/b/id/8991206-L.jpg',
    description: 'Nine stunningly original, provocative, and poignant stories about time travel, artificial consciousness, free will, and the nature of the universe.',
    likesCount: 154,
    dislikesCount: 3,
    favoritesCount: 112,
    ratingSum: 50,
    ratingCount: 10,
  },
  {
    externalId: 'OL21723564W',
    isbn: '978-1635575637',
    title: 'Piranesi',
    author: 'Susanna Clarke',
    publishedYear: 2020,
    pageCount: 245,
    genres: ['Speculative', 'Literary'],
    coverUrl: 'https://covers.openlibrary.org/b/id/10291910-L.jpg',
    description: 'Piranesi’s house is no ordinary building: its rooms are infinite, its corridors endless, its walls are lined with thousands upon thousands of statues.',
    likesCount: 121,
    dislikesCount: 6,
    favoritesCount: 91,
    ratingSum: 46,
    ratingCount: 10,
  },
  {
    externalId: 'OL17352441W',
    isbn: '978-0316452502',
    title: 'Children of Time',
    author: 'Adrian Tchaikovsky',
    publishedYear: 2015,
    pageCount: 600,
    genres: ['Sci-Fi', 'Astrophysics'],
    coverUrl: 'https://covers.openlibrary.org/b/id/8315201-L.jpg',
    description: 'The last remnants of the human race left a dying Earth, desperate to find a new home among the stars. They discover a world terraformed and prepared for life—but not human life.',
    likesCount: 138,
    dislikesCount: 5,
    favoritesCount: 95,
    ratingSum: 47,
    ratingCount: 10,
  },
  {
    externalId: 'OL395405W',
    isbn: '978-0553380958',
    title: 'Snow Crash',
    author: 'Neal Stephenson',
    publishedYear: 1992,
    pageCount: 470,
    genres: ['Cyberpunk', 'Sci-Fi'],
    coverUrl: 'https://covers.openlibrary.org/b/id/8243105-L.jpg',
    description: 'In reality, Hiro Protagonist delivers pizza, but in the Metaverse he is a warrior prince. Plunging headlong into the enigma of a new computer virus that is striking down hackers everywhere.',
    likesCount: 104,
    dislikesCount: 12,
    favoritesCount: 67,
    ratingSum: 38,
    ratingCount: 9,
  },
];

async function seedDatabase() {
  try {
    console.log('Connecting to MongoDB at:', MONGO_URI);
    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB successfully.');

    // Clear existing collections
    await Promise.all([
      User.deleteMany({}),
      Book.deleteMany({}),
      Review.deleteMany({}),
      DiaryEntry.deleteMany({}),
    ]);
    console.log('Cleared existing collections.');

    // Seed Books
    const createdBooks = await Book.insertMany(SEED_BOOKS);
    console.log(`Seeded ${createdBooks.length} books.`);

    // Seed Users
    const passwordHash = await bcrypt.hash('password123', 10);
    const usersData = [
      {
        username: 'aria_vance',
        displayName: 'Aria Vance',
        email: 'aria@aether.io',
        passwordHash,
        bio: 'Astrophysicist & nocturnal reader. Happiest with a rainstorm outside, a mug of cinnamon chai, and a 600-page world to get lost in.',
        avatarColor: '#F59E0B',
        favorites: [createdBooks[0]._id, createdBooks[1]._id, createdBooks[8]._id, createdBooks[9]._id],
        likedBooks: [createdBooks[0]._id, createdBooks[1]._id, createdBooks[5]._id, createdBooks[7]._id, createdBooks[8]._id, createdBooks[9]._id],
        dislikedBooks: [],
        following: [],
        followers: [],
      },
      {
        username: 'marcus_thorne',
        displayName: 'Marcus Thorne',
        email: 'marcus@aether.io',
        passwordHash,
        bio: 'Cybernetics engineer and vintage terminal collector. Reading to understand where machine logic ends and human poetry begins.',
        avatarColor: '#38BDF8',
        favorites: [createdBooks[2]._id, createdBooks[3]._id, createdBooks[11]._id],
        likedBooks: [createdBooks[2]._id, createdBooks[3]._id, createdBooks[11]._id],
        dislikedBooks: [],
        following: [],
        followers: [],
      },
      {
        username: 'elena_solis',
        displayName: 'Dr. Elena Solis',
        email: 'elena@aether.io',
        passwordHash,
        bio: 'Xenobiologist & tea enthusiast. Addicted to stories with impossible ecology, deep space voyages, and characters who choose wonder over fear.',
        avatarColor: '#10B981',
        favorites: [createdBooks[1]._id, createdBooks[10]._id, createdBooks[9]._id],
        likedBooks: [createdBooks[0]._id, createdBooks[1]._id, createdBooks[10]._id],
        dislikedBooks: [],
        following: [],
        followers: [],
      },
      {
        username: 'zephyr_kane',
        displayName: 'Zephyr Kane',
        email: 'zephyr@aether.io',
        passwordHash,
        bio: 'Sound designer & speculative fiction hoarder. Constantly searching for the single line of prose that alters how time feels.',
        avatarColor: '#818CF8',
        favorites: [createdBooks[3]._id, createdBooks[5]._id, createdBooks[7]._id],
        likedBooks: [createdBooks[3]._id, createdBooks[5]._id],
        dislikedBooks: [],
        following: [],
        followers: [],
      },
      {
        username: 'seraphina_v',
        displayName: 'Seraphina Vance',
        email: 'seraphina@aether.io',
        passwordHash,
        bio: 'Philosopher, archivist of forgotten libraries. Reads slowly with a mechanical pencil in hand.',
        avatarColor: '#EC4899',
        favorites: [createdBooks[4]._id, createdBooks[8]._id, createdBooks[9]._id],
        likedBooks: [createdBooks[4]._id, createdBooks[8]._id, createdBooks[9]._id],
        dislikedBooks: [],
        following: [],
        followers: [],
      },
    ];

    const createdUsers = await User.insertMany(usersData);
    console.log(`Seeded ${createdUsers.length} users.`);

    // Interconnect social graph
    createdUsers[0].following = [createdUsers[1]._id, createdUsers[2]._id, createdUsers[3]._id];
    createdUsers[0].followers = [createdUsers[1]._id, createdUsers[2]._id, createdUsers[3]._id, createdUsers[4]._id];

    createdUsers[1].following = [createdUsers[0]._id, createdUsers[2]._id];
    createdUsers[1].followers = [createdUsers[0]._id, createdUsers[3]._id];

    createdUsers[2].following = [createdUsers[0]._id, createdUsers[4]._id];
    createdUsers[2].followers = [createdUsers[0]._id, createdUsers[1]._id];

    createdUsers[3].following = [createdUsers[0]._id, createdUsers[1]._id];
    createdUsers[3].followers = [createdUsers[0]._id];

    createdUsers[4].following = [createdUsers[0]._id, createdUsers[2]._id];
    createdUsers[4].followers = [createdUsers[0]._id];

    await Promise.all(createdUsers.map((u) => u.save()));
    console.log('Interconnected social graph.');

    // Seed Reviews
    const reviewsData = [
      {
        book: createdBooks[0]._id,
        user: createdUsers[0]._id,
        rating: 5,
        thoughts: 'The ecological depth of Arrakis remains untouched in modern speculative fiction. Herbert wrote a masterclass in political intrigue and desert survival.',
        moodTags: ['Atmospheric', 'World-Building', 'Philosophical'],
        containsSpoilers: false,
        likes: [createdUsers[1]._id, createdUsers[2]._id],
      },
      {
        book: createdBooks[1]._id,
        user: createdUsers[0]._id,
        rating: 5,
        thoughts: 'I laughed out loud, cried twice, and stayed awake until 3 AM finishing the final chapters. Rocky is hands down one of the most heartwarming characters ever conceived in science fiction! Amaze! Amaze! Amaze!',
        moodTags: ['Heartwarming', 'Page-Turner', 'Mind-Bending'],
        containsSpoilers: false,
        likes: [createdUsers[1]._id, createdUsers[2]._id, createdUsers[3]._id, createdUsers[4]._id],
      },
      {
        book: createdBooks[2]._id,
        user: createdUsers[1]._id,
        rating: 4,
        thoughts: 'The opening historical chapters and the eerie Three-Body simulation segments are unforgettable. A staggering work of imagination with cold cosmic dread.',
        moodTags: ['Mind-Bending', 'World-Building'],
        containsSpoilers: false,
        likes: [createdUsers[3]._id],
      },
      {
        book: createdBooks[3]._id,
        user: createdUsers[1]._id,
        rating: 5,
        thoughts: 'The sky above the port was the color of television, tuned to a dead channel. Gibson defined an entire aesthetic and technological future in 270 electric pages.',
        moodTags: ['Cyberpunk', 'Atmospheric'],
        containsSpoilers: false,
        likes: [createdUsers[0]._id, createdUsers[3]._id],
      },
      {
        book: createdBooks[8]._id,
        user: createdUsers[4]._id,
        rating: 5,
        thoughts: 'The title story "Exhalation" is a masterpiece of empathy—a mechanical being reflecting on breath, memory, and gratitude for existence. Left me staring out the window in contemplative awe for an hour.',
        moodTags: ['Philosophical', 'Mind-Bending', 'Heartwarming'],
        containsSpoilers: false,
        likes: [createdUsers[0]._id, createdUsers[1]._id, createdUsers[2]._id],
      },
      {
        book: createdBooks[9]._id,
        user: createdUsers[2]._id,
        rating: 5,
        thoughts: 'The Beauty of the House is immeasurable; its Kindness infinite. A radiant, poetic work that restores one’s faith in goodness.',
        moodTags: ['Atmospheric', 'Heartwarming', 'Philosophical'],
        containsSpoilers: false,
        likes: [createdUsers[0]._id, createdUsers[4]._id],
      },
    ];

    const createdReviews = await Review.insertMany(reviewsData);
    console.log(`Seeded ${createdReviews.length} reviews.`);

    // Seed Reading Diary Entries
    const diaryData = [
      {
        user: createdUsers[0]._id,
        book: createdBooks[1]._id,
        status: 'read',
        readDate: new Date('2026-10-12'),
        rating: 5,
        diaryNotes: 'Finished at 2:00 AM curled up on the sofa while it rained outside. Could not put it down—added straight to my all-time Favorites shelf.',
        pagesRead: 496,
        isReread: false,
        liked: true,
        addedToFavorites: true,
      },
      {
        user: createdUsers[0]._id,
        book: createdBooks[8]._id,
        status: 'read',
        readDate: new Date('2026-09-28'),
        rating: 5,
        diaryNotes: 'Read one story each evening with chamomile tea. "The Truth of Fact, the Truth of Feeling" completely reshaped how I think about keeping a personal diary.',
        pagesRead: 368,
        isReread: true,
        liked: true,
        addedToFavorites: true,
      },
      {
        user: createdUsers[0]._id,
        book: createdBooks[5]._id,
        status: 'reading',
        readDate: new Date('2026-10-14'),
        rating: 5,
        diaryNotes: 'Currently halfway through Sol Weintraub’s story—some of the most tender, heartbreaking parenting moments I have ever read in sci-fi.',
        pagesRead: 260,
        isReread: false,
        liked: true,
        addedToFavorites: false,
      },
      {
        user: createdUsers[2]._id,
        book: createdBooks[9]._id,
        status: 'read',
        readDate: new Date('2026-10-08'),
        rating: 5,
        diaryNotes: 'May the House bless you. A luminous, comforting meditation on wonder and kindness.',
        pagesRead: 245,
        isReread: false,
        liked: true,
        addedToFavorites: true,
      },
      {
        user: createdUsers[1]._id,
        book: createdBooks[3]._id,
        status: 'read',
        readDate: new Date('2026-10-09'),
        rating: 5,
        diaryNotes: 'Annual autumn re-read of Neuromancer at my favorite corner coffee shop with double espresso.',
        pagesRead: 271,
        isReread: true,
        liked: true,
        addedToFavorites: true,
      },
      {
        user: createdUsers[3]._id,
        book: createdBooks[10]._id,
        status: 'read',
        readDate: new Date('2026-10-02'),
        rating: 5,
        diaryNotes: 'Never thought a book could make me root so passionately for jumping spiders. Pure evolutionary brilliance.',
        pagesRead: 600,
        isReread: false,
        liked: true,
        addedToFavorites: true,
      },
    ];

    const createdDiary = await DiaryEntry.insertMany(diaryData);
    console.log(`Seeded ${createdDiary.length} diary entries.`);

    console.log('✅ DATABASE SEEDING COMPLETED SUCCESSFULLY!');
    process.exit(0);
  } catch (err) {
    console.error('❌ Seeding error:', err);
    process.exit(1);
  }
}

seedDatabase();

