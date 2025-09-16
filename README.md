# 🎓 Swagat Odisha - Educational Management System

## 📋 Project Overview

**Swagat Odisha** is a comprehensive educational management system designed for the Swagat Group of Institutions. It provides a complete solution for managing students, agents, staff, and administrative operations across multiple campuses in Odisha, India.

### 🏫 Institution Locations
- **Sargiguda Campus**: Sargiguda, PO - Sargul, PS - Kantabanji, Balangir, Odisha, Pin-767039
- **Ghantiguda Campus**: Ghantiguda, PO - Chalna, PS - Sinapali, Nuapada, Odisha, Pin-766108

---

## 🚀 System Architecture

### Backend (Node.js + Express)
- **Framework**: Express.js with MongoDB
- **Authentication**: JWT-based with role-based access control
- **Database**: MongoDB with Mongoose ODM
- **File Uploads**: Cloudinary integration
- **Real-time**: Socket.io for live updates
- **Security**: Helmet, CORS, Rate limiting, Input validation

### Frontend (React + Vite)
- **Framework**: React 18 with Vite build tool
- **Styling**: Tailwind CSS with custom components
- **State Management**: React Context API
- **Routing**: React Router DOM
- **UI Components**: Custom components with Framer Motion animations
- **Notifications**: SweetAlert2 for user feedback

---

## 👥 User Roles & Access Levels

### 1. **Super Administrator** 🔑
- **Access**: Full system control
- **Features**:
  - Complete user management (students, agents, staff)
  - System settings and configuration
  - Performance monitoring and analytics
  - Security dashboard and audit logs
  - Website Content management
  - All CRUD operations

### 2. **Staff Members** 👨‍💼
- **Access**: Academic and administrative operations
- **Features**:
  - Student management and application review
  - Document verification and approval
  - Academic operations
  - Limited admin functions
  - Report generation

### 3. **Agents** 🤝
- **Access**: Referral and commission management
- **Features**:
  - Referral code generation and management
  - Student referral tracking
  - Commission calculation and tracking
  - Lead management
  - Document upload for referrals

### 4. **Students** 🎓
- **Access**: Personal academic portal
- **Features**:
  - Document upload and management
  - Application status tracking
  - Profile management
  - Academic information access
  - Admission process tracking

---

## ✅ Working Features

### 🔐 Authentication System
- ✅ User registration with validation
- ✅ Secure login with JWT tokens
- ✅ Password hashing with bcrypt
- ✅ Role-based access control
- ✅ Password reset functionality
- ✅ Session management (7-day auto-login)
- ✅ Account lockout after failed attempts

### 📊 Dashboard System
- ✅ **Super Admin Dashboard**: Complete system overview
- ✅ **Staff Dashboard**: Student and application management
- ✅ **Agent Dashboard**: Referral tracking and commission
- ✅ **Student Dashboard**: Personal academic portal
- ✅ Real-time statistics and analytics
- ✅ Role-specific navigation and features

### 👤 User Management
- ✅ Multi-role user system (4 user types)
- ✅ User profile management
- ✅ Account creation and deletion
- ✅ Password management and reset
- ✅ User status tracking (active/inactive)
- ✅ Referral code generation for agents

### 📄 Document Management
- ✅ PDF upload system with drag-and-drop
- ✅ File type validation (PDF, JPEG, PNG, WebP)
- ✅ File size validation (10MB limit)
- ✅ Document categorization
- ✅ Real-time upload progress
- ✅ Document status tracking (Pending, Under Review, Approved, Rejected)
- ✅ Staff remarks and feedback system

### 🏫 Institution Management
- ✅ Multiple campus support
- ✅ Course management
- ✅ Academic year tracking
- ✅ Student enrollment system
- ✅ Agent referral system

### 🔒 Security Features
- ✅ JWT token authentication
- ✅ Password hashing with bcrypt
- ✅ Input validation and sanitization
- ✅ CORS configuration
- ✅ Rate limiting
- ✅ Security headers (Helmet)
- ✅ SQL injection prevention
- ✅ XSS protection

### 📱 Frontend Features
- ✅ Responsive design (mobile-friendly)
- ✅ Modern UI with Tailwind CSS
- ✅ Smooth animations with Framer Motion
- ✅ Professional error handling with SweetAlert2
- ✅ Real-time notifications
- ✅ Loading states and progress indicators
- ✅ Form validation and error messages

---

## ⚠️ Known Issues & Limitations

### 🔴 Critical Issues (Fixed)
- ✅ **CORS Configuration**: Fixed undefined origin handling
- ✅ **Rate Limiting**: Fixed health check blocking
- ✅ **API Endpoints**: Added missing dashboard routes

### 🟡 Configuration Required
- ⚠️ **Cloudinary Setup**: File uploads require Cloudinary configuration
- ⚠️ **Email Service**: Contact form requires email service setup
- ⚠️ **Production Database**: MongoDB Atlas connection needed
- ⚠️ **Environment Variables**: Production environment configuration

### 🟠 Minor Issues
- ⚠️ **Performance**: Some database queries need optimization
- ⚠️ **Error Handling**: Some edge cases need better error messages
- ⚠️ **Testing**: Comprehensive test suite needed

---

## 🛠️ Technical Stack

### Backend Dependencies
```json
{
  "express": "^4.18.2",
  "mongoose": "^7.5.0",
  "bcryptjs": "^2.4.3",
  "jsonwebtoken": "^9.0.2",
  "cloudinary": "^2.7.0",
  "socket.io": "^4.8.1",
  "helmet": "^7.0.0",
  "cors": "^2.8.5",
  "express-rate-limit": "^6.10.0",
  "multer": "^1.4.5-lts.1",
  "pdf-lib": "^1.17.1",
  "sharp": "^0.32.5"
}
```

### Frontend Dependencies
```json
{
  "react": "^18.2.0",
  "react-dom": "^18.2.0",
  "react-router-dom": "^7.8.0",
  "framer-motion": "^12.23.12",
  "tailwindcss": "^3.4.1",
  "sweetalert2": "^11.23.0",
  "axios": "^1.11.0",
  "socket.io-client": "^4.8.1"
}
```

---

## 🚀 Installation & Setup

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (local or Atlas)
- Git

### 1. Clone Repository
```bash
git clone <repository-url>
cd swagat-odisha
```

### 2. Backend Setup
```bash
cd backend
npm install
cp env.example .env
# Configure .env with your settings
npm start
```

### 3. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

### 4. Environment Configuration
Create `.env` file in backend directory:
```env
# Server Configuration
PORT=5000
NODE_ENV=development

# MongoDB Configuration
MONGODB_URI=mongodb://localhost:27017/swagat_odisha

# JWT Configuration
JWT_SECRET=your_jwt_secret_key_here
JWT_EXPIRE=7d

# Cloudinary Configuration (for file uploads)
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret

# Email Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password
```

---

## 🧪 Test Accounts

### Super Administrator
- **Email**: `admin@swagatodisha.com`
- **Password**: `Admin@123456`

### Staff Member
- **Email**: `staff@swagatodisha.com`
- **Password**: `Staff@123456`

### Student
- **Email**: `student@swagatodisha.com`
- **Password**: `Student@123456`

### Agent
- **Email**: `agent@swagatodisha.com`
- **Password**: `Agent@123456`

---

## 📊 System Statistics

- **Total User Accounts**: 42+ (across all roles)
- **Student Profiles**: 7+ active students
- **Agent Referral Codes**: 12+ unique codes
- **Document Types**: 12+ supported categories
- **API Endpoints**: 25+ RESTful endpoints
- **Frontend Components**: 50+ React components

---

## 🔧 Available Scripts

### Backend Scripts
```bash
npm start          # Start production server
npm run dev        # Start development server with nodemon
npm test           # Run tests
npm run lint       # Run ESLint
npm run security:audit  # Security audit
```

### Frontend Scripts
```bash
npm run dev        # Start development server
npm run build      # Build for production
npm run preview    # Preview production build
npm run lint       # Run ESLint
```

### Utility Scripts
```bash
# Create all user accounts
node backend/scripts/createAllAccounts.js

# Fix password issues
node backend/scripts/fixPasswords.js

# Test all accounts
node backend/scripts/testAllAccounts.js
```

---

## 🌐 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `GET /api/auth/me` - Get current user
- `PUT /api/auth/change-password` - Change password
- `POST /api/auth/forgot-password` - Forgot password

### Student Management
- `GET /api/students` - Get all students
- `PUT /api/students/:id` - Update student
- `DELETE /api/students/:id` - Delete student

### Admin Management
- `GET /api/admin/dashboard/stats` - Dashboard statistics
- `GET /api/admin/students` - Get all students (admin)
- `GET /api/admin/agents` - Get all agents
- `GET /api/admin/staff` - Get all staff
- `POST /api/admin/staff` - Create staff member

### Document Management
- `POST /api/documents/upload` - Upload document
- `GET /api/documents` - Get user documents
- `PUT /api/documents/:id` - Update document status

---

## 🚀 Deployment

### Production Deployment Checklist
- [ ] Configure environment variables
- [ ] Set up MongoDB Atlas database
- [ ] Configure Cloudinary for file uploads
- [ ] Set up email service
- [ ] Configure domain and SSL
- [ ] Test all functionality
- [ ] Set up monitoring and logging

### Vercel Deployment
The project is configured for Vercel deployment with:
- Automatic builds on git push
- Environment variable configuration
- Custom headers for security
- CORS configuration

---

## 📈 Performance Optimizations

### Backend Optimizations
- ✅ Database indexing for frequently queried fields
- ✅ Request compression with gzip
- ✅ Rate limiting to prevent abuse
- ✅ Connection pooling for MongoDB
- ✅ Caching for frequently accessed data

### Frontend Optimizations
- ✅ Code splitting with Vite
- ✅ Image optimization
- ✅ Lazy loading for components
- ✅ Bundle size optimization
- ✅ CDN-ready static assets

---

## 🛡️ Security Measures

### Authentication Security
- ✅ JWT tokens with expiration
- ✅ Password hashing with bcrypt
- ✅ Account lockout after failed attempts
- ✅ Secure session management

### API Security
- ✅ Input validation and sanitization
- ✅ CORS configuration
- ✅ Rate limiting
- ✅ Security headers (Helmet)
- ✅ SQL injection prevention
- ✅ XSS protection

### File Upload Security
- ✅ File type validation
- ✅ File size limits
- ✅ Secure file storage
- ✅ Virus scanning (recommended)

---

## 🔍 Monitoring & Logging

### Application Monitoring
- ✅ Request logging with Morgan
- ✅ Error tracking and reporting
- ✅ Performance monitoring
- ✅ Security audit logging

### Recommended Monitoring Tools
- **Application**: New Relic, DataDog, or similar
- **Error Tracking**: Sentry or Bugsnag
- **Uptime**: Pingdom or UptimeRobot
- **Logs**: Centralized logging solution

---

## 📞 Support & Maintenance

### Development Team
- **Lead Developer**: Swagat Odisha Team
- **Database Admin**: System Administrator
- **Frontend Developer**: React Specialist

### Maintenance Schedule
- **Daily**: Monitor error logs and performance
- **Weekly**: Review user feedback and issues
- **Monthly**: Security updates and dependency updates
- **Quarterly**: Performance optimization and feature updates

---

## 🎯 Future Enhancements

### Planned Features
- [ ] Mobile app (React Native)
- [ ] Advanced analytics dashboard
- [ ] Email notification system
- [ ] SMS integration
- [ ] Payment gateway integration
- [ ] Multi-language support
- [ ] Advanced reporting system
- [ ] API documentation with Swagger

### Technical Improvements
- [ ] Comprehensive test suite
- [ ] CI/CD pipeline
- [ ] Docker containerization
- [ ] Microservices architecture
- [ ] Advanced caching strategies
- [ ] Real-time collaboration features

---

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

---

## 📞 Contact

- **Website**: [Swagat Odisha](https://swagatodisha.com)
- **Email**: contact@swagatodisha.com
- **Phone**: +91-9876543210

---

**Last Updated**: December 2024  
**Version**: 1.0.0  
**Status**: Production Ready with Configuration Required

---

*This README provides a comprehensive overview of the Swagat Odisha Educational Management System. For specific technical details, refer to the individual component documentation.*
