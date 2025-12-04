'use client';

const STREAK_DATA = {
  currentStreak: 12,
  longestStreak: 45,
  totalDays: 156,
  lastActive: 'Today',
  freezeUsed: 0,
  history: [
    { day: 'M', date: '25', status: 'active' },
    { day: 'T', date: '26', status: 'active' },
    { day: 'W', date: '27', status: 'active' },
    { day: 'T', date: '28', status: 'active' },
    { day: 'F', date: '29', status: 'active' },
    { day: 'S', date: '30', status: 'missed' },
    { day: 'S', date: '01', status: 'active' },
    { day: 'M', date: '02', status: 'active' },
    { day: 'T', date: '03', status: 'active' },
    { day: 'W', date: '04', status: 'active' }, // Today
  ]
};

export default function LearningStreakPage() {
  return (
    <div className="w-full px-[10px] py-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Learning Streak</h1>
          <p className="text-gray-600 mt-1">Keep up the momentum!</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Main Streak Card */}
        <div className="bg-gradient-to-br from-blue-600 to-blue-800 rounded-2xl p-8 text-white shadow-lg lg:col-span-2 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-16 -mt-16 blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-blue-400/20 rounded-full -ml-10 -mb-10 blur-2xl"></div>
          
          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="text-center md:text-left">
              <div className="flex items-center justify-center md:justify-start gap-3 mb-2">
                <i className="fa fa-fire text-orange-400 text-2xl animate-pulse"></i>
                <span className="text-lg font-medium text-blue-100">Current Streak</span>
              </div>
              <h2 className="text-6xl font-bold mb-2">{STREAK_DATA.currentStreak} <span className="text-2xl font-normal text-blue-200">Days</span></h2>
              <p className="text-blue-100 max-w-md">
                You're on fire! Keep learning daily to maintain your streak and unlock exclusive rewards.
              </p>
            </div>
            
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20 min-w-[200px]">
              <div className="text-center">
                <div className="text-sm text-blue-200 mb-1">Longest Streak</div>
                <div className="text-3xl font-bold">{STREAK_DATA.longestStreak} Days</div>
              </div>
              <div className="my-4 border-t border-white/10"></div>
              <div className="text-center">
                <div className="text-sm text-blue-200 mb-1">Total Active Days</div>
                <div className="text-3xl font-bold">{STREAK_DATA.totalDays}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Streak Freeze Card */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm flex flex-col">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-12 h-12 bg-cyan-100 rounded-full flex items-center justify-center text-cyan-600">
              <i className="fa fa-snowflake text-xl"></i>
            </div>
            <div>
              <h3 className="font-bold text-gray-900">Streak Freeze</h3>
              <p className="text-sm text-gray-500">Protect your streak</p>
            </div>
          </div>
          
          <p className="text-sm text-gray-600 mb-6 flex-1">
            Missed a day? Use a Streak Freeze to keep your streak alive. You have <strong>{2 - STREAK_DATA.freezeUsed}</strong> freezes available this month.
          </p>

          <button className="w-full py-3 bg-cyan-50 text-cyan-700 font-bold rounded-xl hover:bg-cyan-100 transition-colors flex items-center justify-center gap-2">
            <i className="fa fa-shopping-cart"></i>
            Get More Freezes
          </button>
        </div>
      </div>

      {/* Weekly Activity */}
      <div className="bg-white rounded-xl border border-gray-200 p-8 shadow-sm">
        <h3 className="text-lg font-bold text-gray-900 mb-6">Recent Activity</h3>
        <div className="flex justify-between items-end gap-2 md:gap-4 overflow-x-auto pb-4">
          {STREAK_DATA.history.map((day, index) => (
            <div key={index} className="flex flex-col items-center gap-3 min-w-[40px]">
              <div className="relative group">
                <div className={`w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center transition-all duration-300 ${
                  day.status === 'active' 
                    ? 'bg-green-500 text-white shadow-lg shadow-green-200 scale-110' 
                    : 'bg-gray-100 text-gray-400'
                }`}>
                  <i className={`fa ${day.status === 'active' ? 'fa-check' : 'fa-times'}`}></i>
                </div>
                {day.status === 'active' && (
                  <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-xs py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                    Goal Met
                  </div>
                )}
              </div>
              <div className="text-center">
                <div className="text-xs font-bold text-gray-500 mb-1">{day.day}</div>
                <div className="text-xs text-gray-400">{day.date}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
