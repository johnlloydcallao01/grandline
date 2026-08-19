'use server'

import { createCourseService } from '@encreasl/course-actions'
import type {
  CategoryOption,
  Course,
  CourseEditData,
  CourseListFilters,
  CourseListResult,
  CreateCourseInput,
  InstructorRef,
  SimpleDocRef,
  TagOption,
} from '@encreasl/cms-types'

const CMS_API = process.env.NEXT_PUBLIC_API_URL
const API_KEY = process.env.PAYLOAD_API_KEY

const service = createCourseService({
  apiKey: API_KEY || '',
  cmsUrl: CMS_API || '',
  scope: 'admin',
})

export async function getCourses(params: CourseListFilters): Promise<CourseListResult> {
  return service.getCourses(params)
}

export async function createCourse(data: CreateCourseInput): Promise<Course> {
  return service.createCourse(data)
}

export async function updateCourse(id: string, data: Record<string, unknown>): Promise<Course> {
  return service.updateCourse(id, data)
}

export async function deleteCourse(id: string): Promise<void> {
  return service.deleteCourse(id)
}

export async function getCategories(): Promise<CategoryOption[]> {
  return service.getCategories()
}

export async function getTags(): Promise<TagOption[]> {
  return service.getTags()
}

export async function searchInstructors(search: string): Promise<InstructorRef[]> {
  return service.searchInstructors(search)
}

export async function searchCollection(
  collection: string,
  search: string,
  labelField = 'title',
): Promise<SimpleDocRef[]> {
  return service.searchCollection(collection, search, labelField)
}

export async function listCollection(collection: string, labelField = 'title'): Promise<SimpleDocRef[]> {
  return service.listCollection(collection, labelField)
}

export async function getCourseEditData(id: string): Promise<CourseEditData> {
  return service.getCourseEditData(id)
}