import express from 'express';
import { createJob, getJobs, deleteJob, updateJob } from '../controllers/jobController';
import { protect } from '../middleware/authMiddleware';

const router = express.Router();

router.route('/')
  .get(getJobs)               
  .post(protect, createJob);  

router.route('/:id')
  .put(protect, updateJob)    
  .delete(protect, deleteJob); 

export default router;