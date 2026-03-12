import axios from 'axios';
import { getOauthConfig } from '../config/oauth.js';
import type { TpuTokenResponse } from '../types/auth.types.js';

export const getAccessToken = async (code: string) => {
  const params = new URLSearchParams();
  params.append('client_id', getOauthConfig.clientId as string);
  params.append('client_secret', getOauthConfig.clientSecret as string);
  params.append('grant_type', 'authorization_code');
  params.append('code', code);
  params.append('redirect_uri', getOauthConfig.redirectUri);

  const response = await axios.post(getOauthConfig.tokenEndpoint, params);
  
  return response.data;
};

export const exchangeCodeForToken = async (code: string, codeVerifier: string): Promise<TpuTokenResponse> => {
  const params = new URLSearchParams({
    grant_type: 'authorization_code',
    client_id: getOauthConfig.clientId!,
    client_secret: getOauthConfig.clientSecret!,
    code: code,
    redirect_uri: getOauthConfig.redirectUri,
    code_verifier: codeVerifier,
  });

  const response = await axios.post(getOauthConfig.tokenEndpoint, params.toString(), {
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
  });

  return response.data;
};

export const getFullUserInfo = async (tokenType: string, accessToken: string) => {
  try {
    const [userInfoResponse, studyInfoResponse, infoResponse] = await Promise.all([

      axios.get(getOauthConfig.getUserInfoEndpoint, {
        headers: {
          'apiKey': `${getOauthConfig.clientId}`,
          'Authorization': `${tokenType} ${accessToken}`,
        }
      }),

      axios.get(getOauthConfig.getUserStudyInfoEndpoint, {
        headers: {
          'apiKey': `920c27de-62ec-4f2a-95fa-ee833ff9f565`,
          'Authorization': `${tokenType} ${accessToken}`,
        }
      }),

      axios.get(getOauthConfig.getUserInfoEndpoint, {
        headers: {
          'apiKey': `920c27de-62ec-4f2a-95fa-ee833ff9f565`,
          'Authorization': `${tokenType} ${accessToken}`,
        }
      })
    ]);

    return {
      userInfo: userInfoResponse.data,
      studyInfo: studyInfoResponse.data,
      infoResponse,
      studyInfoResponse,
      userInfoResponse,
    };

  } catch (error: any) {
    console.error('--- ERROR GETTING FULL USER INFO ---');
    console.error('URL failed:', error.config?.url);
    console.error('Server Response Data:', error.response?.data);
    throw error;
  }
};

export const getUserInfo = async (tokenType: string, accessToken: string) => {
  try {
    const response = await axios.get(getOauthConfig.getUserInfoEndpoint, {
      headers: {
        'apiKey': `${getOauthConfig.clientId}`,
        'Authorization': `${tokenType} ${accessToken}`,
      }
    });

    return response.data;

  } catch (error: any) {
    console.log('--- ERROR GETTING USER INFO ---');
    console.log('URL:', error.config?.url);
    console.log('Server Response Data:', error.response?.data); 
    throw error;
  }
};

export const getUserStudyInfo = async (accessToken: string) => {
  try {
    const response = await axios.get(getOauthConfig.getUserStudyInfoEndpoint, {
      headers: {
        'apiKey': `920c27de-62ec-4f2a-95fa-ee833ff9f565`,
        'Authorization': `Bearer ${accessToken}`,
      }
    });

    return response.data;

  } catch (error: any) {
    console.log('--- ERROR GETTING USER STUDY INFO ---');
    console.log('URL:', error.config?.url);
    console.log('Server Response Data:', error.response?.data); 
    throw error;
  }
}
