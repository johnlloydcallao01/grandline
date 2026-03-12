## Error Type
Console ReferenceError

## Error Message
cmsConfig is not defined


    at Module.generateMetadata (src\app\layout.tsx:26:32)
    at NoopContextManager.with (..\..\node_modules\.pnpm\@opentelemetry+api@1.9.0\node_modules\@opentelemetry\api\src\context\NoopContextManager.ts:31:19)
    at ContextAPI.with (..\..\node_modules\.pnpm\@opentelemetry+api@1.9.0\node_modules\@opentelemetry\api\src\api\context.ts:77:42)
    at NoopTracer.startActiveSpan (..\..\node_modules\.pnpm\@opentelemetry+api@1.9.0\node_modules\@opentelemetry\api\src\trace\NoopTracer.ts:98:27)
    at ProxyTracer.startActiveSpan (..\..\node_modules\.pnpm\@opentelemetry+api@1.9.0\node_modules\@opentelemetry\api\src\trace\ProxyTracer.ts:51:20)
    at NoopContextManager.with (..\..\node_modules\.pnpm\@opentelemetry+api@1.9.0\node_modules\@opentelemetry\api\src\context\NoopContextManager.ts:31:19)
    at ContextAPI.with (..\..\node_modules\.pnpm\@opentelemetry+api@1.9.0\node_modules\@opentelemetry\api\src\api\context.ts:77:42)
    at Next.MetadataOutlet (<anonymous>:null:null)

## Code Frame
  24 |
  25 |   try {
> 26 |     const res = await fetch(`${cmsConfig.apiUrl}/globals/site-settings?depth=1`, {
     |                                ^
  27 |       next: { revalidate: 3600 } // Cache for 1 hour
  28 |     });
  29 |     

Next.js version: 16.0.7 (Turbopack)

## Error Type
Console Error

## Error Message
C:\Users\User\Desktop\grandline\apps\web-admin\.next\dev\server\chunks\ssr\[root-of-the-server]__4a1a9e86._.js: Invalid source map. Only conformant source maps can be used to find the original code. Cause: Error: sourceMapURL could not be parsed


    at Module.generateMetadata (src\app\layout.tsx:46:13)
    at NoopContextManager.with (..\..\node_modules\.pnpm\@opentelemetry+api@1.9.0\node_modules\@opentelemetry\api\src\context\NoopContextManager.ts:31:19)
    at ContextAPI.with (..\..\node_modules\.pnpm\@opentelemetry+api@1.9.0\node_modules\@opentelemetry\api\src\api\context.ts:77:42)
    at NoopTracer.startActiveSpan (..\..\node_modules\.pnpm\@opentelemetry+api@1.9.0\node_modules\@opentelemetry\api\src\trace\NoopTracer.ts:98:27)
    at ProxyTracer.startActiveSpan (..\..\node_modules\.pnpm\@opentelemetry+api@1.9.0\node_modules\@opentelemetry\api\src\trace\ProxyTracer.ts:51:20)
    at NoopContextManager.with (..\..\node_modules\.pnpm\@opentelemetry+api@1.9.0\node_modules\@opentelemetry\api\src\context\NoopContextManager.ts:31:19)
    at ContextAPI.with (..\..\node_modules\.pnpm\@opentelemetry+api@1.9.0\node_modules\@opentelemetry\api\src\api\context.ts:77:42)
    at Next.MetadataOutlet (<anonymous>:null:null)

## Code Frame
  44 |     }
  45 |   } catch (error) {
> 46 |     console.error("Failed to fetch site settings for metadata:", error);
     |             ^
  47 |   }
  48 |
  49 |   return {

Next.js version: 16.0.7 (Turbopack)



## Error Type
Console Error

## Error Message
C:\Users\User\Desktop\grandline\apps\web-admin\.next\dev\server\chunks\ssr\6200b_next_dist_5a291522._.js: Invalid source map. Only conformant source maps can be used to find the original code. Cause: Error: sourceMapURL could not be parsed


    at Module.generateMetadata (src\app\layout.tsx:46:13)
    at NoopContextManager.with (..\..\node_modules\.pnpm\@opentelemetry+api@1.9.0\node_modules\@opentelemetry\api\src\context\NoopContextManager.ts:31:19)
    at ContextAPI.with (..\..\node_modules\.pnpm\@opentelemetry+api@1.9.0\node_modules\@opentelemetry\api\src\api\context.ts:77:42)
    at NoopTracer.startActiveSpan (..\..\node_modules\.pnpm\@opentelemetry+api@1.9.0\node_modules\@opentelemetry\api\src\trace\NoopTracer.ts:98:27)
    at ProxyTracer.startActiveSpan (..\..\node_modules\.pnpm\@opentelemetry+api@1.9.0\node_modules\@opentelemetry\api\src\trace\ProxyTracer.ts:51:20)
    at NoopContextManager.with (..\..\node_modules\.pnpm\@opentelemetry+api@1.9.0\node_modules\@opentelemetry\api\src\context\NoopContextManager.ts:31:19)
    at ContextAPI.with (..\..\node_modules\.pnpm\@opentelemetry+api@1.9.0\node_modules\@opentelemetry\api\src\api\context.ts:77:42)
    at Next.MetadataOutlet (<anonymous>:null:null)

## Code Frame
  44 |     }
  45 |   } catch (error) {
> 46 |     console.error("Failed to fetch site settings for metadata:", error);
     |             ^
  47 |   }
  48 |
  49 |   return {

Next.js version: 16.0.7 (Turbopack)


## Error Type
Console Error

## Error Message
C:\Users\User\Desktop\grandline\apps\web-admin\.next\dev\server\chunks\ssr\4b6e4_@opentelemetry_api_build_esm_638c5aaa._.js: Invalid source map. Only conformant source maps can be used to find the original code. Cause: Error: sourceMapURL could not be parsed


    at Module.generateMetadata (src\app\layout.tsx:46:13)
    at NoopContextManager.with (..\..\node_modules\.pnpm\@opentelemetry+api@1.9.0\node_modules\@opentelemetry\api\src\context\NoopContextManager.ts:31:19)
    at ContextAPI.with (..\..\node_modules\.pnpm\@opentelemetry+api@1.9.0\node_modules\@opentelemetry\api\src\api\context.ts:77:42)
    at NoopTracer.startActiveSpan (..\..\node_modules\.pnpm\@opentelemetry+api@1.9.0\node_modules\@opentelemetry\api\src\trace\NoopTracer.ts:98:27)
    at ProxyTracer.startActiveSpan (..\..\node_modules\.pnpm\@opentelemetry+api@1.9.0\node_modules\@opentelemetry\api\src\trace\ProxyTracer.ts:51:20)
    at NoopContextManager.with (..\..\node_modules\.pnpm\@opentelemetry+api@1.9.0\node_modules\@opentelemetry\api\src\context\NoopContextManager.ts:31:19)
    at ContextAPI.with (..\..\node_modules\.pnpm\@opentelemetry+api@1.9.0\node_modules\@opentelemetry\api\src\api\context.ts:77:42)
    at Next.MetadataOutlet (<anonymous>:null:null)

## Code Frame
  44 |     }
  45 |   } catch (error) {
> 46 |     console.error("Failed to fetch site settings for metadata:", error);
     |             ^
  47 |   }
  48 |
  49 |   return {

Next.js version: 16.0.7 (Turbopack)
