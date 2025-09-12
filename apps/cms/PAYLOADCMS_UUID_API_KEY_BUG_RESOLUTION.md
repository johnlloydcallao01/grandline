# PayloadCMS UUID API Key Bug Resolution

## 🚨 Root Cause Identified

The "Invalid initialization vector" error you're experiencing is caused by a **known PayloadCMS bug** where API keys are incorrectly stored as plain UUIDs instead of encrypted values.

**GitHub Issue**: https://github.com/payloadcms/payload/issues/13063 <mcreference link="https://github.com/payloadcms/payload/issues/13063" index="2">2</mcreference>

## 🔍 Technical Analysis

### What Happened
1. **Expected Behavior**: API keys should be encrypted using AES-256-CBC with proper IV
2. **Actual Behavior**: API keys were stored as plain UUIDs (e.g., `6bcffbf4-ecc9-46f7-82ae-91be3d7b897c`)
3. **Error Trigger**: When PayloadCMS tries to decrypt a UUID as if it were encrypted data, it fails with "Invalid initialization vector"

### Error Stack Trace Analysis
```
TypeError: Invalid initialization vector
    at Decipheriv.createCipherBase (node:internal/crypto/cipher:121:19)
    at BasePayload.decrypt (payload/dist/auth/crypto.js:21:29)
    at decryptKey (payload/dist/auth/baseFields/apiKey.js:3:58)
```

This confirms the error occurs in PayloadCMS's internal decryption process when handling API keys.

## ✅ Solution Applied

### Step 1: Database Analysis
- **Total users with API keys**: 3
- **Problematic (UUID) keys**: 1 (Admin user: johnlloydcallao@gmail.com)
- **Properly encrypted keys**: 2 (Service users)

### Step 2: Data Cleanup
✅ **Cleared problematic API key data** for affected user:
- Set `enable_a_p_i_key = false`
- Set `api_key = NULL`
- Set `api_key_index = NULL`

### Step 3: Verification
✅ **Confirmed**: No remaining problematic UUID keys in database

## 🎯 Next Steps to Complete the Fix

### For You to Do:
1. **Log into PayloadCMS Admin Panel**
2. **Navigate to Users Collection**
3. **Find user**: johnlloydcallao@gmail.com
4. **Re-enable API Key**: Check the "Enable API Key" checkbox
5. **Save the user**
6. **Copy the new API key** (it will be properly encrypted this time)
7. **Update your applications** with the new API key

### Expected Result
- ✅ New API key will be properly encrypted (format: `hash:encrypted_data`)
- ✅ "Invalid initialization vector" error will be resolved
- ✅ Login functionality will work normally

## 🔧 Technical Details

### Why This Bug Occurs
According to the GitHub issue <mcreference link="https://github.com/payloadcms/payload/issues/13063" index="2">2</mcreference>, this is related to PayloadCMS's `beforeChange` hook not being properly respected on the `apiKey` field, causing raw UUIDs to be written to the database instead of encrypted values.

### Prevention
- Keep PayloadCMS updated to the latest version
- Monitor for similar issues in future releases
- Always verify API key format after generation (should contain `:` for proper encryption)

## 📊 Current Status

| User | Role | Status | Action Required |
|------|------|--------|----------------|
| johnlloydcallao@gmail.com | ADMIN | ❌ API Key Cleared | Re-enable via admin panel |
| garrykasparov@gmail.com | SERVICE | ✅ Properly Encrypted | None |
| johnwebsites2@gmail.com | SERVICE | ✅ Properly Encrypted | None |

## 🔗 References

1. **PayloadCMS GitHub Issue**: https://github.com/payloadcms/payload/issues/13063 <mcreference link="https://github.com/payloadcms/payload/issues/13063" index="2">2</mcreference>
2. **Crypto IV Error Solutions**: https://stackoverflow.com/questions/76128767/getting-typeerror-invalid-initialization-vector-while-using-crypto-module-in-js <mcreference link="https://stackoverflow.com/questions/76128767/getting-typeerror-invalid-initialization-vector-while-using-crypto-module-in-js" index="1">1</mcreference>
3. **PayloadCMS Configuration**: https://payloadcms.com/docs/configuration/overview <mcreference link="https://payloadcms.com/docs/configuration/overview" index="5">5</mcreference>

## 🎉 Conclusion

This was **NOT** a cache or dependency issue, but a specific PayloadCMS bug where API keys were incorrectly stored as plain UUIDs. The solution involved:

1. ✅ **Identifying** the problematic UUID keys
2. ✅ **Clearing** the corrupted data
3. 🔄 **Re-enabling** API keys through the admin panel (your action required)

Once you re-enable the API key for the admin user, the login functionality should work perfectly!
