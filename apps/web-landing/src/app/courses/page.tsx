"use client";

import { useState } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import Image from "next/image";
import Link from "next/link";

export default function CoursesPage() {
  const [selectedCategory, setSelectedCategory] = useState("All Courses");
  const [searchTerm, setSearchTerm] = useState("");

  const categories = [
    "All Courses",
    "Data Science",
    "Web Development", 
    "Cloud Computing",
    "Marketing",
    "Security",
    "Design",
    "Business",
    "Mobile Development"
  ];

  const courses = [
    {
      id: 1,
      title: "Advanced Data Science & Machine Learning",
      instructor: "Dr. Sarah Chen",
      duration: "12 weeks",
      level: "Advanced",
      students: "2,847",
      rating: 4.9,
      price: "$299",
      originalPrice: "$499",
      image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&h=250&fit=crop&crop=center",
      category: "Data Science",
      skills: ["Python", "TensorFlow", "Deep Learning", "Statistics", "Pandas", "Scikit-learn"],
      description: "Master advanced machine learning techniques and build real-world AI applications with hands-on projects.",
      badge: "Bestseller",
      lessons: 45,
      projects: 8
    },
    {
      id: 2,
      title: "Full-Stack Web Development Bootcamp",
      instructor: "Mark Rodriguez",
      duration: "16 weeks",
      level: "Intermediate",
      students: "5,234",
      rating: 4.8,
      price: "$249",
      originalPrice: "$399",
      image: "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=400&h=250&fit=crop&crop=center",
      category: "Web Development",
      skills: ["React", "Node.js", "MongoDB", "TypeScript", "Express", "GraphQL"],
      description: "Build modern web applications from frontend to backend with industry best practices and real projects.",
      badge: "Popular",
      lessons: 52,
      projects: 12
    },
    {
      id: 3,
      title: "Cloud Architecture & DevOps Mastery",
      instructor: "Alex Thompson",
      duration: "10 weeks",
      level: "Advanced",
      students: "1,923",
      rating: 4.9,
      price: "$349",
      originalPrice: "$549",
      image: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=400&h=250&fit=crop&crop=center",
      category: "Cloud Computing",
      skills: ["AWS", "Docker", "Kubernetes", "CI/CD", "Terraform", "Jenkins"],
      description: "Design scalable cloud infrastructure and implement DevOps best practices for enterprise applications.",
      badge: "New",
      lessons: 38,
      projects: 6
    },
    {
      id: 4,
      title: "Digital Marketing & Growth Hacking",
      instructor: "Emma Wilson",
      duration: "8 weeks",
      level: "Beginner",
      students: "3,456",
      rating: 4.7,
      price: "$199",
      originalPrice: "$299",
      image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400&h=250&fit=crop&crop=center",
      category: "Marketing",
      skills: ["SEO", "Social Media", "Analytics", "Content Strategy", "PPC", "Email Marketing"],
      description: "Learn proven strategies to grow your business and reach your target audience effectively.",
      badge: "Trending",
      lessons: 32,
      projects: 5
    },
    {
      id: 5,
      title: "Cybersecurity & Ethical Hacking",
      instructor: "James Parker",
      duration: "14 weeks",
      level: "Intermediate",
      students: "2,156",
      rating: 4.8,
      price: "$279",
      originalPrice: "$429",
      image: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=400&h=250&fit=crop&crop=center",
      category: "Security",
      skills: ["Penetration Testing", "Network Security", "Cryptography", "Risk Assessment", "OWASP", "Kali Linux"],
      description: "Protect organizations from cyber threats and learn ethical hacking techniques with hands-on labs.",
      badge: "Certified",
      lessons: 48,
      projects: 10
    },
    {
      id: 6,
      title: "UI/UX Design & Product Strategy",
      instructor: "Lisa Chang",
      duration: "12 weeks",
      level: "Intermediate",
      students: "4,123",
      rating: 4.9,
      price: "$229",
      originalPrice: "$349",
      image: "https://images.unsplash.com/photo-1561070791-2526d30994b5?w=400&h=250&fit=crop&crop=center",
      category: "Design",
      skills: ["Figma", "User Research", "Prototyping", "Design Systems", "Adobe XD", "Sketch"],
      description: "Create exceptional user experiences and drive product success through design thinking.",
      badge: "Featured",
      lessons: 40,
      projects: 8
    },
    {
      id: 7,
      title: "Business Analytics & Intelligence",
      instructor: "Robert Kim",
      duration: "10 weeks",
      level: "Intermediate",
      students: "1,789",
      rating: 4.6,
      price: "$259",
      originalPrice: "$389",
      image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&h=250&fit=crop&crop=center",
      category: "Business",
      skills: ["Power BI", "Tableau", "SQL", "Excel", "Data Visualization", "KPIs"],
      description: "Transform data into actionable business insights and drive strategic decision-making.",
      badge: "Popular",
      lessons: 35,
      projects: 6
    },
    {
      id: 8,
      title: "Mobile App Development with React Native",
      instructor: "Jennifer Lee",
      duration: "14 weeks",
      level: "Intermediate",
      students: "2,567",
      rating: 4.7,
      price: "$289",
      originalPrice: "$449",
      image: "https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=400&h=250&fit=crop&crop=center",
      category: "Mobile Development",
      skills: ["React Native", "JavaScript", "Redux", "iOS", "Android"],
      description: "Build cross-platform mobile applications with React Native and deploy to app stores.",
      badge: "New",
      lessons: 46,
      projects: 9
    },
    {
      id: 9,
      title: "Blockchain Development & Smart Contracts",
      instructor: "Michael Zhang",
      duration: "12 weeks",
      level: "Advanced",
      students: "1,234",
      rating: 4.8,
      price: "$399",
      originalPrice: "$599",
      image: "https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=400&h=250&fit=crop&crop=center",
      category: "Web Development",
      skills: ["Solidity", "Ethereum", "Web3", "DeFi", "NFTs", "Truffle"],
      description: "Learn blockchain technology and build decentralized applications with smart contracts.",
      badge: "Hot",
      lessons: 42,
      projects: 7
    }
  ];

  const getBadgeColor = (badge: string) => {
    switch (badge) {
      case "Bestseller": return "bg-orange-500";
      case "Popular": return "bg-green-500";
      case "New": return "bg-blue-500";
      case "Trending": return "bg-purple-500";
      case "Certified": return "bg-red-500";
      case "Featured": return "bg-yellow-500";
      case "Hot": return "bg-pink-500";
      default: return "bg-gray-500";
    }
  };

  const getLevelColor = (level: string) => {
    switch (level) {
      case "Beginner": return "bg-green-100 text-green-800";
      case "Intermediate": return "bg-yellow-100 text-yellow-800";
      case "Advanced": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const filteredCourses = courses.filter(course => {
    const matchesCategory = selectedCategory === "All Courses" || course.category === selectedCategory;
    const matchesSearch = course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         course.instructor.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         course.skills.some(skill => skill.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  return (
    <main className="min-h-screen">
      <Header />
      
      {/* Hero Section */}
      <section className="pt-24 pb-16 bg-gradient-to-br from-[#201a7c]/5 to-[#ab3b43]/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="heading-primary text-4xl md:text-6xl mb-6">
              <span className="text-[#F5F5F5]">Explore Our</span> <span className="text-[#ab3b43]">Courses</span>
            </h1>
            <p className="text-xl text-[#F5F5F5] max-w-3xl mx-auto mb-8">
              Choose from our comprehensive catalog of expert-led courses designed to advance your career 
              and help you master in-demand skills.
            </p>
            
            {/* Search Bar */}
            <div className="max-w-2xl mx-auto">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search courses, instructors, or skills..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-6 py-4 pl-12 text-lg border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#201a7c] focus:border-transparent shadow-lg"
                />
                <i className="fas fa-search absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Courses Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Category Filter */}
          <div className="flex flex-wrap justify-center gap-4 mb-12">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-6 py-3 rounded-full font-medium transition-colors ${
                  category === selectedCategory
                    ? "bg-[#201a7c] text-white"
                    : "bg-white text-gray-700 hover:bg-[#201a7c]/5 hover:text-[#201a7c] border border-gray-200"
                }`}
              >
                {category}
              </button>
            ))}
          </div>

          {/* Results Count */}
          <div className="mb-8">
            <p className="text-gray-600">
              Showing {filteredCourses.length} course{filteredCourses.length !== 1 ? 's' : ''} 
              {selectedCategory !== "All Courses" && ` in ${selectedCategory}`}
              {searchTerm && ` matching "${searchTerm}"`}
            </p>
          </div>

          {/* Courses Grid */}
          {filteredCourses.length === 0 ? (
            <div className="text-center py-12">
              <i className="fas fa-search text-6xl text-gray-300 mb-4"></i>
              <h3 className="text-2xl font-semibold text-gray-900 mb-2">No courses found</h3>
              <p className="text-gray-600 mb-6">
                Try adjusting your search terms or browse different categories.
              </p>
              <button
                onClick={() => {
                  setSearchTerm("");
                  setSelectedCategory("All Courses");
                }}
                className="btn-primary"
              >
                View All Courses
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredCourses.map((course) => (
                <div
                  key={course.id}
                  className="card-hover bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden group"
                >
                  {/* Course image */}
                  <div className="relative">
                    <Image
                      src={course.image}
                      alt={course.title}
                      width={400}
                      height={250}
                      className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className={`absolute top-4 left-4 ${getBadgeColor(course.badge)} text-white px-3 py-1 rounded-full text-sm font-medium`}>
                      {course.badge}
                    </div>
                    <div className={`absolute top-4 right-4 px-3 py-1 rounded-full text-sm font-medium ${getLevelColor(course.level)}`}>
                      {course.level}
                    </div>
                  </div>

                  {/* Course content */}
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-[#201a7c] font-medium">{course.category}</span>
                      <div className="flex items-center text-yellow-500">
                        <i className="fas fa-star text-sm"></i>
                        <span className="text-sm text-gray-600 ml-1">{course.rating}</span>
                      </div>
                    </div>

                    <h3 className="heading-secondary text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
                      {course.title}
                    </h3>

                    <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                      {course.description}
                    </p>

                    <div className="flex items-center text-sm text-gray-500 mb-4">
                      <i className="fas fa-user mr-2"></i>
                      <span className="mr-4">{course.instructor}</span>
                      <i className="fas fa-clock mr-2"></i>
                      <span className="mr-4">{course.duration}</span>
                      <i className="fas fa-users mr-2"></i>
                      <span>{course.students}</span>
                    </div>

                    <div className="flex items-center text-sm text-gray-500 mb-4">
                      <i className="fas fa-play-circle mr-2"></i>
                      <span className="mr-4">{course.lessons} lessons</span>
                      <i className="fas fa-project-diagram mr-2"></i>
                      <span>{course.projects} projects</span>
                    </div>

                    {/* Skills */}
                    <div className="flex flex-wrap gap-2 mb-4">
                      {course.skills.slice(0, 3).map((skill, index) => (
                        <span
                          key={index}
                          className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-md"
                        >
                          {skill}
                        </span>
                      ))}
                      {course.skills.length > 3 && (
                        <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-md">
                          +{course.skills.length - 3} more
                        </span>
                      )}
                    </div>

                    {/* Price and CTA */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <span className="text-2xl font-bold text-gray-900">{course.price}</span>
                        <span className="text-sm text-gray-500 line-through">{course.originalPrice}</span>
                      </div>
                      <Link
                        href={`/courses/${course.id}`}
                        className="bg-[#201a7c] text-white px-4 py-2 rounded-lg font-medium hover:bg-[#1a1569] transition-colors text-sm"
                      >
                        Enroll Now
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      <Footer />
    </main>
  );
}
