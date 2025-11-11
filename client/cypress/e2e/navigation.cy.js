// client/cypress/e2e/navigation.cy.js - Navigation and routing tests

describe('Navigation and Routing', () => {
  beforeEach(() => {
    cy.request('POST', 'http://localhost:5000/api/test/reset-db');
  });

  it('should navigate between public pages', () => {
    // Visit home page
    cy.visit('/');
    cy.url().should('eq', 'http://localhost:3000/');

    // Navigate to about page
    cy.get('[data-cy="nav-about"]').click();
    cy.url().should('include', '/about');
    cy.get('[data-cy="about-page"]').should('be.visible');

    // Navigate back to home
    cy.get('[data-cy="nav-home"]').click();
    cy.url().should('eq', 'http://localhost:3000/');
  });

  it('should redirect unauthenticated users to login', () => {
    // Try to access protected route
    cy.visit('/dashboard');
    cy.url().should('include', '/login');

    cy.visit('/posts/create');
    cy.url().should('include', '/login');

    cy.visit('/profile');
    cy.url().should('include', '/login');
  });

  it('should allow authenticated users to access protected routes', () => {
    cy.login('test@example.com', 'password123');

    cy.visit('/dashboard');
    cy.url().should('include', '/dashboard');

    cy.visit('/posts/create');
    cy.url().should('include', '/posts/create');

    cy.visit('/profile');
    cy.url().should('include', '/profile');
  });

  it('should handle 404 errors gracefully', () => {
    cy.visit('/non-existent-page');
    cy.get('[data-cy="404-page"]').should('be.visible');
    cy.contains('Page not found').should('be.visible');
  });

  it('should preserve query parameters during navigation', () => {
    cy.visit('/posts?category=technology&page=2');

    // Navigate to another page and back
    cy.get('[data-cy="nav-home"]').click();
    cy.get('[data-cy="nav-posts"]').click();

    // Query parameters should be preserved
    cy.url().should('include', 'category=technology');
    cy.url().should('include', 'page=2');
  });

  it('should handle browser back/forward navigation', () => {
    cy.login('test@example.com', 'password123');

    cy.visit('/dashboard');
    cy.url().should('include', '/dashboard');

    cy.visit('/posts');
    cy.url().should('include', '/posts');

    cy.visit('/profile');
    cy.url().should('include', '/profile');

    // Go back
    cy.go('back');
    cy.url().should('include', '/posts');

    // Go back again
    cy.go('back');
    cy.url().should('include', '/dashboard');

    // Go forward
    cy.go('forward');
    cy.url().should('include', '/posts');
  });

  it('should handle direct URL access', () => {
    cy.login('test@example.com', 'password123');

    // Direct access to post detail
    cy.visit('/posts/123');
    cy.url().should('include', '/posts/123');

    // Direct access to edit page
    cy.visit('/posts/123/edit');
    cy.url().should('include', '/posts/123/edit');
  });

  it('should redirect after successful actions', () => {
    cy.login('test@example.com', 'password123');

    // Create a post and check redirect
    cy.visit('/posts/create');
    cy.get('[data-cy="post-title-input"]').type('Redirect Test');
    cy.get('[data-cy="post-content-input"]').type('Testing redirect after creation');
    cy.get('[data-cy="submit-post-button"]').click();

    // Should redirect to posts list or post detail
    cy.url().should('not.include', '/posts/create');
  });
});