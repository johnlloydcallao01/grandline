[OPEN] pnpm dev lag investigation

## Session

- Session ID: `pnpm-dev-lag`
- Date: 2026-06-13
- Symptom: Whole PC suddenly lags when running `pnpm run dev`, especially around `apps/cms` and then working in `apps/web-admin`.
- Scope: Repository-level static analysis first, then targeted runtime verification if needed.

## Initial Hypotheses

1. A dev server is watching too many files because ignore rules are missing or a large generated folder is now included in the watch graph.
2. TypeScript language services or Next.js type checking are traversing the full monorepo and shared packages more aggressively than before.
3. One app imports a large workspace package or generated artifact that triggers repeated recompilation across apps.
4. A recent config change in `next.config.*`, `tsconfig.json`, or workspace scripts causes extra transpilation, polling, or cache invalidation on Windows.
5. The lag comes from an external process interacting badly with file watchers, such as antivirus indexing `.next`, build logs, or generated files.

## Investigation Log

- Started by inspecting workspace layout, dev scripts, Next.js configs, TypeScript configs, and ignore files.
- No business logic changes made.
- Confirmed root workspace uses `next@16.2.0`, where `next dev` defaults to Turbopack.
- Confirmed `apps/cms` runs plain `next dev -p 3001`, so it uses the default bundler.
- Confirmed `apps/web-admin` runs plain `next dev --port 3002` and transpiles several heavy packages in dev:
  - `@encreasl/ui`
  - `@encreasl/env`
  - `@payloadcms/ui`
  - `@payloadcms/richtext-lexical`
  - `payload`
- Confirmed `apps/cms/.next` currently occupies about `5.5 GB`.
- Confirmed the largest files in `apps/cms` are Turbopack cache `.sst` files around `232 MB` to `247 MB` each under `.next/dev/cache/turbopack`.
- Confirmed generated Payload source files are present but small compared with the cache:
  - `src/payload-types.ts` about `0.16 MB`
  - `src/payload-generated-schema.ts` about `0.13 MB`
  - `src/app/(payload)/admin/importMap.js` about `0.01 MB`
- Confirmed both `apps/cms` and `apps/web-admin` use broad TypeScript include globs (`**/*.ts`, `**/*.tsx`), increasing editor and tsserver workload across scripts, configs, tests, generated files, and migrations.

## Evidence To Collect

- Root/workspace script topology
- `apps/cms` and `apps/web-admin` dev commands
- Next.js and TypeScript config breadth
- Large generated/log/build artifacts in watched paths
- Ignore coverage for editor/server tooling

## Current Assessment

1. Hypothesis 1 is strongly supported: the machine lag is most likely caused by `apps/cms` Turbopack cache growth and active cache churn during `next dev`.
2. Hypothesis 2 is also supported: broad TypeScript includes plus workspace package traversal can amplify VS Code `tsserver` load while `apps/cms` is already stressing disk and memory.
3. Hypothesis 3 is partially supported: `apps/web-admin` imports shared editor code and transpiles Payload packages, which makes opening or editing that app more expensive while `apps/cms` dev is running.
4. Hypothesis 4 remains plausible: a recent Next.js or Turbopack behavior change may explain why the issue appeared suddenly, but this investigation cannot prove the regression window from the current filesystem alone.
5. Hypothesis 5 is still unverified: antivirus or Windows indexing may be making the Turbopack cache churn much worse.
