# Why `apps/cms` and `apps/web` Affect Each Other's Sessions

Both applications are overwriting each other's sessions because they are using the **exact same cookie name** (`payload-token`) and are hosted on the **same domain/localhost**.

### The Root Cause:
1. **Shared Default Cookie Name**: Payload CMS inherently uses `payload-token` as the default cookie name for its authentication system (which handles the `/admin` login in `apps/cms`).
2. **Shared Frontend Cookie Name**: In `apps/web` (your frontend portal), you are also setting/reading a cookie named `payload-token` during your custom server actions (e.g., in `src/app/actions/auth.ts`).
3. **Domain Overlap**: Because both apps are accessed from the same browser context (like `localhost` or `.grandlinemaritime.com`), the browser treats them as the same domain. 

### What Happens:
- When you log in as an **Admin** in `apps/cms`, it sets a cookie `payload-token=<admin-jwt>`.
- When you open another tab to `apps/web` and log in as a **Trainee**, it sets a cookie `payload-token=<trainee-jwt>`, **overwriting the Admin cookie**.
- If you then refresh the CMS tab, Payload CMS reads the new `payload-token` (which belongs to the Trainee), realizes it's not an Admin, and either kicks you out or changes your session context.

### The Solution:
To make them completely independent, you must configure Payload CMS to use a **custom cookie prefix/name** or separate the cookie logic for the web frontend so they do not collide. 

By default, Payload CMS 3.0 allows you to change the cookie name by setting a custom prefix in the `cookiePrefix` config or `auth.cookies.name` inside the Users collection, ensuring the admin session uses `admin-payload-token` while the web uses `web-payload-token`.