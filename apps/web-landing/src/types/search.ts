export interface SearchResult {
    id: string;
    title: string;
    subtitle?: string;
    thumbnail?: string;
    href: string;
    type: 'course';
}

export interface Suggestion {
    label: string;
    kind: 'category' | 'course';
    href?: string;
}
