import { Router } from 'express';
import { 
  initiateOAuth, 
  handleOAuthCallback, 
  getIntegrations, 
  deleteIntegration, 
  getIntegrationTokens 
} from '../controllers/oauthController';
import { authenticateToken } from '../middleware/auth';

const router = Router();

// Protected routes (require authentication)
router.get('/integrations', authenticateToken, getIntegrations);
router.post('/oauth/initiate/:provider', authenticateToken, initiateOAuth);
router.delete('/integrations/:provider', authenticateToken, deleteIntegration);
router.get('/integrations/:provider/tokens', authenticateToken, getIntegrationTokens);

// Public callback routes (OAuth providers redirect here)
router.get('/oauth/callback/:provider', handleOAuthCallback);

export default router;