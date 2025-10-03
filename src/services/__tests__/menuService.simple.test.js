import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { cacheManager } from '../menuService';

describe('MenuService Cache Management', () => {
    beforeEach(() => {
        // Clear all mocks and localStorage before each test
        vi.clearAllMocks();
        localStorage.clear();
        cacheManager.clearAll();
    });

    afterEach(() => {
        // Clean up after each test
        cacheManager.clearAll();
    });

    describe('Cache Manager', () => {
        it('should clear all caches when clearAll is called', () => {
            // Set some test data in localStorage
            localStorage.setItem(
                'menu_items',
                JSON.stringify([{ id: 1, name: 'Test' }])
            );
            localStorage.setItem(
                'menu_categories',
                JSON.stringify([{ id: 1, name: 'Test' }])
            );
            localStorage.setItem('menu_version', '1');

            // Verify cache is populated
            expect(localStorage.getItem('menu_items')).toBeTruthy();
            expect(localStorage.getItem('menu_categories')).toBeTruthy();
            expect(localStorage.getItem('menu_version')).toBeTruthy();

            // Clear all caches
            cacheManager.clearAll();

            // Verify cache is cleared
            expect(localStorage.getItem('menu_items')).toBeNull();
            expect(localStorage.getItem('menu_categories')).toBeNull();
            expect(localStorage.getItem('menu_version')).toBeNull();
        });

        it('should clear specific caches when clearCategories is called', () => {
            // Set some test data in localStorage
            localStorage.setItem(
                'menu_items',
                JSON.stringify([{ id: 1, name: 'Test' }])
            );
            localStorage.setItem(
                'menu_categories',
                JSON.stringify([{ id: 1, name: 'Test' }])
            );

            // Clear only categories cache
            cacheManager.clearCategories();

            // Verify only categories cache is cleared
            expect(localStorage.getItem('menu_items')).toBeTruthy();
            expect(localStorage.getItem('menu_categories')).toBeNull();
        });

        it('should clear specific caches when clearMenuItems is called', () => {
            // Set some test data in localStorage
            localStorage.setItem(
                'menu_items',
                JSON.stringify([{ id: 1, name: 'Test' }])
            );
            localStorage.setItem(
                'menu_categories',
                JSON.stringify([{ id: 1, name: 'Test' }])
            );

            // Clear only menu items cache
            cacheManager.clearMenuItems();

            // Verify only menu items cache is cleared
            expect(localStorage.getItem('menu_items')).toBeNull();
            expect(localStorage.getItem('menu_categories')).toBeTruthy();
        });

        it('should provide cache info for debugging', () => {
            // Set some test data in localStorage
            const testMenuItems = [
                { id: 1, name: 'Test Item', price: 1.0, categoryId: 1 },
            ];
            const testCategories = [
                { id: 1, name: 'Test Category', pk: 'CATEGORY#001' },
            ];

            localStorage.setItem(
                'menu_items',
                JSON.stringify({
                    data: testMenuItems,
                    etag: 'abc123',
                    timestamp: Date.now(),
                })
            );
            localStorage.setItem(
                'menu_categories',
                JSON.stringify({
                    data: testCategories,
                    etag: 'def456',
                    timestamp: Date.now(),
                })
            );
            localStorage.setItem(
                'menu_version',
                JSON.stringify({
                    data: '1',
                    timestamp: Date.now(),
                })
            );

            const cacheInfo = cacheManager.getCacheInfo();

            expect(cacheInfo).toHaveProperty('categories');
            expect(cacheInfo).toHaveProperty('menuItems');
            expect(cacheInfo).toHaveProperty('version');
            expect(cacheInfo.categories).toContain('Cached (1 items');
            expect(cacheInfo.menuItems).toContain('Cached (1 items');
            expect(cacheInfo.version).toBe('Version 1');
        });
    });
});
