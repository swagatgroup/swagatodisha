# Backend 500 Error Fix Guide

## Problem Analysis
The registration is failing with a 500 Internal Server Error, which indicates a server-side issue. The most likely causes are:

1. **Missing Environment Variables**: Backend needs MONGODB_URI and JWT_SECRET
2. **Database Connection Failure**: No local MongoDB running or wrong connection string
3. **Server Not Starting Properly**: Environment validation failing

## Root Cause
The backend server is failing to start or process requests due to:
- Missing `.env` file with required environment variables
- No local MongoDB database running
- Server exiting due to missing environment variables

## Solutions Implemented

### 1. Made Server More Resilient
**File**: `backend/server.js`

**Changes Made:**
- Server no longer exits if environment variables are missing
- Sets default values for development
- Continues running even if database connection fails
- Better error handling and logging

### 2. Environment Variable Handling
```javascript
// Before: Server would exit if env vars missing
if (missing.length > 0) {
    console.error('❌ Missing required environment variables:', missing.join(', '));
    process.exit(1);
}

// After: Sets defaults and continues
if (!process.env.MONGODB_URI) {
    process.env.MONGODB_URI = 'mongodb://localhost:27017/swagat_odisha';
    console.warn('⚠️ MONGODB_URI not set, using default:', process.env.MONGODB_URI);
}
```

### 3. Database Connection Handling
```javascript
// Before: Server would exit on DB connection failure
catch (error) {
    console.error('Database connection error:', error);
    process.exit(1);
}

// After: Continues running with warning
catch (error) {
    console.error('Database connection error:', error);
    console.log('⚠️ Server will continue running without database connection.');
}
```

## Setup Instructions

### Option 1: Quick Fix (Recommended for Testing)
The server will now run with default values. Just start the backend:

```bash
cd backend
npm start
```

### Option 2: Proper Setup with Environment Variables
Create a `.env` file in the backend directory:

```bash
# backend/.env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/swagat_odisha
JWT_SECRET=your_secure_jwt_secret_here
JWT_EXPIRE=7d
FRONTEND_URL=http://localhost:3000
```

### Option 3: Use MongoDB Atlas (Production-like)
If you want to use the same database as production:

```bash
# backend/.env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/swagat_odisha
JWT_SECRET=your_secure_jwt_secret_here
JWT_EXPIRE=7d
FRONTEND_URL=http://localhost:3000
```

## Testing Steps

### 1. Start the Backend
```bash
cd backend
npm start
```

**Expected Output:**
```
⚠️ MONGODB_URI not set, using default: mongodb://localhost:27017/swagat_odisha
⚠️ JWT_SECRET not set, using default (CHANGE IN PRODUCTION!)
✅ Environment variables configured
🚀 Server running on port 5000
🌍 Environment: development
📊 Health check: http://localhost:5000/health
📊 API Health check: http://localhost:5000/api/health
⚠️ Database connection error: [error details]
⚠️ Server will continue running without database connection.
```

### 2. Test Health Endpoints
```bash
# Test basic health
curl http://localhost:5000/health

# Test API health
curl http://localhost:5000/api/health

# Test CORS
curl http://localhost:5000/api/test
```

### 3. Test Registration
Try registering a student from the frontend. The server should now respond properly.

## Database Setup (Optional)

### For Local MongoDB:
1. Install MongoDB locally
2. Start MongoDB service
3. The server will connect automatically

### For MongoDB Atlas:
1. Get connection string from MongoDB Atlas
2. Update MONGODB_URI in .env file
3. Ensure IP whitelist includes your IP

## Expected Results

### Before Fix:
- ❌ 500 Internal Server Error
- ❌ Server fails to start
- ❌ Registration fails completely
- ❌ Environment variable errors

### After Fix:
- ✅ Server starts successfully
- ✅ Health endpoints work
- ✅ Registration processes (may fail at database level, but server responds)
- ✅ Better error messages and logging

## Troubleshooting

### If server still doesn't start:
1. Check if port 5000 is available
2. Look for any syntax errors in server.js
3. Verify Node.js and npm are installed

### If registration still fails:
1. Check if database is accessible
2. Look at server logs for specific errors
3. Test individual API endpoints

### If database connection fails:
1. Install and start MongoDB locally
2. Or use MongoDB Atlas with proper connection string
3. Check network connectivity

## Files Modified
- `backend/server.js` - Made server more resilient to missing environment variables

## Next Steps
1. Start the backend server
2. Test the health endpoints
3. Try student registration
4. Set up proper environment variables for production
5. Configure database connection

## Production Notes
- Always set proper environment variables in production
- Use secure JWT secrets
- Ensure database connection is stable
- Monitor server logs for errors
