import type { Payload } from 'payload'
import { ACCOUNTING_COLLECTION_SLUGS } from '../../constants/accounting'

export class AccountingProjectService {
  static async generateProjectCode(_payload: Payload) {
    const stamp = new Date().toISOString().replace(/\D/g, '').slice(0, 12)
    const randomSuffix = Math.floor(Math.random() * 900 + 100)
    return `PRJ-${stamp}-${randomSuffix}`
  }

  static async getProject(payload: Payload, projectId: number | string) {
    return payload.findByID({
      collection: ACCOUNTING_COLLECTION_SLUGS.projects,
      id: projectId,
      depth: 2,
      overrideAccess: true,
    })
  }
}
