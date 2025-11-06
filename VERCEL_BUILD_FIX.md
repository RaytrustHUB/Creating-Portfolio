# Vercel Build Fix - TypeScript Module Resolution

## Issue
Vercel build is failing with:
```
api/_app.ts(3,32): error TS2307: Cannot find module '../server/routes' or its corresponding type declarations.
```

## Root Cause
Vercel's TypeScript compiler during build needs to resolve the `../server/routes` import, but it might not be finding the files correctly.

## Solution Applied

1. **Updated tsconfig.json**:
   - Changed `moduleResolution` from `"bundler"` to `"node"` for better compatibility
   - Ensured all folders are included: `"include": ["client/src/**/*", "db/**/*", "server/**/*", "api/**/*"]`
   - Added path aliases for better resolution

2. **Verified file structure**:
   - `api/_app.ts` imports from `../server/routes`
   - `server/routes.ts` exists and exports `registerRoutes`
   - Files are in correct locations

3. **Vercel configuration**:
   - `includeFiles: "server/**"` ensures server files are included at runtime
   - TypeScript compilation should find files via tsconfig.json

## If Issue Persists

If the build still fails, try:

1. **Check Vercel build logs** for the exact error
2. **Verify file structure** - ensure `server/routes.ts` exists
3. **Try absolute import** - change to use path alias:
   ```typescript
   import { registerRoutes } from "@server/routes";
   ```
   (But this requires runtime path resolution which might not work)

4. **Alternative**: Copy routes directly into api folder (not recommended)

## Current Status
- ✅ tsconfig.json properly configured
- ✅ Files in correct locations
- ✅ Relative imports should work
- ⚠️ Vercel build might need additional configuration

The issue is likely that Vercel's TypeScript compiler needs the files to be present during the build phase. The `includeFiles` in vercel.json is for runtime, not for TypeScript compilation.

