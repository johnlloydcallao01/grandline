'use client';

import { usePathname, useRouter } from 'next/navigation';

type SidebarProps = {
  isOpen: boolean;
  onToggle: () => void;
};

const navigationItems = [
  { href: '/', label: 'Overview', shortLabel: 'OV', icon: 'dashboard' },
  { href: '/courses', label: 'Courses', shortLabel: 'CR', icon: 'courses' },
  { href: '/students', label: 'Students', shortLabel: 'ST', icon: 'students' },
  { href: '/schedule', label: 'Schedule', shortLabel: 'SC', icon: 'schedule' },
];

export function Sidebar({ isOpen, onToggle }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();

  return (
    <>
      <button
        type="button"
        onClick={onToggle}
        className={`fixed inset-0 z-30 bg-slate-950/50 transition-opacity lg:hidden ${isOpen ? 'opacity-100' : 'pointer-events-none opacity-0'}`}
        aria-label="Close sidebar overlay"
      />

      <aside
        className={`fixed left-0 top-14 z-40 h-[calc(100vh-3.5rem)] overflow-y-auto border-r border-white/10 bg-slate-950/95 backdrop-blur transition-all duration-300 lg:top-[72px] lg:z-40 lg:h-[calc(100vh-72px)] ${isOpen ? 'w-60 translate-x-0' : 'w-20 -translate-x-full lg:translate-x-0'}`}
        style={{ scrollbarWidth: 'thin' }}
      >
        <div className="flex h-full flex-col p-3">
          <div className="mb-4 rounded-3xl border border-white/10 bg-white/5 p-4">
            <p className={`text-xs uppercase tracking-[0.24em] text-slate-400 ${isOpen ? 'block' : 'hidden lg:block'}`}>
              Workspace
            </p>
            <h2 className={`mt-2 font-display font-semibold text-white ${isOpen ? 'text-lg' : 'hidden lg:block lg:text-center lg:text-sm'}`}>
              {isOpen ? 'Instructor Tools' : 'IT'}
            </h2>
            {isOpen && (
              <p className="mt-2 text-sm leading-6 text-slate-300">
                Teaching tasks, progress tracking, and schedule visibility in one place.
              </p>
            )}
          </div>

          <nav className="space-y-1">
            {navigationItems.map((item) => {
              const isActive = pathname === item.href;

              return (
                <button
                  key={item.href}
                  type="button"
                  onClick={() => router.push(item.href as any)}
                  className={`flex items-center gap-3 rounded-2xl px-3 py-3 transition-colors ${isActive ? 'bg-[var(--primary)] text-white shadow-lg shadow-[#3127a4]/30' : 'text-slate-300 hover:bg-white/8 hover:text-white'}`}
                >
                  <span className={`flex h-10 w-10 items-center justify-center rounded-2xl border text-xs font-semibold ${isActive ? 'border-white/20 bg-white/10' : 'border-white/10 bg-white/5'}`}>
                    {item.shortLabel}
                  </span>
                  <div className={`${isOpen ? 'block' : 'hidden'}`}>
                    <div className="font-medium">{item.label}</div>
                    <div className="text-xs text-slate-200/80 capitalize">{item.icon}</div>
                  </div>
                </button>
              );
            })}
          </nav>

          <div className="mt-auto rounded-3xl border border-white/10 bg-white/5 p-4">
            <p className={`text-xs uppercase tracking-[0.24em] text-slate-400 ${isOpen ? 'block' : 'hidden'}`}>
              Status
            </p>
            <div className="mt-2 flex items-center gap-3">
              <span className="h-3 w-3 rounded-full bg-emerald-400" />
              <span className={`${isOpen ? 'text-sm text-slate-200' : 'hidden'}`}>Ready for classes</span>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
