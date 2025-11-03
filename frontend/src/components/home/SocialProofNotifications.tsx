'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useState } from 'react';

interface Activity {
  id: string;
  name: string;
  location: string;
  course: string;
  timestamp: Date;
}

export default function SocialProofNotifications() {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [currentActivity, setCurrentActivity] = useState<Activity | null>(null);

  // Mock activities (in production, fetch from backend)
  const mockActivities: Omit<Activity, 'id' | 'timestamp'>[] = [
    { name: 'Sarah M.', location: 'New York', course: 'Advanced React Development' },
    { name: 'John D.', location: 'London', course: 'Machine Learning Basics' },
    { name: 'Emily R.', location: 'Toronto', course: 'UI/UX Design Masterclass' },
    { name: 'Michael K.', location: 'Sydney', course: 'Full Stack Web Development' },
    { name: 'Lisa P.', location: 'Berlin', course: 'Data Science Fundamentals' },
    { name: 'David L.', location: 'Tokyo', course: 'Mobile App Development' },
    { name: 'Anna S.', location: 'Paris', course: 'Digital Marketing Pro' },
    { name: 'Chris B.', location: 'Mumbai', course: 'Cloud Computing Essentials' },
  ];

  useEffect(() => {
    // Show a new notification every 8-12 seconds
    const showNotification = () => {
      const randomActivity = mockActivities[Math.floor(Math.random() * mockActivities.length)];
      const activity: Activity = {
        ...randomActivity,
        id: Math.random().toString(36).substr(2, 9),
        timestamp: new Date(),
      };

      setCurrentActivity(activity);

      // Hide after 5 seconds
      setTimeout(() => {
        setCurrentActivity(null);
      }, 5000);
    };

    // Initial delay
    const initialTimeout = setTimeout(showNotification, 3000);

    // Regular interval
    const interval = setInterval(showNotification, 10000);

    return () => {
      clearTimeout(initialTimeout);
      clearInterval(interval);
    };
  }, []);

  return (
    <AnimatePresence>
      {currentActivity && (
        <motion.div
          initial={{ opacity: 0, x: -100, scale: 0.8 }}
          animate={{ opacity: 1, x: 0, scale: 1 }}
          exit={{ opacity: 0, x: -100, scale: 0.8 }}
          transition={{ type: 'spring', stiffness: 200, damping: 20 }}
          className="fixed bottom-6 left-6 z-50 max-w-sm"
        >
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 p-4 flex items-start gap-3">
            {/* Avatar */}
            <div className="flex-shrink-0">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                {currentActivity.name.charAt(0)}
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2 mb-1">
                <p className="text-sm font-semibold text-gray-900 dark:text-white">
                  {currentActivity.name}
                  <span className="text-gray-600 dark:text-gray-400 font-normal ml-1">
                    from {currentActivity.location}
                  </span>
                </p>
                <motion.div
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="flex-shrink-0 w-2 h-2 bg-green-500 rounded-full"
                />
              </div>
              
              <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">
                Just enrolled in <span className="font-medium text-blue-600 dark:text-blue-400">{currentActivity.course}</span>
              </p>
              
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {getTimeAgo(currentActivity.timestamp)}
              </p>
            </div>

            {/* Close Button */}
            <button
              onClick={() => setCurrentActivity(null)}
              className="flex-shrink-0 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Decorative pulse */}
          <motion.div
            animate={{ scale: [1, 1.5], opacity: [0.5, 0] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="absolute -inset-2 bg-blue-400/20 rounded-xl -z-10"
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function getTimeAgo(date: Date): string {
  const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
  
  if (seconds < 60) return 'Just now';
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  return `${Math.floor(seconds / 86400)}d ago`;
}
