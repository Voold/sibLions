import express from 'express';
import type { Application, Request, Response } from 'express';
import dotenv from 'dotenv';
import path from 'path';
import cors from 'cors';
import authRoutes from './routes/auth.routes.js';

// dotenv loads .env from the project root by default.  
// In this repo the file lives in `src/config/.env`, so we
// pass the explicit path (relative to cwd) or move the file
// up one level if you prefer the default behaviour.
dotenv.config({ path: path.resolve(process.cwd(), 'src', 'config', '.env') });

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
  console.log(`🚀 Server is running at http://localhost:${PORT}`);
});