"use client";

import Image from "next/image";
import Link from "next/link";

export function Courses() {
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
      skills: ["Python", "TensorFlow", "Deep Learning", "Statistics"],
      description: "Master advanced machine learning techniques and build real-world AI applications.",
      badge: "Bestseller"
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
      skills: ["React", "Node.js", "MongoDB", "TypeScript"],
      description: "Build modern web applications from frontend to backend with industry best practices.",
      badge: "Popular"
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
      skills: ["AWS", "Docker", "Kubernetes", "CI/CD"],
      description: "Design scalable cloud infrastructure and implement DevOps best practices.",
      badge: "New"
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
      skills: ["SEO", "Social Media", "Analytics", "Content Strategy"],
      description: "Learn proven strategies to grow your business and reach your target audience.",
      badge: "Trending"
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
      skills: ["Penetration Testing", "Network Security", "Cryptography", "Risk Assessment"],
      description: "Protect organizations from cyber threats and learn ethical hacking techniques.",
      badge: "Certified"
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
      skills: ["Figma", "User Research", "Prototyping", "Design Systems"],
      description: "Create exceptional user experiences and drive product success through design.",
      badge: "Featured"
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

  return (
    <section className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center px-4 py-2 bg-[#201a7c]/10 text-[#201a7c] rounded-full text-sm font-medium mb-4">
            <i className="fas fa-graduation-cap mr-2"></i>
            Featured Courses
          </div>
          <h2 className="heading-primary text-3xl md:text-4xl lg:text-5xl text-gray-900 mb-4">
            Master In-Demand
            <span className="text-[#201a7c]"> Skills</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Choose from our comprehensive catalog of expert-led courses designed to advance your career 
            and help you stay ahead in today's competitive market.
          </p>
        </div>

        {/* Course categories */}
        <div className="flex flex-wrap justify-center gap-4 mb-12">
          {["All Courses", "Data Science", "Web Development", "Cloud Computing", "Marketing", "Security", "Design"].map((category) => (
            <button
              key={category}
              className={`px-6 py-3 rounded-full font-medium transition-colors ${
                category === "All Courses"
                  ? "bg-[#201a7c] text-white"
                  : "bg-white text-gray-700 hover:bg-[#201a7c]/5 hover:text-[#201a7c]"
              }`}
            >
              {category}
            </button>
          ))}
        </div>

        {/* Courses grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {courses.map((course) => (
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

        {/* View all courses CTA */}
        <div className="text-center mt-12">
          <Link
            href="/courses"
            className="btn-primary text-lg px-8 py-4"
          >
            <span>View All Courses</span>
            <i className="fas fa-arrow-right ml-2"></i>
          </Link>
        </div>
      </div>
    </section>
  );
}
