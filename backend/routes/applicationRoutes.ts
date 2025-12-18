import express from 'express';
import { createApplication, getApplicationsForJob, getMyApplications, updateApplicationStatus } from '../controllers/applicationController';
import { protect } from '../middleware/authMiddleware';
import multer from 'multer'; // Import Multer

const router = express.Router();

// Configure Uploads
const storage = multer.diskStorage({
  destination(req, file, cb) {
    cb(null, 'uploads/'); // Save to 'uploads' folder
  },
  filename(req, file, cb) {
    cb(null, `${Date.now()}-${file.originalname}`); // Unique filename
  },
});
const upload = multer({ storage });

router.post('/', protect, upload.single('resume'), createApplication);

router.get('/job/:jobId', protect, getApplicationsForJob);
router.get('/my-applications', protect, getMyApplications);
router.put('/:id/status', protect, updateApplicationStatus);

export default router;