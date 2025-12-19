import { Request, Response } from 'express';
import { AuthRequest } from '../middleware/authMiddleware';
import { GoogleGenerativeAI } from '@google/generative-ai';
import Job from '../models/Job';
import User from '../models/User';

// const MY_KEY = process.env.GEMINI_API_KEY as string; 

// console.log("------------------------------------------------");
// console.log("DEBUG CHECK: The key being used is:", MY_KEY);
// console.log("------------------------------------------------");

// const genAI = new GoogleGenerativeAI(MY_KEY);

export const generateCoverLetter = async (req: AuthRequest, res: Response) => {
  try {
    const { jobId } = req.body;
    const userId = req.user?._id;

    // 1. Fetch Data
    const job = await Job.findById(jobId);
    const freelancer = await User.findById(userId);

    if (!job || !freelancer) {
      return res.status(404).json({ message: 'Job or User not found' });
    }

    // 2. ✅ FIX: Initialize AI HERE (Lazy Loading)
    // This ensures we use the key that is now fully loaded
    const apiKey = process.env.GEMINI_API_KEY as string;
    
    if (!apiKey) {
        console.error("❌ CRITICAL: GEMINI_API_KEY is missing inside function scope.");
        return res.status(500).json({ message: "Server API Key configuration error" });
    }

    const genAI = new GoogleGenerativeAI(apiKey);

    // 3. Use the correct model name
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const prompt = `
      Write a professional cover letter for a freelancer applying to a job.
      JOB: ${job.title} - ${job.description}
      FREELANCER: ${freelancer.name} - Skills: ${freelancer.skills?.join(', ')}
      Keep it under 200 words.
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    res.json({ coverLetter: text });

  } catch (error: any) {
    console.error("❌ AI Error:", error);
    res.status(500).json({ 
        message: "Failed to generate cover letter",
        details: error.message 
    });
  }
};