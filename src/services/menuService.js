// Menu service for fetching data from DynamoDB via Lambda APIs
// TODO: Update API_BASE_URL with your actual API Gateway URL after deployment

const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://i8vgeh8do9.execute-api.us-east-1.amazonaws.com/prod';

// Toggle this to true to use mock data instead of API calls
const USE_MOCK_DATA = import.meta.env.DEV && import.meta.env.VITE_USE_MOCK === 'true';

// Cache duration (in milliseconds) - Optimized for menu that changes 3-5 times per year
const CACHE_DURATION = {
    VERSION: 24 * 60 * 60 * 1000,      // 24 hours (check version daily)
    DATA: 30 * 24 * 60 * 60 * 1000    // 30 days (menu items/categories cached for a month)
};

// Cache configuration
const CACHE_KEYS = {
    MENU_VERSION: 'menu_version',
    CATEGORIES: 'menu_categories',
    MENU_ITEMS: 'menu_items',
    CATEGORIES_ETAG: 'categories_etag',
    MENU_ITEMS_ETAG: 'menu_items_etag'
};

// Mock data for development
const mockCategories = [
    { pk: 'CATEGORY#1', name: 'Breakfast', description: 'Start your day right' },
    { pk: 'CATEGORY#2', name: 'Tacos', description: 'Authentic Mexican tacos' },
    { pk: 'CATEGORY#3', name: 'Burritos', description: 'Hearty burrito options' },
    { pk: 'CATEGORY#4', name: 'Nachos', description: 'Loaded nacho dishes' },
    { pk: 'CATEGORY#5', name: 'Salads', description: 'Fresh and healthy options' },
    { pk: 'CATEGORY#6', name: 'Quesadillas', description: 'Cheesy quesadilla delights' },
    { pk: 'CATEGORY#7', name: 'Tostadas', description: 'Crispy tostada options' },
    { pk: 'CATEGORY#8', name: 'Sides', description: 'Perfect accompaniments' },
    { pk: 'CATEGORY#9', name: 'Extras', description: 'Additional menu items' },
    { pk: 'CATEGORY#10', name: 'Chips-n-Stuff', description: 'Chips and dips' },
    { pk: 'CATEGORY#11', name: 'Dinners', description: 'Complete dinner plates' },
    { pk: 'CATEGORY#12', name: 'Family', description: 'Family-sized portions' },
    { pk: 'CATEGORY#13', name: 'Desserts', description: 'Sweet endings' },
    { pk: 'CATEGORY#14', name: 'Drinks', description: 'Refreshing beverages' }
];

const mockMenuItems = [
    { pk: 'ITEM#1', categoryId: 1, name: 'breakfast taco', description: 'A soft 6in tortilla, your choice of filling (egg and sausage or chorizo), and shredded cheese | add fresh cut potatoes or bacon for $0.50 or both for $0.99', price: 3.50, vegetarian: false, active: true },
    { pk: 'ITEM#2', categoryId: 1, name: 'breakfast burrito', description: 'A soft 10in tortilla, your choice of filling (egg and sausage or chorizo), and shredded cheese | add fresh cut potatoes or bacon for $0.50 or both for $0.99', price: 5.50, vegetarian: false, active: true },
    { pk: 'ITEM#3', categoryId: 1, name: 'breakfast bowl', description: 'A bowl of your choice of filling (egg and sausage or chorizo), and shredded cheese | add fresh cut potatoes or bacon for $0.50 or both for $0.99', price: 5.50, vegetarian: false, active: true },
    { pk: 'ITEM#4', categoryId: 1, name: 'side of bacon', description: 'A cup of fresh cooked bacon', price: 2.00, vegetarian: false, active: true },
    { pk: 'ITEM#5', categoryId: 1, name: 'side of potato', description: 'A cup of fresh cut potatoes', price: 2.00, vegetarian: true, active: true },
    { pk: 'ITEM#6', categoryId: 2, name: 'taco', description: 'A crispy shell, ground beef, lettuce, and shredded cheese', price: 2.39, vegetarian: false, active: true },
    { pk: 'ITEM#7', categoryId: 2, name: 'supreme taco', description: 'A crispy shell, ground beef, lettuce, tomatoes, sour cream, and shredded cheese', price: 2.99, vegetarian: false, active: true },
    { pk: 'ITEM#8', categoryId: 2, name: 'soft taco', description: 'A soft tortilla, ground beef, lettuce, and shredded cheese', price: 2.79, vegetarian: false, active: true },
    { pk: 'ITEM#9', categoryId: 2, name: 'soft taco supreme', description: 'A soft tortilla, ground beef, lettuce, tomatoes, sour cream, and shredded cheese', price: 2.99, vegetarian: false, active: true },
    { pk: 'ITEM#10', categoryId: 2, name: 'fajita soft taco', description: 'Marinated fajitas (chicken or steak), sauteed bell peppers and onions, and shredded cheese', price: 3.99, vegetarian: false, active: true },
    { pk: 'ITEM#11', categoryId: 2, name: 'taco delite', description: 'A crispy shell wrapped in a flour tortilla with beans, ground beef, lettuce, and shredded cheese', price: 3.29, vegetarian: false, active: true },
    { pk: 'ITEM#12', categoryId: 2, name: 'taco delite supreme', description: 'A crispy shell wrapped in a flour tortilla with beans, ground beef, lettuce, tomatoes, sour cream, and shredded cheese', price: 3.99, vegetarian: false, active: true },
    { pk: 'ITEM#13', categoryId: 2, name: 'taco delite w/ queso', description: 'A crispy shell wrapped in a flour tortilla with beans and queso, ground beef, lettuce, and shredded cheese', price: 3.99, vegetarian: false, active: true },
    { pk: 'ITEM#14', categoryId: 2, name: 'taco delite w/ guac', description: 'A crispy shell wrapped in a flour tortilla with beans and guac made from scratch, ground beef, lettuce, and shredded cheese', price: 3.99, vegetarian: false, active: true },
    { pk: 'ITEM#15', categoryId: 3, name: 'bean burrito', description: 'A 10in flour tortilla, homemade beans, our special burrito sauce, and shredded cheese', price: 3.09, vegetarian: true, active: true },
    { pk: 'ITEM#16', categoryId: 3, name: 'meat burrito', description: 'A 10in flour tortilla, ground beef, our special burrito sauce, and shredded cheese', price: 5.99, vegetarian: false, active: true },
    { pk: 'ITEM#17', categoryId: 3, name: 'combo burrito', description: 'A 10in flour tortilla, homemade beans, ground beef, our special burrito sauce, and shredded cheese', price: 6.75, vegetarian: false, active: true },
    { pk: 'ITEM#18', categoryId: 3, name: 'super burrito', description: 'A 10in flour tortilla, homemade beans, ground beef, our special burrito sauce, lettuce, tomatoes, sour cream, and shredded cheese', price: 7.99, vegetarian: false, active: true },
    { pk: 'ITEM#19', categoryId: 3, name: 'fajita burrito', description: 'A 10in flour tortilla, Marinated fajitas (chicken or steak), sauteed bell peppers and onions, and shredded cheese', price: 7.99, vegetarian: false, active: true },
    { pk: 'ITEM#20', categoryId: 3, name: 'melt burrito', description: 'A 10in flour tortilla, homemade beans, ground beef, our special burrito sauce, smothered in queso, and topped with lettuce, tomatoes, sour cream', price: 9.99, vegetarian: false, active: true }
];

// Helper function to simulate API delay
const simulateDelay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Cache utility functions
const cacheUtils = {
    // Get cached data
    get(key) {
        try {
            const cached = localStorage.getItem(key);
            if (!cached) return null;

            const { data, timestamp } = JSON.parse(cached);
            const now = Date.now();

            // Check if cache is expired
            if (now - timestamp > CACHE_DURATION.DATA) {
                localStorage.removeItem(key);
                return null;
            }

            return data;
        } catch (error) {
            console.error('Error reading from cache:', error);
            return null;
        }
    },

    // Set cached data
    set(key, data) {
        try {
            const cacheData = {
                data,
                timestamp: Date.now()
            };
            localStorage.setItem(key, JSON.stringify(cacheData));
        } catch (error) {
            console.error('Error writing to cache:', error);
        }
    },

    // Get cached data with ETag
    getWithETag(key) {
        try {
            console.log('🔍 getWithETag called for:', key);
            const cached = localStorage.getItem(key);
            console.log('🔍 Raw cached data:', cached);

            if (!cached) {
                console.log('🔍 No cached data found');
                return { data: null, etag: null };
            }

            const { data, timestamp, etag } = JSON.parse(cached);
            const now = Date.now();
            const age = now - timestamp;
            const maxAge = CACHE_DURATION.DATA;

            console.log('🔍 Cache age:', age, 'ms, max age:', maxAge, 'ms');

            // Check if cache is expired
            if (age > maxAge) {
                console.log('🔍 Cache expired, removing...');
                localStorage.removeItem(key);
                return { data: null, etag: null };
            }

            console.log('🔍 Cache is valid, returning data');
            return { data, etag };
        } catch (error) {
            console.error('Error reading from cache:', error);
            return { data: null, etag: null };
        }
    },

    // Set cached data with ETag
    setWithETag(key, data, etag) {
        try {
            console.log('🔍 setWithETag called for:', key, 'with', data?.length || 0, 'items, etag:', etag);
            const cacheData = {
                data,
                etag,
                timestamp: Date.now()
            };
            localStorage.setItem(key, JSON.stringify(cacheData));
            console.log('🔍 Data cached successfully');
        } catch (error) {
            console.error('Error writing to cache:', error);
        }
    },

    // Clear specific cache
    clear(key) {
        try {
            localStorage.removeItem(key);
        } catch (error) {
            console.error('Error clearing cache:', error);
        }
    },

    // Clear all menu-related cache
    clearAll() {
        Object.values(CACHE_KEYS).forEach(key => this.clear(key));
    }
};

// Helper function to make API calls with ETag support
const apiCall = async (endpoint, options = {}) => {
    try {
        const headers = {
            'Content-Type': 'application/json',
            ...options.headers
        };

        // Add If-None-Match header if ETag is provided
        if (options.etag) {
            headers['If-None-Match'] = options.etag;
        }

        const response = await fetch(`${API_BASE_URL}${endpoint}`, {
            headers,
            ...options
        });

        // Handle 304 Not Modified response
        if (response.status === 304) {
            return {
                data: null, // No data needed, use cached version
                etag: response.headers.get('ETag'),
                version: response.headers.get('X-Menu-Version'),
                cached: true
            };
        }

        if (!response.ok) {
            throw new Error(`API call failed: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        return {
            data,
            etag: response.headers.get('ETag'),
            version: response.headers.get('X-Menu-Version'),
            cached: false
        };
    } catch (error) {
        console.error('API call error:', error);
        throw error;
    }
};

// Get current menu version
async function getMenuVersion() {
    try {
        const response = await apiCall('/menu-version');
        return response.data?.version || 1;
    } catch (error) {
        console.error('Failed to get menu version:', error);
        return 1; // Default version
    }
}

// Check if cached data is still valid based on version
async function isCacheValid(cacheKey) {
    try {
        console.log('🔍 isCacheValid called for:', cacheKey);

        // Check if we have a cached version
        const cachedVersion = cacheUtils.get(CACHE_KEYS.MENU_VERSION);
        console.log('🔍 Cached version:', cachedVersion);

        // If no cached version, assume cache is valid for now
        // We'll let the ETag mechanism handle version checking
        if (!cachedVersion) {
            console.log('✅ Cache is valid - no version check needed (using ETag)');
            return true;
        }

        // Check if cached version is still fresh (within 24 hours)
        const versionTimestamp = cacheUtils.get(`${CACHE_KEYS.MENU_VERSION}_timestamp`);
        const now = Date.now();
        const VERSION_CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours

        if (!versionTimestamp || (now - versionTimestamp) > VERSION_CACHE_DURATION) {
            console.log('🔄 Version cache expired, checking for updates...');
            const currentVersion = await getMenuVersion();

            if (currentVersion !== cachedVersion) {
                console.log('🔄 Menu version changed, invalidating cache');
                cacheUtils.set(CACHE_KEYS.MENU_VERSION, currentVersion);
                cacheUtils.set(`${CACHE_KEYS.MENU_VERSION}_timestamp`, now);
                return false; // Version changed, need fresh data
            }

            // Version is same, update timestamp
            cacheUtils.set(`${CACHE_KEYS.MENU_VERSION}_timestamp`, now);
        }

        // We have a cached version and it's still fresh, cache is valid
        console.log('✅ Cache is valid - using cached data (version:', cachedVersion, ')');
        return true;
    } catch (error) {
        console.error('Error checking cache validity:', error);
        return false;
    }
}

// Get all categories
export async function getCategories() {
    if (USE_MOCK_DATA) {
        console.log('🔶 Using mock categories data');
        await simulateDelay(500); // Simulate network delay
        return mockCategories;
    }

    try {
        // Check if we have valid cached data
        const cachedData = cacheUtils.getWithETag(CACHE_KEYS.CATEGORIES);
        console.log('🔍 Cache check - cachedData:', cachedData);

        if (cachedData.data && cachedData.etag) {
            console.log('🔍 Found cached data, checking validity...');
            const cacheValid = await isCacheValid(CACHE_KEYS.CATEGORIES);
            console.log('🔍 Cache validity result:', cacheValid);

            if (cacheValid) {
                console.log('📦 Using cached categories data');
                return cachedData.data;
            }
        } else {
            console.log('🔍 No cached data found or cache expired');
        }

        // Get cached ETag for conditional request
        const existingCache = cacheUtils.getWithETag(CACHE_KEYS.CATEGORIES);

        console.log('🌐 Fetching fresh categories data');
        const response = await apiCall('/categories', {
            etag: existingCache.etag
        });

        let categories;
        if (response.cached) {
            // Server returned 304, use cached data
            console.log('📦 Server confirmed cache is valid - using cached categories');
            categories = existingCache.data;
        } else {
            // Server returned new data
            console.log('🔄 Server returned new categories data');
            categories = response.data || [];

            // Cache the new data with ETag
            cacheUtils.setWithETag(CACHE_KEYS.CATEGORIES, categories, response.etag);
        }

        // Sort categories by their numeric ID (e.g., "CATEGORY#1" -> 1)
        const sortedCategories = categories.sort((a, b) => {
            const idA = parseInt(a.pk?.replace('CATEGORY#', '') || '0');
            const idB = parseInt(b.pk?.replace('CATEGORY#', '') || '0');
            return idA - idB;
        });

        return sortedCategories;
    } catch (error) {
        console.error('Failed to fetch categories:', error);

        // Try to return cached data even if expired
        const cachedData = cacheUtils.getWithETag(CACHE_KEYS.CATEGORIES);
        if (cachedData.data) {
            console.log('🔄 Using expired cached categories data as fallback');
            return cachedData.data;
        }

        // Fallback to mock data if API fails and no cache
        console.log('🔶 Falling back to mock categories data');
        return mockCategories;
    }
}

// Get all menu items
export async function getMenuItems() {
    if (USE_MOCK_DATA) {
        console.log('🔶 Using mock menu items data');
        await simulateDelay(800); // Simulate network delay
        return mockMenuItems;
    }

    try {
        // Check if we have valid cached data
        const cachedData = cacheUtils.getWithETag(CACHE_KEYS.MENU_ITEMS);
        if (cachedData.data && cachedData.etag) {
            const cacheValid = await isCacheValid(CACHE_KEYS.MENU_ITEMS);
            if (cacheValid) {
                console.log('📦 Using cached menu items data');
                return cachedData.data;
            }
        }

        // Get cached ETag for conditional request
        const existingCache = cacheUtils.getWithETag(CACHE_KEYS.MENU_ITEMS);

        console.log('🌐 Fetching fresh menu items data');
        const response = await apiCall('/menu-items', {
            etag: existingCache.etag
        });

        let menuItems;
        if (response.cached) {
            // Server returned 304, use cached data
            console.log('📦 Server confirmed cache is valid - using cached menu items');
            menuItems = existingCache.data;
        } else {
            // Server returned new data
            console.log('🔄 Server returned new menu items data');
            menuItems = response.data || [];

            // Cache the new data with ETag
            cacheUtils.setWithETag(CACHE_KEYS.MENU_ITEMS, menuItems, response.etag);
        }

        return menuItems;
    } catch (error) {
        console.error('Failed to fetch menu items:', error);

        // Try to return cached data even if expired
        const cachedData = cacheUtils.getWithETag(CACHE_KEYS.MENU_ITEMS);
        if (cachedData.data) {
            console.log('🔄 Using expired cached menu items data as fallback');
            return cachedData.data;
        }

        // Fallback to mock data if API fails and no cache
        console.log('🔶 Falling back to mock menu items data');
        return mockMenuItems;
    }
}

// Get menu items by category
export async function getMenuItemsByCategory(categoryId) {
    if (USE_MOCK_DATA) {
        console.log('🔶 Using mock menu items by category data');
        await simulateDelay(600); // Simulate network delay

        if (categoryId === 'all') {
            return mockMenuItems;
        }

        const filteredItems = mockMenuItems.filter(item => item.categoryId === categoryId);
        return filteredItems;
    }

    try {
        if (categoryId === 'all') {
            // Use the cached menu items for 'all' category
            return await getMenuItems();
        }

        const response = await apiCall(`/menu-items-by-category?categoryId=${categoryId}`);
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
        // Fallback to mock data if API fails
        console.log('🔶 Falling back to mock menu items by category data');
        if (categoryId === 'all') {
            return mockMenuItems;
        }
        return mockMenuItems.filter(item => item.categoryId === categoryId);
    }
}

// Search menu items
export async function searchMenuItems(query) {
    if (USE_MOCK_DATA) {
        console.log('🔶 Using mock search data');
        await simulateDelay(400); // Simulate network delay

        const searchResults = mockMenuItems.filter(item =>
            item.name.toLowerCase().includes(query.toLowerCase()) ||
            item.description.toLowerCase().includes(query.toLowerCase())
        );
        return searchResults;
    }

    try {
        // For search, we can use cached menu items and filter locally
        // This is more efficient than making a separate API call
        const allMenuItems = await getMenuItems();

        const searchResults = allMenuItems.filter(item =>
            item.name.toLowerCase().includes(query.toLowerCase()) ||
            item.description.toLowerCase().includes(query.toLowerCase())
        );

        console.log(`🔍 Found ${searchResults.length} items matching "${query}"`);
        return searchResults;
    } catch (error) {
        console.error('Failed to search menu items:', error);
        // Fallback to mock data if API fails
        console.log('🔶 Falling back to mock search data');
        const searchResults = mockMenuItems.filter(item =>
            item.name.toLowerCase().includes(query.toLowerCase()) ||
            item.description.toLowerCase().includes(query.toLowerCase())
        );
        return searchResults;
    }
}

// The service is now ready to use with your Lambda APIs!
// Just update the API_BASE_URL environment variable with your actual API Gateway URL

// Export cache utilities for manual cache management
export const cacheManager = {
    // Clear all menu cache
    clearAll: () => cacheUtils.clearAll(),

    // Clear specific cache
    clearCategories: () => {
        cacheUtils.clear(CACHE_KEYS.CATEGORIES);
        cacheUtils.clear(CACHE_KEYS.CATEGORIES_ETAG);
    },
    clearMenuItems: () => {
        cacheUtils.clear(CACHE_KEYS.MENU_ITEMS);
        cacheUtils.clear(CACHE_KEYS.MENU_ITEMS_ETAG);
    },
    clearVersion: () => {
        cacheUtils.clear(CACHE_KEYS.MENU_VERSION);
        cacheUtils.clear(`${CACHE_KEYS.MENU_VERSION}_timestamp`);
    },

    // Get cache info for debugging
    getCacheInfo: () => {
        const categoriesCache = cacheUtils.getWithETag(CACHE_KEYS.CATEGORIES);
        const menuItemsCache = cacheUtils.getWithETag(CACHE_KEYS.MENU_ITEMS);
        const versionCache = cacheUtils.get(CACHE_KEYS.MENU_VERSION);

        return {
            categories: categoriesCache.data ? `Cached (${categoriesCache.data.length} items, ETag: ${categoriesCache.etag?.substring(0, 8)}...)` : 'Not cached',
            menuItems: menuItemsCache.data ? `Cached (${menuItemsCache.data.length} items, ETag: ${menuItemsCache.etag?.substring(0, 8)}...)` : 'Not cached',
            version: versionCache ? `Version ${versionCache}` : 'Not cached'
        };
    },

    // Clear all cache on startup
    clearAllOnStartup: () => {
        cacheUtils.clearAll();
        console.log('🧹 Cache cleared on startup - using fresh API calls');
    },

    // Force refresh cache
    forceRefresh: async () => {
        cacheUtils.clearAll();
        console.log('🔄 Cache cleared - will fetch fresh data on next request');
    }
};
