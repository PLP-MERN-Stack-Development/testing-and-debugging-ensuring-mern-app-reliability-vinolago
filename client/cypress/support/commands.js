// client/cypress/support/commands.js - Custom Cypress commands

// Custom command to login
Cypress.Commands.add('login', (email, password) => {
  cy.session([email, password], () => {
    cy.visit('/login');
    cy.get('[data-cy="email-input"]').type(email);
    cy.get('[data-cy="password-input"]').type(password);
    cy.get('[data-cy="login-button"]').click();
    cy.url().should('not.include', '/login');
  });
});

// Custom command to register
Cypress.Commands.add('register', (username, email, password) => {
  cy.visit('/register');
  cy.get('[data-cy="username-input"]').type(username);
  cy.get('[data-cy="email-input"]').type(email);
  cy.get('[data-cy="password-input"]').type(password);
  cy.get('[data-cy="register-button"]').click();
  cy.url().should('not.include', '/register');
});

// Custom command to create a post
Cypress.Commands.add('createPost', (title, content) => {
  cy.get('[data-cy="create-post-button"]').click();
  cy.get('[data-cy="post-title-input"]').type(title);
  cy.get('[data-cy="post-content-input"]').type(content);
  cy.get('[data-cy="submit-post-button"]').click();
  cy.contains(title).should('be.visible');
});

// Custom command to logout
Cypress.Commands.add('logout', () => {
  cy.get('[data-cy="logout-button"]').click();
  cy.url().should('include', '/login');
});

// Custom command to wait for API calls
Cypress.Commands.add('waitForAPI', (method, url) => {
  cy.intercept(method, url).as('apiCall');
  cy.wait('@apiCall');
});

// Custom command to check for error messages
Cypress.Commands.add('shouldShowError', (message) => {
  cy.get('[data-cy="error-message"]').should('contain', message);
});

// Custom command to check for success messages
Cypress.Commands.add('shouldShowSuccess', (message) => {
  cy.get('[data-cy="success-message"]').should('contain', message);
});