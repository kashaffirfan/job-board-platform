import { Request, Response } from 'express';
import User from '../models/User';
import bcrypt from 'bcryptjs'; 
import jwt from 'jsonwebtoken';
import { AuthRequest } from '../middleware/authMiddleware';

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
      
      if (req.body.password) {
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(req.body.password, salt);
      }
      
      if (user.role === 'freelancer') {
        user.skills = req.body.skills || user.skills;
        user.bio = req.body.bio || user.bio;
        user.portfolio = req.body.portfolio || user.portfolio;
      }
      
      if (user.role === 'client') {
        user.companyName = req.body.companyName || user.companyName;
        user.companyDescription = req.body.companyDescription || user.companyDescription;
      }

      const updatedUser = await user.save();

      return res.json({
        _id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        role: updatedUser.role,
        skills: updatedUser.skills,
        bio: updatedUser.bio,
        portfolio: updatedUser.portfolio,
        token: req.headers.authorization?.split(' ')[1] 
      });
    } else {
      return res.status(404).json({ message: 'User not found' });
    }
  } catch (error: any) {
    return res.status(500).json({ message: error.message });
  }
};