import { useState, useEffect, useCallback, useRef } from 'react';
import { getCategories, getMenuItems, searchMenuItems, getMenuItemsByCategory } from '../services/menuService';

export const useMenu = () => {
    const [categories, setCategories] = useState([]);
    const [menuItems, setMenuItems] = useState([]);
    const [filteredItems, setFilteredItems] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Use ref to store menuItems to avoid dependency warning in useEffect
    const menuItemsRef = useRef([]);
    menuItemsRef.current = menuItems;

    // Load initial data
    useEffect(() => {
        const loadData = async () => {
            try {
                setLoading(true);
                setError(null);

                const [categoriesData, itemsData] = await Promise.all([
                    getCategories(),
                    getMenuItems()
                ]);

                setCategories(categoriesData);
                setMenuItems(itemsData);
                setFilteredItems(itemsData);
            } catch (err) {
                setError('Failed to load menu data');
                console.error('Error loading data:', err);
            } finally {
                setLoading(false);
            }
        };

        loadData();
    }, []);

    // Filter items when search or category changes
    useEffect(() => {
        const filterItems = async () => {
            try {
                setLoading(true);
                setError(null);

                let items = [];

                if (searchQuery.trim()) {
                    // Search across all items
                    items = await searchMenuItems(searchQuery);
                } else if (selectedCategory === 'all') {
                    // Show all active items
                    items = menuItemsRef.current;
                } else {
                    // Filter by category - extract numeric part from PK (e.g., "CATEGORY#4" -> 4)
                    const categoryNumber = parseInt(selectedCategory.replace('CATEGORY#', ''));
                    console.log('Filtering by category:', selectedCategory, '->', categoryNumber);
                    items = await getMenuItemsByCategory(categoryNumber);
                    console.log('API returned items:', items.length);
                }

                setFilteredItems(items);
            } catch (err) {
                setError('Failed to filter menu items');
                console.error('Error filtering items:', err);
            } finally {
                setLoading(false);
            }
        };

        filterItems();
    }, [selectedCategory, searchQuery]);

    // Handle category selection
    const handleCategoryChange = useCallback((categoryId) => {
        console.log('Category changed to:', categoryId);
        setSelectedCategory(categoryId);
        setSearchQuery(''); // Clear search when changing categories
    }, []);

    // Handle search
    const handleSearch = useCallback((query) => {
        setSearchQuery(query);
        setSelectedCategory('all'); // Reset category when searching
    }, []);

    // Clear search
    const clearSearch = useCallback(() => {
        setSearchQuery('');
        setSelectedCategory('all');
    }, []);

    // Get category name by ID
    const getCategoryName = useCallback((categoryId) => {
        if (categoryId === 'all') return 'All Items';
        if (!categoryId || typeof categoryId !== 'string') return 'Unknown';
        // Extract numeric part from category PK (e.g., "CATEGORY#4" -> 4)
        const categoryNumber = parseInt(categoryId.replace('CATEGORY#', ''));
        const category = categories.find(cat => cat.pk === `CATEGORY#${categoryNumber}`);
        return category ? category.name : 'Unknown';
    }, [categories]);

    // Get category description by ID
    const getCategoryDescription = useCallback((categoryId) => {
        if (categoryId === 'all') return '';
        if (!categoryId || typeof categoryId !== 'string') return '';
        // Extract numeric part from category PK (e.g., "CATEGORY#4" -> 4)
        const categoryNumber = parseInt(categoryId.replace('CATEGORY#', ''));
        const category = categories.find(cat => cat.pk === `CATEGORY#${categoryNumber}`);
        return category ? category.description : '';
    }, [categories]);

    // Get items count for a category
    const getCategoryItemCount = useCallback((categoryId) => {
        if (categoryId === 'all') {
            return menuItems.length;
        }
        if (!categoryId || typeof categoryId !== 'string') {
            return 0;
        }
        // Extract numeric part from category PK (e.g., "CATEGORY#4" -> 4)
        const categoryNumber = parseInt(categoryId.replace('CATEGORY#', ''));
        return menuItems.filter(item => item.categoryId === categoryNumber).length;
    }, [menuItems]);

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
            max: Math.max(...prices)
        };
    }, [filteredItems]);

    // Create a function to get filtered items (for useMemo compatibility)
    const getFilteredItems = useCallback(() => {
        return filteredItems;
    }, [filteredItems]);

    // Create setters that match what Menu.jsx expects
    const setSearchTerm = useCallback((term) => {
        handleSearch(term);
    }, [handleSearch]);

    const setSelectedCategoryAction = useCallback((categoryId) => {
        handleCategoryChange(categoryId);
    }, [handleCategoryChange]);

    // Create getItemCount function that matches what Menu.jsx expects
    const getItemCount = useCallback((categoryId) => {
        return getCategoryItemCount(categoryId);
    }, [getCategoryItemCount]);

    return {
        // State
        categories,
        menuItems,
        filteredItems,
        selectedCategory,
        searchTerm: searchQuery, // Map searchQuery to searchTerm
        isLoading: loading, // Map loading to isLoading
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

        // Utility
        totalItems: menuItems.length,
        filteredCount: filteredItems.length
    };
};
