'use client';

import React from 'react';
import { FileText } from 'lucide-react';
import { AccountingInboxPanel } from './AccountingInboxPanel';

const ACCOUNTING_INBOX_TAB = {
  label: 'Accounting Inbox',
  description:
    'Review uploaded files entering the accounting area through the shared media collection and see whether each file is already linked to a finance record.',
  searchPlaceholder: 'Search file name, mime type, category, entity type, entity reference, or note',
  tableTitle: 'Accounting Inbox',
  tableDescription:
    'Live upload inbox combining shared media records with accounting document-link coverage, primary-file flags, and latest linkage status.',
  uploadButtonLabel: 'Upload File',
  exportFileName: 'accounting-inbox.csv',
  emptyStateMessage: 'No inbox files match the current search and filter combination.',
  defaultQuickFilters: [],
};

export function DocumentIntakeClient() {
  return (
    <div className="space-y-6 p-6">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
        <div>
          <p className="text-sm font-medium text-blue-600">Operations / Documents & Inbox</p>
          <div className="mt-2 flex items-center gap-3">
            <div className="rounded-xl bg-blue-50 p-3 text-blue-700">
              <FileText className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Document Intake</h1>
              <p className="mt-1 max-w-3xl text-sm text-gray-600">
                Review uploaded files entering accounting and prepare them for linkage to invoices, bills, expenses, banking records, and other finance entities.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-6">
        <AccountingInboxPanel
          title={ACCOUNTING_INBOX_TAB.label}
          description={ACCOUNTING_INBOX_TAB.description}
          searchPlaceholder={ACCOUNTING_INBOX_TAB.searchPlaceholder}
          tableTitle={ACCOUNTING_INBOX_TAB.tableTitle}
          tableDescription={ACCOUNTING_INBOX_TAB.tableDescription}
          uploadButtonLabel={ACCOUNTING_INBOX_TAB.uploadButtonLabel}
          exportFileName={ACCOUNTING_INBOX_TAB.exportFileName}
          emptyStateMessage={ACCOUNTING_INBOX_TAB.emptyStateMessage}
          defaultQuickFilters={ACCOUNTING_INBOX_TAB.defaultQuickFilters}
        />
      </div>
    </div>
  );
}
