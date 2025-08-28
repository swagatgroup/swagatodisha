# Swagat Odisha - Authentication System Setup Guide

## Overview

This document outlines the complete authentication system and dashboard implementation for the Swagat Odisha website. The system includes:

- **Student Registration/Login** (Default)
- **Agent Dashboard** - Track referrals and commissions
- **Staff Dashboard** - Manage applications with referral/non-referral filtering
- **Super Admin Dashboard** - Full system management with 5 main tabs

## Features Implemented

### 1. Authentication System
- ✅ Register/Login buttons in navbar
- ✅ Student registration form with referral code support
- ✅ Login form with role-based redirection
- ✅ JWT-based authentication
- ✅ Protected routes based on user roles

### 2. Dashboard System
- ✅ **Student Dashboard**: Profile, applications, documents, payments
- ✅ **Agent Dashboard**: Referral tracking, commission management
- ✅ **Staff Dashboard**: Application management with referral filtering
- ✅ **Super Admin Dashboard**: 5 main tabs for complete system control

### 3. Role-Based Access Control
- ✅ Students: Can only access student dashboard
- ✅ Agents: Can only access agent dashboard
- ✅ Staff: Can only access staff dashboard
- ✅ Super Admin: Can access all dashboards and system settings

## File Structure

```
frontend/src/
├── components/
│   ├── auth/
│   │   ├── Login.jsx
│   │   └── Register.jsx
│   ├── dashboard/
│   │   ├── DashboardLayout.jsx
│   │   ├── StudentDashboard.jsx
│   │   ├── AgentDashboard.jsx
│   │   ├── StaffDashboard.jsx
│   │   └── SuperAdminDashboard.jsx
│   └── Header.jsx (updated with auth buttons)
├── contexts/
│   └── AuthContext.jsx
└── App.jsx (updated with routing)

backend/
├── models/
│   ├── User.js (updated with role support)
│   ├── Student.js
│   └── Admission.js
├── routes/
│   └── auth.js (updated with role-based logic)
└── server.js
```

## Setup Instructions

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (local or cloud)
- npm or yarn

### Backend Setup

1. **Navigate to backend directory:**
   ```bash
   cd backend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Environment Configuration:**
   - Copy `env.example` to `.env`
   - Update the following variables:
     ```env
     MONGODB_URI=mongodb://localhost:27017/swagat_odisha
     56e1a1fcf2aaab953f41c314592102e6f62e9aa540d36906dc7a90dd814a4910538858e126364378ecb0d60922fbed=your-super-secret-jwt-key
     PORT=5000
     ```

4. **Start MongoDB:**
   - Local: Ensure MongoDB is running on localhost:27017
   - Cloud: Use your MongoDB Atlas connection string

5. **Start the backend server:**
   ```bash
   npm run dev
   ```
   The server will start on http://localhost:5000

### Frontend Setup

1. **Navigate to frontend directory:**
   ```bash
   cd frontend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start the development server:**
   ```bash
   npm run dev
   ```
   The frontend will start on http://localhost:5173

## Usage Guide

### 1. Student Registration
- Navigate to `/register`
- Fill in all required fields
- Optionally enter an agent referral code
- Submit to create account

### 2. User Login
- Navigate to `/login`
- Enter email and password
- System automatically redirects to appropriate dashboard based on role

### 3. Dashboard Access
- **Students**: `/dashboard/student`
- **Agents**: `/dashboard/agent`
- **Staff**: `/dashboard/staff`
- **Super Admin**: `/dashboard/admin`

## Dashboard Features

### Student Dashboard
- View profile information
- Track application status
- Upload documents
- Make payments
- View academic progress

### Agent Dashboard
- Track referred students
- View commission earnings
- Monitor referral performance
- Generate reports

### Staff Dashboard
- Manage student applications
- Filter by referral vs. direct enrollment
- Review and approve applications
- Track agent performance
- Generate enrollment reports

### Super Admin Dashboard
1. **Students Tab**: Full student management with CRUD operations
2. **Agents Tab**: Agent management and performance tracking
3. **Staff Tab**: Staff management and permissions
4. **Passwords Tab**: Password reset for all user types
5. **Website Content Tab**: Manage website sections and content

## Security Features

- JWT-based authentication
- Role-based access control
- Protected routes
- Password hashing with bcrypt
- Rate limiting on API endpoints
- Input validation and sanitization

## API Endpoints

### Authentication
- `POST /api/auth/register` - Student registration
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user profile
- `PUT /api/auth/change-password` - Change password
- `POST /api/auth/logout` - User logout

### Protected Routes
- All dashboard routes require authentication
- Role-based access control enforced
- Automatic redirection for unauthorized access

## Testing the System

1. **Start both backend and frontend servers**
2. **Navigate to the website homepage**
3. **Click Register to create a student account**
4. **Login with the created account**
5. **Explore the student dashboard**
6. **Test role-based access by trying different dashboard URLs**

## Troubleshooting

### Common Issues

1. **MongoDB Connection Error**
   - Ensure MongoDB is running
   - Check connection string in .env file
   - Verify network access for cloud MongoDB

2. **JWT Errors**
   - Check 56e1a1fcf2aaab953f41c314592102e6f62e9aa540d36906dc7a90dd814a4910538858e126364378ecb0d60922fbed in .env file
   - Ensure backend server is running
   - Clear browser localStorage if needed

3. **CORS Errors**
   - Verify FRONTEND_URL in backend .env
   - Check that frontend is running on correct port

4. **Role Access Issues**
   - Verify user role in database
   - Check ProtectedRoute component logic
   - Ensure proper role assignment during registration

## Next Steps

### Immediate Enhancements
- [ ] Add password reset functionality
- [ ] Implement email verification
- [ ] Add profile picture upload
- [ ] Create detailed application forms

### Future Features
- [ ] Real-time notifications
- [ ] Advanced reporting and analytics
- [ ] Mobile app development
- [ ] Integration with payment gateways
- [ ] Advanced document management

## Support

For technical support or questions about the authentication system:
- Check the console for error messages
- Verify all environment variables are set correctly
- Ensure all dependencies are installed
- Check MongoDB connection and database setup

---

**Note**: This system is designed for production use but includes development-friendly features. Remember to:
- Change default JWT secrets in production
- Use strong passwords and secure MongoDB connections
- Implement proper logging and monitoring
- Set up backup and recovery procedures
