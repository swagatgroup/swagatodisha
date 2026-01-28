# Delete Attempt Tracking System

This document explains the delete attempt tracking system that has been implemented to monitor and audit all delete operations in the application.

## Overview

The system tracks all delete attempts, including:
- Who attempted the delete (user ID, email, role, name)
- What ID was targeted for deletion
- When the attempt occurred
- Whether it was successful or failed
- IP address and user agent
- Resource type (Student, StudentApplication, Document, File, etc.)

## Components

### 1. AuditLog Model (`backend/models/AuditLog.js`)

The AuditLog model stores all delete attempt information with the following key fields:
- `action`: Type of action (DELETE_ATTEMPT, DELETE_SUCCESS, DELETE_FAILED, BULK_DELETE_*, etc.)
- `resourceType`: Type of resource being deleted
- `targetId`: Single ID being deleted
- `targetIds`: Array of IDs for bulk deletes
- `performedBy`: User information (userId, email, role, fullName)
- `requestDetails`: Request metadata (method, URL, IP, userAgent)
- `result`: Result details (success, message, deletedCount, error, statusCode)
- `timestamp`: When the attempt occurred

### 2. Audit Logger Utility (`backend/utils/auditLogger.js`)

Provides helper functions:
- `logDeleteAttempt()`: Logs when a delete is attempted
- `logDeleteResult()`: Logs the result of a delete operation
- `getDeleteAttemptsForId()`: Retrieves all delete attempts for a specific ID
- `getDeleteAttemptsByUser()`: Retrieves all delete attempts by a user

### 3. API Endpoints (`backend/routes/auditLogs.js`)

#### Get Delete Attempts for a Specific ID
```
GET /api/audit-logs/delete-attempts/:id
Access: Staff/Super Admin only
Query params: limit (default: 50)
```

#### Get Delete Attempts by User
```
GET /api/audit-logs/user/:userId
Access: Staff/Super Admin only
Query params: limit (default: 100)
```

#### Get All Delete Attempts (with filters)
```
GET /api/audit-logs
Access: Super Admin only
Query params:
  - page: Page number (default: 1)
  - limit: Results per page (default: 50)
  - resourceType: Filter by resource type
  - action: Filter by action type
  - success: Filter by success status (true/false)
  - startDate: Start date filter (ISO format)
  - endDate: End date filter (ISO format)
  - userId: Filter by user ID
```

#### Get Delete Statistics
```
GET /api/audit-logs/statistics
Access: Super Admin only
Query params:
  - startDate: Start date filter (ISO format)
  - endDate: End date filter (ISO format)
```

Returns:
- Total attempts
- Successful deletes
- Failed deletes
- Success rate
- Breakdown by resource type
- Top users by delete count
- Recent attempts

## Integrated Delete Operations

The following delete operations are now tracked:

1. **Student Deletions**
   - Single student delete (`DELETE /api/students/:id`)
   - Bulk student application delete (`DELETE /api/admin/students/bulk`)
   - Single student application delete (`DELETE /api/admin/students/:id`)
   - Admin controller student delete

2. **Document Deletions**
   - Document delete (`DELETE /api/documents/:documentId`)

3. **File Deletions**
   - File delete (`DELETE /api/files/:id`)

## Usage Examples

### Check Delete Attempts for a Specific Student ID

```javascript
// Frontend example
const response = await fetch('/api/audit-logs/delete-attempts/507f1f77bcf86cd799439011', {
  headers: {
    'Authorization': `Bearer ${token}`
  }
});

const data = await response.json();
console.log('Delete attempts:', data.data);
```

### View All Delete Attempts with Filters

```javascript
// Get all failed delete attempts in the last 7 days
const startDate = new Date();
startDate.setDate(startDate.getDate() - 7);

const response = await fetch(
  `/api/audit-logs?success=false&startDate=${startDate.toISOString()}&limit=100`,
  {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  }
);

const data = await response.json();
console.log('Failed attempts:', data.data);
```

### Get Delete Statistics

```javascript
const response = await fetch('/api/audit-logs/statistics', {
  headers: {
    'Authorization': `Bearer ${token}`
  }
});

const data = await response.json();
console.log('Statistics:', data.statistics);
```

## Response Format

### Single Delete Attempt
```json
{
  "_id": "507f1f77bcf86cd799439011",
  "action": "DELETE_SUCCESS",
  "resourceType": "Student",
  "targetId": "507f1f77bcf86cd799439012",
  "performedBy": {
    "userId": "507f1f77bcf86cd799439013",
    "email": "admin@example.com",
    "role": "super_admin",
    "fullName": "Admin User"
  },
  "requestDetails": {
    "method": "DELETE",
    "url": "/api/students/507f1f77bcf86cd799439012",
    "ip": "192.168.1.1",
    "userAgent": "Mozilla/5.0..."
  },
  "result": {
    "success": true,
    "message": "Student deleted successfully",
    "statusCode": 200
  },
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

### Bulk Delete Attempt
```json
{
  "_id": "507f1f77bcf86cd799439014",
  "action": "BULK_DELETE_SUCCESS",
  "resourceType": "StudentApplication",
  "targetIds": ["507f1f77bcf86cd799439015", "507f1f77bcf86cd799439016"],
  "performedBy": {
    "userId": "507f1f77bcf86cd799439013",
    "email": "admin@example.com",
    "role": "super_admin"
  },
  "result": {
    "success": true,
    "message": "Successfully deleted 2 student application(s)",
    "deletedCount": 2,
    "statusCode": 200
  },
  "timestamp": "2024-01-15T10:35:00.000Z"
}
```

## Security Notes

1. **Access Control**: Only Staff and Super Admin can view audit logs
2. **Non-blocking**: Audit logging failures do not break the main delete operations
3. **Performance**: All queries are indexed for efficient retrieval
4. **Privacy**: Sensitive data is logged but access is restricted

## Database Indexes

The AuditLog model includes the following indexes for optimal query performance:
- `timestamp` (descending)
- `performedBy.userId` + `timestamp`
- `resourceType` + `timestamp`
- `action` + `timestamp`
- `result.success` + `timestamp`
- Compound index: `resourceType` + `action` + `timestamp`

## Monitoring Recommendations

1. **Set up alerts** for multiple failed delete attempts from the same user
2. **Monitor bulk deletes** to detect potential abuse
3. **Review statistics regularly** to identify patterns
4. **Export logs** periodically for compliance/audit purposes

## Future Enhancements

Potential improvements:
- Email notifications for suspicious delete patterns
- Dashboard widget showing recent delete activity
- Export functionality for audit reports
- Integration with external logging services
- Automatic cleanup of old audit logs

