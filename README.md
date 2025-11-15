# Nan Diary

A cozy, full-stack diary app for creative project planning with Firebase integration.

Live demo: https://nan-diary-6cdba.web.app

Overview
--------
Nan Diary is a lightweight project/diary app built with a React + TypeScript frontend (Vite), an Express backend, and Firebase for authentication and Cloud Firestore for data persistence. It includes a rich text editor for notes, emoji-based project customization, auto-save, and a UI built with Radix primitives and a neumorphic design.

Highlights
- Google sign-in (Firebase)
- Rich text editor for project notes
- Auto-save and responsive UI (desktop and mobile)
- Server-side validation and security checks
- Deployable to Firebase Hosting and Cloud Run / App Engine
- Includes tests, gitleaks scanning in CI, and pre-commit/pre-push hooks

Table of Contents
-----------------
- [Quick Start](#quick-start)
- [Prerequisites](#prerequisites)
- [Development](#development)
- [Environment Variables](#environment-variables)
- [Project Structure](#project-structure)
- [API (Server)](#api-server)
- [Security](#security)
- [CI / CD](#ci--cd)
- [Contributing](#contributing)
- [License](#license)
- [Acknowledgments](#acknowledgments)

Quick Start
-----------
Clone, install, configure, and run:

```bash
git clone https://github.com/nuwnian/nan-diary.git
cd nan-diary

# Install frontend + server deps (root scripts may install both)
npm install

# Copy example env and fill values
cp .env.local.example .env.local
# Edit .env.local and add VITE_FIREBASE_API_KEY and any other required values

# Run frontend dev server
npm run dev

# (Optional) If you run the backend locally:
cd server
cp .env.example .env
# Edit server/.env and add Firebase service account path or ADC settings
npm install
npm run dev
```

Prerequisites
-------------
- Node.js >= 18.x
- npm >= 9.x
- Firebase project with Firestore enabled
- Firebase CLI (for deployment): npm install -g firebase-tools

Development
-----------
Available scripts (root):
- npm run dev — Start frontend dev server (Vite)
- npm run dev:fullstack — Run frontend + backend together (if configured)
- npm run build — Build frontend for production
- npm run preview — Preview production build locally
- npm test — Run frontend tests
- npm run test:backend — Run backend tests
- npm run test:all — Run all tests
- npm run lint — Lint frontend
- npm run lint:backend — Lint backend
- npm run security-check — Run npm audit

See package.json for the full scripts list and server/README.md for backend-specific commands.

Environment Variables
---------------------
Frontend (.env.local)
- VITE_FIREBASE_API_KEY — Firebase web API key (used by Vite build)

Server (.env)
- FIREBASE_PROJECT_ID — Firebase project ID
- FIREBASE_SERVICE_ACCOUNT_PATH — Path to service account JSON (or use ADC)
- PORT — Server port (default: 3001)
- LOG_LEVEL — Logging verbosity (default: info)
- CORS_ORIGIN — Allowed CORS origins (comma-separated)

Never commit secrets or service account files. `.env.local` and `.env` should be in .gitignore and are blocked by pre-commit hooks.

Project Structure
-----------------
High level:

```
nan-diary/
├── src/               # Frontend: React + Vite + TypeScript
│   ├── components/
│   ├── services/
│   └── main.tsx
├── server/            # Backend: Express + Firebase Admin SDK
│   ├── src/
│   └── README.md
├── deploy/            # Production build output
├── cypress/           # E2E tests
├── docs/
└── package.json
```

API (Server)
------------
The API server lives in the `server/` folder. See server/README.md for the full API reference, endpoints include:
- GET /health
- POST /api/auth/verify
- GET /api/auth/me
- POST /api/projects
- POST /api/projects/add
- PUT /api/projects/:index
- DELETE /api/projects/:index

Security
--------
Security-first features:
- Build-time API key injection (no hardcoded keys)
- Gitleaks scanning in CI
- Firestore security rules (user-scoped access)
- Firebase Auth (Google OAuth) with optional domain restrictions
- HTTPS enforced in production
- Git hooks: pre-commit and pre-push scans for secrets

See PRE-DEPLOYMENT-CHECKLIST.md and docs/SECURITY-BUG-DOCUMENTATION.md for details.

CI / CD
-------
Automated GitHub Actions workflows:
1. Quality checks (linters, security scans)
2. Build & tests
3. E2E (Cypress, non-blocking)
4. Deploy to Firebase Hosting
5. Post-deploy verification

Deployment
----------
Manual:
```bash
npm run build
firebase deploy --only hosting
# or with CI token:
firebase deploy --only hosting --token "$FIREBASE_TOKEN"
```

For backend (Cloud Run):
```bash
docker build -t nan-diary-api .
gcloud run deploy nan-diary-api --image nan-diary-api --platform managed --allow-unauthenticated
```

Contributing
------------
Thanks for wanting to contribute! The basic flow:
1. Fork the repo
2. Create a feature branch: git checkout -b feature/your-feature
3. Commit changes and run tests/lint
4. Push and open a PR

Please follow code style and add tests for new features. Make sure `.env.local` or other secrets are never committed.

License
-------
Decide and set a single license in the LICENSE file and update this section. Current repository README contains both "MIT" and "private/proprietary" — pick one and keep it consistent.

Author & Acknowledgments
------------------------
- Author: nuwnian — https://github.com/nuwnian
- Built with: Radix UI, Lucide icons, Firebase, Vite

Further reading and docs
------------------------
- PRE-DEPLOYMENT-CHECKLIST.md
- docs/FULLSTACK-SETUP.md
- server/README.md (API docs)
- docs/DEVOPS-GUIDE.md
- docs/SECURITY-BUG-DOCUMENTATION.md