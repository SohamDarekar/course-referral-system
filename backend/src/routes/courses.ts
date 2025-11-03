import express from 'express';
import { getAllCourses, getCourseById } from '../controllers/courseController';
import { purchaseCourse, purchaseWithCredits } from '../controllers/dashboardController';
import { authMiddleware } from '../middleware/auth';

const router = express.Router();

router.get('/', getAllCourses);
router.get('/:id', getCourseById);
router.post('/:id/purchase', authMiddleware, purchaseCourse);
router.post('/:id/purchase-with-credits', authMiddleware, purchaseWithCredits);

export default router;
