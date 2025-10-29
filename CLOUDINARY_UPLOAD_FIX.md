# Cloudinary Document Upload Fix

## Issue
When reuploading documents, the old Cloudinary link was not being replaced, leading to:
- Old images remaining in Cloudinary (wasting storage)
- Documents showing local file paths instead of Cloudinary URLs
- Inconsistent storage between local and cloud

## Solution

### Backend: `documentController.js`

#### 1. Added Cloudinary Configuration
```javascript
const cloudinary = require('cloudinary').v2;

// Configure Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});
```

#### 2. Enhanced Upload Logic

**Complete Flow:**

1. **Find Old Document**
```javascript
const oldDocument = application.documents.find(
    doc => doc.documentType === documentType
);
```

2. **Delete Old Cloudinary File (if exists)**
```javascript
if (oldDocument && oldDocument.cloudinaryPublicId) {
    console.log('🗑️ Deleting old Cloudinary document:', oldDocument.cloudinaryPublicId);
    try {
        await cloudinary.uploader.destroy(oldDocument.cloudinaryPublicId);
        console.log('✅ Old document deleted from Cloudinary');
    } catch (deleteError) {
        console.warn('⚠️ Failed to delete old Cloudinary document:', deleteError.message);
    }
}
```

3. **Upload New File to Cloudinary**
```javascript
console.log('☁️ Uploading to Cloudinary...');
cloudinaryResult = await cloudinary.uploader.upload(file.path, {
    folder: `swagat-odisha/documents/${application.applicationId}`,
    resource_type: 'auto', // Supports images, PDFs, etc.
    public_id: `${documentType.replace(/\s+/g, '_')}_${Date.now()}`
});
console.log('✅ Uploaded to Cloudinary:', cloudinaryResult.secure_url);
```

4. **Delete Local Temporary File**
```javascript
// Delete local file after successful Cloudinary upload
fs.unlinkSync(file.path);
```

5. **Save Document Data with Cloudinary Info**
```javascript
const documentData = {
    documentType: documentType,
    fileName: file.originalname,
    filePath: cloudinaryResult.secure_url, // Cloudinary URL
    storageType: 'cloudinary',
    cloudinaryPublicId: cloudinaryResult.public_id, // For future deletion
    fileSize: cloudinaryResult.bytes || file.size,
    mimeType: file.mimetype,
    status: 'PENDING',
    uploadedAt: new Date()
};
```

6. **Replace Old Document in Database**
```javascript
// Remove old document
application.documents = application.documents.filter(
    doc => doc.documentType !== documentType
);

// Add new document
application.documents.push(documentData);
await application.save();
```

7. **Return Success Response**
```javascript
return res.status(201).json({
    success: true,
    message: 'Document uploaded successfully to cloud storage',
    data: {
        url: cloudinaryResult.secure_url,
        filePath: cloudinaryResult.secure_url,
        fileName: file.originalname,
        documentType: documentType,
        fileSize: cloudinaryResult.bytes || file.size,
        mimeType: file.mimetype,
        status: 'PENDING',
        cloudinaryPublicId: cloudinaryResult.public_id,
        storageType: 'cloudinary'
    }
});
```

## Benefits

✅ **Cloud Storage:** All documents stored in Cloudinary (CDN, fast access worldwide)  
✅ **Old File Deletion:** Old Cloudinary files automatically deleted (saves storage costs)  
✅ **No Local Storage:** Temporary files deleted after Cloudinary upload  
✅ **Consistent URLs:** All documents have Cloudinary HTTPS URLs  
✅ **Better Performance:** CDN delivery is faster than server static files  
✅ **Automatic Format:** Cloudinary auto-detects file type (images, PDFs)  
✅ **Scalable:** No disk space issues on server  

## Document URL Format

### Before (Local Storage)
```
/uploads/documents/bb38c44a-244f-4dcd-a8f8-df8ab9109857-1761662360330.png
```

### After (Cloudinary)
```
https://res.cloudinary.com/YOUR_CLOUD_NAME/image/upload/v1704196800/swagat-odisha/documents/APP25974541/passport_photo_1704196800123.png
```

## Testing Guide

### Test 1: Initial Document Upload

1. **Login as Agent**
2. **Upload a document** (e.g., Aadhar Card)
3. **Check console:**
   ```
   📤 Starting upload...
   ☁️ Uploading to Cloudinary...
   ✅ Uploaded to Cloudinary: https://res.cloudinary.com/.../...
   ✅ Document saved!
   📄 Document data: {
       filePath: "https://res.cloudinary.com/.../...",
       storageType: "cloudinary",
       cloudinaryPublicId: "swagat-odisha/documents/..."
   }
   ```

4. **✅ Verify:**
   - Upload succeeds
   - URL is Cloudinary HTTPS URL
   - `storageType` is `cloudinary`
   - `cloudinaryPublicId` is saved

### Test 2: Document Reupload (Replace)

1. **Have an existing document**
2. **Click "Reupload"** and select new file
3. **Check console:**
   ```
   🗑️ Deleting old Cloudinary document: swagat-odisha/documents/APP25974541/passport_photo_1704196700
   ✅ Old document deleted from Cloudinary
   ☁️ Uploading to Cloudinary...
   ✅ Uploaded to Cloudinary: https://res.cloudinary.com/.../NEW_FILE
   ✅ Document saved! Before: 5, After: 5
   ```

4. **✅ Verify:**
   - Old Cloudinary file deleted
   - New file uploaded
   - New Cloudinary URL different from old one
   - Document count stays same (replaced, not added)

5. **Check Cloudinary Dashboard:**
   - Go to https://cloudinary.com/console
   - Navigate to Media Library
   - Search for folder: `swagat-odisha/documents/`
   - ✅ Only latest version exists (old one deleted)

### Test 3: View/Preview Cloudinary Document

1. **Go to Application Review** (Staff view)
2. **Click "Preview" or "View"** on any document
3. **✅ Verify:**
   - Document loads from Cloudinary CDN
   - Fast loading (CDN delivery)
   - Works from anywhere (no local server dependency)
   - HTTPS secure connection

### Test 4: Multiple Document Types

**Upload each document type:**
- Images (JPG, PNG) → Cloudinary image URL
- PDFs → Cloudinary raw URL
- Other documents → Cloudinary auto URL

**For each:**
1. Upload
2. Check URL format
3. Verify displays correctly
4. Reupload and confirm old version deleted

### Test 5: Error Handling

**Test Cloudinary Upload Failure:**

1. **Temporarily set wrong Cloudinary credentials**
2. **Try to upload**
3. **✅ Verify:**
   - Error message: "Failed to upload document to cloud storage"
   - Local file not saved
   - Database not updated
   - User sees error notification

## Console Output Examples

### Successful Upload
```
📤 Starting upload: { docKey: "passport_photo", fileName: "photo.png", ... }
📤 FormData prepared, sending to /api/documents/upload
✅ Application found: 65a1b2c3d4e5f6789012345
📋 Current documents count: 4
☁️ Uploading to Cloudinary...
✅ Uploaded to Cloudinary: https://res.cloudinary.com/YOUR_CLOUD/image/upload/v1704196800/swagat-odisha/documents/APP25974541/passport_photo_1704196800123.png
✅ Document saved! Before: 4, After: 5
📄 Document data: {
    documentType: "passport_photo",
    fileName: "photo.png",
    filePath: "https://res.cloudinary.com/YOUR_CLOUD/image/upload/...",
    storageType: "cloudinary",
    cloudinaryPublicId: "swagat-odisha/documents/APP25974541/passport_photo_1704196800123",
    fileSize: 234567,
    mimeType: "image/png",
    status: "PENDING"
}
```

### Successful Reupload (Replace)
```
✅ Application found: 65a1b2c3d4e5f6789012345
📋 Current documents count: 5
🗑️ Deleting old Cloudinary document: swagat-odisha/documents/APP25974541/passport_photo_1704196700000
✅ Old document deleted from Cloudinary
☁️ Uploading to Cloudinary...
✅ Uploaded to Cloudinary: https://res.cloudinary.com/YOUR_CLOUD/image/upload/v1704196900/swagat-odisha/documents/APP25974541/passport_photo_1704196900456.png
✅ Document saved! Before: 5, After: 5 [COUNT STAYS SAME - REPLACED]
📄 Document data: { ... NEW DATA ... }
```

### Upload Error (Cloudinary Failure)
```
☁️ Uploading to Cloudinary...
❌ Cloudinary upload failed: Error: Invalid credentials
{
    success: false,
    message: "Failed to upload document to cloud storage",
    error: "Invalid credentials"
}
```

## Environment Variables Required

Make sure these are set in your `.env` file:

```env
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

**To Get These:**
1. Go to https://cloudinary.com/
2. Sign up / Login
3. Go to Dashboard
4. Copy: Cloud name, API Key, API Secret
5. Add to `.env` file

## Cloudinary Folder Structure

```
swagat-odisha/
└── documents/
    ├── APP25974541/
    │   ├── Aadhar_Card_1704196800123.pdf
    │   ├── passport_photo_1704196800456.png
    │   └── 10th_Marksheet_1704196800789.pdf
    ├── APP25974542/
    │   ├── Aadhar_Card_1704196900123.pdf
    │   └── passport_photo_1704196900456.jpg
    └── ...
```

**Benefits:**
- Organized by application ID
- Easy to find specific application's documents
- Auto-cleanup when deleting old versions

## Migration from Local to Cloudinary

If you have existing documents in local storage, you can migrate them:

1. **Read existing document from local storage**
2. **Upload to Cloudinary**
3. **Update database with Cloudinary URL**
4. **Delete local file**

*This can be done with a migration script if needed.*

## Troubleshooting

### Upload Fails with Cloudinary Error
**Check:**
1. Environment variables set correctly
2. Cloudinary account active
3. API credentials valid
4. Internet connection working

### Old Files Not Being Deleted
**Check:**
1. `cloudinaryPublicId` is saved in database
2. Console shows deletion attempt
3. Cloudinary credentials have delete permission

### Files Still Showing Local Paths
**Check:**
1. Code changes deployed
2. Server restarted
3. New uploads using updated code
4. Database documents have `storageType: 'cloudinary'`

## Summary

✅ **Cloudinary Integration:** All uploads go to cloud storage  
✅ **Old File Deletion:** Previous versions automatically removed  
✅ **Clean Storage:** No orphaned files in Cloudinary  
✅ **Fast Delivery:** CDN ensures quick loading worldwide  
✅ **Scalable:** No server disk space concerns  
✅ **Secure:** HTTPS URLs with Cloudinary's security  
✅ **Organized:** Folder structure by application ID  
✅ **Cost-Effective:** Only current versions stored  

Document uploads now properly use Cloudinary with automatic old file cleanup! 🎉

