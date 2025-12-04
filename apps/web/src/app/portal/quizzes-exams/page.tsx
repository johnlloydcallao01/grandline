'use client';

import { useState } from 'react';

interface QuizExam {
  id: string;
  title: string;
  type: 'Quiz' | 'Exam' | 'Assessment';
  course: string;
  dueDate: string;
  duration: string;
  questions: number;
  status: 'Upcoming' | 'Available' | 'Completed' | 'Overdue';
  score?: number;
  totalPoints: number;
  attempts: number;
  maxAttempts: number;
}

const MOCK_QUIZZES: QuizExam[] = [
  {
    id: '1',
    title: 'Navigation Rules Mid-Term',
    type: 'Exam',
    course: 'Advanced Navigation',
    dueDate: '2025-12-10T14:00:00',
    duration: '90 mins',
    questions: 50,
    status: 'Upcoming',
    totalPoints: 100,
    attempts: 0,
    maxAttempts: 1
  },
  {
    id: '2',
    title: 'Fire Safety Basics',
    type: 'Quiz',
    course: 'Safety at Sea',
    dueDate: '2025-12-05T23:59:59',
    duration: '20 mins',
    questions: 15,
    status: 'Available',
    totalPoints: 30,
    attempts: 0,
    maxAttempts: 3
  },
  {
    id: '3',
    title: 'Cargo Handling Procedures',
    type: 'Assessment',
    course: 'Cargo Operations',
    dueDate: '2025-11-30T23:59:59',
    duration: '45 mins',
    questions: 25,
    status: 'Completed',
    score: 85,
    totalPoints: 100,
    attempts: 1,
    maxAttempts: 2
  },
  {
    id: '4',
    title: 'Maritime English Vocabulary',
    type: 'Quiz',
    course: 'Maritime English',
    dueDate: '2025-11-25T23:59:59',
    duration: '15 mins',
    questions: 20,
    status: 'Completed',
    score: 18,
    totalPoints: 20,
    attempts: 2,
    maxAttempts: 3
  },
  {
    id: '5',
    title: 'Engine Room Safety Protocols',
    type: 'Quiz',
    course: 'Marine Engineering Basics',
    dueDate: '2025-12-01T23:59:59',
    duration: '30 mins',
    questions: 20,
    status: 'Overdue',
    totalPoints: 40,
    attempts: 0,
    maxAttempts: 2
  }
];

export default function QuizzesExamsPage() {
  const [filter, setFilter] = useState('All');

  const filteredItems = MOCK_QUIZZES.filter(item => {
    if (filter === 'All') return true;
    return item.status === filter;
  });

  return (
    <div className="w-full px-[10px] py-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Quizzes & Exams</h1>
          <p className="text-gray-600 mt-1">Track your assessments and examination schedules</p>
        </div>
        <div className="flex gap-2">
          <div className="bg-blue-50 px-4 py-2 rounded-lg border border-blue-100 text-blue-700 text-sm font-medium">
            <i className="fa fa-clock mr-2"></i>
            Next Exam: Dec 10
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-2 overflow-x-auto pb-2 mb-6">
        {['All', 'Available', 'Upcoming', 'Completed', 'Overdue'].map((status) => (
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

      {/* List View */}
      <div className="space-y-4">
        {filteredItems.map((item) => (
          <div key={item.id} className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-md transition-all duration-200">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                    item.status === 'Available' ? 'bg-green-50 text-green-700 border-green-200' :
                    item.status === 'Upcoming' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                    item.status === 'Completed' ? 'bg-gray-100 text-gray-700 border-gray-200' :
                    'bg-red-50 text-red-700 border-red-200'
                  }`}>
                    {item.status}
                  </span>
                  <span className="text-xs font-medium text-gray-500 flex items-center gap-1">
                    <i className="fa fa-book-open"></i>
                    {item.type}
                  </span>
                  <span className="text-xs font-medium text-gray-500">
                    {item.course}
                  </span>
                </div>
                
                <h3 className="text-lg font-bold text-gray-900 mb-1">{item.title}</h3>
                
                <div className="flex flex-wrap gap-y-2 gap-x-6 text-sm text-gray-500 mt-3">
                  <div className="flex items-center gap-2">
                    <i className="fa fa-calendar-alt w-4 text-center"></i>
                    <span>Due: {new Date(item.dueDate).toLocaleDateString()} {new Date(item.dueDate).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <i className="fa fa-hourglass-half w-4 text-center"></i>
                    <span>Duration: {item.duration}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <i className="fa fa-question-circle w-4 text-center"></i>
                    <span>{item.questions} Questions</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <i className="fa fa-redo w-4 text-center"></i>
                    <span>Attempts: {item.attempts}/{item.maxAttempts}</span>
                  </div>
                </div>
              </div>

              {/* Action / Score Section */}
              <div className="flex flex-col items-end gap-3 min-w-[140px]">
                {item.status === 'Completed' ? (
                  <div className="text-right">
                    <div className="text-3xl font-bold text-gray-900">
                      {item.score}<span className="text-lg text-gray-400">/{item.totalPoints}</span>
                    </div>
                    <div className="text-xs font-medium text-green-600">Score</div>
                  </div>
                ) : (
                  <div className="text-right">
                    <div className="text-lg font-bold text-gray-900">{item.totalPoints} pts</div>
                    <div className="text-xs text-gray-500">Total Points</div>
                  </div>
                )}

                {item.status === 'Available' && (
                  <button className="w-full px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors text-sm flex items-center justify-center gap-2 shadow-sm">
                    <span>Start Now</span>
                    <i className="fa fa-arrow-right"></i>
                  </button>
                )}
                
                {item.status === 'Completed' && (
                  <button className="w-full px-4 py-2 bg-white border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors text-sm flex items-center justify-center gap-2">
                    <i className="fa fa-chart-bar"></i>
                    <span>Analysis</span>
                  </button>
                )}

                {item.status === 'Upcoming' && (
                  <button disabled className="w-full px-4 py-2 bg-gray-100 text-gray-400 font-medium rounded-lg cursor-not-allowed text-sm flex items-center justify-center gap-2">
                    <i className="fa fa-lock"></i>
                    <span>Locked</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
