import type { Request, Response } from 'express';

import crypto from 'crypto';
import * as authService from '../services/auth.service.js';
import * as userService from '../services/user.service.js';
import dataLogger from '../utils/rawDataLogger.js';

export const login = async (req: Request, res: Response) => {
  try {
    const { code, codeVerifier } = req.body;

    if (!code || !codeVerifier) {
      return res.status(400).json({ error: 'Code and codeVerifier are required' });
    }

    const tpuTokens = await authService.exchangeCodeForToken(code, codeVerifier);

    const rawTpuData = await authService.getFullUserInfoFromTpu(
      tpuTokens.token_type, 
      tpuTokens.access_token
    );

    dataLogger(rawTpuData);

    const newUserStruct = authService.transformTpuToNewUser(rawTpuData);
    
    const user = await userService.getOrCreateUser(newUserStruct);

    if (user === null) {throw new Error('Auth Error: User undefined')};

    const accessToken = authService.generateJWT(user, 3600); // 1 час

    const refreshToken = authService.generateRefresh();

    const tokenHash = authService.getTokenHash(refreshToken);

    await authService.createSession({
      userId: user.id,
      tokenHash: tokenHash,
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 дней
    });

    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax' as const,
    };

    res.cookie('app_token', accessToken, { 
      ...cookieOptions, 
      maxAge: 60 * 60 * 1000 // 15 мин 
    });

    res.cookie('refresh_token', refreshToken, { 
      ...cookieOptions, 
      maxAge: 30 * 24 * 60 * 60 * 1000 // 30 дней 
    });

    res.status(200).json({ 
      message: 'Successfully authenticated',
      user
    });

  } catch (error: any) {
    console.error('[AUTH CONTROLLER ERROR]:', error.response?.data || error.message);

    const status = error.response?.status || 401;
    res.status(status).json({ 
      message: 'Authentication failed',
      details: error.response?.data?.error_description || error.message 
    });
  }
};


export const refresh = async (req: Request, res: Response) => {
  try {
    const { refresh_token } = req.cookies;

    if (!refresh_token) {
      return res.status(401).json({ message: 'Refresh token missing' });
    }

    const { accessToken, newRefreshToken, user } = await authService.refreshSession(refresh_token);

    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax' as const,
    };

    res.cookie('app_token', accessToken, { ...cookieOptions, maxAge: 15 * 60 * 1000 });
    res.cookie('refresh_token', newRefreshToken, { ...cookieOptions, maxAge: 30 * 24 * 60 * 60 * 1000 });

    res.status(200).json({ user });
  } catch (error: any) {
    console.error('[REFRESH ERROR]:', error.message);
    res.status(401).json({ message: 'Session expired or invalid' });
  }
};