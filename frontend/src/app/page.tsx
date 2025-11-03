'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useSession } from 'next-auth/react';
import EnhancedCourseCard from '@/components/courses/EnhancedCourseCard';
import HeroSection from '@/components/home/HeroSection';
import StatsSection from '@/components/home/StatsSection';
import SocialProofNotifications from '@/components/home/SocialProofNotifications';
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
      // Backend returns { success, count, data: [...courses] }
      const response = await coursesAPI.getAll();
      console.log('Courses API response:', response);
      
      // Handle nested data structure from backend
      const coursesData = response.data || response;
      console.log('Extracted courses data:', coursesData);
      
      if (Array.isArray(coursesData)) {
        setCourses(coursesData);
        console.log('Set courses count:', coursesData.length);
      } else {
        console.error('Courses data is not an array:', coursesData);
        setCourses([]);
      }
    } catch (error: any) {
      // Log useful error details (AxiosError has code & message)
      console.error('Failed to fetch courses:', error);
      console.error('Error details:', {
        message: error.message,
        code: error.code,
        response: error.response?.data
      });
      setCourses([]); // Set empty array on error
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
      {!session && <SocialProofNotifications />}
      
      {/* Show Hero and Stats only for non-logged-in users */}
      {!session && (
        <>
          <HeroSection />
          <StatsSection />
        </>
      )}
      
      {/* Personalized Welcome for Logged-in Users */}
      {session && (
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 py-12 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-white"
            >
              <h1 className="text-3xl sm:text-4xl font-extrabold mb-2">
                Welcome back, {(session as any)?.user?.name || 'Learner'}! 👋
              </h1>
              <p className="text-lg text-blue-100">
                Continue your learning journey and discover new courses
              </p>
            </motion.div>
          </div>
        </div>
      )}
      
      {/* Course Section */}
      <div className="bg-white dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8 transition-colors">
        <div className="max-w-7xl mx-auto">
          {/* Recommended Courses for Logged-in Users */}
          {session && purchasedCourseIds.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-12"
            >
              <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white mb-2">
                Because you bought...
              </h2>
              <p className="text-gray-600 dark:text-gray-300 mb-6">
                Students who purchased your courses also enjoyed these
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
                {courses
                  .filter(c => !purchasedCourseIds.includes(c._id))
                  .slice(0, 3)
                  .map((course, index) => (
                    <EnhancedCourseCard
                      key={course._id}
                      course={course}
                      isPurchased={false}
                      index={index}
                    />
                  ))}
              </div>
            </motion.div>
          )}

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            id="courses"
            className="text-center mb-8 sm:mb-12"
          >
            <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 dark:text-white mb-3 sm:mb-4">
              Explore Our Courses
            </h2>
            <p className="text-base sm:text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Choose from our wide range of courses and start learning today
            </p>
          </motion.div>

          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div
                  key={i}
                  className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden animate-pulse"
                >
                  <div className="h-48 bg-gray-200 dark:bg-gray-700" />
                  <div className="p-6">
                    <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded mb-4" />
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded mb-2" />
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded mb-4 w-3/4" />
                    <div className="flex justify-between items-center">
                      <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-20" />
                      <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded w-32" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
              {courses.map((course, index) => (
                <EnhancedCourseCard 
                  key={course._id} 
                  course={course}
                  isPurchased={purchasedCourseIds.includes(course._id)}
                  index={index}
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
