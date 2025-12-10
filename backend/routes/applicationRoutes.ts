import express from 'express';
import { applyForJob, getJobApplications, updateApplicationStatus, getMyApplications } from '../controllers/applicationController';
import { protect } from '../middleware/authMiddleware';

const router = express.Router();

router.post('/', protect, applyForJob);
router.get('/job/:jobId', protect, getJobApplications);
router.put('/:id/status', protect, updateApplicationStatus);
router.get('/my-applications', protect, getMyApplications);

export default router;