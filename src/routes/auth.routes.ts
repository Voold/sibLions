import { Router } from 'express';
import { oauthConfig } from '../config/oauth.js';
import * as authService from '../services/auth.service.js';

const router = Router();

router.get('/login', (req, res) => {
  const url = `${oauthConfig.authEndpoint}?client_id=${oauthConfig.clientId}&redirect_uri=${oauthConfig.redirectUri}&response_type=code&state=bdc1c79ecb83c00122d24a77e06aa5dc16c8280f7541e89a32108659c353f5`;
  res.redirect(url);
});

router.get('/callback', async (req, res) => {
  const { code } = req.query;
  //res.json(code);
  try {
    const data = await authService.getAccessToken(code as string);
    const userInfo = await authService.getUserInfo(data.access_token);
    res.json({ ...data, userInfo });
  } catch (error) {
    res.status(500).json(error);
  }
});

export default router;