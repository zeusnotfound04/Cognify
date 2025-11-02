import { Router } from 'express';
import { authenticateToken } from '../middleware/auth';
import { getUserApiKey } from '../controllers/apiKeysController';

const router = Router();

// All routes require authentication
router.use(authenticateToken);

// Get the user's MCP API key
router.get('/', getUserApiKey);

export default router;