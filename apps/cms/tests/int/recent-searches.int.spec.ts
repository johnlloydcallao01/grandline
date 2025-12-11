import { getPayload, Payload } from 'payload'
import config from '@/payload.config'

import { describe, it, beforeAll, expect } from 'vitest'

let payload: Payload
let createdId: number | undefined

describe('Recent Searches', () => {
  beforeAll(async () => {
    const payloadConfig = await config
    payload = await getPayload({ config: payloadConfig })
  })

  it('creates and deletes a recent search without server error', async () => {
    const users = await payload.find({ collection: 'users', limit: 1, where: { role: { equals: 'admin' } }, pagination: false })
    const adminUser = users.docs[0]
    expect(adminUser).toBeDefined()

    const created = await payload.create({
      collection: 'recent-searches',
      data: {
        user: adminUser.id,
        query: 'Test Query',
        normalizedQuery: 'test query',
        scope: 'courses',
        frequency: 1,
      },
    })

    expect(created).toBeDefined()
    createdId = (created as any).id
    expect(typeof createdId).toBe('number')

    const deleted = await payload.delete({ collection: 'recent-searches', where: { id: { equals: createdId } } })
    expect(deleted).toBeDefined()
  })
})

