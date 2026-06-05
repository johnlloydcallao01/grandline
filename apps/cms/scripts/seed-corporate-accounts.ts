import 'dotenv/config'
import { getPayload } from 'payload'
import configPromise from '@payload-config'

const sampleAccounts = [
  { accountCode: 'CA-001', name: 'BlueWave Shipping Corp.', customer: 6, billingContact: 'F. Marcelo', email: 'billing@bluewave.ph', phone: '+63 2 8123 1001', creditTerms: 'Net 30', paymentTerms: '30 days from invoice', status: 'active', notes: 'Primary corporate account for all training programs.' },
  { accountCode: 'CA-002', name: 'NorthStar Marine Services', customer: 7, billingContact: 'L. Navarro', email: 'accounts@northstar.ph', phone: '+63 2 8123 1002', creditTerms: 'Net 45', paymentTerms: '45 days from invoice', status: 'active', notes: null },
  { accountCode: 'CA-003', name: 'HarborView Tankers Ltd.', customer: 8, billingContact: 'C. Villanueva', email: 'finance@harborview.com', phone: '+63 32 412 2001', creditTerms: 'Net 30', paymentTerms: '30 days end of month', status: 'active', notes: 'Negotiated rate for bulk crew training.' },
  { accountCode: 'CA-004', name: 'Ocean Crest Manning', customer: 9, billingContact: 'R. Mendoza', email: 'billing@oceancrest.ph', phone: '+63 2 8765 2002', creditTerms: 'Net 60', paymentTerms: '60 days from invoice', status: 'active', notes: 'Manning agency account — training batches quarterly.' },
  { accountCode: 'CA-005', name: 'Pacific Anchor Logistics', customer: 10, billingContact: 'D. Gomez', email: 'ap@pacanchor.com', phone: '+63 2 8890 3001', creditTerms: 'Net 30', paymentTerms: '30 days from invoice', status: 'active', notes: null },
  { accountCode: 'CA-006', name: 'SeaLynx Maritime Inc.', customer: 11, billingContact: 'M. Torres', email: 'accounting@sealynx.ph', phone: '+63 2 8345 4001', creditTerms: 'Net 45', paymentTerms: '45 days from invoice', status: 'active', notes: 'Premium account — priority scheduling.' },
  { accountCode: 'CA-007', name: 'TransGlobal Crew Management', customer: 12, billingContact: 'J. Lim', email: 'finance@transglobal.ph', phone: '+63 2 8567 5001', creditTerms: 'Net 30', paymentTerms: '30 days from invoice', status: 'active', notes: 'International manning agency.' },
  { accountCode: 'CA-008', name: 'Island Container Lines', customer: 13, billingContact: 'A. Roxas', email: 'billing@icl.com.ph', phone: '+63 2 8789 6001', creditTerms: 'Net 60', paymentTerms: '60 days end of month', status: 'active', notes: 'Container line — large volume training.' },
  { accountCode: 'CA-009', name: 'Golden Horizon Shipping', customer: 14, billingContact: 'S. Tan', email: 'ap@goldenhorizon.ph', phone: '+63 2 8234 7001', creditTerms: 'Net 30', paymentTerms: '30 days from invoice', status: 'inactive', notes: 'Account on hold pending contract renewal.' },
  { accountCode: 'CA-010', name: 'Meridian Maritime Corp.', customer: 15, billingContact: 'K. Santiago', email: 'billing@meridianmaritime.ph', phone: '+63 2 8456 8001', creditTerms: 'Net 45', paymentTerms: '45 days from invoice', status: 'active', notes: null },
  { accountCode: 'CA-011', name: 'Sunrise Crew Services', customer: 16, billingContact: 'E. Gonzales', email: 'accounts@sunrisecrew.ph', phone: '+63 2 8678 9001', creditTerms: 'Net 30', paymentTerms: '30 days from invoice', status: 'active', notes: 'Crew services provider — monthly training.' },
  { accountCode: 'CA-012', name: 'Coastal Vessel Management', customer: 17, billingContact: 'P. Reyes', email: 'billing@coastalvessel.ph', phone: '+63 2 8790 1101', creditTerms: 'Net 30', paymentTerms: '30 days end of month', status: 'active', notes: null },
  { accountCode: 'CA-013', name: 'Pacific Crest Maritime', customer: 18, billingContact: 'L. Dela Cruz', email: 'finance@pacificcrest.ph', phone: '+63 2 8123 2201', creditTerms: 'Net 60', paymentTerms: '60 days from invoice', status: 'inactive', notes: 'Temporary inactive — vessel fleet under maintenance.' },
  { accountCode: 'CA-014', name: 'Delta River Shipping Lines', customer: 19, billingContact: 'M. Ramos', email: 'ap@deltariver.ph', phone: '+63 2 8345 3301', creditTerms: 'Net 30', paymentTerms: '30 days from invoice', status: 'active', notes: 'Domestic shipping line — local crew training.' },
  { accountCode: 'CA-015', name: 'Empire Fleet Operations', customer: 20, billingContact: 'T. Hernandez', email: 'billing@empirefleet.ph', phone: '+63 2 8567 4401', creditTerms: 'Net 45', paymentTerms: '45 days end of month', status: 'active', notes: 'Large fleet operator.' },
  { accountCode: 'CA-016', name: 'Juan Dela Cruz Maritime', customer: 1, billingContact: 'Juan Dela Cruz Jr.', email: 'billing@jdcmaritime.ph', phone: '+63 2 8789 5501', creditTerms: 'Net 15', paymentTerms: '15 days from invoice', status: 'active', notes: 'Individual owner-operator account.' },
  { accountCode: 'CA-017', name: 'Maria Santos Shipping', customer: 2, billingContact: 'Maria Santos', email: 'accounts@msshipping.ph', phone: '+63 2 8890 6601', creditTerms: 'Net 30', paymentTerms: '30 days from invoice', status: 'active', notes: null },
  { accountCode: 'CA-018', name: 'Pedro Reyes Logistics', customer: 3, billingContact: 'Pedro Reyes', email: 'billing@prlogistics.ph', phone: '+63 2 8456 7701', creditTerms: 'Net 30', paymentTerms: '30 days from invoice', status: 'active', notes: 'Logistics and supply chain training.' },
  { accountCode: 'CA-019', name: 'Ana Lopez Training Fund', customer: 4, billingContact: 'Ana Lopez', email: 'finance@analtraining.ph', phone: '+63 2 8678 8801', creditTerms: 'Net 30', paymentTerms: '30 days end of month', status: 'active', notes: 'Individual training fund account.' },
  { accountCode: 'CA-020', name: 'Ramon Bautista Marine Services', customer: 5, billingContact: 'Ramon Bautista', email: 'ap@rbautista.ph', phone: '+63 2 8790 9901', creditTerms: 'Net 45', paymentTerms: '45 days from invoice', status: 'active', notes: null },
]

async function seed() {
  const payload = await getPayload({ config: configPromise })

  const adminUser = await payload.find({
    collection: 'users',
    where: { role: { equals: 'admin' } } as never,
    limit: 1,
    overrideAccess: true,
  })

  const adminId = adminUser.docs[0]?.id ?? null

  let created = 0
  let skipped = 0

  for (const acct of sampleAccounts) {
    const existing = await payload.find({
      collection: 'accounting-corporate-accounts',
      where: { accountCode: { equals: acct.accountCode } } as never,
      limit: 1,
      overrideAccess: true,
    })

    if (existing.totalDocs > 0) {
      console.log(`Skipping ${acct.accountCode} — already exists.`)
      skipped++
      continue
    }

    await payload.create({
      collection: 'accounting-corporate-accounts',
      overrideAccess: true,
      data: {
        ...acct,
        createdBy: adminId,
        updatedBy: adminId,
      } as never,
    })

    console.log(`Created ${acct.accountCode} — ${acct.name}`)
    created++
  }

  console.log(`\nDone. ${created} created, ${skipped} skipped.`)
  process.exit(0)
}

seed().catch((err) => {
  console.error('Seed failed:', err)
  process.exit(1)
})
