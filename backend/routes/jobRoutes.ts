import express from 'express';
import { 
  createJob, 
  getJobs, 
  getJobById, 
  updateJob, 
  deleteJob, 
  getMyJobs 
} from '../controllers/jobController';
import { protect } from '../middleware/authMiddleware';

const router = express.Router();

// 1. General Routes
router.route('/').get(getJobs).post(protect, createJob);

// 2. SPECIFIC Routes (MUST be before /:id)
router.get('/myjobs', protect, getMyJobs); 

// 3. Dynamic Routes
router.route('/:id')
  .get(getJobById)
  .put(protect, updateJob)
  .delete(protect, deleteJob);

export default router;