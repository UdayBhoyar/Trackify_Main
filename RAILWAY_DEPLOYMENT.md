# Railway Deployment Guide for Trackify Pro Backend

## Prerequisites
- MongoDB Atlas connection string (you already have this!)
- Railway.app account (free)
- Your Vercel frontend URL

---

## Step 1: Prepare MongoDB Connection

Your MongoDB connection string needs the password filled in:
```
mongodb+srv://udaybhoyar796_db_user:YOUR_ACTUAL_PASSWORD@cluster0.as6hpte.mongodb.net/?appName=Cluster0
```

Replace `YOUR_ACTUAL_PASSWORD` with the password you set in MongoDB Atlas.

---

## Step 2: Generate JWT Secret Key

Run this in PowerShell to generate a strong random key:
```powershell
# Generate 64-character random key
-join ((65..90) + (97..122) + (48..57) + (33..47) | Get-Random -Count 64 | ForEach-Object {[char]$_})
```

Copy the output - you'll need it!

---

## Step 3: Deploy to Railway

### Option A: Using Railway Web Dashboard (Easiest)

1. Go to https://railway.app and sign up
2. Click **New Project** → **Deploy from GitHub repo**
3. Authorize Railway to access your GitHub
4. Select your `Trackify_Main` repository
5. Railway will auto-detect it's a .NET project
6. Click **Add variables** and set these:

**Environment Variables:**
```
Mongo__ConnectionString = mongodb+srv://udaybhoyar796_db_user:YOUR_PASSWORD@cluster0.as6hpte.mongodb.net/trackify_pro?retryWrites=true&w=majority

Jwt__Key = (paste your generated 64-char key here)

ASPNETCORE_URLS = http://0.0.0.0:$PORT

FRONTEND_URL = https://your-vercel-app.vercel.app

Seed__AdminEmail = admin@trackify.com

Seed__AdminPassword = YourNewSecurePassword123!
```

7. Click **Deploy**
8. Railway will build and deploy your app
9. You'll get a URL like: `https://trackify-api-production.up.railway.app`

### Option B: Using Railway CLI

```bash
# Install Railway CLI
npm i -g @railway/cli

# Login
railway login

# Initialize project
cd api
railway init

# Set environment variables
railway variables set Mongo__ConnectionString="mongodb+srv://..."
railway variables set Jwt__Key="your-64-char-key"
railway variables set ASPNETCORE_URLS="http://0.0.0.0:$PORT"
railway variables set FRONTEND_URL="https://your-vercel-app.vercel.app"

# Deploy
railway up
```

---

## Step 4: Get Your Railway URL

After deployment, Railway will give you a public URL:
- Example: `https://trackify-api-production.up.railway.app`

Copy this URL - you'll need it for the frontend!

---

## Step 5: Update Frontend Environment

Update `frontend/src/environments/environment.prod.ts`:
```typescript
export const environment = {
  production: true,
  apiUrl: 'https://trackify-api-production.up.railway.app/api'
};
```

Replace with your actual Railway URL.

---

## Step 6: Update Vercel Environment Variable

In Vercel dashboard:
1. Go to your project settings
2. Click **Environment Variables**
3. Add: `NEXT_PUBLIC_API_URL` = `https://trackify-api-production.up.railway.app/api`
4. Redeploy your frontend

---

## Step 7: Test the Deployment

```bash
# Test API health
curl https://trackify-api-production.up.railway.app/api/auth/me

# Should return 401 Unauthorized (which is correct - you're not logged in)
```

---

## Costs

**Railway Free Tier:**
- $5 credit per month
- Usually enough for small apps
- No credit card required initially

**When you exceed free tier:**
- Pay only for what you use
- Usually $1-3/month for small apps

---

## Troubleshooting

### App crashes on Railway
- Check Railway logs: Dashboard → Your service → **Logs**
- Common issues:
  - MongoDB connection string incorrect
  - Port binding (make sure `ASPNETCORE_URLS=http://0.0.0.0:$PORT`)
  - Missing environment variables

### CORS errors
- Make sure `FRONTEND_URL` environment variable is set to your Vercel URL
- Include the protocol (https://)
- No trailing slash

### 502 Bad Gateway
- App is starting up (wait 30 seconds)
- Check Railway logs for errors

---

## Alternative: Render.com

If Railway doesn't work, try Render.com:

1. Go to https://render.com
2. New → Web Service
3. Connect your GitHub repo
4. Select `api` folder
5. Settings:
   - **Build Command:** `dotnet publish -c Release -o out`
   - **Start Command:** `dotnet out/Trackify.Api.dll`
6. Add same environment variables as above
7. Deploy

---

## Quick Checklist

- [ ] MongoDB password filled in connection string
- [ ] JWT secret key generated (64 chars)
- [ ] Railway project created
- [ ] Environment variables set in Railway
- [ ] Backend deployed successfully
- [ ] Railway URL obtained
- [ ] Frontend environment.prod.ts updated
- [ ] FRONTEND_URL set in Railway for CORS
- [ ] Test API endpoint works

---

## Next Steps After Deployment

1. Test login on your Vercel site
2. Create a test expense
3. Check MongoDB Atlas to see data
4. Update admin password immediately!

---

**Need help?** Check Railway logs for any errors.
