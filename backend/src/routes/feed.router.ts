import { Router } from 'express';
import feedController from '../controller/feed.controller';
import {authenticateToken} from '../middleware/auth.middleware';


const router = Router();

router.get('/', authenticateToken, feedController.getAllFeedContent);
router.post('/', authenticateToken, feedController.addFeed)
router.get('/:id', feedController.getFeedContent);
router.put('/:id', feedController.updateFeedContent);
router.delete('/:id', authenticateToken, feedController.deleteFeed);
router.get('/post/:id', feedController.getFeedText);

export default router;