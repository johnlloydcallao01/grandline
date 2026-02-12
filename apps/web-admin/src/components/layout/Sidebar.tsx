'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import { SidebarProps } from '@/types';
import { SidebarItem } from '@/components/ui';

/**
 * Sidebar component with navigation items for Admin Panel
 * Restructured to match the 12-section hierarchy
 */
export function Sidebar({ isOpen, onToggle: _onToggle, onScroll }: SidebarProps) {
    const pathname = usePathname();

    return (
        <aside
            data-sidebar="admin"
            className={`fixed left-0 bg-white border-r border-gray-200 transition-all duration-300 overflow-y-auto z-40 hidden lg:block ${isOpen
                ? 'w-60 translate-x-0'
                : 'w-20 translate-x-0'
                }`}
            style={{
                height: 'calc(100vh - 4rem)', // 4rem is header height
                top: '4rem', // Position below header
                scrollbarWidth: 'thin',
                scrollbarColor: '#cbd5e1 transparent'
            }}
            onScroll={onScroll}
        >
            <div className="p-3 pb-20"> {/* pb-20 for extra scroll space */}
                <nav className="space-y-4">

                    {/* 1. DASHBOARD & ANALYTICS */}
                    <div className="space-y-1">
                        {isOpen && <div className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">Dashboard & Analytics</div>}
                        <SidebarItem
                            icon="overview"
                            label="Overview"
                            active={pathname === '/' || pathname === '/dashboard'}
                            collapsed={!isOpen}
                            href="/dashboard"
                        />
                        <SidebarItem
                            icon="report"
                            label="Reports"
                            active={pathname?.startsWith('/reports')}
                            collapsed={!isOpen}
                            href="/reports"
                        />
                    </div>



                    {/* 3. TRAINEES */}
                    <div className="space-y-1">
                        {isOpen && <div className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">Trainees</div>}
                        <SidebarItem
                            icon="trainee"
                            label="Trainee Accounts"
                            active={pathname?.startsWith('/trainees/accounts')}
                            collapsed={!isOpen}
                            href="/trainees/accounts"
                        />
                        <SidebarItem
                            icon="analytics"
                            label="Trainee Progress"
                            active={pathname?.startsWith('/trainees/progress')}
                            collapsed={!isOpen}
                            href="/trainees/progress"
                        />
                    </div>

                    {isOpen && <hr className="border-gray-200" />}

                    {/* 3. COURSE MANAGEMENT */}
                    <div className="space-y-1">
                        {isOpen && <div className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">Course Management</div>}
                        <SidebarItem
                            icon="content"
                            label="Course Categories"
                            active={pathname?.startsWith('/categories')}
                            collapsed={!isOpen}
                            href="/categories"
                        />
                        <SidebarItem
                            icon="posts" // Placeholder icon
                            label="Course Builder"
                            active={pathname?.startsWith('/courses/builder')}
                            collapsed={!isOpen}
                            href="/courses/builder"
                        />
                        <SidebarItem
                            icon="products"
                            label="Courses"
                            active={pathname === '/courses' || (pathname?.startsWith('/courses') && !pathname?.startsWith('/courses/builder'))}
                            collapsed={!isOpen}
                            href="/courses"
                        />
                        <SidebarItem
                            icon="team"
                            label="Enrollments"
                            active={pathname?.startsWith('/enrollments')}
                            collapsed={!isOpen}
                            href="/enrollments"
                        />
                        <SidebarItem
                            icon="grade"
                            label="Assessments"
                            active={pathname?.startsWith('/assessments')}
                            collapsed={!isOpen}
                            href="/assessments"
                        />
                        <SidebarItem
                            icon="bank"
                            label="Question Bank"
                            active={pathname?.startsWith('/question-bank')}
                            collapsed={!isOpen}
                            href="/question-bank"
                        />
                    </div>

                    {isOpen && <hr className="border-gray-200" />}

                    {/* 4. MEDIA LIBRARY */}
                    <div className="space-y-1">
                        {isOpen && <div className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">Media Library</div>}
                        <SidebarItem
                            icon="media"
                            label="All Media"
                            active={pathname?.startsWith('/media')}
                            collapsed={!isOpen}
                            href="/media"
                        />
                        <SidebarItem
                            icon="storage"
                            label="Storage Settings"
                            active={pathname?.startsWith('/media/settings')}
                            collapsed={!isOpen}
                            href="/media/settings"
                        />
                    </div>

                    {isOpen && <hr className="border-gray-200" />}

                    {/* 5. GRADEBOOK */}
                    <div className="space-y-1">
                        {isOpen && <div className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">Gradebook</div>}
                        <SidebarItem
                            icon="grade"
                            label="Grade Management"
                            active={pathname === '/grades'}
                            collapsed={!isOpen}
                            href="/grades"
                        />
                        <SidebarItem
                            icon="report"
                            label="Grade Reports"
                            active={pathname?.startsWith('/grades/reports')}
                            collapsed={!isOpen}
                            href="/grades/reports"
                        />
                    </div>

                    {isOpen && <hr className="border-gray-200" />}

                    {/* 6. CERTIFICATIONS */}
                    <div className="space-y-1">
                        {isOpen && <div className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">Certifications</div>}
                        <SidebarItem
                            icon="certificate"
                            label="Certificate Builder"
                            active={pathname?.startsWith('/certifications/builder')}
                            collapsed={!isOpen}
                            href="/certifications/builder"
                        />
                        <SidebarItem
                            icon="template"
                            label="Certificate Templates"
                            active={pathname?.startsWith('/certifications/templates')}
                            collapsed={!isOpen}
                            href="/certifications/templates"
                        />
                        <SidebarItem
                            icon="issuance"
                            label="Certificate Issuance"
                            active={pathname?.startsWith('/certifications/issuance')}
                            collapsed={!isOpen}
                            href="/certifications/issuance"
                        />
                        <SidebarItem
                            icon="verification"
                            label="Certificate Verification"
                            active={pathname?.startsWith('/certifications/verification')}
                            collapsed={!isOpen}
                            href="/certifications/verification"
                        />
                    </div>

                    {isOpen && <hr className="border-gray-200" />}

                    {/* 7. COMMUNICATIONS */}
                    <div className="space-y-1">
                        {isOpen && <div className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">Communications</div>}
                        <SidebarItem
                            icon="notifications"
                            label="Notifications"
                            active={pathname?.startsWith('/notifications')}
                            collapsed={!isOpen}
                            href="/notifications"
                        />
                        <SidebarItem
                            icon="announcement"
                            label="Announcements"
                            active={pathname?.startsWith('/announcements')}
                            collapsed={!isOpen}
                            href="/announcements"
                        />
                        <SidebarItem
                            icon="review"
                            label="Feedback & Reviews"
                            active={pathname?.startsWith('/reviews')}
                            collapsed={!isOpen}
                            href="/reviews"
                        />
                    </div>

                    {isOpen && <hr className="border-gray-200" />}

                    {/* 8. ACCOUNTING */}
                    <div className="space-y-1">
                        {isOpen && <div className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">Accounting</div>}
                        <SidebarItem
                            icon="audit"
                            label="Chart of Accounts"
                            active={pathname?.startsWith('/accounting/chart')}
                            collapsed={!isOpen}
                            href="/accounting/chart"
                        />
                        <SidebarItem
                            icon="transaction"
                            label="Transactions"
                            active={pathname?.startsWith('/accounting/transactions')}
                            collapsed={!isOpen}
                            href="/accounting/transactions"
                        />
                        <SidebarItem
                            icon="invoice"
                            label="Invoicing"
                            active={pathname?.startsWith('/accounting/invoices')}
                            collapsed={!isOpen}
                            href="/accounting/invoices"
                        />
                        <SidebarItem
                            icon="payments"
                            label="Payments & Receipts"
                            active={pathname?.startsWith('/accounting/payments')}
                            collapsed={!isOpen}
                            href="/accounting/payments"
                        />
                        <SidebarItem
                            icon="pricing"
                            label="Pricing Management"
                            active={pathname?.startsWith('/accounting/pricing')}
                            collapsed={!isOpen}
                            href="/accounting/pricing"
                        />
                        <SidebarItem
                            icon="payout"
                            label="Payouts"
                            active={pathname?.startsWith('/accounting/payouts')}
                            collapsed={!isOpen}
                            href="/accounting/payouts"
                        />
                        <SidebarItem
                            icon="report"
                            label="Financial Reports"
                            active={pathname?.startsWith('/accounting/reports')}
                            collapsed={!isOpen}
                            href="/accounting/reports"
                        />
                        <SidebarItem
                            icon="bank"
                            label="Banking"
                            active={pathname?.startsWith('/accounting/banking')}
                            collapsed={!isOpen}
                            href="/accounting/banking"
                        />
                    </div>

                    {isOpen && <hr className="border-gray-200" />}

                    {/* 9. MARKETING */}
                    <div className="space-y-1">
                        {isOpen && <div className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">Marketing</div>}
                        <SidebarItem
                            icon="promotion"
                            label="Promotions"
                            active={pathname?.startsWith('/marketing/promotions')}
                            collapsed={!isOpen}
                            href="/marketing/promotions"
                        />
                        <SidebarItem
                            icon="content"
                            label="Content"
                            active={pathname?.startsWith('/marketing/content')}
                            collapsed={!isOpen}
                            href="/marketing/content"
                        />
                    </div>

                    {isOpen && <hr className="border-gray-200" />}

                    {/* 10. SYSTEM SETTINGS */}
                    <div className="space-y-1">
                        {isOpen && <div className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">System Settings</div>}
                        <SidebarItem
                            icon="settings"
                            label="General Settings"
                            active={pathname === '/settings'}
                            collapsed={!isOpen}
                            href="/settings"
                        />
                        <SidebarItem
                            icon="users"
                            label="Users"
                            active={pathname?.startsWith('/users')}
                            collapsed={!isOpen}
                            href="/users"
                        />
                        <SidebarItem
                            icon="security"
                            label="Security"
                            active={pathname?.startsWith('/settings/security')}
                            collapsed={!isOpen}
                            href="/settings/security"
                        />
                        <SidebarItem
                            icon="integrations"
                            label="Integrations"
                            active={pathname?.startsWith('/settings/integrations')}
                            collapsed={!isOpen}
                            href="/settings/integrations"
                        />
                    </div>

                    {isOpen && <hr className="border-gray-200" />}

                    {/* 11. INSTRUCTOR MANAGEMENT */}
                    <div className="space-y-1">
                        {isOpen && <div className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">Instructor Mgmt</div>}
                        <SidebarItem
                            icon="instructor"
                            label="Instructors"
                            active={pathname === '/instructors'}
                            collapsed={!isOpen}
                            href="/instructors"
                        />
                        <SidebarItem
                            icon="payout"
                            label="Payouts"
                            active={pathname === '/instructors/payouts'}
                            collapsed={!isOpen}
                            href="/instructors/payouts"
                        />
                    </div>

                    {isOpen && <hr className="border-gray-200" />}

                    {/* 12. SUPPORT */}
                    <div className="space-y-1">
                        {isOpen && <div className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">Support</div>}
                        <SidebarItem
                            icon="help"
                            label="Help Desk"
                            active={pathname?.startsWith('/support/help')}
                            collapsed={!isOpen}
                            href="/support/help"
                        />
                        <SidebarItem
                            icon="support"
                            label="Documentation"
                            active={pathname?.startsWith('/support/docs')}
                            collapsed={!isOpen}
                            href="/support/docs"
                        />
                    </div>

                </nav>
            </div>
        </aside>
    );
}
