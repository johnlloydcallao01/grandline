import React from 'react';
import { NotificationsPanel } from '@/components/notifications/NotificationsPanel';

const mockNotifications = [
  {
    id: 1,
    type: 'course_completion',
    title: 'Course Completed!',
    message: 'Congratulations! You have successfully completed "STCW Basic Safety Training"',
    timestamp: '2 hours ago',
    read: false,
    icon: 'fa-graduation-cap',
    iconColor: 'text-green-600',
    iconBg: 'bg-green-100',
    actionText: 'View Certificate',
    actionPath: '/certificates'
  },
  {
    id: 2,
    type: 'assignment_due',
    title: 'Assignment Due Soon',
    message: 'Your assignment for "Advanced Bridge Management" is due in 2 days',
    timestamp: '4 hours ago',
    read: false,
    icon: 'fa-clock',
    iconColor: 'text-orange-600',
    iconBg: 'bg-orange-100',
    actionText: 'Complete Assignment',
    actionPath: '/assignments'
  },
  {
    id: 3,
    type: 'new_course',
    title: 'New Course Available',
    message: 'Check out the new "Maritime Cybersecurity" course now available',
    timestamp: '1 day ago',
    read: true,
    icon: 'fa-plus-circle',
    iconColor: 'text-blue-600',
    iconBg: 'bg-blue-100',
    actionText: 'View Course',
    actionPath: '/courses'
  },
  {
    id: 4,
    type: 'certificate_issued',
    title: 'Certificate Issued',
    message: 'Your IMO certificate for "Maritime Security Awareness" has been issued',
    timestamp: '2 days ago',
    read: true,
    icon: 'fa-certificate',
    iconColor: 'text-purple-600',
    iconBg: 'bg-purple-100',
    actionText: 'Download Certificate',
    actionPath: '/certificates'
  },
  {
    id: 5,
    type: 'system_update',
    title: 'System Update',
    message: 'New features have been added to improve your learning experience',
    timestamp: '3 days ago',
    read: true,
    icon: 'fa-sync-alt',
    iconColor: 'text-indigo-600',
    iconBg: 'bg-indigo-100',
    actionText: 'Learn More',
    actionPath: '/updates'
  },
  {
    id: 6,
    type: 'reminder',
    title: 'Study Reminder',
    message: 'Don\'t forget to continue your "Engine Room Operations" course',
    timestamp: '5 days ago',
    read: true,
    icon: 'fa-bell',
    iconColor: 'text-yellow-600',
    iconBg: 'bg-yellow-100',
    actionText: 'Continue Learning',
    actionPath: '/portal'
  },
  {
    id: 7,
    type: 'achievement',
    title: 'Achievement Unlocked!',
    message: 'You\'ve earned the "Safety Expert" badge for completing 5 safety courses',
    timestamp: '1 week ago',
    read: true,
    icon: 'fa-trophy',
    iconColor: 'text-yellow-600',
    iconBg: 'bg-yellow-100',
    actionText: 'View Achievements',
    actionPath: '/achievements'
  },
  {
    id: 8,
    type: 'payment',
    title: 'Payment Successful',
    message: 'Your payment for "Cargo Handling & Stowage" course has been processed',
    timestamp: '1 week ago',
    read: true,
    icon: 'fa-credit-card',
    iconColor: 'text-green-600',
    iconBg: 'bg-green-100',
    actionText: 'View Receipt',
    actionPath: '/billing'
  }
];

const learningTypes = ['course_completion', 'assignment_due', 'new_course', 'reminder', 'achievement'];
const accountTypes = ['payment', 'certificate_issued'];

export default function NotificationsPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <NotificationsPanel
        items={mockNotifications}
        filters={[
          { id: 'all', label: 'All', count: mockNotifications.length },
          { id: 'unread', label: 'Unread', count: mockNotifications.filter((n) => !n.read).length },
          {
            id: 'learning',
            label: 'Learning',
            count: mockNotifications.filter((n) => learningTypes.includes(n.type)).length,
          },
          {
            id: 'account',
            label: 'Account',
            count: mockNotifications.filter((n) => accountTypes.includes(n.type)).length,
          },
          {
            id: 'system_update',
            label: 'System Updates',
            count: mockNotifications.filter((n) => n.type === 'system_update').length,
          },
        ]}
      />
      <div className="pb-20" />
    </div>
  );
}
