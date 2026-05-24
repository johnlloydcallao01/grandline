Skip to main content

Ask Seer
Ctrl
/

Configure Next.js SDK

Back to Platform Selection
Full Documentation
Automatic Configuration (Recommended)
Configure your app automatically by running the Sentry wizard in the root of your project.

npx @sentry/wizard@latest -i nextjs --saas --org calsiter --project grandline-apps-web
Manual Configuration


Copy DSN
AI-Assisted Setup (Optional)


Copy Prompt
Verify
Start your development server and visit /sentry-example-page if you have set it up. Click the button to trigger a test error.
Or, trigger a sample error by calling a function that does not exist somewhere in your application.
JavaScript

myUndefinedFunction();
If you see an issue in your Sentry Issues, you have successfully set up Sentry with Next.js.

Take me to Issues








To send data to Sentry you will need to configure an SDK with a client key (usually referred to as the SENTRY_DSN value). For more information on integrating Sentry with your application take a look at our documentation.

Generate New Key
Default
Configure

Disable

DSN
The DSN tells the SDK where to send the events to. Show deprecated DSN
https://a64d9d0a2410e36276fd23e200011718@o4511442732449792.ingest.us.sentry.io/4511444208844800

OpenTelemetry (OTLP)
Vercel Drains
OTLP Endpoint
The base OTLP endpoint for your project.
https://o4511442732449792.ingest.us.sentry.io/api/4511444208844800/integration/otlp

OTLP Logs Endpoint






Settings
Organization Tokens
Search

Ask Seer
Ctrl
/

Organization tokens can be used in many places to interact with Sentry programmatically. For example, they can be used for sentry-cli, bundler plugins or similar uses cases.
For more information on how to use the web API, see our documentation.
Create New Token
Token
Created
Last access
calsiter
sntrys_************l3Bc
a few seconds ago
never used

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








organization slug
calsiter



project slug
grandline-apps-web











Officially, for a Next.js setup, Sentry uses:

dsn: "___PUBLIC_DSN___" in SDK init: Next.js docs
org: "___ORG_SLUG___", project: "___PROJECT_SLUG___", and authToken: process.env.SENTRY_AUTH_TOKEN in withSentryConfig(...): Next.js docs
NEXT_PUBLIC_SENTRY_DSN

Get it from your project’s Client Keys (DSN) settings, or from the installation/configuration snippet shown during project setup.
Official source: Sentry says, “You can also find the DSN in your project's Client Keys (DSN) settings.” See Data Source Name (DSN).
SENTRY_AUTH_TOKEN

Best official source for CI/build use: Settings > Developer Settings > Organization Tokens.
Official source: “Organization tokens can be created in sentry.io on the Auth Tokens page under Settings > Developer Settings > Organization Tokens.” See Auth Tokens.
Sentry CLI docs also say you can manually create an Organization Token and pass it via SENTRY_AUTH_TOKEN: CLI Configuration and Authentication.
If you use a personal token instead, Sentry’s API docs say those are under User settings > Personal Tokens: API Authentication.
SENTRY_ORG

This is your organization slug.
Official source: Sentry says you can find it in General Settings, or in the URL https://sentry.io/organizations/{org-slug}/. See Sentry Exporter docs.
SENTRY_PROJECT

This is your project slug.
Official source: Sentry says project slugs “can be found in various places from the Sentry UI, such as in the URL after selecting a project.” See MSBuild Setup.
Sentry also defines slug as the value that “uniquely identifies a project and is used for the interface.” See Create a New Project.
If you want the exact official env set for your case, it is:

env




NEXT_PUBLIC_SENTRY_DSN=...SENTRY_ORG=...SENTRY_PROJECT=...SENTRY_AUTH_TOKEN=..