# Swagat Odisha Backend API Documentation

## Overview
This is a comprehensive backend system for Swagat Group of Institutions with role-based access control, agent referral system, and admin management.

## User Roles
- **Student**: Can register, apply for admission, view their dashboard
- **Agent**: Can register, get referral codes, track referrals, view agent dashboard
- **Staff**: Can manage students, agents, view applications, CRUD operations (except delete)
- **Super Admin**: Full access to all features including delete operations and Aadhar number changes

## API Endpoints

### Authentication

#### Student/Agent Registration
```
POST /api/auth/register
POST /api/auth/register-agent
POST /api/auth/login
GET /api/auth/me
PUT /api/auth/change-password
POST /api/auth/forgot-password
PUT /api/auth/reset-password/:resetToken
POST /api/auth/logout
```

#### Admin Authentication
```
POST /api/admin-auth/register
POST /api/admin-auth/login
GET /api/admin-auth/me
```

### Dashboards

#### Student Dashboard
```
GET /api/dashboard/student
```

#### Agent Dashboard
```
GET /api/dashboard/agent
```

#### Staff Dashboard
```
GET /api/dashboard/staff
```

#### Super Admin Dashboard
```
GET /api/dashboard/super-admin
```

### Admin Management

#### Dashboard Statistics
```
GET /api/admin/dashboard/stats
```

#### Student Management
```
GET /api/admin/students
PUT /api/admin/students/:studentId
DELETE /api/admin/students/:studentId (Super Admin only)
```

#### Agent Management
```
GET /api/admin/agents
PUT /api/admin/agents/:agentId
DELETE /api/admin/agents/:agentId (Super Admin only)
```

#### Staff Management
```
GET /api/admin/staff
POST /api/admin/staff
PUT /api/admin/staff/:staffId
DELETE /api/admin/staff/:staffId (Super Admin only)
```

#### Password Management
```
POST /api/admin/reset-password
```

#### Website Settings
```
GET /api/admin/website-settings
PUT /api/admin/website-settings
POST /api/admin/upload-website-image
```

### Student Management
```
GET /api/students
POST /api/students
GET /api/students/:id
PUT /api/students/:id
DELETE /api/students/:id
```

## Request/Response Examples

### Student Registration
```json
POST /api/auth/register
{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john@example.com",
  "password": "password123",
  "phone": "9876543210",
  "referralCode": "AG2024ABC123", // Optional
  "aadharNumber": "123456789012",
  "fatherName": "Robert Doe",
  "motherName": "Jane Doe",
  "currentClass": "12th",
  "academicYear": "2024-25"
}
```

### Agent Registration
```json
POST /api/auth/register-agent
{
  "firstName": "Agent",
  "lastName": "Smith",
  "email": "agent@example.com",
  "password": "password123",
  "phone": "9876543210"
}
```

### Login Response
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "id": "user_id",
      "firstName": "John",
      "lastName": "Doe",
      "email": "john@example.com",
      "role": "student",
      "referralCode": "AG2024ABC123" // For agents
    },
    "token": "jwt_token"
  }
}
```

### Dashboard Response (Student)
```json
{
  "success": true,
  "data": {
    "student": {
      "id": "student_id",
      "studentId": "ST241234",
      "user": {
        "firstName": "John",
        "lastName": "Doe",
        "email": "john@example.com"
      },
      "academicSummary": {
        "currentClass": "12th",
        "academicYear": "2024-25",
        "status": "active",
        "progress": "good",
        "attendancePercentage": 85,
        "feeStatus": "paid"
      },
      "agentInfo": {
        "agent": {
          "firstName": "Agent",
          "lastName": "Smith",
          "referralCode": "AG2024ABC123"
        }
      }
    }
  }
}
```

### Dashboard Response (Agent)
```json
{
  "success": true,
  "data": {
    "agent": {
      "id": "agent_id",
      "firstName": "Agent",
      "lastName": "Smith",
      "email": "agent@example.com",
      "referralCode": "AG2024ABC123"
    },
    "stats": {
      "totalReferrals": 10,
      "successfulReferrals": 8,
      "pendingReferrals": 2,
      "successRate": 80,
      "totalCommission": 400
    },
    "recentReferrals": [...]
  }
}
```

## Environment Variables

```env
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://localhost:27017/swagat-odisha
JWT_SECRET=your_jwt_secret
JWT_EXPIRE=7d
BCRYPT_ROUNDS=12
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
FRONTEND_URL=http://localhost:3000
```

## Setup Instructions

1. Install dependencies:
```bash
npm install
```

2. Set up environment variables:
```bash
cp env.example .env
# Edit .env with your values
```

3. Create super admin:
```bash
npm run create-super-admin
```

4. Start the server:
```bash
npm run dev
```

## Security Features

- JWT-based authentication
- Password hashing with bcrypt
- Account locking after failed attempts
- Role-based access control
- Input validation with express-validator
- Rate limiting
- Security headers with helmet
- CORS configuration

## File Upload

The system supports file uploads for:
- Student documents (Aadhar, certificates, etc.)
- Profile pictures
- Website images

All uploads are processed through Cloudinary with automatic optimization.

## Error Handling

All endpoints return consistent error responses:
```json
{
  "success": false,
  "message": "Error message",
  "error": "Detailed error (development only)"
}
```

## Status Codes

- 200: Success
- 201: Created
- 400: Bad Request
- 401: Unauthorized
- 403: Forbidden
- 404: Not Found
- 423: Account Locked
- 429: Too Many Requests
- 500: Internal Server Error
