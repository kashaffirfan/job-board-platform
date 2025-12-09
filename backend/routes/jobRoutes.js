const express = require('express');
const router = express.Router();
const { createJob, getJobs, deleteJob } = require('../controllers/jobController');
const { protect } = require('../middleware/authMiddleware');

router.route('/')
  .get(getJobs)               
  .post(protect, createJob);  

router.route('/:id')
  .delete(protect, deleteJob); 

module.exports = router;