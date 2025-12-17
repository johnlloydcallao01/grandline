# View All Button Conditional Logic

## Implementation Summary

The "View All" button in the "Explore Our Featured Courses" section on the home page (`/`) now displays conditionally based on the **total number of ALL published courses** in the system.

## Logic

```typescript
// Only show "View All" button if there are MORE than 6 total courses
{totalCoursesCount > 6 && (
  <div className="text-center mt-12">
    <Link href="/courses" className="btn-primary">
      <span>View All</span>
    </Link>
  </div>
)}
```

## Behavior

### ✅ Show Button When:
- Total published courses > 6
- Example: 7, 8, 10, 20, 100 courses etc.

### ❌ Hide Button When:
- Total published courses ≤ 6
- Example: 1, 2, 3, 4, 5, 6 courses

## Technical Details

### New Function Added
**File**: `apps/web-landing/src/lib/server-fetch-courses.ts`

```typescript
export async function fetchTotalCoursesCount(): Promise<number>
```

- Fetches total count of ALL published courses
- Uses `limit=1` to minimize data transfer (only needs the count)
- Returns `totalDocs` from the API response
- Uses `cache: "no-store"` for immediate updates

### Page Updates  
**File**: `apps/web-landing/src/app/page.tsx`

1. **Parallel Fetching** - Both requests happen simultaneously for performance:
   ```typescript
   const [coursesResponse, totalCount] = await Promise.all([
     fetchCoursesServer({ ... }), // Featured courses
     fetchTotalCoursesCount(),     // Total count
   ]);
   ```

2. **Conditional Rendering** - Button only shows when needed:
   ```typescript
   {totalCoursesCount > 6 && (
     <ViewAllButton />
   )}
   ```

## Verification

✅ **Tested and Working**:
- When total courses ≤ 6: Button is hidden (confirmed via screenshot)
- JavaScript verification: `hasViewAllButton = false` ✅
- Server-side rendered (present in initial HTML)

## Performance

- **Efficient**: Only fetches 1 course document to get the total count
- **Parallel**: Both API calls happen simultaneously
- **Fresh**: No caching, always shows accurate count
- **SSR**: Logic executes server-side, SEO-friendly

## Important Notes

⚠️ The button visibility is based on **ALL published courses**, NOT just featured courses.

Examples:
- If you have 10 total courses but only 3 are featured → Button SHOWS ✅
- If you have 6 total courses and all 6 are featured → Button HIDES ❌
- If you have 5 total courses and 2 are featured → Button HIDES ❌
