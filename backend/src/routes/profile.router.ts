import { Router } from 'express';
import profileController from '../controller/profile.controller';
import { authenticateToken, checkJwtExistProfile } from '../middleware/auth.middleware';
import multer from 'multer';

const router = Router();

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, '../../uploads');
    },
    filename: function (req, file, cb) {
        cb(null, `${Date.now()}-${file.originalname}`);
    }
});

const upload = multer({ storage });

router.get('/:id', checkJwtExistProfile, profileController.getProfile);
router.put('/:id', authenticateToken, upload.single('profilePicture'), profileController.editProfile);

export default router;
