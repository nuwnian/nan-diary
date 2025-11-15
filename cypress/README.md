# 🧪 Cypress Test Suite

This folder contains end-to-end (E2E) tests for the Nan Diary application.

## 📁 Test Files

### Core Functionality Tests
- **01-homepage.cy.js** - Homepage loading and basic UI elements
- **02-theme-toggle.cy.js** - Dark/light theme switching
- **03-search.cy.js** - Search bar functionality
- **04-navigation.cy.js** - Navigation menu and mobile menu
- **05-responsive.cy.js** - Responsive design across different devices
- **06-ui-elements.cy.js** - UI components, accessibility, and interactions

### Legacy Tests
- **dashboard.cy.js** - Original dashboard test (kept for reference)

## 🚀 Running Tests

### Prerequisites
Make sure your development server is running:
```bash
npm run dev
```

### Interactive Mode (Recommended)
```bash
npm run cypress:open
```
- Opens Cypress Test Runner
- Select E2E Testing
- Choose a browser
- Click on test files to run them
- Great for development and debugging

### Headless Mode
```bash
npm run cypress:run
```
- Runs all tests in the terminal
- No GUI
- Generates screenshots and videos
- Perfect for CI/CD pipelines

## 📊 Test Coverage

### ✅ Currently Tested
- [x] Page loading and navigation
- [x] Theme switching (light/dark mode)
- [x] Search bar UI and interaction
- [x] Navigation menu (desktop and mobile)
- [x] Responsive design (mobile, tablet, desktop)
- [x] UI elements (buttons, icons, cards)
- [x] Neumorphic design elements
- [x] Accessibility basics
- [x] Cross-browser compatibility

### ⏳ Not Yet Tested (Requires Auth Setup)
- [ ] Google Sign In flow
- [ ] Creating notes
- [ ] Editing notes
- [ ] Deleting notes
- [ ] Saving notes
- [ ] Profile menu interactions
- [ ] User-specific data

## 📖 Documentation

For detailed guides, see:
- **[CYPRESS-BEGINNER-GUIDE.md](../docs/CYPRESS-BEGINNER-GUIDE.md)** - Complete tutorial for beginners
- **[CYPRESS-QUICK-REFERENCE.md](../docs/CYPRESS-QUICK-REFERENCE.md)** - Quick command reference

## 🐛 Debugging Failed Tests

1. **Run in interactive mode** to see visual feedback
2. **Click on failed step** in Cypress to see error details
3. **Check screenshots** in `cypress/screenshots/`
4. **Watch videos** in `cypress/videos/`
5. **Use `.debug()`** or `.pause()` in test code

## 🎯 Test Organization

Tests are numbered by execution order and logical grouping:
1. Basic functionality (homepage)
2. Interactive features (theme, search)
3. Navigation and menus
4. Responsive design
5. UI/UX elements

## 🔧 Configuration

Test configuration is in `cypress.config.js`:
- Base URL: `http://localhost:3001`
- Viewport: 1280x720 (default)
- Screenshots: On failure
- Videos: Disabled (enable in config if needed)

## 📝 Writing New Tests

1. Create new file: `cypress/e2e/XX-feature-name.cy.js`
2. Use descriptive names following the pattern
3. Follow the AAA pattern:
   - **Arrange** - Set up test data
   - **Act** - Perform actions
   - **Assert** - Verify results
4. Add documentation comments at the top

Example:
```javascript
/**
 * Test Suite: Feature Name
 * Purpose: What this test validates
 */

describe('Feature Name', () => {
  beforeEach(() => {
    cy.visit('/');
  });

  it('should do something specific', () => {
    // Arrange
    // Act
    cy.get('[data-testid="button"]').click();
    // Assert
    cy.get('.result').should('be.visible');
  });
});
```

## 🎓 Best Practices

1. **Use data-testid attributes** for stable selectors
2. **One assertion per test** when possible
3. **Descriptive test names** that explain what's being tested
4. **Avoid hardcoded waits** - use assertions instead
5. **Clean up after tests** if creating data
6. **Keep tests independent** - don't rely on test order

## 📈 Continuous Integration

To add Cypress to CI/CD pipeline:
```yaml
# Example for GitHub Actions
- name: Run Cypress tests
  run: |
    npm run dev &
    npm run cypress:run
```

## 🤝 Contributing

When adding new features to the app:
1. Write tests first (TDD) or immediately after
2. Ensure all existing tests still pass
3. Update this README if adding new test categories

---

**Note:** Authentication-based tests require additional setup. See `CYPRESS-BEGINNER-GUIDE.md` for information on testing authenticated flows.
