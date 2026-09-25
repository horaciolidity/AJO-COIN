import express from 'express';
import cors from 'cors';
import { SERVER_CONFIG } from './config';
import { seedDatabase } from './seed';
import { authRouter } from './routes/auth';
import { gameRouter } from './routes/game';
import { inventoryRouter } from './routes/inventory';
import { upgradesRouter } from './routes/upgrades';
import { questsRouter } from './routes/quests';
import { referralsRouter } from './routes/referrals';
import { leaderboardRouter } from './routes/leaderboard';
import { presaleRouter } from './routes/presale';
import { web3Router } from './routes/web3';
import { adminRouter } from './routes/admin';

const app = express();

app.use(cors());
app.use(express.json());

// API Routes
app.use('/api/auth', authRouter);
app.use('/api/game', gameRouter);
app.use('/api/inventory', inventoryRouter);
app.use('/api/upgrades', upgradesRouter);
app.use('/api/quests', questsRouter);
app.use('/api/referrals', referralsRouter);
app.use('/api/leaderboard', leaderboardRouter);
app.use('/api/presale', presaleRouter);
app.use('/api/web3', web3Router);
app.use('/api/admin', adminRouter);

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', name: 'AJO COIN Backend API', time: new Date().toISOString() });
});

async function startServer() {
  try {
    // Seed initial database content (upgrades, quests, achievements)
    await seedDatabase();

    app.listen(SERVER_CONFIG.port, () => {
      console.log(`🧄 AJO COIN Backend Server listening on http://localhost:${SERVER_CONFIG.port}`);
    });
  } catch (err) {
    console.error('Failed to start server:', err);
  }
}

startServer();
