# 🌐 Centralized URL Configuration

## Overview

This document explains how to manage URLs across the entire monorepo when changing domains or deployment URLs. All CORS configurations now use environment variables instead of hardcoded URLs.

## 🎯 Problem Solved

**Before**: URLs were hardcoded in multiple files across the codebase
- `apps/cms/src/middleware.ts`
- `apps/cms/src/payload.config.ts` 
- `apps/cms/src/app/(payload)/api/trainee-register/route.ts`
- And potentially many more places

**After**: All URLs are centralized in environment variables
- Single source of truth in `.env` files
- No code changes needed when changing domains
- Consistent configuration across all CORS settings

## 🔧 Configuration

### Environment Variables

Add these to your `apps/cms/.env` file:

```bash
# ========================================
# CENTRALIZED URL CONFIGURATION
# ========================================

# Production URLs (update these when changing domains)
NEXT_PUBLIC_WEB_URL=https://your-web-app.com
NEXT_PUBLIC_WEB_ADMIN_URL=https://your-admin.com
NEXT_PUBLIC_CMS_URL=https://your-cms.com

# Additional allowed origins (comma-separated)
ALLOWED_ORIGINS=https://additional-domain.com,https://another-domain.com
```

### How It Works

1. **Middleware CORS**: Uses `getAllowedOrigins()` function that reads from env vars
2. **PayloadCMS CORS**: Reads from `NEXT_PUBLIC_*` environment variables
3. **PayloadCMS CSRF**: Same configuration as CORS for consistency
4. **API Route CORS**: Uses the same `getAllowedOrigins()` pattern

## 🚀 Changing Domains

### For Production Deployment

1. **Update environment variables** in your deployment platform (Vercel, etc.):
   ```bash
   NEXT_PUBLIC_WEB_URL=https://your-new-domain.com
   NEXT_PUBLIC_WEB_ADMIN_URL=https://admin.your-new-domain.com
   NEXT_PUBLIC_CMS_URL=https://api.your-new-domain.com
   ```

2. **Update local `.env` file** for development:
   ```bash
   # In apps/cms/.env
   NEXT_PUBLIC_WEB_URL=https://your-new-domain.com
   NEXT_PUBLIC_WEB_ADMIN_URL=https://admin.your-new-domain.com
   NEXT_PUBLIC_CMS_URL=https://api.your-new-domain.com
   ```

3. **Deploy the changes** - No code modifications needed!

### For Development

Local development automatically uses localhost origins, so no changes needed for local development.

## 📁 Files That Use This Configuration

- `apps/cms/src/middleware.ts` - Main CORS middleware
- `apps/cms/src/payload.config.ts` - PayloadCMS CORS and CSRF
- `apps/cms/src/app/(payload)/api/trainee-register/route.ts` - API route CORS
- Any future API routes that need CORS configuration

## 🔒 Security Benefits

1. **Centralized Control**: All CORS settings managed from one place
2. **Environment-Specific**: Different URLs for dev/staging/production
3. **Flexible**: Easy to add new domains via `ALLOWED_ORIGINS`
4. **Maintainable**: No code changes needed for URL updates

## 🛠️ Adding New Domains

To add a new domain temporarily:

```bash
# Add to ALLOWED_ORIGINS in .env
ALLOWED_ORIGINS=https://existing-domain.com,https://new-domain.com
```

To add a new permanent domain, add a new environment variable and update the configuration functions.

## 📝 Best Practices

1. **Always use HTTPS** in production environment variables
2. **Keep localhost origins** for development
3. **Use specific domains** instead of wildcards for security
4. **Document any new domains** added to `ALLOWED_ORIGINS`
5. **Test CORS** after any domain changes

## 🔍 Troubleshooting

### CORS Errors After Domain Change

1. Check environment variables are set correctly
2. Verify deployment platform has the new environment variables
3. Restart the application after environment variable changes
4. Check browser developer tools for specific CORS error messages

### Local Development Issues

Make sure your local `.env` file includes the localhost origins:
```bash
# These are automatically included in the code, but verify if issues occur
http://localhost:3000  # web app
http://localhost:3001  # cms
http://localhost:3002  # web-admin
```
