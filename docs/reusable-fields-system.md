# Reusable Fields System

## Overview

The CMS now uses a **reusable fields system** to eliminate duplication and ensure consistency across all content types. Instead of defining the same fields repeatedly in each collection, we now have centralized field definitions that can be shared.

## Benefits

✅ **DRY Principle** - Don't Repeat Yourself  
✅ **Consistency** - Same field behavior across collections  
✅ **Maintainability** - Update field logic in one place  
✅ **Scalability** - Easy to add new content types  
✅ **Type Safety** - Shared TypeScript definitions  

## Field Categories

### 🎯 **Content Fields**
- **`titleField`** - Standard title/heading
- **`slugField`** - URL-friendly identifier  
- **`contentField`** - Rich text main content
- **`excerptField`** - Brief description/summary
- **`featuredImageField`** - Main image relationship

### 📅 **Publishing Fields**
- **`statusField`** - Draft/Published status
- **`publishedAtField`** - Publication date/time
- **`authorField`** - Content creator relationship

### 🏷️ **Organization Fields**
- **`tagsField`** - Keyword tags array
- **`seoFields`** - Complete SEO group (title, description, focus keyword)

## Field Combinations

### **`basicContentFields`**
```typescript
[titleField, slugField, contentField, excerptField]
```
*Core content structure for any content type*

### **`publishingFields`**
```typescript
[statusField, publishedAtField, authorField]
```
*Publishing workflow and attribution*

### **`organizationFields`**
```typescript
[featuredImageField, tagsField]
```
*Content organization and media*

### **`blogContentFields`** ⭐
```typescript
[...basicContentFields, ...organizationFields, ...publishingFields, seoFields]
```
*Complete blog post structure (currently used by Posts collection)*

### **`serviceContentFields`**
```typescript
[nameField, slugField, descriptionField, shortDescriptionField, featuredImageField]
```
*Service/product content structure (currently used by Services collection)*

## Current Implementation

### **Posts Collection**
```typescript
import { blogContentFields } from '../fields'

export const Posts: CollectionConfig = {
  // ... config
  fields: blogContentFields,
}
```

### **Services Collection**
```typescript
import { serviceContentFields, seoFields } from '../fields'

export const Services: CollectionConfig = {
  // ... config
  fields: [
    ...serviceContentFields,
    // ... service-specific fields (pricing, features, etc.)
    seoFields,
  ],
}
```

## Adding New Content Types

When creating new collections, you can now:

### **Option 1: Use Existing Combinations**
```typescript
import { blogContentFields } from '../fields'

export const NewsArticles: CollectionConfig = {
  slug: 'news',
  fields: blogContentFields, // Instant blog-like structure
}
```

### **Option 2: Mix and Match**
```typescript
import { basicContentFields, seoFields } from '../fields'

export const LandingPages: CollectionConfig = {
  slug: 'pages',
  fields: [
    ...basicContentFields,
    // Add page-specific fields
    { name: 'hero', type: 'group', fields: [...] },
    seoFields,
  ],
}
```

### **Option 3: Custom with Reusable Components**
```typescript
import { titleField, slugField, seoFields } from '../fields'

export const Products: CollectionConfig = {
  slug: 'products',
  fields: [
    titleField,
    slugField,
    { name: 'price', type: 'number' },
    { name: 'inventory', type: 'number' },
    seoFields,
  ],
}
```

## Field Customization

You can customize reusable fields for specific use cases:

```typescript
import { titleField, seoFields } from '../fields'

// Customize existing field
const productNameField = {
  ...titleField,
  name: 'productName',
  admin: {
    description: 'The commercial name of this product',
  },
}

// Customize SEO for specific context
const productSEOFields = {
  ...seoFields,
  admin: {
    description: 'Product SEO settings for e-commerce optimization',
  },
}
```

## Future Content Types

With this system, adding new content types becomes trivial:

- **📰 News Articles** → Use `blogContentFields`
- **📄 Landing Pages** → Use `basicContentFields` + custom sections
- **🛍️ Products** → Use `titleField` + `slugField` + product-specific fields + `seoFields`
- **👥 Team Members** → Use `titleField` + custom profile fields
- **📅 Events** → Use `basicContentFields` + date/location fields
- **❓ FAQs** → Use `titleField` + answer field + `seoFields`

## Maintenance

### **Adding New Reusable Fields**
1. Add to `/src/fields/index.ts`
2. Export in appropriate combination arrays
3. Update documentation

### **Modifying Existing Fields**
1. Update in `/src/fields/index.ts`
2. Changes automatically apply to all collections using that field
3. Run `npm run generate:types` to update TypeScript

### **Collection-Specific Customization**
1. Import base fields
2. Spread into collection with modifications
3. Add collection-specific fields as needed

This system ensures that as your CMS grows, you maintain consistency while reducing development time and potential bugs from field definition duplication.
