import 'dotenv/config'
import { getPayload } from 'payload'
import configPromise from '@payload-config'

async function seed() {
  const payload = await getPayload({ config: configPromise })

  // ── Fetch reference data ──
  const [users, trainees, existingCourses, customers, existingInstructors] = await Promise.all([
    payload.find({ collection: 'users', limit: 50, depth: 0, overrideAccess: true }),
    payload.find({ collection: 'trainees', limit: 50, depth: 0, overrideAccess: true }),
    payload.find({ collection: 'courses', limit: 50, depth: 0, overrideAccess: true }),
    payload.find({ collection: 'accounting-customers', limit: 50, depth: 0, overrideAccess: true }),
    payload.find({ collection: 'instructors', limit: 50, depth: 0, overrideAccess: true }),
  ])

  const adminId = users.docs[0]?.id ?? 1
  const traineeList = trainees.docs.map((d: any) => d.id)
  const customerList = customers.docs.map((d: any) => d.id)

  if (!traineeList.length) { console.error('No trainees found.'); process.exit(1) }

  // ── Ensure at least one instructor exists ──
  let instructorId: number
  if (existingInstructors.docs.length > 0) {
    instructorId = existingInstructors.docs[0].id
    console.log(`Using existing instructor (id: ${instructorId})`)
  } else {
    const created = await payload.create({
      collection: 'instructors',
      overrideAccess: true,
      data: {
        user: adminId,
        specialization: 'Maritime Training',
      } as never,
    })
    instructorId = created.id as number
    console.log(`Created instructor (id: ${instructorId})`)
  }

  // ── Ensure courses exist ──
  const courseNames = [
    { code: 'BRM-101', title: 'Bridge Resource Management', price: 15000 },
    { code: 'STCW-BT', title: 'STCW Basic Training', price: 12000 },
    { code: 'ECDIS-202', title: 'ECDIS Navigation', price: 18000 },
    { code: 'MED-PRO', title: 'Medical First Aid', price: 8000 },
    { code: 'FF-101', title: 'Fire Fighting & Fire Prevention', price: 10000 },
  ]

  const createdCourseIds: number[] = []

  for (const course of courseNames) {
    const existing = existingCourses.docs.find((d: any) => d.courseCode === course.code)
    if (existing) {
      createdCourseIds.push(existing.id)
      console.log(`Course already exists: ${course.code} (id: ${existing.id})`)
    } else {
      const created = await payload.create({
        collection: 'courses',
        overrideAccess: true,
        data: {
          title: course.title,
          courseCode: course.code,
          price: course.price,
          status: 'published',
          instructor: instructorId,
          createdBy: adminId,
        } as never,
      })
      createdCourseIds.push(created.id as number)
      console.log(`Created course: ${course.code} (id: ${created.id})`)
    }
  }

  // ── Ensure completed course enrollments exist ──
  const existingEnrollments = await payload.find({
    collection: 'course-enrollments',
    limit: 100,
    depth: 0,
    overrideAccess: true,
  })

  const existingCompletedMap = new Map(
    existingEnrollments.docs
      .filter((d: any) => d.status === 'completed')
      .map((d: any) => [String(d.student) + '-' + String(d.course), d.id])
  )

  const createdEnrollmentIds: number[] = []

  for (let i = 0; i < 5; i++) {
    const traineeId = traineeList[i % traineeList.length]
    const courseId = createdCourseIds[i]
    const key = String(traineeId) + '-' + String(courseId)

    if (existingCompletedMap.has(key)) {
      createdEnrollmentIds.push(existingCompletedMap.get(key)!)
      console.log(`Completed enrollment exists for trainee ${traineeId}, course ${courseId}`)
      continue
    }

    const completedAt = new Date(2026, 2 + i, 10 + i).toISOString()
    const created = await payload.create({
      collection: 'course-enrollments',
      overrideAccess: true,
      data: {
        student: traineeId,
        course: courseId,
        status: 'completed',
        enrollmentType: 'paid',
        enrolledAt: new Date(2026, 0, 1).toISOString(),
        completedAt,
        progressPercentage: 100,
        paymentStatus: 'completed',
        amountPaid: courseNames[i].price,
        finalPriceSnapshot: courseNames[i].price,
        listPriceSnapshot: courseNames[i].price,
        enrolledBy: adminId,
      } as never,
    })
    createdEnrollmentIds.push(created.id as number)
    console.log(`Created completed enrollment (id: ${created.id}) for trainee ${traineeId}, course ${courseId}`)
  }

  // ── Ensure enrollment billing links exist with charge snapshots ──
  const existingBillingLinks = await payload.find({
    collection: 'accounting-enrollment-billing-links',
    limit: 100,
    depth: 1,
    overrideAccess: true,
  })

  const linkedEnrollmentIds = new Set(
    existingBillingLinks.docs.map((d: any) =>
      typeof d.enrollment === 'object' ? d.enrollment?.id : d.enrollment
    ).filter(Boolean)
  )

  for (let i = 0; i < createdEnrollmentIds.length; i++) {
    const enrollmentId = createdEnrollmentIds[i]
    if (linkedEnrollmentIds.has(enrollmentId)) {
      console.log(`Billing link exists for enrollment ${enrollmentId}`)
      continue
    }

    const courseId = createdCourseIds[i]
    const traineeId = traineeList[i % traineeList.length]
    const customerId = customerList[i % customerList.length] ?? undefined
    const price = courseNames[i].price
    const recognized = Math.round(price * (0.6 + Math.random() * 0.4))

    const ref = `ENR-BILL-${String(enrollmentId).padStart(3, '0')}`
    await payload.create({
      collection: 'accounting-enrollment-billing-links',
      overrideAccess: true,
      data: {
        enrollment: enrollmentId,
        course: courseId,
        trainee: traineeId,
        customer: customerId,
        sourceType: 'enrollment',
        sourceReference: ref,
        billingStatus: 'invoiced',
        listPriceSnapshot: price,
        salePriceSnapshot: price,
        finalChargeSnapshot: price,
        recognizedRevenueSnapshot: recognized,
        currency: 'PHP',
        createdBy: adminId,
        updatedBy: adminId,
      } as never,
    })
    console.log(`Created billing link for enrollment ${enrollmentId} (finalCharge: ${price}, recognized: ${recognized})`)
  }

  // ── Ensure certificates exist (for Certificate Revenue tab) ──
  const existingCertificates = await payload.find({
    collection: 'certificates',
    limit: 100,
    depth: 1,
    overrideAccess: true,
  })

  const linkedEnrollmentCertificates = new Set(
    existingCertificates.docs
      .filter((d: any) => d.status === 'active')
      .map((d: any) =>
        typeof d.enrollment === 'object' ? d.enrollment?.id : d.enrollment
      ).filter(Boolean)
  )

  for (let i = 0; i < createdEnrollmentIds.length; i++) {
    const enrollmentId = createdEnrollmentIds[i]
    if (linkedEnrollmentCertificates.has(enrollmentId)) {
      console.log(`Certificate exists for enrollment ${enrollmentId}`)
      continue
    }

    const traineeId = traineeList[i % traineeList.length]
    const courseId = createdCourseIds[i]
    const certCode = `CERT-2026-${String(i + 1).padStart(4, '0')}`
    const issueDate = new Date(2026, 2 + i, 15 + i).toISOString()

    await payload.create({
      collection: 'certificates',
      overrideAccess: true,
      data: {
        certificateCode: certCode,
        trainee: traineeId,
        course: courseId,
        enrollment: enrollmentId,
        issueDate,
        status: 'active',
      } as never,
    })
    console.log(`Created certificate ${certCode} for enrollment ${enrollmentId}`)
  }

  console.log('\nSeed complete.')
  process.exit(0)
}

seed().catch((err) => {
  console.error('Seed failed:', err)
  process.exit(1)
})
