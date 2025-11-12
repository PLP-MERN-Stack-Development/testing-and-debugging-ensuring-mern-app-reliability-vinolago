// client/cypress/component/button.cy.js - Visual regression tests for Button component

import Button from '../../src/components/Button';

describe('Button Component Tests', () => {
  it('should render with default props', () => {
    cy.mount(<Button>Default Button</Button>);
    cy.get('button').should('contain', 'Default Button');
    cy.get('button').should('have.class', 'btn');
    cy.get('button').should('have.class', 'btn-primary');
  });

  it('should render with different variants', () => {
    cy.mount(<Button variant="secondary">Secondary Button</Button>);
    cy.get('button').should('have.class', 'btn-secondary');
  });

  it('should render with different sizes', () => {
    cy.mount(<Button size="lg">Large Button</Button>);
    cy.get('button').should('have.class', 'btn-lg');
  });

  it('should be disabled when disabled prop is true', () => {
    cy.mount(<Button disabled>Disabled Button</Button>);
    cy.get('button').should('be.disabled');
    cy.get('button').should('have.class', 'btn-disabled');
  });

  it('should call onClick when clicked', () => {
    const onClickSpy = cy.spy().as('onClickSpy');
    cy.mount(<Button onClick={onClickSpy}>Clickable Button</Button>);

    cy.get('button').click();
    cy.get('@onClickSpy').should('have.been.calledOnce');
  });

  it('should not call onClick when disabled', () => {
    const onClickSpy = cy.spy().as('onClickSpy');
    cy.mount(<Button onClick={onClickSpy} disabled>Disabled Button</Button>);

    cy.get('button').click();
    cy.get('@onClickSpy').should('not.have.been.called');
  });
});