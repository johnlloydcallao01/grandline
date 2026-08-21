// Shared normalization and search conditions for certificate-eligible
// enrollments. Used by the admin eligible route and the instructor eligible
// route so both scopes return the exact same frontend-ready shape
// (see docs/fetching-solution.md).

import type { Payload } from 'payload'
import type { EligibleEnrollment } from '@encreasl/cms-types'

export const ELIGIBLE_CONDITIONS = [
  { finalEvaluation: { equals: 'passed' } },
  { certificateIssued: { not_equals: true } },
  { isArchived: { not_equals: true } },
  { status: { not_in: 'dropped,expired,suspended' } },
]

export function normalizeEligibleEnrollment(d: any): EligibleEnrollment {
  const student = d.student && typeof d.student === 'object' ? d.student : null
  const course = d.course && typeof d.course === 'object' ? d.course : null
  const studentUser = student?.user && typeof student.user === 'object' ? student.user : null

  const courseTitle = course ? course.title || `Course #${course.id}` : 'Unknown Course'

  let studentName = `Trainee #${student ? student.id : d.student}`
  if (studentUser) {
    const name = [studentUser.firstName, studentUser.lastName].filter(Boolean).join(' ')
    studentName = name || studentUser.email || studentName
  } else if (student && student.srn) {
    studentName = student.srn
  }

  return {
    id: Number(d.id),
    studentName,
    studentEmail: studentUser?.email || '',
    courseId: course ? Number(course.id ?? 0) : 0,
    courseTitle,
    hasTemplate: Boolean(course && course.certificateTemplate),
    completedAt: d.completedAt || null,
  }
}

// Search conditions shared by the admin and instructor eligible endpoints.
// Resolves name/email matches to trainee ids and includes course-title matches.
export async function buildEligibleSearchConditions(payload: Payload, search: string): Promise<any[]> {
  const orConditions: any[] = []

  const matchingUsers = await payload.find({
    collection: 'users',
    where: {
      or: [
        { firstName: { like: search } },
        { lastName: { like: search } },
        { email: { like: search } },
      ],
    },
    limit: 200,
    overrideAccess: true,
  })

  const userIds = matchingUsers.docs.map((u) => String(u.id))

  if (userIds.length > 0) {
    const matchingTrainees = await payload.find({
      collection: 'trainees',
      where: {
        user: { in: userIds },
      },
      limit: 200,
      overrideAccess: true,
    })

    const traineeIds = matchingTrainees.docs.map((t) => String(t.id))
    if (traineeIds.length > 0) {
      orConditions.push({ student: { in: traineeIds } })
    }
  }

  orConditions.push({ 'course.title': { like: search } })

  if (search.includes(' ')) {
    const [first, last] = search.split(' ')
    if (first && last) {
      const firstLastUsers = await payload.find({
        collection: 'users',
        where: {
          and: [
            { firstName: { like: first } },
            { lastName: { like: last } },
          ],
        },
        limit: 200,
        overrideAccess: true,
      })

      const firstLastUserIds = firstLastUsers.docs.map((u) => String(u.id))
      if (firstLastUserIds.length > 0) {
        const firstLastTrainees = await payload.find({
          collection: 'trainees',
          where: {
            user: { in: firstLastUserIds },
          },
          limit: 200,
          overrideAccess: true,
        })

        const flTraineeIds = firstLastTrainees.docs.map((t) => String(t.id))
        if (flTraineeIds.length > 0) {
          orConditions.push({ student: { in: flTraineeIds } })
        }
      }
    }
  }

  return orConditions
}