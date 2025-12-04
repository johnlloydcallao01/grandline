'use client';

import { useState } from 'react';

interface Submission {
  id: string;
  title: string;
  type: 'Assignment' | 'Quiz' | 'Exam' | 'Project';
  course: string;
  submittedDate: string;
  status: 'Graded' | 'Pending Review' | 'Resubmission Required';
  grade?: string;
  score?: number;
  maxScore: number;
  feedback?: boolean;
  attachments?: number;
}

const MOCK_SUBMISSIONS: Submission[] = [
  {
    id: '1',
    title: 'Passage Planning Project',
    type: 'Project',
    course: 'Advanced Navigation',
    submittedDate: '2025-12-01T10:30:00',
    status: 'Graded',
    grade: 'A',
    score: 95,
    maxScore: 100,
    feedback: true,
    attachments: 3
  },
  {
    id: '2',
    title: 'Engine Maintenance Log Analysis',
    type: 'Assignment',
    course: 'Marine Engineering Basics',
    submittedDate: '2025-11-28T15:45:00',
    status: 'Pending Review',
    maxScore: 50,
    attachments: 1
  },
  {
    id: '3',
    title: 'Maritime Law Case Study',
    type: 'Assignment',
    course: 'Maritime Law',
    submittedDate: '2025-11-25T09:15:00',
    status: 'Resubmission Required',
    score: 60,
    maxScore: 100,
    feedback: true,
    attachments: 1
  },
  {
    id: '4',
    title: 'Radio Communication Simulation',
    type: 'Quiz',
    course: 'GMDSS',
    submittedDate: '2025-11-20T14:20:00',
    status: 'Graded',
    grade: 'Pass',
    score: 28,
    maxScore: 30,
    feedback: false
  },
  {
    id: '5',
    title: 'Fire Fighting Drill Report',
    type: 'Assignment',
    course: 'Safety at Sea',
    submittedDate: '2025-11-15T11:00:00',
    status: 'Graded',
    grade: 'B+',
    score: 88,
    maxScore: 100,
    feedback: true,
    attachments: 2
  }
];

export default function SubmittedWorkPage() {
  const [filter, setFilter] = useState('All');

  const filteredSubmissions = MOCK_SUBMISSIONS.filter(sub => {
    if (filter === 'All') return true;
    return sub.status === filter;
  });

  return (
    <div className="w-full px-[10px] py-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Submitted Work</h1>
          <p className="text-gray-600 mt-1">History of your submissions and grades</p>
        </div>
        <div className="flex items-center gap-2 bg-white px-3 py-2 rounded-lg border border-gray-200 shadow-sm">
          <span className="text-sm text-gray-500">Average Grade:</span>
          <span className="font-bold text-gray-900">88%</span>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-2 overflow-x-auto pb-2 mb-6">
        {['All', 'Graded', 'Pending Review', 'Resubmission Required'].map((status) => (
          <button
            key={status}
            onClick={() => setFilter(status)}
            className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
              filter === status
                ? 'bg-blue-600 text-white shadow-sm'
                : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
            }`}
          >
            {status}
          </button>
        ))}
      </div>

      {/* Table View */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Assignment / Activity</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Course</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Submitted</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Grade</th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredSubmissions.map((submission) => (
                <tr key={submission.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex flex-col">
                      <span className="text-sm font-medium text-gray-900">{submission.title}</span>
                      <span className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                        <i className={`fa ${
                          submission.type === 'Assignment' ? 'fa-file-alt' : 
                          submission.type === 'Quiz' ? 'fa-question-circle' : 
                          submission.type === 'Project' ? 'fa-project-diagram' : 'fa-pencil-alt'
                        }`}></i>
                        {submission.type}
                        {submission.attachments && (
                          <span className="ml-2 flex items-center gap-1 text-blue-600">
                            <i className="fa fa-paperclip"></i>
                            {submission.attachments}
                          </span>
                        )}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm text-gray-600">{submission.course}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{new Date(submission.submittedDate).toLocaleDateString()}</div>
                    <div className="text-xs text-gray-500">{new Date(submission.submittedDate).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                      submission.status === 'Graded' ? 'bg-green-50 text-green-700 border-green-200' :
                      submission.status === 'Pending Review' ? 'bg-yellow-50 text-yellow-700 border-yellow-200' :
                      'bg-red-50 text-red-700 border-red-200'
                    }`}>
                      {submission.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {submission.status === 'Graded' ? (
                      <div className="flex flex-col">
                        <span className="text-sm font-bold text-gray-900">{submission.score}/{submission.maxScore}</span>
                        {submission.grade && <span className="text-xs text-gray-500">Grade: {submission.grade}</span>}
                      </div>
                    ) : (
                      <span className="text-sm text-gray-400">-</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center justify-end gap-3">
                      {submission.feedback && (
                        <button className="text-blue-600 hover:text-blue-900 flex items-center gap-1" title="View Feedback">
                          <i className="fa fa-comment-alt"></i>
                          <span className="hidden md:inline">Feedback</span>
                        </button>
                      )}
                      <button className="text-gray-400 hover:text-gray-600" title="View Details">
                        <i className="fa fa-chevron-right"></i>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filteredSubmissions.length === 0 && (
          <div className="p-12 text-center text-gray-500">
            <i className="fa fa-inbox text-4xl mb-4 text-gray-300"></i>
            <p>No submissions found matching your filter.</p>
          </div>
        )}
      </div>
    </div>
  );
}
