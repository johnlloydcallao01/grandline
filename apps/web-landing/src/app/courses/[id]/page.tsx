"use client";

import { useParams } from "next/navigation";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import Image from "next/image";

export default function CourseDetailPage() {
  const params = useParams();
  const courseId = params.id;

  // Mock course data - in a real app, this would come from an API
  const course = {
    id: courseId,
    title: "Advanced Data Science & Machine Learning",
    instructor: "Dr. Sarah Chen",
    instructorImage: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face",
    instructorBio: "Former Google AI researcher with 15+ years in machine learning and data science. Published 50+ research papers and holds a PhD from Stanford.",
    duration: "12 weeks",
    level: "Advanced",
    students: "2,847",
    rating: 4.9,
    reviews: 1247,
    price: "$299",
    originalPrice: "$499",
    image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&h=400&fit=crop&crop=center",
    category: "Data Science",
    skills: ["Python", "TensorFlow", "Deep Learning", "Statistics", "Pandas", "Scikit-learn", "Neural Networks", "Computer Vision"],
    description: "Master advanced machine learning techniques and build real-world AI applications with hands-on projects. This comprehensive course covers everything from fundamental algorithms to cutting-edge deep learning techniques.",
    badge: "Bestseller",
    lessons: 45,
    projects: 8,
    certificate: true,
    lifetime: true,
    support: true,
    mobile: true,
    lastUpdated: "December 2024"
  };

  const curriculum = [
    {
      title: "Introduction to Machine Learning",
      lessons: 8,
      duration: "2 hours",
      topics: ["ML Fundamentals", "Data Preprocessing", "Feature Engineering", "Model Selection"]
    },
    {
      title: "Supervised Learning Algorithms",
      lessons: 12,
      duration: "3.5 hours",
      topics: ["Linear Regression", "Decision Trees", "Random Forest", "SVM", "Ensemble Methods"]
    },
    {
      title: "Deep Learning with TensorFlow",
      lessons: 15,
      duration: "4 hours",
      topics: ["Neural Networks", "CNNs", "RNNs", "Transfer Learning", "Model Optimization"]
    },
    {
      title: "Advanced Topics & Projects",
      lessons: 10,
      duration: "3 hours",
      topics: ["Computer Vision", "NLP", "Reinforcement Learning", "Capstone Project"]
    }
  ];

  const features = [
    { icon: "fas fa-play-circle", text: "45 video lessons" },
    { icon: "fas fa-project-diagram", text: "8 hands-on projects" },
    { icon: "fas fa-certificate", text: "Certificate of completion" },
    { icon: "fas fa-infinity", text: "Lifetime access" },
    { icon: "fas fa-mobile-alt", text: "Mobile & desktop access" },
    { icon: "fas fa-headset", text: "24/7 support" }
  ];

  const testimonials = [
    {
      name: "John Smith",
      role: "Data Scientist at Microsoft",
      image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=60&h=60&fit=crop&crop=face",
      text: "This course completely transformed my understanding of machine learning. The projects are incredibly practical!"
    },
    {
      name: "Maria Garcia",
      role: "ML Engineer at Google",
      image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=60&h=60&fit=crop&face",
      text: "Dr. Chen's teaching style is exceptional. Complex concepts are explained in a very understandable way."
    }
  ];

  return (
    <main className="min-h-screen">
      <Header />

      {/* Hero Section */}
      <section className="pt-24 pb-16 bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="flex items-center space-x-4 mb-4">
                <span className="bg-orange-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                  {course.badge}
                </span>
                <span className="bg-red-100 text-red-800 px-3 py-1 rounded-full text-sm font-medium">
                  {course.level}
                </span>
              </div>

              <h1 className="heading-primary text-3xl md:text-5xl text-gray-900 mb-4">
                {course.title}
              </h1>

              <p className="text-xl text-gray-600 mb-6">
                {course.description}
              </p>

              <div className="flex items-center space-x-6 mb-6">
                <div className="flex items-center text-yellow-500">
                  <div className="flex">
                    {[...Array(5)].map((_, i) => (
                      <i key={i} className="fas fa-star"></i>
                    ))}
                  </div>
                  <span className="text-gray-600 ml-2">{course.rating} ({course.reviews} reviews)</span>
                </div>
                <div className="text-gray-600">
                  <i className="fas fa-users mr-2"></i>
                  {course.students} students
                </div>
              </div>

              <div className="flex items-center space-x-4 mb-8">
                <Image
                  src={course.instructorImage}
                  alt={course.instructor}
                  width={50}
                  height={50}
                  className="rounded-full"
                />
                <div>
                  <div className="font-semibold text-gray-900">{course.instructor}</div>
                  <div className="text-gray-600 text-sm">Course Instructor</div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <button className="btn-primary text-lg px-8 py-4">
                  <i className="fas fa-play mr-2"></i>
                  Enroll Now - {course.price}
                </button>
                <button className="btn-secondary text-lg px-8 py-4">
                  <i className="fas fa-heart mr-2"></i>
                  Add to Wishlist
                </button>
              </div>
            </div>

            <div className="relative">
              <Image
                src={course.image}
                alt={course.title}
                width={800}
                height={400}
                className="rounded-2xl shadow-lg"
              />
              <div className="absolute inset-0 bg-black bg-opacity-40 rounded-2xl flex items-center justify-center">
                <button className="w-20 h-20 bg-white rounded-full flex items-center justify-center hover:scale-110 transition-transform">
                  <i className="fas fa-play text-2xl text-blue-600 ml-1"></i>
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Course Info */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            {/* Main Content */}
            <div className="lg:col-span-2">
              {/* What You'll Learn */}
              <div className="mb-12">
                <h2 className="heading-secondary text-2xl font-bold text-gray-900 mb-6">
                  What You'll Learn
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {course.skills.map((skill, index) => (
                    <div key={index} className="flex items-center space-x-3">
                      <i className="fas fa-check text-green-500"></i>
                      <span className="text-gray-700">{skill}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Curriculum */}
              <div className="mb-12">
                <h2 className="heading-secondary text-2xl font-bold text-gray-900 mb-6">
                  Course Curriculum
                </h2>
                <div className="space-y-4">
                  {curriculum.map((section, index) => (
                    <div key={index} className="border border-gray-200 rounded-lg">
                      <div className="p-6">
                        <div className="flex items-center justify-between mb-4">
                          <h3 className="text-lg font-semibold text-gray-900">{section.title}</h3>
                          <div className="text-sm text-gray-500">
                            {section.lessons} lessons • {section.duration}
                          </div>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {section.topics.map((topic, topicIndex) => (
                            <span key={topicIndex} className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm">
                              {topic}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Instructor */}
              <div className="mb-12">
                <h2 className="heading-secondary text-2xl font-bold text-gray-900 mb-6">
                  Your Instructor
                </h2>
                <div className="flex items-start space-x-6">
                  <Image
                    src={course.instructorImage}
                    alt={course.instructor}
                    width={100}
                    height={100}
                    className="rounded-full"
                  />
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">{course.instructor}</h3>
                    <p className="text-gray-600 leading-relaxed">{course.instructorBio}</p>
                  </div>
                </div>
              </div>

              {/* Student Reviews */}
              <div>
                <h2 className="heading-secondary text-2xl font-bold text-gray-900 mb-6">
                  Student Reviews
                </h2>
                <div className="space-y-6">
                  {testimonials.map((testimonial, index) => (
                    <div key={index} className="bg-gray-50 p-6 rounded-lg">
                      <div className="flex items-start space-x-4">
                        <Image
                          src={testimonial.image}
                          alt={testimonial.name}
                          width={60}
                          height={60}
                          className="rounded-full"
                        />
                        <div>
                          <div className="flex items-center mb-2">
                            <div className="flex text-yellow-500 mr-2">
                              {[...Array(5)].map((_, i) => (
                                <i key={i} className="fas fa-star text-sm"></i>
                              ))}
                            </div>
                          </div>
                          <p className="text-gray-700 mb-2">"{testimonial.text}"</p>
                          <div className="text-sm">
                            <div className="font-semibold text-gray-900">{testimonial.name}</div>
                            <div className="text-gray-600">{testimonial.role}</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-1">
              <div className="bg-white border border-gray-200 rounded-2xl p-6 sticky top-24">
                <div className="text-center mb-6">
                  <div className="flex items-center justify-center space-x-2 mb-2">
                    <span className="text-3xl font-bold text-gray-900">{course.price}</span>
                    <span className="text-lg text-gray-500 line-through">{course.originalPrice}</span>
                  </div>
                  <div className="text-green-600 font-medium">Save 40%</div>
                </div>

                <button className="w-full btn-primary text-lg py-4 mb-4">
                  <i className="fas fa-shopping-cart mr-2"></i>
                  Enroll Now
                </button>

                <button className="w-full btn-secondary text-lg py-4 mb-6">
                  <i className="fas fa-gift mr-2"></i>
                  Gift This Course
                </button>

                <div className="space-y-4 mb-6">
                  {features.map((feature, index) => (
                    <div key={index} className="flex items-center space-x-3">
                      <i className={`${feature.icon} text-blue-600`}></i>
                      <span className="text-gray-700">{feature.text}</span>
                    </div>
                  ))}
                </div>

                <div className="border-t border-gray-200 pt-6">
                  <div className="text-sm text-gray-600 space-y-2">
                    <div>Last updated: {course.lastUpdated}</div>
                    <div>Language: English</div>
                    <div>Subtitles: Available</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
