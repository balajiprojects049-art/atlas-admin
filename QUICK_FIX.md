# Quick Fix Instructions

## Issue: API still connecting to localhost

The environment variables are set correctly in Vercel, but the build might be cached.

## Solution:

### Option 1: Force Redeploy in Vercel
1. Go to Vercel Dashboard → Deployments
2. Click on the latest deployment
3. Click the "..." menu → "Redeploy"
4. Check "Use existing Build Cache" is UNCHECKED
5. Click "Redeploy"

### Option 2: Add NODE_ENV Variable
In Vercel Environment Variables, add:
- Name: `NODE_ENV`
- Value: `production`
- Environment: Production

Then redeploy.

### Option 3: Clear Vercel Build Cache
Run this command locally:
```bash
vercel --prod --force
```

## Verify After Redeployment:

1. Hard refresh browser (Ctrl+Shift+R)
2. Open Console (F12)
3. Expand the "🔧 API Configuration: Object"
4. Verify it shows:
   - mode: "production"
   - isProd: true
   - apiUrl: "/api"

If apiUrl still shows localhost, the build cache needs to be cleared.
