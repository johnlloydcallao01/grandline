'use client'

import { useState, useEffect, useCallback } from 'react'
import { createPortal } from 'react-dom'
import { X, Loader2, Save, Trash2, AlertTriangle, RefreshCw } from 'lucide-react'
import { useToast } from '@/components/ui/Toast'
import { fetchPaymentTerm, updatePaymentTerm, deletePaymentTerm, type PaymentTermRecord, type UpdatePaymentTermData } from './actions'

type PaymentTermEditorSlideOverProps = {
  paymentTermId: number | string | null
  isOpen: boolean
  onClose: () => void
  onUpdated: () => void
  onDeleted: () => void
}

function FieldLabel({ label, htmlFor }: { label: string; htmlFor?: string }) {
  return (
    <label htmlFor={htmlFor} className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
      {label}
    </label>
  )
}

function ReadOnlyField({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <FieldLabel label={label} />
      <p className="rounded-lg border border-gray-200 dark:border-[var(--card-border)] bg-gray-50 dark:bg-gray-800 px-3 py-2 text-sm text-gray-500 dark:text-gray-400">
        {value || '-'}
      </p>
    </div>
  )
}

export function PaymentTermEditorSlideOver({
  paymentTermId,
  isOpen,
  onClose,
  onUpdated,
  onDeleted,
}: PaymentTermEditorSlideOverProps) {
  const [mounted, setMounted] = useState(false)
  const [animate, setAnimate] = useState(false)
  const [record, setRecord] = useState<PaymentTermRecord | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const { addToast } = useToast()

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

  const loadRecord = useCallback(async () => {
    if (!paymentTermId) return
    setIsLoading(true)
    setLoadError(null)
    try {
      const res = await fetchPaymentTerm(paymentTermId)
      setRecord(res)
      setForm({
        code: res.code,
        name: res.name,
        dueInDays: res.dueInDays ?? 0,
        description: res.description ?? '',
        isActive: res.isActive ?? true,
      })
      setShowDeleteConfirm(false)
      setSaveError(null)
    } catch (err) {
      setLoadError(err instanceof Error ? err.message : 'Failed to load payment term.')
    } finally {
      setIsLoading(false)
    }
  }, [paymentTermId])

  useEffect(() => {
    if (isOpen && paymentTermId) {
      void loadRecord()
    } else {
      setRecord(null)
      setForm({})
      setShowDeleteConfirm(false)
      setLoadError(null)
      setSaveError(null)
    }
  }, [isOpen, paymentTermId, loadRecord])

  if (!mounted) return null

  const updateField = (key: string, value: unknown) => {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  const handleSave = async () => {
    if (!paymentTermId) return
    setSaveError(null)
    setIsSaving(true)
    try {
      const updateData: UpdatePaymentTermData = {}
      const editableFields = ['code', 'name', 'dueInDays', 'description', 'isActive'] as const
      for (const field of editableFields) {
        if (form[field] !== undefined) {
          (updateData as Record<string, unknown>)[field] = form[field]
        }
      }
      const res = await updatePaymentTerm(paymentTermId, updateData)
      setRecord(res)
      setForm({
        code: res.code,
        name: res.name,
        dueInDays: res.dueInDays ?? 0,
        description: res.description ?? '',
        isActive: res.isActive ?? true,
      })
      addToast({ title: 'Payment term updated', message: `${res.code} has been updated.`, type: 'success' })
      onUpdated()
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : 'Failed to update payment term.')
    } finally {
      setIsSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!paymentTermId) return
    setIsDeleting(true)
    try {
      await deletePaymentTerm(paymentTermId)
      addToast({ title: 'Payment term deleted', message: 'The payment term has been deleted.', type: 'info' })
      onDeleted()
      onClose()
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : 'Failed to delete payment term.')
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
        className={`flex w-full max-w-lg flex-col bg-white dark:bg-[var(--card-background)] shadow-xl transition-all duration-300 ease-in-out ${
          animate ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between border-b border-gray-200 dark:border-[var(--card-border)] px-6 py-4">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            {isLoading ? 'Loading...' : record ? `${record.code} — ${record.name}` : 'Payment Term Details'}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1 text-gray-400 dark:text-gray-500 transition-colors hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-5">
          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="h-6 w-6 animate-spin text-gray-400 dark:text-gray-500" />
            </div>
          ) : loadError ? (
            <div className="flex flex-col items-center gap-4 py-12">
              <div className="flex items-center gap-2 rounded-lg border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-950/30 px-4 py-3 text-sm text-red-700 dark:text-red-400">
                <AlertTriangle className="h-4 w-4 shrink-0" /> {loadError}
              </div>
              <button
                type="button"
                onClick={loadRecord}
                className="inline-flex items-center gap-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-[var(--card-background)] px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 transition-colors hover:bg-gray-50 dark:hover:bg-gray-800"
              >
                <RefreshCw className="h-4 w-4" /> Retry
              </button>
            </div>
          ) : record ? (
            <div className="space-y-6">
              {saveError ? (
                <div className="flex items-center gap-2 rounded-lg border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-950/30 px-4 py-3 text-sm text-red-700 dark:text-red-400">
                  <AlertTriangle className="h-4 w-4 shrink-0" /> {saveError}
                </div>
              ) : null}

              <section>
                <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">Payment Term Information</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <FieldLabel label="Code" htmlFor="slide-code" />
                    <input
                      id="slide-code"
                      type="text"
                      value={(form.code as string) || ''}
                      onChange={(e) => updateField('code', e.target.value)}
                      className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-[var(--card-background)] px-3 py-2 text-sm text-gray-900 dark:text-gray-100 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-800"
                      placeholder="NET30"
                    />
                  </div>
                  <div>
                    <FieldLabel label="Name" htmlFor="slide-name" />
                    <input
                      id="slide-name"
                      type="text"
                      value={(form.name as string) || ''}
                      onChange={(e) => updateField('name', e.target.value)}
                      className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-[var(--card-background)] px-3 py-2 text-sm text-gray-900 dark:text-gray-100 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-800"
                      placeholder="Net 30 Days"
                    />
                  </div>
                </div>
                <div className="mt-4">
                  <FieldLabel label="Due In Days" htmlFor="slide-dueInDays" />
                  <input
                    id="slide-dueInDays"
                    type="number"
                    value={(form.dueInDays as number) ?? 0}
                    onChange={(e) => updateField('dueInDays', parseInt(e.target.value, 10) || 0)}
                    className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-[var(--card-background)] px-3 py-2 text-sm text-gray-900 dark:text-gray-100 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-800"
                    min={0}
                  />
                </div>
                <div className="mt-4">
                  <FieldLabel label="Description" htmlFor="slide-description" />
                  <textarea
                    id="slide-description"
                    value={(form.description as string) || ''}
                    onChange={(e) => updateField('description', e.target.value)}
                    className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-[var(--card-background)] px-3 py-2 text-sm text-gray-900 dark:text-gray-100 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-800"
                    rows={3}
                    placeholder="Optional description of this payment term"
                  />
                </div>
              </section>

              <hr className="border-gray-200 dark:border-[var(--card-border)]" />

              <section>
                <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">Status</h3>
                <label className="flex cursor-pointer items-center gap-3 rounded-lg border border-gray-200 dark:border-[var(--card-border)] px-3 py-2.5">
                  <input
                    type="checkbox"
                    checked={(form.isActive as boolean) ?? false}
                    onChange={(e) => updateField('isActive', e.target.checked)}
                    className="h-4 w-4 rounded border-gray-300 dark:border-gray-600 text-blue-600 outline-none focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-800"
                  />
                  <div>
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Active</span>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Available for selection on invoices and bills</p>
                  </div>
                </label>
              </section>

              <hr className="border-gray-200 dark:border-[var(--card-border)]" />

              <section>
                <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">Audit Trail</h3>
                <div className="grid grid-cols-2 gap-4">
                  <ReadOnlyField label="Created" value={record.createdAt ? new Date(record.createdAt).toLocaleString() : '-'} />
                  <ReadOnlyField label="Updated" value={record.updatedAt ? new Date(record.updatedAt).toLocaleString() : '-'} />
                </div>
              </section>

              {showDeleteConfirm ? (
                <div className="rounded-lg border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-950/30 p-4">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-red-500 dark:text-red-400" />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-red-800 dark:text-red-300">Delete this payment term?</p>
                      <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                        This action cannot be undone. The payment term will be permanently removed.
                      </p>
                      <div className="mt-4 flex items-center gap-3">
                        <button
                          type="button"
                          onClick={() => setShowDeleteConfirm(false)}
                          disabled={isDeleting}
                          className="inline-flex items-center gap-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-[var(--card-background)] px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 transition-colors hover:bg-gray-50 dark:hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
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
                            <><Loader2 className="h-4 w-4 animate-spin" /> Deleting...</>
                          ) : (
                            <><Trash2 className="h-4 w-4" /> Confirm Delete</>
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

        {record && !loadError ? (
          <div className="flex items-center justify-between border-t border-gray-200 dark:border-[var(--card-border)] px-6 py-4">
            <button
              type="button"
              onClick={() => setShowDeleteConfirm(true)}
              disabled={isSaving || isDeleting || showDeleteConfirm}
              className="inline-flex items-center gap-2 rounded-lg border border-red-300 dark:border-red-800 bg-white dark:bg-[var(--card-background)] px-4 py-2 text-sm font-medium text-red-600 dark:text-red-400 transition-colors hover:bg-red-50 dark:hover:bg-red-950/30 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Trash2 className="h-4 w-4" /> Delete
            </button>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={onClose}
                disabled={isSaving || isDeleting}
                className="inline-flex items-center gap-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-[var(--card-background)] px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 transition-colors hover:bg-gray-50 dark:hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
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
                  <><Loader2 className="h-4 w-4 animate-spin" /> Saving...</>
                ) : (
                  <><Save className="h-4 w-4" /> Save Changes</>
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
