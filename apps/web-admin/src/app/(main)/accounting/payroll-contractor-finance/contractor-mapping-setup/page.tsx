'use client';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { FileText } from '@/components/ui/IconWrapper';
import { InstructorPayoutsClient } from './InstructorPayoutsClient';
import { PayrollAccountMappingClient } from './PayrollAccountMappingClient';

const tabs = [
  { id: 'instructor-payouts', label: 'Instructor Payouts' },
  { id: 'payroll-account-mapping', label: 'Payroll Account Mapping' },
];

export default function ContractorMappingSetupPage() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const rawTab = searchParams.get('tab');
  const activeTab = (tabs.find((tab) => tab.id === rawTab)?.id) || 'instructor-payouts';

  const handleTabChange = (tabId: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('tab', tabId);
    router.push(`${pathname}?${params.toString()}`);
  };

  return (
    <div className="space-y-6 p-[10px]">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
        <div>
          <p className="text-sm font-medium text-blue-600 dark:text-blue-400">Advanced Finance / Payroll & Contractor Finance</p>
          <div className="mt-2 flex items-center gap-3">
            <div className="rounded-xl bg-blue-50 dark:bg-blue-950/30 p-3 text-blue-700 dark:text-blue-400">
              <FileText className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Contractor & Mapping Setup</h1>
              <p className="mt-1 max-w-3xl text-sm text-gray-600 dark:text-gray-400">
                Review the narrower contractor-related payout surface and the payroll account mappings that actually exist in the current backend.
              </p>
            </div>
          </div>
        </div>

      </div>

      <div className="rounded-xl border border-gray-200 dark:border-[var(--card-border)] bg-white dark:bg-[var(--card-background)] shadow-sm">
        <div className="border-b border-gray-200 dark:border-gray-700 px-[10px]">
          <nav className="-mb-px flex space-x-8 overflow-x-auto" aria-label="Tabs">
            {tabs.map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => handleTabChange(tab.id)}
                  className={`whitespace-nowrap border-b-2 px-1 py-4 text-sm font-medium transition-colors ${
                    isActive
                      ? 'border-blue-500 text-blue-600 dark:border-blue-500 dark:text-blue-400'
                      : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 dark:text-gray-400 dark:hover:border-gray-600 dark:hover:text-gray-300'
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </nav>
        </div>

        <div className="p-[10px]">
          {activeTab === 'instructor-payouts' ? (
            <InstructorPayoutsClient />
          ) : (
            <PayrollAccountMappingClient />
          )}
        </div>
      </div>
    </div>
  );
}
