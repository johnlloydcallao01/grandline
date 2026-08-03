'use client';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { FileText } from '@/components/ui/IconWrapper';
import { RevenueAccountMappingClient } from './RevenueAccountMappingClient';
import { CouponDiscountMappingClient } from './CouponDiscountMappingClient';
import { RecognitionSchedulesClient } from './RecognitionSchedulesClient';

const tabs = [
  { id: 'revenue-account-mapping', label: 'Revenue Account Mapping' },
  { id: 'coupon-discount-mapping', label: 'Coupon & Discount Mapping' },
  { id: 'recognition-schedules', label: 'Recognition Schedules' },
];

export default function RevenueDiscountMappingPage() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const rawTab = searchParams.get('tab');
  const activeTab = (tabs.find((tab) => tab.id === rawTab)?.id) || 'revenue-account-mapping';

  const handleTabChange = (tabId: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('tab', tabId);
    router.push(`${pathname}?${params.toString()}`);
  };

  return (
    <div className="space-y-6 p-[10px]">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
        <div>
          <p className="text-sm font-medium text-blue-600 dark:text-blue-400">LMS Finance / LMS Monetization Setup</p>
          <div className="mt-2 flex items-center gap-3">
            <div className="rounded-xl bg-blue-50 dark:bg-blue-950/30 p-3 text-blue-700 dark:text-blue-400">
              <FileText className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Revenue & Discount Mapping</h1>
              <p className="mt-1 max-w-3xl text-sm text-gray-600 dark:text-gray-400">Review LMS revenue account mappings, coupon and discount definitions, and deferred recognition schedules tied to enrollment monetization.</p>
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-gray-200 dark:border-[var(--card-border)] bg-white dark:bg-[var(--card-background)] shadow-sm">
        <div className="border-b border-gray-200 dark:border-gray-800 px-[10px]">
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
                      : 'border-transparent text-gray-500 dark:text-gray-400 hover:border-gray-300 dark:hover:border-gray-600 hover:text-gray-700 dark:hover:text-gray-300'
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </nav>
        </div>
        <div className="p-[10px]">
          {activeTab === 'revenue-account-mapping' ? <RevenueAccountMappingClient /> : null}
          {activeTab === 'coupon-discount-mapping' ? <CouponDiscountMappingClient /> : null}
          {activeTab === 'recognition-schedules' ? <RecognitionSchedulesClient /> : null}
        </div>
      </div>
    </div>
  );
}
