import { useState, useEffect, useCallback, useRef } from 'react';
import {
    getCategories,
    getMenuItems,
    searchMenuItems,
    getMenuItemsByCategory,
    cacheManager,
} from '../services/menuService';

export const useMenu = () => {
    const [categories, setCategories] = useState([]);
    const [menuItems, setMenuItems] = useState([]);
    const [filteredItems, setFilteredItems] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [loading, setLoading] = useState(false);
    const [menuItemsLoading, setMenuItemsLoading] = useState(false);
    const [error, setError] = useState(null);

    // Use ref to store menuItems to avoid dependency warning in useEffect
    const menuItemsRef = useRef([]);
    menuItemsRef.current = menuItems;

    // Use ref to track current category to prevent race conditions
    const currentCategoryRef = useRef(selectedCategory);
    currentCategoryRef.current = selectedCategory;

    // Add request ID to prevent race conditions
    // const requestIdRef = useRef(0);

    // Load initial data
    useEffect(() => {
        const loadData = async () => {
            try {
                setLoading(true);
                // Don't clear cache on startup - let the caching system work
                // cacheManager.clearAllOnStartup(); // Removed to enable caching

                const categoriesData = await getCategories();
                setCategories(categoriesData);

                const menuData = await getMenuItems();
                setMenuItems(menuData);

                // Sort and set initial filtered items to show all items
                const sortedInitialItems = menuData.sort((a, b) => {
                    const idA = parseInt(a.pk?.replace('ITEM#', '') || '0');
                    const idB = parseInt(b.pk?.replace('ITEM#', '') || '0');
                    return idA - idB;
                });
                setFilteredItems(sortedInitialItems);
            } catch (error) {
                console.error('Error loading data:', error);
            } finally {
                setLoading(false);
            }
        };

        loadData();
    }, []);

    // Filter items when search or category changes
    useEffect(() => {
        // Don't run filtering until initial data is loaded
        if (menuItems.length === 0) {
            console.log('Initial data not loaded yet, skipping filter');
            return;
        }

        console.log(
            'Filter useEffect triggered - selectedCategory:',
            selectedCategory,
            'searchQuery:',
            searchQuery
        );

        const filterItems = async () => {
            try {
                setError(null);
                setMenuItemsLoading(true);

                let items = [];

                if (searchQuery.trim()) {
                    // Search across all items
                    items = await searchMenuItems(searchQuery);
                } else if (selectedCategory === 'all') {
                    // Show all active items - no API call needed, instant response
                    items = [...menuItems]; // Create a copy to avoid reference issues
                } else {
                    // Filter by category - extract numeric part from PK (e.g., "CATEGORY#4" -> 4)
                    const categoryNumber = parseInt(
                        selectedCategory.replace('CATEGORY#', '')
                    );
                    console.log(
                        'Filtering by category:',
                        selectedCategory,
                        '->',
                        categoryNumber
                    );
                    items = await getMenuItemsByCategory(categoryNumber);
                    console.log('Category API returned items:', items);
                }

                console.log('Final items before sorting:', items);
                console.log('Items length before sorting:', items?.length);

                // Ensure items is an array before sorting
                if (!Array.isArray(items)) {
                    console.error('Items is not an array:', items);
                    items = [];
                }

                // Sort items by ID (assuming ID is numeric)
                const sortedItems = items.sort((a, b) => {
                    // Extract numeric part from item ID (e.g., "ITEM#1" -> 1)
                    const idA = parseInt(a.pk?.replace('ITEM#', '') || '0');
                    const idB = parseInt(b.pk?.replace('ITEM#', '') || '0');
                    return idA - idB;
                });

                console.log('Final sorted items:', sortedItems);
                console.log('Setting filtered items to:', sortedItems.length);

                // Only update state if this is still the current category (prevents race conditions)
                if (currentCategoryRef.current === selectedCategory) {
                    console.log(
                        'Category still matches, updating filtered items'
                    );
                    setFilteredItems(sortedItems);
                } else {
                    console.log(
                        'Category changed during API call, ignoring result'
                    );
                }
            } catch (err) {
                setError('Failed to filter menu items');
                console.error('Error filtering items:', err);
            } finally {
                setMenuItemsLoading(false);
            }
        };

        filterItems();
    }, [selectedCategory, searchQuery, menuItems]);

    // Debug: Log when filteredItems changes
    useEffect(() => {
        console.log(
            'filteredItems state changed:',
            filteredItems.length,
            'items'
        );
        console.log('Current selectedCategory:', selectedCategory);
    }, [filteredItems, selectedCategory]);

    // Handle category selection
    const handleCategoryChange = useCallback(categoryId => {
        console.log('Category changed to:', categoryId);

        setSelectedCategory(categoryId);
        setSearchQuery(''); // Clear search when changing categories
    }, []);

    // Handle search
    const handleSearch = useCallback(query => {
        setSearchQuery(query);
        setSelectedCategory('all'); // Reset category when searching
    }, []);

    // Clear search
    const clearSearch = useCallback(() => {
        setSearchQuery('');
        setSelectedCategory('all');
    }, []);

    // Get category name by ID
    const getCategoryName = useCallback(
        categoryId => {
            if (categoryId === 'all') return 'All Items';
            if (!categoryId || typeof categoryId !== 'string') return 'Unknown';
            // Extract numeric part from category PK (e.g., "CATEGORY#4" -> 4)
            const categoryNumber = parseInt(
                categoryId.replace('CATEGORY#', '')
            );
            const category = categories.find(
                cat => cat.pk === `CATEGORY#${categoryNumber}`
            );
            return category ? category.name : 'Unknown';
        },
        [categories]
    );

    // Get category description by ID
    const getCategoryDescription = useCallback(
        categoryId => {
            if (categoryId === 'all') return '';
            if (!categoryId || typeof categoryId !== 'string') return '';
            // Extract numeric part from category PK (e.g., "CATEGORY#4" -> 4)
            const categoryNumber = parseInt(
                categoryId.replace('CATEGORY#', '')
            );
            const category = categories.find(
                cat => cat.pk === `CATEGORY#${categoryNumber}`
            );
            return category ? category.description : '';
        },
        [categories]
    );

    // Get items count for a category
    const getCategoryItemCount = useCallback(
        categoryId => {
            if (categoryId === 'all') {
                return menuItems.length;
            }
            if (!categoryId || typeof categoryId !== 'string') {
                return 0;
            }
            // Extract numeric part from category PK (e.g., "CATEGORY#4" -> 4)
            const categoryNumber = parseInt(
                categoryId.replace('CATEGORY#', '')
            );

            // Debug: Log the first few menu items to see their structure
            if (menuItems.length > 0) {
                console.log('First menu item structure:', menuItems[0]);
                console.log('Looking for categoryId:', categoryNumber);
                console.log('Available categoryIds:', [
                    ...new Set(menuItems.map(item => item.categoryId)),
                ]);
            }

            return menuItems.filter(item => item.categoryId === categoryNumber)
                .length;
        },
        [menuItems]
    );

    // Get vegetarian items count
    const getVegetarianCount = useCallback(() => {
        return filteredItems.filter(item => item.vegetarian).length;
    }, [filteredItems]);

    // Get price range
    const getPriceRange = useCallback(() => {
        if (filteredItems.length === 0) return { min: 0, max: 0 };

        const prices = filteredItems.map(item => item.price);
        return {
            min: Math.min(...prices),
            max: Math.max(...prices),
        };
    }, [filteredItems]);

    // Create a function to get filtered items (for useMemo compatibility)
    const getFilteredItems = useCallback(() => {
        return filteredItems;
    }, [filteredItems]);

    // Create setters that match what Menu.jsx expects
    const setSearchTerm = useCallback(
        term => {
            handleSearch(term);
        },
        [handleSearch]
    );

    const setSelectedCategoryAction = useCallback(
        categoryId => {
            handleCategoryChange(categoryId);
        },
        [handleCategoryChange]
    );

    // Create getItemCount function that matches what Menu.jsx expects
    const getItemCount = useCallback(
        categoryId => {
            return getCategoryItemCount(categoryId);
        },
        [getCategoryItemCount]
    );

    // Debug function to check cache status
    const getCacheStatus = useCallback(() => {
        return cacheManager.getCacheInfo();
    }, []);

    // Function to manually clear cache (useful for testing)
    const clearCache = useCallback(() => {
        cacheManager.clearAll();
        console.log('🧹 Cache cleared manually');
    }, []);

    return {
        // State
        categories,
        menuItems,
        filteredItems,
        selectedCategory,
        searchTerm: searchQuery, // Map searchQuery to searchTerm
        isLoading: loading, // Map loading to isLoading
        menuItemsLoading, // Loading state just for menu items
        error,

        // Actions that Menu.jsx expects
        setSearchTerm,
        setSelectedCategory: setSelectedCategoryAction,
        getFilteredItems,
        getItemCount,

        // Legacy actions (keeping for backward compatibility)
        handleCategoryChange,
        handleSearch,
        clearSearch,

        // Computed values
        getCategoryName,
        getCategoryDescription,
        getCategoryItemCount,
        getVegetarianCount,
        getPriceRange,

        // Cache management (for debugging/testing)
        getCacheStatus,
        clearCache,

        // Utility
        totalItems: menuItems.length,
        filteredCount: filteredItems.length,
    };
};
