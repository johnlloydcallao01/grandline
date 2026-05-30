import type { Payload } from 'payload'
import { AccountingApprovalService } from '../services/approvals/AccountingApprovalService'

export const getApprovalQueue = async (
  payload: Payload,
  approverUserId?: number | string | null,
) => AccountingApprovalService.getApprovalQueue(payload, approverUserId)
