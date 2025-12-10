import { Response } from 'express';
import Job from '../models/Job';
import { AuthRequest } from '../middleware/authMiddleware'; // Import the custom interface

export const createJob = async (req: AuthRequest, res: Response) => {
  try {
    // We can safely access req.user because of AuthRequest
    if (!req.user || req.user.role !== 'client') {
      return res.status(403).json({ message: 'Only clients can post jobs' });
    }

    const { title, description, category, budget, deadline, city } = req.body;

    const job = await Job.create({
      client: req.user._id, // User ID from the token
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

export const getJobs = async (req: AuthRequest, res: Response) => {
  try {
    const { category, search } = req.query;
    let query: any = {};

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

    return res.json(jobs);
  } catch (error: any) {
    return res.status(500).json({ message: error.message });
  }
};

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