import Image from "next/image";

import {
  getDateLabel,
  getImageUrl,
  getPrimaryCategoryName,
  type BlogPostDoc,
} from "./blogs-data";

export function BlogPostContent({
  post,
  variant = "landing",
}: {
  post: BlogPostDoc;
  variant?: "landing" | "app";
}) {
  const imageUrl = getImageUrl(post);
  const categoryName = getPrimaryCategoryName(post);
  const dateLabel = getDateLabel(post);
  const title = post.title || "Blog Article";
  const excerpt = typeof post.excerpt === "string" ? post.excerpt : null;

  if (variant === "app") {
    return (
      <div className="min-h-screen bg-[var(--background)] pb-12">
        <div className="sticky top-0 z-30 border-b border-[var(--card-border)] bg-[var(--card-background)]">
          <div className="w-full px-[10px]">
            <div className="py-6">
              {categoryName ? (
                <div className="mb-2 text-sm font-medium text-[#201a7c] dark:text-[#7b75ef]">
                  {categoryName}
                </div>
              ) : null}
              <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 md:text-3xl">
                {title}
              </h1>
              {dateLabel ? (
                <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                  {dateLabel}
                </p>
              ) : null}
              {excerpt ? (
                <p className="mt-3 max-w-4xl text-sm leading-6 text-gray-500 dark:text-gray-400 md:text-base">
                  {excerpt}
                </p>
              ) : null}
            </div>
          </div>
        </div>

        <section className="w-full px-[10px] py-6 md:py-8">
          <div className="space-y-6">
            {imageUrl ? (
              <div className="relative h-64 w-full overflow-hidden rounded-2xl border border-[var(--card-border)] bg-[var(--card-background)] shadow-sm md:h-96">
                <Image
                  src={imageUrl}
                  alt={title}
                  fill
                  sizes="(max-width: 768px) 100vw, 1200px"
                  className="object-cover"
                />
              </div>
            ) : null}

            <article className="rounded-2xl border border-[var(--card-border)] bg-[var(--card-background)] p-6 shadow-sm md:p-8">
              <div className="prose prose-lg max-w-none text-gray-800 dark:prose-invert dark:text-gray-100">
                {typeof post.content === "string" ? (
                  <div dangerouslySetInnerHTML={{ __html: post.content }} />
                ) : excerpt ? (
                  <p className="leading-relaxed">{excerpt}</p>
                ) : (
                  <p className="leading-relaxed">
                    No content available for this article yet.
                  </p>
                )}
              </div>
            </article>
          </div>
        </section>
      </div>
    );
  }

  return (
    <>
      <section className="bg-[#0f172a] pb-10 pt-24">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          {categoryName ? (
            <div className="mb-3 text-sm text-[#F5F5F5]">{categoryName}</div>
          ) : null}
          <h1 className="heading-primary mb-4 text-3xl text-[#F5F5F5] md:text-4xl">
            {title}
          </h1>
          {dateLabel ? (
            <p className="mb-6 text-sm text-gray-300">{dateLabel}</p>
          ) : null}
          {excerpt ? (
            <p className="max-w-3xl text-lg leading-relaxed text-gray-100">
              {excerpt}
            </p>
          ) : null}
        </div>
      </section>

      <section className="bg-white pb-16">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          {imageUrl ? (
            <div className="relative mb-8 h-64 w-full overflow-hidden rounded-2xl shadow-lg md:h-96">
              <Image
                src={imageUrl}
                alt={title}
                fill
                sizes="(max-width: 768px) 100vw, 800px"
                className="object-cover"
              />
            </div>
          ) : null}

          <article className="prose prose-lg max-w-none text-gray-800">
            {typeof post.content === "string" ? (
              <div dangerouslySetInnerHTML={{ __html: post.content }} />
            ) : excerpt ? (
              <p className="leading-relaxed">{excerpt}</p>
            ) : (
              <p className="leading-relaxed">
                No content available for this article yet.
              </p>
            )}
          </article>
        </div>
      </section>
    </>
  );
}
