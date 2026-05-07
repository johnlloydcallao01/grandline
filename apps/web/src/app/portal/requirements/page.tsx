'use client';

export default function RequirementsPage() {
  const systemChecks = [
    { id: 1, name: 'Browser Compatibility', status: 'pass', details: 'Chrome 120.0 detected' },
    { id: 2, name: 'Internet Speed', status: 'pass', details: '25 Mbps (Minimum for Video: 2 Mbps)' },
    { id: 3, name: 'Screen Resolution', status: 'pass', details: '1920x1080 (Minimum: 1024x768)' },
    { id: 4, name: 'Microphone Access', status: 'warn', details: 'Required for live sessions' },
    { id: 5, name: 'Webcam Access', status: 'warn', details: 'Required for proctored exams' }
  ];

  const softwareReqs = [
    {
      category: 'Operating System',
      min: 'Windows 10 / macOS 10.15 / Android 10+',
      rec: 'Windows 11 / macOS 12+ / iOS 15+',
      icon: 'fa-desktop'
    },
    {
      category: 'Web Browser',
      min: 'Chrome 90+, Firefox 88+, Edge 90+',
      rec: 'Latest stable version (Secure Browser)',
      icon: 'fa-chrome'
    },
    {
      category: 'Hardware',
      min: '2GB RAM, Dual-Core 1.9GHz Processor',
      rec: '8GB RAM, i5/M1 Processor or better',
      icon: 'fa-microchip'
    }
  ];

  return (
    <div className="w-full px-[10px] py-6 bg-[var(--background)] min-h-screen">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">System Requirements</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">Ensure your device meets the necessary standards for optimal learning experience</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* System Check Card */}
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-[var(--card-background)] rounded-xl border border-[var(--card-border)] shadow-sm overflow-hidden">
            <div className="p-6 border-b border-[var(--card-border)] flex items-center justify-between">
              <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">Current System Status</h2>
            </div>
            <div className="divide-y divide-[var(--card-border)]">
              {systemChecks.map((check) => (
                <div key={check.id} className="p-4 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      check.status === 'pass' ? 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400' :
                      check.status === 'warn' ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400' :
                      'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400'
                    }`}>
                      <i className={`fa ${
                        check.status === 'pass' ? 'fa-check' :
                        check.status === 'warn' ? 'fa-exclamation' :
                        'fa-times'
                      }`}></i>
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900 dark:text-gray-100">{check.name}</h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">{check.details}</p>
                    </div>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${
                    check.status === 'pass' ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 border border-green-100 dark:border-green-800' :
                    check.status === 'warn' ? 'bg-yellow-50 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-400 border border-yellow-100 dark:border-yellow-800' :
                    'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 border border-red-100 dark:border-red-800'
                  }`}>
                    {check.status === 'pass' ? 'Compatible' :
                     check.status === 'warn' ? 'Attention' :
                     'Incompatible'}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Detailed Specs */}
          <div className="bg-[var(--card-background)] rounded-xl border border-[var(--card-border)] shadow-sm p-6">
            <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-6">Technical Specifications</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {softwareReqs.map((req, idx) => (
                <div key={idx} className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-5 border border-[var(--card-border)]">
                  <div className="w-10 h-10 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 flex items-center justify-center text-[#201a7c] dark:text-[#5c54e0] mb-4 shadow-sm">
                    <i className={`fa ${req.icon} text-lg`}></i>
                  </div>
                  <h3 className="font-bold text-gray-900 dark:text-gray-100 mb-2">{req.category}</h3>
                  <div className="space-y-2">
                    <div>
                      <div className="text-xs text-gray-500 dark:text-gray-400 uppercase font-bold tracking-wider">Minimum</div>
                      <div className="text-sm text-gray-700 dark:text-gray-300">{req.min}</div>
                    </div>
                    <div>
                      <div className="text-xs text-[#201a7c] dark:text-[#5c54e0] uppercase font-bold tracking-wider">Recommended</div>
                      <div className="text-sm text-gray-900 dark:text-gray-100 font-medium">{req.rec}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar Info */}
        <div className="space-y-6">
          <div className="bg-[#201a7c] dark:bg-[#3028a3] rounded-xl p-6 text-white shadow-lg">
            <div className="flex items-center gap-3 mb-4">
              <i className="fa fa-life-ring text-2xl text-blue-200"></i>
              <h3 className="text-lg font-bold">Need Assistance?</h3>
            </div>
            <p className="text-blue-100 text-sm mb-6">
              If you're experiencing technical difficulties with the portal, our IT support team is available 24/7.
            </p>
            <a 
              href="https://app.grandlinemaritime.com/support"
              target="_blank"
              rel="noopener noreferrer"
              className="block w-full bg-white dark:bg-gray-100 text-[#201a7c] py-2 rounded-lg font-bold hover:bg-gray-50 dark:hover:bg-gray-200 transition-colors shadow-sm text-center"
            >
              Contact Support
            </a>
          </div>

          <div className="bg-[var(--card-background)] rounded-xl border border-[var(--card-border)] shadow-sm p-6">
            <h3 className="font-bold text-gray-900 dark:text-gray-100 mb-4">Downloads</h3>
            <ul className="space-y-3">
              <li>
                <a href="#" className="flex items-center justify-between group">
                  <div className="flex items-center gap-3">
                    <i className="fa fa-chrome text-[#201a7c] dark:text-[#5c54e0]"></i>
                    <span className="text-sm text-gray-600 dark:text-gray-300 group-hover:text-[#201a7c] dark:group-hover:text-[#5c54e0] transition-colors">Chrome Installer</span>
                  </div>
                  <i className="fa fa-external-link text-gray-400 dark:text-gray-500"></i>
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
