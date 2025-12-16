# Contact Us Implementation Guide

## 📋 Overview

This guide provides the complete implementation for a contact form in `apps/web-landing` that sends emails to `info@grandlinemaritime.com` using the Resend email service already configured in `apps/cms`.

---

## ✅ Current Status

**Contact Form Fields (apps/web-landing /contact):**
- ✅ Full Name
- ✅ Email Address
- ✅ Subject *
- ✅ Message *

**Resend Configuration (apps/cms):**
- ✅ `RESEND_API_KEY` - Already configured
- ✅ `RESEND_FROM_EMAIL=info@grandlinemaritime.com`
- ✅ `ENABLE_EMAIL_NOTIFICATIONS=true`
- ✅ `EMAIL_FROM_NAME=Grandline Maritime`
- ✅ `EMAIL_REPLY_TO=info@grandlinemaritime.com`

---

## 🏗️ Architecture: Centralized Backend Approach

**Email credentials → `apps/cms/.env` ONLY**

```
User fills form          Frontend calls API        Backend sends email
(web-landing)      →     (cms /api/contact)   →    (Resend API)
                                                           ↓
                                                    info@grandlinemaritime.com
```

**Why centralized?**
- ✅ No credential duplication
- ✅ API keys stay secure on server-side
- ✅ Follows existing password reset pattern
- ✅ Single source of truth for email operations

---

## 🔧 Implementation Steps

### Step 1: Create Contact Endpoint in apps/cms

**File:** `apps/cms/src/payload.config.ts`

**Location:** Add after line 586 (after the `/reset-password` endpoint, before the closing `]` of the `endpoints` array)

```typescript
{
  path: '/contact',
  method: 'post',
  handler: (async (req: PayloadRequest) => {
    const requestId = crypto.randomUUID();
    
    try {
      const body = await (req as any).json();
      const name = String(body?.name || '').trim();
      const email = String(body?.email || '').trim().toLowerCase();
      const subject = String(body?.subject || '').trim();
      const message = String(body?.message || '').trim();
      
      // Validation
      if (!name || !email || !subject || !message) {
        return new Response(
          JSON.stringify({
            success: false,
            message: 'All fields are required.',
          }),
          { status: 400, headers: { 'Content-Type': 'application/json' } }
        );
      }
      
      // Email validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return new Response(
          JSON.stringify({
            success: false,
            message: 'Please provide a valid email address.',
          }),
          { status: 400, headers: { 'Content-Type': 'application/json' } }
        );
      }
      
      // Send email via Resend
      const resendApiKey = process.env.RESEND_API_KEY;
      const enableEmailNotifications = process.env.ENABLE_EMAIL_NOTIFICATIONS === 'true';
      const fromEmail = process.env.RESEND_FROM_EMAIL || 'info@grandlinemaritime.com';
      const fromName = process.env.EMAIL_FROM_NAME || 'Grandline Maritime';
      
      if (resendApiKey && enableEmailNotifications) {
        try {
          const resendResponse = await fetch('https://api.resend.com/emails', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${resendApiKey}`,
            },
            body: JSON.stringify({
              from: `${fromName} <${fromEmail}>`,
              to: 'info@grandlinemaritime.com',
              replyTo: email,
              subject: `Contact Form: ${subject}`,
              html: `
                <h2>New Contact Form Submission</h2>
                <p><strong>From:</strong> ${name}</p>
                <p><strong>Email:</strong> ${email}</p>
                <p><strong>Subject:</strong> ${subject}</p>
                <hr />
                <p><strong>Message:</strong></p>
                <p>${message.replace(/\n/g, '<br />')}</p>
                <hr />
                <p style="color: #666; font-size: 12px;">This message was sent from the Grandline Maritime contact form.</p>
              `,
            }),
          });
          
          if (!resendResponse.ok) {
            const errorData = await resendResponse.text();
            console.error(`Resend API error [${requestId}]:`, errorData);
            throw new Error('Resend API request failed');
          }
          
          console.log(`✅ [${requestId}] Contact email sent successfully:`, {
            from: name,
            email: email,
            subject: subject
          });
        } catch (emailError) {
          console.error(`Contact email failed to send [${requestId}]:`, emailError);
          return new Response(
            JSON.stringify({
              success: false,
              message: 'Failed to send message. Please try again later.',
            }),
            { status: 500, headers: { 'Content-Type': 'application/json' } }
          );
        }
      } else {
        console.warn(
          `Contact email not sent [${requestId}]: missing RESEND_API_KEY or ENABLE_EMAIL_NOTIFICATIONS is not 'true'`
        );
        return new Response(
          JSON.stringify({
            success: false,
            message: 'Email service is not configured.',
          }),
          { status: 500, headers: { 'Content-Type': 'application/json' } }
        );
      }
      
      return new Response(
        JSON.stringify({
          success: true,
          message: 'Thank you for contacting us! We will get back to you soon.',
        }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      );
    } catch (error) {
      console.error(`Contact form error [${requestId}]:`, error);
      return new Response(
        JSON.stringify({
          success: false,
          message: 'An error occurred. Please try again.',
        }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }
  }) as PayloadHandler,
},
```

---

### Step 2: Update Contact Form Frontend (apps/web-landing)

**File:** `apps/web-landing/src/app/contact/page.tsx`

#### 2.1 Add Loading and Feedback States

Add these state variables after the `formData` state (around line 14):

```typescript
const [isSubmitting, setIsSubmitting] = useState(false);
const [error, setError] = useState("");
const [successMessage, setSuccessMessage] = useState("");
```

#### 2.2 Replace `handleSubmit` Function

Replace the existing `handleSubmit` function (lines 23-34) with:

```typescript
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setIsSubmitting(true);
  setError("");
  setSuccessMessage("");
  
  try {
    // Build API URL
    const apiBase = process.env.NEXT_PUBLIC_CMS_API_URL || 'https://cms.grandlinemaritime.com/api';
    const apiUrl = `${apiBase.replace(/\/$/, '')}/contact`;
    
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: formData.name,
        email: formData.email,
        subject: formData.subject,
        message: formData.message,
      }),
    });
    
    const data = await response.json();
    
    if (data.success) {
      setSuccessMessage(data.message || 'Thank you for contacting us!');
      // Reset form
      setFormData({
        name: "",
        email: "",
        subject: "",
        message: ""
      });
    } else {
      setError(data.message || 'Failed to send message. Please try again.');
    }
  } catch (err) {
    console.error('Contact form error:', err);
    setError('Network error. Please check your connection and try again.');
  } finally {
    setIsSubmitting(false);
  }
};
```

#### 2.3 Add Feedback UI

Add this code **after the `<h2>Send us a Message</h2>`** heading (around line 115-116):

```tsx
{error && (
  <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
    <p className="text-red-800">{error}</p>
  </div>
)}

{successMessage && (
  <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
    <p className="text-green-800">{successMessage}</p>
  </div>
)}
```

#### 2.4 Update Submit Button

Find the submit button (around line 181-186) and replace it with:

```tsx
<button
  type="submit"
  disabled={isSubmitting}
  className="w-full btn-primary py-4 text-lg disabled:opacity-50 disabled:cursor-not-allowed"
>
  <i className={`fas ${isSubmitting ? 'fa-spinner fa-spin' : 'fa-paper-plane'} mr-2`}></i>
  {isSubmitting ? 'Sending...' : 'Send Message'}
</button>
```

---

### Step 3: Environment Configuration

#### 3.1 apps/cms/.env

**✅ No changes needed** - Already configured with:
```env
RESEND_API_KEY=re_12eY5guo_Ki6z4XCx1jQUdsydxsHApJ9N
RESEND_FROM_EMAIL=info@grandlinemaritime.com
ENABLE_EMAIL_NOTIFICATIONS=true
EMAIL_FROM_NAME=Grandline Maritime
EMAIL_REPLY_TO=info@grandlinemaritime.com
```

#### 3.2 apps/web-landing/.env.local

**Create or update** this file with:

```env
# CMS API URL for contact form
NEXT_PUBLIC_CMS_API_URL=https://cms.grandlinemaritime.com/api

# For local development, use:
# NEXT_PUBLIC_CMS_API_URL=http://localhost:3000/api
```

#### 3.3 CORS Configuration (apps/cms)

Verify that `apps/cms/src/payload.config.ts` (lines 62-74) includes web-landing URLs in the CORS array. If not, add:

```typescript
cors: [
  // ... existing URLs ...
  'http://localhost:3003',  // Local web-landing
  'https://www.grandlinemaritime.com',  // Production web-landing (if different from WEB_PROD_URL)
],
```

---

## 🧪 Testing Guide

### Local Development Test

1. **Start both applications:**
   ```bash
   # Terminal 1 - Start CMS
   cd apps/cms
   pnpm run dev
   
   # Terminal 2 - Start web-landing  
   cd apps/web-landing
   pnpm run dev
   ```

2. **Navigate to contact page:**
   ```
   http://localhost:3003/contact
   ```

3. **Submit test form:**
   - Full Name: "Test User"
   - Email: "test@example.com"
   - Subject: "Test submission"
   - Message: "This is a test message from the contact form"

4. **Verify:**
   - ✅ Loading spinner appears
   - ✅ Success message displays: "Thank you for contacting us! We will get back to you soon."
   - ✅ Form fields are cleared
   - ✅ Email arrives at `info@grandlinemaritime.com`
   - ✅ Email contains all submitted data
   - ✅ Reply-to is set to test@example.com

### Validation Tests

Test these scenarios:

| Scenario | Expected Result |
|----------|----------------|
| Submit with empty name | Error: "All fields are required." |
| Submit with invalid email (e.g., "notanemail") | Error: "Please provide a valid email address." |
| Submit with all empty fields | Error: "All fields are required." |
| CMS server is down | Error: "Network error. Please check your connection and try again." |

### Production Checklist

Before deploying to production:

- [ ] Environment variable `NEXT_PUBLIC_CMS_API_URL` is set correctly in web-landing
- [ ] CORS allows production web-landing domain
- [ ] Test email delivery to `info@grandlinemaritime.com`
- [ ] Test reply-to functionality (reply to contact form email should go to sender)
- [ ] Verify Resend quota/limits are not exceeded

---

## 📊 Email Flow Diagram

```
┌─────────────────┐
│   User fills    │
│  contact form   │
│ (web-landing)   │
└────────┬────────┘
         │
         ▼
┌─────────────────────────────┐
│  POST /api/contact          │
│  Body: { name, email,       │
│         subject, message }  │
└────────┬────────────────────┘
         │
         ▼
┌─────────────────────────────┐
│  apps/cms validates data    │
│  • All fields present?      │
│  • Email format valid?      │
└────────┬────────────────────┘
         │
         ▼
┌─────────────────────────────┐
│  Resend API sends email     │
│  From: Grandline Maritime   │
│  To: info@grandlinemaritime │
│  Reply-to: sender's email   │
└────────┬────────────────────┘
         │
         ▼
┌─────────────────────────────┐
│  Response sent to frontend  │
│  { success: true,           │
│    message: "..." }         │
└─────────────────────────────┘
```

---

## 🔐 Security Features

✅ **API Key Protection:** Resend API key never exposed to frontend  
✅ **Server-side Validation:** All input validated on backend  
✅ **Email Validation:** Regex pattern prevents invalid emails  
✅ **CORS Protection:** Only allowed origins can call the API  
✅ **Error Masking:** Generic errors shown to users, details logged server-side  
✅ **Request ID Tracking:** Each request has unique ID for debugging

---

## 📝 Summary

### What Goes Where

| Component | Location | Status |
|-----------|----------|--------|
| Resend Credentials | `apps/cms/.env` | ✅ Already configured |
| Contact Endpoint | `apps/cms/src/payload.config.ts` | ⏳ To be added |
| Contact Form Logic | `apps/web-landing/src/app/contact/page.tsx` | ⏳ To be updated |
| CMS API URL | `apps/web-landing/.env.local` | ⏳ To be created |

### Expected Email Format

**Subject:** `Contact Form: [user's subject]`

**Body:**
```
New Contact Form Submission

From: John Doe
Email: john@example.com
Subject: Question about services

─────────────────────────

Message:
I would like to know more about your maritime training programs.

─────────────────────────
This message was sent from the Grandline Maritime contact form.
```

**Reply-to:** The sender's email address (so you can reply directly)

---

## ✨ Next Steps

1. **Implement backend endpoint** in `apps/cms/src/payload.config.ts`
2. **Update frontend** in `apps/web-landing/src/app/contact/page.tsx`
3. **Create environment file** in `apps/web-landing/.env.local`
4. **Test locally** following the testing guide
5. **Deploy to production** and verify email delivery
