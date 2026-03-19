import './config/dotenv.config.js';
import express from 'express';
import type { Application, Request, Response } from 'express';
import cors from 'cors';
import authRoutes from './routes/auth.routes.js';

import eventRoutes from './routes/event.routes.js';
import shopRoutes from './routes/shop.routes.js';
import profileRoutes from './routes/profile.routes.js';

import { requestLogger } from './middlewares/logger.middleware.js';

const app: Application = express();
const PORT = process.env.PORT || 3000;

// Мидлвары
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:3000'],
  credentials: true
}));
app.use(express.json());
app.use(requestLogger);

app.use('/auth', authRoutes);

app.use('/events', eventRoutes);
app.use('/shop', shopRoutes);
app.use('/profile', profileRoutes);


app.get('/', (req: Request, res: Response) => {
  res.status(200).json({ message: 'Shnele Pepe Fa Fatafa' });
});

app.listen(PORT, () => {
  console.log(`[[INFO]]: Server is running at http://localhost:${PORT}`);
});