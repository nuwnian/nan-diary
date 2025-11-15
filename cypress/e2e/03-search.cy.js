/**
 * Test Suite: Search Functionality
 * Purpose: Verify search bar works correctly
 */

describe('Search Functionality', () => {
  beforeEach(() => {
    cy.visit('/');
  });

  it('should allow typing in the search box', () => {
    cy.get('input[placeholder*="Search"]')
      .type('test note')
      .should('have.value', 'test note');
  });

  it('should clear search input when cleared', () => {
    cy.get('input[placeholder*="Search"]')
      .type('test note')
      .clear()
      .should('have.value', '');
  });

  it('search input should be focused when clicked', () => {
    cy.get('input[placeholder*="Search"]')
      .click()
      .should('have.focus');
  });

  it('search input should have proper placeholder', () => {
    cy.get('input[placeholder*="Search"]')
      .should('have.attr', 'placeholder')
      .and('include', 'Search');
  });

  // Note: Actual search functionality would require being logged in
  // We'll test that in the authenticated tests
});
