'use client';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { FileText } from '@/components/ui/IconWrapper';
import { InstructorPayoutRulesClient } from './InstructorPayoutRulesClient';
import { PayoutRegisterClient } from './PayoutRegisterClient';

const tabs = [
  { id: 'instructor-payout-rules', label: 'Instructor Payout Rules' },
  { id: 'payout-register', label: 'Payout Register' },
];

export default function InstructorPayoutSetupPage() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const rawTab = searchParams.get('tab');
  const activeTab = (tabs.find((tab) => tab.id === rawTab)?.id) || 'instructor-payout-rules';

  const handleTabChange = (tabId: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('tab', tabId);
    router.push(`${pathname}?${params.toString()}`);
  };

  return (
    <div className="space-y-6 p-6">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
        <div>
          <p className="text-sm font-medium text-blue-600">LMS Finance / LMS Monetization Setup</p>
          <div className="mt-2 flex items-center gap-3">
            <div className="rounded-xl bg-blue-50 p-3 text-blue-700">
              <FileText className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Instructor Payout Setup</h1>
              <p className="mt-1 max-w-3xl text-sm text-gray-600">Review instructor payout rules and generated payout records derived from LMS monetization activity and course-based payout methods.</p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3" />
      </div>

      <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
        <div className="border-b border-gray-200 px-6">
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
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </nav>
        </div>

        <div className="p-6">
          {activeTab === 'instructor-payout-rules' ? (
            <InstructorPayoutRulesClient />
          ) : (
            <PayoutRegisterClient />
          )}
        </div>
      </div>
    </div>
  );
}
