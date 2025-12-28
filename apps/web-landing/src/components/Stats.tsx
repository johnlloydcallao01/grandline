"use client";

import Link from "next/link";

export function Stats() {
  const stats = [
    {
      number: "50+",
      label: "Expert-Led Courses",
      icon: "fas fa-anchor",
      color: "from-[#ab3b43] to-[#201a7c]"
    },
    {
      number: "100%",
      label: "Legally Compliant",
      icon: "fas fa-shield-alt",
      color: "from-[#1a1569] to-[#201a7c]"
    },
    {
      number: "24/7",
      label: "Support from Dedicated Maritime Instructors",
      icon: "fas fa-headset",
      color: "from-[#8f2f36] to-[#ab3b43]"
    }
  ];

  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center px-4 py-2 bg-[#ab3b43]/10 text-[#ab3b43] rounded-full text-sm font-medium mb-4">
            <i className="fas fa-chart-bar mr-2"></i>
            Our Impact
          </div>
          <h2 className="heading-primary text-3xl md:text-4xl lg:text-5xl text-gray-900 mb-4">
            Empowering the Next Generation of
            <span className="text-[#ab3b43]"> Maritime Professionals</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Set sail toward success with our comprehensive learning platform, designed to equip you with the skills and confidence to excel in your maritime career.
          </p>
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {stats.map((stat, index) => (
            <div
              key={index}
              className="card-hover bg-white p-8 rounded-2xl shadow-lg border border-gray-100 text-center group"
            >
              <div className={`w-16 h-16 bg-gradient-to-r ${stat.color} rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300`}>
                <i className={`${stat.icon} text-2xl text-white`}></i>
              </div>
              <div className="heading-primary text-4xl md:text-5xl font-bold text-gray-900 mb-2">
                {stat.number}
              </div>
              <div className="text-gray-600 font-medium">
                {stat.label}
              </div>
            </div>
          ))}
        </div>

        {/* Achievement section */}
        <div className="mt-20 bg-gradient-to-r from-[#201a7c] to-[#ab3b43] rounded-3xl p-8 md:p-12 text-white">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            <div>
              <h3 className="heading-primary text-3xl md:text-4xl mb-6">
                Ready to Start Your Maritime Journey?
              </h3>
              <p className="text-xl text-blue-100 mb-8">
                Embark on your learning adventure today and explore our platform designed to help aspiring maritime professionals build real skills.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link 
                  href="https://app.grandlinemaritime.com/" 
                  className="bg-white text-[#201a7c] px-8 py-4 rounded-xl font-semibold hover:bg-gray-100 transition-colors inline-flex items-center justify-center"
                >
                  <i className="fas fa-rocket mr-2"></i>
                  Start Now!
                </Link>
                <Link 
                  href="/courses" 
                  className="border-2 border-white text-white px-8 py-4 rounded-xl font-semibold hover:bg-white hover:text-[#201a7c] transition-colors inline-flex items-center justify-center"
                >
                  <i className="fas fa-book mr-2"></i>
                  View Courses
                </Link>
              </div>
            </div>
            <div className="text-center lg:text-right">
              <div className="inline-flex items-center justify-center w-32 h-32 bg-white/20 rounded-full mb-6">
                <i className="fas fa-trophy text-6xl text-yellow-300"></i>
              </div>
              <div className="space-y-4">
                <div className="flex items-center justify-center lg:justify-end space-x-2">
                  <div className="flex text-yellow-300">
                    <i className="fas fa-star"></i>
                    <i className="fas fa-star"></i>
                    <i className="fas fa-star"></i>
                    <i className="fas fa-star"></i>
                    <i className="fas fa-star-half-alt"></i>
                  </div>
                  <span className="text-white font-semibold">4.9/5 User Satisfaction</span>
                </div>
                <p className="text-blue-100 text-sm">
                  (based on initial feedback from early users)
                </p>
                <p className="text-blue-100 italic">
                  "Trusted by Learners in the Maritime Industry"
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
