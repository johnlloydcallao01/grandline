export type CourseMedia = {
    cloudinaryURL?: string | null;
    url?: string | null;
    thumbnailURL?: string | null;
    alt?: string | null;
};

export type Course = {
    id: string | number;
    title: string;
    excerpt?: string | null;
    thumbnail?: CourseMedia | null;
};

export type CoursesResponse = {
    docs: Course[];
    totalDocs: number;
    limit: number;
    page: number;
    totalPages?: number;
    hasNextPage: boolean;
    hasPrevPage?: boolean;
};

/**
 * Server-side function to fetch courses from the CMS API
 * Used for SSR in web-landing app for SEO optimization
 */
export async function fetchCoursesServer(options: {
    status?: string;
    limit?: number;
    page?: number;
    featured?: boolean;
    categoryId?: string;
    sort?: string;
}): Promise<CoursesResponse> {
    const {
        status = "published",
        limit = 8,
        page = 1,
        featured = false,
        categoryId = "",
        sort = "-updatedAt",
    } = options;

    const params = new URLSearchParams({
        status,
        limit: String(limit),
        page: String(page),
        sort,
    });

    if (categoryId) {
        params.set("where[category][contains]", categoryId);
    }

    if (featured) {
        params.set("where[isFeatured][equals]", "true");
    }

    const headers: Record<string, string> = {
        "Content-Type": "application/json",
    };

    const apiKey = process.env.PAYLOAD_API_KEY;
    if (!apiKey) {
        throw new Error("PAYLOAD_API_KEY is not configured");
    }

    headers["Authorization"] = `users API-Key ${apiKey}`;

    const apiUrl =
        process.env.NEXT_PUBLIC_API_URL ||
        process.env.NEXT_PUBLIC_CMS_API_URL ||
        "https://cms.grandlinemaritime.com/api";

    const response = await fetch(`${apiUrl}/courses?${params}`, {
        headers,
        // Use ISR with 5 minute revalidation for static generation
        // This allows the page to be built statically while staying relatively fresh
        next: { revalidate: 300 }, // 5 minutes
    });

    if (!response.ok) {
        throw new Error(`Failed to fetch courses: ${response.status}`);
    }

    const data = await response.json();
    return data as CoursesResponse;
}

/**
 * Fetch the total count of ALL published courses (not just featured)
 * Used to conditionally show/hide the "View All" button
 */
export async function fetchTotalCoursesCount(): Promise<number> {
    const headers: Record<string, string> = {
        "Content-Type": "application/json",
    };

    const apiKey = process.env.PAYLOAD_API_KEY;
    if (!apiKey) {
        throw new Error("PAYLOAD_API_KEY is not configured");
    }

    headers["Authorization"] = `users API-Key ${apiKey}`;

    const apiUrl =
        process.env.NEXT_PUBLIC_API_URL ||
        process.env.NEXT_PUBLIC_CMS_API_URL ||
        "https://cms.grandlinemaritime.com/api";

    // Fetch with limit=1 to minimize data transfer, we only need totalDocs
    const params = new URLSearchParams({
        status: "published",
        limit: "1",
        page: "1",
    });

    const response = await fetch(`${apiUrl}/courses?${params}`, {
        headers,
        // Use ISR with 5 minute revalidation
        next: { revalidate: 300 }, // 5 minutes
    });

    if (!response.ok) {
        throw new Error(`Failed to fetch total courses count: ${response.status}`);
    }

    const data = await response.json() as CoursesResponse;
    return data.totalDocs || 0;
}
