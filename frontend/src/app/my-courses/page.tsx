'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Trash2, ArrowLeft, BookOpen } from 'lucide-react';
import { apiClient } from '@/lib/api';
import Notification from '@/components/ui/Notification';
import { useNotificationStore } from '@/store/useStore';

interface PurchasedCourse {
  purchaseId: string;
  courseId: string;
  title: string;
  description: string;
  price: number;
  purchaseDate: string;
}

export default function MyCoursesPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [courses, setCourses] = useState<PurchasedCourse[]>([]);
  const [loading, setLoading] = useState(true);
  const [removingId, setRemovingId] = useState<string | null>(null);
  const { showNotification } = useNotificationStore();

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
      return;
    }

    if (status === 'authenticated') {
      fetchPurchasedCourses();
    }
  }, [status, router]);

  const fetchPurchasedCourses = async () => {
    try {
      const response = await apiClient.get('/api/user/purchased-courses', {
        headers: {
          Authorization: `Bearer ${(session as any)?.accessToken}`,
        },
      });
      setCourses(response.data.courses);
    } catch (error) {
      console.error('Failed to fetch purchased courses:', error);
      showNotification('Failed to load courses', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveCourse = async (purchaseId: string, title: string) => {
    if (!confirm(`Are you sure you want to remove "${title}" from your purchased courses?`)) {
      return;
    }

    setRemovingId(purchaseId);
    try {
      await apiClient.delete(`/api/user/purchased-courses/${purchaseId}`, {
        headers: {
          Authorization: `Bearer ${(session as any)?.accessToken}`,
        },
      });
      
      setCourses(courses.filter(c => c.purchaseId !== purchaseId));
      showNotification('Course removed successfully', 'success');
    } catch (error: any) {
      console.error('Failed to remove course:', error);
      showNotification(error.response?.data?.error || 'Failed to remove course', 'error');
    } finally {
      setRemovingId(null);
    }
  };

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading your courses...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Notification />
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 sm:py-12 px-4 sm:px-6 lg:px-8 transition-colors">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-6 sm:mb-8">
            <button
              onClick={() => router.push('/')}
              className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 mb-4 transition-colors"
            >
              <ArrowLeft size={20} />
              <span className="text-sm sm:text-base">Back to Courses</span>
            </button>
            
            <div className="flex items-center gap-3">
              <BookOpen size={28} className="text-primary-600 dark:text-primary-400 sm:w-8 sm:h-8" />
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
                My Purchased Courses
              </h1>
            </div>
            <p className="mt-2 text-sm sm:text-base text-gray-600 dark:text-gray-400">
              Manage your course collection
            </p>
          </div>

          {/* Courses Grid */}
          {courses.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-8 sm:p-12 text-center"
            >
              <BookOpen size={48} className="mx-auto text-gray-400 dark:text-gray-600 mb-4 sm:w-16 sm:h-16" />
              <h2 className="text-xl sm:text-2xl font-semibold text-gray-900 dark:text-white mb-2">
                No Courses Yet
              </h2>
              <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mb-6">
                You haven't purchased any courses yet. Browse our collection to get started!
              </p>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => router.push('/')}
                className="bg-primary-600 dark:bg-primary-500 text-white px-6 py-3 rounded-md hover:bg-primary-700 dark:hover:bg-primary-600 transition-colors text-sm sm:text-base"
              >
                Browse Courses
              </motion.button>
            </motion.div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {courses.map((course, index) => (
                <motion.div
                  key={course.purchaseId}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow"
                >
                  <div className="p-5 sm:p-6">
                    <h3 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white mb-2">
                      {course.title}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 line-clamp-2">
                      {course.description}
                    </p>
                    
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 mb-4">
                      <span className="text-xl sm:text-2xl font-bold text-primary-600 dark:text-primary-400">
                        ${course.price}
                      </span>
                      <span className="text-xs text-gray-500 dark:text-gray-500">
                        Purchased: {new Date(course.purchaseDate).toLocaleDateString()}
                      </span>
                    </div>

                    <div className="space-y-2">
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => router.push(`/courses/${course.courseId}`)}
                        className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-md bg-primary-600 dark:bg-primary-500 text-white hover:bg-primary-700 dark:hover:bg-primary-600 transition-colors text-sm sm:text-base"
                      >
                        <BookOpen size={18} />
                        <span>View Details</span>
                      </motion.button>

                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => handleRemoveCourse(course.purchaseId, course.title)}
                        disabled={removingId === course.purchaseId}
                        className={`w-full flex items-center justify-center gap-2 px-4 py-2 rounded-md transition-colors text-sm sm:text-base ${
                          removingId === course.purchaseId
                            ? 'bg-gray-300 dark:bg-gray-600 cursor-not-allowed'
                            : 'bg-red-500 hover:bg-red-600 text-white'
                        }`}
                      >
                        <Trash2 size={18} />
                        <span>{removingId === course.purchaseId ? 'Removing...' : 'Remove Course'}</span>
                      </motion.button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
