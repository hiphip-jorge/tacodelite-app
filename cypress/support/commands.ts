// ***********************************************
// This example commands.ts shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************

// -- This is a parent command --
// Cypress.Commands.add('login', (email, password) => { ... })
//
//
// -- This is a child command --
// Cypress.Commands.add('drag', { prevSubject: 'element'}, (subject, options) => { ... })
//
//
// -- This is a dual command --
// Cypress.Commands.add('dismiss', { prevSubject: 'optional'}, (subject, options) => { ... })
//
//
// -- This will overwrite an existing command --
// Cypress.Commands.overwrite('visit', (originalFn, url, options) => { ... })
//
// declare global {
//   namespace Cypress {
//     interface Chainable {
//       login(email: string, password: string): Chainable<void>
//       drag(subject: string, options?: Partial<TypeOptions>): Chainable<Element>
//       dismiss(subject: string, options?: Partial<TypeOptions>): Chainable<Element>
//       visit(originalFn: CommandOriginalFn, url: string, options: Partial<VisitOptions>): Chainable<Element>
//     }
//   }
// }

// Custom commands for Taco Delite App

Cypress.Commands.add('login', (email: string, password: string) => {
  // Implementation for user login
  // This would typically interact with your auth service
  cy.log(`Logging in user: ${email}`)

  // Add your login logic here
  // For example, if using Supabase:
  // cy.visit('/login')
  // cy.get('[data-testid="email-input"]').type(email)
  // cy.get('[data-testid="password-input"]').type(password)
  // cy.get('[data-testid="login-button"]').click()
})

Cypress.Commands.add('logout', () => {
  // Implementation for user logout
  cy.log('Logging out user')

  // Add your logout logic here
  // For example:
  // cy.get('[data-testid="logout-button"]').click()
  // cy.clearLocalStorage()
  // cy.clearCookies()
})

Cypress.Commands.add('clearAuth', () => {
  // Clear all authentication data
  cy.clearLocalStorage()
  cy.clearCookies()
  cy.log('Authentication data cleared')
})
