# Identity Resolution: Professional Analysis & Recommendations

## The Current Vulnerability: Broken Authentication / IDOR
Currently, your Next.js Server Action in `/certificates` trusts the client to tell it "who" is making the request:
```typescript
// Client passes the ID
const fetchedCerts = await getMyCertificates(user.id);
```

Inside the server action, you use a master `PAYLOAD_API_KEY` to bypass standard authentication and fetch the data for that `userId`. 

**Why this is not professional (Security Risk):**
This creates a classic **Insecure Direct Object Reference (IDOR)** vulnerability. A malicious user could easily intercept the request to the server action, and change the `userId` payload to another user's ID. Your server would blindly accept this and return another user's private certificates because it has no way to verify if the requester actually *owns* that ID.

## The Root Cause
Your application stores authentication tokens in the browser's `localStorage`. Next.js Server Actions run purely on the server and **cannot** read `localStorage`. Therefore, the server action is "blind" to the user's identity unless the client explicitly provides proof.

---

## Professional Recommendation: Explicit Token Passing

To make this enterprise-grade, the server must independently verify the user's identity cryptographically, rather than trusting a plain integer ID. Given that your ecosystem relies heavily on `localStorage` for authentication to avoid cookie-related API unreliability, the most pragmatic and secure approach is to pass the **JWT Token** to the server action instead of the `userId`.

**How it works:**
1. **Client-Side:** Extract the raw JWT token from `localStorage` (or your `useAuth` hook).
2. **Action Call:** Pass the token as the argument: `await getMyCertificates(token)`.
3. **Server-Side:** The server action uses this token in the `Authorization` header to request data from PayloadCMS as that specific user.

**Example Implementation:**
```typescript
// actions.ts
export async function getMyCertificates(token: string) {
  if (!token) throw new Error("Unauthorized");

  // Fetch directly from Payload using the user's own token.
  // PayloadCMS will automatically resolve the identity and apply your collection's access control rules!
  const res = await fetch(`${apiUrl}/certificates`, {
    headers: { Authorization: `JWT ${token}` }
  });
  
  const data = await res.json();
  return data.docs;
}
```

**Why it is professional:** 
The server action no longer requires a master `PAYLOAD_API_KEY`. It relies entirely on Payload's built-in access control. If the token is invalid, expired, or belongs to someone else, PayloadCMS will securely reject the request.

---

## Execution Plan
1. Update `useAuth` / `AuthContext` to expose the raw JWT token alongside the user object.
2. Update the `/certificates` client page to pass `token` instead of `user.id`.
3. Refactor `getMyCertificates` in `actions.ts` to use the `JWT <token>` header instead of the `PAYLOAD_API_KEY`. 
4. Remove the redundant manual `trainee` lookup, as Payload's Access Control will automatically filter certificates to only those owned by the authenticated user.