'use client'

import { useState, useEffect, useCallback } from 'react'
import { createPortal } from 'react-dom'
import { X, Loader2, Save, Trash2, AlertTriangle, RefreshCw } from 'lucide-react'
import { useToast } from '@/components/ui/Toast'
import {
  fetchUserDetail,
  updateUser,
  deleteUser,
  type UserDetail,
  type UpdateUserData,
} from './actions'

const ROLE_OPTIONS = [
  { label: 'Admin', value: 'admin' },
  { label: 'Service Account', value: 'service' },
  { label: 'Instructor', value: 'instructor' },
  { label: 'Trainee', value: 'trainee' },
]

type UserDetailSlideOverProps = {
  userId: number | string | null
  isOpen: boolean
  onClose: () => void
  onUpdated: () => void
  onDeleted: () => void
}

function FieldLabel({ label, htmlFor }: { label: string; htmlFor?: string }) {
  return (
    <label htmlFor={htmlFor} className="mb-1.5 block text-sm font-medium text-gray-700">
      {label}
    </label>
  )
}

function ReadOnlyField({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <FieldLabel label={label} />
      <p className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-500">
        {value || '-'}
      </p>
    </div>
  )
}

export function UserDetailSlideOver({
  userId,
  isOpen,
  onClose,
  onUpdated,
  onDeleted,
}: UserDetailSlideOverProps) {
  const [mounted, setMounted] = useState(false)
  const [animate, setAnimate] = useState(false)
  const [user, setUser] = useState<UserDetail | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const { addToast } = useToast()

  const [resetPassword, setResetPassword] = useState('')
  const [resetConfirm, setResetConfirm] = useState('')

  const [form, setForm] = useState<Record<string, unknown>>({})

  useEffect(() => {
    if (isOpen) {
      setMounted(true)
      requestAnimationFrame(() => requestAnimationFrame(() => setAnimate(true)))
    } else {
      setAnimate(false)
      const timer = setTimeout(() => setMounted(false), 300)
      return () => clearTimeout(timer)
    }
  }, [isOpen])

  const loadUser = useCallback(async () => {
    if (!userId) return
    setIsLoading(true)
    setLoadError(null)
    try {
      const res = await fetchUserDetail(userId)
      setUser(res.user)
      setForm({
        firstName: res.user.firstName,
        lastName: res.user.lastName,
        email: res.user.email,
        role: res.user.role,
        phone: res.user.phone,
        isActive: res.user.isActive,
        enableAPIKey: res.user.enableAPIKey,
        securityAlertsEmailEnabled: res.user.securityAlertsEmailEnabled,
        pushNotificationsEnabled: res.user.pushNotificationsEnabled,
      })
      setResetPassword('')
      setResetConfirm('')
      setShowDeleteConfirm(false)
      setSaveError(null)
    } catch (err) {
      setLoadError(err instanceof Error ? err.message : 'Failed to load user.')
    } finally {
      setIsLoading(false)
    }
  }, [userId])

  useEffect(() => {
    if (isOpen && userId) {
      void loadUser()
    } else {
      setUser(null)
      setForm({})
      setResetPassword('')
      setResetConfirm('')
      setShowDeleteConfirm(false)
      setLoadError(null)
      setSaveError(null)
    }
  }, [isOpen, userId, loadUser])

  if (!mounted) return null

  const updateField = (key: string, value: unknown) => {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  const handleSave = async () => {
    if (!userId) return
    setSaveError(null)

    if (resetPassword && resetPassword !== resetConfirm) {
      setSaveError('Passwords do not match.')
      return
    }

    if (resetPassword && resetPassword.length < 8) {
      setSaveError('Password must be at least 8 characters.')
      return
    }

    setIsSaving(true)
    try {
      const updateData: UpdateUserData = {}
      const editableFields = [
        'firstName', 'lastName', 'email', 'role', 'phone',
        'isActive', 'enableAPIKey', 'securityAlertsEmailEnabled', 'pushNotificationsEnabled',
      ] as const
      for (const field of editableFields) {
        if (form[field] !== undefined) {
          (updateData as Record<string, unknown>)[field] = form[field]
        }
      }

      if (resetPassword) {
        updateData.resetPassword = resetPassword
      }

      const res = await updateUser(userId, updateData)
      setUser(res.user)
      setForm({
        firstName: res.user.firstName,
        lastName: res.user.lastName,
        email: res.user.email,
        role: res.user.role,
        phone: res.user.phone,
        isActive: res.user.isActive,
        enableAPIKey: res.user.enableAPIKey,
        securityAlertsEmailEnabled: res.user.securityAlertsEmailEnabled,
        pushNotificationsEnabled: res.user.pushNotificationsEnabled,
      })
      setResetPassword('')
      setResetConfirm('')
      addToast({ title: 'User updated', message: `${res.user.firstName} ${res.user.lastName} has been updated.`, type: 'success' })
      onUpdated()
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : 'Failed to update user.')
    } finally {
      setIsSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!userId) return
    setIsDeleting(true)
    try {
      await deleteUser(userId)
      addToast({ title: 'User deleted', message: 'The user has been deleted.', type: 'info' })
      onDeleted()
      onClose()
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : 'Failed to delete user.')
    } finally {
      setIsDeleting(false)
    }
  }

  return createPortal(
    <div
      className={`fixed inset-0 z-50 flex justify-end transition-opacity duration-300 ease-in-out ${
        animate ? 'bg-black/50' : 'bg-transparent'
      }`}
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className={`flex w-full max-w-lg flex-col bg-white shadow-xl transition-all duration-300 ease-in-out ${
          animate ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
          <h2 className="text-lg font-semibold text-gray-900">
            {isLoading ? 'Loading...' : user ? `${user.firstName} ${user.lastName}` : 'User Details'}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-5">
          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
            </div>
          ) : loadError ? (
            <div className="flex flex-col items-center gap-4 py-12">
              <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                <AlertTriangle className="h-4 w-4 shrink-0" />
                {loadError}
              </div>
              <button
                type="button"
                onClick={loadUser}
                className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
              >
                <RefreshCw className="h-4 w-4" />
                Retry
              </button>
            </div>
          ) : user ? (
            <div className="space-y-6">
              {saveError ? (
                <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  <AlertTriangle className="h-4 w-4 shrink-0" />
                  {saveError}
                </div>
              ) : null}

              <section>
                <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-gray-500">Account Information</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <FieldLabel label="First Name" htmlFor="slide-firstName" />
                    <input
                      id="slide-firstName"
                      type="text"
                      value={(form.firstName as string) || ''}
                      onChange={(e) => updateField('firstName', e.target.value)}
                      className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    />
                  </div>
                  <div>
                    <FieldLabel label="Last Name" htmlFor="slide-lastName" />
                    <input
                      id="slide-lastName"
                      type="text"
                      value={(form.lastName as string) || ''}
                      onChange={(e) => updateField('lastName', e.target.value)}
                      className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    />
                  </div>
                </div>
                <div className="mt-4">
                  <FieldLabel label="Email" htmlFor="slide-email" />
                  <input
                    id="slide-email"
                    type="email"
                    value={(form.email as string) || ''}
                    onChange={(e) => updateField('email', e.target.value)}
                    className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />
                </div>
                <div className="mt-4">
                  <FieldLabel label="Phone" htmlFor="slide-phone" />
                  <input
                    id="slide-phone"
                    type="text"
                    value={(form.phone as string) || ''}
                    onChange={(e) => updateField('phone', e.target.value)}
                    className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    placeholder="+63 917 555 0142"
                  />
                </div>
              </section>

              <hr className="border-gray-200" />

              <section>
                <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-gray-500">Access & Status</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <FieldLabel label="Role" htmlFor="slide-role" />
                    <select
                      id="slide-role"
                      value={(form.role as string) || 'trainee'}
                      onChange={(e) => updateField('role', e.target.value)}
                      className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    >
                      {ROLE_OPTIONS.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <FieldLabel label="Status" />
                    <label className="flex cursor-pointer items-center gap-3 rounded-lg border border-gray-200 px-3 py-2.5">
                      <input
                        type="checkbox"
                        checked={form.isActive as boolean}
                        onChange={(e) => updateField('isActive', e.target.checked)}
                        className="h-4 w-4 rounded border-gray-300 text-blue-600 outline-none focus:ring-2 focus:ring-blue-100"
                      />
                      <span className="text-sm font-medium text-gray-700">Active</span>
                    </label>
                  </div>
                </div>
                <div className="mt-4 grid grid-cols-2 gap-4">
                  <label className="flex cursor-pointer items-center gap-3 rounded-lg border border-gray-200 px-3 py-2.5">
                    <input
                      type="checkbox"
                      checked={form.enableAPIKey as boolean}
                      onChange={(e) => updateField('enableAPIKey', e.target.checked)}
                      className="h-4 w-4 rounded border-gray-300 text-blue-600 outline-none focus:ring-2 focus:ring-blue-100"
                    />
                    <div>
                      <span className="text-sm font-medium text-gray-700">API Key</span>
                      <p className="text-xs text-gray-500">Allow API key auth</p>
                    </div>
                  </label>
                  <label className="flex cursor-pointer items-center gap-3 rounded-lg border border-gray-200 px-3 py-2.5">
                    <input
                      type="checkbox"
                      checked={form.securityAlertsEmailEnabled as boolean}
                      onChange={(e) => updateField('securityAlertsEmailEnabled', e.target.checked)}
                      className="h-4 w-4 rounded border-gray-300 text-blue-600 outline-none focus:ring-2 focus:ring-blue-100"
                    />
                    <div>
                      <span className="text-sm font-medium text-gray-700">Security Alerts</span>
                      <p className="text-xs text-gray-500">Password change emails</p>
                    </div>
                  </label>
                </div>
                <div className="mt-4">
                  <label className="flex cursor-pointer items-center gap-3 rounded-lg border border-gray-200 px-3 py-2.5">
                    <input
                      type="checkbox"
                      checked={form.pushNotificationsEnabled as boolean}
                      onChange={(e) => updateField('pushNotificationsEnabled', e.target.checked)}
                      className="h-4 w-4 rounded border-gray-300 text-blue-600 outline-none focus:ring-2 focus:ring-blue-100"
                    />
                    <div>
                      <span className="text-sm font-medium text-gray-700">Push Notifications</span>
                      <p className="text-xs text-gray-500">Browser push notifications</p>
                    </div>
                  </label>
                </div>
              </section>

              <hr className="border-gray-200" />

              <section>
                <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-gray-500">Reset Password</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <FieldLabel label="New Password" htmlFor="slide-password" />
                    <input
                      id="slide-password"
                      type="password"
                      value={resetPassword}
                      onChange={(e) => setResetPassword(e.target.value)}
                      placeholder="Leave blank to keep"
                      autoComplete="new-password"
                      className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    />
                  </div>
                  <div>
                    <FieldLabel label="Confirm Password" htmlFor="slide-confirm" />
                    <input
                      id="slide-confirm"
                      type="password"
                      value={resetConfirm}
                      onChange={(e) => setResetConfirm(e.target.value)}
                      placeholder="Repeat new password"
                      autoComplete="new-password"
                      className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    />
                  </div>
                </div>
              </section>

              <hr className="border-gray-200" />

              <section>
                <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-gray-500">Audit Trail</h3>
                <div className="grid grid-cols-2 gap-4">
                  <ReadOnlyField label="Last Login" value={user.lastLogin ? new Date(user.lastLogin).toLocaleString() : 'Never'} />
                  <ReadOnlyField label="Created" value={user.createdAt ? new Date(user.createdAt).toLocaleString() : '-'} />
                  <ReadOnlyField label="Updated" value={user.updatedAt ? new Date(user.updatedAt).toLocaleString() : '-'} />
                </div>
              </section>

              {showDeleteConfirm ? (
                <div className="rounded-lg border border-red-200 bg-red-50 p-4">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-red-500" />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-red-800">Delete this user?</p>
                      <p className="mt-1 text-sm text-red-600">
                        This action cannot be undone. All data associated with this user will be permanently removed.
                      </p>
                      <div className="mt-4 flex items-center gap-3">
                        <button
                          type="button"
                          onClick={() => setShowDeleteConfirm(false)}
                          disabled={isDeleting}
                          className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          Cancel
                        </button>
                        <button
                          type="button"
                          onClick={handleDelete}
                          disabled={isDeleting}
                          className="inline-flex items-center gap-2 rounded-lg border border-red-600 bg-red-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:border-red-700 hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          {isDeleting ? (
                            <>
                              <Loader2 className="h-4 w-4 animate-spin" />
                              Deleting...
                            </>
                          ) : (
                            <>
                              <Trash2 className="h-4 w-4" />
                              Confirm Delete
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ) : null}
            </div>
          ) : null}
        </div>

        {user && !loadError ? (
          <div className="flex items-center justify-between border-t border-gray-200 px-6 py-4">
            <button
              type="button"
              onClick={() => setShowDeleteConfirm(true)}
              disabled={isSaving || isDeleting || showDeleteConfirm}
              className="inline-flex items-center gap-2 rounded-lg border border-red-300 bg-white px-4 py-2 text-sm font-medium text-red-600 transition-colors hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Trash2 className="h-4 w-4" />
              Delete
            </button>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={onClose}
                disabled={isSaving || isDeleting}
                className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSave}
                disabled={isSaving || isDeleting}
                className="inline-flex items-center gap-2 rounded-lg border border-blue-600 bg-blue-600 px-5 py-2 text-sm font-medium text-white transition-colors hover:border-blue-700 hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4" />
                    Save Changes
                  </>
                )}
              </button>
            </div>
          </div>
        ) : null}
      </div>
    </div>,
    document.body,
  )
}
