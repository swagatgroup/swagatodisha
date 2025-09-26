# 🚀 Production Deployment Guide

## Pre-Deployment Checklist

### 1. Environment Variables
- [ ] Copy `backend/env.production.example` to `.env.production`
- [ ] Update MongoDB URI for production
- [ ] Set strong JWT secret (different from development)
- [ ] Configure Cloudinary credentials
- [ ] Set up email credentials
- [ ] Update frontend URL to production domain

### 2. Database Setup
- [ ] Ensure MongoDB Atlas cluster is running
- [ ] Verify IP whitelist includes production server
- [ ] Test database connection from production environment

### 3. Security Configuration
- [ ] Update CORS origins for production domains
- [ ] Verify SSL certificates
- [ ] Check rate limiting settings
- [ ] Validate file upload limits

### 4. Testing
- [ ] Test all API endpoints
- [ ] Verify file upload functionality
- [ ] Check email notifications
- [ ] Test authentication flow
- [ ] Verify database operations

## Deployment Steps

### Vercel Deployment
1. **Set Environment Variables in Vercel Dashboard:**
   ```
   NODE_ENV=production
   MONGODB_URI=your_production_mongodb_uri
   JWT_SECRET=your_production_jwt_secret
   CLOUDINARY_CLOUD_NAME=your_cloud_name
   CLOUDINARY_API_KEY=your_api_key
   CLOUDINARY_API_SECRET=your_api_secret
   FRONTEND_URL=https://swagatodisha.com
   ```

2. **Deploy:**
   ```bash
   vercel --prod
   ```

### Manual Server Deployment
1. **Upload files to server**
2. **Install dependencies:**
   ```bash
   npm install --production
   ```
3. **Set environment variables**
4. **Start server:**
   ```bash
   npm start
   ```

## Post-Deployment Verification

### Health Checks
- [ ] `GET /health` - Server health
- [ ] `GET /api/status` - API status
- [ ] Database connection status

### Functional Tests
- [ ] User registration
- [ ] User login
- [ ] Application submission
- [ ] File upload
- [ ] Staff review process
- [ ] Email notifications

### Performance Tests
- [ ] Response times < 2 seconds
- [ ] File uploads working
- [ ] Database queries optimized

## Troubleshooting

### Common Issues
1. **Database Connection Failed**
   - Check MongoDB URI
   - Verify IP whitelist
   - Check network connectivity

2. **CORS Errors**
   - Verify allowed origins
   - Check frontend URL configuration

3. **File Upload Issues**
   - Verify Cloudinary credentials
   - Check file size limits
   - Test upload permissions

4. **Authentication Issues**
   - Check JWT secret
   - Verify token expiration
   - Test login flow

### Monitoring
- Check server logs regularly
- Monitor database performance
- Track API response times
- Monitor error rates

## Emergency Rollback
If issues occur:
1. Revert to previous deployment
2. Check environment variables
3. Verify database connectivity
4. Test critical functionality
5. Monitor logs for errors
