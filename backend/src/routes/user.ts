import express from 'express';
import { 
  checkUsername, 
  updateUsername, 
  updateEmail,
  updatePassword, 
  getProfile, 
  getPurchasedCourses,
  removePurchasedCourse,
  checkPurchasedCourses
} from '../controllers/userController';
import { authMiddleware } from '../middleware/auth';

const router = express.Router();

// Public route
router.post('/check-username', checkUsername);

// Protected routes
router.get('/profile', authMiddleware, getProfile);
router.put('/username', authMiddleware, updateUsername);
router.put('/email', authMiddleware, updateEmail);
router.put('/password', authMiddleware, updatePassword);
router.get('/purchased-courses', authMiddleware, getPurchasedCourses);
router.delete('/purchased-courses/:purchaseId', authMiddleware, removePurchasedCourse);
router.get('/check-purchased', authMiddleware, checkPurchasedCourses);

export default router;
