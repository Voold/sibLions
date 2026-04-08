export interface TpuTokenResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
  expires_in: number;
}

export interface LoginPayload {
  code: string;
  codeVerifier: string;
}

export interface JwtPayload {
  userId: number;
  role: string;
  iat?: number;
  exp?: number;
}
