import axios from 'axios';
import { oauthConfig } from '../config/oauth.js';

export const getAccessToken = async (code: string) => {
  const params = new URLSearchParams();
  params.append('client_id', oauthConfig.clientId as string);
  params.append('client_secret', oauthConfig.clientSecret as string);
  params.append('grant_type', 'authorization_code');
  params.append('code', code);
  params.append('redirect_uri', oauthConfig.redirectUri);

  const response = await axios.post(oauthConfig.tokenEndpoint, params);
  
  return response.data;
};

export const getUserInfo = async (accessToken: string) => {
  try {
    const response = await axios.get(oauthConfig.getUserInfoEndpoint, {
      params: {
        apiKey: "siblions-app",
        access_token: accessToken
      },

      headers: {
        'apiKey': "siblions-app",
        'Authorization': `Bearer ${accessToken}`,
        'access_token': accessToken
      }
    });

    return response.data;
  } catch (error: any) {
    console.log('--- DEBUG INFO ---');
    console.log('URL:', error.config?.url);
    console.log('Server Response Data:', error.response?.data); 
    throw error;
  }
};