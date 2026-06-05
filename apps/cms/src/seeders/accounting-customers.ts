import 'dotenv/config'
import { getPayload } from 'payload'
import config from '../payload.config'
import { ACCOUNTING_COLLECTION_SLUGS } from '../accounting/constants/accounting'

type SeedCustomer = {
    customerCode: string
    displayName: string
    legalName: string
    customerType: 'individual' | 'company' | 'sponsor' | 'other'
    email: string
    phone: string
    billingAddress: string
    shippingAddress: string
    taxId: string
    taxProfile: {
        code: string
        label: string
        rate: number
    }
    paymentTermCode: string
    creditLimit: number
    status: 'active' | 'on_hold' | 'inactive' | 'archived'
    notes: string
}

const baseCurrencyCode = 'PHP'

const sampleCustomers: SeedCustomer[] = [
    {
        customerCode: 'CUST-0001',
        displayName: 'Juan Dela Cruz',
        legalName: 'Juan Dela Cruz',
        customerType: 'individual',
        email: 'juan.delacruz@example.com',
        phone: '+63 917 123 4567',
        billingAddress: '123 Rizal Street, Barangay Poblacion, Davao City, Philippines',
        shippingAddress: '123 Rizal Street, Barangay Poblacion, Davao City, Philippines',
        taxId: '123-456-789-000',
        taxProfile: { code: 'STANDARD_VAT', label: 'Standard VAT', rate: 12 },
        paymentTermCode: 'NET30',
        creditLimit: 50000,
        status: 'active',
        notes: 'Regular customer. Prefers email billing and bank transfer payments.',
    },
    {
        customerCode: 'CUST-0002',
        displayName: 'Maria Santos',
        legalName: 'Maria Santos',
        customerType: 'individual',
        email: 'maria.santos@example.com',
        phone: '+63 918 101 2001',
        billingAddress: '45 Bonifacio Avenue, Quezon City, Philippines',
        shippingAddress: '45 Bonifacio Avenue, Quezon City, Philippines',
        taxId: '123-456-789-001',
        taxProfile: { code: 'STANDARD_VAT', label: 'Standard VAT', rate: 12 },
        paymentTermCode: 'NET15',
        creditLimit: 25000,
        status: 'active',
        notes: 'Walk-in training customer. Usually settles invoices within two weeks.',
    },
    {
        customerCode: 'CUST-0003',
        displayName: 'Pedro Reyes',
        legalName: 'Pedro Reyes',
        customerType: 'individual',
        email: 'pedro.reyes@example.com',
        phone: '+63 919 101 2002',
        billingAddress: '88 Mabini Street, Cebu City, Philippines',
        shippingAddress: '88 Mabini Street, Cebu City, Philippines',
        taxId: '123-456-789-002',
        taxProfile: { code: 'ZERO_RATED', label: 'Zero Rated', rate: 0 },
        paymentTermCode: 'CASH',
        creditLimit: 0,
        status: 'active',
        notes: 'Cash basis customer for short maritime refresher courses.',
    },
    {
        customerCode: 'CUST-0004',
        displayName: 'Ana Lopez',
        legalName: 'Ana Lopez',
        customerType: 'individual',
        email: 'ana.lopez@example.com',
        phone: '+63 920 101 2003',
        billingAddress: '12 Del Pilar Street, Iloilo City, Philippines',
        shippingAddress: '12 Del Pilar Street, Iloilo City, Philippines',
        taxId: '123-456-789-003',
        taxProfile: { code: 'STANDARD_VAT', label: 'Standard VAT', rate: 12 },
        paymentTermCode: 'NET30',
        creditLimit: 15000,
        status: 'on_hold',
        notes: 'Account temporarily on hold pending confirmation of company reimbursement.',
    },
    {
        customerCode: 'CUST-0005',
        displayName: 'Ramon Bautista',
        legalName: 'Ramon Bautista',
        customerType: 'individual',
        email: 'ramon.bautista@example.com',
        phone: '+63 921 101 2004',
        billingAddress: '220 Roxas Boulevard, Pasay City, Philippines',
        shippingAddress: '220 Roxas Boulevard, Pasay City, Philippines',
        taxId: '123-456-789-004',
        taxProfile: { code: 'STANDARD_VAT', label: 'Standard VAT', rate: 12 },
        paymentTermCode: 'NET7',
        creditLimit: 10000,
        status: 'inactive',
        notes: 'Inactive individual account retained for prior invoice history.',
    },
    {
        customerCode: 'CUST-0006',
        displayName: 'BlueWave Shipping Corp.',
        legalName: 'BlueWave Shipping Corporation',
        customerType: 'company',
        email: 'finance@bluewaveshipping.example.com',
        phone: '+63 922 101 2005',
        billingAddress: '7F Harbor Center, Port Area, Manila, Philippines',
        shippingAddress: '7F Harbor Center, Port Area, Manila, Philippines',
        taxId: '123-456-789-005',
        taxProfile: { code: 'STANDARD_VAT', label: 'Standard VAT', rate: 12 },
        paymentTermCode: 'NET30',
        creditLimit: 250000,
        status: 'active',
        notes: 'Corporate fleet client. Consolidated monthly billing required.',
    },
    {
        customerCode: 'CUST-0007',
        displayName: 'NorthStar Marine Services',
        legalName: 'NorthStar Marine Services Inc.',
        customerType: 'company',
        email: 'ap@northstarmarine.example.com',
        phone: '+63 923 101 2006',
        billingAddress: 'Pier 4 Logistics Park, Cagayan de Oro, Philippines',
        shippingAddress: 'Pier 4 Logistics Park, Cagayan de Oro, Philippines',
        taxId: '123-456-789-006',
        taxProfile: { code: 'STANDARD_VAT', label: 'Standard VAT', rate: 12 },
        paymentTermCode: 'NET45',
        creditLimit: 180000,
        status: 'active',
        notes: 'Corporate account with staggered crew training schedules every quarter.',
    },
    {
        customerCode: 'CUST-0008',
        displayName: 'HarborView Tankers Ltd.',
        legalName: 'HarborView Tankers Ltd.',
        customerType: 'company',
        email: 'treasury@harborviewtankers.example.com',
        phone: '+63 924 101 2007',
        billingAddress: '18 Marine Drive, Makati City, Philippines',
        shippingAddress: '18 Marine Drive, Makati City, Philippines',
        taxId: '123-456-789-007',
        taxProfile: { code: 'EXEMPT', label: 'VAT Exempt', rate: 0 },
        paymentTermCode: 'NET60',
        creditLimit: 300000,
        status: 'active',
        notes: 'High-value tanker operator. Requires treasury approval before every invoice run.',
    },
    {
        customerCode: 'CUST-0009',
        displayName: 'Ocean Crest Manning',
        legalName: 'Ocean Crest Manning Agency',
        customerType: 'company',
        email: 'billing@oceancrestmanning.example.com',
        phone: '+63 925 101 2008',
        billingAddress: '91 Kalayaan Avenue, Makati City, Philippines',
        shippingAddress: '91 Kalayaan Avenue, Makati City, Philippines',
        taxId: '123-456-789-008',
        taxProfile: { code: 'STANDARD_VAT', label: 'Standard VAT', rate: 12 },
        paymentTermCode: 'NET30',
        creditLimit: 125000,
        status: 'on_hold',
        notes: 'Corporate account on hold while updated credit documents are being reviewed.',
    },
    {
        customerCode: 'CUST-0010',
        displayName: 'Pacific Anchor Logistics',
        legalName: 'Pacific Anchor Logistics Corporation',
        customerType: 'company',
        email: 'finance@pacificanchor.example.com',
        phone: '+63 926 101 2009',
        billingAddress: 'Unit 5B Seafarer Tower, Pasig City, Philippines',
        shippingAddress: 'Unit 5B Seafarer Tower, Pasig City, Philippines',
        taxId: '123-456-789-009',
        taxProfile: { code: 'STANDARD_VAT', label: 'Standard VAT', rate: 12 },
        paymentTermCode: 'NET15',
        creditLimit: 85000,
        status: 'inactive',
        notes: 'Inactive corporate account kept for historical receivable reporting.',
    },
    {
        customerCode: 'CUST-0011',
        displayName: 'Marina Skills Foundation',
        legalName: 'Marina Skills Foundation',
        customerType: 'sponsor',
        email: 'programs@marinaskillsfoundation.example.com',
        phone: '+63 927 101 2010',
        billingAddress: '14 Charity Lane, Taguig City, Philippines',
        shippingAddress: '14 Charity Lane, Taguig City, Philippines',
        taxId: '123-456-789-010',
        taxProfile: { code: 'ZERO_RATED', label: 'Zero Rated', rate: 0 },
        paymentTermCode: 'NET30',
        creditLimit: 100000,
        status: 'active',
        notes: 'Scholarship sponsor for cadet intake batches and bridge program trainees.',
    },
    {
        customerCode: 'CUST-0012',
        displayName: 'Seafarers Aid Network',
        legalName: 'Seafarers Aid Network',
        customerType: 'sponsor',
        email: 'accounts@seafarersaid.example.com',
        phone: '+63 928 101 2011',
        billingAddress: '29 Hope Street, Bacolod City, Philippines',
        shippingAddress: '29 Hope Street, Bacolod City, Philippines',
        taxId: '123-456-789-011',
        taxProfile: { code: 'EXEMPT', label: 'VAT Exempt', rate: 0 },
        paymentTermCode: 'NET45',
        creditLimit: 70000,
        status: 'active',
        notes: 'NGO sponsor requiring progress reports attached to every billing statement.',
    },
    {
        customerCode: 'CUST-0013',
        displayName: 'BridgeWatch Scholarship Fund',
        legalName: 'BridgeWatch Scholarship Fund',
        customerType: 'sponsor',
        email: 'finance@bridgewatchfund.example.com',
        phone: '+63 929 101 2012',
        billingAddress: '8 Navigator Road, Baguio City, Philippines',
        shippingAddress: '8 Navigator Road, Baguio City, Philippines',
        taxId: '123-456-789-012',
        taxProfile: { code: 'ZERO_RATED', label: 'Zero Rated', rate: 0 },
        paymentTermCode: 'NET60',
        creditLimit: 120000,
        status: 'active',
        notes: 'Annual scholarship grant sponsor for deck officer review programs.',
    },
    {
        customerCode: 'CUST-0014',
        displayName: 'Island Mariners Cooperative',
        legalName: 'Island Mariners Cooperative',
        customerType: 'other',
        email: 'coop@islandmariners.example.com',
        phone: '+63 930 101 2013',
        billingAddress: 'Coastal Road, Zamboanga City, Philippines',
        shippingAddress: 'Coastal Road, Zamboanga City, Philippines',
        taxId: '123-456-789-013',
        taxProfile: { code: 'STANDARD_VAT', label: 'Standard VAT', rate: 12 },
        paymentTermCode: 'NET30',
        creditLimit: 40000,
        status: 'active',
        notes: 'Cooperative member account grouped under community training packages.',
    },
    {
        customerCode: 'CUST-0015',
        displayName: 'Cebu Port Cadet Group',
        legalName: 'Cebu Port Cadet Group',
        customerType: 'other',
        email: 'admin@cebuportcadets.example.com',
        phone: '+63 931 101 2014',
        billingAddress: '67 Portside Avenue, Cebu City, Philippines',
        shippingAddress: '67 Portside Avenue, Cebu City, Philippines',
        taxId: '123-456-789-014',
        taxProfile: { code: 'STANDARD_VAT', label: 'Standard VAT', rate: 12 },
        paymentTermCode: 'NET7',
        creditLimit: 15000,
        status: 'active',
        notes: 'Group enrollment account for cadet review sessions with weekly settlements.',
    },
    {
        customerCode: 'CUST-0016',
        displayName: 'Mindanao Tugboat Operators Guild',
        legalName: 'Mindanao Tugboat Operators Guild',
        customerType: 'other',
        email: 'accounts@mindanaotugboatguild.example.com',
        phone: '+63 932 101 2015',
        billingAddress: '55 Wharf Road, General Santos City, Philippines',
        shippingAddress: '55 Wharf Road, General Santos City, Philippines',
        taxId: '123-456-789-015',
        taxProfile: { code: 'STANDARD_VAT', label: 'Standard VAT', rate: 12 },
        paymentTermCode: 'NET15',
        creditLimit: 60000,
        status: 'on_hold',
        notes: 'Guild account paused until updated billing contact matrix is submitted.',
    },
    {
        customerCode: 'CUST-0017',
        displayName: 'Luzon Port Authority Training Desk',
        legalName: 'Luzon Port Authority Training Desk',
        customerType: 'company',
        email: 'training.desk@luzonportauthority.example.com',
        phone: '+63 933 101 2016',
        billingAddress: 'Government Center, San Fernando, La Union, Philippines',
        shippingAddress: 'Government Center, San Fernando, La Union, Philippines',
        taxId: '123-456-789-016',
        taxProfile: { code: 'EXEMPT', label: 'VAT Exempt', rate: 0 },
        paymentTermCode: 'NET30',
        creditLimit: 90000,
        status: 'active',
        notes: 'Government-linked payer for port safety and compliance seminars.',
    },
    {
        customerCode: 'CUST-0018',
        displayName: 'AquaLine Ferries',
        legalName: 'AquaLine Ferries Corporation',
        customerType: 'company',
        email: 'finance@aqualineferries.example.com',
        phone: '+63 934 101 2017',
        billingAddress: 'Ferry Terminal Complex, Batangas City, Philippines',
        shippingAddress: 'Ferry Terminal Complex, Batangas City, Philippines',
        taxId: '123-456-789-017',
        taxProfile: { code: 'STANDARD_VAT', label: 'Standard VAT', rate: 12 },
        paymentTermCode: 'NET45',
        creditLimit: 200000,
        status: 'archived',
        notes: 'Archived legacy ferry operator account retained for audit trail and old balances.',
    },
    {
        customerCode: 'CUST-0019',
        displayName: 'Captain Roque Fernandez',
        legalName: 'Roque Fernandez',
        customerType: 'individual',
        email: 'captain.roque@example.com',
        phone: '+63 935 101 2018',
        billingAddress: '31 Seafarer Village, Antipolo City, Philippines',
        shippingAddress: '31 Seafarer Village, Antipolo City, Philippines',
        taxId: '123-456-789-018',
        taxProfile: { code: 'STANDARD_VAT', label: 'Standard VAT', rate: 12 },
        paymentTermCode: 'NET30',
        creditLimit: 30000,
        status: 'active',
        notes: 'Senior officer client enrolled in recurring leadership and compliance courses.',
    },
    {
        customerCode: 'CUST-0020',
        displayName: 'Eastern Seas Chartering',
        legalName: 'Eastern Seas Chartering Inc.',
        customerType: 'company',
        email: 'ap@easternseaschartering.example.com',
        phone: '+63 936 101 2019',
        billingAddress: '9 Charter House, Subic Bay Freeport, Philippines',
        shippingAddress: '9 Charter House, Subic Bay Freeport, Philippines',
        taxId: '123-456-789-019',
        taxProfile: { code: 'STANDARD_VAT', label: 'Standard VAT', rate: 12 },
        paymentTermCode: 'NET60',
        creditLimit: 275000,
        status: 'active',
        notes: 'Large chartering customer with consolidated invoices and extended payment terms.',
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

async function seedAccountingCustomers() {
    const payload = await getPayload({ config })

    console.log('Seeding accounting customers...')

    const currencyReferenceId = await getCurrencyReferenceId(payload)
    const paymentTermReferenceMap = await getPaymentTermReferenceMap(payload)

    const missingPaymentTerms = Array.from(new Set(sampleCustomers.map((customer) => customer.paymentTermCode))).filter(
        (code) => !paymentTermReferenceMap.has(code),
    )

    if (missingPaymentTerms.length) {
        throw new Error(`Missing accounting payment terms for codes: ${missingPaymentTerms.join(', ')}`)
    }

    let createdCount = 0
    let updatedCount = 0

    for (const customer of sampleCustomers) {
        const existing = await payload.find({
            collection: ACCOUNTING_COLLECTION_SLUGS.customers as any,
            where: {
                customerCode: {
                    equals: customer.customerCode,
                },
            } as any,
            limit: 1,
            depth: 0,
            overrideAccess: true,
        })

        const data = {
            customerCode: customer.customerCode,
            displayName: customer.displayName,
            legalName: customer.legalName,
            customerType: customer.customerType,
            email: customer.email,
            phone: customer.phone,
            billingAddress: customer.billingAddress,
            shippingAddress: customer.shippingAddress,
            taxId: customer.taxId,
            taxProfile: customer.taxProfile,
            currencyReference: currencyReferenceId,
            paymentTermReference: paymentTermReferenceMap.get(customer.paymentTermCode),
            creditLimit: customer.creditLimit,
            status: customer.status,
            notes: customer.notes,
        }

        if (existing.docs[0]) {
            await payload.update({
                collection: ACCOUNTING_COLLECTION_SLUGS.customers as any,
                id: existing.docs[0].id,
                data,
                depth: 0,
                overrideAccess: true,
            })
            updatedCount += 1
            console.log(`Updated ${customer.customerCode} - ${customer.displayName}`)
        } else {
            await payload.create({
                collection: ACCOUNTING_COLLECTION_SLUGS.customers as any,
                data,
                depth: 0,
                overrideAccess: true,
            })
            createdCount += 1
            console.log(`Created ${customer.customerCode} - ${customer.displayName}`)
        }
    }

    const total = await payload.count({
        collection: ACCOUNTING_COLLECTION_SLUGS.customers as any,
        overrideAccess: true,
    })

    console.log(`Done. Created: ${createdCount}, Updated: ${updatedCount}, Total customers now: ${total.totalDocs}`)
}

seedAccountingCustomers()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error('Failed to seed accounting customers:', error)
        process.exit(1)
    })
