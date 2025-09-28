import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getActiveAnnouncements } from '../services/announcementService';

const AnnouncementBanner = () => {
    const [announcements, setAnnouncements] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isVisible, setIsVisible] = useState(true);
    const [dismissedAnnouncements, setDismissedAnnouncements] = useState(new Set());
    const [isHovered, setIsHovered] = useState(false);

    useEffect(() => {
        loadDismissedAnnouncements();
        loadAnnouncements();
    }, []);

    useEffect(() => {
        if (announcements.length > 1 && !isHovered) {
            const interval = setInterval(() => {
                setCurrentIndex((prevIndex) =>
                    (prevIndex + 1) % announcements.length
                );
            }, 5000); // Rotate every 5 seconds

            return () => clearInterval(interval);
        }
    }, [announcements.length, isHovered]);

    const loadDismissedAnnouncements = () => {
        try {
            const dismissed = localStorage.getItem('dismissedAnnouncements');
            if (dismissed) {
                const dismissedArray = JSON.parse(dismissed);
                setDismissedAnnouncements(new Set(dismissedArray));
            }
        } catch (error) {
            console.error('Error loading dismissed announcements:', error);
        }
    };

    const saveDismissedAnnouncements = (dismissedSet) => {
        try {
            const dismissedArray = Array.from(dismissedSet);
            localStorage.setItem('dismissedAnnouncements', JSON.stringify(dismissedArray));
        } catch (error) {
            console.error('Error saving dismissed announcements:', error);
        }
    };

    const loadAnnouncements = async () => {
        try {
            const activeAnnouncements = await getActiveAnnouncements();
            setAnnouncements(activeAnnouncements);
        } catch (error) {
            console.error('Error loading announcements:', error);
        }
    };

    const handleDismiss = (announcementId) => {
        const newDismissedSet = new Set([...dismissedAnnouncements, announcementId]);
        setDismissedAnnouncements(newDismissedSet);
        saveDismissedAnnouncements(newDismissedSet);

        // Check if this was the last visible announcement
        const remainingVisible = announcements.filter(
            announcement => !newDismissedSet.has(announcement.id)
        );

        if (remainingVisible.length === 0) {
            setIsVisible(false);
        } else {
            // Move to next announcement, but adjust for the new visible list
            const currentVisibleIndex = visibleAnnouncements.findIndex(
                ann => ann.id === announcementId
            );
            const nextIndex = currentVisibleIndex % remainingVisible.length;
            setCurrentIndex(nextIndex);
        }
    };

    const getTypeStyles = (type) => {
        switch (type) {
            case 'holiday':
                return {
                    bg: 'bg-green-600',
                    text: 'text-white',
                    icon: '🎉'
                };
            case 'general':
                return {
                    bg: 'bg-taco-blue-600',
                    text: 'text-white',
                    icon: '📢'
                };
            case 'hours':
                return {
                    bg: 'bg-red-600',
                    text: 'text-white',
                    icon: '🕐'
                };
            case 'discount':
                return {
                    bg: 'bg-yellow-600',
                    text: 'text-white',
                    icon: '💰'
                };
            case 'event':
                return {
                    bg: 'bg-pink-600',
                    text: 'text-white',
                    icon: '🎪'
                };
            default:
                return {
                    bg: 'bg-taco-blue-600',
                    text: 'text-white',
                    icon: '📢'
                };
        }
    };

    // Filter out dismissed announcements
    const visibleAnnouncements = announcements.filter(
        announcement => !dismissedAnnouncements.has(announcement.id)
    );

    if (!isVisible || visibleAnnouncements.length === 0) {
        return null;
    }

    const currentAnnouncement = visibleAnnouncements[currentIndex];
    const styles = getTypeStyles(currentAnnouncement.type);

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0, y: -50 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -50 }}
                transition={{ duration: 0.3 }}
                className={`${styles.bg} ${styles.text} shadow-lg`}
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
            >
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between py-3">
                        <div className="flex items-center space-x-3">
                            <span className="text-lg">{styles.icon}</span>
                            <div className="flex-1">
                                <h3 className="font-semibold text-sm sm:text-base">
                                    {currentAnnouncement.title}
                                </h3>
                                <p className="text-sm opacity-90 mt-1">
                                    {currentAnnouncement.message}
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center space-x-2">
                            {/* Pagination dots for multiple announcements */}
                            {visibleAnnouncements.length > 1 && (
                                <div className="flex space-x-1">
                                    {visibleAnnouncements.map((_, index) => (
                                        <button
                                            key={index}
                                            onClick={() => setCurrentIndex(index)}
                                            className={`w-2 h-2 rounded-full transition-colors ${index === currentIndex
                                                ? 'bg-white'
                                                : 'bg-white/50'
                                                }`}
                                        />
                                    ))}
                                </div>
                            )}

                            {/* Dismiss button */}
                            <button
                                onClick={() => handleDismiss(currentAnnouncement.id)}
                                className="ml-3 p-1 rounded-full hover:bg-black/20 transition-colors"
                                aria-label="Dismiss announcement"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                    </div>
                </div>
            </motion.div>
        </AnimatePresence>
    );
};

export default AnnouncementBanner;
