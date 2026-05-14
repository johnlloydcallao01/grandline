import { Suspense } from "react";
import { BlogsPageContent } from "@encreasl/ui/blogs-page-content";
import { fetchActiveAssignedPostCategories } from "@encreasl/ui/blogs-data";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

export default async function BlogsPage() {
    const categories = await fetchActiveAssignedPostCategories();

    return (
        <main className="min-h-screen">
            <Header />

            <section className="pt-24 pb-16 bg-[#0f172a]">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center">
                        <h1 className="heading-primary text-4xl md:text-6xl mb-6">
                            <span className="text-[#F5F5F5]">Our</span>{" "}
                            <span className="text-[#ab3b43]">Blogs</span>
                        </h1>
                        <p className="text-xl text-[#F5F5F5] max-w-3xl mx-auto">
                            Stay informed with the latest insights, industry news, and expert advice on maritime training and career
                            development.
                        </p>
                    </div>
                </div>
            </section>

            <Suspense fallback={<div className="min-h-screen bg-white" />}>
                <BlogsPageContent categories={categories} />
            </Suspense>

            <Footer />
        </main>
    );
}
