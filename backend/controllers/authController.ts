import { Request, Response } from 'express';
import User from '../models/User';
import bcrypt from 'bcryptjs'; 
import jwt from 'jsonwebtoken';
import { AuthRequest } from '../middleware/authMiddleware';
import { OAuth2Client } from 'google-auth-library'; 

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID); 

export const googleLogin = async (req: Request, res: Response) => {
  try {
    const { token } = req.body;

    // 1. Verify the token with Google
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    
    const payload = ticket.getPayload();
    if (!payload) return res.status(400).json({ message: "Invalid Google Token" });

    const { email, name, picture } = payload;

    // 2. Check if user already exists
    let user = await User.findOne({ email });

    if (user) {
      // User exists -> Log them in
      const secret = process.env.JWT_SECRET as string;
      const appToken = jwt.sign({ id: user._id, role: user.role }, secret, { expiresIn: '1d' });

      return res.json({
        token: appToken,
        user: {
          id: user._id,
          name: user.name,
          role: user.role,
          email: user.email,
          profilePicture: user.profilePicture || picture // Use Google photo if available
        }
      });
    } else {
      // 3. User doesn't exist -> Create new account
      // We generate a random password because they are using Google
      const randomPassword = Math.random().toString(36).slice(-8) + Math.random().toString(36).slice(-8);
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(randomPassword, salt);

      user = await User.create({
        name,
        email,
        password: hashedPassword,
        role: "freelancer", // Default role, they can change it later in profile
        profilePicture: picture
      });

      const secret = process.env.JWT_SECRET as string;
      const appToken = jwt.sign({ id: user._id, role: user.role }, secret, { expiresIn: '1d' });

      return res.status(201).json({
        token: appToken,
        user: {
          id: user._id,
          name: user.name,
          role: user.role,
          email: user.email,
          profilePicture: user.profilePicture
        }
      });
    }

  } catch (error: any) {
    console.error(error);
    return res.status(500).json({ message: "Google Login Failed" });
  }
};

// Register User
export const registerUser = async (req: Request, res: Response) => {
  try {
    const { name, email, password, role, city, skills, companyName } = req.body;

    // Check existing user
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Hash Password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create User
    await User.create({
      name,
      email,
      password: hashedPassword,
      role,
      city,
      skills: role === 'freelancer' ? skills : undefined,
      companyName: role === 'client' ? companyName : undefined
    });

    return res.status(201).json({ message: 'User registered successfully' });
  } catch (error: any) {
    return res.status(500).json({ message: error.message });
  }
};

// Login User
export const loginUser = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    // Check email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Generate JWT
    const secret = process.env.JWT_SECRET as string;
    const token = jwt.sign({ id: user._id, role: user.role }, secret, {
      expiresIn: '1d',
    });

    return res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        role: user.role,
        email: user.email,
        skills: user.skills, 
        bio: user.bio,
        city: user.city
      }
    });
  } catch (error: any) {
    return res.status(500).json({ message: error.message });
  }
};

export const updateProfile = async (req: AuthRequest, res: Response) => {
  try {
    const user = await User.findById(req.user?._id);

    if (user) {
      user.name = req.body.name || user.name;
      user.email = req.body.email || user.email;

      // 1. Handle Image Upload
      if (req.file) {
        user.profilePicture = `/uploads/${req.file.filename}`;
      }

      if (req.body.password) {
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(req.body.password, salt);
      }
      
      // 2. Freelancer Logic
      if (user.role === 'freelancer') {
        user.bio = req.body.bio || user.bio;
        user.portfolio = req.body.portfolio || user.portfolio;
        // Handle skills array vs string
        if (req.body.skills) {
            user.skills = Array.isArray(req.body.skills) 
              ? req.body.skills 
              : req.body.skills.split(',').map((s: string) => s.trim());
        }
      } 
      // 3. Client Logic (Fixes the Empty Profile issue)
      else if (user.role === 'client') {
        user.companyName = req.body.companyName || user.companyName;
        user.companyDescription = req.body.companyDescription || user.companyDescription;
      }

      const updatedUser = await user.save();

      return res.json({
        ...updatedUser.toObject(),
        token: req.headers.authorization?.split(' ')[1]
      });
    } else {
      return res.status(404).json({ message: 'User not found' });
    }
  } catch (error: any) {
    return res.status(500).json({ message: error.message });
  }
};