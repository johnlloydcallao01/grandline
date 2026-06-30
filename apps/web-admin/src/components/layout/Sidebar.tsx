'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import { SidebarProps } from '@/types';
import { SidebarItem, SidebarDropdownGroup } from '@/components/ui';
import Link from '@/components/ui/LinkWrapper';

/**
 * Sidebar component with navigation items for Admin Panel
 * Restructured to match the 12-section hierarchy
 */
export function Sidebar({ isOpen, onToggle: _onToggle, onScroll }: SidebarProps) {
    const pathname = usePathname();

    const [isEnrollmentsExpanded, setIsEnrollmentsExpanded] = React.useState(
        pathname?.startsWith('/enrollments') ?? false
    );

    const hasActiveCourseManagerChild =
        pathname?.startsWith('/courses') ||
        pathname?.startsWith('/assessments') ||
        pathname?.startsWith('/question-bank') ||
        pathname?.startsWith('/categories');

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

    const hasActiveUsersChild =
        pathname?.startsWith('/users/trainees') ||
        pathname === '/instructors' ||
        pathname?.startsWith('/users/admins');

    const [isUsersExpanded, setIsUsersExpanded] = React.useState(hasActiveUsersChild);

    const hasActiveCmsMediaChild =
        pathname?.startsWith('/cms/media');

    const [isCmsMediaExpanded, setIsCmsMediaExpanded] = React.useState(hasActiveCmsMediaChild);

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
        if (hasActiveUsersChild) {
            setIsUsersExpanded(true);
        }
    }, [hasActiveUsersChild]);

    React.useEffect(() => {
        if (hasActiveCmsMediaChild) {
            setIsCmsMediaExpanded(true);
        }
    }, [hasActiveCmsMediaChild]);

    React.useEffect(() => {
        if (hasActiveCmsBlogPostsChild) {
            setIsCmsBlogPostsExpanded(true);
        }
    }, [hasActiveCmsBlogPostsChild]);

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

                    {isOpen && <hr className="border-gray-200" />}

                    {/* 2. COURSE MANAGEMENT */}
                    <div className="space-y-1">
                        {isOpen && <div className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">Core LMS</div>}
                        <SidebarDropdownGroup
                            icon="team"
                            label="Enrollments"
                            isOpen={isOpen}
                            isExpanded={isEnrollmentsExpanded}
                            onToggle={() => setIsEnrollmentsExpanded((current) => !current)}
                            active={pathname?.startsWith('/enrollments') ?? false}
                        >
                            <Link
                                href="/enrollments/assign-unassign"
                                className={`flex w-full items-center rounded-lg px-3 py-2 text-sm transition-colors ${pathname?.startsWith('/enrollments/assign-unassign')
                                    ? 'bg-gray-100 font-medium text-gray-900'
                                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                                    }`}
                            >
                                <span className="truncate">Assign / Unassign</span>
                            </Link>
                            <Link
                                href="/enrollments/reset-course-data"
                                className={`flex w-full items-center rounded-lg px-3 py-2 text-sm transition-colors ${pathname?.startsWith('/enrollments/reset-course-data')
                                    ? 'bg-gray-100 font-medium text-gray-900'
                                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                                    }`}
                            >
                                <span className="truncate">Reset Course Data</span>
                            </Link>
                        </SidebarDropdownGroup>
                        <SidebarDropdownGroup
                            icon="products"
                            label="Course Manager"
                            isOpen={isOpen}
                            isExpanded={isCourseManagerExpanded}
                            onToggle={() => setIsCourseManagerExpanded((current) => !current)}
                            active={hasActiveCourseManagerChild}
                        >
                            <Link
                                href="/courses"
                                className={`flex w-full items-center rounded-lg px-3 py-2 text-sm transition-colors ${pathname === '/courses' || (pathname?.startsWith('/courses') && !pathname?.startsWith('/courses/lessons') && !pathname?.startsWith('/courses/assignments') && !pathname?.startsWith('/courses/tags'))
                                    ? 'bg-gray-100 font-medium text-gray-900'
                                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                                    }`}
                            >
                                <span className="truncate">Courses</span>
                            </Link>
                            <Link
                                href="/courses/lessons"
                                className={`flex w-full items-center rounded-lg px-3 py-2 text-sm transition-colors ${pathname?.startsWith('/courses/lessons')
                                    ? 'bg-gray-100 font-medium text-gray-900'
                                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                                    }`}
                            >
                                <span className="truncate">Lessons</span>
                            </Link>
                            <Link
                                href="/assessments"
                                className={`flex w-full items-center rounded-lg px-3 py-2 text-sm transition-colors ${pathname?.startsWith('/assessments')
                                    ? 'bg-gray-100 font-medium text-gray-900'
                                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                                    }`}
                            >
                                <span className="truncate">Assessments</span>
                            </Link>
                            <Link
                                href="/question-bank"
                                className={`flex w-full items-center rounded-lg px-3 py-2 text-sm transition-colors ${pathname?.startsWith('/question-bank')
                                    ? 'bg-gray-100 font-medium text-gray-900'
                                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                                    }`}
                            >
                                <span className="truncate">Questions</span>
                            </Link>
                            <Link
                                href="/courses/assignments"
                                className={`flex w-full items-center rounded-lg px-3 py-2 text-sm transition-colors ${pathname?.startsWith('/courses/assignments')
                                    ? 'bg-gray-100 font-medium text-gray-900'
                                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                                    }`}
                            >
                                <span className="truncate">Assignments</span>
                            </Link>
                            <Link
                                href="/categories"
                                className={`flex w-full items-center rounded-lg px-3 py-2 text-sm transition-colors ${pathname?.startsWith('/categories')
                                    ? 'bg-gray-100 font-medium text-gray-900'
                                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                                    }`}
                            >
                                <span className="truncate">Categories</span>
                            </Link>
                            <Link
                                href="/courses/tags"
                                className={`flex w-full items-center rounded-lg px-3 py-2 text-sm transition-colors ${pathname?.startsWith('/courses/tags')
                                    ? 'bg-gray-100 font-medium text-gray-900'
                                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                                    }`}
                            >
                                <span className="truncate">Tags</span>
                            </Link>
                        </SidebarDropdownGroup>
                        <SidebarDropdownGroup
                            icon="grade"
                            label="Gradebook"
                            isOpen={isOpen}
                            isExpanded={isGradebookExpanded}
                            onToggle={() => setIsGradebookExpanded((current) => !current)}
                            active={hasActiveGradebookChild}
                        >
                            <Link
                                href="/grades/recent-activity"
                                className={`flex w-full items-center rounded-lg px-3 py-2 text-sm transition-colors ${pathname?.startsWith('/grades/recent-activity')
                                    ? 'bg-gray-100 font-medium text-gray-900'
                                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                                    }`}
                            >
                                <span className="truncate">Recent Activity</span>
                            </Link>
                            <Link
                                href="/trainees/accounts"
                                className={`flex w-full items-center rounded-lg px-3 py-2 text-sm transition-colors ${pathname?.startsWith('/trainees/accounts')
                                    ? 'bg-gray-100 font-medium text-gray-900'
                                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                                    }`}
                            >
                                <span className="truncate">Student Overview</span>
                            </Link>
                        </SidebarDropdownGroup>
                        <SidebarDropdownGroup
                            icon="certificate"
                            label="Certification"
                            isOpen={isOpen}
                            isExpanded={isCertificationExpanded}
                            onToggle={() => setIsCertificationExpanded((current) => !current)}
                            active={hasActiveCertificationChild}
                        >
                            <Link
                                href="/certifications/templates"
                                className={`flex w-full items-center rounded-lg px-3 py-2 text-sm transition-colors ${pathname?.startsWith('/certifications/templates') || pathname?.startsWith('/certifications/builder')
                                    ? 'bg-gray-100 font-medium text-gray-900'
                                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                                    }`}
                            >
                                <span className="truncate">Templates</span>
                            </Link>
                            <Link
                                href="/certifications/issuance"
                                className={`flex w-full items-center rounded-lg px-3 py-2 text-sm transition-colors ${pathname?.startsWith('/certifications/issuance')
                                    ? 'bg-gray-100 font-medium text-gray-900'
                                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                                    }`}
                            >
                                <span className="truncate">Issuance</span>
                            </Link>
                            <Link
                                href="/certifications/verification"
                                className={`flex w-full items-center rounded-lg px-3 py-2 text-sm transition-colors ${pathname?.startsWith('/certifications/verification')
                                    ? 'bg-gray-100 font-medium text-gray-900'
                                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                                    }`}
                            >
                                <span className="truncate">Verification</span>
                            </Link>
                        </SidebarDropdownGroup>
                        <SidebarItem
                            icon="review"
                            label="Feedback & Reviews"
                            active={pathname?.startsWith('/reviews')}
                            collapsed={!isOpen}
                            href="/reviews"
                        />
                        <SidebarDropdownGroup
                            icon="users"
                            label="Users"
                            isOpen={isOpen}
                            isExpanded={isUsersExpanded}
                            onToggle={() => setIsUsersExpanded((current) => !current)}
                            active={hasActiveUsersChild}
                        >
                            <Link
                                href="/users/trainees"
                                className={`flex w-full items-center rounded-lg px-3 py-2 text-sm transition-colors ${pathname?.startsWith('/users/trainees')
                                    ? 'bg-gray-100 font-medium text-gray-900'
                                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                                    }`}
                            >
                                <span className="truncate">Trainees</span>
                            </Link>
                            <Link
                                href="/instructors"
                                className={`flex w-full items-center rounded-lg px-3 py-2 text-sm transition-colors ${pathname === '/instructors'
                                    ? 'bg-gray-100 font-medium text-gray-900'
                                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                                    }`}
                            >
                                <span className="truncate">Instructors</span>
                            </Link>
                            <Link
                                href="/users/admins"
                                className={`flex w-full items-center rounded-lg px-3 py-2 text-sm transition-colors ${pathname?.startsWith('/users/admins')
                                    ? 'bg-gray-100 font-medium text-gray-900'
                                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                                    }`}
                            >
                                <span className="truncate">Admins</span>
                            </Link>
                        </SidebarDropdownGroup>
                    </div>

                    {isOpen && <hr className="border-gray-200" />}

                    {/* 3. CMS */}
                    <div className="space-y-1">
                        {isOpen && <div className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">CMS</div>}
                        <SidebarDropdownGroup
                            icon="media"
                            label="Media Files"
                            isOpen={isOpen}
                            isExpanded={isCmsMediaExpanded}
                            onToggle={() => setIsCmsMediaExpanded((current) => !current)}
                            active={hasActiveCmsMediaChild}
                        >
                            <Link
                                href="/cms/media"
                                className={`flex w-full items-center rounded-lg px-3 py-2 text-sm transition-colors ${pathname === '/cms/media'
                                    ? 'bg-gray-100 font-medium text-gray-900'
                                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                                    }`}
                            >
                                <span className="truncate">Library</span>
                            </Link>
                            <Link
                                href="/cms/media/add"
                                className={`flex w-full items-center rounded-lg px-3 py-2 text-sm transition-colors ${pathname?.startsWith('/cms/media/add')
                                    ? 'bg-gray-100 font-medium text-gray-900'
                                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                                    }`}
                            >
                                <span className="truncate">Add Media File</span>
                            </Link>
                        </SidebarDropdownGroup>
                        <SidebarDropdownGroup
                            icon="posts"
                            label="Blog Posts"
                            isOpen={isOpen}
                            isExpanded={isCmsBlogPostsExpanded}
                            onToggle={() => setIsCmsBlogPostsExpanded((current) => !current)}
                            active={hasActiveCmsBlogPostsChild}
                        >
                            <Link
                                href="/cms/posts"
                                className={`flex w-full items-center rounded-lg px-3 py-2 text-sm transition-colors ${pathname === '/cms/posts'
                                    ? 'bg-gray-100 font-medium text-gray-900'
                                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                                    }`}
                            >
                                <span className="truncate">All Posts</span>
                            </Link>
                            <Link
                                href="/cms/posts/add"
                                className={`flex w-full items-center rounded-lg px-3 py-2 text-sm transition-colors ${pathname?.startsWith('/cms/posts/add')
                                    ? 'bg-gray-100 font-medium text-gray-900'
                                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                                    }`}
                            >
                                <span className="truncate">Add Posts</span>
                            </Link>
                            <Link
                                href="/cms/posts/categories"
                                className={`flex w-full items-center rounded-lg px-3 py-2 text-sm transition-colors ${pathname?.startsWith('/cms/posts/categories')
                                    ? 'bg-gray-100 font-medium text-gray-900'
                                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                                    }`}
                            >
                                <span className="truncate">Categories</span>
                            </Link>
                            <Link
                                href="/cms/posts/tags"
                                className={`flex w-full items-center rounded-lg px-3 py-2 text-sm transition-colors ${pathname?.startsWith('/cms/posts/tags')
                                    ? 'bg-gray-100 font-medium text-gray-900'
                                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                                    }`}
                            >
                                <span className="truncate">Tags</span>
                            </Link>
                        </SidebarDropdownGroup>
                        <SidebarItem
                            icon="review"
                            label="Comments"
                            active={pathname?.startsWith('/cms/comments')}
                            collapsed={!isOpen}
                            href="/cms/comments"
                        />
                    </div>

                    {isOpen && <hr className="border-gray-200" />}

                    {/* 5. COMMUNICATIONS */}
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
                    </div>

                    {isOpen && <hr className="border-gray-200" />}

                    {/* 9. MARKETING */}
                    <div className="space-y-1">
                        {isOpen && <div className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">Business</div>}
                        <SidebarItem
                            icon="promotion"
                            label="Coupons"
                            active={pathname?.startsWith('/business/coupons')}
                            collapsed={!isOpen}
                            href="/business/coupons"
                        />
                        <SidebarItem
                            icon="payout"
                            label="Payouts"
                            active={pathname === '/instructors/payouts'}
                            collapsed={!isOpen}
                            href="/instructors/payouts"
                        />
                        <SidebarItem
                            icon="transaction"
                            label="Accounting Dashboard"
                            active={pathname?.startsWith('/accounting')}
                            collapsed={!isOpen}
                            href="/accounting/dashboard"
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
                    </div>

                </nav>
            </div>
        </aside>
    );
}
