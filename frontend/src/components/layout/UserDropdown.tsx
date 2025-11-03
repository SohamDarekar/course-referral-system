'use client';

import { useState, useRef, useEffect } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  User, 
  LogOut, 
  Key, 
  Copy, 
  BookOpen, 
  Check,
  X,
  Mail
} from 'lucide-react';
import { apiClient } from '@/lib/api';
import { useRouter } from 'next/navigation';

export default function UserDropdown() {
  const { data: session, update } = useSession();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [showUsernameEdit, setShowUsernameEdit] = useState(false);
  const [showEmailEdit, setShowEmailEdit] = useState(false);
  const [showPasswordEdit, setShowPasswordEdit] = useState(false);
  const [newUsername, setNewUsername] = useState('');
  const [usernameError, setUsernameError] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [emailError, setEmailError] = useState('');
  const [emailSuccess, setEmailSuccess] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState(false);
  const [copied, setCopied] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setShowUsernameEdit(false);
        setShowEmailEdit(false);
        setShowPasswordEdit(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleCopyReferralCode = async () => {
    if (session?.user) {
      try {
        const response = await apiClient.get('/api/user/profile', {
          headers: {
            Authorization: `Bearer ${(session as any).accessToken}`,
          },
        });
        const referralCode = response.data.user.referralCode;
        const referralLink = `${window.location.origin}/register?ref=${referralCode}`;
        await navigator.clipboard.writeText(referralLink);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (error) {
        console.error('Failed to copy referral link:', error);
      }
    }
  };

  const handleUsernameChange = async () => {
    setUsernameError('');
    
    if (!newUsername || newUsername.length < 3) {
      setUsernameError('Username must be at least 3 characters');
      return;
    }

    try {
      // Check if username is available
      const checkResponse = await apiClient.post('/api/user/check-username', {
        username: newUsername,
      });

      if (!checkResponse.data.available) {
        setUsernameError('Username is taken');
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

      setShowUsernameEdit(false);
      setNewUsername('');
    } catch (error: any) {
      setUsernameError(error.response?.data?.error || 'Failed to update username');
    }
  };

  const handlePasswordChange = async () => {
    setPasswordError('');
    setPasswordSuccess(false);

    if (!currentPassword || !newPassword) {
      setPasswordError('Both fields are required');
      return;
    }

    if (newPassword.length < 6) {
      setPasswordError('New password must be at least 6 characters');
      return;
    }

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
      setCurrentPassword('');
      setNewPassword('');
      setTimeout(() => {
        setShowPasswordEdit(false);
        setPasswordSuccess(false);
      }, 2000);
    } catch (error: any) {
      setPasswordError(error.response?.data?.error || 'Failed to update password');
    }
  };

  const handleEmailChange = async () => {
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
      setNewEmail('');
      setTimeout(() => {
        setShowEmailEdit(false);
        setEmailSuccess(false);
      }, 2000);
    } catch (error: any) {
      setEmailError(error.response?.data?.error || 'Failed to update email');
    }
  };

  const handleViewCourses = () => {
    router.push('/my-courses');
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 rounded-full bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-300 hover:bg-primary-200 dark:hover:bg-primary-800 transition-colors"
        aria-label="User menu"
      >
        <User size={20} />
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="absolute right-0 mt-2 w-80 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 z-50 overflow-hidden"
          >
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
              <p className="text-sm text-gray-500 dark:text-gray-400">Signed in as</p>
              <p className="font-semibold text-gray-900 dark:text-white">{session?.user?.name}</p>
              <p className="text-sm text-gray-600 dark:text-gray-300">{session?.user?.email}</p>
            </div>

            <div className="p-2">
              {/* Change Username */}
              <button
                onClick={() => {
                  setShowUsernameEdit(!showUsernameEdit);
                  setShowEmailEdit(false);
                  setShowPasswordEdit(false);
                  setUsernameError('');
                }}
                className="w-full flex items-center gap-3 px-3 py-2 text-left text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors"
              >
                <User size={18} />
                <span>Change Username</span>
              </button>

              {showUsernameEdit && (
                <div className="px-3 py-2 space-y-2">
                  <input
                    type="text"
                    value={newUsername}
                    onChange={(e) => setNewUsername(e.target.value)}
                    placeholder="New username"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                  {usernameError && (
                    <p className="text-sm text-red-500">{usernameError}</p>
                  )}
                  <div className="flex gap-2">
                    <button
                      onClick={handleUsernameChange}
                      className="flex-1 px-3 py-1.5 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors text-sm"
                    >
                      Save
                    </button>
                    <button
                      onClick={() => {
                        setShowUsernameEdit(false);
                        setNewUsername('');
                        setUsernameError('');
                      }}
                      className="px-3 py-1.5 bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors text-sm"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}

              {/* Change Email */}
              <button
                onClick={() => {
                  setShowEmailEdit(!showEmailEdit);
                  setShowUsernameEdit(false);
                  setShowPasswordEdit(false);
                  setEmailError('');
                  setEmailSuccess(false);
                }}
                className="w-full flex items-center gap-3 px-3 py-2 text-left text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors"
              >
                <Mail size={18} />
                <span>Change Email</span>
              </button>

              {showEmailEdit && (
                <div className="px-3 py-2 space-y-2">
                  <input
                    type="email"
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    placeholder="New email"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                  {emailError && (
                    <p className="text-sm text-red-500">{emailError}</p>
                  )}
                  {emailSuccess && (
                    <p className="text-sm text-green-500 flex items-center gap-1">
                      <Check size={16} />
                      Email updated successfully!
                    </p>
                  )}
                  <div className="flex gap-2">
                    <button
                      onClick={handleEmailChange}
                      className="flex-1 px-3 py-1.5 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors text-sm"
                    >
                      Save
                    </button>
                    <button
                      onClick={() => {
                        setShowEmailEdit(false);
                        setNewEmail('');
                        setEmailError('');
                        setEmailSuccess(false);
                      }}
                      className="px-3 py-1.5 bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors text-sm"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}

              {/* Change Password */}
              <button
                onClick={() => {
                  setShowPasswordEdit(!showPasswordEdit);
                  setShowUsernameEdit(false);
                  setShowEmailEdit(false);
                  setPasswordError('');
                  setPasswordSuccess(false);
                }}
                className="w-full flex items-center gap-3 px-3 py-2 text-left text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors"
              >
                <Key size={18} />
                <span>Change Password</span>
              </button>

              {showPasswordEdit && (
                <div className="px-3 py-2 space-y-2">
                  <input
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="Current password"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="New password"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                  {passwordError && (
                    <p className="text-sm text-red-500">{passwordError}</p>
                  )}
                  {passwordSuccess && (
                    <p className="text-sm text-green-500 flex items-center gap-1">
                      <Check size={16} />
                      Password updated successfully!
                    </p>
                  )}
                  <div className="flex gap-2">
                    <button
                      onClick={handlePasswordChange}
                      className="flex-1 px-3 py-1.5 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors text-sm"
                    >
                      Save
                    </button>
                    <button
                      onClick={() => {
                        setShowPasswordEdit(false);
                        setCurrentPassword('');
                        setNewPassword('');
                        setPasswordError('');
                        setPasswordSuccess(false);
                      }}
                      className="px-3 py-1.5 bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors text-sm"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}

              {/* View Purchased Courses */}
              <button
                onClick={handleViewCourses}
                className="w-full flex items-center gap-3 px-3 py-2 text-left text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors"
              >
                <BookOpen size={18} />
                <span>My Courses</span>
              </button>

              {/* Copy Referral Code */}
              <button
                onClick={handleCopyReferralCode}
                className="w-full flex items-center gap-3 px-3 py-2 text-left text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors"
              >
                {copied ? <Check size={18} className="text-green-500" /> : <Copy size={18} />}
                <span>{copied ? 'Copied!' : 'Copy Referral Link'}</span>
              </button>

              {/* Logout */}
              <button
                onClick={() => signOut({ callbackUrl: '/login' })}
                className="w-full flex items-center gap-3 px-3 py-2 text-left text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md transition-colors"
              >
                <LogOut size={18} />
                <span>Logout</span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
