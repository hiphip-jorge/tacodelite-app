import React from 'react';
import { motion } from 'framer-motion';

const MenuItem = ({ item = {}, index }) => {
    const formatPrice = price => {
        if (price === undefined || price === null || isNaN(price))
            return '$0.00';
        return `$${parseFloat(price).toFixed(2)}`;
    };

    const formatName = name => {
        if (!name) return '';
        return name
            .split(' ')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: index * 0.1 }}
            className='bg-gray-700 rounded-bubbly-lg shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 border border-gray-600/50 hover:border-taco-yellow-500/40 group p-1 flex flex-col h-full'
        >
            {/* Encapsulated title + description - accent color, rounded top and bottom */}
            <div className='bg-taco-yellow-500/15 border border-taco-yellow-500/40 rounded-t-bubbly-md rounded-b-md px-5 pt-5 pb-4 min-h-[8.5rem] flex-1 flex flex-col'>
                <h3 className='text-xl font-bold font-secular text-white mb-2 group-hover:text-taco-yellow-400 transition-colors'>
                    {formatName(item.name)}
                </h3>
                <p className='text-sm text-gray-300 line-clamp-3'>
                    {item.description}
                </p>
            </div>

            {/* Footer - badges and price */}
            <div className='flex justify-between items-center gap-3 px-5 py-4 shrink-0'>
                <div className='flex items-center gap-2 flex-wrap'>
                    {/* Vegetarian Badge */}
                    {item.vegetarian && (
                        <span className='bg-taco-green-600/20 text-taco-green-400 px-3 py-1.5 rounded-full font-medium text-xs border border-taco-green-600/30'>
                            🌱 Vegetarian
                        </span>
                    )}
                    {/* Unavailable Badge - only show when item is not active */}
                    {!item.active && (
                        <span className='bg-gray-600/50 text-gray-400 px-3 py-1.5 rounded-full font-medium text-xs border border-gray-500/30'>
                            Unavailable
                        </span>
                    )}
                </div>

                {/* Price - pill-shaped, prominent */}
                <span className='bg-taco-yellow-500/20 text-taco-yellow-400 px-3 py-1.5 rounded-full font-bold text-base border border-taco-yellow-500/40 shrink-0'>
                    {formatPrice(item.price)}
                </span>
            </div>
        </motion.div>
    );
};

export default MenuItem;
