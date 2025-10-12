# Nan Diary

A small static diary-like project to plan and track creative projects.

Project structure

- index.html - main HTML file (loads CSS/JS from `src/`)
- src/css/style.css - extracted styles
- src/js/main.js - extracted JavaScript
- assets/ - (optional) images or other media

How to use

1. Open `index.html` in your browser (double-click or serve with a static server).
2. Add plans with the "+ Add Plan" button and edit details in the detail view.

Maintenance tips

- Keep CSS in `src/css/` and JS in `src/js/` for easier editing.
- Consider adding a small build step (e.g., npm, parcel, or vite) if you add modules.
- Add unit tests and linting when the project grows.
