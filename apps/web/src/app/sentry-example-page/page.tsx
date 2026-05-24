"use client";

import * as Sentry from "@sentry/nextjs";
import { useState } from "react";

class SentryExampleFrontendError extends Error {
  constructor(message: string | undefined) {
    super(message);
    this.name = "SentryExampleFrontendError";
  }
}

const issuesPageHref = "https://calsiter.sentry.io/issues/?project=4511444208844800";

export default function SentryExamplePage() {
  const [hasSentBackendError, setHasSentBackendError] = useState(false);
  const [isSendingSampleError, setIsSendingSampleError] = useState(false);

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(99,102,241,0.22),_transparent_35%),linear-gradient(180deg,_#0f172a_0%,_#111827_48%,_#020617_100%)] px-6 py-12 text-white">
      <div className="mx-auto flex max-w-5xl flex-col gap-8">
        <section className="overflow-hidden rounded-[32px] border border-white/10 bg-white/6 shadow-2xl shadow-black/20 backdrop-blur-xl">
          <div className="grid gap-8 px-8 py-10 lg:grid-cols-[1.25fr_0.75fr] lg:px-10">
            <div className="space-y-5">
              <span className="inline-flex rounded-full border border-sky-400/20 bg-sky-400/10 px-3 py-1 text-xs font-semibold tracking-[0.2em] text-sky-200 uppercase">
                Sentry Playground
              </span>
              <div className="space-y-3">
                <h1 className="max-w-3xl text-4xl font-semibold tracking-tight sm:text-5xl">
                  Official sample flow for verifying Sentry in `apps/web`
                </h1>
                <p className="max-w-2xl text-sm leading-7 text-slate-300 sm:text-base">
                  This page follows Sentry&apos;s standard Next.js verification approach: trigger a
                  sample frontend error and a sample backend API error, then confirm both appear in
                  your Sentry Issues page.
                </p>
              </div>

              <div className="flex flex-wrap gap-3 text-sm text-slate-200">
                <a
                  className="inline-flex items-center rounded-full bg-white px-4 py-2 font-medium text-slate-950 transition hover:bg-slate-100"
                  href={issuesPageHref}
                  rel="noreferrer"
                  target="_blank"
                >
                  Open Sentry Issues
                </a>
                <span className="inline-flex items-center rounded-full border border-white/10 bg-white/5 px-4 py-2">
                  Project: grandline-apps-web
                </span>
                <span className="inline-flex items-center rounded-full border border-white/10 bg-white/5 px-4 py-2">
                  Flow: frontend + API route
                </span>
              </div>
            </div>

            <div className="grid gap-4">
              <div className="rounded-3xl border border-white/10 bg-slate-950/35 p-5">
                <p className="text-xs font-semibold tracking-[0.2em] text-slate-400 uppercase">
                  Verification
                </p>
                <h2 className="mt-2 text-xl font-semibold text-white">
                  Trigger the sample error flow
                </h2>
                <p className="mt-3 text-sm leading-6 text-slate-300">
                  Click the button below to call the sample API route and then throw the sample
                  frontend error. This matches the verification pattern described in Sentry&apos;s
                  Next.js docs.
                </p>
                <button
                  type="button"
                  className="mt-4 rounded-2xl border border-white/15 bg-white/10 px-4 py-3 text-sm font-semibold text-white transition hover:bg-white/15 disabled:cursor-not-allowed disabled:opacity-50"
                  disabled={isSendingSampleError}
                  onClick={async () => {
                    setIsSendingSampleError(true);

                    await Sentry.startSpan(
                      {
                        name: "Example Frontend/Backend Span",
                        op: "test",
                      },
                      async () => {
                        const response = await fetch("/api/sentry-example-api");

                        if (!response.ok) {
                          setHasSentBackendError(true);
                        }
                      },
                    );

                    throw new SentryExampleFrontendError(
                      "This error is raised on the frontend of the example page.",
                    );
                  }}
                >
                  {isSendingSampleError ? "Sending sample error..." : "Throw sample error"}
                </button>
              </div>

              <div className="rounded-3xl border border-white/10 bg-slate-950/35 p-5">
                <p className="text-xs font-semibold tracking-[0.2em] text-slate-400 uppercase">
                  Result Hint
                </p>
                {hasSentBackendError ? (
                  <div className="mt-3 rounded-2xl border border-emerald-500/20 bg-emerald-500/10 p-4 text-emerald-100">
                    <p className="text-sm font-semibold">Backend API error was triggered</p>
                    <p className="mt-1 text-sm/6 opacity-90">
                      The sample API route returned an error and should also appear in Sentry.
                    </p>
                  </div>
                ) : (
                  <p className="mt-3 text-sm leading-6 text-slate-300">
                    After you trigger the sample flow, check Sentry for both the frontend error and
                    the API route error.
                  </p>
                )}
              </div>
            </div>
          </div>
        </section>

        <section className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="space-y-6">
            <section className="rounded-3xl border border-white/10 bg-white/[0.06] p-6">
              <p className="text-xs font-semibold tracking-[0.2em] text-slate-400 uppercase">How To Use</p>
              <ol className="mt-4 space-y-4 text-sm leading-6 text-slate-300">
                <li>1. Open the Sentry Issues page in another tab.</li>
                <li>2. Click `Throw sample error` on this page.</li>
                <li>3. Confirm the frontend error from `/sentry-example-page` appears in Sentry.</li>
                <li>4. Confirm the backend API error from `/api/sentry-example-api` also appears.</li>
              </ol>
            </section>

            <section className="rounded-3xl border border-white/10 bg-white/[0.06] p-6">
              <p className="text-xs font-semibold tracking-[0.2em] text-slate-400 uppercase">
                Troubleshooting
              </p>
              <ul className="mt-4 space-y-3 text-sm leading-6 text-slate-300">
                <li>Check that `NEXT_PUBLIC_SENTRY_DSN` is configured in `apps/web`.</li>
                <li>Disable ad blockers if browser events are not showing up in Sentry.</li>
                <li>Restart the dev server after changing `.env.local`.</li>
                <li>Use the browser devtools console if you later enable `debug: true` in Sentry init.</li>
              </ul>
            </section>
          </div>

          <aside className="rounded-3xl border border-white/10 bg-white/[0.06] p-6">
            <p className="text-xs font-semibold tracking-[0.2em] text-slate-400 uppercase">
              Official Flow
            </p>
            <div className="mt-4 space-y-4 text-sm leading-6 text-slate-300">
              <p>
                This sample page is intentionally narrow. It exists only to mirror Sentry&apos;s
                documented Next.js verification flow rather than introduce custom connectivity
                logic.
              </p>
              <p>
                The source of truth is whether the sample frontend and backend errors appear in
                your Sentry project after you trigger them from this page.
              </p>
            </div>
          </aside>
        </section>
      </div>
    </main>
  );
}
