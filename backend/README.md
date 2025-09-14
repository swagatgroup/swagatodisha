# 🚀 Swagat Odisha Backend - Production-Ready File Management System

A robust Node.js + Express backend with **Cloudflare R2** file storage and **MongoDB** metadata management, built for the Swagat Odisha Educational Management System.

## ✨ Features

- **🔐 Secure File Upload** - Support for multiple file types with validation
- **☁️ Cloudflare R2 Integration** - Scalable cloud storage with signed URLs
- **📊 MongoDB Metadata** - Rich file metadata with search and filtering
- **🛡️ Production Security** - Rate limiting, input validation, error handling
- **📈 Performance Optimized** - Connection pooling, caching, compression
- **🔍 Advanced Search** - Full-text search, filtering, and pagination
- **📱 RESTful API** - Complete CRUD operations with proper HTTP status codes

## 🛠️ Tech Stack

- **Runtime**: Node.js 16+
- **Framework**: Express.js 4.18.2
- **Database**: MongoDB with Mongoose 8.0.0
- **Storage**: Cloudflare R2 (S3-compatible)
- **File Upload**: Multer 1.4.5
- **Security**: Helmet, CORS, Rate Limiting
- **Validation**: Express Validator

## 📋 Prerequisites

- Node.js 16.0.0 or higher
- MongoDB Atlas account or local MongoDB instance
- Cloudflare R2 account with API credentials
- Git

## 🚀 Quick Start

### 1. Clone and Install

```bash
git clone <repository-url>
cd backend
npm install
```

### 2. Environment Setup

Create a `.env` file in the backend directory:

```bash
# MongoDB
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/database

# Cloudflare R2
R2_ACCOUNT_ID=your_account_id_here
R2_ACCESS_KEY_ID=your_access_key_id_here  
R2_SECRET_ACCESS_KEY=your_secret_access_key_here
R2_BUCKET_NAME=your_bucket_name_here
R2_ENDPOINT=https://your_account_id.r2.cloudflarestorage.com

# Server
PORT=5000
NODE_ENV=development

# File Upload Limits
MAX_FILE_SIZE=52428800
```

### 3. Test Connections

```bash
npm test
```

This will test:
- ✅ Environment variables
- ✅ MongoDB connection
- ✅ Cloudflare R2 connection
- ✅ File upload functionality

### 4. Start Server

```bash
# Development
npm run dev

# Production
npm start
```

## 📚 API Documentation

### Base URL
```
http://localhost:5000/api/files
```

### Endpoints

#### 📤 File Upload

**Upload Single File**
```http
POST /api/files/upload
Content-Type: multipart/form-data

Form Data:
- file: (required) File to upload
- uploadedBy: (optional) User identifier
- tags: (optional) Comma-separated tags
- isPublic: (optional) true/false
```

**Upload Multiple Files**
```http
POST /api/files/upload-multiple
Content-Type: multipart/form-data

Form Data:
- files: (required) Array of files
- uploadedBy: (optional) User identifier
- tags: (optional) Comma-separated tags
- isPublic: (optional) true/false
```

#### 📥 File Retrieval

**Get All Files**
```http
GET /api/files?page=1&limit=10&uploadedBy=user&isPublic=true&search=term&mimeType=image/jpeg&sortBy=createdAt&sortOrder=desc
```

**Get File by ID**
```http
GET /api/files/:id
```

**Download File**
```http
GET /api/files/:id/download
```

#### ✏️ File Management

**Update File Metadata**
```http
PUT /api/files/:id
Content-Type: application/json

{
  "tags": ["updated", "test"],
  "isPublic": true,
  "metadata": {
    "title": "Updated Title",
    "description": "Updated description"
  }
}
```

**Delete File**
```http
DELETE /api/files/:id
```

#### 📊 Statistics

**Get File Statistics**
```http
GET /api/files/stats
```

### Response Format

All responses follow this format:

```json
{
  "success": true,
  "message": "Operation successful",
  "data": {
    // Response data
  },
  "pagination": {
    // Pagination info (for list endpoints)
  }
}
```

### Error Format

```json
{
  "success": false,
  "message": "Error description",
  "error": "ERROR_CODE",
  "details": "Additional error details (development only)"
}
```

## 🔧 Configuration

### Environment Variables

| Variable | Description | Required | Default |
|----------|-------------|----------|---------|
| `MONGO_URI` | MongoDB connection string | Yes | - |
| `R2_ACCOUNT_ID` | Cloudflare R2 Account ID | Yes | - |
| `R2_ACCESS_KEY_ID` | Cloudflare R2 Access Key | Yes | - |
| `R2_SECRET_ACCESS_KEY` | Cloudflare R2 Secret Key | Yes | - |
| `R2_BUCKET_NAME` | Cloudflare R2 Bucket Name | Yes | - |
| `R2_ENDPOINT` | Cloudflare R2 Endpoint URL | Yes | - |
| `PORT` | Server port | No | 5000 |
| `NODE_ENV` | Environment | No | development |
| `MAX_FILE_SIZE` | Max file size in bytes | No | 52428800 (50MB) |

### File Upload Limits

- **Maximum file size**: 50MB (configurable)
- **Maximum files per request**: 10
- **Allowed file types**: Images, Documents, Videos, Audio, Archives, Text files
- **File name sanitization**: Automatic special character handling

### Supported File Types

#### Images
- JPEG, JPG, PNG, GIF, WebP, SVG, BMP, TIFF

#### Documents
- PDF, DOC, DOCX, XLS, XLSX, PPT, PPTX

#### Text Files
- TXT, CSV, HTML, CSS, JS, JSON, XML

#### Archives
- ZIP, RAR, 7Z, TAR, GZIP

#### Media
- MP4, AVI, MOV, WMV, FLV, WebM, QuickTime
- MP3, WAV, OGG, AAC

## 🛡️ Security Features

### Rate Limiting
- **General API**: 1000 requests per 15 minutes
- **File Upload**: 50 requests per 15 minutes
- **Authentication**: 5 requests per 15 minutes

### Input Validation
- File type validation
- File size limits
- Input sanitization
- SQL injection prevention
- XSS protection

### Error Handling
- Global error middleware
- Proper HTTP status codes
- No sensitive data in error responses
- Detailed logging for debugging

## 📊 Performance Features

### Database Optimization
- Connection pooling
- Automatic reconnection
- Optimized indexes
- Query optimization

### File Storage
- Efficient R2 integration
- Signed URL generation
- Automatic cleanup
- Metadata caching

### Server Optimization
- Gzip compression
- Request/response logging
- Performance monitoring
- Memory management

## 🧪 Testing

### Connection Test
```bash
npm test
```

### API Testing
Use the provided `test-endpoints.http` file with your preferred HTTP client (VS Code REST Client, Postman, etc.).

### Manual Testing
1. Start the server: `npm start`
2. Open `test-endpoints.http`
3. Update the `@baseUrl` variable
4. Run the test requests

## 🚀 Deployment

### Production Checklist

- [ ] Set all required environment variables
- [ ] Configure MongoDB Atlas with proper security
- [ ] Set up Cloudflare R2 bucket with appropriate permissions
- [ ] Configure CORS for your frontend domain
- [ ] Set up monitoring and logging
- [ ] Configure SSL/TLS certificates
- [ ] Set up backup strategies

### Environment-Specific Configuration

#### Development
```bash
NODE_ENV=development
PORT=5000
```

#### Production
```bash
NODE_ENV=production
PORT=5000
```

### Docker Deployment (Optional)

```dockerfile
FROM node:16-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 5000
CMD ["npm", "start"]
```

## 📈 Monitoring and Logging

### Health Checks
- **Basic Health**: `GET /health`
- **API Health**: `GET /api/health`

### Logging
- Request/response logging with Morgan
- Error logging with stack traces
- Performance monitoring
- Security event logging

### Metrics
- File upload/download counts
- Storage usage statistics
- API response times
- Error rates

## 🔧 Troubleshooting

### Common Issues

#### MongoDB Connection Failed
```
Error: MongoDB connection failed
```
**Solution**: Check your `MONGO_URI` and ensure MongoDB is accessible.

#### R2 Connection Failed
```
Error: Cloudflare R2 connection failed
```
**Solution**: Verify your R2 credentials and bucket permissions.

#### File Upload Failed
```
Error: File upload failed
```
**Solution**: Check file size limits and file type restrictions.

#### CORS Errors
```
Error: CORS policy blocked
```
**Solution**: Update CORS configuration in `server.js` for your frontend domain.

### Debug Mode

Enable detailed error logging:
```bash
NODE_ENV=development npm start
```

### Logs Location

- Console output for development
- Configure external logging service for production

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Check the troubleshooting section
- Review the API documentation

## 🔄 Changelog

### Version 1.0.0
- Initial release
- Complete file management system
- Cloudflare R2 integration
- MongoDB metadata storage
- Production-ready security features
- Comprehensive API documentation

---

**Built with ❤️ for Swagat Odisha Educational Management System**
