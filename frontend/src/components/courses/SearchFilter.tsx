'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface SearchFilterProps {
  onSearch: (searchTerm: string) => void;
  onFilterChange: (filters: FilterOptions) => void;
  totalResults: number;
}

export interface FilterOptions {
  level: string[];
  priceRange: { min: number; max: number };
  rating: number;
  sortBy: string;
}

export default function SearchFilter({ onSearch, onFilterChange, totalResults }: SearchFilterProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<FilterOptions>({
    level: [],
    priceRange: { min: 0, max: 1000 },
    rating: 0,
    sortBy: 'newest',
  });

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTerm(value);
    onSearch(value);
  };

  const handleLevelToggle = (level: string) => {
    const newLevels = filters.level.includes(level)
      ? filters.level.filter((l) => l !== level)
      : [...filters.level, level];
    
    const newFilters = { ...filters, level: newLevels };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const handlePriceChange = (type: 'min' | 'max', value: string) => {
    const numValue = parseInt(value) || 0;
    const newFilters = {
      ...filters,
      priceRange: { ...filters.priceRange, [type]: numValue },
    };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const handleRatingChange = (rating: number) => {
    const newFilters = { ...filters, rating };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const handleSortChange = (sortBy: string) => {
    const newFilters = { ...filters, sortBy };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const clearFilters = () => {
    const resetFilters = {
      level: [],
      priceRange: { min: 0, max: 1000 },
      rating: 0,
      sortBy: 'newest',
    };
    setFilters(resetFilters);
    setSearchTerm('');
    onSearch('');
    onFilterChange(resetFilters);
  };

  const activeFilterCount = filters.level.length + (filters.rating > 0 ? 1 : 0);

  return (
    <div className="mb-8">
      {/* Search Bar */}
      <div className="relative mb-4">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative"
        >
          <input
            type="text"
            value={searchTerm}
            onChange={handleSearchChange}
            placeholder="Search courses by title, instructor, or description..."
            className="w-full px-5 py-4 pl-12 pr-4 text-gray-900 dark:text-white bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all shadow-sm"
          />
          <svg
            className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400"
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
        </motion.div>
      </div>

      {/* Filter Toggle & Sort */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-3">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 rounded-lg hover:border-blue-500 dark:hover:border-blue-500 transition-colors"
          >
            <svg
              className="w-5 h-5 text-gray-600 dark:text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
              />
            </svg>
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Filters
              {activeFilterCount > 0 && (
                <span className="ml-1 px-2 py-0.5 bg-blue-500 text-white text-xs rounded-full">
                  {activeFilterCount}
                </span>
              )}
            </span>
          </motion.button>

          {activeFilterCount > 0 && (
            <motion.button
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              onClick={clearFilters}
              className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
            >
              Clear all
            </motion.button>
          )}
        </div>

        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600 dark:text-gray-400">
            {totalResults} {totalResults === 1 ? 'course' : 'courses'}
          </span>
          <select
            value={filters.sortBy}
            onChange={(e) => handleSortChange(e.target.value)}
            className="px-3 py-2 bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
          >
            <option value="newest">Newest</option>
            <option value="price-low">Price: Low to High</option>
            <option value="price-high">Price: High to Low</option>
            <option value="rating">Highest Rated</option>
            <option value="duration">Duration</option>
          </select>
        </div>
      </div>

      {/* Filter Panel */}
      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className="bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 rounded-xl p-6 space-y-6">
              {/* Level Filter */}
              <div>
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
                  Level
                </h3>
                <div className="flex flex-wrap gap-2">
                  {['Beginner', 'Intermediate', 'Advanced'].map((level) => (
                    <motion.button
                      key={level}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleLevelToggle(level)}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                        filters.level.includes(level)
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                      }`}
                    >
                      {level}
                    </motion.button>
                  ))}
                </div>
              </div>

              {/* Price Range */}
              <div>
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
                  Price Range
                </h3>
                <div className="flex items-center gap-3">
                  <div className="flex-1">
                    <label className="text-xs text-gray-600 dark:text-gray-400 mb-1 block">
                      Min
                    </label>
                    <input
                      type="number"
                      value={filters.priceRange.min}
                      onChange={(e) => handlePriceChange('min', e.target.value)}
                      className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-sm"
                      placeholder="$0"
                    />
                  </div>
                  <span className="text-gray-400 mt-5">-</span>
                  <div className="flex-1">
                    <label className="text-xs text-gray-600 dark:text-gray-400 mb-1 block">
                      Max
                    </label>
                    <input
                      type="number"
                      value={filters.priceRange.max}
                      onChange={(e) => handlePriceChange('max', e.target.value)}
                      className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-sm"
                      placeholder="$1000"
                    />
                  </div>
                </div>
              </div>

              {/* Rating Filter */}
              <div>
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
                  Minimum Rating
                </h3>
                <div className="flex gap-2">
                  {[4, 3, 2, 1].map((rating) => (
                    <motion.button
                      key={rating}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleRatingChange(rating)}
                      className={`flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                        filters.rating === rating
                          ? 'bg-yellow-400 text-gray-900'
                          : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                      }`}
                    >
                      <span>{rating}</span>
                      <svg
                        className="w-4 h-4"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                      <span>+</span>
                    </motion.button>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
