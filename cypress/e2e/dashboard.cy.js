describe('Dashboard Loads', () => {
  it('should display the dashboard title and sidebar', () => {
    cy.visit('/');
    cy.contains('Dashboard');
    cy.get('aside').should('exist');
    cy.get('nav').should('exist');
  });
});
