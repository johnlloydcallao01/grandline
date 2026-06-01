import { DocumentsInboxPage, type DocumentsInboxTab } from '../_components/DocumentsInboxPage';

const tabs: DocumentsInboxTab[] = [
  {
    id: 'document-categories',
    label: 'Document Categories',
    description:
      'Review the supported accounting document categories enforced by the document-link collection such as invoice, bill, receipt, bank statement, tax, and contract.',
    searchPlaceholder: 'Search category, common usage, linked volume, or primary usage',
    filters: ['Commercial', 'Receipts', 'Banking', 'Tax'],
    actions: [
      { label: 'Open Category', icon: 'plus', variant: 'primary' },
      { label: 'Refresh Categories', icon: 'refresh', variant: 'secondary' },
      { label: 'Download View', icon: 'download', variant: 'ghost' },
    ],
    metrics: [
      { label: 'Supported Categories', value: '9', change: 'Category options defined by the backend', trend: 'neutral' },
      { label: 'Active Categories', value: '7', change: 'Categories currently represented in linked records', trend: 'up' },
      { label: 'Receipt-Oriented', value: '3', change: 'Receipt-like categories available for archive filtering', trend: 'neutral' },
      { label: 'Primary-Capable', value: '9', change: 'Any category can carry the primary-document flag', trend: 'neutral' },
    ],
    tableTitle: 'Document Category Register',
    tableDescription:
      'Governance view of the document categories actually defined by the accounting document-link collection.',
    columns: ['Category', 'Typical Use', 'Linked Records', 'Primary Usage', 'Notes', 'Status'],
    rows: [
      {
        id: 'cat-1',
        cells: [
          { text: 'invoice', emphasis: true },
          'Invoice support documents',
          { text: '14', align: 'right' },
          'Yes',
          'Used on invoice-linked document records',
          { text: 'Active', tone: 'green' },
        ],
      },
      {
        id: 'cat-2',
        cells: [
          { text: 'expense_receipt', emphasis: true },
          'Expense support receipts',
          { text: '18', align: 'right' },
          'Yes',
          'Main archive bucket for expense attachments',
          { text: 'Active', tone: 'green' },
        ],
      },
      {
        id: 'cat-3',
        cells: [
          { text: 'bank_statement', emphasis: true },
          'Banking and reconciliation files',
          { text: '6', align: 'right' },
          'Yes',
          'Used by reconciliation support documents',
          { text: 'Active', tone: 'green' },
        ],
      },
      {
        id: 'cat-4',
        cells: [
          { text: 'contract', emphasis: true },
          'Reference and agreement files',
          { text: '3', align: 'right' },
          'No',
          'Used where commercial support files are needed',
          { text: 'Active', tone: 'green' },
        ],
      },
    ],
  },
  {
    id: 'entity-links',
    label: 'Entity Links',
    description:
      'Review which accounting entity types are currently document-link targets, including invoices, bills, expenses, payments, journal entries, and banking records.',
    searchPlaceholder: 'Search entity type, linked volume, latest entity id, or category usage',
    filters: ['Commercial', 'Expenses', 'Banking', 'Journals'],
    actions: [
      { label: 'Open Entity View', icon: 'plus', variant: 'primary' },
      { label: 'Refresh Entity Links', icon: 'refresh', variant: 'secondary' },
      { label: 'Download View', icon: 'download', variant: 'ghost' },
    ],
    metrics: [
      { label: 'Supported Entity Types', value: '28+', change: 'Entity targets defined by backend options', trend: 'up' },
      { label: 'Currently Used Types', value: '11', change: 'Entity types represented in current link records', trend: 'up' },
      { label: 'Commercial Types', value: '5', change: 'Invoice, bill, receipt, and payment entities', trend: 'neutral' },
      { label: 'Banking / Journal Types', value: '4', change: 'Banking and journal support entities', trend: 'neutral' },
    ],
    tableTitle: 'Entity Link Coverage',
    tableDescription:
      'Coverage view of accounting entity types that can be linked to supporting files through `accounting-document-links`.',
    columns: ['Entity Type', 'Linked Records', 'Latest Entity ID', 'Common Category', 'Primary Links', 'Status'],
    rows: [
      {
        id: 'entity-1',
        cells: [
          { text: 'invoice', emphasis: true },
          { text: '14', align: 'right' },
          'INV-2026-1452',
          'invoice',
          { text: '8', align: 'right' },
          { text: 'Active', tone: 'green' },
        ],
      },
      {
        id: 'entity-2',
        cells: [
          { text: 'bill', emphasis: true },
          { text: '19', align: 'right' },
          'BILL-2026-1184',
          'bill',
          { text: '11', align: 'right' },
          { text: 'Active', tone: 'green' },
        ],
      },
      {
        id: 'entity-3',
        cells: [
          { text: 'expense', emphasis: true },
          { text: '18', align: 'right' },
          'EXP-2026-1168',
          'expense_receipt',
          { text: '12', align: 'right' },
          { text: 'Active', tone: 'green' },
        ],
      },
      {
        id: 'entity-4',
        cells: [
          { text: 'bank_reconciliation', emphasis: true },
          { text: '6', align: 'right' },
          'REC-2026-05-BDO',
          'bank_statement',
          { text: '6', align: 'right' },
          { text: 'Active', tone: 'green' },
        ],
      },
    ],
  },
  {
    id: 'primary-documents',
    label: 'Primary Documents',
    description:
      'Review document links marked as primary so finance can identify the main supporting file attached to a transaction or accounting entity.',
    searchPlaceholder: 'Search entity id, file name, category, uploaded by, or primary-link note',
    filters: ['Primary', 'Invoices', 'Bills', 'Expenses'],
    actions: [
      { label: 'Set Primary', icon: 'plus', variant: 'primary' },
      { label: 'Refresh Primary View', icon: 'refresh', variant: 'secondary' },
      { label: 'Download View', icon: 'download', variant: 'ghost' },
    ],
    metrics: [
      { label: 'Primary Links', value: '41', change: 'Document links flagged as primary', trend: 'up' },
      { label: 'Commercial Primary', value: '19', change: 'Primary files for invoices, bills, and receipts', trend: 'neutral' },
      { label: 'Expense Primary', value: '12', change: 'Primary files for expense records', trend: 'neutral' },
      { label: 'Banking / Journal Primary', value: '10', change: 'Primary files for banking and journal support', trend: 'neutral' },
    ],
    tableTitle: 'Primary Document Register',
    tableDescription:
      'Primary-document review based on the `isPrimary` flag already present in the accounting document-link collection.',
    columns: ['File Name', 'Entity Type', 'Entity ID', 'Category', 'Uploaded By', 'Status'],
    rows: [
      {
        id: 'primary-1',
        cells: [
          { text: 'office-depot-bill-1184.jpg', emphasis: true },
          'bill',
          'BILL-2026-1184',
          'bill',
          'ap.processor',
          { text: 'Primary', tone: 'green' },
        ],
      },
      {
        id: 'primary-2',
        cells: [
          { text: 'receipt-rct-2026-1184.pdf', emphasis: true },
          'receipt',
          'RCT-2026-1184',
          'receipt',
          'ar.cashier',
          { text: 'Primary', tone: 'green' },
        ],
      },
      {
        id: 'primary-3',
        cells: [
          { text: 'grab-receipt-exp-1162.png', emphasis: true },
          'expense',
          'EXP-2026-1162',
          'expense_receipt',
          'expense.ops',
          { text: 'Primary', tone: 'green' },
        ],
      },
      {
        id: 'primary-4',
        cells: [
          { text: 'bdo-statement-may-2026.pdf', emphasis: true },
          'bank_reconciliation',
          'REC-2026-05-BDO',
          'bank_statement',
          'finance.admin',
          { text: 'Primary', tone: 'green' },
        ],
      },
    ],
  },
];

export default function DocumentGovernancePage() {
  return (
    <DocumentsInboxPage
      eyebrow="Operations / Documents & Inbox"
      title="Document Governance"
      description="Review the categories, entity-link coverage, and primary-document controls already modeled by the accounting document-link backend."
      headerActions={[
        { label: 'Refresh Workspace', icon: 'refresh', variant: 'secondary' },
        { label: 'Open Governance View', icon: 'plus', variant: 'primary' },
      ]}
      tabs={tabs}
    />
  );
}
