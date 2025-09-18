import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import MenuItem from '../components/MenuItem';
import SearchBar from '../components/SearchBar';
import CategoryFilter from '../components/CategoryFilter';
import { useMenu } from '../hooks/useMenu';

const Menu = () => {
    const navigate = useNavigate();
    const {
        menuItems,
        categories,
        searchTerm,
        selectedCategory,
        isLoading,
        menuItemsLoading,
        error,
        filteredItems,
        setSearchTerm,
        setSelectedCategory,
        getItemCount,
        getCategoryName,
    } = useMenu();

    useEffect(() => {
        // Scroll to top when menu loads
        window.scrollTo(0, 0);
    }, []);

    return (
        <div className="min-h-screen bg-gray-800 py-8 overflow-hidden">
            <div className="container mx-auto px-4">
                {/* Header */}
                <div className="text-center mb-12">
                    <h1 className="text-5xl font-bold text-white mb-4 font-hobo">
                        Our Menu
                    </h1>
                    <p className="text-xl text-gray-300 max-w-2xl mx-auto">
                        Discover our delicious selection of authentic Mexican cuisine, from traditional tacos to modern fusion dishes.
                    </p>
                </div>

                {/* Search and Filters */}
                <div className="mb-8">
                    <SearchBar
                        searchTerm={searchTerm}
                        onSearchChange={setSearchTerm}
                        placeholder="Search for your favorite dishes..."
                    />

                    <div className="mt-6">
                        {isLoading ? (
                            <div className="mb-8">
                                {/* Category Skeleton Header */}
                                <div className="text-center mb-6">
                                    <div className="animate-pulse">
                                        <div className="bg-gray-700 h-6 rounded w-48 mx-auto mb-2"></div>
                                        <div className="bg-gray-700 h-4 rounded w-64 mx-auto"></div>
                                    </div>
                                </div>

                                {/* Category Grid Skeleton */}
                                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-4">
                                    {[...Array(8)].map((_, i) => (
                                        <div key={i} className="animate-pulse">
                                            <div className="relative p-3 rounded-lg border-2 border-gray-700 bg-gray-800">
                                                <div className="text-center">
                                                    <div className="bg-gray-700 h-4 rounded w-20 mx-auto mb-1"></div>
                                                    <div className="bg-gray-700 h-3 rounded w-16 mx-auto"></div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ) : (
                            <CategoryFilter
                                categories={categories}
                                selectedCategory={selectedCategory}
                                onCategoryChange={setSelectedCategory}
                                getCategoryItemCount={getItemCount}
                            />
                        )}
                    </div>
                </div>

                {/* Error Display */}
                {error && (
                    <div className="text-center mb-8">
                        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                            <p>Error loading menu: {error}</p>
                        </div>
                    </div>
                )}

                {/* Menu Stats */}
                {isLoading ? (
                    <div className="mb-8 text-center">
                        <div className="animate-pulse">
                            <div className="bg-gray-700 h-5 rounded w-64 mx-auto"></div>
                        </div>
                    </div>
                ) : (
                    <div className="mb-8 text-center">
                        <p className="text-gray-300">
                            Showing {filteredItems.length} of {menuItems.length} items
                            {selectedCategory !== 'all' && selectedCategory && ` in ${getCategoryName(selectedCategory)}`}
                        </p>
                    </div>
                )}

                {/* Loading indicator for category filtering */}
                {menuItemsLoading && (
                    <div className="mb-12">
                        {/* Menu Items Grid Skeleton */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            {[...Array(12)].map((_, i) => (
                                <div key={i} className="animate-pulse">
                                    <div className="bg-gray-800 rounded-lg overflow-hidden border border-gray-700">
                                        {/* Image skeleton */}
                                        <div className="bg-gray-700 h-48 w-full"></div>

                                        {/* Content skeleton */}
                                        <div className="p-4">
                                            <div className="bg-gray-700 h-5 rounded w-3/4 mb-2"></div>
                                            <div className="bg-gray-700 h-4 rounded w-full mb-2"></div>
                                            <div className="bg-gray-700 h-4 rounded w-2/3 mb-3"></div>
                                            <div className="flex justify-between items-center">
                                                <div className="bg-gray-700 h-6 rounded w-16"></div>
                                                <div className="bg-gray-700 h-6 rounded w-20"></div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Menu Items Grid */}
                {!isLoading && !menuItemsLoading && filteredItems.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-12">
                        {filteredItems.map((item) => (
                            <MenuItem key={item.pk} item={item} />
                        ))}
                    </div>
                ) : !isLoading && !menuItemsLoading && filteredItems.length === 0 ? (
                    <div className="text-center py-12">
                        <div className="text-gray-400 mb-4">
                            <svg className="mx-auto h-16 w-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                        </div>
                        <h3 className="text-lg font-medium text-white mb-2">No items found</h3>
                        <p className="text-gray-400">
                            Try adjusting your search or filter criteria.
                        </p>
                    </div>
                ) : null}

                {/* CTA Section */}
                <div className="text-center py-12 bg-gray-800 rounded-lg shadow-sm border border-gray-700">
                    <h3 className="text-2xl font-bold text-white mb-4">
                        Questions About Our Menu?
                    </h3>
                    <p className="text-gray-300 mb-6 max-w-2xl mx-auto">
                        Our team is here to help you find the perfect dish. Contact us for recommendations, dietary restrictions, or any other questions.
                    </p>
                    <button
                        onClick={() => navigate('/contact')}
                        className="bg-orange-500 hover:bg-orange-600 text-white font-semibold py-3 px-8 rounded-lg transition-colors duration-200"
                    >
                        Contact Us
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Menu;
