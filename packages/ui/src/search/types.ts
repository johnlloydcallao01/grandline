export interface SearchResult {
  id: string
  title: string
  subtitle?: string
  thumbnail?: string
  href: string
  type: string
}

export interface Suggestion {
  label: string
  kind: string
  href?: string
  icon?: string
  typeLabel?: string
}

export interface SearchDataSource {
  recentSearchEnabled: boolean
  search: (query: string, signal?: AbortSignal) => Promise<SearchResult[]>
  searchByCategory: (categoryLabel: string, signal?: AbortSignal) => Promise<SearchResult[]>
  getSuggestions: (query: string) => Promise<Suggestion[]>
  loadRecentKeywords: () => Promise<string[]>
  persistRecentKeyword: (keyword: string) => Promise<void>
}
