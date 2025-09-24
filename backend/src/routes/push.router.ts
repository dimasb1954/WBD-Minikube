import {Router} from 'express';
import pushController from '../controller/push.controller';
import {authenticateToken} from "../middleware/auth.middleware";

const router = Router();

router.post('/subscribe', authenticateToken, pushController.saveSubscription);
router.post('/check', authenticateToken, pushController.checkNotificationRegistered);

export default router;