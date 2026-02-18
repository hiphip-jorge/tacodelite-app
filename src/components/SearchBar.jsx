import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

const SearchBar = ({
    searchTerm,
    onSearchChange,
    placeholder = 'Search our menu...',
}) => {
    const [inputValue, setInputValue] = useState(searchTerm || '');

    // Sync input value with searchTerm prop
    useEffect(() => {
        setInputValue(searchTerm || '');
    }, [searchTerm]);

    const handleSubmit = e => {
        e.preventDefault();
        onSearchChange(inputValue.trim());
    };

    const handleClear = () => {
        setInputValue('');
        onSearchChange('');
    };

    const handleInputChange = e => {
        const value = e.target.value;
        setInputValue(value);
        // Real-time search - call onSearchChange immediately
        onSearchChange(value);
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className='w-full max-w-2xl mx-auto mb-8'
        >
            <form onSubmit={handleSubmit} className='relative'>
                <div className='relative'>
                    {/* Search Icon */}
                    <div className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none'>
                        <svg
                            className='h-5 w-5 text-gray-400'
                            fill='none'
                            stroke='currentColor'
                            viewBox='0 0 24 24'
                        >
                            <path
                                strokeLinecap='round'
                                strokeLinejoin='round'
                                strokeWidth={2}
                                d='M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z'
                            />
                        </svg>
                    </div>

                    {/* Input Field */}
                    <input
                        type='text'
                        value={inputValue}
                        onChange={handleInputChange}
                        placeholder={placeholder}
                        className='block w-full pl-10 pr-12 py-3 border border-gray-600 rounded-bubbly bg-gray-800 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-taco-yellow-500 focus:border-transparent transition-all duration-200'
                    />

                    {/* Clear Button */}
                    {inputValue && (
                        <motion.button
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.8 }}
                            type='button'
                            onClick={handleClear}
                            className='absolute inset-y-0 right-20 pr-3 flex items-center'
                        >
                            <svg
                                className='h-5 w-5 text-gray-400 hover:text-gray-300 transition-colors cursor-pointer'
                                fill='none'
                                stroke='currentColor'
                                viewBox='0 0 24 24'
                            >
                                <path
                                    strokeLinecap='round'
                                    strokeLinejoin='round'
                                    strokeWidth={2}
                                    d='M6 18L18 6M6 6l12 12'
                                />
                            </svg>
                        </motion.button>
                    )}

                    {/* Search Button */}
                    <button
                        type='submit'
                        className='absolute inset-y-0 right-0 px-4 py-2 bg-taco-yellow-500 text-gray-900 font-medium rounded-r-bubbly hover:bg-taco-yellow-400 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-taco-yellow-500 focus:ring-offset-2 focus:ring-offset-gray-800'
                    >
                        Search
                    </button>
                </div>

                {/* Search Tips */}
                {!inputValue && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.3 }}
                        className='mt-2 text-center text-sm text-gray-500'
                    >
                        Try searching for "taco", "vegetarian", "breakfast", or
                        any ingredient
                    </motion.div>
                )}
            </form>
        </motion.div>
    );
};

export default SearchBar;
