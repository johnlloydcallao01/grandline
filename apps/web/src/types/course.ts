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

// JSON block content types for rich course descriptions
export interface HeadingBlock {
  type: 'heading';
  level: 1 | 2 | 3 | 4;
  text: string;
}

export interface ParagraphBlock {
  type: 'paragraph';
  text: string;
}

export interface ListBlock {
  type: 'list';
  style: 'ordered' | 'unordered';
  items: string[];
}

export interface ImageBlock {
  type: 'image';
  url: string;
  alt?: string;
  caption?: string;
  width?: string;
  height?: string;
}

export interface QuoteBlock {
  type: 'quote';
  text: string;
  attribution?: string;
}

export interface CodeBlock {
  type: 'code';
  language?: string;
  code: string;
}

export interface CourseAnnouncement {
  id: string;
  title: string;
  body?: any;
  pinned?: boolean;
  visibleFrom?: string | null;
  visibleUntil?: string | null;
  createdAt?: string | null;
  authorName?: string | null;
}

export interface CourseMaterialAttachment {
  id: string;
  order: number;
  isRequired: boolean;
  materialId: string;
  title: string;
  description?: string | null;
  materialSource: 'media' | 'external';
  externalUrl?: string | null;
  media: Media[];
}

export type ContentBlock =
  | HeadingBlock
  | ParagraphBlock
  | ListBlock
  | ImageBlock
  | QuoteBlock
  | CodeBlock;

// Base Course interface
export interface Course {
  id: string;
  title: string;
  excerpt: string;
  description?: any;
  descriptionBlocks?: ContentBlock[] | null;
  status: 'published' | 'draft';
  isFeatured?: boolean;
  thumbnail?: Media | null;
  bannerImage?: Media | null;
  estimatedDuration?: number | null;
  estimatedDurationUnit?: 'minutes' | 'hours' | 'days' | 'weeks' | null;
  updatedAt?: string | null;
  courseMaterials?: CourseMaterialAttachment[] | null;
}

// Extended Course interface with instructor information
export interface CourseWithInstructor extends Course {
  publishedAt?: string | null;
  updatedAt?: string | null;
  price?: number | null;
  discountedPrice?: number | null;
  instructor?: Instructor | null;
  category?: CourseCategory[] | null;
   announcements?: CourseAnnouncement[] | null;
  curriculum?: {
    modules: Array<{
      id: string;
      title: string;
      estimatedDurationMinutes?: number | null;
      items: Array<{
        relationTo: 'course-lessons' | 'assessments';
        value: {
          id: string;
          title: string;
          estimatedDurationMinutes?: number | null;
          // For lessons
          estimatedDuration?: number | null;
          description?: any;
          // For assessments
          assessmentType?: 'quiz' | 'exam';
          passingScore?: number | null;
          timeLimitMinutes?: number | null;
          maxAttempts?: number | null;
          isRequired?: boolean;
        } | string; // Could be string ID if depth is shallow
      }>;
      lessons: Array<{
        id: string;
        title: string;
        estimatedDurationMinutes?: number | null;
      }>;
      assessments: Array<{
        id: string;
        title: string;
        assessmentType: 'quiz' | 'exam';
        estimatedDurationMinutes?: number | null;
        isRequired?: boolean;
      }>;
    }>;
    finalExam?: {
      id: string;
      title: string;
      estimatedDurationMinutes?: number | null;
      isRequired?: boolean;
      description?: any;
      passingScore?: number | null;
      timeLimitMinutes?: number | null;
      maxAttempts?: number | null;
      questions?: any[];
    } | null;
  } | null;
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
