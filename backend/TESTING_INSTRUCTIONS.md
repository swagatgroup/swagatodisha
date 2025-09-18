# Redis System Testing Instructions

## 🚀 Quick Start Testing

### 1. Setup and Start the System

```bash
# Navigate to backend directory
cd backend

# Setup Redis system (installs Redis if needed)
npm run setup:redis

# Start the Redis-powered server
npm run dev:redis
```

### 2. Run Quick Test

```bash
# In a new terminal, run the quick test
node scripts/quickTest.js
```

This will:
- ✅ Check server health
- ✅ Create a dummy student
- ✅ Create a dummy application
- ✅ Monitor the workflow progress
- ✅ Check Redis statistics
- ✅ Clean up test data

### 3. Run Comprehensive Tests

```bash
# Run the full test suite
npm run test:redis
```

This runs 9 comprehensive tests covering all aspects of the Redis system.

## 🧪 Manual Testing

### Test 1: Create Dummy Students

```bash
curl -X POST http://localhost:5000/api/test/create-dummy-student \
  -H "Content-Type: application/json" \
  -d '{"count": 5}'
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Created 5 dummy students",
  "students": [
    {
      "id": "student_id",
      "name": "Test Student 1",
      "email": "teststudent1@example.com",
      "referralCode": "REF1234567890"
    }
  ]
}
```

### Test 2: Create Dummy Application

```bash
curl -X POST http://localhost:5000/api/test/create-dummy-application \
  -H "Content-Type: application/json" \
  -d '{"userId": "STUDENT_ID_FROM_STEP_1"}'
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Dummy application created",
  "submissionId": "sub_1234567890_abc123"
}
```

### Test 3: Monitor Application Status

```bash
curl http://localhost:5000/api/redis/application/status/SUBMISSION_ID_FROM_STEP_2 \
  -H "Authorization: Bearer test-token-STUDENT_ID"
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "submissionId": "sub_1234567890_abc123",
    "status": {
      "validation": {"status": "completed", "timestamp": 1234567890},
      "document_processing": {"status": "in_progress", "timestamp": 1234567890}
    },
    "progress": 50,
    "application": null
  }
}
```

### Test 4: Check Redis Statistics

```bash
curl http://localhost:5000/api/test/redis-stats
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "redis": {
      "status": "healthy",
      "connected": true,
      "response": "PONG"
    },
    "queues": {
      "document_processing": {
        "fifoJobs": 0,
        "priorityJobs": 0,
        "totalJobs": 0,
        "isRunning": true,
        "concurrency": 3
      }
    }
  }
}
```

### Test 5: Clean Up Test Data

```bash
curl -X POST http://localhost:5000/api/test/cleanup
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Test data cleaned up"
}
```

## 🔍 What to Look For

### ✅ Success Indicators

1. **Server Health**: All services (Redis, Database, Queue) show as healthy
2. **Student Creation**: Students are created with unique referral codes
3. **Application Submission**: Applications start processing immediately
4. **Workflow Progress**: Progress increases from 0% to 100%
5. **Real-time Updates**: Status updates appear in real-time
6. **Queue Processing**: Documents and other jobs process in background
7. **Error Handling**: Invalid data is rejected gracefully
8. **Cleanup**: Test data is removed successfully

### ❌ Failure Indicators

1. **Connection Errors**: "ECONNREFUSED" means server isn't running
2. **Redis Errors**: "Redis connection failed" means Redis isn't running
3. **Database Errors**: "MongoDB connection failed" means database isn't running
4. **Workflow Stuck**: Progress doesn't increase beyond a certain point
5. **Queue Issues**: Jobs remain in queue without processing
6. **Memory Issues**: High memory usage or crashes

## 🐛 Troubleshooting

### Problem: Server won't start

**Solution:**
```bash
# Check if Redis is running
redis-cli ping

# If not running, start Redis
redis-server

# Check if MongoDB is running
mongosh --eval "db.runCommand('ping')"

# If not running, start MongoDB
mongod
```

### Problem: Tests fail with connection errors

**Solution:**
```bash
# Make sure server is running
npm run dev:redis

# Check server health
curl http://localhost:5000/health

# Check if all services are healthy
```

### Problem: Workflow gets stuck

**Solution:**
```bash
# Check Redis queue status
redis-cli
> KEYS *queue*
> LLEN document_processing:fifo

# Check workflow status
curl http://localhost:5000/api/redis/application/status/SUBMISSION_ID

# Resume workflow if needed
curl -X POST http://localhost:5000/api/redis/workflow/resume/SUBMISSION_ID
```

### Problem: Memory issues

**Solution:**
```bash
# Check Redis memory usage
redis-cli info memory

# Clean up Redis data
redis-cli FLUSHDB

# Restart Redis
redis-cli SHUTDOWN
redis-server
```

## 📊 Performance Benchmarks

### Expected Performance

- **Server Startup**: < 5 seconds
- **Student Creation**: < 1 second
- **Application Submission**: < 3 seconds (immediate response)
- **Workflow Completion**: 30-60 seconds
- **Document Processing**: 5-10 seconds per document
- **Real-time Updates**: < 1 second latency

### Load Testing

```bash
# Test with multiple concurrent requests
for i in {1..10}; do
  curl -X POST http://localhost:5000/api/test/create-dummy-student \
    -H "Content-Type: application/json" \
    -d '{"count": 1}' &
done
wait
```

## 🎯 Success Criteria

Your Redis system is working correctly if:

1. ✅ All health checks pass
2. ✅ Students can be created successfully
3. ✅ Applications submit without errors
4. ✅ Workflow progresses from 0% to 100%
5. ✅ Real-time updates work
6. ✅ Background processing works
7. ✅ Error handling works
8. ✅ Cleanup works
9. ✅ Performance meets benchmarks
10. ✅ System handles concurrent requests

## 🚀 Next Steps

Once testing is complete:

1. **Deploy to Production**: Use the Redis system in production
2. **Monitor Performance**: Set up monitoring and alerting
3. **Scale as Needed**: Add Redis clustering for high availability
4. **Update Frontend**: Integrate the new Redis-powered components
5. **Train Users**: Update documentation and user guides

## 📞 Support

If you encounter issues:

1. Check the logs in the terminal
2. Run the health check endpoint
3. Check Redis and MongoDB status
4. Review the error messages
5. Try the troubleshooting steps above

The Redis system is designed to be robust and self-healing, but proper setup and monitoring are essential for optimal performance.
