import React, { useState } from 'react';
import { motion } from 'framer-motion';

const CategoryFilter = ({
    categories,
    selectedCategory,
    onCategoryChange,
    searchQuery,
    getCategoryItemCount
}) => {
    const [showAllCategories, setShowAllCategories] = useState(false);

    // Add "All Items" option and map categories to expected format
    // Categories are already sorted by ID from the useMenu hook
    const allCategories = [
        { id: 'all', name: 'All Items', description: 'View our complete menu' },
        ...categories.map(cat => ({
            id: cat.pk, // Use pk as id (e.g., "CATEGORY#4")
            name: cat.name,
            description: cat.description
        }))
    ];

    // Show only first 6 categories initially (All + 5 popular ones)
    const initialCategories = allCategories.slice(0, 6);
    const remainingCategories = allCategories.slice(6);
    const displayedCategories = showAllCategories ? allCategories : initialCategories;

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-8"
        >
            {/* Header */}
            <div className="text-center mb-6">
                <h2 className="text-xl font-bold text-white mb-2">
                    Browse by Category
                </h2>
                <p className="text-gray-400 text-sm">
                    {searchQuery ? 'Search results' : 'Click a category to filter our menu'}
                </p>
            </div>

            {/* Category Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-4">
                {displayedCategories.map((category, index) => {
                    const isSelected = selectedCategory === category.id;
                    const itemCount = getCategoryItemCount(category.id);

                    return (
                        <motion.button
                            key={category.id}
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.4, delay: index * 0.05 }}
                            onClick={() => onCategoryChange(category.id)}
                            className={`relative group p-3 rounded-lg border-2 transition-all duration-300 ${isSelected
                                ? 'border-taco-yellow-500 bg-taco-yellow-500/10 shadow-lg shadow-taco-yellow-500/20'
                                : 'border-gray-700 bg-gray-800 hover:border-taco-yellow-500/50 hover:bg-gray-700/50'
                                }`}
                        >
                            {/* Category Content */}
                            <div className="text-center">
                                {/* Category Name */}
                                <h3 className={`font-bold text-base mb-1 transition-colors ${isSelected ? 'text-taco-yellow-400' : 'text-white group-hover:text-taco-yellow-400'
                                    }`}>
                                    {category.name}
                                </h3>

                                {/* Item Count */}
                                <div className={`text-xs transition-colors ${isSelected ? 'text-taco-yellow-300' : 'text-gray-400 group-hover:text-gray-300'
                                    }`}>
                                    {itemCount} {itemCount === 1 ? 'item' : 'items'}
                                </div>
                            </div>

                            {/* Selection Indicator */}
                            {isSelected && (
                                <motion.div
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    className="absolute -top-2 -right-2 w-5 h-5 bg-taco-yellow-500 rounded-full flex items-center justify-center shadow-lg"
                                >
                                    <svg className="w-3 h-3 text-gray-900" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                    </svg>
                                </motion.div>
                            )}
                        </motion.button>
                    );
                })}
            </div>

            {/* Show More/Less Button */}
            {remainingCategories.length > 0 && (
                <div className="text-center">
                    <button
                        onClick={() => setShowAllCategories(!showAllCategories)}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-gray-700 text-gray-300 rounded-lg hover:bg-gray-600 transition-colors text-sm"
                    >
                        <span>{showAllCategories ? 'Show Less' : `Show ${remainingCategories.length} More Categories`}</span>
                        <svg
                            className={`w-4 h-4 transition-transform ${showAllCategories ? 'rotate-180' : ''}`}
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                    </button>
                </div>
            )}

            {/* Active Category Info */}
            {selectedCategory !== 'all' && (
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-4 text-center"
                >
                    <div className="inline-flex items-center gap-2 bg-gray-800 border border-gray-700 rounded-full px-3 py-1">
                        <span className="text-gray-400 text-sm">Showing:</span>
                        <span className="text-taco-yellow-400 font-medium text-sm">
                            {categories.find(cat => cat.pk === selectedCategory)?.name || 'Unknown Category'}
                        </span>
                        <span className="text-gray-400 text-sm">
                            ({getCategoryItemCount(selectedCategory)} items)
                        </span>
                    </div>
                </motion.div>
            )}
        </motion.div>
    );
};

export default CategoryFilter;
