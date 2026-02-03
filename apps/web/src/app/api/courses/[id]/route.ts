import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params
    if (!id) {
      return NextResponse.json({ error: 'Missing course id' }, { status: 400 })
    }

    const apiKey = process.env.PAYLOAD_API_KEY
    if (!apiKey) {
      console.error('PAYLOAD_API_KEY is not configured')
      return NextResponse.json({ error: 'API configuration error' }, { status: 500 })
    }

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'Authorization': `users API-Key ${apiKey}`,
    }

    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://cms.grandlinemaritime.com/api'

    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')

    const courseRes = await fetch(`${apiUrl}/courses/${id}?depth=2`, {
      headers,
      cache: 'no-store',
    })

    if (!courseRes.ok) {
      if (courseRes.status === 404) {
        return NextResponse.json({ error: 'Course not found' }, { status: 404 })
      }
      console.error(`PayloadCMS course fetch error: ${courseRes.status}`)
      return NextResponse.json({ error: 'Failed to fetch course' }, { status: courseRes.status })
    }

    const courseData: any = await courseRes.json()
    const courseId = courseData?.id

    let curriculum: any = null
    let courseMaterials: any[] = []
    let announcements: any[] = []
    let enrollmentStatus: string | null = null

    if (courseId) {
      const paramsModules = new URLSearchParams()
      paramsModules.set('where[course][equals]', String(courseId))
      paramsModules.set('sort', 'order')
      paramsModules.set('limit', '100')
      paramsModules.set('depth', '0')

      const modulesRes = await fetch(`${apiUrl}/course-modules?${paramsModules.toString()}`, {
        headers,
        cache: 'no-store',
      })

      const modulesJson = modulesRes.ok ? await modulesRes.json() : { docs: [] }
      const modules = Array.isArray(modulesJson?.docs) ? modulesJson.docs : []

      const moduleIds = modules.map((m: any) => m.id).filter((id: unknown) => id !== null && id !== undefined)

      let lessons: any[] = []
      if (moduleIds.length > 0) {
        const paramsLessons = new URLSearchParams()
        paramsLessons.set('sort', 'order')
        paramsLessons.set('limit', '500')
        paramsLessons.set('depth', '0')
        paramsLessons.set('where[module][in]', moduleIds.join(','))

        const lessonsRes = await fetch(
          `${apiUrl}/course-lessons?${paramsLessons.toString()}`,
          {
            headers,
            cache: 'no-store',
          },
        )

        const lessonsJson = lessonsRes.ok ? await lessonsRes.json() : { docs: [] }
        lessons = Array.isArray(lessonsJson?.docs) ? lessonsJson.docs : []
      }

      const paramsAssessments = new URLSearchParams()
      paramsAssessments.set('sort', 'order')
      paramsAssessments.set('limit', '500')
      paramsAssessments.set('depth', '0')

      const assessmentsRes = await fetch(`${apiUrl}/assessments?${paramsAssessments.toString()}`, {
        headers,
        cache: 'no-store',
      })

      const assessmentsJson = assessmentsRes.ok ? await assessmentsRes.json() : { docs: [] }
      const assessments: any[] = Array.isArray(assessmentsJson?.docs) ? assessmentsJson.docs : []

      const moduleMap: Record<string, {
        id: string;
        title: string;
        order: number;
        estimatedDurationMinutes?: number | null;
        lessons: any[];
        assessments: any[];
      }> = {}

      for (const m of modules) {
        const idStr = String(m.id)
        moduleMap[idStr] = {
          id: idStr,
          title: String(m.title || ''),
          order: typeof m.order === 'number' ? m.order : parseInt(String(m.order ?? '0'), 10) || 0,
          estimatedDurationMinutes: null,
          lessons: [],
          assessments: [],
        }
      }

      for (const lesson of lessons) {
        const moduleValue = lesson.module
        const moduleId =
          moduleValue && typeof moduleValue === 'object' && 'id' in moduleValue
            ? String((moduleValue as any).id)
            : String(moduleValue ?? '')

        if (!moduleId || !moduleMap[moduleId]) continue

        moduleMap[moduleId].lessons.push({
          id: String(lesson.id),
          title: String(lesson.title || ''),
          order:
            typeof lesson.order === 'number'
              ? lesson.order
              : parseInt(String(lesson.order ?? '0'), 10) || 0,
          estimatedDurationMinutes:
            typeof lesson.estimatedDuration === 'number'
              ? lesson.estimatedDuration
              : null,
        })
      }

      for (const mod of Object.values(moduleMap)) {
        mod.lessons.sort((a, b) => a.order - b.order)
      }

      let finalExam: any = null

      for (const a of assessments) {
        const type = String(a.assessmentType || 'quiz') as 'quiz' | 'exam' | 'final_exam'
        if (type === 'final_exam') {
          const courseRel = a.course
          const assessmentCourseId =
            courseRel && typeof courseRel === 'object' && 'id' in courseRel
              ? String((courseRel as any).id)
              : String(courseRel ?? '')

          if (!assessmentCourseId || String(assessmentCourseId) !== String(courseId)) {
            continue
          }

          if (!finalExam) {
            finalExam = {
              id: String(a.id),
              title: String(a.title || 'Final Exam'),
              order:
                typeof a.order === 'number'
                  ? a.order
                  : parseInt(String(a.order ?? '0'), 10) || 0,
              estimatedDurationMinutes:
                typeof a.estimatedDuration === 'number'
                  ? a.estimatedDuration
                  : null,
              isRequired: typeof a.isRequired === 'boolean' ? a.isRequired : true,
            }
          }

          continue
        }

        const moduleRel = a.module
        const moduleId =
          moduleRel && typeof moduleRel === 'object' && 'id' in moduleRel
            ? String((moduleRel as any).id)
            : String(moduleRel ?? '')

        if (!moduleId || !moduleMap[moduleId]) continue

        moduleMap[moduleId].assessments.push({
          id: String(a.id),
          title: String(a.title || ''),
          assessmentType: type === 'exam' ? 'exam' : 'quiz',
          order:
            typeof a.order === 'number'
              ? a.order
              : parseInt(String(a.order ?? '0'), 10) || 0,
          estimatedDurationMinutes:
            typeof a.estimatedDuration === 'number'
              ? a.estimatedDuration
              : null,
          isRequired: typeof a.isRequired === 'boolean' ? a.isRequired : true,
        })
      }

      const modulesForCurriculum = Object.values(moduleMap).sort((a, b) => a.order - b.order)

      curriculum = {
        modules: modulesForCurriculum,
        finalExam,
      }

      const paramsCourseMaterials = new URLSearchParams()
      paramsCourseMaterials.set('where[course][equals]', String(courseId))
      paramsCourseMaterials.set('sort', 'order')
      paramsCourseMaterials.set('limit', '200')
      paramsCourseMaterials.set('depth', '2')

      const courseMaterialsRes = await fetch(
        `${apiUrl}/course-materials?${paramsCourseMaterials.toString()}`,
        {
          headers,
          cache: 'no-store',
        },
      )

      const courseMaterialsJson = courseMaterialsRes.ok ? await courseMaterialsRes.json() : { docs: [] }
      const attachments: any[] = Array.isArray(courseMaterialsJson?.docs) ? courseMaterialsJson.docs : []

      const mappedAttachments = attachments.map((attachment: any) => {
        const materialValue = attachment.material
        const material =
          materialValue && typeof materialValue === 'object' && 'id' in materialValue
            ? materialValue
            : null

        const materialId =
          material && material.id != null
            ? String(material.id)
            : materialValue != null
              ? String(materialValue)
              : ''

        const title =
          material && typeof material.title === 'string'
            ? material.title
            : ''

        const description =
          material && typeof material.description === 'string'
            ? material.description
            : null

        const materialSourceRaw =
          material && typeof material.materialSource === 'string'
            ? material.materialSource
            : 'media'

        const materialSource = materialSourceRaw === 'external' ? 'external' as const : 'media' as const

        const externalUrl =
          material && typeof material.externalUrl === 'string'
            ? material.externalUrl
            : null

        let media: any[] = []
        if (material && Array.isArray(material.media)) {
          media = material.media
            .map((m: any) => (m && typeof m === 'object' ? m : null))
            .filter((m: any) => m !== null)
        }

        const orderValue = attachment.order
        const order =
          typeof orderValue === 'number'
            ? orderValue
            : parseInt(String(orderValue ?? '0'), 10) || 0

        const isRequiredValue = attachment.isRequired
        const isRequired =
          typeof isRequiredValue === 'boolean'
            ? isRequiredValue
            : false

        return {
          id: String(attachment.id),
          order,
          isRequired,
          materialId,
          title: String(title),
          description,
          materialSource,
          externalUrl,
          media,
        }
      })

      courseMaterials = mappedAttachments.sort((a, b) => a.order - b.order)

      const paramsAnnouncements = new URLSearchParams()
      paramsAnnouncements.set('where[course][equals]', String(courseId))
      paramsAnnouncements.set('sort', '-visibleFrom')
      paramsAnnouncements.set('limit', '100')
      paramsAnnouncements.set('depth', '1')

      const announcementsRes = await fetch(
        `${apiUrl}/announcements?${paramsAnnouncements.toString()}`,
        {
          headers,
          cache: 'no-store',
        },
      )

      const announcementsJson = announcementsRes.ok ? await announcementsRes.json() : { docs: [] }
      const announcementDocs: any[] = Array.isArray(announcementsJson?.docs) ? announcementsJson.docs : []

      announcements = announcementDocs.map((a: any) => {
        const createdBy = a.createdBy
        let authorName: string | null = null

        if (createdBy && typeof createdBy === 'object') {
          const first =
            typeof createdBy.firstName === 'string'
              ? createdBy.firstName
              : typeof createdBy.first_name === 'string'
                ? createdBy.first_name
                : ''
          const last =
            typeof createdBy.lastName === 'string'
              ? createdBy.lastName
              : typeof createdBy.last_name === 'string'
                ? createdBy.last_name
                : ''
          const fullName = `${first} ${last}`.trim()
          const email =
            typeof createdBy.email === 'string' ? createdBy.email : null

          authorName = fullName || email
        }

        return {
          id: String(a.id),
          title: String(a.title || ''),
          body: a.bodyBlocks ?? null,
          pinned: Boolean(a.pinned),
          visibleFrom: a.visibleFrom || null,
          visibleUntil: a.visibleUntil || null,
          createdAt: a.createdAt || null,
          authorName: authorName || null,
        }
      })

      announcements.sort((a, b) => {
        const aPinned = a.pinned ? 1 : 0
        const bPinned = b.pinned ? 1 : 0
        if (aPinned !== bPinned) {
          return bPinned - aPinned
        }
        const aDate = a.visibleFrom || a.createdAt || ''
        const bDate = b.visibleFrom || b.createdAt || ''
        const aTime = aDate ? new Date(aDate).getTime() : 0
        const bTime = bDate ? new Date(bDate).getTime() : 0
        return bTime - aTime
      })
    }

    if (userId && courseId) {
      try {
        const enrollmentParams = new URLSearchParams()
        enrollmentParams.set('userId', String(userId))
        enrollmentParams.set('course', String(courseId))
        enrollmentParams.set('limit', '1')

        const enrollmentRes = await fetch(
          `${apiUrl}/lms/enrollments?${enrollmentParams.toString()}`,
          {
            headers,
            cache: 'no-store',
          },
        )

        if (enrollmentRes.ok) {
          const enrollmentJson = await enrollmentRes.json()
          const docs: any[] = Array.isArray(enrollmentJson?.docs) ? enrollmentJson.docs : []
          const first = docs.length > 0 ? docs[0] : null
          const rawStatus = first && typeof first.status === 'string' ? first.status : null
          if (rawStatus) {
            enrollmentStatus = rawStatus
          }
        }
      } catch (enrollmentError) {
        console.error('Error fetching enrollment status for course detail:', enrollmentError)
      }
    }

    const responseBody = {
      ...courseData,
      curriculum,
      courseMaterials,
      announcements,
      enrollmentStatus,
    }

    return NextResponse.json(responseBody, {
      headers: {
        'Cache-Control': 'no-store',
      },
    })
  } catch (error) {
    console.error('Error in course detail API route:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
