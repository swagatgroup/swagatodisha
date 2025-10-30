## Swagat Odisha Backend Architecture and Conventions

This document explains how the backend is structured and the conventions to follow when adding or modifying features. It captures the working patterns established across routes, middleware, controllers, models, and utilities so future work stays consistent and safe.

### Overview
- Express app bootstrap and route mounting live in `backend/server.js`.
- Security, validation, and rate limits are centralized in `backend/middleware/security.js`.
- Authentication, JWT verification, and role-based access control are in `backend/middleware/auth.js`.
- Error handling utilities and the global error handler are in `backend/middleware/errorHandler.js`.
- Domain logic is divided into:
  - Routes in `backend/routes/*`
  - Controllers in `backend/controllers/*`
  - Mongoose models in `backend/models/*`
  - Utilities in `backend/utils/*`
  - One-off maintenance scripts in `backend/scripts/*`

### Server bootstrap and middleware order
`backend/server.js` sets up the app with a strict order:
1) Custom CORS allowlist handling for known frontends (including development origins)
2) Security headers via `helmet`, compression, logging via `morgan`
3) Global performance monitor and input hardening: sanitization, anti-SQLi, anti-XSS
4) Body parsing (`application/json`, `urlencoded`) with 10MB limits
5) Static file serving under `/uploads` with explicit CORS and content-type headers
6) Health/test endpoints (`/`, `/health`, `/api/health`, `/test`)
7) Route mounting under `/api/...` with appropriate rate limiters
8) 404 `notFound` and global `errorHandler` as the final middlewares

Do not change this sequence unless you fully understand the implications. Security and sanitization should remain before route handling; error middlewares must remain last.

### Routing and mounting
All routers live in `backend/routes/` and are mounted in `server.js` under a clear base path with a rate limiter:

- Auth: `/api/auth`, `/api/admin-auth` (uses `authRateLimit`)
- Students: `/api/students`, `/api/students/payments`, `/api/students/applications`, `/api/students/academic`
- Applications & workflow: `/api/student-application`, `/api/workflow`, `/api/verification`
- Documents: `/api/documents` (uses `uploadRateLimit`), `/api/document-types`, `/api/files`
- Content: `/api/cms`, `/api/website-content`, `/api/courses`, `/api/gallery`, `/api/pdf`
- Communication & insights: `/api/notifications`, `/api/analytics`, `/api/dashboard`, `/api/performance`, `/api/security`, `/api/contact`
- Admin/staff/agents: `/api/admin`, `/api/admin/students`, `/api/staff`, `/api/agents`, `/api/referral`

Keep new domains consistent with this pattern: create a route file, add controllers, protect with the right middlewares, and mount in `server.js` with the correct rate limiter.

### Authentication and RBAC
Centralized in `backend/middleware/auth.js`:

- `protect` verifies JWT from `Authorization: Bearer <token>`, loads the user from `User` or `Admin`, enforces account state (active, not locked), invalidates tokens issued before password changes, and sets `req.user` and `req.userType`.
- `authorize(...roles)`/`restrictTo` enforce role access at route level.
- Role helpers: `isStudent`, `isAgent`, `isStaff`, `isSuperAdmin`.
- Ownership guard: `checkOwnership('ModelName')` allows access if super admin, assigned staff, creator, or owner (`resource.user`/`resource.student` matches `req.user._id`).
- Sensitive actions: `canModifySensitiveFields` (e.g., Aadhar updates), `canDelete` (super admin only).

Apply `protect` to any private route. Apply `authorize`/role helpers to enforce business roles. For resource-specific access, add `checkOwnership` in the route.

### Security, validation, and rate limiting
Defined in `backend/middleware/security.js`:

- Rate limiters: `authRateLimit`, `apiRateLimit`, `uploadRateLimit`, `passwordResetRateLimit`. Choose the one that fits the domain and mount alongside the router.
- `helmet` with CSP/HSTS, tuned for the app’s frontend and asset usage.
- Sanitization: recursively cleans body/query/params, strips script handlers and `javascript:` URLs.
- Anti-SQLi and anti-XSS scans across inputs to block suspicious patterns.
- File upload validation: checks MIME type, extension, and max size (10MB) before processing.
- `securityLogger` (optional) for monitoring; keep disabled unless debugging.

When accepting input, combine `security.validationRules` and `handleValidationErrors` with any domain-specific validation.

### Error handling
`backend/middleware/errorHandler.js` provides:

- `asyncHandler(fn)` wrapper for controllers to forward errors to the central handler.
- `notFound` for unmapped routes (404 with a standard error code).
- `errorHandler` that normalizes common error types (Mongoose cast/validation/duplicate, JWT errors, upload errors, 429) into consistent JSON: `{ success: false, message, error }`. In development, stack traces/details are included; in production they’re suppressed.

Controllers and routes should either throw or call `next(err)`; never send partial responses after an error is detected.

### Controllers and models
- Controllers (in `backend/controllers/*`) contain business logic only. They assume the route layer already enforced auth, roles, and ownership. Use `asyncHandler` for async functions.
- Models (in `backend/models/*`) define schemas, indexes, virtuals, and methods (e.g., `comparePassword`, `changedPasswordAfter`). Use `populate` in controllers where relationship expansion is needed.

### Static files and uploads
- Static files served at `/uploads` include permissive CORS headers and explicit content-types for PDFs and images.
- For upload routes, always use `uploadRateLimit` and the file `validateFileUpload` middleware alongside the upload mechanism.

### Health, diagnostics, and performance
- Health endpoints: `/health`, `/api/health` (includes performance/db health), and `/test`.
- Performance monitoring: `backend/utils/performance.js` with `/api/performance/*` endpoints for metrics and recommendations.
- Database optimization helpers in `backend/utils/databaseOptimization.js` (index creation is intentionally disabled to avoid duplicate warnings in prod).

### CORS policy
- A strict allowlist for frontend origins is configured early in `server.js`, with fallback headers for edge cases. Update the allowlist only when onboarding a new frontend domain/environment.

### Response shape conventions
Use consistent JSON structures across the app:
- Success: `{ success: true, message?: string, data?: any }`
- Error: `{ success: false, message: string, error: string }`

Avoid leaking internals in production; rely on the centralized error handler for error responses.

### Safe change checklist (use this for any new feature)
1) Model: add/update schema in `backend/models/*` (include indexes where needed).
2) Controller: add functions in `backend/controllers/*` using `asyncHandler` and returning standard success JSON.
3) Route: new file in `backend/routes/*` that wires controller functions and applies `protect`, `authorize`/role helpers, ownership checks, `validationRules`/`handleValidationErrors`, and `validateFileUpload` when relevant.
4) Mount: add the router in `backend/server.js` under `/api/<domain>` with the correct rate limiter.
5) Security: confirm inputs are sanitized/validated; confirm RBAC/ownership coverage.
6) Errors: ensure thrown errors bubble to `errorHandler` (no ad-hoc error JSON from controllers).
7) Test: verify `/health` and key endpoints; test CORS from allowed origins; remove any temporary debug routes.

### Notes on applications, documents, and admin flows
- Student Applications: APIs live under both `/api/student-application` and `/api/students/applications`; they rely on `protect` and ownership checks. Populations of related users/staff are common.
- Documents: use `uploadRateLimit` and validate files; document statuses are normalized via scripts and debug endpoints.
- Admin/Staff: may authenticate via `Admin` model; `protect` resolves either `User` or `Admin`. Use role helpers to limit powerful actions (`canDelete` etc.).

### Environment and deployment
- Environment variables are loaded via `dotenv` in `server.js`; examples exist in `backend/env.*.example`.
- Vercel compatibility: when `VERCEL=1`, the server avoids calling `listen()` and still initializes DB connections non-blockingly.

### When in doubt
Follow the existing patterns: route-level auth/roles/ownership + centralized security/validation + controller-only business logic + unified error handling. If a change might affect global middleware order, stop and review before editing.


