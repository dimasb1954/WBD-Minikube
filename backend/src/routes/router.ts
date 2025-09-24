import { Router } from 'express';
import seed from "./seed.router";
import profile from "./profile.router";
import feed from "./feed.router";
import connection from "./connection.router"
import messaging from "./messaging.router"
import push from "./push.router"
import authController from "../controller/auth.controller";
import {checkTokenLoginRegister} from "../middleware/auth.middleware";

const router = Router();

// First endpoint. Check only
router.get('/', (req, res) => {
    res.status(200).json({
        success: true,
        message: 'Welcome to LinkInPurry API',
        body: {
            accessedAt: new Date().toISOString()
        }
    });
});

// Router for seeding the database. ONLY call once when first time running the docker-compose
router.use('/seed', seed);

// Router for profile
router.use('/profile', profile);

// Router for feed
router.use('/feed', feed);

// Router for connection
router.use('/users', connection);

// Router for messaging
router.use('/messaging', messaging);

// Auth
router.post('/login', checkTokenLoginRegister, authController.login);
router.post('/register', checkTokenLoginRegister, authController.register);

// Router for push notification
router.use('/push', push);
// router.post('/subscribe', authenticateToken, pushController.saveSubscription);
// router.get('/push', authenticateToken, pushController.sendNotification);
export default router;