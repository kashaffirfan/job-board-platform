import { Response } from 'express';
import Job from '../models/Job';
import { AuthRequest } from '../middleware/authMiddleware';

// Create Job
export const createJob = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user || req.user.role !== 'client') {
      return res.status(403).json({ message: 'Only clients can post jobs' });
    }

    const { title, description, category, budget, deadline, city } = req.body;

    const job = await Job.create({
      client: req.user._id,
      title,
      description,
      category,
      budget,
      deadline,
      city
    });

    return res.status(201).json(job);
  } catch (error: any) {
    return res.status(500).json({ message: error.message });
  }
};

// Get Jobs (Now with Filtering!)
export const getJobs = async (req: AuthRequest, res: Response) => {
  try {
    // 1. Extract query params
    const { category, search, city, minBudget, maxBudget } = req.query;
    let query: any = { status: 'active' }; // Default: only show active jobs

    // 2. Build Filters
    if (category) query.category = category;
    
    // Case-insensitive City search
    if (city) query.city = { $regex: city, $options: 'i' };

    // Budget Range
    if (minBudget || maxBudget) {
        query.budget = {};
        if (minBudget) query.budget.$gte = Number(minBudget);
        if (maxBudget) query.budget.$lte = Number(maxBudget);
    }

    // Keyword Search (Title or Description)
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    const jobs = await Job.find(query)
      .populate('client', 'name')
      .sort({ createdAt: -1 }); 

    return res.json(jobs);
  } catch (error: any) {
    return res.status(500).json({ message: error.message });
  }
};

// Update Job (NEW FEATURE)
export const updateJob = async (req: AuthRequest, res: Response) => {
    try {
        const job = await Job.findById(req.params.id);

        if (!job) return res.status(404).json({ message: 'Job not found' });

        // Check ownership
        if (!req.user || job.client.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Not authorized to edit this job' });
        }

        // Update fields
        job.title = req.body.title || job.title;
        job.description = req.body.description || job.description;
        job.category = req.body.category || job.category;
        job.budget = req.body.budget || job.budget;
        job.deadline = req.body.deadline || job.deadline;
        job.city = req.body.city || job.city;

        const updatedJob = await job.save();
        return res.json(updatedJob);

    } catch (error: any) {
        return res.status(500).json({ message: error.message });
    }
};

// Delete Job
export const deleteJob = async (req: AuthRequest, res: Response) => {
  try {
    const job = await Job.findById(req.params.id);

    if (!job) {
      return res.status(404).json({ message: "Job not found" });
    }
    
    if (!req.user || job.client.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: "Not authorized to delete this job" });
    }
    
    await job.deleteOne();

    return res.json({ message: "Job removed" });
  } catch (error: any) {
    return res.status(500).json({ message: error.message });
  }
};