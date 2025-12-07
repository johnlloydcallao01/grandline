import { NextRequest, NextResponse } from 'next/server'
import { revalidateTag, revalidatePath } from 'next/cache'

export async function POST(request: NextRequest) {
  try {
    const secret = process.env.REVALIDATE_SECRET
    if (!secret) {
      return NextResponse.json({ error: 'Missing secret' }, { status: 500 })
    }

    const body = await request.json().catch(() => ({}))
    const provided = (body?.secret as string) || request.headers.get('x-revalidate-secret') || ''
    if (provided !== secret) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const tags = Array.isArray(body?.tags) ? (body.tags as string[]) : []
    const paths = Array.isArray(body?.paths) ? (body.paths as string[]) : []

    if (tags.length === 0 && paths.length === 0) {
      revalidateTag('course-categories', { expire: 0 })
      revalidatePath('/')
    } else {
      for (const t of tags) revalidateTag(t, { expire: 0 })
      for (const p of paths) revalidatePath(p)
    }

    return NextResponse.json({ revalidated: true })
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
