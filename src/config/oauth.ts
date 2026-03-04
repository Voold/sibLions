
export const getOauthConfig = {
  clientId: process.env.OAUTH_CLIENT_ID,
  clientSecret: process.env.OAUTH_CLIENT_SECRET,

  redirectUri: `${process.env.OAUTH_REDIRECT_URI}`,
  authEndpoint: `${process.env.OAUTH_BASE_URL}${process.env.OAUTH_AUTH_ENDPOINT}`,
  tokenEndpoint: `${process.env.OAUTH_BASE_URL}${process.env.OAUTH_TOKEN_ENDPOINT}`,
  getUserInfoEndpoint: `${process.env.OAUTH_BASE_URL}${process.env.OAUTH_USER_INFO_ENDPOINT}`,
  getUserStudyInfoEndpoint: `${process.env.TPU_API_BASE_URL}${process.env.TPU_API_USER_STUDY_INFO}`,
};

