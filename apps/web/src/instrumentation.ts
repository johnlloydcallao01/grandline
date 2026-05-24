import * as Sentry from "@sentry/nextjs";

export async function register() {
  // #region debug-point A:register-entry
  fetch("http://127.0.0.1:7777/event",{method:"POST",body:JSON.stringify({sessionId:"web-turbopack-panic",runId:"pre-fix",hypothesisId:"A",location:"src/instrumentation.ts:4",msg:"[DEBUG] register() entered",data:{runtime:process.env.NEXT_RUNTIME ?? "unknown"},ts:Date.now()})}).catch(()=>{});
  // #endregion
  if (process.env.NEXT_RUNTIME === "nodejs") {
    await import("./sentry.server.config");
  }

  if (process.env.NEXT_RUNTIME === "edge") {
    await import("./sentry.edge.config");
  }
}

export const onRequestError = (...args: Parameters<typeof Sentry.captureRequestError>) => {
  // #region debug-point B:on-request-error
  fetch("http://127.0.0.1:7777/event",{method:"POST",body:JSON.stringify({sessionId:"web-turbopack-panic",runId:"pre-fix",hypothesisId:"B",location:"src/instrumentation.ts:15",msg:"[DEBUG] onRequestError invoked",data:{message:args[0] instanceof Error ? args[0].message : String(args[0]),routeType:args[2]?.routeType,runtime:process.env.NEXT_RUNTIME ?? "unknown"},ts:Date.now()})}).catch(()=>{});
  // #endregion
  return Sentry.captureRequestError(...args);
};
