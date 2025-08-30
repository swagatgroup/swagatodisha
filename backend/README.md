# Swagat Odisha Backend API

A comprehensive backend system for Swagat Group of Institutions with role-based access control, student management, and content management capabilities.

## 🚀 Features

### User Management
- **Multi-role system**: Student, Agent, Staff, Super Admin
- **Secure authentication** with JWT tokens
- **Role-based access control** (RBAC)
- **Password management** with reset capabilities
- **Account security** with login attempt limiting

### Student Management
- **Student registration** with or without agent referral codes
- **Comprehensive student profiles** with academic and personal information
- **Document management** for certificates and IDs
- **Academic performance tracking**
- **Attendance management**
- **Fee structure and payment tracking**

### Agent System
- **Referral code generation** for agents
- **Student enrollment tracking** through referrals
- **Commission management** system
- **Performance analytics** dashboard

### Admission System
- **Application workflow** management
- **Document verification** system
- **Interview scheduling** and assessment
- **Status tracking** throughout the process
- **Staff assignment** and workload management

### Content Management
- **Website content customization** by super admins
- **Version control** for content changes
- **Multi-media support** (images, videos, documents)
- **SEO optimization** tools

### Staff Management
- **CRUD operations** for student records
- **Restricted access** to sensitive fields (Aadhar numbers)
- **Application assignment** and tracking
- **Performance monitoring**

## 🛠️ Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT (JSON Web Tokens)
- **Password Hashing**: bcryptjs
- **Validation**: express-validator
- **Security**: Helmet, CORS, Rate Limiting
- **File Upload**: Multer
- **Environment**: dotenv

## 📋 Prerequisites

- Node.js (v16 or higher)
- MongoDB (v4.4 or higher)
- npm or yarn package manager

## 🚀 Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd swagat-odisha-backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   ```bash
   # Copy environment template
   cp env.example .env
   
   # Edit .env file with your configuration
   nano .env
   ```

4. **Environment Variables**
   ```env
   # Server Configuration
   PORT=5000
   NODE_ENV=development
   
   # MongoDB Configuration
   mongodb+srv://swagatgroup:SGClusterDB%4099%23
@cluster0.m0ymyqa.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0=mongodb://localhost:27017/swagat_odisha
   
   # JWT Configuration
   56e1a1fcf2aaab953f41c314592102e6f62e9aa540d36906dc7a90dd814a4910538858e126364378ecb0d60922fbed=your_super_secret_jwt_key_here
   JWT_EXPIRE=7d
   
   # Cloudinary Configuration (optional)
   CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
   CLOUDINARY_API_KEY=your_cloudinary_api_key
   CLOUDINARY_API_SECRET=your_cloudinary_api_secret
   
   # Email Configuration (optional)
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_USER=your_email@gmail.com
   SMTP_PASS=your_app_password
   ```

5. **Database Setup**
   ```bash
   # Start MongoDB service
   sudo systemctl start mongod
   
   # Or if using MongoDB Atlas, update mongodb+srv://swagatgroup:SGClusterDB%4099%23
@cluster0.m0ymyqa.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0 in .env
   ```

6. **Run the application**
   ```bash
   # Development mode
   npm run dev
   
   # Production mode
   npm start
   ```

## 📚 API Endpoints

### Authentication
- `POST /api/auth/register` - Student registration
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user profile
- `PUT /api/auth/change-password` - Change password
- `POST /api/auth/forgot-password` - Forgot password
- `PUT /api/auth/reset-password/:token` - Reset password
- `POST /api/auth/logout` - Logout

### Students
- `GET /api/students` - Get all students (Staff/Admin only)
- `GET /api/students/:id` - Get student by ID
- `PUT /api/students/:id` - Update student (Staff/Admin only)
- `DELETE /api/students/:id` - Delete student (Super Admin only)

### Agents
- `GET /api/agents` - Get all agents (Staff/Admin only)
- `GET /api/agents/:id` - Get agent by ID
- `GET /api/agents/:id/students` - Get students referred by agent

### Admissions
- `POST /api/admissions` - Create admission application
- `GET /api/admissions` - Get all admissions (Staff/Admin only)
- `GET /api/admissions/:id` - Get admission by ID
- `PUT /api/admissions/:id` - Update admission (Staff/Admin only)
- `PUT /api/admissions/:id/status` - Update admission status

### Content Management
- `GET /api/content` - Get all content
- `GET /api/content/:section` - Get content by section
- `POST /api/content` - Create content (Super Admin only)
- `PUT /api/content/:id` - Update content (Super Admin only)
- `DELETE /api/content/:id` - Delete content (Super Admin only)

### Admin Operations
- `GET /api/admin/users` - Get all users (Super Admin only)
- `PUT /api/admin/users/:id/password` - Reset user password (Super Admin only)
- `PUT /api/admin/users/:id/role` - Change user role (Super Admin only)

## 🔐 Role-Based Access Control

### Student
- View and edit own profile
- Submit admission applications
- View application status
- Upload documents

### Agent
- View own profile and referral statistics
- Track referred students
- View commission details

### Staff
- CRUD operations on student records
- Manage admission applications
- Document verification
- **Cannot**: Delete records or modify Aadhar numbers

### Super Admin
- All staff permissions
- User management (create, edit, delete)
- Role management
- Password reset for all users
- Content management
- System configuration

## 🗄️ Database Models

### User
- Basic information (name, email, phone)
- Role and access control
- Security settings
- Profile information

### Student
- Academic details
- Personal information
- Family details
- Document references
- Agent referral information

### Admission
- Application workflow
- Document verification status
- Interview scheduling
- Decision tracking

### Content
- Website content management
- Version control
- Media management
- SEO optimization

## 🔒 Security Features

- **JWT Authentication** with secure token handling
- **Password Hashing** using bcryptjs
- **Rate Limiting** to prevent abuse
- **Input Validation** with express-validator
- **CORS Protection** for cross-origin requests
- **Helmet Security** headers
- **Account Locking** after failed login attempts
- **Sensitive Field Protection** (Aadhar numbers)

## 📁 Project Structure

```
backend/
├── models/          # Database models
├── routes/          # API route handlers
├── middleware/      # Custom middleware
├── utils/           # Utility functions
├── uploads/         # File uploads
├── server.js        # Main server file
├── package.json     # Dependencies
└── README.md        # This file
```

## 🧪 Testing

```bash
# Run tests
npm test

# Run tests in watch mode
npm run test:watch
```

## 🚀 Deployment

### Production Considerations
1. Set `NODE_ENV=production`
2. Use strong JWT secret
3. Enable HTTPS
4. Set up proper MongoDB authentication
5. Configure environment variables securely
6. Set up monitoring and logging
7. Use PM2 or similar process manager

### Docker Deployment
```bash
# Build image
docker build -t swagat-odisha-backend .

# Run container
docker run -p 5000:5000 --env-file .env swagat-odisha-backend
```

## 📊 Monitoring

- Health check endpoint: `GET /health`
- Request logging with Morgan
- Error tracking and logging
- Performance monitoring

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions:
- Email: contact@swagatodisha.com
- Phone: +91 9403891555

## 🔄 Updates

- **v1.0.0**: Initial release with core functionality
- Role-based access control
- Student management system
- Agent referral system
- Content management
- Comprehensive API endpoints

---

**Built with ❤️ for Swagat Group of Institutions**
