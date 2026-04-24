import React from 'react';

interface Score {
  id: string;
  score: number;
  status: string;
  completedAt: string;
  passingScoreSnapshot: number;
  title: string;
  assessmentType: string;
}

interface RecentScoresProps {
  scores: Score[];
}

export const RecentScores: React.FC<RecentScoresProps> = ({ scores }) => {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200">
      <div className="p-6 border-b border-gray-200">
        <h2 className="text-xl font-semibold text-gray-900">Recent Scores</h2>
      </div>
      <div className="p-6">
        {scores.length > 0 ? (
          <div className="space-y-4">
            {scores.map((score) => {
              const isPassed = score.score >= score.passingScoreSnapshot;
              return (
                <div key={score.id} className="flex items-center justify-between">
                  <div className="min-w-0">
                    <h3 className="font-medium text-gray-900 truncate text-sm">{score.title}</h3>
                    <p className="text-xs text-gray-500 capitalize">{score.assessmentType.replace(/-/g, ' ')} • {new Date(score.completedAt).toLocaleDateString()}</p>
                  </div>
                  <div className="flex items-center ml-4">
                    <span className={`text-sm font-bold mr-2 ${isPassed ? 'text-green-600' : 'text-red-600'}`}>
                      {score.score}%
                    </span>
                    <div className={`w-2 h-2 rounded-full ${isPassed ? 'bg-green-500' : 'bg-red-500'}`}></div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-6">
            <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-3">
              <i className="fa fa-poll-h text-gray-300 text-xl"></i>
            </div>
            <p className="text-sm text-gray-500">No quizzes taken yet.</p>
          </div>
        )}
      </div>
    </div>
  );
};
