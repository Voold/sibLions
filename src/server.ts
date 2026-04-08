import "./config/dotenv.config.js";
import express from "express";
import type { Application, Request, Response } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import authRoutes from "./routes/auth.routes.js";

import eventRoutes from "./routes/event.routes.js";
import userRoutes from "./routes/user.routes.js";
import shopRoutes from "./routes/shop.routes.js";
import profileRoutes from "./routes/profile.routes.js";

import { authenticateToken } from "./middlewares/auth.middleware.js";
import { requestLogger } from "./middlewares/logger.middleware.js";

const app: Application = express();
const PORT = process.env.PORT || 3000;

// Мидлвары
app.use(
  cors({
    origin: "https://localhost:5173",
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "apiKey"],
  }),
);
app.use(express.json());
app.use(cookieParser());
app.use(requestLogger);

app.use("/auth", authRoutes);

app.use("/events", eventRoutes);
app.use("/shop", authenticateToken, shopRoutes);
app.use("/profile", authenticateToken, profileRoutes);
app.use("/users", authenticateToken, userRoutes);

app.get("/", (req: Request, res: Response) => {
  res.status(200).json({ message: "Shnele Pepe Fa Fatafa" });
});

app.listen(PORT, () => {
  console.log(`[[INFO]]: Server is running at http://localhost:${PORT}`);
});
