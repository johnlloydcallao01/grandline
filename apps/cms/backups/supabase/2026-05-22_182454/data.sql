--
-- PostgreSQL database dump
--

\restrict VUlDMptdaat1JXHbSguM7v6scoOjv9PFNVGdIowP93Ggeh64vw5Row3VKeJurcf

-- Dumped from database version 17.4
-- Dumped by pg_dump version 17.10

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Data for Name: audit_log_entries; Type: TABLE DATA; Schema: auth; Owner: -
--

COPY "auth"."audit_log_entries" ("instance_id", "id", "payload", "created_at", "ip_address") FROM stdin;
00000000-0000-0000-0000-000000000000	b23f7161-759d-42f4-877a-c9818b5e34dd	{"action":"user_signedup","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"provider":"email","user_email":"admin@grandline.com","user_id":"db7f3565-5347-4f51-bf1b-6f689c5a9f12","user_phone":""}}	2025-08-30 18:23:18.980618+00	
00000000-0000-0000-0000-000000000000	ba3b9346-d6b9-42ad-8e3f-bb9c804907bd	{"action":"login","actor_id":"db7f3565-5347-4f51-bf1b-6f689c5a9f12","actor_username":"admin@grandline.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-08-30 18:29:53.065284+00	
00000000-0000-0000-0000-000000000000	5a5a920c-1c3e-4665-be67-5f53ac532222	{"action":"logout","actor_id":"db7f3565-5347-4f51-bf1b-6f689c5a9f12","actor_username":"admin@grandline.com","actor_via_sso":false,"log_type":"account"}	2025-08-30 18:29:54.298901+00	
00000000-0000-0000-0000-000000000000	42fde591-cba5-4dfd-89ba-d3bdcf2bf7d7	{"action":"user_signedup","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"provider":"email","user_email":"johnlloydcallao@gmail.com","user_id":"d40a7698-26b0-4bac-9495-a5a63ab2279f","user_phone":""}}	2025-08-30 18:31:31.651534+00	
00000000-0000-0000-0000-000000000000	9f4e231e-7e8e-4776-b2e6-13afca58edc5	{"action":"login","actor_id":"db7f3565-5347-4f51-bf1b-6f689c5a9f12","actor_username":"admin@grandline.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-08-30 18:43:03.693318+00	
00000000-0000-0000-0000-000000000000	fcc4d5e7-14db-494d-a4b4-e0df06679890	{"action":"logout","actor_id":"db7f3565-5347-4f51-bf1b-6f689c5a9f12","actor_username":"admin@grandline.com","actor_via_sso":false,"log_type":"account"}	2025-08-30 18:43:04.741037+00	
00000000-0000-0000-0000-000000000000	60940a55-6794-4384-83fa-f97eb4b353a0	{"action":"login","actor_id":"db7f3565-5347-4f51-bf1b-6f689c5a9f12","actor_username":"admin@grandline.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-08-30 18:53:01.208634+00	
00000000-0000-0000-0000-000000000000	182cdcef-5bb7-4a46-b106-efccc52fe734	{"action":"logout","actor_id":"db7f3565-5347-4f51-bf1b-6f689c5a9f12","actor_username":"admin@grandline.com","actor_via_sso":false,"log_type":"account"}	2025-08-30 18:53:02.021035+00	
00000000-0000-0000-0000-000000000000	1086c8b4-be4d-4466-b1ee-ba9df68cbfbe	{"action":"login","actor_id":"db7f3565-5347-4f51-bf1b-6f689c5a9f12","actor_username":"admin@grandline.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-08-30 18:59:05.43863+00	
00000000-0000-0000-0000-000000000000	bf9e7f1a-0146-4ada-b438-6199daa53620	{"action":"logout","actor_id":"db7f3565-5347-4f51-bf1b-6f689c5a9f12","actor_username":"admin@grandline.com","actor_via_sso":false,"log_type":"account"}	2025-08-30 18:59:06.078368+00	
00000000-0000-0000-0000-000000000000	2ee9d56d-93ca-4f41-ab8f-3d1d8ea0a859	{"action":"user_deleted","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"user_email":"admin@grandline.com","user_id":"db7f3565-5347-4f51-bf1b-6f689c5a9f12","user_phone":""}}	2025-08-31 04:56:34.023932+00	
00000000-0000-0000-0000-000000000000	cb560b84-1925-451b-83cd-77950e88a79f	{"action":"user_deleted","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"user_email":"johnlloydcallao@gmail.com","user_id":"d40a7698-26b0-4bac-9495-a5a63ab2279f","user_phone":""}}	2025-08-31 04:56:34.023374+00	
\.


--
-- Data for Name: custom_oauth_providers; Type: TABLE DATA; Schema: auth; Owner: -
--

COPY "auth"."custom_oauth_providers" ("id", "provider_type", "identifier", "name", "client_id", "client_secret", "acceptable_client_ids", "scopes", "pkce_enabled", "attribute_mapping", "authorization_params", "enabled", "email_optional", "issuer", "discovery_url", "skip_nonce_check", "cached_discovery", "discovery_cached_at", "authorization_url", "token_url", "userinfo_url", "jwks_uri", "created_at", "updated_at") FROM stdin;
\.


--
-- Data for Name: flow_state; Type: TABLE DATA; Schema: auth; Owner: -
--

COPY "auth"."flow_state" ("id", "user_id", "auth_code", "code_challenge_method", "code_challenge", "provider_type", "provider_access_token", "provider_refresh_token", "created_at", "updated_at", "authentication_method", "auth_code_issued_at", "invite_token", "referrer", "oauth_client_state_id", "linking_target_id", "email_optional") FROM stdin;
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: auth; Owner: -
--

COPY "auth"."users" ("instance_id", "id", "aud", "role", "email", "encrypted_password", "email_confirmed_at", "invited_at", "confirmation_token", "confirmation_sent_at", "recovery_token", "recovery_sent_at", "email_change_token_new", "email_change", "email_change_sent_at", "last_sign_in_at", "raw_app_meta_data", "raw_user_meta_data", "is_super_admin", "created_at", "updated_at", "phone", "phone_confirmed_at", "phone_change", "phone_change_token", "phone_change_sent_at", "email_change_token_current", "email_change_confirm_status", "banned_until", "reauthentication_token", "reauthentication_sent_at", "is_sso_user", "deleted_at", "is_anonymous") FROM stdin;
\.


--
-- Data for Name: identities; Type: TABLE DATA; Schema: auth; Owner: -
--

COPY "auth"."identities" ("provider_id", "user_id", "identity_data", "provider", "last_sign_in_at", "created_at", "updated_at", "id") FROM stdin;
\.


--
-- Data for Name: instances; Type: TABLE DATA; Schema: auth; Owner: -
--

COPY "auth"."instances" ("id", "uuid", "raw_base_config", "created_at", "updated_at") FROM stdin;
\.


--
-- Data for Name: oauth_clients; Type: TABLE DATA; Schema: auth; Owner: -
--

COPY "auth"."oauth_clients" ("id", "client_secret_hash", "registration_type", "redirect_uris", "grant_types", "client_name", "client_uri", "logo_uri", "created_at", "updated_at", "deleted_at", "client_type", "token_endpoint_auth_method") FROM stdin;
\.


--
-- Data for Name: sessions; Type: TABLE DATA; Schema: auth; Owner: -
--

COPY "auth"."sessions" ("id", "user_id", "created_at", "updated_at", "factor_id", "aal", "not_after", "refreshed_at", "user_agent", "ip", "tag", "oauth_client_id", "refresh_token_hmac_key", "refresh_token_counter", "scopes") FROM stdin;
\.


--
-- Data for Name: mfa_amr_claims; Type: TABLE DATA; Schema: auth; Owner: -
--

COPY "auth"."mfa_amr_claims" ("session_id", "created_at", "updated_at", "authentication_method", "id") FROM stdin;
\.


--
-- Data for Name: mfa_factors; Type: TABLE DATA; Schema: auth; Owner: -
--

COPY "auth"."mfa_factors" ("id", "user_id", "friendly_name", "factor_type", "status", "created_at", "updated_at", "secret", "phone", "last_challenged_at", "web_authn_credential", "web_authn_aaguid", "last_webauthn_challenge_data") FROM stdin;
\.


--
-- Data for Name: mfa_challenges; Type: TABLE DATA; Schema: auth; Owner: -
--

COPY "auth"."mfa_challenges" ("id", "factor_id", "created_at", "verified_at", "ip_address", "otp_code", "web_authn_session_data") FROM stdin;
\.


--
-- Data for Name: oauth_authorizations; Type: TABLE DATA; Schema: auth; Owner: -
--

COPY "auth"."oauth_authorizations" ("id", "authorization_id", "client_id", "user_id", "redirect_uri", "scope", "state", "resource", "code_challenge", "code_challenge_method", "response_type", "status", "authorization_code", "created_at", "expires_at", "approved_at", "nonce") FROM stdin;
\.


--
-- Data for Name: oauth_client_states; Type: TABLE DATA; Schema: auth; Owner: -
--

COPY "auth"."oauth_client_states" ("id", "provider_type", "code_verifier", "created_at") FROM stdin;
\.


--
-- Data for Name: oauth_consents; Type: TABLE DATA; Schema: auth; Owner: -
--

COPY "auth"."oauth_consents" ("id", "user_id", "client_id", "scopes", "granted_at", "revoked_at") FROM stdin;
\.


--
-- Data for Name: one_time_tokens; Type: TABLE DATA; Schema: auth; Owner: -
--

COPY "auth"."one_time_tokens" ("id", "user_id", "token_type", "token_hash", "relates_to", "created_at", "updated_at") FROM stdin;
\.


--
-- Data for Name: refresh_tokens; Type: TABLE DATA; Schema: auth; Owner: -
--

COPY "auth"."refresh_tokens" ("instance_id", "id", "token", "user_id", "revoked", "created_at", "updated_at", "parent", "session_id") FROM stdin;
\.


--
-- Data for Name: sso_providers; Type: TABLE DATA; Schema: auth; Owner: -
--

COPY "auth"."sso_providers" ("id", "resource_id", "created_at", "updated_at", "disabled") FROM stdin;
\.


--
-- Data for Name: saml_providers; Type: TABLE DATA; Schema: auth; Owner: -
--

COPY "auth"."saml_providers" ("id", "sso_provider_id", "entity_id", "metadata_xml", "metadata_url", "attribute_mapping", "created_at", "updated_at", "name_id_format") FROM stdin;
\.


--
-- Data for Name: saml_relay_states; Type: TABLE DATA; Schema: auth; Owner: -
--

COPY "auth"."saml_relay_states" ("id", "sso_provider_id", "request_id", "for_email", "redirect_to", "created_at", "updated_at", "flow_state_id") FROM stdin;
\.


--
-- Data for Name: schema_migrations; Type: TABLE DATA; Schema: auth; Owner: -
--

COPY "auth"."schema_migrations" ("version") FROM stdin;
20171026211738
20171026211808
20171026211834
20180103212743
20180108183307
20180119214651
20180125194653
00
20210710035447
20210722035447
20210730183235
20210909172000
20210927181326
20211122151130
20211124214934
20211202183645
20220114185221
20220114185340
20220224000811
20220323170000
20220429102000
20220531120530
20220614074223
20220811173540
20221003041349
20221003041400
20221011041400
20221020193600
20221021073300
20221021082433
20221027105023
20221114143122
20221114143410
20221125140132
20221208132122
20221215195500
20221215195800
20221215195900
20230116124310
20230116124412
20230131181311
20230322519590
20230402418590
20230411005111
20230508135423
20230523124323
20230818113222
20230914180801
20231027141322
20231114161723
20231117164230
20240115144230
20240214120130
20240306115329
20240314092811
20240427152123
20240612123726
20240729123726
20240802193726
20240806073726
20241009103726
20250717082212
20250731150234
20250804100000
20250901200500
20250903112500
20250904133000
20250925093508
20251007112900
20251104100000
20251111201300
20251201000000
20260115000000
20260121000000
20260219120000
20260302000000
\.


--
-- Data for Name: sso_domains; Type: TABLE DATA; Schema: auth; Owner: -
--

COPY "auth"."sso_domains" ("id", "sso_provider_id", "domain", "created_at", "updated_at") FROM stdin;
\.


--
-- Data for Name: webauthn_challenges; Type: TABLE DATA; Schema: auth; Owner: -
--

COPY "auth"."webauthn_challenges" ("id", "user_id", "challenge_type", "session_data", "created_at", "expires_at") FROM stdin;
\.


--
-- Data for Name: webauthn_credentials; Type: TABLE DATA; Schema: auth; Owner: -
--

COPY "auth"."webauthn_credentials" ("id", "user_id", "credential_id", "public_key", "attestation_type", "aaguid", "sign_count", "transports", "backup_eligible", "backed_up", "friendly_name", "created_at", "updated_at", "last_used_at") FROM stdin;
\.


--
-- Data for Name: media; Type: TABLE DATA; Schema: public; Owner: -
--

COPY "public"."media" ("id", "alt", "updated_at", "created_at", "url", "thumbnail_u_r_l", "filename", "mime_type", "filesize", "width", "height", "focal_x", "focal_y", "cloudinary_public_id", "cloudinary_u_r_l") FROM stdin;
4	\N	2026-04-05 08:02:53.018+00	2026-04-05 08:02:46.67+00	/api/media/file/main-uploads%2Fstcw-basic.png	\N	main-uploads/stcw-basic.png	image/png	6251009	2048	2048	50	50	main-uploads/stcw-basic.png	https://res.cloudinary.com/dpdkfg8qu/image/upload/v1775376173/main-uploads/stcw-basic.png.png
5	\N	2026-04-05 08:14:31.704+00	2026-04-05 08:14:28.673+00	/api/media/file/main-uploads%2Fpersonal-survival-techniques-stcw-pst-01.jpg	\N	main-uploads/personal-survival-techniques-stcw-pst-01.jpg	image/jpeg	118868	1024	572	50	50	main-uploads/personal-survival-techniques-stcw-pst-01.jpg	https://res.cloudinary.com/dpdkfg8qu/image/upload/v1775376872/main-uploads/personal-survival-techniques-stcw-pst-01.jpg.jpg
6	\N	2026-04-05 12:42:00.038+00	2026-04-05 12:41:56.514+00	/api/media/file/main-uploads%2F616841868_2966161506926924_1420997701307583773_n.jpg	\N	main-uploads/616841868_2966161506926924_1420997701307583773_n.jpg	image/jpeg	572853	1290	2048	50	50	main-uploads/616841868_2966161506926924_1420997701307583773_n.jpg	https://res.cloudinary.com/dpdkfg8qu/image/upload/v1775392919/main-uploads/616841868_2966161506926924_1420997701307583773_n.jpg.jpg
12	\N	2026-04-06 01:08:20.891+00	2026-04-06 01:08:15.203+00	https://res.cloudinary.com/dpdkfg8qu/image/upload/f_auto,q_auto/v1/main-uploads/Gemini_Generated_Image_9kj3gu9kj3gu9kj3%20(1).png?_a=BAMAAARk0	\N	main-uploads/Gemini_Generated_Image_9kj3gu9kj3gu9kj3 (1).png	image/png	6039906	2048	2048	50	50	main-uploads/Gemini_Generated_Image_9kj3gu9kj3gu9kj3 (1).png	https://res.cloudinary.com/dpdkfg8qu/image/upload/v1775437700/main-uploads/Gemini_Generated_Image_9kj3gu9kj3gu9kj3%20%281%29.png.png
19	\N	2026-04-06 08:15:40.098+00	2026-04-06 08:15:40.097+00	/api/media/file/main-uploads%2Fstcw-basic	\N	main-uploads/stcw-basic	image/png	74921	200	200	50	50	main-uploads/stcw-basic	https://res.cloudinary.com/dpdkfg8qu/image/upload/v1775461747/main-uploads/stcw-basic.png
24	\N	2026-04-06 08:49:33.68+00	2026-04-06 08:49:33.679+00	/api/media/file/main-uploads%2Fstcw-basic_1775465371692	\N	main-uploads/stcw-basic_1775465371692	image/png	74921	200	200	50	50	main-uploads/stcw-basic_1775465371692	https://res.cloudinary.com/dpdkfg8qu/image/upload/v1775465373/main-uploads/stcw-basic_1775465371692.png
25	\N	2026-04-06 13:09:51.447+00	2026-04-06 13:09:51.447+00	/api/media/file/main-uploads%2Fstcw-basic_1775480989125	\N	main-uploads/stcw-basic_1775480989125	image/png	74921	200	200	50	50	main-uploads/stcw-basic_1775480989125	https://res.cloudinary.com/dpdkfg8qu/image/upload/v1775480991/main-uploads/stcw-basic_1775480989125.png
26	\N	2026-04-07 09:05:31.926+00	2026-04-07 09:05:31.925+00	/api/media/file/main-uploads%2FFire%20Prevention%20and%20Fire%20Fighting_1775552729139	\N	main-uploads/Fire Prevention and Fire Fighting_1775552729139	image/jpg	125779	1024	572	50	50	main-uploads/Fire Prevention and Fire Fighting_1775552729139	https://res.cloudinary.com/dpdkfg8qu/image/upload/v1775552731/main-uploads/Fire%20Prevention%20and%20Fire%20Fighting_1775552729139.jpg
27	\N	2026-04-07 09:09:34.833+00	2026-04-07 09:09:34.833+00	/api/media/file/main-uploads%2Felementary-first-aid-stcw-efa-03_1775552972443	\N	main-uploads/elementary-first-aid-stcw-efa-03_1775552972443	image/jpg	116608	1024	572	50	50	main-uploads/elementary-first-aid-stcw-efa-03_1775552972443	https://res.cloudinary.com/dpdkfg8qu/image/upload/v1775552974/main-uploads/elementary-first-aid-stcw-efa-03_1775552972443.jpg
28	\N	2026-04-07 09:16:30.96+00	2026-04-07 09:16:30.96+00	/api/media/file/main-uploads%2Fengineering_1775553389063	\N	main-uploads/engineering_1775553389063	image/png	80932	200	200	50	50	main-uploads/engineering_1775553389063	https://res.cloudinary.com/dpdkfg8qu/image/upload/v1775553390/main-uploads/engineering_1775553389063.png
29	\N	2026-04-07 09:20:50.691+00	2026-04-07 09:20:50.69+00	/api/media/file/main-uploads%2Fhigh-voltage-power-systems-eng-hv-22_1775553646741	\N	main-uploads/high-voltage-power-systems-eng-hv-22_1775553646741	image/png	2362834	1376	768	50	50	main-uploads/high-voltage-power-systems-eng-hv-22_1775553646741	https://res.cloudinary.com/dpdkfg8qu/image/upload/v1775553650/main-uploads/high-voltage-power-systems-eng-hv-22_1775553646741.png
30	\N	2026-04-07 09:30:32.788+00	2026-04-07 09:30:32.788+00	/api/media/file/main-uploads%2Fcommon-rail-diesel-diagnostics-eng-crd-23_1775554230856	\N	main-uploads/common-rail-diesel-diagnostics-eng-crd-23_1775554230856	image/jpg	143926	1024	572	50	50	main-uploads/common-rail-diesel-diagnostics-eng-crd-23_1775554230856	https://res.cloudinary.com/dpdkfg8qu/image/upload/v1775554232/main-uploads/common-rail-diesel-diagnostics-eng-crd-23_1775554230856.jpg
31	\N	2026-04-07 09:33:06.2+00	2026-04-07 09:33:06.2+00	/api/media/file/main-uploads%2Fengine-room-management-eng-mgt-24_1775554382821	\N	main-uploads/engine-room-management-eng-mgt-24_1775554382821	image/jpg	123914	1024	572	50	50	main-uploads/engine-room-management-eng-mgt-24_1775554382821	https://res.cloudinary.com/dpdkfg8qu/image/upload/v1775554385/main-uploads/engine-room-management-eng-mgt-24_1775554382821.jpg
32	\N	2026-04-07 10:47:12.306+00	2026-04-07 10:47:12.306+00	/api/media/file/main-uploads%2Ftanker-familiarization-oil-chemical-crs-tfa-31_1775558829479	\N	main-uploads/tanker-familiarization-oil-chemical-crs-tfa-31_1775558829479	image/jpg	128859	1024	572	50	50	main-uploads/tanker-familiarization-oil-chemical-crs-tfa-31_1775558829479	https://res.cloudinary.com/dpdkfg8qu/image/upload/v1775558832/main-uploads/tanker-familiarization-oil-chemical-crs-tfa-31_1775558829479.jpg
33	\N	2026-04-07 10:47:55.575+00	2026-04-07 10:47:55.575+00	/api/media/file/main-uploads%2Fcargo-ops_1775558873808	\N	main-uploads/cargo-ops_1775558873808	image/png	76154	200	200	50	50	main-uploads/cargo-ops_1775558873808	https://res.cloudinary.com/dpdkfg8qu/image/upload/v1775558875/main-uploads/cargo-ops_1775558873808.png
34	\N	2026-04-07 10:56:58.399+00	2026-04-07 10:56:58.399+00	/api/media/file/main-uploads%2Fadvanced-cargo-handling-stability-crs-frt-32_1775559415935	\N	main-uploads/advanced-cargo-handling-stability-crs-frt-32_1775559415935	image/jpg	171176	1024	572	50	50	main-uploads/advanced-cargo-handling-stability-crs-frt-32_1775559415935	https://res.cloudinary.com/dpdkfg8qu/image/upload/v1775559418/main-uploads/advanced-cargo-handling-stability-crs-frt-32_1775559415935.jpg
35	\N	2026-04-07 11:02:57.424+00	2026-04-07 11:02:57.424+00	/api/media/file/main-uploads%2Fglobal-container-logistics-supply-chain-crs-gcn-34_1775559774554	\N	main-uploads/global-container-logistics-supply-chain-crs-gcn-34_1775559774554	image/jpg	160307	1024	572	50	50	main-uploads/global-container-logistics-supply-chain-crs-gcn-34_1775559774554	https://res.cloudinary.com/dpdkfg8qu/image/upload/v1775559777/main-uploads/global-container-logistics-supply-chain-crs-gcn-34_1775559774554.jpg
36	\N	2026-04-07 11:07:51.429+00	2026-04-07 11:07:51.429+00	/api/media/file/main-uploads%2Fmaritime-law_1775560069126	\N	main-uploads/maritime-law_1775560069126	image/png	90693	200	200	50	50	main-uploads/maritime-law_1775560069126	https://res.cloudinary.com/dpdkfg8qu/image/upload/v1775560071/main-uploads/maritime-law_1775560069126.png
37	\N	2026-04-07 11:13:06.095+00	2026-04-07 11:13:06.095+00	/api/media/file/main-uploads%2Fmaritime-labour-convention-rights-law-mlc-52_1775560378943	\N	main-uploads/maritime-labour-convention-rights-law-mlc-52_1775560378943	image/png	3089069	1376	768	50	50	main-uploads/maritime-labour-convention-rights-law-mlc-52_1775560378943	https://res.cloudinary.com/dpdkfg8qu/image/upload/v1775560385/main-uploads/maritime-labour-convention-rights-law-mlc-52_1775560378943.png
38	\N	2026-04-07 11:54:10.357+00	2026-04-07 11:54:10.357+00	/api/media/file/main-uploads%2Fballast-water-management-compliance-law-bwm-53_1775562847742	\N	main-uploads/ballast-water-management-compliance-law-bwm-53_1775562847742	image/jpg	117269	1024	572	50	50	main-uploads/ballast-water-management-compliance-law-bwm-53_1775562847742	https://res.cloudinary.com/dpdkfg8qu/image/upload/v1775562850/main-uploads/ballast-water-management-compliance-law-bwm-53_1775562847742.jpg
39	\N	2026-04-07 12:05:39.448+00	2026-04-07 12:05:39.448+00	/api/media/file/main-uploads%2Finternational-colregs-compliance-law-col-54_1775563535922	\N	main-uploads/international-colregs-compliance-law-col-54_1775563535922	image/jpg	115869	1024	572	50	50	main-uploads/international-colregs-compliance-law-col-54_1775563535922	https://res.cloudinary.com/dpdkfg8qu/image/upload/v1775563539/main-uploads/international-colregs-compliance-law-col-54_1775563535922.jpg
41	\N	2026-04-07 12:22:14.279+00	2026-04-07 12:22:14.279+00	/api/media/file/main-uploads%2Fsafety-rescue_1775564530303	\N	main-uploads/safety-rescue_1775564530303	image/png	96901	200	200	50	50	main-uploads/safety-rescue_1775564530303	https://res.cloudinary.com/dpdkfg8qu/image/upload/v1775564534/main-uploads/safety-rescue_1775564530303.png
42	\N	2026-04-07 12:27:49.348+00	2026-04-07 12:27:49.348+00	/api/media/file/main-uploads%2Fsecurity_1775564867025	\N	main-uploads/security_1775564867025	image/png	91575	200	200	50	50	main-uploads/security_1775564867025	https://res.cloudinary.com/dpdkfg8qu/image/upload/v1775564869/main-uploads/security_1775564867025.png
43	\N	2026-04-07 12:54:07.926+00	2026-04-07 12:54:07.919+00	/api/media/file/main-uploads%2Fsoft-skill_1775566444448	\N	main-uploads/soft-skill_1775566444448	image/png	93578	200	200	50	50	main-uploads/soft-skill_1775566444448	https://res.cloudinary.com/dpdkfg8qu/image/upload/v1775566446/main-uploads/soft-skill_1775566444448.png
44	\N	2026-04-07 13:54:50.032+00	2026-04-07 13:54:50.032+00	/api/media/file/main-uploads%2Fshipboard_1775570080606	\N	main-uploads/shipboard_1775570080606	image/jpg	4066134	1024	1024	50	50	main-uploads/shipboard_1775570080606	https://res.cloudinary.com/dpdkfg8qu/image/upload/v1775570089/main-uploads/shipboard_1775570080606.jpg
45	Certificate for John Lloyd Callao - CERT-2026-BEFBDD66	2026-04-10 13:04:52.788+00	2026-04-10 13:04:52.788+00	/api/media/file/main-uploads%2FCERT-2026-BEFBDD66_1775826282229	\N	main-uploads/CERT-2026-BEFBDD66_1775826282229	image/pdf	6296198	3508	2480	\N	\N	main-uploads/CERT-2026-BEFBDD66_1775826282229	https://res.cloudinary.com/dpdkfg8qu/image/upload/v1775826291/main-uploads/CERT-2026-BEFBDD66_1775826282229.pdf
46	\N	2026-04-11 11:11:38.788+00	2026-04-11 11:11:38.788+00	/api/media/file/main-uploads%2FIAS%2016%20PPSlides_1775905895771	\N	main-uploads/IAS 16 PPSlides_1775905895771	application/vnd.ms-powerpoint	355840	\N	\N	\N	\N	main-uploads/IAS 16 PPSlides_1775905895771	https://res.cloudinary.com/dpdkfg8qu/raw/upload/v1775905898/main-uploads/IAS%2016%20PPSlides_1775905895771
47	\N	2026-04-11 12:18:10.664+00	2026-04-11 12:18:10.663+00	/api/media/file/main-uploads%2Fsdfsf.pptx_1775909886898.ppt	\N	main-uploads/sdfsf.pptx_1775909886898.ppt	application/vnd.ms-powerpoint	353792	\N	\N	\N	\N	main-uploads/sdfsf.pptx_1775909886898.ppt	https://res.cloudinary.com/dpdkfg8qu/raw/upload/v1775909890/main-uploads/sdfsf.pptx_1775909886898.ppt
52	\N	2026-04-11 12:52:44.765+00	2026-04-11 12:52:44.765+00	/api/media/file/main-uploads%2Fpdfexample_1775911961167.pdf	\N	main-uploads/pdfexample_1775911961167.pdf	application/pdf	255889	720	540	\N	\N	main-uploads/pdfexample_1775911961167.pdf	https://res.cloudinary.com/dpdkfg8qu/image/upload/v1775911964/main-uploads/pdfexample_1775911961167.pdf.pdf
53	\N	2026-04-17 11:46:58.5+00	2026-04-17 11:46:58.495+00	/api/media/file/main-uploads%2Fpersonal-survival-techniques-stcw-pst-01_1776426415382.jpg	\N	main-uploads/personal-survival-techniques-stcw-pst-01_1776426415382.jpg	image/jpg	118868	1024	572	50	50	main-uploads/personal-survival-techniques-stcw-pst-01_1776426415382.jpg	https://res.cloudinary.com/dpdkfg8qu/image/upload/v1776426419/main-uploads/personal-survival-techniques-stcw-pst-01_1776426415382.jpg.jpg
54	\N	2026-04-17 11:53:59.201+00	2026-04-17 11:53:59.201+00	/api/media/file/main-uploads%2Fadvanced-cargo-handling-stability-crs-frt-32_1776426836875.jpg	\N	main-uploads/advanced-cargo-handling-stability-crs-frt-32_1776426836875.jpg	image/jpg	171176	1024	572	50	50	main-uploads/advanced-cargo-handling-stability-crs-frt-32_1776426836875.jpg	https://res.cloudinary.com/dpdkfg8qu/image/upload/v1776426840/main-uploads/advanced-cargo-handling-stability-crs-frt-32_1776426836875.jpg.jpg
55	\N	2026-04-17 12:00:38.776+00	2026-04-17 12:00:38.776+00	/api/media/file/main-uploads%2Fmaritime-labour-convention-rights-law-mlc-52_1775560378943_1776427236514.webp	\N	main-uploads/maritime-labour-convention-rights-law-mlc-52_1775560378943_1776427236514.webp	image/webp	87768	1376	768	50	50	main-uploads/maritime-labour-convention-rights-law-mlc-52_1775560378943_1776427236514.webp	https://res.cloudinary.com/dpdkfg8qu/image/upload/v1776427239/main-uploads/maritime-labour-convention-rights-law-mlc-52_1775560378943_1776427236514.webp.webp
56	\N	2026-04-17 12:50:25.46+00	2026-04-17 12:50:25.46+00	/api/media/file/main-uploads%2Fmaritime-labour-convention-rights-law-mlc-52_1775560378943_1776430223194.webp	\N	main-uploads/maritime-labour-convention-rights-law-mlc-52_1775560378943_1776430223194.webp	image/webp	87768	1376	768	50	50	main-uploads/maritime-labour-convention-rights-law-mlc-52_1775560378943_1776430223194.webp	https://res.cloudinary.com/dpdkfg8qu/image/upload/v1776430226/main-uploads/maritime-labour-convention-rights-law-mlc-52_1775560378943_1776430223194.webp.webp
57	\N	2026-04-17 13:02:18.799+00	2026-04-17 13:02:18.799+00	/api/media/file/main-uploads%2Fmaritime-labour-convention-rights-law-mlc-52_1775560378943_1776430935369.webp	\N	main-uploads/maritime-labour-convention-rights-law-mlc-52_1775560378943_1776430935369.webp	image/webp	87768	1376	768	50	50	main-uploads/maritime-labour-convention-rights-law-mlc-52_1775560378943_1776430935369.webp	https://res.cloudinary.com/dpdkfg8qu/image/upload/v1776430939/main-uploads/maritime-labour-convention-rights-law-mlc-52_1775560378943_1776430935369.webp.webp
58	\N	2026-04-17 13:14:28.803+00	2026-04-17 13:14:28.803+00	/api/media/file/main-uploads%2Fmaritime-labour-convention-rights-law-mlc-52_1775560378943_1776431666709.webp	\N	main-uploads/maritime-labour-convention-rights-law-mlc-52_1775560378943_1776431666709.webp	image/webp	87768	1376	768	50	50	main-uploads/maritime-labour-convention-rights-law-mlc-52_1775560378943_1776431666709.webp	https://res.cloudinary.com/dpdkfg8qu/image/upload/v1776431669/main-uploads/maritime-labour-convention-rights-law-mlc-52_1775560378943_1776431666709.webp.webp
59	\N	2026-04-21 09:08:15.07+00	2026-04-21 09:08:15.07+00	/api/media/file/main-uploads%2Fcalsiter-inc-logo_1776762492979.webp	\N	main-uploads/calsiter-inc-logo_1776762492979.webp	image/webp	40158	384	384	50	50	main-uploads/calsiter-inc-logo_1776762492979.webp	https://res.cloudinary.com/dpdkfg8qu/image/upload/v1776762495/main-uploads/calsiter-inc-logo_1776762492979.webp.webp
60	\N	2026-04-21 09:08:44.243+00	2026-04-21 09:08:44.243+00	/api/media/file/main-uploads%2Fcalsiter-inc-logo_1776762522812.webp	\N	main-uploads/calsiter-inc-logo_1776762522812.webp	image/webp	40158	384	384	50	50	main-uploads/calsiter-inc-logo_1776762522812.webp	https://res.cloudinary.com/dpdkfg8qu/image/upload/v1776762524/main-uploads/calsiter-inc-logo_1776762522812.webp.webp
61	\N	2026-05-13 13:52:06.509+00	2026-05-13 13:52:06.508+00	/api/media/file/main-uploads%2FGemini_Generated_Image_eab6keeab6keeab6_1778680321589.png	\N	main-uploads/Gemini_Generated_Image_eab6keeab6keeab6_1778680321589.png	image/png	2380090	1376	768	50	50	main-uploads/Gemini_Generated_Image_eab6keeab6keeab6_1778680321589.png	https://res.cloudinary.com/dpdkfg8qu/image/upload/v1778680325/main-uploads/Gemini_Generated_Image_eab6keeab6keeab6_1778680321589.png.png
62	\N	2026-05-14 12:22:56.024+00	2026-05-14 12:22:56.024+00	/api/media/file/main-uploads%2FGemini_Generated_Image_p9ha1cp9ha1cp9ha_1778761372451.png	\N	main-uploads/Gemini_Generated_Image_p9ha1cp9ha1cp9ha_1778761372451.png	image/png	2239656	1024	1024	50	50	main-uploads/Gemini_Generated_Image_p9ha1cp9ha1cp9ha_1778761372451.png	https://res.cloudinary.com/dpdkfg8qu/image/upload/v1778761375/main-uploads/Gemini_Generated_Image_p9ha1cp9ha1cp9ha_1778761372451.png.png
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: -
--

COPY "public"."users" ("id", "first_name", "last_name", "role", "is_active", "last_login", "updated_at", "created_at", "email", "reset_password_token", "reset_password_expiration", "salt", "hash", "login_attempts", "lock_until", "middle_name", "name_extension", "username", "nationality", "birth_date", "place_of_birth", "complete_address", "gender", "civil_status", "profile_picture_id", "biography", "enable_a_p_i_key", "api_key", "api_key_index", "phone", "push_notifications_enabled", "security_alerts_email_enabled") FROM stdin;
3	John Lloyd	Callao	service	t	\N	2026-04-05 05:55:30.629+00	2026-04-05 05:55:30.628+00	apiservice@gmail.com	\N	\N	de8b34b279993f9423a56f3b96d62e14705f0e171f77acc9d2cdb4b82ab22509	038e324fb0e446acc9d741429807725ca953d0acca2422170166b170cb5fcb1c9f3d1d4cac1b078841a38c9745f06e74f07c3ce37e926c97895c5db1a244b880dfc465d5b4ff06600fdc7a1672efbf61d862ab9bbb62577ca813de33ba1c25f0aeb581f890af306627d7b43ccb42806dfcc73e89b4b2d95ed849127916d47bb5879c1498fedfb7848654f454d1916eeff94b91e1446f8983e2395790b4c28abf79fb5722cdd4c78b1497ac3e9117ac8cdc776eedc82224f216424dde5180a33f1f29749e8bb49d05896e94db42ddf872cc86d7757a5b7db129be73165e1ce25bfe829acac76f0475296545d743d93abf88e7ef4e4390366c66dc681c21d279b9b2f0efede7b88843268ce9f9bf320d5b81623edb3192336d29d2b621a636c7035ff24f38cf0b156ccdf2b6f239191815bde36135f32f9430b2db78daee1f8302743af4587a88c8bbcd7d74463fdc15c6133bcc6ef1c7a64399f42b97b0eea47aedbc20450cf3765fa38ba78ade87372f05eb617a60e426893fc1c753f6367734c43b7e3849ebdbf1cb309a5316682c303233d06f73ba6afaf8bb3f4517e3e7bff26dc99b53b78c130e64dc1108f47ed278554650b8ca5d32701fc83dcfec7d4af8243fc5dbb6610e69213e4cb90679566fdb8303cfc9c4811d40b8ba13aad222de3eab977bdc23c6834ddaa2d19c5e6df61a3b0479630779273161c2546e9737	0	\N	\N	John Lloyd Callao	\N	\N	\N	\N	Olingan, Dipolog City	\N	\N	\N	\N	t	32fcfe13bf57541ec37db7fbcb96a187ec991a044aecaabaa66d68935fddd91a004c66828321970c8146f52be562ec2fdf03e51b	3c798c09acc9a5ab5655c768e2c6aeb8c7d5b61715dc258940747f50a86a2d22	\N	t	t
4	Michael	Lhayos	instructor	t	2026-05-21 06:06:46.737+00	2026-05-21 06:06:46.833+00	2026-04-05 08:04:17.959+00	michael@gmail.com	\N	\N	4d060369f1bc7f4d71a1dded0d72f5d17a5d36f76a5cf9957cf10e7d31db2948	6e24118001351340c8672cff3d479ed55b96e0b45787fa7f9ff095555776d767b2d08db83e4392d15aaba6e17c58bc2d955484c88ea8b9f7b467786c86315e56b7e6aaf10c61903e7e0a16a7d4e73299a1dc9cbf5162dc351ec773362a9c48118bc8f0dd2afca4fae077038ce7beb3a3b81dec7c807ec368bd6b744ce75a607eb12990e69aa44915d49787627e11f14f5ac867aa74df22a09c163d26d838bf6c26c9f4772d0184174658a82d681644c00800b25ea26f93dc9be4ac4524fc385662782e64f5cb2441bc6eff69cd8d11436aedb741f77d2621ac2a9f83467b20546be31074575dbd92ce22991d090219327f6dd1bb6dfcb95e56a94c19d53a90548b9ced2e573bf6ee939b0c68c3450b01f8c5f4f226101eeb6b1593f710d9e1db165b212ae800fb693bee616943555cc9a93e3117aae70b9480e5227ee8b4e9093aba7b1ef1be99766a06787916c38894ddd70a076b657f8e5e555a435210999346a80329d47199f4d2dc01bbd9477b263240cfbf34a04b40066b20333813934e24b877f6b7cfd13e2374186ffde78e6ddec8d77c1a2d2f06386f33b0299cec45e28678a4294566ab93f319ddcd1afe90bc73c0b61ec03e94b3db3ffef31349fef7fdd8027958d92614b1f5c3c204c23bd8ac3bc7eca7edfb99b71f1c2b58647de44c6f022400c8c9c3d061d2634fdc93580711fe592e3d1407ee3dd2fb59b105	0	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	4	\N	\N	\N	\N	\N	t	t
2	Kael	Verano	trainee	t	2026-05-21 02:48:26.583+00	2026-05-21 02:48:26.876+00	2026-04-05 05:54:00.376+00	trainee@grandlinemaritime.com	\N	\N	66a8b77999f080cc4af6a179ffb6e701b3150f4c6e8adbf6dc36fa9e2d760716	ff3bfbee979bc4056fc58f93c5a167fe77c5f5ee913df8f095208e68b90ada6ba7a9cb6b15ab3324ce080759012e097f065c6fe544a07fb2d502c3de9ea94505135b4b438cf1479834119e51f5860a8a76389584583f6f52e58654672cb5e120e9e6b3de04a753b3c49414b6d41bac092709894b97fc5e09dedd1860a4e50f822d9cf6b9f3ea40933bf4e9871870d8296415a0f5344182353ece1e014a1f2f0125c07d23c2de22d9a084794f53db355c5a15aa8d22603dd5f36673b967487eb857de2c2553a902f5282d4a70cd5ea4f552dcecd3cf09448f7cf8e499d0a2aba56652c65a6c26cd0240fbdaf54e9ea2ed05fc5ec39c154f998cc44c0f646153359e941ae500d2f3669585dff08962dee008ff2d1e9b0824fb425867d00228ae2a67e722e98d7133c8c597fd77ddcd6884f76828f80be9336a4383b8ccc234ec0112a58ea3fb547a1fc56386f6cd19be96d1d977a14abe3c8d7242af4fd21425839884cb5015b0c3311a5a81602556d5e3111a9d01cae094e966662e1a2608499bd8c84dd712d44a711642d91a30be84abcf877d9122120a60531b26e3d4d72cadee34be3fcc2b1e5e4bd33108a18893f4d7a6ce5de35093c381fb27c12d46e23f323eba9553d81330e7540d5a51c47b3fe045f974442fe62d8f686f33cc2daa151f0fe23ef2a9c83575f7048b9276f0b2e47f204e66869e345d44035bdd1070cf	0	\N	Dominic	John Lloyd Callao	johnlloydcallao23	Filipino	2001-12-01 00:00:00+00	Pangi, Ipil, Zamboanga Sibugay	Purok African Daisy, Pangi, Ipil, Zamboanga Sibugay	male	single	62	{"root": {"type": "root", "format": "", "indent": 0, "version": 1, "children": [{"type": "paragraph", "format": "", "indent": 0, "version": 1, "children": [{"mode": "normal", "text": "Hello, I am John. I am 24. I am a rider.", "type": "text", "style": "", "detail": 0, "format": 0, "version": 1}]}]}}	f	\N	\N	09092809767	t	t
11	Juan	Enrile	trainee	t	\N	2026-05-08 07:49:32.126+00	2026-05-08 07:49:32.125+00	carlos@gmail.com	\N	\N	2572b77ec594220c6e4ba54bc0fcdd8afe30499d6bce7bb95ff291fa2f80c6bf	0e44d066152f96eaaf68ff07cb3baad5b99da1d67322dd74aa4ea9f89b43cebb44dc52304062efae40dd17764e9ac0f195c4890bd7e55f86a1e2c14405031e424ec9a53d96c45f405cbb9c2344752ebf9712393fe11dc3d29fce0bfd622c5137f5178271d74a22962fd2e846c82eb11d4cb2182b068fb32d148e6de29c6f2fadea7e4ebb6ed8c46fe1af04108f8a81971323049e8d0b15f241c32e37405dbb4df732bac1408ce9250edf8d7f89c05ee0d58a121fe404166e406587a44b359f450a4f8ab3ace177e90e30368706c8ba568165c33c77c485ff5153ce6d3d7bcaa921265fb91f617879d8e7c573c353d5be04c179234381012c9be2e90435f7190b1e98fd3e31c10921c2fa56f94b74057a74d11faf593f23d7a7b98e90cd7dd0d8046e619d6f174f9cf85f83feacfbd879ffb5544e158a03170ba23dfbe32e1682049aa25edc0ffb785a9b7a2496c39ed0855e6cc7afecb4c194d29af8aa903e38bf40ba7cb9eda2dbc24867538faff84ec900d9d2ab9a140dc4deb21eefc6d8ed2e8940bb0fd412674ff60082dd3bea7d1906bc2eb2b3cf3972d2216841f34c4d55b59799b214c138778ab48eddc7303c21b06f8c5529c747a0bf7d466831686ba129ee72732157215289992f72d334ce3ea92a8fbdb87eadae118130f7f2ddf92c892839fca8b7f0c181972470a459abcd51a7de0ae33d634b621176bae09fbc	0	\N	Ponze	Jr	juancarlos	Filipino	2000-12-28 00:00:00+00	Manila, Philippines	Manila, Philippines	male	single	\N	\N	\N	\N	\N	+639092809767	t	t
1	John	Callao	admin	t	2026-05-21 05:59:25.42+00	2026-05-21 05:59:25.719+00	2026-04-05 05:41:13.051+00	johnlloydcallao@gmail.com	\N	\N	4ba2fa19852bbd674b6235be5127c78ada9daa759cf64d285b779f8f9def98b3	381d3a7e9ea4be7d40542d6d3c604cf45dcfcc099b6ca43fd98cc568888a80a08cdb1aaecb4e3ffd67b634b945f421d7ad20c2860f806ea469276b097714c13fb5bc3300b72043b101cec240f0171df97a879df4153ec907eed45f5ece86bd552996ae7df05fa370260b0ff6bce18a4592646ca6a1e126996382f46b58bd2dbea45d463901d4993ba82bea2dd03744c4f154217278949158dd3a081af549b3c123c22354b550ebb45afd9a7f40b6c389cffdcdd7620dbc09d988b2b3b8237761f83dcae502bf4a6c1c01caf5112618644f7425bd75fcaf7120f49e36bac7d56b6ff3d2cbdea6137fd5ebf2b38910aaa5fa218c66b240520ba84d25be0bde7a514738b181d014fc00c2c88917522fe1ca2216b43e137d85c6b6d563385cd8e83a8d6d9a0cfa580579e983b39cacc136c230efce8ca4212de9e53e5f1f7497a8ae9dbbc69b63a8396693dcae4151db504005f5144662682b0d5fdf71f54a17ffd1a3e138c06426fdab104ae85ed834b1f7c06cdaf296729650d0b4ff74b5f03e2490952354774d47ea5221942587821de5cde208978bac33b6e7d4353c1e7e33c390f1d5d6f9ba472d1838d472e864c22666f0a25eaf6c729d86f1f8731d7941db8ce751a051eaa05e939efa763cc4aaf2211df2456a186b4229f1a8f41daa282ea6c84c71a7653cd9b96805b59803f77005c12cbf2423ef9160aa75f1626ec03d	0	\N	Lloyd	John Lloyd Callao	johnlloydcallao@gmail.com	\N	\N	\N	Olingan, Dipolog City	\N	\N	\N	\N	\N	\N	\N	\N	t	t
12	NORIEL Updated	ESPINOSA	trainee	t	\N	2026-05-10 12:35:58.993+00	2026-05-09 01:30:34.534+00	espinosanoriel1992@gmail.com	\N	\N	3e5e39d07e92b40a943e49b5621bcfaaa851f4c4d81694ef108e0ba2cc2aa5f2	cf57da3b0c371aeb7f2704f2815b545b3271964fb3e1f1479ba05aa997d46dfcba7bb3ec5b847ba173f6900037b1613fcae24af622039e768aa6795a4dec0d793270156c0892423e2a4e1ee780757c556adb8eeae72d18c288bf543479e6fe17d5f6fb26adeff7bccbedb2b74c37fcdf8aeaa33c03f5e4f0b1b18659e472ddbd684bf5355e17f6f33113755ed34076ecaa19b7df1d4871a043bdfcb73a702f33dfdfd8f5cb18f748952da9aad7dcf20c55556d2f3e26ac1c547e3676eca845babcc53dd314c9979ac25fc12a6c2c03be2c004ec628b46f216b94ab8d4af1c70a09e8935bf3b388c5d6302efd3e7e7f69aefd6f68eef733725fe66572e2a3c047288b6cdfed3c157e1ab22f199e354d6251e74c9b93fbe1239741fa163bbe70e6279757415bcb34dd60e42fd8e8455a5698595a7caafabbb9c83dfe54fd8e806911c74791ab896a4e02414053f89f9aff52a7de4dded75f1ed5681a892a8fee96d77e2dab2f378d9851dc97b498884164e6caaa9999504ae8c1ee31b500b31c3b3fc732e6c842caaa4a50ab084ad4566b7880d2c215dd8cfe9fddcca73641e6f31086665f301926f797f3012f213097bad809867810edb6b894a0338b9400ca783356213447dcad4c846b59a39c20f437c6b1b77330bbf01e2d45fc7bf99ef41139621e982d5b3c40b6fe6464f584a414f8326bbca343967c66ab43c28444320e	3	\N	BATOTO	\N	Noriel1992	Filipino	1992-03-05 00:00:00+00	CATANAUAN, QUEZON	BRGY. 4 CATANAUAN, QUEZON	male	married	\N	\N	\N	\N	\N	+639762265551	t	t
\.


--
-- Data for Name: posts; Type: TABLE DATA; Schema: public; Owner: -
--

COPY "public"."posts" ("id", "title", "slug", "content", "excerpt", "featured_image_id", "status", "published_at", "author_id", "seo_title", "seo_description", "seo_focus_keyword", "updated_at", "created_at", "_status", "is_featured") FROM stdin;
1	Navigating the Digital Tide: Why Your Fleet Needs a Maritime-Specific LMS	navigating-the-digital-tide-why-your-fleet-needs-a-maritime-specific-lms	{"root": {"type": "root", "format": "", "indent": 0, "version": 1, "children": [{"type": "paragraph", "format": "", "indent": 0, "version": 1, "children": [{"mode": "normal", "text": "Navigating the Digital Tide: Why Your Fleet Needs a Maritime-Specific LMS", "type": "text", "style": "", "detail": 0, "format": 0, "version": 1}], "direction": null, "textStyle": "", "textFormat": 0}, {"type": "paragraph", "format": "", "indent": 0, "version": 1, "children": [{"mode": "normal", "text": "The maritime industry has always been defined by its resilience and tradition. However, as vessels become \\"smarter\\" and international regulations like STCW and MLC 2006 become more stringent, the old ways of training are no longer enough.", "type": "text", "style": "", "detail": 0, "format": 0, "version": 1}], "direction": null, "textStyle": "", "textFormat": 0}, {"type": "paragraph", "format": "", "indent": 0, "version": 1, "children": [], "direction": null, "textStyle": "", "textFormat": 0}, {"type": "paragraph", "format": "", "indent": 0, "version": 1, "children": [{"mode": "normal", "text": "Managing a global crew requires more than just a stack of certificates in a drawer. It requires a dynamic, cloud-based Learning Management System (LMS) designed specifically for the unique challenges of life at sea.", "type": "text", "style": "", "detail": 0, "format": 0, "version": 1}], "direction": null, "textStyle": "", "textFormat": 0}, {"type": "paragraph", "format": "", "indent": 0, "version": 1, "children": [], "direction": null, "textStyle": "", "textFormat": 0}, {"type": "paragraph", "format": "", "indent": 0, "version": 1, "children": [{"mode": "normal", "text": "The Challenges of Training at Sea", "type": "text", "style": "", "detail": 0, "format": 0, "version": 1}], "direction": null, "textStyle": "", "textFormat": 0}, {"type": "paragraph", "format": "", "indent": 0, "version": 1, "children": [{"mode": "normal", "text": "Training a maritime workforce isn’t like training an office team. Fleet managers face several unique hurdles:", "type": "text", "style": "", "detail": 0, "format": 0, "version": 1}], "direction": null, "textStyle": "", "textFormat": 0}, {"type": "paragraph", "format": "", "indent": 0, "version": 1, "children": [], "direction": null, "textStyle": "", "textFormat": 0}, {"type": "paragraph", "format": "", "indent": 0, "version": 1, "children": [{"mode": "normal", "text": "Intermittent Connectivity: Ships often operate in \\"dead zones\\" with limited or expensive satellite internet.", "type": "text", "style": "", "detail": 0, "format": 0, "version": 1}], "direction": null, "textStyle": "", "textFormat": 0}, {"type": "paragraph", "format": "", "indent": 0, "version": 1, "children": [], "direction": null, "textStyle": "", "textFormat": 0}, {"type": "paragraph", "format": "", "indent": 0, "version": 1, "children": [{"mode": "normal", "text": "High Turnover: Constant crew rotations make it difficult to track who is certified for what.", "type": "text", "style": "", "detail": 0, "format": 0, "version": 1}], "direction": null, "textStyle": "", "textFormat": 0}, {"type": "paragraph", "format": "", "indent": 0, "version": 1, "children": [], "direction": null, "textStyle": "", "textFormat": 0}, {"type": "paragraph", "format": "", "indent": 0, "version": 1, "children": [{"mode": "normal", "text": "Complex Compliance: Missing a single training deadline can lead to port state control detentions and massive fines.", "type": "text", "style": "", "detail": 0, "format": 0, "version": 1}], "direction": null, "textStyle": "", "textFormat": 0}, {"type": "paragraph", "format": "", "indent": 0, "version": 1, "children": [], "direction": null, "textStyle": "", "textFormat": 0}, {"type": "paragraph", "format": "", "indent": 0, "version": 1, "children": [{"mode": "normal", "text": "How a Maritime LMS Changes the Game", "type": "text", "style": "", "detail": 0, "format": 0, "version": 1}], "direction": null, "textStyle": "", "textFormat": 0}, {"type": "paragraph", "format": "", "indent": 0, "version": 1, "children": [{"mode": "normal", "text": "1. Offline Sync Capabilities", "type": "text", "style": "", "detail": 0, "format": 0, "version": 1}], "direction": null, "textStyle": "", "textFormat": 0}, {"type": "paragraph", "format": "", "indent": 0, "version": 1, "children": [{"mode": "normal", "text": "A standard LMS fails the moment a ship loses Wi-Fi. A maritime-specific platform allows seafarers to download modules while in port and complete them mid-ocean. Once the vessel regains connectivity, the results sync automatically to the home office.", "type": "text", "style": "", "detail": 0, "format": 0, "version": 1}], "direction": null, "textStyle": "", "textFormat": 0}, {"type": "paragraph", "format": "", "indent": 0, "version": 1, "children": [], "direction": null, "textStyle": "", "textFormat": 0}, {"type": "paragraph", "format": "", "indent": 0, "version": 1, "children": [{"mode": "normal", "text": "2. Automated Compliance Tracking", "type": "text", "style": "", "detail": 0, "format": 0, "version": 1}], "direction": null, "textStyle": "", "textFormat": 0}, {"type": "paragraph", "format": "", "indent": 0, "version": 1, "children": [{"mode": "normal", "text": "Stop relying on messy spreadsheets. Modern platforms provide a Real-time Compliance Dashboard.", "type": "text", "style": "", "detail": 0, "format": 0, "version": 1}], "direction": null, "textStyle": "", "textFormat": 0}, {"type": "paragraph", "format": "", "indent": 0, "version": 1, "children": [], "direction": null, "textStyle": "", "textFormat": 0}, {"type": "paragraph", "format": "", "indent": 0, "version": 1, "children": [{"mode": "normal", "text": "Green: All certifications are up to date.", "type": "text", "style": "", "detail": 0, "format": 0, "version": 1}], "direction": null, "textStyle": "", "textFormat": 0}, {"type": "paragraph", "format": "", "indent": 0, "version": 1, "children": [], "direction": null, "textStyle": "", "textFormat": 0}, {"type": "paragraph", "format": "", "indent": 0, "version": 1, "children": [{"mode": "normal", "text": "Yellow: Certificates expiring in 30 days.", "type": "text", "style": "", "detail": 0, "format": 0, "version": 1}], "direction": null, "textStyle": "", "textFormat": 0}, {"type": "paragraph", "format": "", "indent": 0, "version": 1, "children": [], "direction": null, "textStyle": "", "textFormat": 0}, {"type": "paragraph", "format": "", "indent": 0, "version": 1, "children": [{"mode": "normal", "text": "Red: Immediate action required.", "type": "text", "style": "", "detail": 0, "format": 0, "version": 1}], "direction": null, "textStyle": "", "textFormat": 0}, {"type": "paragraph", "format": "", "indent": 0, "version": 1, "children": [], "direction": null, "textStyle": "", "textFormat": 0}, {"type": "paragraph", "format": "", "indent": 0, "version": 1, "children": [{"mode": "normal", "text": "3. Micro-learning for Busy Crews", "type": "text", "style": "", "detail": 0, "format": 0, "version": 1}], "direction": null, "textStyle": "", "textFormat": 0}, {"type": "paragraph", "format": "", "indent": 0, "version": 1, "children": [{"mode": "normal", "text": "Seafarers don't have hours to sit in front of a computer. By breaking down complex safety procedures into 5-10 minute \\"micro-modules,\\" retention rates increase, and training can be squeezed in between watches.", "type": "text", "style": "", "detail": 0, "format": 0, "version": 1}], "direction": null, "textStyle": "", "textFormat": 0}, {"type": "paragraph", "format": "", "indent": 0, "version": 1, "children": [], "direction": null, "textStyle": "", "textFormat": 0}, {"type": "paragraph", "format": "", "indent": 0, "version": 1, "children": [{"mode": "normal", "text": "\\"The goal of modern maritime training isn't just to check a box for a surveyor; it's to ensure that every crew member returns home safely by mastering the technology they work with daily.\\"", "type": "text", "style": "", "detail": 0, "format": 0, "version": 1}], "direction": null, "textStyle": "", "textFormat": 0}, {"type": "paragraph", "format": "", "indent": 0, "version": 1, "children": [], "direction": null, "textStyle": "", "textFormat": 0}, {"type": "paragraph", "format": "", "indent": 0, "version": 1, "children": [{"mode": "normal", "text": "Looking Ahead: VR and Beyond", "type": "text", "style": "", "detail": 0, "format": 0, "version": 1}], "direction": null, "textStyle": "", "textFormat": 0}, {"type": "paragraph", "format": "", "indent": 0, "version": 1, "children": [{"mode": "normal", "text": "The next frontier for maritime LMS platforms is the integration of Virtual Reality (VR) and Augmented Reality (AR). Imagine a new engineer practicing a main engine overhaul in a digital twin environment before ever touching a wrench.", "type": "text", "style": "", "detail": 0, "format": 0, "version": 1}], "direction": null, "textStyle": "", "textFormat": 0}, {"type": "paragraph", "format": "", "indent": 0, "version": 1, "children": [], "direction": null, "textStyle": "", "textFormat": 0}, {"type": "paragraph", "format": "", "indent": 0, "version": 1, "children": [{"mode": "normal", "text": "Conclusion", "type": "text", "style": "", "detail": 0, "format": 0, "version": 1}], "direction": null, "textStyle": "", "textFormat": 0}, {"type": "paragraph", "format": "", "indent": 0, "version": 1, "children": [{"mode": "normal", "text": "Investing in a dedicated Maritime LMS is no longer a luxury—it’s a strategic necessity. By centralizing training, ensuring 100% compliance, and providing flexible learning options, you aren't just managing a crew; you’re building a safer, more efficient fleet.", "type": "text", "style": "", "detail": 0, "format": 0, "version": 1}], "direction": null, "textStyle": "", "textFormat": 0}], "direction": null}}	As the shipping industry moves toward a more digitized future, traditional "pen and paper" training is falling behind. Discover how a modern Maritime LMS is bridging the skills gap, ensuring STCW compliance, and keeping crews safe—even when they are thousands of miles from shore.	61	published	\N	2	\N	\N	\N	2026-05-13 14:02:50.032+00	2026-05-13 13:50:40.037+00	published	f
\.


--
-- Data for Name: _posts_v; Type: TABLE DATA; Schema: public; Owner: -
--

COPY "public"."_posts_v" ("id", "parent_id", "version_title", "version_slug", "version_content", "version_excerpt", "version_featured_image_id", "version_status", "version_published_at", "version_author_id", "version_seo_title", "version_seo_description", "version_seo_focus_keyword", "version_updated_at", "version_created_at", "version__status", "created_at", "updated_at", "latest", "version_is_featured") FROM stdin;
3	1	Navigating the Digital Tide: Why Your Fleet Needs a Maritime-Specific LMS	navigating-the-digital-tide-why-your-fleet-needs-a-maritime-specific-lms	{"root": {"type": "root", "format": "", "indent": 0, "version": 1, "children": [{"type": "paragraph", "format": "", "indent": 0, "version": 1, "children": [{"mode": "normal", "text": "Navigating the Digital Tide: Why Your Fleet Needs a Maritime-Specific LMS", "type": "text", "style": "", "detail": 0, "format": 0, "version": 1}], "direction": null, "textStyle": "", "textFormat": 0}, {"type": "paragraph", "format": "", "indent": 0, "version": 1, "children": [{"mode": "normal", "text": "The maritime industry has always been defined by its resilience and tradition. However, as vessels become \\"smarter\\" and international regulations like STCW and MLC 2006 become more stringent, the old ways of training are no longer enough.", "type": "text", "style": "", "detail": 0, "format": 0, "version": 1}], "direction": null, "textStyle": "", "textFormat": 0}, {"type": "paragraph", "format": "", "indent": 0, "version": 1, "children": [], "direction": null, "textStyle": "", "textFormat": 0}, {"type": "paragraph", "format": "", "indent": 0, "version": 1, "children": [{"mode": "normal", "text": "Managing a global crew requires more than just a stack of certificates in a drawer. It requires a dynamic, cloud-based Learning Management System (LMS) designed specifically for the unique challenges of life at sea.", "type": "text", "style": "", "detail": 0, "format": 0, "version": 1}], "direction": null, "textStyle": "", "textFormat": 0}, {"type": "paragraph", "format": "", "indent": 0, "version": 1, "children": [], "direction": null, "textStyle": "", "textFormat": 0}, {"type": "paragraph", "format": "", "indent": 0, "version": 1, "children": [{"mode": "normal", "text": "The Challenges of Training at Sea", "type": "text", "style": "", "detail": 0, "format": 0, "version": 1}], "direction": null, "textStyle": "", "textFormat": 0}, {"type": "paragraph", "format": "", "indent": 0, "version": 1, "children": [{"mode": "normal", "text": "Training a maritime workforce isn’t like training an office team. Fleet managers face several unique hurdles:", "type": "text", "style": "", "detail": 0, "format": 0, "version": 1}], "direction": null, "textStyle": "", "textFormat": 0}, {"type": "paragraph", "format": "", "indent": 0, "version": 1, "children": [], "direction": null, "textStyle": "", "textFormat": 0}, {"type": "paragraph", "format": "", "indent": 0, "version": 1, "children": [{"mode": "normal", "text": "Intermittent Connectivity: Ships often operate in \\"dead zones\\" with limited or expensive satellite internet.", "type": "text", "style": "", "detail": 0, "format": 0, "version": 1}], "direction": null, "textStyle": "", "textFormat": 0}, {"type": "paragraph", "format": "", "indent": 0, "version": 1, "children": [], "direction": null, "textStyle": "", "textFormat": 0}, {"type": "paragraph", "format": "", "indent": 0, "version": 1, "children": [{"mode": "normal", "text": "High Turnover: Constant crew rotations make it difficult to track who is certified for what.", "type": "text", "style": "", "detail": 0, "format": 0, "version": 1}], "direction": null, "textStyle": "", "textFormat": 0}, {"type": "paragraph", "format": "", "indent": 0, "version": 1, "children": [], "direction": null, "textStyle": "", "textFormat": 0}, {"type": "paragraph", "format": "", "indent": 0, "version": 1, "children": [{"mode": "normal", "text": "Complex Compliance: Missing a single training deadline can lead to port state control detentions and massive fines.", "type": "text", "style": "", "detail": 0, "format": 0, "version": 1}], "direction": null, "textStyle": "", "textFormat": 0}, {"type": "paragraph", "format": "", "indent": 0, "version": 1, "children": [], "direction": null, "textStyle": "", "textFormat": 0}, {"type": "paragraph", "format": "", "indent": 0, "version": 1, "children": [{"mode": "normal", "text": "How a Maritime LMS Changes the Game", "type": "text", "style": "", "detail": 0, "format": 0, "version": 1}], "direction": null, "textStyle": "", "textFormat": 0}, {"type": "paragraph", "format": "", "indent": 0, "version": 1, "children": [{"mode": "normal", "text": "1. Offline Sync Capabilities", "type": "text", "style": "", "detail": 0, "format": 0, "version": 1}], "direction": null, "textStyle": "", "textFormat": 0}, {"type": "paragraph", "format": "", "indent": 0, "version": 1, "children": [{"mode": "normal", "text": "A standard LMS fails the moment a ship loses Wi-Fi. A maritime-specific platform allows seafarers to download modules while in port and complete them mid-ocean. Once the vessel regains connectivity, the results sync automatically to the home office.", "type": "text", "style": "", "detail": 0, "format": 0, "version": 1}], "direction": null, "textStyle": "", "textFormat": 0}, {"type": "paragraph", "format": "", "indent": 0, "version": 1, "children": [], "direction": null, "textStyle": "", "textFormat": 0}, {"type": "paragraph", "format": "", "indent": 0, "version": 1, "children": [{"mode": "normal", "text": "2. Automated Compliance Tracking", "type": "text", "style": "", "detail": 0, "format": 0, "version": 1}], "direction": null, "textStyle": "", "textFormat": 0}, {"type": "paragraph", "format": "", "indent": 0, "version": 1, "children": [{"mode": "normal", "text": "Stop relying on messy spreadsheets. Modern platforms provide a Real-time Compliance Dashboard.", "type": "text", "style": "", "detail": 0, "format": 0, "version": 1}], "direction": null, "textStyle": "", "textFormat": 0}, {"type": "paragraph", "format": "", "indent": 0, "version": 1, "children": [], "direction": null, "textStyle": "", "textFormat": 0}, {"type": "paragraph", "format": "", "indent": 0, "version": 1, "children": [{"mode": "normal", "text": "Green: All certifications are up to date.", "type": "text", "style": "", "detail": 0, "format": 0, "version": 1}], "direction": null, "textStyle": "", "textFormat": 0}, {"type": "paragraph", "format": "", "indent": 0, "version": 1, "children": [], "direction": null, "textStyle": "", "textFormat": 0}, {"type": "paragraph", "format": "", "indent": 0, "version": 1, "children": [{"mode": "normal", "text": "Yellow: Certificates expiring in 30 days.", "type": "text", "style": "", "detail": 0, "format": 0, "version": 1}], "direction": null, "textStyle": "", "textFormat": 0}, {"type": "paragraph", "format": "", "indent": 0, "version": 1, "children": [], "direction": null, "textStyle": "", "textFormat": 0}, {"type": "paragraph", "format": "", "indent": 0, "version": 1, "children": [{"mode": "normal", "text": "Red: Immediate action required.", "type": "text", "style": "", "detail": 0, "format": 0, "version": 1}], "direction": null, "textStyle": "", "textFormat": 0}, {"type": "paragraph", "format": "", "indent": 0, "version": 1, "children": [], "direction": null, "textStyle": "", "textFormat": 0}, {"type": "paragraph", "format": "", "indent": 0, "version": 1, "children": [{"mode": "normal", "text": "3. Micro-learning for Busy Crews", "type": "text", "style": "", "detail": 0, "format": 0, "version": 1}], "direction": null, "textStyle": "", "textFormat": 0}, {"type": "paragraph", "format": "", "indent": 0, "version": 1, "children": [{"mode": "normal", "text": "Seafarers don't have hours to sit in front of a computer. By breaking down complex safety procedures into 5-10 minute \\"micro-modules,\\" retention rates increase, and training can be squeezed in between watches.", "type": "text", "style": "", "detail": 0, "format": 0, "version": 1}], "direction": null, "textStyle": "", "textFormat": 0}, {"type": "paragraph", "format": "", "indent": 0, "version": 1, "children": [], "direction": null, "textStyle": "", "textFormat": 0}, {"type": "paragraph", "format": "", "indent": 0, "version": 1, "children": [{"mode": "normal", "text": "\\"The goal of modern maritime training isn't just to check a box for a surveyor; it's to ensure that every crew member returns home safely by mastering the technology they work with daily.\\"", "type": "text", "style": "", "detail": 0, "format": 0, "version": 1}], "direction": null, "textStyle": "", "textFormat": 0}, {"type": "paragraph", "format": "", "indent": 0, "version": 1, "children": [], "direction": null, "textStyle": "", "textFormat": 0}, {"type": "paragraph", "format": "", "indent": 0, "version": 1, "children": [{"mode": "normal", "text": "Looking Ahead: VR and Beyond", "type": "text", "style": "", "detail": 0, "format": 0, "version": 1}], "direction": null, "textStyle": "", "textFormat": 0}, {"type": "paragraph", "format": "", "indent": 0, "version": 1, "children": [{"mode": "normal", "text": "The next frontier for maritime LMS platforms is the integration of Virtual Reality (VR) and Augmented Reality (AR). Imagine a new engineer practicing a main engine overhaul in a digital twin environment before ever touching a wrench.", "type": "text", "style": "", "detail": 0, "format": 0, "version": 1}], "direction": null, "textStyle": "", "textFormat": 0}, {"type": "paragraph", "format": "", "indent": 0, "version": 1, "children": [], "direction": null, "textStyle": "", "textFormat": 0}, {"type": "paragraph", "format": "", "indent": 0, "version": 1, "children": [{"mode": "normal", "text": "Conclusion", "type": "text", "style": "", "detail": 0, "format": 0, "version": 1}], "direction": null, "textStyle": "", "textFormat": 0}, {"type": "paragraph", "format": "", "indent": 0, "version": 1, "children": [{"mode": "normal", "text": "Investing in a dedicated Maritime LMS is no longer a luxury—it’s a strategic necessity. By centralizing training, ensuring 100% compliance, and providing flexible learning options, you aren't just managing a crew; you’re building a safer, more efficient fleet.", "type": "text", "style": "", "detail": 0, "format": 0, "version": 1}], "direction": null, "textStyle": "", "textFormat": 0}], "direction": null}}	As the shipping industry moves toward a more digitized future, traditional "pen and paper" training is falling behind. Discover how a modern Maritime LMS is bridging the skills gap, ensuring STCW compliance, and keeping crews safe—even when they are thousands of miles from shore.	61	published	\N	2	\N	\N	\N	2026-05-13 14:02:50.032+00	2026-05-13 13:50:40.037+00	published	2026-05-13 14:02:50.477+00	2026-05-13 14:02:50.477+00	t	f
2	1	Navigating the Digital Tide: Why Your Fleet Needs a Maritime-Specific LMS	navigating-the-digital-tide-why-your-fleet-needs-a-maritime-specific-lms	{"root": {"type": "root", "format": "", "indent": 0, "version": 1, "children": [{"type": "paragraph", "format": "", "indent": 0, "version": 1, "children": [{"mode": "normal", "text": "Navigating the Digital Tide: Why Your Fleet Needs a Maritime-Specific LMS", "type": "text", "style": "", "detail": 0, "format": 0, "version": 1}], "direction": null, "textStyle": "", "textFormat": 0}, {"type": "paragraph", "format": "", "indent": 0, "version": 1, "children": [{"mode": "normal", "text": "The maritime industry has always been defined by its resilience and tradition. However, as vessels become \\"smarter\\" and international regulations like STCW and MLC 2006 become more stringent, the old ways of training are no longer enough.", "type": "text", "style": "", "detail": 0, "format": 0, "version": 1}], "direction": null, "textStyle": "", "textFormat": 0}, {"type": "paragraph", "format": "", "indent": 0, "version": 1, "children": [], "direction": null, "textStyle": "", "textFormat": 0}, {"type": "paragraph", "format": "", "indent": 0, "version": 1, "children": [{"mode": "normal", "text": "Managing a global crew requires more than just a stack of certificates in a drawer. It requires a dynamic, cloud-based Learning Management System (LMS) designed specifically for the unique challenges of life at sea.", "type": "text", "style": "", "detail": 0, "format": 0, "version": 1}], "direction": null, "textStyle": "", "textFormat": 0}, {"type": "paragraph", "format": "", "indent": 0, "version": 1, "children": [], "direction": null, "textStyle": "", "textFormat": 0}, {"type": "paragraph", "format": "", "indent": 0, "version": 1, "children": [{"mode": "normal", "text": "The Challenges of Training at Sea", "type": "text", "style": "", "detail": 0, "format": 0, "version": 1}], "direction": null, "textStyle": "", "textFormat": 0}, {"type": "paragraph", "format": "", "indent": 0, "version": 1, "children": [{"mode": "normal", "text": "Training a maritime workforce isn’t like training an office team. Fleet managers face several unique hurdles:", "type": "text", "style": "", "detail": 0, "format": 0, "version": 1}], "direction": null, "textStyle": "", "textFormat": 0}, {"type": "paragraph", "format": "", "indent": 0, "version": 1, "children": [], "direction": null, "textStyle": "", "textFormat": 0}, {"type": "paragraph", "format": "", "indent": 0, "version": 1, "children": [{"mode": "normal", "text": "Intermittent Connectivity: Ships often operate in \\"dead zones\\" with limited or expensive satellite internet.", "type": "text", "style": "", "detail": 0, "format": 0, "version": 1}], "direction": null, "textStyle": "", "textFormat": 0}, {"type": "paragraph", "format": "", "indent": 0, "version": 1, "children": [], "direction": null, "textStyle": "", "textFormat": 0}, {"type": "paragraph", "format": "", "indent": 0, "version": 1, "children": [{"mode": "normal", "text": "High Turnover: Constant crew rotations make it difficult to track who is certified for what.", "type": "text", "style": "", "detail": 0, "format": 0, "version": 1}], "direction": null, "textStyle": "", "textFormat": 0}, {"type": "paragraph", "format": "", "indent": 0, "version": 1, "children": [], "direction": null, "textStyle": "", "textFormat": 0}, {"type": "paragraph", "format": "", "indent": 0, "version": 1, "children": [{"mode": "normal", "text": "Complex Compliance: Missing a single training deadline can lead to port state control detentions and massive fines.", "type": "text", "style": "", "detail": 0, "format": 0, "version": 1}], "direction": null, "textStyle": "", "textFormat": 0}, {"type": "paragraph", "format": "", "indent": 0, "version": 1, "children": [], "direction": null, "textStyle": "", "textFormat": 0}, {"type": "paragraph", "format": "", "indent": 0, "version": 1, "children": [{"mode": "normal", "text": "How a Maritime LMS Changes the Game", "type": "text", "style": "", "detail": 0, "format": 0, "version": 1}], "direction": null, "textStyle": "", "textFormat": 0}, {"type": "paragraph", "format": "", "indent": 0, "version": 1, "children": [{"mode": "normal", "text": "1. Offline Sync Capabilities", "type": "text", "style": "", "detail": 0, "format": 0, "version": 1}], "direction": null, "textStyle": "", "textFormat": 0}, {"type": "paragraph", "format": "", "indent": 0, "version": 1, "children": [{"mode": "normal", "text": "A standard LMS fails the moment a ship loses Wi-Fi. A maritime-specific platform allows seafarers to download modules while in port and complete them mid-ocean. Once the vessel regains connectivity, the results sync automatically to the home office.", "type": "text", "style": "", "detail": 0, "format": 0, "version": 1}], "direction": null, "textStyle": "", "textFormat": 0}, {"type": "paragraph", "format": "", "indent": 0, "version": 1, "children": [], "direction": null, "textStyle": "", "textFormat": 0}, {"type": "paragraph", "format": "", "indent": 0, "version": 1, "children": [{"mode": "normal", "text": "2. Automated Compliance Tracking", "type": "text", "style": "", "detail": 0, "format": 0, "version": 1}], "direction": null, "textStyle": "", "textFormat": 0}, {"type": "paragraph", "format": "", "indent": 0, "version": 1, "children": [{"mode": "normal", "text": "Stop relying on messy spreadsheets. Modern platforms provide a Real-time Compliance Dashboard.", "type": "text", "style": "", "detail": 0, "format": 0, "version": 1}], "direction": null, "textStyle": "", "textFormat": 0}, {"type": "paragraph", "format": "", "indent": 0, "version": 1, "children": [], "direction": null, "textStyle": "", "textFormat": 0}, {"type": "paragraph", "format": "", "indent": 0, "version": 1, "children": [{"mode": "normal", "text": "Green: All certifications are up to date.", "type": "text", "style": "", "detail": 0, "format": 0, "version": 1}], "direction": null, "textStyle": "", "textFormat": 0}, {"type": "paragraph", "format": "", "indent": 0, "version": 1, "children": [], "direction": null, "textStyle": "", "textFormat": 0}, {"type": "paragraph", "format": "", "indent": 0, "version": 1, "children": [{"mode": "normal", "text": "Yellow: Certificates expiring in 30 days.", "type": "text", "style": "", "detail": 0, "format": 0, "version": 1}], "direction": null, "textStyle": "", "textFormat": 0}, {"type": "paragraph", "format": "", "indent": 0, "version": 1, "children": [], "direction": null, "textStyle": "", "textFormat": 0}, {"type": "paragraph", "format": "", "indent": 0, "version": 1, "children": [{"mode": "normal", "text": "Red: Immediate action required.", "type": "text", "style": "", "detail": 0, "format": 0, "version": 1}], "direction": null, "textStyle": "", "textFormat": 0}, {"type": "paragraph", "format": "", "indent": 0, "version": 1, "children": [], "direction": null, "textStyle": "", "textFormat": 0}, {"type": "paragraph", "format": "", "indent": 0, "version": 1, "children": [{"mode": "normal", "text": "3. Micro-learning for Busy Crews", "type": "text", "style": "", "detail": 0, "format": 0, "version": 1}], "direction": null, "textStyle": "", "textFormat": 0}, {"type": "paragraph", "format": "", "indent": 0, "version": 1, "children": [{"mode": "normal", "text": "Seafarers don't have hours to sit in front of a computer. By breaking down complex safety procedures into 5-10 minute \\"micro-modules,\\" retention rates increase, and training can be squeezed in between watches.", "type": "text", "style": "", "detail": 0, "format": 0, "version": 1}], "direction": null, "textStyle": "", "textFormat": 0}, {"type": "paragraph", "format": "", "indent": 0, "version": 1, "children": [], "direction": null, "textStyle": "", "textFormat": 0}, {"type": "paragraph", "format": "", "indent": 0, "version": 1, "children": [{"mode": "normal", "text": "\\"The goal of modern maritime training isn't just to check a box for a surveyor; it's to ensure that every crew member returns home safely by mastering the technology they work with daily.\\"", "type": "text", "style": "", "detail": 0, "format": 0, "version": 1}], "direction": null, "textStyle": "", "textFormat": 0}, {"type": "paragraph", "format": "", "indent": 0, "version": 1, "children": [], "direction": null, "textStyle": "", "textFormat": 0}, {"type": "paragraph", "format": "", "indent": 0, "version": 1, "children": [{"mode": "normal", "text": "Looking Ahead: VR and Beyond", "type": "text", "style": "", "detail": 0, "format": 0, "version": 1}], "direction": null, "textStyle": "", "textFormat": 0}, {"type": "paragraph", "format": "", "indent": 0, "version": 1, "children": [{"mode": "normal", "text": "The next frontier for maritime LMS platforms is the integration of Virtual Reality (VR) and Augmented Reality (AR). Imagine a new engineer practicing a main engine overhaul in a digital twin environment before ever touching a wrench.", "type": "text", "style": "", "detail": 0, "format": 0, "version": 1}], "direction": null, "textStyle": "", "textFormat": 0}, {"type": "paragraph", "format": "", "indent": 0, "version": 1, "children": [], "direction": null, "textStyle": "", "textFormat": 0}, {"type": "paragraph", "format": "", "indent": 0, "version": 1, "children": [{"mode": "normal", "text": "Conclusion", "type": "text", "style": "", "detail": 0, "format": 0, "version": 1}], "direction": null, "textStyle": "", "textFormat": 0}, {"type": "paragraph", "format": "", "indent": 0, "version": 1, "children": [{"mode": "normal", "text": "Investing in a dedicated Maritime LMS is no longer a luxury—it’s a strategic necessity. By centralizing training, ensuring 100% compliance, and providing flexible learning options, you aren't just managing a crew; you’re building a safer, more efficient fleet.", "type": "text", "style": "", "detail": 0, "format": 0, "version": 1}], "direction": null, "textStyle": "", "textFormat": 0}], "direction": null}}	As the shipping industry moves toward a more digitized future, traditional "pen and paper" training is falling behind. Discover how a modern Maritime LMS is bridging the skills gap, ensuring STCW compliance, and keeping crews safe—even when they are thousands of miles from shore.	61	published	\N	2	\N	\N	\N	2026-05-13 14:02:27.607+00	2026-05-13 13:50:40.037+00	published	2026-05-13 14:02:27.979+00	2026-05-13 14:02:27.979+00	f	f
1	1	Navigating the Digital Tide: Why Your Fleet Needs a Maritime-Specific LMS	navigating-the-digital-tide-why-your-fleet-needs-a-maritime-specific-lms	{"root": {"type": "root", "format": "", "indent": 0, "version": 1, "children": [{"type": "paragraph", "format": "", "indent": 0, "version": 1, "children": [{"mode": "normal", "text": "Navigating the Digital Tide: Why Your Fleet Needs a Maritime-Specific LMS", "type": "text", "style": "", "detail": 0, "format": 0, "version": 1}], "direction": null, "textStyle": "", "textFormat": 0}, {"type": "paragraph", "format": "", "indent": 0, "version": 1, "children": [{"mode": "normal", "text": "The maritime industry has always been defined by its resilience and tradition. However, as vessels become \\"smarter\\" and international regulations like STCW and MLC 2006 become more stringent, the old ways of training are no longer enough.", "type": "text", "style": "", "detail": 0, "format": 0, "version": 1}], "direction": null, "textStyle": "", "textFormat": 0}, {"type": "paragraph", "format": "", "indent": 0, "version": 1, "children": [], "direction": null, "textStyle": "", "textFormat": 0}, {"type": "paragraph", "format": "", "indent": 0, "version": 1, "children": [{"mode": "normal", "text": "Managing a global crew requires more than just a stack of certificates in a drawer. It requires a dynamic, cloud-based Learning Management System (LMS) designed specifically for the unique challenges of life at sea.", "type": "text", "style": "", "detail": 0, "format": 0, "version": 1}], "direction": null, "textStyle": "", "textFormat": 0}, {"type": "paragraph", "format": "", "indent": 0, "version": 1, "children": [], "direction": null, "textStyle": "", "textFormat": 0}, {"type": "paragraph", "format": "", "indent": 0, "version": 1, "children": [{"mode": "normal", "text": "The Challenges of Training at Sea", "type": "text", "style": "", "detail": 0, "format": 0, "version": 1}], "direction": null, "textStyle": "", "textFormat": 0}, {"type": "paragraph", "format": "", "indent": 0, "version": 1, "children": [{"mode": "normal", "text": "Training a maritime workforce isn’t like training an office team. Fleet managers face several unique hurdles:", "type": "text", "style": "", "detail": 0, "format": 0, "version": 1}], "direction": null, "textStyle": "", "textFormat": 0}, {"type": "paragraph", "format": "", "indent": 0, "version": 1, "children": [], "direction": null, "textStyle": "", "textFormat": 0}, {"type": "paragraph", "format": "", "indent": 0, "version": 1, "children": [{"mode": "normal", "text": "Intermittent Connectivity: Ships often operate in \\"dead zones\\" with limited or expensive satellite internet.", "type": "text", "style": "", "detail": 0, "format": 0, "version": 1}], "direction": null, "textStyle": "", "textFormat": 0}, {"type": "paragraph", "format": "", "indent": 0, "version": 1, "children": [], "direction": null, "textStyle": "", "textFormat": 0}, {"type": "paragraph", "format": "", "indent": 0, "version": 1, "children": [{"mode": "normal", "text": "High Turnover: Constant crew rotations make it difficult to track who is certified for what.", "type": "text", "style": "", "detail": 0, "format": 0, "version": 1}], "direction": null, "textStyle": "", "textFormat": 0}, {"type": "paragraph", "format": "", "indent": 0, "version": 1, "children": [], "direction": null, "textStyle": "", "textFormat": 0}, {"type": "paragraph", "format": "", "indent": 0, "version": 1, "children": [{"mode": "normal", "text": "Complex Compliance: Missing a single training deadline can lead to port state control detentions and massive fines.", "type": "text", "style": "", "detail": 0, "format": 0, "version": 1}], "direction": null, "textStyle": "", "textFormat": 0}, {"type": "paragraph", "format": "", "indent": 0, "version": 1, "children": [], "direction": null, "textStyle": "", "textFormat": 0}, {"type": "paragraph", "format": "", "indent": 0, "version": 1, "children": [{"mode": "normal", "text": "How a Maritime LMS Changes the Game", "type": "text", "style": "", "detail": 0, "format": 0, "version": 1}], "direction": null, "textStyle": "", "textFormat": 0}, {"type": "paragraph", "format": "", "indent": 0, "version": 1, "children": [{"mode": "normal", "text": "1. Offline Sync Capabilities", "type": "text", "style": "", "detail": 0, "format": 0, "version": 1}], "direction": null, "textStyle": "", "textFormat": 0}, {"type": "paragraph", "format": "", "indent": 0, "version": 1, "children": [{"mode": "normal", "text": "A standard LMS fails the moment a ship loses Wi-Fi. A maritime-specific platform allows seafarers to download modules while in port and complete them mid-ocean. Once the vessel regains connectivity, the results sync automatically to the home office.", "type": "text", "style": "", "detail": 0, "format": 0, "version": 1}], "direction": null, "textStyle": "", "textFormat": 0}, {"type": "paragraph", "format": "", "indent": 0, "version": 1, "children": [], "direction": null, "textStyle": "", "textFormat": 0}, {"type": "paragraph", "format": "", "indent": 0, "version": 1, "children": [{"mode": "normal", "text": "2. Automated Compliance Tracking", "type": "text", "style": "", "detail": 0, "format": 0, "version": 1}], "direction": null, "textStyle": "", "textFormat": 0}, {"type": "paragraph", "format": "", "indent": 0, "version": 1, "children": [{"mode": "normal", "text": "Stop relying on messy spreadsheets. Modern platforms provide a Real-time Compliance Dashboard.", "type": "text", "style": "", "detail": 0, "format": 0, "version": 1}], "direction": null, "textStyle": "", "textFormat": 0}, {"type": "paragraph", "format": "", "indent": 0, "version": 1, "children": [], "direction": null, "textStyle": "", "textFormat": 0}, {"type": "paragraph", "format": "", "indent": 0, "version": 1, "children": [{"mode": "normal", "text": "Green: All certifications are up to date.", "type": "text", "style": "", "detail": 0, "format": 0, "version": 1}], "direction": null, "textStyle": "", "textFormat": 0}, {"type": "paragraph", "format": "", "indent": 0, "version": 1, "children": [], "direction": null, "textStyle": "", "textFormat": 0}, {"type": "paragraph", "format": "", "indent": 0, "version": 1, "children": [{"mode": "normal", "text": "Yellow: Certificates expiring in 30 days.", "type": "text", "style": "", "detail": 0, "format": 0, "version": 1}], "direction": null, "textStyle": "", "textFormat": 0}, {"type": "paragraph", "format": "", "indent": 0, "version": 1, "children": [], "direction": null, "textStyle": "", "textFormat": 0}, {"type": "paragraph", "format": "", "indent": 0, "version": 1, "children": [{"mode": "normal", "text": "Red: Immediate action required.", "type": "text", "style": "", "detail": 0, "format": 0, "version": 1}], "direction": null, "textStyle": "", "textFormat": 0}, {"type": "paragraph", "format": "", "indent": 0, "version": 1, "children": [], "direction": null, "textStyle": "", "textFormat": 0}, {"type": "paragraph", "format": "", "indent": 0, "version": 1, "children": [{"mode": "normal", "text": "3. Micro-learning for Busy Crews", "type": "text", "style": "", "detail": 0, "format": 0, "version": 1}], "direction": null, "textStyle": "", "textFormat": 0}, {"type": "paragraph", "format": "", "indent": 0, "version": 1, "children": [{"mode": "normal", "text": "Seafarers don't have hours to sit in front of a computer. By breaking down complex safety procedures into 5-10 minute \\"micro-modules,\\" retention rates increase, and training can be squeezed in between watches.", "type": "text", "style": "", "detail": 0, "format": 0, "version": 1}], "direction": null, "textStyle": "", "textFormat": 0}, {"type": "paragraph", "format": "", "indent": 0, "version": 1, "children": [], "direction": null, "textStyle": "", "textFormat": 0}, {"type": "paragraph", "format": "", "indent": 0, "version": 1, "children": [{"mode": "normal", "text": "\\"The goal of modern maritime training isn't just to check a box for a surveyor; it's to ensure that every crew member returns home safely by mastering the technology they work with daily.\\"", "type": "text", "style": "", "detail": 0, "format": 0, "version": 1}], "direction": null, "textStyle": "", "textFormat": 0}, {"type": "paragraph", "format": "", "indent": 0, "version": 1, "children": [], "direction": null, "textStyle": "", "textFormat": 0}, {"type": "paragraph", "format": "", "indent": 0, "version": 1, "children": [{"mode": "normal", "text": "Looking Ahead: VR and Beyond", "type": "text", "style": "", "detail": 0, "format": 0, "version": 1}], "direction": null, "textStyle": "", "textFormat": 0}, {"type": "paragraph", "format": "", "indent": 0, "version": 1, "children": [{"mode": "normal", "text": "The next frontier for maritime LMS platforms is the integration of Virtual Reality (VR) and Augmented Reality (AR). Imagine a new engineer practicing a main engine overhaul in a digital twin environment before ever touching a wrench.", "type": "text", "style": "", "detail": 0, "format": 0, "version": 1}], "direction": null, "textStyle": "", "textFormat": 0}, {"type": "paragraph", "format": "", "indent": 0, "version": 1, "children": [], "direction": null, "textStyle": "", "textFormat": 0}, {"type": "paragraph", "format": "", "indent": 0, "version": 1, "children": [{"mode": "normal", "text": "Conclusion", "type": "text", "style": "", "detail": 0, "format": 0, "version": 1}], "direction": null, "textStyle": "", "textFormat": 0}, {"type": "paragraph", "format": "", "indent": 0, "version": 1, "children": [{"mode": "normal", "text": "Investing in a dedicated Maritime LMS is no longer a luxury—it’s a strategic necessity. By centralizing training, ensuring 100% compliance, and providing flexible learning options, you aren't just managing a crew; you’re building a safer, more efficient fleet.", "type": "text", "style": "", "detail": 0, "format": 0, "version": 1}], "direction": null, "textStyle": "", "textFormat": 0}], "direction": null}}	As the shipping industry moves toward a more digitized future, traditional "pen and paper" training is falling behind. Discover how a modern Maritime LMS is bridging the skills gap, ensuring STCW compliance, and keeping crews safe—even when they are thousands of miles from shore.	\N	published	\N	2	\N	\N	\N	2026-05-13 13:50:40.039+00	2026-05-13 13:50:40.037+00	published	2026-05-13 13:50:40.232+00	2026-05-13 13:50:40.232+00	f	f
\.


--
-- Data for Name: post_categories; Type: TABLE DATA; Schema: public; Owner: -
--

COPY "public"."post_categories" ("id", "name", "slug", "description", "icon_id", "color_code", "display_order", "is_active", "metadata", "updated_at", "created_at") FROM stdin;
1	STCW Basic	stcw-basic	\N	25	\N	0	t	\N	2026-05-13 13:59:50.338+00	2026-05-13 13:59:50.337+00
\.


--
-- Data for Name: _posts_v_rels; Type: TABLE DATA; Schema: public; Owner: -
--

COPY "public"."_posts_v_rels" ("id", "order", "parent_id", "path", "post_categories_id") FROM stdin;
1	1	3	version.category	1
\.


--
-- Data for Name: _posts_v_version_tags; Type: TABLE DATA; Schema: public; Owner: -
--

COPY "public"."_posts_v_version_tags" ("_order", "_parent_id", "id", "tag", "_uuid") FROM stdin;
\.


--
-- Data for Name: admins; Type: TABLE DATA; Schema: public; Owner: -
--

COPY "public"."admins" ("id", "user_id", "updated_at", "created_at", "admin_level", "system_permissions") FROM stdin;
1	1	2026-04-05 05:52:47.975+00	2026-04-05 05:52:47.975+00	content	{"user_management": false, "content_management": true}
\.


--
-- Data for Name: certificate_templates; Type: TABLE DATA; Schema: public; Owner: -
--

COPY "public"."certificate_templates" ("id", "name", "slug", "canvas_schema", "status", "updated_at", "created_at", "background_image_id") FROM stdin;
1	Maritime Labour Convention (MLC) Rights	maritime-labour-convention-mlc-rights	{"width": 3508, "height": 2480, "elements": [{"x": 1315.3333333333323, "y": 764.6666666666664, "id": "el_1775826058853", "type": "variable", "field": "student_name", "label": "Student Name", "style": {"color": "#000000", "padding": 0, "fontSize": 141, "textAlign": "left", "fontFamily": "serif", "fontWeight": "normal", "borderRadius": 0, "backgroundColor": "transparent"}, "width": 1379, "height": 212}, {"x": 1423.3333333333335, "y": 1056.666666666667, "id": "el_1775826114414", "type": "variable", "field": "course_title", "label": "Course Title", "style": {"color": "#000000", "padding": 0, "fontSize": 124, "textAlign": "left", "fontFamily": "serif", "fontWeight": "normal", "borderRadius": 0, "backgroundColor": "transparent"}, "width": 1059, "height": 187}, {"x": 1429.9999999999993, "y": 1286.6666666666654, "id": "el_1775826146919", "type": "variable", "field": "completion_date", "label": "Completion Date", "style": {"color": "#000000", "padding": 0, "fontSize": 111, "textAlign": "left", "fontFamily": "serif", "fontWeight": "normal", "borderRadius": 0, "backgroundColor": "transparent"}, "width": 925, "height": 166}, {"x": 1369.9999999999995, "y": 1539.9999999999993, "id": "el_1775826160607", "type": "variable", "field": "instructor_name", "label": "Instructor Name", "style": {"color": "#000000", "padding": 0, "fontSize": 117, "textAlign": "left", "fontFamily": "serif", "fontWeight": "normal", "borderRadius": 0, "backgroundColor": "transparent"}, "width": 1111, "height": 176}, {"x": 1676.666666666666, "y": 1823.3333333333326, "id": "el_1775826170759", "type": "variable", "field": "certificate_id", "label": "Certificate ID", "style": {"color": "#000000", "padding": 0, "fontSize": 48, "textAlign": "left", "fontFamily": "serif", "fontWeight": "normal", "borderRadius": 0, "backgroundColor": "transparent"}, "width": "auto", "height": "auto"}, {"x": 1613.3333333333326, "y": 596.6666666666666, "id": "el_1775826176664", "type": "text", "label": "New Text", "style": {"color": "#000000", "padding": 0, "fontSize": 48, "textAlign": "left", "fontFamily": "serif", "fontWeight": "normal", "borderRadius": 0, "backgroundColor": "#aa2727"}, "width": 676, "height": 72, "content": "This is a custom text"}, {"x": 1629.9999999999986, "y": 93.33333333333333, "id": "el_1775826213168", "type": "image", "label": "main-uploads/shipboard_1775570080606", "style": {"color": "transparent", "fontSize": 0, "textAlign": "left", "fontFamily": "sans-serif", "fontWeight": "normal"}, "width": 400, "height": 400, "content": "https://res.cloudinary.com/dpdkfg8qu/image/upload/v1775570089/main-uploads/shipboard_1775570080606.jpg"}], "backgroundFit": "cover"}	published	2026-04-10 13:03:45.366+00	2026-04-10 13:00:38.738+00	37
\.


--
-- Data for Name: feedback_forms; Type: TABLE DATA; Schema: public; Owner: -
--

COPY "public"."feedback_forms" ("id", "title", "description", "updated_at", "created_at") FROM stdin;
1	Fire Prevention and Fire Fighting Course Evaluation	This feedback form is designed to evaluate the effectiveness of the Fire Prevention and Fire Fighting training for maritime students, focusing on safety awareness, practical drills, equipment usage, and instructor performance.	2026-04-20 11:31:51.623+00	2026-04-20 11:31:51.622+00
\.


--
-- Data for Name: instructors; Type: TABLE DATA; Schema: public; Owner: -
--

COPY "public"."instructors" ("id", "user_id", "specialization", "years_experience", "certifications", "office_hours", "contact_email", "updated_at", "created_at", "teaching_permissions") FROM stdin;
1	4	General	\N	\N	\N	\N	2026-04-05 08:04:19.372+00	2026-04-05 08:04:19.372+00	\N
\.


--
-- Data for Name: courses; Type: TABLE DATA; Schema: public; Owner: -
--

COPY "public"."courses" ("id", "title", "course_code", "excerpt", "description", "instructor_id", "thumbnail_id", "banner_image_id", "price", "max_students", "enrollment_start_date", "enrollment_end_date", "course_start_date", "course_end_date", "estimated_duration", "difficulty_level", "language", "passing_grade", "status", "published_at", "settings", "updated_at", "created_at", "discounted_price", "is_featured", "description_blocks", "estimated_duration_unit", "evaluation_mode", "certificate_template_id", "feedback_form_id", "is_feedback_required") FROM stdin;
3	Elementary First Aid	STCW-EFA-03	This foundational medical course provides all seafarers with the essential life-saving knowledge and skills required to respond effectively to medical emergencies on board.	\N	1	27	\N	0	\N	\N	\N	\N	\N	\N	standard	en	70	published	2026-04-07 09:09:38.668+00	\N	2026-04-07 12:55:02.725+00	2026-04-07 09:09:38.669+00	\N	t	\N	hours	lessons_exam	\N	\N	f
5	Common Rail Diesel Diagnostics	ENG-CRD-23	This advanced technical course is designed for Marine Engineers focusing on the electronically controlled common rail fuel injection systems now prevalent in modern marine diesel engines.	{"root": {"type": "root", "format": "", "indent": 0, "version": 1, "children": [{"tag": "ul", "type": "list", "start": 1, "format": "", "indent": 0, "version": 1, "children": [{"type": "listitem", "value": 1, "format": "", "indent": 0, "version": 1, "children": [{"mode": "normal", "text": "This advanced technical course is designed for Marine Engineers focusing on the electronically controlled common rail fuel injection systems now prevalent in modern marine diesel engines. The course covers the operation, hydraulic principles, and precise diagnostic techniques required to troubleshoot high-pressure pumps, injectors, and electronic control units (ECUs), emphasizing emission compliance (MARPOL Annex VI).", "type": "text", "style": "", "detail": 0, "format": 0, "version": 1}], "direction": "ltr"}], "listType": "bullet", "direction": "ltr"}], "direction": "ltr"}}	1	30	\N	0	\N	\N	\N	\N	\N	\N	standard	en	70	published	2026-04-07 09:27:51.275+00	\N	2026-04-07 09:30:37.957+00	2026-04-07 09:27:51.277+00	\N	t	\N	hours	lessons_exam	\N	\N	f
6	Engine Room Management	ENG-MGT-24	This operational-level course is designed for senior Marine Engineers and those aspiring to leadership roles within the Engine Department.	{"root": {"type": "root", "format": "", "indent": 0, "version": 1, "children": [{"type": "paragraph", "format": "", "indent": 0, "version": 1, "children": [{"mode": "normal", "text": "This operational-level course is designed for senior Marine Engineers and those aspiring to leadership roles within the Engine Department. It focuses on the effective management of the engine room resource, emphasizing safe watchkeeping practices, compliance with international regulations (MARPOL and MLC), resource allocation, risk assessment, and crisis management.", "type": "text", "style": "", "detail": 0, "format": 0, "version": 1}], "direction": "ltr", "textStyle": "", "textFormat": 0}], "direction": "ltr"}}	1	31	\N	0	\N	\N	\N	\N	\N	\N	standard	en	70	published	2026-04-07 09:32:34.033+00	\N	2026-04-07 09:33:08.144+00	2026-04-07 09:32:34.034+00	\N	t	\N	hours	lessons_exam	\N	\N	f
9	Global Container Logistics & Supply Chain	CRS-GCN-34	This operational-level course provides a comprehensive overview of the end-to-end global container logistics network.	{"root": {"type": "root", "format": "", "indent": 0, "version": 1, "children": [{"type": "paragraph", "format": "", "indent": 0, "version": 1, "children": [{"mode": "normal", "text": "This operational-level course provides a comprehensive overview of the end-to-end global container logistics network. It is designed for shore-based personnel and aspiring deck officers, covering the role of container shipping in global trade, the operations of modern container terminals, intermodal transportation (road/rail), documentation (Bill of Lading), tracking technology, and supply chain security (C-TPAT/AEO). ", "type": "text", "style": "", "detail": 0, "format": 0, "version": 1}], "direction": "ltr", "textStyle": "", "textFormat": 0}], "direction": "ltr"}}	1	35	\N	0	\N	\N	\N	\N	\N	\N	standard	en	70	published	2026-04-07 11:02:58.752+00	\N	2026-04-07 11:02:58.753+00	2026-04-07 11:02:58.753+00	\N	t	\N	hours	lessons_exam	\N	\N	f
8	Advanced Cargo Handling & Stability	CRS-FRT-32	This advanced course is designed for Chief Officers and Master Mariners responsible for planning and overseeing the stowage, securing, and discharge of diverse cargoes.	{"root": {"type": "root", "format": "", "indent": 0, "version": 1, "children": [{"tag": "ul", "type": "list", "start": 1, "format": "", "indent": 0, "version": 1, "children": [{"type": "listitem", "value": 1, "format": "", "indent": 0, "version": 1, "children": [{"mode": "normal", "text": "This advanced course is designed for Chief Officers and Master Mariners responsible for planning and overseeing the stowage, securing, and discharge of diverse cargoes. It covers complex ship stability calculations (intact and damage), stress analysis, the use of loading computers, and specialized procedures for heavy lifts, grain, and hazardous bulk materials, adhering to the IMDG Code and IMSBC Code regulations.", "type": "text", "style": "", "detail": 0, "format": 0, "version": 1}], "direction": "ltr"}], "listType": "bullet", "direction": "ltr"}], "direction": "ltr"}}	1	34	\N	5000	\N	\N	\N	\N	\N	\N	standard	en	70	published	2026-04-07 10:57:08.873+00	\N	2026-05-19 10:48:17.024+00	2026-04-07 10:57:00.218+00	\N	t	\N	hours	lessons_exam	\N	\N	f
11	Ballast Water Management & Compliance	LAW-BWM-53	This specialized course provides critical training on the International Convention for the Control and Management of Ships' Ballast Water and Sediments (BWM Convention).	{"root": {"type": "root", "format": "", "indent": 0, "version": 1, "children": [{"tag": "ul", "type": "list", "start": 1, "format": "", "indent": 0, "version": 1, "children": [{"type": "listitem", "value": 1, "format": "", "indent": 0, "version": 1, "children": [{"mode": "normal", "text": "This specialized course provides critical training on the International Convention for the Control and Management of Ships' Ballast Water and Sediments (BWM Convention). It covers the ecological risks of invasive aquatic species, D-1 (Exchange) and D-2 (Performance) standards, BWM plan implementation, treatment technologies, and mandatory record-keeping to ensure compliance and prevent detention during Port State Control inspections.", "type": "text", "style": "", "detail": 0, "format": 0, "version": 1}], "direction": "ltr"}], "listType": "bullet", "direction": "ltr"}], "direction": "ltr"}}	1	38	\N	0	\N	\N	\N	\N	\N	\N	standard	en	70	published	2026-04-07 11:54:33.724+00	\N	2026-04-07 11:54:33.725+00	2026-04-07 11:53:57.087+00	\N	t	\N	hours	lessons_exam	\N	\N	f
10	Maritime Labour Convention (MLC) Rights	LAW-MLC-52	This essential course outlines the "Seafarers' Bill of Rights" as established by the Maritime Labour Convention (MLC) 2006.	{"root": {"type": "root", "format": "", "indent": 0, "version": 1, "children": [{"type": "paragraph", "format": "", "indent": 0, "version": 1, "children": [{"mode": "normal", "text": "This essential course outlines the \\"Seafarers' Bill of Rights\\" as established by the Maritime Labour Convention (MLC) 2006. It provides a deep dive into the minimum requirements for seafarers to work on a ship, including conditions of employment, accommodation, recreational facilities, food and catering, health protection, medical care, and social security.", "type": "text", "style": "", "detail": 0, "format": 0, "version": 1}], "direction": "ltr", "textStyle": "", "textFormat": 0}], "direction": "ltr"}}	1	37	\N	0	\N	\N	\N	\N	\N	1	intermediate	en	70	published	2026-04-07 11:10:16.685+00	\N	2026-04-12 03:09:30.96+00	2026-04-07 11:10:16.686+00	\N	t	\N	weeks	lessons	1	\N	f
12	International COLREGs Compliance	LAW-COL-54	This critical navigation course provides a deep dive into the International Regulations for Preventing Collisions at Sea (COLREGs), 1972.	{"root": {"type": "root", "format": "", "indent": 0, "version": 1, "children": [{"type": "paragraph", "format": "", "indent": 0, "version": 1, "children": [{"mode": "normal", "text": "This critical navigation course provides a deep dive into the International Regulations for Preventing Collisions at Sea (COLREGs), 1972. It is essential for all Deck Officers and Pilots, focusing on the correct application of safe speed, look-out principles, steering and sailing rules, and the precise interpretation of navigational lights, shapes, and sound signals in all visibility conditions. ", "type": "text", "style": "", "detail": 0, "format": 0, "version": 1}], "direction": "ltr", "textStyle": "", "textFormat": 0}], "direction": "ltr"}}	1	39	\N	5000	\N	\N	\N	\N	\N	\N	standard	en	70	published	2026-04-07 12:05:54.357+00	\N	2026-05-13 01:38:55.457+00	2026-04-07 12:05:40.969+00	\N	t	\N	hours	lessons_exam	\N	\N	f
2	Fire Prevention and Fire Fighting	STCW-FPFF-02	This essential safety course equips seafarers with the skills to minimize the risk of fire and respond effectively to fire emergencies on board.	{"root": {"type": "root", "format": "", "indent": 0, "version": 1, "children": [{"type": "paragraph", "format": "", "indent": 0, "version": 1, "children": [{"mode": "normal", "text": "This essential safety course equips seafarers with the skills to minimize the risk of fire and respond effectively to fire emergencies on board. Trainees learn to use various fire-fighting appliances and gain hands-on experience in tackling fires in confined spaces, emphasizing teamwork and safety protocols under the STCW Code (Table A-VI/1-2). ", "type": "text", "style": "", "detail": 0, "format": 0, "version": 1}], "direction": "ltr", "textStyle": "", "textFormat": 0}], "direction": "ltr"}}	1	26	\N	0	\N	\N	\N	\N	\N	2	standard	en	70	published	2026-04-07 09:01:11.221+00	\N	2026-04-29 13:49:06.67+00	2026-04-07 09:00:32.799+00	\N	f	\N	days	lessons_quizzes	\N	1	t
7	Tanker Familiarization (Oil & Chemical)	CRS-TFA-31	This course provides the mandatory minimum training for officers and ratings assigned specific duties and responsibilities related to cargo or cargo equipment on oil and chemical tankers.	{"root": {"type": "root", "format": "", "indent": 0, "version": 1, "children": [{"type": "paragraph", "format": "", "indent": 0, "version": 1, "children": [{"mode": "normal", "text": "This course provides the mandatory minimum training for officers and ratings assigned specific duties and responsibilities related to cargo or cargo equipment on oil and chemical tankers. It covers the basic principles of safe tanker operations, including fire safety, pollution prevention, and emergency procedures, in compliance with STCW Code Table A-V/1-1-1.", "type": "text", "style": "", "detail": 0, "format": 0, "version": 1}], "direction": "ltr", "textStyle": "", "textFormat": 0}], "direction": "ltr"}}	1	32	\N	5000	\N	\N	\N	\N	\N	\N	standard	en	70	published	2026-04-07 10:47:24.366+00	\N	2026-05-13 12:35:26.069+00	2026-04-07 10:47:14.513+00	\N	f	\N	hours	lessons_exam	\N	\N	f
4	High Voltage Power Systems	ENG-HV-22	This specialized course is designed for Marine Engineers and ETOs working on modern vessels with high voltage (HV) installations (exceeding 1,000V).	{"root": {"type": "root", "format": "", "indent": 0, "version": 1, "children": [{"type": "paragraph", "format": "", "indent": 0, "version": 1, "children": [{"mode": "normal", "text": "This specialized course is designed for Marine Engineers and ETOs working on modern vessels with high voltage (HV) installations (exceeding 1,000V). It covers the safe operation, maintenance, and troubleshooting of HV switchboards, propulsion motors, and distribution systems, emphasizing strict \\"Permit to Work\\" safety protocols and arc flash protection.", "type": "text", "style": "", "detail": 0, "format": 0, "version": 1}], "direction": "ltr", "textStyle": "", "textFormat": 0}], "direction": "ltr"}}	1	29	\N	5000	\N	\N	\N	\N	\N	\N	standard	en	70	published	2026-04-07 09:23:11.136+00	\N	2026-05-19 09:31:48.409+00	2026-04-07 09:23:11.138+00	\N	f	\N	hours	lessons_exam	\N	\N	f
1	Personal Survival Techniques	STCW-PST-01	This course provides seafarers with the essential knowledge and practical skills to survive at sea in the event of ship abandonment.	{"root": {"type": "root", "format": "", "indent": 0, "version": 1, "children": [{"type": "paragraph", "format": "", "indent": 0, "version": 1, "children": [{"mode": "normal", "text": "This course provides seafarers with the essential knowledge and practical skills to survive at sea in the event of ship abandonment. Covering life-saving appliances, emergency protocols, and survival craft operation, it is a mandatory requirement under the STCW Code (Table A-VI/1-1).", "type": "text", "style": "", "detail": 0, "format": 0, "version": 1}], "direction": "ltr", "textStyle": "", "textFormat": 0}], "direction": "ltr"}}	1	5	\N	5000	\N	\N	\N	\N	\N	\N	standard	en	70	published	2026-04-05 08:05:56.157+00	\N	2026-05-19 16:18:19.531+00	2026-04-05 08:04:52.468+00	\N	f	\N	hours	lessons_exam	\N	\N	f
\.


--
-- Data for Name: announcements; Type: TABLE DATA; Schema: public; Owner: -
--

COPY "public"."announcements" ("id", "title", "course_id", "body_blocks", "pinned", "visible_from", "visible_until", "created_by_id", "updated_at", "created_at") FROM stdin;
1	Course Offering	2	{"root": {"type": "root", "format": "", "indent": 0, "version": 1, "children": [{"type": "paragraph", "format": "", "indent": 0, "version": 1, "children": [{"mode": "normal", "text": "📢 ", "type": "text", "style": "", "detail": 0, "format": 0, "version": 1}, {"mode": "normal", "text": "ANNOUNCEMENT: COURSE OFFERING", "type": "text", "style": "", "detail": 0, "format": 1, "version": 1}], "direction": null, "textStyle": "", "textFormat": 0}, {"type": "paragraph", "format": "", "indent": 0, "version": 1, "children": [{"mode": "normal", "text": "We are pleased to announce the availability of a new training program:", "type": "text", "style": "", "detail": 0, "format": 0, "version": 1}], "direction": null, "textStyle": "", "textFormat": 0}, {"type": "paragraph", "format": "", "indent": 0, "version": 1, "children": [{"mode": "normal", "text": "🔥 ", "type": "text", "style": "", "detail": 0, "format": 0, "version": 1}, {"mode": "normal", "text": "Fire Prevention and Fire Fighting", "type": "text", "style": "", "detail": 0, "format": 1, "version": 1}], "direction": null, "textStyle": "", "textFormat": 0}, {"type": "paragraph", "format": "", "indent": 0, "version": 1, "children": [{"mode": "normal", "text": "This course is designed to equip seafarers and maritime personnel with essential knowledge and practical skills in preventing shipboard fires and responding effectively during fire emergencies. Participants will gain hands-on experience and understanding of fire safety procedures in accordance with international maritime standards.", "type": "text", "style": "", "detail": 0, "format": 0, "version": 1}], "direction": null, "textStyle": "", "textFormat": 0}, {"type": "paragraph", "format": "", "indent": 0, "version": 1, "children": [{"mode": "normal", "text": "🎯 ", "type": "text", "style": "", "detail": 0, "format": 0, "version": 1}, {"mode": "normal", "text": "Who should attend:", "type": "text", "style": "", "detail": 0, "format": 1, "version": 1}], "direction": null, "textStyle": "", "textFormat": 0}, {"tag": "ul", "type": "list", "start": 1, "format": "", "indent": 0, "version": 1, "children": [{"type": "listitem", "value": 1, "format": "", "indent": 0, "version": 1, "children": [{"mode": "normal", "text": "Seafarers and cadets", "type": "text", "style": "", "detail": 0, "format": 0, "version": 1}], "direction": null}, {"type": "listitem", "value": 2, "format": "", "indent": 0, "version": 1, "children": [{"mode": "normal", "text": "Deck and engine crew members", "type": "text", "style": "", "detail": 0, "format": 0, "version": 1}], "direction": null}, {"type": "listitem", "value": 3, "format": "", "indent": 0, "version": 1, "children": [{"mode": "normal", "text": "Maritime officers and shipboard personnel", "type": "text", "style": "", "detail": 0, "format": 0, "version": 1}], "direction": null}, {"type": "listitem", "value": 4, "format": "", "indent": 0, "version": 1, "children": [{"mode": "normal", "text": "Anyone assigned with onboard safety responsibilities", "type": "text", "style": "", "detail": 0, "format": 0, "version": 1}], "direction": null}], "listType": "bullet", "direction": null}, {"type": "paragraph", "format": "", "indent": 0, "version": 1, "children": [{"mode": "normal", "text": "📚 ", "type": "text", "style": "", "detail": 0, "format": 0, "version": 1}, {"mode": "normal", "text": "Course highlights:", "type": "text", "style": "", "detail": 0, "format": 1, "version": 1}], "direction": null, "textStyle": "", "textFormat": 0}, {"tag": "ul", "type": "list", "start": 1, "format": "", "indent": 0, "version": 1, "children": [{"type": "listitem", "value": 1, "format": "", "indent": 0, "version": 1, "children": [{"mode": "normal", "text": "Principles of fire prevention onboard ships", "type": "text", "style": "", "detail": 0, "format": 0, "version": 1}], "direction": null}, {"type": "listitem", "value": 2, "format": "", "indent": 0, "version": 1, "children": [{"mode": "normal", "text": "Fire detection and alarm systems", "type": "text", "style": "", "detail": 0, "format": 0, "version": 1}], "direction": null}, {"type": "listitem", "value": 3, "format": "", "indent": 0, "version": 1, "children": [{"mode": "normal", "text": "Types of shipboard fires and extinguishing methods", "type": "text", "style": "", "detail": 0, "format": 0, "version": 1}], "direction": null}, {"type": "listitem", "value": 4, "format": "", "indent": 0, "version": 1, "children": [{"mode": "normal", "text": "Proper use of fire-fighting equipment", "type": "text", "style": "", "detail": 0, "format": 0, "version": 1}], "direction": null}, {"type": "listitem", "value": 5, "format": "", "indent": 0, "version": 1, "children": [{"mode": "normal", "text": "Emergency procedures and evacuation drills", "type": "text", "style": "", "detail": 0, "format": 0, "version": 1}], "direction": null}, {"type": "listitem", "value": 6, "format": "", "indent": 0, "version": 1, "children": [{"mode": "normal", "text": "Practical fire-fighting exercises", "type": "text", "style": "", "detail": 0, "format": 0, "version": 1}], "direction": null}], "listType": "bullet", "direction": null}, {"type": "paragraph", "format": "", "indent": 0, "version": 1, "children": [{"mode": "normal", "text": "📅 Schedule and enrollment details will be announced soon.", "type": "text", "style": "", "detail": 0, "format": 0, "version": 1}], "direction": null, "textStyle": "", "textFormat": 0}, {"type": "paragraph", "format": "", "indent": 0, "version": 1, "children": [{"mode": "normal", "text": "For inquiries and reservations, please contact the training coordinator or the maritime training office.", "type": "text", "style": "", "detail": 0, "format": 0, "version": 1}, {"type": "linebreak", "version": 1}, {"alt": "main-uploads/pdfexample_1775911961167.pdf", "url": "https://res.cloudinary.com/dpdkfg8qu/image/upload/v1775911964/main-uploads/pdfexample_1775911961167.pdf.pdf", "type": "course-image", "version": 1, "mimeType": "application/pdf"}, {"alt": "main-uploads/sdfsf.pptx_1775909886898.ppt", "url": "https://res.cloudinary.com/dpdkfg8qu/raw/upload/v1775909890/main-uploads/sdfsf.pptx_1775909886898.ppt", "type": "course-image", "version": 1, "mimeType": "application/vnd.ms-powerpoint"}], "direction": null, "textStyle": "", "textFormat": 0}, {"src": "https://docs.google.com/presentation/d/e/2PACX-1vRzTYMK-3vd1P9BC_2eSRm1eL-aGQPyBqV0sh-J3s_EJU3AbJe-vfKxxsFx-03d0e7dx67tOA85ewHf/pubembed?start=false&loop=false&delayms=3000", "type": "iframe", "width": "1280", "height": "749", "version": 1}], "direction": "ltr"}}	f	2026-04-11 13:50:30.69+00	\N	1	2026-04-11 13:56:22.836+00	2026-04-11 13:50:30.692+00
\.


--
-- Data for Name: course_modules; Type: TABLE DATA; Schema: public; Owner: -
--

COPY "public"."course_modules" ("id", "title", "release_at", "updated_at", "created_at", "description") FROM stdin;
3	Health, Safety, and Compliance	\N	2026-04-10 12:50:44.143+00	2026-04-10 11:11:23.222+00	{"root": {"type": "root", "format": "", "indent": 0, "version": 1, "children": [{"type": "paragraph", "format": "", "indent": 0, "version": 1, "children": [{"mode": "normal", "text": "The final module addresses medical care on board and the mechanisms used to enforce these rights globally.", "type": "text", "style": "", "detail": 0, "format": 0, "version": 1}], "direction": "ltr", "textStyle": "", "textFormat": 0}, {"tag": "ul", "type": "list", "start": 1, "format": "", "indent": 0, "version": 1, "children": [{"type": "listitem", "value": 1, "format": "", "indent": 0, "version": 1, "children": [{"mode": "normal", "text": "Medical Care and Shipowner Liability:", "type": "text", "style": "", "detail": 0, "format": 1, "version": 1}], "direction": "ltr", "textFormat": 1}, {"type": "listitem", "value": 2, "format": "", "indent": 0, "version": 1, "children": [{"tag": "ul", "type": "list", "start": 1, "format": "", "indent": 0, "version": 1, "children": [{"type": "listitem", "value": 1, "format": "", "indent": 1, "version": 1, "children": [{"mode": "normal", "text": "Right to prompt medical at sea and in port, generally at no cost to the seafarer.", "type": "text", "style": "", "detail": 0, "format": 0, "version": 1}], "direction": "ltr"}, {"type": "listitem", "value": 2, "format": "", "indent": 1, "version": 1, "children": [{"mode": "normal", "text": "Financial protections for work-related injury, illness, or death.", "type": "text", "style": "", "detail": 0, "format": 0, "version": 1}], "direction": "ltr"}], "listType": "bullet", "direction": "ltr"}], "direction": "ltr"}, {"type": "listitem", "value": 2, "format": "", "indent": 0, "version": 1, "children": [{"mode": "normal", "text": "Health and Safety Protection:", "type": "text", "style": "", "detail": 0, "format": 1, "version": 1}], "direction": "ltr", "textFormat": 1}, {"type": "listitem", "value": 3, "format": "", "indent": 0, "version": 1, "children": [{"tag": "ul", "type": "list", "start": 1, "format": "", "indent": 0, "version": 1, "children": [{"type": "listitem", "value": 1, "format": "", "indent": 1, "version": 1, "children": [{"mode": "normal", "text": "Onboard programs for accident prevention and occupational health.", "type": "text", "style": "", "detail": 0, "format": 0, "version": 1}], "direction": "ltr"}, {"type": "listitem", "value": 2, "format": "", "indent": 1, "version": 1, "children": [{"mode": "normal", "text": "The role of the Safety Committee on vessels.", "type": "text", "style": "", "detail": 0, "format": 0, "version": 1}], "direction": "ltr"}], "listType": "bullet", "direction": "ltr"}], "direction": "ltr"}, {"type": "listitem", "value": 3, "format": "", "indent": 0, "version": 1, "children": [{"mode": "normal", "text": "Complaints and Enforcement:", "type": "text", "style": "", "detail": 0, "format": 1, "version": 1}], "direction": "ltr", "textFormat": 1}, {"type": "listitem", "value": 4, "format": "", "indent": 0, "version": 1, "children": [{"tag": "ul", "type": "list", "start": 1, "format": "", "indent": 0, "version": 1, "children": [{"type": "listitem", "value": 1, "format": "", "indent": 1, "version": 1, "children": [{"mode": "normal", "text": "On-board Complaint Procedures:", "type": "text", "style": "", "detail": 0, "format": 1, "version": 1}, {"mode": "normal", "text": " The right to file a grievance without fear of victimization.", "type": "text", "style": "", "detail": 0, "format": 0, "version": 1}], "direction": "ltr", "textFormat": 1}, {"type": "listitem", "value": 2, "format": "", "indent": 1, "version": 1, "children": [{"mode": "normal", "text": "Port State Control (PSC):", "type": "text", "style": "", "detail": 0, "format": 1, "version": 1}, {"mode": "normal", "text": " How authorities inspect foreign ships to ensure MLC compliance.", "type": "text", "style": "", "detail": 0, "format": 0, "version": 1}], "direction": "ltr", "textFormat": 1}, {"type": "listitem", "value": 3, "format": "", "indent": 1, "version": 1, "children": [{"mode": "normal", "text": "Flag State Responsibility:", "type": "text", "style": "", "detail": 0, "format": 1, "version": 1}, {"mode": "normal", "text": " The obligation of the country where the ship is registered to enforce these standards. ", "type": "text", "style": "", "detail": 0, "format": 0, "version": 1}], "direction": "ltr", "textFormat": 1}], "listType": "bullet", "direction": "ltr", "textFormat": 1}], "direction": "ltr", "textFormat": 1}], "listType": "bullet", "direction": "ltr", "textFormat": 1}], "direction": "ltr", "textFormat": 1}}
2	Living Conditions and Social Protections	\N	2026-04-10 12:50:55.221+00	2026-04-10 11:10:52.096+00	{"root": {"type": "root", "format": "", "indent": 0, "version": 1, "children": [{"type": "paragraph", "format": "", "indent": 0, "version": 1, "children": [{"mode": "normal", "text": "This module focuses on the \\"human element\\" of life at sea, ensuring that the ship environment supports health and well-being.", "type": "text", "style": "", "detail": 0, "format": 0, "version": 1}], "direction": "ltr", "textStyle": "", "textFormat": 0}, {"tag": "ul", "type": "list", "start": 1, "format": "", "indent": 0, "version": 1, "children": [{"type": "listitem", "value": 1, "format": "", "indent": 0, "version": 1, "children": [{"mode": "normal", "text": "Accommodation and Recreational Facilities:", "type": "text", "style": "", "detail": 0, "format": 1, "version": 1}], "direction": "ltr", "textFormat": 1}, {"type": "listitem", "value": 2, "format": "", "indent": 0, "version": 1, "children": [{"tag": "ul", "type": "list", "start": 1, "format": "", "indent": 0, "version": 1, "children": [{"type": "listitem", "value": 1, "format": "", "indent": 1, "version": 1, "children": [{"mode": "normal", "text": "Standards for cabin size, heating, ventilation, and sanitary facilities.", "type": "text", "style": "", "detail": 0, "format": 0, "version": 1}], "direction": "ltr"}, {"type": "listitem", "value": 2, "format": "", "indent": 1, "version": 1, "children": [{"mode": "normal", "text": "Requirements for noise and vibration insulation to prevent fatigue.", "type": "text", "style": "", "detail": 0, "format": 0, "version": 1}], "direction": "ltr"}], "listType": "bullet", "direction": "ltr"}], "direction": "ltr"}, {"type": "listitem", "value": 2, "format": "", "indent": 0, "version": 1, "children": [{"mode": "normal", "text": "Food and Catering:", "type": "text", "style": "", "detail": 0, "format": 1, "version": 1}], "direction": "ltr", "textFormat": 1}, {"type": "listitem", "value": 3, "format": "", "indent": 0, "version": 1, "children": [{"tag": "ul", "type": "list", "start": 1, "format": "", "indent": 0, "version": 1, "children": [{"type": "listitem", "value": 1, "format": "", "indent": 1, "version": 1, "children": [{"mode": "normal", "text": "Mandatory provision of free, nutritious food and drinking water.", "type": "text", "style": "", "detail": 0, "format": 0, "version": 1}], "direction": "ltr"}, {"type": "listitem", "value": 2, "format": "", "indent": 1, "version": 1, "children": [{"mode": "normal", "text": "Requirement for trained cooks and hygienic galley conditions.", "type": "text", "style": "", "detail": 0, "format": 0, "version": 1}], "direction": "ltr"}], "listType": "bullet", "direction": "ltr"}], "direction": "ltr"}, {"type": "listitem", "value": 3, "format": "", "indent": 0, "version": 1, "children": [{"mode": "normal", "text": "Repatriation:", "type": "text", "style": "", "detail": 0, "format": 1, "version": 1}], "direction": "ltr", "textFormat": 1}, {"type": "listitem", "value": 4, "format": "", "indent": 0, "version": 1, "children": [{"tag": "ul", "type": "list", "start": 1, "format": "", "indent": 0, "version": 1, "children": [{"type": "listitem", "value": 1, "format": "", "indent": 1, "version": 1, "children": [{"mode": "normal", "text": "Conditions under which seafarers are entitled to free passage home (e.g., contract expiry, illness, or ship shipwreck).", "type": "text", "style": "", "detail": 0, "format": 0, "version": 1}], "direction": "ltr"}, {"type": "listitem", "value": 2, "format": "", "indent": 1, "version": 1, "children": [{"mode": "normal", "text": "Shipowners' prohibition from requiring a \\"deposit\\" for repatriation at the start of employment. ", "type": "text", "style": "", "detail": 0, "format": 0, "version": 1}], "direction": "ltr"}], "listType": "bullet", "direction": "ltr"}], "direction": "ltr"}], "listType": "bullet", "direction": "ltr"}], "direction": "ltr"}}
1	Fundamental Rights and Employment Conditions	\N	2026-04-17 13:13:39.284+00	2026-04-10 11:10:21.056+00	{"root": {"type": "root", "format": "", "indent": 0, "version": 1, "children": [{"type": "paragraph", "format": "", "indent": 0, "version": 1, "children": [{"mode": "normal", "text": "This module covers the core requirements for entering the maritime workforce and the legal standards for employment agreements.", "type": "text", "style": "", "detail": 0, "format": 0, "version": 1}], "direction": "ltr", "textStyle": "", "textFormat": 0}, {"tag": "ul", "type": "list", "start": 1, "format": "", "indent": 0, "version": 1, "children": [{"type": "listitem", "value": 1, "format": "", "indent": 0, "version": 1, "children": [{"mode": "normal", "text": "Minimum Requirements for Seafarers:", "type": "text", "style": "", "detail": 0, "format": 1, "version": 1}], "direction": "ltr", "textFormat": 1}, {"type": "listitem", "value": 2, "format": "", "indent": 0, "version": 1, "children": [{"tag": "ul", "type": "list", "start": 1, "format": "", "indent": 0, "version": 1, "children": [{"type": "listitem", "value": 1, "format": "", "indent": 1, "version": 1, "children": [{"mode": "normal", "text": "Age:", "type": "text", "style": "", "detail": 0, "format": 1, "version": 1}, {"mode": "normal", "text": " Minimum age (16) and restrictions on night work or hazardous tasks for those under 18.", "type": "text", "style": "", "detail": 0, "format": 0, "version": 1}], "direction": "ltr", "textFormat": 1}, {"type": "listitem", "value": 2, "format": "", "indent": 1, "version": 1, "children": [{"mode": "normal", "text": "Medical Certification:", "type": "text", "style": "", "detail": 0, "format": 1, "version": 1}, {"mode": "normal", "text": " Requirements for valid medical certificates issued by recognized practitioners.", "type": "text", "style": "", "detail": 0, "format": 0, "version": 1}], "direction": "ltr", "textFormat": 1}, {"type": "listitem", "value": 3, "format": "", "indent": 1, "version": 1, "children": [{"mode": "normal", "text": "Training:", "type": "text", "style": "", "detail": 0, "format": 1, "version": 1}, {"mode": "normal", "text": " Necessity of STCW (Standards of Training, Certification, and Watchkeeping) compliance.", "type": "text", "style": "", "detail": 0, "format": 0, "version": 1}], "direction": "ltr", "textFormat": 1}], "listType": "bullet", "direction": "ltr"}], "direction": "ltr"}, {"type": "listitem", "value": 2, "format": "", "indent": 0, "version": 1, "children": [{"mode": "normal", "text": "Seafarers’ Employment Agreements (SEA):", "type": "text", "style": "", "detail": 0, "format": 1, "version": 1}], "direction": "ltr", "textFormat": 1}, {"type": "listitem", "value": 3, "format": "", "indent": 0, "version": 1, "children": [{"tag": "ul", "type": "list", "start": 1, "format": "", "indent": 0, "version": 1, "children": [{"type": "listitem", "value": 1, "format": "", "indent": 1, "version": 1, "children": [{"mode": "normal", "text": "Mandatory elements of a contract (wages, leave, termination notice).", "type": "text", "style": "", "detail": 0, "format": 0, "version": 1}], "direction": "ltr"}, {"type": "listitem", "value": 2, "format": "", "indent": 1, "version": 1, "children": [{"mode": "normal", "text": "The right to review and seek advice on an agreement before signing.", "type": "text", "style": "", "detail": 0, "format": 0, "version": 1}], "direction": "ltr"}], "listType": "bullet", "direction": "ltr"}], "direction": "ltr"}, {"type": "listitem", "value": 3, "format": "", "indent": 0, "version": 1, "children": [{"mode": "normal", "text": "Wages and Leave:", "type": "text", "style": "", "detail": 0, "format": 1, "version": 1}], "direction": "ltr", "textFormat": 1}, {"type": "listitem", "value": 4, "format": "", "indent": 0, "version": 1, "children": [{"tag": "ul", "type": "list", "start": 1, "format": "", "indent": 0, "version": 1, "children": [{"type": "listitem", "value": 1, "format": "", "indent": 1, "version": 1, "children": [{"mode": "normal", "text": "Regulation of payment intervals and the right to transfer earnings to families.", "type": "text", "style": "", "detail": 0, "format": 0, "version": 1}], "direction": "ltr"}, {"type": "listitem", "value": 2, "format": "", "indent": 1, "version": 1, "children": [{"mode": "normal", "text": "Calculation of paid annual leave (minimum 2.5 days per month of employment). ", "type": "text", "style": "", "detail": 0, "format": 0, "version": 1}], "direction": "ltr"}], "listType": "bullet", "direction": "ltr"}], "direction": "ltr"}], "listType": "bullet", "direction": "ltr"}], "direction": "ltr"}}
\.


--
-- Data for Name: assessments; Type: TABLE DATA; Schema: public; Owner: -
--

COPY "public"."assessments" ("id", "title", "module_id", "assessment_type", "passing_score", "max_attempts", "time_limit_minutes", "updated_at", "created_at", "course_id", "description", "show_correct_answer") FROM stdin;
1	Fundamental Rights and Employment Conditions	1	quiz	70	1	\N	2026-04-10 12:37:52.228+00	2026-04-10 12:37:31.054+00	\N	{"root": {"type": "root", "format": "", "indent": 0, "version": 1, "children": [{"type": "paragraph", "format": "", "indent": 0, "version": 1, "children": [{"mode": "normal", "text": "Test your knowledge on the essential MLC standards for entering the maritime workforce and the legalities of employment.", "type": "text", "style": "", "detail": 0, "format": 0, "version": 1}], "direction": "ltr", "textStyle": "", "textFormat": 0}], "direction": "ltr"}}	t
2	Living Conditions and Social Protections	2	exam	70	1	\N	2026-04-10 12:40:55.302+00	2026-04-10 12:40:55.302+00	\N	{"root": {"type": "root", "format": "", "indent": 0, "version": 1, "children": [{"type": "paragraph", "format": "", "indent": 0, "version": 1, "children": [{"mode": "normal", "text": "Test your knowledge on the standards that govern your \\"home away from home\\" and the safety nets provided by the MLC.", "type": "text", "style": "", "detail": 0, "format": 0, "version": 1}], "direction": "ltr", "textStyle": "", "textFormat": 0}], "direction": "ltr"}}	f
3	Health, Safety, and Compliance	3	quiz	70	1	\N	2026-04-10 12:42:24.824+00	2026-04-10 12:42:24.824+00	\N	{"root": {"type": "root", "format": "", "indent": 0, "version": 1, "children": [{"type": "paragraph", "format": "", "indent": 0, "version": 1, "children": [{"mode": "normal", "text": "This final quiz focuses on the safety net of the MLC—ensuring you are cared for during illness and that your rights are strictly enforced by international authorities.", "type": "text", "style": "", "detail": 0, "format": 0, "version": 1}], "direction": "ltr", "textStyle": "", "textFormat": 0}], "direction": "ltr"}}	f
4	Final Exam	\N	final_exam	70	1	\N	2026-04-10 12:46:28.259+00	2026-04-10 12:44:36.908+00	10	{"root": {"type": "root", "format": "", "indent": 0, "version": 1, "children": [{"type": "paragraph", "format": "", "indent": 0, "version": 1, "children": [{"mode": "normal", "text": "The ", "type": "text", "style": "", "detail": 0, "format": 0, "version": 1}, {"mode": "normal", "text": "MLC 2006 Comprehensive Final Exam", "type": "text", "style": "", "detail": 0, "format": 1, "version": 1}, {"mode": "normal", "text": " is designed to evaluate your mastery of the \\"Seafarers' Bill of Rights.\\" It transitions from theoretical knowledge to practical application, ensuring you can identify violations and understand your legal protections in real-world maritime scenarios.", "type": "text", "style": "", "detail": 0, "format": 0, "version": 1}], "direction": "ltr", "textStyle": "", "textFormat": 0}], "direction": "ltr"}}	t
\.


--
-- Data for Name: coupon_codes; Type: TABLE DATA; Schema: public; Owner: -
--

COPY "public"."coupon_codes" ("id", "code", "name", "description", "status", "starts_at", "expires_at", "discount_type", "amount", "max_discount_amount", "scope_type", "exclude_sale_courses", "minimum_amount", "maximum_amount", "usage_limit_total", "usage_limit_per_user", "max_items_affected", "stackable", "priority", "usage_count", "last_used_at", "metadata", "updated_at", "created_at") FROM stdin;
1	WELCOME10	Welcome Campaign	Introductory discount for new enrollments	active	\N	\N	percent	10	\N	all_courses	f	0	\N	\N	1	\N	f	100	0	\N	\N	2026-05-19 09:10:20.011+00	2026-05-19 09:10:20.011+00
\.


--
-- Data for Name: trainees; Type: TABLE DATA; Schema: public; Owner: -
--

COPY "public"."trainees" ("id", "user_id", "updated_at", "created_at", "enrollment_date", "current_level", "srn", "coupon_code") FROM stdin;
4	11	2026-05-08 07:49:32.924+00	2026-05-08 07:49:33.043+00	\N	standard	SRN-343	
5	12	2026-05-09 01:30:34.869+00	2026-05-09 01:30:33.988+00	\N	standard	9203050090	
2	2	2026-05-19 07:45:58.757+00	2026-04-05 05:54:01.857+00	\N	standard	TRN-2-2026	GRANDLINEPROMO01
\.


--
-- Data for Name: course_enrollments; Type: TABLE DATA; Schema: public; Owner: -
--

COPY "public"."course_enrollments" ("id", "student_id", "course_id", "enrolled_at", "enrollment_type", "status", "payment_status", "access_expires_at", "amount_paid", "progress_percentage", "last_accessed_at", "completed_at", "current_grade", "final_grade", "certificate_issued", "enrolled_by_id", "notes", "display_title", "metadata", "updated_at", "created_at", "final_evaluation", "coupon_id", "coupon_code", "coupon_discount_amount", "list_price_snapshot", "final_price_snapshot", "pricing_breakdown") FROM stdin;
55	2	12	2026-05-19 10:44:51.056+00	paid	pending	pending	\N	0	0	\N	\N	\N	\N	f	\N	Created from self-service enrollment request flow.	Student 2 - Course 12	{"source": "lms-enrollment-request", "requestChannel": "view-course-request-enrollment", "requestedByUserId": 2, "requestSubmittedAt": "2026-05-19T10:44:51.056Z"}	2026-05-19 10:44:51.125+00	2026-05-19 10:44:51.125+00	\N	1	WELCOME10	500	5000	4500	{"currency": "PHP", "finalPrice": 4500, "calculatedAt": "2026-05-19T10:44:51.056Z", "originalPrice": 5000, "couponDiscount": 500, "effectivePrice": 5000, "courseSalePrice": null, "couponDiscountType": "percent", "couponDiscountValue": 10, "couponMaxDiscountAmount": null}
56	2	11	2026-05-19 10:47:03.992+00	free	active	completed	\N	\N	0	\N	\N	\N	\N	f	\N	\N	Student 2 - Course 11	\N	2026-05-19 10:47:12.175+00	2026-05-19 10:47:12.175+00	\N	\N	\N	0	\N	\N	\N
59	2	1	2026-05-19 11:03:16.68+00	paid	pending	pending	\N	0	0	\N	\N	\N	\N	f	\N	Created from self-service enrollment request flow.	Student 2 - Course 1	{"source": "lms-enrollment-request", "requestChannel": "view-course-request-enrollment", "requestedByUserId": 2, "requestSubmittedAt": "2026-05-19T11:03:16.680Z"}	2026-05-19 11:03:16.746+00	2026-05-19 11:03:16.745+00	\N	1	WELCOME10	500	5000	4500	{"currency": "PHP", "finalPrice": 4500, "calculatedAt": "2026-05-19T11:03:16.680Z", "originalPrice": 5000, "couponDiscount": 500, "effectivePrice": 5000, "courseSalePrice": null, "couponDiscountType": "percent", "couponDiscountValue": 10, "couponMaxDiscountAmount": null}
5	2	7	2026-04-12 12:38:58.893+00	free	pending	completed	\N	\N	0	\N	\N	\N	\N	f	\N	\N	Student 2 - Course 7	\N	2026-04-12 12:39:09.394+00	2026-04-12 12:39:09.393+00	\N	\N	\N	0	\N	\N	\N
6	2	9	2026-04-12 12:41:55.598+00	free	suspended	completed	\N	\N	0	\N	\N	\N	\N	f	\N	\N	Student 2 - Course 9	\N	2026-04-12 12:42:07.855+00	2026-04-12 12:42:07.855+00	\N	\N	\N	0	\N	\N	\N
60	2	4	2026-05-19 16:08:31.347+00	paid	pending	pending	\N	0	0	\N	\N	\N	\N	f	\N	Created from self-service enrollment request flow.	Student 2 - Course 4	{"source": "lms-enrollment-request", "requestChannel": "view-course-request-enrollment", "requestedByUserId": 2, "requestSubmittedAt": "2026-05-19T16:08:31.347Z"}	2026-05-19 16:08:31.352+00	2026-05-19 16:08:31.352+00	\N	\N	\N	0	5000	5000	{"currency": "PHP", "finalPrice": 5000, "calculatedAt": "2026-05-19T16:08:31.347Z", "originalPrice": 5000, "couponDiscount": 0, "effectivePrice": 5000, "courseSalePrice": null, "couponDiscountType": null, "couponDiscountValue": null, "couponMaxDiscountAmount": null}
7	2	11	2026-04-12 12:44:24.899+00	free	dropped	completed	\N	\N	100	\N	\N	\N	\N	f	\N	\N	Student 2 - Course 11	\N	2026-04-16 15:24:23.059+00	2026-04-12 12:44:35.609+00	\N	\N	\N	0	\N	\N	\N
1	2	10	2026-04-10 12:48:37.659+00	paid	completed	completed	\N	\N	100	\N	2026-04-10 12:57:17.001+00	\N	94	t	\N	\N	Student 2 - Course 10	\N	2026-05-20 00:04:28.516+00	2026-04-10 12:49:03.581+00	passed	\N	\N	0	\N	\N	\N
2	2	2	2026-04-11 02:50:03.009+00	free	active	completed	2026-04-15 16:00:00+00	\N	0	\N	\N	100	\N	f	\N	\N	Student 2 - Course 2	\N	2026-05-20 02:35:09.864+00	2026-04-11 02:50:15.411+00	\N	\N	\N	0	\N	\N	\N
61	2	5	2026-05-21 12:30:59.95+00	free	pending	not_required	\N	0	0	\N	\N	\N	\N	f	\N	Created from self-service enrollment request flow.	Student 2 - Course 5	{"source": "lms-enrollment-request", "requestChannel": "view-course-request-enrollment", "requestedByUserId": 2, "requestSubmittedAt": "2026-05-21T12:30:59.950Z"}	2026-05-21 12:31:00.017+00	2026-05-21 12:31:00.016+00	\N	\N	\N	0	0	0	{"currency": "PHP", "finalPrice": 0, "calculatedAt": "2026-05-21T12:30:59.950Z", "originalPrice": 0, "couponDiscount": 0, "effectivePrice": 0, "courseSalePrice": null, "couponDiscountType": null, "couponDiscountValue": null, "couponMaxDiscountAmount": null}
3	2	6	2026-04-12 11:40:14.569+00	free	completed	completed	\N	\N	100	\N	2026-04-12 12:33:16.932+00	\N	92.3	f	\N	\N	Student 2 - Course 6	\N	2026-04-24 14:56:11.395+00	2026-04-12 11:40:32.879+00	failed	\N	\N	0	\N	\N	\N
\.


--
-- Data for Name: assessment_submissions; Type: TABLE DATA; Schema: public; Owner: -
--

COPY "public"."assessment_submissions" ("id", "trainee_id", "enrollment_id", "assessment_id", "course_id", "status", "attempt_number", "score", "points_total", "points_possible", "passing_score_snapshot", "started_at", "completed_at", "is_latest", "updated_at", "created_at", "is_feedback_read") FROM stdin;
4	2	1	4	10	submitted	1	73.33333333333333	11	15	70	2026-04-10 12:56:06.801+00	2026-04-10 12:56:58.621+00	t	2026-04-21 12:29:29.061+00	2026-04-10 12:56:06.946+00	f
2	2	1	2	10	submitted	1	80	4	5	70	2026-04-10 12:54:56.784+00	2026-04-10 12:55:10.979+00	t	2026-04-21 12:29:29.163+00	2026-04-10 12:54:56.963+00	f
3	2	1	3	10	submitted	1	0	0	5	70	2026-04-10 12:55:37.411+00	2026-04-10 12:55:49.483+00	t	2026-04-21 12:29:29.255+00	2026-04-10 12:55:37.595+00	f
5	2	2	1	2	submitted	1	40	2	5	70	2026-04-20 13:02:27.497+00	2026-04-20 13:02:45.549+00	t	2026-04-21 12:29:29.329+00	2026-04-20 13:02:27.649+00	f
1	2	1	1	10	submitted	1	80	4	5	70	2026-04-10 12:53:37.336+00	2026-04-10 12:53:55.14+00	t	2026-04-21 12:29:29.439+00	2026-04-10 12:53:37.517+00	f
\.


--
-- Data for Name: questions; Type: TABLE DATA; Schema: public; Owner: -
--

COPY "public"."questions" ("id", "prompt", "type", "explanation", "difficulty", "status", "updated_at", "created_at", "true_false_correct") FROM stdin;
1	According to the MLC, what is the absolute minimum age required for a person to be employed or work on board a ship?	single_choice	The MLC sets 16 as the global baseline to prevent child labor while allowing young people to start maritime careers.\nWhy not 15? International labor standards for "heavy" industries like shipping are stricter than general land-based work.\nWhy not 18? 18 is the age for "adult" responsibilities (like night work and hazardous duties), but the convention allows for apprenticeship and entry-level roles to begin at 16. 	medium	active	2026-04-10 11:34:35.677+00	2026-04-10 11:33:59.032+00	\N
2	A medical certificate for a 25-year-old seafarer is generally valid for a maximum period of how many years?	single_choice	Standardization of medical fitness ensures that no one is at sea with a ticking time bomb of a health condition.\nThe Logic: A 2-year window is the compromise between ensuring health and not over-burdening seafarers with constant doctor visits.\nExceptions: If you are under 18, the limit is 1 year because your body is still developing. Color vision certificates last 6 years because that specific trait rarely changes in adults.	medium	active	2026-04-10 11:36:39.351+00	2026-04-10 11:35:53.657+00	\N
3	Under the MLC, which of the following are mandatory requirements for onboard food and catering? (Select all that apply)	multiple_choice	The MLC is very strict about basic needs. A is correct because food is a right, not a benefit. B is a specific technical requirement for larger crews to ensure food safety and health. C ensures that food isn't just "available" but actually supports the crew's health. D is incorrect because drinking water, like food, must be provided free of charge at all times.	medium	active	2026-04-10 11:42:35.045+00	2026-04-10 11:39:54.413+00	\N
4	In which scenarios is a seafarer entitled to repatriation at no cost to themselves? (Select all that apply)	multiple_choice	These are the "default" protections. A is the standard end-of-contract right. B is a medical necessity protection. C is a safeguard against seafarer abandonment (further reinforced by mandatory shipowner insurance). D is incorrect because "early vacation" is usually a personal choice that falls outside the mandatory repatriation triggers, unless specified otherwise in a private contract.	medium	active	2026-04-10 11:42:48.088+00	2026-04-10 11:41:52.411+00	\N
5	Shipowners are permitted to require seafarers to pay a financial deposit at the start of their employment to cover the potential costs of returning home (repatriation).	true_false	MLC Standard A2.5, shipowners are strictly prohibited from requiring a seafarer to pay for the cost of repatriation in advance, nor can they recover the cost from the seafarer's wages except in cases where the seafarer has been found in serious default of their employment obligations.	medium	active	2026-04-10 11:46:55.616+00	2026-04-10 11:46:55.616+00	false
6	On a vessel with a crew of 12 people, who is legally required to be on board to manage food services?	single_choice	Standard A3.2 states that ships with a crew of 10 or more must carry a qualified ship's cook who has completed a training course approved by the competent authority.	medium	active	2026-04-10 12:05:08.448+00	2026-04-10 12:05:08.447+00	\N
7	What is the MLC requirement regarding the cost of food and drinking water for seafarers on board?	single_choice	The MLC is clear that food and water are basic human rights at sea. They must be provided free of charge to the seafarer while they are on board or during the period of engagement.	medium	active	2026-04-10 12:06:09.323+00	2026-04-10 12:06:09.323+00	\N
8	Which of the following amenities are considered "recreational facilities" that shipowners should provide to support mental health? (Select all that apply)	multiple_choice	C, B, and A are specifically listed in the MLC Guidelines as ways to reduce the isolation of life at sea. D is incorrect because while the MLC encourages "reasonable" and "inexpensive" internet access, it does not mandate "high-speed" or "unlimited" services.	medium	active	2026-04-10 12:16:04.598+00	2026-04-10 12:12:55.236+00	\N
9	A seafarer is entitled to repatriation at the shipowner’s expense if: (Select all that apply)	multiple_choice	These are standard triggers for repatriation. Even if a seafarer is terminated for a valid reason (B), the shipowner is still generally responsible for returning them to their home, though they may seek to recover costs later depending on the contract. D is incorrect as personal social events do not trigger mandatory repatriation.	medium	active	2026-04-10 12:17:37.808+00	2026-04-10 12:17:19.349+00	\N
10	The MLC requires that sleeping rooms on ships must be situated above the load line and, whenever possible, amidships or aft.	true_false	This is a structural requirement to ensure crew safety and comfort. Placing cabins above the load line and away from the extreme "pounding" of the bow (front) of the ship helps prevent fatigue and ensures better drainage and ventilation.	medium	active	2026-04-10 12:18:47.645+00	2026-04-10 12:18:47.645+00	true
11	If a seafarer is injured while serving on board, how much of the medical and hospitalization costs is the shipowner required to cover?	single_choice	Under the principle of Shipowner Liability, the employer is responsible for all medical expenses related to sickness or injury occurring between the date of commencement of duty and the date the seafarer is deemed repatriated.	medium	active	2026-04-10 12:23:44.373+00	2026-04-10 12:23:44.373+00	\N
12	A ship is required to carry a qualified medical doctor on board if it has 100 or more people and is on an international voyage lasting more than:	single_choice	Standard A4.1 specifies that ships carrying 100 or more persons and ordinarily engaged on international voyages of more than three days must carry a qualified medical doctor.	medium	active	2026-04-10 12:27:40.505+00	2026-04-10 12:25:48.2+00	\N
13	Which of the following are part of the "Three Pillars" of MLC enforcement and compliance? (Select all that apply)	multiple_choice	Flag State inspections ensure the ship meets its own country's laws; Port State Control allows foreign countries to verify compliance; and the DMLC is the actual document that proves how the ship complies. Family members (C) have no legal enforcement role under the MLC.	medium	active	2026-04-10 12:32:22.178+00	2026-04-10 12:32:00.826+00	\N
14	What are the requirements for a Shipboard Safety Committee? (Select all that apply)	multiple_choice	These committees ensure that safety isn't just "top-down" but includes the people actually doing the work. C is incorrect because committees must meet regularly (usually monthly) to effectively monitor safety, not just once a year.	medium	active	2026-04-10 12:33:47.701+00	2026-04-10 12:33:47.7+00	\N
15	A seafarer can be legally dismissed or penalized by a shipowner for filing a complaint regarding a violation of MLC rights, provided the shipowner gives 30 days' notice.	true_false	The MLC explicitly prohibits victimization. A seafarer has the right to file a complaint, and any retaliatory action by the shipowner or Master is a serious violation of the Convention.	medium	active	2026-04-10 12:34:28.908+00	2026-04-10 12:34:24.124+00	false
\.


--
-- Data for Name: assessments_items; Type: TABLE DATA; Schema: public; Owner: -
--

COPY "public"."assessments_items" ("_order", "_parent_id", "id", "question_id", "order", "points") FROM stdin;
1	1	69d8eec14932dc3bd348539c	1	\N	1
2	1	69d8eed84932dc3bd348539e	2	\N	1
3	1	69d8eee04932dc3bd34853a0	3	\N	1
4	1	69d8eefa4932dc3bd34853a2	4	\N	1
5	1	69d8eefe4932dc3bd34853a4	5	\N	1
1	2	69d8ef9a4932dc3bd34853a6	6	\N	1
2	2	69d8ef9f4932dc3bd34853a8	7	\N	1
3	2	69d8efb54932dc3bd34853aa	8	\N	1
4	2	69d8efc04932dc3bd34853ac	9	\N	1
5	2	69d8efca4932dc3bd34853ae	10	\N	1
1	3	69d8f0094932dc3bd34853b0	11	\N	1
2	3	69d8f00d4932dc3bd34853b2	12	\N	1
3	3	69d8f01b4932dc3bd34853b4	13	\N	1
4	3	69d8f0234932dc3bd34853b6	14	\N	1
5	3	69d8f02c4932dc3bd34853b8	15	\N	1
1	4	69d8f06e4932dc3bd34853ba	1	\N	1
2	4	69d8f0934932dc3bd34853bc	2	\N	1
3	4	69d8f0a04932dc3bd34853be	3	\N	1
4	4	69d8f0a44932dc3bd34853c0	4	\N	1
5	4	69d8f0b04932dc3bd34853c2	5	\N	1
6	4	69d8f0c04932dc3bd34853c4	6	\N	1
7	4	69d8f0c94932dc3bd34853c6	7	\N	1
8	4	69d8f0cd4932dc3bd34853c8	8	\N	1
9	4	69d8f0d94932dc3bd34853ca	9	\N	1
10	4	69d8f0e24932dc3bd34853cc	10	\N	1
11	4	69d8f0f74932dc3bd34853ce	11	\N	1
12	4	69d8f0fc4932dc3bd34853d0	12	\N	1
13	4	69d8f1044932dc3bd34853d2	13	\N	1
14	4	69d8f10f4932dc3bd34853d4	14	\N	1
15	4	69d8f1184932dc3bd34853d6	15	\N	1
\.


--
-- Data for Name: assignments; Type: TABLE DATA; Schema: public; Owner: -
--

COPY "public"."assignments" ("id", "title", "description", "max_score", "passing_score", "submission_type", "due_date", "updated_at", "created_at") FROM stdin;
1	This is an example assignment	{"root": {"type": "root", "format": "", "indent": 0, "version": 1, "children": [{"type": "paragraph", "format": "", "indent": 0, "version": 1, "children": [{"mode": "normal", "text": "Hello, this is an example assignment.", "type": "text", "style": "", "detail": 0, "format": 0, "version": 1}], "direction": "ltr", "textStyle": "", "textFormat": 0}], "direction": "ltr"}}	100	75	both	\N	2026-04-16 15:19:03.547+00	2026-04-16 15:18:01.228+00
2	Assignment 2	{"root": {"type": "root", "format": "", "indent": 0, "version": 1, "children": [{"type": "paragraph", "format": "", "indent": 0, "version": 1, "children": [{"mode": "normal", "text": "This is assignment 2", "type": "text", "style": "", "detail": 0, "format": 0, "version": 1}], "direction": "ltr", "textStyle": "", "textFormat": 0}], "direction": "ltr"}}	100	75	both	\N	2026-04-17 12:42:06.552+00	2026-04-17 12:42:06.551+00
3	Assignment 3	{"root": {"type": "root", "format": "", "indent": 0, "version": 1, "children": [{"type": "paragraph", "format": "", "indent": 0, "version": 1, "children": [{"mode": "normal", "text": "This is assignment 3", "type": "text", "style": "", "detail": 0, "format": 0, "version": 1}], "direction": "ltr", "textStyle": "", "textFormat": 0}], "direction": "ltr"}}	100	75	both	\N	2026-04-17 12:48:00.876+00	2026-04-17 12:48:00.876+00
4	Assignment 4	{"root": {"type": "root", "format": "", "indent": 0, "version": 1, "children": [{"type": "paragraph", "format": "", "indent": 0, "version": 1, "children": [{"mode": "normal", "text": "This is another assignment", "type": "text", "style": "", "detail": 0, "format": 0, "version": 1}], "direction": "ltr", "textStyle": "", "textFormat": 0}], "direction": "ltr"}}	100	75	both	\N	2026-04-17 12:59:32.45+00	2026-04-17 12:59:32.449+00
5	Assignment 5	\N	100	75	both	2026-04-14 16:00:00+00	2026-04-17 13:12:48.163+00	2026-04-17 13:12:26.872+00
\.


--
-- Data for Name: assignment_submissions; Type: TABLE DATA; Schema: public; Owner: -
--

COPY "public"."assignment_submissions" ("id", "assignment_id", "trainee_id", "enrollment_id", "status", "submitted_text", "score", "feedback", "submitted_at", "graded_at", "graded_by_id", "updated_at", "created_at", "is_feedback_read") FROM stdin;
1	1	2	2	submitted	{"root": {"type": "root", "format": "", "indent": 0, "version": 1, "children": [{"type": "paragraph", "format": "", "indent": 0, "version": 1, "children": [{"mode": "normal", "text": "Sample", "type": "text", "style": "", "detail": 0, "format": 0, "version": 1}]}]}}	\N	\N	2026-04-17 12:00:40.28+00	\N	\N	2026-04-17 12:00:40.514+00	2026-04-17 12:00:40.514+00	f
2	3	2	1	graded	{"root": {"type": "root", "format": "", "indent": 0, "version": 1, "children": [{"type": "paragraph", "format": "", "indent": 0, "version": 1, "children": [{"mode": "normal", "text": "Sample Assignment", "type": "text", "style": "", "detail": 0, "format": 0, "version": 1}]}]}}	100	\N	2026-04-17 12:50:27.395+00	\N	\N	2026-04-17 13:04:11.765+00	2026-04-17 12:50:27.542+00	f
4	5	2	1	graded	{"root": {"type": "root", "format": "", "indent": 0, "version": 1, "children": [{"type": "paragraph", "format": "", "indent": 0, "version": 1, "children": [{"mode": "normal", "text": "Another submission of assignment - 5", "type": "text", "style": "", "detail": 0, "format": 0, "version": 1}]}]}}	80	{"root": {"type": "root", "format": "", "indent": 0, "version": 1, "children": [{"type": "paragraph", "format": "", "indent": 0, "version": 1, "children": [{"mode": "normal", "text": "This is an example feedback for the assignment", "type": "text", "style": "", "detail": 0, "format": 0, "version": 1}], "direction": null, "textStyle": "", "textFormat": 0}], "direction": null}}	2026-04-17 13:14:30.73+00	\N	\N	2026-04-21 12:29:29.544+00	2026-04-17 13:14:30.878+00	f
3	4	2	1	returned_for_revision	{"root": {"type": "root", "format": "", "indent": 0, "version": 1, "children": [{"type": "paragraph", "format": "", "indent": 0, "version": 1, "children": [{"mode": "normal", "text": "Another submission", "type": "text", "style": "", "detail": 0, "format": 0, "version": 1}]}]}}	\N	{"root": {"type": "root", "format": "", "indent": 0, "version": 1, "children": [{"type": "paragraph", "format": "", "indent": 0, "version": 1, "children": [{"mode": "normal", "text": "This one sample", "type": "text", "style": "", "detail": 0, "format": 0, "version": 1}], "direction": null, "textStyle": "", "textFormat": 0}], "direction": null}}	2026-04-17 13:02:21.357+00	\N	\N	2026-04-21 12:29:29.739+00	2026-04-17 13:02:21.545+00	f
\.


--
-- Data for Name: assignment_submissions_rels; Type: TABLE DATA; Schema: public; Owner: -
--

COPY "public"."assignment_submissions_rels" ("id", "order", "parent_id", "path", "media_id") FROM stdin;
1	1	1	uploadedFiles	55
6	1	2	uploadedFiles	56
14	1	4	uploadedFiles	58
15	1	3	uploadedFiles	57
\.


--
-- Data for Name: assignments_allowed_file_types; Type: TABLE DATA; Schema: public; Owner: -
--

COPY "public"."assignments_allowed_file_types" ("order", "parent_id", "value", "id") FROM stdin;
1	1	images	1
1	2	images	2
1	4	images	3
1	5	images	5
\.


--
-- Data for Name: assignments_rels; Type: TABLE DATA; Schema: public; Owner: -
--

COPY "public"."assignments_rels" ("id", "order", "parent_id", "path", "media_id") FROM stdin;
1	1	1	attachments	4
2	1	2	attachments	26
3	1	3	attachments	26
4	1	4	attachments	6
6	1	5	attachments	4
\.


--
-- Data for Name: certificates; Type: TABLE DATA; Schema: public; Owner: -
--

COPY "public"."certificates" ("id", "certificate_code", "verification_url", "trainee_id", "course_id", "enrollment_id", "issue_date", "expiry_date", "file_id", "metadata", "status", "updated_at", "created_at") FROM stdin;
1	CERT-2026-BEFBDD66	\N	2	10	1	2026-04-10 13:04:52.993+00	\N	45	{"courseTitle": "Maritime Labour Convention (MLC) Rights", "studentName": "John Lloyd Callao", "completionDate": "4/10/2026", "instructorName": "Michael Lhayos"}	active	2026-04-10 13:04:53.057+00	2026-04-10 13:04:53.057+00
\.


--
-- Data for Name: chats; Type: TABLE DATA; Schema: public; Owner: -
--

COPY "public"."chats" ("id", "type", "title", "created_by_id", "last_message_at", "last_message_preview", "is_archived", "metadata", "updated_at", "created_at", "status") FROM stdin;
26	group	Modern Challenges in Maritime Security	2	2026-04-28 15:28:04.193+00	This is a new topic	f	{"status": "pending", "category": "maritime-security", "isDiscussionBoard": true}	2026-04-28 15:28:04.209+00	2026-04-22 14:03:10.352+00	active
23	instructor_trainee	This is a sample question subject	2	2026-04-22 13:13:36.35+00	This is then the response	f	{"status": "pending", "subject": "This is a sample question subject", "isAskInstructor": true}	2026-04-22 13:13:36.668+00	2026-04-22 13:12:52.011+00	active
24	instructor_trainee	A sample archived message	2	2026-04-22 13:44:04.012+00	Hello, this is a sample archived message	t	{"status": "pending", "subject": "A sample archived message", "isAskInstructor": true}	2026-04-22 13:44:48.104+00	2026-04-22 13:43:58.01+00	active
25	instructor_trainee	This is a sample pending message	2	2026-04-22 13:45:33.777+00	Hello, this is a sample pending message	f	{"status": "pending", "subject": "This is a sample pending message", "isAskInstructor": true}	2026-04-22 13:45:34.12+00	2026-04-22 13:45:30.555+00	active
27	group	Life at Sea – Expectations vs Reality	2	2026-04-28 14:28:18.415+00	Niceeee	f	{"status": "pending", "category": "general", "isDiscussionBoard": true}	2026-04-28 14:28:18.68+00	2026-04-22 14:05:21.529+00	active
\.


--
-- Data for Name: chat_messages; Type: TABLE DATA; Schema: public; Owner: -
--

COPY "public"."chat_messages" ("id", "chat_id", "sender_id", "content", "content_type", "reply_to_id", "edited_at", "is_deleted", "updated_at", "created_at") FROM stdin;
26	23	2	{"root": {"type": "root", "format": "", "indent": 0, "version": 1, "children": [{"type": "paragraph", "format": "", "indent": 0, "version": 1, "children": [{"mode": "normal", "text": "Hello, this is a sample question", "type": "text", "style": "", "detail": 0, "format": 0, "version": 1}]}]}}	text	\N	\N	f	2026-04-22 13:12:53.035+00	2026-04-22 13:12:53.034+00
27	23	4	{"root": {"type": "root", "format": "", "indent": 0, "version": 1, "children": [{"type": "paragraph", "format": "", "indent": 0, "version": 1, "children": [{"mode": "normal", "text": "This is then the response", "type": "text", "style": "", "detail": 0, "format": 0, "version": 1}], "direction": null, "textStyle": "", "textFormat": 0}], "direction": null}}	text	26	\N	f	2026-04-22 13:13:36.183+00	2026-04-22 13:13:36.183+00
28	24	2	{"root": {"type": "root", "format": "", "indent": 0, "version": 1, "children": [{"type": "paragraph", "format": "", "indent": 0, "version": 1, "children": [{"mode": "normal", "text": "Hello, this is a sample archived message", "type": "text", "style": "", "detail": 0, "format": 0, "version": 1}]}]}}	text	\N	\N	f	2026-04-22 13:44:02.119+00	2026-04-22 13:44:02.118+00
29	25	2	{"root": {"type": "root", "format": "", "indent": 0, "version": 1, "children": [{"type": "paragraph", "format": "", "indent": 0, "version": 1, "children": [{"mode": "normal", "text": "Hello, this is a sample pending message", "type": "text", "style": "", "detail": 0, "format": 0, "version": 1}]}]}}	text	\N	\N	f	2026-04-22 13:45:31.742+00	2026-04-22 13:45:31.742+00
30	26	2	{"root": {"type": "root", "format": "", "indent": 0, "version": 1, "children": [{"type": "paragraph", "format": "", "indent": 0, "version": 1, "children": [{"mode": "normal", "text": "📌 Discussion Topic: Modern Challenges in Maritime Security\\n\\nMaritime security plays a crucial role in protecting global trade, human lives, and national sovereignty. With increasing threats such as piracy, smuggling, cyberattacks on ships, and territorial disputes, maritime professionals must be prepared to respond effectively.\\n\\nGuide Questions:\\n\\nWhat do you think is the most serious maritime security threat today, and why?\\nHow can ship crews contribute to maintaining security while at sea?\\nIn what ways can technology (e.g., AIS, radar, cybersecurity systems) improve maritime security?\\nHow should international cooperation be strengthened to address maritime threats?\\n\\nInstructions:\\n\\nShare your insights in at least 150–200 words.\\nRespond to at least two classmates’ posts with constructive feedback.\\nSupport your answers with examples, experiences, or references when possible.\\n\\nObjective:\\nThis discussion aims to deepen your understanding of maritime security issues and encourage critical thinking on real-world challenges faced by maritime professionals.", "type": "text", "style": "", "detail": 0, "format": 0, "version": 1}]}]}}	text	\N	\N	f	2026-04-22 14:03:10.883+00	2026-04-22 14:03:10.883+00
31	26	2	{"root": {"type": "root", "format": "", "indent": 0, "version": 1, "children": [{"type": "paragraph", "format": "", "indent": 0, "version": 1, "children": [{"mode": "normal", "text": "In my opinion, one of the most serious maritime security threats today is piracy, especially in high-risk areas. It directly endangers the lives of seafarers and disrupts international trade. Even with modern security measures, pirates continue to adapt their tactics, making it a persistent concern.\\n\\nShip crews play a vital role in maintaining security by staying vigilant, following established protocols like the ISPS Code, and conducting regular drills. Simple actions such as proper watchkeeping and reporting suspicious activities can make a big difference.\\n\\nTechnology also greatly improves maritime security. Systems like AIS and radar help monitor vessel movements, while cybersecurity measures protect ships from digital threats, which are becoming more common as ships rely more on automated systems.\\n\\nLastly, international cooperation is essential. Countries must share information, conduct joint patrols, and enforce maritime laws consistently to effectively combat threats at sea.", "type": "text", "style": "", "detail": 0, "format": 0, "version": 1}]}]}}	text	\N	\N	f	2026-04-22 14:04:15.356+00	2026-04-22 14:04:15.356+00
32	27	2	{"root": {"type": "root", "format": "", "indent": 0, "version": 1, "children": [{"type": "paragraph", "format": "", "indent": 0, "version": 1, "children": [{"mode": "normal", "text": "Working at sea is often seen as exciting and rewarding, offering opportunities to travel and earn a stable income. However, the reality of maritime life includes long periods away from family, demanding workloads, and challenging environmental conditions.\\n\\nGuide Questions:\\n\\nBefore entering the maritime field, what were your expectations about life at sea?\\nHow do you think the reality of being a seafarer differs from those expectations?\\nWhat are the biggest challenges seafarers face in terms of mental health and well-being?\\nWhat strategies can help seafarers cope with stress and long periods away from home?\\n\\nInstructions:\\n\\nWrite at least 150–200 words.\\nShare honest thoughts, expectations, or experiences.\\nReply to at least two classmates with meaningful insights.\\n\\nObjective:\\nThis discussion aims to encourage reflection on the personal and professional aspects of maritime life, and to build awareness of the realities faced by seafarers.", "type": "text", "style": "", "detail": 0, "format": 0, "version": 1}]}]}}	text	\N	\N	f	2026-04-22 14:05:22.067+00	2026-04-22 14:05:22.067+00
33	27	2	{"root": {"type": "root", "format": "", "indent": 0, "version": 1, "children": [{"type": "paragraph", "format": "", "indent": 0, "version": 1, "children": [{"mode": "normal", "text": "Hello", "type": "text", "style": "", "detail": 0, "format": 0, "version": 1}]}]}}	text	\N	\N	f	2026-04-28 13:46:02.986+00	2026-04-28 13:46:02.985+00
34	27	2	{"root": {"type": "root", "format": "", "indent": 0, "version": 1, "children": [{"type": "paragraph", "format": "", "indent": 0, "version": 1, "children": [{"mode": "normal", "text": "Can I chat?", "type": "text", "style": "", "detail": 0, "format": 0, "version": 1}]}]}}	text	\N	\N	f	2026-04-28 13:47:09.387+00	2026-04-28 13:47:09.387+00
35	27	2	{"root": {"type": "root", "format": "", "indent": 0, "version": 1, "children": [{"type": "paragraph", "format": "", "indent": 0, "version": 1, "children": [{"mode": "normal", "text": "Is this real time?", "type": "text", "style": "", "detail": 0, "format": 0, "version": 1}]}]}}	text	\N	\N	f	2026-04-28 13:55:25.957+00	2026-04-28 13:55:25.955+00
36	27	2	{"root": {"type": "root", "format": "", "indent": 0, "version": 1, "children": [{"type": "paragraph", "format": "", "indent": 0, "version": 1, "children": [{"mode": "normal", "text": "No error", "type": "text", "style": "", "detail": 0, "format": 0, "version": 1}]}]}}	text	\N	\N	f	2026-04-28 14:16:14.829+00	2026-04-28 14:16:14.829+00
37	27	2	{"root": {"type": "root", "format": "", "indent": 0, "version": 1, "children": [{"type": "paragraph", "format": "", "indent": 0, "version": 1, "children": [{"mode": "normal", "text": "Real time now?\\n", "type": "text", "style": "", "detail": 0, "format": 0, "version": 1}]}]}}	text	\N	\N	f	2026-04-28 14:28:05.699+00	2026-04-28 14:28:05.697+00
38	27	2	{"root": {"type": "root", "format": "", "indent": 0, "version": 1, "children": [{"type": "paragraph", "format": "", "indent": 0, "version": 1, "children": [{"mode": "normal", "text": "Niceeee", "type": "text", "style": "", "detail": 0, "format": 0, "version": 1}]}]}}	text	\N	\N	f	2026-04-28 14:28:16.733+00	2026-04-28 14:28:16.733+00
39	26	2	{"root": {"type": "root", "format": "", "indent": 0, "version": 1, "children": [{"type": "paragraph", "format": "", "indent": 0, "version": 1, "children": [{"mode": "normal", "text": "This is a new topic", "type": "text", "style": "", "detail": 0, "format": 0, "version": 1}]}]}}	text	\N	\N	f	2026-04-28 15:28:03.908+00	2026-04-28 15:28:03.908+00
\.


--
-- Data for Name: chat_message_status; Type: TABLE DATA; Schema: public; Owner: -
--

COPY "public"."chat_message_status" ("id", "message_id", "user_id", "status", "delivered_at", "read_at", "updated_at", "created_at") FROM stdin;
25	26	2	read	2026-04-22 13:12:54.139+00	\N	2026-04-22 13:12:54.141+00	2026-04-22 13:12:54.14+00
26	28	2	read	2026-04-22 13:44:03.359+00	\N	2026-04-22 13:44:03.359+00	2026-04-22 13:44:03.359+00
27	29	2	read	2026-04-22 13:45:33.059+00	\N	2026-04-22 13:45:33.06+00	2026-04-22 13:45:33.06+00
28	30	2	read	2026-04-22 14:03:11.072+00	\N	2026-04-22 14:03:11.072+00	2026-04-22 14:03:11.072+00
29	31	2	read	2026-04-22 14:04:15.552+00	\N	2026-04-22 14:04:15.553+00	2026-04-22 14:04:15.553+00
30	32	2	read	2026-04-22 14:05:22.263+00	\N	2026-04-22 14:05:22.263+00	2026-04-22 14:05:22.263+00
31	33	2	read	2026-04-28 13:46:05.016+00	\N	2026-04-28 13:46:05.017+00	2026-04-28 13:46:05.017+00
32	34	2	read	2026-04-28 13:47:10.717+00	\N	2026-04-28 13:47:10.717+00	2026-04-28 13:47:10.717+00
33	35	2	read	2026-04-28 13:55:27.394+00	\N	2026-04-28 13:55:27.395+00	2026-04-28 13:55:27.395+00
34	36	2	read	2026-04-28 14:16:16.195+00	\N	2026-04-28 14:16:16.196+00	2026-04-28 14:16:16.196+00
35	37	2	read	2026-04-28 14:28:06.912+00	\N	2026-04-28 14:28:06.912+00	2026-04-28 14:28:06.912+00
36	38	2	read	2026-04-28 14:28:17.804+00	\N	2026-04-28 14:28:17.804+00	2026-04-28 14:28:17.804+00
37	39	2	read	2026-04-28 15:28:04.097+00	\N	2026-04-28 15:28:04.097+00	2026-04-28 15:28:04.097+00
\.


--
-- Data for Name: chat_messages_reactions; Type: TABLE DATA; Schema: public; Owner: -
--

COPY "public"."chat_messages_reactions" ("_order", "_parent_id", "id", "user_id", "emoji", "created_at") FROM stdin;
\.


--
-- Data for Name: chat_messages_rels; Type: TABLE DATA; Schema: public; Owner: -
--

COPY "public"."chat_messages_rels" ("id", "order", "parent_id", "path", "media_id") FROM stdin;
\.


--
-- Data for Name: chat_typing_status; Type: TABLE DATA; Schema: public; Owner: -
--

COPY "public"."chat_typing_status" ("id", "chat_id", "user_id", "is_typing", "updated_at", "created_at") FROM stdin;
\.


--
-- Data for Name: chats_rels; Type: TABLE DATA; Schema: public; Owner: -
--

COPY "public"."chats_rels" ("id", "order", "parent_id", "path", "users_id") FROM stdin;
116	1	24	participants	2
117	2	24	participants	4
122	1	25	participants	2
123	2	25	participants	4
143	1	27	participants	2
145	1	26	participants	2
108	1	23	participants	2
109	2	23	participants	4
\.


--
-- Data for Name: coupon_codes_allowed_emails; Type: TABLE DATA; Schema: public; Owner: -
--

COPY "public"."coupon_codes_allowed_emails" ("_order", "_parent_id", "id", "email") FROM stdin;
\.


--
-- Data for Name: course_categories; Type: TABLE DATA; Schema: public; Owner: -
--

COPY "public"."course_categories" ("id", "name", "slug", "description", "parent_id", "category_type", "icon_id", "color_code", "display_order", "is_active", "metadata", "updated_at", "created_at") FROM stdin;
1	STCW Basic	stcw-basic	\N	\N	course	25	\N	0	t	\N	2026-04-06 13:10:08.79+00	2026-04-05 06:01:57.374+00
2	Engineering Management	engineering	\N	\N	course	28	\N	0	t	\N	2026-04-07 10:50:40.181+00	2026-04-07 09:16:36.667+00
3	Cargo Operations	cargo-ops	\N	\N	course	33	\N	0	t	\N	2026-04-07 10:52:10.777+00	2026-04-07 10:44:13.794+00
4	Maritime Law	maritime-law	\N	\N	course	36	\N	0	t	\N	2026-04-07 11:08:32.18+00	2026-04-07 11:08:32.18+00
5	Safety & Rescue	safety-rescue	\N	\N	course	41	\N	0	t	\N	2026-04-07 12:22:44.636+00	2026-04-07 12:22:44.636+00
6	Maritime Security	maritime-security	\N	\N	course	42	\N	0	t	\N	2026-04-07 12:27:52.835+00	2026-04-07 12:27:52.835+00
7	Soft Skills	soft-skills	\N	\N	course	43	\N	0	t	\N	2026-04-07 12:54:12.992+00	2026-04-07 12:54:12.99+00
8	Shipboard Health & Environment	shipboard-health-environment	\N	\N	course	44	\N	0	t	\N	2026-04-07 13:54:53.173+00	2026-04-07 13:54:53.172+00
\.


--
-- Data for Name: coupon_codes_rels; Type: TABLE DATA; Schema: public; Owner: -
--

COPY "public"."coupon_codes_rels" ("id", "order", "parent_id", "path", "courses_id", "course_categories_id", "trainees_id") FROM stdin;
\.


--
-- Data for Name: coupon_redemptions; Type: TABLE DATA; Schema: public; Owner: -
--

COPY "public"."coupon_redemptions" ("id", "coupon_id", "trainee_id", "user_id", "course_enrollment_id", "course_id", "context_type", "status", "code_snapshot", "discount_type_snapshot", "discount_amount_snapshot", "subtotal_snapshot", "final_total_snapshot", "currency_snapshot", "applied_at", "metadata", "updated_at", "created_at") FROM stdin;
\.


--
-- Data for Name: course_item_progress; Type: TABLE DATA; Schema: public; Owner: -
--

COPY "public"."course_item_progress" ("id", "trainee_id", "course_id", "enrollment_id", "status", "is_completed", "progress_percentage", "started_at", "completed_at", "last_accessed_at", "duration_seconds", "score", "grade", "attempts", "quiz_data", "updated_at", "created_at") FROM stdin;
1	2	10	1	passed	t	100	2026-04-10 12:53:32.951+00	2026-04-10 12:53:58.078+00	2026-04-10 12:53:58.078+00	0	\N	\N	1	\N	2026-04-10 12:53:58.414+00	2026-04-10 12:53:33.102+00
2	2	10	1	passed	t	100	2026-04-10 12:53:34.444+00	2026-04-10 12:55:13.801+00	2026-04-10 12:55:13.801+00	0	\N	\N	1	\N	2026-04-10 12:55:14.138+00	2026-04-10 12:53:34.597+00
5	2	10	1	completed	t	100	2026-04-10 12:55:32.161+00	2026-04-10 12:55:32.161+00	2026-04-10 12:55:32.161+00	0	\N	\N	0	\N	2026-04-10 12:55:32.36+00	2026-04-10 12:55:32.36+00
6	2	10	1	completed	t	100	2026-04-10 12:55:36.987+00	2026-04-10 12:55:36.987+00	2026-04-10 12:55:36.987+00	0	\N	\N	0	\N	2026-04-10 12:55:37.159+00	2026-04-10 12:55:37.159+00
3	2	10	1	failed	t	100	2026-04-10 12:54:46.623+00	2026-04-10 12:55:52.294+00	2026-04-10 12:55:52.294+00	0	\N	\N	1	\N	2026-04-10 12:55:52.639+00	2026-04-10 12:54:46.814+00
4	2	10	1	passed	t	100	2026-04-10 12:54:48.164+00	2026-04-10 12:57:01.347+00	2026-04-10 12:57:01.347+00	0	\N	\N	1	\N	2026-04-10 12:57:01.685+00	2026-04-10 12:54:48.32+00
8	2	2	2	completed	t	100	2026-04-12 02:49:52.56+00	2026-04-12 02:49:52.56+00	2026-04-12 02:49:52.56+00	0	\N	\N	0	\N	2026-04-12 02:49:52.71+00	2026-04-12 02:49:52.71+00
7	2	2	2	failed	t	100	2026-04-12 02:04:52.541+00	2026-04-20 13:02:47.957+00	2026-04-20 13:02:47.957+00	0	\N	\N	1	\N	2026-04-20 13:02:48.255+00	2026-04-12 02:04:52.779+00
\.


--
-- Data for Name: course_lessons; Type: TABLE DATA; Schema: public; Owner: -
--

COPY "public"."course_lessons" ("id", "title", "module_id", "estimated_duration", "updated_at", "created_at", "description") FROM stdin;
1	Entry Requirements and Medical Fitness	1	\N	2026-04-10 11:14:56.351+00	2026-04-10 11:14:56.351+00	{"root": {"type": "root", "format": "", "indent": 0, "version": 1, "children": [{"type": "paragraph", "format": "", "indent": 0, "version": 1, "children": [{"mode": "normal", "text": "Before a seafarer even steps onto a vessel, the MLC establishes strict \\"gatekeeper\\" standards to ensure everyone on board is safe, capable, and legally protected.", "type": "text", "style": "", "detail": 0, "format": 0, "version": 1}], "direction": "ltr", "textStyle": "", "textFormat": 0}, {"tag": "h3", "type": "heading", "format": "", "indent": 0, "version": 1, "children": [{"mode": "normal", "text": "1. Minimum Age Standards", "type": "text", "style": "", "detail": 0, "format": 0, "version": 1}], "direction": "ltr"}, {"tag": "ul", "type": "list", "start": 1, "format": "", "indent": 0, "version": 1, "children": [{"type": "listitem", "value": 1, "format": "", "indent": 0, "version": 1, "children": [{"mode": "normal", "text": "The Baseline:", "type": "text", "style": "", "detail": 0, "format": 1, "version": 1}, {"mode": "normal", "text": " No person under the age of ", "type": "text", "style": "", "detail": 0, "format": 0, "version": 1}, {"mode": "normal", "text": "16", "type": "text", "style": "", "detail": 0, "format": 1, "version": 1}, {"mode": "normal", "text": " can work on a ship.", "type": "text", "style": "", "detail": 0, "format": 0, "version": 1}], "direction": "ltr", "textFormat": 1}, {"type": "listitem", "value": 2, "format": "", "indent": 0, "version": 1, "children": [{"mode": "normal", "text": "Night Work:", "type": "text", "style": "", "detail": 0, "format": 1, "version": 1}, {"mode": "normal", "text": " Seafarers under ", "type": "text", "style": "", "detail": 0, "format": 0, "version": 1}, {"mode": "normal", "text": "18", "type": "text", "style": "", "detail": 0, "format": 1, "version": 1}, {"mode": "normal", "text": " are prohibited from working at night (usually defined as a 9-hour window including midnight to 5 AM).", "type": "text", "style": "", "detail": 0, "format": 0, "version": 1}], "direction": "ltr", "textFormat": 1}, {"type": "listitem", "value": 3, "format": "", "indent": 0, "version": 1, "children": [{"mode": "normal", "text": "Hazardous Duties:", "type": "text", "style": "", "detail": 0, "format": 1, "version": 1}, {"mode": "normal", "text": " Young seafarers (under 18) cannot perform tasks likely to jeopardize their health or safety, such as heavy lifting or working with dangerous chemicals.", "type": "text", "style": "", "detail": 0, "format": 0, "version": 1}], "direction": "ltr", "textFormat": 1}], "listType": "bullet", "direction": "ltr"}, {"tag": "h3", "type": "heading", "format": "", "indent": 0, "version": 1, "children": [{"mode": "normal", "text": "2. Medical Certification", "type": "text", "style": "", "detail": 0, "format": 0, "version": 1}], "direction": "ltr"}, {"tag": "ul", "type": "list", "start": 1, "format": "", "indent": 0, "version": 1, "children": [{"type": "listitem", "value": 1, "format": "", "indent": 0, "version": 1, "children": [{"mode": "normal", "text": "The Requirement:", "type": "text", "style": "", "detail": 0, "format": 1, "version": 1}, {"mode": "normal", "text": " Every seafarer must hold a valid medical certificate issued by a recognized practitioner.", "type": "text", "style": "", "detail": 0, "format": 0, "version": 1}], "direction": "ltr", "textFormat": 1}, {"type": "listitem", "value": 2, "format": "", "indent": 0, "version": 1, "children": [{"mode": "normal", "text": "Validity:", "type": "text", "style": "", "detail": 0, "format": 1, "version": 1}, {"mode": "normal", "text": " Generally, certificates are valid for a maximum of ", "type": "text", "style": "", "detail": 0, "format": 0, "version": 1}, {"mode": "normal", "text": "2 years", "type": "text", "style": "", "detail": 0, "format": 1, "version": 1}, {"mode": "normal", "text": " (1 year for those under 18).", "type": "text", "style": "", "detail": 0, "format": 0, "version": 1}], "direction": "ltr", "textFormat": 1}, {"type": "listitem", "value": 3, "format": "", "indent": 0, "version": 1, "children": [{"mode": "normal", "text": "Color Vision:", "type": "text", "style": "", "detail": 0, "format": 1, "version": 1}, {"mode": "normal", "text": " Specifically for deck and engine department roles, a valid color vision certificate is mandatory and usually expires every ", "type": "text", "style": "", "detail": 0, "format": 0, "version": 1}, {"mode": "normal", "text": "6 years", "type": "text", "style": "", "detail": 0, "format": 1, "version": 1}, {"mode": "normal", "text": ".", "type": "text", "style": "", "detail": 0, "format": 0, "version": 1}], "direction": "ltr", "textFormat": 1}], "listType": "bullet", "direction": "ltr"}, {"tag": "h3", "type": "heading", "format": "", "indent": 0, "version": 1, "children": [{"mode": "normal", "text": "3. Training and Qualifications", "type": "text", "style": "", "detail": 0, "format": 0, "version": 1}], "direction": "ltr"}, {"tag": "ul", "type": "list", "start": 1, "format": "", "indent": 0, "version": 1, "children": [{"type": "listitem", "value": 1, "format": "", "indent": 0, "version": 1, "children": [{"mode": "normal", "text": "Seafarers must be trained and certified as competent to perform their specific onboard duties.", "type": "text", "style": "", "detail": 0, "format": 0, "version": 1}], "direction": "ltr"}, {"type": "listitem", "value": 2, "format": "", "indent": 0, "version": 1, "children": [{"mode": "normal", "text": "This includes mandatory ", "type": "text", "style": "", "detail": 0, "format": 0, "version": 1}, {"mode": "normal", "text": "Basic Safety Training (BST)", "type": "text", "style": "", "detail": 0, "format": 1, "version": 1}, {"mode": "normal", "text": " covering personal survival techniques, fire fighting, and first aid. ", "type": "text", "style": "", "detail": 0, "format": 0, "version": 1}], "direction": "ltr"}], "listType": "bullet", "direction": "ltr"}], "direction": "ltr"}}
2	The Seafarers' Employment Agreement (SEA) and Wages	1	\N	2026-04-10 11:15:33.256+00	2026-04-10 11:15:33.256+00	{"root": {"type": "root", "format": "", "indent": 0, "version": 1, "children": [{"type": "paragraph", "format": "", "indent": 0, "version": 1, "children": [{"mode": "normal", "text": "The SEA is the most critical document for any maritime worker. It is the legally binding contract between the seafarer and the shipowner.", "type": "text", "style": "", "detail": 0, "format": 0, "version": 1}], "direction": "ltr", "textStyle": "", "textFormat": 0}, {"tag": "h3", "type": "heading", "format": "", "indent": 0, "version": 1, "children": [{"mode": "normal", "text": "1. Essential Elements of the SEA", "type": "text", "style": "", "detail": 0, "format": 0, "version": 1}], "direction": "ltr"}, {"type": "paragraph", "format": "", "indent": 0, "version": 1, "children": [{"mode": "normal", "text": "By law, your contract must be written in a language you understand and must include:", "type": "text", "style": "", "detail": 0, "format": 0, "version": 1}], "direction": "ltr", "textStyle": "", "textFormat": 0}, {"tag": "ul", "type": "list", "start": 1, "format": "", "indent": 0, "version": 1, "children": [{"type": "listitem", "value": 1, "format": "", "indent": 0, "version": 1, "children": [{"mode": "normal", "text": "Full name, date of birth, and birthplace of the seafarer.", "type": "text", "style": "", "detail": 0, "format": 0, "version": 1}], "direction": "ltr"}, {"type": "listitem", "value": 2, "format": "", "indent": 0, "version": 1, "children": [{"mode": "normal", "text": "The shipowner’s name and address.", "type": "text", "style": "", "detail": 0, "format": 0, "version": 1}], "direction": "ltr"}, {"type": "listitem", "value": 3, "format": "", "indent": 0, "version": 1, "children": [{"mode": "normal", "text": "The capacity (job title) in which the seafarer is to be employed.", "type": "text", "style": "", "detail": 0, "format": 0, "version": 1}], "direction": "ltr"}, {"type": "listitem", "value": 4, "format": "", "indent": 0, "version": 1, "children": [{"mode": "normal", "text": "The amount of wages and the formula for calculating overtime.", "type": "text", "style": "", "detail": 0, "format": 0, "version": 1}], "direction": "ltr"}, {"type": "listitem", "value": 5, "format": "", "indent": 0, "version": 1, "children": [{"mode": "normal", "text": "The amount of paid annual leave.", "type": "text", "style": "", "detail": 0, "format": 0, "version": 1}], "direction": "ltr"}, {"type": "listitem", "value": 6, "format": "", "indent": 0, "version": 1, "children": [{"mode": "normal", "text": "The conditions for terminating the agreement (notice periods).", "type": "text", "style": "", "detail": 0, "format": 0, "version": 1}], "direction": "ltr"}], "listType": "bullet", "direction": "ltr"}, {"tag": "h3", "type": "heading", "format": "", "indent": 0, "version": 1, "children": [{"mode": "normal", "text": "2. Wages and Allotments", "type": "text", "style": "", "detail": 0, "format": 0, "version": 1}], "direction": "ltr"}, {"type": "paragraph", "format": "", "indent": 0, "version": 1, "children": [{"mode": "normal", "text": "The MLC ensures that seafarers are not exploited regarding their pay:", "type": "text", "style": "", "detail": 0, "format": 0, "version": 1}], "direction": "ltr", "textStyle": "", "textFormat": 0}, {"tag": "ul", "type": "list", "start": 1, "format": "", "indent": 0, "version": 1, "children": [{"type": "listitem", "value": 1, "format": "", "indent": 0, "version": 1, "children": [{"mode": "normal", "text": "Regular Payment:", "type": "text", "style": "", "detail": 0, "format": 1, "version": 1}, {"mode": "normal", "text": " Wages must be paid at no greater than monthly intervals.", "type": "text", "style": "", "detail": 0, "format": 0, "version": 1}], "direction": "ltr", "textFormat": 1}, {"type": "listitem", "value": 2, "format": "", "indent": 0, "version": 1, "children": [{"mode": "normal", "text": "Statement of Accounts:", "type": "text", "style": "", "detail": 0, "format": 1, "version": 1}, {"mode": "normal", "text": " You must receive a monthly account of payments (payslip), including any additions (overtime) or authorized deductions.", "type": "text", "style": "", "detail": 0, "format": 0, "version": 1}], "direction": "ltr", "textFormat": 1}, {"type": "listitem", "value": 3, "format": "", "indent": 0, "version": 1, "children": [{"mode": "normal", "text": "Allotments:", "type": "text", "style": "", "detail": 0, "format": 1, "version": 1}, {"mode": "normal", "text": " Shipowners must provide a system for seafarers to send a portion or all of their earnings to their families (allotments) at regular intervals and at reasonable exchange rates.", "type": "text", "style": "", "detail": 0, "format": 0, "version": 1}], "direction": "ltr", "textFormat": 1}], "listType": "bullet", "direction": "ltr"}, {"tag": "h3", "type": "heading", "format": "", "indent": 0, "version": 1, "children": [{"mode": "normal", "text": "3. Entitlement to Leave", "type": "text", "style": "", "detail": 0, "format": 0, "version": 1}], "direction": "ltr"}, {"tag": "ul", "type": "list", "start": 1, "format": "", "indent": 0, "version": 1, "children": [{"type": "listitem", "value": 1, "format": "", "indent": 0, "version": 1, "children": [{"mode": "normal", "text": "Annual Leave:", "type": "text", "style": "", "detail": 0, "format": 1, "version": 1}, {"mode": "normal", "text": " Calculated at a minimum of ", "type": "text", "style": "", "detail": 0, "format": 0, "version": 1}, {"mode": "normal", "text": "2.5 calendar days per month", "type": "text", "style": "", "detail": 0, "format": 1, "version": 1}, {"mode": "normal", "text": " of employment.", "type": "text", "style": "", "detail": 0, "format": 0, "version": 1}], "direction": "ltr", "textFormat": 1}, {"type": "listitem", "value": 2, "format": "", "indent": 0, "version": 1, "children": [{"mode": "normal", "text": "Shore Leave:", "type": "text", "style": "", "detail": 0, "format": 1, "version": 1}, {"mode": "normal", "text": " Shipowners are required to grant shore leave to benefit the health and well-being of the crew, consistent with the operational requirements of their positions. ", "type": "text", "style": "", "detail": 0, "format": 0, "version": 1}], "direction": "ltr", "textFormat": 1}], "listType": "bullet", "direction": "ltr", "textFormat": 1}], "direction": "ltr", "textFormat": 1}}
4	Repatriation and Social Protections	2	\N	2026-04-10 11:17:48.697+00	2026-04-10 11:17:48.697+00	{"root": {"type": "root", "format": "", "indent": 0, "version": 1, "children": [{"tag": "ul", "type": "list", "start": 1, "format": "", "indent": 0, "version": 1, "children": [{"type": "listitem", "value": 1, "format": "", "indent": 0, "version": 1, "children": [{"mode": "normal", "text": "One of the most important rights in the MLC is the guarantee that you will never be \\"stranded\\" in a foreign port.", "type": "text", "style": "", "detail": 0, "format": 0, "version": 1}], "direction": "ltr"}], "listType": "bullet", "direction": "ltr"}, {"tag": "h3", "type": "heading", "format": "", "indent": 0, "version": 1, "children": [{"mode": "normal", "text": "1. The Right to Repatriation", "type": "text", "style": "", "detail": 0, "format": 0, "version": 1}], "direction": "ltr"}, {"type": "paragraph", "format": "", "indent": 0, "version": 1, "children": [{"mode": "normal", "text": "Seafarers have a right to be returned to their home country at ", "type": "text", "style": "", "detail": 0, "format": 0, "version": 1}, {"mode": "normal", "text": "no cost to themselves", "type": "text", "style": "", "detail": 0, "format": 1, "version": 1}, {"mode": "normal", "text": " under these circumstances:", "type": "text", "style": "", "detail": 0, "format": 0, "version": 1}], "direction": "ltr", "textStyle": "", "textFormat": 0}, {"tag": "ul", "type": "list", "start": 1, "format": "", "indent": 0, "version": 1, "children": [{"type": "listitem", "value": 1, "format": "", "indent": 0, "version": 1, "children": [{"mode": "normal", "text": "When the employment agreement expires while the ship is abroad.", "type": "text", "style": "", "detail": 0, "format": 0, "version": 1}], "direction": "ltr"}, {"type": "listitem", "value": 2, "format": "", "indent": 0, "version": 1, "children": [{"mode": "normal", "text": "If the seafarer is no longer able to carry out their duties (due to illness or injury).", "type": "text", "style": "", "detail": 0, "format": 0, "version": 1}], "direction": "ltr"}, {"type": "listitem", "value": 3, "format": "", "indent": 0, "version": 1, "children": [{"mode": "normal", "text": "In the event of a shipwreck.", "type": "text", "style": "", "detail": 0, "format": 0, "version": 1}], "direction": "ltr"}, {"type": "listitem", "value": 4, "format": "", "indent": 0, "version": 1, "children": [{"mode": "normal", "text": "If the shipowner is unable to fulfill legal or contractual obligations (e.g., bankruptcy).", "type": "text", "style": "", "detail": 0, "format": 0, "version": 1}], "direction": "ltr"}], "listType": "bullet", "direction": "ltr"}, {"tag": "h3", "type": "heading", "format": "", "indent": 0, "version": 1, "children": [{"mode": "normal", "text": "2. Financial Security", "type": "text", "style": "", "detail": 0, "format": 0, "version": 1}], "direction": "ltr"}, {"tag": "ul", "type": "list", "start": 1, "format": "", "indent": 0, "version": 1, "children": [{"type": "listitem", "value": 1, "format": "", "indent": 0, "version": 1, "children": [{"mode": "normal", "text": "Prohibition of Deposits:", "type": "text", "style": "", "detail": 0, "format": 1, "version": 1}, {"mode": "normal", "text": " Shipowners are strictly forbidden from asking seafarers to pay a \\"deposit\\" for repatriation at the start of their contract.", "type": "text", "style": "", "detail": 0, "format": 0, "version": 1}], "direction": "ltr", "textFormat": 1}, {"type": "listitem", "value": 2, "format": "", "indent": 0, "version": 1, "children": [{"mode": "normal", "text": "Abandonment Protection:", "type": "text", "style": "", "detail": 0, "format": 1, "version": 1}, {"mode": "normal", "text": " Ships must carry insurance (financial security) to cover cases of abandonment, ensuring that if a shipowner disappears, the crew still gets paid up to four months of wages and a ticket home.", "type": "text", "style": "", "detail": 0, "format": 0, "version": 1}], "direction": "ltr", "textFormat": 1}], "listType": "bullet", "direction": "ltr"}, {"tag": "h3", "type": "heading", "format": "", "indent": 0, "version": 1, "children": [{"mode": "normal", "text": "3. Recreational Facilities", "type": "text", "style": "", "detail": 0, "format": 0, "version": 1}], "direction": "ltr"}, {"type": "paragraph", "format": "", "indent": 0, "version": 1, "children": [{"mode": "normal", "text": "To support mental health, the MLC mandates that ships provide:", "type": "text", "style": "", "detail": 0, "format": 0, "version": 1}], "direction": "ltr", "textStyle": "", "textFormat": 0}, {"tag": "ul", "type": "list", "start": 1, "format": "", "indent": 0, "version": 1, "children": [{"type": "listitem", "value": 1, "format": "", "indent": 0, "version": 1, "children": [{"mode": "normal", "text": "Access to shore-based welfare facilities.", "type": "text", "style": "", "detail": 0, "format": 0, "version": 1}], "direction": "ltr"}, {"type": "listitem", "value": 2, "format": "", "indent": 0, "version": 1, "children": [{"mode": "normal", "text": "Onboard amenities such as a library, television/films, and sports equipment.", "type": "text", "style": "", "detail": 0, "format": 0, "version": 1}], "direction": "ltr"}, {"type": "listitem", "value": 3, "format": "", "indent": 0, "version": 1, "children": [{"mode": "normal", "text": "Communication:", "type": "text", "style": "", "detail": 0, "format": 1, "version": 1}, {"mode": "normal", "text": " Reasonable access to ship-to-shore telephone and internet communications, ideally at a fair cost. ", "type": "text", "style": "", "detail": 0, "format": 0, "version": 1}], "direction": "ltr", "textFormat": 1}], "listType": "bullet", "direction": "ltr", "textFormat": 1}], "direction": "ltr", "textFormat": 1}}
6	Safety, Complaints, and Enforcement	3	\N	2026-04-11 12:20:06.467+00	2026-04-10 11:19:36.645+00	{"root": {"type": "root", "format": "", "indent": 0, "version": 1, "children": [{"type": "paragraph", "format": "", "indent": 0, "version": 1, "children": [{"mode": "normal", "text": "Rights are only effective if they are enforced. This lesson explains how the \\"Seafarers' Bill of Rights\\" is policed globally.", "type": "text", "style": "", "detail": 0, "format": 0, "version": 1}], "direction": "ltr", "textStyle": "", "textFormat": 0}, {"tag": "h3", "type": "heading", "format": "", "indent": 0, "version": 1, "children": [{"mode": "normal", "text": "1. Health and Safety Protection (OSH)", "type": "text", "style": "", "detail": 0, "format": 0, "version": 1}], "direction": "ltr"}, {"type": "paragraph", "format": "", "indent": 0, "version": 1, "children": [{"mode": "normal", "text": "Each ship must have an ", "type": "text", "style": "", "detail": 0, "format": 0, "version": 1}, {"mode": "normal", "text": "Occupational Safety and Health (OSH)", "type": "text", "style": "", "detail": 0, "format": 1, "version": 1}, {"mode": "normal", "text": " program to prevent accidents:", "type": "text", "style": "", "detail": 0, "format": 0, "version": 1}], "direction": "ltr", "textStyle": "", "textFormat": 0}, {"tag": "ul", "type": "list", "start": 1, "format": "", "indent": 0, "version": 1, "children": [{"type": "listitem", "value": 1, "format": "", "indent": 0, "version": 1, "children": [{"mode": "normal", "text": "Risk Assessment:", "type": "text", "style": "", "detail": 0, "format": 1, "version": 1}, {"mode": "normal", "text": " Continuous evaluation of tasks to minimize risks.", "type": "text", "style": "", "detail": 0, "format": 0, "version": 1}], "direction": "ltr", "textFormat": 1}, {"type": "listitem", "value": 2, "format": "", "indent": 0, "version": 1, "children": [{"mode": "normal", "text": "Safety Committee:", "type": "text", "style": "", "detail": 0, "format": 1, "version": 1}, {"mode": "normal", "text": " On ships with 5 or more crew, a safety committee must be established with crew representation to discuss hazards and improvements.", "type": "text", "style": "", "detail": 0, "format": 0, "version": 1}], "direction": "ltr", "textFormat": 1}], "listType": "bullet", "direction": "ltr", "textFormat": 1}, {"tag": "h3", "type": "heading", "format": "", "indent": 0, "version": 1, "children": [{"mode": "normal", "text": "2. The Complaint Procedure", "type": "text", "style": "", "detail": 0, "format": 0, "version": 1}], "direction": "ltr"}, {"type": "paragraph", "format": "", "indent": 0, "version": 1, "children": [{"mode": "normal", "text": "If your rights are being violated, the MLC provides two main paths:", "type": "text", "style": "", "detail": 0, "format": 0, "version": 1}], "direction": "ltr", "textStyle": "", "textFormat": 0}, {"tag": "ul", "type": "list", "start": 1, "format": "", "indent": 0, "version": 1, "children": [{"type": "listitem", "value": 1, "format": "", "indent": 0, "version": 1, "children": [{"mode": "normal", "text": "On-board Complaint Procedure:", "type": "text", "style": "", "detail": 0, "format": 1, "version": 1}, {"mode": "normal", "text": " Seafarers have the right to file a complaint directly to the Master or external authorities. You cannot be victimized (punished) for filing a legitimate complaint.", "type": "text", "style": "", "detail": 0, "format": 0, "version": 1}], "direction": "ltr", "textFormat": 1}, {"type": "listitem", "value": 2, "format": "", "indent": 0, "version": 1, "children": [{"mode": "normal", "text": "On-shore Complaint Procedure:", "type": "text", "style": "", "detail": 0, "format": 1, "version": 1}, {"mode": "normal", "text": " Seafarers can report violations to a Port State Control officer in any port the ship visits.", "type": "text", "style": "", "detail": 0, "format": 0, "version": 1}], "direction": "ltr", "textFormat": 1}], "listType": "bullet", "direction": "ltr", "textFormat": 1}, {"tag": "h3", "type": "heading", "format": "", "indent": 0, "version": 1, "children": [{"mode": "normal", "text": "3. Compliance and Inspection (The \\"Three Pillars\\")", "type": "text", "style": "", "detail": 0, "format": 0, "version": 1}], "direction": "ltr"}, {"type": "paragraph", "format": "", "indent": 0, "version": 1, "children": [{"mode": "normal", "text": "The MLC is enforced through three levels of inspection:", "type": "text", "style": "", "detail": 0, "format": 0, "version": 1}], "direction": "ltr", "textStyle": "", "textFormat": 0}, {"tag": "ol", "type": "list", "start": 1, "format": "", "indent": 0, "version": 1, "children": [{"type": "listitem", "value": 1, "format": "", "indent": 0, "version": 1, "children": [{"mode": "normal", "text": "Flag State Inspection:", "type": "text", "style": "", "detail": 0, "format": 1, "version": 1}, {"mode": "normal", "text": " The country where the ship is registered (e.g., Philippines, Panama) must inspect the ship and issue a ", "type": "text", "style": "", "detail": 0, "format": 0, "version": 1}, {"mode": "normal", "text": "Maritime Labour Certificate", "type": "text", "style": "", "detail": 0, "format": 1, "version": 1}, {"mode": "normal", "text": ".", "type": "text", "style": "", "detail": 0, "format": 0, "version": 1}], "direction": "ltr", "textFormat": 1}, {"type": "listitem", "value": 2, "format": "", "indent": 0, "version": 1, "children": [{"mode": "normal", "text": "Port State Control (PSC):", "type": "text", "style": "", "detail": 0, "format": 1, "version": 1}, {"mode": "normal", "text": " When a ship enters a foreign port, local authorities can board the ship to ensure it meets MLC standards.", "type": "text", "style": "", "detail": 0, "format": 0, "version": 1}], "direction": "ltr", "textFormat": 1}, {"type": "listitem", "value": 3, "format": "", "indent": 0, "version": 1, "children": [{"mode": "normal", "text": "Declaration of Maritime Labour Compliance (DMLC):", "type": "text", "style": "", "detail": 0, "format": 1, "version": 1}, {"mode": "normal", "text": " A two-part document that lists the national requirements and the shipowner's specific plan to meet them. ", "type": "text", "style": "", "detail": 0, "format": 0, "version": 1}], "direction": "ltr", "textFormat": 1}], "listType": "number", "direction": "ltr", "textFormat": 1}, {"type": "paragraph", "format": "", "indent": 0, "version": 1, "children": [], "direction": null, "textStyle": "", "textFormat": 0}, {"type": "paragraph", "format": "", "indent": 0, "version": 1, "children": [{"alt": "main-uploads/sdfsf.pptx_1775909886898.ppt", "url": "https://res.cloudinary.com/dpdkfg8qu/raw/upload/v1775909890/main-uploads/sdfsf.pptx_1775909886898.ppt", "type": "course-image", "version": 1, "mimeType": "application/vnd.ms-powerpoint"}], "direction": null, "textStyle": "", "textFormat": 0}], "direction": "ltr"}}
5	Medical Care and Shipowner Liability	3	\N	2026-04-11 12:24:38.64+00	2026-04-10 11:18:58.467+00	{"root": {"type": "root", "format": "", "indent": 0, "version": 1, "children": [{"type": "paragraph", "format": "", "indent": 0, "version": 1, "children": [{"mode": "normal", "text": "Unlike land-based jobs, a seafarer cannot simply visit a local clinic. The MLC ensures that medical care at sea is as close as possible to the quality available on shore.", "type": "text", "style": "", "detail": 0, "format": 0, "version": 1}], "direction": null, "textStyle": "", "textFormat": 0}, {"tag": "h3", "type": "heading", "format": "", "indent": 0, "version": 1, "children": [{"mode": "normal", "text": "1. Onboard Medical Care", "type": "text", "style": "", "detail": 0, "format": 0, "version": 1}], "direction": null}, {"tag": "ul", "type": "list", "start": 1, "format": "", "indent": 0, "version": 1, "children": [{"type": "listitem", "value": 1, "format": "", "indent": 0, "version": 1, "children": [{"mode": "normal", "text": "Right to Care:", "type": "text", "style": "", "detail": 0, "format": 1, "version": 1}, {"mode": "normal", "text": " Seafarers have the right to visit a doctor or dentist in ports of call without delay and, generally, at no cost.", "type": "text", "style": "", "detail": 0, "format": 0, "version": 1}], "direction": null, "textFormat": 1}, {"type": "listitem", "value": 2, "format": "", "indent": 0, "version": 1, "children": [{"mode": "normal", "text": "The Ship’s Medicine Chest:", "type": "text", "style": "", "detail": 0, "format": 1, "version": 1}, {"mode": "normal", "text": " Every vessel must carry a standard medicine chest, medical equipment, and a medical guide (like the ", "type": "text", "style": "", "detail": 0, "format": 0, "version": 1}, {"mode": "normal", "text": "International Medical Guide for Ships", "type": "text", "style": "", "detail": 0, "format": 2, "version": 1}, {"mode": "normal", "text": ").", "type": "text", "style": "", "detail": 0, "format": 0, "version": 1}], "direction": null, "textFormat": 1}, {"type": "listitem", "value": 3, "format": "", "indent": 0, "version": 1, "children": [{"mode": "normal", "text": "Medical Training:", "type": "text", "style": "", "detail": 0, "format": 1, "version": 1}, {"mode": "normal", "text": " Ships with 100+ people on international voyages of more than 3 days must have a ", "type": "text", "style": "", "detail": 0, "format": 0, "version": 1}, {"mode": "normal", "text": "qualified doctor", "type": "text", "style": "", "detail": 0, "format": 1, "version": 1}, {"mode": "normal", "text": ". On smaller ships, at least one crew member must be trained in first aid or advanced medical care.", "type": "text", "style": "", "detail": 0, "format": 0, "version": 1}], "direction": null, "textFormat": 1}], "listType": "bullet", "direction": null, "textFormat": 1}, {"tag": "h3", "type": "heading", "format": "", "indent": 0, "version": 1, "children": [{"mode": "normal", "text": "2. Shipowner Liability", "type": "text", "style": "", "detail": 0, "format": 0, "version": 1}], "direction": null}, {"type": "paragraph", "format": "", "indent": 0, "version": 1, "children": [{"mode": "normal", "text": "If a seafarer is injured or becomes ill while serving on a ship, the shipowner is liable for:", "type": "text", "style": "", "detail": 0, "format": 0, "version": 1}], "direction": null, "textStyle": "", "textFormat": 0}, {"tag": "ul", "type": "list", "start": 1, "format": "", "indent": 0, "version": 1, "children": [{"type": "listitem", "value": 1, "format": "", "indent": 0, "version": 1, "children": [{"mode": "normal", "text": "Medical Expenses:", "type": "text", "style": "", "detail": 0, "format": 1, "version": 1}, {"mode": "normal", "text": " Covering all costs of medical care, including medicine and hospitalization, until the seafarer has recovered.", "type": "text", "style": "", "detail": 0, "format": 0, "version": 1}], "direction": null, "textFormat": 1}, {"type": "listitem", "value": 2, "format": "", "indent": 0, "version": 1, "children": [{"mode": "normal", "text": "Wages:", "type": "text", "style": "", "detail": 0, "format": 1, "version": 1}, {"mode": "normal", "text": " Paying full wages as long as the sick or injured seafarer remains on board or until they have been repatriated.", "type": "text", "style": "", "detail": 0, "format": 0, "version": 1}], "direction": null, "textFormat": 1}, {"type": "listitem", "value": 3, "format": "", "indent": 0, "version": 1, "children": [{"mode": "normal", "text": "Burial Expenses:", "type": "text", "style": "", "detail": 0, "format": 1, "version": 1}, {"mode": "normal", "text": " In the unfortunate event of a death on board or during employment, the shipowner must cover burial or cremation costs. ", "type": "text", "style": "", "detail": 0, "format": 0, "version": 1}], "direction": null, "textFormat": 1}], "listType": "bullet", "direction": null, "textFormat": 1}, {"src": "https://docs.google.com/presentation/d/e/2PACX-1vRzTYMK-3vd1P9BC_2eSRm1eL-aGQPyBqV0sh-J3s_EJU3AbJe-vfKxxsFx-03d0e7dx67tOA85ewHf/pubembed?start=false&loop=false&delayms=3000", "type": "iframe", "width": "1280", "height": "749", "version": 1}], "direction": "ltr"}}
3	Onboard Living Standards and Catering	2	\N	2026-04-11 12:56:03.41+00	2026-04-10 11:16:44.323+00	{"root": {"type": "root", "format": "", "indent": 0, "version": 1, "children": [{"type": "paragraph", "format": "", "indent": 0, "version": 1, "children": [{"mode": "normal", "text": "The MLC sets \\"Hardware\\" standards (the building) and \\"Software\\" standards (the food and culture) to ensure seafarers don't suffer from burnout or malnutrition.", "type": "text", "style": "", "detail": 0, "format": 0, "version": 1}], "direction": "ltr", "textStyle": "", "textFormat": 0}, {"tag": "h3", "type": "heading", "format": "", "indent": 0, "version": 1, "children": [{"mode": "normal", "text": "1. Accommodation Standards", "type": "text", "style": "", "detail": 0, "format": 0, "version": 1}], "direction": "ltr"}, {"type": "paragraph", "format": "", "indent": 0, "version": 1, "children": [{"mode": "normal", "text": "Ships must provide decent living quarters that respect the dignity and health of the crew. Key requirements include:", "type": "text", "style": "", "detail": 0, "format": 0, "version": 1}], "direction": "ltr", "textStyle": "", "textFormat": 0}, {"tag": "ul", "type": "list", "start": 1, "format": "", "indent": 0, "version": 1, "children": [{"type": "listitem", "value": 1, "format": "", "indent": 0, "version": 1, "children": [{"mode": "normal", "text": "Space and Privacy:", "type": "text", "style": "", "detail": 0, "format": 1, "version": 1}, {"mode": "normal", "text": " Individual cabins are required where possible (standard for officers; increasingly common for ratings). Sleeping rooms must be situated above the load line and away from noisy machinery.", "type": "text", "style": "", "detail": 0, "format": 0, "version": 1}], "direction": "ltr", "textFormat": 1}, {"type": "listitem", "value": 2, "format": "", "indent": 0, "version": 1, "children": [{"mode": "normal", "text": "Climate Control:", "type": "text", "style": "", "detail": 0, "format": 1, "version": 1}, {"mode": "normal", "text": " Effective ventilation, heating, and air conditioning are mandatory to ensure comfort in diverse global climates.", "type": "text", "style": "", "detail": 0, "format": 0, "version": 1}], "direction": "ltr", "textFormat": 1}, {"type": "listitem", "value": 3, "format": "", "indent": 0, "version": 1, "children": [{"mode": "normal", "text": "Sanitary Facilities:", "type": "text", "style": "", "detail": 0, "format": 1, "version": 1}, {"mode": "normal", "text": " Sufficient toilets and washbasins with hot and cold running water must be available and maintained to high hygiene standards.", "type": "text", "style": "", "detail": 0, "format": 0, "version": 1}], "direction": "ltr", "textFormat": 1}, {"type": "listitem", "value": 4, "format": "", "indent": 0, "version": 1, "children": [{"mode": "normal", "text": "Noise and Vibration:", "type": "text", "style": "", "detail": 0, "format": 1, "version": 1}, {"mode": "normal", "text": " Shipowners must implement measures to reduce noise and vibration in crew areas to prevent sleep deprivation and long-term hearing issues. ", "type": "text", "style": "", "detail": 0, "format": 0, "version": 1}, {"type": "linebreak", "version": 1}, {"alt": "main-uploads/pdfexample_1775911961167.pdf", "url": "https://res.cloudinary.com/dpdkfg8qu/image/upload/v1775911964/main-uploads/pdfexample_1775911961167.pdf.pdf", "type": "course-image", "version": 1, "mimeType": "application/pdf"}, {"mode": "normal", "text": " ", "type": "text", "style": "", "detail": 0, "format": 0, "version": 1}], "direction": "ltr", "textFormat": 1}], "listType": "bullet", "direction": "ltr", "textFormat": 1}], "direction": "ltr", "textFormat": 1}}
\.


--
-- Data for Name: course_item_progress_rels; Type: TABLE DATA; Schema: public; Owner: -
--

COPY "public"."course_item_progress_rels" ("id", "order", "parent_id", "path", "course_lessons_id", "assessments_id", "assignments_id") FROM stdin;
3	\N	1	item	1	\N	\N
6	\N	2	item	2	\N	\N
7	\N	5	item	5	\N	\N
8	\N	6	item	6	\N	\N
9	\N	3	item	3	\N	\N
10	\N	4	item	4	\N	\N
12	\N	8	item	2	\N	\N
13	\N	7	item	1	\N	\N
\.


--
-- Data for Name: materials; Type: TABLE DATA; Schema: public; Owner: -
--

COPY "public"."materials" ("id", "title", "description", "material_source", "external_url", "metadata", "updated_at", "created_at") FROM stdin;
1	The "Fourth Pillar"		media	\N	\N	2026-04-11 02:48:20.41+00	2026-04-11 02:48:20.41+00
2	Sample	\N	media	\N	\N	2026-04-11 12:19:04.341+00	2026-04-11 11:13:16.627+00
3	PDF Upload	\N	media	\N	\N	2026-04-11 13:10:32.01+00	2026-04-11 13:10:32.007+00
4	Mix Upload	\N	media	\N	\N	2026-04-11 13:13:33.484+00	2026-04-11 13:13:33.484+00
\.


--
-- Data for Name: course_materials; Type: TABLE DATA; Schema: public; Owner: -
--

COPY "public"."course_materials" ("id", "course_id", "material_id", "order", "is_required", "updated_at", "created_at") FROM stdin;
2	2	1	2	f	2026-04-11 13:12:30.468+00	2026-04-11 02:51:13.118+00
4	2	3	1	f	2026-04-11 13:12:30.609+00	2026-04-11 13:12:30.609+00
\.


--
-- Data for Name: course_modules_rels; Type: TABLE DATA; Schema: public; Owner: -
--

COPY "public"."course_modules_rels" ("id", "order", "parent_id", "path", "course_lessons_id", "assessments_id", "assignments_id") FROM stdin;
11	1	3	items	5	\N	\N
12	2	3	items	6	\N	\N
13	3	3	items	\N	3	\N
14	1	2	items	3	\N	\N
15	2	2	items	4	\N	\N
16	3	2	items	\N	2	\N
42	1	1	items	1	\N	\N
43	2	1	items	2	\N	\N
44	3	1	items	\N	1	\N
45	4	1	items	\N	\N	1
46	5	1	items	\N	\N	2
47	6	1	items	\N	\N	3
48	7	1	items	\N	\N	4
49	8	1	items	\N	\N	5
\.


--
-- Data for Name: courses_learning_objectives; Type: TABLE DATA; Schema: public; Owner: -
--

COPY "public"."courses_learning_objectives" ("_order", "_parent_id", "id", "objective") FROM stdin;
\.


--
-- Data for Name: courses_prerequisites; Type: TABLE DATA; Schema: public; Owner: -
--

COPY "public"."courses_prerequisites" ("_order", "_parent_id", "id", "prerequisite") FROM stdin;
\.


--
-- Data for Name: courses_rels; Type: TABLE DATA; Schema: public; Owner: -
--

COPY "public"."courses_rels" ("id", "order", "parent_id", "path", "instructors_id", "course_categories_id", "course_modules_id") FROM stdin;
11	1	5	category	\N	2	\N
13	1	6	category	\N	2	\N
18	1	9	category	\N	3	\N
24	1	11	category	\N	4	\N
109	1	2	modules	\N	\N	1
110	1	2	category	\N	1	\N
40	1	3	category	\N	1	\N
41	2	3	category	\N	6	\N
42	3	3	category	\N	7	\N
116	1	12	category	\N	4	\N
119	1	7	category	\N	3	\N
120	2	7	category	\N	7	\N
121	1	4	category	\N	2	\N
122	2	4	category	\N	6	\N
123	3	4	category	\N	8	\N
124	1	8	category	\N	3	\N
125	2	8	category	\N	5	\N
126	3	8	category	\N	2	\N
127	4	8	category	\N	4	\N
128	5	8	category	\N	1	\N
133	1	1	category	\N	1	\N
134	2	1	category	\N	6	\N
84	1	10	modules	\N	\N	1
85	2	10	modules	\N	\N	2
86	3	10	modules	\N	\N	3
87	1	10	category	\N	4	\N
88	2	10	category	\N	8	\N
\.


--
-- Data for Name: emergency_contacts; Type: TABLE DATA; Schema: public; Owner: -
--

COPY "public"."emergency_contacts" ("id", "user_id", "first_name", "middle_name", "last_name", "contact_number", "relationship", "complete_address", "is_primary", "updated_at", "created_at") FROM stdin;
1	11	Maria	Santos	Enrile	+639092809768	parent	Manila, Philippines	t	2026-05-08 07:49:33.285+00	2026-05-08 07:49:33.285+00
2	12	MAY	ESPINA	ESPINOSA	+639476365503	spouse	BRGY. 4 CATANAUAN, QUEZON	t	2026-05-09 01:30:34.888+00	2026-05-09 01:30:34.888+00
3	2	Jhonrie	Callao	Sioting	0468748743	sibling	Pangi, Ipil, Zamboanga Sibugay	f	2026-05-18 14:30:36.206+00	2026-05-12 10:53:35.811+00
\.


--
-- Data for Name: feedback_forms_blocks_choice_input; Type: TABLE DATA; Schema: public; Owner: -
--

COPY "public"."feedback_forms_blocks_choice_input" ("_order", "_parent_id", "_path", "id", "name", "label", "ui_type", "is_required", "block_name") FROM stdin;
2	1	fields	69e60c210f66082f6408cc79	overall_course_rating	Overall rating of the Fire Prevention and Fire Fighting course	radio	f	\N
\.


--
-- Data for Name: feedback_forms_blocks_choice_input_options; Type: TABLE DATA; Schema: public; Owner: -
--

COPY "public"."feedback_forms_blocks_choice_input_options" ("_order", "_parent_id", "id", "label", "value") FROM stdin;
1	69e60c210f66082f6408cc79	69e60c260f66082f6408cc7b	Poor	poor
2	69e60c210f66082f6408cc79	69e60c290f66082f6408cc7d	Fair	fair
3	69e60c210f66082f6408cc79	69e60c2b0f66082f6408cc7f	Good	good
4	69e60c210f66082f6408cc79	69e60e720f66082f6408cc91	Very Good	very_good
5	69e60c210f66082f6408cc79	69e60e7a0f66082f6408cc93	Excellent	excellent
\.


--
-- Data for Name: feedback_forms_blocks_survey_matrix; Type: TABLE DATA; Schema: public; Owner: -
--

COPY "public"."feedback_forms_blocks_survey_matrix" ("_order", "_parent_id", "_path", "id", "name", "question", "is_required", "block_name") FROM stdin;
1	1	fields	69e60be70f66082f6408cc71	fire_safety_evaluation_matrix	Please rate your level of agreement with the following statements regarding the Fire Prevention and Fire Fighting course.	f	\N
\.


--
-- Data for Name: feedback_forms_blocks_survey_matrix_columns; Type: TABLE DATA; Schema: public; Owner: -
--

COPY "public"."feedback_forms_blocks_survey_matrix_columns" ("_order", "_parent_id", "id", "label", "value") FROM stdin;
1	69e60be70f66082f6408cc71	69e60d150f66082f6408cc83	Strongly Disagree	strongly_disagree
2	69e60be70f66082f6408cc71	69e60d490f66082f6408cc85	Disagree	disagree
3	69e60be70f66082f6408cc71	69e60d500f66082f6408cc87	Neutral	neutral
4	69e60be70f66082f6408cc71	69e60d5d0f66082f6408cc89	Agree	agree
5	69e60be70f66082f6408cc71	69e60d7f0f66082f6408cc8b	Strongly Agree	strongly_agree
\.


--
-- Data for Name: feedback_forms_blocks_survey_matrix_rows; Type: TABLE DATA; Schema: public; Owner: -
--

COPY "public"."feedback_forms_blocks_survey_matrix_rows" ("_order", "_parent_id", "id", "statement", "value") FROM stdin;
1	69e60be70f66082f6408cc71	69e60c0a0f66082f6408cc73	The course improved my understanding of fire prevention procedures onboard ships.	fire_prevention_understanding
2	69e60be70f66082f6408cc71	69e60c100f66082f6408cc75	The fire fighting drills were realistic and helped me understand real emergency situations.	drill_realism
3	69e60be70f66082f6408cc71	69e60c140f66082f6408cc77	I am confident in operating fire extinguishers and onboard fire safety equipment.	equipment_confidence
4	69e60be70f66082f6408cc71	69e60ded0f66082f6408cc8d	The instructor delivered clear and practical explanations of fire safety procedures.	instructor_effectiveness
5	69e60be70f66082f6408cc71	69e60dfa0f66082f6408cc8f	The training improved my ability to respond quickly during onboard fire emergencies.	emergency_response_skill
\.


--
-- Data for Name: feedback_forms_blocks_text_input; Type: TABLE DATA; Schema: public; Owner: -
--

COPY "public"."feedback_forms_blocks_text_input" ("_order", "_parent_id", "_path", "id", "name", "label", "placeholder", "format", "is_required", "block_name") FROM stdin;
3	1	fields	69e60c2f0f66082f6408cc81	course_feedback_comments	Additional Comments or Suggestions	Share your experience, suggestions for improvement, or comments about the training, instructors, or facilities.	textarea	f	\N
\.


--
-- Data for Name: feedback_submissions; Type: TABLE DATA; Schema: public; Owner: -
--

COPY "public"."feedback_submissions" ("id", "form_id", "course_id", "trainee_id", "responses", "updated_at", "created_at") FROM stdin;
1	1	2	2	{"overall_course_rating": "fair", "course_feedback_comments": "The Fire Prevention and Fire Fighting course was highly informative and practical. The training provided a clear understanding of onboard fire hazards and how to prevent them effectively. The hands-on drills were especially valuable, as they simulated real emergency situations and helped build confidence in using fire extinguishers and other firefighting equipment.\\n\\nThe instructor explained procedures in a clear and structured way, making it easy to follow even complex safety protocols. I also appreciated the emphasis on teamwork and quick response during emergency scenarios, which is very important in a maritime environment.\\n\\nOverall, the course significantly improved my readiness for onboard emergencies. A possible improvement would be to include more advanced simulation scenarios or longer practical drill sessions to further enhance real-world preparedness.", "fire_safety_evaluation_matrix": {"drill_realism": "disagree", "equipment_confidence": "strongly_disagree", "emergency_response_skill": "strongly_disagree", "instructor_effectiveness": "strongly_disagree", "fire_prevention_understanding": "strongly_disagree"}}	2026-04-20 13:11:51.249+00	2026-04-20 13:11:51.249+00
\.


--
-- Data for Name: lesson_materials; Type: TABLE DATA; Schema: public; Owner: -
--

COPY "public"."lesson_materials" ("id", "lesson_id", "material_id", "order", "is_required", "updated_at", "created_at") FROM stdin;
4	1	2	2	f	2026-04-11 13:13:57.769+00	2026-04-11 11:25:43.419+00
5	1	4	1	f	2026-04-11 13:13:57.904+00	2026-04-11 13:13:57.904+00
\.


--
-- Data for Name: materials_rels; Type: TABLE DATA; Schema: public; Owner: -
--

COPY "public"."materials_rels" ("id", "order", "parent_id", "path", "media_id") FROM stdin;
1	1	1	media	25
2	2	1	media	6
4	1	2	media	47
5	1	3	media	52
6	1	4	media	52
7	2	4	media	47
8	3	4	media	4
\.


--
-- Data for Name: notification_templates; Type: TABLE DATA; Schema: public; Owner: -
--

COPY "public"."notification_templates" ("id", "name", "code", "category", "title_template", "body_template", "default_link", "automatic", "manual", "metadata_schema", "updated_at", "created_at") FROM stdin;
1	Course Enrolled	COURSE_ENROLLED	learning	🎓 Welcome to {{courseName}}!	You have been successfully enrolled in {{courseName}}. Start learning now!	/portal/courses/{{courseId}}	t	f	{"type": "object", "properties": {"courseId": {"type": "number"}, "courseName": {"type": "string"}, "enrollmentId": {"type": "number"}, "enrollmentType": {"type": "string"}}}	2026-04-27 12:24:55.75+00	2026-04-27 12:24:55.689+00
\.


--
-- Data for Name: notification_templates_channels; Type: TABLE DATA; Schema: public; Owner: -
--

COPY "public"."notification_templates_channels" ("order", "parent_id", "value", "id") FROM stdin;
1	1	in-app	1
\.


--
-- Data for Name: notifications; Type: TABLE DATA; Schema: public; Owner: -
--

COPY "public"."notifications" ("id", "template_id", "category", "title", "body", "metadata", "source_type", "source_id", "actor_id", "origin", "audience_type", "audience_role", "segment_definition", "scheduled_at", "expires_at", "status", "updated_at", "created_at") FROM stdin;
12	1	learning	🎓 Welcome to Tanker Familiarization (Oil & Chemical)!	You have been successfully enrolled in Tanker Familiarization (Oil & Chemical). Start learning now!	{"courseId": 7, "courseName": "Tanker Familiarization (Oil & Chemical)", "enrollmentId": 20, "enrollmentType": "free"}	enrollment	20	\N	automatic	specific-users	\N	\N	\N	\N	sent	2026-04-28 15:37:51.131+00	2026-04-28 15:37:51.131+00
13	1	learning	🎓 Welcome to High Voltage Power Systems!	You have been successfully enrolled in High Voltage Power Systems. Start learning now!	{"courseId": 4, "courseName": "High Voltage Power Systems", "enrollmentId": 21, "enrollmentType": "free"}	enrollment	21	\N	automatic	specific-users	\N	\N	\N	\N	sent	2026-04-28 15:38:03.712+00	2026-04-28 15:38:03.712+00
14	1	learning	🎓 Welcome to International COLREGs Compliance!	You have been successfully enrolled in International COLREGs Compliance. Start learning now!	{"courseId": 12, "courseName": "International COLREGs Compliance", "enrollmentId": 22, "enrollmentType": "free"}	enrollment	22	\N	automatic	specific-users	\N	\N	\N	\N	sent	2026-04-28 15:38:17.927+00	2026-04-28 15:38:17.927+00
15	1	learning	🎓 Welcome to Global Container Logistics & Supply Chain!	You have been successfully enrolled in Global Container Logistics & Supply Chain. Start learning now!	{"courseId": 9, "courseName": "Global Container Logistics & Supply Chain", "enrollmentId": 23, "enrollmentType": "free"}	enrollment	23	\N	automatic	specific-users	\N	\N	\N	\N	sent	2026-04-28 16:10:00.659+00	2026-04-28 16:10:00.659+00
16	1	learning	🎓 Welcome to Maritime Labour Convention (MLC) Rights!	You have been successfully enrolled in Maritime Labour Convention (MLC) Rights. Start learning now!	{"courseId": 10, "courseName": "Maritime Labour Convention (MLC) Rights", "enrollmentId": 24, "enrollmentType": "free"}	enrollment	24	\N	automatic	specific-users	\N	\N	\N	\N	sent	2026-04-29 02:14:57.394+00	2026-04-29 02:14:57.394+00
17	1	learning	🎓 Welcome to Engine Room Management!	You have been successfully enrolled in Engine Room Management. Start learning now!	{"courseId": 6, "courseName": "Engine Room Management", "enrollmentId": 25, "enrollmentType": "free"}	enrollment	25	\N	automatic	specific-users	\N	\N	\N	\N	sent	2026-04-29 02:20:47.502+00	2026-04-29 02:20:47.501+00
18	1	learning	🎓 Welcome to Common Rail Diesel Diagnostics!	You have been successfully enrolled in Common Rail Diesel Diagnostics. Start learning now!	{"courseId": 5, "courseName": "Common Rail Diesel Diagnostics", "enrollmentId": 26, "enrollmentType": "free"}	enrollment	26	\N	automatic	specific-users	\N	\N	\N	\N	sent	2026-04-29 02:26:50.141+00	2026-04-29 02:26:50.141+00
19	1	learning	🎓 Welcome to Elementary First Aid!	You have been successfully enrolled in Elementary First Aid. Start learning now!	{"courseId": 3, "courseName": "Elementary First Aid", "enrollmentId": 27, "enrollmentType": "free"}	enrollment	27	\N	automatic	specific-users	\N	\N	\N	\N	sent	2026-04-29 02:27:05.632+00	2026-04-29 02:27:05.632+00
20	1	learning	🎓 Welcome to Ballast Water Management & Compliance!	You have been successfully enrolled in Ballast Water Management & Compliance. Start learning now!	{"courseId": 11, "courseName": "Ballast Water Management & Compliance", "enrollmentId": 28, "enrollmentType": "free"}	enrollment	28	\N	automatic	specific-users	\N	\N	\N	\N	sent	2026-04-29 10:50:23.34+00	2026-04-29 10:50:23.339+00
21	1	learning	🎓 Welcome to Tanker Familiarization (Oil & Chemical)!	You have been successfully enrolled in Tanker Familiarization (Oil & Chemical). Start learning now!	{"courseId": 7, "courseName": "Tanker Familiarization (Oil & Chemical)", "enrollmentId": 29, "enrollmentType": "free"}	enrollment	29	\N	automatic	specific-users	\N	\N	\N	\N	sent	2026-04-29 11:00:42.146+00	2026-04-29 11:00:42.146+00
22	1	learning	🎓 Welcome to High Voltage Power Systems!	You have been successfully enrolled in High Voltage Power Systems. Start learning now!	{"courseId": 4, "courseName": "High Voltage Power Systems", "enrollmentId": 30, "enrollmentType": "free"}	enrollment	30	\N	automatic	specific-users	\N	\N	\N	\N	sent	2026-04-29 11:01:06.811+00	2026-04-29 11:01:06.811+00
23	1	learning	🎓 Welcome to Common Rail Diesel Diagnostics!	You have been successfully enrolled in Common Rail Diesel Diagnostics. Start learning now!	{"courseId": 5, "courseName": "Common Rail Diesel Diagnostics", "enrollmentId": 31, "enrollmentType": "free"}	enrollment	31	\N	automatic	specific-users	\N	\N	\N	\N	sent	2026-04-29 14:48:23.703+00	2026-04-29 14:48:23.703+00
24	1	learning	🎓 Welcome to Global Container Logistics & Supply Chain!	You have been successfully enrolled in Global Container Logistics & Supply Chain. Start learning now!	{"courseId": 9, "courseName": "Global Container Logistics & Supply Chain", "enrollmentId": 32, "enrollmentType": "free"}	enrollment	32	\N	automatic	specific-users	\N	\N	\N	\N	sent	2026-04-29 14:48:47.999+00	2026-04-29 14:48:47.999+00
25	1	learning	🎓 Welcome to Advanced Cargo Handling & Stability!	You have been successfully enrolled in Advanced Cargo Handling & Stability. Start learning now!	{"courseId": 8, "courseName": "Advanced Cargo Handling & Stability", "enrollmentId": 33, "enrollmentType": "free"}	enrollment	33	\N	automatic	specific-users	\N	\N	\N	\N	sent	2026-05-07 01:19:11.746+00	2026-05-07 01:19:11.746+00
26	1	learning	🎓 Welcome to Ballast Water Management & Compliance!	You have been successfully enrolled in Ballast Water Management & Compliance. Start learning now!	{"courseId": 11, "courseName": "Ballast Water Management & Compliance", "enrollmentId": 34, "enrollmentType": "free"}	enrollment	34	\N	automatic	specific-users	\N	\N	\N	\N	sent	2026-05-07 01:19:50.723+00	2026-05-07 01:19:50.723+00
27	1	learning	🎓 Welcome to Global Container Logistics & Supply Chain!	You have been successfully enrolled in Global Container Logistics & Supply Chain. Start learning now!	{"courseId": 9, "courseName": "Global Container Logistics & Supply Chain", "enrollmentId": 35, "enrollmentType": "free"}	enrollment	35	\N	automatic	specific-users	\N	\N	\N	\N	sent	2026-05-07 12:11:57.933+00	2026-05-07 12:11:57.932+00
28	1	learning	🎓 Welcome to Tanker Familiarization (Oil & Chemical)!	You have been successfully enrolled in Tanker Familiarization (Oil & Chemical). Start learning now!	{"courseId": 7, "courseName": "Tanker Familiarization (Oil & Chemical)", "enrollmentId": 36, "enrollmentType": "free"}	enrollment	36	\N	automatic	specific-users	\N	\N	\N	\N	sent	2026-05-07 12:13:08.12+00	2026-05-07 12:13:08.12+00
29	1	learning	🎓 Welcome to International COLREGs Compliance!	You have been successfully enrolled in International COLREGs Compliance. Start learning now!	{"courseId": 12, "courseName": "International COLREGs Compliance", "enrollmentId": 37, "enrollmentType": "free"}	enrollment	37	\N	automatic	specific-users	\N	\N	\N	\N	sent	2026-05-07 12:13:36.707+00	2026-05-07 12:13:36.706+00
30	1	learning	🎓 Welcome to Elementary First Aid!	You have been successfully enrolled in Elementary First Aid. Start learning now!	{"courseId": 3, "courseName": "Elementary First Aid", "enrollmentId": 38, "enrollmentType": "free"}	enrollment	38	\N	automatic	specific-users	\N	\N	\N	\N	sent	2026-05-14 14:27:06.277+00	2026-05-14 14:27:06.277+00
31	1	learning	🎓 Welcome to International COLREGs Compliance!	You have been successfully enrolled in International COLREGs Compliance. Start learning now!	{"courseId": 12, "courseName": "International COLREGs Compliance", "enrollmentId": 39, "enrollmentType": "free"}	enrollment	39	\N	automatic	specific-users	\N	\N	\N	\N	sent	2026-05-16 11:00:11.124+00	2026-05-16 11:00:11.124+00
32	1	learning	🎓 Welcome to Maritime Labour Convention (MLC) Rights!	You have been successfully enrolled in Maritime Labour Convention (MLC) Rights. Start learning now!	{"courseId": 10, "courseName": "Maritime Labour Convention (MLC) Rights", "enrollmentId": 40, "enrollmentType": "free"}	enrollment	40	\N	automatic	specific-users	\N	\N	\N	\N	sent	2026-05-16 11:03:00.853+00	2026-05-16 11:03:00.852+00
33	1	learning	🎓 Welcome to Global Container Logistics & Supply Chain!	You have been successfully enrolled in Global Container Logistics & Supply Chain. Start learning now!	{"courseId": 9, "courseName": "Global Container Logistics & Supply Chain", "enrollmentId": 41, "enrollmentType": "free"}	enrollment	41	\N	automatic	specific-users	\N	\N	\N	\N	sent	2026-05-17 00:51:59.972+00	2026-05-17 00:51:59.972+00
34	1	learning	🎓 Welcome to Advanced Cargo Handling & Stability!	You have been successfully enrolled in Advanced Cargo Handling & Stability. Start learning now!	{"courseId": 8, "courseName": "Advanced Cargo Handling & Stability", "enrollmentId": 42, "enrollmentType": "free"}	enrollment	42	\N	automatic	specific-users	\N	\N	\N	\N	sent	2026-05-18 06:51:53.971+00	2026-05-18 06:51:53.971+00
35	1	learning	🎓 Welcome to Global Container Logistics & Supply Chain!	You have been successfully enrolled in Global Container Logistics & Supply Chain. Start learning now!	{"courseId": 9, "courseName": "Global Container Logistics & Supply Chain", "enrollmentId": 43, "enrollmentType": "free"}	enrollment	43	\N	automatic	specific-users	\N	\N	\N	\N	sent	2026-05-18 08:48:58.73+00	2026-05-18 08:48:58.729+00
36	1	learning	🎓 Welcome to International COLREGs Compliance!	You have been successfully enrolled in International COLREGs Compliance. Start learning now!	{"courseId": 12, "courseName": "International COLREGs Compliance", "enrollmentId": 44, "enrollmentType": "free"}	enrollment	44	\N	automatic	specific-users	\N	\N	\N	\N	sent	2026-05-18 09:19:11.887+00	2026-05-18 09:19:11.887+00
37	1	learning	🎓 Welcome to Engine Room Management!	You have been successfully enrolled in Engine Room Management. Start learning now!	{"courseId": 6, "courseName": "Engine Room Management", "enrollmentId": 45, "enrollmentType": "free"}	enrollment	45	\N	automatic	specific-users	\N	\N	\N	\N	sent	2026-05-18 09:19:52.952+00	2026-05-18 09:19:52.952+00
38	1	learning	🎓 Welcome to International COLREGs Compliance!	You have been successfully enrolled in International COLREGs Compliance. Start learning now!	{"courseId": 12, "courseName": "International COLREGs Compliance", "enrollmentId": 46, "enrollmentType": "free"}	enrollment	46	\N	automatic	specific-users	\N	\N	\N	\N	sent	2026-05-18 09:46:14.672+00	2026-05-18 09:46:14.672+00
39	1	learning	🎓 Welcome to Global Container Logistics & Supply Chain!	You have been successfully enrolled in Global Container Logistics & Supply Chain. Start learning now!	{"courseId": 9, "courseName": "Global Container Logistics & Supply Chain", "enrollmentId": 47, "enrollmentType": "free"}	enrollment	47	\N	automatic	specific-users	\N	\N	\N	\N	sent	2026-05-18 09:52:16.746+00	2026-05-18 09:52:16.746+00
40	1	learning	🎓 Welcome to International COLREGs Compliance!	You have been successfully enrolled in International COLREGs Compliance. Start learning now!	{"courseId": 12, "courseName": "International COLREGs Compliance", "enrollmentId": 48, "enrollmentType": "free"}	enrollment	48	\N	automatic	specific-users	\N	\N	\N	\N	sent	2026-05-18 10:07:36.45+00	2026-05-18 10:07:36.45+00
41	1	learning	🎓 Welcome to Ballast Water Management & Compliance!	You have been successfully enrolled in Ballast Water Management & Compliance. Start learning now!	{"courseId": 11, "courseName": "Ballast Water Management & Compliance", "enrollmentId": 49, "enrollmentType": "free"}	enrollment	49	\N	automatic	specific-users	\N	\N	\N	\N	sent	2026-05-18 17:15:04.249+00	2026-05-18 17:15:04.248+00
42	1	learning	🎓 Welcome to Common Rail Diesel Diagnostics!	You have been successfully enrolled in Common Rail Diesel Diagnostics. Start learning now!	{"courseId": 5, "courseName": "Common Rail Diesel Diagnostics", "enrollmentId": 52, "enrollmentType": "free"}	enrollment	52	\N	automatic	specific-users	\N	\N	\N	\N	sent	2026-05-19 09:43:16.662+00	2026-05-19 09:43:16.662+00
43	\N	learning	📝 Enrollment Request Received: International COLREGs Compliance	Your enrollment request for International COLREGs Compliance has been received and is now pending review. We will notify you once it is approved.	{"courseId": 12, "courseName": "International COLREGs Compliance", "enrollmentId": 53, "enrollmentType": "paid", "enrollmentStatus": "pending"}	enrollment	53	\N	automatic	specific-users	\N	\N	\N	\N	sent	2026-05-19 10:22:24.754+00	2026-05-19 10:22:24.754+00
44	\N	learning	📝 Enrollment Request Received: International COLREGs Compliance	Your enrollment request for International COLREGs Compliance has been received and is now pending review. We will notify you once it is approved.	{"courseId": 12, "courseName": "International COLREGs Compliance", "enrollmentId": 54, "enrollmentType": "paid", "enrollmentStatus": "pending"}	enrollment	54	\N	automatic	specific-users	\N	\N	\N	\N	sent	2026-05-19 10:35:12.629+00	2026-05-19 10:35:12.628+00
45	\N	learning	📝 Enrollment Request Received: International COLREGs Compliance	Your enrollment request for International COLREGs Compliance has been received and is now pending review. We will notify you once it is approved.	{"courseId": 12, "courseName": "International COLREGs Compliance", "enrollmentId": 55, "enrollmentType": "paid", "enrollmentStatus": "pending"}	enrollment	55	\N	automatic	specific-users	\N	\N	\N	\N	sent	2026-05-19 10:44:52.082+00	2026-05-19 10:44:52.082+00
46	1	learning	🎓 Welcome to Ballast Water Management & Compliance!	You have been successfully enrolled in Ballast Water Management & Compliance. Start learning now!	{"courseId": 11, "courseName": "Ballast Water Management & Compliance", "enrollmentId": 56, "enrollmentType": "free", "enrollmentStatus": "active"}	enrollment	56	\N	automatic	specific-users	\N	\N	\N	\N	sent	2026-05-19 10:47:12.648+00	2026-05-19 10:47:12.647+00
47	\N	learning	📝 Enrollment Request Received: Advanced Cargo Handling & Stability	Your enrollment request for Advanced Cargo Handling & Stability has been received and is now pending review. We will notify you once it is approved.	{"courseId": 8, "courseName": "Advanced Cargo Handling & Stability", "enrollmentId": 57, "enrollmentType": "paid", "enrollmentStatus": "pending"}	enrollment	57	\N	automatic	specific-users	\N	\N	\N	\N	sent	2026-05-19 10:48:53.887+00	2026-05-19 10:48:53.887+00
48	\N	learning	📝 Enrollment Request Received: Personal Survival Techniques	Your enrollment request for Personal Survival Techniques has been received and is now pending review. We will notify you once it is approved.	{"courseId": 1, "courseName": "Personal Survival Techniques", "enrollmentId": 58, "enrollmentType": "free", "enrollmentStatus": "pending"}	enrollment	58	\N	automatic	specific-users	\N	\N	\N	\N	sent	2026-05-19 10:58:05.12+00	2026-05-19 10:58:05.12+00
49	\N	learning	📝 Enrollment Request Received: Personal Survival Techniques	Your enrollment request for Personal Survival Techniques has been received and is now pending review. We will notify you once it is approved.	{"courseId": 1, "courseName": "Personal Survival Techniques", "enrollmentId": 59, "enrollmentType": "paid", "enrollmentStatus": "pending"}	enrollment	59	\N	automatic	specific-users	\N	\N	\N	\N	sent	2026-05-19 11:03:17.779+00	2026-05-19 11:03:17.779+00
50	\N	learning	📝 Enrollment Request Received: High Voltage Power Systems	Your enrollment request for High Voltage Power Systems has been received and is now pending review. We will notify you once it is approved.	{"courseId": 4, "courseName": "High Voltage Power Systems", "enrollmentId": 60, "enrollmentType": "paid", "enrollmentStatus": "pending"}	enrollment	60	\N	automatic	specific-users	\N	\N	\N	\N	sent	2026-05-19 16:08:31.527+00	2026-05-19 16:08:31.527+00
51	\N	learning	📝 Enrollment Request Received: Common Rail Diesel Diagnostics	Your enrollment request for Common Rail Diesel Diagnostics has been received and is now pending review. We will notify you once it is approved.	{"courseId": 5, "courseName": "Common Rail Diesel Diagnostics", "enrollmentId": 61, "enrollmentType": "free", "enrollmentStatus": "pending"}	enrollment	61	\N	automatic	specific-users	\N	\N	\N	\N	sent	2026-05-21 12:31:00.141+00	2026-05-21 12:31:00.141+00
\.


--
-- Data for Name: notifications_rels; Type: TABLE DATA; Schema: public; Owner: -
--

COPY "public"."notifications_rels" ("id", "order", "parent_id", "path", "users_id") FROM stdin;
\.


--
-- Data for Name: payload_kv; Type: TABLE DATA; Schema: public; Owner: -
--

COPY "public"."payload_kv" ("id", "key", "data") FROM stdin;
\.


--
-- Data for Name: payload_locked_documents; Type: TABLE DATA; Schema: public; Owner: -
--

COPY "public"."payload_locked_documents" ("id", "global_slug", "updated_at", "created_at") FROM stdin;
185	\N	2026-05-19 16:17:32.641+00	2026-05-19 16:17:32.641+00
186	\N	2026-05-19 16:18:17.928+00	2026-05-19 16:18:17.928+00
188	\N	2026-05-21 02:09:23.241+00	2026-05-21 02:09:23.24+00
\.


--
-- Data for Name: recently_viewed_courses; Type: TABLE DATA; Schema: public; Owner: -
--

COPY "public"."recently_viewed_courses" ("id", "user_id", "course_id", "viewed_at", "view_count", "composite_key", "updated_at", "created_at") FROM stdin;
7	2	10	2026-05-19 10:33:58.43+00	25	2:10	2026-05-19 10:33:59.098+00	2026-04-07 12:14:42.051+00
9	2	3	2026-05-19 10:34:08.29+00	3	2:3	2026-05-19 10:34:08.788+00	2026-04-07 19:51:03.479+00
16	2	12	2026-05-19 10:41:00.129+00	6	2:12	2026-05-19 10:41:00.55+00	2026-05-07 11:13:49.556+00
3	2	2	2026-05-19 10:47:39.559+00	7	2:2	2026-05-19 10:47:40.02+00	2026-04-07 09:08:08.848+00
15	2	7	2026-05-19 22:04:40.758+00	14	2:7	2026-05-19 22:04:41.429+00	2026-05-06 16:45:50.447+00
1	2	1	2026-05-19 23:13:03.335+00	12	2:1	2026-05-19 23:13:03.809+00	2026-04-05 12:39:08.945+00
5	2	6	2026-05-19 23:18:44.008+00	3	2:6	2026-05-19 23:18:44.466+00	2026-04-07 12:06:45.954+00
13	2	9	2026-05-19 09:11:26.965+00	2	2:9	2026-05-19 09:11:27.923+00	2026-04-13 11:09:48.704+00
11	2	8	2026-05-19 23:23:57.222+00	6	2:8	2026-05-19 23:23:57.812+00	2026-04-13 03:47:37.047+00
10	2	4	2026-05-19 09:45:23.743+00	8	2:4	2026-05-19 09:45:24.271+00	2026-04-07 19:58:57.632+00
\.


--
-- Data for Name: submission_answers; Type: TABLE DATA; Schema: public; Owner: -
--

COPY "public"."submission_answers" ("id", "submission_id", "question_id", "question_type", "response", "is_correct", "points_earned", "feedback", "updated_at", "created_at", "is_feedback_read") FROM stdin;
2	1	1	single_choice	{"value": "69d8dffc4932dc3bd348533e"}	f	0	\N	2026-04-10 12:53:44.454+00	2026-04-10 12:53:42.638+00	f
4	1	2	single_choice	{"value": "69d8e07c4932dc3bd3485346"}	f	0	\N	2026-04-10 12:53:45.758+00	2026-04-10 12:53:45.758+00	f
6	1	3	multiple_choice	{"value": ["69d8e14b4932dc3bd348534c"]}	f	0	\N	2026-04-10 12:53:47.319+00	2026-04-10 12:53:47.319+00	f
8	1	4	multiple_choice	{"value": ["69d8e1af4932dc3bd3485356"]}	f	0	\N	2026-04-10 12:53:48.978+00	2026-04-10 12:53:48.977+00	f
9	1	4	multiple_choice	{"value": ["69d8e1af4932dc3bd3485356", "69d8e1c14932dc3bd3485358"]}	f	0	\N	2026-04-10 12:53:49.522+00	2026-04-10 12:53:49.522+00	f
10	1	4	multiple_choice	{"value": ["69d8e1af4932dc3bd3485356", "69d8e1c14932dc3bd3485358"]}	f	0	\N	2026-04-10 12:53:49.547+00	2026-04-10 12:53:49.547+00	f
12	1	5	true_false	{"value": "69d8e32f78ed060f3cafb1c3"}	f	0	\N	2026-04-10 12:53:52.305+00	2026-04-10 12:53:52.305+00	f
3	1	2	single_choice	{"value": "69d8e07c4932dc3bd3485346"}	t	1	\N	2026-04-10 12:53:54.365+00	2026-04-10 12:53:45.646+00	f
5	1	3	multiple_choice	{"value": ["69d8e14b4932dc3bd348534c"]}	f	0	\N	2026-04-10 12:53:54.366+00	2026-04-10 12:53:47.291+00	f
1	1	1	single_choice	{"value": "69d8dffc4932dc3bd348533e"}	t	1	\N	2026-04-10 12:53:54.373+00	2026-04-10 12:53:42.637+00	f
7	1	4	multiple_choice	{"value": ["69d8e1af4932dc3bd3485356", "69d8e1c14932dc3bd3485358", "69d8e1ac4932dc3bd3485354"]}	t	1	\N	2026-04-10 12:53:54.416+00	2026-04-10 12:53:48.892+00	f
11	1	5	true_false	{"value": "69d8e32f78ed060f3cafb1c3"}	t	1	\N	2026-04-10 12:53:54.451+00	2026-04-10 12:53:52.298+00	f
14	2	6	single_choice	{"value": "69d8e73c4932dc3bd348535c"}	f	0	\N	2026-04-10 12:54:59.932+00	2026-04-10 12:54:59.931+00	f
16	2	7	single_choice	{"value": "69d8e78d4932dc3bd3485366"}	f	0	\N	2026-04-10 12:55:02.199+00	2026-04-10 12:55:02.199+00	f
18	2	8	multiple_choice	{"value": ["69d8e9314932dc3bd3485370"]}	f	0	\N	2026-04-10 12:55:04.606+00	2026-04-10 12:55:04.606+00	f
19	2	8	multiple_choice	{"value": ["69d8e9314932dc3bd3485370", "69d8e9254932dc3bd348536e"]}	f	0	\N	2026-04-10 12:55:04.928+00	2026-04-10 12:55:04.928+00	f
20	2	8	multiple_choice	{"value": ["69d8e9314932dc3bd3485370", "69d8e9254932dc3bd348536e"]}	f	0	\N	2026-04-10 12:55:04.935+00	2026-04-10 12:55:04.935+00	f
21	2	8	multiple_choice	{"value": ["69d8e9314932dc3bd3485370", "69d8e9254932dc3bd348536e", "69d8e9234932dc3bd348536c"]}	f	0	\N	2026-04-10 12:55:05.304+00	2026-04-10 12:55:05.304+00	f
22	2	8	multiple_choice	{"value": ["69d8e9314932dc3bd3485370", "69d8e9254932dc3bd348536e", "69d8e9234932dc3bd348536c"]}	f	0	\N	2026-04-10 12:55:05.335+00	2026-04-10 12:55:05.335+00	f
24	2	9	multiple_choice	{"value": ["69d8ea294932dc3bd3485374"]}	f	0	\N	2026-04-10 12:55:06.933+00	2026-04-10 12:55:06.933+00	f
25	2	9	multiple_choice	{"value": ["69d8ea294932dc3bd3485374", "69d8ea2c4932dc3bd3485376"]}	f	0	\N	2026-04-10 12:55:07.09+00	2026-04-10 12:55:07.09+00	f
26	2	9	multiple_choice	{"value": ["69d8ea294932dc3bd3485374", "69d8ea2c4932dc3bd3485376"]}	f	0	\N	2026-04-10 12:55:07.123+00	2026-04-10 12:55:07.123+00	f
27	2	9	multiple_choice	{"value": ["69d8ea294932dc3bd3485374", "69d8ea2c4932dc3bd3485376", "69d8ea344932dc3bd3485378"]}	f	0	\N	2026-04-10 12:55:07.48+00	2026-04-10 12:55:07.48+00	f
28	2	9	multiple_choice	{"value": ["69d8ea294932dc3bd3485374", "69d8ea2c4932dc3bd3485376", "69d8ea344932dc3bd3485378"]}	f	0	\N	2026-04-10 12:55:07.557+00	2026-04-10 12:55:07.557+00	f
30	2	10	true_false	{"value": "69d8eaa778ed060f3cafb1c4"}	f	0	\N	2026-04-10 12:55:09.043+00	2026-04-10 12:55:09.043+00	f
29	2	10	true_false	{"value": "69d8eaa778ed060f3cafb1c4"}	t	1	\N	2026-04-10 12:55:10.227+00	2026-04-10 12:55:08.943+00	f
23	2	9	multiple_choice	{"value": ["69d8ea294932dc3bd3485374", "69d8ea2c4932dc3bd3485376", "69d8ea344932dc3bd3485378"]}	t	1	\N	2026-04-10 12:55:10.226+00	2026-04-10 12:55:06.822+00	f
13	2	6	single_choice	{"value": "69d8e73c4932dc3bd348535c"}	f	0	\N	2026-04-10 12:55:10.228+00	2026-04-10 12:54:59.875+00	f
17	2	8	multiple_choice	{"value": ["69d8e9314932dc3bd3485370", "69d8e9254932dc3bd348536e", "69d8e9234932dc3bd348536c"]}	t	1	\N	2026-04-10 12:55:10.236+00	2026-04-10 12:55:04.541+00	f
15	2	7	single_choice	{"value": "69d8e78d4932dc3bd3485366"}	t	1	\N	2026-04-10 12:55:10.305+00	2026-04-10 12:55:02.137+00	f
32	3	11	single_choice	{"value": "69d8eaf74932dc3bd348537c"}	f	0	\N	2026-04-10 12:55:40.719+00	2026-04-10 12:55:40.719+00	f
34	3	12	single_choice	{"value": "69d8ec314932dc3bd3485384"}	f	0	\N	2026-04-10 12:55:42.524+00	2026-04-10 12:55:42.524+00	f
36	3	13	multiple_choice	{"value": ["69d8ed824932dc3bd348538c"]}	f	0	\N	2026-04-10 12:55:44.014+00	2026-04-10 12:55:44.014+00	f
38	3	14	multiple_choice	{"value": ["69d8edf74932dc3bd3485394"]}	f	0	\N	2026-04-10 12:55:45.795+00	2026-04-10 12:55:45.795+00	f
40	3	15	true_false	{"value": "69d8ee5478ed060f3cafb1c8"}	f	0	\N	2026-04-10 12:55:47.547+00	2026-04-10 12:55:47.547+00	f
31	3	11	single_choice	{"value": "69d8eaf74932dc3bd348537c"}	f	0	\N	2026-04-10 12:55:48.711+00	2026-04-10 12:55:40.528+00	f
37	3	14	multiple_choice	{"value": ["69d8edf74932dc3bd3485394"]}	f	0	\N	2026-04-10 12:55:48.719+00	2026-04-10 12:55:45.723+00	f
39	3	15	true_false	{"value": "69d8ee5478ed060f3cafb1c8"}	f	0	\N	2026-04-10 12:55:48.718+00	2026-04-10 12:55:47.466+00	f
35	3	13	multiple_choice	{"value": ["69d8ed824932dc3bd348538c"]}	f	0	\N	2026-04-10 12:55:48.725+00	2026-04-10 12:55:43.928+00	f
33	3	12	single_choice	{"value": "69d8ec314932dc3bd3485384"}	f	0	\N	2026-04-10 12:55:48.787+00	2026-04-10 12:55:42.447+00	f
42	4	1	single_choice	{"value": "69d8dffc4932dc3bd348533e"}	f	0	\N	2026-04-10 12:56:09.935+00	2026-04-10 12:56:09.935+00	f
44	4	2	single_choice	{"value": "69d8e07c4932dc3bd3485346"}	f	0	\N	2026-04-10 12:56:13.035+00	2026-04-10 12:56:13.035+00	f
46	4	3	multiple_choice	{"value": ["69d8e14b4932dc3bd348534c"]}	f	0	\N	2026-04-10 12:56:19.357+00	2026-04-10 12:56:19.357+00	f
47	4	3	multiple_choice	{"value": ["69d8e14b4932dc3bd348534c", "69d8e1574932dc3bd348534e"]}	f	0	\N	2026-04-10 12:56:19.702+00	2026-04-10 12:56:19.702+00	f
48	4	3	multiple_choice	{"value": ["69d8e14b4932dc3bd348534c", "69d8e1574932dc3bd348534e"]}	f	0	\N	2026-04-10 12:56:19.7+00	2026-04-10 12:56:19.7+00	f
50	4	4	multiple_choice	{"value": ["69d8e1af4932dc3bd3485356"]}	f	0	\N	2026-04-10 12:56:23.086+00	2026-04-10 12:56:23.086+00	f
51	4	4	multiple_choice	{"value": ["69d8e1af4932dc3bd3485356", "69d8e1ac4932dc3bd3485354"]}	f	0	\N	2026-04-10 12:56:23.195+00	2026-04-10 12:56:23.195+00	f
52	4	4	multiple_choice	{"value": ["69d8e1af4932dc3bd3485356", "69d8e1ac4932dc3bd3485354"]}	f	0	\N	2026-04-10 12:56:23.211+00	2026-04-10 12:56:23.21+00	f
54	4	5	true_false	{"value": "69d8e32f78ed060f3cafb1c3"}	f	0	\N	2026-04-10 12:56:27.504+00	2026-04-10 12:56:25.626+00	f
56	4	6	single_choice	{"value": "69d8e73f4932dc3bd348535e"}	f	0	\N	2026-04-10 12:56:28.636+00	2026-04-10 12:56:28.636+00	f
58	4	7	single_choice	{"value": "69d8e78a4932dc3bd3485364"}	f	0	\N	2026-04-10 12:56:30.621+00	2026-04-10 12:56:30.621+00	f
43	4	2	single_choice	{"value": "69d8e07c4932dc3bd3485346"}	t	1	\N	2026-04-10 12:56:56.48+00	2026-04-10 12:56:12.918+00	f
65	4	9	multiple_choice	{"value": ["69d8ea2c4932dc3bd3485376", "69d8ea344932dc3bd3485378"]}	f	0	\N	2026-04-10 12:56:37.343+00	2026-04-10 12:56:37.343+00	f
68	4	10	true_false	{"value": "69d8eaa778ed060f3cafb1c4"}	f	0	\N	2026-04-10 12:56:40.137+00	2026-04-10 12:56:40.137+00	f
77	4	13	multiple_choice	{"value": ["69d8ed824932dc3bd348538c", "69d8ed884932dc3bd348538e"]}	f	0	\N	2026-04-10 12:56:47.968+00	2026-04-10 12:56:47.968+00	f
80	4	14	multiple_choice	{"value": ["69d8ee014932dc3bd3485398", "69d8edf94932dc3bd3485396", "69d8edf74932dc3bd3485394"]}	f	0	\N	2026-04-10 12:56:52.566+00	2026-04-10 12:56:50.747+00	f
49	4	4	multiple_choice	{"value": ["69d8e1af4932dc3bd3485356", "69d8e1ac4932dc3bd3485354", "69d8e1c14932dc3bd3485358"]}	t	1	\N	2026-04-10 12:56:56.461+00	2026-04-10 12:56:22.983+00	f
59	4	8	multiple_choice	{"value": ["69d8e93a4932dc3bd3485372", "69d8e9234932dc3bd348536c", "69d8e9254932dc3bd348536e"]}	f	0	\N	2026-04-10 12:56:56.464+00	2026-04-10 12:56:33.423+00	f
69	4	11	single_choice	{"value": "69d8eb004932dc3bd3485380"}	t	1	\N	2026-04-10 12:56:57.631+00	2026-04-10 12:56:42.204+00	f
60	4	8	multiple_choice	{"value": ["69d8e93a4932dc3bd3485372"]}	f	0	\N	2026-04-10 12:56:33.514+00	2026-04-10 12:56:33.514+00	f
66	4	9	multiple_choice	{"value": ["69d8ea2c4932dc3bd3485376", "69d8ea344932dc3bd3485378"]}	f	0	\N	2026-04-10 12:56:37.342+00	2026-04-10 12:56:37.342+00	f
70	4	11	single_choice	{"value": "69d8eafd4932dc3bd348537e"}	f	0	\N	2026-04-10 12:56:42.237+00	2026-04-10 12:56:42.237+00	f
78	4	13	multiple_choice	{"value": ["69d8ed824932dc3bd348538c", "69d8ed884932dc3bd348538e"]}	f	0	\N	2026-04-10 12:56:47.966+00	2026-04-10 12:56:47.965+00	f
81	4	14	multiple_choice	{"value": ["69d8ee014932dc3bd3485398", "69d8edf94932dc3bd3485396"]}	f	0	\N	2026-04-10 12:56:51.406+00	2026-04-10 12:56:51.406+00	f
84	4	15	true_false	{"value": "69d8ee5478ed060f3cafb1c9"}	f	0	\N	2026-04-10 12:56:53.871+00	2026-04-10 12:56:53.871+00	f
67	4	10	true_false	{"value": "69d8eaa778ed060f3cafb1c4"}	t	1	\N	2026-04-10 12:56:57.634+00	2026-04-10 12:56:40.101+00	f
79	4	14	multiple_choice	{"value": ["69d8ee014932dc3bd3485398", "69d8edf94932dc3bd3485396", "69d8edf74932dc3bd3485394"]}	f	0	\N	2026-04-10 12:56:57.824+00	2026-04-10 12:56:50.676+00	f
61	4	8	multiple_choice	{"value": ["69d8e93a4932dc3bd3485372", "69d8e9234932dc3bd348536c"]}	f	0	\N	2026-04-10 12:56:33.873+00	2026-04-10 12:56:33.873+00	f
64	4	9	multiple_choice	{"value": ["69d8ea2c4932dc3bd3485376", "69d8ea344932dc3bd3485378", "69d8ea294932dc3bd3485374"]}	f	0	\N	2026-04-10 12:56:38.701+00	2026-04-10 12:56:36.904+00	f
71	4	11	single_choice	{"value": "69d8eb004932dc3bd3485380"}	f	0	\N	2026-04-10 12:56:42.579+00	2026-04-10 12:56:42.579+00	f
41	4	1	single_choice	{"value": "69d8dffc4932dc3bd348533e"}	t	1	\N	2026-04-10 12:56:56.512+00	2026-04-10 12:56:09.721+00	f
73	4	12	single_choice	{"value": "69d8ec344932dc3bd3485386"}	t	1	\N	2026-04-10 12:56:57.633+00	2026-04-10 12:56:44.591+00	f
75	4	13	multiple_choice	{"value": ["69d8ed824932dc3bd348538c", "69d8ed884932dc3bd348538e", "69d8ed9a4932dc3bd3485392"]}	t	1	\N	2026-04-10 12:56:57.716+00	2026-04-10 12:56:47.426+00	f
62	4	8	multiple_choice	{"value": ["69d8e93a4932dc3bd3485372", "69d8e9234932dc3bd348536c"]}	f	0	\N	2026-04-10 12:56:33.893+00	2026-04-10 12:56:33.893+00	f
72	4	11	single_choice	{"value": "69d8eb004932dc3bd3485380"}	f	0	\N	2026-04-10 12:56:42.589+00	2026-04-10 12:56:42.589+00	f
74	4	12	single_choice	{"value": "69d8ec344932dc3bd3485386"}	f	0	\N	2026-04-10 12:56:44.596+00	2026-04-10 12:56:44.596+00	f
76	4	13	multiple_choice	{"value": ["69d8ed824932dc3bd348538c", "69d8ed884932dc3bd348538e", "69d8ed9a4932dc3bd3485392"]}	f	0	\N	2026-04-10 12:56:49.259+00	2026-04-10 12:56:47.427+00	f
82	4	14	multiple_choice	{"value": ["69d8ee014932dc3bd3485398", "69d8edf94932dc3bd3485396"]}	f	0	\N	2026-04-10 12:56:51.423+00	2026-04-10 12:56:51.422+00	f
45	4	3	multiple_choice	{"value": ["69d8e14b4932dc3bd348534c", "69d8e1574932dc3bd348534e", "69d8e1664932dc3bd3485350"]}	t	1	\N	2026-04-10 12:56:56.478+00	2026-04-10 12:56:19.273+00	f
57	4	7	single_choice	{"value": "69d8e78a4932dc3bd3485364"}	f	0	\N	2026-04-10 12:56:56.506+00	2026-04-10 12:56:30.54+00	f
53	4	5	true_false	{"value": "69d8e32f78ed060f3cafb1c3"}	t	1	\N	2026-04-10 12:56:56.546+00	2026-04-10 12:56:25.621+00	f
55	4	6	single_choice	{"value": "69d8e73f4932dc3bd348535e"}	f	0	\N	2026-04-10 12:56:56.814+00	2026-04-10 12:56:28.552+00	f
63	4	9	multiple_choice	{"value": ["69d8ea2c4932dc3bd3485376", "69d8ea344932dc3bd3485378", "69d8ea294932dc3bd3485374"]}	t	1	\N	2026-04-10 12:56:57.093+00	2026-04-10 12:56:36.902+00	f
83	4	15	true_false	{"value": "69d8ee5478ed060f3cafb1c9"}	t	1	\N	2026-04-10 12:56:57.939+00	2026-04-10 12:56:53.861+00	f
88	5	2	single_choice	{"value": "69d8e07c4932dc3bd3485346"}	f	0	\N	2026-04-20 13:02:33.933+00	2026-04-20 13:02:33.932+00	f
91	5	3	multiple_choice	{"value": ["69d8e14b4932dc3bd348534c", "69d8e1574932dc3bd348534e"]}	f	0	\N	2026-04-20 13:02:36.315+00	2026-04-20 13:02:36.315+00	f
92	5	3	multiple_choice	{"value": ["69d8e14b4932dc3bd348534c", "69d8e1574932dc3bd348534e"]}	f	0	\N	2026-04-20 13:02:36.316+00	2026-04-20 13:02:36.316+00	f
90	5	3	multiple_choice	{"value": ["69d8e14b4932dc3bd348534c", "69d8e1574932dc3bd348534e", "69d8e1664932dc3bd3485350", "69d8e1734932dc3bd3485352"]}	f	0	\N	2026-04-20 13:02:37.733+00	2026-04-20 13:02:35.709+00	f
95	5	4	multiple_choice	{"value": ["69d8e1c14932dc3bd3485358", "69d8e1ac4932dc3bd3485354"]}	f	0	\N	2026-04-20 13:02:40.186+00	2026-04-20 13:02:40.186+00	f
94	5	4	multiple_choice	{"value": ["69d8e1c14932dc3bd3485358", "69d8e1ac4932dc3bd3485354", "69d8e1af4932dc3bd3485356"]}	f	0	\N	2026-04-20 13:02:41.186+00	2026-04-20 13:02:39.464+00	f
97	5	5	true_false	{"value": "69d8e32f78ed060f3cafb1c2"}	f	0	\N	2026-04-20 13:02:42.603+00	2026-04-20 13:02:42.603+00	f
87	5	2	single_choice	{"value": "69d8e07c4932dc3bd3485346"}	t	1	\N	2026-04-20 13:02:44.978+00	2026-04-20 13:02:33.887+00	f
89	5	3	multiple_choice	{"value": ["69d8e14b4932dc3bd348534c", "69d8e1574932dc3bd348534e", "69d8e1664932dc3bd3485350", "69d8e1734932dc3bd3485352"]}	f	0	\N	2026-04-20 13:02:44.99+00	2026-04-20 13:02:35.704+00	f
96	5	5	true_false	{"value": "69d8e32f78ed060f3cafb1c2"}	f	0	\N	2026-04-20 13:02:44.991+00	2026-04-20 13:02:42.602+00	f
85	5	1	single_choice	{"value": "69d8dff24932dc3bd348533c"}	f	0	\N	2026-04-20 13:02:44.997+00	2026-04-20 13:02:33.725+00	f
86	5	1	single_choice	{"value": "69d8dff24932dc3bd348533c"}	f	0	Okay Nice	2026-04-21 12:29:28.915+00	2026-04-20 13:02:33.727+00	f
93	5	4	multiple_choice	{"value": ["69d8e1c14932dc3bd3485358", "69d8e1ac4932dc3bd3485354", "69d8e1af4932dc3bd3485356"]}	t	1	This is a feedback from a Submission Answer	2026-04-21 12:31:29.905+00	2026-04-20 13:02:39.431+00	t
\.


--
-- Data for Name: support_tickets; Type: TABLE DATA; Schema: public; Owner: -
--

COPY "public"."support_tickets" ("id", "subject", "status", "priority", "category", "user_id", "assigned_to_id", "last_message_at", "updated_at", "created_at") FROM stdin;
3	Sample	open	medium	general	2	\N	2026-04-16 15:40:32.409+00	2026-04-16 15:40:32.619+00	2026-04-16 15:40:31.151+00
4	Unable to Access Maritime Security Discussion Forum	open	medium	general	2	\N	2026-04-22 14:07:28.359+00	2026-04-22 14:07:28.378+00	2026-04-22 14:07:27.798+00
\.


--
-- Data for Name: support_ticket_messages; Type: TABLE DATA; Schema: public; Owner: -
--

COPY "public"."support_ticket_messages" ("id", "ticket_id", "sender_id", "message", "is_internal", "updated_at", "created_at") FROM stdin;
7	3	2	{"root": {"type": "root", "format": "", "indent": 0, "version": 1, "children": [{"type": "paragraph", "format": "", "indent": 0, "version": 1, "children": [{"mode": "normal", "text": "This is a new ticket", "type": "text", "style": "", "detail": 0, "format": 0, "version": 1}], "direction": "ltr"}], "direction": "ltr"}}	f	2026-04-16 15:40:31.981+00	2026-04-16 15:40:31.98+00
8	4	2	{"root": {"type": "root", "format": "", "indent": 0, "version": 1, "children": [{"type": "paragraph", "format": "", "indent": 0, "version": 1, "children": [{"mode": "normal", "text": "Description:\\nGood day. I am currently unable to access the “Modern Challenges in Maritime Security” discussion topic in our LMS. When I try to open the forum, the page either does not load or shows an error message. Because of this, I am unable to post my response and participate in the discussion.\\n\\nSteps Taken:\\n\\nRefreshed the page multiple times\\nTried accessing the LMS using a different browser\\nChecked internet connection\\n\\nExpected Outcome:\\nI should be able to open the discussion forum and submit my response without issues.\\n\\nActual Outcome:\\nThe discussion page fails to load properly, preventing participation.\\n\\nAdditional Notes:\\nKindly assist in resolving this issue as soon as possible since the activity has a deadline. Thank you.", "type": "text", "style": "", "detail": 0, "format": 0, "version": 1}], "direction": "ltr"}], "direction": "ltr"}}	f	2026-04-22 14:07:28.258+00	2026-04-22 14:07:28.257+00
\.


--
-- Data for Name: user_events; Type: TABLE DATA; Schema: public; Owner: -
--

COPY "public"."user_events" ("id", "user_id", "event_type", "event_data", "triggered_by_id", "timestamp", "ip_address", "user_agent", "updated_at", "created_at") FROM stdin;
1	2	LOGIN_FAILED	{"source": "portal-login", "emailSent": false, "lockUntil": null, "requestId": "e4621dd9-f078-4872-9fd4-fc218dd9091b", "becameLocked": false, "emailSkipped": true, "currentAttempts": 0, "previousAttempts": 0, "reachedThreshold": false, "preferenceEnabled": true}	\N	2026-05-18 13:41:43.235+00	32.192.225.146	node	2026-05-18 13:41:43.457+00	2026-05-18 13:41:43.457+00
7	2	PASSWORD_CHANGED	{"source": "profile-password-change", "emailId": "33e96b9e-e4b0-49d7-8129-b165f2f5e4d2", "emailSent": true, "requestId": "88a719ec-72a9-4102-87c3-e928cf7d5736", "emailSkipped": false, "preferenceEnabled": true}	2	2026-05-18 14:22:52.892+00	::1	node	2026-05-18 14:22:52.959+00	2026-05-18 14:22:52.958+00
9	2	PASSWORD_CHANGED	{"source": "profile-password-change", "emailId": "08a87cb1-2127-4d78-8600-212603326c52", "emailSent": true, "requestId": "ae741c56-2402-4ce5-b882-442aaf122cc2", "emailSkipped": false, "preferenceEnabled": true}	2	2026-05-18 14:28:37.007+00	::1	node	2026-05-18 14:28:37.076+00	2026-05-18 14:28:37.076+00
10	2	PASSWORD_CHANGED	{"source": "profile-password-change", "emailId": "28fbc420-46bb-4741-b844-d22c55f76226", "emailSent": true, "requestId": "bc72e181-23a4-4dc9-a707-d0bb03b6e658", "emailSkipped": false, "preferenceEnabled": true}	2	2026-05-18 14:30:35.77+00	::1	node	2026-05-18 14:30:35.84+00	2026-05-18 14:30:35.84+00
11	2	PASSWORD_CHANGED	{"source": "profile-password-change", "emailId": "844a9d7b-e16b-46a5-8860-4ab72d4a7730", "emailSent": true, "requestId": "2b1569dc-152f-452f-bd58-b46178df91f7", "emailSkipped": false, "preferenceEnabled": true}	2	2026-05-18 17:11:49.981+00	54.86.208.252	node	2026-05-18 17:11:49.987+00	2026-05-18 17:11:49.987+00
12	2	PASSWORD_CHANGED	{"source": "profile-password-change", "emailId": "406dcec8-a5fd-44aa-89f0-a961ab79ce50", "emailSent": true, "requestId": "084001e6-b8de-403c-b147-3e73ad981e46", "emailSkipped": false, "preferenceEnabled": true}	2	2026-05-18 17:12:57.129+00	54.86.208.252	node	2026-05-18 17:12:57.132+00	2026-05-18 17:12:57.132+00
18	2	LOGIN_FAILED	{"source": "portal-login", "emailSent": false, "lockUntil": null, "requestId": "7874ec18-14cb-4a44-9783-55886f4a1ec6", "becameLocked": false, "emailSkipped": true, "currentAttempts": 0, "previousAttempts": 0, "reachedThreshold": false, "preferenceEnabled": true}	\N	2026-05-19 23:56:15.988+00	3.238.252.193	node	2026-05-19 23:56:15.991+00	2026-05-19 23:56:15.991+00
19	2	LOGIN_FAILED	{"source": "portal-login", "emailSent": false, "lockUntil": null, "requestId": "15e00562-37f3-4812-8e02-49ecd015da55", "becameLocked": false, "emailSkipped": true, "currentAttempts": 0, "previousAttempts": 0, "reachedThreshold": false, "preferenceEnabled": true}	\N	2026-05-19 23:56:44.66+00	3.238.252.193	node	2026-05-19 23:56:44.663+00	2026-05-19 23:56:44.663+00
24	1	LOGIN_SUCCESS	{"role": "admin", "source": "users.afterLogin", "requestId": "1973ab1d-6bae-4fb9-88b1-b55bf71b3a0e"}	1	2026-05-21 01:46:27.504+00	::1	node	2026-05-21 01:46:28.748+00	2026-05-21 01:46:28.748+00
25	1	LOGIN_SUCCESS	{"role": "admin", "source": "users.afterLogin", "requestId": "6f304312-324b-4ee6-b0da-8de90554e83b"}	1	2026-05-21 01:46:29.644+00	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	2026-05-21 01:46:29.725+00	2026-05-21 01:46:29.725+00
26	1	LOGIN_SUCCESS	{"role": "admin", "source": "users.afterLogin", "requestId": "6708b0f1-1891-4872-b227-2ead4b6651cc"}	1	2026-05-21 01:46:43.38+00	::1	node	2026-05-21 01:46:43.476+00	2026-05-21 01:46:43.476+00
29	4	PASSWORD_CHANGED	{"source": "user-update", "emailId": "d3e6358e-e2d8-4759-92bb-2f503c641165", "emailSent": true, "requestId": "ec8427d4-25f8-4375-b2b6-528520751980", "emailSkipped": false, "preferenceEnabled": true}	1	2026-05-21 02:20:46.582+00	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	2026-05-21 02:20:46.653+00	2026-05-21 02:20:46.653+00
32	2	LOGIN_SUCCESS	{"role": "trainee", "source": "users.afterLogin", "requestId": "f06f16f3-43d4-4f18-b095-9957beb76ae9"}	2	2026-05-21 02:28:55.594+00	Unknown	Unknown	2026-05-21 02:28:55.66+00	2026-05-21 02:28:55.66+00
33	1	LOGIN_SUCCESS	{"role": "admin", "source": "users.afterLogin", "requestId": "fc2341de-af0c-49b3-8d49-ccad1f9a97e4"}	1	2026-05-21 02:32:06.796+00	::1	node	2026-05-21 02:32:06.871+00	2026-05-21 02:32:06.871+00
37	2	LOGIN_SUCCESS	{"role": "trainee", "source": "users.afterLogin", "requestId": "365064e5-0419-4f7e-8140-b9e2c0bbf9fb"}	2	2026-05-21 02:48:26.585+00	Unknown	Unknown	2026-05-21 02:48:26.659+00	2026-05-21 02:48:26.659+00
39	4	LOGIN_SUCCESS	{"role": "instructor", "source": "users.afterLogin", "requestId": "c19e1be1-6247-4467-afd8-c757e9183d04"}	4	2026-05-21 04:09:04.76+00	Unknown	Unknown	2026-05-21 04:09:04.855+00	2026-05-21 04:09:04.855+00
40	4	LOGIN_SUCCESS	{"role": "instructor", "source": "users.afterLogin", "requestId": "e5dc6732-00d8-4082-b40d-cf3503a9bc27"}	4	2026-05-21 04:10:01.525+00	Unknown	Unknown	2026-05-21 04:10:01.607+00	2026-05-21 04:10:01.607+00
41	4	LOGIN_SUCCESS	{"role": "instructor", "source": "users.afterLogin", "requestId": "b149a948-45ba-478b-a7d2-aedd033a2570"}	4	2026-05-21 04:14:33.093+00	Unknown	Unknown	2026-05-21 04:14:33.198+00	2026-05-21 04:14:33.197+00
43	1	LOGIN_SUCCESS	{"role": "admin", "source": "users.afterLogin", "requestId": "8af5bb87-1197-47e1-ad77-f7a9a17b4af4"}	1	2026-05-21 05:02:47.032+00	::1	node	2026-05-21 05:02:47.108+00	2026-05-21 05:02:47.108+00
44	1	LOGIN_SUCCESS	{"role": "admin", "source": "users.afterLogin", "requestId": "cdfd5f82-1f3a-42d8-81b9-59bdf1b22e02"}	1	2026-05-21 05:02:57.862+00	::1	node	2026-05-21 05:02:57.93+00	2026-05-21 05:02:57.93+00
45	1	LOGIN_SUCCESS	{"role": "admin", "source": "users.afterLogin", "requestId": "3617de1c-ad84-4fce-b210-37823b3bd272"}	1	2026-05-21 05:09:05.657+00	Unknown	Unknown	2026-05-21 05:09:05.731+00	2026-05-21 05:09:05.731+00
46	1	LOGIN_SUCCESS	{"role": "admin", "source": "users.afterLogin", "requestId": "208cf171-0ec4-4d56-b598-1da2f4e719df"}	1	2026-05-21 05:38:38.785+00	120.28.220.39	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	2026-05-21 05:38:38.88+00	2026-05-21 05:38:38.801+00
47	4	LOGIN_SUCCESS	{"role": "instructor", "source": "users.afterLogin", "requestId": "c326b4fc-c5b0-46d5-90d4-0f5e06412924"}	4	2026-05-21 05:40:31.263+00	Unknown	Unknown	2026-05-21 05:40:31.335+00	2026-05-21 05:40:31.335+00
48	1	LOGIN_SUCCESS	{"role": "admin", "source": "users.afterLogin", "requestId": "835586a0-7564-4523-a586-2488d0e6db57"}	1	2026-05-21 05:59:25.422+00	Unknown	Unknown	2026-05-21 05:59:25.623+00	2026-05-21 05:59:25.623+00
49	4	LOGIN_SUCCESS	{"role": "instructor", "source": "users.afterLogin", "requestId": "e2adf094-5f11-4bd3-82c5-4be01b6d6d3d"}	4	2026-05-21 06:06:24.117+00	Unknown	Unknown	2026-05-21 06:06:24.123+00	2026-05-21 06:06:24.123+00
50	4	LOGIN_SUCCESS	{"role": "instructor", "source": "users.afterLogin", "requestId": "44e1a8e0-99e6-41e5-8860-e42e6d74ea01"}	4	2026-05-21 06:06:46.737+00	Unknown	Unknown	2026-05-21 06:06:46.742+00	2026-05-21 06:06:46.742+00
\.


--
-- Data for Name: user_notifications; Type: TABLE DATA; Schema: public; Owner: -
--

COPY "public"."user_notifications" ("id", "user_id", "notification_id", "category", "title", "body", "link", "metadata", "read_at", "seen_at", "delivered_at", "channel", "archived", "updated_at", "created_at") FROM stdin;
45	2	45	learning	📝 Enrollment Request Received: International COLREGs Compliance	Your enrollment request for International COLREGs Compliance has been received and is now pending review. We will notify you once it is approved.	/portal/account/enrollments/55	{"courseId": 12, "courseName": "International COLREGs Compliance", "enrollmentId": 55, "enrollmentType": "paid", "enrollmentStatus": "pending"}	\N	\N	2026-05-19 10:44:52.013+00	in-app	f	2026-05-19 10:44:52.361+00	2026-05-19 10:44:52.361+00
46	2	46	learning	🎓 Welcome to Ballast Water Management & Compliance!	You have been successfully enrolled in Ballast Water Management & Compliance. Start learning now!	/portal/account/enrollments/56	{"courseId": 11, "courseName": "Ballast Water Management & Compliance", "enrollmentId": 56, "enrollmentType": "free", "enrollmentStatus": "active"}	\N	\N	2026-05-19 10:47:12.582+00	in-app	f	2026-05-19 10:47:12.905+00	2026-05-19 10:47:12.905+00
49	2	49	learning	📝 Enrollment Request Received: Personal Survival Techniques	Your enrollment request for Personal Survival Techniques has been received and is now pending review. We will notify you once it is approved.	/portal/account/enrollments/59	{"courseId": 1, "courseName": "Personal Survival Techniques", "enrollmentId": 59, "enrollmentType": "paid", "enrollmentStatus": "pending"}	\N	\N	2026-05-19 11:03:17.695+00	in-app	f	2026-05-19 11:03:18.129+00	2026-05-19 11:03:18.129+00
50	2	50	learning	📝 Enrollment Request Received: High Voltage Power Systems	Your enrollment request for High Voltage Power Systems has been received and is now pending review. We will notify you once it is approved.	/portal/account/enrollments/60	{"courseId": 4, "courseName": "High Voltage Power Systems", "enrollmentId": 60, "enrollmentType": "paid", "enrollmentStatus": "pending"}	\N	\N	2026-05-19 16:08:31.474+00	in-app	f	2026-05-19 16:08:31.548+00	2026-05-19 16:08:31.548+00
51	2	51	learning	📝 Enrollment Request Received: Common Rail Diesel Diagnostics	Your enrollment request for Common Rail Diesel Diagnostics has been received and is now pending review. We will notify you once it is approved.	/portal/account/enrollments/61	{"courseId": 5, "courseName": "Common Rail Diesel Diagnostics", "enrollmentId": 61, "enrollmentType": "free", "enrollmentStatus": "pending"}	\N	\N	2026-05-21 12:31:00.137+00	in-app	f	2026-05-21 12:31:00.164+00	2026-05-21 12:31:00.164+00
\.


--
-- Data for Name: web_push_subscriptions; Type: TABLE DATA; Schema: public; Owner: -
--

COPY "public"."web_push_subscriptions" ("id", "user_id", "endpoint", "p256dh", "auth", "user_agent", "browser", "platform", "device_label", "permission_state", "is_active", "last_seen_at", "last_subscribed_at", "last_success_at", "last_failure_at", "failure_reason", "subscription_j_s_o_n", "updated_at", "created_at") FROM stdin;
1	2	https://fcm.googleapis.com/fcm/send/e5ISnlit7uM:APA91bH1nFpIE_poqs5jyHJN76MxlsS44sDMeBgLVu2MWAMYgMRCcXw7p8iEEXMsZeQXZ4oZc1r5D1opUYXYGOeilGO4OnkgNXrKCMS58SuORX3FlQoajLaR3_vLzATKWyixqmGSpPJM	BJOcGpbHP6Xewf2KmkqhIIIBUkPQ9V4OhaQtyDCMPpvIDauhVxvw6hofOQ7ffNmGd-uKfwTmMkZrFRP6M2JvEX0	SDUR5bcUG0g7PiWBeLHXeQ	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	"Chromium";v="148", "Google Chrome";v="148", "Not/A)Brand";v="99"	"Windows"	\N	granted	f	2026-05-16 11:06:00.299+00	2026-05-16 10:48:02.704+00	2026-05-16 11:03:01.535+00	\N	\N	{"keys": {"auth": "SDUR5bcUG0g7PiWBeLHXeQ", "p256dh": "BJOcGpbHP6Xewf2KmkqhIIIBUkPQ9V4OhaQtyDCMPpvIDauhVxvw6hofOQ7ffNmGd-uKfwTmMkZrFRP6M2JvEX0"}, "endpoint": "https://fcm.googleapis.com/fcm/send/e5ISnlit7uM:APA91bH1nFpIE_poqs5jyHJN76MxlsS44sDMeBgLVu2MWAMYgMRCcXw7p8iEEXMsZeQXZ4oZc1r5D1opUYXYGOeilGO4OnkgNXrKCMS58SuORX3FlQoajLaR3_vLzATKWyixqmGSpPJM", "expirationTime": null}	2026-05-16 11:06:00.722+00	2026-05-16 10:48:02.865+00
2	2	https://fcm.googleapis.com/fcm/send/cNI5PezD0ys:APA91bHFXlFlfp65I3rRE3u207eQJ9eLGaB9CdqZdKOsNM9XumnPFtHr5QQvgAw2NqstkaUfLeKaFVVePD75DO2uYa9gDVJ7eS9I428OD6FlDU2hhqWJ376W5rLXVxsdCruSRp1F1fhS	BDNNQXT_lb91qg2ZRSYWgcHj34dgGmUvZaNYiwm4NLNREDJzB1xMQoI2f-cGwjokjphJemJSMWl3VzcWVIkhXoY	VKc3fQAP1gZB8gwUmkpvCA	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	"Chromium";v="148", "Google Chrome";v="148", "Not/A)Brand";v="99"	"Windows"	\N	granted	f	2026-05-16 11:09:10.243+00	2026-05-16 11:06:07.781+00	\N	\N	\N	{"keys": {"auth": "VKc3fQAP1gZB8gwUmkpvCA", "p256dh": "BDNNQXT_lb91qg2ZRSYWgcHj34dgGmUvZaNYiwm4NLNREDJzB1xMQoI2f-cGwjokjphJemJSMWl3VzcWVIkhXoY"}, "endpoint": "https://fcm.googleapis.com/fcm/send/cNI5PezD0ys:APA91bHFXlFlfp65I3rRE3u207eQJ9eLGaB9CdqZdKOsNM9XumnPFtHr5QQvgAw2NqstkaUfLeKaFVVePD75DO2uYa9gDVJ7eS9I428OD6FlDU2hhqWJ376W5rLXVxsdCruSRp1F1fhS", "expirationTime": null}	2026-05-16 11:09:10.666+00	2026-05-16 11:06:07.929+00
3	2	https://fcm.googleapis.com/fcm/send/fMkCEi4aQe0:APA91bFF9BJbr2liWgoYgh2O17VjFeh0aMzCyEjnIa4PkLIBlaxCeGdXUAy0sAdNOy9schgTkUK-q_w4YLoxTCwYyz0vYG-U8vr7644qMMRURXC674-rDRZEvsozIJS0hmH5xsIpDJJU	BAjDYNjscWeGukGYNo7KzGCFb0vYd33QDm4kK3lmHLkMz62Mla4ACxyfxiQl_5BcJPsoFEdBsCgGg-6mBRgqNJ8	f8KkP1YWu6xdflPCMoBZeQ	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	"Chromium";v="148", "Google Chrome";v="148", "Not/A)Brand";v="99"	"Windows"	\N	granted	f	2026-05-16 11:09:49.563+00	2026-05-16 11:09:49.563+00	\N	2026-05-17 00:52:00.886+00	push subscription has unsubscribed or expired.\n	{"keys": {"auth": "f8KkP1YWu6xdflPCMoBZeQ", "p256dh": "BAjDYNjscWeGukGYNo7KzGCFb0vYd33QDm4kK3lmHLkMz62Mla4ACxyfxiQl_5BcJPsoFEdBsCgGg-6mBRgqNJ8"}, "endpoint": "https://fcm.googleapis.com/fcm/send/fMkCEi4aQe0:APA91bFF9BJbr2liWgoYgh2O17VjFeh0aMzCyEjnIa4PkLIBlaxCeGdXUAy0sAdNOy9schgTkUK-q_w4YLoxTCwYyz0vYG-U8vr7644qMMRURXC674-rDRZEvsozIJS0hmH5xsIpDJJU", "expirationTime": null}	2026-05-17 00:52:02.264+00	2026-05-16 11:09:49.705+00
6	2	https://fcm.googleapis.com/fcm/send/fynkygGO1jE:APA91bFFnK9r1sAK_xPgLVEHGtzM8uwxxJ7iP8Wg1pPHEQaoJG4xokJYLeGmZA04oZS2TMHU2Qf9HLmROfKSip3mt6SxHtwZGHXf2Xjpj05WQfYkMpbvmruyzfeTkLueWs98YKsYNrYb	BELMEEVDH1yCEhNVvQRCqlEwuTg0F5EZ74KzkXv0xh_4lp62DSKL2_u15ilNE1WfUhKhdak9b_VRiB9P3FyJs4Q	9w-GWmFxL_u9JlUBzbmlFw	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	"Chromium";v="148", "Google Chrome";v="148", "Not/A)Brand";v="99"	"Windows"	\N	granted	t	2026-05-21 12:31:01.319+00	2026-05-18 13:46:10.585+00	2026-05-21 12:31:01.319+00	\N	\N	{"keys": {"auth": "9w-GWmFxL_u9JlUBzbmlFw", "p256dh": "BELMEEVDH1yCEhNVvQRCqlEwuTg0F5EZ74KzkXv0xh_4lp62DSKL2_u15ilNE1WfUhKhdak9b_VRiB9P3FyJs4Q"}, "endpoint": "https://fcm.googleapis.com/fcm/send/fynkygGO1jE:APA91bFFnK9r1sAK_xPgLVEHGtzM8uwxxJ7iP8Wg1pPHEQaoJG4xokJYLeGmZA04oZS2TMHU2Qf9HLmROfKSip3mt6SxHtwZGHXf2Xjpj05WQfYkMpbvmruyzfeTkLueWs98YKsYNrYb", "expirationTime": null}	2026-05-21 12:31:01.57+00	2026-05-18 13:46:10.854+00
5	2	https://fcm.googleapis.com/fcm/send/fE6ipEhKSGQ:APA91bHKNTTzD9okJOnIzAbB6NxLeOxNOK3SDeQJ99200mlBgbHWmoIiNydccglyuuyyV0HyO2gJmBqUFJhV75Eb4TLi1EaxYAP9IHfEd36mbiH_fcxIKHF3Uc7Uyjv7GRnEzRVwj4cg	BLlN9J-DRc6lJCOQ0g5K58YoD6fN_hpKevGKiu2pK9uFqcBWswIxkc0gm2NI8RDIK2QoAgTjucfEOe2Id7mm_oE	mXwUbz2KoPsNpRhj20e6JA	Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Mobile Safari/537.36	"Chromium";v="148", "Google Chrome";v="148", "Not/A)Brand";v="99"	"Android"	\N	granted	t	2026-05-21 12:31:01.319+00	2026-05-18 06:50:24.121+00	2026-05-21 12:31:01.319+00	\N	\N	{"keys": {"auth": "mXwUbz2KoPsNpRhj20e6JA", "p256dh": "BLlN9J-DRc6lJCOQ0g5K58YoD6fN_hpKevGKiu2pK9uFqcBWswIxkc0gm2NI8RDIK2QoAgTjucfEOe2Id7mm_oE"}, "endpoint": "https://fcm.googleapis.com/fcm/send/fE6ipEhKSGQ:APA91bHKNTTzD9okJOnIzAbB6NxLeOxNOK3SDeQJ99200mlBgbHWmoIiNydccglyuuyyV0HyO2gJmBqUFJhV75Eb4TLi1EaxYAP9IHfEd36mbiH_fcxIKHF3Uc7Uyjv7GRnEzRVwj4cg", "expirationTime": null}	2026-05-21 12:31:01.661+00	2026-05-18 06:50:24.321+00
4	2	https://fcm.googleapis.com/fcm/send/fcjI4XNQ6Xo:APA91bH-Be3LwNzRx6uQpBcg5bJr1c-ERgourOrlbFWhkqwUIwnqvAO-WgfiwIzBFhLmQCxphZlEjh7Kyj2eDGHP-fzKlR6ve-DAbZm2e2Q9X-dki2fDAxTassEc5RblWfEuFvpkcXdF	BDilrRRIQFTcfx05jrAvzMIvDLSsCy_hjFukcc1TEE2exyC46llGUnfBUsT5NYOgfX4-JswFoF5CpGs6toGwFdU	5agL_KZO0r88FlcF97p1Sg	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	"Chromium";v="148", "Google Chrome";v="148", "Not/A)Brand";v="99"	"Windows"	\N	granted	t	2026-05-21 12:31:01.319+00	2026-05-17 00:51:45.163+00	2026-05-21 12:31:01.319+00	\N	\N	{"keys": {"auth": "5agL_KZO0r88FlcF97p1Sg", "p256dh": "BDilrRRIQFTcfx05jrAvzMIvDLSsCy_hjFukcc1TEE2exyC46llGUnfBUsT5NYOgfX4-JswFoF5CpGs6toGwFdU"}, "endpoint": "https://fcm.googleapis.com/fcm/send/fcjI4XNQ6Xo:APA91bH-Be3LwNzRx6uQpBcg5bJr1c-ERgourOrlbFWhkqwUIwnqvAO-WgfiwIzBFhLmQCxphZlEjh7Kyj2eDGHP-fzKlR6ve-DAbZm2e2Q9X-dki2fDAxTassEc5RblWfEuFvpkcXdF", "expirationTime": null}	2026-05-21 12:31:01.722+00	2026-05-17 00:51:45.363+00
\.


--
-- Data for Name: wishlists; Type: TABLE DATA; Schema: public; Owner: -
--

COPY "public"."wishlists" ("id", "user_id", "course_id", "composite_key", "updated_at", "created_at") FROM stdin;
1	2	1	2:1	2026-04-05 12:38:47.819+00	2026-04-05 12:38:47.819+00
2	2	5	2:5	2026-04-07 11:11:39.501+00	2026-04-07 11:11:39.501+00
3	2	4	2:4	2026-04-07 12:32:10.763+00	2026-04-07 12:32:10.763+00
4	2	3	2:3	2026-04-07 12:32:12.889+00	2026-04-07 12:32:12.889+00
5	2	10	2:10	2026-04-07 19:44:57.86+00	2026-04-07 19:44:57.86+00
7	2	2	2:2	2026-04-16 15:39:41.234+00	2026-04-16 15:39:41.234+00
8	2	8	2:8	2026-04-24 15:51:55.582+00	2026-04-24 15:51:55.581+00
9	2	12	2:12	2026-04-24 15:51:57.429+00	2026-04-24 15:51:57.429+00
10	2	7	2:7	2026-05-07 01:06:57.55+00	2026-05-07 01:06:57.543+00
\.


--
-- Data for Name: payload_locked_documents_rels; Type: TABLE DATA; Schema: public; Owner: -
--

COPY "public"."payload_locked_documents_rels" ("id", "order", "parent_id", "path", "users_id", "media_id", "posts_id", "instructors_id", "trainees_id", "admins_id", "user_events_id", "emergency_contacts_id", "post_categories_id", "course_modules_id", "course_lessons_id", "materials_id", "course_materials_id", "lesson_materials_id", "announcements_id", "questions_id", "assessments_id", "course_item_progress_id", "certificates_id", "certificate_templates_id", "chats_id", "chat_messages_id", "chat_message_status_id", "chat_typing_status_id", "courses_id", "course_categories_id", "course_enrollments_id", "wishlists_id", "recently_viewed_courses_id", "assessment_submissions_id", "submission_answers_id", "notification_templates_id", "notifications_id", "user_notifications_id", "support_tickets_id", "support_ticket_messages_id", "assignments_id", "assignment_submissions_id", "feedback_forms_id", "feedback_submissions_id", "web_push_subscriptions_id", "coupon_codes_id", "coupon_redemptions_id") FROM stdin;
364	\N	186	document	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	1	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
365	\N	186	user	1	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
\.


--
-- Data for Name: payload_migrations; Type: TABLE DATA; Schema: public; Owner: -
--

COPY "public"."payload_migrations" ("id", "name", "batch", "updated_at", "created_at") FROM stdin;
1	20250811_093559_add_focus_keyword_to_posts	1	2026-04-05 04:59:23.756+00	2026-04-05 04:59:23.745+00
2	20250826_020303	1	2026-04-05 04:59:24.146+00	2026-04-05 04:59:24.146+00
3	20250826_060505	1	2026-04-05 04:59:24.489+00	2026-04-05 04:59:24.489+00
4	20250826_065630	1	2026-04-05 04:59:24.834+00	2026-04-05 04:59:24.834+00
5	20250826_083543	1	2026-04-05 04:59:25.2+00	2026-04-05 04:59:25.2+00
6	20250826_132231	1	2026-04-05 04:59:25.55+00	2026-04-05 04:59:25.55+00
7	20250826_add_missing_user_fields	1	2026-04-05 04:59:25.904+00	2026-04-05 04:59:25.904+00
8	20250826_create_emergency_contacts	1	2026-04-05 04:59:26.244+00	2026-04-05 04:59:26.244+00
9	20250826_fix_enum_values_in_triggers	1	2026-04-05 04:59:26.597+00	2026-04-05 04:59:26.597+00
10	20250826_fix_role_triggers	1	2026-04-05 04:59:27.066+00	2026-04-05 04:59:27.066+00
11	20250826_performance_views	1	2026-04-05 04:59:28.372+00	2026-04-05 04:59:28.372+00
12	20250826_remove_department_access	1	2026-04-05 04:59:28.746+00	2026-04-05 04:59:28.746+00
13	20250826_remove_services_tables	1	2026-04-05 04:59:29.088+00	2026-04-05 04:59:29.088+00
14	20250826_remove_unnecessary_trainee_fields	1	2026-04-05 04:59:29.43+00	2026-04-05 04:59:29.43+00
15	20250826_remove_user_relationships	1	2026-04-05 04:59:29.769+00	2026-04-05 04:59:29.769+00
16	20250826_safe_relations_cleanup	1	2026-04-05 04:59:30.116+00	2026-04-05 04:59:30.116+00
17	20250827_fix_trigger_schema	1	2026-04-05 04:59:30.516+00	2026-04-05 04:59:30.516+00
18	20250828_fix_emergency_contact_middlename	1	2026-04-05 04:59:30.857+00	2026-04-05 04:59:30.857+00
19	20250831_000000_create_courses_table	1	2026-04-05 04:59:31.244+00	2026-04-05 04:59:31.244+00
20	20250831_remove_supabase_auth_columns	2	2026-04-05 05:03:40.858+00	2026-04-05 05:03:40.856+00
21	20250831_safe_courses_schema_fix	3	2026-04-05 05:04:34.225+00	2026-04-05 05:04:34.224+00
22	20250832_fix_course_enrollments_amount_paid	4	2026-04-05 05:05:36.365+00	2026-04-05 05:05:36.365+00
23	20250904_fix_emergency_contacts	4	2026-04-05 05:05:36.954+00	2026-04-05 05:05:36.954+00
24	20250904_fix_serial_type_error	4	2026-04-05 05:05:39.079+00	2026-04-05 05:05:39.079+00
25	20250904_re_enable_trainee_trigger	4	2026-04-05 05:05:39.558+00	2026-04-05 05:05:39.558+00
26	20250911_add_service_role	4	2026-04-05 05:05:39.9+00	2026-04-05 05:05:39.899+00
27	20250911_fix_service_role_trigger	4	2026-04-05 05:05:40.26+00	2026-04-05 05:05:40.26+00
28	20250914_115512	4	2026-04-05 05:05:40.608+00	2026-04-05 05:05:40.608+00
29	20250916_103718	4	2026-04-05 05:05:40.942+00	2026-04-05 05:05:40.942+00
30	20251204_112549_enable_multiple_categories	4	2026-04-05 05:05:41.323+00	2026-04-05 05:05:41.323+00
31	20251206_135946	4	2026-04-05 05:05:41.697+00	2026-04-05 05:05:41.697+00
32	20251207_131842	4	2026-04-05 05:05:42.06+00	2026-04-05 05:05:42.06+00
33	20251208_181200_change_recent_searches_scope_to_text	4	2026-04-05 05:05:42.413+00	2026-04-05 05:05:42.413+00
34	20251211_134800_fk_cascade	5	2026-04-05 05:08:59.531+00	2026-04-05 05:08:59.53+00
35	20251211_140410_courses_instructor_cascade	5	2026-04-05 05:08:59.857+00	2026-04-05 05:08:59.857+00
36	20251211_155634	5	2026-04-05 05:09:00.223+00	2026-04-05 05:09:00.222+00
37	20251211_fix_cleanup_service_role	5	2026-04-05 05:09:00.668+00	2026-04-05 05:09:00.668+00
38	20251211_fix_users_api_keys	6	2026-04-05 05:10:26.422+00	2026-04-05 05:10:26.421+00
39	20251212_000000_fix_remaining_fks	6	2026-04-05 05:10:26.79+00	2026-04-05 05:10:26.79+00
40	20251212_000001_force_cascade_delete	6	2026-04-05 05:10:27.156+00	2026-04-05 05:10:27.156+00
41	20251215_141702	6	2026-04-05 05:10:27.512+00	2026-04-05 05:10:27.512+00
42	20251228_114011	6	2026-04-05 05:10:27.889+00	2026-04-05 05:10:27.889+00
43	20251228_115048	6	2026-04-05 05:10:28.236+00	2026-04-05 05:10:28.236+00
44	20251229_124749	6	2026-04-05 05:10:28.639+00	2026-04-05 05:10:28.639+00
45	20251229_161038	6	2026-04-05 05:10:28.986+00	2026-04-05 05:10:28.986+00
46	20260105_122707	6	2026-04-05 05:10:29.363+00	2026-04-05 05:10:29.363+00
47	20260105_130917	6	2026-04-05 05:10:29.757+00	2026-04-05 05:10:29.757+00
48	20260106_041829	6	2026-04-05 05:10:30.122+00	2026-04-05 05:10:30.122+00
49	20260106_054302	6	2026-04-05 05:10:30.471+00	2026-04-05 05:10:30.471+00
50	20260106_103058	6	2026-04-05 05:10:30.824+00	2026-04-05 05:10:30.824+00
51	20260106_104305	6	2026-04-05 05:10:31.171+00	2026-04-05 05:10:31.171+00
52	20260112_120820	6	2026-04-05 05:10:31.666+00	2026-04-05 05:10:31.666+00
53	20260112_130501_assessments_course_final_exam	6	2026-04-05 05:10:32.013+00	2026-04-05 05:10:32.013+00
54	20260112_140201_remove_quizzes	6	2026-04-05 05:10:32.364+00	2026-04-05 05:10:32.364+00
55	20260114_120001_add_assessments_description	6	2026-04-05 05:10:32.709+00	2026-04-05 05:10:32.709+00
56	20260114_120101_add_course_modules_description	6	2026-04-05 05:10:33.057+00	2026-04-05 05:10:33.057+00
57	20260115_090000_add_courses_estimated_duration_unit	6	2026-04-05 05:10:33.403+00	2026-04-05 05:10:33.403+00
58	20260116_024259	6	2026-04-05 05:10:33.752+00	2026-04-05 05:10:33.752+00
59	20260116_065844	6	2026-04-05 05:10:34.097+00	2026-04-05 05:10:34.097+00
60	20260201_092442	6	2026-04-05 05:10:34.45+00	2026-04-05 05:10:34.45+00
61	20260204_041555_add_items_to_course_modules	6	2026-04-05 05:10:34.812+00	2026-04-05 05:10:34.812+00
62	20260204_043328_remove_order_fields	6	2026-04-05 05:10:35.197+00	2026-04-05 05:10:35.197+00
63	20260205_091817_add_show_correct_answer	6	2026-04-05 05:10:35.554+00	2026-04-05 05:10:35.554+00
64	20260205_115601_add_modules_to_courses	6	2026-04-05 05:10:35.981+00	2026-04-05 05:10:35.981+00
65	20260205_122212_remove_course_and_order_from_modules	6	2026-04-05 05:10:36.329+00	2026-04-05 05:10:36.329+00
66	20260206_072527_add_evaluation_mode	6	2026-04-05 05:10:36.676+00	2026-04-05 05:10:36.676+00
67	20260206_080033_add_completed_lessons_to_enrollments	6	2026-04-05 05:10:37.03+00	2026-04-05 05:10:37.03+00
68	20260206_095021_remove_completed_lessons	6	2026-04-05 05:10:37.376+00	2026-04-05 05:10:37.376+00
69	20260206_101113_add_course_item_progress	6	2026-04-05 05:10:37.78+00	2026-04-05 05:10:37.78+00
70	20260207_121500_remove_company_members	6	2026-04-05 05:10:38.133+00	2026-04-05 05:10:38.133+00
71	20260208_120000_add_support_tickets	6	2026-04-05 05:10:38.511+00	2026-04-05 05:10:38.511+00
72	20260210_000000_add_enrollment_category	6	2026-04-05 05:10:38.934+00	2026-04-05 05:10:38.933+00
73	20260212_143056_add_final_evaluation_field	6	2026-04-05 05:10:39.279+00	2026-04-05 05:10:39.279+00
74	20260213_120933_remove_user_certifications	6	2026-04-05 05:10:39.63+00	2026-04-05 05:10:39.63+00
75	20260213_124627_create_certificates_collection	6	2026-04-05 05:10:39.994+00	2026-04-05 05:10:39.994+00
76	20260215_050150_add_default_to_points_earned	7	2026-04-05 05:11:39.644+00	2026-04-05 05:11:39.642+00
77	20260223_043556_add_certificate_templates	7	2026-04-05 05:11:40.19+00	2026-04-05 05:11:40.19+00
78	20260223_163154_remove_background_image_from_templates	7	2026-04-05 05:11:40.582+00	2026-04-05 05:11:40.582+00
79	20260308_125532_add_site_settings_global	7	2026-04-05 05:11:40.918+00	2026-04-05 05:11:40.918+00
80	20260314_100000_prevent_accidental_course_deletion	7	2026-04-05 05:11:41.24+00	2026-04-05 05:11:41.24+00
81	20260322_134709	7	2026-04-05 05:11:41.492+00	2026-04-05 05:11:41.492+00
82	20260322_135521	7	2026-04-05 05:11:41.748+00	2026-04-05 05:11:41.748+00
83	20260322_141612	7	2026-04-05 05:11:42.001+00	2026-04-05 05:11:42.001+00
84	20260402_031257	7	2026-04-05 05:11:42.345+00	2026-04-05 05:11:42.345+00
85	20260402_133641	7	2026-04-05 05:11:42.818+00	2026-04-05 05:11:42.818+00
86	20260405_053352_add_user_biography	8	2026-04-05 05:34:27.921+00	2026-04-05 05:34:27.92+00
87	20260405_134000_restore_missing_api_key_columns	9	2026-04-05 05:38:21.176+00	2026-04-05 05:38:21.175+00
88	20260405_134500_restore_missing_locked_doc_rels	10	2026-04-05 05:46:55.704+00	2026-04-05 05:46:55.703+00
89	20260405_135000_restore_locked_documents_rels	11	2026-04-05 05:49:55.573+00	2026-04-05 05:49:55.573+00
90	20260405_162000_restore_wishlists	12	2026-04-05 08:19:08.497+00	2026-04-05 08:19:08.495+00
92	20260412_030444_rename_beginner_to_standard	13	2026-04-12 03:05:30.313+00	2026-04-12 03:05:30.312+00
93	20260416_131422	14	2026-04-16 13:14:47.534+00	2026-04-16 13:14:47.532+00
94	20260419_072232	15	2026-04-19 07:22:49.157+00	2026-04-19 07:22:49.156+00
95	20260419_141633	16	2026-04-19 14:17:27.115+00	2026-04-19 14:17:27.114+00
96	20260420_121801	17	2026-04-20 12:18:27.028+00	2026-04-20 12:18:27.028+00
97	20260421_080510	18	2026-04-21 08:05:50.726+00	2026-04-21 08:05:50.725+00
98	20260421_121749	19	2026-04-21 13:04:16.251+00	2026-04-21 13:04:16.25+00
99	20260422_120454	20	2026-04-22 12:05:08.576+00	2026-04-22 12:05:08.576+00
100	20260508_063949_add_phone_to_users	21	2026-05-08 06:40:22.166+00	2026-05-08 06:40:22.165+00
101	20260508_151000_fix_trigger_beginner_to_standard	22	2026-05-08 13:21:35.732+00	2026-05-08 13:21:35.731+00
102	20260512_120000_enforce_unique_emergency_contact_per_user	23	2026-05-12 11:28:24.937+00	2026-05-12 11:28:24.936+00
103	20260516_045852_add_web_push_notifications	24	2026-05-16 04:59:19.194+00	2026-05-16 04:59:19.194+00
104	20260518_120000_add_security_alert_email_preference	25	2026-05-18 11:05:20.738+00	2026-05-18 11:05:20.738+00
105	20260519_084138_add_coupon_codes_system	26	2026-05-19 08:48:59.058+00	2026-05-19 08:48:59.057+00
\.


--
-- Data for Name: payload_preferences; Type: TABLE DATA; Schema: public; Owner: -
--

COPY "public"."payload_preferences" ("id", "key", "value", "updated_at", "created_at") FROM stdin;
34	nav	{"groups": {"Notifications": {"open": true}}}	2026-04-28 15:34:44.135+00	2026-04-27 13:28:38.756+00
27	collection-trainees	{"limit": 10, "editViewType": "default"}	2026-05-08 06:35:18.002+00	2026-04-17 11:38:01.983+00
36	collection-emergency-contacts	{"limit": 10, "editViewType": "default"}	2026-05-12 11:25:59.069+00	2026-05-08 06:37:56.404+00
4	collection-media	{"limit": 10, "editViewType": "default"}	2026-04-05 06:03:43.782+00	2026-04-05 06:00:25.701+00
37	collection-certificates	{}	2026-05-12 12:26:07.165+00	2026-05-12 12:26:07.164+00
2	collection-courses	{"limit": 10, "editViewType": "default"}	2026-04-05 12:37:29.98+00	2026-04-05 05:56:14.946+00
38	collection-posts	{"editViewType": "default"}	2026-05-13 13:49:12.925+00	2026-05-13 13:49:05.586+00
1	collection-users	{"limit": 10, "editViewType": "default"}	2026-04-05 12:41:37.152+00	2026-04-05 05:52:25.686+00
7	collection-wishlists	{}	2026-04-06 11:10:59.258+00	2026-04-06 11:10:59.257+00
8	collection-course-lessons	{"editViewType": "default"}	2026-04-10 11:14:22.706+00	2026-04-10 11:14:15.69+00
39	collection-post-categories	{"limit": 10, "editViewType": "default"}	2026-05-13 13:59:32.145+00	2026-05-13 13:57:28.02+00
9	collection-questions	{"editViewType": "default"}	2026-04-10 11:31:32.601+00	2026-04-10 11:31:29.741+00
3	collection-course-categories	{"limit": 10, "editViewType": "default"}	2026-05-13 14:00:41.532+00	2026-04-05 05:57:11.215+00
10	collection-assessments	{"editViewType": "default"}	2026-04-10 11:55:54.766+00	2026-04-10 11:55:52.259+00
40	collection-web-push-subscriptions	{}	2026-05-18 08:47:54.431+00	2026-05-18 08:47:54.431+00
41	collection-coupon-codes	{"editViewType": "default"}	2026-05-19 09:05:03.616+00	2026-05-19 09:04:58.015+00
42	collection-coupon-redemptions	{}	2026-05-19 09:50:35.971+00	2026-05-19 09:50:35.971+00
14	collection-materials	{"editViewType": "default"}	2026-04-11 02:46:42.239+00	2026-04-11 02:46:36.449+00
13	collection-course-materials	{"limit": 10, "editViewType": "default"}	2026-04-11 02:51:03.444+00	2026-04-11 02:46:21.363+00
15	collection-lesson-materials	{"limit": 10, "editViewType": "default"}	2026-04-11 11:20:44.431+00	2026-04-11 02:48:56.932+00
5	collection-course-modules	{"limit": 10, "editViewType": "default"}	2026-04-11 12:41:46.209+00	2026-04-05 08:14:40.999+00
16	collection-announcements	{"editViewType": "default"}	2026-04-11 13:49:09.829+00	2026-04-11 13:49:03.592+00
17	collection-course-item-progress	{}	2026-04-12 02:04:38.773+00	2026-04-12 02:04:38.773+00
11	collection-course-enrollments	{"limit": 10, "editViewType": "default"}	2026-04-12 11:54:37.286+00	2026-04-10 12:48:35.691+00
12	collection-support-ticket-messages	{"limit": 10, "editViewType": "default"}	2026-04-13 14:03:41.319+00	2026-04-10 13:09:26.567+00
19	collection-support-tickets	{"limit": 10}	2026-04-13 15:09:40.288+00	2026-04-13 15:09:32.204+00
6	collection-chats	{"limit": 10, "editViewType": "default"}	2026-04-13 15:10:12.777+00	2026-04-05 12:40:30.436+00
21	collection-chat-typing-status	{}	2026-04-13 15:10:16.942+00	2026-04-13 15:10:16.942+00
24	collection-assignments	{"editViewType": "default"}	2026-04-16 15:17:30.716+00	2026-04-16 15:17:27.593+00
26	collection-assignment-submissions	{"limit": 10, "editViewType": "default"}	2026-04-17 11:53:06.141+00	2026-04-16 15:19:31.686+00
18	collection-course-feedbacks	{"limit": 10, "editViewType": "default"}	2026-04-18 02:01:25.298+00	2026-04-13 11:13:33.135+00
28	collection-feedback-forms	{"editViewType": "default"}	2026-04-20 11:19:45.784+00	2026-04-20 11:19:39.278+00
29	collection-feedback-submissions	{"limit": 10, "editViewType": "default"}	2026-04-20 13:16:57.13+00	2026-04-20 11:31:57.734+00
23	collection-submission-answers	{"limit": 10, "editViewType": "default"}	2026-04-21 03:15:31.074+00	2026-04-16 15:17:20.504+00
25	collection-assessment-submissions	{"editViewType": "default"}	2026-04-21 08:13:44.038+00	2026-04-16 15:19:25.504+00
31	global-site-settings	{"editViewType": "default"}	2026-04-21 09:07:47.508+00	2026-04-21 09:07:48.545+00
20	collection-chat-messages	{"limit": 10, "editViewType": "default"}	2026-04-22 12:41:55.882+00	2026-04-13 15:09:55.807+00
22	collection-chat-message-status	{"limit": 10, "editViewType": "default"}	2026-04-22 13:14:25.903+00	2026-04-13 15:10:19.817+00
32	collection-instructors	{}	2026-04-22 13:16:19.459+00	2026-04-22 13:16:19.459+00
33	collection-notification-templates	{"limit": 10}	2026-04-27 13:12:21.703+00	2026-04-27 12:28:33.398+00
30	collection-user-notifications	{"limit": 10, "editViewType": "default"}	2026-04-27 13:32:16.81+00	2026-04-21 03:14:01.53+00
35	collection-notifications	{"limit": 10, "editViewType": "default"}	2026-04-27 13:32:27.18+00	2026-04-27 13:28:45.315+00
\.


--
-- Data for Name: payload_preferences_rels; Type: TABLE DATA; Schema: public; Owner: -
--

COPY "public"."payload_preferences_rels" ("id", "order", "parent_id", "path", "users_id") FROM stdin;
97	\N	37	user	1
99	\N	38	user	1
102	\N	39	user	1
8	\N	4	user	1
103	\N	3	user	1
104	\N	40	user	1
11	\N	2	user	1
106	\N	41	user	1
14	\N	1	user	1
15	\N	7	user	1
107	\N	42	user	1
17	\N	8	user	1
19	\N	9	user	1
21	\N	10	user	1
29	\N	14	user	1
32	\N	13	user	1
33	\N	13	user	1
35	\N	15	user	1
36	\N	5	user	1
38	\N	16	user	1
39	\N	17	user	1
40	\N	11	user	1
43	\N	12	user	1
45	\N	19	user	1
46	\N	19	user	1
51	\N	6	user	1
52	\N	21	user	1
58	\N	24	user	1
63	\N	26	user	1
64	\N	18	user	1
66	\N	28	user	1
69	\N	29	user	1
73	\N	23	user	1
74	\N	25	user	1
75	\N	31	user	1
76	\N	20	user	1
77	\N	22	user	1
78	\N	32	user	1
81	\N	33	user	1
88	\N	30	user	1
89	\N	30	user	1
90	\N	35	user	1
92	\N	34	user	1
93	\N	27	user	1
96	\N	36	user	1
\.


--
-- Data for Name: posts_rels; Type: TABLE DATA; Schema: public; Owner: -
--

COPY "public"."posts_rels" ("id", "order", "parent_id", "path", "post_categories_id") FROM stdin;
1	1	1	category	1
\.


--
-- Data for Name: posts_tags; Type: TABLE DATA; Schema: public; Owner: -
--

COPY "public"."posts_tags" ("_order", "_parent_id", "id", "tag") FROM stdin;
\.


--
-- Data for Name: questions_options; Type: TABLE DATA; Schema: public; Owner: -
--

COPY "public"."questions_options" ("_order", "_parent_id", "id", "label", "is_correct") FROM stdin;
1	1	69d8dff24932dc3bd348533c	15	f
2	1	69d8dffc4932dc3bd348533e	16	t
3	1	69d8e0044932dc3bd3485340	18	f
4	1	69d8e00b4932dc3bd3485342	21	f
1	2	69d8e0794932dc3bd3485344	1 year	f
2	2	69d8e07c4932dc3bd3485346	2 year	t
3	2	69d8e0824932dc3bd3485348	5 years	f
4	2	69d8e0864932dc3bd348534a	6 years	f
1	3	69d8e14b4932dc3bd348534c	Food must be provided free of charge to the seafarer.	t
2	3	69d8e1574932dc3bd348534e	Ships with 10 or more crew must have a qualified cook.	t
3	3	69d8e1664932dc3bd3485350	Food must be of documented nutritional value and quantity.	t
4	3	69d8e1734932dc3bd3485352	Seafarers must pay a small monthly maintenance fee for drinking water.	f
1	4	69d8e1ac4932dc3bd3485354	The Seafarer's Employment Agreement (SEA) expires while the ship is abroad. 	t
2	4	69d8e1af4932dc3bd3485356	The seafarer is unable to carry out their duties due to an injury.	t
3	4	69d8e1c14932dc3bd3485358	The shipowner becomes insolvent or bankrupt.	t
4	4	69d8e1cf4932dc3bd348535a	The seafarer decides they want to go home early for a vacation.	f
1	5	69d8e32f78ed060f3cafb1c2	True	f
2	5	69d8e32f78ed060f3cafb1c3	False	t
1	6	69d8e73c4932dc3bd348535c	Any crew member with a passion for cooking.	f
2	6	69d8e73f4932dc3bd348535e	A designated officer with basic health training.	f
3	6	69d8e7484932dc3bd3485360	A fully qualified and trained ship’s cook.	t
4	6	69d8e74b4932dc3bd3485362	A steward with at least 2 years of sea service.	f
1	7	69d8e78a4932dc3bd3485364	It is provided at a subsidized, low-cost rate.	f
2	7	69d8e78d4932dc3bd3485366	It must be provided free of charge by the shipowner.	t
3	7	69d8e7944932dc3bd3485368	It is deducted from the seafarer's monthly "victualling" allowance.	f
4	7	69d8e79a4932dc3bd348536a	It is free only during the first 3 months of the contract.	f
1	8	69d8e9314932dc3bd3485370	Reasonable access to ship-to-shore telephone or internet.	t
2	8	69d8e9254932dc3bd348536e	Television, radio, or film services.	t
3	8	69d8e9234932dc3bd348536c	Access to a library and printed materials.	t
4	8	69d8e93a4932dc3bd3485372	High-speed satellite internet for unlimited gaming.	f
1	9	69d8ea294932dc3bd3485374	The ship is involved in a shipwreck.	t
2	9	69d8ea2c4932dc3bd3485376	The seafarer's employment agreement is terminated by the shipowner for a valid reason.	t
3	9	69d8ea344932dc3bd3485378	The seafarer is no longer able to carry out their duties due to a medical emergency.	t
4	9	69d8ea3f4932dc3bd348537a	The seafarer wants to attend a friend's wedding in their home country.	f
1	10	69d8eaa778ed060f3cafb1c4	True	t
2	10	69d8eaa778ed060f3cafb1c5	False	f
1	11	69d8eaf74932dc3bd348537c	50%, with the seafarer's insurance covering the rest.	f
2	11	69d8eafd4932dc3bd348537e	Only the costs incurred while the ship is at sea.	f
3	11	69d8eb004932dc3bd3485380	100% of the costs until the seafarer has recovered or the disability is declared permanent.	t
4	11	69d8eb084932dc3bd3485382	Up to a maximum of $5,000 USD.	f
1	12	69d8ec314932dc3bd3485384	24 hours	f
2	12	69d8ec344932dc3bd3485386	3 days	t
3	12	69d8ec3b4932dc3bd3485388	7 days	f
4	12	69d8ec414932dc3bd348538a	14 days	f
1	13	69d8ed824932dc3bd348538c	Port State Control (inspections by foreign ports).	t
2	13	69d8ed884932dc3bd348538e	Port State Control (inspections by foreign ports).	t
3	13	69d8ed914932dc3bd3485390	The seafarer's family members.	f
4	13	69d8ed9a4932dc3bd3485392	The Declaration of Maritime Labour Compliance (DMLC).	t
1	14	69d8edf74932dc3bd3485394	It must be established on ships with 5 or more seafarers.	t
2	14	69d8edf94932dc3bd3485396	It must include seafarers appointed or elected as safety representatives.	t
3	14	69d8ee014932dc3bd3485398	It only needs to meet once a year.	f
4	14	69d8ee124932dc3bd348539a	It is responsible for reviewing occupational safety and health (OSH) policies on board.	t
1	15	69d8ee5478ed060f3cafb1c8	True	f
2	15	69d8ee5478ed060f3cafb1c9	False	t
\.


--
-- Data for Name: questions_texts; Type: TABLE DATA; Schema: public; Owner: -
--

COPY "public"."questions_texts" ("id", "order", "parent_id", "path", "text") FROM stdin;
\.


--
-- Data for Name: recent_searches; Type: TABLE DATA; Schema: public; Owner: -
--

COPY "public"."recent_searches" ("id", "user_id", "query", "normalized_query", "scope", "composite_key", "frequency", "source", "device_id", "updated_at", "created_at") FROM stdin;
1	2	Personal Survival Techniques	personal survival techniques	courses	2:personal survival techniques:courses	1	unknown	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36	2026-04-07 12:31:56.973+00	2026-04-07 12:31:56.973+00
4	2	Maritime security	maritime security	courses	2:maritime security:courses	1	unknown	Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Mobile Safari/537.36	2026-04-07 20:03:13.586+00	2026-04-07 20:03:13.586+00
24	2	Fire Prevention and Fire Fighting	fire prevention and fire fighting	courses	2:fire prevention and fire fighting:courses	1	unknown	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36	2026-05-07 11:16:43.012+00	2026-05-07 11:16:43.012+00
27	12	crowd	crowd	courses	12:crowd:courses	1	unknown	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	2026-05-09 01:32:44.089+00	2026-05-09 01:32:44.089+00
29	12	crisis	crisis	courses	12:crisis:courses	1	unknown	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	2026-05-09 01:32:53.262+00	2026-05-09 01:32:53.262+00
35	2	Marine	marine	courses	2:marine:courses	1	unknown	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	2026-05-12 12:54:53.194+00	2026-05-12 12:54:53.194+00
38	2	Advanced Cargo Handling & Stability	advanced cargo handling & stability	courses	2:advanced cargo handling & stability:courses	1	unknown	Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Mobile Safari/537.36	2026-05-18 17:22:14.702+00	2026-05-18 17:22:14.702+00
\.


--
-- Data for Name: site_settings; Type: TABLE DATA; Schema: public; Owner: -
--

COPY "public"."site_settings" ("id", "site_name", "description", "logo_id", "favicon_id", "email", "phone", "address", "updated_at", "created_at") FROM stdin;
1	Grandline Maritime	\N	60	60	\N	\N	\N	2026-05-14 13:53:14.764+00	2026-04-21 09:08:46.336+00
\.


--
-- Data for Name: site_settings_social_links; Type: TABLE DATA; Schema: public; Owner: -
--

COPY "public"."site_settings_social_links" ("_order", "_parent_id", "id", "platform", "url") FROM stdin;
\.


--
-- Data for Name: support_ticket_messages_rels; Type: TABLE DATA; Schema: public; Owner: -
--

COPY "public"."support_ticket_messages_rels" ("id", "order", "parent_id", "path", "media_id") FROM stdin;
\.


--
-- Data for Name: support_tickets_rels; Type: TABLE DATA; Schema: public; Owner: -
--

COPY "public"."support_tickets_rels" ("id", "order", "parent_id", "path", "media_id") FROM stdin;
\.


--
-- Data for Name: users_reset_password_tokens; Type: TABLE DATA; Schema: public; Owner: -
--

COPY "public"."users_reset_password_tokens" ("_order", "_parent_id", "id", "token", "expires_at") FROM stdin;
\.


--
-- Data for Name: users_sessions; Type: TABLE DATA; Schema: public; Owner: -
--

COPY "public"."users_sessions" ("_order", "_parent_id", "id", "created_at", "expires_at") FROM stdin;
1	11	84f4676b-6970-4b87-aba7-364be60b8e09	2026-05-10 02:03:28.245+00	2026-06-09 02:03:28.245+00
2	11	08ab771d-44a7-4367-b001-549c89457e1a	2026-05-10 04:22:29.59+00	2026-06-09 04:22:29.59+00
3	11	39bbef59-d051-4675-8404-ac7bbf8f1cc5	2026-05-10 05:29:26.644+00	2026-06-09 05:29:26.644+00
1	12	bb74f0da-4233-4271-a5ae-20d2bb9141e5	2026-05-09 01:31:49.541+00	2026-06-08 01:31:49.541+00
1	1	4b8daa62-4fab-43b4-b4ea-b11b42af3c7c	2026-04-28 15:23:31.804+00	2026-05-28 15:23:31.804+00
2	1	de5f5d4a-9c0c-49a2-b2ac-59a7e38375f3	2026-05-19 16:21:09.338+00	2026-06-18 16:21:09.338+00
3	1	dda4595e-d0fe-4983-a5e9-73647f2e9f83	2026-05-19 16:35:01.538+00	2026-06-18 16:35:01.538+00
4	1	d8ab2d08-ebf4-4ab0-adde-32d8aab148fc	2026-05-21 01:13:33.374+00	2026-06-20 01:13:33.374+00
5	1	acca60c8-c295-4355-a3eb-7dc1921489d7	2026-05-21 01:24:03.535+00	2026-06-20 01:24:03.535+00
6	1	f4939175-6de4-4ba2-9074-3dab43783098	2026-05-21 01:29:18.546+00	2026-06-20 01:29:18.546+00
7	1	5777df33-1ee1-4620-8b91-c020f77c05ca	2026-05-21 01:46:26.589+00	2026-06-20 01:46:26.589+00
8	1	d1bb935b-2822-4b30-9889-dea978befb82	2026-05-21 01:46:28.758+00	2026-06-20 01:46:28.758+00
9	1	2d6b1d2e-7244-47da-9af8-0cd923e2ee1d	2026-05-21 01:46:43.084+00	2026-06-20 01:46:43.084+00
10	1	9edbca28-2774-43cd-bd6f-8aad716c97e5	2026-05-21 02:08:08.583+00	2026-06-20 02:08:08.583+00
11	1	d67dbde6-0e9c-4730-8511-767178c7f8e2	2026-05-21 02:32:06.248+00	2026-06-20 02:32:06.248+00
12	1	8546c6a1-ce36-45e4-9bca-3dd4323b5798	2026-05-21 04:50:33.47+00	2026-06-20 04:50:33.47+00
13	1	a2d1f1df-086f-46e5-bdb6-f0d0b8dc6a20	2026-05-21 05:02:46.737+00	2026-06-20 05:02:46.737+00
14	1	01ee4842-b248-4696-a1cd-5310554c4203	2026-05-21 05:02:57.512+00	2026-06-20 05:02:57.512+00
15	1	d1d4afa2-c67a-4af2-95af-ebb05bc01283	2026-05-21 05:09:05.338+00	2026-06-20 05:09:05.338+00
16	1	028db096-cd36-4816-b7f8-a90483e7cd99	2026-05-21 05:38:38.596+00	2026-06-20 05:38:38.596+00
17	1	7e2c9b18-4f48-4fd9-bb0b-414cff9d1105	2026-05-21 05:59:25.237+00	2026-06-20 05:59:25.237+00
1	4	8156becf-5868-4d61-b47a-5a1de6c077d5	2026-05-21 02:08:43.074+00	2026-06-20 02:08:43.074+00
2	4	dec50d1f-45f1-45e4-b1b8-918fcb0c853a	2026-05-21 02:21:06.776+00	2026-06-20 02:21:06.776+00
3	4	953dadff-a57c-430f-bb9d-0522ee8cc3b3	2026-05-21 02:26:17.38+00	2026-06-20 02:26:17.38+00
4	4	378606c7-a091-42e2-a970-eb4e5d786e63	2026-05-21 02:34:45.268+00	2026-06-20 02:34:45.268+00
5	4	2ae1b190-2720-4096-b197-f0b70fb9bcf5	2026-05-21 02:39:05.064+00	2026-06-20 02:39:05.064+00
6	4	dd5435ec-6b78-4542-be51-7910995c882c	2026-05-21 02:45:34.867+00	2026-06-20 02:45:34.867+00
7	4	5ea9aa60-5aa8-4856-8206-19ee239a703f	2026-05-21 03:47:37.681+00	2026-06-20 03:47:37.681+00
8	4	a9335e9b-9118-4fe7-b1c2-3c7eba29b075	2026-05-21 04:09:04.262+00	2026-06-20 04:09:04.262+00
9	4	ed2809a2-91a5-4aab-a18f-4e02161e342a	2026-05-21 04:14:32.04+00	2026-06-20 04:14:32.04+00
10	4	1bbfe859-600d-4b68-9388-94f500bdbe3f	2026-05-21 05:40:30.981+00	2026-06-20 05:40:30.981+00
11	4	a7987472-1811-4cdf-93dc-9af3974f13ad	2026-05-21 06:06:24.029+00	2026-06-20 06:06:24.029+00
12	4	a4235ab3-2edc-4513-b5e8-5863cceadbb7	2026-05-21 06:06:46.723+00	2026-06-20 06:06:46.723+00
58	2	9e6dd4c5-4516-4c65-9544-6b99211510a3	2026-05-19 08:12:33.655+00	2026-06-18 08:12:33.655+00
59	2	199933b1-3112-4d81-bdf4-731bfd7ee5a8	2026-05-19 23:53:03.539+00	2026-06-18 23:53:03.539+00
60	2	dc9fa131-43a5-466e-ac71-2dfd6579bdd3	2026-05-21 02:48:26.205+00	2026-06-20 02:48:26.205+00
1	2	12138130-70d3-4ab2-868d-1eb7022580c0	2026-04-21 03:12:19.177+00	2026-05-21 03:12:19.177+00
2	2	baf8bddb-f907-4d83-acda-bce43b486109	2026-04-21 07:49:45.769+00	2026-05-21 07:49:45.769+00
3	2	438c5eeb-69fa-4d0f-8735-20c6969ba9cd	2026-04-21 08:38:00.726+00	2026-05-21 08:38:00.726+00
4	2	7773c3df-34e0-493b-8f3d-b6030e86de0e	2026-04-21 11:31:21.178+00	2026-05-21 11:31:21.178+00
5	2	ab061220-3e42-456c-b3cb-5f0c48869e81	2026-04-22 09:39:02.115+00	2026-05-22 09:39:02.115+00
6	2	b533afca-8468-46d3-a3cc-b9f9ab5d2944	2026-04-22 14:12:19.959+00	2026-05-22 14:12:19.959+00
7	2	e71fb499-b165-404a-87f5-d081f459473e	2026-04-23 03:01:44.946+00	2026-05-23 03:01:44.946+00
8	2	37db0a93-b627-4032-9042-6751094ce913	2026-04-23 12:26:24.802+00	2026-05-23 12:26:24.802+00
9	2	b220001c-8680-43ff-9bba-593a60ce304c	2026-04-23 12:59:24.657+00	2026-05-23 12:59:24.657+00
10	2	ccbb0a2c-9600-47b8-826d-6efbbab927d8	2026-04-24 12:40:58.939+00	2026-05-24 12:40:58.939+00
11	2	685fd9cc-2548-4a19-a3d0-bbda042db996	2026-04-24 12:49:17.084+00	2026-05-24 12:49:17.084+00
12	2	6e1424a0-00c8-4de5-be9a-d68172445321	2026-04-24 14:26:57.851+00	2026-05-24 14:26:57.851+00
13	2	220ce876-b0aa-41b9-b99e-cdb5e387ec99	2026-04-24 14:44:03.398+00	2026-05-24 14:44:03.398+00
14	2	44b013a4-20cc-4e61-8ef7-471efbac9b28	2026-04-28 01:52:19.475+00	2026-05-28 01:52:19.475+00
15	2	edd4a404-52db-4018-be11-2fd60f7ba3ae	2026-04-28 03:06:43.864+00	2026-05-28 03:06:43.864+00
16	2	13060705-1c42-4099-aee2-5ac849b99a4e	2026-04-28 05:43:09.937+00	2026-05-28 05:43:09.937+00
17	2	1bd0b6c5-e52e-4f44-8361-17ad6963042e	2026-04-28 13:07:38.063+00	2026-05-28 13:07:38.063+00
18	2	a5d5b06c-0417-42b2-ac3d-362b8acac790	2026-04-28 14:15:57.612+00	2026-05-28 14:15:57.612+00
19	2	7b767c85-0584-4d4c-b279-0fe58bb27c7b	2026-04-29 01:46:49.984+00	2026-05-29 01:46:49.984+00
20	2	166e45a6-4fc9-41db-af83-c8b7fcdc99f9	2026-04-29 10:49:29.326+00	2026-05-29 10:49:29.326+00
21	2	dada5829-f156-4187-bb4d-4fd51447d17e	2026-04-29 13:30:10.636+00	2026-05-29 13:30:10.636+00
22	2	913f74fc-c10a-4e36-84f9-b4016df89c87	2026-04-29 13:53:09.662+00	2026-05-29 13:53:09.662+00
23	2	d8f1600c-1406-41ae-9d61-6fd390c65673	2026-04-29 14:47:22.79+00	2026-05-29 14:47:22.79+00
24	2	1835b5bb-147d-478f-a03e-6f018e7415c4	2026-05-05 10:53:51.496+00	2026-06-04 10:53:51.496+00
25	2	ec0f73d9-9743-4093-a713-c8777b342184	2026-05-05 11:17:55.678+00	2026-06-04 11:17:55.678+00
26	2	7f65aac4-a913-4e8c-974c-53b15f350a7c	2026-05-06 04:38:55.081+00	2026-06-05 04:38:55.081+00
27	2	daf6f25a-108c-42f9-a951-2b2ee277e2d9	2026-05-06 12:18:45.354+00	2026-06-05 12:18:45.354+00
28	2	0d450960-fd80-4167-ba41-808830548e7b	2026-05-06 13:17:13.996+00	2026-06-05 13:17:13.996+00
29	2	4bd9ba54-71e5-4057-9a03-7158e98b05b3	2026-05-06 14:16:52.69+00	2026-06-05 14:16:52.69+00
30	2	32fb3b52-0404-48a4-b741-9f56680ec9c6	2026-05-07 00:07:00.997+00	2026-06-06 00:07:00.997+00
31	2	e6b859c9-87d9-403b-8c2c-e446fac1a073	2026-05-07 00:10:20.156+00	2026-06-06 00:10:20.156+00
32	2	2d4ecc4b-c220-4ba7-b14c-2c946d3b89a5	2026-05-07 11:04:21.621+00	2026-06-06 11:04:21.621+00
33	2	ddc65481-daaf-4951-8241-b3a9827a6100	2026-05-07 11:36:09.868+00	2026-06-06 11:36:09.868+00
34	2	8034eb9e-90d9-40ec-b461-c81fba901775	2026-05-08 06:26:07.781+00	2026-06-07 06:26:07.781+00
35	2	4cb47dc5-330a-404c-a037-ba6f49ca6242	2026-05-08 06:45:29.131+00	2026-06-07 06:45:29.131+00
36	2	a2cae34d-7e61-4415-9a4c-afdee7c8371a	2026-05-10 03:35:09.689+00	2026-06-09 03:35:09.689+00
37	2	174a0ba3-7da3-4557-8515-3733eac4ddd1	2026-05-10 04:23:59.828+00	2026-06-09 04:23:59.828+00
38	2	f27d52d4-70e5-479d-9a25-d9e74e9dc150	2026-05-10 04:51:16.809+00	2026-06-09 04:51:16.809+00
39	2	ae6e001d-de0c-4956-81b9-9b48744cb611	2026-05-10 05:28:04.3+00	2026-06-09 05:28:04.3+00
40	2	afcfe6d0-9b45-4a9e-a37e-5192e270886c	2026-05-10 13:25:38.711+00	2026-06-09 13:25:38.711+00
41	2	00ea7f62-86e4-4015-a1d8-d1e41f9830c4	2026-05-10 13:25:46.477+00	2026-06-09 13:25:46.477+00
42	2	bb053906-f62d-4dff-ae67-50e9482fbf51	2026-05-10 13:26:20.528+00	2026-06-09 13:26:20.528+00
43	2	00af79e9-4dbf-47f5-b524-99a59b5a684d	2026-05-12 01:34:02.513+00	2026-06-11 01:34:02.513+00
44	2	03a23c7a-0760-4969-b1e7-d1cf595f9a57	2026-05-12 08:23:37.424+00	2026-06-11 08:23:37.424+00
45	2	5c3b9834-2b9e-4a4f-97d4-7464ec17bb6a	2026-05-12 08:33:47.981+00	2026-06-11 08:33:47.981+00
46	2	95857c8e-7d53-425e-8961-e19c2a22c558	2026-05-12 10:31:47.994+00	2026-06-11 10:31:47.994+00
47	2	05aee6ce-a893-4323-aabe-7ace19754f42	2026-05-12 10:42:21.716+00	2026-06-11 10:42:21.716+00
48	2	e96a42f9-bf59-4acf-a5bb-0e0ffcb36589	2026-05-13 12:46:01.727+00	2026-06-12 12:46:01.727+00
49	2	304a3d7e-3e88-42f0-ac69-459c20b3e31d	2026-05-13 12:46:49.846+00	2026-06-12 12:46:49.846+00
50	2	2f89960e-020c-43ab-bde1-47b9e6151585	2026-05-14 01:43:25.207+00	2026-06-13 01:43:25.207+00
51	2	e522c776-f92b-4f17-8ce9-b5b5bc2c9d0d	2026-05-14 08:40:19.16+00	2026-06-13 08:40:19.16+00
52	2	36cfec59-0435-40cf-8023-a30134b0c9f2	2026-05-14 09:05:23.064+00	2026-06-13 09:05:23.064+00
53	2	ad46f44f-97c8-4ece-8575-c8d740eff3be	2026-05-14 12:42:11.264+00	2026-06-13 12:42:11.264+00
54	2	e8d351e1-483c-44d7-8997-1c5aaf624756	2026-05-14 13:52:44.935+00	2026-06-13 13:52:44.935+00
55	2	6e4a29ee-700e-4bf0-b252-d546edd63879	2026-05-16 10:56:02.917+00	2026-06-15 10:56:02.917+00
56	2	1b75113c-1fe8-4432-9d94-be5bb387559e	2026-05-18 12:47:12.428+00	2026-06-17 12:47:12.428+00
57	2	b8008af7-1de5-48aa-9eb6-3fcf5476d812	2026-05-18 13:41:51.257+00	2026-06-17 13:41:51.257+00
\.


--
-- Data for Name: messages_2026_05_19; Type: TABLE DATA; Schema: realtime; Owner: -
--

COPY "realtime"."messages_2026_05_19" ("topic", "extension", "payload", "event", "private", "updated_at", "inserted_at", "id") FROM stdin;
\.


--
-- Data for Name: messages_2026_05_20; Type: TABLE DATA; Schema: realtime; Owner: -
--

COPY "realtime"."messages_2026_05_20" ("topic", "extension", "payload", "event", "private", "updated_at", "inserted_at", "id") FROM stdin;
\.


--
-- Data for Name: messages_2026_05_21; Type: TABLE DATA; Schema: realtime; Owner: -
--

COPY "realtime"."messages_2026_05_21" ("topic", "extension", "payload", "event", "private", "updated_at", "inserted_at", "id") FROM stdin;
\.


--
-- Data for Name: messages_2026_05_22; Type: TABLE DATA; Schema: realtime; Owner: -
--

COPY "realtime"."messages_2026_05_22" ("topic", "extension", "payload", "event", "private", "updated_at", "inserted_at", "id") FROM stdin;
\.


--
-- Data for Name: messages_2026_05_23; Type: TABLE DATA; Schema: realtime; Owner: -
--

COPY "realtime"."messages_2026_05_23" ("topic", "extension", "payload", "event", "private", "updated_at", "inserted_at", "id") FROM stdin;
\.


--
-- Data for Name: messages_2026_05_24; Type: TABLE DATA; Schema: realtime; Owner: -
--

COPY "realtime"."messages_2026_05_24" ("topic", "extension", "payload", "event", "private", "updated_at", "inserted_at", "id") FROM stdin;
\.


--
-- Data for Name: messages_2026_05_25; Type: TABLE DATA; Schema: realtime; Owner: -
--

COPY "realtime"."messages_2026_05_25" ("topic", "extension", "payload", "event", "private", "updated_at", "inserted_at", "id") FROM stdin;
\.


--
-- Data for Name: schema_migrations; Type: TABLE DATA; Schema: realtime; Owner: -
--

COPY "realtime"."schema_migrations" ("version", "inserted_at") FROM stdin;
20211116024918	2025-08-24 03:47:39
20211116045059	2025-08-24 03:47:39
20211116050929	2025-08-24 03:47:39
20211116051442	2025-08-24 03:47:39
20211116212300	2025-08-24 03:47:39
20211116213355	2025-08-24 03:47:39
20211116213934	2025-08-24 03:47:39
20211116214523	2025-08-24 03:47:39
20211122062447	2025-08-24 03:47:39
20211124070109	2025-08-24 03:47:39
20211202204204	2025-08-24 03:47:40
20211202204605	2025-08-24 03:47:40
20211210212804	2025-08-24 03:47:40
20211228014915	2025-08-24 03:47:40
20220107221237	2025-08-24 03:47:40
20220228202821	2025-08-24 03:47:40
20220312004840	2025-08-24 03:47:40
20220603231003	2025-08-24 03:47:40
20220603232444	2025-08-24 03:47:40
20220615214548	2025-08-24 03:47:40
20220712093339	2025-08-24 03:47:40
20220908172859	2025-08-24 03:47:40
20220916233421	2025-08-24 03:47:40
20230119133233	2025-08-24 03:47:40
20230128025114	2025-08-24 03:47:40
20230128025212	2025-08-24 03:47:40
20230227211149	2025-08-24 03:47:40
20230228184745	2025-08-24 03:47:40
20230308225145	2025-08-24 03:47:40
20230328144023	2025-08-24 03:47:40
20231018144023	2025-08-24 03:47:40
20231204144023	2025-08-24 03:47:40
20231204144024	2025-08-24 03:47:40
20231204144025	2025-08-24 03:47:40
20240108234812	2025-08-24 03:47:40
20240109165339	2025-08-24 03:47:40
20240227174441	2025-08-24 03:47:40
20240311171622	2025-08-24 03:47:40
20240321100241	2025-08-24 03:47:40
20240401105812	2025-08-24 03:47:40
20240418121054	2025-08-24 03:47:40
20240523004032	2025-08-24 03:47:40
20240618124746	2025-08-24 03:47:40
20240801235015	2025-08-24 03:47:40
20240805133720	2025-08-24 03:47:40
20240827160934	2025-08-24 03:47:40
20240919163303	2025-08-24 03:47:40
20240919163305	2025-08-24 03:47:40
20241019105805	2025-08-24 03:47:40
20241030150047	2025-08-24 03:47:40
20241108114728	2025-08-24 03:47:40
20241121104152	2025-08-24 03:47:40
20241130184212	2025-08-24 03:47:40
20241220035512	2025-08-24 03:47:40
20241220123912	2025-08-24 03:47:40
20241224161212	2025-08-24 03:47:40
20250107150512	2025-08-24 03:47:40
20250110162412	2025-08-24 03:47:40
20250123174212	2025-08-24 03:47:41
20250128220012	2025-08-24 03:47:41
20250506224012	2025-08-24 03:47:41
20250523164012	2025-08-24 03:47:41
20250714121412	2025-08-24 03:47:41
20250905041441	2025-11-24 03:59:11
20251103001201	2025-11-24 03:59:11
20251120212548	2026-02-04 04:40:20
20251120215549	2026-02-04 04:40:20
20260218120000	2026-03-08 08:45:14
20260326120000	2026-04-13 11:21:10
\.


--
-- Data for Name: subscription; Type: TABLE DATA; Schema: realtime; Owner: -
--

COPY "realtime"."subscription" ("id", "subscription_id", "entity", "filters", "claims", "created_at", "action_filter") FROM stdin;
\.


--
-- Data for Name: buckets; Type: TABLE DATA; Schema: storage; Owner: -
--

COPY "storage"."buckets" ("id", "name", "owner", "created_at", "updated_at", "public", "avif_autodetection", "file_size_limit", "allowed_mime_types", "owner_id", "type") FROM stdin;
\.


--
-- Data for Name: buckets_analytics; Type: TABLE DATA; Schema: storage; Owner: -
--

COPY "storage"."buckets_analytics" ("name", "type", "format", "created_at", "updated_at", "id", "deleted_at") FROM stdin;
\.


--
-- Data for Name: migrations; Type: TABLE DATA; Schema: storage; Owner: -
--

COPY "storage"."migrations" ("id", "name", "hash", "executed_at") FROM stdin;
0	create-migrations-table	e18db593bcde2aca2a408c4d1100f6abba2195df	2025-08-24 03:47:48.74304
1	initialmigration	6ab16121fbaa08bbd11b712d05f358f9b555d777	2025-08-24 03:47:48.756434
3	pathtoken-column	2cb1b0004b817b29d5b0a971af16bafeede4b70d	2025-08-24 03:47:48.808678
4	add-migrations-rls	427c5b63fe1c5937495d9c635c263ee7a5905058	2025-08-24 03:47:48.893767
5	add-size-functions	79e081a1455b63666c1294a440f8ad4b1e6a7f84	2025-08-24 03:47:48.899746
7	add-rls-to-buckets	e7e7f86adbc51049f341dfe8d30256c1abca17aa	2025-08-24 03:47:48.918327
8	add-public-to-buckets	fd670db39ed65f9d08b01db09d6202503ca2bab3	2025-08-24 03:47:48.924093
11	add-trigger-to-auto-update-updated_at-column	7425bdb14366d1739fa8a18c83100636d74dcaa2	2025-08-24 03:47:48.948635
12	add-automatic-avif-detection-flag	8e92e1266eb29518b6a4c5313ab8f29dd0d08df9	2025-08-24 03:47:48.960991
13	add-bucket-custom-limits	cce962054138135cd9a8c4bcd531598684b25e7d	2025-08-24 03:47:48.966675
14	use-bytes-for-max-size	941c41b346f9802b411f06f30e972ad4744dad27	2025-08-24 03:47:48.972463
15	add-can-insert-object-function	934146bc38ead475f4ef4b555c524ee5d66799e5	2025-08-24 03:47:48.999287
16	add-version	76debf38d3fd07dcfc747ca49096457d95b1221b	2025-08-24 03:47:49.004069
17	drop-owner-foreign-key	f1cbb288f1b7a4c1eb8c38504b80ae2a0153d101	2025-08-24 03:47:49.009631
18	add_owner_id_column_deprecate_owner	e7a511b379110b08e2f214be852c35414749fe66	2025-08-24 03:47:49.016098
19	alter-default-value-objects-id	02e5e22a78626187e00d173dc45f58fa66a4f043	2025-08-24 03:47:49.025274
20	list-objects-with-delimiter	cd694ae708e51ba82bf012bba00caf4f3b6393b7	2025-08-24 03:47:49.030688
21	s3-multipart-uploads	8c804d4a566c40cd1e4cc5b3725a664a9303657f	2025-08-24 03:47:49.038373
22	s3-multipart-uploads-big-ints	9737dc258d2397953c9953d9b86920b8be0cdb73	2025-08-24 03:47:49.059191
23	optimize-search-function	9d7e604cddc4b56a5422dc68c9313f4a1b6f132c	2025-08-24 03:47:49.072095
24	operation-function	8312e37c2bf9e76bbe841aa5fda889206d2bf8aa	2025-08-24 03:47:49.077738
25	custom-metadata	d974c6057c3db1c1f847afa0e291e6165693b990	2025-08-24 03:47:49.083952
37	add-bucket-name-length-trigger	3944135b4e3e8b22d6d4cbb568fe3b0b51df15c1	2025-09-03 23:19:22.740878
44	vector-bucket-type	99c20c0ffd52bb1ff1f32fb992f3b351e3ef8fb3	2025-11-24 03:59:13.507576
45	vector-buckets	049e27196d77a7cb76497a85afae669d8b230953	2025-11-24 03:59:13.514693
46	buckets-objects-grants	fedeb96d60fefd8e02ab3ded9fbde05632f84aed	2025-11-24 03:59:13.5688
47	iceberg-table-metadata	649df56855c24d8b36dd4cc1aeb8251aa9ad42c2	2025-11-24 03:59:13.573258
49	buckets-objects-grants-postgres	072b1195d0d5a2f888af6b2302a1938dd94b8b3d	2025-12-21 15:36:35.310468
2	storage-schema	f6a1fa2c93cbcd16d4e487b362e45fca157a8dbd	2025-08-24 03:47:48.762705
6	change-column-name-in-get-size	ded78e2f1b5d7e616117897e6443a925965b30d2	2025-08-24 03:47:48.90765
9	fix-search-function	af597a1b590c70519b464a4ab3be54490712796b	2025-08-24 03:47:48.931438
10	search-files-search-function	b595f05e92f7e91211af1bbfe9c6a13bb3391e16	2025-08-24 03:47:48.941823
26	objects-prefixes	215cabcb7f78121892a5a2037a09fedf9a1ae322	2025-09-03 23:19:22.044628
27	search-v2	859ba38092ac96eb3964d83bf53ccc0b141663a6	2025-09-03 23:19:22.354685
28	object-bucket-name-sorting	c73a2b5b5d4041e39705814fd3a1b95502d38ce4	2025-09-03 23:19:22.453305
29	create-prefixes	ad2c1207f76703d11a9f9007f821620017a66c21	2025-09-03 23:19:22.537727
30	update-object-levels	2be814ff05c8252fdfdc7cfb4b7f5c7e17f0bed6	2025-09-03 23:19:22.551875
31	objects-level-index	b40367c14c3440ec75f19bbce2d71e914ddd3da0	2025-09-03 23:19:22.559796
32	backward-compatible-index-on-objects	e0c37182b0f7aee3efd823298fb3c76f1042c0f7	2025-09-03 23:19:22.635539
33	backward-compatible-index-on-prefixes	b480e99ed951e0900f033ec4eb34b5bdcb4e3d49	2025-09-03 23:19:22.645612
34	optimize-search-function-v1	ca80a3dc7bfef894df17108785ce29a7fc8ee456	2025-09-03 23:19:22.647955
35	add-insert-trigger-prefixes	458fe0ffd07ec53f5e3ce9df51bfdf4861929ccc	2025-09-03 23:19:22.659785
36	optimise-existing-functions	6ae5fca6af5c55abe95369cd4f93985d1814ca8f	2025-09-03 23:19:22.665858
38	iceberg-catalog-flag-on-buckets	02716b81ceec9705aed84aa1501657095b32e5c5	2025-09-03 23:19:22.751248
39	add-search-v2-sort-support	6706c5f2928846abee18461279799ad12b279b78	2025-11-24 03:59:13.443848
40	fix-prefix-race-conditions-optimized	7ad69982ae2d372b21f48fc4829ae9752c518f6b	2025-11-24 03:59:13.470356
41	add-object-level-update-trigger	07fcf1a22165849b7a029deed059ffcde08d1ae0	2025-11-24 03:59:13.494527
42	rollback-prefix-triggers	771479077764adc09e2ea2043eb627503c034cd4	2025-11-24 03:59:13.498936
43	fix-object-level	84b35d6caca9d937478ad8a797491f38b8c2979f	2025-11-24 03:59:13.504605
48	iceberg-catalog-ids	e0e8b460c609b9999ccd0df9ad14294613eed939	2025-11-24 03:59:13.576045
50	search-v2-optimised	6323ac4f850aa14e7387eb32102869578b5bd478	2026-03-08 08:45:17.280239
51	index-backward-compatible-search	2ee395d433f76e38bcd3856debaf6e0e5b674011	2026-03-08 08:45:17.353513
52	drop-not-used-indexes-and-functions	5cc44c8696749ac11dd0dc37f2a3802075f3a171	2026-03-08 08:45:17.355295
53	drop-index-lower-name	d0cb18777d9e2a98ebe0bc5cc7a42e57ebe41854	2026-03-08 08:45:17.560461
54	drop-index-object-level	6289e048b1472da17c31a7eba1ded625a6457e67	2026-03-08 08:45:17.562607
55	prevent-direct-deletes	262a4798d5e0f2e7c8970232e03ce8be695d5819	2026-03-08 08:45:17.5641
57	s3-multipart-uploads-metadata	f127886e00d1b374fadbc7c6b31e09336aad5287	2026-04-13 11:20:33.984698
58	operation-ergonomics	00ca5d483b3fe0d522133d9002ccc5df98365120	2026-04-13 11:20:34.009517
56	fix-optimized-search-function	b823ed1e418101032fa01374edc9a436e54e3ed4	2026-03-08 08:45:17.571975
59	drop-unused-functions	38456f13e39691c2bbb4b5151d0d1cdbabd4a8c4	2026-05-22 10:13:45.138257
60	optimize-existing-functions-again	db35e1c91a9201e59f4fef8d972c2f277d68b157	2026-05-22 10:13:45.169389
\.


--
-- Data for Name: objects; Type: TABLE DATA; Schema: storage; Owner: -
--

COPY "storage"."objects" ("id", "bucket_id", "name", "owner", "created_at", "updated_at", "last_accessed_at", "metadata", "version", "owner_id", "user_metadata") FROM stdin;
\.


--
-- Data for Name: s3_multipart_uploads; Type: TABLE DATA; Schema: storage; Owner: -
--

COPY "storage"."s3_multipart_uploads" ("id", "in_progress_size", "upload_signature", "bucket_id", "key", "version", "owner_id", "created_at", "user_metadata", "metadata") FROM stdin;
\.


--
-- Data for Name: s3_multipart_uploads_parts; Type: TABLE DATA; Schema: storage; Owner: -
--

COPY "storage"."s3_multipart_uploads_parts" ("id", "upload_id", "size", "part_number", "bucket_id", "key", "etag", "owner_id", "version", "created_at") FROM stdin;
\.


--
-- Data for Name: secrets; Type: TABLE DATA; Schema: vault; Owner: -
--

COPY "vault"."secrets" ("id", "name", "description", "secret", "key_id", "nonce", "created_at", "updated_at") FROM stdin;
\.


--
-- Name: refresh_tokens_id_seq; Type: SEQUENCE SET; Schema: auth; Owner: -
--

SELECT pg_catalog.setval('"auth"."refresh_tokens_id_seq"', 4, true);


--
-- Name: _posts_v_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('"public"."_posts_v_id_seq"', 3, true);


--
-- Name: _posts_v_rels_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('"public"."_posts_v_rels_id_seq"', 1, true);


--
-- Name: _posts_v_version_tags_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('"public"."_posts_v_version_tags_id_seq"', 1, false);


--
-- Name: admins_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('"public"."admins_id_seq"', 1, true);


--
-- Name: announcements_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('"public"."announcements_id_seq"', 1, true);


--
-- Name: assessment_submissions_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('"public"."assessment_submissions_id_seq"', 5, true);


--
-- Name: assessments_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('"public"."assessments_id_seq"', 4, true);


--
-- Name: assignment_submissions_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('"public"."assignment_submissions_id_seq"', 4, true);


--
-- Name: assignment_submissions_rels_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('"public"."assignment_submissions_rels_id_seq"', 15, true);


--
-- Name: assignments_allowed_file_types_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('"public"."assignments_allowed_file_types_id_seq"', 5, true);


--
-- Name: assignments_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('"public"."assignments_id_seq"', 5, true);


--
-- Name: assignments_rels_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('"public"."assignments_rels_id_seq"', 6, true);


--
-- Name: certificate_templates_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('"public"."certificate_templates_id_seq"', 1, true);


--
-- Name: certificates_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('"public"."certificates_id_seq"', 1, true);


--
-- Name: chat_message_status_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('"public"."chat_message_status_id_seq"', 37, true);


--
-- Name: chat_messages_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('"public"."chat_messages_id_seq"', 39, true);


--
-- Name: chat_messages_rels_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('"public"."chat_messages_rels_id_seq"', 1, false);


--
-- Name: chat_typing_status_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('"public"."chat_typing_status_id_seq"', 1, false);


--
-- Name: chats_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('"public"."chats_id_seq"', 27, true);


--
-- Name: chats_rels_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('"public"."chats_rels_id_seq"', 145, true);


--
-- Name: coupon_codes_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('"public"."coupon_codes_id_seq"', 1, true);


--
-- Name: coupon_codes_rels_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('"public"."coupon_codes_rels_id_seq"', 1, false);


--
-- Name: coupon_redemptions_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('"public"."coupon_redemptions_id_seq"', 1, false);


--
-- Name: course_categories_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('"public"."course_categories_id_seq"', 8, true);


--
-- Name: course_enrollments_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('"public"."course_enrollments_id_seq"', 61, true);


--
-- Name: course_item_progress_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('"public"."course_item_progress_id_seq"', 8, true);


--
-- Name: course_item_progress_rels_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('"public"."course_item_progress_rels_id_seq"', 13, true);


--
-- Name: course_lessons_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('"public"."course_lessons_id_seq"', 6, true);


--
-- Name: course_materials_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('"public"."course_materials_id_seq"', 4, true);


--
-- Name: course_modules_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('"public"."course_modules_id_seq"', 3, true);


--
-- Name: course_modules_rels_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('"public"."course_modules_rels_id_seq"', 49, true);


--
-- Name: courses_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('"public"."courses_id_seq"', 12, true);


--
-- Name: courses_rels_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('"public"."courses_rels_id_seq"', 134, true);


--
-- Name: emergency_contacts_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('"public"."emergency_contacts_id_seq"', 5, true);


--
-- Name: feedback_forms_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('"public"."feedback_forms_id_seq"', 1, true);


--
-- Name: feedback_submissions_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('"public"."feedback_submissions_id_seq"', 1, true);


--
-- Name: instructors_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('"public"."instructors_id_seq"', 1, true);


--
-- Name: lesson_materials_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('"public"."lesson_materials_id_seq"', 5, true);


--
-- Name: materials_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('"public"."materials_id_seq"', 4, true);


--
-- Name: materials_rels_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('"public"."materials_rels_id_seq"', 8, true);


--
-- Name: media_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('"public"."media_id_seq"', 62, true);


--
-- Name: notification_templates_channels_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('"public"."notification_templates_channels_id_seq"', 1, true);


--
-- Name: notification_templates_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('"public"."notification_templates_id_seq"', 1, true);


--
-- Name: notifications_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('"public"."notifications_id_seq"', 51, true);


--
-- Name: notifications_rels_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('"public"."notifications_rels_id_seq"', 1, false);


--
-- Name: payload_kv_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('"public"."payload_kv_id_seq"', 1, false);


--
-- Name: payload_locked_documents_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('"public"."payload_locked_documents_id_seq"', 189, true);


--
-- Name: payload_locked_documents_rels_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('"public"."payload_locked_documents_rels_id_seq"', 371, true);


--
-- Name: payload_migrations_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('"public"."payload_migrations_id_seq"', 105, true);


--
-- Name: payload_preferences_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('"public"."payload_preferences_id_seq"', 42, true);


--
-- Name: payload_preferences_rels_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('"public"."payload_preferences_rels_id_seq"', 107, true);


--
-- Name: post_categories_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('"public"."post_categories_id_seq"', 1, true);


--
-- Name: posts_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('"public"."posts_id_seq"', 1, true);


--
-- Name: posts_rels_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('"public"."posts_rels_id_seq"', 1, true);


--
-- Name: questions_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('"public"."questions_id_seq"', 15, true);


--
-- Name: questions_texts_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('"public"."questions_texts_id_seq"', 1, false);


--
-- Name: recent_searches_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('"public"."recent_searches_id_seq"', 40, true);


--
-- Name: recently_viewed_courses_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('"public"."recently_viewed_courses_id_seq"', 17, true);


--
-- Name: site_settings_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('"public"."site_settings_id_seq"', 1, true);


--
-- Name: submission_answers_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('"public"."submission_answers_id_seq"', 97, true);


--
-- Name: support_ticket_messages_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('"public"."support_ticket_messages_id_seq"', 8, true);


--
-- Name: support_ticket_messages_rels_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('"public"."support_ticket_messages_rels_id_seq"', 1, false);


--
-- Name: support_tickets_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('"public"."support_tickets_id_seq"', 4, true);


--
-- Name: support_tickets_rels_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('"public"."support_tickets_rels_id_seq"', 1, false);


--
-- Name: trainees_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('"public"."trainees_id_seq"', 5, true);


--
-- Name: user_events_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('"public"."user_events_id_seq"', 50, true);


--
-- Name: user_notifications_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('"public"."user_notifications_id_seq"', 51, true);


--
-- Name: users_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('"public"."users_id_seq"', 12, true);


--
-- Name: web_push_subscriptions_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('"public"."web_push_subscriptions_id_seq"', 6, true);


--
-- Name: wishlists_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('"public"."wishlists_id_seq"', 10, true);


--
-- Name: subscription_id_seq; Type: SEQUENCE SET; Schema: realtime; Owner: -
--

SELECT pg_catalog.setval('"realtime"."subscription_id_seq"', 54, true);


--
-- PostgreSQL database dump complete
--

\unrestrict VUlDMptdaat1JXHbSguM7v6scoOjv9PFNVGdIowP93Ggeh64vw5Row3VKeJurcf

