# 🏋️ GymBill Pro - Professional Gym Billing & Management System

A full-stack, production-ready gym billing and management web application with **React**, **Node.js**, **MongoDB**, and **Razorpay** payment integration.

## ✨ Features

### 🔐 Authentication & Authorization
- JWT-based authentication
- Role-based access control (Admin, Staff, Trainer)
- Secure password hashing with bcryptjs
- Protected routes

### 📊 Professional Dashboard
- Total Revenue analytics
- Active Members count
- Today's Collections tracking
- Overdue Payments alerts
- Recent transactions table
- Real-time statistics

### 👥 Member Management
- Complete CRUD operations
- Auto-generated unique Member IDs (MEM-XXXX)
- Membership plan assignment
- Profile photo upload support
- Membership expiry auto-calculation
- Search and filter functionality
- Pagination for large datasets
- Status badges (Active/Expiring/Expired)

### 🧾 Billing & Invoicing
- Auto-generated invoice numbers (INV-YYYY-NNNN)
- GST-compliant invoices with CGST/SGST breakdown (18% = 9% + 9%)
- Payment status tracking (Paid/Pending/Overdue)
- Installment tracking
- Late fee auto-calculation (₹50/day after 7 days)
- PDF invoice generation
- Print functionality

### 💳 Razorpay Payment Integration
- Secure online payment gateway
- Support for UPI, Cards, Net Banking
- Payment verification with signature validation
- Order creation and tracking
- Payment history for members
- Auto status update on successful payment

### 📧 Email Notifications (Ready for Implementation)
- 3 days before membership expiry reminder
- Payment due date notification
- Overdue payment alerts
- Configurable SMTP settings
- Enable/disable toggle in settings

### 📈 Reports & Analytics
- Revenue charts (Chart.js ready)
- Membership growth visualization
- Export functionality (CSV/PDF)
- Custom date range filtering

### ⚙️ Settings Panel
- Gym information configuration
- GST number management
- Razorpay API keys setup
- SMTP email configuration
- Theme switcher (Dark/Light mode)
- Currency settings (INR ₹)

### 🎨 Modern UI/UX
- Professional SaaS billing dashboard design
- Dark gym theme (Black + Red accents) with Light mode
- Fully responsive (Mobile, Tablet, Desktop)
- Smooth animations with Framer Motion
- Loading skeletons
- Toast notifications
- Card-based layouts
- Professional data tables with search, filter, pagination

## 🚀 Tech Stack

### Frontend
- **React 18** with Vite
- **Tailwind CSS** for styling
- **Framer Motion** for animations
- **React Router v6** for navigation
- **Axios** for API calls
- **React Hot Toast** for notifications
- **Chart.js** & **react-chartjs-2** for analytics
- **jsPDF** & **jsPDF-AutoTable** for PDF generation
- **date-fns** for date handling

### Backend
- **Node.js** & **Express.js**
- **MongoDB** with Mongoose ODM
- **JWT** for authentication
- **bcryptjs** for password hashing
- **Razorpay SDK** for payments
- **Nodemailer** for emails
- **node-cron** for scheduled tasks
- **Multer** for file uploads

## 📁 Project Structure

```
gym-billing-system/
├── client/                    # React frontend
│   ├── src/
│   │   ├── components/
│   │   │   ├── layout/       # Sidebar, Navbar, DashboardLayout
│   │   │   └── ui/           # Card, Button, Input, Table, Modal, Badge
│   │   ├── context/          # AuthContext, ThemeContext
│   │   ├── pages/            # Login, Dashboard, Members, Invoices, Reports, Settings
│   │   ├── services/         # API service layer
│   │   ├── utils/            # Helper functions
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── package.json
│   └── tailwind.config.js
│
└── server/                    # Node.js backend
    ├── models/               # User, Member, Plan, Invoice
    ├── routes/               # API routes
    ├── middleware/           # Auth middleware
    ├── services/             # Email, Razorpay, Cron services
    ├── server.js
    ├── seed.js              # Sample data generator
    ├── package.json
    └── .env
```

## 🛠️ Installation & Setup

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (local or Atlas)
- Razorpay account (for payment testing)

### 1. Clone & Navigate
```bash
cd "c:\Users\hp\OneDrive\Desktop\staffarc\Atlas Admin\gym-billing-system"
```

### 2. Backend Setup
```bash
cd server
npm install
```

Create `.env` file (already created with template):
```env
MONGO_URI=mongodb://localhost:27017/gym-billing
JWT_SECRET=gym_billing_secret_key_2026_secure_random_string
PORT=5000

# Razorpay (Get from: https://dashboard.razorpay.com/app/keys)
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_secret

# SMTP Email
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password
```

Seed the database with demo data:
```bash
npm run seed
```

Start the backend:
```bash
npm run dev
```
Server will run on: `http://localhost:5000`

### 3. Frontend Setup
Open a new terminal:
```bash
cd client
npm install
npm run dev
```
Frontend will run on: `http://localhost:5173`

## 🔑 Demo Credentials

After seeding the database, use these credentials to login:

| Role    | Email              | Password  |
|---------|--------------------|-----------|
| Admin   | admin@gym.com      | admin123  |
| Staff   | staff@gym.com      | staff123  |
| Trainer | trainer@gym.com    | trainer123|

## 🎯 Usage Guide

### For Admin:
- Full access to all features
- Add/Edit/Delete members
- Create and manage invoices
- Process payments
- Configure settings (Gym info,GST, Razorpay, SMTP)
- View analytics and reports
- Export data

### For Staff:
- View dashboard
- Add/Edit members (cannot delete)
- Create invoices
- Process payments
- View reports
- **Cannot** access Settings

### For Trainer:
- View-only access to:
  - Dashboard statistics
  - Member list
  - Reports
- **Cannot** create/edit members or invoices

## 💰 Razorpay Payment Flow

1. User clicks **"Pay Now"** on an invoice
2. Frontend calls `/api/payments/create` with invoice ID
3. Backend creates Razorpay order and returns `order_id`
4. Razorpay checkout modal opens
5. User completes payment (UPI/Card/Net Banking)
6. On success, frontend calls `/api/payments/verify` with payment details
7. Backend verifies signature and updates invoice status to **"Paid"**
8. Payment ID and Order ID are stored in the database
9. Success notification shown to user

### Testing Payments
Use **Razorpay Test Mode** credentials:
- Test Card: `4111 1111 1111 1111`
- CVV: Any 3 digits
- Expiry: Any future date
- OTP: `123456`

## 🧾 GST Invoice Format

The system generates professional GST-compliant invoices:
- Gym Logo and Details
- GST Number
- Invoice Number (Auto-generated)
- Member Information
- Plan Details
- Base Amount
- **CGST @ 9%**
- **SGST @ 9%**
- **Total Amount (₹)**
- Payment Status
- Download PDF / Print options

## 📧 Email Notifications

Configure in Settings panel:
1. Set SMTP Host, Port, User, Password
2. Enable/Disable notifications toggle
3. Automatic emails sent for:
   - **3 days before** membership expiry
   - **On due date** for pending payments
   - **Overdue** payment alerts

For testing, use services like **Mailtrap** or **Gmail with App Password**.

## 🔒 Security Features

- Password hashing with bcrypt
- JWT token-based authentication
- Protected API routes
- Role-based access control
- Input validation
- CORS configuration
- Secure payment verification

## 📱 Responsive Design

- **Mobile** (375px+): Collapsible sidebar, touch-friendly UI
- **Tablet** (768px+): Optimized layout
- **Desktop** (1920px+): Full dashboard experience

## 🎨 Theme System

Toggle between:
- **Dark Theme** (Default): Black (#0a0a0a) + Red (#ef4444) accents
- **Light Theme**: White (#ffffff) + Gray tones

Preference saved in localStorage.

## 🚧 Future Enhancements

- Attendance tracking with QR code check-in
- Member mobile app
- SMS notifications
- Biometric integration
- Workout plan management
- Diet chart tracking
- Trainer scheduling
- Equipment inventory
- Photo gallery
- Staff attendance

## 📝 API Endpoints

### Authentication
- `POST /api/auth/login` - Login
- `GET /api/auth/me` - Get current user
- `POST /api/auth/logout` - Logout

### Members
- `GET /api/members` - Get all members
- `GET /api/members/:id` - Get single member
- `POST /api/members` - Create member
- `PUT /api/members/:id` - Update member
- `DELETE /api/members/:id` - Delete member

### Invoices
- `GET /api/invoices` - Get all invoices
- `GET /api/invoices/:id` - Get single invoice
- `POST /api/invoices` - Create invoice
- `PUT /api/invoices/:id` - Update invoice
- `DELETE /api/invoices/:id` - Delete invoice

### Payments
- `POST /api/payments/create` - Create Razorpay order
- `POST /api/payments/verify` - Verify payment
- `GET /api/payments/history/:memberId` - Payment history

### Analytics
- `GET /api/analytics/dashboard` - Dashboard stats
- `GET /api/analytics/revenue` - Revenue data
- `GET /api/analytics/members` - Member growth

### Settings
- `GET /api/settings` - Get settings
- `PUT /api/settings` - Update settings

## 🤝 Support

For issues or questions:
- Check MongoDB is running
- Verify `.env` configuration
- Ensure port 5000 and 5173 are not in use
- Check browser console for errors

## 📄 License

MIT License - feel free to use for your gym business!

---

**Built with ❤️ for professional gym management**
