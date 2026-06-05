import 'dotenv/config'
import { getPayload } from 'payload'
import config from '../payload.config'
import { ACCOUNTING_COLLECTION_SLUGS } from '../accounting/constants/accounting'

type SeedVendor = {
    vendorCode: string
    displayName: string
    legalName: string
    vendorType: 'supplier' | 'contractor' | 'utility' | 'government' | 'other'
    email: string
    phone: string
    billingAddress: string
    taxId: string
    taxProfile: {
        code: string
        label: string
        rate: number
        category: string
    }
    paymentTermCode: string
    status: 'active' | 'on_hold' | 'inactive' | 'archived'
    notes: string
}

const baseCurrencyCode = 'PHP'

const sampleVendors: SeedVendor[] = [
    {
        vendorCode: 'VEND-0001',
        displayName: 'Cebu Office Supplies Co.',
        legalName: 'Cebu Office Supplies Company Inc.',
        vendorType: 'supplier',
        email: 'procurement@cebussupplies.com',
        phone: '+63 32 812 3456',
        billingAddress: '88 Business Park Road, Cebu City, Philippines',
        taxId: '302-556-789-000',
        taxProfile: { code: 'VAT_REGISTERED', label: 'VAT Registered', rate: 12, category: 'purchase' },
        paymentTermCode: 'NET30',
        status: 'active',
        notes: 'Reliable supplier for office materials. Offers bulk discounts and monthly invoicing.',
    },
    {
        vendorCode: 'VEND-0002',
        displayName: 'Harbor Industrial Safety Gear',
        legalName: 'Harbor Industrial Safety Gear Trading',
        vendorType: 'supplier',
        email: 'sales@harborsafetygear.ph',
        phone: '+63 2 8845 1122',
        billingAddress: '12 Pier Logistics Street, Manila, Philippines',
        taxId: '302-556-789-001',
        taxProfile: { code: 'VAT_REGISTERED', label: 'VAT Registered', rate: 12, category: 'purchase' },
        paymentTermCode: 'NET15',
        status: 'active',
        notes: 'Primary vendor for PPE, helmets, gloves, and emergency safety kits.',
    },
    {
        vendorCode: 'VEND-0003',
        displayName: 'Blue Anchor Marine Parts',
        legalName: 'Blue Anchor Marine Parts Corporation',
        vendorType: 'supplier',
        email: 'orders@blueanchormarine.ph',
        phone: '+63 32 511 2200',
        billingAddress: '5 Drydock Avenue, Mandaue City, Philippines',
        taxId: '302-556-789-002',
        taxProfile: { code: 'VAT_REGISTERED', label: 'VAT Registered', rate: 12, category: 'purchase' },
        paymentTermCode: 'NET45',
        status: 'active',
        notes: 'Supplies navigation spares and shipboard consumables for marine operations.',
    },
    {
        vendorCode: 'VEND-0004',
        displayName: 'Metro Print Solutions',
        legalName: 'Metro Print Solutions Inc.',
        vendorType: 'supplier',
        email: 'account.manager@metroprint.ph',
        phone: '+63 2 8891 4432',
        billingAddress: '101 Chino Roces Avenue, Makati City, Philippines',
        taxId: '302-556-789-003',
        taxProfile: { code: 'VAT_REGISTERED', label: 'VAT Registered', rate: 12, category: 'purchase' },
        paymentTermCode: 'NET30',
        status: 'active',
        notes: 'Handles bulk printing of training manuals, certificates, and branded office forms.',
    },
    {
        vendorCode: 'VEND-0005',
        displayName: 'Northshore Fuel & Lubricants',
        legalName: 'Northshore Fuel and Lubricants Trading',
        vendorType: 'supplier',
        email: 'dispatch@northshorefuel.ph',
        phone: '+63 82 233 4419',
        billingAddress: '77 Coastal Highway, Davao City, Philippines',
        taxId: '302-556-789-004',
        taxProfile: { code: 'VAT_REGISTERED', label: 'VAT Registered', rate: 12, category: 'purchase' },
        paymentTermCode: 'NET60',
        status: 'active',
        notes: 'Approved supplier of diesel, lubricants, and emergency replenishment items.',
    },
    {
        vendorCode: 'VEND-0006',
        displayName: 'Vertex IT Maintenance',
        legalName: 'Vertex IT Maintenance Services Inc.',
        vendorType: 'contractor',
        email: 'support@vertexit.ph',
        phone: '+63 2 8777 1200',
        billingAddress: '28 Technology Avenue, Pasig City, Philippines',
        taxId: '302-556-789-005',
        taxProfile: { code: 'VAT_REGISTERED', label: 'VAT Registered', rate: 12, category: 'service' },
        paymentTermCode: 'NET30',
        status: 'active',
        notes: 'Provides hardware maintenance and endpoint support for office and lab devices.',
    },
    {
        vendorCode: 'VEND-0007',
        displayName: 'Signal Peak Telecom Services',
        legalName: 'Signal Peak Telecom Services Corporation',
        vendorType: 'contractor',
        email: 'billing@signalpeak.ph',
        phone: '+63 2 8550 7788',
        billingAddress: '3 Telecom Plaza, Quezon City, Philippines',
        taxId: '302-556-789-006',
        taxProfile: { code: 'VAT_REGISTERED', label: 'VAT Registered', rate: 12, category: 'service' },
        paymentTermCode: 'NET15',
        status: 'active',
        notes: 'Enterprise SIP trunking, internet redundancy, and branch connectivity services.',
    },
    {
        vendorCode: 'VEND-0008',
        displayName: 'Tidewater Facilities Management',
        legalName: 'Tidewater Facilities Management and Services',
        vendorType: 'contractor',
        email: 'contracts@tidewaterfm.ph',
        phone: '+63 32 405 8821',
        billingAddress: '44 Harbour View Complex, Cebu City, Philippines',
        taxId: '302-556-789-007',
        taxProfile: { code: 'VAT_REGISTERED', label: 'VAT Registered', rate: 12, category: 'service' },
        paymentTermCode: 'NET30',
        status: 'active',
        notes: 'Covers janitorial services, facility inspections, and preventive maintenance.',
    },
    {
        vendorCode: 'VEND-0009',
        displayName: 'Compass HR Outsourcing',
        legalName: 'Compass HR Outsourcing Solutions Inc.',
        vendorType: 'contractor',
        email: 'finance@compasshr.ph',
        phone: '+63 2 8433 0099',
        billingAddress: '19 Corporate Center, Bonifacio Global City, Taguig, Philippines',
        taxId: '302-556-789-008',
        taxProfile: { code: 'VAT_REGISTERED', label: 'VAT Registered', rate: 12, category: 'service' },
        paymentTermCode: 'NET45',
        status: 'on_hold',
        notes: 'HR and payroll support vendor currently on hold pending updated service agreement.',
    },
    {
        vendorCode: 'VEND-0010',
        displayName: 'Archipelago Training Consultants',
        legalName: 'Archipelago Training Consultants Group',
        vendorType: 'contractor',
        email: 'ap@archipelagoconsultants.ph',
        phone: '+63 33 324 6601',
        billingAddress: '11 Learning Square, Iloilo City, Philippines',
        taxId: '302-556-789-009',
        taxProfile: { code: 'VAT_REGISTERED', label: 'VAT Registered', rate: 12, category: 'service' },
        paymentTermCode: 'NET30',
        status: 'active',
        notes: 'Engaged for instructor augmentation, curriculum reviews, and assessor support.',
    },
    {
        vendorCode: 'VEND-0011',
        displayName: 'City Water Utility',
        legalName: 'City Water Utility Authority',
        vendorType: 'utility',
        email: 'corporatebilling@citywater.gov.ph',
        phone: '+63 2 8123 4000',
        billingAddress: '1 Utility Center, Manila, Philippines',
        taxId: '302-556-789-010',
        taxProfile: { code: 'VAT_EXEMPT', label: 'VAT Exempt', rate: 0, category: 'utility' },
        paymentTermCode: 'NET15',
        status: 'active',
        notes: 'Monthly water service provider for offices, dormitories, and training kitchens.',
    },
    {
        vendorCode: 'VEND-0012',
        displayName: 'Meralco Business',
        legalName: 'Manila Electric Company',
        vendorType: 'utility',
        email: 'businesscare@meralco.com.ph',
        phone: '+63 2 8162 2111',
        billingAddress: 'Lopez Building, Ortigas Avenue, Pasig City, Philippines',
        taxId: '302-556-789-011',
        taxProfile: { code: 'VAT_REGISTERED', label: 'VAT Registered', rate: 12, category: 'utility' },
        paymentTermCode: 'NET15',
        status: 'active',
        notes: 'Electricity provider for head office and training center facilities.',
    },
    {
        vendorCode: 'VEND-0013',
        displayName: 'FiberLink Business Internet',
        legalName: 'FiberLink Business Internet Services Corp.',
        vendorType: 'utility',
        email: 'enterprise@fiberlink.ph',
        phone: '+63 2 8700 9090',
        billingAddress: '55 Network Drive, Mandaluyong City, Philippines',
        taxId: '302-556-789-012',
        taxProfile: { code: 'VAT_REGISTERED', label: 'VAT Registered', rate: 12, category: 'utility' },
        paymentTermCode: 'NET30',
        status: 'active',
        notes: 'Dedicated leased line and failover provider for all active branches.',
    },
    {
        vendorCode: 'VEND-0014',
        displayName: 'Luzon Waste Recovery',
        legalName: 'Luzon Waste Recovery and Disposal Services',
        vendorType: 'utility',
        email: 'billing@luzonwaste.ph',
        phone: '+63 45 888 7712',
        billingAddress: '9 Environmental Park, Clark Freeport, Pampanga, Philippines',
        taxId: '302-556-789-013',
        taxProfile: { code: 'VAT_REGISTERED', label: 'VAT Registered', rate: 12, category: 'utility' },
        paymentTermCode: 'NET30',
        status: 'inactive',
        notes: 'Previously handled waste disposal and recycling pickups for former warehouse sites.',
    },
    {
        vendorCode: 'VEND-0015',
        displayName: 'National Printing Office',
        legalName: 'National Printing Office',
        vendorType: 'government',
        email: 'accounts@npo.gov.ph',
        phone: '+63 2 8736 4401',
        billingAddress: 'EDSA corner NIA Road, Quezon City, Philippines',
        taxId: '302-556-789-014',
        taxProfile: { code: 'GOVERNMENT_EXEMPT', label: 'Government Exempt', rate: 0, category: 'government' },
        paymentTermCode: 'NET30',
        status: 'active',
        notes: 'Government printing counterpart for regulated forms and official published materials.',
    },
    {
        vendorCode: 'VEND-0016',
        displayName: 'Marina Regional Office VII',
        legalName: 'Maritime Industry Authority Regional Office VII',
        vendorType: 'government',
        email: 'accounting@marina7.gov.ph',
        phone: '+63 32 255 0991',
        billingAddress: 'Government Center, Cebu City, Philippines',
        taxId: '302-556-789-015',
        taxProfile: { code: 'GOVERNMENT_EXEMPT', label: 'Government Exempt', rate: 0, category: 'government' },
        paymentTermCode: 'NET30',
        status: 'active',
        notes: 'Regulatory payments and certification processing counterpart for maritime compliance.',
    },
    {
        vendorCode: 'VEND-0017',
        displayName: 'Port Health Clearance Desk',
        legalName: 'Port Health Clearance Desk',
        vendorType: 'government',
        email: 'billing@porthealth.gov.ph',
        phone: '+63 82 441 3777',
        billingAddress: 'Seaport Complex, Davao City, Philippines',
        taxId: '302-556-789-016',
        taxProfile: { code: 'GOVERNMENT_EXEMPT', label: 'Government Exempt', rate: 0, category: 'government' },
        paymentTermCode: 'NET7',
        status: 'active',
        notes: 'Clearing desk for health-related certifications and inspection service fees.',
    },
    {
        vendorCode: 'VEND-0018',
        displayName: 'Harbor Community Cooperative',
        legalName: 'Harbor Community Cooperative',
        vendorType: 'other',
        email: 'finance@harborcoop.ph',
        phone: '+63 34 700 1882',
        billingAddress: '27 Cooperative Lane, Bacolod City, Philippines',
        taxId: '302-556-789-017',
        taxProfile: { code: 'NON_VAT', label: 'Non-VAT', rate: 0, category: 'other' },
        paymentTermCode: 'CASH',
        status: 'active',
        notes: 'Community cooperative supplying pantry goods and locally sourced training materials.',
    },
    {
        vendorCode: 'VEND-0019',
        displayName: 'Bayview Catering Services',
        legalName: 'Bayview Catering Services and Events',
        vendorType: 'other',
        email: 'bookings@bayviewcatering.ph',
        phone: '+63 32 401 6110',
        billingAddress: '62 Coastal Drive, Lapu-Lapu City, Philippines',
        taxId: '302-556-789-018',
        taxProfile: { code: 'VAT_REGISTERED', label: 'VAT Registered', rate: 12, category: 'other' },
        paymentTermCode: 'NET7',
        status: 'active',
        notes: 'Preferred provider for seminars, internal events, and assessment-day meal packages.',
    },
    {
        vendorCode: 'VEND-0020',
        displayName: 'Legacy Records Archive',
        legalName: 'Legacy Records Archive Services Inc.',
        vendorType: 'other',
        email: 'support@legacyarchive.ph',
        phone: '+63 2 8399 5502',
        billingAddress: '40 Archive Building, Marikina City, Philippines',
        taxId: '302-556-789-019',
        taxProfile: { code: 'VAT_REGISTERED', label: 'VAT Registered', rate: 12, category: 'other' },
        paymentTermCode: 'NET30',
        status: 'archived',
        notes: 'Archived legacy vendor retained for historical storage and document retrieval records.',
    },
]

async function getCurrencyReferenceId(payload: Awaited<ReturnType<typeof getPayload>>) {
    const result = await payload.find({
        collection: ACCOUNTING_COLLECTION_SLUGS.currencies as any,
        where: {
            code: {
                equals: baseCurrencyCode,
            },
        } as any,
        limit: 1,
        depth: 0,
        overrideAccess: true,
    })

    const record = result.docs[0]

    if (!record) {
        throw new Error(`Required accounting currency '${baseCurrencyCode}' was not found.`)
    }

    return record.id
}

async function getPaymentTermReferenceMap(payload: Awaited<ReturnType<typeof getPayload>>) {
    const result = await payload.find({
        collection: ACCOUNTING_COLLECTION_SLUGS.paymentTerms as any,
        limit: 100,
        depth: 0,
        overrideAccess: true,
    })

    const paymentTermMap = new Map<string, number | string>()

    for (const record of result.docs) {
        if (record.code) {
            paymentTermMap.set(String(record.code).toUpperCase(), record.id)
        }
    }

    return paymentTermMap
}

async function seedAccountingVendors() {
    const payload = await getPayload({ config })

    console.log('Seeding accounting vendors...')

    const currencyReferenceId = await getCurrencyReferenceId(payload)
    const paymentTermReferenceMap = await getPaymentTermReferenceMap(payload)

    const missingPaymentTerms = Array.from(new Set(sampleVendors.map((vendor) => vendor.paymentTermCode))).filter(
        (code) => !paymentTermReferenceMap.has(code),
    )

    if (missingPaymentTerms.length) {
        throw new Error(`Missing accounting payment terms for codes: ${missingPaymentTerms.join(', ')}`)
    }

    let createdCount = 0
    let updatedCount = 0

    for (const vendor of sampleVendors) {
        const existing = await payload.find({
            collection: ACCOUNTING_COLLECTION_SLUGS.vendors as any,
            where: {
                vendorCode: {
                    equals: vendor.vendorCode,
                },
            } as any,
            limit: 1,
            depth: 0,
            overrideAccess: true,
        })

        const data = {
            vendorCode: vendor.vendorCode,
            displayName: vendor.displayName,
            legalName: vendor.legalName,
            vendorType: vendor.vendorType,
            email: vendor.email,
            phone: vendor.phone,
            billingAddress: vendor.billingAddress,
            taxId: vendor.taxId,
            taxProfile: vendor.taxProfile,
            currencyReference: currencyReferenceId,
            paymentTermReference: paymentTermReferenceMap.get(vendor.paymentTermCode),
            status: vendor.status,
            notes: vendor.notes,
        }

        if (existing.docs[0]) {
            await payload.update({
                collection: ACCOUNTING_COLLECTION_SLUGS.vendors as any,
                id: existing.docs[0].id,
                data,
                depth: 0,
                overrideAccess: true,
            })
            updatedCount += 1
            console.log(`Updated ${vendor.vendorCode} - ${vendor.displayName}`)
        } else {
            await payload.create({
                collection: ACCOUNTING_COLLECTION_SLUGS.vendors as any,
                data,
                depth: 0,
                overrideAccess: true,
            })
            createdCount += 1
            console.log(`Created ${vendor.vendorCode} - ${vendor.displayName}`)
        }
    }

    const total = await payload.count({
        collection: ACCOUNTING_COLLECTION_SLUGS.vendors as any,
        overrideAccess: true,
    })

    console.log(`Done. Created: ${createdCount}, Updated: ${updatedCount}, Total vendors now: ${total.totalDocs}`)
}

seedAccountingVendors()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error('Failed to seed accounting vendors:', error)
        process.exit(1)
    })
