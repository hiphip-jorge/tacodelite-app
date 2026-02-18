import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useTheme } from '../context/ThemeContext';

function Navbar() {
    const [isOpen, setIsOpen] = useState(false);
    const location = useLocation();
    const { isDark, toggleTheme } = useTheme();

    const navItems = [
        { path: '/', label: 'Home' },
        { path: '/menu', label: 'Menu' },
        { path: '/about', label: 'About' },
        { path: '/contact', label: 'Contact' },
    ];

    return (
        <nav className='bg-white dark:bg-gray-800 shadow-lg sticky top-0 z-50 border-b border-gray-200 dark:border-gray-700'>
            <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
                <div className='flex justify-between items-center h-16'>
                    {/* Logo */}
                    <Link to='/' className='flex items-center'>
                        <img
                            src='/assets/td-logo_2021.webp'
                            alt='Taco Delite'
                            className='h-12 w-auto'
                        />
                        <span className='ml-3 text-xl font-hobo text-gray-900 dark:text-white'>
                            Taco Delite
                        </span>
                    </Link>

                    {/* Desktop Navigation */}
                    <div className='hidden md:flex space-x-8'>
                        {navItems.map(item => (
                            <Link
                                key={item.path}
                                to={item.path}
                                className={`${
                                    location.pathname === item.path
                                        ? 'text-taco-yellow-500 border-b-2 border-taco-yellow-500'
                                        : 'text-gray-600 dark:text-gray-400 hover:text-taco-yellow-500'
                                } px-3 py-2 text-sm font-medium transition-colors`}
                            >
                                {item.label}
                            </Link>
                        ))}
                    </div>

                    {/* Theme toggle + Mobile menu button */}
                    <div className='flex items-center gap-2'>
                        <button
                            onClick={toggleTheme}
                            className='p-2 rounded-bubbly text-gray-600 dark:text-gray-400 hover:text-taco-yellow-500 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors'
                            aria-label={
                                isDark
                                    ? 'Switch to light mode'
                                    : 'Switch to dark mode'
                            }
                        >
                            {isDark ? (
                                <svg
                                    className='w-5 h-5'
                                    fill='none'
                                    viewBox='0 0 24 24'
                                    stroke='currentColor'
                                >
                                    <path
                                        strokeLinecap='round'
                                        strokeLinejoin='round'
                                        strokeWidth={2}
                                        d='M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z'
                                    />
                                </svg>
                            ) : (
                                <svg
                                    className='w-5 h-5'
                                    fill='none'
                                    viewBox='0 0 24 24'
                                    stroke='currentColor'
                                >
                                    <path
                                        strokeLinecap='round'
                                        strokeLinejoin='round'
                                        strokeWidth={2}
                                        d='M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z'
                                    />
                                </svg>
                            )}
                        </button>
                        <div className='md:hidden'>
                            <button
                                onClick={() => setIsOpen(!isOpen)}
                                className='text-gray-600 dark:text-gray-400 hover:text-taco-yellow-500 focus:outline-none focus:text-taco-yellow-500'
                            >
                                <svg
                                    className='h-6 w-6'
                                    fill='none'
                                    viewBox='0 0 24 24'
                                    stroke='currentColor'
                                >
                                    {isOpen ? (
                                        <path
                                            strokeLinecap='round'
                                            strokeLinejoin='round'
                                            strokeWidth={2}
                                            d='M6 18L18 6M6 6l12 12'
                                        />
                                    ) : (
                                        <path
                                            strokeLinecap='round'
                                            strokeLinejoin='round'
                                            strokeWidth={2}
                                            d='M4 6h16M4 12h16M4 18h16'
                                        />
                                    )}
                                </svg>
                            </button>
                        </div>
                    </div>
                </div>

                {/* Mobile Navigation */}
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className='md:hidden'
                    >
                        <div className='px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700'>
                            {navItems.map(item => (
                                <Link
                                    key={item.path}
                                    to={item.path}
                                    className={`${
                                        location.pathname === item.path
                                            ? 'bg-taco-yellow-100 dark:bg-taco-yellow-900 text-taco-yellow-600 dark:text-taco-yellow-400 border border-taco-yellow-50 dark:border-taco-yellow-500/40'
                                            : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-taco-yellow-500 border border-transparent hover:border-gray-300 dark:hover:border-gray-600'
                                    } block px-3 py-2 rounded-bubbly text-base font-medium transition-colors`}
                                    onClick={() => setIsOpen(false)}
                                >
                                    {item.label}
                                </Link>
                            ))}
                        </div>
                    </motion.div>
                )}
            </div>
        </nav>
    );
}

export default Navbar;
