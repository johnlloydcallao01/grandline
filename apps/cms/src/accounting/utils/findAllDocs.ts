import type { Payload, Where } from 'payload'

type FindAllDocsArgs = {
  payload: Payload
  collection: string
  where?: Where
  depth?: number
  sort?: string
  pageSize?: number
}

export const findAllDocs = async <T = Record<string, unknown>>({
  payload,
  collection,
  where,
  depth = 0,
  sort,
  pageSize = 200,
}: FindAllDocsArgs): Promise<T[]> => {
  const docs: T[] = []
  let page = 1
  let totalPages = 1

  do {
    const result = await payload.find({
      collection: collection as any,
      where,
      depth,
      sort,
      limit: pageSize,
      page,
      overrideAccess: true,
    })

    docs.push(...((result.docs as T[]) || []))
    totalPages = result.totalPages || 1
    page += 1
  } while (page <= totalPages)

  return docs
}
