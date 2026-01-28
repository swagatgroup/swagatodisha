# How to Investigate User Deletions

If someone deleted a user a few hours ago, here are the steps to investigate:

## Quick Investigation Methods

### 1. Check Audit Logs via API

Since the audit logging system was just implemented, it may not have historical data. However, check if anything was captured:

```bash
# Get recent delete attempts (last 24 hours)
GET /api/audit-logs/recent?hours=24

# Get all delete attempts for a specific user ID
GET /api/audit-logs/delete-attempts/{userId}

# Get all delete attempts by a specific user (who performed the deletion)
GET /api/audit-logs/user/{performedByUserId}

# Get all delete attempts with filters
GET /api/audit-logs?resourceType=User&startDate=2024-01-15T00:00:00Z&endDate=2024-01-15T23:59:59Z
```

### 2. Run Investigation Script

Use the investigation script to check multiple sources:

```bash
# Check last 24 hours (default)
node backend/scripts/investigateUserDeletion.js

# Check last 48 hours
node backend/scripts/investigateUserDeletion.js 48

# Check for specific user ID
node backend/scripts/investigateUserDeletion.js 24 507f1f77bcf86cd799439011
```

The script will check:
- ✅ Audit logs for delete attempts
- ✅ Orphaned user references (students with missing users)
- ✅ Recent student deletions (which cascade to user deletions)
- ✅ Bulk deletions

### 3. Check MongoDB Directly

If you have MongoDB access, you can query directly:

```javascript
// Connect to MongoDB
use your_database_name

// Check audit logs
db.auditlogs.find({
  timestamp: { $gte: ISODate("2024-01-15T00:00:00Z") },
  $or: [
    { resourceType: "User" },
    { resourceType: "Student" }
  ]
}).sort({ timestamp: -1 })

// Check for students with missing user references
// (This requires checking Student collection and verifying User exists)
```

### 4. Check Server Logs

Check your server logs for delete operations:

```bash
# Check server logs for DELETE requests
grep -i "delete" server.log | grep -i "user\|student"

# Check for specific user ID in logs
grep "507f1f77bcf86cd799439011" server.log
```

### 5. Check MongoDB Oplog (If Enabled)

If MongoDB oplog is enabled, you can see all database operations:

```javascript
// Connect to local database
use local

// Check oplog for delete operations
db.oplog.rs.find({
  "ts": { $gte: Timestamp(1705276800, 0) },
  "op": "d",  // 'd' = delete operation
  "ns": /users|students/  // namespace matches users or students
}).sort({ ts: -1 })
```

## Common Scenarios

### Scenario 1: User Deleted via Student Deletion
If a student was deleted, the associated user is also deleted. Check:
- Student deletion logs: `GET /api/audit-logs?resourceType=Student`
- Look for the student ID that had the user as a reference

### Scenario 2: Bulk Deletion
If multiple users were deleted:
- Check bulk deletion logs: `GET /api/audit-logs?action=BULK_DELETE_SUCCESS`
- Look for bulk operations in the last few hours

### Scenario 3: Direct User Deletion
If a user was deleted directly (agent, staff, etc.):
- Check User resource type logs: `GET /api/audit-logs?resourceType=User`
- Check agent deletion: Look for agent deletion operations

### Scenario 4: Database Direct Deletion
If deletion happened directly in database:
- Audit logs won't have it
- Check MongoDB oplog (if enabled)
- Check server access logs
- Check who had database access

## What Information You'll Get

From audit logs, you can see:
- ✅ **Who** deleted (user email, role, name)
- ✅ **What** was deleted (user ID, student ID)
- ✅ **When** it happened (timestamp)
- ✅ **Where** it came from (IP address, URL)
- ✅ **Success/Failure** status
- ✅ **Request details** (user agent, headers)

## Prevention for Future

The audit logging system is now active and will track:
- ✅ All student deletions (which cascade to users)
- ✅ All bulk deletions
- ✅ All document deletions
- ✅ All file deletions
- ✅ Agent deletions
- ✅ Direct user deletions (when implemented)

## Next Steps

1. **Immediate**: Run the investigation script
2. **Check API**: Query audit logs via `/api/audit-logs/recent`
3. **Check Logs**: Review server logs for DELETE requests
4. **Database**: If needed, check MongoDB oplog
5. **Future**: All deletions are now tracked automatically

## API Endpoints Summary

```
GET /api/audit-logs/recent?hours=24
GET /api/audit-logs/delete-attempts/:id
GET /api/audit-logs/user/:userId
GET /api/audit-logs?resourceType=User&startDate=...&endDate=...
GET /api/audit-logs/statistics
```

All endpoints require Staff/Super Admin authentication.

