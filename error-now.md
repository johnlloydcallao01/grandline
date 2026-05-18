==> Common ways to troubleshoot your deploy: https://render.com/docs/troubleshooting-deploys
==> Build failed 😞
 ELIFECYCLE  Command failed with exit code 1.
Next.js build worker exited with code: 1 and signal: null
  378 |       setActiveTab('html');
  377 |       });
  376 |         setHtmlContent(html);
      |                                             ^
> 375 |         const html = $generateHtmlFromNodes(editor, null);
  374 |       editor.update(() => {
  373 |     if (tab === 'html') {
              Type 'LexicalNode' is missing the following properties from type 'LexicalNode': $config, config
            Type 'import("/opt/render/project/src/node_modules/.pnpm/lexical@0.28.0/node_modules/lexical/LexicalNode").NodeMap' is not assignable to type 'import("/opt/render/project/src/node_modules/.pnpm/lexical@0.41.0/node_modules/lexical/LexicalNode").NodeMap'.
          The types of '_editorState._nodeMap' are incompatible between these types.
        Construct signature return types 'LexicalEditor' and 'LexicalEditor' are incompatible.
      Type 'KlassConstructor<typeof LexicalEditor>' is not assignable to type 'GenericConstructor<LexicalEditor>'.
    Type 'import("/opt/render/project/src/node_modules/.pnpm/lexical@0.28.0/node_modules/lexical/LexicalEditor").KlassConstructor<typeof import("/opt/render/project/src/node_modules/.pnpm/lexical@0.28.0/node_modules/lexical/LexicalEditor").LexicalEditor>' is not assignable to type 'import("/opt/render/project/src/node_modules/.pnpm/lexical@0.41.0/node_modules/lexical/LexicalEditor").KlassConstructor<typeof import("/opt/render/project/src/node_modules/.pnpm/lexical@0.41.0/node_modules/lexical/LexicalEditor").LexicalEditor>'.
  Types of property '['constructor']' are incompatible.
Type error: Argument of type 'import("/opt/render/project/src/node_modules/.pnpm/lexical@0.28.0/node_modules/lexical/LexicalEditor").LexicalEditor' is not assignable to parameter of type 'import("/opt/render/project/src/node_modules/.pnpm/lexical@0.41.0/node_modules/lexical/LexicalEditor").LexicalEditor'.
../../packages/ui/src/lexical-course-editor.tsx:375:45
Failed to type check.
  Running TypeScript ...
✓ Compiled successfully in 29.9s
  Creating an optimized production build ...
▲ Next.js 16.2.0 (Turbopack)
⚠ No build cache found. Please configure build caching for faster rebuilds. Read more: https://nextjs.org/docs/messages/no-cache
[12:33:59] INFO: Types written to /opt/render/project/src/apps/cms/src/payload-types.ts
[12:33:58] INFO: Compiling TS types for Collections and Globals...
> cross-env NODE_OPTIONS=--no-deprecation payload generate:types
> @encreasl/cms@0.1.0 generate:types /opt/render/project/src/apps/cms
> pnpm run generate:types && cross-env NODE_ENV=production NODE_OPTIONS="--no-deprecation --max-old-space-size=8000" PAYLOAD_DROP_DATABASE=false next build
> @encreasl/cms@0.1.0 build /opt/render/project/src/apps/cms
==> Running build command 'pnpm install --frozen-lockfile; pnpm run build'...
==> Docs on specifying a Node.js version: https://render.com/docs/node-version
==> Using Node.js version 26.1.0 via /opt/render/project/src/apps/cms/package.json
==> Requesting Node.js version >=22.0.0
==> Downloaded 528MB in 2s. Extraction took 12s.
==> Checking out commit ea3320377ed9d65519f03ee7e2e3ad3e360b1138 in branch main
==> Cloning from https://github.com/johnlloydcallao01/grandline
==> It looks like we don't have access to your repo, but we'll try to clone it anyway.
==> Downloading cache...