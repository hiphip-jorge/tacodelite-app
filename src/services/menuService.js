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
        const response = await apiCall('/categories');
        return response.data || [];
    } catch (error) {
        console.error('Failed to fetch categories:', error);
        // Fallback to empty array if API fails
        return [];
    }
}

// Get all menu items
export async function getMenuItems() {
    try {
        const response = await apiCall('/menu-items');
        return response.data || [];
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
            const response = await apiCall('/menu-items');
            return response.data || [];
        }
        const response = await apiCall(`/menu-items-by-category?categoryId=${categoryId}`);
        return response.data || [];
    } catch (error) {
        console.error('Failed to fetch menu items by category:', error);
        // Fallback to empty array if API fails
        return [];
    }
}

// Search menu items
export async function searchMenuItems(query) {
    try {
        const response = await apiCall(`/search?query=${encodeURIComponent(query)}`);
        return response.data || [];
    } catch (error) {
        console.error('Failed to search menu items:', error);
        // Fallback to empty array if API fails
        return [];
    }
}

// The service is now ready to use with your Lambda APIs!
// Just update the API_BASE_URL environment variable with your actual API Gateway URL
