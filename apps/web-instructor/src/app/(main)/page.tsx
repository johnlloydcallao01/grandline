export default function Home() {
    const quickLinks = [
        {
            title: "Courses",
            description: "Review active classes, modules, and lesson progress at a glance.",
        },
        {
            title: "Students",
            description: "Monitor enrollments, progress, and support needs from one place.",
        },
        {
            title: "Schedule",
            description: "Keep upcoming sessions, deadlines, and announcements visible.",
        },
    ];

    const highlights = [
        { label: "Active Courses", value: "12" },
        { label: "Students", value: "248" },
        { label: "Pending Tasks", value: "07" },
    ];

    return (
        <section className="mx-auto flex max-w-7xl flex-col gap-8 text-white">
            <div className="rounded-[32px] border border-white/10 bg-[radial-gradient(circle_at_top,_rgba(49,39,164,0.95),_#0f172a_58%)] p-6 shadow-2xl shadow-black/20 lg:p-10">
                <div className="grid gap-10 lg:grid-cols-[1.3fr_0.9fr] lg:items-center">
                    <div className="space-y-6">
                        <span className="inline-flex rounded-full border border-white/15 bg-white/8 px-4 py-2 text-sm text-slate-200">
                            Grandline Maritime
                        </span>
                        <div className="space-y-4">
                            <h1 className="font-display text-4xl font-semibold tracking-tight sm:text-5xl lg:text-6xl">
                                Instructor workspace built for simple course delivery.
                            </h1>
                            <p className="max-w-2xl text-base leading-7 text-slate-300 sm:text-lg">
                                Manage classes, check learner progress, and stay on top of daily teaching tasks
                                from one focused dashboard.
                            </p>
                        </div>
                        <div className="flex flex-col gap-3 sm:flex-row">
                            <a className="btn-primary" href="#overview">
                                View Overview
                            </a>
                            <a className="btn-secondary" href="#features">
                                Explore Features
                            </a>
                        </div>
                    </div>

                    <div className="rounded-3xl border border-white/10 bg-white/10 p-6 shadow-2xl shadow-black/20 backdrop-blur">
                        <div className="mb-6 flex items-center justify-between">
                            <div>
                                <p className="text-sm text-slate-300">Today&apos;s Focus</p>
                                <h2 className="font-display text-2xl font-semibold">Morning Brief</h2>
                            </div>
                            <span className="rounded-full bg-emerald-400/15 px-3 py-1 text-sm text-emerald-200">
                                Ready
                            </span>
                        </div>
                        <div className="space-y-4">
                            <div className="rounded-2xl bg-slate-950/40 p-4">
                                <p className="text-sm text-slate-400">Upcoming Session</p>
                                <p className="mt-2 text-lg font-medium">Bridge Resource Management</p>
                                <p className="mt-1 text-sm text-slate-300">09:30 AM with 18 enrolled trainees</p>
                            </div>
                            <div className="rounded-2xl bg-slate-950/40 p-4">
                                <p className="text-sm text-slate-400">Action Needed</p>
                                <p className="mt-2 text-lg font-medium">7 assessments await review</p>
                                <p className="mt-1 text-sm text-slate-300">Prioritize submissions due today.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <section id="overview" className="grid gap-4 sm:grid-cols-3">
                {highlights.map((item) => (
                    <div
                        key={item.label}
                        className="rounded-2xl border border-white/10 bg-white/6 p-5 backdrop-blur"
                    >
                        <p className="text-sm uppercase tracking-[0.2em] text-slate-300">{item.label}</p>
                        <p className="mt-3 font-display text-4xl font-semibold">{item.value}</p>
                    </div>
                ))}
            </section>

            <section id="features" className="grid gap-5 lg:grid-cols-3">
                {quickLinks.map((item) => (
                    <article
                        key={item.title}
                        className="rounded-3xl border border-white/10 bg-slate-950/45 p-6 shadow-lg shadow-black/10"
                    >
                        <p className="text-sm text-sky-200">Module</p>
                        <h2 className="mt-3 font-display text-2xl font-semibold">{item.title}</h2>
                        <p className="mt-3 text-sm leading-7 text-slate-300">{item.description}</p>
                    </article>
                ))}
            </section>
        </section>
    );
}
