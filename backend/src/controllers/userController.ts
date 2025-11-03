import { Response } from 'express';
import bcrypt from 'bcryptjs';
import User from '../models/User';
import Course from '../models/Course';
import Purchase from '../models/Purchase';
import { AuthRequest } from '../middleware/auth';
import { z } from 'zod';

// Validation schemas
const updateUsernameSchema = z.object({
  username: z
    .string()
    .min(3, 'Username must be at least 3 characters')
    .max(30, 'Username cannot exceed 30 characters')
    .regex(/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, and underscores'),
});

const updateEmailSchema = z.object({
  email: z.string().email('Invalid email address'),
});

const updatePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z.string().min(6, 'New password must be at least 6 characters'),
});

const checkUsernameSchema = z.object({
  username: z.string().min(3, 'Username must be at least 3 characters'),
});

// Check if username is available
export const checkUsername = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const validatedData = checkUsernameSchema.parse(req.body);
    const { username } = validatedData;

    const existingUser = await User.findOne({ username });

    if (existingUser) {
      res.status(200).json({ available: false, message: 'Username is taken' });
      return;
    }

    res.status(200).json({ available: true, message: 'Username is available' });
  } catch (error: any) {
    if (error.name === 'ZodError') {
      res.status(400).json({
        error: 'Validation error',
        details: error.errors,
      });
      return;
    }
    console.error('Check username error:', error);
    res.status(500).json({ error: 'Failed to check username' });
  }
};

// Update username
export const updateUsername = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const validatedData = updateUsernameSchema.parse(req.body);
    const { username } = validatedData;

    if (!req.userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    // Check if username is already taken
    const existingUser = await User.findOne({ username });
    if (existingUser && (existingUser._id as any).toString() !== req.userId) {
      res.status(400).json({ error: 'Username is taken' });
      return;
    }

    // Update username
    const user = await User.findByIdAndUpdate(
      req.userId,
      { username },
      { new: true, runValidators: true }
    );

    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    res.status(200).json({
      message: 'Username updated successfully',
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        referralCode: user.referralCode,
        credits: user.credits,
      },
    });
  } catch (error: any) {
    if (error.name === 'ZodError') {
      res.status(400).json({
        error: 'Validation error',
        details: error.errors,
      });
      return;
    }
    console.error('Update username error:', error);
    res.status(500).json({ error: 'Failed to update username' });
  }
};

// Update email
export const updateEmail = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const validatedData = updateEmailSchema.parse(req.body);
    const { email } = validatedData;

    if (!req.userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    // Check if email is already taken
    const existingUser = await User.findOne({ email });
    if (existingUser && (existingUser._id as any).toString() !== req.userId) {
      res.status(400).json({ error: 'Email is already in use' });
      return;
    }

    // Update email
    const user = await User.findByIdAndUpdate(
      req.userId,
      { email },
      { new: true, runValidators: true }
    );

    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    res.status(200).json({
      message: 'Email updated successfully',
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        referralCode: user.referralCode,
        credits: user.credits,
      },
    });
  } catch (error: any) {
    if (error.name === 'ZodError') {
      res.status(400).json({
        error: 'Validation error',
        details: error.errors,
      });
      return;
    }
    console.error('Update email error:', error);
    res.status(500).json({ error: 'Failed to update email' });
  }
};

// Update password
export const updatePassword = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const validatedData = updatePasswordSchema.parse(req.body);
    const { currentPassword, newPassword } = validatedData;

    if (!req.userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    // Find user
    const user = await User.findById(req.userId);
    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    // Verify current password
    const isPasswordValid = await bcrypt.compare(currentPassword, user.password);
    if (!isPasswordValid) {
      res.status(400).json({ error: 'Current password is incorrect' });
      return;
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 12);

    // Update password
    user.password = hashedPassword;
    await user.save();

    res.status(200).json({
      message: 'Password updated successfully',
    });
  } catch (error: any) {
    if (error.name === 'ZodError') {
      res.status(400).json({
        error: 'Validation error',
        details: error.errors,
      });
      return;
    }
    console.error('Update password error:', error);
    res.status(500).json({ error: 'Failed to update password' });
  }
};

// Get user profile
export const getProfile = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const user = await User.findById(req.userId).select('-password');
    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    res.status(200).json({
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        referralCode: user.referralCode,
        credits: user.credits,
      },
    });
  } catch (error: any) {
    console.error('Get profile error:', error);
    res.status(500).json({ error: 'Failed to get profile' });
  }
};

// Get user purchased courses
export const getPurchasedCourses = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    // Find all purchases for the user
    const purchases = await Purchase.find({ userId: req.userId })
      .populate('courseId', 'title description price')
      .sort({ purchaseDate: -1 });

    // Filter out purchases where course was deleted (courseId is null)
    const courses = purchases
      .filter(purchase => purchase.courseId !== null)
      .map(purchase => ({
        purchaseId: purchase._id,
        courseId: (purchase.courseId as any)._id,
        title: (purchase.courseId as any).title,
        description: (purchase.courseId as any).description,
        price: purchase.price,
        purchaseDate: purchase.purchaseDate,
      }));

    res.status(200).json({
      courses,
    });
  } catch (error: any) {
    console.error('Get purchased courses error:', error);
    res.status(500).json({ error: 'Failed to get purchased courses' });
  }
};

// Remove purchased course
export const removePurchasedCourse = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const { purchaseId } = req.params;

    // Find and delete the purchase
    const purchase = await Purchase.findOneAndDelete({
      _id: purchaseId,
      userId: req.userId, // Ensure user owns this purchase
    });

    if (!purchase) {
      res.status(404).json({ error: 'Purchase not found' });
      return;
    }

    res.status(200).json({
      message: 'Purchase removed successfully',
    });
  } catch (error: any) {
    console.error('Remove purchased course error:', error);
    res.status(500).json({ error: 'Failed to remove purchase' });
  }
};

// Check purchased status for courses
export const checkPurchasedCourses = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    // Get all purchased course IDs for the user
    const purchases = await Purchase.find({ userId: req.userId }).select('courseId');
    const purchasedCourseIds = purchases.map(p => p.courseId.toString());

    res.status(200).json({
      purchasedCourseIds,
    });
  } catch (error: any) {
    console.error('Check purchased courses error:', error);
    res.status(500).json({ error: 'Failed to check purchased courses' });
  }
};


