# 🔧 Render Environment Variables Setup

## 🚨 **CRITICAL: Fix These Environment Variables in Render Dashboard**

### 1. **Server Configuration**
```
PORT=10000
NODE_ENV=production
```

### 2. **MongoDB Configuration**
```
MONGODB_URI=mongodb+srv://swagatgroup:SGClusterDB%4099%23@cluster0.m0ymyqa.mongodb.net/swagat_odisha?retryWrites=true&w=majority&appName=Cluster0
```

### 3. **JWT Configuration (FIXED)**
```
JWT_SECRET=your_very_secure_jwt_secret_here
JWT_EXPIRE=7d
```

### 4. **Cloudinary Configuration**
```
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
```

### 5. **Email Configuration**
```
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password
```

### 6. **Security Settings**
```
BCRYPT_ROUNDS=12
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

### 7. **Frontend URL for CORS**
```
FRONTEND_URL=https://your-frontend-domain.com
```

## 🔑 **Generate Strong JWT Secret**

Run this command to generate a secure JWT secret:
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

## 📋 **Steps to Fix in Render Dashboard:**

1. Go to your Render service dashboard
2. Click on "Environment" tab
3. **REMOVE** the old invalid variable: `56e1a1fcf2aaab953f41c314592102e6f62e9aa540d36906dc7a90dd814a4910538858e126364378ecb0d60922fbed`
4. **ADD** the new variable: `JWT_SECRET` with a strong secret value
5. **UPDATE** `MONGODB_URI` with the correct format
6. **ADD** all other required variables
7. **Redeploy** your service

## ✅ **After Fixing Environment Variables:**

1. Your server should start successfully
2. Database connection should work
3. JWT authentication should function properly
4. Health check endpoint should respond

## 🧪 **Test Your Fix:**

Once deployed, test the health endpoint:
```
https://swagat-odisha-backend.onrender.com/health
```

You should get a response like:
```json
{
  "status": "OK",
  "message": "Swagat Odisha Backend is running",
  "timestamp": "2024-01-XX..."
}
```
