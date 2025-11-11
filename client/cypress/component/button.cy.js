// client/cypress/component/button.cy.js - Visual regression tests for Button component

import { mount } from 'cypress/react18';
import Button from '../../src/components/Button';

describe('Button Component Visual Regression', () => {
  it('should match default button snapshot', () => {
    mount(<Button>Default Button</Button>);

    // Take snapshot for visual regression
    cy.matchImageSnapshot('button-default');
  });

  it('should match primary variant snapshot', () => {
    mount(<Button variant="primary">Primary Button</Button>);

    cy.matchImageSnapshot('button-primary');
  });

  it('should match secondary variant snapshot', () => {
    mount(<Button variant="secondary">Secondary Button</Button>);

    cy.matchImageSnapshot('button-secondary');
  });

  it('should match danger variant snapshot', () => {
    mount(<Button variant="danger">Danger Button</Button>);

    cy.matchImageSnapshot('button-danger');
  });

  it('should match small size snapshot', () => {
    mount(<Button size="sm">Small Button</Button>);

    cy.matchImageSnapshot('button-small');
  });

  it('should match medium size snapshot', () => {
    mount(<Button size="md">Medium Button</Button>);

    cy.matchImageSnapshot('button-medium');
  });

  it('should match large size snapshot', () => {
    mount(<Button size="lg">Large Button</Button>);

    cy.matchImageSnapshot('button-large');
  });

  it('should match disabled state snapshot', () => {
    mount(<Button disabled>Disabled Button</Button>);

    cy.matchImageSnapshot('button-disabled');
  });

  it('should match loading state snapshot', () => {
    mount(<Button>Loading...</Button>);

    cy.matchImageSnapshot('button-loading');
  });

  it('should match button with custom class snapshot', () => {
    mount(<Button className="custom-class">Custom Button</Button>);

    cy.matchImageSnapshot('button-custom-class');
  });

  it('should match button with icon snapshot', () => {
    mount(
      <Button>
        <span>📧</span> Button with Icon
      </Button>
    );

    cy.matchImageSnapshot('button-with-icon');
  });
});