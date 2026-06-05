import 'dotenv/config'
import { getPayload } from 'payload'
import configPromise from '@payload-config'

const sampleSponsors = [
  {
    sponsorCode: 'SCH-001',
    name: 'Maritime Scholars Fund',
    contactName: 'L. Garcia',
    email: 'scholars@msf.org',
    phone: '+63 2 8123 4567',
    billingAddress: '12th Floor, Pacific Tower, 88 A. Mabini St., Manila, Philippines',
    status: 'active',
    notes: 'Flagship scholarship fund for maritime training programs.',
  },
  {
    sponsorCode: 'SCH-002',
    name: 'Coastal Education Grant',
    contactName: 'M. Reyes',
    email: 'grants@coastaledu.ph',
    phone: '+63 32 345 6789',
    billingAddress: 'Unit 5B, Seaside Plaza, F. Gonzales St., Cebu City, Philippines',
    status: 'active',
    notes: 'Government-sponsored grant for coastal community trainees.',
  },
  {
    sponsorCode: 'SCH-003',
    name: 'Harbor Skills Grant',
    contactName: 'A. Reyes',
    email: 'grants@harborskills.ph',
    phone: '+63 2 8987 6543',
    billingAddress: '3rd Floor, Harbor Center, 45 Pier 15, Manila North Harbor, Philippines',
    status: 'active',
    notes: null,
  },
  {
    sponsorCode: 'SCH-004',
    name: 'Philippine Seafarer Advancement Program',
    contactName: 'C. Villanueva',
    email: 'admin@psap.org.ph',
    phone: '+63 2 8765 4321',
    billingAddress: 'PSAP Building, 200 T.M. Kalaw St., Ermita, Manila, Philippines',
    status: 'active',
    notes: 'Industry-wide program sponsored by the Philippine Maritime Association.',
  },
  {
    sponsorCode: 'SCH-005',
    name: 'Ocean Bridge Foundation',
    contactName: 'K. Tan',
    email: 'info@oceanbridge.org',
    phone: '+63 2 8123 9876',
    billingAddress: 'Suite 800, Makati Diamond Tower, 32 Ayala Ave., Makati City, Philippines',
    status: 'active',
    notes: 'International foundation providing cross-border training sponsorships.',
  },
  {
    sponsorCode: 'SCH-006',
    name: 'Legacy Cadet Support',
    contactName: 'M. Dela Cruz',
    email: 'legacy@cadet.org',
    phone: '+63 2 8345 6789',
    billingAddress: '45 Old Port Road, Barangay 12, Navotas City, Philippines',
    status: 'inactive',
    notes: 'Legacy program for retired mariners dependents. Currently on hold.',
  },
  {
    sponsorCode: 'SCH-007',
    name: 'National Maritime Training Fund',
    contactName: 'R. Gatchalian',
    email: 'nmtf@tesda.gov.ph',
    phone: '+63 2 8567 8901',
    billingAddress: 'TESDA Building, East Service Road, Taguig City, Philippines',
    status: 'active',
    notes: 'Government fund under TESDA for certified maritime training programs.',
  },
  {
    sponsorCode: 'SCH-008',
    name: 'Global Crew Development Initiative',
    contactName: 'S. Fernandez',
    email: 'gcdi@globalcrew.org',
    phone: '+63 32 412 3456',
    billingAddress: '7th Floor, Cebu Business Park, Mindanao Ave., Cebu City, Philippines',
    status: 'active',
    notes: 'International crewing consortium sponsorship program.',
  },
  {
    sponsorCode: 'SCH-009',
    name: 'Women in Maritime Scholarship',
    contactName: 'L. Ramirez',
    email: 'wim@womeninmaritime.ph',
    phone: '+63 2 8234 5678',
    billingAddress: 'Unit 12, Women Empowerment Center, 56 Shaw Blvd., Pasig City, Philippines',
    status: 'active',
    notes: 'Scholarship program encouraging women to pursue maritime careers.',
  },
  {
    sponsorCode: 'SCH-010',
    name: 'Luzon Seafarer Training Pool',
    contactName: 'D. Santos',
    email: 'admin@luzonseafarer.com',
    phone: '+63 45 678 9012',
    billingAddress: 'LSTP Compound, Subic Bay Freeport Zone, Zambales, Philippines',
    status: 'active',
    notes: null,
  },
  {
    sponsorCode: 'SCH-011',
    name: 'Visayas Maritime Consortium',
    contactName: 'E. Tan',
    email: 'info@visayasmaritime.ph',
    phone: '+63 32 456 7890',
    billingAddress: 'VMC Building, 88 Lopez Jaena St., Iloilo City, Philippines',
    status: 'active',
    notes: 'Consortium of shipping companies pooling funds for crew training.',
  },
  {
    sponsorCode: 'SCH-012',
    name: 'Mindanao Seafarer Support',
    contactName: 'B. Alonto',
    email: 'mss@mindanaoseafarer.ph',
    phone: '+63 82 345 6789',
    billingAddress: '2nd Floor, Davao Trade Center, JP Laurel Ave., Davao City, Philippines',
    status: 'inactive',
    notes: 'Temporarily paused pending new funding cycle.',
  },
  {
    sponsorCode: 'SCH-013',
    name: 'International Transport Workers Fund',
    contactName: 'P. Ocampo',
    email: 'itf@itfglobal.org',
    phone: '+63 2 8890 1234',
    billingAddress: 'ITF Manila Office, 10/F Pacific Star Building, Makati City, Philippines',
    status: 'active',
    notes: 'ITF-administered welfare and training fund for seafarers.',
  },
  {
    sponsorCode: 'SCH-014',
    name: 'Blue Horizon Maritime Trust',
    contactName: 'J. Lim',
    email: 'trust@bluehorizon.com',
    phone: '+63 2 8789 0123',
    billingAddress: 'Blue Horizon Tower, 100 Roxas Blvd., Pasay City, Philippines',
    status: 'active',
    notes: 'Private trust funding cadetship and officer upgrade programs.',
  },
  {
    sponsorCode: 'SCH-015',
    name: 'Asian Maritime Academy Scholarship',
    contactName: 'T. Nakamura',
    email: 'scholarships@asianmaritime.jp',
    phone: '+63 2 8567 4321',
    billingAddress: 'AMA Pacific Office, 25/F LKG Tower, Bonifacio Global City, Philippines',
    status: 'active',
    notes: 'Cross-border scholarship program for ASEAN maritime trainees.',
  },
  {
    sponsorCode: 'SCH-016',
    name: 'Philippine Coast Guard Auxiliary Fund',
    contactName: 'Comm. A. Cruz',
    email: 'pcgaf@coastguard.gov.ph',
    phone: '+63 2 8790 5678',
    billingAddress: 'PCG Headquarters, 139 25th St., Port Area, Manila, Philippines',
    status: 'active',
    notes: null,
  },
  {
    sponsorCode: 'SCH-017',
    name: 'Sustainable Shipping Training Initiative',
    contactName: 'Dr. M. Ong',
    email: 'ssti@greenshipping.org',
    phone: '+63 2 8234 9012',
    billingAddress: 'Green Shipping Center, 77 Pioneer St., Mandaluyong City, Philippines',
    status: 'active',
    notes: 'Focus on environmentally sustainable shipping practices training.',
  },
  {
    sponsorCode: 'SCH-018',
    name: 'Filipino Mariners Retraining Program',
    contactName: 'R. Dimagiba',
    email: 'fmrp@mariners.ph',
    phone: '+63 2 8456 7890',
    billingAddress: 'Unit 3B, Mariners Plaza, 50 United Nations Ave., Manila, Philippines',
    status: 'inactive',
    notes: 'Retraining program for displaced seafarers. Awaiting new funding.',
  },
  {
    sponsorCode: 'SCH-019',
    name: 'Gulf Cooperation Council Maritime Fund',
    contactName: 'H. Al-Sayed',
    email: 'gccmf@gulfmaritime.com',
    phone: '+63 2 8678 1234',
    billingAddress: 'GCC Representative Office, 15/F One Global Place, BGC, Philippines',
    status: 'active',
    notes: 'GCC-funded program for Filipino seafarers employed in Gulf states.',
  },
  {
    sponsorCode: 'SCH-020',
    name: 'Batangas Maritime Scholarship Board',
    contactName: 'L. Mercado',
    email: 'info@batangasmaritime.ph',
    phone: '+63 43 567 8901',
    billingAddress: 'Provincial Capitol Compound, Batangas City, Philippines',
    status: 'active',
    notes: 'Provincial government scholarship for Batangas residents.',
  },
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

  for (const sponsor of sampleSponsors) {
    const existing = await payload.find({
      collection: 'accounting-scholarship-sponsors',
      where: { sponsorCode: { equals: sponsor.sponsorCode } } as never,
      limit: 1,
      overrideAccess: true,
    })

    if (existing.totalDocs > 0) {
      console.log(`Skipping ${sponsor.sponsorCode} — already exists.`)
      skipped++
      continue
    }

    await payload.create({
      collection: 'accounting-scholarship-sponsors',
      overrideAccess: true,
      data: {
        ...sponsor,
        createdBy: adminId,
        updatedBy: adminId,
      } as never,
    })

    console.log(`Created ${sponsor.sponsorCode} — ${sponsor.name}`)
    created++
  }

  console.log(`\nDone. ${created} created, ${skipped} skipped.`)
  process.exit(0)
}

seed().catch((err) => {
  console.error('Seed failed:', err)
  process.exit(1)
})
