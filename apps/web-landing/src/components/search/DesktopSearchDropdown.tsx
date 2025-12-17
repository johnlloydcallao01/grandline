'use client'

import React from 'react'
import { useSearch } from '@/hooks/useSearch'
import { SearchList } from './SearchList'

export function DesktopSearchDropdown(): React.ReactNode {
    const { isDropdownOpen } = useSearch()

    if (!isDropdownOpen) return null

    return (
        <div className="absolute left-0 right-0 top-full mt-1 z-50 bg-white rounded-md shadow max-h-96 overflow-auto border border-gray-200">
            <SearchList />
        </div>
    )
}
