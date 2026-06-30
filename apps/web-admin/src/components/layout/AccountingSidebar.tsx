'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import type { IconName, SidebarProps } from '@/types';
import Link from '@/components/ui/LinkWrapper';
import { SidebarItem, SidebarDropdownGroup } from '@/components/ui';

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

const documentsInboxMenuItems = [
  {
    label: 'Document Intake',
    href: '/accounting/documents-inbox/document-intake',
    isActive: (pathname: string | null) => pathname?.startsWith('/accounting/documents-inbox/document-intake'),
  },
  {
    label: 'Document Library',
    href: '/accounting/documents-inbox/document-library',
    isActive: (pathname: string | null) => pathname?.startsWith('/accounting/documents-inbox/document-library'),
  },
  {
    label: 'Document Governance',
    href: '/accounting/documents-inbox/document-governance',
    isActive: (pathname: string | null) => pathname?.startsWith('/accounting/documents-inbox/document-governance'),
  },
] as const;

const reportsAnalyticsMenuItems = [
  {
    label: 'Financial & Ledger Reporting',
    href: '/accounting/reports-analytics/financial-ledger-reporting',
    isActive: (pathname: string | null) => pathname?.startsWith('/accounting/reports-analytics/financial-ledger-reporting'),
  },
  {
    label: 'Operational Reporting',
    href: '/accounting/reports-analytics/operational-reporting',
    isActive: (pathname: string | null) => pathname?.startsWith('/accounting/reports-analytics/operational-reporting'),
  },
  {
    label: 'Performance & Planning Analytics',
    href: '/accounting/reports-analytics/performance-planning-analytics',
    isActive: (pathname: string | null) =>
      pathname?.startsWith('/accounting/reports-analytics/performance-planning-analytics'),
  },
  {
    label: 'Reporting Operations',
    href: '/accounting/reports-analytics/reporting-operations',
    isActive: (pathname: string | null) => pathname?.startsWith('/accounting/reports-analytics/reporting-operations'),
  },
] as const;

const approvalsMenuItems = [
  {
    label: 'Approval Center',
    href: '/accounting/approvals/approval-center',
    isActive: (pathname: string | null) => pathname?.startsWith('/accounting/approvals/approval-center'),
  },
  {
    label: 'Workflow Management',
    href: '/accounting/approvals/workflow-management',
    isActive: (pathname: string | null) => pathname?.startsWith('/accounting/approvals/workflow-management'),
  },
  {
    label: 'Entity Approval Coverage',
    href: '/accounting/approvals/entity-approval-coverage',
    isActive: (pathname: string | null) => pathname?.startsWith('/accounting/approvals/entity-approval-coverage'),
  },
] as const;

const lmsMonetizationMenuItems = [
  {
    label: 'Course Pricing & Fees',
    href: '/accounting/lms-monetization-setup/course-pricing-fees',
    isActive: (pathname: string | null) => pathname?.startsWith('/accounting/lms-monetization-setup/course-pricing-fees'),
  },
  {
    label: 'Billing Policy Setup',
    href: '/accounting/lms-monetization-setup/billing-policy-setup',
    isActive: (pathname: string | null) => pathname?.startsWith('/accounting/lms-monetization-setup/billing-policy-setup'),
  },
  {
    label: 'Revenue & Discount Mapping',
    href: '/accounting/lms-monetization-setup/revenue-discount-mapping',
    isActive: (pathname: string | null) => pathname?.startsWith('/accounting/lms-monetization-setup/revenue-discount-mapping'),
  },
  {
    label: 'Instructor Payout Setup',
    href: '/accounting/lms-monetization-setup/instructor-payout-setup',
    isActive: (pathname: string | null) => pathname?.startsWith('/accounting/lms-monetization-setup/instructor-payout-setup'),
  },
] as const;

const lmsBillingCollectionsMenuItems = [
  {
    label: 'Enrollment Billing Operations',
    href: '/accounting/lms-billing-collections/enrollment-billing-operations',
    isActive: (pathname: string | null) => pathname?.startsWith('/accounting/lms-billing-collections/enrollment-billing-operations'),
  },
  {
    label: 'Receipt & Payment Review',
    href: '/accounting/lms-billing-collections/receipt-payment-review',
    isActive: (pathname: string | null) => pathname?.startsWith('/accounting/lms-billing-collections/receipt-payment-review'),
  },
  {
    label: 'Sponsor & Corporate Billing',
    href: '/accounting/lms-billing-collections/sponsor-corporate-billing',
    isActive: (pathname: string | null) => pathname?.startsWith('/accounting/lms-billing-collections/sponsor-corporate-billing'),
  },
  {
    label: 'Adjustments & Revenue Carrying',
    href: '/accounting/lms-billing-collections/adjustments-revenue-carrying',
    isActive: (pathname: string | null) => pathname?.startsWith('/accounting/lms-billing-collections/adjustments-revenue-carrying'),
  },
] as const;

const lmsFinanceReportingMenuItems = [
  {
    label: 'Revenue Analysis',
    href: '/accounting/lms-finance-reporting/revenue-analysis',
    isActive: (pathname: string | null) => pathname?.startsWith('/accounting/lms-finance-reporting/revenue-analysis'),
  },
  {
    label: 'Billing Pipeline Monitoring',
    href: '/accounting/lms-finance-reporting/billing-pipeline-monitoring',
    isActive: (pathname: string | null) => pathname?.startsWith('/accounting/lms-finance-reporting/billing-pipeline-monitoring'),
  },
  {
    label: 'Discount & Scholarship Analytics',
    href: '/accounting/lms-finance-reporting/discount-scholarship-analytics',
    isActive: (pathname: string | null) => pathname?.startsWith('/accounting/lms-finance-reporting/discount-scholarship-analytics'),
  },
  {
    label: 'Recognition & Certificate Reporting',
    href: '/accounting/lms-finance-reporting/recognition-certificate-reporting',
    isActive: (pathname: string | null) => pathname?.startsWith('/accounting/lms-finance-reporting/recognition-certificate-reporting'),
  },
] as const;

const projectsTimeMenuItems = [
  {
    label: 'Project Operations',
    href: '/accounting/projects-time/project-operations',
    isActive: (pathname: string | null) => pathname?.startsWith('/accounting/projects-time/project-operations'),
  },
  {
    label: 'Time & Work Tracking',
    href: '/accounting/projects-time/time-work-tracking',
    isActive: (pathname: string | null) => pathname?.startsWith('/accounting/projects-time/time-work-tracking'),
  },
  {
    label: 'Project Finance',
    href: '/accounting/projects-time/project-finance',
    isActive: (pathname: string | null) => pathname?.startsWith('/accounting/projects-time/project-finance'),
  },
] as const;

const budgetsForecastsMenuItems = [
  {
    label: 'Budget Planning',
    href: '/accounting/budgets-forecasts/budget-planning',
    isActive: (pathname: string | null) => pathname?.startsWith('/accounting/budgets-forecasts/budget-planning'),
  },
  {
    label: 'Forecast Modeling',
    href: '/accounting/budgets-forecasts/forecast-modeling',
    isActive: (pathname: string | null) => pathname?.startsWith('/accounting/budgets-forecasts/forecast-modeling'),
  },
  {
    label: 'Budget Monitoring',
    href: '/accounting/budgets-forecasts/budget-monitoring',
    isActive: (pathname: string | null) => pathname?.startsWith('/accounting/budgets-forecasts/budget-monitoring'),
  },
] as const;

const fixedAssetsMenuItems = [
  {
    label: 'Asset Register & Setup',
    href: '/accounting/fixed-assets/asset-register-setup',
    isActive: (pathname: string | null) => pathname?.startsWith('/accounting/fixed-assets/asset-register-setup'),
  },
  {
    label: 'Asset Lifecycle',
    href: '/accounting/fixed-assets/asset-lifecycle',
    isActive: (pathname: string | null) => pathname?.startsWith('/accounting/fixed-assets/asset-lifecycle'),
  },
  {
    label: 'Depreciation & Reporting',
    href: '/accounting/fixed-assets/depreciation-reporting',
    isActive: (pathname: string | null) => pathname?.startsWith('/accounting/fixed-assets/depreciation-reporting'),
  },
] as const;

const payrollContractorFinanceMenuItems = [
  {
    label: 'Payroll Operations',
    href: '/accounting/payroll-contractor-finance/payroll-operations',
    isActive: (pathname: string | null) =>
      pathname?.startsWith('/accounting/payroll-contractor-finance/payroll-operations'),
  },
  {
    label: 'Contractor & Mapping Setup',
    href: '/accounting/payroll-contractor-finance/contractor-mapping-setup',
    isActive: (pathname: string | null) =>
      pathname?.startsWith('/accounting/payroll-contractor-finance/contractor-mapping-setup'),
  },
  {
    label: 'Payroll Reporting',
    href: '/accounting/payroll-contractor-finance/payroll-reporting',
    isActive: (pathname: string | null) =>
      pathname?.startsWith('/accounting/payroll-contractor-finance/payroll-reporting'),
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

function renderSidebarChildLink(
  item: {
    label: string;
    href: string;
    isActive: (pathname: string | null) => boolean | undefined;
  },
  pathname: string | null,
) {
  return (
    <div key={item.href}>
      <Link
        href={item.href}
        className={`flex w-full items-center rounded-lg px-3 py-2 text-sm transition-colors ${
          item.isActive(pathname)
            ? 'bg-gray-100 font-medium text-gray-900'
            : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
        }`}
      >
        <span className="truncate">{item.label}</span>
      </Link>
    </div>
  );
}

function renderSidebarNavItem(
  item: {
    icon: IconName;
    label: string;
    href: string;
    isActive: (pathname: string | null) => boolean | undefined;
  },
  pathname: string | null,
  isOpen: boolean,
) {
  return (
    <div key={item.href}>
      <SidebarItem
        icon={item.icon}
        label={item.label}
        active={item.isActive(pathname)}
        collapsed={!isOpen}
        href={item.href}
      />
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
  const hasActiveDocumentsInboxChild = documentsInboxMenuItems.some((item) => item.isActive(pathname));
  const hasActiveReportsAnalyticsChild = reportsAnalyticsMenuItems.some((item) => item.isActive(pathname));
  const hasActiveApprovalsChild = approvalsMenuItems.some((item) => item.isActive(pathname));
  const hasActiveLmsMonetizationChild = lmsMonetizationMenuItems.some((item) => item.isActive(pathname));
  const hasActiveLmsBillingCollectionsChild = lmsBillingCollectionsMenuItems.some((item) => item.isActive(pathname));
  const hasActiveLmsFinanceReportingChild = lmsFinanceReportingMenuItems.some((item) => item.isActive(pathname));
  const hasActiveProjectsTimeChild = projectsTimeMenuItems.some((item) => item.isActive(pathname));
  const hasActiveBudgetsForecastsChild = budgetsForecastsMenuItems.some((item) => item.isActive(pathname));
  const hasActiveFixedAssetsChild = fixedAssetsMenuItems.some((item) => item.isActive(pathname));
  const hasActivePayrollContractorFinanceChild = payrollContractorFinanceMenuItems.some((item) =>
    item.isActive(pathname),
  );
  const [isSetupControlsExpanded, setIsSetupControlsExpanded] = React.useState(hasActiveSetupControlsChild);
  const [isMasterRecordsExpanded, setIsMasterRecordsExpanded] = React.useState(hasActiveMasterRecordsChild);
  const [isJournalsLedgerExpanded, setIsJournalsLedgerExpanded] = React.useState(hasActiveJournalsLedgerChild);
  const [isTaxComplianceExpanded, setIsTaxComplianceExpanded] = React.useState(hasActiveTaxComplianceChild);
  const [isAuditHistoryExpanded, setIsAuditHistoryExpanded] = React.useState(hasActiveAuditHistoryChild);
  const [isSalesReceivablesExpanded, setIsSalesReceivablesExpanded] = React.useState(hasActiveSalesReceivablesChild);
  const [isPurchasesPayablesExpanded, setIsPurchasesPayablesExpanded] = React.useState(hasActivePurchasesPayablesChild);
  const [isExpensesExpanded, setIsExpensesExpanded] = React.useState(hasActiveExpensesChild);
  const [isBankingCashExpanded, setIsBankingCashExpanded] = React.useState(hasActiveBankingCashChild);
  const [isDocumentsInboxExpanded, setIsDocumentsInboxExpanded] = React.useState(hasActiveDocumentsInboxChild);
  const [isReportsAnalyticsExpanded, setIsReportsAnalyticsExpanded] = React.useState(hasActiveReportsAnalyticsChild);
  const [isApprovalsExpanded, setIsApprovalsExpanded] = React.useState(hasActiveApprovalsChild);
  const [isLmsMonetizationExpanded, setIsLmsMonetizationExpanded] = React.useState(hasActiveLmsMonetizationChild);
  const [isLmsBillingCollectionsExpanded, setIsLmsBillingCollectionsExpanded] = React.useState(hasActiveLmsBillingCollectionsChild);
  const [isLmsFinanceReportingExpanded, setIsLmsFinanceReportingExpanded] = React.useState(hasActiveLmsFinanceReportingChild);
  const [isProjectsTimeExpanded, setIsProjectsTimeExpanded] = React.useState(hasActiveProjectsTimeChild);
  const [isBudgetsForecastsExpanded, setIsBudgetsForecastsExpanded] = React.useState(hasActiveBudgetsForecastsChild);
  const [isFixedAssetsExpanded, setIsFixedAssetsExpanded] = React.useState(hasActiveFixedAssetsChild);
  const [isPayrollContractorFinanceExpanded, setIsPayrollContractorFinanceExpanded] = React.useState(
    hasActivePayrollContractorFinanceChild,
  );

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

  React.useEffect(() => {
    if (hasActiveDocumentsInboxChild) {
      setIsDocumentsInboxExpanded(true);
    }
  }, [hasActiveDocumentsInboxChild]);

  React.useEffect(() => {
    if (hasActiveReportsAnalyticsChild) {
      setIsReportsAnalyticsExpanded(true);
    }
  }, [hasActiveReportsAnalyticsChild]);

  React.useEffect(() => {
    if (hasActiveApprovalsChild) {
      setIsApprovalsExpanded(true);
    }
  }, [hasActiveApprovalsChild]);

  React.useEffect(() => {
    if (hasActiveLmsMonetizationChild) {
      setIsLmsMonetizationExpanded(true);
    }
  }, [hasActiveLmsMonetizationChild]);

  React.useEffect(() => {
    if (hasActiveLmsBillingCollectionsChild) {
      setIsLmsBillingCollectionsExpanded(true);
    }
  }, [hasActiveLmsBillingCollectionsChild]);

  React.useEffect(() => {
    if (hasActiveLmsFinanceReportingChild) {
      setIsLmsFinanceReportingExpanded(true);
    }
  }, [hasActiveLmsFinanceReportingChild]);

  React.useEffect(() => {
    if (hasActiveProjectsTimeChild) {
      setIsProjectsTimeExpanded(true);
    }
  }, [hasActiveProjectsTimeChild]);

  React.useEffect(() => {
    if (hasActiveBudgetsForecastsChild) {
      setIsBudgetsForecastsExpanded(true);
    }
  }, [hasActiveBudgetsForecastsChild]);

  React.useEffect(() => {
    if (hasActiveFixedAssetsChild) {
      setIsFixedAssetsExpanded(true);
    }
  }, [hasActiveFixedAssetsChild]);

  React.useEffect(() => {
    if (hasActivePayrollContractorFinanceChild) {
      setIsPayrollContractorFinanceExpanded(true);
    }
  }, [hasActivePayrollContractorFinanceChild]);

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
              {setupControlsMenuItems.map((item) => renderSidebarChildLink(item, pathname))}
            </SidebarDropdownGroup>
            <SidebarDropdownGroup
              icon="storage"
              label="Master Records"
              isOpen={isOpen}
              isExpanded={isMasterRecordsExpanded}
              onToggle={() => setIsMasterRecordsExpanded((current) => !current)}
              active={hasActiveMasterRecordsChild}
            >
              {masterRecordsMenuItems.map((item) => renderSidebarChildLink(item, pathname))}
            </SidebarDropdownGroup>
            <SidebarDropdownGroup
              icon="report"
              label="Journals & Ledger"
              isOpen={isOpen}
              isExpanded={isJournalsLedgerExpanded}
              onToggle={() => setIsJournalsLedgerExpanded((current) => !current)}
              active={hasActiveJournalsLedgerChild}
            >
              {journalsLedgerMenuItems.map((item) => renderSidebarChildLink(item, pathname))}
            </SidebarDropdownGroup>
            <SidebarDropdownGroup
              icon="billing"
              label="Tax & Compliance"
              isOpen={isOpen}
              isExpanded={isTaxComplianceExpanded}
              onToggle={() => setIsTaxComplianceExpanded((current) => !current)}
              active={hasActiveTaxComplianceChild}
            >
              {taxComplianceMenuItems.map((item) => renderSidebarChildLink(item, pathname))}
            </SidebarDropdownGroup>
            <SidebarDropdownGroup
              icon="audit"
              label="Audit & History"
              isOpen={isOpen}
              isExpanded={isAuditHistoryExpanded}
              onToggle={() => setIsAuditHistoryExpanded((current) => !current)}
              active={hasActiveAuditHistoryChild}
            >
              {auditHistoryMenuItems.map((item) => renderSidebarChildLink(item, pathname))}
            </SidebarDropdownGroup>
            {coreMenuItems.slice(1).map((item) => renderSidebarNavItem(item, pathname, isOpen))}
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
              {salesReceivablesMenuItems.map((item) => renderSidebarChildLink(item, pathname))}
            </SidebarDropdownGroup>
            <SidebarDropdownGroup
              icon="billing"
              label="Purchases & Payables"
              isOpen={isOpen}
              isExpanded={isPurchasesPayablesExpanded}
              onToggle={() => setIsPurchasesPayablesExpanded((current) => !current)}
              active={hasActivePurchasesPayablesChild}
            >
              {purchasesPayablesMenuItems.map((item) => renderSidebarChildLink(item, pathname))}
            </SidebarDropdownGroup>
            <SidebarDropdownGroup
              icon="payments"
              label="Expenses"
              isOpen={isOpen}
              isExpanded={isExpensesExpanded}
              onToggle={() => setIsExpensesExpanded((current) => !current)}
              active={hasActiveExpensesChild}
            >
              {expensesMenuItems.map((item) => renderSidebarChildLink(item, pathname))}
            </SidebarDropdownGroup>
            <SidebarDropdownGroup
              icon="bank"
              label="Banking & Cash"
              isOpen={isOpen}
              isExpanded={isBankingCashExpanded}
              onToggle={() => setIsBankingCashExpanded((current) => !current)}
              active={hasActiveBankingCashChild}
            >
              {bankingCashMenuItems.map((item) => renderSidebarChildLink(item, pathname))}
            </SidebarDropdownGroup>
            <SidebarDropdownGroup
              icon="posts"
              label="Documents & Inbox"
              isOpen={isOpen}
              isExpanded={isDocumentsInboxExpanded}
              onToggle={() => setIsDocumentsInboxExpanded((current) => !current)}
              active={hasActiveDocumentsInboxChild}
            >
              {documentsInboxMenuItems.map((item) => renderSidebarChildLink(item, pathname))}
            </SidebarDropdownGroup>
            <SidebarDropdownGroup
              icon="analytics"
              label="Reports & Analytics"
              isOpen={isOpen}
              isExpanded={isReportsAnalyticsExpanded}
              onToggle={() => setIsReportsAnalyticsExpanded((current) => !current)}
              active={hasActiveReportsAnalyticsChild}
            >
              {reportsAnalyticsMenuItems.map((item) => renderSidebarChildLink(item, pathname))}
            </SidebarDropdownGroup>
            <SidebarDropdownGroup
              icon="permissions"
              label="Approvals"
              isOpen={isOpen}
              isExpanded={isApprovalsExpanded}
              onToggle={() => setIsApprovalsExpanded((current) => !current)}
              active={hasActiveApprovalsChild}
            >
              {approvalsMenuItems.map((item) => renderSidebarChildLink(item, pathname))}
            </SidebarDropdownGroup>
          </div>

          {isOpen && <hr className="border-gray-200" />}

          <div className="space-y-1">
            <SidebarSectionLabel isOpen={isOpen}>LMS Finance</SidebarSectionLabel>
            <SidebarDropdownGroup
              icon="pricing"
              label="LMS Monetization Setup"
              isOpen={isOpen}
              isExpanded={isLmsMonetizationExpanded}
              onToggle={() => setIsLmsMonetizationExpanded((current) => !current)}
              active={hasActiveLmsMonetizationChild}
            >
              {lmsMonetizationMenuItems.map((item) => renderSidebarChildLink(item, pathname))}
            </SidebarDropdownGroup>
            <SidebarDropdownGroup
              icon="billing"
              label="LMS Billing & Collections"
              isOpen={isOpen}
              isExpanded={isLmsBillingCollectionsExpanded}
              onToggle={() => setIsLmsBillingCollectionsExpanded((current) => !current)}
              active={hasActiveLmsBillingCollectionsChild}
            >
              {lmsBillingCollectionsMenuItems.map((item) => renderSidebarChildLink(item, pathname))}
            </SidebarDropdownGroup>
            <SidebarDropdownGroup
              icon="analytics"
              label="LMS Finance Reporting"
              isOpen={isOpen}
              isExpanded={isLmsFinanceReportingExpanded}
              onToggle={() => setIsLmsFinanceReportingExpanded((current) => !current)}
              active={hasActiveLmsFinanceReportingChild}
            >
              {lmsFinanceReportingMenuItems.map((item) => renderSidebarChildLink(item, pathname))}
            </SidebarDropdownGroup>
          </div>

          {isOpen && <hr className="border-gray-200" />}

          <div className="space-y-1">
            <SidebarSectionLabel isOpen={isOpen}>Advanced Finance</SidebarSectionLabel>
            <SidebarDropdownGroup
              icon="team"
              label="Projects & Time"
              isOpen={isOpen}
              isExpanded={isProjectsTimeExpanded}
              onToggle={() => setIsProjectsTimeExpanded((current) => !current)}
              active={hasActiveProjectsTimeChild}
            >
              {projectsTimeMenuItems.map((item) => renderSidebarChildLink(item, pathname))}
            </SidebarDropdownGroup>
            <SidebarDropdownGroup
              icon="report"
              label="Budgets & Forecasts"
              isOpen={isOpen}
              isExpanded={isBudgetsForecastsExpanded}
              onToggle={() => setIsBudgetsForecastsExpanded((current) => !current)}
              active={hasActiveBudgetsForecastsChild}
            >
              {budgetsForecastsMenuItems.map((item) => renderSidebarChildLink(item, pathname))}
            </SidebarDropdownGroup>
            <SidebarDropdownGroup
              icon="bank"
              label="Fixed Assets"
              isOpen={isOpen}
              isExpanded={isFixedAssetsExpanded}
              onToggle={() => setIsFixedAssetsExpanded((current) => !current)}
              active={hasActiveFixedAssetsChild}
            >
              {fixedAssetsMenuItems.map((item) => renderSidebarChildLink(item, pathname))}
            </SidebarDropdownGroup>
            <SidebarDropdownGroup
              icon="payout"
              label="Payroll & Contractor Finance"
              isOpen={isOpen}
              isExpanded={isPayrollContractorFinanceExpanded}
              onToggle={() => setIsPayrollContractorFinanceExpanded((current) => !current)}
              active={hasActivePayrollContractorFinanceChild}
            >
              {payrollContractorFinanceMenuItems.map((item) => renderSidebarChildLink(item, pathname))}
            </SidebarDropdownGroup>
          </div>
        </nav>
      </div>
    </aside>
  );
}
