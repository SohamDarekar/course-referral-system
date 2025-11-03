import express from 'express';
import { getAllCourses } from '../controllers/courseController';
import { purchaseCourse } from '../controllers/dashboardController';
import { authMiddleware } from '../middleware/auth';

const router = express.Router();

router.get('/', getAllCourses);
router.post('/:id/purchase', authMiddleware, purchaseCourse);

export default router;
