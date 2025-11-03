import { Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User';
import { registerSchema, loginSchema } from '../validators/auth';
import { generateReferralCode } from '../utils/referralCode';
import { AuthRequest } from '../middleware/auth';

export const register = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    // Validate input
    const validatedData = registerSchema.parse(req.body);
    const { username, email, password, referrerCode } = validatedData;

    // Check if user already exists
    const existingUser = await User.findOne({
      $or: [{ email }, { username }],
    });

    if (existingUser) {
      res.status(400).json({
        error:
          existingUser.email === email
            ? 'Email already registered'
            : 'Username already taken',
      });
      return;
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Generate unique referral code
    let referralCode = generateReferralCode();
    let isUnique = false;

    while (!isUnique) {
      const existingCode = await User.findOne({ referralCode });
      if (!existingCode) {
        isUnique = true;
      } else {
        referralCode = generateReferralCode();
      }
    }

    // Handle referrer if referrerCode is provided
    let referrerId = null;
    if (referrerCode) {
      const referrer = await User.findOne({ referralCode: referrerCode });
      if (referrer) {
        referrerId = referrer._id;
      }
      // Note: We don't throw an error if referrer code is invalid
      // This allows registration to proceed even with invalid codes
    }

    // Create new user
    const newUser = new User({
      username,
      email,
      password: hashedPassword,
      referralCode,
      referredBy: referrerId,
      credits: 0,
      hasConverted: false,
    });

    await newUser.save();

    // Generate JWT
    const token = jwt.sign(
      { userId: (newUser._id as any).toString() },
      process.env.JWT_SECRET || 'fallback_secret',
      { expiresIn: '7d' }
    );

    res.status(201).json({
      message: 'User registered successfully',
      user: {
        id: newUser._id,
        username: newUser.username,
        email: newUser.email,
        referralCode: newUser.referralCode,
        credits: newUser.credits,
      },
      token,
    });
  } catch (error: any) {
    if (error.name === 'ZodError') {
      res.status(400).json({
        error: 'Validation error',
        details: error.errors,
      });
      return;
    }
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Registration failed' });
  }
};

export const login = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    // Validate input
    const validatedData = loginSchema.parse(req.body);
    const { identifier, password } = validatedData;

    // Find user by email or username
    const user = await User.findOne({
      $or: [{ email: identifier }, { username: identifier }],
    });

    if (!user) {
      res.status(401).json({ error: 'Invalid credentials' });
      return;
    }

    // Compare password
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      res.status(401).json({ error: 'Invalid credentials' });
      return;
    }

    // Generate JWT
    const token = jwt.sign(
      { userId: (user._id as any).toString() },
      process.env.JWT_SECRET || 'fallback_secret',
      { expiresIn: '7d' }
    );

    res.status(200).json({
      message: 'Login successful',
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        referralCode: user.referralCode,
        credits: user.credits,
      },
      token,
    });
  } catch (error: any) {
    if (error.name === 'ZodError') {
      res.status(400).json({
        error: 'Validation error',
        details: error.errors,
      });
      return;
    }
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
};
