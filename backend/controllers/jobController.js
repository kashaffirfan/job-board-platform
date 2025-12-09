const Job = require('../models/Job');

// @desc    Post a new job
// @route   POST /api/jobs
// @access  Private (Client only)
exports.createJob = async (req, res) => {
  try {
    // Ensure user is a client (FR-23/FR-8 context)
    if (req.user.role !== 'client') {
      return res.status(403).json({ message: 'Only clients can post jobs' });
    }

    const { title, description, category, budget, deadline, city } = req.body;

    const job = await Job.create({
      client: req.user.id, // Comes from authMiddleware
      title,
      description,
      category,
      budget,
      deadline,
      city
    });

    res.status(201).json(job);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all jobs (with filters)
// @route   GET /api/jobs
// @access  Public (or Private based on preference)
exports.getJobs = async (req, res) => {
  try {
    const { keyword, category, city, minBudget } = req.query;
    let query = { status: 'active' };

    // Search by Keyword (FR-11)
    if (keyword) {
      query.title = { $regex: keyword, $options: 'i' };
    }

    // Filter by Category or City (FR-12)
    if (category) query.category = category;
    if (city) query.city = city;
    if (minBudget) query.budget = { $gte: minBudget };

    const jobs = await Job.find(query).populate('client', 'name companyName');
    res.json(jobs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete a job
// @route   DELETE /api/jobs/:id
// @access  Private (Owner only)
exports.deleteJob = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);

    if (!job) return res.status(404).json({ message: 'Job not found' });

    // Check ownership
    if (job.client.toString() !== req.user.id) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    await job.deleteOne();
    res.json({ message: 'Job removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};