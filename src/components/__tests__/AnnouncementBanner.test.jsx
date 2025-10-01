import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react'
import AnnouncementBanner from '../AnnouncementBanner'
import { getActiveAnnouncements } from '../../services/announcementService'

// Mock the announcement service
vi.mock('../../services/announcementService', () => ({
    getActiveAnnouncements: vi.fn()
}))

// Mock framer-motion to avoid animation issues in tests
vi.mock('framer-motion', () => ({
    motion: {
        div: ({ children, className, ...props }) => (
            <div className={className} {...props}>
                {children}
            </div>
        )
    },
    AnimatePresence: ({ children }) => children
}))

describe('AnnouncementBanner', () => {
    const mockAnnouncements = [
        {
            id: 'ANN001',
            title: 'Holiday Hours',
            message: 'We will be closed on Christmas Day',
            type: 'holiday',
            active: true,
            expiresAt: '2024-12-31',
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
        },
        {
            id: 'ANN003',
            title: 'Special Discount',
            message: '20% off all tacos this week!',
            type: 'discount',
            active: true,
            expiresAt: '2024-12-31',
            createdAt: '2024-01-03T00:00:00Z'
        }
    ]

    beforeEach(() => {
        vi.clearAllMocks()
        localStorage.clear()
        getActiveAnnouncements.mockResolvedValue(mockAnnouncements)
    })

    afterEach(() => {
        localStorage.clear()
    })

    describe('Rendering', () => {
        it('should render announcement banner with first announcement', async () => {
            await act(async () => {
                render(<AnnouncementBanner />)
            })

            await waitFor(() => {
                expect(screen.getByText('Holiday Hours')).toBeInTheDocument()
                expect(screen.getByText('We will be closed on Christmas Day')).toBeInTheDocument()
            })
        })

        it('should not render when no announcements are available', async () => {
            getActiveAnnouncements.mockResolvedValue([])

            await act(async () => {
                render(<AnnouncementBanner />)
            })

            await waitFor(() => {
                expect(screen.queryByText('Holiday Hours')).not.toBeInTheDocument()
            })
        })

        it('should not render when all announcements are dismissed', async () => {
            // Pre-dismiss all announcements
            localStorage.setItem('dismissedAnnouncements', JSON.stringify(['ANN001', 'ANN002', 'ANN003']))

            await act(async () => {
                render(<AnnouncementBanner />)
            })

            await waitFor(() => {
                expect(screen.queryByText('Holiday Hours')).not.toBeInTheDocument()
            })
        })

        it('should render correct type styles and icons', async () => {
            await act(async () => {
                render(<AnnouncementBanner />)
            })

            await waitFor(() => {
                // Holiday type should have green background and party icon
                expect(screen.getByText('🎉')).toBeInTheDocument()
                expect(screen.getByText('Holiday Hours')).toBeInTheDocument()
            })
        })

        it('should handle different announcement types correctly', async () => {
            const singleAnnouncement = [mockAnnouncements[1]] // General type
            getActiveAnnouncements.mockResolvedValue(singleAnnouncement)

            await act(async () => {
                render(<AnnouncementBanner />)
            })

            await waitFor(() => {
                expect(screen.getByText('📢')).toBeInTheDocument() // General icon
                expect(screen.getByText('New Menu Items')).toBeInTheDocument()
            })
        })
    })

    describe('Dismissal functionality', () => {
        it('should dismiss announcement when dismiss button is clicked', async () => {
            await act(async () => {
                render(<AnnouncementBanner />)
            })

            await waitFor(() => {
                expect(screen.getByText('Holiday Hours')).toBeInTheDocument()
            })

            const dismissButton = screen.getByLabelText('Dismiss announcement')
            fireEvent.click(dismissButton)

            await waitFor(() => {
                expect(screen.queryByText('Holiday Hours')).not.toBeInTheDocument()
            })

            // Check that dismissal was saved to localStorage
            const dismissed = JSON.parse(localStorage.getItem('dismissedAnnouncements') || '[]')
            expect(dismissed).toContain('ANN001')
        })

        it('should move to next announcement after dismissing current one', async () => {
            await act(async () => {
                render(<AnnouncementBanner />)
            })

            await waitFor(() => {
                expect(screen.getByText('Holiday Hours')).toBeInTheDocument()
            })

            const dismissButton = screen.getByLabelText('Dismiss announcement')
            fireEvent.click(dismissButton)

            await waitFor(() => {
                expect(screen.getByText('New Menu Items')).toBeInTheDocument()
            })
        })

        it('should hide banner when last announcement is dismissed', async () => {
            const singleAnnouncement = [mockAnnouncements[0]]
            getActiveAnnouncements.mockResolvedValue(singleAnnouncement)

            await act(async () => {
                render(<AnnouncementBanner />)
            })

            await waitFor(() => {
                expect(screen.getByText('Holiday Hours')).toBeInTheDocument()
            })

            const dismissButton = screen.getByLabelText('Dismiss announcement')
            fireEvent.click(dismissButton)

            await waitFor(() => {
                expect(screen.queryByText('Holiday Hours')).not.toBeInTheDocument()
            })
        })

        it('should load previously dismissed announcements from localStorage', async () => {
            // Pre-dismiss first announcement
            localStorage.setItem('dismissedAnnouncements', JSON.stringify(['ANN001']))

            await act(async () => {
                render(<AnnouncementBanner />)
            })

            await waitFor(() => {
                // Should show second announcement, not first
                expect(screen.getByText('New Menu Items')).toBeInTheDocument()
                expect(screen.queryByText('Holiday Hours')).not.toBeInTheDocument()
            })
        })

        it('should handle localStorage errors gracefully', async () => {
            // Mock localStorage to throw error
            const originalSetItem = localStorage.setItem
            localStorage.setItem = vi.fn(() => {
                throw new Error('localStorage error')
            })

            await act(async () => {
                render(<AnnouncementBanner />)
            })

            await waitFor(() => {
                expect(screen.getByText('Holiday Hours')).toBeInTheDocument()
            })

            const dismissButton = screen.getByLabelText('Dismiss announcement')
            fireEvent.click(dismissButton)

            // Should still dismiss the announcement even if localStorage fails
            await waitFor(() => {
                expect(screen.getByText('New Menu Items')).toBeInTheDocument()
            })

            // Restore localStorage
            localStorage.setItem = originalSetItem
        })
    })

    describe('Pagination and rotation', () => {
        it('should show pagination dots when multiple announcements are visible', async () => {
            await act(async () => {
                render(<AnnouncementBanner />)
            })

            await waitFor(() => {
                // Should show 3 dots for 3 announcements (excluding dismiss button)
                const dots = screen.getAllByRole('button').filter(button =>
                    button.className.includes('rounded-full') &&
                    button.className.includes('w-2 h-2')
                )
                expect(dots).toHaveLength(3)
            })
        })

        it('should not show pagination dots when only one announcement is visible', async () => {
            const singleAnnouncement = [mockAnnouncements[0]]
            getActiveAnnouncements.mockResolvedValue(singleAnnouncement)

            await act(async () => {
                render(<AnnouncementBanner />)
            })

            await waitFor(() => {
                // Should not show pagination dots (excluding dismiss button)
                const dots = screen.queryAllByRole('button').filter(button =>
                    button.className.includes('rounded-full') &&
                    button.className.includes('w-2 h-2')
                )
                expect(dots).toHaveLength(0)
            })
        })

        it('should switch to selected announcement when pagination dot is clicked', async () => {
            await act(async () => {
                render(<AnnouncementBanner />)
            })

            await waitFor(() => {
                expect(screen.getByText('Holiday Hours')).toBeInTheDocument()
            })

            // Click on the third dot (index 2)
            const dots = screen.getAllByRole('button').filter(button =>
                button.className.includes('rounded-full') &&
                button.className.includes('w-2 h-2')
            )
            fireEvent.click(dots[2])

            await waitFor(() => {
                expect(screen.getByText('Special Discount')).toBeInTheDocument()
            })
        })
    })

    describe('Keyboard navigation', () => {
        it('should navigate to next announcement when right arrow is pressed', async () => {
            const testAnnouncements = [
                {
                    id: 'ANN001',
                    title: 'First Announcement',
                    message: 'First message',
                    type: 'general',
                    active: true,
                    expiresAt: null,
                    createdAt: '2024-01-01T00:00:00Z'
                },
                {
                    id: 'ANN002',
                    title: 'Second Announcement',
                    message: 'Second message',
                    type: 'hours',
                    active: true,
                    expiresAt: null,
                    createdAt: '2024-01-02T00:00:00Z'
                }
            ]

            getActiveAnnouncements.mockResolvedValueOnce(testAnnouncements)

            await act(async () => {
                render(<AnnouncementBanner />)
            })

            await waitFor(() => {
                expect(screen.getByText('First Announcement')).toBeInTheDocument()
            })

            // Simulate right arrow key press
            fireEvent.keyDown(window, { key: 'ArrowRight' })

            await waitFor(() => {
                expect(screen.getByText('Second Announcement')).toBeInTheDocument()
            })
        })

        it('should navigate to previous announcement when left arrow is pressed', async () => {
            const testAnnouncements = [
                {
                    id: 'ANN001',
                    title: 'First Announcement',
                    message: 'First message',
                    type: 'general',
                    active: true,
                    expiresAt: null,
                    createdAt: '2024-01-01T00:00:00Z'
                },
                {
                    id: 'ANN002',
                    title: 'Second Announcement',
                    message: 'Second message',
                    type: 'hours',
                    active: true,
                    expiresAt: null,
                    createdAt: '2024-01-02T00:00:00Z'
                }
            ]

            getActiveAnnouncements.mockResolvedValueOnce(testAnnouncements)

            await act(async () => {
                render(<AnnouncementBanner />)
            })

            await waitFor(() => {
                expect(screen.getByText('First Announcement')).toBeInTheDocument()
            })

            // Navigate to second, then back to first with left arrow
            fireEvent.keyDown(window, { key: 'ArrowRight' })

            await waitFor(() => {
                expect(screen.getByText('Second Announcement')).toBeInTheDocument()
            })

            fireEvent.keyDown(window, { key: 'ArrowLeft' })

            await waitFor(() => {
                expect(screen.getByText('First Announcement')).toBeInTheDocument()
            })
        })

        it('should wrap around to last announcement when left arrow is pressed on first', async () => {
            const testAnnouncements = [
                {
                    id: 'ANN001',
                    title: 'First Announcement',
                    message: 'First message',
                    type: 'general',
                    active: true,
                    expiresAt: null,
                    createdAt: '2024-01-01T00:00:00Z'
                },
                {
                    id: 'ANN002',
                    title: 'Second Announcement',
                    message: 'Second message',
                    type: 'hours',
                    active: true,
                    expiresAt: null,
                    createdAt: '2024-01-02T00:00:00Z'
                }
            ]

            getActiveAnnouncements.mockResolvedValueOnce(testAnnouncements)

            await act(async () => {
                render(<AnnouncementBanner />)
            })

            await waitFor(() => {
                expect(screen.getByText('First Announcement')).toBeInTheDocument()
            })

            // Press left arrow on first announcement - should wrap to last
            fireEvent.keyDown(window, { key: 'ArrowLeft' })

            await waitFor(() => {
                expect(screen.getByText('Second Announcement')).toBeInTheDocument()
            })
        })

        it('should not navigate when only one announcement is visible', async () => {
            const testAnnouncements = [
                {
                    id: 'ANN001',
                    title: 'Only Announcement',
                    message: 'Only message',
                    type: 'general',
                    active: true,
                    expiresAt: null,
                    createdAt: '2024-01-01T00:00:00Z'
                }
            ]

            getActiveAnnouncements.mockResolvedValueOnce(testAnnouncements)

            await act(async () => {
                render(<AnnouncementBanner />)
            })

            await waitFor(() => {
                expect(screen.getByText('Only Announcement')).toBeInTheDocument()
            })

            // Try to navigate - should stay on same announcement
            fireEvent.keyDown(window, { key: 'ArrowRight' })

            await waitFor(() => {
                expect(screen.getByText('Only Announcement')).toBeInTheDocument()
            })
        })
    })

    describe('Touch gestures', () => {
        it('should navigate to next announcement on swipe left', async () => {
            const testAnnouncements = [
                {
                    id: 'ANN001',
                    title: 'First Announcement',
                    message: 'First message',
                    type: 'general',
                    active: true,
                    expiresAt: null,
                    createdAt: '2024-01-01T00:00:00Z'
                },
                {
                    id: 'ANN002',
                    title: 'Second Announcement',
                    message: 'Second message',
                    type: 'hours',
                    active: true,
                    expiresAt: null,
                    createdAt: '2024-01-02T00:00:00Z'
                }
            ]

            getActiveAnnouncements.mockResolvedValueOnce(testAnnouncements)

            await act(async () => {
                render(<AnnouncementBanner />)
            })

            await waitFor(() => {
                expect(screen.getByText('First Announcement')).toBeInTheDocument()
            })

            const banner = screen.getByText('First Announcement').closest('div').parentElement.parentElement

            // Simulate swipe left (touchStart at 200, touchEnd at 100)
            fireEvent.touchStart(banner, {
                targetTouches: [{ clientX: 200 }]
            })
            fireEvent.touchMove(banner, {
                targetTouches: [{ clientX: 100 }]
            })
            fireEvent.touchEnd(banner)

            await waitFor(() => {
                expect(screen.getByText('Second Announcement')).toBeInTheDocument()
            })
        })

        it('should navigate to previous announcement on swipe right', async () => {
            const testAnnouncements = [
                {
                    id: 'ANN001',
                    title: 'First Announcement',
                    message: 'First message',
                    type: 'general',
                    active: true,
                    expiresAt: null,
                    createdAt: '2024-01-01T00:00:00Z'
                },
                {
                    id: 'ANN002',
                    title: 'Second Announcement',
                    message: 'Second message',
                    type: 'hours',
                    active: true,
                    expiresAt: null,
                    createdAt: '2024-01-02T00:00:00Z'
                }
            ]

            getActiveAnnouncements.mockResolvedValueOnce(testAnnouncements)

            await act(async () => {
                render(<AnnouncementBanner />)
            })

            await waitFor(() => {
                expect(screen.getByText('First Announcement')).toBeInTheDocument()
            })

            const banner = screen.getByText('First Announcement').closest('div').parentElement.parentElement

            // Simulate swipe right (touchStart at 100, touchEnd at 200)
            fireEvent.touchStart(banner, {
                targetTouches: [{ clientX: 100 }]
            })
            fireEvent.touchMove(banner, {
                targetTouches: [{ clientX: 200 }]
            })
            fireEvent.touchEnd(banner)

            await waitFor(() => {
                expect(screen.getByText('Second Announcement')).toBeInTheDocument()
            })
        })

        it('should not navigate on small swipe (less than minimum distance)', async () => {
            const testAnnouncements = [
                {
                    id: 'ANN001',
                    title: 'First Announcement',
                    message: 'First message',
                    type: 'general',
                    active: true,
                    expiresAt: null,
                    createdAt: '2024-01-01T00:00:00Z'
                },
                {
                    id: 'ANN002',
                    title: 'Second Announcement',
                    message: 'Second message',
                    type: 'hours',
                    active: true,
                    expiresAt: null,
                    createdAt: '2024-01-02T00:00:00Z'
                }
            ]

            getActiveAnnouncements.mockResolvedValueOnce(testAnnouncements)

            await act(async () => {
                render(<AnnouncementBanner />)
            })

            await waitFor(() => {
                expect(screen.getByText('First Announcement')).toBeInTheDocument()
            })

            const banner = screen.getByText('First Announcement').closest('div').parentElement.parentElement

            // Simulate small swipe (only 30 pixels - less than 50px minimum)
            fireEvent.touchStart(banner, {
                targetTouches: [{ clientX: 100 }]
            })
            fireEvent.touchMove(banner, {
                targetTouches: [{ clientX: 130 }]
            })
            fireEvent.touchEnd(banner)

            // Should still be on first announcement
            await waitFor(() => {
                expect(screen.getByText('First Announcement')).toBeInTheDocument()
            })
        })
    })

})
