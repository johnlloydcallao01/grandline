PS C:\Users\User\Desktop\grandline\apps\cms> pnpm run dev

> @encreasl/cms@0.1.0 dev C:\Users\User\Desktop\grandline\apps\cms
> cross-env NODE_OPTIONS=--no-deprecation next dev -p 3001

▲ Next.js 16.2.0 (Turbopack)
- Local:         http://localhost:3001
- Network:       http://192.168.100.6:3001
- Environments: .env
✓ Ready in 911ms

[09:41:55] WARN: No email adapter provided. Email will be written to console. More info at https://payloadcms.com/docs/email/overview.
 GET /api/users/me?depth=2 200 in 7.5s (next.js: 7.3s, proxy.ts: 77ms, application-code: 77ms)
 GET /admin/login?redirect=%2Fadmin%2Fcollections%2Fusers%3Fdepth%3D1%26limit%3D10 200 in 23.5s (next.js: 10.7s, application-code: 12.8s)
 GET /admin/login 200 in 23.6s (next.js: 10.8s, application-code: 12.8s)
 GET /api/users/me 200 in 78ms (next.js: 48ms, proxy.ts: 17ms, application-code: 14ms)
 GET /api/users/me?depth=2 200 in 93ms (next.js: 31ms, proxy.ts: 48ms, application-code: 14ms)
 GET /api/users/me 200 in 81ms (next.js: 51ms, proxy.ts: 13ms, application-code: 16ms)
 GET /api/payload-preferences/nav 200 in 82ms (next.js: 22ms, proxy.ts: 27ms, application-code: 32ms)
 GET /api/payload-preferences/nav 200 in 78ms (next.js: 22ms, proxy.ts: 28ms, application-code: 28ms)
 GET /api/payload-preferences/nav 200 in 30ms (next.js: 10ms, proxy.ts: 11ms, application-code: 9ms)
 GET /api/payload-preferences/nav 200 in 30ms (next.js: 6ms, proxy.ts: 11ms, application-code: 13ms)
✅ [1973ab1d-6bae-4fb9-88b1-b55bf71b3a0e] LOGIN_SUCCESS: {
  "userId": 1,
  "email": "johnlloydcallao@gmail.com",
  "role": "admin",
  "ipAddress": "::1",
  "timestamp": "2026-05-21T01:46:27.266Z",
  "additionalData": {
    "endpoint": "/users/login",
    "tokenIssued": true
  }
}
 POST /api/users/login 200 in 4.4s (next.js: 1433ms, proxy.ts: 694ms, application-code: 2.3s)
 GET /api/users/me?depth=2 200 in 147ms (next.js: 70ms, proxy.ts: 52ms, application-code: 26ms)
✅ [6f304312-324b-4ee6-b0da-8de90554e83b] LOGIN_SUCCESS: {
  "userId": 1,
  "email": "johnlloydcallao@gmail.com",
  "role": "admin",
  "ipAddress": "::1",
  "timestamp": "2026-05-21T01:46:29.605Z",
  "additionalData": {
    "endpoint": "/users/login",
    "tokenIssued": true
  }
}
 POST /api/users/login 200 in 1974ms (next.js: 126ms, proxy.ts: 52ms, application-code: 1796ms)
 GET /admin 200 in 1930ms (next.js: 220ms, application-code: 1710ms)
 GET /api/globals/site-settings?depth=1 200 in 542ms (next.js: 15ms, proxy.ts: 9ms, application-code: 517ms)
 GET /api/globals/site-settings?depth=1 200 in 173ms (next.js: 8ms, proxy.ts: 5ms, application-code: 159ms)
[09:46:39] ERROR: No User
    err: {
      "type": "APIError",
      "message": "No User",
      "stack":
          APIError: No User
              at logoutOperation (file:///C:/Users/User/Desktop/grandline/node_modules/.pnpm/payload@3.80.0_graphql@16.11.0_typescript@5.7.3/node_modules/payload/dist/auth/operations/logout.js:11:15)
              at logoutHandler (file:///C:/Users/User/Desktop/grandline/node_modules/.pnpm/payload@3.80.0_graphql@16.11.0_typescript@5.7.3/node_modules/payload/dist/auth/endpoints/logout.js:9:26)
              at endpoint.handler (file:///C:/Users/User/Desktop/grandline/node_modules/.pnpm/payload@3.80.0_graphql@16.11.0_typescript@5.7.3/node_modules/payload/dist/utilities/wrapInternalEndpoints.js:13:24)
              at process.processTicksAndRejections (node:internal/process/task_queues:103:5)
              at async handleEndpoints (file:///C:/Users/User/Desktop/grandline/node_modules/.pnpm/payload@3.80.0_graphql@16.11.0_typescript@5.7.3/node_modules/payload/dist/utilities/handleEndpoints.js:198:26)
              at async C:\Users\User\Desktop\grandline\apps\cms\.next\dev\server\chunks\node_modules__pnpm_0y~hwxm._.js:36047:26   
              at async AppRouteRouteModule.do (C:\Users\User\Desktop\grandline\node_modules\.pnpm\next@16.2.0_@babel+core@7.2_b86070beca29b6c1c8e8aa5762aaeb3e\node_modules\next\dist\compiled\next-server\app-route-turbo.runtime.dev.js:5:40732)
              at async AppRouteRouteModule.handle (C:\Users\User\Desktop\grandline\node_modules\.pnpm\next@16.2.0_@babel+core@7.2_b86070beca29b6c1c8e8aa5762aaeb3e\node_modules\next\dist\compiled\next-server\app-route-turbo.runtime.dev.js:5:47861)
              at async responseGenerator (C:\Users\User\Desktop\grandline\apps\cms\.next\dev\server\chunks\030r_next_0i~ny8-._.js:10481:38)
              at async AppRouteRouteModule.handleResponse (C:\Users\User\Desktop\grandline\node_modules\.pnpm\next@16.2.0_@babel+core@7.2_b86070beca29b6c1c8e8aa5762aaeb3e\node_modules\next\dist\compiled\next-server\app-route-turbo.runtime.dev.js:1:227216)       
              at async handleResponse (C:\Users\User\Desktop\grandline\apps\cms\.next\dev\server\chunks\030r_next_0i~ny8-._.js:10544:32)
              at async Module.handler (C:\Users\User\Desktop\grandline\apps\cms\.next\dev\server\chunks\030r_next_0i~ny8-._.js:10598:13)
              at async DevServer.renderToResponseWithComponentsImpl (C:\Users\User\Desktop\grandline\node_modules\.pnpm\next@16.2.0_@babel+core@7.2_b86070beca29b6c1c8e8aa5762aaeb3e\node_modules\next\dist\server\base-server.js:1454:9)
              at async DevServer.renderPageComponent (C:\Users\User\Desktop\grandline\node_modules\.pnpm\next@16.2.0_@babel+core@7.2_b86070beca29b6c1c8e8aa5762aaeb3e\node_modules\next\dist\server\base-server.js:1506:24)
              at async DevServer.renderToResponseImpl (C:\Users\User\Desktop\grandline\node_modules\.pnpm\next@16.2.0_@babel+core@7.2_b86070beca29b6c1c8e8aa5762aaeb3e\node_modules\next\dist\server\base-server.js:1556:32)
              at async DevServer.pipeImpl (C:\Users\User\Desktop\grandline\node_modules\.pnpm\next@16.2.0_@babel+core@7.2_b86070beca29b6c1c8e8aa5762aaeb3e\node_modules\next\dist\server\base-server.js:1043:25)
              at async NextNodeServer.handleCatchallRenderRequest (C:\Users\User\Desktop\grandline\node_modules\.pnpm\next@16.2.0_@babel+core@7.2_b86070beca29b6c1c8e8aa5762aaeb3e\node_modules\next\dist\server\next-server.js:338:17)
              at async DevServer.handleRequestImpl (C:\Users\User\Desktop\grandline\node_modules\.pnpm\next@16.2.0_@babel+core@7.2_b86070beca29b6c1c8e8aa5762aaeb3e\node_modules\next\dist\server\base-server.js:934:17)
              at async C:\Users\User\Desktop\grandline\node_modules\.pnpm\next@16.2.0_@babel+core@7.2_b86070beca29b6c1c8e8aa5762aaeb3e\node_modules\next\dist\server\dev\next-dev-server.js:394:20
              at async Span.traceAsyncFn (C:\Users\User\Desktop\grandline\node_modules\.pnpm\next@16.2.0_@babel+core@7.2_b86070beca29b6c1c8e8aa5762aaeb3e\node_modules\next\dist\trace\trace.js:164:20)
              at async DevServer.handleRequest (C:\Users\User\Desktop\grandline\node_modules\.pnpm\next@16.2.0_@babel+core@7.2_b86070beca29b6c1c8e8aa5762aaeb3e\node_modules\next\dist\server\dev\next-dev-server.js:390:24)
              at async invokeRender (C:\Users\User\Desktop\grandline\node_modules\.pnpm\next@16.2.0_@babel+core@7.2_b86070beca29b6c1c8e8aa5762aaeb3e\node_modules\next\dist\server\lib\router-server.js:253:21)
              at async handleRequest (C:\Users\User\Desktop\grandline\node_modules\.pnpm\next@16.2.0_@babel+core@7.2_b86070beca29b6c1c8e8aa5762aaeb3e\node_modules\next\dist\server\lib\router-server.js:452:24)
              at async requestHandlerImpl (C:\Users\User\Desktop\grandline\node_modules\.pnpm\next@16.2.0_@babel+core@7.2_b86070beca29b6c1c8e8aa5762aaeb3e\node_modules\next\dist\server\lib\router-server.js:501:13)
              at async Server.requestListener (C:\Users\User\Desktop\grandline\node_modules\.pnpm\next@16.2.0_@babel+core@7.2_b86070beca29b6c1c8e8aa5762aaeb3e\node_modules\next\dist\server\lib\start-server.js:225:13)
      "data": null,
      "isOperational": true,
      "isPublic": true,
      "status": 400,
      "name": "APIError"
    }
 POST /api/users/logout 400 in 59ms (next.js: 12ms, proxy.ts: 4ms, application-code: 44ms)
✅ [6708b0f1-1891-4872-b227-2ead4b6651cc] LOGIN_SUCCESS: {
  "userId": 1,
  "email": "johnlloydcallao@gmail.com",
  "role": "admin",
  "ipAddress": "::1",
  "timestamp": "2026-05-21T01:46:43.377Z",
  "additionalData": {
    "endpoint": "/users/login",
    "tokenIssued": true
  }
}
 POST /api/users/login 200 in 668ms (next.js: 12ms, proxy.ts: 5ms, application-code: 651ms)
 GET /api/users/me?depth=2 200 in 28ms (next.js: 19ms, proxy.ts: 6ms, application-code: 3ms)
 GET /api/globals/site-settings?depth=1 200 in 199ms (next.js: 13ms, proxy.ts: 5ms, application-code: 182ms)
 GET /api/globals/site-settings?depth=1 200 in 189ms (next.js: 7ms, proxy.ts: 6ms, application-code: 176ms)
 GET /admin/login?redirect=%2Fadmin%2Fcollections%2Fusers%3Fdepth%3D1%26limit%3D10 307 in 3.3s (next.js: 32ms, application-code: 3.2s)
 GET /admin/collections/users?depth=1&limit=10 200 in 2.9s (next.js: 82ms, application-code: 2.9s)
 GET /api/users/me 200 in 184ms (next.js: 15ms, proxy.ts: 6ms, application-code: 163ms)
 GET /api/payload-preferences/nav 200 in 284ms (next.js: 12ms, proxy.ts: 5ms, application-code: 267ms)
[09:50:44] ERROR: No User
    err: {
      "type": "APIError",
      "message": "No User",
      "stack":
          APIError: No User
              at logoutOperation (file:///C:/Users/User/Desktop/grandline/node_modules/.pnpm/payload@3.80.0_graphql@16.11.0_typescript@5.7.3/node_modules/payload/dist/auth/operations/logout.js:11:15)
              at logoutHandler (file:///C:/Users/User/Desktop/grandline/node_modules/.pnpm/payload@3.80.0_graphql@16.11.0_typescript@5.7.3/node_modules/payload/dist/auth/endpoints/logout.js:9:26)
              at endpoint.handler (file:///C:/Users/User/Desktop/grandline/node_modules/.pnpm/payload@3.80.0_graphql@16.11.0_typescript@5.7.3/node_modules/payload/dist/utilities/wrapInternalEndpoints.js:13:24)
              at process.processTicksAndRejections (node:internal/process/task_queues:103:5)
              at async handleEndpoints (file:///C:/Users/User/Desktop/grandline/node_modules/.pnpm/payload@3.80.0_graphql@16.11.0_typescript@5.7.3/node_modules/payload/dist/utilities/handleEndpoints.js:198:26)
              at async C:\Users\User\Desktop\grandline\apps\cms\.next\dev\server\chunks\node_modules__pnpm_0y~hwxm._.js:36047:26   
              at async AppRouteRouteModule.do (C:\Users\User\Desktop\grandline\node_modules\.pnpm\next@16.2.0_@babel+core@7.2_b86070beca29b6c1c8e8aa5762aaeb3e\node_modules\next\dist\compiled\next-server\app-route-turbo.runtime.dev.js:5:40732)
              at async AppRouteRouteModule.handle (C:\Users\User\Desktop\grandline\node_modules\.pnpm\next@16.2.0_@babel+core@7.2_b86070beca29b6c1c8e8aa5762aaeb3e\node_modules\next\dist\compiled\next-server\app-route-turbo.runtime.dev.js:5:47861)
              at async responseGenerator (C:\Users\User\Desktop\grandline\apps\cms\.next\dev\server\chunks\030r_next_0i~ny8-._.js:10481:38)
              at async AppRouteRouteModule.handleResponse (C:\Users\User\Desktop\grandline\node_modules\.pnpm\next@16.2.0_@babel+core@7.2_b86070beca29b6c1c8e8aa5762aaeb3e\node_modules\next\dist\compiled\next-server\app-route-turbo.runtime.dev.js:1:227216)       
              at async handleResponse (C:\Users\User\Desktop\grandline\apps\cms\.next\dev\server\chunks\030r_next_0i~ny8-._.js:10544:32)
              at async Module.handler (C:\Users\User\Desktop\grandline\apps\cms\.next\dev\server\chunks\030r_next_0i~ny8-._.js:10598:13)
              at async DevServer.renderToResponseWithComponentsImpl (C:\Users\User\Desktop\grandline\node_modules\.pnpm\next@16.2.0_@babel+core@7.2_b86070beca29b6c1c8e8aa5762aaeb3e\node_modules\next\dist\server\base-server.js:1454:9)
              at async DevServer.renderPageComponent (C:\Users\User\Desktop\grandline\node_modules\.pnpm\next@16.2.0_@babel+core@7.2_b86070beca29b6c1c8e8aa5762aaeb3e\node_modules\next\dist\server\base-server.js:1506:24)
              at async DevServer.renderToResponseImpl (C:\Users\User\Desktop\grandline\node_modules\.pnpm\next@16.2.0_@babel+core@7.2_b86070beca29b6c1c8e8aa5762aaeb3e\node_modules\next\dist\server\base-server.js:1556:32)
              at async DevServer.pipeImpl (C:\Users\User\Desktop\grandline\node_modules\.pnpm\next@16.2.0_@babel+core@7.2_b86070beca29b6c1c8e8aa5762aaeb3e\node_modules\next\dist\server\base-server.js:1043:25)
              at async NextNodeServer.handleCatchallRenderRequest (C:\Users\User\Desktop\grandline\node_modules\.pnpm\next@16.2.0_@babel+core@7.2_b86070beca29b6c1c8e8aa5762aaeb3e\node_modules\next\dist\server\next-server.js:338:17)
              at async DevServer.handleRequestImpl (C:\Users\User\Desktop\grandline\node_modules\.pnpm\next@16.2.0_@babel+core@7.2_b86070beca29b6c1c8e8aa5762aaeb3e\node_modules\next\dist\server\base-server.js:934:17)
              at async C:\Users\User\Desktop\grandline\node_modules\.pnpm\next@16.2.0_@babel+core@7.2_b86070beca29b6c1c8e8aa5762aaeb3e\node_modules\next\dist\server\dev\next-dev-server.js:394:20
              at async Span.traceAsyncFn (C:\Users\User\Desktop\grandline\node_modules\.pnpm\next@16.2.0_@babel+core@7.2_b86070beca29b6c1c8e8aa5762aaeb3e\node_modules\next\dist\trace\trace.js:164:20)
              at async DevServer.handleRequest (C:\Users\User\Desktop\grandline\node_modules\.pnpm\next@16.2.0_@babel+core@7.2_b86070beca29b6c1c8e8aa5762aaeb3e\node_modules\next\dist\server\dev\next-dev-server.js:390:24)
              at async invokeRender (C:\Users\User\Desktop\grandline\node_modules\.pnpm\next@16.2.0_@babel+core@7.2_b86070beca29b6c1c8e8aa5762aaeb3e\node_modules\next\dist\server\lib\router-server.js:253:21)
              at async handleRequest (C:\Users\User\Desktop\grandline\node_modules\.pnpm\next@16.2.0_@babel+core@7.2_b86070beca29b6c1c8e8aa5762aaeb3e\node_modules\next\dist\server\lib\router-server.js:452:24)
              at async requestHandlerImpl (C:\Users\User\Desktop\grandline\node_modules\.pnpm\next@16.2.0_@babel+core@7.2_b86070beca29b6c1c8e8aa5762aaeb3e\node_modules\next\dist\server\lib\router-server.js:501:13)
              at async Server.requestListener (C:\Users\User\Desktop\grandline\node_modules\.pnpm\next@16.2.0_@babel+core@7.2_b86070beca29b6c1c8e8aa5762aaeb3e\node_modules\next\dist\server\lib\start-server.js:225:13)
      "data": null,
      "isOperational": true,
      "isPublic": true,
      "status": 400,
      "name": "APIError"
    }
 POST /api/users/logout 400 in 32ms (next.js: 11ms, proxy.ts: 6ms, application-code: 15ms)
 GET /api/globals/site-settings?depth=1 200 in 1888ms (next.js: 401ms, proxy.ts: 459ms, application-code: 1029ms)
 GET /api/users/me?depth=2 200 in 1897ms (next.js: 747ms, proxy.ts: 310ms, application-code: 840ms)
 GET /api/globals/site-settings?depth=1 200 in 245ms (next.js: 34ms, proxy.ts: 17ms, application-code: 194ms)
 GET /api/users/me?depth=2 200 in 2.2s (next.js: 123ms, proxy.ts: 61ms, application-code: 2.0s)
 GET /api/course-categories/active 200 in 2.9s (next.js: 1971ms, proxy.ts: 60ms, application-code: 848ms)
 GET /api/courses?status=published&limit=4&page=1&sort=-updatedAt 200 in 2.9s (next.js: 1720ms, proxy.ts: 170ms, application-code: 997ms)
 GET /api/user-notifications?where%5Buser%5D%5Bequals%5D=2&sort=-deliveredAt&limit=50&depth=1 200 in 3.1s (next.js: 1747ms, proxy.ts: 167ms, application-code: 1160ms)
 GET /api/courses?status=published&limit=4&page=1&sort=-updatedAt 200 in 631ms (next.js: 17ms, proxy.ts: 13ms, application-code: 601ms)
 GET /api/user-notifications?where%5Buser%5D%5Bequals%5D=2&sort=-deliveredAt&limit=50&depth=1 200 in 477ms (next.js: 8ms, proxy.ts: 5ms, application-code: 465ms)
 GET /api/courses?status=published&limit=4&page=1&sort=-updatedAt&where%5BisFeatured%5D%5Bequals%5D=true 200 in 4.2s (next.js: 1758ms, proxy.ts: 168ms, application-code: 2.2s)
 GET /api/courses?status=published&limit=4&page=2&sort=-updatedAt 200 in 1613ms (next.js: 37ms, proxy.ts: 10ms, application-code: 1567ms)
 GET /api/globals/site-settings?depth=1 200 in 805ms (next.js: 204ms, proxy.ts: 90ms, application-code: 511ms)
 GET /api/users/me?depth=2 200 in 1008ms (next.js: 405ms, proxy.ts: 69ms, application-code: 534ms)
 GET /api/users/me?depth=2 200 in 592ms (next.js: 64ms, proxy.ts: 43ms, application-code: 485ms)
 GET /api/user-notifications?where%5Buser%5D%5Bequals%5D=2&sort=-deliveredAt&limit=50&depth=1 200 in 621ms (next.js: 102ms, proxy.ts: 28ms, application-code: 491ms)
 GET /api/courses?status=published&limit=4&page=1&sort=-updatedAt 200 in 1279ms (next.js: 350ms, proxy.ts: 21ms, application-code: 908ms)
 GET /api/wishlists?where%5Buser%5D%5Bequals%5D=2&sort=-createdAt&limit=100&depth=2 200 in 1116ms (next.js: 83ms, proxy.ts: 27ms, application-code: 1007ms)
 GET /api/courses?status=published&limit=4&page=1&sort=-updatedAt&where%5BisFeatured%5D%5Bequals%5D=true 200 in 2.1s (next.js: 332ms, proxy.ts: 25ms, application-code: 1725ms)
 GET /api/courses?status=published&limit=4&page=2&sort=-updatedAt&where%5BisFeatured%5D%5Bequals%5D=true 200 in 824ms (next.js: 35ms, proxy.ts: 12ms, application-code: 777ms)
 GET /api/courses?status=published&limit=4&page=2&sort=-updatedAt 200 in 1539ms (next.js: 18ms, proxy.ts: 10ms, application-code: 1510ms)
 GET /admin 200 in 5.6s (next.js: 79ms, application-code: 5.5s)
 GET /api/users/me 200 in 266ms (next.js: 43ms, proxy.ts: 7ms, application-code: 216ms)
 GET /api/payload-preferences/nav 200 in 241ms (next.js: 7ms, proxy.ts: 8ms, application-code: 226ms)
 GET /admin/collections/users 200 in 970ms (next.js: 15ms, application-code: 955ms)
 GET /admin/collections/users/4 200 in 579ms (next.js: 14ms, application-code: 565ms)
 POST /api/media 200 in 312ms (next.js: 27ms, proxy.ts: 7ms, application-code: 277ms)
 POST /api/media 200 in 322ms (next.js: 32ms, proxy.ts: 11ms, application-code: 278ms)
 GET /api/payload-preferences/collection-users 200 in 327ms (next.js: 40ms, proxy.ts: 11ms, application-code: 276ms)
 GET /api/media/file/main-uploads%2Fstcw-basic.png 404 in 119ms (next.js: 10ms, proxy.ts: 7ms, application-code: 103ms)
 GET /api/payload-preferences/collection-users-4 200 in 197ms (next.js: 9ms, proxy.ts: 5ms, application-code: 183ms)
[10:11:23] ERROR: There was an error building form state
    err: {
      "type": "DrizzleQueryError",
      "message": "Failed query: insert into \"payload_locked_documents_rels\" (\"id\", \"order\", \"parent_id\", \"path\", \"users_id\", \"instructors_id\", \"trainees_id\", \"admins_id\", \"user_events_id\", \"emergency_contacts_id\", \"media_id\", \"posts_id\", \"post_categories_id\", \"courses_id\", \"course_categories_id\", \"coupon_codes_id\", \"coupon_redemptions_id\", \"course_enrollments_id\", \"certificates_id\", \"certificate_templates_id\", \"course_modules_id\", \"course_lessons_id\", \"materials_id\", \"course_materials_id\", \"lesson_materials_id\", \"announcements_id\", \"feedback_forms_id\", \"feedback_submissions_id\", \"wishlists_id\", \"recently_viewed_courses_id\", \"course_item_progress_id\", \"questions_id\", \"assessments_id\", \"assessment_submissions_id\", \"assignments_id\", \"assignment_submissions_id\", \"submission_answers_id\", \"notification_templates_id\", \"notifications_id\", \"user_notifications_id\", \"web_push_subscriptions_id\", \"support_tickets_id\", \"support_ticket_messages_id\", \"chats_id\", \"chat_messages_id\", \"chat_message_status_id\", \"chat_typing_status_id\") values (default, default, $1, $2, $3, default, default, default, default, default, default, default, default, default, default, default, default, default, default, default, default, default, default, default, default, default, default, default, default, default, default, default, default, default, default, default, default, default, default, default, default, default, default, default, default, default, default), (default, default, $4, $5, $6, default, default, default, default, default, default, default, default, default, default, default, default, default, default, default, default, default, default, default, default, default, default, default, default, default, default, default, default, default, default, default, default, default, default, default, default, default, default, default, default, default, default) returning \"id\", \"order\", \"parent_id\", \"path\", \"users_id\", \"instructors_id\", \"trainees_id\", \"admins_id\", \"user_events_id\", \"emergency_contacts_id\", \"media_id\", \"posts_id\", \"post_categories_id\", \"courses_id\", \"course_categories_id\", \"coupon_codes_id\", \"coupon_redemptions_id\", \"course_enrollments_id\", \"certificates_id\", \"certificate_templates_id\", \"course_modules_id\", \"course_lessons_id\", \"materials_id\", \"course_materials_id\", \"lesson_materials_id\", \"announcements_id\", \"feedback_forms_id\", \"feedback_submissions_id\", \"wishlists_id\", \"recently_viewed_courses_id\", \"course_item_progress_id\", \"questions_id\", \"assessments_id\", \"assessment_submissions_id\", \"assignments_id\", \"assignment_submissions_id\", \"submission_answers_id\", \"notification_templates_id\", \"notifications_id\", \"user_notifications_id\", \"web_push_subscriptions_id\", \"support_tickets_id\", \"support_ticket_messages_id\", \"chats_id\", \"chat_messages_id\", \"chat_message_status_id\", \"chat_typing_status_id\"\nparams: 188,document,4,188,user,1: canceling statement due to statement timeout",
      "stack":
          Error: Failed query: insert into "payload_locked_documents_rels" ("id", "order", "parent_id", "path", "users_id", "instructors_id", "trainees_id", "admins_id", "user_events_id", "emergency_contacts_id", "media_id", "posts_id", "post_categories_id", "courses_id", "course_categories_id", "coupon_codes_id", "coupon_redemptions_id", "course_enrollments_id", "certificates_id", "certificate_templates_id", "course_modules_id", "course_lessons_id", "materials_id", "course_materials_id", "lesson_materials_id", "announcements_id", "feedback_forms_id", "feedback_submissions_id", "wishlists_id", "recently_viewed_courses_id", "course_item_progress_id", "questions_id", "assessments_id", "assessment_submissions_id", "assignments_id", "assignment_submissions_id", "submission_answers_id", "notification_templates_id", "notifications_id", "user_notifications_id", "web_push_subscriptions_id", "support_tickets_id", "support_ticket_messages_id", "chats_id", "chat_messages_id", "chat_message_status_id", "chat_typing_status_id") values (default, default, $1, $2, $3, default, default, default, default, default, default, default, default, default, default, default, default, default, default, default, default, default, default, default, default, default, default, default, default, default, default, default, default, default, default, default, default, default, default, default, default, default, default, default, default, default, default), (default, default, $4, $5, $6, default, default, default, default, default, default, default, default, default, default, default, default, default, default, default, default, default, default, default, default, default, default, default, default, default, default, default, default, default, default, default, default, default, default, default, default, default, default, default, default, default, default) returning "id", "order", "parent_id", "path", "users_id", "instructors_id", "trainees_id", "admins_id", "user_events_id", "emergency_contacts_id", "media_id", "posts_id", "post_categories_id", "courses_id", "course_categories_id", "coupon_codes_id", "coupon_redemptions_id", "course_enrollments_id", "certificates_id", "certificate_templates_id", "course_modules_id", "course_lessons_id", "materials_id", "course_materials_id", "lesson_materials_id", "announcements_id", "feedback_forms_id", "feedback_submissions_id", "wishlists_id", "recently_viewed_courses_id", "course_item_progress_id", "questions_id", "assessments_id", "assessment_submissions_id", "assignments_id", "assignment_submissions_id", "submission_answers_id", "notification_templates_id", "notifications_id", "user_notifications_id", "web_push_subscriptions_id", "support_tickets_id", "support_ticket_messages_id", "chats_id", "chat_messages_id", "chat_message_status_id", "chat_typing_status_id"
          params: 188,document,4,188,user,1
              at NodePgPreparedQuery.queryWithCache (file:///C:/Users/User/Desktop/grandline/node_modules/.pnpm/drizzle-orm@0.44.7_@opentel_40aa7e6344246917eead8a349c72654a/node_modules/drizzle-orm/pg-core/session.js:41:15)
              at process.processTicksAndRejections (node:internal/process/task_queues:103:5)
              at async file:///C:/Users/User/Desktop/grandline/node_modules/.pnpm/drizzle-orm@0.44.7_@opentel_40aa7e6344246917eead8a349c72654a/node_modules/drizzle-orm/node-postgres/session.js:117:22
              at async Object.insert (file:///C:/Users/User/Desktop/grandline/node_modules/.pnpm/@payloadcms+drizzle@3.80.0__cafa1f1787bd650a92176563df216607/node_modules/@payloadcms/drizzle/dist/postgres/insert.js:7:18)
              at async upsertRow (file:///C:/Users/User/Desktop/grandline/node_modules/.pnpm/@payloadcms+drizzle@3.80.0__cafa1f1787bd650a92176563df216607/node_modules/@payloadcms/drizzle/dist/upsertRow/index.js:306:13)
              at async Object.create (file:///C:/Users/User/Desktop/grandline/node_modules/.pnpm/@payloadcms+drizzle@3.80.0__cafa1f1787bd650a92176563df216607/node_modules/@payloadcms/drizzle/dist/create.js:8:20)
              at async handleFormStateLocking (C:\Users\User\Desktop\grandline\apps\cms\.next\dev\server\chunks\ssr\0baz_@payloadcms_ui_dist_10.drcv._.js:6047:17)
              at async buildFormState (C:\Users\User\Desktop\grandline\apps\cms\.next\dev\server\chunks\ssr\0baz_@payloadcms_ui_dist_10.drcv._.js:6444:29)
              at async buildFormStateHandler (C:\Users\User\Desktop\grandline\apps\cms\.next\dev\server\chunks\ssr\0baz_@payloadcms_ui_dist_10.drcv._.js:6331:21)
              at async executeActionAndPrepareForRender (C:\Users\User\Desktop\grandline\node_modules\.pnpm\next@16.2.0_@babel+core@7.2_b86070beca29b6c1c8e8aa5762aaeb3e\node_modules\next\dist\compiled\next-server\app-page-turbo.runtime.dev.js:64:5248)
              at async C:\Users\User\Desktop\grandline\node_modules\.pnpm\next@16.2.0_@babel+core@7.2_b86070beca29b6c1c8e8aa5762aaeb3e\node_modules\next\dist\compiled\next-server\app-page-turbo.runtime.dev.js:64:1986
              at async handleAction (C:\Users\User\Desktop\grandline\node_modules\.pnpm\next@16.2.0_@babel+core@7.2_b86070beca29b6c1c8e8aa5762aaeb3e\node_modules\next\dist\compiled\next-server\app-page-turbo.runtime.dev.js:62:25378)
              at async renderToHTMLOrFlightImpl (C:\Users\User\Desktop\grandline\node_modules\.pnpm\next@16.2.0_@babel+core@7.2_b86070beca29b6c1c8e8aa5762aaeb3e\node_modules\next\dist\compiled\next-server\app-page-turbo.runtime.dev.js:69:55630)
              at async doRender (C:\Users\User\Desktop\grandline\apps\cms\.next\dev\server\chunks\ssr\node_modules__pnpm_11y0kuh._.js:5682:28)
              at async AppPageRouteModule.handleResponse (C:\Users\User\Desktop\grandline\node_modules\.pnpm\next@16.2.0_@babel+core@7.2_b86070beca29b6c1c8e8aa5762aaeb3e\node_modules\next\dist\compiled\next-server\app-page-turbo.runtime.dev.js:71:63567)
              at async handleResponse (C:\Users\User\Desktop\grandline\apps\cms\.next\dev\server\chunks\ssr\node_modules__pnpm_11y0kuh._.js:5957:32)
              at async Module.handler (C:\Users\User\Desktop\grandline\apps\cms\.next\dev\server\chunks\ssr\node_modules__pnpm_11y0kuh._.js:6360:20)
              at async DevServer.renderToResponseWithComponentsImpl (C:\Users\User\Desktop\grandline\node_modules\.pnpm\next@16.2.0_@babel+core@7.2_b86070beca29b6c1c8e8aa5762aaeb3e\node_modules\next\dist\server\base-server.js:1454:9)
              at async DevServer.renderPageComponent (C:\Users\User\Desktop\grandline\node_modules\.pnpm\next@16.2.0_@babel+core@7.2_b86070beca29b6c1c8e8aa5762aaeb3e\node_modules\next\dist\server\base-server.js:1506:24)
              at async DevServer.renderToResponseImpl (C:\Users\User\Desktop\grandline\node_modules\.pnpm\next@16.2.0_@babel+core@7.2_b86070beca29b6c1c8e8aa5762aaeb3e\node_modules\next\dist\server\base-server.js:1556:32)
              at async DevServer.pipeImpl (C:\Users\User\Desktop\grandline\node_modules\.pnpm\next@16.2.0_@babel+core@7.2_b86070beca29b6c1c8e8aa5762aaeb3e\node_modules\next\dist\server\base-server.js:1043:25)
              at async NextNodeServer.handleCatchallRenderRequest (C:\Users\User\Desktop\grandline\node_modules\.pnpm\next@16.2.0_@babel+core@7.2_b86070beca29b6c1c8e8aa5762aaeb3e\node_modules\next\dist\server\next-server.js:338:17)
              at async DevServer.handleRequestImpl (C:\Users\User\Desktop\grandline\node_modules\.pnpm\next@16.2.0_@babel+core@7.2_b86070beca29b6c1c8e8aa5762aaeb3e\node_modules\next\dist\server\base-server.js:934:17)
              at async C:\Users\User\Desktop\grandline\node_modules\.pnpm\next@16.2.0_@babel+core@7.2_b86070beca29b6c1c8e8aa5762aaeb3e\node_modules\next\dist\server\dev\next-dev-server.js:394:20
              at async Span.traceAsyncFn (C:\Users\User\Desktop\grandline\node_modules\.pnpm\next@16.2.0_@babel+core@7.2_b86070beca29b6c1c8e8aa5762aaeb3e\node_modules\next\dist\trace\trace.js:164:20)
              at async DevServer.handleRequest (C:\Users\User\Desktop\grandline\node_modules\.pnpm\next@16.2.0_@babel+core@7.2_b86070beca29b6c1c8e8aa5762aaeb3e\node_modules\next\dist\server\dev\next-dev-server.js:390:24)
              at async invokeRender (C:\Users\User\Desktop\grandline\node_modules\.pnpm\next@16.2.0_@babel+core@7.2_b86070beca29b6c1c8e8aa5762aaeb3e\node_modules\next\dist\server\lib\router-server.js:253:21)
              at async handleRequest (C:\Users\User\Desktop\grandline\node_modules\.pnpm\next@16.2.0_@babel+core@7.2_b86070beca29b6c1c8e8aa5762aaeb3e\node_modules\next\dist\server\lib\router-server.js:452:24)
              at async requestHandlerImpl (C:\Users\User\Desktop\grandline\node_modules\.pnpm\next@16.2.0_@babel+core@7.2_b86070beca29b6c1c8e8aa5762aaeb3e\node_modules\next\dist\server\lib\router-server.js:501:13)
              at async Server.requestListener (C:\Users\User\Desktop\grandline\node_modules\.pnpm\next@16.2.0_@babel+core@7.2_b86070beca29b6c1c8e8aa5762aaeb3e\node_modules\next\dist\server\lib\start-server.js:225:13)
          caused by: error: canceling statement due to statement timeout
              at C:\Users\User\Desktop\grandline\node_modules\.pnpm\pg-pool@3.10.1_pg@8.16.3\node_modules\pg-pool\index.js:45:11   
              at process.processTicksAndRejections (node:internal/process/task_queues:103:5)
              at async file:///C:/Users/User/Desktop/grandline/node_modules/.pnpm/drizzle-orm@0.44.7_@opentel_40aa7e6344246917eead8a349c72654a/node_modules/drizzle-orm/node-postgres/session.js:124:18
              at async NodePgPreparedQuery.queryWithCache (file:///C:/Users/User/Desktop/grandline/node_modules/.pnpm/drizzle-orm@0.44.7_@opentel_40aa7e6344246917eead8a349c72654a/node_modules/drizzle-orm/pg-core/session.js:39:16)
              at async file:///C:/Users/User/Desktop/grandline/node_modules/.pnpm/drizzle-orm@0.44.7_@opentel_40aa7e6344246917eead8a349c72654a/node_modules/drizzle-orm/node-postgres/session.js:117:22
              at async Object.insert (file:///C:/Users/User/Desktop/grandline/node_modules/.pnpm/@payloadcms+drizzle@3.80.0__cafa1f1787bd650a92176563df216607/node_modules/@payloadcms/drizzle/dist/postgres/insert.js:7:18)
              at async upsertRow (file:///C:/Users/User/Desktop/grandline/node_modules/.pnpm/@payloadcms+drizzle@3.80.0__cafa1f1787bd650a92176563df216607/node_modules/@payloadcms/drizzle/dist/upsertRow/index.js:306:13)
              at async Object.create (file:///C:/Users/User/Desktop/grandline/node_modules/.pnpm/@payloadcms+drizzle@3.80.0__cafa1f1787bd650a92176563df216607/node_modules/@payloadcms/drizzle/dist/create.js:8:20)
              at async handleFormStateLocking (C:\Users\User\Desktop\grandline\apps\cms\.next\dev\server\chunks\ssr\0baz_@payloadcms_ui_dist_10.drcv._.js:6047:17)
              at async buildFormState (C:\Users\User\Desktop\grandline\apps\cms\.next\dev\server\chunks\ssr\0baz_@payloadcms_ui_dist_10.drcv._.js:6444:29)
              at async buildFormStateHandler (C:\Users\User\Desktop\grandline\apps\cms\.next\dev\server\chunks\ssr\0baz_@payloadcms_ui_dist_10.drcv._.js:6331:21)
              at async executeActionAndPrepareForRender (C:\Users\User\Desktop\grandline\node_modules\.pnpm\next@16.2.0_@babel+core@7.2_b86070beca29b6c1c8e8aa5762aaeb3e\node_modules\next\dist\compiled\next-server\app-page-turbo.runtime.dev.js:64:5248)
              at async C:\Users\User\Desktop\grandline\node_modules\.pnpm\next@16.2.0_@babel+core@7.2_b86070beca29b6c1c8e8aa5762aaeb3e\node_modules\next\dist\compiled\next-server\app-page-turbo.runtime.dev.js:64:1986
              at async handleAction (C:\Users\User\Desktop\grandline\node_modules\.pnpm\next@16.2.0_@babel+core@7.2_b86070beca29b6c1c8e8aa5762aaeb3e\node_modules\next\dist\compiled\next-server\app-page-turbo.runtime.dev.js:62:25378)
              at async renderToHTMLOrFlightImpl (C:\Users\User\Desktop\grandline\node_modules\.pnpm\next@16.2.0_@babel+core@7.2_b86070beca29b6c1c8e8aa5762aaeb3e\node_modules\next\dist\compiled\next-server\app-page-turbo.runtime.dev.js:69:55630)
              at async doRender (C:\Users\User\Desktop\grandline\apps\cms\.next\dev\server\chunks\ssr\node_modules__pnpm_11y0kuh._.js:5682:28)
              at async AppPageRouteModule.handleResponse (C:\Users\User\Desktop\grandline\node_modules\.pnpm\next@16.2.0_@babel+core@7.2_b86070beca29b6c1c8e8aa5762aaeb3e\node_modules\next\dist\compiled\next-server\app-page-turbo.runtime.dev.js:71:63567)
              at async handleResponse (C:\Users\User\Desktop\grandline\apps\cms\.next\dev\server\chunks\ssr\node_modules__pnpm_11y0kuh._.js:5957:32)
              at async Module.handler (C:\Users\User\Desktop\grandline\apps\cms\.next\dev\server\chunks\ssr\node_modules__pnpm_11y0kuh._.js:6360:20)
              at async DevServer.renderToResponseWithComponentsImpl (C:\Users\User\Desktop\grandline\node_modules\.pnpm\next@16.2.0_@babel+core@7.2_b86070beca29b6c1c8e8aa5762aaeb3e\node_modules\next\dist\server\base-server.js:1454:9)
              at async DevServer.renderPageComponent (C:\Users\User\Desktop\grandline\node_modules\.pnpm\next@16.2.0_@babel+core@7.2_b86070beca29b6c1c8e8aa5762aaeb3e\node_modules\next\dist\server\base-server.js:1506:24)
              at async DevServer.renderToResponseImpl (C:\Users\User\Desktop\grandline\node_modules\.pnpm\next@16.2.0_@babel+core@7.2_b86070beca29b6c1c8e8aa5762aaeb3e\node_modules\next\dist\server\base-server.js:1556:32)
              at async DevServer.pipeImpl (C:\Users\User\Desktop\grandline\node_modules\.pnpm\next@16.2.0_@babel+core@7.2_b86070beca29b6c1c8e8aa5762aaeb3e\node_modules\next\dist\server\base-server.js:1043:25)
              at async NextNodeServer.handleCatchallRenderRequest (C:\Users\User\Desktop\grandline\node_modules\.pnpm\next@16.2.0_@babel+core@7.2_b86070beca29b6c1c8e8aa5762aaeb3e\node_modules\next\dist\server\next-server.js:338:17)
              at async DevServer.handleRequestImpl (C:\Users\User\Desktop\grandline\node_modules\.pnpm\next@16.2.0_@babel+core@7.2_b86070beca29b6c1c8e8aa5762aaeb3e\node_modules\next\dist\server\base-server.js:934:17)
              at async C:\Users\User\Desktop\grandline\node_modules\.pnpm\next@16.2.0_@babel+core@7.2_b86070beca29b6c1c8e8aa5762aaeb3e\node_modules\next\dist\server\dev\next-dev-server.js:394:20
              at async Span.traceAsyncFn (C:\Users\User\Desktop\grandline\node_modules\.pnpm\next@16.2.0_@babel+core@7.2_b86070beca29b6c1c8e8aa5762aaeb3e\node_modules\next\dist\trace\trace.js:164:20)
              at async DevServer.handleRequest (C:\Users\User\Desktop\grandline\node_modules\.pnpm\next@16.2.0_@babel+core@7.2_b86070beca29b6c1c8e8aa5762aaeb3e\node_modules\next\dist\server\dev\next-dev-server.js:390:24)
              at async invokeRender (C:\Users\User\Desktop\grandline\node_modules\.pnpm\next@16.2.0_@babel+core@7.2_b86070beca29b6c1c8e8aa5762aaeb3e\node_modules\next\dist\server\lib\router-server.js:253:21)
              at async handleRequest (C:\Users\User\Desktop\grandline\node_modules\.pnpm\next@16.2.0_@babel+core@7.2_b86070beca29b6c1c8e8aa5762aaeb3e\node_modules\next\dist\server\lib\router-server.js:452:24)
              at async requestHandlerImpl (C:\Users\User\Desktop\grandline\node_modules\.pnpm\next@16.2.0_@babel+core@7.2_b86070beca29b6c1c8e8aa5762aaeb3e\node_modules\next\dist\server\lib\router-server.js:501:13)
              at async Server.requestListener (C:\Users\User\Desktop\grandline\node_modules\.pnpm\next@16.2.0_@babel+core@7.2_b86070beca29b6c1c8e8aa5762aaeb3e\node_modules\next\dist\server\lib\start-server.js:225:13)
      "query": "insert into \"payload_locked_documents_rels\" (\"id\", \"order\", \"parent_id\", \"path\", \"users_id\", \"instructors_id\", \"trainees_id\", \"admins_id\", \"user_events_id\", \"emergency_contacts_id\", \"media_id\", \"posts_id\", \"post_categories_id\", \"courses_id\", \"course_categories_id\", \"coupon_codes_id\", \"coupon_redemptions_id\", \"course_enrollments_id\", \"certificates_id\", \"certificate_templates_id\", \"course_modules_id\", \"course_lessons_id\", \"materials_id\", \"course_materials_id\", \"lesson_materials_id\", \"announcements_id\", \"feedback_forms_id\", \"feedback_submissions_id\", \"wishlists_id\", \"recently_viewed_courses_id\", \"course_item_progress_id\", \"questions_id\", \"assessments_id\", \"assessment_submissions_id\", \"assignments_id\", \"assignment_submissions_id\", \"submission_answers_id\", \"notification_templates_id\", \"notifications_id\", \"user_notifications_id\", \"web_push_subscriptions_id\", \"support_tickets_id\", \"support_ticket_messages_id\", \"chats_id\", \"chat_messages_id\", \"chat_message_status_id\", \"chat_typing_status_id\") values (default, default, $1, $2, $3, default, default, default, default, default, default, default, default, default, default, default, default, default, default, default, default, default, default, default, default, default, default, default, default, default, default, default, default, default, default, default, default, default, default, default, default, default, default, default, default, default, default), (default, default, $4, $5, $6, default, default, default, default, default, default, default, default, default, default, default, default, default, default, default, default, default, default, default, default, default, default, default, default, default, default, default, default, default, default, default, default, default, default, default, default, default, default, default, default, default, default) returning \"id\", \"order\", \"parent_id\", \"path\", \"users_id\", \"instructors_id\", \"trainees_id\", \"admins_id\", \"user_events_id\", \"emergency_contacts_id\", \"media_id\", \"posts_id\", \"post_categories_id\", \"courses_id\", \"course_categories_id\", \"coupon_codes_id\", \"coupon_redemptions_id\", \"course_enrollments_id\", \"certificates_id\", \"certificate_templates_id\", \"course_modules_id\", \"course_lessons_id\", \"materials_id\", \"course_materials_id\", \"lesson_materials_id\", \"announcements_id\", \"feedback_forms_id\", \"feedback_submissions_id\", \"wishlists_id\", \"recently_viewed_courses_id\", \"course_item_progress_id\", \"questions_id\", \"assessments_id\", \"assessment_submissions_id\", \"assignments_id\", \"assignment_submissions_id\", \"submission_answers_id\", \"notification_templates_id\", \"notifications_id\", \"user_notifications_id\", \"web_push_subscriptions_id\", \"support_tickets_id\", \"support_ticket_messages_id\", \"chats_id\", \"chat_messages_id\", \"chat_message_status_id\", \"chat_typing_status_id\"",
      "params": [
        188,
        "document",
        4,
        188,
        "user",
        1
      ]
    }
 POST /admin/collections/users/4 200 in 2.0min (next.js: 18ms, application-code: 2.0min)
  └─ ƒ <inline action>({"args":{"checkForStaleData":true,"collectionSlug":"users","docPermissions":"[Object]","...":"11 items not stringified"},"name":"form-state"}) in 120591ms src/app/(payload)/layout.tsx
[10:11:25] ERROR: Failed query: insert into "users" ("id", "first_name", "last_name", "middle_name", "name_extension", "username", "gender", "civil_status", "nationality", "birth_date", "place_of_birth", "phone", "complete_address", "biography", "role", "is_active", "push_notifications_enabled", "security_alerts_email_enabled", "last_login", "profile_picture_id", "updated_at", "created_at", "enable_a_p_i_key", "api_key", "api_key_index", "email", "reset_password_token", "reset_password_expiration", "salt", "hash", "login_attempts", "lock_until") values ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24, $25, $26, $27, $28, $29, $30, $31, $32) on conflict ("id") do update set "id" = $33, "first_name" = $34, "last_name" = $35, "middle_name" = $36, "name_extension" = $37, "username" = $38, "gender" = $39, "civil_status" = $40, "nationality" = $41, "birth_date" = $42, "place_of_birth" = $43, "phone" = $44, "complete_address" = $45, "biography" = $46, "role" = $47, "is_active" = $48, "push_notifications_enabled" = $49, "security_alerts_email_enabled" = $50, "last_login" = $51, "profile_picture_id" = $52, "updated_at" = $53, "created_at" = $54, "enable_a_p_i_key" = $55, "api_key" = $56, "api_key_index" = $57, "email" = $58, "reset_password_token" = $59, "reset_password_expiration" = $60, "salt" = $61, "hash" = $62, "login_attempts" = $63, "lock_until" = $64 returning "id", "first_name", "last_name", "middle_name", "name_extension", "username", "gender", "civil_status", "nationality", "birth_date", "place_of_birth", "phone", "complete_address", "biography", "role", "is_active", "push_notifications_enabled", "security_alerts_email_enabled", "last_login", "profile_picture_id", "updated_at", "created_at", "enable_a_p_i_key", "api_key", "api_key_index", "email", "reset_password_token", "reset_password_expiration", "salt", "hash", "login_attempts", "lock_until"
params: 4,Michael,Lhayos,,,,,,,,,,,,instructor,true,true,true,,4,2026-05-21T02:09:25.683Z,2026-04-05T08:04:17.959Z,,,,michael@gmail.com,,,03c73b25b723a63928c20bd5e7cd924f6e28de902259bb690776f9be61705c1c,4341f999327f0defca47d71f5984bbcc6bb855380348adbbadde9311bd6726e486a774a176d5447476b76dcd7b2bbb7d8cad5986f41edf252c2e55fcbb20019e62b0d264c70f65af4c6705d102eb162b87aec68822d55b530b35caa73c3d77a476366d7fe3d3f3e4b1603688d6f88c9a46d0ca926243c153c295e216a397320011b1a4aaf414cda755b5b12f873473dcf8664c76039a183113cc777fa99ec11719f79df588b71fb479ee02a164f7674d5d79964b651f0c7dea0998c3e836a08aa71dc79387bf3d00c23f0e8560c0dd5e2651fc9015850ab0416a15dfa8a4e09fc0e674172ba47576429804464e91119f9fe138ba9dc2ce126cc28e037c90a0009d921aa2f34e5b9ed7b8dac30e5d0d6cde23ad0804477971f9ee62fb57bb76afb3a08443f347000f76e725cde21aa271d80d0a77e19e6445640b3dffd419a138037fa1e115b244e3d48d485ec6f6b2d2c6ec8721d25b826df23bf94c1b15e3a67cd0799a3008fdab20d3d09da61b031abf1f8b420d0d63617791b4977154315182a87a5a13d3e462b096b110c32e41902203474cb12d6afa0d6ec936c3d67442a96e7c66642ba4383072658289c2ce67f4254dc8cafa76a5470f316fb5e640e5cd76340dd709e652ec46936aac79f6f904d256e8f8fd580896f4b6702f9b336cd7cf9bdacc07758dc44386fe755318374c6894ee975b8b784447a3be097b3a32,0,,4,Michael,Lhayos,,,,,,,,,,,,instructor,true,true,true,,4,2026-05-21T02:09:25.683Z,2026-04-05T08:04:17.959Z,,,,michael@gmail.com,,,03c73b25b723a63928c20bd5e7cd924f6e28de902259bb690776f9be61705c1c,4341f999327f0defca47d71f5984bbcc6bb855380348adbbadde9311bd6726e486a774a176d5447476b76dcd7b2bbb7d8cad5986f41edf252c2e55fcbb20019e62b0d264c70f65af4c6705d102eb162b87aec68822d55b530b35caa73c3d77a476366d7fe3d3f3e4b1603688d6f88c9a46d0ca926243c153c295e216a397320011b1a4aaf414cda755b5b12f873473dcf8664c76039a183113cc777fa99ec11719f79df588b71fb479ee02a164f7674d5d79964b651f0c7dea0998c3e836a08aa71dc79387bf3d00c23f0e8560c0dd5e2651fc9015850ab0416a15dfa8a4e09fc0e674172ba47576429804464e91119f9fe138ba9dc2ce126cc28e037c90a0009d921aa2f34e5b9ed7b8dac30e5d0d6cde23ad0804477971f9ee62fb57bb76afb3a08443f347000f76e725cde21aa271d80d0a77e19e6445640b3dffd419a138037fa1e115b244e3d48d485ec6f6b2d2c6ec8721d25b826df23bf94c1b15e3a67cd0799a3008fdab20d3d09da61b031abf1f8b420d0d63617791b4977154315182a87a5a13d3e462b096b110c32e41902203474cb12d6afa0d6ec936c3d67442a96e7c66642ba4383072658289c2ce67f4254dc8cafa76a5470f316fb5e640e5cd76340dd709e652ec46936aac79f6f904d256e8f8fd580896f4b6702f9b336cd7cf9bdacc07758dc44386fe755318374c6894ee975b8b784447a3be097b3a32,0,
    err: {
      "type": "DrizzleQueryError",
      "message": "Failed query: insert into \"users\" (\"id\", \"first_name\", \"last_name\", \"middle_name\", \"name_extension\", \"username\", \"gender\", \"civil_status\", \"nationality\", \"birth_date\", \"place_of_birth\", \"phone\", \"complete_address\", \"biography\", \"role\", \"is_active\", \"push_notifications_enabled\", \"security_alerts_email_enabled\", \"last_login\", \"profile_picture_id\", \"updated_at\", \"created_at\", \"enable_a_p_i_key\", \"api_key\", \"api_key_index\", \"email\", \"reset_password_token\", \"reset_password_expiration\", \"salt\", \"hash\", \"login_attempts\", \"lock_until\") values ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24, $25, $26, $27, $28, $29, $30, $31, $32) on conflict (\"id\") do update set \"id\" = $33, \"first_name\" = $34, \"last_name\" = $35, \"middle_name\" = $36, \"name_extension\" = $37, \"username\" = $38, \"gender\" = $39, \"civil_status\" = $40, \"nationality\" = $41, \"birth_date\" = $42, \"place_of_birth\" = $43, \"phone\" = $44, \"complete_address\" = $45, \"biography\" = $46, \"role\" = $47, \"is_active\" = $48, \"push_notifications_enabled\" = $49, \"security_alerts_email_enabled\" = $50, \"last_login\" = $51, \"profile_picture_id\" = $52, \"updated_at\" = $53, \"created_at\" = $54, \"enable_a_p_i_key\" = $55, \"api_key\" = $56, \"api_key_index\" = $57, \"email\" = $58, \"reset_password_token\" = $59, \"reset_password_expiration\" = $60, \"salt\" = $61, \"hash\" = $62, \"login_attempts\" = $63, \"lock_until\" = $64 returning \"id\", \"first_name\", \"last_name\", \"middle_name\", \"name_extension\", \"username\", \"gender\", \"civil_status\", \"nationality\", \"birth_date\", \"place_of_birth\", \"phone\", \"complete_address\", \"biography\", \"role\", \"is_active\", \"push_notifications_enabled\", \"security_alerts_email_enabled\", \"last_login\", \"profile_picture_id\", \"updated_at\", \"created_at\", \"enable_a_p_i_key\", \"api_key\", \"api_key_index\", \"email\", \"reset_password_token\", \"reset_password_expiration\", \"salt\", \"hash\", \"login_attempts\", \"lock_until\"\nparams: 4,Michael,Lhayos,,,,,,,,,,,,instructor,true,true,true,,4,2026-05-21T02:09:25.683Z,2026-04-05T08:04:17.959Z,,,,michael@gmail.com,,,03c73b25b723a63928c20bd5e7cd924f6e28de902259bb690776f9be61705c1c,4341f999327f0defca47d71f5984bbcc6bb855380348adbbadde9311bd6726e486a774a176d5447476b76dcd7b2bbb7d8cad5986f41edf252c2e55fcbb20019e62b0d264c70f65af4c6705d102eb162b87aec68822d55b530b35caa73c3d77a476366d7fe3d3f3e4b1603688d6f88c9a46d0ca926243c153c295e216a397320011b1a4aaf414cda755b5b12f873473dcf8664c76039a183113cc777fa99ec11719f79df588b71fb479ee02a164f7674d5d79964b651f0c7dea0998c3e836a08aa71dc79387bf3d00c23f0e8560c0dd5e2651fc9015850ab0416a15dfa8a4e09fc0e674172ba47576429804464e91119f9fe138ba9dc2ce126cc28e037c90a0009d921aa2f34e5b9ed7b8dac30e5d0d6cde23ad0804477971f9ee62fb57bb76afb3a08443f347000f76e725cde21aa271d80d0a77e19e6445640b3dffd419a138037fa1e115b244e3d48d485ec6f6b2d2c6ec8721d25b826df23bf94c1b15e3a67cd0799a3008fdab20d3d09da61b031abf1f8b420d0d63617791b4977154315182a87a5a13d3e462b096b110c32e41902203474cb12d6afa0d6ec936c3d67442a96e7c66642ba4383072658289c2ce67f4254dc8cafa76a5470f316fb5e640e5cd76340dd709e652ec46936aac79f6f904d256e8f8fd580896f4b6702f9b336cd7cf9bdacc07758dc44386fe755318374c6894ee975b8b784447a3be097b3a32,0,,4,Michael,Lhayos,,,,,,,,,,,,instructor,true,true,true,,4,2026-05-21T02:09:25.683Z,2026-04-05T08:04:17.959Z,,,,michael@gmail.com,,,03c73b25b723a63928c20bd5e7cd924f6e28de902259bb690776f9be61705c1c,4341f999327f0defca47d71f5984bbcc6bb855380348adbbadde9311bd6726e486a774a176d5447476b76dcd7b2bbb7d8cad5986f41edf252c2e55fcbb20019e62b0d264c70f65af4c6705d102eb162b87aec68822d55b530b35caa73c3d77a476366d7fe3d3f3e4b1603688d6f88c9a46d0ca926243c153c295e216a397320011b1a4aaf414cda755b5b12f873473dcf8664c76039a183113cc777fa99ec11719f79df588b71fb479ee02a164f7674d5d79964b651f0c7dea0998c3e836a08aa71dc79387bf3d00c23f0e8560c0dd5e2651fc9015850ab0416a15dfa8a4e09fc0e674172ba47576429804464e91119f9fe138ba9dc2ce126cc28e037c90a0009d921aa2f34e5b9ed7b8dac30e5d0d6cde23ad0804477971f9ee62fb57bb76afb3a08443f347000f76e725cde21aa271d80d0a77e19e6445640b3dffd419a138037fa1e115b244e3d48d485ec6f6b2d2c6ec8721d25b826df23bf94c1b15e3a67cd0799a3008fdab20d3d09da61b031abf1f8b420d0d63617791b4977154315182a87a5a13d3e462b096b110c32e41902203474cb12d6afa0d6ec936c3d67442a96e7c66642ba4383072658289c2ce67f4254dc8cafa76a5470f316fb5e640e5cd76340dd709e652ec46936aac79f6f904d256e8f8fd580896f4b6702f9b336cd7cf9bdacc07758dc44386fe755318374c6894ee975b8b784447a3be097b3a32,0,: canceling statement due to statement timeout",
      "stack":
          Error: Failed query: insert into "users" ("id", "first_name", "last_name", "middle_name", "name_extension", "username", "gender", "civil_status", "nationality", "birth_date", "place_of_birth", "phone", "complete_address", "biography", "role", "is_active", "push_notifications_enabled", "security_alerts_email_enabled", "last_login", "profile_picture_id", "updated_at", "created_at", "enable_a_p_i_key", "api_key", "api_key_index", "email", "reset_password_token", "reset_password_expiration", "salt", "hash", "login_attempts", "lock_until") values ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24, $25, $26, $27, $28, $29, $30, $31, $32) on conflict ("id") do update set "id" = $33, "first_name" = $34, "last_name" = $35, "middle_name" = $36, "name_extension" = $37, "username" = $38, "gender" = $39, "civil_status" = $40, "nationality" = $41, "birth_date" = $42, "place_of_birth" = $43, "phone" = $44, "complete_address" = $45, "biography" = $46, "role" = $47, "is_active" = $48, "push_notifications_enabled" = $49, "security_alerts_email_enabled" = $50, "last_login" = $51, "profile_picture_id" = $52, "updated_at" = $53, "created_at" = $54, "enable_a_p_i_key" = $55, "api_key" = $56, "api_key_index" = $57, "email" = $58, "reset_password_token" = $59, "reset_password_expiration" = $60, "salt" = $61, "hash" = $62, "login_attempts" = $63, "lock_until" = $64 returning "id", "first_name", "last_name", "middle_name", "name_extension", "username", "gender", "civil_status", "nationality", "birth_date", "place_of_birth", "phone", "complete_address", "biography", "role", "is_active", "push_notifications_enabled", "security_alerts_email_enabled", "last_login", "profile_picture_id", "updated_at", "created_at", "enable_a_p_i_key", "api_key", "api_key_index", "email", "reset_password_token", "reset_password_expiration", "salt", "hash", "login_attempts", "lock_until"
          params: 4,Michael,Lhayos,,,,,,,,,,,,instructor,true,true,true,,4,2026-05-21T02:09:25.683Z,2026-04-05T08:04:17.959Z,,,,michael@gmail.com,,,03c73b25b723a63928c20bd5e7cd924f6e28de902259bb690776f9be61705c1c,4341f999327f0defca47d71f5984bbcc6bb855380348adbbadde9311bd6726e486a774a176d5447476b76dcd7b2bbb7d8cad5986f41edf252c2e55fcbb20019e62b0d264c70f65af4c6705d102eb162b87aec68822d55b530b35caa73c3d77a476366d7fe3d3f3e4b1603688d6f88c9a46d0ca926243c153c295e216a397320011b1a4aaf414cda755b5b12f873473dcf8664c76039a183113cc777fa99ec11719f79df588b71fb479ee02a164f7674d5d79964b651f0c7dea0998c3e836a08aa71dc79387bf3d00c23f0e8560c0dd5e2651fc9015850ab0416a15dfa8a4e09fc0e674172ba47576429804464e91119f9fe138ba9dc2ce126cc28e037c90a0009d921aa2f34e5b9ed7b8dac30e5d0d6cde23ad0804477971f9ee62fb57bb76afb3a08443f347000f76e725cde21aa271d80d0a77e19e6445640b3dffd419a138037fa1e115b244e3d48d485ec6f6b2d2c6ec8721d25b826df23bf94c1b15e3a67cd0799a3008fdab20d3d09da61b031abf1f8b420d0d63617791b4977154315182a87a5a13d3e462b096b110c32e41902203474cb12d6afa0d6ec936c3d67442a96e7c66642ba4383072658289c2ce67f4254dc8cafa76a5470f316fb5e640e5cd76340dd709e652ec46936aac79f6f904d256e8f8fd580896f4b6702f9b336cd7cf9bdacc07758dc44386fe755318374c6894ee975b8b784447a3be097b3a32,0,,4,Michael,Lhayos,,,,,,,,,,,,instructor,true,true,true,,4,2026-05-21T02:09:25.683Z,2026-04-05T08:04:17.959Z,,,,michael@gmail.com,,,03c73b25b723a63928c20bd5e7cd924f6e28de902259bb690776f9be61705c1c,4341f999327f0defca47d71f5984bbcc6bb855380348adbbadde9311bd6726e486a774a176d5447476b76dcd7b2bbb7d8cad5986f41edf252c2e55fcbb20019e62b0d264c70f65af4c6705d102eb162b87aec68822d55b530b35caa73c3d77a476366d7fe3d3f3e4b1603688d6f88c9a46d0ca926243c153c295e216a397320011b1a4aaf414cda755b5b12f873473dcf8664c76039a183113cc777fa99ec11719f79df588b71fb479ee02a164f7674d5d79964b651f0c7dea0998c3e836a08aa71dc79387bf3d00c23f0e8560c0dd5e2651fc9015850ab0416a15dfa8a4e09fc0e674172ba47576429804464e91119f9fe138ba9dc2ce126cc28e037c90a0009d921aa2f34e5b9ed7b8dac30e5d0d6cde23ad0804477971f9ee62fb57bb76afb3a08443f347000f76e725cde21aa271d80d0a77e19e6445640b3dffd419a138037fa1e115b244e3d48d485ec6f6b2d2c6ec8721d25b826df23bf94c1b15e3a67cd0799a3008fdab20d3d09da61b031abf1f8b420d0d63617791b4977154315182a87a5a13d3e462b096b110c32e41902203474cb12d6afa0d6ec936c3d67442a96e7c66642ba4383072658289c2ce67f4254dc8cafa76a5470f316fb5e640e5cd76340dd709e652ec46936aac79f6f904d256e8f8fd580896f4b6702f9b336cd7cf9bdacc07758dc44386fe755318374c6894ee975b8b784447a3be097b3a32,0,
              at NodePgPreparedQuery.queryWithCache (file:///C:/Users/User/Desktop/grandline/node_modules/.pnpm/drizzle-orm@0.44.7_@opentel_40aa7e6344246917eead8a349c72654a/node_modules/drizzle-orm/pg-core/session.js:41:15)
              at process.processTicksAndRejections (node:internal/process/task_queues:103:5)
              at async file:///C:/Users/User/Desktop/grandline/node_modules/.pnpm/drizzle-orm@0.44.7_@opentel_40aa7e6344246917eead8a349c72654a/node_modules/drizzle-orm/node-postgres/session.js:117:22
              at async Object.insert (file:///C:/Users/User/Desktop/grandline/node_modules/.pnpm/@payloadcms+drizzle@3.80.0__cafa1f1787bd650a92176563df216607/node_modules/@payloadcms/drizzle/dist/postgres/insert.js:5:18)
              at async upsertRow (file:///C:/Users/User/Desktop/grandline/node_modules/.pnpm/@payloadcms+drizzle@3.80.0__cafa1f1787bd650a92176563df216607/node_modules/@payloadcms/drizzle/dist/upsertRow/index.js:164:37)
              at async Object.updateOne (file:///C:/Users/User/Desktop/grandline/node_modules/.pnpm/@payloadcms+drizzle@3.80.0__cafa1f1787bd650a92176563df216607/node_modules/@payloadcms/drizzle/dist/updateOne.js:48:20)
              at async updateDocument (file:///C:/Users/User/Desktop/grandline/node_modules/.pnpm/payload@3.80.0_graphql@16.11.0_typescript@5.7.3/node_modules/payload/dist/collections/operations/utilities/update.js:247:18)
              at async updateByIDOperation (file:///C:/Users/User/Desktop/grandline/node_modules/.pnpm/payload@3.80.0_graphql@16.11.0_typescript@5.7.3/node_modules/payload/dist/collections/operations/updateByID.js:114:22)
              at async updateByIDHandler (file:///C:/Users/User/Desktop/grandline/node_modules/.pnpm/payload@3.80.0_graphql@16.11.0_typescript@5.7.3/node_modules/payload/dist/collections/endpoints/updateByID.js:9:17)
              at async handleEndpoints (file:///C:/Users/User/Desktop/grandline/node_modules/.pnpm/payload@3.80.0_graphql@16.11.0_typescript@5.7.3/node_modules/payload/dist/utilities/handleEndpoints.js:198:26)
              at async C:\Users\User\Desktop\grandline\apps\cms\.next\dev\server\chunks\node_modules__pnpm_0y~hwxm._.js:36047:26   
              at async AppRouteRouteModule.do (C:\Users\User\Desktop\grandline\node_modules\.pnpm\next@16.2.0_@babel+core@7.2_b86070beca29b6c1c8e8aa5762aaeb3e\node_modules\next\dist\compiled\next-server\app-route-turbo.runtime.dev.js:5:40732)
              at async AppRouteRouteModule.handle (C:\Users\User\Desktop\grandline\node_modules\.pnpm\next@16.2.0_@babel+core@7.2_b86070beca29b6c1c8e8aa5762aaeb3e\node_modules\next\dist\compiled\next-server\app-route-turbo.runtime.dev.js:5:47861)
              at async responseGenerator (C:\Users\User\Desktop\grandline\apps\cms\.next\dev\server\chunks\030r_next_0i~ny8-._.js:10481:38)
              at async AppRouteRouteModule.handleResponse (C:\Users\User\Desktop\grandline\node_modules\.pnpm\next@16.2.0_@babel+core@7.2_b86070beca29b6c1c8e8aa5762aaeb3e\node_modules\next\dist\compiled\next-server\app-route-turbo.runtime.dev.js:1:227216)       
              at async handleResponse (C:\Users\User\Desktop\grandline\apps\cms\.next\dev\server\chunks\030r_next_0i~ny8-._.js:10544:32)
              at async Module.handler (C:\Users\User\Desktop\grandline\apps\cms\.next\dev\server\chunks\030r_next_0i~ny8-._.js:10598:13)
              at async DevServer.renderToResponseWithComponentsImpl (C:\Users\User\Desktop\grandline\node_modules\.pnpm\next@16.2.0_@babel+core@7.2_b86070beca29b6c1c8e8aa5762aaeb3e\node_modules\next\dist\server\base-server.js:1454:9)
              at async DevServer.renderPageComponent (C:\Users\User\Desktop\grandline\node_modules\.pnpm\next@16.2.0_@babel+core@7.2_b86070beca29b6c1c8e8aa5762aaeb3e\node_modules\next\dist\server\base-server.js:1506:24)
              at async DevServer.renderToResponseImpl (C:\Users\User\Desktop\grandline\node_modules\.pnpm\next@16.2.0_@babel+core@7.2_b86070beca29b6c1c8e8aa5762aaeb3e\node_modules\next\dist\server\base-server.js:1556:32)
              at async DevServer.pipeImpl (C:\Users\User\Desktop\grandline\node_modules\.pnpm\next@16.2.0_@babel+core@7.2_b86070beca29b6c1c8e8aa5762aaeb3e\node_modules\next\dist\server\base-server.js:1043:25)
              at async NextNodeServer.handleCatchallRenderRequest (C:\Users\User\Desktop\grandline\node_modules\.pnpm\next@16.2.0_@babel+core@7.2_b86070beca29b6c1c8e8aa5762aaeb3e\node_modules\next\dist\server\next-server.js:338:17)
              at async DevServer.handleRequestImpl (C:\Users\User\Desktop\grandline\node_modules\.pnpm\next@16.2.0_@babel+core@7.2_b86070beca29b6c1c8e8aa5762aaeb3e\node_modules\next\dist\server\base-server.js:934:17)
              at async C:\Users\User\Desktop\grandline\node_modules\.pnpm\next@16.2.0_@babel+core@7.2_b86070beca29b6c1c8e8aa5762aaeb3e\node_modules\next\dist\server\dev\next-dev-server.js:394:20
              at async Span.traceAsyncFn (C:\Users\User\Desktop\grandline\node_modules\.pnpm\next@16.2.0_@babel+core@7.2_b86070beca29b6c1c8e8aa5762aaeb3e\node_modules\next\dist\trace\trace.js:164:20)
              at async DevServer.handleRequest (C:\Users\User\Desktop\grandline\node_modules\.pnpm\next@16.2.0_@babel+core@7.2_b86070beca29b6c1c8e8aa5762aaeb3e\node_modules\next\dist\server\dev\next-dev-server.js:390:24)
              at async invokeRender (C:\Users\User\Desktop\grandline\node_modules\.pnpm\next@16.2.0_@babel+core@7.2_b86070beca29b6c1c8e8aa5762aaeb3e\node_modules\next\dist\server\lib\router-server.js:253:21)
              at async handleRequest (C:\Users\User\Desktop\grandline\node_modules\.pnpm\next@16.2.0_@babel+core@7.2_b86070beca29b6c1c8e8aa5762aaeb3e\node_modules\next\dist\server\lib\router-server.js:452:24)
              at async requestHandlerImpl (C:\Users\User\Desktop\grandline\node_modules\.pnpm\next@16.2.0_@babel+core@7.2_b86070beca29b6c1c8e8aa5762aaeb3e\node_modules\next\dist\server\lib\router-server.js:501:13)
              at async Server.requestListener (C:\Users\User\Desktop\grandline\node_modules\.pnpm\next@16.2.0_@babel+core@7.2_b86070beca29b6c1c8e8aa5762aaeb3e\node_modules\next\dist\server\lib\start-server.js:225:13)
          caused by: error: canceling statement due to statement timeout
              at C:\Users\User\Desktop\grandline\node_modules\.pnpm\pg@8.16.3\node_modules\pg\lib\client.js:545:17
              at process.processTicksAndRejections (node:internal/process/task_queues:103:5)
              at async file:///C:/Users/User/Desktop/grandline/node_modules/.pnpm/drizzle-orm@0.44.7_@opentel_40aa7e6344246917eead8a349c72654a/node_modules/drizzle-orm/node-postgres/session.js:124:18
              at async NodePgPreparedQuery.queryWithCache (file:///C:/Users/User/Desktop/grandline/node_modules/.pnpm/drizzle-orm@0.44.7_@opentel_40aa7e6344246917eead8a349c72654a/node_modules/drizzle-orm/pg-core/session.js:39:16)
              at async file:///C:/Users/User/Desktop/grandline/node_modules/.pnpm/drizzle-orm@0.44.7_@opentel_40aa7e6344246917eead8a349c72654a/node_modules/drizzle-orm/node-postgres/session.js:117:22
              at async Object.insert (file:///C:/Users/User/Desktop/grandline/node_modules/.pnpm/@payloadcms+drizzle@3.80.0__cafa1f1787bd650a92176563df216607/node_modules/@payloadcms/drizzle/dist/postgres/insert.js:5:18)
              at async upsertRow (file:///C:/Users/User/Desktop/grandline/node_modules/.pnpm/@payloadcms+drizzle@3.80.0__cafa1f1787bd650a92176563df216607/node_modules/@payloadcms/drizzle/dist/upsertRow/index.js:164:37)
              at async Object.updateOne (file:///C:/Users/User/Desktop/grandline/node_modules/.pnpm/@payloadcms+drizzle@3.80.0__cafa1f1787bd650a92176563df216607/node_modules/@payloadcms/drizzle/dist/updateOne.js:48:20)
              at async updateDocument (file:///C:/Users/User/Desktop/grandline/node_modules/.pnpm/payload@3.80.0_graphql@16.11.0_typescript@5.7.3/node_modules/payload/dist/collections/operations/utilities/update.js:247:18)
              at async updateByIDOperation (file:///C:/Users/User/Desktop/grandline/node_modules/.pnpm/payload@3.80.0_graphql@16.11.0_typescript@5.7.3/node_modules/payload/dist/collections/operations/updateByID.js:114:22)
              at async updateByIDHandler (file:///C:/Users/User/Desktop/grandline/node_modules/.pnpm/payload@3.80.0_graphql@16.11.0_typescript@5.7.3/node_modules/payload/dist/collections/endpoints/updateByID.js:9:17)
              at async handleEndpoints (file:///C:/Users/User/Desktop/grandline/node_modules/.pnpm/payload@3.80.0_graphql@16.11.0_typescript@5.7.3/node_modules/payload/dist/utilities/handleEndpoints.js:198:26)
              at async C:\Users\User\Desktop\grandline\apps\cms\.next\dev\server\chunks\node_modules__pnpm_0y~hwxm._.js:36047:26   
              at async AppRouteRouteModule.do (C:\Users\User\Desktop\grandline\node_modules\.pnpm\next@16.2.0_@babel+core@7.2_b86070beca29b6c1c8e8aa5762aaeb3e\node_modules\next\dist\compiled\next-server\app-route-turbo.runtime.dev.js:5:40732)
              at async AppRouteRouteModule.handle (C:\Users\User\Desktop\grandline\node_modules\.pnpm\next@16.2.0_@babel+core@7.2_b86070beca29b6c1c8e8aa5762aaeb3e\node_modules\next\dist\compiled\next-server\app-route-turbo.runtime.dev.js:5:47861)
              at async responseGenerator (C:\Users\User\Desktop\grandline\apps\cms\.next\dev\server\chunks\030r_next_0i~ny8-._.js:10481:38)
              at async AppRouteRouteModule.handleResponse (C:\Users\User\Desktop\grandline\node_modules\.pnpm\next@16.2.0_@babel+core@7.2_b86070beca29b6c1c8e8aa5762aaeb3e\node_modules\next\dist\compiled\next-server\app-route-turbo.runtime.dev.js:1:227216)       
              at async handleResponse (C:\Users\User\Desktop\grandline\apps\cms\.next\dev\server\chunks\030r_next_0i~ny8-._.js:10544:32)
              at async Module.handler (C:\Users\User\Desktop\grandline\apps\cms\.next\dev\server\chunks\030r_next_0i~ny8-._.js:10598:13)
              at async DevServer.renderToResponseWithComponentsImpl (C:\Users\User\Desktop\grandline\node_modules\.pnpm\next@16.2.0_@babel+core@7.2_b86070beca29b6c1c8e8aa5762aaeb3e\node_modules\next\dist\server\base-server.js:1454:9)
              at async DevServer.renderPageComponent (C:\Users\User\Desktop\grandline\node_modules\.pnpm\next@16.2.0_@babel+core@7.2_b86070beca29b6c1c8e8aa5762aaeb3e\node_modules\next\dist\server\base-server.js:1506:24)
              at async DevServer.renderToResponseImpl (C:\Users\User\Desktop\grandline\node_modules\.pnpm\next@16.2.0_@babel+core@7.2_b86070beca29b6c1c8e8aa5762aaeb3e\node_modules\next\dist\server\base-server.js:1556:32)
              at async DevServer.pipeImpl (C:\Users\User\Desktop\grandline\node_modules\.pnpm\next@16.2.0_@babel+core@7.2_b86070beca29b6c1c8e8aa5762aaeb3e\node_modules\next\dist\server\base-server.js:1043:25)
              at async NextNodeServer.handleCatchallRenderRequest (C:\Users\User\Desktop\grandline\node_modules\.pnpm\next@16.2.0_@babel+core@7.2_b86070beca29b6c1c8e8aa5762aaeb3e\node_modules\next\dist\server\next-server.js:338:17)
              at async DevServer.handleRequestImpl (C:\Users\User\Desktop\grandline\node_modules\.pnpm\next@16.2.0_@babel+core@7.2_b86070beca29b6c1c8e8aa5762aaeb3e\node_modules\next\dist\server\base-server.js:934:17)
              at async C:\Users\User\Desktop\grandline\node_modules\.pnpm\next@16.2.0_@babel+core@7.2_b86070beca29b6c1c8e8aa5762aaeb3e\node_modules\next\dist\server\dev\next-dev-server.js:394:20
              at async Span.traceAsyncFn (C:\Users\User\Desktop\grandline\node_modules\.pnpm\next@16.2.0_@babel+core@7.2_b86070beca29b6c1c8e8aa5762aaeb3e\node_modules\next\dist\trace\trace.js:164:20)
              at async DevServer.handleRequest (C:\Users\User\Desktop\grandline\node_modules\.pnpm\next@16.2.0_@babel+core@7.2_b86070beca29b6c1c8e8aa5762aaeb3e\node_modules\next\dist\server\dev\next-dev-server.js:390:24)
              at async invokeRender (C:\Users\User\Desktop\grandline\node_modules\.pnpm\next@16.2.0_@babel+core@7.2_b86070beca29b6c1c8e8aa5762aaeb3e\node_modules\next\dist\server\lib\router-server.js:253:21)
              at async handleRequest (C:\Users\User\Desktop\grandline\node_modules\.pnpm\next@16.2.0_@babel+core@7.2_b86070beca29b6c1c8e8aa5762aaeb3e\node_modules\next\dist\server\lib\router-server.js:452:24)
              at async requestHandlerImpl (C:\Users\User\Desktop\grandline\node_modules\.pnpm\next@16.2.0_@babel+core@7.2_b86070beca29b6c1c8e8aa5762aaeb3e\node_modules\next\dist\server\lib\router-server.js:501:13)
              at async Server.requestListener (C:\Users\User\Desktop\grandline\node_modules\.pnpm\next@16.2.0_@babel+core@7.2_b86070beca29b6c1c8e8aa5762aaeb3e\node_modules\next\dist\server\lib\start-server.js:225:13)
      "query": "insert into \"users\" (\"id\", \"first_name\", \"last_name\", \"middle_name\", \"name_extension\", \"username\", \"gender\", \"civil_status\", \"nationality\", \"birth_date\", \"place_of_birth\", \"phone\", \"complete_address\", \"biography\", \"role\", \"is_active\", \"push_notifications_enabled\", \"security_alerts_email_enabled\", \"last_login\", \"profile_picture_id\", \"updated_at\", \"created_at\", \"enable_a_p_i_key\", \"api_key\", \"api_key_index\", \"email\", \"reset_password_token\", \"reset_password_expiration\", \"salt\", \"hash\", \"login_attempts\", \"lock_until\") values ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24, $25, $26, $27, $28, $29, $30, $31, $32) on conflict (\"id\") do update set \"id\" = $33, \"first_name\" = $34, \"last_name\" = $35, \"middle_name\" = $36, \"name_extension\" = $37, \"username\" = $38, \"gender\" = $39, \"civil_status\" = $40, \"nationality\" = $41, \"birth_date\" = $42, \"place_of_birth\" = $43, \"phone\" = $44, \"complete_address\" = $45, \"biography\" = $46, \"role\" = $47, \"is_active\" = $48, \"push_notifications_enabled\" = $49, \"security_alerts_email_enabled\" = $50, \"last_login\" = $51, \"profile_picture_id\" = $52, \"updated_at\" = $53, \"created_at\" = $54, \"enable_a_p_i_key\" = $55, \"api_key\" = $56, \"api_key_index\" = $57, \"email\" = $58, \"reset_password_token\" = $59, \"reset_password_expiration\" = $60, \"salt\" = $61, \"hash\" = $62, \"login_attempts\" = $63, \"lock_until\" = $64 returning \"id\", \"first_name\", \"last_name\", \"middle_name\", \"name_extension\", \"username\", \"gender\", \"civil_status\", \"nationality\", \"birth_date\", \"place_of_birth\", \"phone\", \"complete_address\", \"biography\", \"role\", \"is_active\", \"push_notifications_enabled\", \"security_alerts_email_enabled\", \"last_login\", \"profile_picture_id\", \"updated_at\", \"created_at\", \"enable_a_p_i_key\", \"api_key\", \"api_key_index\", \"email\", \"reset_password_token\", \"reset_password_expiration\", \"salt\", \"hash\", \"login_attempts\", \"lock_until\"",
      "params": [
        4,
        "Michael",
        "Lhayos",
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        "instructor",
        true,
        true,
        true,
        null,
        4,
        "2026-05-21T02:09:25.683Z",
        "2026-04-05T08:04:17.959Z",
        null,
        null,
        null,
        "michael@gmail.com",
        null,
        null,
        "03c73b25b723a63928c20bd5e7cd924f6e28de902259bb690776f9be61705c1c",
        "4341f999327f0defca47d71f5984bbcc6bb855380348adbbadde9311bd6726e486a774a176d5447476b76dcd7b2bbb7d8cad5986f41edf252c2e55fcbb20019e62b0d264c70f65af4c6705d102eb162b87aec68822d55b530b35caa73c3d77a476366d7fe3d3f3e4b1603688d6f88c9a46d0ca926243c153c295e216a397320011b1a4aaf414cda755b5b12f873473dcf8664c76039a183113cc777fa99ec11719f79df588b71fb479ee02a164f7674d5d79964b651f0c7dea0998c3e836a08aa71dc79387bf3d00c23f0e8560c0dd5e2651fc9015850ab0416a15dfa8a4e09fc0e674172ba47576429804464e91119f9fe138ba9dc2ce126cc28e037c90a0009d921aa2f34e5b9ed7b8dac30e5d0d6cde23ad0804477971f9ee62fb57bb76afb3a08443f347000f76e725cde21aa271d80d0a77e19e6445640b3dffd419a138037fa1e115b244e3d48d485ec6f6b2d2c6ec8721d25b826df23bf94c1b15e3a67cd0799a3008fdab20d3d09da61b031abf1f8b420d0d63617791b4977154315182a87a5a13d3e462b096b110c32e41902203474cb12d6afa0d6ec936c3d67442a96e7c66642ba4383072658289c2ce67f4254dc8cafa76a5470f316fb5e640e5cd76340dd709e652ec46936aac79f6f904d256e8f8fd580896f4b6702f9b336cd7cf9bdacc07758dc44386fe755318374c6894ee975b8b784447a3be097b3a32",
        "0",
        null,
        4,
        "Michael",
        "Lhayos",
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        "instructor",
        true,
        true,
        true,
        null,
        4,
        "2026-05-21T02:09:25.683Z",
        "2026-04-05T08:04:17.959Z",
        null,
        null,
        null,
        "michael@gmail.com",
        null,
        null,
        "03c73b25b723a63928c20bd5e7cd924f6e28de902259bb690776f9be61705c1c",
        "4341f999327f0defca47d71f5984bbcc6bb855380348adbbadde9311bd6726e486a774a176d5447476b76dcd7b2bbb7d8cad5986f41edf252c2e55fcbb20019e62b0d264c70f65af4c6705d102eb162b87aec68822d55b530b35caa73c3d77a476366d7fe3d3f3e4b1603688d6f88c9a46d0ca926243c153c295e216a397320011b1a4aaf414cda755b5b12f873473dcf8664c76039a183113cc777fa99ec11719f79df588b71fb479ee02a164f7674d5d79964b651f0c7dea0998c3e836a08aa71dc79387bf3d00c23f0e8560c0dd5e2651fc9015850ab0416a15dfa8a4e09fc0e674172ba47576429804464e91119f9fe138ba9dc2ce126cc28e037c90a0009d921aa2f34e5b9ed7b8dac30e5d0d6cde23ad0804477971f9ee62fb57bb76afb3a08443f347000f76e725cde21aa271d80d0a77e19e6445640b3dffd419a138037fa1e115b244e3d48d485ec6f6b2d2c6ec8721d25b826df23bf94c1b15e3a67cd0799a3008fdab20d3d09da61b031abf1f8b420d0d63617791b4977154315182a87a5a13d3e462b096b110c32e41902203474cb12d6afa0d6ec936c3d67442a96e7c66642ba4383072658289c2ce67f4254dc8cafa76a5470f316fb5e640e5cd76340dd709e652ec46936aac79f6f904d256e8f8fd580896f4b6702f9b336cd7cf9bdacc07758dc44386fe755318374c6894ee975b8b784447a3be097b3a32",
        "0",
        null
      ]
    }
 PATCH /api/users/4?depth=0&fallback-locale=null 500 in 2.0min (next.js: 13ms, proxy.ts: 5ms, application-code: 2.0min)
