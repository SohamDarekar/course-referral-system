'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useSession } from 'next-auth/react';
import CourseCard from '@/components/courses/CourseCard';
import Notification from '@/components/ui/Notification';
import { coursesAPI, apiClient } from '@/lib/api';
import { useLoadingStore } from '@/store/useStore';

interface Course {
  _id: string;
  title: string;
  description: string;
  price: number;
}

export default function Home() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [purchasedCourseIds, setPurchasedCourseIds] = useState<string[]>([]);
  const { isLoading, setLoading } = useLoadingStore();
  const { data: session, status } = useSession();

  useEffect(() => {
    fetchCourses();
  }, []);

  useEffect(() => {
    if (status === 'authenticated') {
      fetchPurchasedCourses();
    }
  }, [status]);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      const response = await coursesAPI.getAll();
      setCourses(response.data || []);
    } catch (error) {
      console.error('Failed to fetch courses:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchPurchasedCourses = async () => {
    try {
      const response = await apiClient.get('/api/user/check-purchased', {
        headers: {
          Authorization: `Bearer ${(session as any)?.accessToken}`,
        },
      });
      setPurchasedCourseIds(response.data.purchasedCourseIds || []);
    } catch (error) {
      console.error('Failed to fetch purchased courses:', error);
    }
  };

  return (
    <>
      <Notification />
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 py-8 sm:py-12 px-4 sm:px-6 lg:px-8 transition-colors">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center mb-8 sm:mb-12"
          >
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-gray-900 dark:text-white mb-3 sm:mb-4 px-2">
              Welcome to Course Store
            </h1>
            <p className="text-base sm:text-lg md:text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto px-4">
              Discover amazing courses and earn credits by referring your friends!
            </p>
          </motion.div>

          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div
                  key={i}
                  className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 animate-pulse"
                >
                  <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded mb-4" />
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded mb-2" />
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded mb-4 w-3/4" />
                  <div className="flex justify-between items-center">
                    <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-20" />
                    <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded w-32" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
              {courses.map((course) => (
                <CourseCard 
                  key={course._id} 
                  course={course}
                  isPurchased={purchasedCourseIds.includes(course._id)}
                />
              ))}
            </div>
          )}

          {!isLoading && courses.length === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-12"
            >
              <p className="text-lg sm:text-xl text-gray-600 dark:text-gray-400">No courses available at the moment.</p>
            </motion.div>
          )}
        </div>
      </div>
    </>
  );
}
