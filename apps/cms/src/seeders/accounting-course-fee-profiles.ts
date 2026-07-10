import 'dotenv/config'
import { getPayload } from 'payload'
import config from '../payload.config'
import { ACCOUNTING_COLLECTION_SLUGS } from '../accounting/constants/accounting'

const SAMPLE_PROFILES = [
  { courseCode: 'STCW-PST-01', certificateFee: 1500, retakeFee: 3000, reassessmentFee: 2000, renewalFee: 2500, latePaymentFee: 500, manualAdjustmentAllowed: true, defaultRecognitionMethod: 'on_activation', notes: 'Standard fee profile for Personal Survival Techniques.' },
  { courseCode: 'STCW-FPFF-02', certificateFee: 1500, retakeFee: 3000, reassessmentFee: 2000, renewalFee: 2500, latePaymentFee: 500, manualAdjustmentAllowed: true, defaultRecognitionMethod: 'straight_line', notes: 'Fire Prevention & Fire Fighting — includes practical assessment.' },
  { courseCode: 'STCW-EFA-03', certificateFee: 800, retakeFee: 1500, reassessmentFee: 1000, renewalFee: 1200, latePaymentFee: 300, manualAdjustmentAllowed: false, defaultRecognitionMethod: 'completion_based', notes: 'Elementary First Aid — completion-based recognition.' },
  { courseCode: 'ENG-HV-22', certificateFee: 2500, retakeFee: 5000, reassessmentFee: 3500, renewalFee: 4000, latePaymentFee: 750, manualAdjustmentAllowed: true, defaultRecognitionMethod: 'certificate_based', notes: 'High Voltage Power Systems — certificate-based revenue recognition.' },
  { courseCode: 'ENG-CRD-23', certificateFee: 2000, retakeFee: 4000, reassessmentFee: 3000, renewalFee: 3500, latePaymentFee: 600, manualAdjustmentAllowed: true, defaultRecognitionMethod: 'straight_line', notes: 'Common Rail Diesel Diagnostics — straight-line over course duration.' },
  { courseCode: 'ENG-MGT-24', certificateFee: 3000, retakeFee: 6000, reassessmentFee: 4000, renewalFee: 5000, latePaymentFee: 1000, manualAdjustmentAllowed: true, defaultRecognitionMethod: 'manual', notes: 'Engine Room Management — manual recognition per instructor.' },
  { courseCode: 'CRS-TFA-31', certificateFee: 3500, retakeFee: 7000, reassessmentFee: 5000, renewalFee: 5500, latePaymentFee: 1000, manualAdjustmentAllowed: false, defaultRecognitionMethod: 'completion_based', notes: 'Tanker Familiarization — premium fee structure.' },
  { courseCode: 'CRS-FRT-32', certificateFee: 2200, retakeFee: 4500, reassessmentFee: 3000, renewalFee: 3800, latePaymentFee: 750, manualAdjustmentAllowed: true, defaultRecognitionMethod: 'on_activation', notes: 'Advanced Cargo Handling — standard on-activation recognition.' },
  { courseCode: 'CRS-GCN-34', certificateFee: 1800, retakeFee: 3600, reassessmentFee: 2500, renewalFee: 3000, latePaymentFee: 500, manualAdjustmentAllowed: true, defaultRecognitionMethod: 'straight_line', notes: 'Global Container Logistics — straight-line recognition.' },
  { courseCode: 'LAW-MLC-52', certificateFee: 1200, retakeFee: 2400, reassessmentFee: 1800, renewalFee: 2000, latePaymentFee: 400, manualAdjustmentAllowed: true, defaultRecognitionMethod: 'on_activation', notes: null },
]

async function seedCourseFeeProfiles() {
  console.log('[seed:course-fee-profiles] Connecting to Payload...')
  const payload = await getPayload({ config })

  const courses = await payload.find({
    collection: 'courses',
    depth: 0,
    limit: 100,
    overrideAccess: true,
  })
  if (!courses.docs.length) {
    console.error('[seed:course-fee-profiles] No courses found. Seed courses first.')
    process.exit(1)
  }
  console.log(`[seed:course-fee-profiles] Found ${courses.docs.length} courses`)

  const courseByCode = new Map<string, unknown>()
  for (const c of courses.docs) {
    const course = c as unknown as Record<string, unknown>
    if (course.courseCode) {
      courseByCode.set(String(course.courseCode), c)
    }
  }

  const accounts = await payload.find({
    collection: ACCOUNTING_COLLECTION_SLUGS.chartOfAccounts,
    depth: 0,
    limit: 50,
    overrideAccess: true,
  })
  if (!accounts.docs.length) {
    console.error('[seed:course-fee-profiles] No chart of accounts found. Seed chart of accounts first.')
    process.exit(1)
  }
  console.log(`[seed:course-fee-profiles] Found ${accounts.docs.length} chart of accounts`)

  const accountByName = new Map<string, unknown>()
  for (const acct of accounts.docs) {
    const a = acct as unknown as Record<string, unknown>
    if (a.name) {
      accountByName.set(String(a.name), acct)
    }
  }

  const revenueAcct = accountByName.get('Course Revenue')
  const deferredAcct = accountByName.get('Deferred Revenue')
  const certRevenueAcct = accountByName.get('Course Revenue')
  const discountAcct = accountByName.get('Sales Discount')
  const instructorAcct = accountByName.get('Salaries Expense')

  let created = 0

  for (const profile of SAMPLE_PROFILES) {
    const course = courseByCode.get(profile.courseCode)
    if (!course) {
      console.log(`[seed:course-fee-profiles] Skipping ${profile.courseCode} — course not found`)
      continue
    }

    const existing = await payload.find({
      collection: ACCOUNTING_COLLECTION_SLUGS.courseFeeProfiles,
      where: {
        course: { equals: (course as unknown as Record<string, unknown>).id },
      },
      overrideAccess: true,
    })

    if (existing.docs.length > 0) {
      console.log(`[seed:course-fee-profiles] Skipping ${profile.courseCode} (already exists)`)
      continue
    }

    await payload.create({
      collection: ACCOUNTING_COLLECTION_SLUGS.courseFeeProfiles,
      overrideAccess: true,
      data: {
        course: (course as unknown as Record<string, unknown>).id,
        certificateFee: profile.certificateFee,
        retakeFee: profile.retakeFee,
        reassessmentFee: profile.reassessmentFee,
        renewalFee: profile.renewalFee,
        latePaymentFee: profile.latePaymentFee,
        manualAdjustmentAllowed: profile.manualAdjustmentAllowed,
        defaultRecognitionMethod: profile.defaultRecognitionMethod,
        courseRevenueAccount: revenueAcct ? (revenueAcct as unknown as Record<string, unknown>).id : undefined,
        deferredRevenueAccount: deferredAcct ? (deferredAcct as unknown as Record<string, unknown>).id : undefined,
        certificateRevenueAccount: certRevenueAcct ? (certRevenueAcct as unknown as Record<string, unknown>).id : undefined,
        discountContraRevenueAccount: discountAcct ? (discountAcct as unknown as Record<string, unknown>).id : undefined,
        instructorExpenseAccount: instructorAcct ? (instructorAcct as unknown as Record<string, unknown>).id : undefined,
        notes: profile.notes,
      } as never,
    })

    console.log(`[seed:course-fee-profiles] Created fee profile for ${profile.courseCode} (${profile.defaultRecognitionMethod})`)
    created++
  }

  console.log(`[seed:course-fee-profiles] Done. Created: ${created}`)
  process.exit(0)
}

seedCourseFeeProfiles().catch((error) => {
  console.error('[seed:course-fee-profiles] Fatal error:', error)
  process.exit(1)
})
