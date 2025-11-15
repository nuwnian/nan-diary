/**
 * Test Suite: Theme Toggle
 * Purpose: Verify dark/light mode switching works
 */

describe('Theme Toggle Functionality', () => {
  beforeEach(() => {
    cy.visit('/');
  });

  it('should toggle between light and dark theme', () => {
    // Find the theme toggle button (adjust selector based on your actual implementation)
    // Usually has moon/sun icon or says "theme"
    
    // Get initial theme state
    cy.get('html').then(($html) => {
      const initialClass = $html.attr('class') || '';
      
      // Click theme toggle
      cy.get('button').contains(/theme/i).click();
      
      // Wait a bit for transition
      cy.wait(300);
      
      // Check if theme changed
      cy.get('html').should(($newHtml) => {
        const newClass = $newHtml.attr('class') || '';
        expect(newClass).to.not.equal(initialClass);
      });
    });
  });

  it('should persist theme preference after page reload', () => {
    // Set to dark mode
    cy.get('html').then(($html) => {
      if (!$html.hasClass('dark')) {
        cy.get('button').contains(/theme/i).click();
        cy.wait(300);
      }
    });

    // Verify dark mode is active
    cy.get('html').should('have.class', 'dark');

    // Reload page
    cy.reload();

    // Theme should still be dark
    cy.get('html').should('have.class', 'dark');
  });

  it('should change background color when theme changes', () => {
    // Get initial background color
    cy.get('body').then(($body) => {
      const lightBg = $body.css('background-color');
      
      // Toggle theme
      cy.get('button').contains(/theme/i).click();
      cy.wait(300);
      
      // Background should be different
      cy.get('body').should(($newBody) => {
        const darkBg = $newBody.css('background-color');
        expect(darkBg).to.not.equal(lightBg);
      });
    });
  });
});
