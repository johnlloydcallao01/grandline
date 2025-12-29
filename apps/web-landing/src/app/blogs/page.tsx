import { Suspense } from "react";
import { BlogsClient } from "./BlogsClient";

type BlogCategory = {
    id: number;
    name: string;
};

async function fetchActiveAssignedPostCategories(): Promise<BlogCategory[]> {
    const apiKey = process.env.PAYLOAD_API_KEY;
    if (!apiKey) return [];

    const apiUrl =
        process.env.NEXT_PUBLIC_API_URL ||
        process.env.NEXT_PUBLIC_CMS_API_URL ||
        "https://cms.grandlinemaritime.com/api";

    const res = await fetch(`${apiUrl}/post-categories/active`, {
        headers: {
            "Content-Type": "application/json",
            PAYLOAD_API_KEY: apiKey,
        },
        cache: "no-store",
    });

    if (!res.ok) return [];

    const json = (await res.json()) as { categories?: unknown };
    const raw = Array.isArray(json.categories) ? (json.categories as Array<Record<string, unknown>>) : [];

    const mapped: Array<{ id: number; name: string; displayOrder: number }> = [];

    for (const cat of raw) {
        const idValue = cat.id;
        const nameValue = cat.name;
        const orderValue = cat.displayOrder;

        const id = typeof idValue === "number" ? idValue : Number(idValue);
        const name = typeof nameValue === "string" ? nameValue : "";
        const displayOrder = typeof orderValue === "number" ? orderValue : 0;

        if (!Number.isFinite(id) || !name) continue;

        mapped.push({ id, name, displayOrder });
    }

    mapped.sort((a, b) => {
        if (a.displayOrder !== b.displayOrder) return a.displayOrder - b.displayOrder;
        return a.name.localeCompare(b.name);
    });

    const seen = new Set<number>();
    const result: BlogCategory[] = [];

    for (const cat of mapped) {
        if (seen.has(cat.id)) continue;
        seen.add(cat.id);
        result.push({ id: cat.id, name: cat.name });
    }

    return result;
}

export default async function BlogsPage() {
    const categories = await fetchActiveAssignedPostCategories();

    return (
        <Suspense fallback={<div className="min-h-screen bg-white" />}>
            <BlogsClient categories={categories} />
        </Suspense>
    );
}
