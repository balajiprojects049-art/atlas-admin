# Neon DB Migration - Gym Billing System

This project has been migrated from MongoDB to Neon DB (PostgreSQL) using Prisma ORM.

## 🚀 Quick Start

### Prerequisites
- Node.js 16+
- Neon DB account (https://neon.tech)

### Setup

1. **Install dependencies:**
```bash
# Backend
cd server
npm install

# Frontend
cd client
npm install
```

2. **Configure Neon DB:**
   - Create a database at https://console.neon.tech
   - Copy your connection string
   - Update `server/.env` with your `DATABASE_URL`

3. **Run database migrations:**
```bash
cd server
npx prisma db push
npx prisma generate
```

4. **Seed demo data:**
```bash
npm run seed
```

5. **Start servers:**
```bash
# Backend (in server folder)
npm run dev

# Frontend (in client folder)
npm run dev
```

## 📝 Demo Credentials
- **Admin:** admin@gym.com / admin123
- **Staff:** staff@gym.com / staff123
- **Trainer:** trainer@gym.com / trainer123

## 🔧 Tech Stack
- **Frontend:** React + Vite + Tailwind CSS
- **Backend:** Node.js + Express + Prisma
- **Database:** Neon DB (PostgreSQL)
- **Payments:** Razorpay

## 📚 Documentation
See the full README in the project root for detailed features and API documentation.
