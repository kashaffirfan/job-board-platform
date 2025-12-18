import { Response } from 'express';
import Application from '../models/Application';
import Job, { IJob } from '../models/Job';
import Notification from '../models/Notification'; 
import { AuthRequest } from '../middleware/authMiddleware';

// 1. Create Application (Handles Resume Upload + Notification)
export const createApplication = async (req: AuthRequest, res: Response) => {
  try {
    const { jobId, coverLetter } = req.body;
    
    // Check if file exists (Resume)
    let resumePath = "";
    if (req.file) {
        resumePath = `/uploads/${req.file.filename}`;
    }

    // Check existing application
    const existingApp = await Application.findOne({ 
        job: jobId, 
        freelancer: req.user?._id 
    });
    
    if (existingApp) {
        return res.status(400).json({ message: 'You have already applied to this job' });
    }

    const application = await Application.create({
      job: jobId,
      freelancer: req.user?._id,
      coverLetter,
      resume: resumePath,
      status: 'pending'
    });

    // --- NOTIFICATION LOGIC (Notify Client) ---
    const job = await Job.findById(jobId);
    if (job) {
        await Notification.create({
            recipient: job.client, // Notify the Client
            sender: req.user?._id, // From Freelancer
            type: 'application_received',
            message: `${req.user?.name} applied for: ${job.title}`,
            link: `/applications/${job._id}`,
            read: false
        });
    }
    // ------------------------------------------

    res.status(201).json(application);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// 2. Get Applications for a Job (Client View)
export const getApplicationsForJob = async (req: AuthRequest, res: Response) => {
  try {
    const job = await Job.findById(req.params.jobId);
    
    if (!job) return res.status(404).json({ message: 'Job not found' });
    
    // Authorization Check
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

// 3. Update Status (Accept/Reject)
export const updateApplicationStatus = async (req: AuthRequest, res: Response) => {
  try {
    const { status } = req.body; 
    const application = await Application.findById(req.params.id).populate('job');

    if (!application) return res.status(404).json({ message: 'Application not found' });

    const job = application.job as unknown as IJob;

    if (!req.user || job.client.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    application.status = status;
    await application.save();

    // --- NOTIFICATION LOGIC (Notify Freelancer) ---
    if (status === 'accepted' || status === 'rejected') {
        await Notification.create({
            recipient: application.freelancer, // Notify Freelancer
            sender: req.user._id,              // From Client
            type: `application_${status}`,
            message: `Your application for ${job.title} was ${status}`,
            link: `/my-applications`,
            read: false
        });
    }
    // ----------------------------------------------

    return res.json({ message: `Application ${status}`, application });
  } catch (error: any) {
    return res.status(500).json({ message: error.message });
  }
};

// 4. Get My Applications (Freelancer View)
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