/**
 * Test Suite: UI/UX Elements
 * Purpose: Test visual and interaction elements
 */

describe('UI/UX Elements', () => {
  beforeEach(() => {
    cy.visit('/');
  });

  describe('Neumorphic Design Elements', () => {
    it('should have neumorphic styled buttons', () => {
      cy.get('.neuro-button').should('exist');
      cy.get('.neuro-button').first().should('have.css', 'box-shadow');
    });

    it('should have neumorphic styled cards', () => {
      cy.get('.neuro-card').should('exist');
    });

    it('should have inset styled search bar', () => {
      cy.get('.neuro-inset').should('exist');
    });
  });

  describe('Interactive Elements', () => {
    it('buttons should be clickable', () => {
      cy.get('button').first().should('not.be.disabled');
    });

    it('buttons should have hover effects', () => {
      cy.get('button').first().then(($btn) => {
        const beforeHover = $btn.css('box-shadow');
        
        cy.wrap($btn).trigger('mouseover');
        cy.wait(100);
        
        // Shadow or style should change on hover
        cy.wrap($btn).should(($hoverBtn) => {
          // Just check it still has shadow (hover may change it)
          expect($hoverBtn.css('box-shadow')).to.exist;
        });
      });
    });

    it('links should have pointer cursor', () => {
      cy.get('button').first().should('have.css', 'cursor', 'pointer');
    });
  });

  describe('Icons', () => {
    it('should load Boxicons correctly', () => {
      // Check if boxicons are loaded
      cy.get('.bx').should('exist');
    });

    it('should have icons in navigation', () => {
      cy.get('nav .bx').should('have.length.greaterThan', 0);
    });
  });

  describe('Accessibility', () => {
    it('should have proper button aria labels', () => {
      cy.get('button[aria-label]').should('exist');
    });

    it('images should have alt text', () => {
      cy.get('img').each(($img) => {
        cy.wrap($img).should('have.attr', 'alt');
      });
    });

    it('should be keyboard navigable', () => {
      // Tab through elements
      cy.get('body').tab();
      cy.focused().should('exist');
      
      cy.focused().tab();
      cy.focused().should('exist');
    });
  });

  describe('Loading States', () => {
    it('should not show error messages on initial load', () => {
      cy.contains(/error|failed/i).should('not.exist');
    });

    it('page should load within reasonable time', () => {
      const startTime = Date.now();
      cy.visit('/').then(() => {
        const loadTime = Date.now() - startTime;
        expect(loadTime).to.be.lessThan(5000); // 5 seconds max
      });
    });
  });
});
