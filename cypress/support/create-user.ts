// Cypress support file for creating test users
// This file provides utilities for user management in tests

export function createTestUser(email: string, password: string) {
  // Implementation for creating test users
  // This would typically interact with your test database or auth service
  cy.log(`Creating test user: ${email}`)

  // Add your user creation logic here
  // For example, if using Supabase:
  // cy.request('POST', '/api/test/create-user', { email, password })
}

export function cleanupTestUser(email: string) {
  // Implementation for cleaning up test users
  cy.log(`Cleaning up test user: ${email}`)

  // Add your user cleanup logic here
  // For example, if using Supabase:
  // cy.request('DELETE', '/api/test/cleanup-user', { email })
}
