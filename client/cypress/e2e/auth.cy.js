// client/cypress/e2e/auth.cy.js - Authentication E2E tests

describe('Authentication Flow', () => {
  beforeEach(() => {
    // Reset database before each test
    cy.request('POST', 'http://localhost:5000/api/test/reset-db');
  });

  it('should allow user registration and login', () => {
    // Visit registration page
    cy.visit('/register');

    // Fill registration form
    cy.get('[data-cy="username-input"]').type('testuser');
    cy.get('[data-cy="email-input"]').type('test@example.com');
    cy.get('[data-cy="password-input"]').type('password123');
    cy.get('[data-cy="register-button"]').click();

    // Should redirect to login or dashboard
    cy.url().should('not.include', '/register');

    // Login with the registered user
    cy.visit('/login');
    cy.get('[data-cy="email-input"]').type('test@example.com');
    cy.get('[data-cy="password-input"]').type('password123');
    cy.get('[data-cy="login-button"]').click();

    // Should be logged in
    cy.url().should('not.include', '/login');
    cy.get('[data-cy="user-menu"]').should('contain', 'testuser');
  });

  it('should show error for invalid login credentials', () => {
    cy.visit('/login');

    cy.get('[data-cy="email-input"]').type('wrong@example.com');
    cy.get('[data-cy="password-input"]').type('wrongpassword');
    cy.get('[data-cy="login-button"]').click();

    cy.shouldShowError('Invalid credentials');
    cy.url().should('include', '/login');
  });

  it('should prevent access to protected routes when not logged in', () => {
    cy.visit('/dashboard');
    cy.url().should('include', '/login');

    cy.visit('/posts/create');
    cy.url().should('include', '/login');
  });

  it('should allow logout', () => {
    // Login first
    cy.login('test@example.com', 'password123');

    // Logout
    cy.get('[data-cy="logout-button"]').click();

    // Should redirect to login
    cy.url().should('include', '/login');
    cy.get('[data-cy="user-menu"]').should('not.exist');
  });

  it('should persist login session across page refreshes', () => {
    cy.login('test@example.com', 'password123');

    cy.reload();

    // Should still be logged in
    cy.get('[data-cy="user-menu"]').should('contain', 'testuser');
  });
});