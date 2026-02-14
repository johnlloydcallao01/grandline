# Certificates Collection Plan

## 1. Overview
The `Certificates` collection will serve as the **authoritative source** for all system-generated course completion certificates. It will replace the need for manual `UserCertification` entries for internal courses and ensure that every issued certificate is traceable, verifiable, and immutable.

## 2. Relationships & Data Integrity
To ensure data consistency, the collection will leverage existing relationships:
- **Trainee (`trainees` collection):** Links the certificate to a specific student profile (which links to `Users`).
- **Course (`courses` collection):** Links the certificate to the specific course completed.
- **Enrollment (`course-enrollments` collection):** The critical link proving *why* the certificate was issued. This prevents "orphan" certificates and ties them to a specific enrollment record (which holds the `completedAt`, `finalGrade`, and `finalEvaluation` data).

## 3. Proposed Schema Structure

### Collection Config
- **Slug:** `certificates`
- **Admin:**
    - `useAsTitle`: `certificateCode`
    - `defaultColumns`: `['certificateCode', 'trainee', 'course', 'issueDate', 'status']`
    - `group`: 'Learning Management'

### Fields

#### A. Identity & Verification
| Field Name | Type | Required | Unique | Description |
| :--- | :--- | :--- | :--- | :--- |
| `certificateCode` | Text | Yes | Yes | A unique alphanumeric string (e.g., `CERT-2026-ABCD-1234`) for public verification. |
| `verificationUrl` | Text | No | No | Full public URL where this certificate can be verified (e.g., `https://lms.com/verify/CERT-123`). |

#### B. Relationships
| Field Name | Type | Relation To | Required | Description |
| :--- | :--- | :--- | :--- | :--- |
| `trainee` | Relationship | `trainees` | Yes | The student who earned the certificate. |
| `course` | Relationship | `courses` | Yes | The course for which the certificate was issued. |
| `enrollment` | Relationship | `course-enrollments` | Yes | The specific enrollment record triggering this certificate. |

#### C. Certificate Details
| Field Name | Type | Description |
| :--- | :--- | :--- |
| `issueDate` | Date | The official date of issuance (defaults to `now`). |
| `expiryDate` | Date | Optional. If the certification expires (e.g., recurring compliance training). |
| `file` | Upload/Relationship | Link to the generated PDF file (stored in `media` collection or S3). |
| `metadata` | JSON | Snapshot of course data at time of issue (Course Title, Instructor Name, Grade, Duration) to preserve history even if the Course record changes later. |

#### D. Status
| Field Name | Type | Options | Default | Description |
| :--- | :--- | :--- | :--- | :--- |
| `status` | Select | `active`, `revoked`, `expired` | `active` | Allows admins to revoke certificates if necessary. |

## 4. Integration Points

### A. Automatic Generation (Hook)
- **Trigger:** `CourseEnrollments` `afterChange` hook.
- **Condition:** When `finalEvaluation` changes to `passed` AND `certificateIssued` is `false`.
- **Action:**
    1. Generate PDF (using a library like `react-pdf` or `puppeteer`).
    2. Upload PDF to storage.
    3. Create `Certificates` record with new unique code.
    4. Update `CourseEnrollments` -> set `certificateIssued` to `true`.

### B. User Profile
- **Trainee Dashboard:** Query `Certificates` where `trainee` equals current user.
- **Public Profile:** Allow optional display of active certificates.

### C. Verification Portal
- A public-facing page (`/verify`) that takes a `certificateCode` and queries this collection to validate authenticity.

## 5. Security & Access Control
- **Read:**
    - Public (if verification is public).
    - Trainee (own certificates).
    - Admin/Instructor.
- **Create/Update/Delete:**
    - **Admin Only.** System-generated. Certificates should be immutable records of fact.
