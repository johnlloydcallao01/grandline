import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { BlogPostContent } from "@encreasl/ui/blog-post-content";
import { fetchPostBySlugOrId } from "@encreasl/ui/blogs-data";

type BlogPostPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: BlogPostPageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = await fetchPostBySlugOrId(slug);

  if (!post) {
    return {
      title: "Blog Article | Grandline Maritime",
      description: "The requested blog article could not be found.",
    };
  }

  return {
    title: post.seo?.title || post.title || "Blog Article",
    description: post.seo?.description || post.excerpt || undefined,
  };
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const { slug } = await params;
  const post = await fetchPostBySlugOrId(slug);

  if (!post) {
    notFound();
  }

  return <BlogPostContent post={post} variant="app" />;
}
