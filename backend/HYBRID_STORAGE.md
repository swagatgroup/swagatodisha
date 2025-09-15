# Hybrid Storage System

This document explains the hybrid storage system that uses MongoDB for light files and Cloudflare R2 for heavy documents.

## Overview

The hybrid storage system automatically determines where to store files based on:
- **File size**: Files smaller than 5MB are stored in MongoDB, larger files go to R2
- **File type**: PDFs, Office documents, and archives always go to R2 regardless of size
- **File category**: Images, text files, and JSON files can be stored in MongoDB if small enough

## Storage Strategy

### MongoDB Storage
- **Use case**: Light files, metadata, and frequently accessed small files
- **File types**: Images (JPEG, PNG, GIF, WebP), text files, JSON, CSV
- **Size limit**: 5MB maximum
- **Storage format**: Base64 encoded data URLs
- **Benefits**: Fast access, no external dependencies, included in database backups

### Cloudflare R2 Storage
- **Use case**: Heavy documents, PDFs, Office files, and large files
- **File types**: PDFs, Word docs, Excel files, PowerPoint, ZIP archives
- **Size limit**: 10GB (R2 free tier limit)
- **Storage format**: Binary files with signed URLs for access
- **Benefits**: Cost-effective, scalable, CDN integration

## Configuration

### Environment Variables

Add these to your `.env` file:

```env
# Hybrid Storage Configuration
MONGODB_MAX_SIZE=5242880      # 5MB in bytes
R2_MIN_SIZE=1048576           # 1MB in bytes
MIGRATION_MAX_FILE_SIZE=52428800  # 50MB for migration

# Cloudflare R2 Configuration (already configured)
R2_ACCOUNT_ID=your_account_id
R2_ACCESS_KEY_ID=your_access_key
R2_SECRET_ACCESS_KEY=your_secret_key
R2_BUCKET_NAME=your_bucket_name
R2_ENDPOINT=https://your_account_id.r2.cloudflarestorage.com
```

### Storage Thresholds

| File Size | Storage Location | Reason |
|-----------|------------------|---------|
| < 1MB | MongoDB | Light files, fast access |
| 1MB - 5MB | MongoDB (if supported type) | Medium files in database |
| > 5MB | R2 | Large files in object storage |
| PDFs, Office docs | R2 (any size) | Always use R2 for documents |

## File Types

### MongoDB Storage Types
- `image/jpeg`, `image/png`, `image/gif`, `image/webp`, `image/svg+xml`
- `text/plain`, `text/csv`
- `application/json`

### R2 Priority Types
- `application/pdf`
- `application/msword`
- `application/vnd.openxmlformats-officedocument.wordprocessingml.document`
- `application/vnd.ms-excel`
- `application/vnd.openxmlformats-officedocument.spreadsheetml.sheet`
- `application/vnd.ms-powerpoint`
- `application/vnd.openxmlformats-officedocument.presentationml.presentation`
- `application/zip`, `application/x-rar-compressed`, `application/x-7z-compressed`

## Usage

### Uploading Files

```javascript
const { uploadFile } = require('../utils/hybridStorage');

// The system automatically determines storage location
const result = await uploadFile(file, {
    uploadedBy: 'user123',
    category: 'document'
});

console.log(result.storageType); // 'mongodb' or 'r2'
console.log(result.fileUrl);     // Direct URL or data URL
```

### Getting Download URLs

```javascript
const { getDownloadUrl } = require('../utils/hybridStorage');

// Automatically handles both storage types
const downloadUrl = await getDownloadUrl(fileRecord, isPublic);
```

### Deleting Files

```javascript
const { deleteFile } = require('../utils/hybridStorage');

// Automatically deletes from appropriate storage
await deleteFile(fileRecord);
```

## Migration

### Migrating Existing Files

1. **Dry Run** (recommended first):
```bash
node backend/scripts/migrateToHybridStorage.js
```

2. **Live Migration**:
```bash
node backend/scripts/migrateToHybridStorage.js --live
```

3. **View Statistics Only**:
```bash
node backend/scripts/migrateToHybridStorage.js --stats-only
```

### Migration Process

1. Scans all files and documents without `storageType` field
2. Determines appropriate storage location based on file size and type
3. Downloads files from current storage (if accessible)
4. Uploads to new storage location
5. Updates database records with new storage information
6. Cleans up old files

## API Endpoints

### File Management

- `POST /api/files/upload` - Upload single file (uses hybrid storage)
- `POST /api/files/upload-multiple` - Upload multiple files
- `GET /api/files/:id` - Get file details with appropriate download URL
- `GET /api/files` - List files with storage type information
- `DELETE /api/files/:id` - Delete file from appropriate storage
- `GET /api/files/stats` - Get storage statistics including hybrid breakdown

### Document Management

- `POST /api/documents/upload` - Upload document (uses hybrid storage)
- `GET /api/documents/:id` - Get document with appropriate download URL
- `DELETE /api/documents/:id` - Delete document from appropriate storage

## Storage Statistics

The system provides detailed statistics about storage usage:

```json
{
  "success": true,
  "data": {
    "totalFiles": 150,
    "publicFiles": 120,
    "privateFiles": 30,
    "totalSize": 104857600,
    "averageSize": 699050,
    "hybridStorage": {
      "storageBreakdown": [
        {
          "storageType": "mongodb",
          "count": 100,
          "totalSize": 52428800,
          "averageSize": 524288
        },
        {
          "storageType": "r2",
          "count": 50,
          "totalSize": 52428800,
          "averageSize": 1048576
        }
      ],
      "totalFiles": 150,
      "totalSize": 104857600
    }
  }
}
```

## Benefits

### Cost Optimization
- MongoDB storage for small files (no additional cost)
- R2 storage for large files (10GB free tier)
- Automatic optimization based on file characteristics

### Performance
- Fast access to small files from MongoDB
- CDN benefits for large files in R2
- Signed URLs for secure access to private files

### Scalability
- R2 can handle unlimited large files
- MongoDB handles metadata and small files efficiently
- Automatic storage selection reduces manual management

## Monitoring

### Storage Usage
- Monitor MongoDB storage usage for small files
- Monitor R2 storage usage and costs
- Track file distribution between storage types

### Performance Metrics
- Upload/download speeds by storage type
- Access patterns for different file types
- Error rates for storage operations

## Troubleshooting

### Common Issues

1. **Migration fails for large files**
   - Check `MIGRATION_MAX_FILE_SIZE` setting
   - Ensure local files are accessible

2. **R2 upload failures**
   - Verify R2 credentials and bucket permissions
   - Check network connectivity

3. **MongoDB size limits**
   - Monitor database size
   - Consider increasing `MONGODB_MAX_SIZE` if needed

### Debug Mode

Enable debug logging by setting:
```env
NODE_ENV=development
```

This will show detailed storage strategy decisions and error messages.

## Security

### Access Control
- Private files use signed URLs with expiration
- Public files are directly accessible
- Storage type is transparent to users

### Data Protection
- Files are encrypted in transit to R2
- MongoDB files are base64 encoded
- Access logs for all file operations

## Future Enhancements

- Automatic file compression for MongoDB storage
- Intelligent caching based on access patterns
- Support for additional storage providers
- Advanced migration strategies
- Real-time storage optimization
