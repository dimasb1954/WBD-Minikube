import {Router} from 'express';
import messagingController from '../controller/messaging.controller';
import {authenticateToken} from '../middleware/auth.middleware';

const router = Router();

router.get('', authenticateToken, messagingController.getChatExists);
router.get('/:id', authenticateToken, messagingController.getMessage);
router.post('/:id', authenticateToken, messagingController.postMessage);

export default router;