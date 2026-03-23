import axios from 'axios';
import { getOauthConfig } from '../config/oauth.js';
import type { TpuTokenResponse } from '../types/auth.types.js';
import type { NewUser } from '../types/user.types.js';

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

export const getFullUserInfoFromTpu = async (tokenType: string, accessToken: string) => {
  const authHeader = `${tokenType} ${accessToken}`;
  
  try {
    const [userRes, studyRes] = await Promise.all([
      tpuApi.get(getOauthConfig.getUserInfoEndpoint, { headers: { Authorization: authHeader } }),
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