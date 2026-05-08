# Deep Analysis of Registration Fields to Backend Connection

This document provides a comprehensive analysis of how the fields from the `/register` page in `apps/web` are connected to the Payload CMS database (`apps/cms`).

## Flow Overview

1. **Frontend (`apps/web/src/app/(auth)/register/page.tsx`)**:
   - The user fills out a flat form containing all personal, contact, account, marketing, and emergency details.
   - Upon submission, the frontend validates the data using Zod schemas (`FlatUserRegistrationSchema` in `user-registration-schemas.ts`).
   - The data is sent as a single JSON payload to the backend API route: `POST ${NEXT_PUBLIC_API_URL}/trainee-register`.

2. **Backend API (`apps/cms/src/app/api/trainee-register/route.ts`)**:
   - This endpoint processes the flat JSON payload and distributes the data across **three different Payload CMS collections**:
     - `Users`
     - `Trainees`
     - `EmergencyContacts`

---

## Detailed Field Mapping

### 1. Personal Information
These fields are primarily stored in the `Users` collection, except for `SRN` which is role-specific.

| Frontend Field | Backend Collection | Backend Field | Notes |
| :--- | :--- | :--- | :--- |
| `firstName` | `Users` | `firstName` | Required text field. |
| `middleName` | `Users` | `middleName` | Optional text field. |
| `lastName` | `Users` | `lastName` | Required text field. |
| `nameExtension`| `Users` | `nameExtension` | Optional text field (e.g., Jr., II). |
| `gender` | `Users` | `gender` | Select field (`male`, `female`, `other`, `prefer_not_to_say`). |
| `civilStatus` | `Users` | `civilStatus` | Select field (`single`, `married`, `divorced`, `widowed`, `separated`). |
| **`srn`** | **`Trainees`** | **`srn`** | **Required unique identifier. Stored in `Trainees` collection because it's specific to the trainee role.** |
| `nationality` | `Users` | `nationality` | Required text field. |
| `birthDate` | `Users` | `birthDate` | Required date field. |
| `placeOfBirth` | `Users` | `placeOfBirth` | Required text field. |
| `completeAddress`| `Users` | `completeAddress` | Required textarea field. |

### 2. Contact Information
| Frontend Field | Backend Collection | Backend Field | Notes |
| :--- | :--- | :--- | :--- |
| `email` | `Users` | `email` | Payload CMS built-in auth field. Serves as login identifier if configured. |
| **`phoneNumber`**| **🚨 BUG / UNMAPPED** | **`phone` (missing)** | **CRITICAL ISSUE:** In `route.ts`, it tries to map `body.phoneNumber` to a `phone` field in `userData`. However, **the `Users` collection does not have a `phone` or `phoneNumber` field defined.** Payload CMS will drop this data or throw an error depending on strict validation settings. |

### 3. Username & Password
| Frontend Field | Backend Collection | Backend Field | Notes |
| :--- | :--- | :--- | :--- |
| `username` | `Users` | `username` | Unique text field used for authentication. |
| `password` | `Users` | `password` | Handled by Payload CMS auth under the hood (hashed automatically). |
| `confirmPassword`| *None* | *None* | Used strictly for frontend/zod validation. Not sent to or stored in the database. |

### 4. Marketing
| Frontend Field | Backend Collection | Backend Field | Notes |
| :--- | :--- | :--- | :--- |
| `couponCode` | `Trainees` | `couponCode` | Optional text field. Mapped to the trainee profile to track marketing conversions. |

### 5. In Case of Emergency
These fields are extracted and saved as a new document in a completely separate `EmergencyContacts` collection. This record is linked to the newly created user via the `user` relationship field.

| Frontend Field | Backend Collection | Backend Field | Notes |
| :--- | :--- | :--- | :--- |
| `emergencyFirstName` | `EmergencyContacts` | `firstName` | |
| `emergencyMiddleName`| `EmergencyContacts` | `middleName` | |
| `emergencyLastName` | `EmergencyContacts` | `lastName` | |
| `emergencyContactNumber`| `EmergencyContacts`| `contactNumber` | |
| `emergencyRelationship`| `EmergencyContacts` | `relationship` | Select field (`parent`, `spouse`, `sibling`, etc.). |
| `emergencyCompleteAddress`| `EmergencyContacts`| `completeAddress` | |
| *(Hardcoded in API)* | `EmergencyContacts` | `isPrimary` | Automatically set to `true` when created via registration. |

---

## Architecture Summary

When a user submits the registration form, the `trainee-register` API route performs the following sequential database operations:

1. **Creates the User:** Calls `payload.create({ collection: 'users' })` with personal info and credentials.
2. **Creates the Trainee:** Checks if a database trigger already created a `Trainees` record. If not, calls `payload.create({ collection: 'trainees' })` to store the `srn`, `couponCode`, and links it to the `user.id`.
3. **Creates the Emergency Contact:** Calls `payload.create({ collection: 'emergency-contacts' })` to store the emergency details and links it to the `user.id`.

### Action Items Identified During Analysis
*   **Fix the missing `phoneNumber` field**: The frontend requires `Phone Number *`, but `apps/cms/src/collections/Users.ts` does not contain a field for it. Update `Users.ts` to include `{ name: 'phone', type: 'text' }` so the data doesn't get lost.