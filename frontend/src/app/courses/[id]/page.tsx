'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useSession } from 'next-auth/react';
import { coursesAPI, setAuthToken, userAPI, apiClient } from '@/lib/api';
import { useNotificationStore } from '@/store/useStore';
import Notification from '@/components/ui/Notification';

interface Course {
  _id: string;
  title: string;
  description: string;
  price: number;
  courseHours: number;
  syllabus: string[];
  rating: number;
  numRatings: number;
  creditsRequired: number;
  instructor: string;
  level: string;
}

export default function CourseDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const { data: session, status } = useSession();
  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);
  const [purchasing, setPurchasing] = useState(false);
  const [purchasingWithCredits, setPurchasingWithCredits] = useState(false);
  const [isPurchased, setIsPurchased] = useState(false);
  const [userCredits, setUserCredits] = useState(0);
  const { showNotification } = useNotificationStore();

  useEffect(() => {
    if (params.id) {
      fetchCourseDetails();
    }
  }, [params.id]);

  useEffect(() => {
    if (status === 'authenticated' && course) {
      checkPurchaseStatus();
      fetchUserCredits();
    }
  }, [status, course]);

  const fetchCourseDetails = async () => {
    try {
      setLoading(true);
      const response = await coursesAPI.getById(params.id as string);
      setCourse(response.data);
    } catch (error: any) {
      showNotification(
        error.response?.data?.error || 'Failed to load course details',
        'error'
      );
      router.push('/');
    } finally {
      setLoading(false);
    }
  };

  const checkPurchaseStatus = async () => {
    try {
      const token = (session as any)?.accessToken;
      if (!token) return;

      const response = await apiClient.get('/api/user/check-purchased', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const purchasedIds = response.data.purchasedCourseIds || [];
      setIsPurchased(purchasedIds.includes(params.id));
    } catch (error) {
      console.error('Failed to check purchase status:', error);
    }
  };

  const fetchUserCredits = async () => {
    try {
      const token = (session as any)?.accessToken;
      if (!token) return;

      setAuthToken(token);
      const response = await userAPI.getProfile();
      setUserCredits(response.user?.credits || 0);
    } catch (error) {
      console.error('Failed to fetch user credits:', error);
    }
  };

  const handlePurchaseWithMoney = async () => {
    if (!session) {
      showNotification('Please login to purchase courses', 'error');
      router.push('/login');
      return;
    }

    try {
      setPurchasing(true);
      const token = (session as any).accessToken;
      setAuthToken(token);

      const response = await coursesAPI.purchase(course!._id);

      showNotification(
        response.creditsEarned > 0
          ? `Success! You earned ${response.creditsEarned} credits!`
          : 'Course purchased successfully!',
        'success'
      );

      setIsPurchased(true);
      fetchUserCredits();
    } catch (error: any) {
      showNotification(
        error.response?.data?.error || 'Failed to purchase course',
        'error'
      );
    } finally {
      setPurchasing(false);
    }
  };

  const handlePurchaseWithCredits = async () => {
    if (!session) {
      showNotification('Please login to purchase courses', 'error');
      router.push('/login');
      return;
    }

    try {
      setPurchasingWithCredits(true);
      const token = (session as any).accessToken;
      setAuthToken(token);

      const response = await coursesAPI.purchaseWithCredits(course!._id);

      showNotification(response.message || 'Course purchased successfully!', 'success');
      setIsPurchased(true);
      fetchUserCredits();
    } catch (error: any) {
      if (error.response?.data?.referralsNeeded) {
        showNotification(error.response.data.message, 'error');
      } else {
        showNotification(
          error.response?.data?.error || 'Failed to purchase course',
          'error'
        );
      }
    } finally {
      setPurchasingWithCredits(false);
    }
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <svg
            key={star}
            className={`w-5 h-5 ${
              star <= rating
                ? 'text-yellow-400 fill-yellow-400'
                : 'text-gray-300 dark:text-gray-600'
            }`}
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        ))}
        <span className="ml-2 text-sm text-gray-600 dark:text-gray-400">
          ({course?.numRatings} ratings)
        </span>
      </div>
    );
  };

  if (loading) {
    return (
      <>
        <Notification />
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 py-8 sm:py-12 px-4 sm:px-6 lg:px-8">
          <div className="max-w-6xl mx-auto">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl p-6 sm:p-8 animate-pulse">
              <div className="h-8 sm:h-10 bg-gray-200 dark:bg-gray-700 rounded mb-4 w-3/4" />
              <div className="h-5 sm:h-6 bg-gray-200 dark:bg-gray-700 rounded mb-6 sm:mb-8 w-1/2" />
              <div className="space-y-4">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded" />
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-5/6" />
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }

  if (!course) {
    return null;
  }

  const creditsNeeded = course.creditsRequired - userCredits;
  const referralsNeeded = Math.ceil(creditsNeeded / 2);

  return (
    <>
      <Notification />
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 py-8 sm:py-12 px-4 sm:px-6 lg:px-8 transition-colors">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            {/* Header Section */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl overflow-hidden mb-6 sm:mb-8">
              <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 sm:px-8 py-8 sm:py-12 text-white">
                <button
                  onClick={() => router.push('/')}
                  className="mb-4 flex items-center text-white/80 hover:text-white transition-colors text-sm sm:text-base"
                >
                  <svg
                    className="w-4 h-4 sm:w-5 sm:h-5 mr-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 19l-7-7 7-7"
                    />
                  </svg>
                  Back to Courses
                </button>
                <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold mb-2 sm:mb-3">{course.title}</h1>
                <p className="text-base sm:text-lg md:text-xl text-blue-100 mb-3 sm:mb-4">{course.description}</p>
                <div className="flex flex-wrap items-center gap-3 sm:gap-6">
                  <div className="flex items-center gap-2">
                    <svg
                      className="w-5 h-5 sm:w-6 sm:h-6"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                      />
                    </svg>
                    <span className="text-sm sm:text-base md:text-lg">{course.instructor}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <svg
                      className="w-5 h-5 sm:w-6 sm:h-6"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    <span className="text-sm sm:text-base md:text-lg">{course.courseHours} hours</span>
                  </div>
                  <div className="px-3 sm:px-4 py-1 bg-white/20 rounded-full text-xs sm:text-sm font-medium">
                    {course.level}
                  </div>
                </div>
              </div>

              <div className="px-6 sm:px-8 py-4 sm:py-6 bg-gray-50 dark:bg-gray-900/50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div>{renderStars(course.rating)}</div>
                <div className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
                  ₹{course.price}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
              {/* Main Content */}
              <div className="lg:col-span-2 space-y-6 sm:space-y-8">
                {/* Syllabus Section */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.1 }}
                  className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 sm:p-8"
                >
                  <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-4 sm:mb-6 flex items-center">
                    <svg
                      className="w-6 h-6 sm:w-7 sm:h-7 mr-3 text-blue-600 dark:text-blue-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"
                      />
                    </svg>
                    Course Syllabus
                  </h2>
                  <ul className="space-y-3">
                    {course.syllabus.map((topic, index) => (
                      <motion.li
                        key={index}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.3, delay: 0.1 + index * 0.05 }}
                        className="flex items-start gap-3 text-sm sm:text-base text-gray-700 dark:text-gray-300"
                      >
                        <span className="flex-shrink-0 w-7 h-7 sm:w-8 sm:h-8 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full flex items-center justify-center text-xs sm:text-sm font-semibold">
                          {index + 1}
                        </span>
                        <span className="pt-1">{topic}</span>
                      </motion.li>
                    ))}
                  </ul>
                </motion.div>
              </div>

              {/* Sidebar - Purchase Options */}
              <div className="lg:col-span-1">
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                  className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 sm:p-8 lg:sticky lg:top-8"
                >
                  <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-4 sm:mb-6">
                    Purchase Options
                  </h2>

                  {isPurchased ? (
                    <div className="text-center py-6 sm:py-8">
                      <div className="mb-4 inline-flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 bg-green-100 dark:bg-green-900/30 rounded-full">
                        <svg
                          className="w-8 h-8 sm:w-10 sm:h-10 text-green-600 dark:text-green-400"
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
                      </div>
                      <p className="text-lg sm:text-xl font-semibold text-green-700 dark:text-green-400">
                        Already Purchased
                      </p>
                      <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mt-2">
                        You have access to this course
                      </p>
                      <button
                        onClick={() => router.push('/my-courses')}
                        className="mt-6 w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors text-sm sm:text-base"
                      >
                        Go to My Courses
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-4 sm:space-y-6">
                      {/* Money Purchase Option */}
                      <div className="border-2 border-gray-200 dark:border-gray-700 rounded-lg p-4 sm:p-6">
                        <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-2">
                          Buy with Money
                        </h3>
                        <p className="text-2xl sm:text-3xl font-bold text-blue-600 dark:text-blue-400 mb-3 sm:mb-4">
                          ₹{course.price}
                        </p>
                        <button
                          onClick={handlePurchaseWithMoney}
                          disabled={purchasing || !session}
                          className={`w-full py-2.5 sm:py-3 rounded-lg font-medium transition-colors text-sm sm:text-base ${
                            purchasing || !session
                              ? 'bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed'
                              : 'bg-blue-600 hover:bg-blue-700 text-white'
                          }`}
                        >
                          {purchasing ? 'Processing...' : 'Purchase Now'}
                        </button>
                        {!session && (
                          <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-2 text-center">
                            Please login to purchase
                          </p>
                        )}
                      </div>

                      {/* Credits Purchase Option */}
                      <div className="border-2 border-blue-500 dark:border-blue-600 rounded-lg p-4 sm:p-6 bg-blue-50/50 dark:bg-blue-900/10">
                        <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-2">
                          Buy with Credits
                        </h3>
                        <p className="text-2xl sm:text-3xl font-bold text-blue-600 dark:text-blue-400 mb-2">
                          {course.creditsRequired} Credits
                        </p>
                        {session && (
                          <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mb-3 sm:mb-4">
                            You have: <span className="font-semibold">{userCredits} credits</span>
                          </p>
                        )}

                        {session && userCredits < course.creditsRequired && (
                          <div className="mb-3 sm:mb-4 p-3 sm:p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                            <p className="text-xs sm:text-sm text-yellow-800 dark:text-yellow-300 font-medium">
                              ⚠️ Refer {referralsNeeded} more user{referralsNeeded > 1 ? 's' : ''} to buy this course
                            </p>
                            <p className="text-xs text-yellow-700 dark:text-yellow-400 mt-1">
                              You need {creditsNeeded} more credits
                            </p>
                          </div>
                        )}

                        <button
                          onClick={handlePurchaseWithCredits}
                          disabled={
                            purchasingWithCredits ||
                            !session ||
                            userCredits < course.creditsRequired
                          }
                          className={`w-full py-2.5 sm:py-3 rounded-lg font-medium transition-colors text-sm sm:text-base ${
                            purchasingWithCredits ||
                            !session ||
                            userCredits < course.creditsRequired
                              ? 'bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed'
                              : 'bg-blue-600 hover:bg-blue-700 text-white'
                          }`}
                        >
                          {purchasingWithCredits
                            ? 'Processing...'
                            : userCredits >= course.creditsRequired
                            ? 'Purchase with Credits'
                            : 'Not Enough Credits'}
                        </button>

                        {!session && (
                          <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-2 text-center">
                            Please login to use credits
                          </p>
                        )}

                        {session && (
                          <button
                            onClick={() => router.push('/dashboard')}
                            className="w-full mt-3 py-2 text-xs sm:text-sm text-blue-600 dark:text-blue-400 hover:underline"
                          >
                            View Referral Link
                          </button>
                        )}
                      </div>

                      {/* Info Box */}
                      <div className="bg-gray-100 dark:bg-gray-700/50 rounded-lg p-3 sm:p-4">
                        <p className="text-xs sm:text-sm text-gray-700 dark:text-gray-300">
                          💡 <span className="font-semibold">Earn credits:</span> Share your referral
                          link! You earn 2 credits when someone signs up and makes their first
                          purchase.
                        </p>
                      </div>
                    </div>
                  )}
                </motion.div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </>
  );
}
