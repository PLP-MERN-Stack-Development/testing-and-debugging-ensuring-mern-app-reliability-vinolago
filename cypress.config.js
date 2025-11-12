// cypress.config.js - Cypress configuration

const { defineConfig } = require('cypress');

module.exports = defineConfig({
  e2e: {
    baseUrl: 'http://localhost:3000', // React app URL
    specPattern: 'client/cypress/e2e/**/*.cy.{js,jsx,ts,tsx}',
    supportFile: 'client/cypress/support/e2e.js',
    viewportWidth: 1280,
    viewportHeight: 720,
    video: false,
    screenshotOnRunFailure: true,
    defaultCommandTimeout: 10000,
    requestTimeout: 15000,
    responseTimeout: 15000,
    setupNodeEvents(on, config) {
      // implement node event listeners here
      on('task', {
        log(message) {
          console.log(message);
          return null;
        },
      });
    },
  },
  component: {
    specPattern: 'client/cypress/component/**/*.cy.{js,jsx,ts,tsx}',
    supportFile: 'client/cypress/support/component.js',
    devServer: {
      framework: 'create-react-app',
      bundler: 'webpack',
    },
  },
});