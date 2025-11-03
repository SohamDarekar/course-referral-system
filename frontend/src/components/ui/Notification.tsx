'use client';

import { motion } from 'framer-motion';
import { useNotificationStore } from '@/store/useStore';

export default function Notification() {
  const { show, message, type, hideNotification } = useNotificationStore();

  if (!show) return null;

  const bgColor = {
    success: 'bg-green-500 dark:bg-green-600',
    error: 'bg-red-500 dark:bg-red-600',
    info: 'bg-blue-500 dark:bg-blue-600',
  }[type || 'info'];

  return (
    <motion.div
      initial={{ opacity: 0, y: -50 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -50 }}
      className="fixed top-4 right-4 z-50"
    >
      <div className={`${bgColor} text-white px-6 py-4 rounded-lg shadow-lg flex items-center space-x-4 max-w-md`}>
        <span className="flex-1">{message}</span>
        <button
          onClick={hideNotification}
          className="text-white hover:text-gray-200 font-bold"
        >
          ✕
        </button>
      </div>
    </motion.div>
  );
}
