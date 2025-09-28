// Announcement service for fetching announcements from DynamoDB via Lambda APIs

const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://i8vgeh8do9.execute-api.us-east-1.amazonaws.com/prod';

// Cache duration for announcements (shorter than menu items since they change more frequently)
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

// Cache configuration
const CACHE_KEYS = {
    ANNOUNCEMENTS: 'announcements',
    ANNOUNCEMENTS_TIMESTAMP: 'announcements_timestamp'
};

// Helper function to get cached data
const getCachedData = (key) => {
    try {
        const cached = localStorage.getItem(key);
        return cached ? JSON.parse(cached) : null;
    } catch (error) {
        console.error('Error reading from cache:', error);
        return null;
    }
};

// Helper function to set cached data
const setCachedData = (key, data) => {
    try {
        localStorage.setItem(key, JSON.stringify(data));
    } catch (error) {
        console.error('Error writing to cache:', error);
    }
};

// Helper function to check if cache is valid
const isCacheValid = (timestampKey) => {
    const timestamp = getCachedData(timestampKey);
    if (!timestamp) return false;

    const now = Date.now();
    return (now - timestamp) < CACHE_DURATION;
};

// Get active announcements
export const getActiveAnnouncements = async () => {
    try {
        // Check cache first
        if (isCacheValid(CACHE_KEYS.ANNOUNCEMENTS_TIMESTAMP)) {
            const cachedAnnouncements = getCachedData(CACHE_KEYS.ANNOUNCEMENTS);
            if (cachedAnnouncements) {
                console.log('📢 Using cached announcements');
                return cachedAnnouncements;
            }
        }

        console.log('📢 Fetching announcements from API');
        const response = await fetch(`${API_BASE_URL}/announcements?activeOnly=true`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const announcements = await response.json();

        // Filter out expired announcements
        const now = new Date();
        const activeAnnouncements = announcements.filter(announcement => {
            if (!announcement.active) return false;
            if (!announcement.expiresAt) return true;

            // Handle date-only expiration dates (YYYY-MM-DD format)
            // Convert to end of day in local timezone to avoid timezone issues
            const expirationDate = new Date(announcement.expiresAt);
            if (announcement.expiresAt.match(/^\d{4}-\d{2}-\d{2}$/)) {
                // Date-only format: set to end of day in local timezone
                expirationDate.setHours(23, 59, 59, 999);
            }

            return expirationDate > now;
        });

        // Cache the results
        setCachedData(CACHE_KEYS.ANNOUNCEMENTS, activeAnnouncements);
        setCachedData(CACHE_KEYS.ANNOUNCEMENTS_TIMESTAMP, Date.now());

        console.log('📢 Fetched and cached announcements:', activeAnnouncements.length);
        return activeAnnouncements;

    } catch (error) {
        console.error('Error fetching announcements:', error);

        // Return cached data if available, even if expired
        const cachedAnnouncements = getCachedData(CACHE_KEYS.ANNOUNCEMENTS);
        if (cachedAnnouncements) {
            console.log('📢 Using expired cache due to API error');
            return cachedAnnouncements;
        }

        return [];
    }
};

// Clear announcements cache (useful for testing or when you want to force refresh)
export const clearAnnouncementsCache = () => {
    localStorage.removeItem(CACHE_KEYS.ANNOUNCEMENTS);
    localStorage.removeItem(CACHE_KEYS.ANNOUNCEMENTS_TIMESTAMP);
    console.log('📢 Cleared announcements cache');
};
