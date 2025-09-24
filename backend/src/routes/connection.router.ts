import { Router } from 'express';
import connectionController from '../controller/connection.controller';
import { authenticateToken } from '../middleware/auth.middleware';

const router = Router();

router.get('/', connectionController.getAllUsers);
router.get('/network', authenticateToken, connectionController.getUserNetwork);
router.get('/connections', authenticateToken, connectionController.getConnectedUsers);
router.get('/connections/:id', connectionController.getConnectedUsersIdParam);
router.get('/requests', authenticateToken, connectionController.getRequestedUsers);
router.put('/connections/:id', authenticateToken, connectionController.insertConnection);
router.delete('/requests', authenticateToken, connectionController.ignoreRequest);
router.post('/requests/:id', authenticateToken, connectionController.newRequest);
router.delete('/requests/:id', authenticateToken, connectionController.cancelRequest);
router.delete('/connections/:id', authenticateToken, connectionController.deleteConnectionFromProfile);
router.get('/recommendation', authenticateToken, connectionController.getRecomendation);

export default router;