# 📋 Cypress Quick Reference Card

## 🚀 Getting Started
```bash
# Start your app
npm run dev

# Run Cypress (Interactive)
npm run cypress:open

# Run Cypress (Headless)
npm run cypress:run
```

## 📝 Test Structure
```javascript
describe('Test Suite Name', () => {
  beforeEach(() => {
    // Runs before each test
  });

  it('should do something', () => {
    // Test code
  });
});
```

## 🔍 Finding Elements
| Command | Example | Description |
|---------|---------|-------------|
| `cy.get()` | `cy.get('.button')` | Find by selector |
| `cy.contains()` | `cy.contains('Login')` | Find by text |
| `.first()` | `cy.get('li').first()` | First element |
| `.last()` | `cy.get('li').last()` | Last element |
| `.eq()` | `cy.get('li').eq(2)` | Element at index |

## 👆 Interactions
| Action | Command | Example |
|--------|---------|---------|
| Click | `.click()` | `cy.get('button').click()` |
| Type | `.type()` | `cy.get('input').type('text')` |
| Clear | `.clear()` | `cy.get('input').clear()` |
| Check | `.check()` | `cy.get('[type="checkbox"]').check()` |
| Select | `.select()` | `cy.get('select').select('option')` |

## ✅ Assertions
| Check | Command | Example |
|-------|---------|---------|
| Exists | `.should('exist')` | `cy.get('.title').should('exist')` |
| Visible | `.should('be.visible')` | `cy.get('.modal').should('be.visible')` |
| Text | `.should('contain', 'text')` | `cy.get('.title').should('contain', 'Welcome')` |
| Value | `.should('have.value', 'x')` | `cy.get('input').should('have.value', 'test')` |
| Class | `.should('have.class', 'x')` | `cy.get('div').should('have.class', 'active')` |
| Disabled | `.should('be.disabled')` | `cy.get('button').should('be.disabled')` |
| Checked | `.should('be.checked')` | `cy.get('[type="checkbox"]').should('be.checked')` |
| Length | `.should('have.length', n)` | `cy.get('li').should('have.length', 5)` |

## 🌐 Navigation
```javascript
cy.visit('/')           // Go to page
cy.go('back')          // Back button
cy.reload()            // Refresh
cy.viewport(1280, 720) // Set screen size
```

## 🐛 Debugging
```javascript
cy.get('.element').debug()   // Open debugger
cy.get('.element').pause()   // Pause test
cy.log('Message')            // Log message
cy.screenshot('name')        // Take screenshot
```

## 📱 Common Viewports
```javascript
cy.viewport(1920, 1080)    // Desktop FHD
cy.viewport(1280, 720)     // Desktop HD
cy.viewport('iphone-x')    // iPhone X
cy.viewport('ipad-2')      // iPad
cy.viewport(375, 667)      // Mobile
```

## ⌨️ Special Keys
```javascript
cy.get('input').type('{enter}')      // Enter
cy.get('input').type('{esc}')        // Escape
cy.get('input').type('{backspace}')  // Backspace
cy.get('input').type('{selectall}')  // Ctrl+A
```

## 🎯 Best Practices
✅ Use `data-testid` attributes  
✅ One assertion per test  
✅ Descriptive test names  
✅ Use `should()` instead of `cy.wait(1000)`  
❌ Don't test external sites  
❌ Don't use hardcoded waits  

## 🔑 Selector Priority
1. `[data-testid="submit"]` ⭐ Best - won't break with styling changes
2. `#unique-id` ✅ Good - unique and stable
3. `.class-name` ⚠️ OK - may break with CSS changes
4. `button[type="submit"]` ✅ Good - semantic
5. Text content with `contains()` ⚠️ OK - may break with text changes

## 📊 Test Status
- ✅ Green checkmark = Test passed
- ❌ Red X = Test failed
- ⚪ Gray circle = Test not run
- 🔵 Blue circle = Test running

## 🎓 Learning Path
1. Write simple existence tests
2. Add interaction tests (click, type)
3. Add assertion tests (check results)
4. Test responsive design
5. Test complex user flows
6. Add accessibility tests

## 💡 Common Patterns

### Wait for element to appear
```javascript
cy.get('.loading').should('not.exist');
cy.get('.content').should('be.visible');
```

### Check multiple elements
```javascript
const items = ['Home', 'About', 'Contact'];
items.forEach(item => {
  cy.contains(item).should('exist');
});
```

### Conditional testing
```javascript
cy.get('body').then($body => {
  if ($body.find('.modal').length > 0) {
    cy.get('.modal').click();
  }
});
```

### Chain commands
```javascript
cy.get('input')
  .type('test')
  .should('have.value', 'test')
  .clear()
  .should('have.value', '');
```

---
**Remember:** Tests should be readable, reliable, and maintainable!
