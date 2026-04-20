# Advanced Course Feedback Form Builder Architecture

To upgrade the current simple comment-based `Course Feedbacks` collection into an advanced, survey-like form builder, the recommended approach is a **Custom Blocks-Based Architecture**.

Given that this LMS already has a robust `Assessments` and `Questions` architecture (which uses polymorphism/relationships to handle multiple question types), building a custom Form Builder using Payload's `blocks` field is the most powerful and native approach. It allows you to perfectly tailor exact fields (like a 1-5 Star Rating block, Likert scale, fill in the blank, etc.) without fighting a plugin's default assumptions.

## How it works
You create a `CourseFeedbackForms` collection. Instead of standard fields, you use a `blocks` array. Each "Block" represents a specific type of form field.

### Example Block Definitions

1. **Text Input Block (Name, Last Name, Full Name, Phone, Fill in the Blank)**
```typescript
{
  slug: 'textInput',
  fields: [
    { name: 'label', type: 'text', required: true },
    { name: 'placeholder', type: 'text' },
    { name: 'format', type: 'select', options: ['text', 'email', 'phone', 'number'] },
    { name: 'isRequired', type: 'checkbox' }
  ]
}
```

2. **Choice Block (Radio, Dropdown, Multiple Select)**
```typescript
{
  slug: 'choiceInput',
  fields: [
    { name: 'label', type: 'text', required: true },
    { name: 'uiType', type: 'select', options: ['radio', 'dropdown', 'checkbox_group'] },
    { 
      name: 'options', 
      type: 'array', 
      fields: [{ name: 'label', type: 'text' }, { name: 'value', type: 'text' }] 
    },
    { name: 'isRequired', type: 'checkbox' }
  ]
}
```

3. **Survey Matrix Block (Advanced)**
```typescript
{
  slug: 'surveyMatrix',
  fields: [
    { name: 'question', type: 'text', required: true },
    { 
      name: 'columns', // e.g., Strongly Disagree, Neutral, Strongly Agree
      type: 'array', 
      fields: [{ name: 'label', type: 'text' }] 
    },
    { 
      name: 'rows', // Specific statements to evaluate
      type: 'array', 
      fields: [{ name: 'statement', type: 'text' }] 
    }
  ]
}
```

## The Submissions Collection
To collect the data, you would create a `CourseFeedbackSubmissions` collection. Because the form fields are completely dynamic, the submission data cannot be strictly typed in standard SQL columns. 

Instead, you use a `json` or `jsonb` field to store the raw payload from the frontend:
```typescript
{
  name: 'responses',
  type: 'json',
  admin: {
    description: 'Stores the dynamic key-value pairs submitted by the trainee'
  }
}
```

---

# Complete Implementation Plan

Based on the deep analysis of the current `CourseFeedbacks` collection and the `Courses` architecture, here is the exact step-by-step plan to replace the simple comment/rating system with the advanced, dynamic Form Builder.

## Phase 1: Backend CMS Architecture (`apps/cms`)

### 1. Create the Form Builder Schema (`FeedbackForms.ts`)
Create a new collection that administrators will use to build surveys.
- **Fields**: 
  - `title` (text)
  - `description` (textarea)
  - `fields` (blocks array containing `textInput`, `choiceInput`, `surveyMatrix`, etc. as defined above)

### 2. Create the Submission Schema (`FeedbackSubmissions.ts`)
Replace the old `CourseFeedbacks.ts` collection with a new one designed to handle dynamic data.
- **Fields**:
  - `form` (relationship to `feedback-forms`)
  - `course` (relationship to `courses`)
  - `trainee` (relationship to `trainees` - *Note: This fixes a current inconsistency where old feedback was linked directly to `users` instead of `trainees`*)
  - `responses` (json - stores the dynamic answers)
- **Access Control & Hooks**:
  - Ensure only `trainees` can create submissions.
  - Add a `beforeChange` hook to verify the trainee has an active/completed `CourseEnrollment` for the related course before allowing the submission.

### 3. Link Forms to Courses (`Courses.ts`)
Update the existing `Courses` collection so that each course can have its own unique survey.
- **New Field**: Add a `feedbackForm` (relationship to `feedback-forms`, optional). If this is populated, the frontend will render the advanced survey at the end of the course.

## Phase 2: Frontend Implementation (`apps/web`)

### 1. Build the Dynamic Form Renderer Component
Create a new component (e.g., `FeedbackFormRenderer.tsx`) that acts as the engine for the survey.
- It will accept the `blocks` array from the CMS as a prop.
- It will map over the array and render the corresponding UI:
  - **`textInput`**: Renders standard `<input>` or `<textarea>`.
  - **`choiceInput`**: Renders radio buttons, checkboxes, or a `<select>` dropdown.
  - **`surveyMatrix`**: Renders a complex HTML table/grid where rows are statements and columns are Likert scale options (Strongly Disagree -> Strongly Agree).

### 2. Form State Management
- Use `react-hook-form` or a standard React `useState` object to build a dynamic JSON payload as the trainee fills out the survey.
  - *Example state*: `{ "block-id-1": "Great course", "block-id-2": "Agree" }`

### 3. Integrate into the Course Player
- Locate the "Finish Course" or "Feedback" step inside the Course Player (`/portal/courses/[courseId]/player`).
- Fetch the `feedbackForm` associated with the current `courseId`.
- Render the `FeedbackFormRenderer`.
- On submit, `POST` the JSON state to the `/api/feedback-submissions` endpoint, securely passing the Trainee ID and Course ID.

## Phase 3: Data Migration & Cleanup
1. **Deprecate Old System**: Mark the old `CourseFeedbacks` collection as read-only or hidden in the admin panel to preserve historical data.
2. **Admin Dashboard**: (Optional) Build a custom React view in Payload CMS to easily visualize the `json` responses (e.g., rendering charts or averages for the Survey Matrix data) since JSON fields aren't easily searchable in the default list view.