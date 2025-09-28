import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { getActiveAnnouncements, clearAnnouncementsCache } from '../announcementService'

// Mock the API calls
global.fetch = vi.fn()

describe('AnnouncementService', () => {
    beforeEach(() => {
        // Clear all mocks and localStorage before each test
        vi.clearAllMocks()
        localStorage.clear()
        clearAnnouncementsCache()

        // Reset fetch mock to ensure clean state
        global.fetch = vi.fn()
    })

    afterEach(() => {
        // Clean up after each test
        clearAnnouncementsCache()
    })

    describe('getActiveAnnouncements', () => {
        it('should fetch announcements from API on first call', async () => {
            const now = new Date()
            const futureDate = new Date(now.getTime() + 24 * 60 * 60 * 1000) // 1 day from now

            const mockAnnouncements = [
                {
                    id: 'ANN001',
                    title: 'Holiday Hours',
                    message: 'We will be closed on Christmas Day',
                    type: 'hours',
                    active: true,
                    expiresAt: futureDate.toISOString().split('T')[0], // Future date
                    createdAt: '2024-01-01T00:00:00Z'
                },
                {
                    id: 'ANN002',
                    title: 'New Menu Items',
                    message: 'Check out our new breakfast tacos!',
                    type: 'general',
                    active: true,
                    expiresAt: null,
                    createdAt: '2024-01-02T00:00:00Z'
                }
            ]

            fetch.mockResolvedValueOnce({
                ok: true,
                json: async () => mockAnnouncements
            })

            const result = await getActiveAnnouncements()

            expect(fetch).toHaveBeenCalledTimes(1)
            expect(fetch).toHaveBeenCalledWith(
                'https://i8vgeh8do9.execute-api.us-east-1.amazonaws.com/prod/announcements?activeOnly=true',
                {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                }
            )
            expect(result).toEqual(mockAnnouncements)
            expect(localStorage.getItem('announcements')).toBeTruthy()
            expect(localStorage.getItem('announcements_timestamp')).toBeTruthy()
        })

        it('should use cached data on subsequent calls when cache is valid', async () => {
            const mockAnnouncements = [
                {
                    id: 'ANN001',
                    title: 'Cached Announcement',
                    message: 'This is from cache',
                    type: 'general',
                    active: true,
                    expiresAt: null,
                    createdAt: '2024-01-01T00:00:00Z'
                }
            ]

            // First call - fetch from API
            fetch.mockResolvedValueOnce({
                ok: true,
                json: async () => mockAnnouncements
            })

            await getActiveAnnouncements()

            // Second call - should use cache (no additional fetch calls)
            const result = await getActiveAnnouncements()

            expect(fetch).toHaveBeenCalledTimes(1) // Only called once
            expect(result).toEqual(mockAnnouncements)
        })

        it('should filter out expired announcements', async () => {
            const now = new Date()
            const pastDate = new Date(now.getTime() - 24 * 60 * 60 * 1000) // 1 day ago
            const futureDate = new Date(now.getTime() + 24 * 60 * 60 * 1000) // 1 day from now

            const mockAnnouncements = [
                {
                    id: 'ANN001',
                    title: 'Expired Announcement',
                    message: 'This should be filtered out',
                    type: 'general',
                    active: true,
                    expiresAt: pastDate.toISOString().split('T')[0], // Date-only format
                    createdAt: '2024-01-01T00:00:00Z'
                },
                {
                    id: 'ANN002',
                    title: 'Active Announcement',
                    message: 'This should remain',
                    type: 'general',
                    active: true,
                    expiresAt: futureDate.toISOString().split('T')[0], // Date-only format
                    createdAt: '2024-01-02T00:00:00Z'
                },
                {
                    id: 'ANN003',
                    title: 'No Expiration',
                    message: 'This should also remain',
                    type: 'general',
                    active: true,
                    expiresAt: null,
                    createdAt: '2024-01-03T00:00:00Z'
                }
            ]

            fetch.mockResolvedValueOnce({
                ok: true,
                json: async () => mockAnnouncements
            })

            const result = await getActiveAnnouncements()

            expect(result).toHaveLength(2)
            expect(result.find(a => a.id === 'ANN001')).toBeUndefined()
            expect(result.find(a => a.id === 'ANN002')).toBeDefined()
            expect(result.find(a => a.id === 'ANN003')).toBeDefined()
        })

        it('should filter out inactive announcements', async () => {
            const mockAnnouncements = [
                {
                    id: 'ANN001',
                    title: 'Inactive Announcement',
                    message: 'This should be filtered out',
                    type: 'general',
                    active: false,
                    expiresAt: null,
                    createdAt: '2024-01-01T00:00:00Z'
                },
                {
                    id: 'ANN002',
                    title: 'Active Announcement',
                    message: 'This should remain',
                    type: 'general',
                    active: true,
                    expiresAt: null,
                    createdAt: '2024-01-02T00:00:00Z'
                }
            ]

            fetch.mockResolvedValueOnce({
                ok: true,
                json: async () => mockAnnouncements
            })

            const result = await getActiveAnnouncements()

            expect(result).toHaveLength(1)
            expect(result[0].id).toBe('ANN002')
        })

        it('should handle API errors and return cached data if available', async () => {
            const mockAnnouncements = [
                {
                    id: 'ANN001',
                    title: 'Cached Announcement',
                    message: 'This is from cache',
                    type: 'general',
                    active: true,
                    expiresAt: null,
                    createdAt: '2024-01-01T00:00:00Z'
                }
            ]

            // First call - successful fetch
            fetch.mockResolvedValueOnce({
                ok: true,
                json: async () => mockAnnouncements
            })

            await getActiveAnnouncements()

            // Manually expire the cache to force a new API call
            const expiredTimestamp = Date.now() - (6 * 60 * 1000) // 6 minutes ago (older than 5 min cache)
            localStorage.setItem('announcements_timestamp', expiredTimestamp.toString())

            // Second call - API error
            fetch.mockRejectedValueOnce(new Error('Network error'))

            const result = await getActiveAnnouncements()

            expect(fetch).toHaveBeenCalledTimes(2)
            expect(result).toEqual(mockAnnouncements) // Should return cached data
        })

        it('should return empty array when API fails and no cache exists', async () => {
            fetch.mockRejectedValueOnce(new Error('Network error'))

            const result = await getActiveAnnouncements()

            expect(fetch).toHaveBeenCalledTimes(1)
            expect(result).toEqual([])
        })

        it('should handle HTTP error responses', async () => {
            fetch.mockResolvedValueOnce({
                ok: false,
                status: 500
            })

            const result = await getActiveAnnouncements()

            expect(fetch).toHaveBeenCalledTimes(1)
            expect(result).toEqual([])
        })

        it('should handle date-only expiration format correctly', async () => {
            const now = new Date()
            const today = now.toISOString().split('T')[0] // YYYY-MM-DD format

            const mockAnnouncements = [
                {
                    id: 'ANN001',
                    title: 'Today Expires',
                    message: 'Expires at end of today',
                    type: 'general',
                    active: true,
                    expiresAt: today,
                    createdAt: '2024-01-01T00:00:00Z'
                }
            ]

            fetch.mockResolvedValueOnce({
                ok: true,
                json: async () => mockAnnouncements
            })

            const result = await getActiveAnnouncements()

            // Should include the announcement since it expires at end of day
            expect(result).toHaveLength(1)
            expect(result[0].id).toBe('ANN001')
        })

        it('should handle invalid JSON in localStorage gracefully', async () => {
            // Set invalid JSON in localStorage
            localStorage.setItem('announcements', 'invalid json')
            localStorage.setItem('announcements_timestamp', Date.now().toString())

            const mockAnnouncements = [
                {
                    id: 'ANN001',
                    title: 'Fresh Announcement',
                    message: 'This should be fetched fresh',
                    type: 'general',
                    active: true,
                    expiresAt: null,
                    createdAt: '2024-01-01T00:00:00Z'
                }
            ]

            fetch.mockResolvedValueOnce({
                ok: true,
                json: async () => mockAnnouncements
            })

            const result = await getActiveAnnouncements()

            expect(fetch).toHaveBeenCalledTimes(1)
            expect(result).toEqual(mockAnnouncements)
        })
    })

    describe('clearAnnouncementsCache', () => {
        it('should clear announcements cache', async () => {
            const mockAnnouncements = [
                {
                    id: 'ANN001',
                    title: 'Test Announcement',
                    message: 'This will be cached',
                    type: 'general',
                    active: true,
                    expiresAt: null,
                    createdAt: '2024-01-01T00:00:00Z'
                }
            ]

            // Populate cache
            fetch.mockResolvedValueOnce({
                ok: true,
                json: async () => mockAnnouncements
            })

            await getActiveAnnouncements()

            // Verify cache is populated
            expect(localStorage.getItem('announcements')).toBeTruthy()
            expect(localStorage.getItem('announcements_timestamp')).toBeTruthy()

            // Clear cache
            clearAnnouncementsCache()

            // Verify cache is cleared
            expect(localStorage.getItem('announcements')).toBeNull()
            expect(localStorage.getItem('announcements_timestamp')).toBeNull()
        })
    })

    describe('Cache expiration', () => {
        it('should fetch fresh data when cache is expired', async () => {
            const mockAnnouncements1 = [
                {
                    id: 'ANN001',
                    title: 'First Announcement',
                    message: 'This is the first fetch',
                    type: 'general',
                    active: true,
                    expiresAt: null,
                    createdAt: '2024-01-01T00:00:00Z'
                }
            ]

            const mockAnnouncements2 = [
                {
                    id: 'ANN002',
                    title: 'Second Announcement',
                    message: 'This is the second fetch',
                    type: 'general',
                    active: true,
                    expiresAt: null,
                    createdAt: '2024-01-02T00:00:00Z'
                }
            ]

            // First call
            fetch.mockResolvedValueOnce({
                ok: true,
                json: async () => mockAnnouncements1
            })

            await getActiveAnnouncements()

            // Manually expire the cache by setting old timestamp
            const expiredTimestamp = Date.now() - (6 * 60 * 1000) // 6 minutes ago (older than 5 min cache)
            localStorage.setItem('announcements_timestamp', expiredTimestamp.toString())

            // Second call - should fetch fresh data
            fetch.mockResolvedValueOnce({
                ok: true,
                json: async () => mockAnnouncements2
            })

            const result = await getActiveAnnouncements()

            expect(fetch).toHaveBeenCalledTimes(2)
            expect(result).toEqual(mockAnnouncements2)
        })
    })
})
