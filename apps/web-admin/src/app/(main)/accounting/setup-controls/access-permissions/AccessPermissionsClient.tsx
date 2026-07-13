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
    admin: 'bg-blue-50 text-blue-700 border-blue-200',
    service: 'bg-amber-50 text-amber-700 border-amber-200',
    instructor: 'bg-green-50 text-green-700 border-green-200',
    trainee: 'bg-gray-50 text-gray-600 border-gray-200',
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
    blue: 'text-blue-600 bg-blue-50 border-blue-200',
    amber: 'text-amber-600 bg-amber-50 border-amber-200',
    green: 'text-green-600 bg-green-50 border-green-200',
    purple: 'text-purple-600 bg-purple-50 border-purple-200',
  }
  return (
    <div className="flex items-center gap-4 rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
      <div className={`flex h-12 w-12 items-center justify-center rounded-lg border ${colors[color]}`}>
        <Icon className="h-5 w-5" />
      </div>
      <div>
        <p className="text-2xl font-bold text-gray-900">{value}</p>
        <p className="text-sm text-gray-500">{label}</p>
        {sub ? <p className="text-xs text-gray-400">{sub}</p> : null}
      </div>
    </div>
  )
}

function LoadingSkeleton() {
  return (
    <div className="space-y-5">
      <div className="grid grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-24 animate-pulse rounded-xl bg-gray-100" />
        ))}
      </div>
      <div className="h-10 w-full animate-pulse rounded-lg bg-gray-100" />
      <div className="space-y-2">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="h-12 w-full animate-pulse rounded-lg bg-gray-50" />
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
    <div className="space-y-6 p-6">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
        <div>
          <p className="text-sm font-medium text-blue-600">Core / Setup & Controls</p>
          <h1 className="mt-1 text-2xl font-bold text-gray-900">Access & Permissions</h1>
          <p className="mt-1 text-base text-gray-600">
            Manage user accounts, roles, and access levels for the accounting system.
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-3">
          <button
            type="button"
            onClick={handleRefresh}
            className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
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
        <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
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
            <div key={i} className="h-24 animate-pulse rounded-xl bg-gray-100" />
          ))}
        </div>
      )}

      <div className="flex flex-wrap items-center gap-3">
        <div className="relative min-w-0 flex-1 md:max-w-xs">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Search by email or name..."
            className="w-full rounded-lg border border-gray-300 bg-white py-2 pl-10 pr-3 text-sm text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          />
        </div>
        <button
          type="button"
          onClick={handleSearch}
          className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
        >
          <Search className="h-4 w-4" />
          Search
        </button>
        <select
          value={roleFilter}
          onChange={(e) => handleRoleFilterChange(e.target.value)}
          className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
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
          className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
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
        <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/80">
                  <th className="px-5 py-3 font-semibold text-gray-600">Email</th>
                  <th className="px-5 py-3 font-semibold text-gray-600">Name</th>
                  <th className="px-5 py-3 font-semibold text-gray-600">Role</th>
                  <th className="px-5 py-3 font-semibold text-gray-600">Active</th>
                  <th className="px-5 py-3 font-semibold text-gray-600">Last Login</th>
                  <th className="px-5 py-3 font-semibold text-gray-600">API Key</th>
                  <th className="w-12 px-5 py-3" />
                </tr>
              </thead>
              <tbody>
                {users.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-5 py-16 text-center text-gray-500">
                      <Users className="mx-auto mb-2 h-8 w-8 text-gray-300" />
                      <p className="font-medium">No users found</p>
                      <p className="mt-1 text-sm text-gray-400">
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
                      className="cursor-pointer border-b border-gray-50 transition-colors last:border-b-0 hover:bg-blue-50/40"
                    >
                      <td className="px-5 py-3.5 font-medium text-gray-900">{user.email}</td>
                      <td className="px-5 py-3.5 text-gray-700">
                        {user.firstName} {user.lastName}
                      </td>
                      <td className="px-5 py-3.5">{roleBadge(user.role)}</td>
                      <td className="px-5 py-3.5">
                        {user.isActive ? (
                          <span className="inline-flex items-center gap-1.5 text-green-600">
                            <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
                            Yes
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 text-red-500">
                            <span className="h-1.5 w-1.5 rounded-full bg-red-400" />
                            No
                          </span>
                        )}
                      </td>
                      <td className="px-5 py-3.5 text-gray-500">
                        {user.lastLogin ? new Date(user.lastLogin).toLocaleString() : 'Never'}
                      </td>
                      <td className="px-5 py-3.5">
                        {user.enableAPIKey ? (
                          <span className="inline-flex items-center gap-1.5 text-amber-600">
                            <Key className="h-3.5 w-3.5" />
                            Enabled
                          </span>
                        ) : (
                          <span className="text-gray-400">Disabled</span>
                        )}
                      </td>
                      <td className="px-5 py-3.5">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation()
                            handleRowClick(user)
                          }}
                          className="rounded-lg p-1 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
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
            <div className="flex items-center justify-between border-t border-gray-100 px-5 py-3">
              <p className="text-sm text-gray-500">
                Showing {startItem}–{endItem} of {total}
              </p>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page <= 1}
                  className="inline-flex items-center gap-1 rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <ChevronLeft className="h-4 w-4" />
                  Previous
                </button>
                <span className="px-2 text-sm text-gray-500">
                  Page {page} of {totalPages || 1}
                </span>
                <button
                  type="button"
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page >= totalPages}
                  className="inline-flex items-center gap-1 rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
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
