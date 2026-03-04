import dotenv from 'dotenv';
import { get } from 'http';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), 'src', 'config', '.env') });

export const oauthConfig = {
  clientId: process.env.OAUTH_CLIENT_ID,
  clientSecret: process.env.OAUTH_CLIENT_SECRET,
  redirectUri: 'https://songeng.voold.online/api/auth/callback',
  authEndpoint: 'https://oauth.tpu.ru/authorize',
  tokenEndpoint: 'https://oauth.tpu.ru/access_token',
  getUserInfoEndpoint: 'https://oauth.tpu.ru/user',
};