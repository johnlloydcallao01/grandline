'use client';

import React, { useState, useMemo } from 'react';
import { RichTextRenderer } from '@/components/RichTextRenderer';

interface Announcement {
  id: string;
  title: string;
  course?: {
    id: string;
    title: string;
  };
  bodyBlocks?: any;
  pinned?: boolean;
  visibleFrom?: string;
  createdAt: string;
  createdBy?: {
    id: string;
    firstName?: string;
    lastName?: string;
  };
}

interface AnnouncementsClientProps {
  initialAnnouncements: Announcement[];
}

export default function AnnouncementsClient({ initialAnnouncements }: AnnouncementsClientProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCourse, setFilterCourse] = useState('All');

  // Extract unique courses for the filter dropdown
  const uniqueCourses = useMemo(() => {
    const courses = new Set<string>();
    initialAnnouncements.forEach((a) => {
      if (a.course?.title) {
        courses.add(a.course.title);
      }
    });
    return ['All', ...Array.from(courses)];
  }, [initialAnnouncements]);

  const filteredAnnouncements = useMemo(() => {
    return initialAnnouncements.filter((announcement) => {
      const matchesSearch = announcement.title.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCourse = filterCourse === 'All' || announcement.course?.title === filterCourse;
      return matchesSearch && matchesCourse;
    });
  }, [initialAnnouncements, searchQuery, filterCourse]);

  // Separate pinned announcements
  const pinnedAnnouncements = filteredAnnouncements.filter((a) => a.pinned);
  const regularAnnouncements = filteredAnnouncements.filter((a) => !a.pinned);

  const renderAnnouncement = (announcement: Announcement) => {
    const authorName = announcement.createdBy 
      ? `${announcement.createdBy.firstName || ''} ${announcement.createdBy.lastName || ''}`.trim() || 'Admin'
      : 'System';

    const date = new Date(announcement.visibleFrom || announcement.createdAt).toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    return (
      <div key={announcement.id} className={`bg-white rounded-xl shadow-sm border ${announcement.pinned ? 'border-blue-300 ring-1 ring-blue-100' : 'border-gray-200'} overflow-hidden mb-6`}>
        <div className={`px-6 py-4 border-b ${announcement.pinned ? 'bg-blue-50 border-blue-100' : 'bg-gray-50 border-gray-200'} flex flex-col sm:flex-row sm:items-center justify-between gap-4`}>
          <div>
            <div className="flex items-center gap-3 mb-1">
              {announcement.pinned && (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  <svg className="-ml-0.5 mr-1.5 h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" clipRule="evenodd" />
                  </svg>
                  Pinned
                </span>
              )}
              <h3 className="text-lg font-semibold text-gray-900">{announcement.title}</h3>
            </div>
            <div className="flex flex-wrap items-center text-sm text-gray-500 gap-x-4 gap-y-2">
              <span className="flex items-center">
                <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                {announcement.course?.title || 'General'}
              </span>
              <span className="flex items-center">
                <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                {date}
              </span>
              <span className="flex items-center">
                <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                {authorName}
              </span>
            </div>
          </div>
        </div>
        <div className="p-6">
          <div className="prose max-w-none text-gray-700">
            {announcement.bodyBlocks ? (
              <RichTextRenderer content={announcement.bodyBlocks} />
            ) : (
              <p className="text-gray-500 italic">No content provided.</p>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50/50 pb-12">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-30">
        <div className="w-full px-[10px]">
          <div className="py-6 flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Announcements</h1>
              <p className="mt-1 text-sm text-gray-500">
                Important updates and news from your enrolled courses.
              </p>
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
              <div className="relative w-full sm:w-64 md:w-80">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <input
                  type="text"
                  placeholder="Search announcements..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition duration-150 ease-in-out"
                />
              </div>
              <select
                value={filterCourse}
                onChange={(e) => setFilterCourse(e.target.value)}
                className="block w-full sm:w-48 pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-lg"
              >
                {uniqueCourses.map(course => (
                  <option key={course} value={course}>{course === 'All' ? 'All Courses' : course}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      <div className="w-full px-[10px] py-8">
        {initialAnnouncements.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-xl border border-gray-200">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">No announcements</h3>
            <p className="mt-1 text-sm text-gray-500">You don't have any announcements at the moment.</p>
          </div>
        ) : filteredAnnouncements.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-xl border border-gray-200">
            <p className="text-gray-500">No announcements found matching your filters.</p>
          </div>
        ) : (
          <div className="w-full">
            {pinnedAnnouncements.length > 0 && (
              <div className="mb-8">
                <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4">Pinned</h2>
                {pinnedAnnouncements.map(renderAnnouncement)}
              </div>
            )}

            {regularAnnouncements.length > 0 && (
              <div>
                {pinnedAnnouncements.length > 0 && (
                  <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4">Recent</h2>
                )}
                {regularAnnouncements.map(renderAnnouncement)}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}