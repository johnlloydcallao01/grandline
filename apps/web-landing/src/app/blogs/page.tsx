import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import Link from "next/link";
import Image from "next/image";

export default function BlogsPage() {
    const featuredPost = {
        title: "The Future of Maritime Training: Digital Transformation in 2025",
        excerpt: "Explore how digital technologies are revolutionizing maritime education and what this means for aspiring seafarers and industry professionals.",
        image: "https://images.pexels.com/photos/163726/belgium-antwerp-shipping-container-163726.jpeg?auto=compress&cs=tinysrgb&w=1200&h=600&fit=crop",
        category: "Industry Insights",
        date: "December 20, 2024",
        readTime: "8 min read",
        author: "Capt. Roberto Santos"
    };

    const blogPosts = [
        {
            title: "Essential Skills Every Deck Officer Needs in 2025",
            excerpt: "From traditional navigation to modern technology integration, discover the must-have skills for today's deck officers.",
            image: "https://images.pexels.com/photos/2144326/pexels-photo-2144326.jpeg?auto=compress&cs=tinysrgb&w=800&h=400&fit=crop",
            category: "Career Guidance",
            date: "December 18, 2024",
            readTime: "6 min read"
        },
        {
            title: "Understanding STCW 2010 Manila Amendments",
            excerpt: "A comprehensive guide to the latest STCW requirements and how they impact maritime professionals.",
            image: "https://images.pexels.com/photos/1267362/pexels-photo-1267362.jpeg?auto=compress&cs=tinysrgb&w=800&h=400&fit=crop",
            category: "Regulations",
            date: "December 15, 2024",
            readTime: "10 min read"
        },
        {
            title: "5 Tips for Effective Online Maritime Learning",
            excerpt: "Maximize your learning outcomes with these proven strategies for online maritime training courses.",
            image: "https://images.pexels.com/photos/4195325/pexels-photo-4195325.jpeg?auto=compress&cs=tinysrgb&w=800&h=400&fit=crop",
            category: "Training Tips",
            date: "December 12, 2024",
            readTime: "5 min read"
        },
        {
            title: "Career Pathways in the Maritime Industry",
            excerpt: "Explore the diverse career opportunities available in the maritime sector and how to chart your course.",
            image: "https://images.pexels.com/photos/906982/pexels-photo-906982.jpeg?auto=compress&cs=tinysrgb&w=800&h=400&fit=crop",
            category: "Career Guidance",
            date: "December 10, 2024",
            readTime: "7 min read"
        },
        {
            title: "New Maritime Regulations in the Philippines 2025",
            excerpt: "Stay updated with the latest regulatory changes affecting Filipino seafarers and maritime institutions.",
            image: "https://images.pexels.com/photos/1117452/pexels-photo-1117452.jpeg?auto=compress&cs=tinysrgb&w=800&h=400&fit=crop",
            category: "Regulations",
            date: "December 8, 2024",
            readTime: "9 min read"
        },
        {
            title: "Mental Health and Wellbeing at Sea",
            excerpt: "Understanding the importance of mental health support for seafarers and available resources.",
            image: "https://images.pexels.com/photos/414612/pexels-photo-414612.jpeg?auto=compress&cs=tinysrgb&w=800&h=400&fit=crop",
            category: "Industry Insights",
            date: "December 5, 2024",
            readTime: "6 min read"
        }
    ];

    const categories = [
        "All Posts",
        "Industry Insights",
        "Career Guidance",
        "Training Tips",
        "Regulations",
        "Certification Updates"
    ];

    return (
        <main className="min-h-screen">
            <Header />

            {/* Hero Section */}
            <section className="pt-24 pb-16 bg-[#0f172a]">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center">
                        <h1 className="heading-primary text-4xl md:text-6xl mb-6">
                            <span className="text-[#F5F5F5]">Our</span> <span className="text-[#ab3b43]">Blog</span>
                        </h1>
                        <p className="text-xl text-[#F5F5F5] max-w-3xl mx-auto">
                            Stay informed with the latest insights, industry news, and expert advice on maritime training and career development.
                        </p>
                    </div>
                </div>
            </section>

            {/* Featured Post */}
            <section className="py-20 bg-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden card-hover">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-0">
                            <div className="relative h-64 lg:h-full min-h-[400px]">
                                <Image
                                    src={featuredPost.image}
                                    alt={featuredPost.title}
                                    fill
                                    className="object-cover"
                                />
                                <div className="absolute top-4 left-4">
                                    <span className="bg-[#ab3b43] text-white px-4 py-2 rounded-lg text-sm font-medium">
                                        Featured
                                    </span>
                                </div>
                            </div>
                            <div className="p-8 lg:p-12 flex flex-col justify-center">
                                <div className="flex items-center gap-3 text-sm text-gray-600 mb-4">
                                    <span className="text-[#201a7c] font-medium">{featuredPost.category}</span>
                                    <span>•</span>
                                    <span>{featuredPost.date}</span>
                                    <span>•</span>
                                    <span>{featuredPost.readTime}</span>
                                </div>
                                <h2 className="heading-primary text-3xl md:text-4xl text-gray-900 mb-4">
                                    {featuredPost.title}
                                </h2>
                                <p className="text-lg text-gray-600 mb-6 leading-relaxed">
                                    {featuredPost.excerpt}
                                </p>
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-gradient-to-br from-[#201a7c] to-[#ab3b43] rounded-full flex items-center justify-center text-white font-semibold">
                                            {featuredPost.author.split(' ').map(n => n[0]).join('')}
                                        </div>
                                        <span className="text-gray-700 font-medium">{featuredPost.author}</span>
                                    </div>
                                    <Link
                                        href={`/blogs/${featuredPost.title.toLowerCase().replace(/ /g, '-')}`}
                                        className="text-[#201a7c] hover:text-[#1a1569] font-medium inline-flex items-center gap-2"
                                    >
                                        Read Article
                                        <i className="fas fa-arrow-right"></i>
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Category Filter */}
            <section className="py-8 bg-gray-50 border-y border-gray-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex flex-wrap gap-3 justify-center">
                        {categories.map((category, index) => (
                            <button
                                key={index}
                                className={`px-6 py-2 rounded-lg font-medium transition-colors ${index === 0
                                        ? "bg-[#201a7c] text-white"
                                        : "bg-white text-gray-700 hover:bg-gray-100 border border-gray-200"
                                    }`}
                            >
                                {category}
                            </button>
                        ))}
                    </div>
                </div>
            </section>

            {/* Blog Posts Grid */}
            <section className="py-20 bg-gray-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {blogPosts.map((post, index) => (
                            <article
                                key={index}
                                className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden card-hover"
                            >
                                <div className="relative h-48">
                                    <Image
                                        src={post.image}
                                        alt={post.title}
                                        fill
                                        className="object-cover"
                                    />
                                </div>
                                <div className="p-6">
                                    <div className="flex items-center gap-3 text-sm text-gray-600 mb-3">
                                        <span className="text-[#201a7c] font-medium">{post.category}</span>
                                        <span>•</span>
                                        <span>{post.readTime}</span>
                                    </div>
                                    <h3 className="heading-secondary text-xl font-semibold text-gray-900 mb-3 hover:text-[#201a7c] transition-colors">
                                        {post.title}
                                    </h3>
                                    <p className="text-gray-600 mb-4 leading-relaxed">
                                        {post.excerpt}
                                    </p>
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="text-gray-500">{post.date}</span>
                                        <Link
                                            href={`/blogs/${post.title.toLowerCase().replace(/ /g, '-')}`}
                                            className="text-[#201a7c] hover:text-[#1a1569] font-medium inline-flex items-center gap-1"
                                        >
                                            Read More
                                            <i className="fas fa-arrow-right text-xs"></i>
                                        </Link>
                                    </div>
                                </div>
                            </article>
                        ))}
                    </div>

                    {/* Load More Button */}
                    <div className="text-center mt-12">
                        <button className="btn-primary px-8 py-4 text-lg inline-flex items-center gap-2">
                            Load More Articles
                            <i className="fas fa-chevron-down"></i>
                        </button>
                    </div>
                </div>
            </section>

            {/* Newsletter CTA */}
            <section className="py-20 bg-gradient-to-r from-[#201a7c] to-[#ab3b43]">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <h2 className="heading-primary text-3xl md:text-4xl text-white mb-6">
                        Never Miss an Update
                    </h2>
                    <p className="text-xl text-blue-100 mb-8">
                        Subscribe to our newsletter for the latest maritime industry insights and training tips
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 max-w-2xl mx-auto">
                        <input
                            type="email"
                            placeholder="Enter your email address"
                            className="flex-1 px-6 py-4 rounded-lg border-2 border-white/20 bg-white/10 text-white placeholder:text-white/60 focus:outline-none focus:border-white"
                        />
                        <button className="bg-white text-[#201a7c] px-8 py-4 rounded-lg font-medium hover:bg-gray-100 transition-colors whitespace-nowrap">
                            Subscribe Now
                        </button>
                    </div>
                </div>
            </section>

            <Footer />
        </main>
    );
}
