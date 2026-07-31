'use client'

import React, { useCallback, useEffect, useState } from 'react'
import {
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  Key,
  Plus,
  RefreshCw,
  Search,
  Shield,
  UserCheck,
  Users,
  MoreHorizontal,
} from 'lucide-react'
import { useToast } from '@/components/ui/Toast'
import {
  fetchAccessPermissions,
  type UserCounts,
  type UserSummary,
} from './actions'
import { UserDetailSlideOver } from './UserDetailSlideOver'
import { CreateUserModal } from './CreateUserModal'

const ROLE_OPTIONS = [
  { label: 'All Roles', value: '' },
  { label: 'Admin', value: 'admin' },
  { label: 'Service Account', value: 'service' },
  { label: 'Instructor', value: 'instructor' },
  { label: 'Trainee', value: 'trainee' },
]

const STATUS_OPTIONS = [
  { label: 'All Status', value: '' },
  { label: 'Active', value: 'active' },
  { label: 'Inactive', value: 'inactive' },
]

function roleBadge(role: string) {
  const styles: Record<string, string> = {
    admin: 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/30 dark:text-blue-400 dark:border-blue-800',
    service: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/30 dark:text-amber-400 dark:border-amber-800',
    instructor: 'bg-green-50 text-green-700 border-green-200 dark:bg-green-950/30 dark:text-green-400 dark:border-green-800',
    trainee: 'bg-gray-50 text-gray-600 border-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700',
  }
  const labels: Record<string, string> = {
    admin: 'Admin',
    service: 'Service',
    instructor: 'Instructor',
    trainee: 'Trainee',
  }
  return (
    <span
      className={`inline-flex rounded-md border px-2.5 py-0.5 text-xs font-medium ${styles[role] || styles.trainee}`}
    >
      {labels[role] || role}
    </span>
  )
}

function MetricCard({
  icon: Icon,
  label,
  value,
  sub,
  color,
}: {
  icon: React.ElementType
  label: string
  value: number | string
  sub?: string
  color: string
}) {
  const colors: Record<string, string> = {
    blue: 'text-blue-600 bg-blue-50 border-blue-200 dark:text-blue-400 dark:bg-blue-950/30 dark:border-blue-800',
    amber: 'text-amber-600 bg-amber-50 border-amber-200 dark:text-amber-400 dark:bg-amber-950/30 dark:border-amber-800',
    green: 'text-green-600 bg-green-50 border-green-200 dark:text-green-400 dark:bg-green-950/30 dark:border-green-800',
    purple: 'text-purple-600 bg-purple-50 border-purple-200 dark:text-purple-400 dark:bg-purple-950/30 dark:border-purple-800',
  }
  return (
    <div className="flex items-center gap-4 rounded-xl border border-[var(--card-border)] bg-[var(--card-background)] p-5 shadow-sm">
      <div className={`flex h-12 w-12 items-center justify-center rounded-lg border ${colors[color]}`}>
        <Icon className="h-5 w-5" />
      </div>
      <div>
        <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{value}</p>
        <p className="text-sm text-gray-500 dark:text-gray-400">{label}</p>
        {sub ? <p className="text-xs text-gray-400 dark:text-gray-500">{sub}</p> : null}
      </div>
    </div>
  )
}

function LoadingSkeleton() {
  return (
    <div className="space-y-5">
      <div className="grid grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-24 animate-pulse rounded-xl bg-gray-100 dark:bg-gray-800" />
        ))}
      </div>
      <div className="h-10 w-full animate-pulse rounded-lg bg-gray-100 dark:bg-gray-800" />
      <div className="space-y-2">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="h-12 w-full animate-pulse rounded-lg bg-gray-50 dark:bg-gray-800/50" />
        ))}
      </div>
    </div>
  )
}

export function AccessPermissionsClient() {
  const [users, setUsers] = useState<UserSummary[]>([])
  const [counts, setCounts] = useState<UserCounts | null>(null)
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [limit] = useState(20)
  const [search, setSearch] = useState('')
  const [searchInput, setSearchInput] = useState('')
  const [roleFilter, setRoleFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [selectedUserId, setSelectedUserId] = useState<number | string | null>(null)
  const [isSlideOverOpen, setIsSlideOverOpen] = useState(false)
  const [isCreateOpen, setIsCreateOpen] = useState(false)

  const { addToast } = useToast()

  const load = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const res = await fetchAccessPermissions({
        search: search || undefined,
        role: roleFilter || undefined,
        status: statusFilter || undefined,
        page,
        limit,
      })
      setUsers(res.users)
      setCounts(res.counts)
      setTotal(res.total)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load users.')
    } finally {
      setIsLoading(false)
    }
  }, [search, roleFilter, statusFilter, page, limit])

  useEffect(() => {
    void load()
  }, [load])

  const handleSearch = () => {
    setPage(1)
    setSearch(searchInput)
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') handleSearch()
  }

  const handleRefresh = () => {
    void load()
  }

  const handleRowClick = (user: UserSummary) => {
    setSelectedUserId(user.id)
    setIsSlideOverOpen(true)
  }

  const handleSlideOverClose = () => {
    setIsSlideOverOpen(false)
    setSelectedUserId(null)
  }

  const handleCreated = () => {
    void load()
    addToast({ title: 'User created', message: 'New user has been created successfully.', type: 'success' })
  }

  const handleUpdated = () => {
    void load()
  }

  const handleDeleted = () => {
    void load()
  }

  const handleRoleFilterChange = (value: string) => {
    setRoleFilter(value)
    setPage(1)
  }

  const handleStatusFilterChange = (value: string) => {
    setStatusFilter(value)
    setPage(1)
  }

  const totalPages = Math.ceil(total / limit)
  const startItem = total === 0 ? 0 : (page - 1) * limit + 1
  const endItem = Math.min(page * limit, total)

  return (
    <div className="space-y-6 p-[10px]">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
        <div>
          <p className="text-sm font-medium text-blue-600 dark:text-blue-400">Core / Setup & Controls</p>
          <h1 className="mt-1 text-2xl font-bold text-gray-900 dark:text-gray-100">Access & Permissions</h1>
          <p className="mt-1 text-base text-gray-600 dark:text-gray-400">
            Manage user accounts, roles, and access levels for the accounting system.
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-3">
          <button
            type="button"
            onClick={handleRefresh}
            className="inline-flex items-center gap-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-[var(--card-background)] px-4 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-300 transition-colors hover:bg-gray-50 dark:hover:bg-gray-800"
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
          <button
            type="button"
            onClick={() => setIsCreateOpen(true)}
            className="inline-flex items-center gap-2 rounded-lg border border-blue-600 bg-blue-600 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:border-blue-700 hover:bg-blue-700"
          >
            <Plus className="h-4 w-4" />
            Create User
          </button>
        </div>
      </div>

      {error ? (
        <div className="flex items-center gap-2 rounded-lg border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-950/30 px-4 py-3 text-sm text-red-700 dark:text-red-400">
          <AlertCircle className="h-4 w-4 shrink-0" />
          {error}
        </div>
      ) : null}

      {counts ? (
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          <MetricCard icon={Shield} label="Admin Users" value={counts.admin} sub="Accounting operators" color="blue" />
          <MetricCard icon={Key} label="Service Accounts" value={counts.service} sub="API key integrations" color="amber" />
          <MetricCard icon={UserCheck} label="Active Users" value={counts.active} sub="Can sign in" color="green" />
          <MetricCard icon={Users} label="API Keys Enabled" value={counts.apiKeyEnabled} sub="Programmatic access" color="purple" />
        </div>
      ) : (
        <div className="grid grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-24 animate-pulse rounded-xl bg-gray-100 dark:bg-gray-800" />
          ))}
        </div>
      )}

      <div className="flex flex-wrap items-center gap-3">
        <div className="relative min-w-0 flex-1 md:max-w-xs">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400 dark:text-gray-500" />
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Search by email or name..."
            className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-[var(--card-background)] py-2 pl-10 pr-3 text-sm text-gray-900 dark:text-gray-100 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-800"
          />
        </div>
        <button
          type="button"
          onClick={handleSearch}
          className="inline-flex items-center gap-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-[var(--card-background)] px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 transition-colors hover:bg-gray-50 dark:hover:bg-gray-800"
        >
          <Search className="h-4 w-4" />
          Search
        </button>
        <select
          value={roleFilter}
          onChange={(e) => handleRoleFilterChange(e.target.value)}
          className="rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-[var(--card-background)] px-3 py-2 text-sm text-gray-900 dark:text-gray-100 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-800"
        >
          {ROLE_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        <select
          value={statusFilter}
          onChange={(e) => handleStatusFilterChange(e.target.value)}
          className="rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-[var(--card-background)] px-3 py-2 text-sm text-gray-900 dark:text-gray-100 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-800"
        >
          {STATUS_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      {isLoading ? (
        <LoadingSkeleton />
      ) : (
        <div className="bg-white dark:bg-[var(--card-background)] rounded-xl border border-gray-200 dark:border-[var(--card-border)] shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 dark:border-[var(--card-border)] bg-gray-50/50 dark:bg-gray-800/50">
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Email</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Name</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Role</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Active</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Last Login</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">API Key</th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {users.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-16 text-center text-sm text-gray-500 dark:text-gray-400">
                      <Users className="mx-auto mb-2 h-8 w-8 text-gray-300 dark:text-gray-600" />
                      <p className="font-medium">No users found</p>
                      <p className="mt-1 text-sm text-gray-400 dark:text-gray-500">
                        {search || roleFilter || statusFilter
                          ? 'Try adjusting your search or filters.'
                          : 'Create your first user to get started.'}
                      </p>
                    </td>
                  </tr>
                ) : (
                  users.map((user) => (
                    <tr
                      key={String(user.id)}
                      onClick={() => handleRowClick(user)}
                      className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors group"
                    >
                      <td className="px-4 py-3 text-sm font-medium text-gray-900 dark:text-gray-100">{user.email}</td>
                      <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">
                        {user.firstName} {user.lastName}
                      </td>
                      <td className="px-4 py-3">{roleBadge(user.role)}</td>
                      <td className="px-4 py-3">
                        {user.isActive ? (
                          <span className="inline-flex items-center gap-1.5 text-green-600 dark:text-green-400">
                            <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
                            Yes
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 text-red-500 dark:text-red-400">
                            <span className="h-1.5 w-1.5 rounded-full bg-red-400" />
                            No
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">
                        {user.lastLogin ? new Date(user.lastLogin).toLocaleString() : 'Never'}
                      </td>
                      <td className="px-4 py-3">
                        {user.enableAPIKey ? (
                          <span className="inline-flex items-center gap-1.5 text-amber-600 dark:text-amber-400">
                            <Key className="h-3.5 w-3.5" />
                            Enabled
                          </span>
                        ) : (
                          <span className="text-gray-400 dark:text-gray-500">Disabled</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation()
                            handleRowClick(user)
                          }}
                          className="rounded-lg p-1 text-gray-400 dark:text-gray-500 transition-colors hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-600 dark:hover:text-gray-300"
                        >
                          <MoreHorizontal className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {total > 0 ? (
            <div className="flex items-center justify-between border-t border-gray-200 dark:border-[var(--card-border)] px-4 py-3">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Showing {startItem}–{endItem} of {total}
              </p>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page <= 1}
                  className="inline-flex items-center gap-1 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-[var(--card-background)] px-3 py-1.5 text-sm font-medium text-gray-700 dark:text-gray-300 transition-colors hover:bg-gray-50 dark:hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <ChevronLeft className="h-4 w-4" />
                  Previous
                </button>
                <span className="px-2 text-sm text-gray-500 dark:text-gray-400">
                  Page {page} of {totalPages || 1}
                </span>
                <button
                  type="button"
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page >= totalPages}
                  className="inline-flex items-center gap-1 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-[var(--card-background)] px-3 py-1.5 text-sm font-medium text-gray-700 dark:text-gray-300 transition-colors hover:bg-gray-50 dark:hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Next
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          ) : null}
        </div>
      )}

      <UserDetailSlideOver
        userId={selectedUserId}
        isOpen={isSlideOverOpen}
        onClose={handleSlideOverClose}
        onUpdated={handleUpdated}
        onDeleted={handleDeleted}
      />

      <CreateUserModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onCreated={handleCreated}
      />
    </div>
  )
}
