'use client';

import { useState } from 'react';

interface Certificate {
  id: string;
  title: string;
  issuer: string;
  date: string;
  idNumber: string;
  image: string;
  skills: string[];
}

const MOCK_CERTIFICATES: Certificate[] = [
  {
    id: '1',
    title: 'STCW Basic Safety Training',
    issuer: 'Maritime Training Institute',
    date: '2024-11-15',
    idNumber: 'BST-2024-8892',
    image: 'fa-life-ring',
    skills: ['Personal Survival', 'Fire Prevention', 'First Aid', 'PSSR']
  },
  {
    id: '2',
    title: 'ECDIS Generic Course',
    issuer: 'Nautical Systems Academy',
    date: '2024-10-01',
    idNumber: 'ECD-2024-1102',
    image: 'fa-desktop',
    skills: ['Electronic Charts', 'Navigation', 'Safety Settings']
  },
  {
    id: '3',
    title: 'Maritime English (Intermediate)',
    issuer: 'Global Maritime Language Center',
    date: '2024-08-20',
    idNumber: 'ENG-2024-3341',
    image: 'fa-language',
    skills: ['Communication', 'SMCP', 'Reporting']
  },
  {
    id: '4',
    title: 'Security Awareness Training',
    issuer: 'Intl. Security Board',
    date: '2024-06-10',
    idNumber: 'SEC-2024-0091',
    image: 'fa-shield-alt',
    skills: ['ISPS Code', 'Threat Detection', 'Emergency Response']
  }
];

export default function CertificatesPage() {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredCertificates = MOCK_CERTIFICATES.filter(cert => 
    cert.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    cert.issuer.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="w-full px-[10px] py-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Certificates Earned</h1>
          <p className="text-gray-600 mt-1">Official records of your professional qualifications</p>
        </div>
        <div className="relative w-full md:w-64">
          <i className="fa fa-search absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"></i>
          <input
            type="text"
            placeholder="Search certificates..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredCertificates.map((cert) => (
          <div key={cert.id} className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg transition-all duration-200 flex flex-col">
            <div className="bg-gray-50 p-8 border-b border-gray-100 flex items-center justify-center relative group cursor-pointer">
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors flex items-center justify-center">
                <button className="bg-white text-gray-900 px-4 py-2 rounded-lg font-medium shadow-sm opacity-0 group-hover:opacity-100 transition-all transform translate-y-2 group-hover:translate-y-0">
                  Preview
                </button>
              </div>
              
              <div className="w-full aspect-[1.414/1] bg-white shadow-md border border-gray-200 p-6 relative">
                <div className="absolute top-0 left-0 w-full h-2 bg-blue-600"></div>
                <div className="flex justify-center mb-4">
                  <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
                    <i className={`fa ${cert.image} text-xl`}></i>
                  </div>
                </div>
                <div className="text-center space-y-2">
                  <div className="text-xs font-bold text-gray-400 uppercase tracking-wider">Certificate of Completion</div>
                  <h3 className="font-serif font-bold text-gray-900 leading-tight">{cert.title}</h3>
                  <div className="text-[10px] text-gray-500">Awarded to User Name</div>
                  <div className="w-16 h-px bg-gray-200 mx-auto my-2"></div>
                  <div className="text-[10px] text-gray-400">{cert.date}</div>
                </div>
                <div className="absolute bottom-4 right-4">
                  <i className="fa fa-certificate text-yellow-400 text-2xl"></i>
                </div>
              </div>
            </div>

            <div className="p-5 flex-1 flex flex-col">
              <div className="mb-4">
                <h3 className="font-bold text-gray-900 text-lg mb-1">{cert.title}</h3>
                <p className="text-sm text-gray-500">{cert.issuer}</p>
              </div>

              <div className="flex flex-wrap gap-2 mb-6">
                {cert.skills.map((skill, idx) => (
                  <span key={idx} className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded font-medium">
                    {skill}
                  </span>
                ))}
              </div>

              <div className="mt-auto flex items-center justify-between pt-4 border-t border-gray-100">
                <span className="text-xs font-mono text-gray-400">ID: {cert.idNumber}</span>
                <div className="flex gap-2">
                  <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded transition-colors" title="Share">
                    <i className="fa fa-share-alt"></i>
                  </button>
                  <button className="flex items-center gap-2 px-3 py-1.5 bg-blue-600 text-white text-sm font-medium rounded hover:bg-blue-700 transition-colors">
                    <i className="fa fa-download"></i>
                    PDF
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
