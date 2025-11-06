# Vercel Deployment Fix - API Routes Hanging

## Issue Identified

The API routes are getting stuck/hanging when fetching data. This is likely due to:

1. **Promise wrapper not resolving correctly** - The response events might not be firing
2. **Server folder bundling** - Vercel needs to include the `server/` folder in the build
3. **Database connection** - May be timing out or not connecting properly

## Fixes Applied

### 1. Improved Promise Handler (`api/[...].ts`)

**Changes:**
- Added timeout protection (30 seconds)
- Better event handling with `once()` instead of `on()`
- Prevented multiple resolve/reject calls
- Added Express error handler callback
- Better cleanup on errors

### 2. Vercel Configuration (`vercel.json`)

**Changes:**
- Added `includeFiles: "server/**"` to ensure server folder is bundled
- This ensures all files in `server/` are included in the serverless function

### 3. Important Notes

**About the Server Folder:**
- The `server/` folder IS needed for Vercel deployment
- `api/_app.ts` imports from `../server/routes`
- Vercel automatically bundles imported files, but we're explicitly including it
- The `server/index.ts` file is NOT needed (only for local dev)
- Only `server/routes.ts` is needed for the API routes

**About the Build:**
- The frontend build (`dist/public/`) serves your React portfolio
- The API routes (`api/` folder) handle all `/api/*` requests
- Vercel serves static files from `dist/public/` and routes API calls to `api/` functions

## How It Works

1. **Frontend Request**: User visits your portfolio → Vercel serves `dist/public/index.html`
2. **API Request**: Frontend calls `/api/tasks` → Vercel routes to `api/[...].ts`
3. **Handler**: `api/[...].ts` wraps Express app and handles the request
4. **Routes**: Express app uses routes from `server/routes.ts`
5. **Database**: Routes use database connection from `db/index.ts`

## Testing

After deployment, test:
1. Visit `/api/test` - Should return `{ status: "ok", message: "API is working" }`
2. Visit `/api/tasks` - Should return tasks array or empty array
3. Check Vercel logs for any errors

## Environment Variables Required

Make sure these are set in Vercel dashboard:
- `DATABASE_URL` - Your database connection string
- `OPENWEATHER_API_KEY` - Your OpenWeather API key

## Next Steps

1. Deploy to Vercel
2. Check Vercel function logs if issues persist
3. Test the `/api/test` endpoint first
4. Then test `/api/tasks` endpoint

