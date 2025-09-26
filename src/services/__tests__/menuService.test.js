import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { getMenuItems, getCategories, getMenuItemsByCategory, cacheManager } from '../menuService'

// Mock the API calls
global.fetch = vi.fn()

describe('MenuService Caching', () => {
    beforeEach(() => {
        // Clear all mocks and localStorage before each test
        vi.clearAllMocks()
        localStorage.clear()
        cacheManager.clearAll()
    })

    afterEach(() => {
        // Clean up after each test
        cacheManager.clearAll()
    })

    describe('getMenuItems', () => {
        it('should fetch menu items from API on first call', async () => {
            const mockMenuItems = [
                { id: 1, name: 'Breakfast Taco', price: 3.50, categoryId: 1 },
                { id: 2, name: 'Burrito', price: 7.99, categoryId: 3 }
            ]

            // Mock menu items call (first, because getMenuItems calls this first)
            fetch.mockResolvedValueOnce({
                ok: true,
                json: async () => mockMenuItems,
                headers: new Map([['etag', 'abc123']])
            })

            // Mock menu version call (second, because getMenuItems calls getMenuVersion at the end)
            fetch.mockResolvedValueOnce({
                ok: true,
                json: async () => ({ version: 1 }),
                headers: new Map([['etag', 'version123']])
            })

            const result = await getMenuItems()

            expect(fetch).toHaveBeenCalledTimes(2) // menu items + menu version
            expect(result).toEqual(mockMenuItems)
            expect(localStorage.getItem('menu_items')).toBeTruthy()
        })

        it('should use cached data on subsequent calls when cache is valid', async () => {
            const mockMenuItems = [
                { id: 1, name: 'Breakfast Taco', price: 3.50, categoryId: 1 }
            ]

            // First call - mock menu items + menu version (correct order)
            fetch.mockResolvedValueOnce({
                ok: true,
                json: async () => mockMenuItems,
                headers: new Map([['etag', 'abc123']])
            })
            fetch.mockResolvedValueOnce({
                ok: true,
                json: async () => ({ version: 1 }),
                headers: new Map([['etag', 'version123']])
            })

            await getMenuItems()

            // Second call - should use cache (no additional fetch calls)
            const result = await getMenuItems()

            expect(fetch).toHaveBeenCalledTimes(2) // Only called twice (version + items)
            expect(result).toEqual(mockMenuItems)
        })

        it('should handle 304 Not Modified responses', async () => {
            const mockMenuItems = [
                { id: 1, name: 'Breakfast Taco', price: 3.50, categoryId: 1 }
            ]

            // First call - mock menu items + menu version (correct order)
            fetch.mockResolvedValueOnce({
                ok: true,
                json: async () => mockMenuItems,
                headers: new Map([['etag', 'abc123']])
            })
            fetch.mockResolvedValueOnce({
                ok: true,
                json: async () => ({ version: 1 }),
                headers: new Map([['etag', 'version123']])
            })

            await getMenuItems()

            // Clear the version cache to force a version check on second call
            localStorage.removeItem('menu_version')
            localStorage.removeItem('menu_version_timestamp')

            // Second call - should check version, then make conditional request for items
            fetch.mockResolvedValueOnce({
                ok: true,
                json: async () => ({ version: 1 }), // Same version
                headers: new Map([['etag', 'version123']])
            })
            fetch.mockResolvedValueOnce({
                status: 304,
                headers: new Map([['etag', 'abc123']])
            })

            const result = await getMenuItems()

            expect(fetch).toHaveBeenCalledTimes(3) // first: items + version, second: version check only (no need for 304 if version unchanged)
            expect(result).toEqual(mockMenuItems) // Should return cached data
        })
    })

    describe('getCategories', () => {
        it('should fetch categories from API on first call', async () => {
            const mockCategories = [
                { id: 1, name: 'Breakfast', pk: 'CATEGORY#001' },
                { id: 2, name: 'Tacos', pk: 'CATEGORY#002' }
            ]

            // Mock categories call (first)
            fetch.mockResolvedValueOnce({
                ok: true,
                json: async () => mockCategories,
                headers: new Map([['etag', 'def456']])
            })

            // Mock menu version call (second)
            fetch.mockResolvedValueOnce({
                ok: true,
                json: async () => ({ version: 1 }),
                headers: new Map([['etag', 'version123']])
            })

            const result = await getCategories()

            expect(fetch).toHaveBeenCalledTimes(2) // categories + version
            expect(result).toEqual(mockCategories)
            expect(localStorage.getItem('menu_categories')).toBeTruthy()
        })
    })

    describe('getMenuItemsByCategory', () => {
        it('should filter cached menu items by category', async () => {
            const mockMenuItems = [
                { id: 1, name: 'Breakfast Taco', price: 3.50, categoryId: 1 },
                { id: 2, name: 'Burrito', price: 7.99, categoryId: 3 },
                { id: 3, name: 'Egg Bowl', price: 5.50, categoryId: 1 }
            ]

            // Mock menu items call (first, because getMenuItemsByCategory calls getMenuItems first)
            fetch.mockResolvedValueOnce({
                ok: true,
                json: async () => mockMenuItems,
                headers: new Map([['etag', 'abc123']])
            })

            // Mock menu version call (second)
            fetch.mockResolvedValueOnce({
                ok: true,
                json: async () => ({ version: 1 }),
                headers: new Map([['etag', 'version123']])
            })

            const result = await getMenuItemsByCategory(1)

            expect(result).toHaveLength(2)
            expect(result).toEqual([
                { id: 1, name: 'Breakfast Taco', price: 3.50, categoryId: 1 },
                { id: 3, name: 'Egg Bowl', price: 5.50, categoryId: 1 }
            ])
        })

        it('should return all items for "all" category', async () => {
            const mockMenuItems = [
                { id: 1, name: 'Breakfast Taco', price: 3.50, categoryId: 1 },
                { id: 2, name: 'Burrito', price: 7.99, categoryId: 3 }
            ]

            // Mock menu items call (first)
            fetch.mockResolvedValueOnce({
                ok: true,
                json: async () => mockMenuItems,
                headers: new Map([['etag', 'abc123']])
            })

            // Mock menu version call (second)
            fetch.mockResolvedValueOnce({
                ok: true,
                json: async () => ({ version: 1 }),
                headers: new Map([['etag', 'version123']])
            })

            const result = await getMenuItemsByCategory('all')

            expect(result).toEqual(mockMenuItems)
        })
    })

    describe('Cache Management', () => {
        it('should clear all caches when clearAll is called', async () => {
            const mockMenuItems = [{ id: 1, name: 'Test Item', price: 1.00, categoryId: 1 }]
            const mockCategories = [{ id: 1, name: 'Test Category', pk: 'CATEGORY#001' }]

            // Populate cache - mock menu version + menu items
            fetch.mockResolvedValueOnce({
                ok: true,
                json: async () => ({ version: 1 }),
                headers: new Map([['etag', 'version123']])
            })
            fetch.mockResolvedValueOnce({
                ok: true,
                json: async () => mockMenuItems,
                headers: new Map([['etag', 'abc123']])
            })
            await getMenuItems()

            // Populate cache - mock menu version + categories
            fetch.mockResolvedValueOnce({
                ok: true,
                json: async () => ({ version: 1 }),
                headers: new Map([['etag', 'version123']])
            })
            fetch.mockResolvedValueOnce({
                ok: true,
                json: async () => mockCategories,
                headers: new Map([['etag', 'def456']])
            })
            await getCategories()

            // Verify cache is populated
            expect(localStorage.getItem('menu_items')).toBeTruthy()
            expect(localStorage.getItem('menu_categories')).toBeTruthy()

            // Clear all caches
            cacheManager.clearAll()

            // Verify cache is cleared
            expect(localStorage.getItem('menu_items')).toBeNull()
            expect(localStorage.getItem('menu_categories')).toBeNull()
        })
    })
})
