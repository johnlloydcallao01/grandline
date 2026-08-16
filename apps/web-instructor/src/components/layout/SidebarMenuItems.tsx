'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import { SidebarItem, SidebarDropdownGroup } from '@/components/ui';
import Link from 'next/link';
import { useMessenger } from '@encreasl/ui/messenger-context';

interface SidebarMenuItemsProps {
  isOpen: boolean;
}

export function SidebarMenuItems({ isOpen }: SidebarMenuItemsProps) {
  const pathname = usePathname();
  const { unreadCount } = useMessenger();

  const hasActiveCourseManagerChild =
    pathname?.startsWith('/courses');

  const [isCourseManagerExpanded, setIsCourseManagerExpanded] = React.useState(hasActiveCourseManagerChild);

  const [isEnrollmentsExpanded, setIsEnrollmentsExpanded] = React.useState(
    pathname?.startsWith('/enrollments') ?? false
  );

  const [isSubmissionsExpanded, setIsSubmissionsExpanded] = React.useState(
    pathname?.startsWith('/submissions') ?? false
  );

  const hasActiveGradebookChild =
    pathname?.startsWith('/gradebook');

  const [isGradebookExpanded, setIsGradebookExpanded] = React.useState(hasActiveGradebookChild);

  React.useEffect(() => {
    if (hasActiveCourseManagerChild) {
      setIsCourseManagerExpanded(true);
    }
  }, [hasActiveCourseManagerChild]);

  React.useEffect(() => {
    if (pathname?.startsWith('/enrollments')) {
      setIsEnrollmentsExpanded(true);
    }
  }, [pathname]);

  React.useEffect(() => {
    if (pathname?.startsWith('/submissions')) {
      setIsSubmissionsExpanded(true);
    }
  }, [pathname]);

  React.useEffect(() => {
    if (hasActiveGradebookChild) {
      setIsGradebookExpanded(true);
    }
  }, [hasActiveGradebookChild]);

  const LinkComponent = Link as any;

  return (
    <>
      {/* Dashboard */}
      <div className="space-y-1">
        {isOpen && (
          <div className="px-3 py-2 text-xs font-semibold text-gray-900 dark:text-gray-100">
            Dashboard
          </div>
        )}
        <SidebarItem
          icon="overview"
          label="My Overview"
          active={pathname === '/' || pathname === '/dashboard'}
          collapsed={!isOpen}
          href="/dashboard"
        />
        <SidebarItem
          icon="report"
          label="My Course Reports"
          active={pathname?.startsWith('/dashboard/reports')}
          collapsed={!isOpen}
          href="/dashboard/reports"
        />
      </div>

      {isOpen && <hr className="border-gray-200 dark:border-[var(--card-border)]" />}

      {/* Core LMS */}
      <div className="space-y-1">
        {isOpen && (
          <div className="px-3 py-2 text-xs font-semibold text-gray-900 dark:text-gray-100">
            Core LMS
          </div>
        )}
        <SidebarDropdownGroup
          icon="course-manager"
          label="Course Manager"
          isOpen={isOpen}
          isExpanded={isCourseManagerExpanded}
          onToggle={() => setIsCourseManagerExpanded((current) => !current)}
          active={hasActiveCourseManagerChild}
        >
          <LinkComponent
            href="/courses"
            className={`flex w-full items-center rounded-lg px-3 py-2 text-sm transition-colors ${pathname === '/courses' || (pathname?.startsWith('/courses') && !pathname?.startsWith('/courses/lessons') && !pathname?.startsWith('/courses/assessments') && !pathname?.startsWith('/courses/questions') && !pathname?.startsWith('/courses/assignments'))
              ? 'bg-gray-100 font-medium text-gray-900 dark:bg-gray-800 dark:text-gray-100'
              : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-gray-100'
            }`}
          >
            <span className="truncate">Courses</span>
          </LinkComponent>
          <LinkComponent
            href="/courses/lessons"
            className={`flex w-full items-center rounded-lg px-3 py-2 text-sm transition-colors ${pathname?.startsWith('/courses/lessons')
              ? 'bg-gray-100 font-medium text-gray-900 dark:bg-gray-800 dark:text-gray-100'
              : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-gray-100'
            }`}
          >
            <span className="truncate">Lessons</span>
          </LinkComponent>
          <LinkComponent
            href="/courses/assessments"
            className={`flex w-full items-center rounded-lg px-3 py-2 text-sm transition-colors ${pathname?.startsWith('/courses/assessments')
              ? 'bg-gray-100 font-medium text-gray-900 dark:bg-gray-800 dark:text-gray-100'
              : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-gray-100'
            }`}
          >
            <span className="truncate">Assessments</span>
          </LinkComponent>
          <LinkComponent
            href="/courses/questions"
            className={`flex w-full items-center rounded-lg px-3 py-2 text-sm transition-colors ${pathname?.startsWith('/courses/questions')
              ? 'bg-gray-100 font-medium text-gray-900 dark:bg-gray-800 dark:text-gray-100'
              : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-gray-100'
            }`}
          >
            <span className="truncate">Questions</span>
          </LinkComponent>
          <LinkComponent
            href="/courses/assignments"
            className={`flex w-full items-center rounded-lg px-3 py-2 text-sm transition-colors ${pathname?.startsWith('/courses/assignments')
              ? 'bg-gray-100 font-medium text-gray-900 dark:bg-gray-800 dark:text-gray-100'
              : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-gray-100'
            }`}
          >
            <span className="truncate">Assignments</span>
          </LinkComponent>
        </SidebarDropdownGroup>
        <SidebarDropdownGroup
          icon="enrollments"
          label="Enrollments"
          isOpen={isOpen}
          isExpanded={isEnrollmentsExpanded}
          onToggle={() => setIsEnrollmentsExpanded((current) => !current)}
          active={pathname?.startsWith('/enrollments') ?? false}
        >
          <LinkComponent
            href="/enrollments/roster"
            className={`flex w-full items-center rounded-lg px-3 py-2 text-sm transition-colors ${pathname?.startsWith('/enrollments/roster')
              ? 'bg-gray-100 font-medium text-gray-900 dark:bg-gray-800 dark:text-gray-100'
              : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-gray-100'
            }`}
          >
            <span className="truncate">Roster</span>
          </LinkComponent>
          <LinkComponent
            href="/enrollments/assign-unassign"
            className={`flex w-full items-center rounded-lg px-3 py-2 text-sm transition-colors ${pathname?.startsWith('/enrollments/assign-unassign')
              ? 'bg-gray-100 font-medium text-gray-900 dark:bg-gray-800 dark:text-gray-100'
              : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-gray-100'
            }`}
          >
            <span className="truncate">Assign / Unassign</span>
          </LinkComponent>
        </SidebarDropdownGroup>
        <SidebarDropdownGroup
          icon="submissions"
          label="Submissions"
          isOpen={isOpen}
          isExpanded={isSubmissionsExpanded}
          onToggle={() => setIsSubmissionsExpanded((current) => !current)}
          active={pathname?.startsWith('/submissions') ?? false}
        >
          <LinkComponent
            href="/submissions/assessments"
            className={`flex w-full items-center rounded-lg px-3 py-2 text-sm transition-colors ${pathname?.startsWith('/submissions/assessments')
              ? 'bg-gray-100 font-medium text-gray-900 dark:bg-gray-800 dark:text-gray-100'
              : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-gray-100'
            }`}
          >
            <span className="truncate">Assessments</span>
          </LinkComponent>
          <LinkComponent
            href="/submissions/assignments"
            className={`flex w-full items-center rounded-lg px-3 py-2 text-sm transition-colors ${pathname?.startsWith('/submissions/assignments')
              ? 'bg-gray-100 font-medium text-gray-900 dark:bg-gray-800 dark:text-gray-100'
              : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-gray-100'
            }`}
          >
            <span className="truncate">Assignments</span>
          </LinkComponent>
          <LinkComponent
            href="/submissions/feedbacks"
            className={`flex w-full items-center rounded-lg px-3 py-2 text-sm transition-colors ${pathname?.startsWith('/submissions/feedbacks')
              ? 'bg-gray-100 font-medium text-gray-900 dark:bg-gray-800 dark:text-gray-100'
              : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-gray-100'
            }`}
          >
            <span className="truncate">Feedbacks</span>
          </LinkComponent>
        </SidebarDropdownGroup>
        <SidebarDropdownGroup
          icon="gradebook"
          label="Gradebook"
          isOpen={isOpen}
          isExpanded={isGradebookExpanded}
          onToggle={() => setIsGradebookExpanded((current) => !current)}
          active={hasActiveGradebookChild}
        >
          <LinkComponent
            href="/gradebook"
            className={`flex w-full items-center rounded-lg px-3 py-2 text-sm transition-colors ${pathname === '/gradebook'
              ? 'bg-gray-100 font-medium text-gray-900 dark:bg-gray-800 dark:text-gray-100'
              : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-gray-100'
            }`}
          >
            <span className="truncate">Gradebook</span>
          </LinkComponent>
          <LinkComponent
            href="/gradebook/student-overview"
            className={`flex w-full items-center rounded-lg px-3 py-2 text-sm transition-colors ${pathname?.startsWith('/gradebook/student-overview')
              ? 'bg-gray-100 font-medium text-gray-900 dark:bg-gray-800 dark:text-gray-100'
              : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-gray-100'
            }`}
          >
            <span className="truncate">Student Overview</span>
          </LinkComponent>
          <LinkComponent
            href="/gradebook/setup"
            className={`flex w-full items-center rounded-lg px-3 py-2 text-sm transition-colors ${pathname?.startsWith('/gradebook/setup')
              ? 'bg-gray-100 font-medium text-gray-900 dark:bg-gray-800 dark:text-gray-100'
              : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-gray-100'
            }`}
          >
            <span className="truncate">Grade Setup</span>
          </LinkComponent>
        </SidebarDropdownGroup>
        <SidebarItem
          icon="media"
          label="Media Library"
          active={pathname?.startsWith('/media-library')}
          collapsed={!isOpen}
          href="/media-library"
        />
        <SidebarItem
          icon="feedback-forms"
          label="Feedback Forms"
          active={pathname?.startsWith('/feedback-forms')}
          collapsed={!isOpen}
          href="/feedback-forms"
        />
      </div>

      {isOpen && <hr className="border-gray-200 dark:border-[var(--card-border)]" />}

      {/* Certification */}
      <div className="space-y-1">
        {isOpen && (
          <div className="px-3 py-2 text-xs font-semibold text-gray-900 dark:text-gray-100">
            Certification
          </div>
        )}
        <SidebarItem
          icon="issuance"
          label="Issuance"
          active={pathname?.startsWith('/certifications/issuance')}
          collapsed={!isOpen}
          href="/certifications/issuance"
        />
        <SidebarItem
          icon="verification"
          label="Verification"
          active={pathname?.startsWith('/certifications/verification')}
          collapsed={!isOpen}
          href="/certifications/verification"
        />
      </div>

      {isOpen && <hr className="border-gray-200 dark:border-[var(--card-border)]" />}

      {/* Communications */}
      <div className="space-y-1">
        {isOpen && (
          <div className="px-3 py-2 text-xs font-semibold text-gray-900 dark:text-gray-100">
            Communications
          </div>
        )}
        <SidebarItem
          icon="announcements"
          label="Announcements"
          active={pathname?.startsWith('/announcements')}
          collapsed={!isOpen}
          href="/announcements"
        />
        <SidebarItem
          icon="messenger"
          label="Messenger"
          active={pathname?.startsWith('/messenger')}
          collapsed={!isOpen}
          href="/messenger"
          badge={unreadCount}
        />
      </div>

      {isOpen && <hr className="border-gray-200 dark:border-[var(--card-border)]" />}

      {/* Settings */}
      <div className="space-y-1">
        {isOpen && (
          <div className="px-3 py-2 text-xs font-semibold text-gray-900 dark:text-gray-100">
            Settings
          </div>
        )}
        <SidebarItem
          icon="settings"
          label="General Settings"
          active={pathname?.startsWith('/settings')}
          collapsed={!isOpen}
          href="/settings/profile"
        />
      </div>
    </>
  );
}
