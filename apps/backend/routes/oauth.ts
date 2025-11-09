import { Router } from 'express';
import { 
  initiateOAuth, 
  handleOAuthCallback, 
  getIntegrations, 
  deleteIntegration, 
  getIntegrationTokens,
  refreshOAuthTokens,
  testGoogleAccess
} from '../controllers/oauthController';
import {
  getOAuthApiKeys,
  createOAuthApiKey,
  updateOAuthApiKey,
  deleteOAuthApiKey,
  checkProviderReadiness,
  getReadyProviders
} from '../controllers/oauthApiKeyController';
import { authenticateToken } from '../middleware/auth';

const router = Router();

// Protected routes (require authentication)
router.get('/integrations', authenticateToken, getIntegrations);
router.post('/oauth/initiate/:provider', authenticateToken, initiateOAuth);
router.delete('/integrations/:provider', authenticateToken, deleteIntegration);
router.get('/integrations/:provider/tokens', authenticateToken, getIntegrationTokens);
router.post('/integrations/:provider/refresh', authenticateToken, refreshOAuthTokens);
router.get('/integrations/google/test', authenticateToken, testGoogleAccess);

// OAuth API Key Management Routes
router.get('/oauth/api-keys', authenticateToken, getOAuthApiKeys);
router.post('/oauth/api-keys', authenticateToken, createOAuthApiKey);
router.put('/oauth/api-keys/:provider/:keyType', authenticateToken, updateOAuthApiKey);
router.delete('/oauth/api-keys/:provider/:keyType', authenticateToken, deleteOAuthApiKey);
router.get('/oauth/api-keys/:provider/ready', authenticateToken, checkProviderReadiness);
router.get('/oauth/ready-providers', authenticateToken, getReadyProviders);

// Public callback routes (OAuth providers redirect here)
router.get('/oauth/callback/:provider', handleOAuthCallback);

export default router;