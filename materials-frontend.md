# Implementation Plan: Training Materials Page (`apps/web/src/app/(main)/training-materials/page.tsx`)

## 1. Goal
Replace the hardcoded dummy data in the `/training-materials` page with real data fetched from Payload CMS. We need to securely display only the materials (Course Materials and Lesson Materials) that belong to courses the current Trainee is actively enrolled in.

## 2. Collection Analysis & Data Flow
Based on the Payload CMS structure:
1. **Users / Trainees**: The logged-in user (`role: 'trainee'`) has a corresponding record in the `trainees` collection.
2. **Course Enrollments**: Maps a `Trainee` to a `Course` (where `status = 'active'`).
3. **Courses**: The parent container for materials.
4. **Course Materials**: A join collection mapping a `Course` to a `Material`.
5. **Lesson Materials**: A join collection mapping a `Lesson` (which belongs to a Course Module, which belongs to a Course) to a `Material`.
6. **Materials**: The actual repository holding the file (`media`) or `externalUrl`.

### The Logic Chain:
1. Get the current User ID.
2. Find the Trainee ID associated with that User ID.
3. Query `course-enrollments` for all active enrollments where `student = Trainee ID`. Extract the array of `Course IDs`.
4. Query `course-materials` where `course` is IN the array of `Course IDs`.
5. Query `lesson-materials` where the lesson belongs to the enrolled courses (this requires finding the modules for the courses, then the lessons for those modules, then the lesson materials). 
   *Note: For simplicity and performance on a global "Training Materials" page, it is often best to just fetch `Course Materials` as the primary global downloads, or we can fetch both and merge them.*

## 3. Implementation Steps

### Step 1: Create Server Actions for Fetching Data
Create a new file `apps/web/src/app/(main)/training-materials/actions.ts` (or add to an existing materials action file).
We will need the following functions:
- `getEnrolledCourseIds()`: Fetches the active enrollments for the current user and returns an array of course IDs.
- `getTrainingMaterials(courseIds)`: Fetches from `course-materials` (and optionally `lesson-materials`) filtering by the allowed `courseIds`.
  - Ensure `depth: 2` or `depth: 3` is used so Payload populates the `material` object and its underlying `media` file data.

### Step 2: Refactor `page.tsx` to a Server Component
Currently, `/training-materials/page.tsx` is a `'use client'` component with hardcoded state. 
- Convert it to a **Server Component** (remove `'use client'`).
- Fetch the data securely on the server using the actions defined in Step 1.
- Pass the fetched data down to a new Client Component (e.g., `<TrainingMaterialsClient />`) that handles the tabs, search filtering, and rendering.

### Step 3: Create `<TrainingMaterialsClient />`
- Accept the `materials` array as a prop.
- Map the CMS data structure to the frontend UI structure:
  - `title` -> `material.title`
  - `category` -> Map from the parent course category or material metadata.
  - `type` -> Determine based on `material.materialSource` ('media' vs 'external') and MIME type (PDF, Video, etc.).
  - `size` -> Get from `material.media.filesize` (format to MB/KB).
  - `date` -> Get from `material.createdAt`.
  - `href` -> Generate download/view link from `material.media.url` or `material.externalUrl`.
- Implement the Search and Category Tab filtering logic using the real data.

### Step 4: Handle Empty States & Loading
- Implement a skeleton loading state (similar to what we did in `/certificates` and `/support`).
- If `getEnrolledCourseIds()` returns empty (the user has no courses), display a friendly empty state: "You are not currently enrolled in any courses. Enroll in a course to access its training materials."

## 4. Security Considerations
- **Data Leakage**: Do NOT query the `materials` collection directly. Always query `course-materials` and filter by the specific `courseIds` the user is verified to be enrolled in.
- **Authentication**: Use the `getServerToken()` utility to ensure requests to Payload CMS are authenticated as the current trainee.