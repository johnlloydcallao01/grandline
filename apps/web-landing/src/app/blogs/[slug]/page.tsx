import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { BlogPostContent } from "@encreasl/ui/blog-post-content";
import { fetchPostBySlugOrId } from "@encreasl/ui/blogs-data";

type BlogPostPageProps = {
    params: {
        slug: string;
    };
};

export async function generateMetadata({ params }: BlogPostPageProps): Promise<Metadata> {
    const post = await fetchPostBySlugOrId(params.slug);

    if (!post) {
        return {
            title: "Blog Article | Grandline Maritime",
            description: "The requested blog article could not be found.",
        };
    }

    const seoTitle = post.seo?.title || post.title || "Blog Article";
    const seoDescription = post.seo?.description || post.excerpt || undefined;

    return {
        title: seoTitle,
        description: seoDescription,
    };
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
    const post = await fetchPostBySlugOrId(params.slug);

    if (!post) {
        notFound();
    }

    return (
        <main className="min-h-screen">
            <Header />
            <BlogPostContent post={post} />

            <Footer />
        </main>
    );
}
