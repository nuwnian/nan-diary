/**
 * Test Suite: Homepage/Landing Page
 * Purpose: Verify basic page load and UI elements
 */

describe('Homepage - Basic Functionality', () => {
  beforeEach(() => {
    // This runs before each test
    cy.visit('/');
  });

  it('should load the homepage successfully', () => {
    // Check if page loaded (status 200)
    cy.visit('/').its('status').should('eq', 200);
  });

  it('should display the main logo/brand', () => {
    // Check if CloverIcon or app branding exists
    cy.get('header').should('be.visible');
  });

  it('should display Sign In button when not logged in', () => {
    // Check for Sign In button
    cy.contains('Sign In').should('be.visible');
  });

  it('should display Sign Up button when not logged in', () => {
    // Check for Sign Up button
    cy.contains('Sign Up').should('be.visible');
  });

  it('should display theme toggle button', () => {
    // Theme toggle should be present
    cy.get('button').contains(/theme|dark|light/i).should('exist');
  });

  it('should have a search bar in the navbar', () => {
    // Check for search input
    cy.get('input[placeholder*="Search"]').should('be.visible');
  });

  it('should display the digital clock on desktop', () => {
    // Clock should be visible (contains time format)
    cy.viewport(1280, 720); // Desktop size
    // Check if there's time displayed (looks for AM/PM pattern)
    cy.get('body').should('contain', /AM|PM/);
  });

  it('should display navigation menu', () => {
    // Check for navigation elements
    cy.get('nav').should('exist');
    cy.contains('Home').should('exist');
  });
});
