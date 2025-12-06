import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import configPromise from '@payload-config'
import { getActiveAssignedCategories } from '../../../../endpoints/course-categories-active'

export async function GET(request: NextRequest) {
  try {
    const payload = await getPayload({ config: configPromise })
    const apiKey = request.headers.get('PAYLOAD_API_KEY')
    if (!apiKey) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }
    const result = await getActiveAssignedCategories(payload)
    return NextResponse.json(result)
  } catch (error) {
    console.error('Error fetching assigned course categories:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
