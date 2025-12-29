import type { Payload } from 'payload'

export async function getActiveAssignedPostCategories(payload: Payload) {
    const postsResult = await payload.find({
        collection: 'posts',
        limit: 10000,
        depth: 0,
    })

    const posts = postsResult.docs as Array<{ category?: number[] }>

    const set = new Set<number>()
    for (const post of posts) {
        const catIds = (Array.isArray(post.category) ? post.category : []) as number[]
        for (const id of catIds) set.add(id)
    }

    const ids = Array.from(set)

    if (ids.length === 0) {
        return { count: 0, categories: [] }
    }

    const categoriesResult = await payload.find({
        collection: 'post-categories',
        where: { id: { in: ids }, isActive: { equals: true } },
        limit: ids.length,
        depth: 2,
    })

    return { count: categoriesResult.totalDocs, categories: categoriesResult.docs }
}
