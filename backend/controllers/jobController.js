const Job = require('../models/Job');

exports.createJob = async (req, res) => {
  try {
    if (req.user.role !== 'client') {
      return res.status(403).json({ message: 'Only clients can post jobs' });
    }

    const { title, description, category, budget, deadline, city } = req.body;

    const job = await Job.create({
      client: req.user.id, 
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

exports.getJobs = async (req, res) => {
  try {
    const { category, search } = req.query;
    let query = {};

    if (category) {
      query.category = category;
    }

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    const jobs = await Job.find(query)
      .populate('client', 'name')
      .sort({ createdAt: -1 }); 

    res.json(jobs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.deleteJob = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);

    if (!job) {
      return res.status(404).json({ message: "Job not found" });
    }
    if (job.client.toString() !== req.user.id) {
      return res.status(401).json({ message: "Not authorized to delete this job" });
    }
    await job.deleteOne();

    res.json({ message: "Job removed" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
