# 🚀 Deployment Checklist - Swagat Odisha Backend

## ✅ **Code Issues Fixed:**
- [x] Invalid environment variable name corrected (`56e1a1fcf2aaab953f41c314592102e6f62e9aa540d36906dc7a90dd814a4910538858e126364378ecb0d60922fbed` → `JWT_SECRET`)
- [x] Server.js validation updated
- [x] Auth.js JWT signing fixed

## 🔧 **Environment Variables to Set in Render:**

### **Required Variables:**
- [ ] `PORT=10000`
- [ ] `NODE_ENV=production`
- [ ] `MONGODB_URI=mongodb+srv://swagatgroup:SGClusterDB%4099%23@cluster0.m0ymyqa.mongodb.net/swagat_odisha?retryWrites=true&w=majority&appName=Cluster0`
- [ ] `JWT_SECRET=<generate_strong_secret>`

### **Optional Variables:**
- [ ] `JWT_EXPIRE=7d`
- [ ] `CLOUDINARY_CLOUD_NAME=<your_cloud_name>`
- [ ] `CLOUDINARY_API_KEY=<your_api_key>`
- [ ] `CLOUDINARY_API_SECRET=<your_api_secret>`
- [ ] `SMTP_HOST=smtp.gmail.com`
- [ ] `SMTP_PORT=587`
- [ ] `SMTP_USER=<your_email>`
- [ ] `SMTP_PASS=<your_app_password>`
- [ ] `BCRYPT_ROUNDS=12`
- [ ] `RATE_LIMIT_WINDOW_MS=900000`
- [ ] `RATE_LIMIT_MAX_REQUESTS=100`
- [ ] `FRONTEND_URL=<your_frontend_url>`

## 🚨 **Critical Actions in Render Dashboard:**

1. **REMOVE** the old invalid variable:
   ```
   56e1a1fcf2aaab953f41c314592102e6f62e9aa540d36906dc7a90dd814a4910538858e126364378ecb0d60922fbed
   ```

2. **ADD** the new JWT_SECRET variable with a strong value

3. **UPDATE** MONGODB_URI with proper encoding

4. **Redeploy** the service

## 🧪 **Post-Deployment Testing:**

- [ ] Health endpoint responds: `/health`
- [ ] Database connection successful
- [ ] JWT authentication works
- [ ] API endpoints accessible

## 📝 **Notes:**
- The server was failing because of invalid environment variable names
- MongoDB URI needs proper URL encoding for special characters
- JWT_SECRET must be a strong, random string
- All environment variables are case-sensitive

## 🔗 **Useful Links:**
- [Render Dashboard](https://dashboard.render.com)
- [MongoDB Atlas](https://cloud.mongodb.com)
- [JWT Secret Generator](https://generate-secret.vercel.app/64)
