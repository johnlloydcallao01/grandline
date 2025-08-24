# 🚀 FCM Deployment Guide

Complete deployment guide for the Firebase Cloud Messaging implementation in the Encreasl monorepo.

## 📋 Table of Contents

- [Prerequisites](#prerequisites)
- [Environment Setup](#environment-setup)
- [Build Process](#build-process)
- [Deployment Steps](#deployment-steps)
- [Verification](#verification)
- [Troubleshooting](#troubleshooting)

## 🔧 Prerequisites

### **Required Tools**

```bash
# Node.js 18+
node --version

# pnpm package manager
npm install -g pnpm

# Firebase CLI
npm install -g firebase-tools

# Verify Firebase login
firebase login
```

### **Firebase Project Setup**

1. **Enable Required APIs**:
   - Cloud Functions API
   - Cloud Messaging API
   - Firestore API
   - Cloud Storage API

2. **Configure Authentication**:
   ```bash
   # Set up service account
   firebase projects:list
   firebase use your-project-id
   ```

## 🌍 Environment Setup

### **1. Root Environment Variables**

```bash
# .env.local (root)
FIREBASE_ADMIN_PROJECT_ID=your-project-id
FIREBASE_ADMIN_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
FIREBASE_ADMIN_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your-project.iam.gserviceaccount.com
```

### **2. Admin App Environment**

```bash
# apps/web-admin/.env.local
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789:web:abcdef123456
NEXT_PUBLIC_FIREBASE_VAPID_KEY=BLBz-HXFn0hHgLfnw8HxJQDCLOzuiTxwITjuS2Dk6RgaGbpKlkQxZF_UxHAneAID1KT1MxgN8m-PVj0B5F_R8Oc
```

### **3. Functions Environment**

```bash
# Set Firebase Functions config
firebase functions:config:set \
  firebase.project_id="your-project-id" \
  firebase.private_key="your-private-key" \
  firebase.client_email="your-client-email"
```

## 🏗️ Build Process

### **1. Install Dependencies**

```bash
# Install all monorepo dependencies
pnpm install

# Verify functions dependencies
cd functions && npm install && cd ..
```

### **2. Build Shared Packages**

```bash
# Build shared FCM package
pnpm build --filter=@encreasl/fcm

# Build auth package
pnpm build --filter=@encreasl/auth

# Build all packages
pnpm build
```

### **3. Build Functions**

```bash
# Build functions with Turborepo
pnpm build:functions

# Or build directly
cd functions && npm run build
```

### **4. Lint and Type Check**

```bash
# Lint functions
pnpm lint:functions

# Type check functions
pnpm type-check:functions

# Run all checks
turbo run lint type-check --filter=@encreasl/functions
```

## 🚀 Deployment Steps

### **Step 1: Deploy Cloud Functions**

```bash
# Deploy all functions
pnpm deploy:functions

# Or deploy specific functions
firebase deploy --only functions:onContactSubmitted,functions:sendDailyDigest

# Deploy with specific project
firebase deploy --only functions --project production
```

### **Step 2: Deploy Hosting (Admin App)**

```bash
# Build admin app
pnpm build:admin

# Deploy admin hosting
firebase deploy --only hosting:admin --project production
```

### **Step 3: Deploy Firestore Rules**

```bash
# Deploy Firestore rules and indexes
firebase deploy --only firestore --project production
```

### **Step 4: Deploy Storage Rules**

```bash
# Deploy storage rules
firebase deploy --only storage --project production
```

### **Step 5: Complete Deployment**

```bash
# Deploy everything
firebase deploy --project production
```

## ✅ Verification

### **1. Verify Functions Deployment**

```bash
# List deployed functions
firebase functions:list --project production

# Check function logs
firebase functions:log --project production

# Test specific function
firebase functions:shell --project production
```

### **2. Test FCM Functionality**

```bash
# Test notification sending
curl -X POST https://your-region-your-project.cloudfunctions.net/sendNotification \
  -H "Authorization: Bearer $(firebase auth:print-access-token)" \
  -H "Content-Type: application/json" \
  -d '{
    "target": {"type": "topic", "value": "admin-notifications"},
    "notification": {"title": "Test", "body": "Test notification"}
  }'
```

### **3. Verify Admin App**

1. Open admin app: `https://admin.your-domain.com`
2. Test FCM initialization
3. Request notification permissions
4. Subscribe to topics
5. Send test notifications

### **4. Check Analytics**

```bash
# View notification logs
firebase firestore:get notification_logs --project production

# Check FCM device registrations
firebase firestore:get fcm_devices --project production
```

## 🔍 Troubleshooting

### **Common Issues**

#### **1. Functions Build Errors**

```bash
# Clear build cache
cd functions && rm -rf lib node_modules
npm install && npm run build

# Check TypeScript errors
npm run type-check
```

#### **2. FCM Token Issues**

```bash
# Verify VAPID key configuration
firebase functions:config:get --project production

# Check service worker registration
# Open browser dev tools -> Application -> Service Workers
```

#### **3. Permission Errors**

```bash
# Check Firebase project permissions
firebase projects:list

# Verify service account permissions
gcloud projects get-iam-policy your-project-id
```

#### **4. Notification Not Received**

1. **Check browser permissions**: Ensure notifications are allowed
2. **Verify service worker**: Check if SW is registered and active
3. **Check FCM token**: Ensure token is valid and registered
4. **Review function logs**: Check for errors in Cloud Functions

### **Debug Commands**

```bash
# Enable debug logging
export DEBUG=firebase*

# Test functions locally
cd functions && npm run serve

# Check function execution
firebase functions:log --only onContactSubmitted

# Validate environment
node -e "console.log(require('./functions/lib/index.js'))"
```

## 📊 Monitoring

### **1. Cloud Functions Monitoring**

- **Firebase Console**: Monitor function executions, errors, and performance
- **Cloud Logging**: View detailed function logs
- **Cloud Monitoring**: Set up alerts for function failures

### **2. FCM Analytics**

- **Notification Logs**: Track sent, delivered, and clicked notifications
- **Device Analytics**: Monitor active devices and token registrations
- **Topic Analytics**: Track topic subscription counts

### **3. Performance Monitoring**

```bash
# Monitor function performance
firebase functions:log --only sendDailyDigest --lines 100

# Check notification delivery rates
firebase firestore:query notification_logs \
  --where status==sent \
  --order-by timestamp desc \
  --limit 100
```

## 🔄 Continuous Deployment

### **GitHub Actions Example**

```yaml
# .github/workflows/deploy-functions.yml
name: Deploy Firebase Functions

on:
  push:
    branches: [main]
    paths: ['functions/**']

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: 18
      
      - name: Install pnpm
        run: npm install -g pnpm
      
      - name: Install dependencies
        run: pnpm install
      
      - name: Build functions
        run: pnpm build:functions
      
      - name: Deploy to Firebase
        run: |
          echo "$FIREBASE_SERVICE_ACCOUNT" > service-account.json
          firebase deploy --only functions --token "$FIREBASE_TOKEN"
        env:
          FIREBASE_SERVICE_ACCOUNT: ${{ secrets.FIREBASE_SERVICE_ACCOUNT }}
          FIREBASE_TOKEN: ${{ secrets.FIREBASE_TOKEN }}
```

## 🎯 Next Steps

After successful deployment:

1. **Configure monitoring alerts**
2. **Set up backup strategies**
3. **Implement A/B testing for notifications**
4. **Optimize notification delivery times**
5. **Add advanced analytics tracking**
