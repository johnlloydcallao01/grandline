# CourseCategoryCarousel API Data Fetching Analysis

## API Endpoint
- **URL**: `https://cms.grandlinemaritime.com/api/lms/course-categories?limit=50`
- **Method**: GET request using fetch()
- **Location**: useEffect hook in CourseCategoryCarousel component

## Data Fetching Implementation

```typescript
useEffect(() => {
  const fetchCategories = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('https://cms.grandlinemaritime.com/api/lms/course-categories?limit=50');
      if (!response.ok) {
        throw new Error('Failed to fetch categories');
      }
      const data = await response.json();
      setCategories(data.docs || []);
    } catch (error) {
      console.error('Error fetching course categories:', error);
      setCategories([]);
    } finally {
      setIsLoading(false);
    }
  };

  fetchCategories();
}, []);
```

## Category Name Fetching
- **Source**: `category.name` property from API response
- **Data Structure**: Each category object contains a `name` field
- **Usage**: Displayed as text label below each category circle
- **Fallback**: Empty string if name is undefined

## Category Image Fetching
- **Source**: `category.icon` object from API response
- **Image URL Priority**:
  1. `category.icon.cloudinaryURL` (preferred)
  2. `category.icon.url` (fallback)
- **Alt Text**: `category.icon.alt` or falls back to `category.name`
- **Implementation**: Uses Next.js Image component with React.createElement

```typescript
{React.createElement(Image as React.ComponentType<ImageProps>, {
  src: category.icon.cloudinaryURL || category.icon.url,
  alt: category.icon.alt || category.name,
  fill: true,
  className: "object-cover",
  sizes: "64px",
  priority: false,
  unoptimized: true
})}
```

## API Response Structure
```typescript
interface CourseCategory {
  id: number;
  name: string;        // Category name displayed
  slug: string;
  icon?: {
    id: number;
    url: string;           // Base image URL
    cloudinaryURL?: string; // Optimized Cloudinary URL
    alt?: string;          // Alt text for accessibility
  };
}
```

## Data Flow
1. Component mounts → useEffect triggers
2. Fetch request to CMS API endpoint
3. Parse JSON response → extract `data.docs` array
4. Store categories in state → `setCategories(data.docs || [])`
5. Render categories → map over categories array
6. Display name and image for each category

## Error Handling
- Network errors caught and logged to console
- Failed requests set categories to empty array
- Loading state managed with `isLoading` boolean
- Graceful fallbacks for missing image data