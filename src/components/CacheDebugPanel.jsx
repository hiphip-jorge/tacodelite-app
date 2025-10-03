import React from 'react';
import { useMenu } from '../hooks/useMenu';

// Debug component to test caching functionality
const CacheDebugPanel = () => {
    const { getCacheStatus, clearCache } = useMenu();

    const handleCheckCache = () => {
        const cacheInfo = getCacheStatus();
        console.log('📊 Cache Status:', cacheInfo);
        alert(
            `Cache Status:\nCategories: ${cacheInfo.categories}\nMenu Items: ${cacheInfo.menuItems}\nVersion: ${cacheInfo.version}`
        );
    };

    const handleClearCache = () => {
        clearCache();
        alert('Cache cleared! Refresh the page to see fresh data.');
    };

    return (
        <div className='fixed bottom-4 right-4 bg-gray-800 p-4 rounded-lg shadow-lg border border-gray-600 z-50'>
            <h3 className='text-white text-sm font-semibold mb-2'>
                Cache Debug
            </h3>
            <div className='space-y-2'>
                <button
                    onClick={handleCheckCache}
                    className='w-full bg-blue-600 hover:bg-blue-700 text-white text-xs px-3 py-1 rounded transition-colors'
                >
                    Check Cache
                </button>
                <button
                    onClick={handleClearCache}
                    className='w-full bg-red-600 hover:bg-red-700 text-white text-xs px-3 py-1 rounded transition-colors'
                >
                    Clear Cache
                </button>
            </div>
            <p className='text-gray-400 text-xs mt-2'>
                Open console to see detailed cache logs
            </p>
        </div>
    );
};

export default CacheDebugPanel;
