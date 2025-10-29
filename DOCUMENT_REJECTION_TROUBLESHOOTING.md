# Document Rejection Not Showing - Troubleshooting Guide

## 🔴 Issue

Staff rejected a document, but it's not showing as rejected in the agent view.

---

## 🔍 Diagnostic Steps

### Step 1: Verify Staff Rejection Was Successful

**In Staff/Admin view:**

1. Open **Application Review**
2. Select the application
3. Check the document - does it show **"✗ REJECTED"** status?
4. Check browser console (F12) - any errors?

**Expected:** Document should show RED badge with "REJECTED" status

---

### Step 2: Check Backend Data

**Test via API:**

```bash
# Replace with your actual application ID
GET /api/student-application/APP25920560/review
Authorization: Bearer <staff_token>
```

**Check the response:**

```json
{
  "success": true,
  "data": {
    "applicationId": "APP25920560",
    "documents": [
      {
        "documentType": "passport_photo",
        "status": "REJECTED",  ← Should be REJECTED
        "remarks": "Blurry image...",  ← Should have remarks
        "fileName": "photo.jpg",
        "filePath": "/uploads/documents/xyz.jpg"
      }
    ],
    "reviewStatus": {
      "documentCounts": {
        "rejected": 1  ← Should be > 0
      }
    }
  }
}
```

**If data is correct in backend:**  
✅ Backend is working correctly  
❌ Frontend not refreshing or not displaying correctly

**If data is NOT correct:**  
❌ Staff rejection didn't save properly  
➡️ Try rejecting again with remarks

---

### Step 3: Check Agent View Data Fetching

**In Agent view:**

1. Open browser console (F12)
2. Go to **Application Status**
3. Click on the application
4. Look for console logs:

```javascript
🔍 Fetching application details for: APP25920560
✅ Application details loaded
📄 Documents: [Array]
📊 Review Status: {Object}
📋 Document Statuses:
  - passport_photo: REJECTED (Blurry image...)  ← Should show this
```

**If you DON'T see rejection in console:**
❌ Data not being returned by backend for agent endpoint  
➡️ Backend permission issue

**If you DO see rejection in console:**
❌ Frontend display issue  
➡️ Component not rendering correctly

---

### Step 4: Force Refresh in Agent View

**Manual Refresh:**

1. In agent view, select the application
2. Click the **"Refresh" button** (top right, next to status badge)
3. Watch console for logs
4. Document status should update

**If refresh works:**  
✅ Just needed to refresh  
➡️ Working as designed

**If refresh doesn't work:**  
❌ Endpoint issue or permission problem

---

## 🛠️ Common Fixes

### Fix 1: Clear Browser Cache

```
Windows/Linux: Ctrl + Shift + R
Mac: Cmd + Shift + R
```

Or:
1. Open DevTools (F12)
2. Right-click reload button
3. "Empty Cache and Hard Reload"

### Fix 2: Verify Backend is Updated

```bash
# Restart backend server
cd backend
# Stop server (Ctrl+C)
node server.js
```

### Fix 3: Check Agent Permissions

The agent must be:
- The one who submitted the application (`submittedBy`)
- OR assigned to the application (`assignedAgent`)  
- OR the referrer (`referralInfo.referredBy`)

**Verify in MongoDB:**

```javascript
{
  "applicationId": "APP25920560",
  "submittedBy": ObjectId("...")  ← Should match agent's ID
}
```

---

## 🧪 Complete Test Workflow

### Test 1: Approve/Reject Flow

**As Staff:**

1. Login as staff
2. Go to **Application Review**
3. Select application with documents
4. Click **"Reject"** on one document
5. Add remarks: "Test rejection - please reupload"
6. Click **"Submit Document Reviews"**
7. **Verify:** Success message appears
8. **Verify:** Document shows RED "REJECTED" badge
9. **Check console:** Should show document updated

**As Agent:**

1. Login as agent (same application)
2. Go to **Application Status**
3. Click **"Refresh"** button (top right)
4. **Expected results:**
   - Document shows in **RED card**
   - Status badge: **"✗ REJECTED"**
   - Rejection reason displayed
   - **"Reupload" button** visible
   - **"⚠️ Action Required"** banner at top

**If NOT showing:**
- Check browser console (F12)
- Look for the document status logs
- Verify the application ID matches

---

### Test 2: Reupload Flow

**As Agent:**

1. Find rejected document (RED card)
2. Read rejection reason
3. Click **"Reupload"** button
4. Select corrected file
5. **Expected:**
   - Upload progress shows
   - Success message: "Document uploaded successfully! Status reset to PENDING for review."
   - Document card changes from RED to GRAY
   - Status changes to "⏳ PENDING"
   - Application auto-refreshes

**As Staff:**

1. Go back to **Application Review**
2. Find the same application
3. **Verify:** Document shows "PENDING" status again
4. Can review the new document

---

## 🔍 Debug Commands

### Check Application in Database

```javascript
// In MongoDB or via API
db.studentapplications.findOne({ applicationId: "APP25920560" })

// Look for:
{
  "documents": [
    {
      "documentType": "passport_photo",
      "status": "REJECTED",  ← Should be here
      "remarks": "..."       ← Should have reason
    }
  ]
}
```

### Check Console Logs

**When clicking application in agent view:**

```
🔍 Fetching application details for: APP25920560
👤 Agent ID: 68e0f49640d982b0102ec414
📝 Found application: Yes
✅ Application found: 68fe3e6d8d8ae2eef113155f
✅ Application details loaded
📄 Documents: [
  {
    documentType: "passport_photo",
    status: "REJECTED",
    remarks: "Blurry image...",
    filePath: "/uploads/documents/xyz.jpg"
  }
]
```

**If documents array is empty:**  
❌ No documents in the application  
➡️ Need to upload documents first

**If status is not REJECTED:**  
❌ Rejection didn't save  
➡️ Staff needs to reject again

---

## 🎯 Quick Checklist

Use this to verify the workflow:

### Backend Verification
- [ ] Staff can see documents in Application Review
- [ ] Staff can click "Reject" button
- [ ] Remarks textarea appears and is required
- [ ] "Submit Document Reviews" button works
- [ ] Success message appears
- [ ] Document status in database is "REJECTED"
- [ ] Remarks are saved in database

### Frontend Verification (Agent)
- [ ] Agent can access Application Status
- [ ] Agent can click on application
- [ ] Documents Status section appears
- [ ] Refresh button appears (top right)
- [ ] Clicking refresh logs console messages
- [ ] Rejected document shows RED card
- [ ] Status badge shows "✗ REJECTED"
- [ ] Rejection reason displays
- [ ] "Reupload" button appears
- [ ] "⚠️ Action Required" banner shows

---

## 💡 Important Notes

### Refresh is Key!

The agent view **does NOT auto-update** when staff reviews documents. The agent must:

1. Click the **"Refresh" button** (manually)
2. OR reload the page
3. OR reopen the application

### Status vs Review Status

**Application Status:** Overall status (SUBMITTED, UNDER_REVIEW, etc.)
- Even if one document is rejected, application stays "SUBMITTED"
- Application only moves to "UNDER_REVIEW" when ALL docs approved

**Document Status:** Individual document status (PENDING, APPROVED, REJECTED)
- Each document has its own status
- Independent of overall application status

---

## 🔧 If Still Not Working

### Check Network Requests

1. Open DevTools (F12)
2. Go to **Network** tab
3. Click refresh in agent view
4. Look for: `submitted-applications/APP25920560`
5. Check response - are documents included?

### Check Response Data

Click on the network request, view response:

```json
{
  "success": true,
  "data": {
    "documents": [...]  ← Should have documents
  }
}
```

If documents array is empty or missing status:
❌ Backend not returning correct data

### Verify Agent Access

Agent must have access to this application. Check:

```javascript
// In the application document
{
  "submittedBy": "agent_id",  ← Should match
  // OR
  "referralInfo": {
    "referredBy": "agent_id"  ← Should match
  },
  // OR
  "assignedAgent": "agent_id"  ← Should match
}
```

If none match:  
❌ Agent doesn't have access to this application

---

## ✅ Expected Behavior After Fix

### When Staff Rejects Document

1. Staff clicks "Reject" + adds remarks
2. Clicks "Submit Document Reviews"
3. Success message appears
4. Document shows RED badge in staff view
5. Database updated with status=REJECTED

### When Agent Views Application

1. Agent clicks application (or refreshes)
2. Console logs document statuses
3. Rejected doc shows in RED card
4. Rejection reason displayed
5. "Reupload" button appears
6. "⚠️ Action Required" banner shows

### When Agent Reuploads

1. Agent clicks "Reupload"
2. Selects file
3. Upload completes
4. Status changes to PENDING
5. Card changes from RED to GRAY
6. Application auto-refreshes
7. Staff can review new document

---

## 📞 Still Having Issues?

### Collect Debug Info

1. **Application ID:** `____________`
2. **Agent ID:** `____________`
3. **Rejected document type:** `____________`
4. **Console logs:** (copy from browser console)
5. **Network response:** (copy from Network tab)

### Check These Files Were Updated

- [x] `frontend/src/components/dashboard/tabs/AgentApplicationStatus.jsx`
- [x] `backend/server.js` (static file serving)
- [x] Browser cache cleared
- [x] Backend server restarted

---

## 🎉 Success Indicators

You know it's working when:

✅ Staff can reject documents  
✅ Rejection saves to database  
✅ Agent clicks "Refresh" button  
✅ Console shows rejected status  
✅ RED card appears for rejected doc  
✅ Rejection reason visible  
✅ "Reupload" button clickable  
✅ Reupload works and resets status  

---

**Quick Fix:** Try clicking the **"Refresh" button** in the agent view!

**Location:** Top right, next to the application status badge

---

**Last Updated:** 2025-10-28  
**Status:** Troubleshooting Guide

