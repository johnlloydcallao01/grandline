type PayloadLike = {
  findByID: (args: any) => Promise<any>
}

type Ref = number | string | { id: number | string }

function toId(ref: Ref | null | undefined): number | string | null {
  if (ref === null || ref === undefined) return null
  return typeof ref === 'object' ? ref.id : ref
}

/**
 * Resolve the users collection IDs for the primary instructor and all
 * co-instructors of a course.
 */
export async function getCourseInstructorUserIds(
  payload: PayloadLike,
  courseId: number | string,
): Promise<Array<number | string>> {
  const course = await payload.findByID({
    collection: 'courses',
    id: courseId,
    depth: 0,
    overrideAccess: true,
  })

  if (!course) return []

  const instructorRefs: Array<number | string> = []
  const primary = toId(course.instructor as Ref | null)
  if (primary) instructorRefs.push(primary)

  for (const co of (course.coInstructors as Ref[] | undefined) || []) {
    const coId = toId(co)
    if (coId && !instructorRefs.includes(coId)) instructorRefs.push(coId)
  }

  const userIds: Array<number | string> = []
  for (const instructorId of instructorRefs) {
    const instructor = await payload.findByID({
      collection: 'instructors',
      id: instructorId,
      depth: 0,
      overrideAccess: true,
    })
    const userId = toId(instructor?.user as Ref | null)
    if (userId && !userIds.includes(userId)) userIds.push(userId)
  }

  return userIds
}

/**
 * Resolve the users collection ID for a trainee record.
 */
export async function getTraineeUserId(
  payload: PayloadLike,
  traineeId: number | string,
): Promise<number | string | null> {
  const trainee = await payload.findByID({
    collection: 'trainees',
    id: traineeId,
    depth: 0,
    overrideAccess: true,
  })
  return toId(trainee?.user as Ref | null)
}

/**
 * Build a display name for a user record.
 */
export async function getUserDisplayName(
  payload: PayloadLike,
  userId: number | string,
): Promise<string> {
  const user = await payload.findByID({
    collection: 'users',
    id: userId,
    depth: 0,
    overrideAccess: true,
  })

  if (!user) return ''
  const name = [user.firstName, user.lastName].filter(Boolean).join(' ').trim()
  return name || user.username || user.email || ''
}