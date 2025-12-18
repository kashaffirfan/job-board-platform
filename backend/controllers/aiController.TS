import { Response } from 'express';
import { AuthRequest } from '../middleware/authMiddleware';
import { GoogleGenerativeAI } from '@google/generative-ai';
import Job from '../models/Job';
import User from '../models/User';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY as string);

export const generateCoverLetter = async (req: AuthRequest, res: Response) => {
  try {
    const { jobId } = req.body;
    const userId = req.user?._id;

    // 1. Fetch Job and Freelancer Data
    const job = await Job.findById(jobId);
    const freelancer = await User.findById(userId);

    if (!job || !freelancer) {
      return res.status(404).json({ message: 'Job or User not found' });
    }

    // 2. Construct the Prompt
    const prompt = `
      Write a professional, persuasive, and concise cover letter for a freelancer applying to a job.
      
      JOB DETAILS:
      - Title: ${job.title}
      - Description: ${job.description}
      - Category: ${job.category}
      
      FREELANCER PROFILE:
      - Name: ${freelancer.name}
      - Skills: ${freelancer.skills ? freelancer.skills.join(', ') : 'General Freelancer'}
      - Bio: ${freelancer.bio || 'Hardworking and dedicated professional.'}
      
      INSTRUCTIONS:
      - Keep it under 200 words.
      - Highlight why the freelancer's skills match the job description.
      - Use a professional but enthusiastic tone.
      - Do not include placeholders like "[Your Phone Number]"; assume the platform handles contact info.
    `;

    // 3. Call Gemini API
const model = genAI.getGenerativeModel({ model: "gemini-pro" });
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    res.json({ coverLetter: text });

  } catch (error: any) {
    console.error("AI Error:", error);
    res.status(500).json({ message: "Failed to generate cover letter" });
  }
};