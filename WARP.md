# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

Project overview
- Monorepo with two apps:
  - backend: Node.js/Express API with MongoDB (Mongoose), JWT auth, role-based access control, file uploads, and rate limiting.
  - frontend: React 18 + Vite 6 + Tailwind, with React Router and role-gated dashboards.

Prerequisites
- Node.js: backend >= 16, frontend 18+ recommended
- MongoDB: local instance or Atlas connection via MONGODB_URI

Install dependencies
- Backend
  - cd backend
  - npm install
- Frontend
  - cd frontend
  - npm install

Core commands
- Backend (from backend/)
  - Start (production-equivalent): npm start
  - Start (dev with watch): npm run dev
  - Run tests: npm test
  - Run a single test by name: npx jest -t "<test name regex>"
  - Run a single test file: npx jest path/to/file.test.js
- Frontend (from frontend/)
  - Dev server (default http://localhost:3000): npm run dev
  - Build: npm run build
  - Preview production build: npm run preview
  - Lint: npm run lint

Full-stack development workflow
- Start backend (terminal 1)
  - pwsh: npm --prefix ./backend run dev
- Start frontend (terminal 2)
  - pwsh: npm --prefix ./frontend run dev
- Default local URLs
  - Backend: GET http://localhost:5000/health (health), GET http://localhost:5000/api/health (API health)
  - Frontend: http://localhost:3000

Environment configuration (backend)
- Copy env.example to .env and set at least:
  - MONGODB_URI: Mongo connection string
  - JWT_SECRET and JWT_EXPIRE
  - Optional: SMTP_*, CLOUDINARY_* (if using email or media)
- If MONGODB_URI is not set, backend falls back to mongodb://localhost:27017/swagat_odisha (server.js)
- Rate limiting (optional): RATE_LIMIT_WINDOW_MS, RATE_LIMIT_MAX_REQUESTS
- CORS origins: server restricts origins to a fixed allowlist; adjust in backend/server.js if needed

High-level architecture
- Backend (Express + Mongoose)
  - Entry: backend/server.js
    - Security and infra middleware: helmet, compression, morgan, express-rate-limit, CORS with allowlist, JSON/urlencoded parsers, static /uploads
    - Health endpoints: /health, /api/health; root responds with API metadata
    - Routes mounted under /api/*
    - Central 404 handler and structured global error handler (ValidationError, CastError, duplicate key 11000)
    - Mongo connection via MONGODB_URI with local fallback, non-fatal on connection failure
  - Routing and modules
    - routes/auth.js, routes/adminAuth.js: authentication flows (user vs admin)
    - routes/students.js: student CRUD and related endpoints
    - routes/admin.js: admin operations (user management, role changes, password resets)
    - routes/dashboard.js: analytics/summary endpoints
    - controllers/adminController.js, controllers/dashboardController.js: request handlers for admin and dashboard areas
    - middleware/auth.js: JWT-based authentication/authorization (role checks leveraged by protected routes)
  - Data layer (Mongoose models)
    - models/User.js, models/Admin.js: users and admins, roles, credentials
    - models/Student.js: student profile, academics, docs, referrals
    - models/Admission.js: application workflow, statuses, verification
    - models/Content.js, models/WebsiteSettings.js: CMS-like website content/settings
  - Operational notes
    - CORS: strict allowlist for origins including localhost:3000/5173 and production domains
    - Static uploads served from /uploads
    - Scripts present for setup and utilities (e.g., create-test-users.js, generate-test-token.js)

- Frontend (React + Vite)
  - Entry: frontend/src/App.jsx
    - React Router with routes for home, about, gallery, contact, role dashboards
    - ProtectedRoute component gates access via AuthContext with allowedRoles
    - UI composition: Header, HeroCarousel, QuickLinks, ApprovalsRecognitions, InstitutionTypes, ContactUs, Footer, and multiple school pages
    - HelmetProvider for SEO/meta management
  - Tooling: Vite config (frontend/vite.config.js)
    - Aliases: @, @components, @utils, @assets, @images
    - Dev server on port 3000, HMR enabled
    - Chunking and manual vendor splits; terser for minification; image assets emitted at root
    - OptimizeDeps include common libs (react, framer-motion, etc.)
  - Linting: ESLint via npm run lint

Key docs to consult
- backend/README.md: end-to-end backend features, APIs, models, and deployment notes
- backend/API_DOCUMENTATION.md: endpoint-level details (preferred for API specifics)
- backend/RENDER_DEPLOYMENT.md, backend/DEPLOYMENT_CHECKLIST.md, backend/RENDER_ENV_SETUP.md: deployment config and environment guidance
- frontend/README.md: frontend stack, scripts, and structure

Notes and conventions
- Ports: frontend 3000 (Vite), backend 5000 (Express). If you change ports, update CORS allowlist in backend/server.js and any frontend API base URLs.
- Health checks useful for CI/CD and environment validation: GET /health and /api/health on the backend.
- When running isolated tests on the backend, prefer the jest -t filter or path-based invocation as shown above.

