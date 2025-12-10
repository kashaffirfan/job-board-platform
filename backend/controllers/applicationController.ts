import { Response } from 'express';
import Application from '../models/Application';
import Job, { IJob } from '../models/Job';
import { AuthRequest } from '../middleware/authMiddleware';

export const applyForJob = async (req: AuthRequest, res: Response) => {
  try {
    const { jobId, coverLetter } = req.body;

    if (!req.user) return res.status(401).json({ message: 'Not authorized' });

    // 1. Check if user is a freelancer
    if (req.user.role !== 'freelancer') {
      return res.status(403).json({ message: 'Only freelancers can apply' });
    }

    // 2. Check if already applied
    const existingApplication = await Application.findOne({
      job: jobId,
      freelancer: req.user._id
    });
    if (existingApplication) {
      return res.status(400).json({ message: 'You have already applied to this job' });
    }

    // 3. Create Application
    const application = await Application.create({
      job: jobId,
      freelancer: req.user._id,
      coverLetter
    });

    return res.status(201).json(application);
  } catch (error: any) {
    return res.status(500).json({ message: error.message });
  }
};

export const getJobApplications = async (req: AuthRequest, res: Response) => {
  try {
    const job = await Job.findById(req.params.jobId);
    
    if (!job) return res.status(404).json({ message: 'Job not found' });
    
    // Check ownership
    if (!req.user || job.client.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to view these applications' });
    }

    const applications = await Application.find({ job: req.params.jobId })
      .populate('freelancer', 'name email skills experience'); 

    return res.json(applications);
  } catch (error: any) {
    return res.status(500).json({ message: error.message });
  }
};

export const updateApplicationStatus = async (req: AuthRequest, res: Response) => {
  try {
    const { status } = req.body; 
    // Populate job so we can check who the client (owner) is
    const application = await Application.findById(req.params.id).populate('job');

    if (!application) return res.status(404).json({ message: 'Application not found' });

    // In TS, populated fields can be generic objects, we cast it to IJob to access 'client'
    const job = application.job as unknown as IJob;

    if (!req.user || job.client.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    application.status = status;
    await application.save();

    return res.json({ message: `Application ${status}`, application });
  } catch (error: any) {
    return res.status(500).json({ message: error.message });
  }
};

export const getMyApplications = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ message: 'Not authorized' });

    const applications = await Application.find({ freelancer: req.user._id })
      .populate('job', 'title client budget status') 
      .sort({ createdAt: -1 });

    return res.json(applications);
  } catch (error: any) {
    return res.status(500).json({ message: error.message });
  }
};