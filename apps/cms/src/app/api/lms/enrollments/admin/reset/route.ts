import { NextRequest } from 'next/server'
import { getPayload } from 'payload'
import configPromise from '@payload-config'

type StepConfig = {
  key: string
  label: string
  collection: string
  field?: string
  getIds?: (deps: any[]) => any[]
  deps?: string[]
}

const STEPS: StepConfig[] = [
  { key: 'submission-answers', label: 'Assessment answers', collection: 'submission-answers' },
  { key: 'assessment-submissions', label: 'Assessment submissions', collection: 'assessment-submissions', deps: ['submission-answers'] },
  { key: 'assignment-submissions', label: 'Assignment submissions', collection: 'assignment-submissions' },
  { key: 'course-item-progress', label: 'Lesson progress', collection: 'course-item-progress' },
  { key: 'certificates', label: 'Certificates', collection: 'certificates' },
  { key: 'enrollment', label: 'Reset enrollment', collection: 'course-enrollments' },
]

function writeLine(controller: ReadableStreamDefaultController, data: Record<string, any>) {
  controller.enqueue(new TextEncoder().encode(JSON.stringify(data) + '\n'))
}

export async function POST(request: NextRequest) {
  const encoder = new TextEncoder()

  try {
    const payload = await getPayload({ config: configPromise })
    const body = await request.json()
    const { enrollmentId } = body

    if (!enrollmentId) {
      return new Response(
        encoder.encode(JSON.stringify({ error: 'enrollmentId is required' }) + '\n'),
        { status: 400, headers: { 'Content-Type': 'application/x-ndjson' } },
      )
    }

    const enrollment = await payload.findByID({
      collection: 'course-enrollments',
      id: enrollmentId,
      depth: 0,
      overrideAccess: true,
    })

    if (!enrollment) {
      return new Response(
        encoder.encode(JSON.stringify({ error: 'Enrollment not found' }) + '\n'),
        { status: 404, headers: { 'Content-Type': 'application/x-ndjson' } },
      )
    }

    const stream = new ReadableStream({
      async start(controller) {
        try {
          // Phase 1: Scan all records to calculate total
          writeLine(controller, { phase: 'scan', label: 'Scanning records...', progress: 0 })

          const assessmentSubs = await payload.find({
            collection: 'assessment-submissions',
            where: { enrollment: { equals: enrollmentId } },
            limit: 500,
            overrideAccess: true,
          })
          const subIds = assessmentSubs.docs.map((d: any) => d.id)

          let answerIds: any[] = []
          if (subIds.length > 0) {
            const answers = await payload.find({
              collection: 'submission-answers',
              where: { submission: { in: subIds } },
              limit: 1000,
              overrideAccess: true,
            })
            answerIds = answers.docs.map((d: any) => d.id)
          }

          const assignmentSubs = await payload.find({
            collection: 'assignment-submissions',
            where: { enrollment: { equals: enrollmentId } },
            limit: 500,
            overrideAccess: true,
          })

          const itemProgress = await payload.find({
            collection: 'course-item-progress',
            where: { enrollment: { equals: enrollmentId } },
            limit: 1000,
            overrideAccess: true,
          })

          const certificates = await payload.find({
            collection: 'certificates',
            where: { enrollment: { equals: enrollmentId } },
            limit: 100,
            overrideAccess: true,
          })

          // Build collection → docs map
          const collectionDocs: Record<string, any[]> = {
            'submission-answers': answerIds.map((id: any) => ({ id, collection: 'submission-answers' })),
            'assessment-submissions': assessmentSubs.docs.map((d: any) => ({ id: d.id, collection: 'assessment-submissions' })),
            'assignment-submissions': assignmentSubs.docs.map((d: any) => ({ id: d.id, collection: 'assignment-submissions' })),
            'course-item-progress': itemProgress.docs.map((d: any) => ({ id: d.id, collection: 'course-item-progress' })),
            'certificates': certificates.docs.map((d: any) => ({ id: d.id, collection: 'certificates' })),
            'course-enrollments': [{ id: enrollmentId, collection: 'course-enrollments' }],
          }

          const totalItems = Object.values(collectionDocs).reduce((sum, docs) => sum + docs.length, 0)
          let globalDeleted = 0

          // Phase 2: Process each step
          for (const step of STEPS) {
            const docs = collectionDocs[step.collection] || []

            if (docs.length === 0) {
              writeLine(controller, {
                phase: 'step_skip',
                stepKey: step.key,
                label: step.label,
                progress: Math.round((globalDeleted / totalItems) * 100) || 0,
              })
              continue
            }

            writeLine(controller, {
              phase: 'step_start',
              stepKey: step.key,
              label: step.label,
              total: docs.length,
              progress: Math.round((globalDeleted / totalItems) * 100) || 0,
            })

            if (step.collection === 'course-enrollments') {
              await payload.update({
                collection: 'course-enrollments',
                id: enrollmentId,
                data: {
                  progressPercentage: 0,
                  lastAccessedAt: null,
                  completedAt: null,
                  status: 'active',
                  currentGrade: null,
                  finalGrade: null,
                  finalEvaluation: null,
                  certificateIssued: false,
                },
                overrideAccess: true,
                req: { context: { source: 'admin' } },
              })
              globalDeleted++
            } else {
              for (let i = 0; i < docs.length; i++) {
                await payload.delete({
                  collection: docs[i].collection,
                  id: docs[i].id,
                  overrideAccess: true,
                })
                globalDeleted++
                writeLine(controller, {
                  phase: 'step_progress',
                  stepKey: step.key,
                  label: step.label,
                  current: i + 1,
                  total: docs.length,
                  progress: Math.round((globalDeleted / totalItems) * 100),
                })
              }
            }

            writeLine(controller, {
              phase: 'step_complete',
              stepKey: step.key,
              label: step.label,
              progress: Math.round((globalDeleted / totalItems) * 100) || 0,
            })
          }

          writeLine(controller, {
            phase: 'done',
            label: 'Reset complete',
            deleted: totalItems - 1,
            progress: 100,
            success: true,
          })

          controller.close()
        } catch (error: any) {
          writeLine(controller, {
            phase: 'error',
            label: error?.message || 'Internal server error',
            error: error?.message || 'Internal server error',
          })
          controller.close()
        }
      },
    })

    return new Response(stream, {
      headers: {
        'Content-Type': 'application/x-ndjson',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    })
  } catch (error: any) {
    console.error('Error resetting enrollment:', error)
    return new Response(
      encoder.encode(JSON.stringify({ error: error?.message || 'Internal server error' }) + '\n'),
      { status: 500, headers: { 'Content-Type': 'application/x-ndjson' } },
    )
  }
}
