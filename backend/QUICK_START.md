# 🚀 Quick Start Guide

Get your Swagat Odisha Backend running in minutes!

## ⚡ Quick Setup

### 1. Install Dependencies
```bash
npm install
```

### 2. Environment Setup
```bash
# Copy environment template
cp env.example .env

# Edit .env file with your settings
# At minimum, set a strong 56e1a1fcf2aaab953f41c314592102e6f62e9aa540d36906dc7a90dd814a4910538858e126364378ecb0d60922fbed
```

### 3. Database Setup
```bash
# Make sure MongoDB is running
# Then run the setup script
npm run setup
```

### 4. Start Development Server
```bash
npm run dev
```

Your API will be running at `http://localhost:5000`

## 🧪 Test the API

### Health Check
```bash
curl http://localhost:5000/health
```

### Super Admin Login
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@swagatodisha.com",
    "password": "admin123456"
  }'
```

## 📱 Default Credentials

- **Email**: admin@swagatodisha.com
- **Password**: admin123456
- **Role**: Super Admin

⚠️ **Change this password immediately after first login!**

## 🔗 API Endpoints

- **Health**: `GET /health`
- **Auth**: `POST /api/auth/login`, `POST /api/auth/register`
- **Students**: `GET /api/students` (requires auth)
- **Profile**: `GET /api/auth/me` (requires auth)

## 🐛 Troubleshooting

### MongoDB Connection Issues
- Make sure MongoDB is running
- Check your connection string in `.env`
- For local MongoDB: `sudo systemctl start mongod`

### Port Already in Use
- Change PORT in `.env` file
- Or kill the process using port 5000

### Dependencies Issues
- Delete `node_modules` and `package-lock.json`
- Run `npm install` again

## 📚 Next Steps

1. **Explore the API** using Postman or similar tool
2. **Create test data** through the API endpoints
3. **Set up your frontend** to connect to these endpoints
4. **Customize** the models and routes as needed

## 🆘 Need Help?

- Check the main README.md for detailed documentation
- Review the API endpoints in the routes folder
- Check the console for error messages

---

**Happy Coding! 🎉**
