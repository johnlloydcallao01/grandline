Goal
The marketing team needs:
full visibility of the checkout funnel (analytics + ads),
reliable attribution (UTMs / referral IDs),
flexible pricing & discount mechanics,
dependable data export/backup,
clear split of responsibilities (what Bookinglayer/dev team implements vs what we provide).
1) Analytics Tracking (GA4 — Ecommerce)
Requirement: Track each key checkout step in GA4 using ecommerce event format with full item details.
Must include events (minimum):
add_to_cart
begin_checkout
purchase
Each event must include (where applicable):
currency (ISO code, e.g. USD/EUR)
value (total order value)
items[] array with product-level parameters, at minimum:


item_id (SKU / internal product ID)
item_name
price
quantity
optional: item_category, item_variant, discount, etc.


Questions for devs:
What tracking hooks are available in Bookinglayer (frontend events, webhooks, server-side events)?

Answers (dev):
- Bookinglayer exposes several hooks:
  - Frontend: the Booking Engine fires GA4 / Google Ads events and pushes ecommerce data into the Google dataLayer whenever you configure GA4 in Sales > Booking Engine > Tracking (see “How to connect the Booking Engine with Google Analytics (GA4 version)” and “Google Analytics: FAQ” in the Help Center).
  - Built‑in pixels: Meta/Facebook Pixel and Google Ads are supported natively via the Tracking screen; Bookinglayer sends standard PageView / ViewContent / AddToCart / InitiateCheckout / Purchase events client‑side.
  - Server‑side: webhooks (Bookings, Payments, Guests, Invoices) plus the REST API (bookings, payments, persons) at docs.bookinglayer.com/api; these can be used by your backend to send server‑side events to GA4/Meta/Google Ads if required.

Can you implement GA4 events natively or do we need GTM custom implementation?

Answer (dev):
- For standard GA4 ecommerce tracking, native implementation is enough: add your GA4 Measurement ID in Sales > Booking Engine > Tracking and Bookinglayer will fire view/add_to_cart/begin_checkout/purchase events with value and currency; “Fire Purchase event on Checkout” can be enabled if you want Purchase when the booking is created instead of on payment.
- If you need custom event names, additional parameters, or a more complex funnel, use Google Tag Manager: Bookinglayer already pushes structured data into the dataLayer (BookingDate, BookingReference, BookingTotal, BookingCurrency, etc.), so GTM can build custom GA4 events on top of those.


2) Conversion Tracking (Meta + Google Ads)
Requirement: Send checkout events to Meta and Google Ads.
Minimum events:
InitiateCheckout
Purchase (must include value + currency)
Optional but preferred: AddToCart / intermediate steps if supported


Data requirements:
Purchase event must pass:


total amount, currency
order ID / transaction ID
product identifiers (if available)


Preferably support server-side options (Meta CAPI / Google Enhanced Conversions) if possible.


Questions for devs:
Can Bookinglayer send these events server-side (recommended) or only client-side?

Answers (dev):
- Out‑of‑the‑box, Bookinglayer sends Meta and Google Ads conversion events client‑side using the Tracking configuration (Pixel ID, Google Ads Conversion ID/Label).
- Server‑side sending (Meta CAPI / Google Enhanced Conversions) is not provided as a one‑click feature, but is achievable using:
  - Webhooks for Payments/Bookings to notify your backend of a completed booking/payment.
  - REST API to fetch the full booking/payment payload (amount, currency, products, customer data).
  - Your backend then calls Meta CAPI / Google EC server‑side with that data.

Can we pass user identifiers for improved match quality (email/phone hash) respecting consent?

Answer (dev):
- Yes, email and phone are part of booking/person data and are available through webhooks/API.
- For server‑side events, your backend should:
  - Hash email/phone with SHA‑256 before sending to Meta/Google.
  - Respect consent by only sending identifiers when the CMP (e.g. Cookiebot with Consent Mode v2) indicates granted consent; Bookinglayer’s GA4/Ads integration already works with Consent Mode when you add the recommended scripts via Code Injection.


3) Attribution & UTM Handling
Requirement: Preserve and store UTM parameters (utm_source, utm_medium, utm_campaign, utm_content, utm_term) throughout the full checkout and payment process.
Must-have:
UTM values are captured on first landing and persisted until purchase (or at least until booking is created).


UTM values must be available to:


HubSpot (preferred),


or another export method (Sheets/webhook) as backup.


Questions for devs:
Does Bookinglayer support reading UTM params and storing them in booking/customer fields?

Answers (dev):
- Bookinglayer Booking Engine reads URL parameters (including utm_*) for analytics/tracking when GA4/Ads are configured.
- For CRM/attribution:
  - Create custom fields on booking/person (e.g. UTM Source, UTM Medium, etc.).
  - Use your middleware, Zapier, or the HubSpot integration to map these Bookinglayer fields to HubSpot properties.
  - UTMs can be captured client‑side (via a small script on your site or Booking Engine Code Injection) and written into those custom fields before or at checkout.

If checkout occurs on a different domain/subdomain, how do you recommend passing UTMs (URL forwarding, cookies, hidden fields, etc.)?

Answer (dev):
- Preferred: host the Booking Engine on a subdomain of your main site (bookings.yourdomain.com via CNAME as per “Customise your Booking Engine URL”) and configure GA4 cross‑domain tracking so Google handles attribution.
- Always append the full UTM string when linking from your marketing site to the Booking Engine.
- Optionally:
  - Store UTMs in a first‑party cookie on the main site.
  - On the first Booking Engine page, use Code Injection to read that cookie and copy values into custom booking fields or hidden inputs to persist them through to the booking record.


4) Hidden Fields in Checkout Form
Requirement: Ability to include hidden fields in checkout to support marketing workflows.
Examples of hidden fields we need:
utm_* values (if not handled automatically)
referral_id / affiliate_id (Everflow)
internal marketing parameters (campaign identifiers, ad IDs, etc.)


Questions for devs:
Can hidden fields be configured in Bookinglayer UI, or only via custom code?

Answers (dev):
- Booker and Guest forms are configurable in the Backoffice (Sales > Booking Engine > Booker form / Guest form) and allow adding extra fields; these can be used for marketing parameters, though they are normally visible to the user.
- Fully invisible “technical” fields are usually implemented via Code Injection:
  - Inject JavaScript that writes values (UTMs, referral_id, internal campaign IDs) into additional form fields or sends them via API when the booking is created.
  - Partner referral codes are natively supported via ?ref= parameter and stored as Partner on the booking (see “How to add, create and track partner bookings and referrals”).

Can hidden fields be saved in the booking record and included in webhooks / HubSpot sync?

Answer (dev):
- Yes, if you back them with booking/person custom fields:
  - Your injected script populates those custom fields at checkout.
  - Webhooks then include the booking/person IDs; your backend can fetch full objects (including custom fields) via API.
  - The HubSpot integration or Zapier/Make flows can map those custom fields into HubSpot custom properties, so all hidden parameters are available on the Contact/Deal.


5) Date-Based Pricing Logic (Early Bird vs Regular)
Requirement: Dynamic pricing based on selected training dates:
Early Bird price if training starts in 30+ days


Regular price if training starts in <30 days


Questions for devs:
Can Bookinglayer support rules like “price depends on start date difference”?

Answers (dev):
- Yes, via Discounts:
  - The discount Conditions section supports “Days till check‑in (early bird cases)” which is specifically meant for early‑bird logic (see “Discounts & Coupons explained”).
  - You can define a discount that applies when Days till check‑in ≥ 30 (Early Bird) and leave the normal rate as Regular price when that condition is not met.

If not native: can we implement pricing via product variants or pricing rules?

Answer (dev):
- Product Variants can also model Early Bird vs Regular as separate variants (different prices), but that makes the UI show multiple prices rather than automatically switching based on date.
- Recommendation:
  - Use native discount conditions with Days till check‑in for Early Bird vs Regular logic.
  - Reserve variants for genuinely different configurations (room type, duration, etc.) rather than pure timing discounts.


6) Promo Pricing (e.g., Black Friday)
Requirement: Ability to apply promotional pricing, e.g. 20% off specific products for a defined time window.
Questions for devs:
How are temporary promotions managed (time-based discounts, price overrides, sale price)?

Answers (dev):
- Time‑limited promotions are handled via Discounts:
  - Set “Booking made between” and/or “Check‑in between” date ranges in Conditions.
  - Choose percentage or fixed amount off.
  - Optionally mark as Final discount and set a high Priority so it wins over other discounts.
- Alternatively, you can temporarily change the base price of the product/tariff in inventory for the promo window, but discounts are usually easier to manage and track.

Can promos be applied to specific products/tariffs only?

Answer (dev):
- Yes, discount Conditions allow you to:
  - Target specific products or categories.
  - Combine with other filters (dates, value thresholds, partner, etc.).
- This lets you run Black Friday promos only on selected trainings/tariffs while leaving others unaffected.


7) Promo Codes & Stacking Rules
Requirement: Support promo codes with:
% discount (e.g., 5%)
fixed amount discount (e.g., $100)


Stacking rules required:
Ability to control whether promo codes stack with promotions (e.g., promo code must not stack with Black Friday discount).
Ability to restrict promo codes by product, date, or minimum order value (if available).


Questions for devs:
What discount types are supported natively?

Answers (dev):
- Natively supported:
  - Percentage discounts.
  - Fixed amount discounts.
- Both can be configured as:
  - Automatic Discounts (applied when conditions match).
  - Coupons (same logic, but require entering a code at checkout).

Can we define “non-stackable” behavior?

Answer (dev):
- Yes, stacking is controlled by:
  - Final discount flag: when set, no further discounts are applied after that one.
  - Priority: determines which discounts are evaluated/applied first.
- To ensure a promo (e.g. Black Friday) does not stack with other codes:
  - Give it highest Priority.
  - Mark it as Final discount so other discounts/coupons are not added on top.


8) Order & Payment Export / Backup (Non-HubSpot)
Requirement: In addition to HubSpot, we need a secondary export of all bookings/payments to a backup destination:
Google Sheets, or
webhook endpoint, or
another database/automation platform.


Minimum fields:
booking/order ID
timestamp
product/tariff name + ID
amount + currency
payment status
customer data (name/email/phone, as allowed)
UTMs + hidden fields


Question for devs:
Which option would you recommend as a backup system, and how can we set it up?

Answer (dev):
- Recommended architecture:
  - Primary: webhook → your backend → database (Postgres/BigQuery/etc.).
    - Configure Bookinglayer webhooks for Bookings and Payments.
    - Backend verifies signatures, fetches full booking/payment via API, and stores:
      - booking/order ID, timestamp, products/tariffs, amount+currency, payment status, customer data, UTMs, hidden fields.
  - Secondary: Google Sheets fed from that DB or from a scheduled API pull (e.g. Apps Script connector).
- Lightweight alternative:
  - Use Zapier with Bookinglayer integration or generic webhooks:
    - Trigger on new booking/payment.
    - Action: append a row to a Google Sheet with the required fields.
  - This is simpler to set up but less robust than a dedicated DB.


9) HubSpot Integration Logic
Requirement: Clear behavior for both scenarios:
New contact creates a booking (paid or unpaid)
Existing contact creates a booking (paid or unpaid)


We need clarity on:
When a contact is created/updated
How bookings are represented in HubSpot (Contact? Deal? Custom object? Line items?)
What fields are synced (UTMs, product details, payment status, etc.)
How duplicates are prevented (email match, phone match, etc.)


Questions for devs:
Please describe the current mapping and object model used in HubSpot.

Answers (dev):
- Conceptual model (how we recommend wiring it):
  - HubSpot Contact ↔ Bookinglayer Person/Booker (matched by email).
  - HubSpot Deal (or custom “Booking” object) ↔ Bookinglayer Booking.
  - HubSpot Line Items (optional) ↔ Bookinglayer product/tariff lines.
- Behaviour:
  - New contact + booking:
    - If email doesn’t exist in HubSpot, create a Contact and a Deal from the booking data.
  - Existing contact + booking:
    - Find Contact by email, attach a new Deal for the booking, and update selected fields (e.g. last booking date) without overwriting important first‑touch attribution fields.
- Synced fields:
  - Contact:
    - Name, email, phone, country, etc.
    - UTM fields (utm_source, utm_medium, utm_campaign, utm_content, utm_term).
    - Referral/partner code and other marketing flags if desired.
  - Deal / booking object:
    - Booking ID / reference.
    - Booking and payment status.
    - Amount, currency.
    - Start/end dates.
    - Product/tariff summary and, if used, associated line items.
- Duplicate prevention:
  - Email is the primary key for contacts; integration logic always looks up by email before creating new contacts.
  - Phone can be used as an extra signal, but email should remain the main dedupe key.

Can we customize mapping and add our custom fields?

Answer (dev):
- Yes:
  - In the Bookinglayer–HubSpot integration you can map fields; for any marketing‑specific data (UTMs, promo codes, Everflow transaction_id, etc.), create corresponding custom properties in HubSpot.
  - If you build your own integration with webhooks/Zapier/Make, you have full control over field mapping: you decide which Bookinglayer fields (standard and custom) go into which HubSpot properties.


10) Everflow Postback After Payment
Requirement: On successful payment, we must send a postback to Everflow including:
transaction_id (a separate Everflow cookie assigned when clicking on a referral link)
order value + currency


Questions for devs:
Can Bookinglayer trigger a server-side webhook on “payment success” where we can implement postback logic?

Answers (dev):
- Yes:
  - Bookinglayer supports webhooks for Payments (and Bookings). When a payment is recorded as successful, it can trigger a webhook to your server.
  - The webhook contains the payment/booking ID; your backend then calls the Bookinglayer API to fetch:
    - order value + currency.
    - booking reference / ID.
    - any stored Everflow transaction_id (captured earlier as a custom field).
  - With that, your backend makes a server‑side HTTP request to Everflow’s postback URL.

If Bookinglayer cannot do it: what workaround do you suggest (Zapier/Make/webhook relay)?

Answer (dev):
- If direct Payment webhooks are not available in your plan:
  - Use Bookinglayer’s Zapier integration:
    - Trigger: new payment or booking event.
    - Action: custom webhook / serverless function that fetches full data via API and calls Everflow.
- Or:
  - Use a generic webhook relay/proxy:
    - Configure Bookinglayer to send webhooks to the relay.
    - Relay enriches the event with booking details (via API) and forwards a normalized payload to Everflow or to your analytics pipeline.


Responsibilities & Needed Inputs
What we expect from the developers / Bookinglayer
Confirm which of the above is supported natively vs requires custom code.
Provide recommended implementation approach (client-side vs server-side).
Provide documentation links and webhook/event schemas.
Implement required tracking or provide clear integration points for GTM / scripts.
What we can provide from the marketing team
GA4 Measurement ID, GTM container details (if used), event naming conventions
Meta Pixel + CAPI parameters (if supported), Google Ads conversion IDs/labels
HubSpot field list & desired mapping
Everflow postback URL template and required parameters
List of products/tariffs + pricing rules + promo requirements


Please add information directly to this file in the form of comments or separate tabs so that all our discussion is in one place.

You can also email me at belkin97@gmail.com or WhatsApp +48780723474 to discuss the details.

