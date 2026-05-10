# Analysis of `/register` Form Fields & Backend Connections

This document details exactly how every field in the frontend registration form (`apps/web/src/app/(auth)/register/page.tsx`) is mapped to the backend database schema via the API endpoint (`apps/cms/src/app/api/trainee-register/route.ts`).

## 1. Personal Information

| Frontend Field | Frontend State | Backend API Variable | Payload CMS Collection | Field Type in DB |
| :--- | :--- | :--- | :--- | :--- |
| **First Name \*** | `formData.firstName` | `firstName` | `users` | Text |
| **Middle Name** | `formData.middleName` | `middleName` | `users` | Text (Optional) |
| **Last Name \*** | `formData.lastName` | `lastName` | `users` | Text |
| **Name Extension** | `formData.nameExtension` | `nameExtension` | `users` | Text (Optional) |
| **Gender \*** | `formData.gender` | `gender` | `users` | Select/Enum |
| **Civil Status \***| `formData.civilStatus` | `civilStatus` | `users` | Select/Enum |
| **Nationality \*** | `formData.nationality` | `nationality` | `users` | Text |
| **Birth Date \*** | `formData.birthDate` | `birthDate` | `users` | Date (String) |
| **Place of Birth \***| `formData.placeOfBirth` | `placeOfBirth` | `users` | Text |
| **Complete Address \***| `formData.completeAddress` | `completeAddress` | `users` | Textarea/Text |

> **SRN \*** (`formData.srn`) is visually located in the Personal Information section on the frontend, but it is stored differently in the backend. The API maps `srn` to the `trainees` collection, not the `users` collection. It triggers the creation/update of a `Trainees` document linked to the newly created user's ID.

## 2. Contact Information

| Frontend Field | Frontend State | Backend API Variable | Payload CMS Collection | Field Type in DB |
| :--- | :--- | :--- | :--- | :--- |
| **Email \*** | `formData.email` | `email` | `users` | Text (Unique) |
| **Phone Number \***| `formData.phoneNumber` | `phone` | `users` | Text (Unique) |

*Note: The frontend uses the key `phoneNumber`, but the API endpoint specifically maps `body.phoneNumber` to `phone` before inserting it into the `users` collection.*

## 3. Username & Password

| Frontend Field | Frontend State | Backend API Variable | Payload CMS Collection | Field Type in DB |
| :--- | :--- | :--- | :--- | :--- |
| **Username \*** | `formData.username` | `username` | `users` | Text (Unique) |
| **Password \*** | `formData.password` | `password` | `users` | Hidden (Hashed by Payload) |
| **Confirm Password \***| `formData.confirmPassword` | `confirmPassword` | N/A | N/A (Validation only) |

*Note: `confirmPassword` is only used for frontend Zod validation (`apps/web/src/server/validators/user-registration-schemas.ts`) to ensure it matches the `password` field. It is sent to the API for logging but is intentionally ignored during the database insertion.*

## 4. Marketing

| Frontend Field | Frontend State | Backend API Variable | Payload CMS Collection | Field Type in DB |
| :--- | :--- | :--- | :--- | :--- |
| **Coupon Code** | `formData.couponCode` | `couponCode` | `trainees` | Text (Optional) |

*Note: The `couponCode` is mapped to the `Trainees` collection, tying the promotional code directly to the trainee's academic record rather than their base user profile.*

## 5. In Case of Emergency

All fields in this section are extracted from the request body and inserted into a completely separate `emergency-contacts` collection in Payload CMS. This collection links back to the user via a relational field (`user: user.id`).

| Frontend Field | Frontend State | Backend API Variable | Payload CMS Collection | Field Type in DB |
| :--- | :--- | :--- | :--- | :--- |
| **First Name \*** | `formData.emergencyFirstName` | `firstName` | `emergency-contacts` | Text |
| **Middle Name** | `formData.emergencyMiddleName` | `middleName` | `emergency-contacts` | Text (Nullable) |
| **Last Name \*** | `formData.emergencyLastName` | `lastName` | `emergency-contacts` | Text |
| **Contact Number \***| `formData.emergencyContactNumber` | `contactNumber` | `emergency-contacts` | Text |
| **Relationship \***| `formData.emergencyRelationship` | `relationship` | `emergency-contacts` | Select/Enum |
| **Complete Address \***| `formData.emergencyCompleteAddress`| `completeAddress` | `emergency-contacts` | Text |

*Note: The API automatically flags this contact with `isPrimary: true` when inserting it into the `emergency-contacts` collection.*

---

## 🏗️ Technical Execution Flow Summary

When the user clicks "Create Account", the following sequential database operations occur via `apps/cms/src/app/api/trainee-register/route.ts`:

1. **Validation**: The frontend validates inputs via Zod. The backend verifies all required fields are present.
2. **User Creation**: Payload creates a new document in the `Users` collection with `role: 'trainee'` and all standard fields (Name, Contact, Address, etc.).
3. **Trigger Catching/Trainee Creation**: 
   - A PostgreSQL trigger (`create_role_record`) automatically fires upon User creation and inserts a default `Trainees` record.
   - The API detects this, fetches the auto-generated `Trainees` record, and **Updates** it with the user-provided `SRN` and `Coupon Code`.
4. **Emergency Contact Creation**: Payload creates a new document in the `EmergencyContacts` collection, linking it directly to the newly generated `user.id`.