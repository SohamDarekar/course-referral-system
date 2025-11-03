'use client';

import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

interface AnimatedStatCardProps {
  title: string;
  value: number;
  subtitle?: string;
  icon: React.ReactNode;
  trend?: {
    value: number;
    direction: 'up' | 'down';
  };
  color: 'blue' | 'green' | 'purple' | 'orange';
  delay?: number;
}

export default function AnimatedStatCard({
  title,
  value,
  subtitle,
  icon,
  trend,
  color,
  delay = 0,
}: AnimatedStatCardProps) {
  const [animatedValue, setAnimatedValue] = useState(0);

  useEffect(() => {
    const duration = 2000; // 2 seconds
    const steps = 60;
    const increment = value / steps;
    const stepDuration = duration / steps;

    let currentStep = 0;
    const timer = setInterval(() => {
      currentStep++;
      if (currentStep >= steps) {
        setAnimatedValue(value);
        clearInterval(timer);
      } else {
        setAnimatedValue(Math.floor(increment * currentStep));
      }
    }, stepDuration);

    return () => clearInterval(timer);
  }, [value]);

  const colorClasses = {
    blue: {
      bg: 'from-blue-500 to-blue-600',
      light: 'bg-blue-50 dark:bg-blue-900/20',
      text: 'text-blue-600 dark:text-blue-400',
    },
    green: {
      bg: 'from-green-500 to-green-600',
      light: 'bg-green-50 dark:bg-green-900/20',
      text: 'text-green-600 dark:text-green-400',
    },
    purple: {
      bg: 'from-purple-500 to-purple-600',
      light: 'bg-purple-50 dark:bg-purple-900/20',
      text: 'text-purple-600 dark:text-purple-400',
    },
    orange: {
      bg: 'from-orange-500 to-orange-600',
      light: 'bg-orange-50 dark:bg-orange-900/20',
      text: 'text-orange-600 dark:text-orange-400',
    },
  };

  const colors = colorClasses[color];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      whileHover={{ y: -5, scale: 1.02 }}
      className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 overflow-hidden border border-gray-100 dark:border-gray-700 group"
    >
      {/* Background Gradient */}
      <div className={`absolute inset-0 bg-gradient-to-br ${colors.bg} opacity-0 group-hover:opacity-5 transition-opacity duration-300`} />

      <div className="relative">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div>
            <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
              {title}
            </p>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: delay + 0.2 }}
              className="flex items-baseline gap-2"
            >
              <span className="text-4xl font-extrabold text-gray-900 dark:text-white">
                {animatedValue.toLocaleString()}
              </span>
              {trend && (
                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: delay + 0.4 }}
                  className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold ${
                    trend.direction === 'up'
                      ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                      : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'
                  }`}
                >
                  <svg
                    className={`w-3 h-3 ${trend.direction === 'down' && 'rotate-180'}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 10l7-7m0 0l7 7m-7-7v18"
                    />
                  </svg>
                  {trend.value}%
                </motion.div>
              )}
            </motion.div>
          </div>

          {/* Icon */}
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: 'spring', stiffness: 200, delay }}
            className={`flex-shrink-0 w-14 h-14 bg-gradient-to-br ${colors.bg} rounded-xl flex items-center justify-center text-white shadow-lg`}
          >
            {icon}
          </motion.div>
        </div>

        {/* Subtitle */}
        {subtitle && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: delay + 0.3 }}
            className="text-sm text-gray-600 dark:text-gray-400"
          >
            {subtitle}
          </motion.p>
        )}

        {/* Progress Bar (Optional) */}
        <motion.div
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: 1, delay: delay + 0.5 }}
          className="mt-4 h-1 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden origin-left"
        >
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${Math.min((value / 100) * 100, 100)}%` }}
            transition={{ duration: 1.5, delay: delay + 0.7 }}
            className={`h-full bg-gradient-to-r ${colors.bg}`}
          />
        </motion.div>
      </div>

      {/* Decorative Circle */}
      <div className="absolute -right-8 -bottom-8 w-32 h-32 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800 rounded-full opacity-20 group-hover:opacity-30 transition-opacity" />
    </motion.div>
  );
}

// Export a version for quick use with achievements
export function AchievementBadge({
  title,
  description,
  unlocked,
  progress,
  icon,
}: {
  title: string;
  description: string;
  unlocked: boolean;
  progress?: number;
  icon: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ scale: 1.05 }}
      className={`relative p-4 rounded-xl border-2 transition-all ${
        unlocked
          ? 'bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 border-yellow-400 dark:border-yellow-600'
          : 'bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700'
      }`}
    >
      {/* Badge Icon */}
      <div className="flex items-start gap-3 mb-2">
        <div
          className={`w-12 h-12 rounded-full flex items-center justify-center text-2xl ${
            unlocked
              ? 'bg-gradient-to-br from-yellow-400 to-orange-500 shadow-lg'
              : 'bg-gray-200 dark:bg-gray-700 grayscale'
          }`}
        >
          {icon}
        </div>
        <div className="flex-1">
          <h4 className={`font-bold ${unlocked ? 'text-gray-900 dark:text-white' : 'text-gray-500 dark:text-gray-500'}`}>
            {title}
          </h4>
          <p className="text-xs text-gray-600 dark:text-gray-400">{description}</p>
        </div>
      </div>

      {/* Progress Bar for locked achievements */}
      {!unlocked && progress !== undefined && (
        <div className="mt-3">
          <div className="flex justify-between text-xs text-gray-600 dark:text-gray-400 mb-1">
            <span>Progress</span>
            <span>{progress}%</span>
          </div>
          <div className="h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 1 }}
              className="h-full bg-gradient-to-r from-blue-500 to-purple-500"
            />
          </div>
        </div>
      )}

      {/* Unlocked Stamp */}
      {unlocked && (
        <motion.div
          initial={{ scale: 0, rotate: -10 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: 'spring', stiffness: 200 }}
          className="absolute top-2 right-2 bg-green-500 text-white text-xs font-bold px-2 py-1 rounded-full"
        >
          ✓ UNLOCKED
        </motion.div>
      )}
    </motion.div>
  );
}
