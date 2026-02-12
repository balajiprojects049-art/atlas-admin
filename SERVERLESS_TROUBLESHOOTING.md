# 🚀 Atlas Fitness Elite - Serverless Backend Troubleshooting Guide

## 🔍 Common 500 Error Causes & Solutions

### 1️⃣ **Missing Environment Variables**

**Symptom:** 500 error on login, health check shows "Database: Disconnected"

**Solution:** Ensure these are set in Vercel:

```env
DATABASE_URL=postgresql://username:password@host/database?sslmode=require
JWT_SECRET=your_super_secret_jwt_key_here
NODE_ENV=production
```

**How to Check:**
- Go to Vercel Dashboard → Your Project → Settings → Environment Variables
- Verify `DATABASE_URL` and `JWT_SECRET` are set for **Production**

---

### 2️⃣ **Database Connection Failure**

**Symptom:** Login returns 500, logs show "Database Connection Error"

**Causes:**
- Invalid `DATABASE_URL`
- Neon database is paused (free tier)
- SSL connection issues
- Prisma client not generated

**Solutions:**

**A. Verify DATABASE_URL format:**
```
postgresql://USER:PASSWORD@HOST:PORT/DATABASE?sslmode=require
```

**B. Wake up Neon database:**
- Go to Neon console
- Click on your database
- If paused, it will auto-wake on first connection

**C. Regenerate Prisma Client:**
```bash
cd server
npx prisma generate
git add .
git commit -m "regenerate prisma client"
git push
```

---

### 3️⃣ **JWT_SECRET Missing**

**Symptom:** Login fails at token generation step

**Error in logs:**
```
Error: secretOrPrivateKey must have a value
```

**Solution:**
Add to Vercel environment variables:
```
JWT_SECRET=gym_billing_secret_key_2026_production
```

Then redeploy.

---

### 4️⃣ **Prisma Schema Mismatch**

**Symptom:** Database queries fail, "Table does not exist" errors

**Solution:**

**A. Run migrations:**
```bash
cd server
npx prisma migrate deploy
```

**B. Or push schema:**
```bash
npx prisma db push
```

**C. Seed database:**
```bash
npm run seed
```

---

### 5️⃣ **CORS Issues**

**Symptom:** Request blocked by CORS policy

**Solution:** Already configured in `server.js`:
```javascript
app.use(cors()); // Allows all origins
```

For production, you can restrict:
```javascript
app.use(cors({
    origin: ['https://your-domain.vercel.app'],
    credentials: true
}));
```

---

### 6️⃣ **Serverless Function Timeout**

**Symptom:** Request takes too long, times out

**Vercel Limits:**
- Free tier: 10 seconds
- Pro tier: 60 seconds

**Solutions:**
- Optimize database queries
- Add indexes to frequently queried fields
- Use connection pooling

---

## 🛠️ Debugging Steps

### Step 1: Check Health Endpoint

Visit: `https://your-app.vercel.app/api/health`

**Expected Response:**
```json
{
  "status": "OK",
  "message": "Gym Billing API is running",
  "database": "Connected",
  "environment": "production"
}
```

**If database shows "Disconnected":**
- Check `DATABASE_URL` in Vercel
- Check Neon database status
- View Vercel function logs

---

### Step 2: View Vercel Logs

1. Go to Vercel Dashboard
2. Click on your project
3. Go to **Deployments**
4. Click on the latest deployment
5. Click **Functions** tab
6. Click on `/api` function
7. View **Logs**

**Look for:**
- `✅ Neon DB (PostgreSQL) Connected Successfully`
- `🔐 Login attempt: { email: '...', hasPassword: true }`
- `❌` error messages

---

### Step 3: Test Login Locally

```bash
cd server
npm install
npm run dev
```

Then test:
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@gym.com","password":"admin123"}'
```

**Expected:**
```json
{
  "success": true,
  "token": "eyJhbGc...",
  "user": { ... }
}
```

---

### Step 4: Check Database Seeding

Ensure admin user exists:

```bash
cd server
npm run seed
```

**Default credentials:**
- Email: `admin@gym.com`
- Password: `admin123`

---

## 📋 Environment Variables Checklist

### Required for Backend:

- [x] `DATABASE_URL` - Neon PostgreSQL connection string
- [x] `JWT_SECRET` - Secret key for JWT tokens
- [x] `NODE_ENV` - Set to `production`

### Optional (for full features):

- [ ] `RAZORPAY_KEY_ID` - Payment gateway
- [ ] `RAZORPAY_KEY_SECRET` - Payment gateway
- [ ] `SMTP_HOST` - Email service
- [ ] `SMTP_PORT` - Email service
- [ ] `SMTP_USER` - Email credentials
- [ ] `SMTP_PASS` - Email credentials

### Required for Frontend:

- [x] `VITE_API_URL` - Set to `/api` (already configured)

---

## 🔧 Quick Fixes

### Fix 1: Force Rebuild Without Cache

```bash
# In Vercel Dashboard:
Deployments → Latest → ... → Redeploy → Uncheck "Use existing Build Cache"
```

### Fix 2: Regenerate Everything

```bash
cd server
rm -rf node_modules package-lock.json
npm install
npx prisma generate
npm run seed
git add .
git commit -m "regenerate dependencies"
git push
```

### Fix 3: Reset Database

```bash
cd server
npx prisma migrate reset
npm run seed
```

---

## 📊 Success Indicators

✅ **Health check returns:**
```json
{
  "status": "OK",
  "database": "Connected"
}
```

✅ **Login works:**
```json
{
  "success": true,
  "token": "...",
  "user": { ... }
}
```

✅ **Vercel logs show:**
```
✅ Neon DB (PostgreSQL) Connected Successfully
🔐 Login attempt: { email: 'admin@gym.com', hasPassword: true }
🔍 Finding user: admin@gym.com
✅ User found: { id: '...', email: 'admin@gym.com' }
✅ Password valid, generating token
✅ Login successful for: admin@gym.com
```

---

## 🆘 Still Not Working?

1. **Check Vercel Function Logs** - Most errors are logged there
2. **Verify DATABASE_URL** - Copy-paste from Neon dashboard
3. **Test locally first** - `npm run dev` in server folder
4. **Check Prisma schema** - Ensure it matches your database
5. **Seed the database** - `npm run seed`

---

## 📞 Support

If you're still stuck, check:
- Vercel function logs for detailed error messages
- Neon database dashboard for connection status
- Browser console for frontend errors
- Network tab for actual API responses
