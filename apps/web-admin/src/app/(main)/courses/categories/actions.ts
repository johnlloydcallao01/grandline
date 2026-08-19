'use server'

import { createCategoryService } from '@encreasl/course-actions'
import type {
  CategoryDoc,
  CategoryListFilters,
  CategoryListResult,
  CategoryOption,
  CreateCategoryInput,
  UpdateCategoryInput,
} from '@encreasl/cms-types'

const CMS_API = process.env.NEXT_PUBLIC_API_URL
const API_KEY = process.env.PAYLOAD_API_KEY

const service = createCategoryService({
  apiKey: API_KEY || '',
  cmsUrl: CMS_API || '',
  scope: 'admin',
})

export async function getCategoriesList(params: CategoryListFilters): Promise<CategoryListResult> {
  return service.getCategories(params)
}

export async function getCategoryById(id: string): Promise<CategoryDoc> {
  return service.getCategoryById(id)
}

export async function createCategory(data: CreateCategoryInput): Promise<CategoryDoc> {
  return service.createCategory(data)
}

export async function updateCategory(id: string, data: UpdateCategoryInput): Promise<CategoryDoc> {
  return service.updateCategory(id, data)
}

export async function deleteCategory(id: string): Promise<void> {
  return service.deleteCategory(id)
}

export async function getAllCategories(): Promise<CategoryOption[]> {
  return service.getAllCategories()
}