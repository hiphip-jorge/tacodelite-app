import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getActiveAnnouncements } from '../services/announcementService';

const AnnouncementBanner = () => {
    const [announcements, setAnnouncements] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isVisible, setIsVisible] = useState(true);
    const [dismissedAnnouncements, setDismissedAnnouncements] = useState(
        new Set()
    );
    const [isHovered, setIsHovered] = useState(false);
    const [touchStart, setTouchStart] = useState(null);
    const [touchEnd, setTouchEnd] = useState(null);

    useEffect(() => {
        loadDismissedAnnouncements();
        loadAnnouncements();
    }, []);

    // Calculate visible announcements (filter out dismissed)
    const visibleAnnouncements = announcements.filter(
        announcement => !dismissedAnnouncements.has(announcement.id)
    );

    useEffect(() => {
        if (announcements.length > 1 && !isHovered) {
            const interval = setInterval(() => {
                setCurrentIndex(
                    prevIndex => (prevIndex + 1) % announcements.length
                );
            }, 5000); // Rotate every 5 seconds

            return () => clearInterval(interval);
        }
    }, [announcements.length, isHovered, currentIndex]); // Reset timer when index changes (manual or auto)

    // Keyboard navigation
    useEffect(() => {
        const handleKeyDown = e => {
            const visibleCount = visibleAnnouncements.length;
            if (visibleCount <= 1) return;

            if (e.key === 'ArrowLeft') {
                e.preventDefault();
                setCurrentIndex(prevIndex =>
                    prevIndex === 0 ? visibleCount - 1 : prevIndex - 1
                );
            } else if (e.key === 'ArrowRight') {
                e.preventDefault();
                setCurrentIndex(prevIndex => (prevIndex + 1) % visibleCount);
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [visibleAnnouncements.length]);

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

    const saveDismissedAnnouncements = dismissedSet => {
        try {
            const dismissedArray = Array.from(dismissedSet);
            localStorage.setItem(
                'dismissedAnnouncements',
                JSON.stringify(dismissedArray)
            );
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

    // Touch gesture handlers
    const minSwipeDistance = 50;

    const onTouchStart = e => {
        setTouchEnd(null);
        setTouchStart(e.targetTouches[0].clientX);
    };

    const onTouchMove = e => {
        setTouchEnd(e.targetTouches[0].clientX);
    };

    const onTouchEnd = () => {
        if (!touchStart || !touchEnd) return;

        const distance = touchStart - touchEnd;
        const isLeftSwipe = distance > minSwipeDistance;
        const isRightSwipe = distance < -minSwipeDistance;
        const visibleCount = visibleAnnouncements.length;

        if (visibleCount <= 1) return;

        if (isLeftSwipe) {
            // Swipe left - go to next
            setCurrentIndex(prevIndex => (prevIndex + 1) % visibleCount);
        } else if (isRightSwipe) {
            // Swipe right - go to previous
            setCurrentIndex(prevIndex =>
                prevIndex === 0 ? visibleCount - 1 : prevIndex - 1
            );
        }
    };

    const handleDismiss = announcementId => {
        const newDismissedSet = new Set([
            ...dismissedAnnouncements,
            announcementId,
        ]);
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

    const getTypeStyles = type => {
        switch (type) {
            case 'holiday':
                return {
                    bg: 'bg-emerald-100 border border-emerald-200',
                    text: 'text-emerald-900',
                    icon: '🎉',
                };
            case 'general':
                return {
                    bg: 'bg-slate-100 border border-slate-200',
                    text: 'text-slate-900',
                    icon: '📢',
                };
            case 'hours':
                return {
                    bg: 'bg-orange-100 border border-orange-200',
                    text: 'text-orange-900',
                    icon: '🕐',
                };
            case 'discount':
                return {
                    bg: 'bg-amber-100 border border-amber-200',
                    text: 'text-amber-900',
                    icon: '💰',
                };
            case 'event':
                return {
                    bg: 'bg-purple-100 border border-purple-200',
                    text: 'text-purple-900',
                    icon: '🎪',
                };
            default:
                return {
                    bg: 'bg-slate-100 border border-slate-200',
                    text: 'text-slate-900',
                    icon: '📢',
                };
        }
    };

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
                onTouchStart={onTouchStart}
                onTouchMove={onTouchMove}
                onTouchEnd={onTouchEnd}
            >
                <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
                    <div className='flex items-center justify-between py-3'>
                        <div className='flex items-center space-x-3'>
                            <span className='text-lg'>{styles.icon}</span>
                            <div className='flex-1'>
                                <h3 className='font-semibold text-sm sm:text-base'>
                                    {currentAnnouncement.title}
                                </h3>
                                <p className='text-sm opacity-90 mt-1'>
                                    {currentAnnouncement.message}
                                </p>
                            </div>
                        </div>

                        <div className='flex items-center space-x-2'>
                            {/* Pagination dots for multiple announcements */}
                            {visibleAnnouncements.length > 1 && (
                                <div className='flex space-x-1'>
                                    {visibleAnnouncements.map((_, index) => (
                                        <button
                                            key={index}
                                            onClick={() =>
                                                setCurrentIndex(index)
                                            }
                                            className={`w-2 h-2 rounded-full transition-colors ${
                                                index === currentIndex
                                                    ? 'bg-gray-700'
                                                    : 'bg-gray-400'
                                            }`}
                                        />
                                    ))}
                                </div>
                            )}

                            {/* Dismiss button */}
                            <button
                                onClick={() =>
                                    handleDismiss(currentAnnouncement.id)
                                }
                                className='ml-3 p-1 rounded-full hover:bg-gray-200 transition-colors'
                                aria-label='Dismiss announcement'
                            >
                                <svg
                                    className='w-4 h-4'
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
                            </button>
                        </div>
                    </div>
                </div>
            </motion.div>
        </AnimatePresence>
    );
};

export default AnnouncementBanner;
