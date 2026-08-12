"use client"

import React from "react"
import { DesktopSearchDropdown } from "./desktop-search-dropdown"
import { MobileSearchOverlay } from "./mobile-fullscreen-search"

export interface SearchProps {
  variant?: "desktop" | "mobile"
}

export function Search({ variant }: SearchProps) {
  if (variant === "desktop") return <DesktopSearchDropdown />
  if (variant === "mobile") return <MobileSearchOverlay />
  return (
    <React.Fragment>
      <DesktopSearchDropdown />
      <MobileSearchOverlay />
    </React.Fragment>
  )
}

export { SearchProvider, useSearch } from "./search-context"
export type { SearchContextValue, SearchProviderProps } from "./search-context"
export { SearchList } from "./search-list"
export { DesktopSearchDropdown } from "./desktop-search-dropdown"
export { MobileSearchOverlay } from "./mobile-fullscreen-search"
export type {
  SearchResult,
  Suggestion,
  SearchDataSource,
} from "./types"
