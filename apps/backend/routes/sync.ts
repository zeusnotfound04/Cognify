import { Router } from 'express';
import { authenticateToken } from '../middleware/auth';
import { dataSyncController } from '../controllers/dataSyncController';

const router = Router();

router.post('/slack', authenticateToken, dataSyncController.syncSlackData.bind(dataSyncController));

router.post('/notion', authenticateToken, dataSyncController.syncNotionData.bind(dataSyncController));

router.get('/status', authenticateToken, dataSyncController.getSyncStatus.bind(dataSyncController));

export default router;