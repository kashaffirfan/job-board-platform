import express from 'express';
import { registerUser, loginUser, updateProfile } from '../controllers/authController';
import { protect } from '../middleware/authMiddleware';
import { upload } from '../middleware/uploadMiddleware';

const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);
router.put('/profile', protect, upload.single('profilePicture'), updateProfile);

export default router;