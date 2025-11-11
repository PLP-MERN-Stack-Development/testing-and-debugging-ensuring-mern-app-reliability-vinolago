// client/cypress/e2e/error-handling.cy.js - Error handling and edge cases tests

describe('Error Handling and Edge Cases', () => {
  beforeEach(() => {
    cy.request('POST', 'http://localhost:5000/api/test/reset-db');
  });

  it('should handle network errors gracefully', () => {
    // Simulate network failure
    cy.intercept('POST', '**/api/auth/login', { forceNetworkError: true }).as('loginRequest');

    cy.visit('/login');
    cy.get('[data-cy="email-input"]').type('test@example.com');
    cy.get('[data-cy="password-input"]').type('password123');
    cy.get('[data-cy="login-button"]').click();

    cy.wait('@loginRequest');
    cy.shouldShowError('Network error. Please try again.');
  });

  it('should handle server errors', () => {
    cy.intercept('POST', '**/api/auth/login', { statusCode: 500 }).as('serverError');

    cy.visit('/login');
    cy.get('[data-cy="email-input"]').type('test@example.com');
    cy.get('[data-cy="password-input"]').type('password123');
    cy.get('[data-cy="login-button"]').click();

    cy.wait('@serverError');
    cy.shouldShowError('Server error. Please try again later.');
  });

  it('should handle validation errors from server', () => {
    cy.intercept('POST', '**/api/posts', {
      statusCode: 400,
      body: { errors: ['Title is required', 'Content must be at least 10 characters'] }
    }).as('validationError');

    cy.login('test@example.com', 'password123');
    cy.visit('/posts/create');

    cy.get('[data-cy="post-title-input"]').type('Test');
    cy.get('[data-cy="post-content-input"]').type('Short');
    cy.get('[data-cy="submit-post-button"]').click();

    cy.wait('@validationError');
    cy.shouldShowError('Title is required');
    cy.shouldShowError('Content must be at least 10 characters');
  });

  it('should handle unauthorized access attempts', () => {
    cy.intercept('POST', '**/api/posts', { statusCode: 401 }).as('unauthorized');

    cy.login('test@example.com', 'password123');
    cy.visit('/posts/create');

    cy.get('[data-cy="post-title-input"]').type('Unauthorized Post');
    cy.get('[data-cy="post-content-input"]').type('This should fail');
    cy.get('[data-cy="submit-post-button"]').click();

    cy.wait('@unauthorized');
    cy.shouldShowError('Session expired. Please login again.');
    cy.url().should('include', '/login');
  });

  it('should handle rate limiting', () => {
    // Simulate rate limiting
    cy.intercept('POST', '**/api/posts', { statusCode: 429 }).as('rateLimited');

    cy.login('test@example.com', 'password123');
    cy.visit('/posts/create');

    // Try to create multiple posts quickly
    for (let i = 0; i < 5; i++) {
      cy.get('[data-cy="post-title-input"]').type(`Post ${i}`);
      cy.get('[data-cy="post-content-input"]').type(`Content ${i}`);
      cy.get('[data-cy="submit-post-button"]').click();
    }

    cy.shouldShowError('Too many requests. Please wait and try again.');
  });

  it('should handle malformed data gracefully', () => {
    cy.login('test@example.com', 'password123');
    cy.visit('/posts/create');

    // Try to submit with invalid data
    cy.get('[data-cy="post-title-input"]').type('   '); // Only spaces
    cy.get('[data-cy="post-content-input"]').type('Valid content');
    cy.get('[data-cy="submit-post-button"]').click();

    cy.shouldShowError('Title cannot be empty');
  });

  it('should handle concurrent requests properly', () => {
    cy.login('test@example.com', 'password123');

    // Create multiple posts simultaneously
    cy.visit('/posts/create');

    // Open multiple tabs/windows (simulated)
    const posts = [
      { title: 'Post 1', content: 'Content 1' },
      { title: 'Post 2', content: 'Content 2' },
      { title: 'Post 3', content: 'Content 3' },
    ];

    posts.forEach((post, index) => {
      if (index > 0) {
        cy.visit('/posts/create');
      }

      cy.get('[data-cy="post-title-input"]').type(post.title);
      cy.get('[data-cy="post-content-input"]').type(post.content);
      cy.get('[data-cy="submit-post-button"]').click();
    });

    // All posts should be created successfully
    cy.visit('/posts');
    posts.forEach(post => {
      cy.contains(post.title).should('be.visible');
    });
  });

  it('should handle browser refresh during form submission', () => {
    cy.login('test@example.com', 'password123');
    cy.visit('/posts/create');

    cy.get('[data-cy="post-title-input"]').type('Refresh Test');
    cy.get('[data-cy="post-content-input"]').type('Testing refresh during submission');

    // Simulate slow network
    cy.intercept('POST', '**/api/posts', (req) => {
      req.reply((res) => {
        // Delay response
        setTimeout(() => {
          res.send({ _id: '123', title: 'Refresh Test', content: 'Testing refresh during submission' });
        }, 2000);
      });
    }).as('slowPost');

    cy.get('[data-cy="submit-post-button"]').click();

    // Refresh page while request is pending
    cy.reload();

    // Should not show duplicate posts or errors
    cy.visit('/posts');
    cy.contains('Refresh Test').should('have.length', 1);
  });

  it('should handle offline scenarios', () => {
    cy.login('test@example.com', 'password123');
    cy.visit('/posts/create');

    // Go offline
    cy.window().then((win) => {
      cy.stub(win.navigator, 'onLine').get(() => false);
      win.dispatchEvent(new Event('offline'));
    });

    cy.get('[data-cy="post-title-input"]').type('Offline Post');
    cy.get('[data-cy="post-content-input"]').type('This should be saved offline');
    cy.get('[data-cy="submit-post-button"]').click();

    cy.shouldShowError('You are currently offline. Please check your connection.');

    // Come back online
    cy.window().then((win) => {
      cy.stub(win.navigator, 'onLine').get(() => true);
      win.dispatchEvent(new Event('online'));
    });

    // Should be able to submit now
    cy.get('[data-cy="submit-post-button"]').click();
    cy.url().should('not.include', '/posts/create');
  });
});