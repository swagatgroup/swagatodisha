# 🎓 Swagat Odisha - Educational Management System

**Swagat Odisha** is a comprehensive educational management system designed for the Swagat Group of Institutions. It provides a complete solution for managing students, agents, staff, and administrative operations across multiple campuses in Odisha, India.

---

## 🚀 Tech Stack

### Frontend (React + Vite)
- **Framework**: React 18, Vite
- **Styling**: Tailwind CSS
- **Animations & 3D**: GSAP, Framer Motion, Three.js (@react-three/fiber, @react-three/drei, @splinetool/react-spline)
- **Routing**: React Router DOM v7
- **UI & Data Viz**: Recharts, React-Google-Charts, SweetAlert2, React Icons, Heroicons
- **Utilities**: Axios (API), html2canvas & jspdf (Exporting docs), web-vitals

### Backend (Node.js + Express)
- **Framework & DB**: Node.js, Express.js, MongoDB (Mongoose ODM)
- **Authentication**: JSON Web Tokens (JWT), bcryptjs
- **File Processing & Uploads**: Cloudinary, Multer, sharp, pdf-lib, pdfkit, streamifier, archiver
- **Security**: Helmet, CORS, express-rate-limit, express-validator
- **Communications**: Nodemailer, Sendgrid, Resend, Mailgun.js, Twilio
- **Other Utilities**: node-cache, qrcode, morgan, compression

---

## 📁 Project Structure

```text
swagatodisha/
├── frontend/               # React (Vite) Frontend Application
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── pages/          # Page-level components
│   │   ├── context/        # React Context for state management
│   │   ├── assets/         # Images, fonts, static assets
│   │   └── utils/          # Helper functions
│   ├── public/             # Public static files
│   ├── package.json        # Frontend dependencies
│   └── vite.config.js      # Vite configuration
│
├── backend/                # Node.js + Express Backend API
│   ├── controllers/        # Request handlers (logic)
│   ├── models/             # Mongoose schemas
│   ├── routes/             # API route definitions
│   ├── middleware/         # Custom middlewares (auth, upload, etc.)
│   ├── scripts/            # Database seeders & test scripts
│   ├── server.js           # Entry point
│   └── package.json        # Backend dependencies
│
├── .gitignore              # Git ignore rules
├── .vercelignore           # Vercel deployment ignore rules
└── README.md               # You are here!
```

---

## 👥 User Roles & Access Levels

1. **Super Administrator 🔑**: Complete system control, website content management, full audit capabilities, all CRUD operations.
2. **Staff Members 👨‍💼**: Academic and administrative operations, student management, application review, document verification.
3. **Agents 🤝**: Referral and commission management, tracking referred students, referral code generation.
4. **Students 🎓**: Personal academic portal, document upload/management, application status tracking, payment tracking.

---

## 📜 Development & Version History Context (For AI Assistants)

> **Note to AI Models**: This project has undergone over 300 commits of rapid iteration. The following is a summary of historical technical context and fixed issues that were previously documented in over 40 separate `.md` files. Please reference this context when debugging or extending the codebase.

### Architectural Milestones
- **Multi-Dashboard System**: Developed dedicated and isolated dashboard architectures for Students, Staff, Super-Admins, and Agents. Includes integrated analytics, referral modules, and dynamic status tracking.
- **Application Workflow**: Built a robust full-stack student application workflow management system with administrative oversight capabilities (`ApplicationReview`).
- **Payment Management**: Implemented a comprehensive payment tracking system allowing for installment tracking, status filters, receipt generation, debounced searching, and auto-due calculations.
- **Agent System**: Developed dynamic progress visualization and referral tracking for agents.

### Key Technical Fixes & Optimizations
- **Document Management & Cloudinary**: Extensive fixes were made to the Cloudinary upload pipeline (`CLOUDINARY_UPLOAD_FIX`, `CLOUDINARY_401_FIX`). This included fixing PDF/ZIP upload failures in production, implementing click-to-open document fixes, optimizing upload performance (compression/sharp), and refining the document status Enum workflow (Pending -> Review -> Approved/Rejected).
- **Production & Deployment**: Transitioned the app through rigorous production testing (`PRODUCTION_DEPLOYMENT_GUIDE`, `VERCEL_DEPLOYMENT_FIX`). Fixed critical production null-code errors, resolved production route mapping issues, and finalized a professional deployment strategy.
- **Email & Communications**: Extensive exploration and implementation of SMTP, Mailgun, and Resend services for reliable email delivery in production (`MAILGUN_SETUP_GUIDE`, `RESEND_SETUP`, etc.).
- **Security & Integrity**: Integrated robust rate limiting (`RATE_LIMIT_FIX`), fixed CORS configuration, implemented strict IP tracking, and built comprehensive spam protection for contact forms (`ANTI_SPAM_SETUP`). Handled complex user deletion edge cases to preserve audit tracking where necessary.
- **Frontend UI/UX**: Added deep integrations with GSAP and Three.js for interactive entrance loaders (`GatewayLoader`). Implemented debounced filter buttons, slider components, and real-time notification components (SweetAlert2/Socket implementations).

### Known Areas to Watch
- Ensure Cloudinary environment variables match the expected config when handling file uploads.
- The StudentApplication schema relies heavily on Enum states for documents; always check the Mongoose models before modifying application states.
- Be mindful of rate-limiting parameters during automated testing of production endpoints.

---

## 🚀 Installation & Setup

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (local or Atlas)

### 1. Clone & Install
```bash
git clone <repository-url>
cd swagatodisha

# Setup Backend
cd backend
npm install
cp env.example .env # Configure your .env variables
npm start

# Setup Frontend
cd ../frontend
npm install
npm run dev
```

### 2. Environment Variables (.env for backend)
```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/swagat_odisha
JWT_SECRET=your_jwt_secret_key_here
JWT_EXPIRE=7d
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
# (Add Email/SMTP configs as needed)
```

---
*This README serves as the single source of truth for the Swagat Odisha project.*
