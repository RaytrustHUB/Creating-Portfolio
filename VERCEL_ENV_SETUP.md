# Setting Up Environment Variables in Vercel

## ⚠️ CRITICAL: Your credentials were exposed in `env.ts`

I've deleted the `env.ts` file because it contained exposed credentials. Here's how to set up your environment variables properly:

## Required Environment Variables

Based on your `env.ts` file, you need to set these in Vercel:

### 1. DATABASE_URL
**Value to set in Vercel:**
```
postgresql://neondb_owner:npg_H8RX1cwijYvq@ep-aged-lab-adnx7xzd-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require
```

### 2. OPENWEATHER_API_KEY
**Value to set in Vercel:**
```
647acc98613912c5fa22925e0e185b0a
```

## Steps to Set Up in Vercel

1. **Go to Vercel Dashboard**
   - Visit: https://vercel.com/dashboard
   - Select your project

2. **Navigate to Settings**
   - Click on your project
   - Go to **Settings** tab
   - Click **Environment Variables** in the sidebar

3. **Add DATABASE_URL**
   - Click **Add New**
   - **Key**: `DATABASE_URL`
   - **Value**: `postgresql://neondb_owner:npg_H8RX1cwijYvq@ep-aged-lab-adnx7xzd-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require`
   - **Environment**: Select all (Production, Preview, Development)
   - Click **Save**

4. **Add OPENWEATHER_API_KEY**
   - Click **Add New**
   - **Key**: `OPENWEATHER_API_KEY`
   - **Value**: `647acc98613912c5fa22925e0e185b0a`
   - **Environment**: Select all (Production, Preview, Development)
   - Click **Save**

5. **Redeploy**
   - Go to **Deployments** tab
   - Click the three dots on the latest deployment
   - Click **Redeploy**
   - Or push a new commit to trigger a new deployment

## For Local Development

1. Create a `.env` file in your project root:
   ```bash
   # .env (this file is already in .gitignore)
   DATABASE_URL=postgresql://neondb_owner:npg_H8RX1cwijYvq@ep-aged-lab-adnx7xzd-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require
   OPENWEATHER_API_KEY=647acc98613912c5fa22925e0e185b0a
   ```

2. The `.env` file is already in `.gitignore`, so it won't be committed

## Security Notes

✅ **DO:**
- Use `.env` file for local development (already in .gitignore)
- Set environment variables in Vercel dashboard
- Use `.env.example` as a template (no real values)

❌ **DON'T:**
- Commit `.env` files with real credentials
- Create `env.ts` files with credentials
- Share API keys publicly
- Commit database connection strings

## What I Fixed

1. ✅ Deleted `env.ts` (contained exposed credentials)
2. ✅ Added `env.ts` to `.gitignore` (prevents future commits)
3. ✅ Created `.env.example` (template without real values)
4. ✅ Created this guide for Vercel setup

## Next Steps

1. Set environment variables in Vercel dashboard (see above)
2. Redeploy your project
3. Test your API endpoints
4. If you committed `env.ts` to git, **rotate your database password** in Neon dashboard

