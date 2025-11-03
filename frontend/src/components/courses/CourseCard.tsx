'use client';

import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';

interface Course {
  _id: string;
  title: string;
  description: string;
  price: number;
}

interface CourseCardProps {
  course: Course;
  isPurchased?: boolean;
}

export default function CourseCard({ course, isPurchased = false }: CourseCardProps) {
  const router = useRouter();

  const handleClick = () => {
    router.push(`/courses/${course._id}`);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -5 }}
      transition={{ duration: 0.3 }}
      onClick={handleClick}
      className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow cursor-pointer"
    >
      <div className="p-6">
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{course.title}</h3>
        <p className="text-gray-600 dark:text-gray-300 mb-4 line-clamp-2">{course.description}</p>
        <div className="flex items-center justify-between">
          <span className="text-2xl font-bold text-primary-600 dark:text-primary-400">${course.price}</span>
          {isPurchased ? (
            <div className="px-6 py-2 rounded-md font-medium bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 border-2 border-green-500 dark:border-green-600">
              ✓ Bought
            </div>
          ) : (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={(e) => {
                e.stopPropagation();
                handleClick();
              }}
              className="px-6 py-2 rounded-md font-medium transition-colors bg-primary-600 dark:bg-primary-500 text-white hover:bg-primary-700 dark:hover:bg-primary-600"
            >
              View Details
            </motion.button>
          )}
        </div>
      </div>
    </motion.div>
  );
}
