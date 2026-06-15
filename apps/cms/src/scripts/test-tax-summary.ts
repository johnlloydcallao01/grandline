import 'dotenv/config'
import { getPayload } from 'payload'
import config from '../payload.config'
import { findAllDocs } from '../accounting/utils/findAllDocs'
import { ACCOUNTING_COLLECTION_SLUGS } from '../accounting/constants/accounting'

async function run() {
  const payload = await getPayload({ config })
  
  const invoiceLines = await findAllDocs<any>({
    payload,
    collection: ACCOUNTING_COLLECTION_SLUGS.invoiceLineItems,
    depth: 2,
  })
  
  console.log('Total invoice lines:', invoiceLines.length)
  
  for (const line of invoiceLines) {
    if (line.description && line.description.includes('Tax Usage Seed')) {
       console.log('Found seeded invoice line:', line.id)
       console.log('Invoice status:', line.invoice?.status)
       console.log('Invoice id:', line.invoice?.id)
       console.log('TaxCode:', line.taxCode)
    }
  }

  const expenses = await findAllDocs<any>({
    payload,
    collection: ACCOUNTING_COLLECTION_SLUGS.expenses,
    depth: 1,
    where: {
      status: {
        equals: 'posted',
      },
    },
  })
  
  console.log('Total expenses:', expenses.length)
  for (const exp of expenses) {
    if (exp.taxCode?.code === 'VAT12_SEED') {
       console.log('Found seeded expense:', exp.id)
       console.log('Expense status:', exp.status)
       console.log('TaxCode:', exp.taxCode?.code)
       console.log('TaxTotal:', exp.taxTotal)
    }
  }
  
  process.exit(0)
}
run().catch(console.error)