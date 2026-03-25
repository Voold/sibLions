import axios from 'axios';
import { getOauthConfig } from '../config/oauth.js';
import type { TpuTokenResponse } from '../types/auth.types.js';
import type { NewUser, User } from '../types/user.types.js';

import jwt from 'jsonwebtoken';

import { eq, and, gt } from 'drizzle-orm';
import { db } from '../db/index.js';
import { sessions, users } from '../db/schema.js';
import crypto from 'crypto';

const tpuApi = axios.create({
  headers: {
    'apiKey': process.env.TPU_API_APP_KEY,
  }
});

const getTokenParams = (code: string, verifier?: string) => {
  const params = new URLSearchParams({
    grant_type: 'authorization_code',
    client_id: getOauthConfig.clientId!,
    client_secret: getOauthConfig.clientSecret!,
    code: code,
    redirect_uri: getOauthConfig.redirectUri,
  });
  if (verifier) params.append('code_verifier', verifier);
  return params;
};

export const exchangeCodeForToken = async (code: string, codeVerifier?: string): Promise<TpuTokenResponse> => {
  const params = getTokenParams(code, codeVerifier);
  const response = await axios.post(getOauthConfig.tokenEndpoint, params.toString(), {
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
  });
  return response.data;
};

export const createSession = async (data: { userId: number; tokenHash: string; expiresAt: Date }) => {
  return await db.insert(sessions).values({
    sessionId: crypto.randomUUID(),
    userId: data.userId,
    tokenHash: data.tokenHash,
    expiresAt: data.expiresAt,
    isRevoked: false,
    issuedAt: new Date()
  });
};

export const generateJWT = (user: User, time: number): string => {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('JWT_SECRET is not defined in environment variables');
  }

  const accessToken = jwt.sign(
    { userId: user.id, role: user.role },
    secret,
    { expiresIn: time }
  );

  return accessToken;
}

export const generateRefresh = (): string => {
  return crypto.randomBytes(40).toString('hex');
}

export const getTokenHash = (token: string): string => {
  return crypto.createHash('sha256').update(token).digest('hex')
}

export const refreshSession = async (oldRefreshToken: string) => {

  const oldHash = crypto.createHash('sha256').update(oldRefreshToken).digest('hex');

  const [session] = await db
    .select()
    .from(sessions)
    .where(
      and(
        eq(sessions.tokenHash, oldHash),
        eq(sessions.isRevoked, false),
        gt(sessions.expiresAt, new Date())
      )
    )
    .limit(1);

  if (!session) {
    throw new Error('Invalid or expired session');
  }

  const [user] = await db.select().from(users).where(eq(users.id, session.userId)).limit(1);
  if (!user) throw new Error('User not found');
 
  const accessToken = generateJWT(user, 3600)
  
  const newRefreshToken = crypto.randomBytes(40).toString('hex');
  const newHash = crypto.createHash('sha256').update(newRefreshToken).digest('hex');

  await db
    .update(sessions)
    .set({
      tokenHash: newHash,
      issuedAt: new Date(),
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    })
    .where(eq(sessions.sessionId, session.sessionId));

  return { accessToken, newRefreshToken, user };
};

export const getFullUserInfoFromTpu = async (tokenType: string, accessToken: string) => {
  const authHeader = `${tokenType} ${accessToken}`;
  
  try {
    const [userRes, studyRes] = await Promise.all([
      tpuApi.get(getOauthConfig.getUserInfoEndpoint, { headers: { Authorization: authHeader } }),
      tpuApi.get(getOauthConfig.getUserInfoFullEndpoint, { headers: { Authorization: authHeader } }),
      tpuApi.get(getOauthConfig.getUserStudyInfoEndpoint, { headers: { Authorization: authHeader } })
    ]);

    return {
      userInfo: userRes.data,
      studyInfo: studyRes.data
    };
  } catch (error: any) {
    console.error('[TPU API ERROR]:', error.response?.data || error.message);
    throw error;
  }
};

export const transformTpuToNewUser = (tpuRawData: any): NewUser => {
  const { userInfo, studyInfo } = tpuRawData;

  const mainStudy = studyInfo.data?.studies?.find((s: any) => s.record_book_number) 
                   || studyInfo.data?.studies?.[0];

  return {
    username: userInfo.login,
    email: userInfo.email,
    firstName: userInfo.first_name,
    lastName: userInfo.last_name,
    middleName: userInfo.patronymic,
    tpuId: String(userInfo.user_id),
    faculty: mainStudy?.department || 'Не указан',
    groupName: mainStudy?.gruppa || 'Не указана',
    course: mainStudy?.admission_year 
      ? (new Date().getFullYear() - mainStudy.admission_year + 1) 
      : null,
    role: 'student',
    currentLevelId: 1,
    totalPoints: 0,
  };
};