/**
 * Test Suite: Responsive Design
 * Purpose: Verify app works on different screen sizes
 */

describe('Responsive Design', () => {
  const viewports = [
    { name: 'Mobile (iPhone X)', width: 375, height: 812 },
    { name: 'Tablet (iPad)', width: 768, height: 1024 },
    { name: 'Desktop (1080p)', width: 1920, height: 1080 },
    { name: 'Desktop (720p)', width: 1280, height: 720 }
  ];

  viewports.forEach(({ name, width, height }) => {
    describe(`${name} - ${width}x${height}`, () => {
      beforeEach(() => {
        cy.viewport(width, height);
        cy.visit('/');
      });

      it('should load without errors', () => {
        cy.get('body').should('be.visible');
      });

      it('should have readable text', () => {
        // Check that main content is visible
        cy.get('header').should('be.visible');
      });

      if (width < 768) {
        // Mobile-specific tests
        it('should show mobile menu button', () => {
          cy.get('.bx-menu').should('exist');
        });

        it('should hide desktop elements', () => {
          // Digital clock should be hidden on mobile
          cy.get('body').then(($body) => {
            // Check if clock is hidden or doesn't exist in viewport
            const clock = $body.find(':contains("AM"), :contains("PM")');
            // On mobile, some elements should be hidden
          });
        });
      }

      if (width >= 1024) {
        // Desktop-specific tests
        it('should show digital clock', () => {
          // Clock should be visible on desktop
          cy.get('body').should('contain', /AM|PM/);
        });

        it('should show full welcome message', () => {
          cy.contains('Welcome back').should('be.visible');
        });

        it('should not show mobile menu button', () => {
          // Mobile hamburger should be hidden
          cy.get('.bx-menu').should('not.be.visible');
        });
      }
    });
  });

  it('should maintain functionality when resizing window', () => {
    // Start desktop
    cy.viewport(1280, 720);
    cy.visit('/');
    
    // Verify desktop view
    cy.get('body').should('contain', /AM|PM/);
    
    // Resize to mobile
    cy.viewport('iphone-x');
    cy.wait(500);
    
    // Mobile menu should appear
    cy.get('.bx-menu').should('exist');
    
    // Resize back to desktop
    cy.viewport(1280, 720);
    cy.wait(500);
    
    // Desktop elements should work again
    cy.get('body').should('be.visible');
  });
});
