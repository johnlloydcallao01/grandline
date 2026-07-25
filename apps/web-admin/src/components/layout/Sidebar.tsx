'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import { SidebarProps } from '@/types';
import { SidebarItem, SidebarDropdownGroup } from '@/components/ui';
import Link from '@/components/ui/LinkWrapper';
import { useMediaQuery } from '@/hooks';

/**
 * Sidebar component with navigation items for Admin Panel
 * Restructured to match the 12-section hierarchy
 *
 * Responsive behavior:
 * - Mobile (<lg): behaves as a slide-in drawer. `mobileOpen` controls visibility
 *   (translate-x-0 when open, -translate-x-full when closed). A backdrop overlay
 *   is rendered behind it. Always full-width (w-64) on mobile.
 * - Desktop (lg+): always visible, collapsible between w-60 (expanded) and w-20
 *   (collapsed) based on `isOpen`.
 */
export function Sidebar({ isOpen, onToggle: _onToggle, onScroll, mobileOpen = false, onCloseMobile }: SidebarProps & { mobileOpen?: boolean; onCloseMobile?: () => void }) {
    const pathname = usePathname();
    const isDesktop = useMediaQuery('(min-width: 1024px)');

    // On mobile the drawer should always render expanded (labels visible).
    // On desktop, honor the collapse state.
    const expanded = isDesktop ? isOpen : true;

    const [isEnrollmentsExpanded, setIsEnrollmentsExpanded] = React.useState(
        pathname?.startsWith('/enrollments') ?? false
    );

    const [isSubmissionsExpanded, setIsSubmissionsExpanded] = React.useState(
        pathname?.startsWith('/submissions') ?? false
    );

    const hasActiveCourseManagerChild =
        pathname?.startsWith('/courses');

    const [isCourseManagerExpanded, setIsCourseManagerExpanded] = React.useState(hasActiveCourseManagerChild);

    const hasActiveGradebookChild =
        pathname?.startsWith('/grades/recent-activity') ||
        pathname?.startsWith('/trainees/accounts');

    const [isGradebookExpanded, setIsGradebookExpanded] = React.useState(hasActiveGradebookChild);

    const hasActiveCertificationChild =
        pathname?.startsWith('/certifications/templates') ||
        pathname?.startsWith('/certifications/builder') ||
        pathname?.startsWith('/certifications/issuance') ||
        pathname?.startsWith('/certifications/verification');

    const [isCertificationExpanded, setIsCertificationExpanded] = React.useState(hasActiveCertificationChild);

    const hasActiveCmsBlogPostsChild =
        pathname?.startsWith('/cms/posts');

    const [isCmsBlogPostsExpanded, setIsCmsBlogPostsExpanded] = React.useState(hasActiveCmsBlogPostsChild);

    React.useEffect(() => {
        if (pathname?.startsWith('/enrollments')) {
            setIsEnrollmentsExpanded(true);
        }
    }, [pathname]);

    React.useEffect(() => {
        if (hasActiveCourseManagerChild) {
            setIsCourseManagerExpanded(true);
        }
    }, [hasActiveCourseManagerChild]);

    React.useEffect(() => {
        if (hasActiveGradebookChild) {
            setIsGradebookExpanded(true);
        }
    }, [hasActiveGradebookChild]);

    React.useEffect(() => {
        if (hasActiveCertificationChild) {
            setIsCertificationExpanded(true);
        }
    }, [hasActiveCertificationChild]);

    React.useEffect(() => {
        if (hasActiveCmsBlogPostsChild) {
            setIsCmsBlogPostsExpanded(true);
        }
    }, [hasActiveCmsBlogPostsChild]);

    return (
        <>
        {/* Mobile backdrop overlay - only visible on small screens when drawer is open */}
        {mobileOpen && (
            <div
                className="fixed inset-x-0 top-[56px] bottom-0 bg-black/50 z-40 lg:hidden"
                onClick={onCloseMobile}
                aria-hidden="true"
            />
        )}
        <aside
            data-sidebar="admin"
            className={`fixed left-0 top-[56px] lg:top-16 bg-[var(--card-background)] border-r border-[var(--card-border)] transition-all duration-300 overflow-y-auto z-50 lg:z-40
                // Mobile drawer: full-width, slides in/out, starts right below header
                w-64 h-[calc(100vh-56px)] lg:h-[calc(100vh-4rem)] ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}
                // Desktop: always visible, collapsible width
                lg:translate-x-0 ${isOpen ? 'lg:w-60' : 'lg:w-20'}`}
            onScroll={onScroll}
        >
            <div className="p-3 pb-20"> {/* pb-20 for extra scroll space */}
                <nav className="space-y-4">

                    {/* 1. DASHBOARD & ANALYTICS */}
                    <div className="space-y-1">
                        {expanded && <div className="px-3 py-2 text-xs font-semibold text-gray-900 dark:text-gray-100">Dashboard & Analytics</div>}
                        <SidebarItem
                            icon="overview"
                            label="Overview"
                            active={pathname === '/' || pathname === '/dashboard'}
                            collapsed={!expanded}
                            href="/dashboard"
                        />
                        <SidebarItem
                            icon="report"
                            label="Reports"
                            active={pathname?.startsWith('/reports')}
                            collapsed={!expanded}
                            href="/reports"
                        />
                    </div>

                    {expanded && <hr className="border-gray-200 dark:border-[var(--card-border)]" />}

                    {/* 2. COURSE MANAGEMENT */}
                    <div className="space-y-1">
                        {expanded && <div className="px-3 py-2 text-xs font-semibold text-gray-900 dark:text-gray-100">Core LMS</div>}
                        <SidebarDropdownGroup
                            icon="team"
                            label="Enrollments"
                            isOpen={expanded}
                            isExpanded={isEnrollmentsExpanded}
                            onToggle={() => setIsEnrollmentsExpanded((current) => !current)}
                            active={pathname?.startsWith('/enrollments') ?? false}
                        >
                            <Link
                                href="/enrollments/assign-unassign"
                                className={`flex w-full items-center rounded-lg px-3 py-2 text-sm transition-colors ${pathname?.startsWith('/enrollments/assign-unassign')
                                    ? 'bg-gray-100 font-medium text-gray-900 dark:bg-gray-800 dark:text-gray-100'
                                    : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-gray-100'
                                    }`}
                            >
                                <span className="truncate">Assign / Unassign</span>
                            </Link>
                            <Link
                                href="/enrollments/reset-course-data"
                                className={`flex w-full items-center rounded-lg px-3 py-2 text-sm transition-colors ${pathname?.startsWith('/enrollments/reset-course-data')
                                    ? 'bg-gray-100 font-medium text-gray-900 dark:bg-gray-800 dark:text-gray-100'
                                    : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-gray-100'
                                    }`}
                            >
                                <span className="truncate">Reset Course Data</span>
                            </Link>
                        </SidebarDropdownGroup>
                        <SidebarDropdownGroup
                            icon="grade"
                            label="Submissions"
                            isOpen={expanded}
                            isExpanded={isSubmissionsExpanded}
                            onToggle={() => setIsSubmissionsExpanded((current) => !current)}
                            active={pathname?.startsWith('/submissions') ?? false}
                        >
                            <Link
                                href="/submissions/assessments"
                                className={`flex w-full items-center rounded-lg px-3 py-2 text-sm transition-colors ${pathname?.startsWith('/submissions/assessments')
                                    ? 'bg-gray-100 font-medium text-gray-900 dark:bg-gray-800 dark:text-gray-100'
                                    : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-gray-100'
                                    }`}
                            >
                                <span className="truncate">Assessments</span>
                            </Link>
                            <Link
                                href="/submissions/assignments"
                                className={`flex w-full items-center rounded-lg px-3 py-2 text-sm transition-colors ${pathname?.startsWith('/submissions/assignments')
                                    ? 'bg-gray-100 font-medium text-gray-900 dark:bg-gray-800 dark:text-gray-100'
                                    : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-gray-100'
                                    }`}
                            >
                                <span className="truncate">Assignments</span>
                            </Link>
                            <Link
                                href="/submissions/feedbacks"
                                className={`flex w-full items-center rounded-lg px-3 py-2 text-sm transition-colors ${pathname?.startsWith('/submissions/feedbacks')
                                    ? 'bg-gray-100 font-medium text-gray-900 dark:bg-gray-800 dark:text-gray-100'
                                    : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-gray-100'
                                    }`}
                            >
                                <span className="truncate">Feedbacks</span>
                            </Link>
                        </SidebarDropdownGroup>
                        <SidebarDropdownGroup
                            icon="products"
                            label="Course Manager"
                            isOpen={expanded}
                            isExpanded={isCourseManagerExpanded}
                            onToggle={() => setIsCourseManagerExpanded((current) => !current)}
                            active={hasActiveCourseManagerChild}
                        >
                            <Link
                                href="/courses"
                                className={`flex w-full items-center rounded-lg px-3 py-2 text-sm transition-colors ${pathname === '/courses' || (pathname?.startsWith('/courses') && !pathname?.startsWith('/courses/lessons') && !pathname?.startsWith('/courses/assessments') && !pathname?.startsWith('/courses/questions') && !pathname?.startsWith('/courses/assignments') && !pathname?.startsWith('/courses/tags'))
                                    ? 'bg-gray-100 font-medium text-gray-900 dark:bg-gray-800 dark:text-gray-100'
                                    : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-gray-100'
                                    }`}
                            >
                                <span className="truncate">Courses</span>
                            </Link>
                            <Link
                                href="/courses/lessons"
                                className={`flex w-full items-center rounded-lg px-3 py-2 text-sm transition-colors ${pathname?.startsWith('/courses/lessons')
                                    ? 'bg-gray-100 font-medium text-gray-900 dark:bg-gray-800 dark:text-gray-100'
                                    : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-gray-100'
                                    }`}
                            >
                                <span className="truncate">Lessons</span>
                            </Link>
                            <Link
                                href="/courses/assessments"
                                className={`flex w-full items-center rounded-lg px-3 py-2 text-sm transition-colors ${pathname?.startsWith('/courses/assessments')
                                    ? 'bg-gray-100 font-medium text-gray-900 dark:bg-gray-800 dark:text-gray-100'
                                    : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-gray-100'
                                    }`}
                            >
                                <span className="truncate">Assessments</span>
                            </Link>
                            <Link
                                href="/courses/questions"
                                className={`flex w-full items-center rounded-lg px-3 py-2 text-sm transition-colors ${pathname?.startsWith('/courses/questions')
                                    ? 'bg-gray-100 font-medium text-gray-900 dark:bg-gray-800 dark:text-gray-100'
                                    : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-gray-100'
                                    }`}
                            >
                                <span className="truncate">Questions</span>
                            </Link>
                            <Link
                                href="/courses/assignments"
                                className={`flex w-full items-center rounded-lg px-3 py-2 text-sm transition-colors ${pathname?.startsWith('/courses/assignments')
                                    ? 'bg-gray-100 font-medium text-gray-900 dark:bg-gray-800 dark:text-gray-100'
                                    : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-gray-100'
                                    }`}
                            >
                                <span className="truncate">Assignments</span>
                            </Link>
                            <Link
                                href="/courses/categories"
                                className={`flex w-full items-center rounded-lg px-3 py-2 text-sm transition-colors ${pathname?.startsWith('/courses/categories')
                                    ? 'bg-gray-100 font-medium text-gray-900 dark:bg-gray-800 dark:text-gray-100'
                                    : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-gray-100'
                                    }`}
                            >
                                <span className="truncate">Categories</span>
                            </Link>
                            <Link
                                href="/courses/tags"
                                className={`flex w-full items-center rounded-lg px-3 py-2 text-sm transition-colors ${pathname?.startsWith('/courses/tags')
                                    ? 'bg-gray-100 font-medium text-gray-900 dark:bg-gray-800 dark:text-gray-100'
                                    : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-gray-100'
                                    }`}
                            >
                                <span className="truncate">Tags</span>
                            </Link>
                        </SidebarDropdownGroup>
                        <SidebarDropdownGroup
                            icon="grade"
                            label="Gradebook"
                            isOpen={expanded}
                            isExpanded={isGradebookExpanded}
                            onToggle={() => setIsGradebookExpanded((current) => !current)}
                            active={hasActiveGradebookChild}
                        >
                            <Link
                                href="/grades/recent-activity"
                                className={`flex w-full items-center rounded-lg px-3 py-2 text-sm transition-colors ${pathname?.startsWith('/grades/recent-activity')
                                    ? 'bg-gray-100 font-medium text-gray-900 dark:bg-gray-800 dark:text-gray-100'
                                    : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-gray-100'
                                    }`}
                            >
                                <span className="truncate">Recent Activity</span>
                            </Link>
                            <Link
                                href="/trainees/accounts"
                                className={`flex w-full items-center rounded-lg px-3 py-2 text-sm transition-colors ${pathname?.startsWith('/trainees/accounts')
                                    ? 'bg-gray-100 font-medium text-gray-900 dark:bg-gray-800 dark:text-gray-100'
                                    : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-gray-100'
                                    }`}
                            >
                                <span className="truncate">Student Overview</span>
                            </Link>
                        </SidebarDropdownGroup>
                        <SidebarDropdownGroup
                            icon="certificate"
                            label="Certification"
                            isOpen={expanded}
                            isExpanded={isCertificationExpanded}
                            onToggle={() => setIsCertificationExpanded((current) => !current)}
                            active={hasActiveCertificationChild}
                        >
                            <Link
                                href="/certifications/templates"
                                className={`flex w-full items-center rounded-lg px-3 py-2 text-sm transition-colors ${pathname?.startsWith('/certifications/templates') || pathname?.startsWith('/certifications/builder')
                                    ? 'bg-gray-100 font-medium text-gray-900 dark:bg-gray-800 dark:text-gray-100'
                                    : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-gray-100'
                                    }`}
                            >
                                <span className="truncate">Templates</span>
                            </Link>
                            <Link
                                href="/certifications/issuance"
                                className={`flex w-full items-center rounded-lg px-3 py-2 text-sm transition-colors ${pathname?.startsWith('/certifications/issuance')
                                    ? 'bg-gray-100 font-medium text-gray-900 dark:bg-gray-800 dark:text-gray-100'
                                    : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-gray-100'
                                    }`}
                            >
                                <span className="truncate">Issuance</span>
                            </Link>
                            <Link
                                href="/certifications/verification"
                                className={`flex w-full items-center rounded-lg px-3 py-2 text-sm transition-colors ${pathname?.startsWith('/certifications/verification')
                                    ? 'bg-gray-100 font-medium text-gray-900 dark:bg-gray-800 dark:text-gray-100'
                                    : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-gray-100'
                                    }`}
                            >
                                <span className="truncate">Verification</span>
                            </Link>
                        </SidebarDropdownGroup>
                        <SidebarItem
                            icon="review"
                            label="Feedback & Reviews"
                            active={pathname?.startsWith('/reviews')}
                            collapsed={!expanded}
                            href="/reviews"
                        />
                        <SidebarItem
                            icon="users"
                            label="Users"
                            active={pathname?.startsWith('/users')}
                            collapsed={!expanded}
                            href="/users"
                        />

                    </div>

                    {expanded && <hr className="border-gray-200 dark:border-[var(--card-border)]" />}

                    {/* 3. CMS */}
                    <div className="space-y-1">
                        {expanded && <div className="px-3 py-2 text-xs font-semibold text-gray-900 dark:text-gray-100">CMS</div>}
                        <SidebarItem
                            icon="media"
                            label="Media Library"
                            active={pathname?.startsWith('/cms/media')}
                            collapsed={!expanded}
                            href="/cms/media"
                        />
                        <SidebarDropdownGroup
                            icon="posts"
                            label="Blog Posts"
                            isOpen={expanded}
                            isExpanded={isCmsBlogPostsExpanded}
                            onToggle={() => setIsCmsBlogPostsExpanded((current) => !current)}
                            active={hasActiveCmsBlogPostsChild}
                        >
                            <Link
                                href="/cms/posts"
                                className={`flex w-full items-center rounded-lg px-3 py-2 text-sm transition-colors ${pathname === '/cms/posts'
                                    ? 'bg-gray-100 font-medium text-gray-900 dark:bg-gray-800 dark:text-gray-100'
                                    : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-gray-100'
                                    }`}
                            >
                                <span className="truncate">All Posts</span>
                            </Link>
                            <Link
                                href="/cms/posts/categories"
                                className={`flex w-full items-center rounded-lg px-3 py-2 text-sm transition-colors ${pathname?.startsWith('/cms/posts/categories')
                                    ? 'bg-gray-100 font-medium text-gray-900 dark:bg-gray-800 dark:text-gray-100'
                                    : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-gray-100'
                                    }`}
                            >
                                <span className="truncate">Categories</span>
                            </Link>
                            <Link
                                href="/cms/posts/tags"
                                className={`flex w-full items-center rounded-lg px-3 py-2 text-sm transition-colors ${pathname?.startsWith('/cms/posts/tags')
                                    ? 'bg-gray-100 font-medium text-gray-900 dark:bg-gray-800 dark:text-gray-100'
                                    : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-gray-100'
                                    }`}
                            >
                                <span className="truncate">Tags</span>
                            </Link>
                        </SidebarDropdownGroup>
                        <SidebarItem
                            icon="review"
                            label="Comments"
                            active={pathname?.startsWith('/cms/comments')}
                            collapsed={!expanded}
                            href="/cms/comments"
                        />
                    </div>

                    {expanded && <hr className="border-gray-200 dark:border-[var(--card-border)]" />}

                    {/* 5. COMMUNICATIONS */}
                    <div className="space-y-1">
                        {expanded && <div className="px-3 py-2 text-xs font-semibold text-gray-900 dark:text-gray-100">Communications</div>}
                        <SidebarItem
                            icon="notifications"
                            label="Notifications"
                            active={pathname?.startsWith('/notifications')}
                            collapsed={!expanded}
                            href="/notifications"
                        />
                        <SidebarItem
                            icon="announcement"
                            label="Announcements"
                            active={pathname?.startsWith('/announcements')}
                            collapsed={!expanded}
                            href="/announcements"
                        />
                    </div>

                    {expanded && <hr className="border-gray-200 dark:border-[var(--card-border)]" />}

                    {/* 9. MARKETING */}
                    <div className="space-y-1">
                        {expanded && <div className="px-3 py-2 text-xs font-semibold text-gray-900 dark:text-gray-100">Business</div>}
                        <SidebarItem
                            icon="promotion"
                            label="Coupons"
                            active={pathname?.startsWith('/business/coupons')}
                            collapsed={!expanded}
                            href="/business/coupons"
                        />
                        <SidebarItem
                            icon="payout"
                            label="Payouts"
                            active={pathname === '/instructors/payouts'}
                            collapsed={!expanded}
                            href="/instructors/payouts"
                        />
                        <SidebarItem
                            icon="transaction"
                            label="Accounting Dashboard"
                            active={pathname?.startsWith('/accounting')}
                            collapsed={!expanded}
                            href="/accounting/dashboard"
                        />
                    </div>

                    {expanded && <hr className="border-gray-200 dark:border-[var(--card-border)]" />}

                    {/* 10. SYSTEM SETTINGS */}
                    <div className="space-y-1">
                        {expanded && <div className="px-3 py-2 text-xs font-semibold text-gray-900 dark:text-gray-100">System Settings</div>}
                        <SidebarItem
                            icon="settings"
                            label="General Settings"
                            active={pathname === '/settings'}
                            collapsed={!expanded}
                            href="/settings"
                        />
                        <SidebarItem
                            icon="security"
                            label="Security"
                            active={pathname?.startsWith('/settings/security')}
                            collapsed={!expanded}
                            href="/settings/security"
                        />
                    </div>

                </nav>
            </div>
        </aside>
        </>
    );
}
