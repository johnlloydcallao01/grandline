'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import type { IconName, SidebarProps } from '@/types';
import Link from '@/components/ui/LinkWrapper';
import { SidebarItem } from '@/components/ui';
import { ChevronDown } from '@/components/ui/IconWrapper';
import { getIcon } from '@/utils';

const coreMenuItems = [
  {
    icon: 'transaction',
    label: 'Dashboard',
    href: '/accounting/dashboard',
    isActive: (pathname: string | null) => pathname === '/accounting' || pathname?.startsWith('/accounting/dashboard'),
  },
] as const;

const setupControlsMenuItems = [
  {
    label: 'Accounting Settings',
    href: '/accounting/setup-controls/accounting-settings',
    isActive: (pathname: string | null) => pathname?.startsWith('/accounting/setup-controls/accounting-settings'),
  },
  {
    label: 'Access & Permissions',
    href: '/accounting/setup-controls/access-permissions',
    isActive: (pathname: string | null) => pathname?.startsWith('/accounting/setup-controls/access-permissions'),
  },
  {
    label: 'Close & Approval Controls',
    href: '/accounting/setup-controls/close-approval-controls',
    isActive: (pathname: string | null) => pathname?.startsWith('/accounting/setup-controls/close-approval-controls'),
  },
  {
    label: 'Financial Reference Setup',
    href: '/accounting/setup-controls/financial-reference-setup',
    isActive: (pathname: string | null) => pathname?.startsWith('/accounting/setup-controls/financial-reference-setup'),
  },
] as const;

const masterRecordsMenuItems = [
  {
    label: 'Core Accounting Masters',
    href: '/accounting/master-records/core-accounting-masters',
    isActive: (pathname: string | null) => pathname?.startsWith('/accounting/master-records/core-accounting-masters'),
  },
  {
    label: 'Business Parties',
    href: '/accounting/master-records/business-parties',
    isActive: (pathname: string | null) => pathname?.startsWith('/accounting/master-records/business-parties'),
  },
  {
    label: 'Sponsored & Corporate Billing Entities',
    href: '/accounting/master-records/sponsored-corporate-billing-entities',
    isActive: (pathname: string | null) => pathname?.startsWith('/accounting/master-records/sponsored-corporate-billing-entities'),
  },
  {
    label: 'Organization & Reporting Dimensions',
    href: '/accounting/master-records/organization-reporting-dimensions',
    isActive: (pathname: string | null) => pathname?.startsWith('/accounting/master-records/organization-reporting-dimensions'),
  },
] as const;

const journalsLedgerMenuItems = [
  {
    label: 'Journal Management',
    href: '/accounting/journals-ledger/journal-management',
    isActive: (pathname: string | null) => pathname?.startsWith('/accounting/journals-ledger/journal-management'),
  },
  {
    label: 'Posting & Corrections',
    href: '/accounting/journals-ledger/posting-corrections',
    isActive: (pathname: string | null) => pathname?.startsWith('/accounting/journals-ledger/posting-corrections'),
  },
  {
    label: 'Ledger & Reporting',
    href: '/accounting/journals-ledger/ledger-reporting',
    isActive: (pathname: string | null) => pathname?.startsWith('/accounting/journals-ledger/ledger-reporting'),
  },
] as const;

const taxComplianceMenuItems = [
  {
    label: 'Tax Operations',
    href: '/accounting/tax-compliance/tax-operations',
    isActive: (pathname: string | null) => pathname?.startsWith('/accounting/tax-compliance/tax-operations'),
  },
  {
    label: 'Tax Reporting & Filing',
    href: '/accounting/tax-compliance/tax-reporting-filing',
    isActive: (pathname: string | null) => pathname?.startsWith('/accounting/tax-compliance/tax-reporting-filing'),
  },
  {
    label: 'Compliance Controls',
    href: '/accounting/tax-compliance/compliance-controls',
    isActive: (pathname: string | null) => pathname?.startsWith('/accounting/tax-compliance/compliance-controls'),
  },
] as const;

const auditHistoryMenuItems = [
  {
    label: 'Audit Logs',
    href: '/accounting/audit-history/audit-logs',
    isActive: (pathname: string | null) => pathname?.startsWith('/accounting/audit-history/audit-logs'),
  },
  {
    label: 'Record History',
    href: '/accounting/audit-history/record-history',
    isActive: (pathname: string | null) => pathname?.startsWith('/accounting/audit-history/record-history'),
  },
  {
    label: 'Control History & Exports',
    href: '/accounting/audit-history/control-history-exports',
    isActive: (pathname: string | null) => pathname?.startsWith('/accounting/audit-history/control-history-exports'),
  },
] as const;

const salesReceivablesMenuItems = [
  {
    label: 'Sales Documents',
    href: '/accounting/sales-receivables/sales-documents',
    isActive: (pathname: string | null) => pathname?.startsWith('/accounting/sales-receivables/sales-documents'),
  },
  {
    label: 'Receipts & Customer Balances',
    href: '/accounting/sales-receivables/receipts-customer-balances',
    isActive: (pathname: string | null) => pathname?.startsWith('/accounting/sales-receivables/receipts-customer-balances'),
  },
  {
    label: 'Collections & AR Monitoring',
    href: '/accounting/sales-receivables/collections-ar-monitoring',
    isActive: (pathname: string | null) => pathname?.startsWith('/accounting/sales-receivables/collections-ar-monitoring'),
  },
] as const;

const purchasesPayablesMenuItems = [
  {
    label: 'Purchase Documents',
    href: '/accounting/purchases-payables/purchase-documents',
    isActive: (pathname: string | null) => pathname?.startsWith('/accounting/purchases-payables/purchase-documents'),
  },
  {
    label: 'Vendor Payments & Balances',
    href: '/accounting/purchases-payables/vendor-payments-balances',
    isActive: (pathname: string | null) => pathname?.startsWith('/accounting/purchases-payables/vendor-payments-balances'),
  },
  {
    label: 'AP Monitoring',
    href: '/accounting/purchases-payables/ap-monitoring',
    isActive: (pathname: string | null) => pathname?.startsWith('/accounting/purchases-payables/ap-monitoring'),
  },
] as const;

const expensesMenuItems = [
  {
    label: 'Expense Operations',
    href: '/accounting/expenses/expense-operations',
    isActive: (pathname: string | null) => pathname?.startsWith('/accounting/expenses/expense-operations'),
  },
  {
    label: 'Claims & Reimbursements',
    href: '/accounting/expenses/claims-reimbursements',
    isActive: (pathname: string | null) => pathname?.startsWith('/accounting/expenses/claims-reimbursements'),
  },
  {
    label: 'Petty Cash',
    href: '/accounting/expenses/petty-cash',
    isActive: (pathname: string | null) => pathname?.startsWith('/accounting/expenses/petty-cash'),
  },
] as const;

const bankingCashMenuItems = [
  {
    label: 'Bank Operations',
    href: '/accounting/banking-cash/bank-operations',
    isActive: (pathname: string | null) => pathname?.startsWith('/accounting/banking-cash/bank-operations'),
  },
  {
    label: 'Cash Movement',
    href: '/accounting/banking-cash/cash-movement',
    isActive: (pathname: string | null) => pathname?.startsWith('/accounting/banking-cash/cash-movement'),
  },
  {
    label: 'Reconciliation & Cash Position',
    href: '/accounting/banking-cash/reconciliation-cash-position',
    isActive: (pathname: string | null) => pathname?.startsWith('/accounting/banking-cash/reconciliation-cash-position'),
  },
] as const;

const operationsMenuItems = [
  {
    icon: 'posts',
    label: 'Documents & Inbox',
    href: '/accounting/documents-inbox',
    isActive: (pathname: string | null) => pathname?.startsWith('/accounting/documents-inbox'),
  },
  {
    icon: 'analytics',
    label: 'Reports & Analytics',
    href: '/accounting/reports-analytics',
    isActive: (pathname: string | null) => pathname?.startsWith('/accounting/reports-analytics'),
  },
  {
    icon: 'permissions',
    label: 'Approvals',
    href: '/accounting/approvals',
    isActive: (pathname: string | null) => pathname?.startsWith('/accounting/approvals'),
  },
] as const;

const lmsFinanceMenuItems = [
  {
    icon: 'pricing',
    label: 'LMS Monetization Setup',
    href: '/accounting/lms-monetization-setup',
    isActive: (pathname: string | null) => pathname?.startsWith('/accounting/lms-monetization-setup'),
  },
  {
    icon: 'billing',
    label: 'LMS Billing & Collections',
    href: '/accounting/lms-billing-collections',
    isActive: (pathname: string | null) => pathname?.startsWith('/accounting/lms-billing-collections'),
  },
  {
    icon: 'analytics',
    label: 'LMS Finance Reporting',
    href: '/accounting/lms-finance-reporting',
    isActive: (pathname: string | null) => pathname?.startsWith('/accounting/lms-finance-reporting'),
  },
] as const;

const advancedFinanceMenuItems = [
  {
    icon: 'team',
    label: 'Projects & Time',
    href: '/accounting/projects-time',
    isActive: (pathname: string | null) => pathname?.startsWith('/accounting/projects-time'),
  },
  {
    icon: 'report',
    label: 'Budgets & Forecasts',
    href: '/accounting/budgets-forecasts',
    isActive: (pathname: string | null) => pathname?.startsWith('/accounting/budgets-forecasts'),
  },
  {
    icon: 'bank',
    label: 'Fixed Assets',
    href: '/accounting/fixed-assets',
    isActive: (pathname: string | null) => pathname?.startsWith('/accounting/fixed-assets'),
  },
  {
    icon: 'payout',
    label: 'Payroll & Contractor Finance',
    href: '/accounting/payroll-contractor-finance',
    isActive: (pathname: string | null) => pathname?.startsWith('/accounting/payroll-contractor-finance'),
  },
] as const;

function SidebarSectionLabel({ children, isOpen }: { children: React.ReactNode; isOpen: boolean }) {
  if (!isOpen) {
    return null;
  }

  return (
    <div className="px-3 py-2 text-xs font-semibold uppercase tracking-wider text-gray-500">
      {children}
    </div>
  );
}

function SidebarDropdownGroup({
  icon,
  label,
  isOpen,
  isExpanded,
  onToggle,
  active,
  children,
}: {
  icon: IconName;
  label: string;
  isOpen: boolean;
  isExpanded: boolean;
  onToggle: () => void;
  active: boolean;
  children: React.ReactNode;
}) {
  const baseClasses = 'flex w-full items-center rounded-lg px-3 py-2 text-sm font-medium transition-colors';
  const activeClasses = active
    ? 'bg-gray-100 text-gray-900'
    : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900';

  return (
    <div className="space-y-1">
      <button
        type="button"
        onClick={onToggle}
        className={`${baseClasses} ${activeClasses}`}
        aria-expanded={isExpanded}
      >
        <div className="flex-shrink-0">{getIcon(icon)}</div>
        {!isOpen ? null : (
          <>
            <span className="ml-3 flex-1 truncate text-left">{label}</span>
            <ChevronDown
              className={`h-4 w-4 text-gray-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
            />
          </>
        )}
      </button>

      {isOpen && isExpanded ? <div className="ml-4 space-y-1 border-l border-gray-200 pl-3">{children}</div> : null}
    </div>
  );
}

export function AccountingSidebar({ isOpen, onToggle: _onToggle, onScroll }: SidebarProps) {
  const pathname = usePathname();
  const hasActiveSetupControlsChild = setupControlsMenuItems.some((item) => item.isActive(pathname));
  const hasActiveMasterRecordsChild = masterRecordsMenuItems.some((item) => item.isActive(pathname));
  const hasActiveJournalsLedgerChild = journalsLedgerMenuItems.some((item) => item.isActive(pathname));
  const hasActiveTaxComplianceChild = taxComplianceMenuItems.some((item) => item.isActive(pathname));
  const hasActiveAuditHistoryChild = auditHistoryMenuItems.some((item) => item.isActive(pathname));
  const hasActiveSalesReceivablesChild = salesReceivablesMenuItems.some((item) => item.isActive(pathname));
  const hasActivePurchasesPayablesChild = purchasesPayablesMenuItems.some((item) => item.isActive(pathname));
  const hasActiveExpensesChild = expensesMenuItems.some((item) => item.isActive(pathname));
  const hasActiveBankingCashChild = bankingCashMenuItems.some((item) => item.isActive(pathname));
  const [isSetupControlsExpanded, setIsSetupControlsExpanded] = React.useState(hasActiveSetupControlsChild);
  const [isMasterRecordsExpanded, setIsMasterRecordsExpanded] = React.useState(hasActiveMasterRecordsChild);
  const [isJournalsLedgerExpanded, setIsJournalsLedgerExpanded] = React.useState(hasActiveJournalsLedgerChild);
  const [isTaxComplianceExpanded, setIsTaxComplianceExpanded] = React.useState(hasActiveTaxComplianceChild);
  const [isAuditHistoryExpanded, setIsAuditHistoryExpanded] = React.useState(hasActiveAuditHistoryChild);
  const [isSalesReceivablesExpanded, setIsSalesReceivablesExpanded] = React.useState(hasActiveSalesReceivablesChild);
  const [isPurchasesPayablesExpanded, setIsPurchasesPayablesExpanded] = React.useState(hasActivePurchasesPayablesChild);
  const [isExpensesExpanded, setIsExpensesExpanded] = React.useState(hasActiveExpensesChild);
  const [isBankingCashExpanded, setIsBankingCashExpanded] = React.useState(hasActiveBankingCashChild);

  React.useEffect(() => {
    if (hasActiveSetupControlsChild) {
      setIsSetupControlsExpanded(true);
    }
  }, [hasActiveSetupControlsChild]);

  React.useEffect(() => {
    if (hasActiveMasterRecordsChild) {
      setIsMasterRecordsExpanded(true);
    }
  }, [hasActiveMasterRecordsChild]);

  React.useEffect(() => {
    if (hasActiveJournalsLedgerChild) {
      setIsJournalsLedgerExpanded(true);
    }
  }, [hasActiveJournalsLedgerChild]);

  React.useEffect(() => {
    if (hasActiveTaxComplianceChild) {
      setIsTaxComplianceExpanded(true);
    }
  }, [hasActiveTaxComplianceChild]);

  React.useEffect(() => {
    if (hasActiveAuditHistoryChild) {
      setIsAuditHistoryExpanded(true);
    }
  }, [hasActiveAuditHistoryChild]);

  React.useEffect(() => {
    if (hasActiveSalesReceivablesChild) {
      setIsSalesReceivablesExpanded(true);
    }
  }, [hasActiveSalesReceivablesChild]);

  React.useEffect(() => {
    if (hasActivePurchasesPayablesChild) {
      setIsPurchasesPayablesExpanded(true);
    }
  }, [hasActivePurchasesPayablesChild]);

  React.useEffect(() => {
    if (hasActiveExpensesChild) {
      setIsExpensesExpanded(true);
    }
  }, [hasActiveExpensesChild]);

  React.useEffect(() => {
    if (hasActiveBankingCashChild) {
      setIsBankingCashExpanded(true);
    }
  }, [hasActiveBankingCashChild]);

  return (
    <aside
      data-sidebar="accounting"
      className={`fixed left-0 top-16 z-40 hidden overflow-y-auto border-r border-gray-200 bg-white transition-all duration-300 lg:block ${isOpen ? 'w-60 translate-x-0' : 'w-20 translate-x-0'
        }`}
      style={{
        height: 'calc(100vh - 4rem)',
        scrollbarWidth: 'thin',
        scrollbarColor: '#cbd5e1 transparent',
      }}
      onScroll={onScroll}
    >
      <div className="p-3 pb-20">
        <nav className="space-y-4">
          <div className="space-y-1">
            <SidebarSectionLabel isOpen={isOpen}>Navigation</SidebarSectionLabel>
            <Link
              href="/dashboard"
              className="flex w-full items-center rounded-lg px-3 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-100 hover:text-gray-900"
            >
              {!isOpen ? <span className="mx-auto text-xs font-semibold">AD</span> : <span>Back To Admin</span>}
            </Link>
          </div>

          {isOpen && <hr className="border-gray-200" />}

          <div className="space-y-1">
            <SidebarSectionLabel isOpen={isOpen}>Core</SidebarSectionLabel>
            <SidebarItem
              icon={coreMenuItems[0].icon}
              label={coreMenuItems[0].label}
              active={coreMenuItems[0].isActive(pathname)}
              collapsed={!isOpen}
              href={coreMenuItems[0].href}
            />
            <SidebarDropdownGroup
              icon="settings"
              label="Setup & Controls"
              isOpen={isOpen}
              isExpanded={isSetupControlsExpanded}
              onToggle={() => setIsSetupControlsExpanded((current) => !current)}
              active={hasActiveSetupControlsChild}
            >
              {setupControlsMenuItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex w-full items-center rounded-lg px-3 py-2 text-sm transition-colors ${item.isActive(pathname)
                      ? 'bg-gray-100 font-medium text-gray-900'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    }`}
                >
                  <span className="truncate">{item.label}</span>
                </Link>
              ))}
            </SidebarDropdownGroup>
            <SidebarDropdownGroup
              icon="storage"
              label="Master Records"
              isOpen={isOpen}
              isExpanded={isMasterRecordsExpanded}
              onToggle={() => setIsMasterRecordsExpanded((current) => !current)}
              active={hasActiveMasterRecordsChild}
            >
              {masterRecordsMenuItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex w-full items-center rounded-lg px-3 py-2 text-sm transition-colors ${item.isActive(pathname)
                      ? 'bg-gray-100 font-medium text-gray-900'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    }`}
                >
                  <span className="truncate">{item.label}</span>
                </Link>
              ))}
            </SidebarDropdownGroup>
            <SidebarDropdownGroup
              icon="report"
              label="Journals & Ledger"
              isOpen={isOpen}
              isExpanded={isJournalsLedgerExpanded}
              onToggle={() => setIsJournalsLedgerExpanded((current) => !current)}
              active={hasActiveJournalsLedgerChild}
            >
              {journalsLedgerMenuItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex w-full items-center rounded-lg px-3 py-2 text-sm transition-colors ${item.isActive(pathname)
                      ? 'bg-gray-100 font-medium text-gray-900'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    }`}
                >
                  <span className="truncate">{item.label}</span>
                </Link>
              ))}
            </SidebarDropdownGroup>
            <SidebarDropdownGroup
              icon="billing"
              label="Tax & Compliance"
              isOpen={isOpen}
              isExpanded={isTaxComplianceExpanded}
              onToggle={() => setIsTaxComplianceExpanded((current) => !current)}
              active={hasActiveTaxComplianceChild}
            >
              {taxComplianceMenuItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex w-full items-center rounded-lg px-3 py-2 text-sm transition-colors ${item.isActive(pathname)
                      ? 'bg-gray-100 font-medium text-gray-900'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    }`}
                >
                  <span className="truncate">{item.label}</span>
                </Link>
              ))}
            </SidebarDropdownGroup>
            <SidebarDropdownGroup
              icon="audit"
              label="Audit & History"
              isOpen={isOpen}
              isExpanded={isAuditHistoryExpanded}
              onToggle={() => setIsAuditHistoryExpanded((current) => !current)}
              active={hasActiveAuditHistoryChild}
            >
              {auditHistoryMenuItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex w-full items-center rounded-lg px-3 py-2 text-sm transition-colors ${item.isActive(pathname)
                      ? 'bg-gray-100 font-medium text-gray-900'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    }`}
                >
                  <span className="truncate">{item.label}</span>
                </Link>
              ))}
            </SidebarDropdownGroup>
            {coreMenuItems.slice(1).map((item) => (
              <SidebarItem
                key={item.href}
                icon={item.icon}
                label={item.label}
                active={item.isActive(pathname)}
                collapsed={!isOpen}
                href={item.href}
              />
            ))}
          </div>

          {isOpen && <hr className="border-gray-200" />}

          <div className="space-y-1">
            <SidebarSectionLabel isOpen={isOpen}>Operations</SidebarSectionLabel>
            <SidebarDropdownGroup
              icon="invoice"
              label="Sales & Receivables"
              isOpen={isOpen}
              isExpanded={isSalesReceivablesExpanded}
              onToggle={() => setIsSalesReceivablesExpanded((current) => !current)}
              active={hasActiveSalesReceivablesChild}
            >
              {salesReceivablesMenuItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex w-full items-center rounded-lg px-3 py-2 text-sm transition-colors ${item.isActive(pathname)
                      ? 'bg-gray-100 font-medium text-gray-900'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    }`}
                >
                  <span className="truncate">{item.label}</span>
                </Link>
              ))}
            </SidebarDropdownGroup>
            <SidebarDropdownGroup
              icon="billing"
              label="Purchases & Payables"
              isOpen={isOpen}
              isExpanded={isPurchasesPayablesExpanded}
              onToggle={() => setIsPurchasesPayablesExpanded((current) => !current)}
              active={hasActivePurchasesPayablesChild}
            >
              {purchasesPayablesMenuItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex w-full items-center rounded-lg px-3 py-2 text-sm transition-colors ${item.isActive(pathname)
                      ? 'bg-gray-100 font-medium text-gray-900'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    }`}
                >
                  <span className="truncate">{item.label}</span>
                </Link>
              ))}
            </SidebarDropdownGroup>
            <SidebarDropdownGroup
              icon="payments"
              label="Expenses"
              isOpen={isOpen}
              isExpanded={isExpensesExpanded}
              onToggle={() => setIsExpensesExpanded((current) => !current)}
              active={hasActiveExpensesChild}
            >
              {expensesMenuItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex w-full items-center rounded-lg px-3 py-2 text-sm transition-colors ${item.isActive(pathname)
                      ? 'bg-gray-100 font-medium text-gray-900'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    }`}
                >
                  <span className="truncate">{item.label}</span>
                </Link>
              ))}
            </SidebarDropdownGroup>
            <SidebarDropdownGroup
              icon="bank"
              label="Banking & Cash"
              isOpen={isOpen}
              isExpanded={isBankingCashExpanded}
              onToggle={() => setIsBankingCashExpanded((current) => !current)}
              active={hasActiveBankingCashChild}
            >
              {bankingCashMenuItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex w-full items-center rounded-lg px-3 py-2 text-sm transition-colors ${item.isActive(pathname)
                      ? 'bg-gray-100 font-medium text-gray-900'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    }`}
                >
                  <span className="truncate">{item.label}</span>
                </Link>
              ))}
            </SidebarDropdownGroup>
            {operationsMenuItems.map((item) => (
              <SidebarItem
                key={item.href}
                icon={item.icon}
                label={item.label}
                active={item.isActive(pathname)}
                collapsed={!isOpen}
                href={item.href}
              />
            ))}
          </div>

          {isOpen && <hr className="border-gray-200" />}

          <div className="space-y-1">
            <SidebarSectionLabel isOpen={isOpen}>LMS Finance</SidebarSectionLabel>
            {lmsFinanceMenuItems.map((item) => (
              <SidebarItem
                key={item.href}
                icon={item.icon}
                label={item.label}
                active={item.isActive(pathname)}
                collapsed={!isOpen}
                href={item.href}
              />
            ))}
          </div>

          {isOpen && <hr className="border-gray-200" />}

          <div className="space-y-1">
            <SidebarSectionLabel isOpen={isOpen}>Advanced Finance</SidebarSectionLabel>
            {advancedFinanceMenuItems.map((item) => (
              <SidebarItem
                key={item.href}
                icon={item.icon}
                label={item.label}
                active={item.isActive(pathname)}
                collapsed={!isOpen}
                href={item.href}
              />
            ))}
          </div>
        </nav>
      </div>
    </aside>
  );
}
