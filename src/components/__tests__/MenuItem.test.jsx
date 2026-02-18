import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import MenuItem from '../MenuItem';

// Mock framer-motion to avoid animation issues in tests
vi.mock('framer-motion', () => ({
    motion: {
        div: ({ children, ...props }) => <div {...props}>{children}</div>,
        img: props => <img {...props} />,
        span: ({ children, ...props }) => <span {...props}>{children}</span>,
        button: ({ children, ...props }) => (
            <button {...props}>{children}</button>
        ),
        p: ({ children, ...props }) => <p {...props}>{children}</p>,
        h3: ({ children, ...props }) => <h3 {...props}>{children}</h3>,
    },
}));

describe('MenuItem Component', () => {
    const mockMenuItem = {
        id: 1,
        name: 'Test Taco',
        price: 4.99,
        description: 'A delicious test taco',
        vegetarian: false,
        active: true,
        categoryId: 1,
    };

    it('should render menu item correctly with valid data', () => {
        render(<MenuItem item={mockMenuItem} index={0} />);

        expect(screen.getByText('Test Taco')).toBeInTheDocument();
        expect(screen.getByText('$4.99')).toBeInTheDocument();
        expect(screen.getByText('A delicious test taco.')).toBeInTheDocument();
    });

    it('should handle undefined name gracefully', () => {
        const itemWithUndefinedName = { ...mockMenuItem, name: undefined };
        render(<MenuItem item={itemWithUndefinedName} index={0} />);

        // Should not throw error and should render empty or fallback content
        expect(screen.getByText('$4.99')).toBeInTheDocument();
    });

    it('should handle null name gracefully', () => {
        const itemWithNullName = { ...mockMenuItem, name: null };
        render(<MenuItem item={itemWithNullName} index={0} />);

        // Should not throw error and should render empty or fallback content
        expect(screen.getByText('$4.99')).toBeInTheDocument();
    });

    it('should handle empty string name', () => {
        const itemWithEmptyName = { ...mockMenuItem, name: '' };
        render(<MenuItem item={itemWithEmptyName} index={0} />);

        // Should not throw error and should render empty content
        expect(screen.getByText('$4.99')).toBeInTheDocument();
    });

    it('should handle undefined price gracefully', () => {
        const itemWithUNDefinedPrice = { ...mockMenuItem, price: undefined };
        render(<MenuItem item={itemWithUNDefinedPrice} index={0} />);

        // Should fallback to $0.00
        expect(screen.getByText('$0.00')).toBeInTheDocument();
    });

    it('should handle null price gracefully', () => {
        const itemWithNullPrice = { ...mockMenuItem, price: null };
        render(<MenuItem item={itemWithNullPrice} index={0} />);

        // Should fallback to $0.00
        expect(screen.getByText('$0.00')).toBeInTheDocument();
    });

    it('should handle NaN price gracefully', () => {
        const itemWithNaNPrice = { ...mockMenuItem, price: NaN };
        render(<MenuItem item={itemWithNaNPrice} index={0} />);

        // Should fallback to $0.00
        expect(screen.getByText('$0.00')).toBeInTheDocument();
    });

    it('should handle string price correctly', () => {
        const itemWithStringPrice = { ...mockMenuItem, price: '6.50' };
        render(<MenuItem item={itemWithStringPrice} index={0} />);

        // Should parse string price correctly
        expect(screen.getByText('$6.50')).toBeInTheDocument();
    });

    it('should format name with proper capitalization', () => {
        const itemWithLowercaseName = {
            ...mockMenuItem,
            name: 'chicken burrito',
        };
        render(<MenuItem item={itemWithLowercaseName} index={0} />);

        expect(screen.getByText('Chicken Burrito')).toBeInTheDocument();
    });

    it('should handle multi-word names correctly', () => {
        const itemWithComplexName = {
            ...mockMenuItem,
            name: 'supreme beef and bean burrito',
        };
        render(<MenuItem item={itemWithComplexName} index={0} />);

        expect(
            screen.getByText('Supreme Beef And Bean Burrito')
        ).toBeInTheDocument();
    });

    it('should handle vegetarian items', () => {
        const vegetarianItem = { ...mockMenuItem, vegetarian: true };
        render(<MenuItem item={vegetarianItem} index={0} />);

        expect(screen.getByText('Test Taco')).toBeInTheDocument();
    });

    it('should handle items without description', () => {
        const itemWithoutDescription = {
            ...mockMenuItem,
            description: undefined,
        };
        render(<MenuItem item={itemWithoutDescription} index={0} />);

        expect(screen.getByText('Test Taco')).toBeInTheDocument();
        expect(screen.getByText('$4.99')).toBeInTheDocument();
    });

    it('should handle completely empty item object', () => {
        const emptyItem = {};
        render(<MenuItem item={emptyItem} index={0} />);

        // Should not throw error and should render fallback values
        expect(screen.getByText('$0.00')).toBeInTheDocument();
    });

    it('should handle missing item prop', () => {
        render(<MenuItem index={0} />);

        // Should not throw error and should render fallback values
        expect(screen.getByText('$0.00')).toBeInTheDocument();
    });
});
