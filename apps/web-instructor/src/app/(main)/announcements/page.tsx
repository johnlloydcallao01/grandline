'use client'

import React, { useCallback, useEffect, useRef, useState } from 'react'
import {
  createAnnouncement,
  deleteAnnouncement,
  getAnnouncements,
  getCourseOptions,
  updateAnnouncement,
  type AnnouncementDoc,
  type CourseOption,
} from './actions'

const ITEMS_PER_PAGE = 15

const SearchIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" /></svg>
)
const PlusIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 5v14M5 12h14" /></svg>
)
const EyeIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></svg>
)
const EditIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9" /><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z" /></svg>
)
const TrashIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18M8 6V4h8v2M19 6l-1 15H6L5 6M10 11v6M14 11v6" /></svg>
)
const XIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m18 6-12 12M6 6l12 12" /></svg>
)
const MegaphoneIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m3 11 18-5v12L3 13v-2Z" /><path d="M11.6 15.5 13 21H9l-1.5-6" /><path d="M3 11v2" /></svg>
)

function extractText(value: any): string {
  if (!value) return ''
  if (typeof value === 'string') return value
  if (Array.isArray(value)) return value.map(extractText).filter(Boolean).join('\n')
  if (typeof value === 'object') {
    if (typeof value.text === 'string') return value.text
    return Object.values(value).map(extractText).filter(Boolean).join('\n')
  }
  return ''
}

function announcementText(announcement: AnnouncementDoc): string {
  return extractText(announcement.bodyBlocks).trim()
}

function courseId(announcement?: AnnouncementDoc): number | null {
  if (!announcement) return null
  return typeof announcement.course === 'object' ? announcement.course.id : announcement.course || null
}

function courseTitle(announcement: AnnouncementDoc): string {
  if (typeof announcement.course === 'object') return announcement.course.title || `Course #${announcement.course.id}`
  return `Course #${announcement.course}`
}

function creatorName(announcement: AnnouncementDoc): string {
  const creator = announcement.createdBy
  if (!creator || typeof creator === 'number') return '—'
  return `${creator.firstName || ''} ${creator.lastName || ''}`.trim() || creator.email || '—'
}

function formatDate(value?: string | null): string {
  if (!value) return '—'
  return new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })
}

function dateInputValue(value?: string | null): string {
  return value ? value.slice(0, 16) : ''
}

function isActive(announcement: AnnouncementDoc, now = Date.now()): boolean {
  const from = announcement.visibleFrom ? new Date(announcement.visibleFrom).getTime() : 0
  const until = announcement.visibleUntil ? new Date(announcement.visibleUntil).getTime() : Infinity
  return now >= from && now <= until
}

function isExpired(announcement: AnnouncementDoc, now = Date.now()): boolean {
  return Boolean(announcement.visibleUntil && new Date(announcement.visibleUntil).getTime() < now)
}

function toLocalIso(value: string): string | undefined {
  return value ? new Date(value).toISOString() : undefined
}

type EditorState = {
  mode: 'create' | 'edit'
  announcement?: AnnouncementDoc
}

export default function AnnouncementsPage() {
  const [announcements, setAnnouncements] = useState<AnnouncementDoc[]>([])
  const [courses, setCourses] = useState<CourseOption[]>([])
  const [totalDocs, setTotalDocs] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [currentPage, setCurrentPage] = useState(1)
  const [searchTerm, setSearchTerm] = useState('')
  const [courseFilter, setCourseFilter] = useState('all')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [editor, setEditor] = useState<EditorState | null>(null)
  const [detail, setDetail] = useState<AnnouncementDoc | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<AnnouncementDoc | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [actionError, setActionError] = useState<string | null>(null)
  const searchTimer = useRef<ReturnType<typeof setTimeout>>(null)

  const loadAnnouncements = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)
      const result = await getAnnouncements({
        search: debouncedSearch || undefined,
        courseId: courseFilter === 'all' ? undefined : courseFilter,
        page: currentPage,
        limit: ITEMS_PER_PAGE,
      })
      setAnnouncements(result.docs)
      setTotalDocs(result.totalDocs)
      setTotalPages(result.totalPages)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load announcements')
    } finally {
      setIsLoading(false)
    }
  }, [courseFilter, currentPage, debouncedSearch])

  useEffect(() => { loadAnnouncements() }, [loadAnnouncements])

  useEffect(() => {
    getCourseOptions().then(setCourses).catch((err) => setError(err instanceof Error ? err.message : 'Failed to load courses'))
  }, [])

  useEffect(() => {
    if (searchTimer.current) clearTimeout(searchTimer.current)
    searchTimer.current = setTimeout(() => {
      setDebouncedSearch(searchTerm)
      setCurrentPage(1)
    }, 400)
    return () => { if (searchTimer.current) clearTimeout(searchTimer.current) }
  }, [searchTerm])

  const openCreate = () => {
    setActionError(null)
    setEditor({ mode: 'create' })
  }

  const openEdit = (announcement: AnnouncementDoc) => {
    setActionError(null)
    setEditor({ mode: 'edit', announcement })
  }

  const handleSave = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!editor) return
    const form = new FormData(event.currentTarget)
    const title = String(form.get('title') || '')
    const course = Number(form.get('course'))
    const content = String(form.get('content') || '')
    const visibleFrom = toLocalIso(String(form.get('visibleFrom') || ''))
    const visibleUntil = toLocalIso(String(form.get('visibleUntil') || ''))
    const data = { title, course, content, pinned: form.get('pinned') === 'on', visibleFrom, visibleUntil }

    try {
      setIsSaving(true)
      setActionError(null)
      if (editor.mode === 'create') {
        const created = await createAnnouncement(data)
        setAnnouncements((items) => [created, ...items].slice(0, ITEMS_PER_PAGE))
        setTotalDocs((count) => count + 1)
      } else if (editor.announcement) {
        const updated = await updateAnnouncement(editor.announcement.id, data)
        setAnnouncements((items) => items.map((item) => item.id === updated.id ? updated : item))
        if (detail?.id === updated.id) setDetail(updated)
      }
      setEditor(null)
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Failed to save announcement')
    } finally {
      setIsSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!deleteTarget) return
    try {
      setIsDeleting(true)
      setActionError(null)
      await deleteAnnouncement(deleteTarget.id)
      setAnnouncements((items) => items.filter((item) => item.id !== deleteTarget.id))
      setTotalDocs((count) => Math.max(0, count - 1))
      setDeleteTarget(null)
      if (detail?.id === deleteTarget.id) setDetail(null)
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Failed to delete announcement')
    } finally {
      setIsDeleting(false)
    }
  }

  const pagePinned = announcements.filter((item) => item.pinned).length
  const pageActive = announcements.filter((item) => isActive(item)).length
  const pageExpired = announcements.filter((item) => isExpired(item)).length

  if (error) {
    return <div className="p-6 flex min-h-[400px] items-center justify-center"><div className="text-center"><p className="mb-3 font-medium text-red-600 dark:text-red-400">Failed to load announcements</p><p className="mb-4 text-sm text-gray-500 dark:text-gray-400">{error}</p><button onClick={loadAnnouncements} className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700">Retry</button></div></div>
  }

  return (
    <div className="space-y-6 py-6">
      <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <div><h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Announcements</h1><p className="mt-1 text-gray-500 dark:text-gray-400">Share updates with trainees in your courses</p></div>
        <button onClick={openCreate} disabled={courses.length === 0} className="inline-flex items-center rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"><PlusIcon className="mr-2 h-4 w-4" />New Announcement</button>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {[
          ['Total', totalDocs, 'text-blue-600 dark:text-blue-400', 'bg-blue-50 dark:bg-blue-950/30'],
          ['Pinned', pagePinned, 'text-purple-600 dark:text-purple-400', 'bg-purple-50 dark:bg-purple-950/30'],
          ['Active', pageActive, 'text-green-600 dark:text-green-400', 'bg-green-50 dark:bg-green-950/30'],
          ['Expired', pageExpired, 'text-amber-600 dark:text-amber-400', 'bg-amber-50 dark:bg-amber-950/30'],
        ].map(([label, value, color, bg]) => <div key={String(label)} className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm dark:border-[var(--card-border)] dark:bg-[var(--card-background)]"><div className={`mb-2 inline-flex rounded-lg p-2 ${bg}`}><MegaphoneIcon className={`h-5 w-5 ${color}`} /></div><p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{isLoading ? '—' : value}</p><p className="text-xs text-gray-500 dark:text-gray-400">{label}{label !== 'Total' ? ' on this page' : ''}</p></div>)}
      </div>

      <div className="flex flex-col gap-3 rounded-xl border border-gray-200 bg-white p-4 shadow-sm sm:flex-row dark:border-[var(--card-border)] dark:bg-[var(--card-background)]">
        <div className="relative flex-1"><SearchIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" /><input value={searchTerm} onChange={(event) => setSearchTerm(event.target.value)} placeholder="Search by title..." className="w-full rounded-lg border border-gray-300 bg-white py-2 pl-10 pr-4 text-sm text-gray-900 placeholder:text-gray-400 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-[var(--card-background)] dark:text-gray-100" /></div>
        <select value={courseFilter} onChange={(event) => { setCourseFilter(event.target.value); setCurrentPage(1) }} className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 dark:border-gray-600 dark:bg-[var(--card-background)] dark:text-gray-100"><option value="all">All My Courses</option>{courses.map((course) => <option key={course.id} value={course.id}>{course.title}{course.code ? ` (${course.code})` : ''}</option>)}</select>
      </div>

      {isLoading ? <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm dark:border-[var(--card-border)] dark:bg-[var(--card-background)]"><div className="space-y-4 p-6">{Array.from({ length: 6 }).map((_, index) => <div key={index} className="h-12 animate-pulse rounded bg-gray-100 dark:bg-gray-800" />)}</div></div> : announcements.length === 0 ? <div className="rounded-xl border border-gray-200 bg-white p-12 text-center shadow-sm dark:border-[var(--card-border)] dark:bg-[var(--card-background)]"><MegaphoneIcon className="mx-auto mb-4 h-12 w-12 text-gray-300 dark:text-gray-600" /><h3 className="mb-1 text-lg font-semibold text-gray-900 dark:text-gray-100">No announcements found</h3><p className="text-sm text-gray-500 dark:text-gray-400">{debouncedSearch || courseFilter !== 'all' ? 'Try adjusting your search or course filter.' : 'Create your first announcement for your courses.'}</p></div> : <>
        <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white shadow-sm dark:border-[var(--card-border)] dark:bg-[var(--card-background)]"><table className="w-full min-w-[850px]"><thead><tr className="border-b border-gray-200 bg-gray-50/60 dark:border-[var(--card-border)] dark:bg-gray-800/50"><th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Title</th><th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Course</th><th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Visibility</th><th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Created</th><th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Author</th><th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-gray-500">Actions</th></tr></thead><tbody className="divide-y divide-gray-100 dark:divide-gray-800">{announcements.map((announcement) => <tr key={announcement.id} className="group hover:bg-gray-50 dark:hover:bg-gray-800/50"><td className="px-4 py-3"><div className="flex items-center gap-2"><span className="font-medium text-gray-900 dark:text-gray-100">{announcement.title}</span>{announcement.pinned && <span className="rounded-full bg-purple-50 px-2 py-0.5 text-[10px] font-semibold text-purple-700 dark:bg-purple-900/30 dark:text-purple-300">Pinned</span>}</div><p className="mt-1 max-w-xs truncate text-xs text-gray-500 dark:text-gray-400">{announcementText(announcement) || 'No content'}</p></td><td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">{courseTitle(announcement)}</td><td className="px-4 py-3">{isActive(announcement) ? <span className="rounded-full bg-green-50 px-2 py-1 text-xs font-medium text-green-700 dark:bg-green-900/30 dark:text-green-300">Active</span> : isExpired(announcement) ? <span className="rounded-full bg-amber-50 px-2 py-1 text-xs font-medium text-amber-700 dark:bg-amber-900/30 dark:text-amber-300">Expired</span> : <span className="rounded-full bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">Scheduled</span>}<p className="mt-1 text-[11px] text-gray-400">{formatDate(announcement.visibleFrom)}</p></td><td className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">{formatDate(announcement.createdAt)}</td><td className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">{creatorName(announcement)}</td><td className="px-4 py-3 text-right"><div className="flex justify-end gap-1 opacity-0 transition-opacity group-hover:opacity-100"><button onClick={() => setDetail(announcement)} title="View details" className="rounded-lg p-1.5 text-gray-400 hover:bg-blue-50 hover:text-blue-600 dark:hover:bg-blue-900/20"><EyeIcon className="h-4 w-4" /></button><button onClick={() => openEdit(announcement)} title="Edit" className="rounded-lg p-1.5 text-gray-400 hover:bg-blue-50 hover:text-blue-600 dark:hover:bg-blue-900/20"><EditIcon className="h-4 w-4" /></button><button onClick={() => { setActionError(null); setDeleteTarget(announcement) }} title="Delete" className="rounded-lg p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/20"><TrashIcon className="h-4 w-4" /></button></div></td></tr>)}</tbody></table></div>
        {totalPages > 1 && <div className="flex items-center justify-between rounded-xl border border-gray-200 bg-white px-4 py-3 shadow-sm dark:border-[var(--card-border)] dark:bg-[var(--card-background)]"><p className="text-sm text-gray-500">Showing {(currentPage - 1) * ITEMS_PER_PAGE + 1}–{Math.min(currentPage * ITEMS_PER_PAGE, totalDocs)} of {totalDocs}</p><div className="flex gap-2"><button onClick={() => setCurrentPage((page) => Math.max(1, page - 1))} disabled={currentPage === 1} className="rounded-lg border px-3 py-1.5 text-sm disabled:opacity-40">Previous</button><button onClick={() => setCurrentPage((page) => Math.min(totalPages, page + 1))} disabled={currentPage === totalPages} className="rounded-lg border px-3 py-1.5 text-sm disabled:opacity-40">Next</button></div></div>}
      </>}

      {editor && <EditorDrawer editor={editor} courses={courses} isSaving={isSaving} error={actionError} onClose={() => !isSaving && setEditor(null)} onSave={handleSave} />}
      {detail && <DetailDrawer announcement={detail} onClose={() => setDetail(null)} onEdit={() => { setDetail(null); openEdit(detail as AnnouncementDoc) }} />}
      {deleteTarget && <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={() => !isDeleting && setDeleteTarget(null)}><div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl dark:bg-[var(--card-background)]" onClick={(event) => event.stopPropagation()}><div className="mb-4 text-center"><TrashIcon className="mx-auto mb-3 h-10 w-10 text-red-500" /><h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">Delete Announcement?</h3><p className="mt-2 text-sm text-gray-500 dark:text-gray-400">This will permanently delete <strong>{deleteTarget.title}</strong>.</p></div>{actionError && <p className="mb-3 rounded-lg bg-red-50 p-3 text-sm text-red-700">{actionError}</p>}<div className="flex gap-3"><button onClick={() => setDeleteTarget(null)} disabled={isDeleting} className="flex-1 rounded-lg border px-4 py-2 text-sm">Cancel</button><button onClick={handleDelete} disabled={isDeleting} className="flex-1 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white disabled:opacity-50">{isDeleting ? 'Deleting...' : 'Delete'}</button></div></div></div>}
    </div>
  )
}

function EditorDrawer({ editor, courses, isSaving, error, onClose, onSave }: { editor: EditorState; courses: CourseOption[]; isSaving: boolean; error: string | null; onClose: () => void; onSave: (event: React.FormEvent<HTMLFormElement>) => void }) {
  const announcement = editor.announcement
  const content = announcement ? extractText(announcement.bodyBlocks) : ''
  return <div className="fixed inset-0 z-50 flex justify-end" onClick={onClose}><div className="absolute inset-0 bg-black/30" /><form onSubmit={onSave} onClick={(event) => event.stopPropagation()} className="relative h-full w-full max-w-xl overflow-y-auto bg-white shadow-2xl dark:bg-[var(--card-background)]"><div className="sticky top-0 z-10 flex items-center justify-between border-b bg-white px-6 py-4 dark:border-[var(--card-border)] dark:bg-[var(--card-background)]"><h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">{editor.mode === 'create' ? 'New Announcement' : 'Edit Announcement'}</h2><button type="button" onClick={onClose} disabled={isSaving} className="rounded-lg p-1 text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"><XIcon className="h-5 w-5" /></button></div><div className="space-y-5 p-6">{error && <p className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</p>}<div><label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">Title</label><input name="title" required defaultValue={announcement?.title || ''} className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm dark:border-gray-600 dark:bg-[var(--card-background)] dark:text-gray-100" /></div><div><label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">Course</label><select name="course" required defaultValue={courseId(announcement)?.toString() || ''} className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm dark:border-gray-600 dark:bg-[var(--card-background)] dark:text-gray-100"><option value="">Select a course</option>{courses.map((course) => <option key={course.id} value={course.id}>{course.title}{course.code ? ` (${course.code})` : ''}</option>)}</select></div><div><label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">Content</label><textarea name="content" rows={8} defaultValue={content} placeholder="Write an update for your trainees..." className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm dark:border-gray-600 dark:bg-[var(--card-background)] dark:text-gray-100" /></div><label className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300"><input type="checkbox" name="pinned" defaultChecked={Boolean(announcement?.pinned)} className="accent-blue-600" /> Pin this announcement</label><div className="grid gap-4 sm:grid-cols-2"><div><label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">Visible from</label><input type="datetime-local" name="visibleFrom" defaultValue={dateInputValue(announcement?.visibleFrom)} className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm dark:border-gray-600 dark:bg-[var(--card-background)] dark:text-gray-100" /></div><div><label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">Visible until</label><input type="datetime-local" name="visibleUntil" defaultValue={dateInputValue(announcement?.visibleUntil)} className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm dark:border-gray-600 dark:bg-[var(--card-background)] dark:text-gray-100" /></div></div></div><div className="sticky bottom-0 flex gap-3 border-t bg-white px-6 py-4 dark:border-[var(--card-border)] dark:bg-[var(--card-background)]"><button type="button" onClick={onClose} disabled={isSaving} className="flex-1 rounded-lg border px-4 py-2 text-sm">Cancel</button><button type="submit" disabled={isSaving} className="flex-1 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white disabled:opacity-50">{isSaving ? 'Saving...' : 'Save Announcement'}</button></div></form></div>
}

function DetailDrawer({ announcement, onClose, onEdit }: { announcement: AnnouncementDoc; onClose: () => void; onEdit: () => void }) {
  return <div className="fixed inset-0 z-50 flex justify-end" onClick={onClose}><div className="absolute inset-0 bg-black/30" /><div onClick={(event) => event.stopPropagation()} className="relative h-full w-full max-w-xl overflow-y-auto bg-white shadow-2xl dark:bg-[var(--card-background)]"><div className="sticky top-0 z-10 flex items-center justify-between border-b bg-white px-6 py-4 dark:border-[var(--card-border)] dark:bg-[var(--card-background)]"><h2 className="truncate pr-4 text-lg font-bold text-gray-900 dark:text-gray-100">Announcement Details</h2><button onClick={onClose} className="rounded-lg p-1 text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"><XIcon className="h-5 w-5" /></button></div><div className="space-y-6 p-6"><div><div className="mb-2 flex items-center gap-2">{announcement.pinned && <span className="rounded-full bg-purple-50 px-2 py-1 text-xs font-medium text-purple-700 dark:bg-purple-900/30 dark:text-purple-300">Pinned</span>}<span className="text-xs text-gray-500">{isActive(announcement) ? 'Active' : isExpired(announcement) ? 'Expired' : 'Scheduled'}</span></div><h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">{announcement.title}</h3></div><div className="grid grid-cols-2 gap-4 border-y py-4 text-sm dark:border-[var(--card-border)]"><div><span className="text-gray-500">Course</span><p className="mt-1 font-medium text-gray-900 dark:text-gray-100">{courseTitle(announcement)}</p></div><div><span className="text-gray-500">Author</span><p className="mt-1 font-medium text-gray-900 dark:text-gray-100">{creatorName(announcement)}</p></div><div><span className="text-gray-500">Visible from</span><p className="mt-1 font-medium text-gray-900 dark:text-gray-100">{formatDate(announcement.visibleFrom)}</p></div><div><span className="text-gray-500">Visible until</span><p className="mt-1 font-medium text-gray-900 dark:text-gray-100">{formatDate(announcement.visibleUntil)}</p></div></div><div><h3 className="mb-2 text-sm font-semibold uppercase tracking-wider text-gray-500">Content</h3><p className="whitespace-pre-wrap text-sm leading-6 text-gray-700 dark:text-gray-300">{announcementText(announcement) || 'No content'}</p></div><div className="flex gap-3 border-t pt-4 dark:border-[var(--card-border)]"><button onClick={onEdit} className="flex-1 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"><EditIcon className="mr-2 inline h-4 w-4" />Edit</button><button onClick={onClose} className="flex-1 rounded-lg border px-4 py-2 text-sm">Close</button></div></div></div></div>
}
