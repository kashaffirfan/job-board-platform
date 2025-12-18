import express from 'express';
import { generateCoverLetter } from '../controllers/aiController';
import { protect } from '../middleware/authMiddleware';

const router = express.Router();

router.post('/generate-cover-letter', protect, generateCoverLetter);

export default router;