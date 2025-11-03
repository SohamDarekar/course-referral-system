'use client';

import { motion } from 'framer-motion';
import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { coursesAPI, setAuthToken } from '@/lib/api';
import { useNotificationStore } from '@/store/useStore';

interface Course {
  _id: string;
  title: string;
  description: string;
  price: number;
}

interface CourseCardProps {
  course: Course;
  onPurchaseSuccess?: () => void;
}

export default function CourseCard({ course, onPurchaseSuccess }: CourseCardProps) {
  const { data: session } = useSession();
  const [purchasing, setPurchasing] = useState(false);
  const { showNotification } = useNotificationStore();

  const handlePurchase = async () => {
    if (!session) {
      showNotification('Please login to purchase courses', 'error');
      return;
    }

    try {
      setPurchasing(true);
      const token = (session as any).accessToken;
      setAuthToken(token);

      const response = await coursesAPI.purchase(course._id);
      
      showNotification(
        response.creditsEarned > 0
          ? `Success! You earned ${response.creditsEarned} credits!`
          : 'Course purchased successfully!',
        'success'
      );

      if (onPurchaseSuccess) {
        onPurchaseSuccess();
      }
    } catch (error: any) {
      showNotification(
        error.response?.data?.error || 'Failed to purchase course',
        'error'
      );
    } finally {
      setPurchasing(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -5 }}
      transition={{ duration: 0.3 }}
      className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow"
    >
      <div className="p-6">
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{course.title}</h3>
        <p className="text-gray-600 dark:text-gray-300 mb-4 line-clamp-2">{course.description}</p>
        <div className="flex items-center justify-between">
          <span className="text-2xl font-bold text-primary-600 dark:text-primary-400">${course.price}</span>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handlePurchase}
            disabled={purchasing || !session}
            className={`px-6 py-2 rounded-md font-medium transition-colors ${
              purchasing || !session
                ? 'bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed'
                : 'bg-primary-600 dark:bg-primary-500 text-white hover:bg-primary-700 dark:hover:bg-primary-600'
            }`}
          >
            {purchasing ? 'Processing...' : 'Buy Course'}
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
}
