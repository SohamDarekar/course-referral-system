'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { User, Mail, Key, ArrowLeft, Check, X } from 'lucide-react';
import { apiClient } from '@/lib/api';
import { useNotificationStore } from '@/store/useStore';
import Notification from '@/components/ui/Notification';

export default function ProfilePage() {
  const { data: session, status, update } = useSession();
  const router = useRouter();
  const { showNotification } = useNotificationStore();

  // Username states
  const [newUsername, setNewUsername] = useState('');
  const [usernameError, setUsernameError] = useState('');
  const [usernameSuccess, setUsernameSuccess] = useState(false);
  const [isUpdatingUsername, setIsUpdatingUsername] = useState(false);

  // Email states
  const [newEmail, setNewEmail] = useState('');
  const [emailError, setEmailError] = useState('');
  const [emailSuccess, setEmailSuccess] = useState(false);
  const [isUpdatingEmail, setIsUpdatingEmail] = useState(false);

  // Password states
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState(false);
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);

  if (status === 'unauthenticated') {
    router.push('/login');
    return null;
  }

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading profile...</p>
        </div>
      </div>
    );
  }

  const handleUsernameChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setUsernameError('');
    setUsernameSuccess(false);
    
    if (!newUsername || newUsername.length < 3) {
      setUsernameError('Username must be at least 3 characters');
      return;
    }

    setIsUpdatingUsername(true);
    try {
      // Check if username is available
      const checkResponse = await apiClient.post('/api/user/check-username', {
        username: newUsername,
      });

      if (!checkResponse.data.available) {
        setUsernameError('Username is already taken');
        return;
      }

      // Update username
      await apiClient.put(
        '/api/user/username',
        { username: newUsername },
        {
          headers: {
            Authorization: `Bearer ${(session as any).accessToken}`,
          },
        }
      );

      // Update session
      await update({
        ...session,
        user: {
          ...session?.user,
          name: newUsername,
        },
      });

      setUsernameSuccess(true);
      showNotification('Username updated successfully!', 'success');
      setNewUsername('');
      setTimeout(() => setUsernameSuccess(false), 3000);
    } catch (error: any) {
      setUsernameError(error.response?.data?.error || 'Failed to update username');
      showNotification('Failed to update username', 'error');
    } finally {
      setIsUpdatingUsername(false);
    }
  };

  const handleEmailChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setEmailError('');
    setEmailSuccess(false);

    if (!newEmail) {
      setEmailError('Email is required');
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(newEmail)) {
      setEmailError('Invalid email format');
      return;
    }

    setIsUpdatingEmail(true);
    try {
      await apiClient.put(
        '/api/user/email',
        { email: newEmail },
        {
          headers: {
            Authorization: `Bearer ${(session as any).accessToken}`,
          },
        }
      );

      // Update session
      await update({
        ...session,
        user: {
          ...session?.user,
          email: newEmail,
        },
      });

      setEmailSuccess(true);
      showNotification('Email updated successfully!', 'success');
      setNewEmail('');
      setTimeout(() => setEmailSuccess(false), 3000);
    } catch (error: any) {
      setEmailError(error.response?.data?.error || 'Failed to update email');
      showNotification('Failed to update email', 'error');
    } finally {
      setIsUpdatingEmail(false);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError('');
    setPasswordSuccess(false);

    if (!currentPassword || !newPassword || !confirmPassword) {
      setPasswordError('All fields are required');
      return;
    }

    if (newPassword.length < 6) {
      setPasswordError('New password must be at least 6 characters');
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError('New passwords do not match');
      return;
    }

    setIsUpdatingPassword(true);
    try {
      await apiClient.put(
        '/api/user/password',
        {
          currentPassword,
          newPassword,
        },
        {
          headers: {
            Authorization: `Bearer ${(session as any).accessToken}`,
          },
        }
      );

      setPasswordSuccess(true);
      showNotification('Password updated successfully!', 'success');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setTimeout(() => setPasswordSuccess(false), 3000);
    } catch (error: any) {
      setPasswordError(error.response?.data?.error || 'Failed to update password');
      showNotification('Failed to update password', 'error');
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  return (
    <>
      <Notification />
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 py-8 sm:py-12 px-4 sm:px-6 lg:px-8 transition-colors">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-6 sm:mb-8">
            <button
              onClick={() => router.back()}
              className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 mb-4 transition-colors"
            >
              <ArrowLeft size={20} />
              <span className="text-sm sm:text-base">Back</span>
            </button>
            
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-2">
              Edit Profile
            </h1>
            <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
              Update your account information
            </p>
          </div>

          {/* Current User Info */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 sm:p-8 mb-6"
          >
            <h2 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Current Information
            </h2>
            <div className="space-y-3">
              <div className="flex items-center gap-3 text-gray-700 dark:text-gray-300">
                <User size={20} className="text-primary-600 dark:text-primary-400" />
                <div>
                  <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">Username</p>
                  <p className="font-medium">{session?.user?.name}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 text-gray-700 dark:text-gray-300">
                <Mail size={20} className="text-primary-600 dark:text-primary-400" />
                <div>
                  <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">Email</p>
                  <p className="font-medium break-all">{session?.user?.email}</p>
                </div>
              </div>
            </div>
          </motion.div>

          <div className="space-y-6">
            {/* Change Username */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 sm:p-8"
            >
              <div className="flex items-center gap-3 mb-4 sm:mb-6">
                <User size={24} className="text-primary-600 dark:text-primary-400" />
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
                  Change Username
                </h2>
              </div>
              
              <form onSubmit={handleUsernameChange} className="space-y-4">
                <div>
                  <label htmlFor="newUsername" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    New Username
                  </label>
                  <input
                    type="text"
                    id="newUsername"
                    value={newUsername}
                    onChange={(e) => setNewUsername(e.target.value)}
                    placeholder="Enter new username"
                    className="w-full px-4 py-2.5 sm:py-3 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent text-base"
                  />
                  {usernameError && (
                    <p className="mt-2 text-sm text-red-500 flex items-center gap-1">
                      <X size={16} />
                      {usernameError}
                    </p>
                  )}
                  {usernameSuccess && (
                    <p className="mt-2 text-sm text-green-500 flex items-center gap-1">
                      <Check size={16} />
                      Username updated successfully!
                    </p>
                  )}
                </div>
                
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  disabled={isUpdatingUsername}
                  className={`w-full sm:w-auto px-6 py-2.5 sm:py-3 rounded-md font-medium transition-colors text-sm sm:text-base ${
                    isUpdatingUsername
                      ? 'bg-gray-400 cursor-not-allowed text-white'
                      : 'bg-primary-600 text-white hover:bg-primary-700'
                  }`}
                >
                  {isUpdatingUsername ? 'Updating...' : 'Update Username'}
                </motion.button>
              </form>
            </motion.div>

            {/* Change Email */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 sm:p-8"
            >
              <div className="flex items-center gap-3 mb-4 sm:mb-6">
                <Mail size={24} className="text-primary-600 dark:text-primary-400" />
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
                  Change Email
                </h2>
              </div>
              
              <form onSubmit={handleEmailChange} className="space-y-4">
                <div>
                  <label htmlFor="newEmail" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    New Email Address
                  </label>
                  <input
                    type="email"
                    id="newEmail"
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    placeholder="Enter new email"
                    className="w-full px-4 py-2.5 sm:py-3 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent text-base"
                  />
                  {emailError && (
                    <p className="mt-2 text-sm text-red-500 flex items-center gap-1">
                      <X size={16} />
                      {emailError}
                    </p>
                  )}
                  {emailSuccess && (
                    <p className="mt-2 text-sm text-green-500 flex items-center gap-1">
                      <Check size={16} />
                      Email updated successfully!
                    </p>
                  )}
                </div>
                
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  disabled={isUpdatingEmail}
                  className={`w-full sm:w-auto px-6 py-2.5 sm:py-3 rounded-md font-medium transition-colors text-sm sm:text-base ${
                    isUpdatingEmail
                      ? 'bg-gray-400 cursor-not-allowed text-white'
                      : 'bg-primary-600 text-white hover:bg-primary-700'
                  }`}
                >
                  {isUpdatingEmail ? 'Updating...' : 'Update Email'}
                </motion.button>
              </form>
            </motion.div>

            {/* Change Password */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 sm:p-8"
            >
              <div className="flex items-center gap-3 mb-4 sm:mb-6">
                <Key size={24} className="text-primary-600 dark:text-primary-400" />
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
                  Change Password
                </h2>
              </div>
              
              <form onSubmit={handlePasswordChange} className="space-y-4">
                <div>
                  <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Current Password
                  </label>
                  <input
                    type="password"
                    id="currentPassword"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="Enter current password"
                    className="w-full px-4 py-2.5 sm:py-3 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent text-base"
                  />
                </div>

                <div>
                  <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    New Password
                  </label>
                  <input
                    type="password"
                    id="newPassword"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Enter new password"
                    className="w-full px-4 py-2.5 sm:py-3 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent text-base"
                  />
                </div>

                <div>
                  <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Confirm New Password
                  </label>
                  <input
                    type="password"
                    id="confirmPassword"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm new password"
                    className="w-full px-4 py-2.5 sm:py-3 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent text-base"
                  />
                </div>

                {passwordError && (
                  <p className="text-sm text-red-500 flex items-center gap-1">
                    <X size={16} />
                    {passwordError}
                  </p>
                )}
                {passwordSuccess && (
                  <p className="text-sm text-green-500 flex items-center gap-1">
                    <Check size={16} />
                    Password updated successfully!
                  </p>
                )}
                
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  disabled={isUpdatingPassword}
                  className={`w-full sm:w-auto px-6 py-2.5 sm:py-3 rounded-md font-medium transition-colors text-sm sm:text-base ${
                    isUpdatingPassword
                      ? 'bg-gray-400 cursor-not-allowed text-white'
                      : 'bg-primary-600 text-white hover:bg-primary-700'
                  }`}
                >
                  {isUpdatingPassword ? 'Updating...' : 'Update Password'}
                </motion.button>
              </form>
            </motion.div>
          </div>
        </div>
      </div>
    </>
  );
}
