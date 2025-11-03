'use client';

// This is an EXAMPLE of how your enhanced homepage could look
// Copy the parts you need and integrate with your existing page.tsx

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useSession } from 'next-auth/react';
import EnhancedCourseCard from '@/components/courses/EnhancedCourseCard';
import SearchFilter, { FilterOptions } from '@/components/courses/SearchFilter';
import HeroSection from '@/components/home/HeroSection';
import StatsSection from '@/components/home/StatsSection';
import HowItWorksSection from '@/components/home/HowItWorksSection';
import SocialProofNotifications from '@/components/home/SocialProofNotifications';
import Notification from '@/components/ui/Notification';
import { coursesAPI, apiClient } from '@/lib/api';
import { useLoadingStore } from '@/store/useStore';

interface Course {
  _id: string;
  title: string;
  description: string;
  price: number;
  instructor?: string;
  level?: string;
  rating?: number;
  numRatings?: number;
  courseHours?: number;
}

export default function EnhancedHomePage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [filteredCourses, setFilteredCourses] = useState<Course[]>([]);
  const [purchasedCourseIds, setPurchasedCourseIds] = useState<string[]>([]);
  const { isLoading, setLoading } = useLoadingStore();
  const { data: session, status } = useSession();
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState<FilterOptions>({
    level: [],
    priceRange: { min: 0, max: 1000 },
    rating: 0,
    sortBy: 'newest',
  });

  useEffect(() => {
    fetchCourses();
  }, []);

  useEffect(() => {
    if (status === 'authenticated') {
      fetchPurchasedCourses();
    }
  }, [status]);

  useEffect(() => {
    // Apply filters whenever courses, search, or filters change
    applyFilters();
  }, [courses, searchTerm, filters]);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      const response = await coursesAPI.getAll();
      setCourses(response.data || []);
      setFilteredCourses(response.data || []);
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

  const applyFilters = () => {
    let result = [...courses];

    // Search filter
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      result = result.filter(
        (course) =>
          course.title.toLowerCase().includes(searchLower) ||
          course.description.toLowerCase().includes(searchLower) ||
          (course.instructor && course.instructor.toLowerCase().includes(searchLower))
      );
    }

    // Level filter
    if (filters.level.length > 0) {
      result = result.filter((course) =>
        filters.level.includes(course.level || 'Beginner')
      );
    }

    // Price range filter
    result = result.filter(
      (course) =>
        course.price >= filters.priceRange.min &&
        course.price <= filters.priceRange.max
    );

    // Rating filter
    if (filters.rating > 0) {
      result = result.filter((course) => (course.rating || 0) >= filters.rating);
    }

    // Sort
    switch (filters.sortBy) {
      case 'price-low':
        result.sort((a, b) => a.price - b.price);
        break;
      case 'price-high':
        result.sort((a, b) => b.price - a.price);
        break;
      case 'rating':
        result.sort((a, b) => (b.rating || 0) - (a.rating || 0));
        break;
      case 'duration':
        result.sort((a, b) => (b.courseHours || 0) - (a.courseHours || 0));
        break;
      default: // newest
        // Courses come newest first from API
        break;
    }

    setFilteredCourses(result);
  };

  const handleSearch = (term: string) => {
    setSearchTerm(term);
  };

  const handleFilterChange = (newFilters: FilterOptions) => {
    setFilters(newFilters);
  };

  return (
    <>
      <Notification />
      <SocialProofNotifications />

      {/* Hero Section */}
      <HeroSection />

      {/* Stats Section */}
      <StatsSection />

      {/* Main Course Section */}
      <div className="bg-white dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8 transition-colors">
        <div className="max-w-7xl mx-auto">
          {/* Section Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            id="courses"
            className="mb-8"
          >
            <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 dark:text-white mb-4">
              Explore Our Courses
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300">
              Choose from our wide range of courses and start learning today
            </p>
          </motion.div>

          {/* Search and Filter */}
          <SearchFilter
            onSearch={handleSearch}
            onFilterChange={handleFilterChange}
            totalResults={filteredCourses.length}
          />

          {/* Course Grid */}
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
          ) : filteredCourses.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-16"
            >
              <div className="inline-flex items-center justify-center w-20 h-20 bg-gray-100 dark:bg-gray-800 rounded-full mb-4">
                <svg
                  className="w-10 h-10 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                No courses found
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Try adjusting your search or filters
              </p>
              <button
                onClick={() => {
                  setSearchTerm('');
                  setFilters({
                    level: [],
                    priceRange: { min: 0, max: 1000 },
                    rating: 0,
                    sortBy: 'newest',
                  });
                }}
                className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
              >
                Clear Filters
              </button>
            </motion.div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
              {filteredCourses.map((course, index) => (
                <EnhancedCourseCard
                  key={course._id}
                  course={course}
                  isPurchased={purchasedCourseIds.includes(course._id)}
                  index={index}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* How It Works Section */}
      <HowItWorksSection />

      {/* Testimonials Section (Optional - add when you have reviews) */}
      {/* <TestimonialsSection /> */}

      {/* CTA Section */}
      <section className="bg-gradient-to-r from-blue-600 to-purple-600 py-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-4xl font-extrabold text-white mb-4">
              Ready to Start Learning?
            </h2>
            <p className="text-xl text-blue-100 mb-8">
              Join thousands of students and start your learning journey today!
            </p>
            <motion.a
              href="/register"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="inline-block px-8 py-4 bg-white text-blue-600 rounded-xl font-bold text-lg shadow-xl hover:shadow-2xl transition-all"
            >
              Sign Up Free
            </motion.a>
          </motion.div>
        </div>
      </section>
    </>
  );
}
