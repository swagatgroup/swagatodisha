# 🚀 Render Deployment Guide for Swagat Odisha Backend

## 📋 Prerequisites
- Render account (free tier available)
- MongoDB Atlas database (already configured)
- Git repository with your code

## 🔧 Step 1: Prepare Your Application

### Update Environment Variables
```env
NODE_ENV=production
PORT=10000
mongodb+srv://swagatgroup:SGClusterDB%4099%23
@cluster0.m0ymyqa.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0=mongodb+srv://swagatgroup:SGClusterDB@99#@cluster0.m0ymyqa.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0
56e1a1fcf2aaab953f41c314592102e6f62e9aa540d36906dc7a90dd814a4910538858e126364378ecb0d60922fbed=your_very_secure_56e1a1fcf2aaab953f41c314592102e6f62e9aa540d36906dc7a90dd814a4910538858e126364378ecb0d60922fbed_here
JWT_EXPIRE=7d
```

### Update package.json Scripts
```json
{
  "scripts": {
    "start": "node server.js",
    "build": "echo 'No build step required'"
  }
}
```

## 🌐 Step 2: Deploy to Render

### 2.1 Create Web Service
1. Go to [render.com](https://render.com)
2. Click **"New +"** → **"Web Service"**
3. Connect your Git repository

### 2.2 Configure Service
- **Name**: `swagat-odisha-backend`
- **Environment**: `Node`
- **Root Directory**: `backend`
- **Build Command**: `npm install`
- **Start Command**: `npm start`

### 2.3 Set Environment Variables
Add all variables from your `.env` file in Render dashboard.

## 🛠️ Step 3: Post-Deployment

### Initialize Database
```bash
npm run setup
```

### Test Super Admin Login
- **Email**: `admin@swagatodisha.com`
- **Password**: `admin123456`
- **⚠️ Change password immediately!**

## 🔒 Security & Performance

### Generate Strong JWT Secret
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

### Update Frontend API URL
```javascript
const API_BASE_URL = 'https://your-app-name.onrender.com/api';
```

## 🚨 Troubleshooting

### Common Issues:
1. **Build Failures**: Check dependencies in package.json
2. **Database Connection**: Verify MongoDB Atlas access
3. **Port Issues**: Ensure app listens on `process.env.PORT`
4. **Environment Variables**: Double-check in Render dashboard

### Debug Commands:
```bash
# Check environment
echo $NODE_ENV
echo $mongodb+srv://swagatgroup:SGClusterDB%4099%23
@cluster0.m0ymyqa.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0

# Test MongoDB connection
node -e "
const mongoose = require('mongoose');
mongoose.connect(process.env.mongodb+srv://swagatgroup:SGClusterDB%4099%23
@cluster0.m0ymyqa.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0)
  .then(() => console.log('Connected'))
  .catch(err => console.error('Error:', err.message));
"
```

## 💰 Free Tier Limits
- **Bandwidth**: 750 GB/month
- **Build Time**: 500 minutes/month
- **Sleep Mode**: After 15 minutes inactivity

## 🎯 Next Steps
1. Test all API endpoints
2. Set up monitoring
3. Configure backups
4. Implement logging
5. Set up CI/CD

---

**🎉 Your backend is now deployed globally!**

**Support**: [docs.render.com](https://docs.render.com) | [community.render.com](https://community.render.com)
