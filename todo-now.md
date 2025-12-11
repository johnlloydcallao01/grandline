## Error Type
Console Error

## Error Message
In HTML, <html> cannot be a child of <div>.
This will cause a hydration error.

  ...
    <RenderFromTemplateContext>
      <ScrollAndFocusHandler segmentPath={[...]}>
        <InnerScrollAndFocusHandler segmentPath={[...]} focusAndScrollRef={{apply:false, ...}}>
          <ErrorBoundary errorComponent={undefined} errorStyles={undefined} errorScripts={undefined}>
            <LoadingBoundary name="/" loading={null}>
              <HTTPAccessFallbackBoundary notFound={<SegmentViewNode>} forbidden={undefined} unauthorized={undefined}>
                <HTTPAccessFallbackErrorBoundary pathname="/admin/col..." notFound={<SegmentViewNode>} ...>
                  <RedirectBoundary>
                    <RedirectErrorBoundary router={{...}}>
                      <InnerLayoutRouter url={"/admin/c..."} tree={[...]} params={{}} cacheNode={{lazyData:null, ...}} ...>
                        <SegmentViewNode type="layout" pagePath="/apps/cms/...">
                          <SegmentTrieNode>
                          <link>
                          <script>
                          <script>
                          <script>
                          <script>
                          <script>
                          <script>
                          <script>
                          <script>
                          <script>
                          <script>
                          <script>
                          <script>
                          <script>
                          <script>
                          <script>
                          <script>
                          <script>
                          <Layout>
>                           <div suppressHydrationWarning={true}>
                              <RootLayout>
>                               <html data-theme="dark" dir="LTR" lang="en" suppressHydrationWarning={false}>
                      ...
          ...



    at html (<anonymous>:null:null)
    at RootLayout (..\..\node_modules\.pnpm\@payloadcms+next@3.49.0_@types+react@19.1.0_graphql@16.11.0_monaco-editor@0.52.2_next@16.0.6__qnjpzgdt2lpmibas5d4vcsp5re\node_modules\@payloadcms\next\src\layouts\Root\index.tsx:105:5)
    at Layout (src\app\(payload)\layout.tsx:27:5)

## Code Frame
  103 |
  104 |   return (
> 105 |     <html
      |     ^
  106 |       data-theme={theme}
  107 |       dir={dir}
  108 |       lang={languageCode}

Next.js version: 16.0.6 (Turbopack)
