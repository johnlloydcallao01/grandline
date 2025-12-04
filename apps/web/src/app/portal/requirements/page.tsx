'use client';

export default function RequirementsPage() {
  const systemChecks = [
    { id: 1, name: 'Browser Compatibility', status: 'pass', details: 'Chrome 120.0 detected' },
    { id: 2, name: 'Internet Speed', status: 'pass', details: '25 Mbps (Recommended: 5 Mbps)' },
    { id: 3, name: 'Screen Resolution', status: 'pass', details: '1920x1080 detected' },
    { id: 4, name: 'Microphone Access', status: 'warn', details: 'Permission not granted' },
    { id: 5, name: 'Webcam Access', status: 'fail', details: 'Device not found' }
  ];

  const softwareReqs = [
    {
      category: 'Operating System',
      min: 'Windows 10 / macOS 10.15',
      rec: 'Windows 11 / macOS 12+',
      icon: 'fa-desktop'
    },
    {
      category: 'Web Browser',
      min: 'Chrome 90+, Firefox 88+, Edge 90+',
      rec: 'Latest stable version',
      icon: 'fa-chrome'
    },
    {
      category: 'Hardware',
      min: '4GB RAM, 2GHz Processor',
      rec: '8GB RAM, i5/M1 Processor or better',
      icon: 'fa-microchip'
    }
  ];

  return (
    <div className="w-full px-[10px] py-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">System Requirements</h1>
        <p className="text-gray-500 mt-1">Ensure your device meets the necessary standards for optimal learning experience</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* System Check Card */}
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between">
              <h2 className="text-lg font-bold text-gray-900">Current System Status</h2>
              <button className="text-sm text-blue-600 font-medium hover:text-blue-700 flex items-center gap-2">
                <i className="fa fa-refresh"></i>
                Re-check
              </button>
            </div>
            <div className="divide-y divide-gray-100">
              {systemChecks.map((check) => (
                <div key={check.id} className="p-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      check.status === 'pass' ? 'bg-green-100 text-green-600' :
                      check.status === 'warn' ? 'bg-yellow-100 text-yellow-600' :
                      'bg-red-100 text-red-600'
                    }`}>
                      <i className={`fa ${
                        check.status === 'pass' ? 'fa-check' :
                        check.status === 'warn' ? 'fa-exclamation' :
                        'fa-times'
                      }`}></i>
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900">{check.name}</h3>
                      <p className="text-sm text-gray-500">{check.details}</p>
                    </div>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${
                    check.status === 'pass' ? 'bg-green-50 text-green-700 border border-green-100' :
                    check.status === 'warn' ? 'bg-yellow-50 text-yellow-700 border border-yellow-100' :
                    'bg-red-50 text-red-700 border border-red-100'
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
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-6">Technical Specifications</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {softwareReqs.map((req, idx) => (
                <div key={idx} className="bg-gray-50 rounded-xl p-5 border border-gray-100">
                  <div className="w-10 h-10 bg-white rounded-lg border border-gray-200 flex items-center justify-center text-blue-600 mb-4 shadow-sm">
                    <i className={`fa ${req.icon} text-lg`}></i>
                  </div>
                  <h3 className="font-bold text-gray-900 mb-2">{req.category}</h3>
                  <div className="space-y-2">
                    <div>
                      <div className="text-xs text-gray-500 uppercase font-bold tracking-wider">Minimum</div>
                      <div className="text-sm text-gray-700">{req.min}</div>
                    </div>
                    <div>
                      <div className="text-xs text-blue-600 uppercase font-bold tracking-wider">Recommended</div>
                      <div className="text-sm text-gray-900 font-medium">{req.rec}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar Info */}
        <div className="space-y-6">
          <div className="bg-blue-600 rounded-xl p-6 text-white shadow-lg">
            <div className="flex items-center gap-3 mb-4">
              <i className="fa fa-life-ring text-2xl text-blue-200"></i>
              <h3 className="text-lg font-bold">Need Assistance?</h3>
            </div>
            <p className="text-blue-100 text-sm mb-6">
              If you're experiencing technical difficulties with the portal, our IT support team is available 24/7.
            </p>
            <button className="w-full bg-white text-blue-600 py-2 rounded-lg font-bold hover:bg-blue-50 transition-colors shadow-sm">
              Contact Support
            </button>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
            <h3 className="font-bold text-gray-900 mb-4">Downloads</h3>
            <ul className="space-y-3">
              <li>
                <a href="#" className="flex items-center justify-between group">
                  <div className="flex items-center gap-3">
                    <i className="fa fa-file-pdf-o text-red-500"></i>
                    <span className="text-sm text-gray-600 group-hover:text-blue-600 transition-colors">User Manual v2.4</span>
                  </div>
                  <i className="fa fa-download text-gray-400"></i>
                </a>
              </li>
              <li>
                <a href="#" className="flex items-center justify-between group">
                  <div className="flex items-center gap-3">
                    <i className="fa fa-chrome text-blue-500"></i>
                    <span className="text-sm text-gray-600 group-hover:text-blue-600 transition-colors">Chrome Installer</span>
                  </div>
                  <i className="fa fa-external-link text-gray-400"></i>
                </a>
              </li>
              <li>
                <a href="#" className="flex items-center justify-between group">
                  <div className="flex items-center gap-3">
                    <i className="fa fa-mobile text-gray-800"></i>
                    <span className="text-sm text-gray-600 group-hover:text-blue-600 transition-colors">Mobile App (iOS/Android)</span>
                  </div>
                  <i className="fa fa-qrcode text-gray-400"></i>
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
