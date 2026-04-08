import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import type { JwtPayload } from "../types/auth.types.js";

const tryDecodeToken = (token: string, secret: string): JwtPayload | null => {
  const decoded = jwt.verify(token, secret);

  if (typeof decoded === "string" || !("userId" in decoded)) {
    return null;
  }

  return decoded as JwtPayload;
};

export const authenticateToken = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const token = req.cookies?.app_token;
  const secret = process.env.JWT_SECRET;

  if (!token) {
    console.warn("[AUTH MIDDLEWARE]: Missing access token", {
      method: req.method,
      path: req.originalUrl,
      ip: req.ip,
    });
    return res
      .status(401)
      .json({ message: "Unauthorized: access token missing" });
  }

  if (!secret) {
    return res.status(500).json({ message: "Server auth is not configured" });
  }

  try {
    const decoded = tryDecodeToken(token, secret);

    if (!decoded) {
      console.warn("[AUTH MIDDLEWARE]: Invalid token payload", {
        method: req.method,
        path: req.originalUrl,
        ip: req.ip,
      });
      return res
        .status(401)
        .json({ message: "Unauthorized: invalid token payload" });
    }

    req.user = decoded;
    next();
  } catch (error) {
    console.warn("[AUTH MIDDLEWARE]: Invalid or expired token", {
      method: req.method,
      path: req.originalUrl,
      ip: req.ip,
      error: error instanceof Error ? error.message : "Unknown error",
    });
    return res
      .status(401)
      .json({ message: "Unauthorized: invalid or expired token" });
  }
};

export const attachUserIfPresent = (
  req: Request,
  _res: Response,
  next: NextFunction,
) => {
  const token = req.cookies?.app_token;
  const secret = process.env.JWT_SECRET;

  if (!token || !secret) {
    return next();
  }

  try {
    const decoded = tryDecodeToken(token, secret);
    if (decoded) {
      req.user = decoded;
    }
  } catch {
    // Optional auth: ignore invalid token and proceed as guest.
  }

  next();
};
