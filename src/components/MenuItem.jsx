import React from 'react';
import { motion } from 'framer-motion';

const MenuItem = ({ item, index }) => {
    const formatPrice = (price) => {
        return `$${price.toFixed(2)}`;
    };

    const formatName = (name) => {
        return name
            .split(' ')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');
    };

    const getItemInitials = (name) => {
        return name
            .split(' ')
            .map(word => word.charAt(0).toUpperCase())
            .slice(0, 2) // Take first 2 words max
            .join('');
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: index * 0.1 }}
            className="bg-gray-700 rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 border border-gray-700 hover:border-taco-yellow-500/50 group"
        >
            {/* Initials Section */}
            <div className="h-48 overflow-hidden relative">
                <div className="w-full h-full bg-gradient-to-br from-yellow-300 to-orange-300 flex items-center justify-center">
                    <div className="text-6xl font-bold text-gray-700 drop-shadow-lg font-hobo">
                        {getItemInitials(item.name)}
                    </div>
                </div>

                {/* Price Badge */}
                <div className="absolute top-3 right-3">
                    <span className="bg-gray-700 text-white px-3 py-1 rounded-full font-bold text-lg shadow-lg border border-gray-600">
                        {formatPrice(item.price)}
                    </span>
                </div>

                {/* Vegetarian Badge */}
                {item.vegetarian && (
                    <div className="absolute top-3 left-3">
                        <span className="bg-taco-green-600 text-white px-3 py-1 rounded-full font-medium text-sm shadow-lg flex items-center gap-1">
                            🌱 Vegetarian
                        </span>
                    </div>
                )}
            </div>

            {/* Content Section */}
            <div className="p-6">
                {/* Header */}
                <div className="mb-3">
                    <h3 className="text-xl font-bold text-white mb-2 group-hover:text-taco-yellow-400 transition-colors">
                        {formatName(item.name)}
                    </h3>
                    <p className="text-sm text-gray-400">
                        {item.description}
                    </p>
                </div>

                {/* Action Section */}
                <div className="flex justify-between items-center pt-3 border-t border-gray-500">
                    <div className="flex items-center gap-2">
                        {/* Active status */}
                        {!item.active && (
                            <span className="text-xs text-red-400 bg-red-900/20 px-2 py-1 rounded border border-red-700/30">
                                Currently Unavailable
                            </span>
                        )}
                    </div>

                    {/* Item Status */}
                    <div className="text-right">
                        {item.active ? (
                            <span className="text-sm text-taco-green-400 bg-taco-green-900/20 px-3 py-2 rounded-lg border border-taco-green-700/30">
                                Available
                            </span>
                        ) : (
                            <span className="text-sm text-gray-400 bg-gray-700/20 px-3 py-2 rounded-lg border border-gray-600/30">
                                Currently Unavailable
                            </span>
                        )}
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

export default MenuItem;
