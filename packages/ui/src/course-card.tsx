"use client";

import React from "react";

export type CourseCardMedia = {
    cloudinaryURL?: string | null;
    url?: string | null;
    thumbnailURL?: string | null;
    alt?: string | null;
};

export type CourseCardCourse = {
    id: string | number;
    title: string;
    excerpt?: string | null;
    thumbnail?: CourseCardMedia | null;
};

export type CourseCardVariant = "carousel" | "grid";

export interface CourseCardProps {
    course: CourseCardCourse;
    variant?: CourseCardVariant;
    href?: string;
    renderLink?: (props: { href: string; className: string; children: React.ReactNode }) => React.ReactNode;
    className?: string;
    wishlistStorageKey?: string;
}

export function CourseCard({
    course,
    variant = "grid",
    href,
    renderLink,
    className = "",
    wishlistStorageKey,
}: CourseCardProps): React.ReactNode {
    const media = course.thumbnail;
    const imageUrl = media?.cloudinaryURL || media?.url || media?.thumbnailURL || null;
    const altText = media?.alt || `${course.title} thumbnail`;

    const storageKey = wishlistStorageKey || `gl:wishlist:course:${course.id}`;
    const [wishlisted, setWishlisted] = React.useState(false);

    React.useEffect(() => {
        try {
            const v = globalThis?.localStorage?.getItem(storageKey);
            setWishlisted(Boolean(v));
        } catch {
            setWishlisted(false);
        }
    }, [storageKey]);

    const baseLinkClassName =
        variant === "carousel" ? "w-64 flex-shrink-0 block" : "group cursor-pointer block";
    const linkClassName = `${baseLinkClassName}${className ? ` ${className}` : ""}`;

    const imageClassName =
        variant === "grid"
            ? "w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            : "w-full h-full object-cover";

    const titleClassName =
        variant === "grid"
            ? "font-medium text-gray-900 group-hover:text-blue-600 transition-colors overflow-hidden"
            : "font-medium text-gray-900 overflow-hidden";

    const resolvedHref = href || `/view-course/${course.id}`;

    const content = (
        <>
            <div className="relative aspect-video bg-gray-200 rounded-lg overflow-hidden mb-3">
                {imageUrl ? (
                    <img
                        src={imageUrl}
                        alt={altText}
                        className={imageClassName}
                        loading="lazy"
                        onError={(e) => {
                            const t = e.currentTarget;
                            t.style.display = "none";
                            t.nextElementSibling?.classList.remove("hidden");
                        }}
                    />
                ) : null}
                <div
                    className={`w-full h-full bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center ${imageUrl ? "hidden" : ""
                        }`}
                >
                    <div className="text-gray-400 text-center">
                        <svg className="w-12 h-12 mx-auto mb-2" fill="currentColor" viewBox="0 0 20 20">
                            <path
                                fillRule="evenodd"
                                d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z"
                                clipRule="evenodd"
                            />
                        </svg>
                        <p className="text-xs">Course Image</p>
                    </div>
                </div>
                <button
                    onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        const next = !wishlisted;
                        setWishlisted(next);
                        try {
                            if (next) {
                                globalThis?.localStorage?.setItem(storageKey, "1");
                            } else {
                                globalThis?.localStorage?.removeItem(storageKey);
                            }
                        } catch {
                            void 0;
                        }
                    }}
                    className="absolute top-3 right-3 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-md hover:bg-gray-50 transition-colors"
                    aria-label="Toggle wishlist"
                    type="button"
                >
                    <i className={`fa fa-heart ${wishlisted ? "text-[#ab3b43]" : "text-gray-300"}`}></i>
                </button>
            </div>
            <div className="space-y-1">
                <h3
                    className={titleClassName}
                    style={{ display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" }}
                >
                    {course.title}
                </h3>
                {course.excerpt ? (
                    <p
                        className="text-sm text-gray-600 overflow-hidden"
                        style={{ display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" }}
                    >
                        {course.excerpt}
                    </p>
                ) : null}
            </div>
        </>
    );

    if (renderLink) {
        return renderLink({ href: resolvedHref, className: linkClassName, children: content });
    }

    return (
        <a href={resolvedHref} className={linkClassName}>
            {content}
        </a>
    );
}

