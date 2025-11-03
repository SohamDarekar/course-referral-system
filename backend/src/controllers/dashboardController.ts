import { Response } from 'express';
import mongoose from 'mongoose';
import User from '../models/User';
import { AuthRequest } from '../middleware/auth';

export const purchaseCourse = async (req: AuthRequest, res: Response): Promise<void> => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { id: courseId } = req.params;
    const userId = req.userId;

    if (!userId) {
      await session.abortTransaction();
      session.endSession();
      res.status(401).json({ error: 'User not authenticated' });
      return;
    }

    // Find the user with session for transactional consistency
    const user = await User.findById(userId).session(session);

    if (!user) {
      await session.abortTransaction();
      session.endSession();
      res.status(404).json({ error: 'User not found' });
      return;
    }

    // Check if user has already converted
    if (user.hasConverted) {
      await session.commitTransaction();
      session.endSession();
      res.status(200).json({
        message: 'Course purchased successfully',
        creditsEarned: 0,
        note: 'No referral credits earned (not first purchase)',
      });
      return;
    }

    // Mark user as converted
    user.hasConverted = true;
    user.credits += 2; // User earns 2 credits on their first purchase

    let referrerCredited = false;

    // If user was referred, credit the referrer
    if (user.referredBy) {
      const referrer = await User.findById(user.referredBy).session(session);

      if (referrer) {
        referrer.credits += 2;
        await referrer.save({ session });
        referrerCredited = true;
      }
    }

    await user.save({ session });

    await session.commitTransaction();
    session.endSession();

    res.status(200).json({
      message: 'Course purchased successfully! First purchase completed.',
      creditsEarned: 2,
      userCredits: user.credits,
      referrerCredited,
    });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    console.error('Purchase course error:', error);
    res.status(500).json({ error: 'Failed to process purchase' });
  }
};

export const getDashboardStats = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.userId;

    if (!userId) {
      res.status(401).json({ error: 'User not authenticated' });
      return;
    }

    const user = await User.findById(userId);

    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    // Count total users referred by this user
    const totalReferredUsers = await User.countDocuments({ referredBy: userId });

    // Count converted users (users who made their first purchase)
    const convertedUsers = await User.countDocuments({
      referredBy: userId,
      hasConverted: true,
    });

    // Generate referral link
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    const referralLink = `${frontendUrl}/register?r=${user.referralCode}`;

    res.status(200).json({
      success: true,
      data: {
        totalReferredUsers,
        convertedUsers,
        totalCreditsEarned: user.credits,
        referralLink,
        referralCode: user.referralCode,
        username: user.username,
      },
    });
  } catch (error) {
    console.error('Get dashboard stats error:', error);
    res.status(500).json({ error: 'Failed to fetch dashboard stats' });
  }
};
