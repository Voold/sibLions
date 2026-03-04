import axios from 'axios';
import { getOauthConfig } from '../config/oauth.js';

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

export const getUserInfo = async (accessToken: string) => {
  try {
    const response = await axios.get(getOauthConfig.getUserInfoEndpoint, {
      headers: {
        'apiKey': `${getOauthConfig.clientId}`,
        'Authorization': `Bearer ${accessToken}`,
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
