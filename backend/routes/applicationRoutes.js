const express = require('express');
const router = express.Router();
const { applyForJob, getJobApplications, updateApplicationStatus, getMyApplications } = require('../controllers/applicationController');
const { protect } = require('../middleware/authMiddleware');

router.post('/', protect, applyForJob);
router.get('/job/:jobId', protect, getJobApplications);
router.put('/:id/status', protect, updateApplicationStatus);
router.get('/my-applications', protect, getMyApplications);

module.exports = router;