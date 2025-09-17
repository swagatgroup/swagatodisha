# Vercel Deployment Guide for Swagat Odisha

## 🚀 Quick Fix for 404 Errors

### Issues Fixed:
1. ✅ **Removed duplicate route files** (`agents.js` and `referrals.js`)
2. ✅ **Updated Vercel configuration** for proper API routing
3. ✅ **Made server.js Vercel-compatible**
4. ✅ **Fixed CORS configuration** for production

### Required Environment Variables in Vercel:

Go to your Vercel dashboard → Project Settings → Environment Variables and add:

```bash
# Core Configuration
NODE_ENV=production
VERCEL=1

# Database
MONGODB_URI=mongodb+srv://your-mongodb-connection-string

# JWT
JWT_SECRET=your-jwt-secret-key-here

# CORS
CORS_ORIGIN=https://swagatodisha.com,https://www.swagatodisha.com

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# File Upload
MAX_FILE_SIZE=5242880
UPLOAD_PATH=uploads

# Email (if using)
SENDGRID_API_KEY=your-sendgrid-api-key
FROM_EMAIL=noreply@swagatodisha.com

# Cloudinary (if using)
CLOUDINARY_CLOUD_NAME=your-cloudinary-cloud-name
CLOUDINARY_API_KEY=your-cloudinary-api-key
CLOUDINARY_API_SECRET=your-cloudinary-api-secret

# R2 Storage (if using)
R2_ACCOUNT_ID=your-r2-account-id
R2_ACCESS_KEY_ID=your-r2-access-key
R2_SECRET_ACCESS_KEY=your-r2-secret-key
R2_BUCKET_NAME=your-r2-bucket-name
R2_PUBLIC_URL=https://your-r2-public-url.com

# Bcrypt
BCRYPT_ROUNDS=12

# Socket.IO
SOCKET_CORS_ORIGIN=https://swagatodisha.com,https://www.swagatodisha.com
```

### Build Configuration:

1. **Root Directory**: Leave empty (project root)
2. **Build Command**: `cd frontend && npm install && npm run build`
3. **Output Directory**: `frontend/dist`
4. **Install Command**: `npm install`

### API Routes Fixed:

- ✅ `/api/auth/*` - Authentication
- ✅ `/api/admin-auth/*` - Admin authentication  
- ✅ `/api/students/*` - Student management
- ✅ `/api/agents/*` - Agent management
- ✅ `/api/staff/*` - Staff management
- ✅ `/api/admin/*` - Admin management
- ✅ `/api/dashboard/*` - Dashboard data
- ✅ `/api/documents/*` - Document upload
- ✅ `/api/document-types/*` - Document types
- ✅ `/api/student-application/*` - Student applications
- ✅ `/api/referral/*` - Referral system
- ✅ `/api/notifications/*` - Notifications
- ✅ `/api/gallery/*` - Gallery
- ✅ `/api/courses/*` - Courses
- ✅ `/api/contact/*` - Contact form
- ✅ `/api/analytics/*` - Analytics
- ✅ `/api/health` - Health check

### Frontend Routes Fixed:

- ✅ `/` - Homepage
- ✅ `/about` - About page
- ✅ `/gallery` - Gallery
- ✅ `/contact` - Contact
- ✅ `/login` - Login
- ✅ `/register` - Register
- ✅ `/dashboard/*` - All dashboards
- ✅ `/terms-and-conditions` - Terms
- ✅ `/privacy-policy` - Privacy
- ✅ `/SwagatPublicSchool_*` - School pages

### Common 404 Error Fixes:

1. **API Routes**: All API routes now properly configured
2. **Frontend Routes**: SPA routing with proper fallbacks
3. **Static Assets**: Properly served from frontend/dist
4. **CORS**: Fixed for production domains
5. **Environment**: Vercel-specific configuration

### Testing Your Deployment:

1. **Health Check**: `https://your-domain.vercel.app/api/health`
2. **API Test**: `https://your-domain.vercel.app/api/auth/test`
3. **Frontend**: `https://your-domain.vercel.app/`

### Troubleshooting:

If you still get 404 errors:

1. Check Vercel Function logs in dashboard
2. Verify all environment variables are set
3. Ensure MongoDB connection is working
4. Check CORS settings match your domain
5. Verify build completed successfully

### Next Steps:

1. Deploy to Vercel with these configurations
2. Set all environment variables
3. Test all routes
4. Monitor Vercel Function logs for any errors

The 404 errors should now be resolved! 🎉
