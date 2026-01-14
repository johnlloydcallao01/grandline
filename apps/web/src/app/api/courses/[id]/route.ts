import { NextRequest, NextResponse } from 'next/server'

export async function GET(_request: NextRequest, context: { params: Promise<{ id: string }> }) {
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
    }

    const responseBody = {
      ...courseData,
      curriculum,
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
