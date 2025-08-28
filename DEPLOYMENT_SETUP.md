# 🚀 Deployment Setup Guide for Swagat Odisha

## 📁 Current Project Structure

```
Swagat Odisha/
├── frontend/          # Vercel Deployment (Root Directory)
│   ├── src/
│   ├── package.json
│   ├── vite.config.js
│   └── vercel.json
├── backend/           # Render Deployment
│   ├── server.js
│   ├── package.json
│   └── .env
└── vercel.json        # Project-level Vercel config
```

## 🎯 Deployment Strategy

### **Vercel (Frontend)**
- **Root Directory**: Set to `frontend` in Vercel dashboard
- **Build Command**: `npm install && npm run build`
- **Output Directory**: `dist`
- **Framework**: Vite

### **Render (Backend)**
- **Root Directory**: Set to `backend` in Render dashboard
- **Build Command**: `npm install`
- **Start Command**: `npm start`
- **Environment Variables**: Set in Render dashboard

## 🔧 Configuration Files

### 1. `vercel.json` (Project Root)
```json
{
  "buildCommand": "npm install && npm run build",
  "outputDirectory": "dist",
  "installCommand": "npm install",
  "framework": "vite",
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

### 2. `frontend/src/config/environment.js`
```javascript
const config = {
  development: {
    apiBaseURL: 'http://localhost:5000',
    timeout: 10000,
  },
  production: {
    apiBaseURL: 'https://swagat-odisha-backend.onrender.com',
    timeout: 30000,
  },
};
```

### 3. `frontend/src/utils/api.js`
```javascript
import { API_BASE_URL, API_TIMEOUT } from '../config/environment';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: API_TIMEOUT,
  // ... rest of config
});
```

## 🚀 Deployment Steps

### **Frontend (Vercel)**
1. Connect your GitHub repository to Vercel
2. Set **Root Directory** to `frontend`
3. Deploy automatically on push to main branch

### **Backend (Render)**
1. Connect your GitHub repository to Render
2. Set **Root Directory** to `backend`
3. Set environment variables:
   - `MONGODB_URI`
   - `JWT_SECRET`
   - `PORT` (optional, defaults to 5000)

## 🔄 Environment Switching

The application automatically switches between environments:

- **Development**: Uses `http://localhost:5000` (when running `npm run dev`)
- **Production**: Uses `https://swagat-odisha-backend.onrender.com` (when deployed)

## ✅ Benefits of This Setup

1. **Clean Separation**: Frontend and backend are completely separate
2. **Automatic Environment Detection**: No manual configuration needed
3. **Scalable**: Each service can scale independently
4. **Easy Development**: Local development works seamlessly
5. **Professional Deployment**: Industry-standard separation of concerns

## 🧪 Testing Your Setup

### **Local Development**
```bash
# Terminal 1: Backend
cd backend
npm run dev

# Terminal 2: Frontend
cd frontend
npm run dev
```

### **Production Testing**
1. Deploy backend to Render
2. Deploy frontend to Vercel
3. Test authentication and API calls
4. Verify environment switching works

## 🚨 Important Notes

1. **Never commit `.env` files** to version control
2. **Environment variables** must be set in Render dashboard
3. **CORS** is configured in backend for production domains
4. **API timeouts** are longer in production (30s vs 10s)

## 🔍 Troubleshooting

### **Frontend not connecting to backend**
- Check if backend is deployed and running
- Verify environment variables in Render
- Check CORS configuration

### **Build failures**
- Ensure all dependencies are in `package.json`
- Check Node.js version compatibility
- Verify build commands in deployment configs

## 📚 Next Steps

1. Deploy backend to Render
2. Deploy frontend to Vercel
3. Test authentication system
4. Test dashboard functionality
5. Monitor logs and performance

---

**🎉 Your authentication system is now ready for production deployment!**
