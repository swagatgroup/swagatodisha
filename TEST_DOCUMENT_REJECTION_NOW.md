# Test Document Rejection Workflow - Right Now!

## 🎯 Quick Test Guide

Follow these steps to test the document rejection workflow immediately.

---

## 📋 Prerequisites

You need:
- ✅ Staff/Admin account (to reject documents)
- ✅ Agent account (to see rejections and reupload)
- ✅ Application with documents already submitted

---

## 🧪 Test Steps

### **PART 1: Staff Rejects Document** (3 minutes)

1. **Login as Staff/Admin**
   ```
   http://localhost:5173/login
   Role: staff or super_admin
   ```

2. **Go to Application Review**
   - Dashboard → Application Review tab
   - Look for "Not Reviewed" tab (documents not reviewed yet)

3. **Select an Application**
   - Click on an application with documents
   - You'll see document list on the right side

4. **Reject a Document**
   - Find a document (e.g., "passport_photo")
   - Click **"Reject"** button
   - Remarks textarea appears (RED border if empty)
   - Type: **"Test rejection - please reupload clear image"**

5. **Submit Review**
   - Click **"Submit Document Reviews"** button
   - **Expected:** Success message appears
   - **Expected:** Document now shows rejected status

6. **Verify in Console (F12)**
   ```
   ✅ Documents reviewed successfully
   ```

7. **Note the Application ID** (e.g., APP25920560)

---

### **PART 2: Agent Sees Rejection** (2 minutes)

1. **Login as Agent**
   ```
   http://localhost:5173/login
   Email: Use the agent who submitted this application
   ```

2. **Go to Application Status**
   - Dashboard → Application Status tab

3. **Find the Application**
   - Look for the application ID you noted (APP25920560)
   - Click on it

4. **Click "Refresh" Button**
   - **IMPORTANT:** Click the blue "Refresh" button
   - Location: Top right, next to status badge
   - 🔄 Icon with "Refresh" text

5. **Check Browser Console (F12)**
   ```
   🔄 Refreshing application data...
   🔍 Fetching application details for: APP25920560
   ✅ Application details loaded
   📋 Document Statuses:
     - passport_photo: REJECTED (Test rejection...)
   ```

6. **Check Documents Status Section**
   
   **You should see:**
   
   ```
   Documents Status          ⚠️ Action Required
   
   [RED CARD]
   📄 passport_photo 👁️              ✗ REJECTED
                                        [Reupload]
   Rejection Reason: Test rejection - please reupload clear image
   
   Summary: Total: 2  ✓ 0 Approved  ✗ 1 Rejected  ⏳ 1 Pending
   ```

---

### **PART 3: Agent Reuploads** (1 minute)

1. **Click "Reupload" Button**
   - On the rejected document (RED card)
   - File picker opens

2. **Select a File**
   - Choose any test image/PDF
   - File should be clear and valid

3. **Wait for Upload**
   - Progress indicator shows
   - Success message: "Document uploaded successfully! Status reset to PENDING for review."

4. **Verify Changes**
   
   **Expected:**
   - Card changes from RED to GRAY
   - Status changes from "✗ REJECTED" to "⏳ PENDING"
   - Rejection reason disappears
   - "Reupload" button disappears
   - Summary updates: "✗ 0 Rejected  ⏳ 2 Pending"

5. **Check Console**
   ```
   📤 Starting upload...
   ✅ Upload response: {success: true}
   ✅ Document saved to state
   🔄 Refreshing application details after upload...
   ```

---

### **PART 4: Staff Reviews Again** (1 minute)

1. **Login as Staff** again

2. **Go to Application Review**

3. **Select the same application**

4. **Verify:**
   - Document shows "⏳ PENDING" status (not rejected anymore)
   - Can review the new document
   - Old rejection remarks are cleared

5. **Approve the document** this time
   - Click "Approve"
   - Click "Submit Document Reviews"

6. **Agent refreshes and sees:**
   - Document in GREEN card
   - Status: "✓ APPROVED"

---

## 🔍 What to Check If Not Working

### Symptom: Rejection not showing in agent view

**Possible Causes:**

1. **❌ Didn't click Refresh**
   - Solution: Click the "Refresh" button in agent view

2. **❌ Wrong Application**
   - Solution: Verify application ID matches

3. **❌ Wrong Agent Account**
   - Solution: Login as the agent who submitted it

4. **❌ Backend Cache**
   - Solution: Restart backend server

5. **❌ Frontend Cache**
   - Solution: Hard refresh browser (Ctrl+Shift+R)

6. **❌ Rejection didn't save**
   - Solution: Check staff view - is document rejected there?
   - If not: Try rejecting again

---

### Symptom: Reupload button not working

**Possible Causes:**

1. **❌ File size too large**
   - Solution: Use file < 10MB

2. **❌ Wrong file type**
   - Solution: Use PDF, JPG, or PNG only

3. **❌ Application not loaded**
   - Solution: Click on application first

4. **❌ Network error**
   - Solution: Check backend is running

---

### Symptom: Status shows SUBMITTED not UNDER_REVIEW

**This is NORMAL!**  

Application status logic:
- If **ALL** docs approved → Status: UNDER_REVIEW
- If **ANY** doc rejected → Status: SUBMITTED (stay here)
- If **ALL** docs pending → Status: SUBMITTED

So having one rejected document keeps status as "SUBMITTED" until agent reuploads and ALL docs are approved.

---

## 📊 Console Debugging

### Enable Detailed Logging

Open browser console (F12) and run:

```javascript
// See all API requests
localStorage.setItem('debug', 'true');

// Refresh the page
location.reload();
```

### Check API Response

In console, look for:

```javascript
🌐 API Response - URL: /api/agents/submitted-applications/APP25920560
Status: 200

// Click the response to see full data
// Check: data.documents[].status
```

---

## ✅ Success Checklist

After following all steps, you should have:

- [x] Staff rejected a document with remarks
- [x] Rejection shows in staff's view (RED badge)
- [x] Agent clicked "Refresh" button
- [x] Rejection shows in agent's view (RED card)
- [x] Rejection reason displayed to agent
- [x] "Reupload" button visible
- [x] Agent reuploaded document successfully
- [x] Status changed to PENDING
- [x] Staff can review new document

---

## 🚀 Quick Fix for Your Current Issue

**Right now, do this:**

1. **As Agent:**
   - Go to Application Status
   - Select your application
   - Click the blue **"Refresh" button** (top right)
   - Check if rejection appears now

2. **If still not showing:**
   - Open console (F12)
   - Copy all console logs
   - Check what status is shown in logs
   - Verify the document status in the logs

3. **Expected console output:**
   ```
   📋 Document Statuses:
     - passport_photo: REJECTED (Test rejection...)
   ```

4. **If console shows REJECTED but UI doesn't:**
   - Hard refresh browser (Ctrl+Shift+R)
   - Code might not be updated in browser

5. **If console shows PENDING not REJECTED:**
   - Rejection didn't save
   - Staff needs to reject again

---

## 📝 Report Template

If still not working, provide this info:

```
Application ID: ________________
Agent Email: ________________
Staff Email: ________________
Document Type Rejected: ________________

Console Output (after clicking Refresh):
[Paste console logs here]

Network Response:
[Paste /api/agents/submitted-applications response]

Screenshot: [Attach screenshot of agent view]
```

---

## 🎉 Expected Final Result

After all fixes and refreshes:

**Agent View:**
```
┌─────────────────────────────────────────────┐
│ John Doe                        SUBMITTED   │
│ john.doe@example.com           [Refresh]   │
│ Application ID: APP25920560                 │
├─────────────────────────────────────────────┤
│ Documents Status    ⚠️ Action Required      │
│                                              │
│ ┌─────────────────────────────────────────┐ │
│ │ 📄 passport_photo 👁️    ✗ REJECTED     │ │
│ │                          [Reupload]      │ │
│ │ Rejection Reason: Blurry image, please  │ │
│ │ upload clear high-quality scan           │ │
│ └─────────────────────────────────────────┘ │
│                                              │
│ Total: 2  ✓ 0 Approved  ✗ 1 Rejected        │
└─────────────────────────────────────────────┘
```

---

**First Step:** Click the "Refresh" button in agent view now! 🔄

**Status:** Ready to test

