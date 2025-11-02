import { Router } from 'express';
import authRoutes from './auth';
import oauthRoutes from './oauth';
import syncRoutes from './sync';
import apiKeysRoutes from './apiKeys';

const router = Router();

router.use('/auth', authRoutes);
router.use('/oauth', oauthRoutes);
router.use('/sync', syncRoutes);
router.use('/api-keys', apiKeysRoutes);

export default router;