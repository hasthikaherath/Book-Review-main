require('dotenv').config();
const path = require('path');
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const Book = require('./models/Book');
const User = require('./models/User');
const Review = require('./models/Review');
const DiaryEntry = require('./models/DiaryEntry');

const authRoutes = require('./routes/auth');
const bookRoutes = require('./routes/books');
const reviewRoutes = require('./routes/reviews');
const diaryRoutes = require('./routes/diary');
const userRoutes = require('./routes/users');

const app = express();

app.use(cors());
app.use(express.json());

// Request logging in development
if (process.env.NODE_ENV !== 'production') {
  app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    next();
  });
}

// Mount REST API routes
app.use('/api/auth', authRoutes);
app.use('/api/books', bookRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/diary', diaryRoutes);
app.use('/api/users', userRoutes);

// Live Database Telemetry & Stats
app.get('/api/stats', async (req, res) => {
  try {
    const [booksCount, usersCount, reviewsCount, diaryCount] = await Promise.all([
      Book.countDocuments(),
      User.countDocuments(),
      Review.countDocuments(),
      DiaryEntry.countDocuments(),
    ]);
    res.json({
      books: booksCount,
      users: usersCount,
      reviews: reviewsCount,
      diaryEntries: diaryCount,
      database: 'aether_reads',
      connected: mongoose.connection.readyState === 1,
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    res.status(500).json({ message: 'Failed to retrieve stats: ' + err.message });
  }
});

// Comprehensive Health & Telemetry Check
app.get('/api/health', (req, res) => {
  const dbState = mongoose.connection.readyState;
  const states = ['disconnected', 'connected', 'connecting', 'disconnecting'];
  res.json({
    status: 'ok',
    service: 'Aether Reads MERN API',
    database: states[dbState] || 'unknown',
    connected: dbState === 1,
    dbHost: mongoose.connection.host || '127.0.0.1',
    dbPort: mongoose.connection.port || 27017,
    dbName: mongoose.connection.name || 'aether_reads',
    uptimeSeconds: Math.floor(process.uptime()),
    nodeVersion: process.version,
    env: process.env.NODE_ENV || 'development',
    timestamp: new Date().toISOString(),
  });
});

// Production Static Serving
const clientDistPath = path.join(__dirname, '../client/dist');
app.use(express.static(clientDistPath));

app.get('*', (req, res, next) => {
  if (req.url.startsWith('/api')) {
    return next();
  }
  const indexPath = path.join(clientDistPath, 'index.html');
  res.sendFile(indexPath, (err) => {
    if (err) {
      res.status(404).send('Aether Reads Frontend not built yet. Run npm run build in client.');
    }
  });
});

const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/aether_reads';

mongoose
  .connect(MONGO_URI)
  .then(() => {
    console.log('✅ Connected to MongoDB at:', MONGO_URI);
    const server = app.listen(PORT, () => {
      console.log(`🚀 Aether Reads MERN Server running on port ${PORT}`);
      console.log(`📡 Health endpoint: http://localhost:${PORT}/api/health`);
      console.log(`📊 Stats endpoint:  http://localhost:${PORT}/api/stats`);
    });

    // Graceful shutdown
    const handleShutdown = async () => {
      console.log('\nGracefully shutting down...');
      server.close(async () => {
        await mongoose.connection.close();
        console.log('MongoDB connection closed.');
        process.exit(0);
      });
    };
    process.on('SIGTERM', handleShutdown);
    process.on('SIGINT', handleShutdown);
  })
  .catch((err) => {
    console.error('❌ MongoDB connection error:', err.message);
    process.exit(1);
  });
