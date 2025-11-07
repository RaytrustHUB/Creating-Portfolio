# Environment Variables Setup Guide

## Required Environment Variables

Your project requires the following environment variables:

### 1. `DATABASE_URL`
- **Purpose**: PostgreSQL database connection string (Neon)
- **Format**: `postgresql://user:password@host/database?sslmode=require`
- **Where to get it**: Your Neon database dashboard
- **Example**: `postgresql://user:pass@ep-xxx.us-east-1.aws.neon.tech/dbname?sslmode=require`

### 2. `OPENWEATHER_API_KEY`
- **Purpose**: API key for OpenWeather API (weather dashboard feature)
- **Where to get it**: https://openweathermap.org/api
- **Format**: String (e.g., `abc123def456ghi789`)

## Setting Up Environment Variables

### For Local Development

1. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```

2. Fill in your actual values in `.env`:
   ```env
   DATABASE_URL=your_actual_database_url
   OPENWEATHER_API_KEY=your_actual_api_key
   ```

3. The `.env` file is already in `.gitignore`, so it won't be committed

### For Vercel Deployment

1. Go to your Vercel project dashboard
2. Navigate to **Settings** → **Environment Variables**
3. Add each variable:
   - **Name**: `DATABASE_URL`
   - **Value**: Your database connection string
   - **Environment**: Production, Preview, Development (select all)
   
   - **Name**: `OPENWEATHER_API_KEY`
   - **Value**: Your OpenWeather API key
   - **Environment**: Production, Preview, Development (select all)

4. Click **Save**
5. Redeploy your project for changes to take effect

## Verifying Environment Variables

### Check in Vercel Logs
1. Go to your Vercel project → **Deployments**
2. Click on a deployment → **Functions** tab
3. Check the logs for warnings about missing environment variables

### Test Endpoint
Visit: `https://www.raysapi.com/api/test`

This endpoint will show:
```json
{
  "status": "ok",
  "message": "API is working",
  "hasDatabaseUrl": true/false
}
```

## Troubleshooting

### If `DATABASE_URL` is missing:
- API endpoints will return 500 errors
- Database operations will fail
- Check Vercel dashboard → Settings → Environment Variables

### If `OPENWEATHER_API_KEY` is missing:
- Weather dashboard will fail
- Other features will still work
- This is optional for basic functionality

## Security Notes

- ✅ `.env` is in `.gitignore` - won't be committed
- ✅ `.env.example` is safe to commit (no real values)
- ✅ Vercel environment variables are encrypted
- ❌ Never commit `.env` files with real values
- ❌ Never share API keys publicly

