// client/cypress/support/component.js - Component testing support

import { mount } from 'cypress/react18';

// Add mount command
Cypress.Commands.add('mount', mount);