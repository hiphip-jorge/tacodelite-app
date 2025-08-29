// Menu service for fetching data from DynamoDB via Lambda APIs
// TODO: Update API_BASE_URL with your actual API Gateway URL after deployment

const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://j0uotuymd1.execute-api.us-east-1.amazonaws.com/prod';

// Helper function to make API calls
const apiCall = async (endpoint, options = {}) => {
    try {
        const response = await fetch(`${API_BASE_URL}${endpoint}`, {
            headers: {
                'Content-Type': 'application/json',
                ...options.headers
            },
            ...options
        });

        if (!response.ok) {
            throw new Error(`API call failed: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        return data;
    } catch (error) {
        console.error('API call error:', error);
        throw error;
    }
};

// Get all categories
export async function getCategories() {
    try {
        const response = await apiCall('/prod/categories');
        const categories = response || [];

        // Sort categories by their numeric ID (e.g., "CATEGORY#1" -> 1)
        const sortedCategories = categories.sort((a, b) => {
            const idA = parseInt(a.pk?.replace('CATEGORY#', '') || '0');
            const idB = parseInt(b.pk?.replace('CATEGORY#', '') || '0');
            return idA - idB;
        });

        return sortedCategories;
    } catch (error) {
        console.error('Failed to fetch categories:', error);
        // Fallback to empty array if API fails
        return [];
    }
}

// Get all menu items
export async function getMenuItems() {
    try {
        const response = await apiCall('/prod/menu-items');
        return response;
    } catch (error) {
        console.error('Failed to fetch menu items:', error);
        // Fallback to empty array if API fails
        return [];
    }
}

// Get menu items by category
export async function getMenuItemsByCategory(categoryId) {
    try {
        if (categoryId === 'all') {
            const response = await apiCall('/prod/menu-items');
            return response || [];
        }
        const response = await apiCall(`/prod/menu-items-by-category?categoryId=${categoryId}`);
        // Handle both response formats:
        // 1. Old format: {success: true, data: [...], ...}
        // 2. New format: [...] (direct array)
        let result;
        if (response?.data) {
            // Old format with nested data
            result = response.data;
        } else if (Array.isArray(response)) {
            // New format with direct array
            result = response;
        } else {
            // Fallback: try to convert object with numeric keys to array
            result = Object.values(response || {});
        }
        return result;
    } catch (error) {
        console.error('Failed to fetch menu items by category:', error);
        // Fallback to empty array if API fails
        return [];
    }
}

// Search menu items
export async function searchMenuItems(query) {
    try {
        const response = await apiCall(`/prod/search?query=${encodeURIComponent(query)}`);
        return response || [];
    } catch (error) {
        console.error('Failed to search menu items:', error);
        // Fallback to empty array if API fails
        return [];
    }
}

// The service is now ready to use with your Lambda APIs!
// Just update the API_BASE_URL environment variable with your actual API Gateway URL
