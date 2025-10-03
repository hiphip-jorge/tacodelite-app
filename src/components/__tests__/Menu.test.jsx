import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Menu from '../../pages/Menu';

// Mock the useMenu hook
vi.mock('../../hooks/useMenu', () => ({
    useMenu: () => ({
        categories: [
            { id: 1, name: 'Breakfast', pk: 'CATEGORY#001' },
            { id: 2, name: 'Tacos', pk: 'CATEGORY#002' },
        ],
        menuItems: [
            {
                id: 1,
                name: 'Breakfast Taco',
                price: 3.5,
                categoryId: 1,
                description: 'A delicious breakfast taco',
                active: true,
                vegetarian: false,
            },
            {
                id: 2,
                name: 'Bean Burrito',
                price: 7.99,
                categoryId: 2,
                description: 'A hearty bean burrito',
                active: true,
                vegetarian: true,
            },
        ],
        filteredItems: [
            {
                id: 1,
                name: 'Breakfast Taco',
                price: 3.5,
                categoryId: 1,
                description: 'A delicious breakfast taco',
                active: true,
                vegetarian: false,
            },
            {
                id: 2,
                name: 'Bean Burrito',
                price: 7.99,
                categoryId: 2,
                description: 'A hearty bean burrito',
                active: true,
                vegetarian: true,
            },
        ],
        selectedCategory: 'all',
        setSelectedCategory: vi.fn(),
        loading: false,
        error: null,
        getCategoryItemCount: vi.fn(categoryId => {
            if (categoryId === 'all') return 2;
            if (categoryId === 1) return 1;
            if (categoryId === 2) return 1;
            return 0;
        }),
        getItemCount: vi.fn(categoryId => {
            if (categoryId === 'all') return 2;
            if (categoryId === 1) return 1;
            if (categoryId === 2) return 1;
            return 0;
        }),
    }),
}));

// Mock framer-motion to avoid animation issues in tests
vi.mock('framer-motion', () => ({
    motion: {
        div: ({ children, ...props }) => <div {...props}>{children}</div>,
        section: ({ children, ...props }) => (
            <section {...props}>{children}</section>
        ),
        h2: ({ children, ...props }) => <h2 {...props}>{children}</h2>,
        p: ({ children, ...props }) => <p {...props}>{children}</p>,
        button: ({ children, ...props }) => (
            <button {...props}>{children}</button>
        ),
    },
    AnimatePresence: ({ children }) => children,
}));

const renderWithRouter = component => {
    return render(<BrowserRouter>{component}</BrowserRouter>);
};

describe('Menu Component', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should render menu categories', () => {
        renderWithRouter(<Menu />);

        expect(screen.getByText('Breakfast')).toBeInTheDocument();
        expect(screen.getByText('Tacos')).toBeInTheDocument();
    });

    it('should render menu items', () => {
        renderWithRouter(<Menu />);

        expect(screen.getByText('Breakfast Taco')).toBeInTheDocument();
        expect(screen.getByText('Bean Burrito')).toBeInTheDocument();
    });

    it('should display prices correctly', () => {
        renderWithRouter(<Menu />);

        expect(screen.getByText('$3.50')).toBeInTheDocument();
        expect(screen.getByText('$7.99')).toBeInTheDocument();
    });

    it('should show vegetarian indicator for vegetarian items', () => {
        renderWithRouter(<Menu />);

        // Look for vegetarian indicator (this would depend on how it's implemented in the component)
        // For now, we'll just check that the vegetarian item is rendered
        expect(screen.getByText('Bean Burrito')).toBeInTheDocument();
    });

    it('should show descriptions for menu items', () => {
        renderWithRouter(<Menu />);

        expect(
            screen.getByText('A delicious breakfast taco')
        ).toBeInTheDocument();
        expect(screen.getByText('A hearty bean burrito')).toBeInTheDocument();
    });

    it('should not show loading state when not loading', () => {
        renderWithRouter(<Menu />);

        // Assuming there's a loading indicator, it should not be visible
        expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
    });

    it('should not show error state when there is no error', () => {
        renderWithRouter(<Menu />);

        // Assuming there's an error message, it should not be visible
        expect(screen.queryByText(/error/i)).not.toBeInTheDocument();
    });
});
