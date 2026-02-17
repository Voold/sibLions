import express from 'express';
import type { Application, Request, Response } from 'express';
import dotenv from 'dotenv';
import cors from 'cors';

dotenv.config();

const app: Application = express();
const PORT = process.env.PORT || 3000;

// Мидлвары
app.use(cors());
app.use(express.json());

// Тестовый роут
app.get('/ping', (req: Request, res: Response) => {
  res.status(200).json({ message: 'pong' });
});

app.listen(PORT, () => {
  console.log(`🚀 Server is running at http://localhost:${PORT}`);
});