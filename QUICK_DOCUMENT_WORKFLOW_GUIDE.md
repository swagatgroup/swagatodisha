# Quick Document Approval Workflow Guide

## 🎯 Quick Reference

### For Admin/Staff: How to Review Documents

1. **Go to Application Review** (Dashboard)
2. **Click on an application** with submitted documents
3. **For each document:**
   - Click **Preview** to view in modal
   - Click **View** to open in new tab
   - Click **Approve** if valid
   - Click **Reject** + add remarks if invalid
4. **Click "Submit Document Reviews"**
5. **Done!** ✅

#### Required Fields
- ❌ **Rejection MUST have remarks**
- ✅ Approval remarks optional

#### Quick Actions
- **"Approve All"** - Approve all pending docs
- **Quick reject reasons** - Pre-filled rejection templates

---

### For Agents: How to Handle Rejected Documents

1. **Go to Application Status** (Dashboard)
2. **See "⚠️ Action Required"** if documents rejected
3. **Find rejected document** (red background)
4. **Read rejection reason** (tells you what's wrong)
5. **Click "Reupload" button**
6. **Select corrected file**
7. **Done!** Status resets to PENDING ✅

---

## 📊 Visual Status Guide

### Status Colors

| Status | Color | Icon | Meaning |
|--------|-------|------|---------|
| APPROVED | 🟢 Green | ✓ | Document accepted |
| REJECTED | 🔴 Red | ✗ | Needs reupload |
| PENDING | 🟡 Yellow | ⏳ | Awaiting review |

### Document Cards (Agent View)

**Approved Document:**
```
┌───────────────────────────────────┐
│ 📄 passport_photo 👁️  ✓ APPROVED │
│ ─────────────────────────────────  │
│ Review Note: Clear and valid      │
│ (Green Background)                 │
└───────────────────────────────────┘
```

**Rejected Document:**
```
┌───────────────────────────────────┐
│ 📄 aadhar_card 👁️     ✗ REJECTED │
│                        [Reupload] │
│ ─────────────────────────────────  │
│ Rejection Reason: Blurry image,   │
│ please upload clear high-quality  │
│ scan                               │
│ (Red Background)                   │
└───────────────────────────────────┘
```

**Pending Document:**
```
┌───────────────────────────────────┐
│ 📄 10th_marksheet 👁️  ⏳ PENDING │
│ (Gray Background)                  │
└───────────────────────────────────┘
```

---

## 🔄 Complete Workflow

```
┌─────────────────────────────────────────────────┐
│ 1. Agent Submits Application with Documents    │
└─────────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────────┐
│ 2. Staff Reviews in Application Review         │
│    - View each document                         │
│    - Approve or Reject with remarks             │
└─────────────────────────────────────────────────┘
                    ↓
         ┌──────────┴──────────┐
         ↓                     ↓
┌──────────────────┐  ┌──────────────────┐
│ APPROVED         │  │ REJECTED         │
│ (Move forward)   │  │ (Needs reupload) │
└──────────────────┘  └──────────────────┘
                               ↓
                    ┌──────────────────────┐
                    │ 3. Agent Sees        │
                    │    Rejection Reason  │
                    │    + Reupload Button │
                    └──────────────────────┘
                               ↓
                    ┌──────────────────────┐
                    │ 4. Agent Reuploads   │
                    │    Corrected Doc     │
                    └──────────────────────┘
                               ↓
                    ┌──────────────────────┐
                    │ 5. Status → PENDING  │
                    │    (Review again)    │
                    └──────────────────────┘
```

---

## 💡 Tips & Best Practices

### For Staff/Admin

✅ **Be Specific** - Clear rejection reasons help agents fix issues faster  
✅ **Use Templates** - Quick reject buttons for common issues  
✅ **Check Quality** - Verify documents are readable and valid  
✅ **Review All** - Don't leave documents in pending unnecessarily  

**Good Rejection Reasons:**
- "Blurry image, please upload clear high-quality scan"
- "Document expired, please upload current version"
- "Wrong document uploaded, expected 10th marksheet"

**Bad Rejection Reasons:**
- "Not good" ❌ (Not specific)
- "Rejected" ❌ (No reason given)
- "" ❌ (Empty - system prevents this)

### For Agents

✅ **Read Carefully** - Rejection reason tells you exactly what to fix  
✅ **Upload Quality** - Use clear, high-resolution scans  
✅ **Correct Document** - Make sure it's the right document type  
✅ **Check Before Upload** - Review file before reuploading  

**Common Rejection Reasons & Fixes:**
| Reason | Fix |
|--------|-----|
| "Blurry image" | Use scanner or good camera in bright light |
| "Document expired" | Upload current/valid document |
| "Wrong document" | Upload the correct document type |
| "Incomplete" | Upload complete document (all pages) |

---

## 🚨 Troubleshooting

### Issue: Can't see documents
**Solution:** Refresh browser (Ctrl + Shift + R)

### Issue: Reupload button not working
**Solution:**
1. Check file size (max 10MB)
2. Check file type (PDF, JPG, PNG only)
3. Try again or refresh page

### Issue: Document not opening when clicked
**Solution:**
1. Check browser console (F12)
2. Verify URL in console log
3. Check if file exists on server

### Issue: Status not updating after reupload
**Solution:**
1. Wait a few seconds
2. Refresh the application list
3. Check if upload succeeded

---

## 📱 Summary Counts

At the bottom of Documents Status, you'll see:

```
Total: 5  ✓ 3 Approved  ✗ 1 Rejected  ⏳ 1 Pending
```

This shows:
- **Total:** How many documents uploaded
- **✓ Approved:** Count of approved docs
- **✗ Rejected:** Count of rejected docs (need reupload)
- **⏳ Pending:** Count awaiting review

---

## ⚡ Quick Actions

### Admin/Staff - Bulk Actions

**Approve All Pending:**
- Click "Approve All" button
- All pending docs → APPROVED
- Fast for when all docs are valid

**Reject All with Reason:**
- Click pre-filled reason button
- Applies same reason to all pending
- Use for common issues

### Agent - Quick Reupload

**Single Click Upload:**
1. Click "Reupload" on rejected doc
2. File picker opens
3. Select file
4. Auto-uploads
5. Done! ✅

---

## 🎓 Example Scenarios

### Scenario 1: All Documents Good
```
Staff Action: Review all docs → Click "Approve All"
Result: Application moves to UNDER_REVIEW status
Agent View: All docs show ✓ APPROVED (green)
```

### Scenario 2: One Document Bad
```
Staff Action: Approve good docs → Reject bad doc with reason
Result: Application stays SUBMITTED, needs attention
Agent View: 
  - Good docs: ✓ APPROVED (green)
  - Bad doc: ✗ REJECTED (red) with "Reupload" button
Agent Action: Click "Reupload" → Upload corrected file
Result: Status → PENDING, waits for staff review
```

### Scenario 3: All Documents Bad
```
Staff Action: Reject all with specific reasons
Result: Application flagged for complete document reupload
Agent View: All docs RED + "⚠️ Action Required" banner
Agent Action: Reupload all rejected docs one by one
Result: All reset to PENDING, staff reviews again
```

---

## ✅ Success Indicators

### You Know It's Working When:

**Admin/Staff:**
- ✅ Can see documents in Application Review
- ✅ Approve/Reject buttons work
- ✅ "Submit Document Reviews" succeeds
- ✅ Status updates in application list
- ✅ Counts update (Approved/Rejected/Pending)

**Agent:**
- ✅ See color-coded document cards
- ✅ Rejection reasons displayed
- ✅ "⚠️ Action Required" shows when needed
- ✅ Reupload button clickable
- ✅ File upload succeeds
- ✅ Status changes to PENDING after upload

---

## 🎉 You're Ready!

Just **refresh your browser** and the new document workflow is active!

**Have questions?** Check the detailed guide:  
📄 `DOCUMENT_APPROVAL_REJECTION_WORKFLOW.md`

---

**Last Updated:** 2025-10-28  
**Quick Reference Card**

