# Document Reupload & Status Display Fix

## What's Fixed

### ✅ 1. Document Reupload Replaces Old Link
**How it works:**
- Backend automatically removes the old document when you upload a new one
- Only keeps the latest version
- Previous document link is completely replaced
- No duplicates created

**Backend Code (Already Working):**
```javascript
// Remove existing document of same type if exists
application.documents = application.documents.filter(
    doc => doc.documentType !== documentType
);
// Add new document
application.documents.push(newDocumentData);
```

### ✅ 2. Status Display After Reupload
**Status Flow:**
1. **Initial Upload:** Document status = `PENDING` (Yellow badge)
2. **After Staff Review:**
   - Approved → Status = `APPROVED` (Green badge)
   - Rejected → Status = `REJECTED` (Red badge)
3. **After Reupload:** Status resets to `PENDING` (Yellow badge)
4. **After Re-review:** Status updates again to `APPROVED` or `REJECTED`

### ✅ 3. Enhanced Visual Feedback

#### **More Prominent Status Badges**
- **APPROVED:** Green badge with white text (bg-green-500)
- **REJECTED:** Red badge with white text (bg-red-500)
- **PENDING:** Yellow badge with white text (bg-yellow-500)
- All badges are bold, uppercase, with shadow

#### **Document Information Display**
Each document now shows:
- **Document Type** (clickable to view)
- **Upload Timestamp:** When it was uploaded
- **Status Badge:** Current status (APPROVED/REJECTED/PENDING)
- **Review Timestamp:** When it was reviewed (if applicable)
- **Remarks:** Approval notes or rejection reasons
- **Reupload Button:** Only visible for rejected documents

#### **Color-Coded Cards**
- Rejected documents: Red background
- Approved documents: Green background
- Pending documents: Gray background

## Changes Made

### Frontend: `AgentApplicationStatus.jsx`

#### 1. Enhanced Success Message
```javascript
showSuccess(`✅ ${docKey} uploaded successfully! Previous document replaced. Status: PENDING (awaiting review)`);
```

#### 2. Better Logging
```javascript
console.log('📄 Uploaded document data:', uploadedDocData);
console.log(`✅ ${docKey} saved - Status reset to PENDING`);
console.log('✅ Upload complete - UI refreshed with latest data');
```

#### 3. Upload Timestamp Display
```javascript
{doc.uploadedAt && (
    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
        📅 Uploaded: {new Date(doc.uploadedAt).toLocaleString()}
    </p>
)}
```

#### 4. Enhanced Status Badge
```javascript
<span className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wide shadow-sm ${
    isApproved ? 'bg-green-500 text-white dark:bg-green-600' :
    isRejected ? 'bg-red-500 text-white dark:bg-red-600' :
    'bg-yellow-500 text-white dark:bg-yellow-600'
}`}>
    {isApproved ? '✓ APPROVED' : isRejected ? '✗ REJECTED' : '⏳ PENDING'}
</span>
```

#### 5. Review Timestamp Display
```javascript
{doc.reviewedAt && (
    <span className="text-xs text-gray-500 dark:text-gray-400">
        {new Date(doc.reviewedAt).toLocaleDateString()}
    </span>
)}
```

#### 6. Context-Aware Remarks
```javascript
<strong>
    {isRejected ? '⚠️ Rejection Reason: ' : 
     isApproved ? '✓ Approval Note: ' : 
     'Review Note: '}
</strong>
{doc.remarks}
```

## Complete Workflow Example

### Scenario: Agent Uploads → Staff Rejects → Agent Reuploads → Staff Approves

**Step 1: Agent Uploads Aadhar Card**
```
Status: ⏳ PENDING
Badge: Yellow
Message: "Awaiting review"
```

**Step 2: Staff Reviews and Rejects**
```
Status: ✗ REJECTED
Badge: Red (prominent)
Card: Red background
Remarks: "⚠️ Rejection Reason: Image is blurry, please upload clear scan"
Reupload Button: Visible
```

**Step 3: Agent Clicks Reupload**
```
1. Selects new file
2. Upload progress shows 0% → 100%
3. Success message: "✅ Aadhar Card uploaded successfully! Previous document replaced. Status: PENDING (awaiting review)"
4. Old document link is completely replaced
5. Status changes: REJECTED → PENDING
6. Badge changes: Red → Yellow
7. Remarks are cleared
8. Reupload button disappears (only shows for REJECTED)
9. UI refreshes automatically
```

**Step 4: Staff Reviews Again and Approves**
```
Status: ✓ APPROVED
Badge: Green (prominent)
Card: Green background
Remarks: "✓ Approval Note: Clear and verified"
Review Date: Shows when approved
```

## Testing Instructions

### Test 1: Document Reupload Replaces Link

1. **Login as Agent**
2. **Find a submitted application**
3. **Check current document:**
   - Note the current document URL (right-click → Copy Link Address)
   - Example: `/uploads/documents/aadhar-1234567890.pdf`

4. **Have it rejected by staff** (if not already rejected)
   - Login as staff
   - Go to Application Review
   - Reject a document with remarks: "Please reupload"

5. **Login back as Agent**
6. **Reupload the document:**
   - Click "Reupload" button on rejected document
   - Select a new file
   - Wait for upload to complete

7. **✅ Verify:**
   - Success message shows: "Previous document replaced"
   - Click on document name to open
   - Check URL - it should be DIFFERENT from step 3
   - Example: `/uploads/documents/aadhar-9876543210.pdf`
   - Old link no longer works (404 or shows different document)

### Test 2: Status Updates After Reupload

1. **After reuploading (from Test 1)**

2. **✅ Verify:**
   - Status badge shows: `⏳ PENDING` (Yellow)
   - NOT `✗ REJECTED` (Red)
   - Reupload button disappears
   - Upload timestamp updates to current time

3. **Refresh the page (F5)**

4. **✅ Verify:**
   - Status still shows `⏳ PENDING`
   - Changes persist after refresh

### Test 3: Approved Status Display

1. **Login as Staff/Admin**
2. **Go to Application Review**
3. **Approve a document:**
   - Click "Approve" button
   - Add remarks: "Document verified"
   - Click "Submit Document Reviews"
   - Confirm in dialog

4. **Login as Agent**
5. **View the application**

6. **✅ Verify:**
   - Status badge shows: `✓ APPROVED` (Green, prominent)
   - Card has green background
   - Remarks show: "✓ Approval Note: Document verified"
   - Review date is displayed
   - No "Reupload" button (only for rejected docs)

7. **Refresh page**

8. **✅ Verify:**
   - Approved status persists
   - All information still displayed correctly

### Test 4: Visual Elements

**Check Document Card Shows:**
- ✅ Document type name (clickable)
- ✅ Eye icon for viewing
- ✅ Upload timestamp (📅 Uploaded: ...)
- ✅ Status badge (APPROVED/REJECTED/PENDING)
- ✅ Review timestamp (if reviewed)
- ✅ Remarks (if any) with appropriate emoji/label
- ✅ Reupload button (only for REJECTED)

**Check Status Badge Appearance:**
- ✅ APPROVED: Green background, white text, bold
- ✅ REJECTED: Red background, white text, bold
- ✅ PENDING: Yellow background, white text, bold
- ✅ All badges have shadow effect

**Check Summary Counts:**
- ✅ Total documents count
- ✅ ✓ X Approved (green)
- ✅ ✗ X Rejected (red)
- ✅ ⏳ X Pending (yellow)

### Test 5: Complete Rejection → Reupload → Approval Cycle

1. **Start:** Document is PENDING
   - Badge: Yellow
   - Can view document
   - No reupload button

2. **Staff Rejects:**
   - Badge changes: Yellow → Red
   - Card background: Red
   - Remarks appear with rejection reason
   - Reupload button appears

3. **Agent Reuploads:**
   - Badge changes: Red → Yellow
   - Card background: Red → Gray
   - Remarks disappear
   - Reupload button disappears
   - Upload timestamp updates
   - Document link replaced
   - Success message confirms replacement

4. **Staff Approves:**
   - Badge changes: Yellow → Green
   - Card background: Green
   - Remarks appear with approval note
   - Review date shows
   - No reupload button

5. **✅ Verify at each step:**
   - Refresh page - changes persist
   - Document link works correctly
   - Status display is accurate

## Console Output Examples

### When Reuploading Document
```
📤 Starting upload: { docKey: "Aadhar Card", fileName: "new-aadhar.pdf", ... }
📤 FormData prepared, sending to /api/documents/upload
✅ Upload response: { success: true, data: { ... } }
📄 Uploaded document data: { filePath: "/uploads/documents/...", status: "PENDING" }
✅ Aadhar Card saved - Status reset to PENDING
🔄 Refreshing application details after upload...
🔄 Refreshing applications list...
✅ Upload complete - UI refreshed with latest data
```

### When Viewing Application Details
```
🔍 Fetching application details for: APP25974541
✅ Application details loaded
📄 Documents: Array(5)
📊 Review Status: { documentCounts: { ... } }
📋 Document Statuses:
  - Aadhar Card: PENDING (uploaded 2 minutes ago)
  - 10th Marksheet: APPROVED (Clear copy verified)
  - Passport: REJECTED (Expired, please upload current passport)
```

## Summary

✅ **Document Replacement:** Old link is completely replaced when reuploading  
✅ **Status Reset:** Reupload sets status back to PENDING  
✅ **Approval Display:** Approved documents show with prominent green badge  
✅ **Visual Clarity:** Enhanced badges, timestamps, and remarks  
✅ **Persistence:** All changes save to database and persist after refresh  
✅ **User Feedback:** Clear success messages explain what happened  
✅ **Automatic Refresh:** UI updates immediately without manual refresh  

## Quick Reference: Document Status Colors

| Status | Badge Color | Background | Text | Reupload? |
|--------|------------|------------|------|-----------|
| PENDING | Yellow (bg-yellow-500) | Gray | White | No |
| APPROVED | Green (bg-green-500) | Green | White | No |
| REJECTED | Red (bg-red-500) | Red | White | Yes |

The complete document workflow is now fully functional with clear visual feedback! 🎉

