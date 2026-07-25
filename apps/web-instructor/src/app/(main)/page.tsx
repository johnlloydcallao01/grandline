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
        <section className="mx-auto flex max-w-7xl flex-col gap-8 py-6">
            {/* Hero Section */}
            <div className="rounded-2xl border border-gray-200 bg-white p-8 shadow-sm">
                <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
                    <div className="space-y-4">
                        <span className="inline-flex rounded-full border border-gray-200 bg-gray-50 px-4 py-1.5 text-sm text-gray-600">
                            Grandline Maritime
                        </span>
                        <div className="space-y-3">
                            <h1 className="font-display text-3xl font-semibold tracking-tight text-gray-900 sm:text-4xl">
                                Instructor workspace built for simple course delivery.
                            </h1>
                            <p className="max-w-2xl text-base leading-7 text-gray-600">
                                Manage classes, check learner progress, and stay on top of daily teaching tasks
                                from one focused dashboard.
                            </p>
                        </div>
                        <div className="flex flex-col gap-3 pt-2 sm:flex-row">
                            <a className="btn-primary" href="#overview">
                                View Overview
                            </a>
                            <a className="btn-secondary" href="#features">
                                Explore Features
                            </a>
                        </div>
                    </div>

                    <div className="rounded-xl border border-gray-200 bg-gray-50 p-6 lg:w-96">
                        <div className="mb-5 flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-500">Today&apos;s Focus</p>
                                <h2 className="font-display text-xl font-semibold text-gray-900">Morning Brief</h2>
                            </div>
                            <span className="rounded-full bg-emerald-50 px-3 py-1 text-sm text-emerald-700">
                                Ready
                            </span>
                        </div>
                        <div className="space-y-3">
                            <div className="rounded-xl border border-gray-100 bg-white p-4">
                                <p className="text-sm text-gray-500">Upcoming Session</p>
                                <p className="mt-1.5 text-base font-medium text-gray-900">Bridge Resource Management</p>
                                <p className="mt-1 text-sm text-gray-500">09:30 AM with 18 enrolled trainees</p>
                            </div>
                            <div className="rounded-xl border border-gray-100 bg-white p-4">
                                <p className="text-sm text-gray-500">Action Needed</p>
                                <p className="mt-1.5 text-base font-medium text-gray-900">7 assessments await review</p>
                                <p className="mt-1 text-sm text-gray-500">Prioritize submissions due today.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Highlights */}
            <section id="overview" className="grid gap-4 sm:grid-cols-3">
                {highlights.map((item) => (
                    <div
                        key={item.label}
                        className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm"
                    >
                        <p className="text-sm uppercase tracking-[0.2em] text-gray-500">{item.label}</p>
                        <p className="mt-2 font-display text-4xl font-semibold text-gray-900">{item.value}</p>
                    </div>
                ))}
            </section>

            {/* Quick Links */}
            <section id="features" className="grid gap-5 lg:grid-cols-3">
                {quickLinks.map((item) => (
                    <article
                        key={item.title}
                        className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm"
                    >
                        <p className="text-sm font-medium text-[var(--accent)]">Module</p>
                        <h2 className="mt-2 font-display text-xl font-semibold text-gray-900">{item.title}</h2>
                        <p className="mt-2 text-sm leading-6 text-gray-600">{item.description}</p>
                    </article>
                ))}
            </section>
        </section>
    );
}
