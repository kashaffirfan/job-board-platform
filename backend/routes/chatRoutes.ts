import express from 'express';
import { getMessages, getConversations } from '../controllers/chatController';
import { protect } from '../middleware/authMiddleware';

const router = express.Router();

router.get('/conversations', protect, getConversations);
router.get('/:userId', protect, getMessages);

export default router;