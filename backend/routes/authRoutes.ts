import express from 'express';
import { registerUser, loginUser, updateProfile, googleLogin} from '../controllers/authController';
import { protect } from '../middleware/authMiddleware';
import { upload } from '../middleware/uploadMiddleware';

const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/google', googleLogin);
router.put('/profile', protect, upload.single('profilePicture'), updateProfile);

export default router;