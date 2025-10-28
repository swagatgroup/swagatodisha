# Document Link Fetching Fix

## Problem
Document links were not displaying properly for successfully submitted applications across all user roles (student, agent, staff, super_admin). When users tried to view or download documents from submitted applications, the links were not resolving correctly.

## Root Cause
Documents were being stored in the database with relative paths (e.g., `/uploads/documents/filename.pdf`), but the frontend was not properly constructing full URLs by prepending the backend base URL. This caused issues especially in production environments where the frontend and backend might be on different domains.

## Solution
Created a comprehensive document URL utility system that:

1. **Created `documentUtils.js`** - A utility module that handles document URL construction
2. **Updated Components** - Modified all components that display documents to use the new utility
3. **Environment-Aware URL Construction** - Handles both development and production environments correctly

## Changes Made

### 1. New Utility File: `frontend/src/utils/documentUtils.js`

This file provides:
- `getDocumentUrl(path)` - Converts relative document paths to full URLs
- `getBackendUrl()` - Gets the current backend base URL
- `checkDocumentAccess(url)` - Checks if a document URL is accessible
- `formatDocumentForDisplay(document)` - Formats document data for display
- `formatDocumentsForDisplay(documents)` - Batch formats multiple documents

Key features:
- Detects if a URL is already absolute and returns it unchanged
- Handles relative paths by prepending the backend URL
- Works correctly in both development (with Vite proxy) and production
- Provides helpful console warnings when no path is provided

### 2. Updated Components

#### ApplicationReview.jsx
- Imported `getDocumentUrl` utility
- Updated document viewer to use `getDocumentUrl()` for image and iframe sources
- Updated document list "View" buttons to use proper URLs
- Ensures all document links work correctly for staff and admin reviews

#### AgentApplicationStatus.jsx
- Imported `getDocumentUrl` utility
- Updated document view links to use `getDocumentUrl()`
- Ensures agents can view documents in submitted applications

### 3. Backend Configuration (Already Present)

The backend is already correctly configured:
- Static file serving: `app.use('/uploads', express.static('uploads'))` (line 223 in server.js)
- CORS properly configured to allow cross-origin requests
- Document paths stored correctly in database

## How It Works

### Development Environment
1. Frontend runs on `http://localhost:5173` (Vite dev server)
2. Backend runs on `http://localhost:5000`
3. Vite proxy forwards API requests to backend
4. Document URLs are constructed as relative paths and proxied through Vite

### Production Environment
1. Frontend deployed to Vercel/Netlify
2. Backend deployed to Render/other service
3. `VITE_API_BASE_URL` environment variable set to backend URL
4. Document URLs are constructed as absolute URLs: `https://backend-url.com/uploads/documents/file.pdf`

## Example Usage

```javascript
import { getDocumentUrl } from '../../../utils/documentUtils';

// In a component
const documentUrl = getDocumentUrl(document.filePath);

// Use in JSX
<img src={getDocumentUrl(document.filePath)} alt="Document" />
<a href={getDocumentUrl(document.url)} target="_blank">View Document</a>
<iframe src={getDocumentUrl(document.filePath)} />
```

## Testing Checklist

- [x] Documents visible in Application Review (staff/admin)
- [x] Documents visible in Agent Application Status
- [x] Document viewer/preview working
- [x] Document download links working
- [x] Works in development environment
- [ ] Works in production environment (needs deployment to test)
- [ ] Works for all roles: student, agent, staff, super_admin

## Environment Variables Required

For production deployment, ensure `VITE_API_BASE_URL` is set in your frontend deployment:

```bash
# Example for Vercel
VITE_API_BASE_URL=https://your-backend-url.onrender.com

# Example for Netlify
VITE_API_BASE_URL=https://your-backend-url.onrender.com
```

## Benefits

1. **Consistent URL Handling** - All document URLs are handled consistently across the app
2. **Environment Awareness** - Automatically adapts to development vs production
3. **Error Prevention** - Prevents broken document links
4. **Easy Maintenance** - Centralized URL logic makes future changes easier
5. **Better Debugging** - Console warnings help identify missing paths

## Files Modified

1. `frontend/src/utils/documentUtils.js` - Created
2. `frontend/src/components/dashboard/tabs/ApplicationReview.jsx` - Updated
3. `frontend/src/components/dashboard/tabs/AgentApplicationStatus.jsx` - Updated

## Notes

- The utility automatically detects if a URL is already absolute and doesn't modify it
- In development, it returns relative paths to work with Vite proxy
- In production, it prepends the full backend URL
- The solution is backward compatible with existing document storage

## Future Enhancements

Potential improvements for the future:
1. Add caching for document URLs
2. Add automatic retry for failed document loads
3. Add thumbnail generation for image documents
4. Add document access logging
5. Add document expiry/refresh mechanism

