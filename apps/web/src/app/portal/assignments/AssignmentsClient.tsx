'use client';

import React, { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import type { MergedAssignment } from './actions';

interface AssignmentsClientProps {
  initialAssignments: MergedAssignment[];
}

export default function AssignmentsClient({ initialAssignments }: AssignmentsClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // Default to 'All' unless a specific status is provided in the URL
  const [filterStatus, setFilterStatus] = useState('All');

  useEffect(() => {
    const statusParam = searchParams.get('status');
    if (statusParam) {
      // Capitalize first letter to match the component's internal state expectations
      const formattedStatus = statusParam.charAt(0).toUpperCase() + statusParam.slice(1).toLowerCase();
      
      // Handle the special mapping for 'In Review'
      if (statusParam.toLowerCase() === 'in-review') {
        setFilterStatus('Submitted');
      } else if (['All', 'Pending', 'Submitted', 'Returned', 'Graded', 'Late'].includes(formattedStatus)) {
        setFilterStatus(formattedStatus);
      } else {
        setFilterStatus('All');
      }
    } else {
      setFilterStatus('All');
    }
  }, [searchParams]);

  const handleFilterChange = (newStatus: string) => {
    setFilterStatus(newStatus);
    
    // Update the URL without full page reload
    if (newStatus === 'All') {
      router.push('/portal/assignments');
    } else {
      // Map 'Submitted' state to 'in-review' for cleaner URLs
      const urlParam = newStatus === 'Submitted' ? 'in-review' : newStatus.toLowerCase();
      router.push(`/portal/assignments?status=${urlParam}`);
    }
  };

  const isAssignmentLate = (assignment: MergedAssignment) => {
    if (!assignment.dueDate) return false;
    
    // If it's already submitted, compare submittedAt with dueDate
    if (assignment.submittedAt) {
      return new Date(assignment.submittedAt) > new Date(assignment.dueDate);
    }
    
    // If it's pending, compare current time with dueDate
    return new Date() > new Date(assignment.dueDate);
  };

  const filteredAssignments = useMemo(() => {
    return initialAssignments.filter((assignment) => {
      if (filterStatus === 'All') return true;
      if (filterStatus === 'Pending' && assignment.status === 'pending') return true;
      if (filterStatus === 'Submitted' && assignment.status === 'submitted') return true;
      if (filterStatus === 'Graded' && assignment.status === 'graded') return true;
      if (filterStatus === 'Returned' && assignment.status === 'returned_for_revision') return true;
      
      // Late status logic: check if it's late regardless of whether it's pending, submitted, or graded
      if (filterStatus === 'Late') {
        return isAssignmentLate(assignment);
      }
      return false;
    });
  }, [initialAssignments, filterStatus]);

  const summary = useMemo(() => {
    return {
      pending: initialAssignments.filter(a => a.status === 'pending').length,
      submitted: initialAssignments.filter(a => a.status === 'submitted').length,
      graded: initialAssignments.filter(a => a.status === 'graded').length,
      returned: initialAssignments.filter(a => a.status === 'returned_for_revision').length,
      late: initialAssignments.filter(a => isAssignmentLate(a)).length,
    };
  }, [initialAssignments]);

  const getStatusBadge = (assignment: MergedAssignment) => {
    const isLate = isAssignmentLate(assignment);
    const lateBadge = isLate ? (
      <span className="px-2.5 py-0.5 rounded-full text-xs font-medium border bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-400 border-red-200 dark:border-red-800 ml-2">
        Late
      </span>
    ) : null;

    let primaryBadge: React.ReactNode = null;

    if (assignment.status === 'graded') {
      const passed = (assignment.score ?? 0) >= assignment.passingScore;
      if (passed) {
        primaryBadge = <span className="px-2.5 py-0.5 rounded-full text-xs font-medium border bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-400 border-green-200 dark:border-green-800">Passed</span>;
      } else {
        primaryBadge = <span className="px-2.5 py-0.5 rounded-full text-xs font-medium border bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-400 border-red-200 dark:border-red-800">Failed</span>;
      }
    } else if (assignment.status === 'returned_for_revision') {
      primaryBadge = <span className="px-2.5 py-0.5 rounded-full text-xs font-medium border bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800">Returned for Revision</span>;
    } else if (assignment.status === 'submitted') {
      primaryBadge = <span className="px-2.5 py-0.5 rounded-full text-xs font-medium border bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-800">In Review</span>;
    } else {
      primaryBadge = <span className="px-2.5 py-0.5 rounded-full text-xs font-medium border bg-yellow-50 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 border-yellow-200 dark:border-yellow-800">Pending</span>;
    }

    return (
      <>
        {primaryBadge}
        {lateBadge}
      </>
    );
  };

  const getSubmissionTypeTooltip = (type: string) => {
    switch (type) {
      case 'file_upload': return 'You must upload a file (e.g., PDF, DOCX) to complete this assignment.';
      case 'text_entry': return 'You must type your answer directly into the text box provided.';
      case 'both': return 'You can type your answer and/or upload a file to complete this assignment.';
      default: return 'Submission requirements for this assignment.';
    }
  };

  return (
    <div className="w-full min-h-screen bg-[var(--background)]">
      {/* Header Section */}
      <div className="bg-[var(--card-background)] border-b border-[var(--card-border)]">
        <div className="w-full px-[10px] py-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Assignments</h1>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Track and manage your course tasks and projects</p>
              
              <div className="flex flex-wrap items-center gap-4 mt-4">
                <button 
                  onClick={() => handleFilterChange('All')}
                  className={`flex items-center gap-2 text-sm transition-opacity hover:opacity-80 ${filterStatus === 'All' ? 'font-bold' : ''}`}
                >
                  <span className="w-3 h-3 rounded-full bg-gray-400 dark:bg-gray-500"></span>
                  <span className="text-gray-700 dark:text-gray-300">{initialAssignments.length} All</span>
                </button>
                <button 
                  onClick={() => handleFilterChange('Pending')}
                  className={`flex items-center gap-2 text-sm transition-opacity hover:opacity-80 ${filterStatus === 'Pending' ? 'font-bold' : ''}`}
                >
                  <span className="w-3 h-3 rounded-full bg-yellow-400 dark:bg-yellow-500"></span>
                  <span className="text-gray-700 dark:text-gray-300">{summary.pending} Pending</span>
                </button>
                <button 
                  onClick={() => handleFilterChange('Submitted')}
                  className={`flex items-center gap-2 text-sm transition-opacity hover:opacity-80 ${filterStatus === 'Submitted' ? 'font-bold' : ''}`}
                >
                  <span className="w-3 h-3 rounded-full bg-blue-500"></span>
                  <span className="text-gray-700 dark:text-gray-300">{summary.submitted} In Review</span>
                </button>
                <button 
                  onClick={() => handleFilterChange('Returned')}
                  className={`flex items-center gap-2 text-sm transition-opacity hover:opacity-80 ${filterStatus === 'Returned' ? 'font-bold' : ''}`}
                >
                  <span className="w-3 h-3 rounded-full bg-amber-500"></span>
                  <span className="text-gray-700 dark:text-gray-300">{summary.returned} Returned</span>
                </button>
                <button 
                  onClick={() => handleFilterChange('Graded')}
                  className={`flex items-center gap-2 text-sm transition-opacity hover:opacity-80 ${filterStatus === 'Graded' ? 'font-bold' : ''}`}
                >
                  <span className="w-3 h-3 rounded-full bg-green-500"></span>
                  <span className="text-gray-700 dark:text-gray-300">{summary.graded} Graded</span>
                </button>
                <button 
                  onClick={() => handleFilterChange('Late')}
                  className={`flex items-center gap-2 text-sm transition-opacity hover:opacity-80 ${filterStatus === 'Late' ? 'font-bold' : ''}`}
                >
                  <span className="w-3 h-3 rounded-full bg-red-500"></span>
                  <span className="text-gray-700 dark:text-gray-300">{summary.late} Late</span>
                </button>
              </div>
            </div>
            <div className="flex items-center gap-3 self-start md:self-center">
              <select
                value={filterStatus}
                onChange={(e) => handleFilterChange(e.target.value)}
                className="px-4 py-2 border border-[var(--card-border)] rounded-lg focus:ring-2 focus:ring-[#201a7c] focus:border-[#201a7c] outline-none bg-[var(--card-background)] text-gray-700 dark:text-gray-200 cursor-pointer"
              >
                <option value="All">All Status</option>
                <option value="Pending">Pending</option>
                <option value="Submitted">In Review</option>
                <option value="Returned">Returned</option>
                <option value="Graded">Graded</option>
                <option value="Late">Late</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="w-full px-[10px] py-8">
        <div className="space-y-4">
          {filteredAssignments.map((assignment) => (
            <div key={`${assignment.courseId}-${assignment.id}`} className="bg-[var(--card-background)] rounded-xl border border-[var(--card-border)] p-6 hover:shadow-md transition-shadow">
              <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    {getStatusBadge(assignment)}
                    <div className="relative group flex items-center">
                      <span className="text-xs font-medium text-gray-500 dark:text-gray-400 flex items-center gap-1 uppercase tracking-wide cursor-help">
                        <i className="fa fa-tag"></i>
                        {assignment.submissionType.replace('_', ' ')}
                        <i className="fa fa-info-circle ml-1 text-gray-400 dark:text-gray-500"></i>
                      </span>
                      {/* Tooltip Popup */}
                      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-max max-w-xs bg-gray-900 text-white text-xs rounded py-1.5 px-3 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10 shadow-lg text-center">
                        {getSubmissionTypeTooltip(assignment.submissionType)}
                        {/* Little triangle arrow pointing down */}
                        <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-900"></div>
                      </div>
                    </div>
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-1">{assignment.title}</h3>
                  <div className="flex items-center gap-2 mb-3">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-700">
                      Course
                    </span>
                    <p className="text-sm text-[#201a7c] dark:text-[#5c54e0] font-medium truncate max-w-sm md:max-w-md lg:max-w-lg">{assignment.courseTitle}</p>
                  </div>
                  
                  <div className="flex flex-wrap items-center gap-6 text-sm text-gray-500 dark:text-gray-400 mt-4">
                    <div className="flex items-center gap-2">
                      <i className="fa fa-calendar-alt text-gray-400 dark:text-gray-500"></i>
                      <span>Due: {assignment.dueDate ? new Date(assignment.dueDate).toLocaleDateString() : 'No deadline'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <i className="fa fa-star text-gray-400 dark:text-gray-500"></i>
                      <span>Max Score: {assignment.maxScore}</span>
                    </div>
                    {assignment.status === 'graded' && assignment.score !== null && (
                      <div className={`flex items-center gap-2 font-medium ${assignment.score >= assignment.passingScore ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                        <i className={`fa ${assignment.score >= assignment.passingScore ? 'fa-check-circle' : 'fa-times-circle'}`}></i>
                        <span>Score: {assignment.score} / {assignment.maxScore}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-3 self-start md:self-center">
                  <Link 
                    href={`/portal/courses/${assignment.courseId}/player/module/${assignment.moduleSlug}/assignment/${assignment.assignmentSlug}`}
                    className={`px-4 py-2 font-medium rounded-lg transition-colors text-sm flex items-center gap-2 ${
                      assignment.status === 'pending' || assignment.status === 'returned_for_revision'
                        ? 'bg-[#201a7c] dark:bg-[#3028a3] text-white hover:bg-[#1a1569] dark:hover:bg-[#3b32c4]'
                        : 'bg-[var(--card-background)] border border-[var(--card-border)] text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'
                    }`}
                  >
                    {assignment.status === 'pending' || assignment.status === 'returned_for_revision' ? (
                      <>
                        <i className="fa fa-edit"></i> Start Assignment
                      </>
                    ) : assignment.status === 'graded' ? (
                      <>
                        <i className="fa fa-comment-dots"></i> View Feedback
                      </>
                    ) : (
                      <>
                        <i className="fa fa-eye"></i> View Submission
                      </>
                    )}
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredAssignments.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-4">
              <i className="fa fa-clipboard-check text-gray-400 dark:text-gray-500 text-xl"></i>
            </div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">No assignments found</h3>
            <p className="text-gray-500 dark:text-gray-400 max-w-sm mt-1">
              You don't have any assignments matching the selected filter.
            </p>
            <button 
              onClick={() => setFilterStatus('All')}
              className="mt-4 text-[#201a7c] dark:text-[#5c54e0] font-medium hover:underline"
            >
              Clear filter
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
