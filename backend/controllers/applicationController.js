const Application = require('../models/Application');
const Job = require('../models/Job');

// @desc    Apply for a job
// @route   POST /api/applications
// @access  Private (Freelancer only)
exports.applyForJob = async (req, res) => {
  try {
    const { jobId, coverLetter } = req.body;

    // 1. Check if user is a freelancer
    if (req.user.role !== 'freelancer') {
      return res.status(403).json({ message: 'Only freelancers can apply' });
    }

    // 2. Check if already applied (FR-15)
    const existingApplication = await Application.findOne({
      job: jobId,
      freelancer: req.user.id
    });
    if (existingApplication) {
      return res.status(400).json({ message: 'You have already applied to this job' });
    }

    // 3. Create Application
    const application = await Application.create({
      job: jobId,
      freelancer: req.user.id,
      coverLetter
    });

    res.status(201).json(application);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get applications for a specific job
// @route   GET /api/applications/job/:jobId
// @access  Private (Client - Job Owner only)
exports.getJobApplications = async (req, res) => {
  try {
    const job = await Job.findById(req.params.jobId);
    
    // Check if job exists and if user owns it
    if (!job) return res.status(404).json({ message: 'Job not found' });
    if (job.client.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to view these applications' });
    }

    const applications = await Application.find({ job: req.params.jobId })
      .populate('freelancer', 'name email skills experience'); // Populate freelancer details

    res.json(applications);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update application status (Accept/Reject)
// @route   PUT /api/applications/:id/status
// @access  Private (Client - Job Owner only)
exports.updateApplicationStatus = async (req, res) => {
  try {
    const { status } = req.body; // 'accepted' or 'rejected'
    const application = await Application.findById(req.params.id).populate('job');

    if (!application) return res.status(404).json({ message: 'Application not found' });

    // Verify ownership via the associated job
    if (application.job.client.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    application.status = status;
    await application.save();

    res.json({ message: `Application ${status}`, application });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};