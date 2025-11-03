'use client';

import { motion } from 'framer-motion';

interface ProgressTrackerProps {
  courseId: string;
  courseTitle: string;
  totalLessons: number;
  completedLessons: number;
  lastAccessed?: Date;
  onContinue?: () => void;
}

export default function ProgressTracker({
  courseId,
  courseTitle,
  totalLessons,
  completedLessons,
  lastAccessed,
  onContinue,
}: ProgressTrackerProps) {
  const progressPercentage = Math.round((completedLessons / totalLessons) * 100);
  const isCompleted = progressPercentage === 100;

  const getProgressColor = () => {
    if (progressPercentage === 0) return 'bg-gray-200 dark:bg-gray-700';
    if (progressPercentage < 30) return 'bg-red-500';
    if (progressPercentage < 70) return 'bg-yellow-500';
    if (progressPercentage < 100) return 'bg-blue-500';
    return 'bg-green-500';
  };

  const formatDate = (date?: Date) => {
    if (!date) return 'Not started';
    const now = new Date();
    const diff = now.getTime() - new Date(date).getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    if (days === 0) return 'Today';
    if (days === 1) return 'Yesterday';
    if (days < 7) return `${days} days ago`;
    return new Date(date).toLocaleDateString();
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-100 dark:border-gray-700"
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">
            {courseTitle}
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Last accessed: {formatDate(lastAccessed)}
          </p>
        </div>
        
        {isCompleted && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 200 }}
            className="flex items-center justify-center w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-full"
          >
            <svg
              className="w-6 h-6 text-green-600 dark:text-green-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </motion.div>
        )}
      </div>

      {/* Progress Bar */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            {completedLessons} of {totalLessons} lessons completed
          </span>
          <span className={`text-sm font-bold ${
            isCompleted 
              ? 'text-green-600 dark:text-green-400' 
              : 'text-blue-600 dark:text-blue-400'
          }`}>
            {progressPercentage}%
          </span>
        </div>
        
        <div className="relative h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${progressPercentage}%` }}
            transition={{ duration: 1, ease: 'easeOut' }}
            className={`h-full ${getProgressColor()} rounded-full`}
          />
          {progressPercentage > 0 && progressPercentage < 100 && (
            <motion.div
              animate={{ x: [0, 10, 0] }}
              transition={{ repeat: Infinity, duration: 1.5 }}
              className="absolute right-0 top-0 h-full w-2 bg-white/50"
              style={{ right: `${100 - progressPercentage}%` }}
            />
          )}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3">
        {!isCompleted ? (
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onContinue}
            className="flex-1 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
          >
            {completedLessons === 0 ? (
              <>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Start Course
              </>
            ) : (
              <>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
                </svg>
                Continue Learning
              </>
            )}
          </motion.button>
        ) : (
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="flex-1 px-4 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            View Certificate
          </motion.button>
        )}
      </div>

      {/* Milestone Badge */}
      {progressPercentage >= 50 && progressPercentage < 100 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg"
        >
          <p className="text-sm text-blue-700 dark:text-blue-300 flex items-center gap-2">
            <span className="text-lg">🎉</span>
            <span>You're more than halfway there! Keep going!</span>
          </p>
        </motion.div>
      )}
    </motion.div>
  );
}
