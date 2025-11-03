'use client';

import { useState, useRef, useEffect } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  User, 
  LogOut, 
  Copy, 
  BookOpen, 
  Check,
  Settings
} from 'lucide-react';
import { apiClient } from '@/lib/api';
import { useRouter } from 'next/navigation';

interface UserDropdownProps {
  mobile?: boolean;
  onClose?: () => void;
}

export default function UserDropdown({ mobile = false, onClose }: UserDropdownProps = {}) {
  const { data: session } = useSession();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
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

  const handleEditProfile = () => {
    router.push('/profile');
    setIsOpen(false);
    if (onClose) onClose();
  };

  const handleViewCourses = () => {
    router.push('/my-courses');
    setIsOpen(false);
    if (onClose) onClose();
  };

  const handleSignOut = () => {
    signOut({ callbackUrl: '/login' });
    if (onClose) onClose();
  };

  // If mobile mode, render as a list instead of dropdown
  if (mobile) {
    return (
      <div className="space-y-2 px-3">
        <div className="pb-3 mb-3 border-b border-gray-200 dark:border-gray-700">
          <p className="text-xs text-gray-500 dark:text-gray-400">Signed in as</p>
          <p className="font-semibold text-gray-900 dark:text-white text-sm">{session?.user?.name}</p>
          <p className="text-xs text-gray-600 dark:text-gray-300 break-all">{session?.user?.email}</p>
        </div>
        
        <button
          onClick={handleEditProfile}
          className="w-full flex items-center gap-3 px-3 py-2 text-left text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md transition-colors"
        >
          <Settings size={18} />
          <span>Edit Profile</span>
        </button>

        <button
          onClick={handleViewCourses}
          className="w-full flex items-center gap-3 px-3 py-2 text-left text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md transition-colors"
        >
          <BookOpen size={18} />
          <span>My Courses</span>
        </button>

        <button
          onClick={handleCopyReferralCode}
          className="w-full flex items-center gap-3 px-3 py-2 text-left text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md transition-colors"
        >
          {copied ? <Check size={18} className="text-green-500" /> : <Copy size={18} />}
          <span>{copied ? 'Copied!' : 'Copy Referral Link'}</span>
        </button>

        <button
          onClick={handleSignOut}
          className="w-full flex items-center gap-3 px-3 py-2 text-left text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md transition-colors"
        >
          <LogOut size={18} />
          <span>Logout</span>
        </button>
      </div>
    );
  }

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
            className="absolute right-0 mt-2 w-80 max-w-[calc(100vw-2rem)] bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 z-50 overflow-hidden"
          >
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
              <p className="text-sm text-gray-500 dark:text-gray-400">Signed in as</p>
              <p className="font-semibold text-gray-900 dark:text-white">{session?.user?.name}</p>
              <p className="text-sm text-gray-600 dark:text-gray-300 break-all">{session?.user?.email}</p>
            </div>

            <div className="p-2">
              {/* Edit Profile */}
              <button
                onClick={handleEditProfile}
                className="w-full flex items-center gap-3 px-3 py-2 text-left text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors"
              >
                <Settings size={18} />
                <span>Edit Profile</span>
              </button>

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
                onClick={handleSignOut}
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
