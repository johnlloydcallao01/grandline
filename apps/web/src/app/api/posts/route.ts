import { NextRequest, NextResponse } from "next/server";

import { fetchPostsCollection } from "@encreasl/ui/blogs-data";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const result = await fetchPostsCollection({
      status: searchParams.get("status") || "published",
      limit: searchParams.get("limit") || "8",
      page: searchParams.get("page") || "1",
      categoryId:
        searchParams.get("post-category") ||
        searchParams.get("categoryId") ||
        "",
      featured: searchParams.get("featured") || "",
      sort: searchParams.get("sort") || "-updatedAt",
    });

    if (result.status >= 400) {
      return NextResponse.json(result.data, { status: result.status });
    }

    return NextResponse.json(result.data, {
      headers: {
        "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600",
      },
    });
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
