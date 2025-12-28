import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import Image from "next/image";

// Force dynamic rendering since we fetch CMS data
export const dynamic = 'force-dynamic';


interface CompanyMember {
  id: number;
  firstName: string;
  lastName: string;
  middleName?: string;
  position: string;
  bio?: string;
  profilePicture?: {
    cloudinaryURL: string;
  };
  isActive: boolean;
}

interface CompanyMembersResponse {
  docs: CompanyMember[];
  totalDocs: number;
}

async function getCompanyMembers(): Promise<CompanyMember[]> {
  try {
    // Use environment variables with fallback
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';
    const apiKey = process.env.PAYLOAD_API_KEY || 'db6c3436-72f8-47d0-855a-30112b7e9214';

    const fullUrl = `${apiUrl}/company-members`;

    console.log('🔍 Fetching company members from:', fullUrl);

    const response = await fetch(fullUrl, {
      headers: {
        'Authorization': `users API-Key ${apiKey}`,
      },
      cache: 'no-store', // Always fetch fresh data
    });

    if (!response.ok) {
      console.error('❌ Failed to fetch company members:', response.status, response.statusText);
      console.error('URL:', fullUrl);
      return [];
    }

    const data: CompanyMembersResponse = await response.json();
    console.log('✅ Successfully fetched', data.totalDocs, 'company members');

    // Filter active members and sort by order
    return data.docs.filter(member => member.isActive);
  } catch (error) {
    console.error('❌ Error fetching company members:', error);
    return [];
  }
}

export default async function AboutPage() {
  // Fetch real company members from CMS
  const companyMembers = await getCompanyMembers();



  const values = [
    {
      icon: "fas fa-lightbulb",
      title: "Innovation",
      description: "We advance maritime training by integrating modern technology with hands-on seafaring expertise, ensuring learners gain practical and up-to-date skills."
    },
    {
      icon: "fas fa-users",
      title: "Accessibility",
      description: "We make maritime education attainable for aspiring seafarers everywhere, providing flexible learning that fits diverse schedules and locations."
    },
    {
      icon: "fas fa-star",
      title: "Excellence",
      description: "We uphold the highest standards in maritime instruction, course quality, and student support, preparing professionals to excel at sea and in their careers."
    },
    {
      icon: "fas fa-handshake",
      title: "Community",
      description: "We foster a collaborative maritime learning environment, connecting learners and instructors to share knowledge, experience, and guidance throughout their professional journey."
    }
  ];

  return (
    <main className="min-h-screen">
      <Header />

      {/* Hero Section */}
      <section className="pt-24 pb-16 bg-[#0f172a]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="heading-primary text-4xl md:text-6xl mb-6">
              <span className="text-[#F5F5F5]">About</span> <span className="text-[#ab3b43]">Us</span>
            </h1>
            <p className="text-xl text-[#F5F5F5] max-w-3xl mx-auto">
              We’re on a mission to make expert maritime training accessible to aspiring professionals, helping them build skills and confidence to advance their careers through innovative learning experiences.
            </p>
          </div>
        </div>
      </section>

      {/* Story Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="heading-primary text-3xl md:text-4xl text-gray-900 mb-6">
                Background
              </h2>
              <p className="text-lg text-gray-600 mb-6 leading-relaxed">
                Grandline Maritime Training and Development Center Inc. was created to make maritime learning efficient, professional, and accessible. Our intuitive online platform lets learners track their progress, study on their own schedule, and gain confidence in their skills without feeling overwhelmed.
              </p>
              <p className="text-lg text-gray-600 leading-relaxed">
                With expert-led courses designed to shape the next generation of maritime professionals, we equip aspiring seafarers with the knowledge and practical skills needed to excel in their careers.
              </p>
            </div>
            <div className="relative">
              <Image
                src="https://images.pexels.com/photos/1181352/pexels-photo-1181352.jpeg?auto=compress&cs=tinysrgb&w=600&h=400&fit=crop"
                alt="Team collaboration"
                width={600}
                height={400}
                className="rounded-2xl shadow-lg"
              />
              <div className="absolute -bottom-6 -left-6 bg-white rounded-xl p-4 shadow-lg">
                <div className="text-2xl font-bold text-blue-600">50+</div>
                <div className="text-gray-600 text-sm">Expert-Led Courses</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <div className="bg-white p-8 rounded-2xl shadow-lg">
              <div className="w-16 h-16 bg-[#201a7c]/10 rounded-2xl flex items-center justify-center mb-6">
                <i className="fas fa-bullseye text-2xl text-[#201a7c]"></i>
              </div>
              <h3 className="heading-secondary text-2xl font-bold text-gray-900 mb-4">Mission</h3>
              <p className="text-gray-600 leading-relaxed">
                To provide aspiring maritime professionals with comprehensive, high-quality, and accessible training that blends expert-led instruction, practical skills development, and innovative learning technology, empowering learners to navigate their careers with confidence, competence, and professionalism.
              </p>
            </div>
            <div className="bg-white p-8 rounded-2xl shadow-lg">
              <div className="w-16 h-16 bg-[#ab3b43]/10 rounded-2xl flex items-center justify-center mb-6">
                <i className="fas fa-eye text-2xl text-[#ab3b43]"></i>
              </div>
              <h3 className="heading-secondary text-2xl font-bold text-gray-900 mb-4">Vision</h3>
              <p className="text-gray-600 leading-relaxed">
                To become a globally recognized maritime training center that shapes the next generation of skilled and confident maritime professionals, fostering a culture of excellence, continuous learning, and innovation in the maritime industry.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="heading-primary text-3xl md:text-4xl text-gray-900 mb-4">
              Our Values
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              These core values guide everything we do and shape the culture of our organization.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, index) => (
              <div key={index} className="text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-[#201a7c] to-[#ab3b43] rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <i className={`${value.icon} text-2xl text-white`}></i>
                </div>
                <h3 className="heading-secondary text-xl font-semibold text-gray-900 mb-4">
                  {value.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {value.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>



      {/* Real Company Members from CMS */}
      {companyMembers.length > 0 && (
        <section className="py-20 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="heading-primary text-3xl md:text-4xl text-gray-900 mb-4">
                Meet Our Team
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Our diverse team of educators, technologists, and industry experts is passionate about transforming education.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {companyMembers.map((member) => {
                const fullName = member.middleName
                  ? `${member.firstName} ${member.middleName} ${member.lastName}`
                  : `${member.firstName} ${member.lastName}`;

                const imageUrl = member.profilePicture?.cloudinaryURL ||
                  'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=300&h=300&fit=crop';

                return (
                  <div key={member.id} className="bg-white rounded-2xl shadow-lg overflow-hidden card-hover">
                    <Image
                      src={imageUrl}
                      alt={fullName}
                      width={300}
                      height={300}
                      className="w-full h-64 object-cover"
                    />
                    <div className="p-6">
                      <h3 className="heading-secondary text-xl font-semibold text-gray-900 mb-2">
                        {fullName}
                      </h3>
                      <p className="text-blue-600 font-medium mb-3">
                        {member.position}
                      </p>
                      {member.bio && (
                        <p className="text-gray-600 text-sm leading-relaxed">
                          {member.bio}
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* Stats */}
      <section className="py-20 bg-gradient-to-r from-[#201a7c] to-[#ab3b43]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="heading-primary text-3xl md:text-4xl text-white mb-4">
              Our Impact
            </h2>
            <p className="text-xl text-white font-semibold mb-4">
              Empowering the Next Generation of Maritime Professionals
            </p>
            <p className="text-lg text-blue-100 max-w-3xl mx-auto">
              Set sail toward success with our comprehensive learning platform, designed to equip you with the skills and confidence to excel in your maritime career.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="text-4xl md:text-5xl font-bold text-white mb-2">50+</div>
              <div className="text-blue-200">Expert-Led Courses</div>
            </div>
            <div className="text-center">
              <div className="text-4xl md:text-5xl font-bold text-white mb-2">100%</div>
              <div className="text-blue-200">Legally Compliant</div>
            </div>
            <div className="text-center">
              <div className="text-4xl md:text-5xl font-bold text-white mb-2">24/7</div>
              <div className="text-blue-200">Support from Dedicated Maritime Instructors</div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
