import { LmsBillingCollectionsPage, type LmsBillingCollectionsTab } from '../_components/LmsBillingCollectionsPage';

const tabs: LmsBillingCollectionsTab[] = [
  {
    id: 'receipts',
    label: 'Receipts',
    description:
      'Review LMS-linked official receipts by receipt number, payment, customer, billing link, amount, receipt date, and receipt status.',
    searchPlaceholder: 'Search receipt number, payment, customer, billing link, amount, or status',
    filters: ['Receipts', 'Issued', 'Draft', 'Voided'],
    actions: [
      { label: 'New Receipt', icon: 'plus', variant: 'primary' },
      { label: 'Refresh Receipts', icon: 'refresh', variant: 'secondary' },
      { label: 'Download View', icon: 'download', variant: 'ghost' },
    ],
    metrics: [
      { label: 'Receipts', value: '91', change: 'Official receipts created for LMS-linked payments', trend: 'up' },
      { label: 'Issued Receipts', value: '74', change: 'Receipts already finalized or issued', trend: 'up' },
      { label: 'Draft Receipts', value: '13', change: 'Receipts still awaiting issue or review', trend: 'neutral' },
      { label: 'Receipt Value', value: 'PHP 2.41M', change: 'Gross receipt amount in the current register', trend: 'up' },
    ],
    tableTitle: 'Receipt Register',
    tableDescription:
      'Receipt records aligned to `accounting-receipts`, including the payment relationship, customer, amount, proof document, and status.',
    columns: ['Receipt Number', 'Payment', 'Customer', 'Billing Link', 'Amount', 'Status'],
    rows: [
      {
        id: 'receipt-1',
        cells: [
          { text: 'OR-2026-0308', emphasis: true },
          'PR-2026-0201',
          'John Dela Cruz',
          'ENR-1184',
          { text: 'PHP 12,000', align: 'right' },
          { text: 'issued', tone: 'green' },
        ],
      },
      {
        id: 'receipt-2',
        cells: [
          { text: 'OR-2026-0316', emphasis: true },
          'PR-2026-0217',
          'Ana Reyes',
          'ENR-1207',
          { text: 'PHP 8,150', align: 'right' },
          { text: 'draft', tone: 'amber' },
        ],
      },
      {
        id: 'receipt-3',
        cells: [
          { text: 'OR-2026-0299', emphasis: true },
          'PR-2026-0188',
          'TESDA Region IV',
          'ENR-1152',
          { text: 'PHP 24,000', align: 'right' },
          { text: 'issued', tone: 'green' },
        ],
      },
      {
        id: 'receipt-4',
        cells: [
          { text: 'OR-2026-0324', emphasis: true },
          'PR-2026-0224',
          'BlueWave Manning',
          'ENR-1234',
          { text: 'PHP 6,000', align: 'right' },
          { text: 'voided', tone: 'red' },
        ],
      },
    ],
  },
  {
    id: 'proof-of-payment',
    label: 'Proof of Payment',
    description:
      'Review payment-proof coverage using receipt proof documents and the receipt-to-payment linkage used to validate LMS payment collection evidence.',
    searchPlaceholder: 'Search receipt number, payment, customer, proof document, issue date, or proof state',
    filters: ['With Proof', 'Missing Proof', 'Issued', 'Draft'],
    actions: [
      { label: 'Upload Proof', icon: 'upload', variant: 'primary' },
      { label: 'Refresh Proofs', icon: 'refresh', variant: 'secondary' },
      { label: 'Download View', icon: 'download', variant: 'ghost' },
    ],
    metrics: [
      { label: 'With Proof File', value: '63', change: 'Receipts carrying uploaded proof documents', trend: 'up' },
      { label: 'Missing Proof', value: '28', change: 'Receipts still lacking attached support files', trend: 'down' },
      { label: 'Recent Uploads', value: '11', change: 'Proof documents uploaded this week', trend: 'up' },
      { label: 'Coverage Rate', value: '69%', change: 'Share of LMS receipt records with proof attachments', trend: 'neutral' },
    ],
    tableTitle: 'Proof Of Payment Register',
    tableDescription:
      'Receipt proof coverage aligned to the `proofDocument` field on `accounting-receipts`, shown with the related payment and customer context.',
    columns: ['Receipt Number', 'Payment', 'Customer', 'Proof File', 'Receipt Date', 'Proof State'],
    rows: [
      {
        id: 'proof-1',
        cells: [
          { text: 'OR-2026-0308', emphasis: true },
          'PR-2026-0201',
          'John Dela Cruz',
          { text: 'bank-slip-1184.pdf', emphasis: true },
          '2026-05-08',
          { text: 'Attached', tone: 'green' },
        ],
      },
      {
        id: 'proof-2',
        cells: [
          { text: 'OR-2026-0316', emphasis: true },
          'PR-2026-0217',
          'Ana Reyes',
          '-',
          '2026-05-19',
          { text: 'Missing', tone: 'amber' },
        ],
      },
      {
        id: 'proof-3',
        cells: [
          { text: 'OR-2026-0299', emphasis: true },
          'PR-2026-0188',
          'TESDA Region IV',
          { text: 'tesda-remittance-0502.png', emphasis: true },
          '2026-05-02',
          { text: 'Attached', tone: 'green' },
        ],
      },
      {
        id: 'proof-4',
        cells: [
          { text: 'OR-2026-0324', emphasis: true },
          'PR-2026-0224',
          'BlueWave Manning',
          { text: 'corp-remittance-0527.pdf', emphasis: true },
          '2026-05-27',
          { text: 'Attached', tone: 'green' },
        ],
      },
    ],
  },
];

export default function ReceiptPaymentReviewPage() {
  return (
    <LmsBillingCollectionsPage
      eyebrow="LMS Finance / LMS Billing & Collections"
      title="Receipt & Payment Review"
      description="Review LMS receipts and proof-of-payment coverage for customer payments collected against enrollment billing and invoice settlement."
      headerActions={[
        { label: 'Refresh Workspace', icon: 'refresh', variant: 'secondary' },
        { label: 'New Receipt', icon: 'plus', variant: 'primary' },
      ]}
      tabs={tabs}
    />
  );
}
