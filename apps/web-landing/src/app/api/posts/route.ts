import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const status = searchParams.get("status") || "published";
        const limit = searchParams.get("limit") || "8";
        const page = searchParams.get("page") || "1";
        const categoryId = searchParams.get("post-category") || searchParams.get("categoryId") || "";
        const featured = searchParams.get("featured") || "";
        const sort = searchParams.get("sort") || "-updatedAt";

        const params = new URLSearchParams({
            status,
            limit,
            page,
            sort,
        });

        if (categoryId) {
            params.set("where[category][contains]", categoryId);
        }

        if (featured === "true") {
            params.set("where[isFeatured][equals]", "true");
        }

        const headers: Record<string, string> = {
            "Content-Type": "application/json",
        };

        const apiKey = process.env.PAYLOAD_API_KEY;
        if (!apiKey) {
            return NextResponse.json({ error: "API configuration error" }, { status: 500 });
        }

        headers["Authorization"] = `users API-Key ${apiKey}`;

        const apiUrl =
            process.env.NEXT_PUBLIC_API_URL ||
            process.env.NEXT_PUBLIC_CMS_API_URL ||
            "https://cms.grandlinemaritime.com/api";

        const response = await fetch(`${apiUrl}/posts?${params}`, {
            headers,
            cache: "no-store",
        });

        if (!response.ok) {
            return NextResponse.json({ error: "Failed to fetch posts" }, { status: response.status });
        }

        const data = await response.json();

        return NextResponse.json(data, {
            headers: {
                "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600",
            },
        });
    } catch {
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
