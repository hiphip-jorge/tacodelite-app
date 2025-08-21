import React, { useEffect, useMemo } from 'react';
import MenuItem from '../components/MenuItem';
import SearchBar from '../components/SearchBar';
import CategoryFilter from '../components/CategoryFilter';
import { useMenu } from '../hooks/useMenu';

const Menu = () => {
    const {
        menuItems,
        categories,
        searchTerm,
        selectedCategory,
        isLoading,
        error,
        setSearchTerm,
        setSelectedCategory,
        getFilteredItems,
        getItemCount,
    } = useMenu();

    const filteredItems = useMemo(() => getFilteredItems(), [getFilteredItems]);

    useEffect(() => {
        // Scroll to top when menu loads
        window.scrollTo(0, 0);
    }, []);

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50 py-12">
                <div className="container mx-auto px-4">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto"></div>
                        <p className="mt-4 text-gray-600">Loading menu...</p>
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gray-900 py-8 overflow-hidden">
                <div className="container mx-auto px-4">
                    <div className="text-center">
                        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                            <p>Error loading menu: {error}</p>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-900 py-8 overflow-hidden">
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
                        <CategoryFilter
                            categories={categories}
                            selectedCategory={selectedCategory}
                            onCategoryChange={setSelectedCategory}
                            getCategoryItemCount={getItemCount}
                        />
                    </div>
                </div>

                {/* Menu Stats */}
                <div className="mb-8 text-center">
                    <p className="text-gray-300">
                        Showing {filteredItems.length} of {menuItems.length} items
                        {selectedCategory && ` in ${selectedCategory.name}`}
                    </p>
                </div>

                {/* Menu Items Grid */}
                {filteredItems.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-12">
                        {filteredItems.map((item) => (
                            <MenuItem key={item.pk} item={item} />
                        ))}
                    </div>
                ) : (
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
                )}

                {/* CTA Section */}
                <div className="text-center py-12 bg-gray-800 rounded-lg shadow-sm border border-gray-700">
                    <h3 className="text-2xl font-bold text-white mb-4">
                        Questions About Our Menu?
                    </h3>
                    <p className="text-gray-300 mb-6 max-w-2xl mx-auto">
                        Our team is here to help you find the perfect dish. Contact us for recommendations, dietary restrictions, or any other questions.
                    </p>
                    <button className="bg-orange-500 hover:bg-orange-600 text-white font-semibold py-3 px-8 rounded-lg transition-colors duration-200">
                        Contact Us
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Menu;
