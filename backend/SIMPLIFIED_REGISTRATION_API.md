# Simplified Registration API Documentation

## Overview
The registration process has been simplified to have two steps:
1. **Basic Registration** - Simple form with essential fields
2. **Profile Completion** - Detailed form with academic and personal information

## Step 1: Basic Registration

### Endpoint
```
POST /api/auth/register
```

### Request Body
```json
{
  "fullName": "John Doe",
  "guardianName": "Robert Doe",
  "email": "john@example.com",
  "password": "password123",
  "confirmPassword": "password123",
  "phone": "9876543210",
  "course": "B.Tech Computer Science",
  "referralCode": "AG2024ABC123" // Optional
}
```

### Response (Success)
```json
{
  "success": true,
  "message": "Registration successful! Please complete your profile to continue.",
  "data": {
    "user": {
      "id": "user_id",
      "firstName": "John",
      "lastName": "Doe",
      "email": "john@example.com",
      "role": "student",
      "referralCode": "AG2024ABC123" // If referred by agent
    },
    "student": {
      "id": "student_id",
      "studentId": "ST241234",
      "course": "B.Tech Computer Science",
      "status": "incomplete"
    },
    "token": "jwt_token",
    "requiresProfileCompletion": true,
    "profileCompletionMessage": "Please complete your student profile with additional details like Aadhar number, academic information, and documents."
  }
}
```

## Step 2: Profile Completion

### Endpoint
```
POST /api/auth/complete-profile
```

### Headers
```
Authorization: Bearer <jwt_token>
```

### Request Body
```json
{
  "aadharNumber": "123456789012",
  "fatherName": "Robert Doe",
  "motherName": "Jane Doe",
  "currentClass": "12th",
  "academicYear": "2024-25",
  "dateOfBirth": "2005-01-15",
  "gender": "male",
  "bloodGroup": "O+",
  "address": {
    "street": "123 Main Street",
    "city": "Bhubaneswar",
    "state": "Odisha",
    "pincode": "751001"
  },
  "previousSchool": "ABC School",
  "previousClass": "11th",
  "previousBoard": "CBSE",
  "previousPercentage": 85,
  "previousYear": "2023-24",
  "specialNeeds": "",
  "medicalConditions": "",
  "emergencyContact": {
    "name": "Robert Doe",
    "relation": "Father",
    "phone": "9876543210"
  }
}
```

### Response (Success)
```json
{
  "success": true,
  "message": "Profile completed successfully!",
  "data": {
    "student": {
      "id": "student_id",
      "studentId": "ST241234",
      "course": "B.Tech Computer Science",
      "status": "active",
      "aadharNumber": "123456789012",
      "fatherName": "Robert Doe",
      "motherName": "Jane Doe",
      "currentClass": "12th",
      "academicYear": "2024-25",
      // ... other fields
    },
    "requiresProfileCompletion": false
  }
}
```

## Check Profile Status

### Endpoint
```
GET /api/auth/profile-status
```

### Headers
```
Authorization: Bearer <jwt_token>
```

### Response
```json
{
  "success": true,
  "data": {
    "student": {
      "id": "student_id",
      "studentId": "ST241234",
      "course": "B.Tech Computer Science",
      "status": "incomplete", // or "active"
      "isProfileComplete": false, // or true
      "guardianName": "Robert Doe"
    },
    "requiresProfileCompletion": true, // or false
    "profileCompletionMessage": "Please complete your student profile with additional details."
  }
}
```

## Frontend Implementation Flow

### 1. Registration Page
```html
<form id="registrationForm">
  <input type="text" name="fullName" placeholder="Full Name*" required>
  <input type="text" name="guardianName" placeholder="Guardian's Name*" required>
  <input type="tel" name="phone" placeholder="Phone Number*" required>
  <input type="email" name="email" placeholder="E-mail*" required>
  <select name="course" required>
    <option value="">Select Course</option>
    <option value="B.Tech Computer Science">B.Tech Computer Science</option>
    <option value="B.Tech Electronics">B.Tech Electronics</option>
    <option value="BBA">BBA</option>
    <option value="MBA">MBA</option>
    <!-- Add more courses -->
  </select>
  <input type="password" name="password" placeholder="Password*" required>
  <input type="password" name="confirmPassword" placeholder="Confirm Password*" required>
  <input type="text" name="referralCode" placeholder="Referral Code (Optional)">
  <button type="submit">Register</button>
</form>
```

### 2. After Registration Success
```javascript
// Show alert/modal for profile completion
if (response.data.requiresProfileCompletion) {
  showProfileCompletionModal();
  // Redirect to profile completion page
  window.location.href = '/complete-profile';
}
```

### 3. Profile Completion Page
```html
<form id="profileCompletionForm">
  <!-- Personal Information -->
  <input type="text" name="aadharNumber" placeholder="Aadhar Number*" required>
  <input type="text" name="fatherName" placeholder="Father's Name*" required>
  <input type="text" name="motherName" placeholder="Mother's Name*" required>
  <input type="date" name="dateOfBirth" required>
  <select name="gender" required>
    <option value="">Select Gender</option>
    <option value="male">Male</option>
    <option value="female">Female</option>
    <option value="other">Other</option>
  </select>
  
  <!-- Academic Information -->
  <input type="text" name="currentClass" placeholder="Current Class*" required>
  <input type="text" name="academicYear" placeholder="Academic Year*" required>
  
  <!-- Address -->
  <input type="text" name="address.street" placeholder="Street Address*" required>
  <input type="text" name="address.city" placeholder="City*" required>
  <input type="text" name="address.state" placeholder="State*" required>
  <input type="text" name="address.pincode" placeholder="Pincode*" required>
  
  <!-- Previous Academic Details -->
  <input type="text" name="previousSchool" placeholder="Previous School">
  <input type="text" name="previousClass" placeholder="Previous Class">
  <input type="text" name="previousBoard" placeholder="Board">
  <input type="number" name="previousPercentage" placeholder="Percentage">
  
  <button type="submit">Complete Profile</button>
</form>
```

## Course Options
You can customize the course dropdown with your available courses:
- B.Tech Computer Science
- B.Tech Electronics
- B.Tech Mechanical
- B.Tech Civil
- BBA
- MBA
- BCA
- MCA
- B.Sc
- M.Sc
- etc.

## Error Handling
All endpoints return consistent error responses:
```json
{
  "success": false,
  "message": "Error message",
  "errors": [
    {
      "field": "email",
      "message": "Please provide a valid email"
    }
  ]
}
```

## Security Features
- JWT token authentication for profile completion
- Password confirmation validation
- Aadhar number uniqueness check
- Input validation and sanitization
- Rate limiting on registration endpoints
