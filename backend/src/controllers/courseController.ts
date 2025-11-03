import { Response } from 'express';
import Course from '../models/Course';
import { AuthRequest } from '../middleware/auth';

export const getAllCourses = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const courses = await Course.find().sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: courses.length,
      data: courses,
    });
  } catch (error) {
    console.error('Get courses error:', error);
    res.status(500).json({ error: 'Failed to fetch courses' });
  }
};
