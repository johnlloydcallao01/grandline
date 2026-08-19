'use server'

import { createAssignmentService } from '@encreasl/course-actions'
import type {
  AssignmentDoc,
  AssignmentListFilters,
  AssignmentListResult,
  CreateAssignmentInput,
} from '@encreasl/cms-types'

const CMS_API = process.env.NEXT_PUBLIC_API_URL
const API_KEY = process.env.PAYLOAD_API_KEY

const service = createAssignmentService({
  apiKey: API_KEY || '',
  cmsUrl: CMS_API || '',
  scope: 'admin',
})

export async function getAssignments(params: AssignmentListFilters): Promise<AssignmentListResult> {
  return service.getAssignments(params)
}

export async function getAssignmentById(id: string): Promise<AssignmentDoc> {
  return service.getAssignmentById(id)
}

export async function createAssignment(data: CreateAssignmentInput): Promise<AssignmentDoc> {
  return service.createAssignment(data)
}

export async function updateAssignment(id: string, data: Record<string, unknown>): Promise<AssignmentDoc> {
  return service.updateAssignment(id, data)
}

export async function deleteAssignment(id: string): Promise<void> {
  return service.deleteAssignment(id)
}