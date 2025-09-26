import '@testing-library/jest-dom'

// Mock localStorage with actual storage
const localStorageMock = {
    store: {},
    getItem: vi.fn((key) => localStorageMock.store[key] || null),
    setItem: vi.fn((key, value) => {
        localStorageMock.store[key] = value
    }),
    removeItem: vi.fn((key) => {
        delete localStorageMock.store[key]
    }),
    clear: vi.fn(() => {
        localStorageMock.store = {}
    }),
}
global.localStorage = localStorageMock

// Mock fetch
global.fetch = vi.fn()

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: vi.fn().mockImplementation(query => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: vi.fn(), // deprecated
        removeListener: vi.fn(), // deprecated
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
    })),
})

// Mock IntersectionObserver
global.IntersectionObserver = vi.fn().mockImplementation(() => ({
    observe: vi.fn(),
    unobserve: vi.fn(),
    disconnect: vi.fn(),
}))

// Mock environment variables for testing
Object.defineProperty(global, 'import', {
    value: {
        meta: {
            env: {
                VITE_USE_MOCK: 'false',
                VITE_API_URL: 'https://test-api.com'
            }
        }
    },
    writable: true
})
