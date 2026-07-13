import { NextRequest, NextResponse } from 'next/server'
import { handleAccountingApiError, requireAccountingAdmin } from '../../_utils/auth'

export async function GET(request: NextRequest) {
  try {
    const { payload } = await requireAccountingAdmin(request)
    const { searchParams } = new URL(request.url)

    const search = searchParams.get('search') || ''
    const roleFilter = searchParams.get('role') || ''
    const statusFilter = searchParams.get('status') || ''
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10))
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '20', 10)))

    const conditions: Record<string, unknown>[] = []

    if (search) {
      conditions.push({
        or: [
          { email: { contains: search } },
          { firstName: { contains: search } },
          { lastName: { contains: search } },
        ],
      })
    }

    if (roleFilter) {
      const roles = roleFilter.split(',').filter(Boolean)
      if (roles.length > 0) {
        conditions.push({ role: { in: roles } })
      }
    }

    if (statusFilter === 'active') {
      conditions.push({ isActive: { equals: true } })
    } else if (statusFilter === 'inactive') {
      conditions.push({ isActive: { equals: false } })
    }

    const where = conditions.length > 0 ? ({ and: conditions } as never) : ({} as never)

    const [result, [adminCount, serviceCount, activeCount, apiKeyCount]] = await Promise.all([
      payload.find({
        collection: 'users',
        where,
        page,
        limit,
        sort: '-updatedAt',
        depth: 0,
        overrideAccess: true,
      }),
      Promise.all([
        payload.count({ collection: 'users', where: { role: { equals: 'admin' } } as never, overrideAccess: true }),
        payload.count({ collection: 'users', where: { role: { equals: 'service' } } as never, overrideAccess: true }),
        payload.count({ collection: 'users', where: { isActive: { equals: true } } as never, overrideAccess: true }),
        payload.count({ collection: 'users', where: { enableAPIKey: { equals: true } } as never, overrideAccess: true }),
      ]),
    ])

    const users = result.docs.map((doc) => {
      const u = doc as unknown as Record<string, unknown>
      return {
        id: (u.id as number | string) ?? '',
        email: (u.email as string) || '',
        firstName: (u.firstName as string) || '',
        lastName: (u.lastName as string) || '',
        role: (u.role as string) || 'trainee',
        isActive: u.isActive !== false,
        lastLogin: (u.lastLogin as string) || null,
        enableAPIKey: u.enableAPIKey === true,
      }
    })

    return NextResponse.json({
      users,
      total: result.totalDocs,
      page: result.page,
      limit: result.limit,
      counts: {
        admin: adminCount.totalDocs,
        service: serviceCount.totalDocs,
        active: activeCount.totalDocs,
        apiKeyEnabled: apiKeyCount.totalDocs,
      },
    })
  } catch (error) {
    return handleAccountingApiError(error)
  }
}

export async function POST(request: NextRequest) {
  try {
    const { payload } = await requireAccountingAdmin(request)
    const body: Record<string, unknown> = await request.json()

    const { email, password, firstName, lastName, role, isActive } = body

    if (!email || !password || !firstName || !lastName) {
      return NextResponse.json(
        { error: 'Email, password, first name, and last name are required.' },
        { status: 400 },
      )
    }

    const created = (await payload.create({
      collection: 'users',
      data: {
        email: email as string,
        password: password as string,
        firstName: firstName as string,
        lastName: lastName as string,
        role: (role as string) || 'trainee',
        isActive: isActive !== false,
      } as never,
      depth: 0,
      overrideAccess: true,
    })) as unknown as Record<string, unknown>

    return NextResponse.json(
      {
        user: {
          id: (created.id as number | string) ?? '',
          email: (created.email as string) || '',
          firstName: (created.firstName as string) || '',
          lastName: (created.lastName as string) || '',
          role: (created.role as string) || 'trainee',
          isActive: created.isActive !== false,
          lastLogin: (created.lastLogin as string) || null,
          enableAPIKey: created.enableAPIKey === true,
        },
      },
      { status: 201 },
    )
  } catch (error) {
    return handleAccountingApiError(error)
  }
}
