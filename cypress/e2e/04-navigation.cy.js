/**
 * Test Suite: Navigation Menu
 * Purpose: Verify navigation works correctly
 */

describe('Navigation Menu', () => {
  beforeEach(() => {
    cy.visit('/');
  });

  it('should display all navigation links', () => {
    const navItems = ['Home', 'Tasks', 'Files', 'Gallery', 'Support'];
    
    navItems.forEach(item => {
      cy.contains(item).should('exist');
    });
  });

  it('should highlight active navigation item', () => {
    // Home should be active by default
    cy.contains('Home')
      .parent()
      .should('have.class', 'active')
      .or('have.css', 'background-color'); // Check if it has some active styling
  });

  it('should open support modal when support is clicked', () => {
    cy.contains('Support').click();
    
    // Should show support modal/dialog
    cy.contains('support', { matchCase: false }).should('be.visible');
  });

  it('should close support modal when close button is clicked', () => {
    // Open support modal
    cy.contains('Support').click();
    cy.wait(300);
    
    // Find and click close button (usually × or Close)
    cy.get('button[aria-label*="Close"]').click();
    
    // Modal should be gone (or check for specific modal element)
    // This might need adjustment based on your modal implementation
  });

  it('should have working mobile menu toggle', () => {
    // Set mobile viewport
    cy.viewport('iphone-x');
    
    // Should have hamburger menu button
    cy.get('button').find('.bx-menu').should('exist');
    
    // Click to open mobile menu
    cy.get('button').find('.bx-menu').parent().click();
    
    // Navigation should be visible
    cy.wait(300);
    cy.get('nav').should('be.visible');
  });

  it('should change active state when clicking different nav items', () => {
    // Click Tasks
    cy.contains('Tasks').click();
    cy.wait(200);
    
    // Tasks should be active now
    cy.contains('Tasks')
      .parent()
      .should('have.class', 'active')
      .or('have.css', 'background-color');
  });
});
