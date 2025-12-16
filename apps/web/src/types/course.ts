// Centralized course-related type definitions
// This file consolidates all course, media, user, and instructor interfaces
// to eliminate duplication across components and services

// Media interface from CMS API
export interface Media {
  id: number;
  alt?: string | null;
  cloudinaryPublicId?: string | null;
  cloudinaryURL?: string | null;
  url?: string | null;
  thumbnailURL?: string | null;
  filename?: string | null;
  mimeType?: string | null;
  filesize?: number | null;
  width?: number | null;
  height?: number | null;
  focalX?: number | null;
  focalY?: number | null;
}

// User interface
export interface User {
  id: string | number;
  firstName: string;
  lastName: string;
  email?: string;
  profilePicture?: Media | null;
}

// Instructor interface
export interface Instructor {
  id: string | number;
  user: User;
  specialization: string;
}

// Course category interface
export interface CourseCategory {
  id: number;
  name: string;
  slug: string;
  icon?: Media | null;
}

// Base Course interface
export interface Course {
  id: string;
  title: string;
  excerpt: string;
  status: 'published' | 'draft';
  isFeatured?: boolean;
  thumbnail?: Media | null;
  bannerImage?: Media | null;
  updatedAt?: string | null;
}

// Extended Course interface with instructor information
export interface CourseWithInstructor extends Course {
  publishedAt?: string | null;
  updatedAt?: string | null;
  price?: number | null;
  discountedPrice?: number | null;
  instructor?: Instructor | null;
  category?: CourseCategory[] | null;
}

// API Response interfaces
export interface CoursesResponse {
  docs: Course[];
  totalDocs: number;
  limit: number;
  page: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface CoursesWithInstructorResponse {
  docs: CourseWithInstructor[];
  totalDocs: number;
  limit: number;
  page: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

// Helper type for course queries
export interface CourseQueryParams {
  status?: 'published' | 'draft';
  limit?: number;
  page?: number;
  category?: string;
  featured?: boolean;
  sort?: string;
}
