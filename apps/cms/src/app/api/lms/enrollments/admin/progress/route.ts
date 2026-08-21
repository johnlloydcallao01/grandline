import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import configPromise from '@payload-config'
import { recalculateEnrollmentProgress } from '@/utils/progressCalculation'

export async function GET(request: NextRequest) {
  try {
    const payload = await getPayload({ config: configPromise })
    const { searchParams } = new URL(request.url)
    const enrollmentId = searchParams.get('enrollmentId')

    if (!enrollmentId) {
      return NextResponse.json({ error: 'enrollmentId is required' }, { status: 400 })
    }

    const progressSummary = await recalculateEnrollmentProgress(payload, enrollmentId)

    return NextResponse.json({
      progressPercentage: progressSummary.progressPercentage,
      completedItems: progressSummary.completedItems,
      totalItems: progressSummary.totalItems,
    })
  } catch (error: any) {
    console.error('Error computing enrollment progress:', error)
    return NextResponse.json(
      { error: error?.message || 'Internal server error' },
      { status: 500 },
    )
  }
}
