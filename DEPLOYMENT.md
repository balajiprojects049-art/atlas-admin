# 🏋️ Atlas Fitness Elite - Gym Billing & Management System

A production-ready MERN stack application for gym billing, member management, and payment processing.

## 📁 Project Structure

```
atlas-admin/
├── client/                 # React + Vite + Tailwind frontend
│   ├── src/
│   │   ├── components/    # Reusable UI components
│   │   ├── pages/         # Page components
│   │   ├── services/      # API service layer
│   │   ├── context/       # React context providers
│   │   └── utils/         # Utility functions
│   ├── dist/              # Build output (generated)
│   ├── .env.development   # Local development config
│   ├── .env.production    # Production config
│   └── package.json
├── server/                # Express + Prisma backend
│   ├── routes/            # API route handlers
│   │   ├── auth.routes.js
│   │   ├── member.routes.js
│   │   ├── invoice.routes.js
│   │   ├── payment.routes.js
│   │   ├── analytics.routes.js
│   │   ├── settings.routes.js
│   │   └── plan.routes.js
│   ├── models/            # Database models
│   ├── middleware/        # Express middleware
│   ├── config/            # Configuration files
│   ├── services/          # Business logic
│   ├── utils/             # Utility functions
│   ├── server.js          # Express app
│   └── package.json
├── api/                   # Vercel serverless functions
│   └── index.js          # Main API entry point
├── vercel.json           # Vercel deployment config
└── .env.example          # Environment variables template
```

## 🚀 Features

### 💳 Billing & Invoicing
- Auto-generated invoice numbers
- GST calculation (18% default, configurable)
- Discount support (percentage or fixed amount)
- Late fee tracking
- Payment status (Paid, Pending, Partial, Overdue)
- Transaction ID support
- PDF invoice generation

### 👥 Member Management
- Member registration with photo upload
- Plan assignment
- Membership tracking
- Payment history
- Due date management

### 💰 Payment Processing
- Razorpay integration
- Cash payment support
- Payment verification
- Transaction history
- Partial payment tracking

### 📊 Analytics & Reports
- Revenue tracking
- Member statistics
- Payment analytics
- CSV/PDF export

## 🛠️ Tech Stack

**Frontend:**
- React 18
- Vite
- Tailwind CSS
- Axios
- React Router
- Framer Motion
- Chart.js
- React Hot Toast

**Backend:**
- Node.js
- Express
- Prisma ORM
- PostgreSQL (Neon)
- JWT Authentication
- Bcrypt
- Multer (file uploads)
- PDFKit
- Nodemailer

**Deployment:**
- Vercel (Frontend + Serverless API)
- Neon (PostgreSQL Database)

## 📦 Installation

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Git

### Local Development Setup

1. **Clone the repository**
```bash
git clone https://github.com/balajiprojects049-art/atlas-admin.git
cd atlas-admin
```

2. **Install dependencies**
```bash
# Install server dependencies
cd server
npm install

# Install client dependencies
cd ../client
npm install
```

3. **Set up environment variables**
```bash
# Copy example env file
cp .env.example server/.env

# Edit server/.env with your values
# DATABASE_URL, JWT_SECRET, RAZORPAY keys, SMTP credentials
```

4. **Run database migrations**
```bash
cd server
npx prisma generate
npx prisma db push
```

5. **Seed the database (optional)**
```bash
cd server
npm run seed
```

6. **Start development servers**
```bash
# Terminal 1 - Start backend
cd server
npm run dev

# Terminal 2 - Start frontend
cd client
npm run dev
```

Frontend: http://localhost:5173
Backend: http://localhost:5000

## 🌐 Vercel Deployment

### Step 1: Prepare Your Code
Ensure all changes are committed:
```bash
git add .
git commit -m "Ready for deployment"
git push origin main
```

### Step 2: Deploy to Vercel

1. Go to [vercel.com](https://vercel.com)
2. Click "Add New Project"
3. Import your Git repository
4. Vercel will auto-detect the configuration from `vercel.json`
5. Add environment variables (see below)
6. Click "Deploy"

### Step 3: Add Environment Variables

In Vercel Dashboard → Your Project → Settings → Environment Variables, add:

| Variable | Value | Environment |
|----------|-------|-------------|
| `DATABASE_URL` | Your Neon PostgreSQL connection string | Production |
| `JWT_SECRET` | Your JWT secret key | Production |
| `RAZORPAY_KEY_ID` | Your Razorpay key ID | Production |
| `RAZORPAY_KEY_SECRET` | Your Razorpay secret | Production |
| `SMTP_HOST` | smtp.gmail.com | Production |
| `SMTP_PORT` | 587 | Production |
| `SMTP_USER` | Your email | Production |
| `SMTP_PASS` | Your email app password | Production |
| `NODE_ENV` | production | Production |

### Step 4: Trigger Redeploy
After adding environment variables, click "Redeploy" in the Deployments tab.

## 🔧 Configuration Files

### `vercel.json`
```json
{
  "buildCommand": "cd client && npm install && npm run build",
  "outputDirectory": "client/dist",
  "installCommand": "npm install --prefix ./server",
  "rewrites": [
    {
      "source": "/api/(.*)",
      "destination": "/api"
    }
  ]
}
```

### Key Points:
- ✅ Builds client from `client/` directory
- ✅ Outputs static files to `client/dist`
- ✅ Installs server dependencies
- ✅ Routes `/api/*` to serverless function

## 🐛 Common Issues & Fixes

### Issue 1: "Function Runtimes must have a valid version"
**Fix:** Remove `version: 2` and `builds` from `vercel.json`. Use the modern config format shown above.

### Issue 2: 404 on deployed site
**Fix:** Ensure `outputDirectory` is set to `client/dist` and build command is correct.

### Issue 3: API calls fail with CORS error
**Fix:** Ensure `cors()` is enabled in `server/server.js`:
```javascript
app.use(cors());
```

### Issue 4: Database connection fails
**Fix:** Check `DATABASE_URL` in Vercel environment variables. Ensure it includes `?sslmode=require`.

### Issue 5: "Cannot find module" errors
**Fix:** Ensure `installCommand` in `vercel.json` installs server dependencies:
```json
"installCommand": "npm install --prefix ./server"
```

## 📱 API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `GET /api/auth/me` - Get current user

### Members
- `GET /api/members` - Get all members
- `GET /api/members/:id` - Get member by ID
- `POST /api/members` - Create new member
- `PUT /api/members/:id` - Update member
- `DELETE /api/members/:id` - Delete member

### Invoices
- `GET /api/invoices` - Get all invoices
- `GET /api/invoices/:id` - Get invoice by ID
- `POST /api/invoices` - Create new invoice
- `PUT /api/invoices/:id` - Update invoice
- `DELETE /api/invoices/:id` - Delete invoice
- `GET /api/invoices/:id/download` - Download PDF

### Payments
- `POST /api/payments/create` - Create Razorpay order
- `POST /api/payments/verify` - Verify payment
- `GET /api/payments/history/:memberId` - Get payment history

### Analytics
- `GET /api/analytics/dashboard` - Dashboard stats
- `GET /api/analytics/revenue` - Revenue data
- `GET /api/analytics/members` - Member stats

## 🔐 Security Best Practices

1. **Never commit `.env` files** - Use `.env.example` as template
2. **Use strong JWT secrets** - Generate with `openssl rand -base64 32`
3. **Enable HTTPS only** - Vercel provides this automatically
4. **Validate all inputs** - Use middleware for validation
5. **Rate limiting** - Implement for API endpoints
6. **SQL injection protection** - Prisma handles this automatically

## 📄 License

MIT License - feel free to use for your projects!

## 👨‍💻 Author

Atlas Fitness Elite Development Team

## 🤝 Contributing

Contributions welcome! Please open an issue or submit a PR.

---

**Built with ❤️ for gym owners worldwide**
