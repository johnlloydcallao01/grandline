import { notFound } from "next/navigation";
import Image from "next/image";
import type { Metadata } from "next";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

type BlogPostDoc = {
    id: number | string;
    title?: string;
    slug?: string;
    excerpt?: string | null;
    status?: string;
    featuredImage?: {
        cloudinaryURL?: string | null;
        url?: string | null;
        thumbnailURL?: string | null;
        alt?: string | null;
    } | null;
    publishedAt?: string | null;
    createdAt?: string | null;
    category?: unknown;
    seo?: {
        title?: string | null;
        description?: string | null;
    } | null;
    content?: unknown;
};

type PostsResponse = {
    docs?: BlogPostDoc[];
    doc?: BlogPostDoc | null;
};

type BlogPostPageProps = {
    params: {
        slug: string;
    };
};

function getImageUrl(post: BlogPostDoc): string | null {
    const img = post.featuredImage;
    if (!img) return null;
    return img.cloudinaryURL || img.thumbnailURL || img.url || null;
}

function getPrimaryCategoryName(post: BlogPostDoc): string | null {
    const value = post.category as unknown;
    if (!Array.isArray(value) || value.length === 0) return null;
    const first = value[0] as any;
    if (first && typeof first === "object" && typeof first.name === "string") {
        return first.name;
    }
    return null;
}

function getDateLabel(post: BlogPostDoc): string | null {
    const raw = post.publishedAt || post.createdAt;
    if (!raw) return null;
    const d = new Date(raw);
    if (Number.isNaN(d.getTime())) return null;
    return d.toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
    });
}

function isNumericId(value: string): boolean {
    return /^[0-9]+$/.test(value);
}

async function fetchPostBySlugOrId(slugOrId: string): Promise<BlogPostDoc | null> {
    const apiKey = process.env.PAYLOAD_API_KEY;
    if (!apiKey) return null;

    const apiUrl =
        process.env.NEXT_PUBLIC_API_URL ||
        process.env.NEXT_PUBLIC_CMS_API_URL ||
        "https://cms.grandlinemaritime.com/api";

    const headers: Record<string, string> = {
        "Content-Type": "application/json",
        Authorization: `users API-Key ${apiKey}`,
    };

    if (isNumericId(slugOrId)) {
        const res = await fetch(`${apiUrl}/posts/${slugOrId}`, {
            headers,
            cache: "no-store",
        });

        if (!res.ok) return null;

        const json = (await res.json()) as PostsResponse | BlogPostDoc;

        if (json && typeof json === "object" && "id" in json) {
            return json as BlogPostDoc;
        }

        const response = json as PostsResponse;
        if (response.doc) {
            return response.doc;
        }

        return null;
    }

    const params = new URLSearchParams();
    params.set("where[slug][equals]", slugOrId);
    params.set("where[status][equals]", "published");
    params.set("limit", "1");

    const res = await fetch(`${apiUrl}/posts?${params.toString()}`, {
        headers,
        cache: "no-store",
    });

    if (!res.ok) return null;

    const json = (await res.json()) as PostsResponse;
    if (Array.isArray(json.docs) && json.docs.length > 0) {
        return json.docs[0];
    }

    if (json.doc) return json.doc;

    return null;
}

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

    const imageUrl = getImageUrl(post);
    const categoryName = getPrimaryCategoryName(post);
    const dateLabel = getDateLabel(post);

    return (
        <main className="min-h-screen">
            <Header />

            <section className="pt-24 pb-10 bg-[#0f172a]">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                    {categoryName ? (
                        <div className="text-sm text-[#F5F5F5] mb-3">
                            {categoryName}
                        </div>
                    ) : null}
                    <h1 className="heading-primary text-3xl md:text-4xl text-[#F5F5F5] mb-4">
                        {post.title}
                    </h1>
                    {dateLabel ? (
                        <p className="text-sm text-gray-300 mb-6">
                            {dateLabel}
                        </p>
                    ) : null}
                    {post.excerpt ? (
                        <p className="text-lg text-gray-100 max-w-3xl leading-relaxed">
                            {post.excerpt}
                        </p>
                    ) : null}
                </div>
            </section>

            <section className="pb-16 bg-white">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                    {imageUrl ? (
                        <div className="relative h-64 md:h-96 w-full mb-8 rounded-2xl overflow-hidden shadow-lg">
                            <Image
                                src={imageUrl}
                                alt={post.title || ""}
                                fill
                                className="object-cover"
                            />
                        </div>
                    ) : null}

                    <article className="prose prose-lg max-w-none text-gray-800">
                        {typeof post.content === "string" ? (
                            <div
                                dangerouslySetInnerHTML={{ __html: post.content }}
                            />
                        ) : post.excerpt ? (
                            <p className="leading-relaxed">
                                {post.excerpt}
                            </p>
                        ) : (
                            <p className="leading-relaxed">
                                No content available for this article yet.
                            </p>
                        )}
                    </article>
                </div>
            </section>

            <Footer />
        </main>
    );
}
