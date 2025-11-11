// client/cypress/support/component.js - Component testing support

import { mount } from 'cypress/react18';
import '@testing-library/cypress/add-commands';

// Add visual regression command
Cypress.Commands.add('matchImageSnapshot', (name, options = {}) => {
  cy.get('body').matchImageSnapshot(name, {
    capture: 'viewport',
    ...options,
  });
});

// Add mount command
Cypress.Commands.add('mount', mount);