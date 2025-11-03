'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { dashboardAPI, setAuthToken } from '@/lib/api';
import { useNotificationStore } from '@/store/useStore';
import Notification from '@/components/ui/Notification';

interface DashboardStats {
  totalReferredUsers: number;
  convertedUsers: number;
  totalCreditsEarned: number;
  referralLink: string;
  referralCode: string;
  username: string;
}

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const { showNotification } = useNotificationStore();

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    } else if (status === 'authenticated') {
      fetchStats();
    }
  }, [status, router]);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const token = (session as any)?.accessToken;
      if (token) {
        setAuthToken(token);
        const response = await dashboardAPI.getStats();
        setStats(response.data);
      }
    } catch (error: any) {
      showNotification(
        error.response?.data?.error || 'Failed to fetch dashboard stats',
        'error'
      );
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = async () => {
    if (stats?.referralLink) {
      try {
        await navigator.clipboard.writeText(stats.referralLink);
        setCopied(true);
        showNotification('Referral link copied to clipboard!', 'success');
        setTimeout(() => setCopied(false), 2000);
      } catch (error) {
        showNotification('Failed to copy link', 'error');
      }
    }
  };

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center transition-colors">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary-600 dark:border-primary-400 mx-auto" />
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (!stats) return null;

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
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-gray-900 dark:text-white mb-3 sm:mb-4">
              Welcome back, {stats.username}!
            </h1>
            <p className="text-base sm:text-lg md:text-xl text-gray-600 dark:text-gray-300">
              Here's your referral performance dashboard
            </p>
          </motion.div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8 mb-8 sm:mb-12">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-5 sm:p-6"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Total Referrals</p>
                  <p className="text-3xl sm:text-4xl font-bold text-primary-600 dark:text-primary-400">{stats.totalReferredUsers}</p>
                </div>
                <div className="text-4xl sm:text-5xl">👥</div>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-3 sm:mt-4">
                Users who signed up with your link
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-5 sm:p-6"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Converted Users</p>
                  <p className="text-3xl sm:text-4xl font-bold text-green-600 dark:text-green-400">{stats.convertedUsers}</p>
                </div>
                <div className="text-4xl sm:text-5xl">✅</div>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-3 sm:mt-4">
                Referrals who made their first purchase
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-5 sm:p-6 sm:col-span-2 lg:col-span-1"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Total Credits</p>
                  <p className="text-3xl sm:text-4xl font-bold text-purple-600 dark:text-purple-400">{stats.totalCreditsEarned}</p>
                </div>
                <div className="text-4xl sm:text-5xl">💎</div>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-3 sm:mt-4">
                Credits earned from referrals
              </p>
            </motion.div>
          </div>

          {/* Referral Link Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 sm:p-8"
          >
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-3 sm:mb-4">Your Referral Link</h2>
            <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300 mb-4 sm:mb-6">
              Share this link with your friends to earn credits when they make their first purchase!
            </p>
            
            <div className="flex flex-col gap-3 sm:gap-4">
              <input
                type="text"
                readOnly
                value={stats.referralLink}
                className="flex-1 px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 dark:border-gray-600 rounded-md bg-gray-50 dark:bg-gray-700 text-gray-700 dark:text-gray-300 font-mono text-xs sm:text-sm break-all"
              />
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={copyToClipboard}
                className={`w-full sm:w-auto px-6 py-2 sm:py-3 rounded-md font-medium transition-colors ${
                  copied
                    ? 'bg-green-500 text-white'
                    : 'bg-primary-600 dark:bg-primary-500 text-white hover:bg-primary-700 dark:hover:bg-primary-600'
                }`}
              >
                {copied ? '✓ Copied!' : 'Copy Link'}
              </motion.button>
            </div>

            <div className="mt-4 sm:mt-6 p-4 bg-blue-50 dark:bg-gray-700 rounded-md">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2 text-sm sm:text-base">How it works:</h3>
              <ol className="list-decimal list-inside space-y-1 text-xs sm:text-sm text-gray-700 dark:text-gray-300">
                <li>Share your unique referral link with friends</li>
                <li>They sign up using your link</li>
                <li>When they make their first purchase, you both earn 2 credits!</li>
              </ol>
            </div>
          </motion.div>
        </div>
      </div>
    </>
  );
}
