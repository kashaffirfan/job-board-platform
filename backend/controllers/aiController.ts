import { Response } from 'express';
import { AuthRequest } from '../middleware/authMiddleware';
import { GoogleGenerativeAI } from '@google/generative-ai';
import Job from '../models/Job';
import User from '../models/User';

// ⚠️ PASTE YOUR KEY HERE. 
// It must be one long string. It should NOT have "..." in the middle.
const MY_KEY = process.env.GEMINI_API_KEY as string; // <--- REPLACE THIS with your full key

// 👇 DEBUG: This will print the key to your terminal when you save
console.log("------------------------------------------------");
console.log("DEBUG CHECK: The key being used is:", MY_KEY);
console.log("------------------------------------------------");

const genAI = new GoogleGenerativeAI(MY_KEY);

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
      Write a professional cover letter for a freelancer applying to a job.
      JOB: ${job.title} - ${job.description}
      FREELANCER: ${freelancer.name} - Skills: ${freelancer.skills?.join(', ')}
      Keep it under 200 words.
    `;

    // 3. Call Gemini API
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    res.json({ coverLetter: text });

  } catch (error: any) {
    console.error("AI Error:", error.message); // Print the real error
    res.status(500).json({ message: "Failed to generate cover letter" });
  }
};
