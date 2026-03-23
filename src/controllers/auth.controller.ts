import type { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import * as authService from '../services/auth.service.js';
import * as userService from '../services/user.service.js';

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

    const newUserStruct = authService.transformTpuToNewUser(rawTpuData);
    
    const user = await userService.getOrCreateUser(newUserStruct);

    if (user === null) {throw new Error('Auth Error: User undefined')};

    const appToken = jwt.sign(
      { userId: user.id, role: user.role }, 
      process.env.JWT_SECRET!, 
      { expiresIn: '24h' }
    );

    res.cookie('app_token', appToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 24 * 60 * 60 * 1000
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