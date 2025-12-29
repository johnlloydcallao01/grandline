import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import Link from "next/link";

export default function KnowledgeBasePage() {
    const categories = [
        {
            icon: "fas fa-book-open",
            title: "Course Information",
            description: "Learn about our maritime training courses and programs",
            articleCount: 12,
            href: "/knowledge-base/courses"
        },
        {
            icon: "fas fa-certificate",
            title: "Certifications & Requirements",
            description: "Requirements for maritime certifications and licenses",
            articleCount: 18,
            href: "/knowledge-base/certifications"
        },
        {
            icon: "fas fa-user-check",
            title: "Enrollment Process",
            description: "Step-by-step guide to enroll in our training programs",
            articleCount: 8,
            href: "/knowledge-base/enrollment"
        },
        {
            icon: "fas fa-headset",
            title: "Technical Support",
            description: "Solutions for technical issues and platform help",
            articleCount: 15,
            href: "/knowledge-base/technical"
        },
        {
            icon: "fas fa-credit-card",
            title: "Payment & Billing",
            description: "Information about fees, payment methods, and refunds",
            articleCount: 10,
            href: "/knowledge-base/payment"
        },
        {
            icon: "fas fa-anchor",
            title: "Maritime Regulations",
            description: "Industry regulations and compliance requirements",
            articleCount: 22,
            href: "/knowledge-base/regulations"
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
                            <span className="text-[#F5F5F5]">Knowledge</span> <span className="text-[#ab3b43]">Base</span>
                        </h1>
                        <p className="text-xl text-[#F5F5F5] max-w-3xl mx-auto mb-8">
                            Find answers to your questions about maritime training, certifications, and our learning platform.
                        </p>

                        {/* Search Bar */}
                        <div className="max-w-2xl mx-auto">
                            <div className="relative">
                                <input
                                    type="text"
                                    placeholder="Search for articles, guides, or topics..."
                                    className="w-full px-6 py-4 pl-14 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#201a7c] focus:border-transparent text-gray-900 placeholder:text-gray-500"
                                />
                                <i className="fas fa-search absolute left-5 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Categories Section */}
            <section className="py-20 bg-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-12">
                        <h2 className="heading-primary text-3xl md:text-4xl text-gray-900 mb-4">
                            Browse by Category
                        </h2>
                        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                            Explore our comprehensive knowledge base organized by topic
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {categories.map((category, index) => (
                            <Link
                                key={index}
                                href={category.href}
                                className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8 card-hover"
                            >
                                <div className="w-16 h-16 bg-gradient-to-br from-[#201a7c] to-[#ab3b43] rounded-2xl flex items-center justify-center mb-6">
                                    <i className={`${category.icon} text-2xl text-white`}></i>
                                </div>
                                <h3 className="heading-secondary text-xl font-semibold text-gray-900 mb-3">
                                    {category.title}
                                </h3>
                                <p className="text-gray-600 mb-4 leading-relaxed">
                                    {category.description}
                                </p>
                                <div className="flex items-center text-sm text-[#201a7c] font-medium">
                                    <span>{category.articleCount} articles</span>
                                    <i className="fas fa-arrow-right ml-2"></i>
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-20 bg-gradient-to-r from-[#201a7c] to-[#ab3b43]">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <h2 className="heading-primary text-3xl md:text-4xl text-white mb-6">
                        Can't Find What You're Looking For?
                    </h2>
                    <p className="text-xl text-blue-100 mb-8">
                        Our support team is here to help you with any questions or concerns
                    </p>
                    <Link
                        href="/support"
                        className="inline-flex items-center bg-white text-[#201a7c] px-8 py-4 rounded-lg font-medium hover:bg-gray-100 transition-colors text-lg"
                    >
                        <i className="fas fa-headset mr-2"></i>
                        Contact Support
                    </Link>
                </div>
            </section>

            <Footer />
        </main>
    );
}
