import React from 'react';
import { motion } from 'framer-motion';

const MenuStats = ({
    totalItems,
    filteredCount,
    selectedCategory,
    searchQuery,
    getVegetarianCount,
    getPriceRange,
    getCategoryName,
}) => {
    const vegetarianCount = getVegetarianCount();
    const priceRange = getPriceRange();
    const isFiltered = selectedCategory !== 'all' || searchQuery;

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className='bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-bubbly p-6 mb-8'
        >
            <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6'>
                {/* Total Items */}
                <div className='text-center'>
                    <div className='text-3xl font-bold text-taco-yellow-500 mb-2'>
                        {filteredCount}
                    </div>
                    <div className='text-gray-500 dark:text-gray-400 text-sm'>
                        {isFiltered ? 'Items Found' : 'Total Menu Items'}
                    </div>
                    {isFiltered && (
                        <div className='text-xs text-gray-500 mt-1'>
                            of {totalItems} total
                        </div>
                    )}
                </div>

                {/* Vegetarian Options */}
                <div className='text-center'>
                    <div className='text-3xl font-bold text-taco-green-500 mb-2'>
                        {vegetarianCount}
                    </div>
                    <div className='text-gray-500 dark:text-gray-400 text-sm'>
                        Vegetarian Options
                    </div>
                    {filteredCount > 0 && (
                        <div className='text-xs text-gray-500 mt-1'>
                            {((vegetarianCount / filteredCount) * 100).toFixed(
                                0
                            )}
                            % of items
                        </div>
                    )}
                </div>

                {/* Price Range */}
                <div className='text-center'>
                    <div className='text-3xl font-bold text-blue-500 mb-2'>
                        ${priceRange.min.toFixed(2)}
                    </div>
                    <div className='text-gray-500 dark:text-gray-400 text-sm'>
                        Starting Price
                    </div>
                    {priceRange.max > priceRange.min && (
                        <div className='text-xs text-gray-500 mt-1'>
                            Up to ${priceRange.max.toFixed(2)}
                        </div>
                    )}
                </div>

                {/* Current View */}
                <div className='text-center'>
                    <div className='text-2xl font-bold text-purple-500 mb-2'>
                        {isFiltered ? 'Filtered' : 'All'}
                    </div>
                    <div className='text-gray-500 dark:text-gray-400 text-sm'>
                        {searchQuery
                            ? 'Search Results'
                            : selectedCategory !== 'all'
                              ? getCategoryName(selectedCategory)
                              : 'Complete Menu'}
                    </div>
                    {searchQuery && (
                        <div className='text-xs text-gray-500 mt-1'>
                            "{searchQuery}"
                        </div>
                    )}
                </div>
            </div>

            {/* Quick Actions */}
            {isFiltered && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.4 }}
                    className='mt-6 pt-6 border-t border-gray-200 dark:border-gray-700 text-center'
                >
                    <div className='flex flex-wrap justify-center gap-3'>
                        <button
                            onClick={() => window.location.reload()}
                            className='px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-bubbly hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors text-sm'
                        >
                            View All Items
                        </button>
                        {searchQuery && (
                            <button
                                onClick={() => window.location.reload()}
                                className='px-4 py-2 bg-taco-yellow-500 text-gray-900 rounded-bubbly hover:bg-taco-yellow-400 transition-colors text-sm'
                            >
                                Clear Search
                            </button>
                        )}
                    </div>
                </motion.div>
            )}
        </motion.div>
    );
};

export default MenuStats;
