import { NextRequest, NextResponse } from 'next/server'
import { ACCOUNTING_COLLECTION_SLUGS } from '@/accounting/constants/accounting'
import { findAllDocs } from '@/accounting/utils/findAllDocs'
import { handleAccountingApiError, requireAccountingAdmin } from '../../../_utils/auth'
import {
  assertBankFeedMutationPayload,
  buildBankFeedDetailResponse,
  buildBankFeedMetrics,
  buildBankFeedPersistenceData,
  buildBankFeedReferenceData,
  buildBankFeedRow,
  matchesBankFeedFilters,
  normalizeBankFeedMutationBody,
  normalizeSearch,
  parseIntegerParam,
  parseListParam,
  type BankFeedDoc,
} from './_shared'

export async function GET(request: NextRequest) {
  try {
    const { payload } = await requireAccountingAdmin(request)
    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search') || ''
    const statuses = parseListParam(searchParams, 'status')
    const connectors = parseListParam(searchParams, 'connector')
    const healthStates = parseListParam(searchParams, 'health')
    const quickFilters = parseListParam(searchParams, 'quickFilter')
    const page = Math.max(1, parseIntegerParam(searchParams.get('page'), 1))
    const limit = Math.min(100, Math.max(1, parseIntegerParam(searchParams.get('limit'), 10)))

    const [feeds, referenceData] = await Promise.all([
      findAllDocs<BankFeedDoc>({
        payload,
        collection: ACCOUNTING_COLLECTION_SLUGS.bankFeeds,
        depth: 2,
        sort: '-updatedAt',
      }),
      buildBankFeedReferenceData(payload),
    ])

    const rows = feeds.map((feed) => buildBankFeedRow(feed))
    const normalizedSearch = normalizeSearch(search)

    const filteredRows = rows.filter((row) => {
      if (normalizedSearch && !row.searchableText.includes(normalizedSearch)) return false
      return matchesBankFeedFilters(row, {
        statuses,
        connectors,
        healthStates,
        quickFilters,
      })
    })

    const totalDocs = filteredRows.length
    const totalPages = Math.max(1, Math.ceil(totalDocs / limit))
    const currentPage = Math.min(page, totalPages)
    const paginatedRows = filteredRows.slice((currentPage - 1) * limit, currentPage * limit)

    return NextResponse.json({
      rows: paginatedRows,
      metrics: buildBankFeedMetrics(filteredRows),
      filterOptions: {
        statuses: referenceData.connectionStatuses,
        connectors: referenceData.connectorTypes,
        healthStates: referenceData.healthStatuses,
        quickFilters: [
          { label: 'Healthy Feeds', value: 'health:healthy' },
          { label: 'Sync Delays', value: 'coverage:sync_delay' },
          { label: 'Rule Changes', value: 'coverage:rule_changes' },
          { label: 'Disconnected', value: 'status:disconnected' },
        ],
      },
      appliedFilters: {
        search,
        statuses,
        connectors,
        healthStates,
        quickFilters,
      },
      meta: {
        id: 'bank-feeds',
        label: 'Bank Feeds',
        description: 'Monitor connected bank feeds, sync health, connector issues, and feed-rule coverage for each bank account.',
        searchPlaceholder: 'Search by bank account, connector, provider reference, external account, or rule set',
        tableTitle: 'Connected Feed Accounts',
        tableDescription: 'Operational status of each connected bank feed, its last sync activity, and the rules attached to it.',
        columns: ['Bank Account', 'Connector', 'Last Sync', { label: 'Imported Rows', align: 'right' }, 'Rule Set', 'Health'],
      },
      pagination: {
        page: currentPage,
        limit,
        totalDocs,
        totalPages,
        hasPrevPage: currentPage > 1,
        hasNextPage: currentPage < totalPages,
      },
      totals: {
        totalRows: rows.length,
        filteredRows: totalDocs,
      },
      referenceData,
      flags: {
        syncableFeedIds: filteredRows.filter((row) => !row.isDisconnected && !row.needsReconnection).map((row) => row.id),
      },
    })
  } catch (error) {
    return handleAccountingApiError(error)
  }
}

export async function POST(request: NextRequest) {
  try {
    const { payload, user } = await requireAccountingAdmin(request)
    const body = normalizeBankFeedMutationBody((await request.json()) as Record<string, unknown>)
    await assertBankFeedMutationPayload(payload, {
      ...body,
      connectorType: body.connectorType || 'direct_api',
      connectionStatus: body.connectionStatus || 'connected',
      healthStatus: body.healthStatus || 'healthy',
      syncFrequency: body.syncFrequency || 'hourly',
    })

    const createdRecord = (await payload.create({
      collection: ACCOUNTING_COLLECTION_SLUGS.bankFeeds,
      overrideAccess: true,
      depth: 2,
      data: {
        ...buildBankFeedPersistenceData(body),
        connectorType: body.connectorType || 'direct_api',
        connectionStatus: body.connectionStatus || 'connected',
        healthStatus: body.healthStatus || 'healthy',
        syncFrequency: body.syncFrequency || 'hourly',
        createdBy: user.id,
        updatedBy: user.id,
      } as never,
    })) as BankFeedDoc

    return NextResponse.json(await buildBankFeedDetailResponse(payload, createdRecord), {
      status: 201,
    })
  } catch (error) {
    return handleAccountingApiError(error)
  }
}
