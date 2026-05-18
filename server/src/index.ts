import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { initializeDatabase } from './db';
import songRouter from './routes/songs';
import scoreRouter from './routes/scores';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Enable CORS so the React app (running on a different port like 5173) can query our API
app.use(cors({
  origin: '*', // For development flexibility
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

// Routes
app.use('/api/songs', songRouter);
app.use('/api/scores', scoreRouter);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'Typebeat Backend is healthy.' });
});

// Initialize DB and start server
async function startServer() {
  try {
    // 1. Establish and verify database and schemas
    await initializeDatabase();
    
    // 2. Start the Express server
    app.listen(PORT, () => {
      console.log(`===================================================`);
      console.log(`   TYPEBEAT SERVER RUNNING ON PORT ${PORT}         `);
      console.log(`   API endpoints available at http://localhost:${PORT}/api`);
      console.log(`===================================================`);
    });
  } catch (error) {
    console.error('CRITICAL: Server failed to start due to database error:', error);
    process.exit(1);
  }
}

startServer();
