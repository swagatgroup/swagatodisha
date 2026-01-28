# IP Address Tracking for Delete Operations

## ✅ Implementation Status

**YES, the system is now fully implemented!** Every delete operation automatically captures:

- ✅ **IP Address** of the person who deleted
- ✅ **User Agent** (browser/device info)
- ✅ **User Information** (who performed the delete)
- ✅ **Timestamp** (exact time of deletion)
- ✅ **Resource Type** (what was deleted)
- ✅ **Success/Failure** status
- ✅ **Request URL** and method

## How IP Address is Captured

The system captures IP address from multiple sources (in order of priority):
1. `req.ip` (if Express trust proxy is enabled)
2. `X-Forwarded-For` header (first IP if behind proxy)
3. `X-Real-IP` header
4. `req.connection.remoteAddress`
5. `req.socket.remoteAddress`
6. Falls back to 'unknown' if none available

## API Endpoints to Query by IP

### 1. Get All Deletions from a Specific IP Address

```bash
GET /api/audit-logs/ip/{ipAddress}?hours=24&limit=100
```

**Example:**
```bash
GET /api/audit-logs/ip/192.168.1.100?hours=48&limit=50
```

**Response:**
```json
{
  "success": true,
  "count": 5,
  "ipAddress": "192.168.1.100",
  "hoursAgo": 48,
  "startTime": "2024-01-13T10:00:00.000Z",
  "data": [
    {
      "_id": "...",
      "action": "DELETE_SUCCESS",
      "resourceType": "Student",
      "targetId": "...",
      "performedBy": {
        "userId": "...",
        "email": "admin@example.com",
        "role": "super_admin",
        "fullName": "Admin User"
      },
      "requestDetails": {
        "method": "DELETE",
        "url": "/api/students/507f1f77bcf86cd799439011",
        "ip": "192.168.1.100",
        "userAgent": "Mozilla/5.0..."
      },
      "result": {
        "success": true,
        "message": "Student deleted successfully",
        "statusCode": 200
      },
      "timestamp": "2024-01-15T10:30:00.000Z"
    }
  ]
}
```

### 2. Filter All Deletions by IP Address

```bash
GET /api/audit-logs?ipAddress=192.168.1.100&startDate=2024-01-15T00:00:00Z
```

### 3. Get Recent Deletions (All IPs)

```bash
GET /api/audit-logs/recent?hours=24
```

This returns all recent deletions with their IP addresses included.

## Example Usage

### Check if someone from a specific IP deleted anything:

```javascript
// Frontend example
const ipAddress = '192.168.1.100';
const response = await fetch(`/api/audit-logs/ip/${ipAddress}?hours=24`, {
  headers: {
    'Authorization': `Bearer ${token}`
  }
});

const data = await response.json();
console.log(`Found ${data.count} deletion(s) from IP ${ipAddress}`);
data.data.forEach(log => {
  console.log(`- ${log.resourceType} deleted by ${log.performedBy.email} at ${log.timestamp}`);
  console.log(`  IP: ${log.requestDetails.ip}`);
  console.log(`  User Agent: ${log.requestDetails.userAgent}`);
});
```

### Check all deletions from last 24 hours and filter by IP:

```javascript
const response = await fetch('/api/audit-logs/recent?hours=24', {
  headers: {
    'Authorization': `Bearer ${token}`
  }
});

const data = await response.json();
const suspiciousIP = '192.168.1.100';
const deletionsFromIP = data.data.filter(log => 
  log.requestDetails.ip === suspiciousIP
);

console.log(`Found ${deletionsFromIP.length} deletion(s) from ${suspiciousIP}`);
```

## What Information You Get

For each deletion, you'll see:

```json
{
  "requestDetails": {
    "ip": "192.168.1.100",           // ← IP Address
    "userAgent": "Mozilla/5.0...",    // Browser/device
    "method": "DELETE",                // HTTP method
    "url": "/api/students/123"         // Endpoint called
  },
  "performedBy": {
    "userId": "...",
    "email": "admin@example.com",      // Who did it
    "role": "super_admin",
    "fullName": "Admin User"
  },
  "timestamp": "2024-01-15T10:30:00Z", // When it happened
  "result": {
    "success": true,                   // Did it succeed?
    "statusCode": 200
  }
}
```

## Real-World Scenarios

### Scenario 1: "Someone deleted a user from IP 192.168.1.50"

```bash
GET /api/audit-logs/ip/192.168.1.50?hours=24
```

This will show:
- All deletions from that IP
- Who performed them (if logged in)
- What was deleted
- Exact timestamps

### Scenario 2: "Check all deletions in the last hour"

```bash
GET /api/audit-logs/recent?hours=1
```

Then filter by IP in your code or use:
```bash
GET /api/audit-logs?ipAddress=192.168.1.50&startDate=2024-01-15T10:00:00Z
```

### Scenario 3: "Find all User deletions from a specific IP"

```bash
GET /api/audit-logs?resourceType=User&ipAddress=192.168.1.50
```

## Important Notes

1. **IP Behind Proxy**: If your app is behind a proxy/load balancer, make sure Express trust proxy is enabled:
   ```javascript
   app.set('trust proxy', true);
   ```

2. **IP Format**: IPs are stored as strings. Both IPv4 and IPv6 are supported.

3. **Historical Data**: The audit logging was just implemented, so it only tracks deletions from now onwards. Past deletions won't be in the logs.

4. **Indexed**: IP address queries are indexed for fast performance.

## Testing

To test if it's working:

1. Perform a delete operation (as a logged-in user)
2. Check the audit logs:
   ```bash
   GET /api/audit-logs/recent?hours=1
   ```
3. Verify the IP address is captured in `requestDetails.ip`

## Security

- Only Staff and Super Admin can view audit logs
- IP addresses are logged for security and audit purposes
- All delete operations are automatically tracked
- No way to bypass the logging (it's integrated into delete routes)

---

**The system is LIVE and tracking all deletions with IP addresses!** 🎯

