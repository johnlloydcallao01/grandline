# Certificate System Implementation Plan

## 1. Objective
Implement a robust, enterprise-grade Certificate System that decouples **Design (Templates)** from **Content (Courses)** and **Records (Issued Certificates)**. This ensures scalability, immutability, and verification integrity.

## 2. Architecture Overview
The system relies on three core collections:
1.  **`CertificateTemplates`** (NEW): Stores the visual design and layout blueprints.
2.  **`Courses`** (UPDATE): Links a course to a specific certificate template.
3.  **`Certificates`** (EXISTING): Stores the immutable record of an issued certificate.

---

## 3. CMS / Database Implementation

### A. Create `CertificateTemplates` Collection
**Purpose:** Store the reusable design blueprints created by the Admin.

**Fields:**
*   `name` (Text, Required): Internal name (e.g., "Standard Completion Template").
*   `slug` (Text, Unique): URL-friendly identifier.
*   `backgroundImage` (Upload, Required): The base certificate design (borders, logos) without dynamic text.
*   `canvasSchema` (JSON, Required): Stores the layout configuration from the Drag-and-Drop builder.
    *   *Example Structure:*
        ```json
        {
          "width": 1123,
          "height": 794,
          "elements": [
            { "id": "el_1", "type": "text", "field": "student_name", "x": 400, "y": 300, "fontSize": 48, "fontFamily": "Serif", "color": "#000000" },
            { "id": "el_2", "type": "text", "field": "course_title", "x": 400, "y": 450, "fontSize": 24, "fontFamily": "Sans", "color": "#333333" }
          ]
        }
        ```
*   `status` (Select): `draft` | `published` | `archived`.

### B. Update `Courses` Collection
**Purpose:** Define which certificate is issued when a specific course is completed.

**Changes:**
*   Add Field: `certificateTemplate`
    *   Type: Relationship (to `CertificateTemplates`)
    *   HasMany: `false`
    *   Required: `false` (Not all courses yield certificates).

### C. Verify `Certificates` Collection (Existing)
**Purpose:** Ensure the existing collection supports the snapshot logic.

**Verification Checklist:**
*   Ensure `metadata` field is present (Type: JSON) to store the **Snapshot** of student/course data at the moment of issuance.
*   Ensure `certificateCode` is unique and indexed.
*   Ensure `verificationUrl` is generated correctly.

---

## 4. Frontend Implementation (Admin Portal)

### Certificate Builder UI (Drag-and-Drop + HTML/CSS Engine)
*   **The "Magic" UX:** To the Admin, this **feels exactly like a Drag-and-Drop Canvas** (like Canva/Figma). They drag text boxes, resize them, and position them visually.
*   **The "Real" Engine (HTML & CSS):** Under the hood, we are **NOT** drawing pixels on a `<canvas>`.
    *   Every "dragged item" is actually a `<div>` being moved with CSS `transform` or `absolute` positioning.
    *   **Why?** This ensures that what the Admin sees is **exactly** what the HTML-to-PDF engine will print. It guarantees "What You See Is What You Get" for font rendering, line breaks, and resolution.
*   **Library Strategy:** We can use `interact.js` or `react-draggable` to make HTML elements draggable over a background `<img>`.
*   **Features:**
    1.  **Upload Background:** Admin uploads the blank certificate image.
    2.  **Toolbox:** List of available variables:
        *   `{{Student Name}}`
        *   `{{Course Title}}`
        *   `{{Completion Date}}`
        *   `{{Instructor Name}}`
        *   `{{Certificate ID}}`
        *   `{{QR Code}}` (Verification Link)
    3.  **Canvas:** Admin drags variables onto the background.
    4.  **Properties Panel:** Admin adjusts Font Size, Color, Alignment (Left/Center/Right), and Font Family.
    5.  **Save:** Serializes the state into the `canvasSchema` JSON format (Coordinates & Styles) and saves to CMS.

---

## 5. Backend Implementation (Issuance Engine)

### A. Trigger: Course Completion
*   Listen for `CourseProgress` reaching 100% or `FinalExam` passed.
*   Check if `Course` has a `certificateTemplate` assigned.
*   If yes, initiate issuance workflow.

### B. Snapshot & Record Creation
1.  Fetch `Student` data (Name).
2.  Fetch `Course` data (Title, Instructor).
3.  Fetch `Template` data (Schema).
4.  **Create Record** in `Certificates` collection:
    *   Generate unique `certificateCode`.
    *   Save all fetched data into `metadata` (Immutable Snapshot).
    *   Set status to `active`.

### C. PDF Generation (HTML/CSS Engine)
1.  **Load:** Retrieve `Certificate` record and linked `CertificateTemplate`.
2.  **Construct HTML (The Engine):**
    *   Convert `canvasSchema` JSON into a standard HTML string.
    *   Map JSON coordinates (`x`, `y`) to CSS (`position: absolute; left: ...px; top: ...px;`).
    *   *Example Output:*
        ```html
        <div style="position: relative; width: 1123px; height: 794px; background-image: url(...)">
           <div style="position: absolute; left: 400px; top: 300px; font-family: Serif;">Juan Dela Cruz</div>
        </div>
        ```
    *   **Benefit:** This ensures the PDF text is **vector-based** (selectable, crisp), not an image.
3.  **Render:**
    *   Use **Puppeteer** (Headless Chrome) to load this HTML string.
    *   Print to PDF with standard A4/Letter settings.
4.  **Store:** Upload generated PDF to `Media` collection and link it to the `Certificate` record.

---

## 6. Verification Flow
1.  **Public URL:** `https://portal.grandline.app/verify/[certificateCode]`
2.  **Logic:**
    *   Query `Certificates` collection by `certificateCode`.
    *   **IF Found & Active:** Display verified data from the record (Student Name, Course, Date). Show "Verified" badge.
    *   **IF Revoked:** Show "Certificate Revoked" warning.
    *   **IF Not Found:** Show "Invalid Certificate" error.

---

## 7. Execution Checklist

### Phase 1: CMS & Database Structure
- [x] **Step 1.1:** Create `src/collections/CertificateTemplates.ts`.
    - Define fields: `name`, `slug`, `backgroundImage`, `canvasSchema`, `status`.
    - Register collection in `payload.config.ts`.
- [x] **Step 1.2:** Update `src/collections/Courses.ts`.
    - Add `certificateTemplate` relationship field.
- [x] **Step 1.3:** Verify/Update `src/collections/Certificates.ts`.
    - Ensure `metadata` (json) and `certificateCode` (text, unique) fields exist.
    - Ensure `file` (upload) field exists for the generated PDF.

### Phase 2: Certificate Builder (Admin UI)
- [x] **Step 2.1:** Create a Custom Component for the `canvasSchema` field in Payload CMS.
    - Path: `apps/web-admin/src/app/(main)/certifications/builder/page.tsx`.
- [x] **Step 2.2:** Implement the "Fake Canvas" Editor.
    - Use a container `div` with `position: relative`.
    - Render `backgroundImage` as `img` (width: 100%).
    - Implement Draggable Text Elements using CSS `position: absolute`.
- [x] **Step 2.3:** Add Toolbar & Properties Panel.
    - Add buttons to insert variables (`{{Student Name}}`, etc.).
    - Add inputs for `fontSize`, `fontFamily`, `color`.
- [x] **Step 2.4:** Implement Serialization.
    - On change/save, convert DOM positions to JSON `canvasSchema` and update the field value.

### Phase 3: Backend Issuance Engine
- [ ] **Step 3.1:** Create `src/services/certificateService.ts`.
    - Function `issueCertificate(courseId, userId)`.
- [ ] **Step 3.2:** Implement Snapshot Logic.
    - Fetch Course, User, and Template data.
    - Generate unique `certificateCode` (e.g., UUID or custom format).
    - Create `Certificate` document with `metadata` snapshot.
- [ ] **Step 3.3:** Implement HTML Generator.
    - Function `generateCertificateHTML(template, metadata)`.
    - Returns full HTML string with injected styles and values.
- [ ] **Step 3.4:** Implement PDF Renderer.
    - Function `generatePDF(htmlString)`.
    - Use `puppeteer` to print PDF.
    - Upload result to Media collection.
- [ ] **Step 3.5:** Create Hook for Automation.
    - Add `afterChange` hook in `CourseProgress` (or relevant completion trigger).
    - Call `issueCertificate` when progress == 100%.

### Phase 4: Public Verification Page
- [ ] **Step 4.1:** Create Next.js Page `src/app/verify/[code]/page.tsx`.
- [ ] **Step 4.2:** Implement Server-Side Lookup.
    - `payload.find({ collection: 'certificates', where: { certificateCode: { equals: code } } })`.
- [ ] **Step 4.3:** Render Verification Status.
    - Valid: Show Certificate details and Download button.
    - Invalid: Show Error message.








But of course, must be cropped or cut those that exceed, meaning, we only care the image inside the canvas area. Once exceed, those outside will not be visible, or not accounted, just like in Canva, Adobe