# Rate Limiting Fix - 429 Too Many Requests

## Issue

**Error Message:**
```
HTTP 429 Too Many Requests
Too many requests, please slow down
```

**Root Cause:**
1. Auto-refresh functionality was creating too many API calls too quickly
2. Multiple refresh calls happening simultaneously after document upload
3. Rate limit was set too low (100 requests per 15 minutes)

## Fixes Applied

### 1. Frontend: Removed Problematic Auto-Refresh ✅

#### ApplicationReview.jsx (Staff View)
**Before:**
```javascript
// Auto-refresh selected application details when it changes
useEffect(() => {
    if (selectedApplication?.applicationId) {
        console.log('🔄 Auto-refreshing selected application details...');
        const refreshTimer = setTimeout(() => {
            fetchApplicationDetails(selectedApplication.applicationId);
        }, 500);
        
        return () => clearTimeout(refreshTimer);
    }
}, [selectedApplication?.applicationId]);
```

**After:**
```javascript
// Note: Auto-refresh removed to prevent rate limiting issues
// Staff can use the manual "Refresh" button to get latest data
```

**Alternative:** Staff can click the "Refresh" button (gray button with 🔄 icon) to manually refresh data.

#### AgentApplicationStatus.jsx (Agent View)
**Before:**
```javascript
await fetchApplicationDetails(selectedApplication.applicationId);
await fetchApplications(); // Two calls
```

**After:**
```javascript
// Refresh application details to get updated document status
// Use a single combined refresh with slight delay to avoid rate limiting
console.log('🔄 Refreshing data after upload (with delay to avoid rate limit)...');
await new Promise(resolve => setTimeout(resolve, 1000)); // 1 second delay

await fetchApplicationDetails(selectedApplication.applicationId); // Only one call
```

**Changes:**
- Removed redundant `fetchApplications()` call
- Added 1-second delay before refresh to avoid rapid-fire requests
- Reduced from 2 API calls to 1 API call

### 2. Backend: Increased Rate Limit ✅

#### backend/middleware/security.js

**Before:**
```javascript
const apiRateLimit = createRateLimit(
    15 * 60 * 1000, // 15 minutes
    100, // 100 requests per 15 minutes
    'Too many requests, please slow down'
);
```

**After:**
```javascript
const apiRateLimit = createRateLimit(
    15 * 60 * 1000, // 15 minutes
    500, // 500 requests per 15 minutes (increased from 100)
    'Too many requests, please slow down'
);
```

**Rationale:**
- 100 requests per 15 minutes = ~6.7 requests per minute
- Too low for active users with multiple tabs or frequent refreshes
- 500 requests per 15 minutes = ~33 requests per minute
- Much more reasonable for real-world usage

## Testing Guide

### Test 1: Document Upload Without Rate Limit Error

1. **Login as Agent**
2. **Upload a document** (or reupload a rejected one)
3. **Watch the console:**
   ```
   📤 Starting upload...
   ✅ Upload response: { success: true }
   🔄 Refreshing data after upload (with delay to avoid rate limit)...
   🔍 Fetching application details for: APP25974541
   ✅ Upload complete - UI refreshed with latest data
   ```

4. **✅ Verify:**
   - No 429 error
   - Upload completes successfully
   - Data refreshes after 1-second delay
   - UI updates with new document

### Test 2: Staff Manual Refresh

1. **Login as Staff**
2. **View an application**
3. **Click "Refresh" button** multiple times
4. **✅ Verify:**
   - Can refresh several times without hitting rate limit
   - Success message appears: "✅ Application data refreshed!"
   - No 429 errors in console

### Test 3: Multiple Uploads in Succession

1. **Login as Agent**
2. **Upload 3-5 documents** one after another
3. **✅ Verify:**
   - All uploads complete successfully
   - No 429 errors
   - Each upload has 1-second delay before refresh
   - Total time: ~upload time + 1 second per document

### Test 4: Rate Limit Still Works for Abuse

1. **Try to make 500+ requests in 15 minutes**
2. **✅ Verify:**
   - After 500 requests, you get 429 error
   - Rate limiting still protects the server
   - Not completely disabled, just more reasonable

## Current Rate Limits

### General API Requests
- **Limit:** 500 requests per 15 minutes
- **Window:** 15 minutes (900 seconds)
- **Per:** ~33 requests per minute
- **Applies to:** Most API endpoints

### Authentication
- **Limit:** 50 attempts per 15 minutes
- **Window:** 15 minutes
- **Applies to:** Login, register, token refresh

### File Uploads
- **Limit:** 20 uploads per hour
- **Window:** 1 hour (3600 seconds)
- **Applies to:** Document upload endpoint

### Password Reset
- **Limit:** 3 attempts per hour
- **Window:** 1 hour
- **Applies to:** Password reset requests

## How to Monitor Rate Limits

### Check Console for Rate Limit Warnings
```
🌐 API Error - Status: 429
🌐 API Error - Message: Too many requests, please slow down
```

### Response Headers
```
X-RateLimit-Limit: 500
X-RateLimit-Remaining: 487
X-RateLimit-Reset: 1704196800
```

### Error Response
```json
{
  "success": false,
  "message": "Too many requests, please slow down",
  "retryAfter": 900
}
```

## Best Practices Going Forward

### 1. **Avoid Rapid Sequential Requests**
```javascript
// ❌ BAD - No delay
await call1();
await call2();
await call3();

// ✅ GOOD - With delays
await call1();
await new Promise(resolve => setTimeout(resolve, 1000));
await call2();
```

### 2. **Combine Multiple Calls When Possible**
```javascript
// ❌ BAD - Multiple endpoints
await api.get('/applications');
await api.get('/stats');
await api.get('/documents');

// ✅ GOOD - Single endpoint with all data
await api.get('/dashboard-data'); // Returns applications + stats + documents
```

### 3. **Use Manual Refresh Instead of Auto-Refresh**
```javascript
// ❌ BAD - Auto-refresh every X seconds
useEffect(() => {
    const interval = setInterval(() => {
        fetchData();
    }, 5000);
    return () => clearInterval(interval);
}, []);

// ✅ GOOD - Manual refresh button
<button onClick={() => fetchData()}>
    Refresh
</button>
```

### 4. **Debounce User Actions**
```javascript
// ❌ BAD - Calls API on every keystroke
<input onChange={(e) => searchAPI(e.target.value)} />

// ✅ GOOD - Debounced (wait 500ms after typing stops)
const debouncedSearch = debounce(searchAPI, 500);
<input onChange={(e) => debouncedSearch(e.target.value)} />
```

## Summary

✅ **Removed auto-refresh** that was causing excessive API calls  
✅ **Added 1-second delay** before refreshing after document upload  
✅ **Reduced API calls** from 2 to 1 after upload  
✅ **Increased rate limit** from 100 to 500 requests per 15 minutes  
✅ **Manual refresh button** available for staff to get latest data  
✅ **Better logging** to track refresh behavior  

## If You Still See 429 Errors

1. **Check your console** - Look for rapid sequential API calls
2. **Check network tab** - See if multiple requests are firing at once
3. **Clear browser cache** - Old code might still be running
4. **Wait 15 minutes** - Rate limit window will reset
5. **Contact admin** - If legitimate usage is still hitting limits

The rate limit is now set to a reasonable level that should handle normal usage without issues! 🎉

