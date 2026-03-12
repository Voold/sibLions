import type { Request, Response } from 'express';
import type { TpuTokenResponse } from '../types/auth.types.js';
import * as authService from '../services/auth.service.js';
import jwt from 'jsonwebtoken';

export const login = async (req: Request, res: Response) => {
  try {
    const { code, codeVerifier } = req.body;

    if (!code || !codeVerifier) {
      return res.status(400).json({ error: 'Code and CodeVerifier are required' });
    }

    const tpuTokens: TpuTokenResponse = await authService.exchangeCodeForToken(code, codeVerifier);

    //ANCHOR - WRONG TYPE (to replace with correct one)
    const userInfo = await authService.getFullUserInfo(tpuTokens.token_type, tpuTokens.access_token);
    
    //ANCHOR - достать ID студента, найти или создать его в своей базе.

    const appToken = jwt.sign(
      { userId: userInfo.userInfo.user_id}, 
      process.env.JWT_SECRET!, 
      { expiresIn: '24h' }
    );

    res.cookie('app_token', appToken, {
      httpOnly: true,    // Защита от XSS (JS не прочитает)
      secure: process.env.NODE_ENV === 'production', // Только через HTTPS в продакшене
      sameSite: 'lax',   // Защита от CSRF
      maxAge: 24 * 60 * 60 * 1000 // 24 часа в миллисекундах
    });

    res.json({ 
      JWTToken: appToken, 
      tpuData: tpuTokens, 
      userInfo 
    });

  } catch (error: any) {
    console.error('Login error:', error.response?.data || error.message);
    res.status(401).json({ message: 'Authentication failed' });
  }
};
