import type { Payload } from 'payload'
import { AccountingAssetRegisterService } from '../services/reports/AccountingAssetRegisterService'

export const getAssetRegister = async (payload: Payload) =>
  AccountingAssetRegisterService.getAssetRegister(payload)
