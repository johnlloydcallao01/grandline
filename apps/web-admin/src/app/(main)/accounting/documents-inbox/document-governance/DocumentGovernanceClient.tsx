'use client';

import React from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { FileText } from 'lucide-react';
import { DocumentCategoriesPanel } from './DocumentCategoriesPanel';
import { EntityLinksPanel } from './EntityLinksPanel';
import { PrimaryDocumentsPanel } from './PrimaryDocumentsPanel';

type TabConfig = {
  id: 'document-categories' | 'entity-links' | 'primary-documents';
  label: string;
  description: string;
  searchPlaceholder: string;
};

const TABS: TabConfig[] = [
  {
    id: 'document-categories',
    label: 'Document Categories',
    description:
      'Review the supported accounting document categories enforced by the document-link collection such as invoice, bill, receipt, bank statement, tax, and contract.',
    searchPlaceholder: 'Search category, common usage, linked volume, or primary usage',
  },
  {
    id: 'entity-links',
    label: 'Entity Links',
    description:
      'Review which accounting entity types are currently document-link targets, including invoices, bills, expenses, payments, journal entries, and banking records.',
    searchPlaceholder: 'Search entity type, linked volume, latest entity id, or category usage',
  },
  {
    id: 'primary-documents',
    label: 'Primary Documents',
    description:
      'Review document links marked as primary so finance can identify the main supporting file attached to a transaction or accounting entity.',
    searchPlaceholder: 'Search entity id, file name, category, uploaded by, or primary-link note',
  },
];

export function DocumentGovernanceClient() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const rawTab = searchParams.get('tab');
  const activeTab: TabConfig['id'] =
    (TABS.find((tab) => tab.id === rawTab)?.id as TabConfig['id']) || 'document-categories';
  const currentTab = TABS.find((tab) => tab.id === activeTab) || TABS[0];

  const handleTabChange = (tabId: TabConfig['id']) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('tab', tabId);
    router.push(`${pathname}?${params.toString()}`);
  };

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
              <h1 className="text-2xl font-bold text-gray-900">Document Governance</h1>
              <p className="mt-1 max-w-3xl text-sm text-gray-600">
                Review the categories, entity-link coverage, and primary-document controls already modeled by the accounting document-link backend.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
        <div className="border-b border-gray-200 px-6">
          <nav className="-mb-px flex space-x-8 overflow-x-auto" aria-label="Tabs">
            {TABS.map((tab) => {
              const isActive = currentTab.id === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => handleTabChange(tab.id)}
                  className={`whitespace-nowrap border-b-2 px-1 py-4 text-sm font-medium transition-colors ${isActive ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'}`}
                >
                  {tab.label}
                </button>
              );
            })}
          </nav>
        </div>

        <div className="p-6">
          {activeTab === 'document-categories' ? (
            <DocumentCategoriesPanel
              title={currentTab.label}
              description={currentTab.description}
              searchPlaceholder={currentTab.searchPlaceholder}
              tableTitle="Document Category Register"
              tableDescription="Governance view of the document categories actually defined by the accounting document-link collection."
              exportFileName="document-governance-document-categories.csv"
              emptyStateMessage="No document categories match the current search and filter combination."
            />
          ) : activeTab === 'entity-links' ? (
            <EntityLinksPanel
              title={currentTab.label}
              description={currentTab.description}
              searchPlaceholder={currentTab.searchPlaceholder}
              tableTitle="Entity Link Coverage"
              tableDescription="Coverage view of accounting entity types that can be linked to supporting files through `accounting-document-links`."
              exportFileName="document-governance-entity-links.csv"
              emptyStateMessage="No entity link targets match the current search and filter combination."
            />
          ) : (
            <PrimaryDocumentsPanel
              title={currentTab.label}
              description={currentTab.description}
              searchPlaceholder={currentTab.searchPlaceholder}
              tableTitle="Primary Document Register"
              tableDescription="Primary-document review based on the `isPrimary` flag already present in the accounting document-link collection."
              exportFileName="document-governance-primary-documents.csv"
              emptyStateMessage="No primary document links match the current search and filter combination."
            />
          )}
        </div>
      </div>
    </div>
  );
}
