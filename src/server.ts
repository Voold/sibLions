import './config/dotenv.config.js';
import express from 'express';
import type { Application, Request, Response } from 'express';
import cors from 'cors';
import authRoutes from './routes/auth.routes.js';

const app: Application = express();
const PORT = process.env.PORT || 3000;

// Мидлвары
app.use(cors());
app.use(express.json());

app.use('/auth', authRoutes);

// Тестовый роут
app.get('/ping', (req: Request, res: Response) => {
  res.status(200).json({ message: 'pong' });
});

app.get('/', (req: Request, res: Response) => {
  res.status(200).json({ message: 'Shnele Pepe Fa Fatafa' });
});

app.listen(PORT, () => {
  console.log(`[[INFO]]: Server is running at http://localhost:${PORT}`);
});