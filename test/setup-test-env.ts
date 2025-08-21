// Test environment setup for Vite + React app
// This file sets up the testing environment for Vitest

import { beforeAll, afterEach, afterAll } from 'vitest'
import { cleanup } from '@testing-library/react'

// Clean up after each test
afterEach(() => {
    cleanup()
})

// Global test setup
beforeAll(() => {
    // Set up any global test configuration here
})

// Global test teardown
afterAll(() => {
    // Clean up any global test resources here
})
