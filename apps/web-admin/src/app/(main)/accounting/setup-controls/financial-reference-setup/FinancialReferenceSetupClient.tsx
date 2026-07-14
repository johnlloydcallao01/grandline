'use client'

import React, { useCallback, useEffect, useState } from 'react'
import {
  AlertCircle,
  Plus,
  RefreshCw,
  Search,
  Banknote,
  Calendar,
  DollarSign,
  FileText,
  Landmark,
  Layers,
  MapPin,
  Percent,
  PieChart,
  ScrollText,
  Tag,
  Users,
  Building2,
} from 'lucide-react'
import { useToast } from '@/components/ui/Toast'
import {
  fetchFinancialReferenceState,
  type FinancialReferenceStateResponse,
} from './actions'
import { CurrencyEditorSlideOver } from './CurrencyEditorSlideOver'
import { CurrencyCreateModal } from './CurrencyCreateModal'
import { PaymentTermEditorSlideOver } from './PaymentTermEditorSlideOver'
import { PaymentTermCreateModal } from './PaymentTermCreateModal'

type TabId = 'currencies' | 'payment-terms' | 'overview'

const currencyTableColumns = ['Code', 'Name', 'Symbol', 'Base Currency', 'Active', '']
const paymentTermColumns = ['Code', 'Name', 'Due In Days', 'Active', '']

function statusDot(active: boolean) {
  return active ? (
    <span className="inline-flex items-center gap-1.5 text-green-600">
      <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
      Yes
    </span>
  ) : (
    <span className="inline-flex items-center gap-1.5 text-red-500">
      <span className="h-1.5 w-1.5 rounded-full bg-red-400" />
      No
    </span>
  )
}

function MetricCard({ icon: Icon, label, value, sub, color }: {
  icon: React.ElementType; label: string; value: number | string; sub?: string; color: string
}) {
  const colors: Record<string, string> = {
    blue: 'text-blue-600 bg-blue-50 border-blue-200',
    amber: 'text-amber-600 bg-amber-50 border-amber-200',
    green: 'text-green-600 bg-green-50 border-green-200',
    purple: 'text-purple-600 bg-purple-50 border-purple-200',
    slate: 'text-slate-600 bg-slate-50 border-slate-200',
    red: 'text-red-600 bg-red-50 border-red-200',
    teal: 'text-teal-600 bg-teal-50 border-teal-200',
    indigo: 'text-indigo-600 bg-indigo-50 border-indigo-200',
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
      <div className="space-y-2">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-14 w-full animate-pulse rounded-lg bg-gray-50" />
        ))}
      </div>
    </div>
  )
}

export function FinancialReferenceSetupClient() {
  const [activeTab, setActiveTab] = useState<TabId>('currencies')
  const [data, setData] = useState<FinancialReferenceStateResponse | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { addToast } = useToast()

  const [search, setSearch] = useState('')
  const [searchInput, setSearchInput] = useState('')

  const [selectedCurrencyId, setSelectedCurrencyId] = useState<number | string | null>(null)
  const [isCurrencyEditorOpen, setIsCurrencyEditorOpen] = useState(false)
  const [isCurrencyCreateOpen, setIsCurrencyCreateOpen] = useState(false)

  const [selectedPaymentTermId, setSelectedPaymentTermId] = useState<number | string | null>(null)
  const [isPaymentTermEditorOpen, setIsPaymentTermEditorOpen] = useState(false)
  const [isPaymentTermCreateOpen, setIsPaymentTermCreateOpen] = useState(false)

  const load = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const res = await fetchFinancialReferenceState()
      setData(res)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load reference data.')
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => { void load() }, [load])

  const handleSearch = () => {
    setSearch(searchInput)
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') handleSearch()
  }

  const filteredCurrencies = (data?.currencies ?? []).filter((c) => {
    if (!search) return true
    const q = search.toLowerCase()
    return c.code.toLowerCase().includes(q) || c.name.toLowerCase().includes(q) || (c.symbol?.toLowerCase() ?? '').includes(q)
  })

  const filteredPaymentTerms = (data?.paymentTerms ?? []).filter((p) => {
    if (!search) return true
    const q = search.toLowerCase()
    return p.code.toLowerCase().includes(q) || p.name.toLowerCase().includes(q) || String(p.dueInDays).includes(q)
  })

  const counts = data?.counts

  return (
    <div className="space-y-6 p-[10px]">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
        <div>
          <p className="text-sm font-medium text-blue-600">Core / Setup & Controls</p>
          <h1 className="mt-1 text-2xl font-bold text-gray-900">Financial Reference Setup</h1>
          <p className="mt-1 text-base text-gray-600">
            Maintain currency and payment-term reference records used across the accounting system.
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-3">
          <button
            type="button"
            onClick={() => void load()}
            className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
          {activeTab === 'currencies' ? (
            <button
              type="button"
              onClick={() => setIsCurrencyCreateOpen(true)}
              className="inline-flex items-center gap-2 rounded-lg border border-blue-600 bg-blue-600 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:border-blue-700 hover:bg-blue-700"
            >
              <Plus className="h-4 w-4" />
              Create Currency
            </button>
          ) : null}
          {activeTab === 'payment-terms' ? (
            <button
              type="button"
              onClick={() => setIsPaymentTermCreateOpen(true)}
              className="inline-flex items-center gap-2 rounded-lg border border-blue-600 bg-blue-600 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:border-blue-700 hover:bg-blue-700"
            >
              <Plus className="h-4 w-4" />
              Create Payment Term
            </button>
          ) : null}
        </div>
      </div>

      <div className="flex gap-1 border-b border-gray-200">
        {[
          { id: 'currencies' as TabId, label: 'Currencies', icon: DollarSign },
          { id: 'payment-terms' as TabId, label: 'Payment Terms', icon: Calendar },
          { id: 'overview' as TabId, label: 'Reference Overview', icon: PieChart },
        ].map((tab) => (
          <button key={tab.id} type="button" onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-5 py-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === tab.id
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <tab.icon className="h-4 w-4" /> {tab.label}
          </button>
        ))}
      </div>

      {error ? (
        <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <AlertCircle className="h-4 w-4 shrink-0" /> {error}
        </div>
      ) : null}

      {activeTab === 'currencies' && (
        <>
          {counts ? (
            <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
              <MetricCard icon={DollarSign} label="Total Currencies" value={counts.currencies} sub="Reference currency records" color="blue" />
              <MetricCard icon={Banknote} label="Active" value={counts.activeCurrencies} sub="Available for use" color="green" />
              <MetricCard icon={Tag} label="Base Currency" value={counts.baseCurrencies} sub="Functional reporting currency" color="amber" />
              <MetricCard icon={Layers} label="Inactive" value={counts.currencies - counts.activeCurrencies} sub="Archived or disabled" color="slate" />
            </div>
          ) : isLoading ? (
            <div className="grid grid-cols-4 gap-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-24 animate-pulse rounded-xl bg-gray-100" />
              ))}
            </div>
          ) : null}

          <div className="flex flex-wrap items-center gap-3">
            <div className="relative min-w-0 flex-1 md:max-w-xs">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Search code, name, or symbol..."
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
          </div>

          <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50/80">
                    {currencyTableColumns.map((col) => (
                      <th key={col} className="px-5 py-3 font-semibold text-gray-600">{col}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {isLoading ? (
                    <tr><td colSpan={6} className="px-5 py-8"><LoadingSkeleton /></td></tr>
                  ) : filteredCurrencies.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-5 py-16 text-center text-gray-500">
                        <DollarSign className="mx-auto mb-2 h-8 w-8 text-gray-300" />
                        <p className="font-medium">No currencies found</p>
                        <p className="mt-1 text-sm text-gray-400">
                          {search ? 'Try adjusting your search.' : 'Create your first currency to get started.'}
                        </p>
                      </td>
                    </tr>
                  ) : (
                    filteredCurrencies.map((c) => (
                      <tr
                        key={String(c.id)}
                        onClick={() => { setSelectedCurrencyId(c.id); setIsCurrencyEditorOpen(true) }}
                        className="cursor-pointer border-b border-gray-50 transition-colors last:border-b-0 hover:bg-blue-50/40"
                      >
                        <td className="px-5 py-3.5 font-medium text-gray-900 font-mono text-xs">{c.code}</td>
                        <td className="px-5 py-3.5 text-gray-700">{c.name}</td>
                        <td className="px-5 py-3.5 text-gray-600">{c.symbol || '—'}</td>
                        <td className="px-5 py-3.5">
                          {c.isBaseCurrency ? (
                            <span className="inline-flex items-center gap-1 rounded-md border border-amber-200 bg-amber-50 px-2 py-0.5 text-xs font-medium text-amber-700">
                              <Tag className="h-3 w-3" /> Base
                            </span>
                          ) : (
                            <span className="text-gray-400">—</span>
                          )}
                        </td>
                        <td className="px-5 py-3.5">{statusDot(c.isActive)}</td>
                        <td className="px-5 py-3.5 text-right">
                          <button
                            type="button"
                            onClick={(e) => { e.stopPropagation(); setSelectedCurrencyId(c.id); setIsCurrencyEditorOpen(true) }}
                            className="rounded-md border border-gray-200 bg-white px-2.5 py-1 text-xs font-medium text-gray-600 hover:bg-gray-50"
                          >
                            Edit
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {activeTab === 'payment-terms' && (
        <>
          {counts ? (
            <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
              <MetricCard icon={Calendar} label="Total Payment Terms" value={counts.paymentTerms} sub="Reference payment terms" color="blue" />
              <MetricCard icon={Calendar} label="Active" value={counts.activePaymentTerms} sub="Available for use" color="green" />
              <MetricCard icon={Layers} label="Inactive" value={counts.paymentTerms - counts.activePaymentTerms} sub="Archived or disabled" color="slate" />
              <MetricCard icon={ScrollText} label="Default Terms" value="—" sub="Configured in Accounting Settings" color="purple" />
            </div>
          ) : isLoading ? (
            <div className="grid grid-cols-4 gap-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-24 animate-pulse rounded-xl bg-gray-100" />
              ))}
            </div>
          ) : null}

          <div className="flex flex-wrap items-center gap-3">
            <div className="relative min-w-0 flex-1 md:max-w-xs">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Search code or name..."
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
          </div>

          <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50/80">
                    {paymentTermColumns.map((col) => (
                      <th key={col} className="px-5 py-3 font-semibold text-gray-600">{col}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {isLoading ? (
                    <tr><td colSpan={5} className="px-5 py-8"><LoadingSkeleton /></td></tr>
                  ) : filteredPaymentTerms.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-5 py-16 text-center text-gray-500">
                        <Calendar className="mx-auto mb-2 h-8 w-8 text-gray-300" />
                        <p className="font-medium">No payment terms found</p>
                        <p className="mt-1 text-sm text-gray-400">
                          {search ? 'Try adjusting your search.' : 'Create your first payment term to get started.'}
                        </p>
                      </td>
                    </tr>
                  ) : (
                    filteredPaymentTerms.map((p) => (
                      <tr
                        key={String(p.id)}
                        onClick={() => { setSelectedPaymentTermId(p.id); setIsPaymentTermEditorOpen(true) }}
                        className="cursor-pointer border-b border-gray-50 transition-colors last:border-b-0 hover:bg-blue-50/40"
                      >
                        <td className="px-5 py-3.5 font-medium text-gray-900 font-mono text-xs">{p.code}</td>
                        <td className="px-5 py-3.5 text-gray-700">{p.name}</td>
                        <td className="px-5 py-3.5 text-gray-700">{p.dueInDays} day{p.dueInDays !== 1 ? 's' : ''}</td>
                        <td className="px-5 py-3.5">{statusDot(p.isActive)}</td>
                        <td className="px-5 py-3.5 text-right">
                          <button
                            type="button"
                            onClick={(e) => { e.stopPropagation(); setSelectedPaymentTermId(p.id); setIsPaymentTermEditorOpen(true) }}
                            className="rounded-md border border-gray-200 bg-white px-2.5 py-1 text-xs font-medium text-gray-600 hover:bg-gray-50"
                          >
                            Edit
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {activeTab === 'overview' && (
        <>
          {counts ? (
            <div>
              <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                <MetricCard icon={DollarSign} label="Currencies" value={counts.currencies} sub={`${counts.activeCurrencies} active, ${counts.baseCurrencies} base`} color="blue" />
                <MetricCard icon={Calendar} label="Payment Terms" value={counts.paymentTerms} sub={`${counts.activePaymentTerms} active`} color="amber" />
                <MetricCard icon={Landmark} label="Bank Accounts" value={counts.bankAccounts} sub={`${counts.activeBankAccounts} active`} color="green" />
                <MetricCard icon={Percent} label="Tax Codes" value={counts.taxCodes} sub={`${counts.activeTaxCodes} active`} color="purple" />
              </div>
              <div className="mt-4 grid grid-cols-2 gap-4 md:grid-cols-4">
                <MetricCard icon={Building2} label="Branches" value={counts.branches} sub="Reporting dimension" color="indigo" />
                <MetricCard icon={Users} label="Departments" value={counts.departments} sub="Reporting dimension" color="teal" />
                <MetricCard icon={MapPin} label="Locations" value={counts.locations} sub="Reporting dimension" color="slate" />
                <MetricCard icon={FileText} label="Chart of Accounts" value={counts.chartOfAccounts} sub="Ledger accounts" color="red" />
              </div>

              <div className="mt-6 rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
                <h3 className="text-sm font-semibold text-gray-900">Reference Data Quick Links</h3>
                <p className="mt-1 text-xs text-gray-500">Manage these reference records in the Master Records section.</p>
                <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
                  {[
                    { label: 'Bank Accounts', href: '../master-records/business-parties', icon: Landmark, desc: 'Bank, cash, and deposit accounts' },
                    { label: 'Tax Codes', href: '../master-records/core-accounting-masters', icon: Percent, desc: 'VAT, withholding, and other tax codes' },
                    { label: 'Branches', href: '../master-records/organization-reporting-dimensions', icon: Building2, desc: 'Branch reporting dimensions' },
                    { label: 'Chart of Accounts', href: '../master-records/core-accounting-masters', icon: FileText, desc: 'Ledger account structure' },
                  ].map((link) => (
                    <a
                      key={link.label}
                      href={link.href}
                      className="flex items-center gap-3 rounded-lg border border-gray-200 p-3 transition-colors hover:border-blue-200 hover:bg-blue-50/40"
                    >
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-gray-200 bg-gray-50 text-gray-600">
                        <link.icon className="h-4 w-4" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">{link.label}</p>
                        <p className="text-xs text-gray-500">{link.desc}</p>
                      </div>
                    </a>
                  ))}
                </div>
              </div>
            </div>
          ) : isLoading ? (
            <div className="grid grid-cols-4 gap-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="h-24 animate-pulse rounded-xl bg-gray-100" />
              ))}
            </div>
          ) : null}
        </>
      )}

      <CurrencyEditorSlideOver
        currencyId={selectedCurrencyId}
        isOpen={isCurrencyEditorOpen}
        onClose={() => { setIsCurrencyEditorOpen(false); setSelectedCurrencyId(null) }}
        onUpdated={() => void load()}
        onDeleted={() => void load()}
      />

      <CurrencyCreateModal
        isOpen={isCurrencyCreateOpen}
        onClose={() => setIsCurrencyCreateOpen(false)}
        onCreated={() => { void load(); addToast({ title: 'Currency created', message: 'New currency has been created successfully.', type: 'success' }) }}
      />

      <PaymentTermEditorSlideOver
        paymentTermId={selectedPaymentTermId}
        isOpen={isPaymentTermEditorOpen}
        onClose={() => { setIsPaymentTermEditorOpen(false); setSelectedPaymentTermId(null) }}
        onUpdated={() => void load()}
        onDeleted={() => void load()}
      />

      <PaymentTermCreateModal
        isOpen={isPaymentTermCreateOpen}
        onClose={() => setIsPaymentTermCreateOpen(false)}
        onCreated={() => { void load(); addToast({ title: 'Payment term created', message: 'New payment term has been created successfully.', type: 'success' }) }}
      />
    </div>
  )
}
