--
-- PostgreSQL database dump
--

\restrict latZrL8P8ywdD529ocvcMcFA8uWmdjT3pzAIQ8lnNY5AnFlIkZE83vugozcd6TS

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
-- Name: auth; Type: SCHEMA; Schema: -; Owner: -
--

CREATE SCHEMA "auth";


--
-- Name: extensions; Type: SCHEMA; Schema: -; Owner: -
--

CREATE SCHEMA "extensions";


--
-- Name: graphql; Type: SCHEMA; Schema: -; Owner: -
--

CREATE SCHEMA "graphql";


--
-- Name: graphql_public; Type: SCHEMA; Schema: -; Owner: -
--

CREATE SCHEMA "graphql_public";


--
-- Name: pgbouncer; Type: SCHEMA; Schema: -; Owner: -
--

CREATE SCHEMA "pgbouncer";


--
-- Name: public; Type: SCHEMA; Schema: -; Owner: -
--

-- *not* creating schema, since initdb creates it


--
-- Name: realtime; Type: SCHEMA; Schema: -; Owner: -
--

CREATE SCHEMA "realtime";


--
-- Name: storage; Type: SCHEMA; Schema: -; Owner: -
--

CREATE SCHEMA "storage";


--
-- Name: vault; Type: SCHEMA; Schema: -; Owner: -
--

CREATE SCHEMA "vault";


--
-- Name: pg_stat_statements; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS "pg_stat_statements" WITH SCHEMA "extensions";


--
-- Name: EXTENSION "pg_stat_statements"; Type: COMMENT; Schema: -; Owner: -
--

COMMENT ON EXTENSION "pg_stat_statements" IS 'track planning and execution statistics of all SQL statements executed';


--
-- Name: pgcrypto; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS "pgcrypto" WITH SCHEMA "extensions";


--
-- Name: EXTENSION "pgcrypto"; Type: COMMENT; Schema: -; Owner: -
--

COMMENT ON EXTENSION "pgcrypto" IS 'cryptographic functions';


--
-- Name: supabase_vault; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS "supabase_vault" WITH SCHEMA "vault";


--
-- Name: EXTENSION "supabase_vault"; Type: COMMENT; Schema: -; Owner: -
--

COMMENT ON EXTENSION "supabase_vault" IS 'Supabase Vault Extension';


--
-- Name: uuid-ossp; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA "extensions";


--
-- Name: EXTENSION "uuid-ossp"; Type: COMMENT; Schema: -; Owner: -
--

COMMENT ON EXTENSION "uuid-ossp" IS 'generate universally unique identifiers (UUIDs)';


--
-- Name: aal_level; Type: TYPE; Schema: auth; Owner: -
--

CREATE TYPE "auth"."aal_level" AS ENUM (
    'aal1',
    'aal2',
    'aal3'
);


--
-- Name: code_challenge_method; Type: TYPE; Schema: auth; Owner: -
--

CREATE TYPE "auth"."code_challenge_method" AS ENUM (
    's256',
    'plain'
);


--
-- Name: factor_status; Type: TYPE; Schema: auth; Owner: -
--

CREATE TYPE "auth"."factor_status" AS ENUM (
    'unverified',
    'verified'
);


--
-- Name: factor_type; Type: TYPE; Schema: auth; Owner: -
--

CREATE TYPE "auth"."factor_type" AS ENUM (
    'totp',
    'webauthn',
    'phone'
);


--
-- Name: oauth_authorization_status; Type: TYPE; Schema: auth; Owner: -
--

CREATE TYPE "auth"."oauth_authorization_status" AS ENUM (
    'pending',
    'approved',
    'denied',
    'expired'
);


--
-- Name: oauth_client_type; Type: TYPE; Schema: auth; Owner: -
--

CREATE TYPE "auth"."oauth_client_type" AS ENUM (
    'public',
    'confidential'
);


--
-- Name: oauth_registration_type; Type: TYPE; Schema: auth; Owner: -
--

CREATE TYPE "auth"."oauth_registration_type" AS ENUM (
    'dynamic',
    'manual'
);


--
-- Name: oauth_response_type; Type: TYPE; Schema: auth; Owner: -
--

CREATE TYPE "auth"."oauth_response_type" AS ENUM (
    'code'
);


--
-- Name: one_time_token_type; Type: TYPE; Schema: auth; Owner: -
--

CREATE TYPE "auth"."one_time_token_type" AS ENUM (
    'confirmation_token',
    'reauthentication_token',
    'recovery_token',
    'email_change_token_new',
    'email_change_token_current',
    'phone_change_token'
);


--
-- Name: enum__posts_v_version_status; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE "public"."enum__posts_v_version_status" AS ENUM (
    'draft',
    'published'
);


--
-- Name: enum_admins_admin_level; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE "public"."enum_admins_admin_level" AS ENUM (
    'system',
    'department',
    'content'
);


--
-- Name: enum_assessment_submissions_status; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE "public"."enum_assessment_submissions_status" AS ENUM (
    'in_progress',
    'submitted',
    'graded'
);


--
-- Name: enum_assessments_assessment_type; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE "public"."enum_assessments_assessment_type" AS ENUM (
    'quiz',
    'exam',
    'final_exam'
);


--
-- Name: enum_assignment_submissions_status; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE "public"."enum_assignment_submissions_status" AS ENUM (
    'draft',
    'submitted',
    'graded',
    'returned_for_revision'
);


--
-- Name: enum_assignments_allowed_file_types; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE "public"."enum_assignments_allowed_file_types" AS ENUM (
    'pdf',
    'word',
    'excel',
    'powerpoint',
    'images',
    'zip'
);


--
-- Name: enum_assignments_submission_type; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE "public"."enum_assignments_submission_type" AS ENUM (
    'file_upload',
    'text_entry',
    'both'
);


--
-- Name: enum_certificate_templates_status; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE "public"."enum_certificate_templates_status" AS ENUM (
    'draft',
    'published',
    'archived'
);


--
-- Name: enum_certificates_status; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE "public"."enum_certificates_status" AS ENUM (
    'active',
    'revoked',
    'expired'
);


--
-- Name: enum_chat_message_status_status; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE "public"."enum_chat_message_status_status" AS ENUM (
    'delivered',
    'read'
);


--
-- Name: enum_chat_messages_content_type; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE "public"."enum_chat_messages_content_type" AS ENUM (
    'text',
    'image',
    'file',
    'system'
);


--
-- Name: enum_chats_status; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE "public"."enum_chats_status" AS ENUM (
    'active',
    'archived',
    'deleted'
);


--
-- Name: enum_chats_type; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE "public"."enum_chats_type" AS ENUM (
    'direct',
    'group',
    'instructor_trainee'
);


--
-- Name: enum_coupon_codes_discount_type; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE "public"."enum_coupon_codes_discount_type" AS ENUM (
    'percent',
    'fixed_course',
    'fixed_cart'
);


--
-- Name: enum_coupon_codes_scope_type; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE "public"."enum_coupon_codes_scope_type" AS ENUM (
    'all_courses',
    'specific_courses',
    'specific_categories'
);


--
-- Name: enum_coupon_codes_status; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE "public"."enum_coupon_codes_status" AS ENUM (
    'draft',
    'active',
    'paused',
    'expired',
    'archived'
);


--
-- Name: enum_coupon_redemptions_context_type; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE "public"."enum_coupon_redemptions_context_type" AS ENUM (
    'checkout_preview',
    'checkout_commit',
    'manual_adjustment',
    'refund_reversal'
);


--
-- Name: enum_coupon_redemptions_status; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE "public"."enum_coupon_redemptions_status" AS ENUM (
    'applied',
    'voided',
    'reversed'
);


--
-- Name: enum_course_categories_category_type; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE "public"."enum_course_categories_category_type" AS ENUM (
    'course',
    'skill',
    'topic',
    'industry'
);


--
-- Name: enum_course_enrollments_enrollment_type; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE "public"."enum_course_enrollments_enrollment_type" AS ENUM (
    'free',
    'paid',
    'scholarship',
    'trial',
    'corporate'
);


--
-- Name: enum_course_enrollments_final_evaluation; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE "public"."enum_course_enrollments_final_evaluation" AS ENUM (
    'passed',
    'failed'
);


--
-- Name: enum_course_enrollments_payment_status; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE "public"."enum_course_enrollments_payment_status" AS ENUM (
    'completed',
    'pending',
    'failed',
    'refunded',
    'not_required'
);


--
-- Name: enum_course_enrollments_status; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE "public"."enum_course_enrollments_status" AS ENUM (
    'active',
    'suspended',
    'completed',
    'dropped',
    'expired',
    'pending'
);


--
-- Name: enum_course_item_progress_status; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE "public"."enum_course_item_progress_status" AS ENUM (
    'not_started',
    'in_progress',
    'completed',
    'passed',
    'failed'
);


--
-- Name: enum_courses_difficulty_level; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE "public"."enum_courses_difficulty_level" AS ENUM (
    'standard',
    'intermediate',
    'advanced'
);


--
-- Name: enum_courses_estimated_duration_unit; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE "public"."enum_courses_estimated_duration_unit" AS ENUM (
    'minutes',
    'hours',
    'days',
    'weeks'
);


--
-- Name: enum_courses_evaluation_mode; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE "public"."enum_courses_evaluation_mode" AS ENUM (
    'lessons',
    'exam',
    'quizzes',
    'lessons_exam',
    'lessons_quizzes',
    'quizzes_exam',
    'lessons_quizzes_exam'
);


--
-- Name: enum_courses_language; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE "public"."enum_courses_language" AS ENUM (
    'en',
    'es',
    'fr',
    'de'
);


--
-- Name: enum_courses_status; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE "public"."enum_courses_status" AS ENUM (
    'draft',
    'published'
);


--
-- Name: enum_emergency_contacts_relationship; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE "public"."enum_emergency_contacts_relationship" AS ENUM (
    'parent',
    'spouse',
    'sibling',
    'child',
    'guardian',
    'friend',
    'relative',
    'other'
);


--
-- Name: enum_feedback_forms_blocks_choice_input_ui_type; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE "public"."enum_feedback_forms_blocks_choice_input_ui_type" AS ENUM (
    'radio',
    'dropdown',
    'checkbox_group'
);


--
-- Name: enum_feedback_forms_blocks_text_input_format; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE "public"."enum_feedback_forms_blocks_text_input_format" AS ENUM (
    'text',
    'email',
    'phone',
    'number',
    'textarea'
);


--
-- Name: enum_materials_material_source; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE "public"."enum_materials_material_source" AS ENUM (
    'media',
    'external'
);


--
-- Name: enum_notification_templates_category; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE "public"."enum_notification_templates_category" AS ENUM (
    'learning',
    'account',
    'system-update',
    'other'
);


--
-- Name: enum_notification_templates_channels; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE "public"."enum_notification_templates_channels" AS ENUM (
    'in-app',
    'email',
    'push'
);


--
-- Name: enum_notifications_audience_role; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE "public"."enum_notifications_audience_role" AS ENUM (
    'trainee',
    'instructor',
    'admin',
    'service'
);


--
-- Name: enum_notifications_audience_type; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE "public"."enum_notifications_audience_type" AS ENUM (
    'all-users',
    'role',
    'segment',
    'specific-users'
);


--
-- Name: enum_notifications_category; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE "public"."enum_notifications_category" AS ENUM (
    'learning',
    'account',
    'system-update',
    'other'
);


--
-- Name: enum_notifications_origin; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE "public"."enum_notifications_origin" AS ENUM (
    'manual',
    'automatic'
);


--
-- Name: enum_notifications_status; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE "public"."enum_notifications_status" AS ENUM (
    'draft',
    'scheduled',
    'sent',
    'cancelled'
);


--
-- Name: enum_posts_status; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE "public"."enum_posts_status" AS ENUM (
    'draft',
    'published'
);


--
-- Name: enum_questions_difficulty; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE "public"."enum_questions_difficulty" AS ENUM (
    'easy',
    'medium',
    'hard'
);


--
-- Name: enum_questions_status; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE "public"."enum_questions_status" AS ENUM (
    'draft',
    'active',
    'deprecated'
);


--
-- Name: enum_questions_true_false_correct; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE "public"."enum_questions_true_false_correct" AS ENUM (
    'true',
    'false'
);


--
-- Name: enum_questions_type; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE "public"."enum_questions_type" AS ENUM (
    'single_choice',
    'multiple_choice',
    'true_false'
);


--
-- Name: enum_site_settings_social_links_platform; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE "public"."enum_site_settings_social_links_platform" AS ENUM (
    'facebook',
    'twitter',
    'instagram',
    'linkedin',
    'youtube',
    'tiktok'
);


--
-- Name: enum_submission_answers_question_type; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE "public"."enum_submission_answers_question_type" AS ENUM (
    'single_choice',
    'multiple_choice',
    'true_false'
);


--
-- Name: enum_support_tickets_category; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE "public"."enum_support_tickets_category" AS ENUM (
    'technical',
    'billing',
    'course_content',
    'account',
    'general',
    'enrollment'
);


--
-- Name: enum_support_tickets_priority; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE "public"."enum_support_tickets_priority" AS ENUM (
    'low',
    'medium',
    'high',
    'critical'
);


--
-- Name: enum_support_tickets_status; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE "public"."enum_support_tickets_status" AS ENUM (
    'open',
    'in_progress',
    'waiting_for_user',
    'resolved',
    'closed'
);


--
-- Name: enum_trainees_current_level; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE "public"."enum_trainees_current_level" AS ENUM (
    'standard',
    'intermediate',
    'advanced'
);


--
-- Name: enum_user_events_event_type; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE "public"."enum_user_events_event_type" AS ENUM (
    'USER_CREATED',
    'ROLE_CHANGED',
    'PROFILE_UPDATED',
    'USER_DEACTIVATED',
    'USER_REACTIVATED',
    'LOGIN_SUCCESS',
    'LOGIN_FAILED',
    'PASSWORD_CHANGED'
);


--
-- Name: enum_user_notifications_category; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE "public"."enum_user_notifications_category" AS ENUM (
    'learning',
    'account',
    'system-update',
    'other'
);


--
-- Name: enum_user_notifications_channel; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE "public"."enum_user_notifications_channel" AS ENUM (
    'in-app',
    'email',
    'push'
);


--
-- Name: enum_users_civil_status; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE "public"."enum_users_civil_status" AS ENUM (
    'single',
    'married',
    'divorced',
    'widowed',
    'separated'
);


--
-- Name: enum_users_gender; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE "public"."enum_users_gender" AS ENUM (
    'male',
    'female',
    'other',
    'prefer_not_to_say'
);


--
-- Name: enum_users_role; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE "public"."enum_users_role" AS ENUM (
    'admin',
    'instructor',
    'trainee',
    'service'
);


--
-- Name: enum_web_push_subscriptions_permission_state; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE "public"."enum_web_push_subscriptions_permission_state" AS ENUM (
    'default',
    'granted',
    'denied'
);


--
-- Name: action; Type: TYPE; Schema: realtime; Owner: -
--

CREATE TYPE "realtime"."action" AS ENUM (
    'INSERT',
    'UPDATE',
    'DELETE',
    'TRUNCATE',
    'ERROR'
);


--
-- Name: equality_op; Type: TYPE; Schema: realtime; Owner: -
--

CREATE TYPE "realtime"."equality_op" AS ENUM (
    'eq',
    'neq',
    'lt',
    'lte',
    'gt',
    'gte',
    'in'
);


--
-- Name: user_defined_filter; Type: TYPE; Schema: realtime; Owner: -
--

CREATE TYPE "realtime"."user_defined_filter" AS (
	"column_name" "text",
	"op" "realtime"."equality_op",
	"value" "text"
);


--
-- Name: wal_column; Type: TYPE; Schema: realtime; Owner: -
--

CREATE TYPE "realtime"."wal_column" AS (
	"name" "text",
	"type_name" "text",
	"type_oid" "oid",
	"value" "jsonb",
	"is_pkey" boolean,
	"is_selectable" boolean
);


--
-- Name: wal_rls; Type: TYPE; Schema: realtime; Owner: -
--

CREATE TYPE "realtime"."wal_rls" AS (
	"wal" "jsonb",
	"is_rls_enabled" boolean,
	"subscription_ids" "uuid"[],
	"errors" "text"[]
);


--
-- Name: buckettype; Type: TYPE; Schema: storage; Owner: -
--

CREATE TYPE "storage"."buckettype" AS ENUM (
    'STANDARD',
    'ANALYTICS',
    'VECTOR'
);


--
-- Name: email(); Type: FUNCTION; Schema: auth; Owner: -
--

CREATE FUNCTION "auth"."email"() RETURNS "text"
    LANGUAGE "sql" STABLE
    AS $$
  select 
  coalesce(
    nullif(current_setting('request.jwt.claim.email', true), ''),
    (nullif(current_setting('request.jwt.claims', true), '')::jsonb ->> 'email')
  )::text
$$;


--
-- Name: FUNCTION "email"(); Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON FUNCTION "auth"."email"() IS 'Deprecated. Use auth.jwt() -> ''email'' instead.';


--
-- Name: jwt(); Type: FUNCTION; Schema: auth; Owner: -
--

CREATE FUNCTION "auth"."jwt"() RETURNS "jsonb"
    LANGUAGE "sql" STABLE
    AS $$
  select 
    coalesce(
        nullif(current_setting('request.jwt.claim', true), ''),
        nullif(current_setting('request.jwt.claims', true), '')
    )::jsonb
$$;


--
-- Name: role(); Type: FUNCTION; Schema: auth; Owner: -
--

CREATE FUNCTION "auth"."role"() RETURNS "text"
    LANGUAGE "sql" STABLE
    AS $$
  select 
  coalesce(
    nullif(current_setting('request.jwt.claim.role', true), ''),
    (nullif(current_setting('request.jwt.claims', true), '')::jsonb ->> 'role')
  )::text
$$;


--
-- Name: FUNCTION "role"(); Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON FUNCTION "auth"."role"() IS 'Deprecated. Use auth.jwt() -> ''role'' instead.';


--
-- Name: uid(); Type: FUNCTION; Schema: auth; Owner: -
--

CREATE FUNCTION "auth"."uid"() RETURNS "uuid"
    LANGUAGE "sql" STABLE
    AS $$
  select 
  coalesce(
    nullif(current_setting('request.jwt.claim.sub', true), ''),
    (nullif(current_setting('request.jwt.claims', true), '')::jsonb ->> 'sub')
  )::uuid
$$;


--
-- Name: FUNCTION "uid"(); Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON FUNCTION "auth"."uid"() IS 'Deprecated. Use auth.jwt() -> ''sub'' instead.';


--
-- Name: grant_pg_cron_access(); Type: FUNCTION; Schema: extensions; Owner: -
--

CREATE FUNCTION "extensions"."grant_pg_cron_access"() RETURNS "event_trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
  IF EXISTS (
    SELECT
    FROM pg_event_trigger_ddl_commands() AS ev
    JOIN pg_extension AS ext
    ON ev.objid = ext.oid
    WHERE ext.extname = 'pg_cron'
  )
  THEN
    grant usage on schema cron to postgres with grant option;

    alter default privileges in schema cron grant all on tables to postgres with grant option;
    alter default privileges in schema cron grant all on functions to postgres with grant option;
    alter default privileges in schema cron grant all on sequences to postgres with grant option;

    alter default privileges for user supabase_admin in schema cron grant all
        on sequences to postgres with grant option;
    alter default privileges for user supabase_admin in schema cron grant all
        on tables to postgres with grant option;
    alter default privileges for user supabase_admin in schema cron grant all
        on functions to postgres with grant option;

    grant all privileges on all tables in schema cron to postgres with grant option;
    revoke all on table cron.job from postgres;
    grant select on table cron.job to postgres with grant option;
  END IF;
END;
$$;


--
-- Name: FUNCTION "grant_pg_cron_access"(); Type: COMMENT; Schema: extensions; Owner: -
--

COMMENT ON FUNCTION "extensions"."grant_pg_cron_access"() IS 'Grants access to pg_cron';


--
-- Name: grant_pg_graphql_access(); Type: FUNCTION; Schema: extensions; Owner: -
--

CREATE FUNCTION "extensions"."grant_pg_graphql_access"() RETURNS "event_trigger"
    LANGUAGE "plpgsql"
    AS $_$
DECLARE
    func_is_graphql_resolve bool;
BEGIN
    func_is_graphql_resolve = (
        SELECT n.proname = 'resolve'
        FROM pg_event_trigger_ddl_commands() AS ev
        LEFT JOIN pg_catalog.pg_proc AS n
        ON ev.objid = n.oid
    );

    IF func_is_graphql_resolve
    THEN
        -- Update public wrapper to pass all arguments through to the pg_graphql resolve func
        DROP FUNCTION IF EXISTS graphql_public.graphql;
        create or replace function graphql_public.graphql(
            "operationName" text default null,
            query text default null,
            variables jsonb default null,
            extensions jsonb default null
        )
            returns jsonb
            language sql
        as $$
            select graphql.resolve(
                query := query,
                variables := coalesce(variables, '{}'),
                "operationName" := "operationName",
                extensions := extensions
            );
        $$;

        -- This hook executes when `graphql.resolve` is created. That is not necessarily the last
        -- function in the extension so we need to grant permissions on existing entities AND
        -- update default permissions to any others that are created after `graphql.resolve`
        grant usage on schema graphql to postgres, anon, authenticated, service_role;
        grant select on all tables in schema graphql to postgres, anon, authenticated, service_role;
        grant execute on all functions in schema graphql to postgres, anon, authenticated, service_role;
        grant all on all sequences in schema graphql to postgres, anon, authenticated, service_role;
        alter default privileges in schema graphql grant all on tables to postgres, anon, authenticated, service_role;
        alter default privileges in schema graphql grant all on functions to postgres, anon, authenticated, service_role;
        alter default privileges in schema graphql grant all on sequences to postgres, anon, authenticated, service_role;

        -- Allow postgres role to allow granting usage on graphql and graphql_public schemas to custom roles
        grant usage on schema graphql_public to postgres with grant option;
        grant usage on schema graphql to postgres with grant option;
    END IF;

END;
$_$;


--
-- Name: FUNCTION "grant_pg_graphql_access"(); Type: COMMENT; Schema: extensions; Owner: -
--

COMMENT ON FUNCTION "extensions"."grant_pg_graphql_access"() IS 'Grants access to pg_graphql';


--
-- Name: grant_pg_net_access(); Type: FUNCTION; Schema: extensions; Owner: -
--

CREATE FUNCTION "extensions"."grant_pg_net_access"() RETURNS "event_trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM pg_event_trigger_ddl_commands() AS ev
    JOIN pg_extension AS ext
    ON ev.objid = ext.oid
    WHERE ext.extname = 'pg_net'
  )
  THEN
    IF NOT EXISTS (
      SELECT 1
      FROM pg_roles
      WHERE rolname = 'supabase_functions_admin'
    )
    THEN
      CREATE USER supabase_functions_admin NOINHERIT CREATEROLE LOGIN NOREPLICATION;
    END IF;

    GRANT USAGE ON SCHEMA net TO supabase_functions_admin, postgres, anon, authenticated, service_role;

    IF EXISTS (
      SELECT FROM pg_extension
      WHERE extname = 'pg_net'
      -- all versions in use on existing projects as of 2025-02-20
      -- version 0.12.0 onwards don't need these applied
      AND extversion IN ('0.2', '0.6', '0.7', '0.7.1', '0.8', '0.10.0', '0.11.0')
    ) THEN
      ALTER function net.http_get(url text, params jsonb, headers jsonb, timeout_milliseconds integer) SECURITY DEFINER;
      ALTER function net.http_post(url text, body jsonb, params jsonb, headers jsonb, timeout_milliseconds integer) SECURITY DEFINER;

      ALTER function net.http_get(url text, params jsonb, headers jsonb, timeout_milliseconds integer) SET search_path = net;
      ALTER function net.http_post(url text, body jsonb, params jsonb, headers jsonb, timeout_milliseconds integer) SET search_path = net;

      REVOKE ALL ON FUNCTION net.http_get(url text, params jsonb, headers jsonb, timeout_milliseconds integer) FROM PUBLIC;
      REVOKE ALL ON FUNCTION net.http_post(url text, body jsonb, params jsonb, headers jsonb, timeout_milliseconds integer) FROM PUBLIC;

      GRANT EXECUTE ON FUNCTION net.http_get(url text, params jsonb, headers jsonb, timeout_milliseconds integer) TO supabase_functions_admin, postgres, anon, authenticated, service_role;
      GRANT EXECUTE ON FUNCTION net.http_post(url text, body jsonb, params jsonb, headers jsonb, timeout_milliseconds integer) TO supabase_functions_admin, postgres, anon, authenticated, service_role;
    END IF;
  END IF;
END;
$$;


--
-- Name: FUNCTION "grant_pg_net_access"(); Type: COMMENT; Schema: extensions; Owner: -
--

COMMENT ON FUNCTION "extensions"."grant_pg_net_access"() IS 'Grants access to pg_net';


--
-- Name: pgrst_ddl_watch(); Type: FUNCTION; Schema: extensions; Owner: -
--

CREATE FUNCTION "extensions"."pgrst_ddl_watch"() RETURNS "event_trigger"
    LANGUAGE "plpgsql"
    AS $$
DECLARE
  cmd record;
BEGIN
  FOR cmd IN SELECT * FROM pg_event_trigger_ddl_commands()
  LOOP
    IF cmd.command_tag IN (
      'CREATE SCHEMA', 'ALTER SCHEMA'
    , 'CREATE TABLE', 'CREATE TABLE AS', 'SELECT INTO', 'ALTER TABLE'
    , 'CREATE FOREIGN TABLE', 'ALTER FOREIGN TABLE'
    , 'CREATE VIEW', 'ALTER VIEW'
    , 'CREATE MATERIALIZED VIEW', 'ALTER MATERIALIZED VIEW'
    , 'CREATE FUNCTION', 'ALTER FUNCTION'
    , 'CREATE TRIGGER'
    , 'CREATE TYPE', 'ALTER TYPE'
    , 'CREATE RULE'
    , 'COMMENT'
    )
    -- don't notify in case of CREATE TEMP table or other objects created on pg_temp
    AND cmd.schema_name is distinct from 'pg_temp'
    THEN
      NOTIFY pgrst, 'reload schema';
    END IF;
  END LOOP;
END; $$;


--
-- Name: pgrst_drop_watch(); Type: FUNCTION; Schema: extensions; Owner: -
--

CREATE FUNCTION "extensions"."pgrst_drop_watch"() RETURNS "event_trigger"
    LANGUAGE "plpgsql"
    AS $$
DECLARE
  obj record;
BEGIN
  FOR obj IN SELECT * FROM pg_event_trigger_dropped_objects()
  LOOP
    IF obj.object_type IN (
      'schema'
    , 'table'
    , 'foreign table'
    , 'view'
    , 'materialized view'
    , 'function'
    , 'trigger'
    , 'type'
    , 'rule'
    )
    AND obj.is_temporary IS false -- no pg_temp objects
    THEN
      NOTIFY pgrst, 'reload schema';
    END IF;
  END LOOP;
END; $$;


--
-- Name: set_graphql_placeholder(); Type: FUNCTION; Schema: extensions; Owner: -
--

CREATE FUNCTION "extensions"."set_graphql_placeholder"() RETURNS "event_trigger"
    LANGUAGE "plpgsql"
    AS $_$
    DECLARE
    graphql_is_dropped bool;
    BEGIN
    graphql_is_dropped = (
        SELECT ev.schema_name = 'graphql_public'
        FROM pg_event_trigger_dropped_objects() AS ev
        WHERE ev.schema_name = 'graphql_public'
    );

    IF graphql_is_dropped
    THEN
        create or replace function graphql_public.graphql(
            "operationName" text default null,
            query text default null,
            variables jsonb default null,
            extensions jsonb default null
        )
            returns jsonb
            language plpgsql
        as $$
            DECLARE
                server_version float;
            BEGIN
                server_version = (SELECT (SPLIT_PART((select version()), ' ', 2))::float);

                IF server_version >= 14 THEN
                    RETURN jsonb_build_object(
                        'errors', jsonb_build_array(
                            jsonb_build_object(
                                'message', 'pg_graphql extension is not enabled.'
                            )
                        )
                    );
                ELSE
                    RETURN jsonb_build_object(
                        'errors', jsonb_build_array(
                            jsonb_build_object(
                                'message', 'pg_graphql is only available on projects running Postgres 14 onwards.'
                            )
                        )
                    );
                END IF;
            END;
        $$;
    END IF;

    END;
$_$;


--
-- Name: FUNCTION "set_graphql_placeholder"(); Type: COMMENT; Schema: extensions; Owner: -
--

COMMENT ON FUNCTION "extensions"."set_graphql_placeholder"() IS 'Reintroduces placeholder function for graphql_public.graphql';


--
-- Name: graphql("text", "text", "jsonb", "jsonb"); Type: FUNCTION; Schema: graphql_public; Owner: -
--

CREATE FUNCTION "graphql_public"."graphql"("operationName" "text" DEFAULT NULL::"text", "query" "text" DEFAULT NULL::"text", "variables" "jsonb" DEFAULT NULL::"jsonb", "extensions" "jsonb" DEFAULT NULL::"jsonb") RETURNS "jsonb"
    LANGUAGE "plpgsql"
    AS $$
            DECLARE
                server_version float;
            BEGIN
                server_version = (SELECT (SPLIT_PART((select version()), ' ', 2))::float);

                IF server_version >= 14 THEN
                    RETURN jsonb_build_object(
                        'errors', jsonb_build_array(
                            jsonb_build_object(
                                'message', 'pg_graphql extension is not enabled.'
                            )
                        )
                    );
                ELSE
                    RETURN jsonb_build_object(
                        'errors', jsonb_build_array(
                            jsonb_build_object(
                                'message', 'pg_graphql is only available on projects running Postgres 14 onwards.'
                            )
                        )
                    );
                END IF;
            END;
        $$;


--
-- Name: get_auth("text"); Type: FUNCTION; Schema: pgbouncer; Owner: -
--

CREATE FUNCTION "pgbouncer"."get_auth"("p_usename" "text") RETURNS TABLE("username" "text", "password" "text")
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO ''
    AS $_$
  BEGIN
      RAISE DEBUG 'PgBouncer auth request: %', p_usename;

      RETURN QUERY
      SELECT
          rolname::text,
          CASE WHEN rolvaliduntil < now()
              THEN null
              ELSE rolpassword::text
          END
      FROM pg_authid
      WHERE rolname=$1 and rolcanlogin;
  END;
  $_$;


--
-- Name: cleanup_role_record(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION "public"."cleanup_role_record"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
    BEGIN
        CASE OLD.role
            WHEN 'admin' THEN
                DELETE FROM admins WHERE user_id = OLD.id;
            WHEN 'instructor' THEN
                DELETE FROM instructors WHERE user_id = OLD.id;
            WHEN 'trainee' THEN
                DELETE FROM trainees WHERE user_id = OLD.id;
            WHEN 'service' THEN
                NULL;
            ELSE
                NULL;
        END CASE;
        RETURN OLD;
    END;
    $$;


--
-- Name: create_role_record(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION "public"."create_role_record"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
    BEGIN
        -- Create corresponding record based on user role
        CASE NEW.role
            WHEN 'admin' THEN
                INSERT INTO admins (user_id, admin_level, created_at, updated_at)
                VALUES (NEW.id, 'content', NOW(), NOW());

            WHEN 'instructor' THEN
                INSERT INTO instructors (user_id, specialization, created_at, updated_at)
                VALUES (NEW.id, 'General', NOW(), NOW());

            WHEN 'trainee' THEN
                INSERT INTO trainees (user_id, srn, current_level, created_at, updated_at)
                VALUES (NEW.id, 'TRN-' || NEW.id || '-' || EXTRACT(YEAR FROM NOW()), 'standard', NOW(), NOW());

            WHEN 'service' THEN
                -- Service accounts don't need role-specific records
                -- They are used for API key authentication only
                NULL;
        END CASE;

        RETURN NEW;
    END;
    $$;


--
-- Name: get_user_profile(integer); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION "public"."get_user_profile"("user_id" integer) RETURNS json
    LANGUAGE "plpgsql"
    AS $$
    DECLARE
        profile_data JSON;
    BEGIN
        SELECT row_to_json(up) INTO profile_data
        FROM user_profiles up
        WHERE up.id = user_id;
        
        RETURN profile_data;
    END;
    $$;


--
-- Name: get_user_statistics(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION "public"."get_user_statistics"() RETURNS json
    LANGUAGE "plpgsql"
    AS $$
    DECLARE
        stats JSON;
    BEGIN
        SELECT json_build_object(
            'total_users', COUNT(*),
            'active_users', COUNT(*) FILTER (WHERE is_active = true),
            'admins', COUNT(*) FILTER (WHERE role = 'admin' AND is_active = true),
            'instructors', COUNT(*) FILTER (WHERE role = 'instructor' AND is_active = true),
            'trainees', COUNT(*) FILTER (WHERE role = 'trainee' AND is_active = true)
        ) INTO stats
        FROM users;
        
        RETURN stats;
    END;
    $$;


--
-- Name: handle_role_change(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION "public"."handle_role_change"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
      BEGIN
          -- Only proceed if role has changed
          IF OLD.role != NEW.role THEN
              -- Remove old role record
              CASE OLD.role
                  WHEN 'admin' THEN
                      DELETE FROM admins WHERE user_id = OLD.id;
                  WHEN 'instructor' THEN
                      DELETE FROM instructors WHERE user_id = OLD.id;
                  WHEN 'trainee' THEN
                      DELETE FROM trainees WHERE user_id = OLD.id;
              END CASE;
              
              -- Create new role record
              CASE NEW.role
                  WHEN 'admin' THEN
                      INSERT INTO admins (user_id, admin_level, system_permissions, created_at, updated_at)
                      VALUES (NEW.id, 'content', '{"user_management": false, "content_management": true}', NOW(), NOW());
                  WHEN 'instructor' THEN
                      INSERT INTO instructors (user_id, specialization, teaching_permissions, created_at, updated_at)
                      VALUES (NEW.id, 'General', '{"course_creation": true, "student_management": true}', NOW(), NOW());
                  WHEN 'trainee' THEN
                      -- RE-ENABLED: Create trainee record with auto-generated SRN
                      INSERT INTO trainees (user_id, srn, current_level, enrollment_date, created_at, updated_at)
                      VALUES (
                        NEW.id, 
                        'SRN-' || NEW.id || '-' || EXTRACT(YEAR FROM NOW()), 
                        'beginner',
                        NOW(),
                        NOW(), 
                        NOW()
                      );
              END CASE;
          END IF;
          
          RETURN NEW;
      END;
      $$;


--
-- Name: refresh_user_materialized_views(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION "public"."refresh_user_materialized_views"() RETURNS "void"
    LANGUAGE "plpgsql"
    AS $$
    BEGIN
        REFRESH MATERIALIZED VIEW CONCURRENTLY user_profiles;
    END;
    $$;


--
-- Name: apply_rls("jsonb", integer); Type: FUNCTION; Schema: realtime; Owner: -
--

CREATE FUNCTION "realtime"."apply_rls"("wal" "jsonb", "max_record_bytes" integer DEFAULT (1024 * 1024)) RETURNS SETOF "realtime"."wal_rls"
    LANGUAGE "plpgsql"
    AS $$
declare
-- Regclass of the table e.g. public.notes
entity_ regclass = (quote_ident(wal ->> 'schema') || '.' || quote_ident(wal ->> 'table'))::regclass;

-- I, U, D, T: insert, update ...
action realtime.action = (
    case wal ->> 'action'
        when 'I' then 'INSERT'
        when 'U' then 'UPDATE'
        when 'D' then 'DELETE'
        else 'ERROR'
    end
);

-- Is row level security enabled for the table
is_rls_enabled bool = relrowsecurity from pg_class where oid = entity_;

subscriptions realtime.subscription[] = array_agg(subs)
    from
        realtime.subscription subs
    where
        subs.entity = entity_
        -- Filter by action early - only get subscriptions interested in this action
        -- action_filter column can be: '*' (all), 'INSERT', 'UPDATE', or 'DELETE'
        and (subs.action_filter = '*' or subs.action_filter = action::text);

-- Subscription vars
roles regrole[] = array_agg(distinct us.claims_role::text)
    from
        unnest(subscriptions) us;

working_role regrole;
claimed_role regrole;
claims jsonb;

subscription_id uuid;
subscription_has_access bool;
visible_to_subscription_ids uuid[] = '{}';

-- structured info for wal's columns
columns realtime.wal_column[];
-- previous identity values for update/delete
old_columns realtime.wal_column[];

error_record_exceeds_max_size boolean = octet_length(wal::text) > max_record_bytes;

-- Primary jsonb output for record
output jsonb;

begin
perform set_config('role', null, true);

columns =
    array_agg(
        (
            x->>'name',
            x->>'type',
            x->>'typeoid',
            realtime.cast(
                (x->'value') #>> '{}',
                coalesce(
                    (x->>'typeoid')::regtype, -- null when wal2json version <= 2.4
                    (x->>'type')::regtype
                )
            ),
            (pks ->> 'name') is not null,
            true
        )::realtime.wal_column
    )
    from
        jsonb_array_elements(wal -> 'columns') x
        left join jsonb_array_elements(wal -> 'pk') pks
            on (x ->> 'name') = (pks ->> 'name');

old_columns =
    array_agg(
        (
            x->>'name',
            x->>'type',
            x->>'typeoid',
            realtime.cast(
                (x->'value') #>> '{}',
                coalesce(
                    (x->>'typeoid')::regtype, -- null when wal2json version <= 2.4
                    (x->>'type')::regtype
                )
            ),
            (pks ->> 'name') is not null,
            true
        )::realtime.wal_column
    )
    from
        jsonb_array_elements(wal -> 'identity') x
        left join jsonb_array_elements(wal -> 'pk') pks
            on (x ->> 'name') = (pks ->> 'name');

for working_role in select * from unnest(roles) loop

    -- Update `is_selectable` for columns and old_columns
    columns =
        array_agg(
            (
                c.name,
                c.type_name,
                c.type_oid,
                c.value,
                c.is_pkey,
                pg_catalog.has_column_privilege(working_role, entity_, c.name, 'SELECT')
            )::realtime.wal_column
        )
        from
            unnest(columns) c;

    old_columns =
            array_agg(
                (
                    c.name,
                    c.type_name,
                    c.type_oid,
                    c.value,
                    c.is_pkey,
                    pg_catalog.has_column_privilege(working_role, entity_, c.name, 'SELECT')
                )::realtime.wal_column
            )
            from
                unnest(old_columns) c;

    if action <> 'DELETE' and count(1) = 0 from unnest(columns) c where c.is_pkey then
        return next (
            jsonb_build_object(
                'schema', wal ->> 'schema',
                'table', wal ->> 'table',
                'type', action
            ),
            is_rls_enabled,
            -- subscriptions is already filtered by entity
            (select array_agg(s.subscription_id) from unnest(subscriptions) as s where claims_role = working_role),
            array['Error 400: Bad Request, no primary key']
        )::realtime.wal_rls;

    -- The claims role does not have SELECT permission to the primary key of entity
    elsif action <> 'DELETE' and sum(c.is_selectable::int) <> count(1) from unnest(columns) c where c.is_pkey then
        return next (
            jsonb_build_object(
                'schema', wal ->> 'schema',
                'table', wal ->> 'table',
                'type', action
            ),
            is_rls_enabled,
            (select array_agg(s.subscription_id) from unnest(subscriptions) as s where claims_role = working_role),
            array['Error 401: Unauthorized']
        )::realtime.wal_rls;

    else
        output = jsonb_build_object(
            'schema', wal ->> 'schema',
            'table', wal ->> 'table',
            'type', action,
            'commit_timestamp', to_char(
                ((wal ->> 'timestamp')::timestamptz at time zone 'utc'),
                'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"'
            ),
            'columns', (
                select
                    jsonb_agg(
                        jsonb_build_object(
                            'name', pa.attname,
                            'type', pt.typname
                        )
                        order by pa.attnum asc
                    )
                from
                    pg_attribute pa
                    join pg_type pt
                        on pa.atttypid = pt.oid
                where
                    attrelid = entity_
                    and attnum > 0
                    and pg_catalog.has_column_privilege(working_role, entity_, pa.attname, 'SELECT')
            )
        )
        -- Add "record" key for insert and update
        || case
            when action in ('INSERT', 'UPDATE') then
                jsonb_build_object(
                    'record',
                    (
                        select
                            jsonb_object_agg(
                                -- if unchanged toast, get column name and value from old record
                                coalesce((c).name, (oc).name),
                                case
                                    when (c).name is null then (oc).value
                                    else (c).value
                                end
                            )
                        from
                            unnest(columns) c
                            full outer join unnest(old_columns) oc
                                on (c).name = (oc).name
                        where
                            coalesce((c).is_selectable, (oc).is_selectable)
                            and ( not error_record_exceeds_max_size or (octet_length((c).value::text) <= 64))
                    )
                )
            else '{}'::jsonb
        end
        -- Add "old_record" key for update and delete
        || case
            when action = 'UPDATE' then
                jsonb_build_object(
                        'old_record',
                        (
                            select jsonb_object_agg((c).name, (c).value)
                            from unnest(old_columns) c
                            where
                                (c).is_selectable
                                and ( not error_record_exceeds_max_size or (octet_length((c).value::text) <= 64))
                        )
                    )
            when action = 'DELETE' then
                jsonb_build_object(
                    'old_record',
                    (
                        select jsonb_object_agg((c).name, (c).value)
                        from unnest(old_columns) c
                        where
                            (c).is_selectable
                            and ( not error_record_exceeds_max_size or (octet_length((c).value::text) <= 64))
                            and ( not is_rls_enabled or (c).is_pkey ) -- if RLS enabled, we can't secure deletes so filter to pkey
                    )
                )
            else '{}'::jsonb
        end;

        -- Create the prepared statement
        if is_rls_enabled and action <> 'DELETE' then
            if (select 1 from pg_prepared_statements where name = 'walrus_rls_stmt' limit 1) > 0 then
                deallocate walrus_rls_stmt;
            end if;
            execute realtime.build_prepared_statement_sql('walrus_rls_stmt', entity_, columns);
        end if;

        visible_to_subscription_ids = '{}';

        for subscription_id, claims in (
                select
                    subs.subscription_id,
                    subs.claims
                from
                    unnest(subscriptions) subs
                where
                    subs.entity = entity_
                    and subs.claims_role = working_role
                    and (
                        realtime.is_visible_through_filters(columns, subs.filters)
                        or (
                          action = 'DELETE'
                          and realtime.is_visible_through_filters(old_columns, subs.filters)
                        )
                    )
        ) loop

            if not is_rls_enabled or action = 'DELETE' then
                visible_to_subscription_ids = visible_to_subscription_ids || subscription_id;
            else
                -- Check if RLS allows the role to see the record
                perform
                    -- Trim leading and trailing quotes from working_role because set_config
                    -- doesn't recognize the role as valid if they are included
                    set_config('role', trim(both '"' from working_role::text), true),
                    set_config('request.jwt.claims', claims::text, true);

                execute 'execute walrus_rls_stmt' into subscription_has_access;

                if subscription_has_access then
                    visible_to_subscription_ids = visible_to_subscription_ids || subscription_id;
                end if;
            end if;
        end loop;

        perform set_config('role', null, true);

        return next (
            output,
            is_rls_enabled,
            visible_to_subscription_ids,
            case
                when error_record_exceeds_max_size then array['Error 413: Payload Too Large']
                else '{}'
            end
        )::realtime.wal_rls;

    end if;
end loop;

perform set_config('role', null, true);
end;
$$;


--
-- Name: broadcast_changes("text", "text", "text", "text", "text", "record", "record", "text"); Type: FUNCTION; Schema: realtime; Owner: -
--

CREATE FUNCTION "realtime"."broadcast_changes"("topic_name" "text", "event_name" "text", "operation" "text", "table_name" "text", "table_schema" "text", "new" "record", "old" "record", "level" "text" DEFAULT 'ROW'::"text") RETURNS "void"
    LANGUAGE "plpgsql"
    AS $$
DECLARE
    -- Declare a variable to hold the JSONB representation of the row
    row_data jsonb := '{}'::jsonb;
BEGIN
    IF level = 'STATEMENT' THEN
        RAISE EXCEPTION 'function can only be triggered for each row, not for each statement';
    END IF;
    -- Check the operation type and handle accordingly
    IF operation = 'INSERT' OR operation = 'UPDATE' OR operation = 'DELETE' THEN
        row_data := jsonb_build_object('old_record', OLD, 'record', NEW, 'operation', operation, 'table', table_name, 'schema', table_schema);
        PERFORM realtime.send (row_data, event_name, topic_name);
    ELSE
        RAISE EXCEPTION 'Unexpected operation type: %', operation;
    END IF;
EXCEPTION
    WHEN OTHERS THEN
        RAISE EXCEPTION 'Failed to process the row: %', SQLERRM;
END;

$$;


--
-- Name: build_prepared_statement_sql("text", "regclass", "realtime"."wal_column"[]); Type: FUNCTION; Schema: realtime; Owner: -
--

CREATE FUNCTION "realtime"."build_prepared_statement_sql"("prepared_statement_name" "text", "entity" "regclass", "columns" "realtime"."wal_column"[]) RETURNS "text"
    LANGUAGE "sql"
    AS $$
      /*
      Builds a sql string that, if executed, creates a prepared statement to
      tests retrive a row from *entity* by its primary key columns.
      Example
          select realtime.build_prepared_statement_sql('public.notes', '{"id"}'::text[], '{"bigint"}'::text[])
      */
          select
      'prepare ' || prepared_statement_name || ' as
          select
              exists(
                  select
                      1
                  from
                      ' || entity || '
                  where
                      ' || string_agg(quote_ident(pkc.name) || '=' || quote_nullable(pkc.value #>> '{}') , ' and ') || '
              )'
          from
              unnest(columns) pkc
          where
              pkc.is_pkey
          group by
              entity
      $$;


--
-- Name: cast("text", "regtype"); Type: FUNCTION; Schema: realtime; Owner: -
--

CREATE FUNCTION "realtime"."cast"("val" "text", "type_" "regtype") RETURNS "jsonb"
    LANGUAGE "plpgsql" IMMUTABLE
    AS $$
declare
  res jsonb;
begin
  if type_::text = 'bytea' then
    return to_jsonb(val);
  end if;
  execute format('select to_jsonb(%L::'|| type_::text || ')', val) into res;
  return res;
end
$$;


--
-- Name: check_equality_op("realtime"."equality_op", "regtype", "text", "text"); Type: FUNCTION; Schema: realtime; Owner: -
--

CREATE FUNCTION "realtime"."check_equality_op"("op" "realtime"."equality_op", "type_" "regtype", "val_1" "text", "val_2" "text") RETURNS boolean
    LANGUAGE "plpgsql" IMMUTABLE
    AS $$
      /*
      Casts *val_1* and *val_2* as type *type_* and check the *op* condition for truthiness
      */
      declare
          op_symbol text = (
              case
                  when op = 'eq' then '='
                  when op = 'neq' then '!='
                  when op = 'lt' then '<'
                  when op = 'lte' then '<='
                  when op = 'gt' then '>'
                  when op = 'gte' then '>='
                  when op = 'in' then '= any'
                  else 'UNKNOWN OP'
              end
          );
          res boolean;
      begin
          execute format(
              'select %L::'|| type_::text || ' ' || op_symbol
              || ' ( %L::'
              || (
                  case
                      when op = 'in' then type_::text || '[]'
                      else type_::text end
              )
              || ')', val_1, val_2) into res;
          return res;
      end;
      $$;


--
-- Name: is_visible_through_filters("realtime"."wal_column"[], "realtime"."user_defined_filter"[]); Type: FUNCTION; Schema: realtime; Owner: -
--

CREATE FUNCTION "realtime"."is_visible_through_filters"("columns" "realtime"."wal_column"[], "filters" "realtime"."user_defined_filter"[]) RETURNS boolean
    LANGUAGE "sql" IMMUTABLE
    AS $_$
    /*
    Should the record be visible (true) or filtered out (false) after *filters* are applied
    */
        select
            -- Default to allowed when no filters present
            $2 is null -- no filters. this should not happen because subscriptions has a default
            or array_length($2, 1) is null -- array length of an empty array is null
            or bool_and(
                coalesce(
                    realtime.check_equality_op(
                        op:=f.op,
                        type_:=coalesce(
                            col.type_oid::regtype, -- null when wal2json version <= 2.4
                            col.type_name::regtype
                        ),
                        -- cast jsonb to text
                        val_1:=col.value #>> '{}',
                        val_2:=f.value
                    ),
                    false -- if null, filter does not match
                )
            )
        from
            unnest(filters) f
            join unnest(columns) col
                on f.column_name = col.name;
    $_$;


--
-- Name: list_changes("name", "name", integer, integer); Type: FUNCTION; Schema: realtime; Owner: -
--

CREATE FUNCTION "realtime"."list_changes"("publication" "name", "slot_name" "name", "max_changes" integer, "max_record_bytes" integer) RETURNS TABLE("wal" "jsonb", "is_rls_enabled" boolean, "subscription_ids" "uuid"[], "errors" "text"[], "slot_changes_count" bigint)
    LANGUAGE "sql"
    SET "log_min_messages" TO 'fatal'
    AS $$
  WITH pub AS (
    SELECT
      concat_ws(
        ',',
        CASE WHEN bool_or(pubinsert) THEN 'insert' ELSE NULL END,
        CASE WHEN bool_or(pubupdate) THEN 'update' ELSE NULL END,
        CASE WHEN bool_or(pubdelete) THEN 'delete' ELSE NULL END
      ) AS w2j_actions,
      coalesce(
        string_agg(
          realtime.quote_wal2json(format('%I.%I', schemaname, tablename)::regclass),
          ','
        ) filter (WHERE ppt.tablename IS NOT NULL AND ppt.tablename NOT LIKE '% %'),
        ''
      ) AS w2j_add_tables
    FROM pg_publication pp
    LEFT JOIN pg_publication_tables ppt ON pp.pubname = ppt.pubname
    WHERE pp.pubname = publication
    GROUP BY pp.pubname
    LIMIT 1
  ),
  -- MATERIALIZED ensures pg_logical_slot_get_changes is called exactly once
  w2j AS MATERIALIZED (
    SELECT x.*, pub.w2j_add_tables
    FROM pub,
         pg_logical_slot_get_changes(
           slot_name, null, max_changes,
           'include-pk', 'true',
           'include-transaction', 'false',
           'include-timestamp', 'true',
           'include-type-oids', 'true',
           'format-version', '2',
           'actions', pub.w2j_actions,
           'add-tables', pub.w2j_add_tables
         ) x
  ),
  -- Count raw slot entries before apply_rls/subscription filter
  slot_count AS (
    SELECT count(*)::bigint AS cnt
    FROM w2j
    WHERE w2j.w2j_add_tables <> ''
  ),
  -- Apply RLS and filter as before
  rls_filtered AS (
    SELECT xyz.wal, xyz.is_rls_enabled, xyz.subscription_ids, xyz.errors
    FROM w2j,
         realtime.apply_rls(
           wal := w2j.data::jsonb,
           max_record_bytes := max_record_bytes
         ) xyz(wal, is_rls_enabled, subscription_ids, errors)
    WHERE w2j.w2j_add_tables <> ''
      AND xyz.subscription_ids[1] IS NOT NULL
  )
  -- Real rows with slot count attached
  SELECT rf.wal, rf.is_rls_enabled, rf.subscription_ids, rf.errors, sc.cnt
  FROM rls_filtered rf, slot_count sc

  UNION ALL

  -- Sentinel row: always returned when no real rows exist so Elixir can
  -- always read slot_changes_count. Identified by wal IS NULL.
  SELECT null, null, null, null, sc.cnt
  FROM slot_count sc
  WHERE NOT EXISTS (SELECT 1 FROM rls_filtered)
$$;


--
-- Name: quote_wal2json("regclass"); Type: FUNCTION; Schema: realtime; Owner: -
--

CREATE FUNCTION "realtime"."quote_wal2json"("entity" "regclass") RETURNS "text"
    LANGUAGE "sql" IMMUTABLE STRICT
    AS $$
      select
        (
          select string_agg('' || ch,'')
          from unnest(string_to_array(nsp.nspname::text, null)) with ordinality x(ch, idx)
          where
            not (x.idx = 1 and x.ch = '"')
            and not (
              x.idx = array_length(string_to_array(nsp.nspname::text, null), 1)
              and x.ch = '"'
            )
        )
        || '.'
        || (
          select string_agg('' || ch,'')
          from unnest(string_to_array(pc.relname::text, null)) with ordinality x(ch, idx)
          where
            not (x.idx = 1 and x.ch = '"')
            and not (
              x.idx = array_length(string_to_array(nsp.nspname::text, null), 1)
              and x.ch = '"'
            )
          )
      from
        pg_class pc
        join pg_namespace nsp
          on pc.relnamespace = nsp.oid
      where
        pc.oid = entity
    $$;


--
-- Name: send("jsonb", "text", "text", boolean); Type: FUNCTION; Schema: realtime; Owner: -
--

CREATE FUNCTION "realtime"."send"("payload" "jsonb", "event" "text", "topic" "text", "private" boolean DEFAULT true) RETURNS "void"
    LANGUAGE "plpgsql"
    AS $$
DECLARE
  generated_id uuid;
  final_payload jsonb;
BEGIN
  BEGIN
    -- Generate a new UUID for the id
    generated_id := gen_random_uuid();

    -- Check if payload has an 'id' key, if not, add the generated UUID
    IF payload ? 'id' THEN
      final_payload := payload;
    ELSE
      final_payload := jsonb_set(payload, '{id}', to_jsonb(generated_id));
    END IF;

    -- Set the topic configuration
    EXECUTE format('SET LOCAL realtime.topic TO %L', topic);

    -- Attempt to insert the message
    INSERT INTO realtime.messages (id, payload, event, topic, private, extension)
    VALUES (generated_id, final_payload, event, topic, private, 'broadcast');
  EXCEPTION
    WHEN OTHERS THEN
      -- Capture and notify the error
      RAISE WARNING 'ErrorSendingBroadcastMessage: %', SQLERRM;
  END;
END;
$$;


--
-- Name: subscription_check_filters(); Type: FUNCTION; Schema: realtime; Owner: -
--

CREATE FUNCTION "realtime"."subscription_check_filters"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
    /*
    Validates that the user defined filters for a subscription:
    - refer to valid columns that the claimed role may access
    - values are coercable to the correct column type
    */
    declare
        col_names text[] = coalesce(
                array_agg(c.column_name order by c.ordinal_position),
                '{}'::text[]
            )
            from
                information_schema.columns c
            where
                format('%I.%I', c.table_schema, c.table_name)::regclass = new.entity
                and pg_catalog.has_column_privilege(
                    (new.claims ->> 'role'),
                    format('%I.%I', c.table_schema, c.table_name)::regclass,
                    c.column_name,
                    'SELECT'
                );
        filter realtime.user_defined_filter;
        col_type regtype;

        in_val jsonb;
    begin
        for filter in select * from unnest(new.filters) loop
            -- Filtered column is valid
            if not filter.column_name = any(col_names) then
                raise exception 'invalid column for filter %', filter.column_name;
            end if;

            -- Type is sanitized and safe for string interpolation
            col_type = (
                select atttypid::regtype
                from pg_catalog.pg_attribute
                where attrelid = new.entity
                      and attname = filter.column_name
            );
            if col_type is null then
                raise exception 'failed to lookup type for column %', filter.column_name;
            end if;

            -- Set maximum number of entries for in filter
            if filter.op = 'in'::realtime.equality_op then
                in_val = realtime.cast(filter.value, (col_type::text || '[]')::regtype);
                if coalesce(jsonb_array_length(in_val), 0) > 100 then
                    raise exception 'too many values for `in` filter. Maximum 100';
                end if;
            else
                -- raises an exception if value is not coercable to type
                perform realtime.cast(filter.value, col_type);
            end if;

        end loop;

        -- Apply consistent order to filters so the unique constraint on
        -- (subscription_id, entity, filters) can't be tricked by a different filter order
        new.filters = coalesce(
            array_agg(f order by f.column_name, f.op, f.value),
            '{}'
        ) from unnest(new.filters) f;

        return new;
    end;
    $$;


--
-- Name: to_regrole("text"); Type: FUNCTION; Schema: realtime; Owner: -
--

CREATE FUNCTION "realtime"."to_regrole"("role_name" "text") RETURNS "regrole"
    LANGUAGE "sql" IMMUTABLE
    AS $$ select role_name::regrole $$;


--
-- Name: topic(); Type: FUNCTION; Schema: realtime; Owner: -
--

CREATE FUNCTION "realtime"."topic"() RETURNS "text"
    LANGUAGE "sql" STABLE
    AS $$
select nullif(current_setting('realtime.topic', true), '')::text;
$$;


--
-- Name: allow_any_operation("text"[]); Type: FUNCTION; Schema: storage; Owner: -
--

CREATE FUNCTION "storage"."allow_any_operation"("expected_operations" "text"[]) RETURNS boolean
    LANGUAGE "sql" STABLE
    AS $$
  WITH current_operation AS (
    SELECT storage.operation() AS raw_operation
  ),
  normalized AS (
    SELECT CASE
      WHEN raw_operation LIKE 'storage.%' THEN substr(raw_operation, 9)
      ELSE raw_operation
    END AS current_operation
    FROM current_operation
  )
  SELECT EXISTS (
    SELECT 1
    FROM normalized n
    CROSS JOIN LATERAL unnest(expected_operations) AS expected_operation
    WHERE expected_operation IS NOT NULL
      AND expected_operation <> ''
      AND n.current_operation = CASE
        WHEN expected_operation LIKE 'storage.%' THEN substr(expected_operation, 9)
        ELSE expected_operation
      END
  );
$$;


--
-- Name: allow_only_operation("text"); Type: FUNCTION; Schema: storage; Owner: -
--

CREATE FUNCTION "storage"."allow_only_operation"("expected_operation" "text") RETURNS boolean
    LANGUAGE "sql" STABLE
    AS $$
  WITH current_operation AS (
    SELECT storage.operation() AS raw_operation
  ),
  normalized AS (
    SELECT
      CASE
        WHEN raw_operation LIKE 'storage.%' THEN substr(raw_operation, 9)
        ELSE raw_operation
      END AS current_operation,
      CASE
        WHEN expected_operation LIKE 'storage.%' THEN substr(expected_operation, 9)
        ELSE expected_operation
      END AS requested_operation
    FROM current_operation
  )
  SELECT CASE
    WHEN requested_operation IS NULL OR requested_operation = '' THEN FALSE
    ELSE COALESCE(current_operation = requested_operation, FALSE)
  END
  FROM normalized;
$$;


--
-- Name: can_insert_object("text", "text", "uuid", "jsonb"); Type: FUNCTION; Schema: storage; Owner: -
--

CREATE FUNCTION "storage"."can_insert_object"("bucketid" "text", "name" "text", "owner" "uuid", "metadata" "jsonb") RETURNS "void"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
  INSERT INTO "storage"."objects" ("bucket_id", "name", "owner", "metadata") VALUES (bucketid, name, owner, metadata);
  -- hack to rollback the successful insert
  RAISE sqlstate 'PT200' using
  message = 'ROLLBACK',
  detail = 'rollback successful insert';
END
$$;


--
-- Name: enforce_bucket_name_length(); Type: FUNCTION; Schema: storage; Owner: -
--

CREATE FUNCTION "storage"."enforce_bucket_name_length"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
begin
    if length(new.name) > 100 then
        raise exception 'bucket name "%" is too long (% characters). Max is 100.', new.name, length(new.name);
    end if;
    return new;
end;
$$;


--
-- Name: extension("text"); Type: FUNCTION; Schema: storage; Owner: -
--

CREATE FUNCTION "storage"."extension"("name" "text") RETURNS "text"
    LANGUAGE "plpgsql" IMMUTABLE
    AS $$
DECLARE
    _parts text[];
    _filename text;
BEGIN
    -- Split on "/" to get path segments
    SELECT string_to_array(name, '/') INTO _parts;
    -- Get the last path segment (the actual filename)
    SELECT _parts[array_length(_parts, 1)] INTO _filename;
    -- Extract extension: reverse, split on '.', then reverse again
    RETURN reverse(split_part(reverse(_filename), '.', 1));
END
$$;


--
-- Name: filename("text"); Type: FUNCTION; Schema: storage; Owner: -
--

CREATE FUNCTION "storage"."filename"("name" "text") RETURNS "text"
    LANGUAGE "plpgsql"
    AS $$
DECLARE
_parts text[];
BEGIN
	select string_to_array(name, '/') into _parts;
	return _parts[array_length(_parts,1)];
END
$$;


--
-- Name: foldername("text"); Type: FUNCTION; Schema: storage; Owner: -
--

CREATE FUNCTION "storage"."foldername"("name" "text") RETURNS "text"[]
    LANGUAGE "plpgsql" IMMUTABLE
    AS $$
DECLARE
    _parts text[];
BEGIN
    -- Split on "/" to get path segments
    SELECT string_to_array(name, '/') INTO _parts;
    -- Return everything except the last segment
    RETURN _parts[1 : array_length(_parts,1) - 1];
END
$$;


--
-- Name: get_common_prefix("text", "text", "text"); Type: FUNCTION; Schema: storage; Owner: -
--

CREATE FUNCTION "storage"."get_common_prefix"("p_key" "text", "p_prefix" "text", "p_delimiter" "text") RETURNS "text"
    LANGUAGE "sql" IMMUTABLE
    AS $$
SELECT CASE
    WHEN position(p_delimiter IN substring(p_key FROM length(p_prefix) + 1)) > 0
    THEN left(p_key, length(p_prefix) + position(p_delimiter IN substring(p_key FROM length(p_prefix) + 1)))
    ELSE NULL
END;
$$;


--
-- Name: get_size_by_bucket(); Type: FUNCTION; Schema: storage; Owner: -
--

CREATE FUNCTION "storage"."get_size_by_bucket"() RETURNS TABLE("size" bigint, "bucket_id" "text")
    LANGUAGE "plpgsql" STABLE
    AS $$
BEGIN
    return query
        select sum((metadata->>'size')::bigint)::bigint as size, obj.bucket_id
        from "storage".objects as obj
        group by obj.bucket_id;
END
$$;


--
-- Name: list_multipart_uploads_with_delimiter("text", "text", "text", integer, "text", "text"); Type: FUNCTION; Schema: storage; Owner: -
--

CREATE FUNCTION "storage"."list_multipart_uploads_with_delimiter"("bucket_id" "text", "prefix_param" "text", "delimiter_param" "text", "max_keys" integer DEFAULT 100, "next_key_token" "text" DEFAULT ''::"text", "next_upload_token" "text" DEFAULT ''::"text") RETURNS TABLE("key" "text", "id" "text", "created_at" timestamp with time zone)
    LANGUAGE "plpgsql"
    AS $_$
BEGIN
    RETURN QUERY EXECUTE
        'SELECT DISTINCT ON(key COLLATE "C") * from (
            SELECT
                CASE
                    WHEN position($2 IN substring(key from length($1) + 1)) > 0 THEN
                        substring(key from 1 for length($1) + position($2 IN substring(key from length($1) + 1)))
                    ELSE
                        key
                END AS key, id, created_at
            FROM
                storage.s3_multipart_uploads
            WHERE
                bucket_id = $5 AND
                key ILIKE $1 || ''%'' AND
                CASE
                    WHEN $4 != '''' AND $6 = '''' THEN
                        CASE
                            WHEN position($2 IN substring(key from length($1) + 1)) > 0 THEN
                                substring(key from 1 for length($1) + position($2 IN substring(key from length($1) + 1))) COLLATE "C" > $4
                            ELSE
                                key COLLATE "C" > $4
                            END
                    ELSE
                        true
                END AND
                CASE
                    WHEN $6 != '''' THEN
                        id COLLATE "C" > $6
                    ELSE
                        true
                    END
            ORDER BY
                key COLLATE "C" ASC, created_at ASC) as e order by key COLLATE "C" LIMIT $3'
        USING prefix_param, delimiter_param, max_keys, next_key_token, bucket_id, next_upload_token;
END;
$_$;


--
-- Name: list_objects_with_delimiter("text", "text", "text", integer, "text", "text", "text"); Type: FUNCTION; Schema: storage; Owner: -
--

CREATE FUNCTION "storage"."list_objects_with_delimiter"("_bucket_id" "text", "prefix_param" "text", "delimiter_param" "text", "max_keys" integer DEFAULT 100, "start_after" "text" DEFAULT ''::"text", "next_token" "text" DEFAULT ''::"text", "sort_order" "text" DEFAULT 'asc'::"text") RETURNS TABLE("name" "text", "id" "uuid", "metadata" "jsonb", "updated_at" timestamp with time zone, "created_at" timestamp with time zone, "last_accessed_at" timestamp with time zone)
    LANGUAGE "plpgsql" STABLE
    AS $_$
DECLARE
    v_peek_name TEXT;
    v_current RECORD;
    v_common_prefix TEXT;

    -- Configuration
    v_is_asc BOOLEAN;
    v_prefix TEXT;
    v_start TEXT;
    v_upper_bound TEXT;
    v_file_batch_size INT;

    -- Seek state
    v_next_seek TEXT;
    v_count INT := 0;

    -- Dynamic SQL for batch query only
    v_batch_query TEXT;

BEGIN
    -- ========================================================================
    -- INITIALIZATION
    -- ========================================================================
    v_is_asc := lower(coalesce(sort_order, 'asc')) = 'asc';
    v_prefix := coalesce(prefix_param, '');
    v_start := CASE WHEN coalesce(next_token, '') <> '' THEN next_token ELSE coalesce(start_after, '') END;
    v_file_batch_size := LEAST(GREATEST(max_keys * 2, 100), 1000);

    -- Calculate upper bound for prefix filtering (bytewise, using COLLATE "C")
    IF v_prefix = '' THEN
        v_upper_bound := NULL;
    ELSIF right(v_prefix, 1) = delimiter_param THEN
        v_upper_bound := left(v_prefix, -1) || chr(ascii(delimiter_param) + 1);
    ELSE
        v_upper_bound := left(v_prefix, -1) || chr(ascii(right(v_prefix, 1)) + 1);
    END IF;

    -- Build batch query (dynamic SQL - called infrequently, amortized over many rows)
    IF v_is_asc THEN
        IF v_upper_bound IS NOT NULL THEN
            v_batch_query := 'SELECT o.name, o.id, o.updated_at, o.created_at, o.last_accessed_at, o.metadata ' ||
                'FROM storage.objects o WHERE o.bucket_id = $1 AND o.name COLLATE "C" >= $2 ' ||
                'AND o.name COLLATE "C" < $3 ORDER BY o.name COLLATE "C" ASC LIMIT $4';
        ELSE
            v_batch_query := 'SELECT o.name, o.id, o.updated_at, o.created_at, o.last_accessed_at, o.metadata ' ||
                'FROM storage.objects o WHERE o.bucket_id = $1 AND o.name COLLATE "C" >= $2 ' ||
                'ORDER BY o.name COLLATE "C" ASC LIMIT $4';
        END IF;
    ELSE
        IF v_upper_bound IS NOT NULL THEN
            v_batch_query := 'SELECT o.name, o.id, o.updated_at, o.created_at, o.last_accessed_at, o.metadata ' ||
                'FROM storage.objects o WHERE o.bucket_id = $1 AND o.name COLLATE "C" < $2 ' ||
                'AND o.name COLLATE "C" >= $3 ORDER BY o.name COLLATE "C" DESC LIMIT $4';
        ELSE
            v_batch_query := 'SELECT o.name, o.id, o.updated_at, o.created_at, o.last_accessed_at, o.metadata ' ||
                'FROM storage.objects o WHERE o.bucket_id = $1 AND o.name COLLATE "C" < $2 ' ||
                'ORDER BY o.name COLLATE "C" DESC LIMIT $4';
        END IF;
    END IF;

    -- ========================================================================
    -- SEEK INITIALIZATION: Determine starting position
    -- ========================================================================
    IF v_start = '' THEN
        IF v_is_asc THEN
            v_next_seek := v_prefix;
        ELSE
            -- DESC without cursor: find the last item in range
            IF v_upper_bound IS NOT NULL THEN
                SELECT o.name INTO v_next_seek FROM storage.objects o
                WHERE o.bucket_id = _bucket_id AND o.name COLLATE "C" >= v_prefix AND o.name COLLATE "C" < v_upper_bound
                ORDER BY o.name COLLATE "C" DESC LIMIT 1;
            ELSIF v_prefix <> '' THEN
                SELECT o.name INTO v_next_seek FROM storage.objects o
                WHERE o.bucket_id = _bucket_id AND o.name COLLATE "C" >= v_prefix
                ORDER BY o.name COLLATE "C" DESC LIMIT 1;
            ELSE
                SELECT o.name INTO v_next_seek FROM storage.objects o
                WHERE o.bucket_id = _bucket_id
                ORDER BY o.name COLLATE "C" DESC LIMIT 1;
            END IF;

            IF v_next_seek IS NOT NULL THEN
                v_next_seek := v_next_seek || delimiter_param;
            ELSE
                RETURN;
            END IF;
        END IF;
    ELSE
        -- Cursor provided: determine if it refers to a folder or leaf
        IF EXISTS (
            SELECT 1 FROM storage.objects o
            WHERE o.bucket_id = _bucket_id
              AND o.name COLLATE "C" LIKE v_start || delimiter_param || '%'
            LIMIT 1
        ) THEN
            -- Cursor refers to a folder
            IF v_is_asc THEN
                v_next_seek := v_start || chr(ascii(delimiter_param) + 1);
            ELSE
                v_next_seek := v_start || delimiter_param;
            END IF;
        ELSE
            -- Cursor refers to a leaf object
            IF v_is_asc THEN
                v_next_seek := v_start || delimiter_param;
            ELSE
                v_next_seek := v_start;
            END IF;
        END IF;
    END IF;

    -- ========================================================================
    -- MAIN LOOP: Hybrid peek-then-batch algorithm
    -- Uses STATIC SQL for peek (hot path) and DYNAMIC SQL for batch
    -- ========================================================================
    LOOP
        EXIT WHEN v_count >= max_keys;

        -- STEP 1: PEEK using STATIC SQL (plan cached, very fast)
        IF v_is_asc THEN
            IF v_upper_bound IS NOT NULL THEN
                SELECT o.name INTO v_peek_name FROM storage.objects o
                WHERE o.bucket_id = _bucket_id AND o.name COLLATE "C" >= v_next_seek AND o.name COLLATE "C" < v_upper_bound
                ORDER BY o.name COLLATE "C" ASC LIMIT 1;
            ELSE
                SELECT o.name INTO v_peek_name FROM storage.objects o
                WHERE o.bucket_id = _bucket_id AND o.name COLLATE "C" >= v_next_seek
                ORDER BY o.name COLLATE "C" ASC LIMIT 1;
            END IF;
        ELSE
            IF v_upper_bound IS NOT NULL THEN
                SELECT o.name INTO v_peek_name FROM storage.objects o
                WHERE o.bucket_id = _bucket_id AND o.name COLLATE "C" < v_next_seek AND o.name COLLATE "C" >= v_prefix
                ORDER BY o.name COLLATE "C" DESC LIMIT 1;
            ELSIF v_prefix <> '' THEN
                SELECT o.name INTO v_peek_name FROM storage.objects o
                WHERE o.bucket_id = _bucket_id AND o.name COLLATE "C" < v_next_seek AND o.name COLLATE "C" >= v_prefix
                ORDER BY o.name COLLATE "C" DESC LIMIT 1;
            ELSE
                SELECT o.name INTO v_peek_name FROM storage.objects o
                WHERE o.bucket_id = _bucket_id AND o.name COLLATE "C" < v_next_seek
                ORDER BY o.name COLLATE "C" DESC LIMIT 1;
            END IF;
        END IF;

        EXIT WHEN v_peek_name IS NULL;

        -- STEP 2: Check if this is a FOLDER or FILE
        v_common_prefix := storage.get_common_prefix(v_peek_name, v_prefix, delimiter_param);

        IF v_common_prefix IS NOT NULL THEN
            -- FOLDER: Emit and skip to next folder (no heap access needed)
            name := rtrim(v_common_prefix, delimiter_param);
            id := NULL;
            updated_at := NULL;
            created_at := NULL;
            last_accessed_at := NULL;
            metadata := NULL;
            RETURN NEXT;
            v_count := v_count + 1;

            -- Advance seek past the folder range
            IF v_is_asc THEN
                v_next_seek := left(v_common_prefix, -1) || chr(ascii(delimiter_param) + 1);
            ELSE
                v_next_seek := v_common_prefix;
            END IF;
        ELSE
            -- FILE: Batch fetch using DYNAMIC SQL (overhead amortized over many rows)
            -- For ASC: upper_bound is the exclusive upper limit (< condition)
            -- For DESC: prefix is the inclusive lower limit (>= condition)
            FOR v_current IN EXECUTE v_batch_query USING _bucket_id, v_next_seek,
                CASE WHEN v_is_asc THEN COALESCE(v_upper_bound, v_prefix) ELSE v_prefix END, v_file_batch_size
            LOOP
                v_common_prefix := storage.get_common_prefix(v_current.name, v_prefix, delimiter_param);

                IF v_common_prefix IS NOT NULL THEN
                    -- Hit a folder: exit batch, let peek handle it
                    v_next_seek := v_current.name;
                    EXIT;
                END IF;

                -- Emit file
                name := v_current.name;
                id := v_current.id;
                updated_at := v_current.updated_at;
                created_at := v_current.created_at;
                last_accessed_at := v_current.last_accessed_at;
                metadata := v_current.metadata;
                RETURN NEXT;
                v_count := v_count + 1;

                -- Advance seek past this file
                IF v_is_asc THEN
                    v_next_seek := v_current.name || delimiter_param;
                ELSE
                    v_next_seek := v_current.name;
                END IF;

                EXIT WHEN v_count >= max_keys;
            END LOOP;
        END IF;
    END LOOP;
END;
$_$;


--
-- Name: operation(); Type: FUNCTION; Schema: storage; Owner: -
--

CREATE FUNCTION "storage"."operation"() RETURNS "text"
    LANGUAGE "plpgsql" STABLE
    AS $$
BEGIN
    RETURN current_setting('storage.operation', true);
END;
$$;


--
-- Name: protect_delete(); Type: FUNCTION; Schema: storage; Owner: -
--

CREATE FUNCTION "storage"."protect_delete"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
    -- Check if storage.allow_delete_query is set to 'true'
    IF COALESCE(current_setting('storage.allow_delete_query', true), 'false') != 'true' THEN
        RAISE EXCEPTION 'Direct deletion from storage tables is not allowed. Use the Storage API instead.'
            USING HINT = 'This prevents accidental data loss from orphaned objects.',
                  ERRCODE = '42501';
    END IF;
    RETURN NULL;
END;
$$;


--
-- Name: search("text", "text", integer, integer, integer, "text", "text", "text"); Type: FUNCTION; Schema: storage; Owner: -
--

CREATE FUNCTION "storage"."search"("prefix" "text", "bucketname" "text", "limits" integer DEFAULT 100, "levels" integer DEFAULT 1, "offsets" integer DEFAULT 0, "search" "text" DEFAULT ''::"text", "sortcolumn" "text" DEFAULT 'name'::"text", "sortorder" "text" DEFAULT 'asc'::"text") RETURNS TABLE("name" "text", "id" "uuid", "updated_at" timestamp with time zone, "created_at" timestamp with time zone, "last_accessed_at" timestamp with time zone, "metadata" "jsonb")
    LANGUAGE "plpgsql" STABLE
    AS $_$
DECLARE
    v_peek_name TEXT;
    v_current RECORD;
    v_common_prefix TEXT;
    v_delimiter CONSTANT TEXT := '/';

    -- Configuration
    v_limit INT;
    v_prefix TEXT;
    v_prefix_lower TEXT;
    v_is_asc BOOLEAN;
    v_order_by TEXT;
    v_sort_order TEXT;
    v_upper_bound TEXT;
    v_file_batch_size INT;

    -- Dynamic SQL for batch query only
    v_batch_query TEXT;

    -- Seek state
    v_next_seek TEXT;
    v_count INT := 0;
    v_skipped INT := 0;
BEGIN
    -- ========================================================================
    -- INITIALIZATION
    -- ========================================================================
    v_limit := LEAST(coalesce(limits, 100), 1500);
    v_prefix := coalesce(prefix, '') || coalesce(search, '');
    v_prefix_lower := lower(v_prefix);
    v_is_asc := lower(coalesce(sortorder, 'asc')) = 'asc';
    v_file_batch_size := LEAST(GREATEST(v_limit * 2, 100), 1000);

    -- Validate sort column
    CASE lower(coalesce(sortcolumn, 'name'))
        WHEN 'name' THEN v_order_by := 'name';
        WHEN 'updated_at' THEN v_order_by := 'updated_at';
        WHEN 'created_at' THEN v_order_by := 'created_at';
        WHEN 'last_accessed_at' THEN v_order_by := 'last_accessed_at';
        ELSE v_order_by := 'name';
    END CASE;

    v_sort_order := CASE WHEN v_is_asc THEN 'asc' ELSE 'desc' END;

    -- ========================================================================
    -- NON-NAME SORTING: Use path_tokens approach (unchanged)
    -- ========================================================================
    IF v_order_by != 'name' THEN
        RETURN QUERY EXECUTE format(
            $sql$
            WITH folders AS (
                SELECT path_tokens[$1] AS folder
                FROM storage.objects
                WHERE objects.name ILIKE $2 || '%%'
                  AND bucket_id = $3
                  AND array_length(objects.path_tokens, 1) <> $1
                GROUP BY folder
                ORDER BY folder %s
            )
            (SELECT folder AS "name",
                   NULL::uuid AS id,
                   NULL::timestamptz AS updated_at,
                   NULL::timestamptz AS created_at,
                   NULL::timestamptz AS last_accessed_at,
                   NULL::jsonb AS metadata FROM folders)
            UNION ALL
            (SELECT path_tokens[$1] AS "name",
                   id, updated_at, created_at, last_accessed_at, metadata
             FROM storage.objects
             WHERE objects.name ILIKE $2 || '%%'
               AND bucket_id = $3
               AND array_length(objects.path_tokens, 1) = $1
             ORDER BY %I %s)
            LIMIT $4 OFFSET $5
            $sql$, v_sort_order, v_order_by, v_sort_order
        ) USING levels, v_prefix, bucketname, v_limit, offsets;
        RETURN;
    END IF;

    -- ========================================================================
    -- NAME SORTING: Hybrid skip-scan with batch optimization
    -- ========================================================================

    -- Calculate upper bound for prefix filtering
    IF v_prefix_lower = '' THEN
        v_upper_bound := NULL;
    ELSIF right(v_prefix_lower, 1) = v_delimiter THEN
        v_upper_bound := left(v_prefix_lower, -1) || chr(ascii(v_delimiter) + 1);
    ELSE
        v_upper_bound := left(v_prefix_lower, -1) || chr(ascii(right(v_prefix_lower, 1)) + 1);
    END IF;

    -- Build batch query (dynamic SQL - called infrequently, amortized over many rows)
    IF v_is_asc THEN
        IF v_upper_bound IS NOT NULL THEN
            v_batch_query := 'SELECT o.name, o.id, o.updated_at, o.created_at, o.last_accessed_at, o.metadata ' ||
                'FROM storage.objects o WHERE o.bucket_id = $1 AND lower(o.name) COLLATE "C" >= $2 ' ||
                'AND lower(o.name) COLLATE "C" < $3 ORDER BY lower(o.name) COLLATE "C" ASC LIMIT $4';
        ELSE
            v_batch_query := 'SELECT o.name, o.id, o.updated_at, o.created_at, o.last_accessed_at, o.metadata ' ||
                'FROM storage.objects o WHERE o.bucket_id = $1 AND lower(o.name) COLLATE "C" >= $2 ' ||
                'ORDER BY lower(o.name) COLLATE "C" ASC LIMIT $4';
        END IF;
    ELSE
        IF v_upper_bound IS NOT NULL THEN
            v_batch_query := 'SELECT o.name, o.id, o.updated_at, o.created_at, o.last_accessed_at, o.metadata ' ||
                'FROM storage.objects o WHERE o.bucket_id = $1 AND lower(o.name) COLLATE "C" < $2 ' ||
                'AND lower(o.name) COLLATE "C" >= $3 ORDER BY lower(o.name) COLLATE "C" DESC LIMIT $4';
        ELSE
            v_batch_query := 'SELECT o.name, o.id, o.updated_at, o.created_at, o.last_accessed_at, o.metadata ' ||
                'FROM storage.objects o WHERE o.bucket_id = $1 AND lower(o.name) COLLATE "C" < $2 ' ||
                'ORDER BY lower(o.name) COLLATE "C" DESC LIMIT $4';
        END IF;
    END IF;

    -- Initialize seek position
    IF v_is_asc THEN
        v_next_seek := v_prefix_lower;
    ELSE
        -- DESC: find the last item in range first (static SQL)
        IF v_upper_bound IS NOT NULL THEN
            SELECT o.name INTO v_peek_name FROM storage.objects o
            WHERE o.bucket_id = bucketname AND lower(o.name) COLLATE "C" >= v_prefix_lower AND lower(o.name) COLLATE "C" < v_upper_bound
            ORDER BY lower(o.name) COLLATE "C" DESC LIMIT 1;
        ELSIF v_prefix_lower <> '' THEN
            SELECT o.name INTO v_peek_name FROM storage.objects o
            WHERE o.bucket_id = bucketname AND lower(o.name) COLLATE "C" >= v_prefix_lower
            ORDER BY lower(o.name) COLLATE "C" DESC LIMIT 1;
        ELSE
            SELECT o.name INTO v_peek_name FROM storage.objects o
            WHERE o.bucket_id = bucketname
            ORDER BY lower(o.name) COLLATE "C" DESC LIMIT 1;
        END IF;

        IF v_peek_name IS NOT NULL THEN
            v_next_seek := lower(v_peek_name) || v_delimiter;
        ELSE
            RETURN;
        END IF;
    END IF;

    -- ========================================================================
    -- MAIN LOOP: Hybrid peek-then-batch algorithm
    -- Uses STATIC SQL for peek (hot path) and DYNAMIC SQL for batch
    -- ========================================================================
    LOOP
        EXIT WHEN v_count >= v_limit;

        -- STEP 1: PEEK using STATIC SQL (plan cached, very fast)
        IF v_is_asc THEN
            IF v_upper_bound IS NOT NULL THEN
                SELECT o.name INTO v_peek_name FROM storage.objects o
                WHERE o.bucket_id = bucketname AND lower(o.name) COLLATE "C" >= v_next_seek AND lower(o.name) COLLATE "C" < v_upper_bound
                ORDER BY lower(o.name) COLLATE "C" ASC LIMIT 1;
            ELSE
                SELECT o.name INTO v_peek_name FROM storage.objects o
                WHERE o.bucket_id = bucketname AND lower(o.name) COLLATE "C" >= v_next_seek
                ORDER BY lower(o.name) COLLATE "C" ASC LIMIT 1;
            END IF;
        ELSE
            IF v_upper_bound IS NOT NULL THEN
                SELECT o.name INTO v_peek_name FROM storage.objects o
                WHERE o.bucket_id = bucketname AND lower(o.name) COLLATE "C" < v_next_seek AND lower(o.name) COLLATE "C" >= v_prefix_lower
                ORDER BY lower(o.name) COLLATE "C" DESC LIMIT 1;
            ELSIF v_prefix_lower <> '' THEN
                SELECT o.name INTO v_peek_name FROM storage.objects o
                WHERE o.bucket_id = bucketname AND lower(o.name) COLLATE "C" < v_next_seek AND lower(o.name) COLLATE "C" >= v_prefix_lower
                ORDER BY lower(o.name) COLLATE "C" DESC LIMIT 1;
            ELSE
                SELECT o.name INTO v_peek_name FROM storage.objects o
                WHERE o.bucket_id = bucketname AND lower(o.name) COLLATE "C" < v_next_seek
                ORDER BY lower(o.name) COLLATE "C" DESC LIMIT 1;
            END IF;
        END IF;

        EXIT WHEN v_peek_name IS NULL;

        -- STEP 2: Check if this is a FOLDER or FILE
        v_common_prefix := storage.get_common_prefix(lower(v_peek_name), v_prefix_lower, v_delimiter);

        IF v_common_prefix IS NOT NULL THEN
            -- FOLDER: Handle offset, emit if needed, skip to next folder
            IF v_skipped < offsets THEN
                v_skipped := v_skipped + 1;
            ELSE
                name := split_part(rtrim(storage.get_common_prefix(v_peek_name, v_prefix, v_delimiter), v_delimiter), v_delimiter, levels);
                id := NULL;
                updated_at := NULL;
                created_at := NULL;
                last_accessed_at := NULL;
                metadata := NULL;
                RETURN NEXT;
                v_count := v_count + 1;
            END IF;

            -- Advance seek past the folder range
            IF v_is_asc THEN
                v_next_seek := lower(left(v_common_prefix, -1)) || chr(ascii(v_delimiter) + 1);
            ELSE
                v_next_seek := lower(v_common_prefix);
            END IF;
        ELSE
            -- FILE: Batch fetch using DYNAMIC SQL (overhead amortized over many rows)
            -- For ASC: upper_bound is the exclusive upper limit (< condition)
            -- For DESC: prefix_lower is the inclusive lower limit (>= condition)
            FOR v_current IN EXECUTE v_batch_query
                USING bucketname, v_next_seek,
                    CASE WHEN v_is_asc THEN COALESCE(v_upper_bound, v_prefix_lower) ELSE v_prefix_lower END, v_file_batch_size
            LOOP
                v_common_prefix := storage.get_common_prefix(lower(v_current.name), v_prefix_lower, v_delimiter);

                IF v_common_prefix IS NOT NULL THEN
                    -- Hit a folder: exit batch, let peek handle it
                    v_next_seek := lower(v_current.name);
                    EXIT;
                END IF;

                -- Handle offset skipping
                IF v_skipped < offsets THEN
                    v_skipped := v_skipped + 1;
                ELSE
                    -- Emit file
                    name := split_part(v_current.name, v_delimiter, levels);
                    id := v_current.id;
                    updated_at := v_current.updated_at;
                    created_at := v_current.created_at;
                    last_accessed_at := v_current.last_accessed_at;
                    metadata := v_current.metadata;
                    RETURN NEXT;
                    v_count := v_count + 1;
                END IF;

                -- Advance seek past this file
                IF v_is_asc THEN
                    v_next_seek := lower(v_current.name) || v_delimiter;
                ELSE
                    v_next_seek := lower(v_current.name);
                END IF;

                EXIT WHEN v_count >= v_limit;
            END LOOP;
        END IF;
    END LOOP;
END;
$_$;


--
-- Name: search_by_timestamp("text", "text", integer, integer, "text", "text", "text", "text"); Type: FUNCTION; Schema: storage; Owner: -
--

CREATE FUNCTION "storage"."search_by_timestamp"("p_prefix" "text", "p_bucket_id" "text", "p_limit" integer, "p_level" integer, "p_start_after" "text", "p_sort_order" "text", "p_sort_column" "text", "p_sort_column_after" "text") RETURNS TABLE("key" "text", "name" "text", "id" "uuid", "updated_at" timestamp with time zone, "created_at" timestamp with time zone, "last_accessed_at" timestamp with time zone, "metadata" "jsonb")
    LANGUAGE "plpgsql" STABLE
    AS $_$
DECLARE
    v_cursor_op text;
    v_query text;
    v_prefix text;
BEGIN
    v_prefix := coalesce(p_prefix, '');

    IF p_sort_order = 'asc' THEN
        v_cursor_op := '>';
    ELSE
        v_cursor_op := '<';
    END IF;

    v_query := format($sql$
        WITH raw_objects AS (
            SELECT
                o.name AS obj_name,
                o.id AS obj_id,
                o.updated_at AS obj_updated_at,
                o.created_at AS obj_created_at,
                o.last_accessed_at AS obj_last_accessed_at,
                o.metadata AS obj_metadata,
                storage.get_common_prefix(o.name, $1, '/') AS common_prefix
            FROM storage.objects o
            WHERE o.bucket_id = $2
              AND o.name COLLATE "C" LIKE $1 || '%%'
        ),
        -- Aggregate common prefixes (folders)
        -- Both created_at and updated_at use MIN(obj_created_at) to match the old prefixes table behavior
        aggregated_prefixes AS (
            SELECT
                rtrim(common_prefix, '/') AS name,
                NULL::uuid AS id,
                MIN(obj_created_at) AS updated_at,
                MIN(obj_created_at) AS created_at,
                NULL::timestamptz AS last_accessed_at,
                NULL::jsonb AS metadata,
                TRUE AS is_prefix
            FROM raw_objects
            WHERE common_prefix IS NOT NULL
            GROUP BY common_prefix
        ),
        leaf_objects AS (
            SELECT
                obj_name AS name,
                obj_id AS id,
                obj_updated_at AS updated_at,
                obj_created_at AS created_at,
                obj_last_accessed_at AS last_accessed_at,
                obj_metadata AS metadata,
                FALSE AS is_prefix
            FROM raw_objects
            WHERE common_prefix IS NULL
        ),
        combined AS (
            SELECT * FROM aggregated_prefixes
            UNION ALL
            SELECT * FROM leaf_objects
        ),
        filtered AS (
            SELECT *
            FROM combined
            WHERE (
                $5 = ''
                OR ROW(
                    date_trunc('milliseconds', %I),
                    name COLLATE "C"
                ) %s ROW(
                    COALESCE(NULLIF($6, '')::timestamptz, 'epoch'::timestamptz),
                    $5
                )
            )
        )
        SELECT
            split_part(name, '/', $3) AS key,
            name,
            id,
            updated_at,
            created_at,
            last_accessed_at,
            metadata
        FROM filtered
        ORDER BY
            COALESCE(date_trunc('milliseconds', %I), 'epoch'::timestamptz) %s,
            name COLLATE "C" %s
        LIMIT $4
    $sql$,
        p_sort_column,
        v_cursor_op,
        p_sort_column,
        p_sort_order,
        p_sort_order
    );

    RETURN QUERY EXECUTE v_query
    USING v_prefix, p_bucket_id, p_level, p_limit, p_start_after, p_sort_column_after;
END;
$_$;


--
-- Name: search_v2("text", "text", integer, integer, "text", "text", "text", "text"); Type: FUNCTION; Schema: storage; Owner: -
--

CREATE FUNCTION "storage"."search_v2"("prefix" "text", "bucket_name" "text", "limits" integer DEFAULT 100, "levels" integer DEFAULT 1, "start_after" "text" DEFAULT ''::"text", "sort_order" "text" DEFAULT 'asc'::"text", "sort_column" "text" DEFAULT 'name'::"text", "sort_column_after" "text" DEFAULT ''::"text") RETURNS TABLE("key" "text", "name" "text", "id" "uuid", "updated_at" timestamp with time zone, "created_at" timestamp with time zone, "last_accessed_at" timestamp with time zone, "metadata" "jsonb")
    LANGUAGE "plpgsql" STABLE
    AS $$
DECLARE
    v_sort_col text;
    v_sort_ord text;
    v_limit int;
BEGIN
    -- Cap limit to maximum of 1500 records
    v_limit := LEAST(coalesce(limits, 100), 1500);

    -- Validate and normalize sort_order
    v_sort_ord := lower(coalesce(sort_order, 'asc'));
    IF v_sort_ord NOT IN ('asc', 'desc') THEN
        v_sort_ord := 'asc';
    END IF;

    -- Validate and normalize sort_column
    v_sort_col := lower(coalesce(sort_column, 'name'));
    IF v_sort_col NOT IN ('name', 'updated_at', 'created_at') THEN
        v_sort_col := 'name';
    END IF;

    -- Route to appropriate implementation
    IF v_sort_col = 'name' THEN
        -- Use list_objects_with_delimiter for name sorting (most efficient: O(k * log n))
        RETURN QUERY
        SELECT
            split_part(l.name, '/', levels) AS key,
            l.name AS name,
            l.id,
            l.updated_at,
            l.created_at,
            l.last_accessed_at,
            l.metadata
        FROM storage.list_objects_with_delimiter(
            bucket_name,
            coalesce(prefix, ''),
            '/',
            v_limit,
            start_after,
            '',
            v_sort_ord
        ) l;
    ELSE
        -- Use aggregation approach for timestamp sorting
        -- Not efficient for large datasets but supports correct pagination
        RETURN QUERY SELECT * FROM storage.search_by_timestamp(
            prefix, bucket_name, v_limit, levels, start_after,
            v_sort_ord, v_sort_col, sort_column_after
        );
    END IF;
END;
$$;


--
-- Name: update_updated_at_column(); Type: FUNCTION; Schema: storage; Owner: -
--

CREATE FUNCTION "storage"."update_updated_at_column"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW; 
END;
$$;


SET default_tablespace = '';

SET default_table_access_method = "heap";

--
-- Name: audit_log_entries; Type: TABLE; Schema: auth; Owner: -
--

CREATE TABLE "auth"."audit_log_entries" (
    "instance_id" "uuid",
    "id" "uuid" NOT NULL,
    "payload" json,
    "created_at" timestamp with time zone,
    "ip_address" character varying(64) DEFAULT ''::character varying NOT NULL
);


--
-- Name: TABLE "audit_log_entries"; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON TABLE "auth"."audit_log_entries" IS 'Auth: Audit trail for user actions.';


--
-- Name: custom_oauth_providers; Type: TABLE; Schema: auth; Owner: -
--

CREATE TABLE "auth"."custom_oauth_providers" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "provider_type" "text" NOT NULL,
    "identifier" "text" NOT NULL,
    "name" "text" NOT NULL,
    "client_id" "text" NOT NULL,
    "client_secret" "text" NOT NULL,
    "acceptable_client_ids" "text"[] DEFAULT '{}'::"text"[] NOT NULL,
    "scopes" "text"[] DEFAULT '{}'::"text"[] NOT NULL,
    "pkce_enabled" boolean DEFAULT true NOT NULL,
    "attribute_mapping" "jsonb" DEFAULT '{}'::"jsonb" NOT NULL,
    "authorization_params" "jsonb" DEFAULT '{}'::"jsonb" NOT NULL,
    "enabled" boolean DEFAULT true NOT NULL,
    "email_optional" boolean DEFAULT false NOT NULL,
    "issuer" "text",
    "discovery_url" "text",
    "skip_nonce_check" boolean DEFAULT false NOT NULL,
    "cached_discovery" "jsonb",
    "discovery_cached_at" timestamp with time zone,
    "authorization_url" "text",
    "token_url" "text",
    "userinfo_url" "text",
    "jwks_uri" "text",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    CONSTRAINT "custom_oauth_providers_authorization_url_https" CHECK ((("authorization_url" IS NULL) OR ("authorization_url" ~~ 'https://%'::"text"))),
    CONSTRAINT "custom_oauth_providers_authorization_url_length" CHECK ((("authorization_url" IS NULL) OR ("char_length"("authorization_url") <= 2048))),
    CONSTRAINT "custom_oauth_providers_client_id_length" CHECK ((("char_length"("client_id") >= 1) AND ("char_length"("client_id") <= 512))),
    CONSTRAINT "custom_oauth_providers_discovery_url_length" CHECK ((("discovery_url" IS NULL) OR ("char_length"("discovery_url") <= 2048))),
    CONSTRAINT "custom_oauth_providers_identifier_format" CHECK (("identifier" ~ '^[a-z0-9][a-z0-9:-]{0,48}[a-z0-9]$'::"text")),
    CONSTRAINT "custom_oauth_providers_issuer_length" CHECK ((("issuer" IS NULL) OR (("char_length"("issuer") >= 1) AND ("char_length"("issuer") <= 2048)))),
    CONSTRAINT "custom_oauth_providers_jwks_uri_https" CHECK ((("jwks_uri" IS NULL) OR ("jwks_uri" ~~ 'https://%'::"text"))),
    CONSTRAINT "custom_oauth_providers_jwks_uri_length" CHECK ((("jwks_uri" IS NULL) OR ("char_length"("jwks_uri") <= 2048))),
    CONSTRAINT "custom_oauth_providers_name_length" CHECK ((("char_length"("name") >= 1) AND ("char_length"("name") <= 100))),
    CONSTRAINT "custom_oauth_providers_oauth2_requires_endpoints" CHECK ((("provider_type" <> 'oauth2'::"text") OR (("authorization_url" IS NOT NULL) AND ("token_url" IS NOT NULL) AND ("userinfo_url" IS NOT NULL)))),
    CONSTRAINT "custom_oauth_providers_oidc_discovery_url_https" CHECK ((("provider_type" <> 'oidc'::"text") OR ("discovery_url" IS NULL) OR ("discovery_url" ~~ 'https://%'::"text"))),
    CONSTRAINT "custom_oauth_providers_oidc_issuer_https" CHECK ((("provider_type" <> 'oidc'::"text") OR ("issuer" IS NULL) OR ("issuer" ~~ 'https://%'::"text"))),
    CONSTRAINT "custom_oauth_providers_oidc_requires_issuer" CHECK ((("provider_type" <> 'oidc'::"text") OR ("issuer" IS NOT NULL))),
    CONSTRAINT "custom_oauth_providers_provider_type_check" CHECK (("provider_type" = ANY (ARRAY['oauth2'::"text", 'oidc'::"text"]))),
    CONSTRAINT "custom_oauth_providers_token_url_https" CHECK ((("token_url" IS NULL) OR ("token_url" ~~ 'https://%'::"text"))),
    CONSTRAINT "custom_oauth_providers_token_url_length" CHECK ((("token_url" IS NULL) OR ("char_length"("token_url") <= 2048))),
    CONSTRAINT "custom_oauth_providers_userinfo_url_https" CHECK ((("userinfo_url" IS NULL) OR ("userinfo_url" ~~ 'https://%'::"text"))),
    CONSTRAINT "custom_oauth_providers_userinfo_url_length" CHECK ((("userinfo_url" IS NULL) OR ("char_length"("userinfo_url") <= 2048)))
);


--
-- Name: flow_state; Type: TABLE; Schema: auth; Owner: -
--

CREATE TABLE "auth"."flow_state" (
    "id" "uuid" NOT NULL,
    "user_id" "uuid",
    "auth_code" "text",
    "code_challenge_method" "auth"."code_challenge_method",
    "code_challenge" "text",
    "provider_type" "text" NOT NULL,
    "provider_access_token" "text",
    "provider_refresh_token" "text",
    "created_at" timestamp with time zone,
    "updated_at" timestamp with time zone,
    "authentication_method" "text" NOT NULL,
    "auth_code_issued_at" timestamp with time zone,
    "invite_token" "text",
    "referrer" "text",
    "oauth_client_state_id" "uuid",
    "linking_target_id" "uuid",
    "email_optional" boolean DEFAULT false NOT NULL
);


--
-- Name: TABLE "flow_state"; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON TABLE "auth"."flow_state" IS 'Stores metadata for all OAuth/SSO login flows';


--
-- Name: identities; Type: TABLE; Schema: auth; Owner: -
--

CREATE TABLE "auth"."identities" (
    "provider_id" "text" NOT NULL,
    "user_id" "uuid" NOT NULL,
    "identity_data" "jsonb" NOT NULL,
    "provider" "text" NOT NULL,
    "last_sign_in_at" timestamp with time zone,
    "created_at" timestamp with time zone,
    "updated_at" timestamp with time zone,
    "email" "text" GENERATED ALWAYS AS ("lower"(("identity_data" ->> 'email'::"text"))) STORED,
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL
);


--
-- Name: TABLE "identities"; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON TABLE "auth"."identities" IS 'Auth: Stores identities associated to a user.';


--
-- Name: COLUMN "identities"."email"; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON COLUMN "auth"."identities"."email" IS 'Auth: Email is a generated column that references the optional email property in the identity_data';


--
-- Name: instances; Type: TABLE; Schema: auth; Owner: -
--

CREATE TABLE "auth"."instances" (
    "id" "uuid" NOT NULL,
    "uuid" "uuid",
    "raw_base_config" "text",
    "created_at" timestamp with time zone,
    "updated_at" timestamp with time zone
);


--
-- Name: TABLE "instances"; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON TABLE "auth"."instances" IS 'Auth: Manages users across multiple sites.';


--
-- Name: mfa_amr_claims; Type: TABLE; Schema: auth; Owner: -
--

CREATE TABLE "auth"."mfa_amr_claims" (
    "session_id" "uuid" NOT NULL,
    "created_at" timestamp with time zone NOT NULL,
    "updated_at" timestamp with time zone NOT NULL,
    "authentication_method" "text" NOT NULL,
    "id" "uuid" NOT NULL
);


--
-- Name: TABLE "mfa_amr_claims"; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON TABLE "auth"."mfa_amr_claims" IS 'auth: stores authenticator method reference claims for multi factor authentication';


--
-- Name: mfa_challenges; Type: TABLE; Schema: auth; Owner: -
--

CREATE TABLE "auth"."mfa_challenges" (
    "id" "uuid" NOT NULL,
    "factor_id" "uuid" NOT NULL,
    "created_at" timestamp with time zone NOT NULL,
    "verified_at" timestamp with time zone,
    "ip_address" "inet" NOT NULL,
    "otp_code" "text",
    "web_authn_session_data" "jsonb"
);


--
-- Name: TABLE "mfa_challenges"; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON TABLE "auth"."mfa_challenges" IS 'auth: stores metadata about challenge requests made';


--
-- Name: mfa_factors; Type: TABLE; Schema: auth; Owner: -
--

CREATE TABLE "auth"."mfa_factors" (
    "id" "uuid" NOT NULL,
    "user_id" "uuid" NOT NULL,
    "friendly_name" "text",
    "factor_type" "auth"."factor_type" NOT NULL,
    "status" "auth"."factor_status" NOT NULL,
    "created_at" timestamp with time zone NOT NULL,
    "updated_at" timestamp with time zone NOT NULL,
    "secret" "text",
    "phone" "text",
    "last_challenged_at" timestamp with time zone,
    "web_authn_credential" "jsonb",
    "web_authn_aaguid" "uuid",
    "last_webauthn_challenge_data" "jsonb"
);


--
-- Name: TABLE "mfa_factors"; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON TABLE "auth"."mfa_factors" IS 'auth: stores metadata about factors';


--
-- Name: COLUMN "mfa_factors"."last_webauthn_challenge_data"; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON COLUMN "auth"."mfa_factors"."last_webauthn_challenge_data" IS 'Stores the latest WebAuthn challenge data including attestation/assertion for customer verification';


--
-- Name: oauth_authorizations; Type: TABLE; Schema: auth; Owner: -
--

CREATE TABLE "auth"."oauth_authorizations" (
    "id" "uuid" NOT NULL,
    "authorization_id" "text" NOT NULL,
    "client_id" "uuid" NOT NULL,
    "user_id" "uuid",
    "redirect_uri" "text" NOT NULL,
    "scope" "text" NOT NULL,
    "state" "text",
    "resource" "text",
    "code_challenge" "text",
    "code_challenge_method" "auth"."code_challenge_method",
    "response_type" "auth"."oauth_response_type" DEFAULT 'code'::"auth"."oauth_response_type" NOT NULL,
    "status" "auth"."oauth_authorization_status" DEFAULT 'pending'::"auth"."oauth_authorization_status" NOT NULL,
    "authorization_code" "text",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "expires_at" timestamp with time zone DEFAULT ("now"() + '00:03:00'::interval) NOT NULL,
    "approved_at" timestamp with time zone,
    "nonce" "text",
    CONSTRAINT "oauth_authorizations_authorization_code_length" CHECK (("char_length"("authorization_code") <= 255)),
    CONSTRAINT "oauth_authorizations_code_challenge_length" CHECK (("char_length"("code_challenge") <= 128)),
    CONSTRAINT "oauth_authorizations_expires_at_future" CHECK (("expires_at" > "created_at")),
    CONSTRAINT "oauth_authorizations_nonce_length" CHECK (("char_length"("nonce") <= 255)),
    CONSTRAINT "oauth_authorizations_redirect_uri_length" CHECK (("char_length"("redirect_uri") <= 2048)),
    CONSTRAINT "oauth_authorizations_resource_length" CHECK (("char_length"("resource") <= 2048)),
    CONSTRAINT "oauth_authorizations_scope_length" CHECK (("char_length"("scope") <= 4096)),
    CONSTRAINT "oauth_authorizations_state_length" CHECK (("char_length"("state") <= 4096))
);


--
-- Name: oauth_client_states; Type: TABLE; Schema: auth; Owner: -
--

CREATE TABLE "auth"."oauth_client_states" (
    "id" "uuid" NOT NULL,
    "provider_type" "text" NOT NULL,
    "code_verifier" "text",
    "created_at" timestamp with time zone NOT NULL
);


--
-- Name: TABLE "oauth_client_states"; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON TABLE "auth"."oauth_client_states" IS 'Stores OAuth states for third-party provider authentication flows where Supabase acts as the OAuth client.';


--
-- Name: oauth_clients; Type: TABLE; Schema: auth; Owner: -
--

CREATE TABLE "auth"."oauth_clients" (
    "id" "uuid" NOT NULL,
    "client_secret_hash" "text",
    "registration_type" "auth"."oauth_registration_type" NOT NULL,
    "redirect_uris" "text" NOT NULL,
    "grant_types" "text" NOT NULL,
    "client_name" "text",
    "client_uri" "text",
    "logo_uri" "text",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "deleted_at" timestamp with time zone,
    "client_type" "auth"."oauth_client_type" DEFAULT 'confidential'::"auth"."oauth_client_type" NOT NULL,
    "token_endpoint_auth_method" "text" NOT NULL,
    CONSTRAINT "oauth_clients_client_name_length" CHECK (("char_length"("client_name") <= 1024)),
    CONSTRAINT "oauth_clients_client_uri_length" CHECK (("char_length"("client_uri") <= 2048)),
    CONSTRAINT "oauth_clients_logo_uri_length" CHECK (("char_length"("logo_uri") <= 2048)),
    CONSTRAINT "oauth_clients_token_endpoint_auth_method_check" CHECK (("token_endpoint_auth_method" = ANY (ARRAY['client_secret_basic'::"text", 'client_secret_post'::"text", 'none'::"text"])))
);


--
-- Name: oauth_consents; Type: TABLE; Schema: auth; Owner: -
--

CREATE TABLE "auth"."oauth_consents" (
    "id" "uuid" NOT NULL,
    "user_id" "uuid" NOT NULL,
    "client_id" "uuid" NOT NULL,
    "scopes" "text" NOT NULL,
    "granted_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "revoked_at" timestamp with time zone,
    CONSTRAINT "oauth_consents_revoked_after_granted" CHECK ((("revoked_at" IS NULL) OR ("revoked_at" >= "granted_at"))),
    CONSTRAINT "oauth_consents_scopes_length" CHECK (("char_length"("scopes") <= 2048)),
    CONSTRAINT "oauth_consents_scopes_not_empty" CHECK (("char_length"(TRIM(BOTH FROM "scopes")) > 0))
);


--
-- Name: one_time_tokens; Type: TABLE; Schema: auth; Owner: -
--

CREATE TABLE "auth"."one_time_tokens" (
    "id" "uuid" NOT NULL,
    "user_id" "uuid" NOT NULL,
    "token_type" "auth"."one_time_token_type" NOT NULL,
    "token_hash" "text" NOT NULL,
    "relates_to" "text" NOT NULL,
    "created_at" timestamp without time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp without time zone DEFAULT "now"() NOT NULL,
    CONSTRAINT "one_time_tokens_token_hash_check" CHECK (("char_length"("token_hash") > 0))
);


--
-- Name: refresh_tokens; Type: TABLE; Schema: auth; Owner: -
--

CREATE TABLE "auth"."refresh_tokens" (
    "instance_id" "uuid",
    "id" bigint NOT NULL,
    "token" character varying(255),
    "user_id" character varying(255),
    "revoked" boolean,
    "created_at" timestamp with time zone,
    "updated_at" timestamp with time zone,
    "parent" character varying(255),
    "session_id" "uuid"
);


--
-- Name: TABLE "refresh_tokens"; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON TABLE "auth"."refresh_tokens" IS 'Auth: Store of tokens used to refresh JWT tokens once they expire.';


--
-- Name: refresh_tokens_id_seq; Type: SEQUENCE; Schema: auth; Owner: -
--

CREATE SEQUENCE "auth"."refresh_tokens_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: refresh_tokens_id_seq; Type: SEQUENCE OWNED BY; Schema: auth; Owner: -
--

ALTER SEQUENCE "auth"."refresh_tokens_id_seq" OWNED BY "auth"."refresh_tokens"."id";


--
-- Name: saml_providers; Type: TABLE; Schema: auth; Owner: -
--

CREATE TABLE "auth"."saml_providers" (
    "id" "uuid" NOT NULL,
    "sso_provider_id" "uuid" NOT NULL,
    "entity_id" "text" NOT NULL,
    "metadata_xml" "text" NOT NULL,
    "metadata_url" "text",
    "attribute_mapping" "jsonb",
    "created_at" timestamp with time zone,
    "updated_at" timestamp with time zone,
    "name_id_format" "text",
    CONSTRAINT "entity_id not empty" CHECK (("char_length"("entity_id") > 0)),
    CONSTRAINT "metadata_url not empty" CHECK ((("metadata_url" = NULL::"text") OR ("char_length"("metadata_url") > 0))),
    CONSTRAINT "metadata_xml not empty" CHECK (("char_length"("metadata_xml") > 0))
);


--
-- Name: TABLE "saml_providers"; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON TABLE "auth"."saml_providers" IS 'Auth: Manages SAML Identity Provider connections.';


--
-- Name: saml_relay_states; Type: TABLE; Schema: auth; Owner: -
--

CREATE TABLE "auth"."saml_relay_states" (
    "id" "uuid" NOT NULL,
    "sso_provider_id" "uuid" NOT NULL,
    "request_id" "text" NOT NULL,
    "for_email" "text",
    "redirect_to" "text",
    "created_at" timestamp with time zone,
    "updated_at" timestamp with time zone,
    "flow_state_id" "uuid",
    CONSTRAINT "request_id not empty" CHECK (("char_length"("request_id") > 0))
);


--
-- Name: TABLE "saml_relay_states"; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON TABLE "auth"."saml_relay_states" IS 'Auth: Contains SAML Relay State information for each Service Provider initiated login.';


--
-- Name: schema_migrations; Type: TABLE; Schema: auth; Owner: -
--

CREATE TABLE "auth"."schema_migrations" (
    "version" character varying(255) NOT NULL
);


--
-- Name: TABLE "schema_migrations"; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON TABLE "auth"."schema_migrations" IS 'Auth: Manages updates to the auth system.';


--
-- Name: sessions; Type: TABLE; Schema: auth; Owner: -
--

CREATE TABLE "auth"."sessions" (
    "id" "uuid" NOT NULL,
    "user_id" "uuid" NOT NULL,
    "created_at" timestamp with time zone,
    "updated_at" timestamp with time zone,
    "factor_id" "uuid",
    "aal" "auth"."aal_level",
    "not_after" timestamp with time zone,
    "refreshed_at" timestamp without time zone,
    "user_agent" "text",
    "ip" "inet",
    "tag" "text",
    "oauth_client_id" "uuid",
    "refresh_token_hmac_key" "text",
    "refresh_token_counter" bigint,
    "scopes" "text",
    CONSTRAINT "sessions_scopes_length" CHECK (("char_length"("scopes") <= 4096))
);


--
-- Name: TABLE "sessions"; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON TABLE "auth"."sessions" IS 'Auth: Stores session data associated to a user.';


--
-- Name: COLUMN "sessions"."not_after"; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON COLUMN "auth"."sessions"."not_after" IS 'Auth: Not after is a nullable column that contains a timestamp after which the session should be regarded as expired.';


--
-- Name: COLUMN "sessions"."refresh_token_hmac_key"; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON COLUMN "auth"."sessions"."refresh_token_hmac_key" IS 'Holds a HMAC-SHA256 key used to sign refresh tokens for this session.';


--
-- Name: COLUMN "sessions"."refresh_token_counter"; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON COLUMN "auth"."sessions"."refresh_token_counter" IS 'Holds the ID (counter) of the last issued refresh token.';


--
-- Name: sso_domains; Type: TABLE; Schema: auth; Owner: -
--

CREATE TABLE "auth"."sso_domains" (
    "id" "uuid" NOT NULL,
    "sso_provider_id" "uuid" NOT NULL,
    "domain" "text" NOT NULL,
    "created_at" timestamp with time zone,
    "updated_at" timestamp with time zone,
    CONSTRAINT "domain not empty" CHECK (("char_length"("domain") > 0))
);


--
-- Name: TABLE "sso_domains"; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON TABLE "auth"."sso_domains" IS 'Auth: Manages SSO email address domain mapping to an SSO Identity Provider.';


--
-- Name: sso_providers; Type: TABLE; Schema: auth; Owner: -
--

CREATE TABLE "auth"."sso_providers" (
    "id" "uuid" NOT NULL,
    "resource_id" "text",
    "created_at" timestamp with time zone,
    "updated_at" timestamp with time zone,
    "disabled" boolean,
    CONSTRAINT "resource_id not empty" CHECK ((("resource_id" = NULL::"text") OR ("char_length"("resource_id") > 0)))
);


--
-- Name: TABLE "sso_providers"; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON TABLE "auth"."sso_providers" IS 'Auth: Manages SSO identity provider information; see saml_providers for SAML.';


--
-- Name: COLUMN "sso_providers"."resource_id"; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON COLUMN "auth"."sso_providers"."resource_id" IS 'Auth: Uniquely identifies a SSO provider according to a user-chosen resource ID (case insensitive), useful in infrastructure as code.';


--
-- Name: users; Type: TABLE; Schema: auth; Owner: -
--

CREATE TABLE "auth"."users" (
    "instance_id" "uuid",
    "id" "uuid" NOT NULL,
    "aud" character varying(255),
    "role" character varying(255),
    "email" character varying(255),
    "encrypted_password" character varying(255),
    "email_confirmed_at" timestamp with time zone,
    "invited_at" timestamp with time zone,
    "confirmation_token" character varying(255),
    "confirmation_sent_at" timestamp with time zone,
    "recovery_token" character varying(255),
    "recovery_sent_at" timestamp with time zone,
    "email_change_token_new" character varying(255),
    "email_change" character varying(255),
    "email_change_sent_at" timestamp with time zone,
    "last_sign_in_at" timestamp with time zone,
    "raw_app_meta_data" "jsonb",
    "raw_user_meta_data" "jsonb",
    "is_super_admin" boolean,
    "created_at" timestamp with time zone,
    "updated_at" timestamp with time zone,
    "phone" "text" DEFAULT NULL::character varying,
    "phone_confirmed_at" timestamp with time zone,
    "phone_change" "text" DEFAULT ''::character varying,
    "phone_change_token" character varying(255) DEFAULT ''::character varying,
    "phone_change_sent_at" timestamp with time zone,
    "confirmed_at" timestamp with time zone GENERATED ALWAYS AS (LEAST("email_confirmed_at", "phone_confirmed_at")) STORED,
    "email_change_token_current" character varying(255) DEFAULT ''::character varying,
    "email_change_confirm_status" smallint DEFAULT 0,
    "banned_until" timestamp with time zone,
    "reauthentication_token" character varying(255) DEFAULT ''::character varying,
    "reauthentication_sent_at" timestamp with time zone,
    "is_sso_user" boolean DEFAULT false NOT NULL,
    "deleted_at" timestamp with time zone,
    "is_anonymous" boolean DEFAULT false NOT NULL,
    CONSTRAINT "users_email_change_confirm_status_check" CHECK ((("email_change_confirm_status" >= 0) AND ("email_change_confirm_status" <= 2)))
);


--
-- Name: TABLE "users"; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON TABLE "auth"."users" IS 'Auth: Stores user login data within a secure schema.';


--
-- Name: COLUMN "users"."is_sso_user"; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON COLUMN "auth"."users"."is_sso_user" IS 'Auth: Set this column to true when the account comes from SSO. These accounts can have duplicate emails.';


--
-- Name: webauthn_challenges; Type: TABLE; Schema: auth; Owner: -
--

CREATE TABLE "auth"."webauthn_challenges" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid",
    "challenge_type" "text" NOT NULL,
    "session_data" "jsonb" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "expires_at" timestamp with time zone NOT NULL,
    CONSTRAINT "webauthn_challenges_challenge_type_check" CHECK (("challenge_type" = ANY (ARRAY['signup'::"text", 'registration'::"text", 'authentication'::"text"])))
);


--
-- Name: webauthn_credentials; Type: TABLE; Schema: auth; Owner: -
--

CREATE TABLE "auth"."webauthn_credentials" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "credential_id" "bytea" NOT NULL,
    "public_key" "bytea" NOT NULL,
    "attestation_type" "text" DEFAULT ''::"text" NOT NULL,
    "aaguid" "uuid",
    "sign_count" bigint DEFAULT 0 NOT NULL,
    "transports" "jsonb" DEFAULT '[]'::"jsonb" NOT NULL,
    "backup_eligible" boolean DEFAULT false NOT NULL,
    "backed_up" boolean DEFAULT false NOT NULL,
    "friendly_name" "text" DEFAULT ''::"text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "last_used_at" timestamp with time zone
);


--
-- Name: _posts_v; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE "public"."_posts_v" (
    "id" integer NOT NULL,
    "parent_id" integer,
    "version_title" character varying,
    "version_slug" character varying,
    "version_content" "jsonb",
    "version_excerpt" character varying,
    "version_featured_image_id" integer,
    "version_status" "public"."enum__posts_v_version_status" DEFAULT 'draft'::"public"."enum__posts_v_version_status",
    "version_published_at" timestamp(3) with time zone,
    "version_author_id" integer,
    "version_seo_title" character varying,
    "version_seo_description" character varying,
    "version_seo_focus_keyword" character varying,
    "version_updated_at" timestamp(3) with time zone,
    "version_created_at" timestamp(3) with time zone,
    "version__status" "public"."enum__posts_v_version_status" DEFAULT 'draft'::"public"."enum__posts_v_version_status",
    "created_at" timestamp(3) with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp(3) with time zone DEFAULT "now"() NOT NULL,
    "latest" boolean,
    "version_is_featured" boolean DEFAULT false
);


--
-- Name: _posts_v_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE "public"."_posts_v_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: _posts_v_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE "public"."_posts_v_id_seq" OWNED BY "public"."_posts_v"."id";


--
-- Name: _posts_v_rels; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE "public"."_posts_v_rels" (
    "id" integer NOT NULL,
    "order" integer,
    "parent_id" integer NOT NULL,
    "path" character varying NOT NULL,
    "post_categories_id" integer
);


--
-- Name: _posts_v_rels_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE "public"."_posts_v_rels_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: _posts_v_rels_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE "public"."_posts_v_rels_id_seq" OWNED BY "public"."_posts_v_rels"."id";


--
-- Name: _posts_v_version_tags; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE "public"."_posts_v_version_tags" (
    "_order" integer NOT NULL,
    "_parent_id" integer NOT NULL,
    "id" integer NOT NULL,
    "tag" character varying,
    "_uuid" character varying
);


--
-- Name: _posts_v_version_tags_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE "public"."_posts_v_version_tags_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: _posts_v_version_tags_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE "public"."_posts_v_version_tags_id_seq" OWNED BY "public"."_posts_v_version_tags"."id";


--
-- Name: admins; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE "public"."admins" (
    "id" integer NOT NULL,
    "user_id" integer NOT NULL,
    "updated_at" timestamp(3) with time zone DEFAULT "now"() NOT NULL,
    "created_at" timestamp(3) with time zone DEFAULT "now"() NOT NULL,
    "admin_level" "public"."enum_admins_admin_level" DEFAULT 'content'::"public"."enum_admins_admin_level" NOT NULL,
    "system_permissions" "jsonb"
);


--
-- Name: admins_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE "public"."admins_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: admins_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE "public"."admins_id_seq" OWNED BY "public"."admins"."id";


--
-- Name: announcements; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE "public"."announcements" (
    "id" integer NOT NULL,
    "title" character varying NOT NULL,
    "course_id" integer NOT NULL,
    "body_blocks" "jsonb",
    "pinned" boolean DEFAULT false,
    "visible_from" timestamp(3) with time zone,
    "visible_until" timestamp(3) with time zone,
    "created_by_id" integer,
    "updated_at" timestamp(3) with time zone DEFAULT "now"() NOT NULL,
    "created_at" timestamp(3) with time zone DEFAULT "now"() NOT NULL
);


--
-- Name: announcements_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE "public"."announcements_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: announcements_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE "public"."announcements_id_seq" OWNED BY "public"."announcements"."id";


--
-- Name: assessment_submissions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE "public"."assessment_submissions" (
    "id" integer NOT NULL,
    "trainee_id" integer NOT NULL,
    "enrollment_id" integer NOT NULL,
    "assessment_id" integer NOT NULL,
    "course_id" integer NOT NULL,
    "status" "public"."enum_assessment_submissions_status" DEFAULT 'in_progress'::"public"."enum_assessment_submissions_status" NOT NULL,
    "attempt_number" numeric NOT NULL,
    "score" numeric,
    "points_total" numeric,
    "points_possible" numeric,
    "passing_score_snapshot" numeric,
    "started_at" timestamp(3) with time zone NOT NULL,
    "completed_at" timestamp(3) with time zone,
    "is_latest" boolean DEFAULT true,
    "updated_at" timestamp(3) with time zone DEFAULT "now"() NOT NULL,
    "created_at" timestamp(3) with time zone DEFAULT "now"() NOT NULL,
    "is_feedback_read" boolean DEFAULT false
);


--
-- Name: assessment_submissions_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE "public"."assessment_submissions_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: assessment_submissions_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE "public"."assessment_submissions_id_seq" OWNED BY "public"."assessment_submissions"."id";


--
-- Name: assessments; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE "public"."assessments" (
    "id" integer NOT NULL,
    "title" character varying NOT NULL,
    "module_id" integer,
    "assessment_type" "public"."enum_assessments_assessment_type" DEFAULT 'quiz'::"public"."enum_assessments_assessment_type" NOT NULL,
    "passing_score" numeric DEFAULT 70,
    "max_attempts" numeric DEFAULT 1,
    "time_limit_minutes" numeric,
    "updated_at" timestamp(3) with time zone DEFAULT "now"() NOT NULL,
    "created_at" timestamp(3) with time zone DEFAULT "now"() NOT NULL,
    "course_id" integer,
    "description" "jsonb",
    "show_correct_answer" boolean DEFAULT false
);


--
-- Name: assessments_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE "public"."assessments_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: assessments_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE "public"."assessments_id_seq" OWNED BY "public"."assessments"."id";


--
-- Name: assessments_items; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE "public"."assessments_items" (
    "_order" integer NOT NULL,
    "_parent_id" integer NOT NULL,
    "id" character varying NOT NULL,
    "question_id" integer NOT NULL,
    "order" numeric,
    "points" numeric DEFAULT 1
);


--
-- Name: assignment_submissions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE "public"."assignment_submissions" (
    "id" integer NOT NULL,
    "assignment_id" integer NOT NULL,
    "trainee_id" integer NOT NULL,
    "enrollment_id" integer NOT NULL,
    "status" "public"."enum_assignment_submissions_status" DEFAULT 'draft'::"public"."enum_assignment_submissions_status" NOT NULL,
    "submitted_text" "jsonb",
    "score" numeric,
    "feedback" "jsonb",
    "submitted_at" timestamp(3) with time zone,
    "graded_at" timestamp(3) with time zone,
    "graded_by_id" integer,
    "updated_at" timestamp(3) with time zone DEFAULT "now"() NOT NULL,
    "created_at" timestamp(3) with time zone DEFAULT "now"() NOT NULL,
    "is_feedback_read" boolean DEFAULT false
);


--
-- Name: assignment_submissions_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE "public"."assignment_submissions_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: assignment_submissions_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE "public"."assignment_submissions_id_seq" OWNED BY "public"."assignment_submissions"."id";


--
-- Name: assignment_submissions_rels; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE "public"."assignment_submissions_rels" (
    "id" integer NOT NULL,
    "order" integer,
    "parent_id" integer NOT NULL,
    "path" character varying NOT NULL,
    "media_id" integer
);


--
-- Name: assignment_submissions_rels_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE "public"."assignment_submissions_rels_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: assignment_submissions_rels_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE "public"."assignment_submissions_rels_id_seq" OWNED BY "public"."assignment_submissions_rels"."id";


--
-- Name: assignments; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE "public"."assignments" (
    "id" integer NOT NULL,
    "title" character varying NOT NULL,
    "description" "jsonb",
    "max_score" numeric DEFAULT 100 NOT NULL,
    "passing_score" numeric DEFAULT 75 NOT NULL,
    "submission_type" "public"."enum_assignments_submission_type" DEFAULT 'both'::"public"."enum_assignments_submission_type" NOT NULL,
    "due_date" timestamp(3) with time zone,
    "updated_at" timestamp(3) with time zone DEFAULT "now"() NOT NULL,
    "created_at" timestamp(3) with time zone DEFAULT "now"() NOT NULL
);


--
-- Name: assignments_allowed_file_types; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE "public"."assignments_allowed_file_types" (
    "order" integer NOT NULL,
    "parent_id" integer NOT NULL,
    "value" "public"."enum_assignments_allowed_file_types",
    "id" integer NOT NULL
);


--
-- Name: assignments_allowed_file_types_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE "public"."assignments_allowed_file_types_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: assignments_allowed_file_types_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE "public"."assignments_allowed_file_types_id_seq" OWNED BY "public"."assignments_allowed_file_types"."id";


--
-- Name: assignments_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE "public"."assignments_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: assignments_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE "public"."assignments_id_seq" OWNED BY "public"."assignments"."id";


--
-- Name: assignments_rels; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE "public"."assignments_rels" (
    "id" integer NOT NULL,
    "order" integer,
    "parent_id" integer NOT NULL,
    "path" character varying NOT NULL,
    "media_id" integer
);


--
-- Name: assignments_rels_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE "public"."assignments_rels_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: assignments_rels_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE "public"."assignments_rels_id_seq" OWNED BY "public"."assignments_rels"."id";


--
-- Name: certificate_templates; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE "public"."certificate_templates" (
    "id" integer NOT NULL,
    "name" character varying NOT NULL,
    "slug" character varying NOT NULL,
    "canvas_schema" "jsonb" NOT NULL,
    "status" "public"."enum_certificate_templates_status" DEFAULT 'draft'::"public"."enum_certificate_templates_status" NOT NULL,
    "updated_at" timestamp(3) with time zone DEFAULT "now"() NOT NULL,
    "created_at" timestamp(3) with time zone DEFAULT "now"() NOT NULL,
    "background_image_id" integer NOT NULL
);


--
-- Name: certificate_templates_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE "public"."certificate_templates_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: certificate_templates_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE "public"."certificate_templates_id_seq" OWNED BY "public"."certificate_templates"."id";


--
-- Name: certificates; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE "public"."certificates" (
    "id" integer NOT NULL,
    "certificate_code" character varying NOT NULL,
    "verification_url" character varying,
    "trainee_id" integer NOT NULL,
    "course_id" integer NOT NULL,
    "enrollment_id" integer NOT NULL,
    "issue_date" timestamp(3) with time zone NOT NULL,
    "expiry_date" timestamp(3) with time zone,
    "file_id" integer,
    "metadata" "jsonb",
    "status" "public"."enum_certificates_status" DEFAULT 'active'::"public"."enum_certificates_status" NOT NULL,
    "updated_at" timestamp(3) with time zone DEFAULT "now"() NOT NULL,
    "created_at" timestamp(3) with time zone DEFAULT "now"() NOT NULL
);


--
-- Name: certificates_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE "public"."certificates_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: certificates_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE "public"."certificates_id_seq" OWNED BY "public"."certificates"."id";


--
-- Name: chat_message_status; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE "public"."chat_message_status" (
    "id" integer NOT NULL,
    "message_id" integer NOT NULL,
    "user_id" integer NOT NULL,
    "status" "public"."enum_chat_message_status_status" DEFAULT 'delivered'::"public"."enum_chat_message_status_status" NOT NULL,
    "delivered_at" timestamp(3) with time zone,
    "read_at" timestamp(3) with time zone,
    "updated_at" timestamp(3) with time zone DEFAULT "now"() NOT NULL,
    "created_at" timestamp(3) with time zone DEFAULT "now"() NOT NULL
);


--
-- Name: chat_message_status_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE "public"."chat_message_status_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: chat_message_status_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE "public"."chat_message_status_id_seq" OWNED BY "public"."chat_message_status"."id";


--
-- Name: chat_messages; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE "public"."chat_messages" (
    "id" integer NOT NULL,
    "chat_id" integer NOT NULL,
    "sender_id" integer NOT NULL,
    "content" "jsonb" NOT NULL,
    "content_type" "public"."enum_chat_messages_content_type" DEFAULT 'text'::"public"."enum_chat_messages_content_type",
    "reply_to_id" integer,
    "edited_at" timestamp(3) with time zone,
    "is_deleted" boolean DEFAULT false,
    "updated_at" timestamp(3) with time zone DEFAULT "now"() NOT NULL,
    "created_at" timestamp(3) with time zone DEFAULT "now"() NOT NULL
);


--
-- Name: chat_messages_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE "public"."chat_messages_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: chat_messages_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE "public"."chat_messages_id_seq" OWNED BY "public"."chat_messages"."id";


--
-- Name: chat_messages_reactions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE "public"."chat_messages_reactions" (
    "_order" integer NOT NULL,
    "_parent_id" integer NOT NULL,
    "id" character varying NOT NULL,
    "user_id" integer NOT NULL,
    "emoji" character varying NOT NULL,
    "created_at" timestamp(3) with time zone
);


--
-- Name: chat_messages_rels; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE "public"."chat_messages_rels" (
    "id" integer NOT NULL,
    "order" integer,
    "parent_id" integer NOT NULL,
    "path" character varying NOT NULL,
    "media_id" integer
);


--
-- Name: chat_messages_rels_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE "public"."chat_messages_rels_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: chat_messages_rels_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE "public"."chat_messages_rels_id_seq" OWNED BY "public"."chat_messages_rels"."id";


--
-- Name: chat_typing_status; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE "public"."chat_typing_status" (
    "id" integer NOT NULL,
    "chat_id" integer NOT NULL,
    "user_id" integer NOT NULL,
    "is_typing" boolean DEFAULT true,
    "updated_at" timestamp(3) with time zone DEFAULT "now"() NOT NULL,
    "created_at" timestamp(3) with time zone DEFAULT "now"() NOT NULL
);


--
-- Name: chat_typing_status_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE "public"."chat_typing_status_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: chat_typing_status_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE "public"."chat_typing_status_id_seq" OWNED BY "public"."chat_typing_status"."id";


--
-- Name: chats; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE "public"."chats" (
    "id" integer NOT NULL,
    "type" "public"."enum_chats_type" DEFAULT 'direct'::"public"."enum_chats_type" NOT NULL,
    "title" character varying,
    "created_by_id" integer,
    "last_message_at" timestamp(3) with time zone,
    "last_message_preview" character varying,
    "is_archived" boolean DEFAULT false,
    "metadata" "jsonb",
    "updated_at" timestamp(3) with time zone DEFAULT "now"() NOT NULL,
    "created_at" timestamp(3) with time zone DEFAULT "now"() NOT NULL,
    "status" "public"."enum_chats_status" DEFAULT 'active'::"public"."enum_chats_status"
);


--
-- Name: chats_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE "public"."chats_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: chats_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE "public"."chats_id_seq" OWNED BY "public"."chats"."id";


--
-- Name: chats_rels; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE "public"."chats_rels" (
    "id" integer NOT NULL,
    "order" integer,
    "parent_id" integer NOT NULL,
    "path" character varying NOT NULL,
    "users_id" integer
);


--
-- Name: chats_rels_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE "public"."chats_rels_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: chats_rels_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE "public"."chats_rels_id_seq" OWNED BY "public"."chats_rels"."id";


--
-- Name: coupon_codes; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE "public"."coupon_codes" (
    "id" integer NOT NULL,
    "code" character varying NOT NULL,
    "name" character varying,
    "description" character varying,
    "status" "public"."enum_coupon_codes_status" DEFAULT 'draft'::"public"."enum_coupon_codes_status" NOT NULL,
    "starts_at" timestamp(3) with time zone,
    "expires_at" timestamp(3) with time zone,
    "discount_type" "public"."enum_coupon_codes_discount_type" DEFAULT 'percent'::"public"."enum_coupon_codes_discount_type" NOT NULL,
    "amount" numeric NOT NULL,
    "max_discount_amount" numeric,
    "scope_type" "public"."enum_coupon_codes_scope_type" DEFAULT 'all_courses'::"public"."enum_coupon_codes_scope_type" NOT NULL,
    "exclude_sale_courses" boolean DEFAULT false,
    "minimum_amount" numeric,
    "maximum_amount" numeric,
    "usage_limit_total" numeric,
    "usage_limit_per_user" numeric,
    "max_items_affected" numeric,
    "stackable" boolean DEFAULT false,
    "priority" numeric DEFAULT 100,
    "usage_count" numeric DEFAULT 0,
    "last_used_at" timestamp(3) with time zone,
    "metadata" "jsonb",
    "updated_at" timestamp(3) with time zone DEFAULT "now"() NOT NULL,
    "created_at" timestamp(3) with time zone DEFAULT "now"() NOT NULL
);


--
-- Name: coupon_codes_allowed_emails; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE "public"."coupon_codes_allowed_emails" (
    "_order" integer NOT NULL,
    "_parent_id" integer NOT NULL,
    "id" character varying NOT NULL,
    "email" character varying NOT NULL
);


--
-- Name: coupon_codes_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE "public"."coupon_codes_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: coupon_codes_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE "public"."coupon_codes_id_seq" OWNED BY "public"."coupon_codes"."id";


--
-- Name: coupon_codes_rels; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE "public"."coupon_codes_rels" (
    "id" integer NOT NULL,
    "order" integer,
    "parent_id" integer NOT NULL,
    "path" character varying NOT NULL,
    "courses_id" integer,
    "course_categories_id" integer,
    "trainees_id" integer
);


--
-- Name: coupon_codes_rels_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE "public"."coupon_codes_rels_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: coupon_codes_rels_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE "public"."coupon_codes_rels_id_seq" OWNED BY "public"."coupon_codes_rels"."id";


--
-- Name: coupon_redemptions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE "public"."coupon_redemptions" (
    "id" integer NOT NULL,
    "coupon_id" integer NOT NULL,
    "trainee_id" integer,
    "user_id" integer,
    "course_enrollment_id" integer,
    "course_id" integer,
    "context_type" "public"."enum_coupon_redemptions_context_type" DEFAULT 'checkout_commit'::"public"."enum_coupon_redemptions_context_type" NOT NULL,
    "status" "public"."enum_coupon_redemptions_status" DEFAULT 'applied'::"public"."enum_coupon_redemptions_status" NOT NULL,
    "code_snapshot" character varying NOT NULL,
    "discount_type_snapshot" character varying NOT NULL,
    "discount_amount_snapshot" numeric NOT NULL,
    "subtotal_snapshot" numeric NOT NULL,
    "final_total_snapshot" numeric NOT NULL,
    "currency_snapshot" character varying DEFAULT 'PHP'::character varying NOT NULL,
    "applied_at" timestamp(3) with time zone NOT NULL,
    "metadata" "jsonb",
    "updated_at" timestamp(3) with time zone DEFAULT "now"() NOT NULL,
    "created_at" timestamp(3) with time zone DEFAULT "now"() NOT NULL
);


--
-- Name: coupon_redemptions_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE "public"."coupon_redemptions_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: coupon_redemptions_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE "public"."coupon_redemptions_id_seq" OWNED BY "public"."coupon_redemptions"."id";


--
-- Name: course_categories; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE "public"."course_categories" (
    "id" integer NOT NULL,
    "name" character varying NOT NULL,
    "slug" character varying NOT NULL,
    "description" character varying,
    "parent_id" integer,
    "category_type" "public"."enum_course_categories_category_type" DEFAULT 'course'::"public"."enum_course_categories_category_type" NOT NULL,
    "icon_id" integer,
    "color_code" character varying,
    "display_order" numeric DEFAULT 0,
    "is_active" boolean DEFAULT true,
    "metadata" "jsonb",
    "updated_at" timestamp(3) with time zone DEFAULT "now"() NOT NULL,
    "created_at" timestamp(3) with time zone DEFAULT "now"() NOT NULL
);


--
-- Name: course_categories_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE "public"."course_categories_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: course_categories_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE "public"."course_categories_id_seq" OWNED BY "public"."course_categories"."id";


--
-- Name: course_enrollments; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE "public"."course_enrollments" (
    "id" integer NOT NULL,
    "student_id" integer NOT NULL,
    "course_id" integer NOT NULL,
    "enrolled_at" timestamp(3) with time zone,
    "enrollment_type" "public"."enum_course_enrollments_enrollment_type" DEFAULT 'free'::"public"."enum_course_enrollments_enrollment_type" NOT NULL,
    "status" "public"."enum_course_enrollments_status" DEFAULT 'active'::"public"."enum_course_enrollments_status" NOT NULL,
    "payment_status" "public"."enum_course_enrollments_payment_status" DEFAULT 'completed'::"public"."enum_course_enrollments_payment_status",
    "access_expires_at" timestamp(3) with time zone,
    "amount_paid" numeric,
    "progress_percentage" numeric DEFAULT 0,
    "last_accessed_at" timestamp(3) with time zone,
    "completed_at" timestamp(3) with time zone,
    "current_grade" numeric,
    "final_grade" numeric,
    "certificate_issued" boolean DEFAULT false,
    "enrolled_by_id" integer,
    "notes" character varying,
    "display_title" character varying,
    "metadata" "jsonb",
    "updated_at" timestamp(3) with time zone DEFAULT "now"() NOT NULL,
    "created_at" timestamp(3) with time zone DEFAULT "now"() NOT NULL,
    "final_evaluation" "public"."enum_course_enrollments_final_evaluation",
    "coupon_id" integer,
    "coupon_code" character varying,
    "coupon_discount_amount" numeric DEFAULT 0,
    "list_price_snapshot" numeric,
    "final_price_snapshot" numeric,
    "pricing_breakdown" "jsonb"
);


--
-- Name: course_enrollments_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE "public"."course_enrollments_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: course_enrollments_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE "public"."course_enrollments_id_seq" OWNED BY "public"."course_enrollments"."id";


--
-- Name: course_item_progress; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE "public"."course_item_progress" (
    "id" integer NOT NULL,
    "trainee_id" integer NOT NULL,
    "course_id" integer NOT NULL,
    "enrollment_id" integer NOT NULL,
    "status" "public"."enum_course_item_progress_status" DEFAULT 'not_started'::"public"."enum_course_item_progress_status" NOT NULL,
    "is_completed" boolean DEFAULT false,
    "progress_percentage" numeric DEFAULT 0,
    "started_at" timestamp(3) with time zone,
    "completed_at" timestamp(3) with time zone,
    "last_accessed_at" timestamp(3) with time zone,
    "duration_seconds" numeric DEFAULT 0,
    "score" numeric,
    "grade" numeric,
    "attempts" numeric DEFAULT 0,
    "quiz_data" "jsonb",
    "updated_at" timestamp(3) with time zone DEFAULT "now"() NOT NULL,
    "created_at" timestamp(3) with time zone DEFAULT "now"() NOT NULL
);


--
-- Name: course_item_progress_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE "public"."course_item_progress_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: course_item_progress_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE "public"."course_item_progress_id_seq" OWNED BY "public"."course_item_progress"."id";


--
-- Name: course_item_progress_rels; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE "public"."course_item_progress_rels" (
    "id" integer NOT NULL,
    "order" integer,
    "parent_id" integer NOT NULL,
    "path" character varying NOT NULL,
    "course_lessons_id" integer,
    "assessments_id" integer,
    "assignments_id" integer
);


--
-- Name: course_item_progress_rels_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE "public"."course_item_progress_rels_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: course_item_progress_rels_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE "public"."course_item_progress_rels_id_seq" OWNED BY "public"."course_item_progress_rels"."id";


--
-- Name: course_lessons; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE "public"."course_lessons" (
    "id" integer NOT NULL,
    "title" character varying NOT NULL,
    "module_id" integer NOT NULL,
    "estimated_duration" numeric,
    "updated_at" timestamp(3) with time zone DEFAULT "now"() NOT NULL,
    "created_at" timestamp(3) with time zone DEFAULT "now"() NOT NULL,
    "description" "jsonb"
);


--
-- Name: course_lessons_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE "public"."course_lessons_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: course_lessons_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE "public"."course_lessons_id_seq" OWNED BY "public"."course_lessons"."id";


--
-- Name: course_materials; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE "public"."course_materials" (
    "id" integer NOT NULL,
    "course_id" integer NOT NULL,
    "material_id" integer NOT NULL,
    "order" numeric DEFAULT 1,
    "is_required" boolean DEFAULT false,
    "updated_at" timestamp(3) with time zone DEFAULT "now"() NOT NULL,
    "created_at" timestamp(3) with time zone DEFAULT "now"() NOT NULL
);


--
-- Name: course_materials_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE "public"."course_materials_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: course_materials_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE "public"."course_materials_id_seq" OWNED BY "public"."course_materials"."id";


--
-- Name: course_modules; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE "public"."course_modules" (
    "id" integer NOT NULL,
    "title" character varying NOT NULL,
    "release_at" timestamp(3) with time zone,
    "updated_at" timestamp(3) with time zone DEFAULT "now"() NOT NULL,
    "created_at" timestamp(3) with time zone DEFAULT "now"() NOT NULL,
    "description" "jsonb"
);


--
-- Name: course_modules_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE "public"."course_modules_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: course_modules_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE "public"."course_modules_id_seq" OWNED BY "public"."course_modules"."id";


--
-- Name: course_modules_rels; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE "public"."course_modules_rels" (
    "id" integer NOT NULL,
    "order" integer,
    "parent_id" integer NOT NULL,
    "path" character varying NOT NULL,
    "course_lessons_id" integer,
    "assessments_id" integer,
    "assignments_id" integer
);


--
-- Name: course_modules_rels_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE "public"."course_modules_rels_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: course_modules_rels_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE "public"."course_modules_rels_id_seq" OWNED BY "public"."course_modules_rels"."id";


--
-- Name: courses; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE "public"."courses" (
    "id" integer NOT NULL,
    "title" character varying NOT NULL,
    "course_code" character varying NOT NULL,
    "excerpt" character varying,
    "description" "jsonb",
    "instructor_id" integer NOT NULL,
    "thumbnail_id" integer,
    "banner_image_id" integer,
    "price" numeric DEFAULT 0,
    "max_students" numeric,
    "enrollment_start_date" timestamp(3) with time zone,
    "enrollment_end_date" timestamp(3) with time zone,
    "course_start_date" timestamp(3) with time zone,
    "course_end_date" timestamp(3) with time zone,
    "estimated_duration" numeric,
    "difficulty_level" "public"."enum_courses_difficulty_level" DEFAULT 'standard'::"public"."enum_courses_difficulty_level",
    "language" "public"."enum_courses_language" DEFAULT 'en'::"public"."enum_courses_language",
    "passing_grade" numeric DEFAULT 70,
    "status" "public"."enum_courses_status" DEFAULT 'draft'::"public"."enum_courses_status" NOT NULL,
    "published_at" timestamp(3) with time zone,
    "settings" "jsonb",
    "updated_at" timestamp(3) with time zone DEFAULT "now"() NOT NULL,
    "created_at" timestamp(3) with time zone DEFAULT "now"() NOT NULL,
    "discounted_price" numeric,
    "is_featured" boolean DEFAULT false,
    "description_blocks" "jsonb",
    "estimated_duration_unit" "public"."enum_courses_estimated_duration_unit" DEFAULT 'hours'::"public"."enum_courses_estimated_duration_unit",
    "evaluation_mode" "public"."enum_courses_evaluation_mode" DEFAULT 'lessons_exam'::"public"."enum_courses_evaluation_mode",
    "certificate_template_id" integer,
    "feedback_form_id" integer,
    "is_feedback_required" boolean DEFAULT false
);


--
-- Name: courses_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE "public"."courses_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: courses_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE "public"."courses_id_seq" OWNED BY "public"."courses"."id";


--
-- Name: courses_learning_objectives; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE "public"."courses_learning_objectives" (
    "_order" integer NOT NULL,
    "_parent_id" integer NOT NULL,
    "id" character varying NOT NULL,
    "objective" character varying NOT NULL
);


--
-- Name: courses_prerequisites; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE "public"."courses_prerequisites" (
    "_order" integer NOT NULL,
    "_parent_id" integer NOT NULL,
    "id" character varying NOT NULL,
    "prerequisite" character varying NOT NULL
);


--
-- Name: courses_rels; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE "public"."courses_rels" (
    "id" integer NOT NULL,
    "order" integer,
    "parent_id" integer NOT NULL,
    "path" character varying NOT NULL,
    "instructors_id" integer,
    "course_categories_id" integer,
    "course_modules_id" integer
);


--
-- Name: courses_rels_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE "public"."courses_rels_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: courses_rels_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE "public"."courses_rels_id_seq" OWNED BY "public"."courses_rels"."id";


--
-- Name: emergency_contacts; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE "public"."emergency_contacts" (
    "id" integer NOT NULL,
    "user_id" integer NOT NULL,
    "first_name" character varying NOT NULL,
    "middle_name" character varying,
    "last_name" character varying NOT NULL,
    "contact_number" character varying NOT NULL,
    "relationship" "public"."enum_emergency_contacts_relationship" NOT NULL,
    "complete_address" character varying NOT NULL,
    "is_primary" boolean DEFAULT false,
    "updated_at" timestamp(3) with time zone DEFAULT "now"() NOT NULL,
    "created_at" timestamp(3) with time zone DEFAULT "now"() NOT NULL
);


--
-- Name: emergency_contacts_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE "public"."emergency_contacts_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: emergency_contacts_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE "public"."emergency_contacts_id_seq" OWNED BY "public"."emergency_contacts"."id";


--
-- Name: feedback_forms; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE "public"."feedback_forms" (
    "id" integer NOT NULL,
    "title" character varying NOT NULL,
    "description" character varying,
    "updated_at" timestamp(3) with time zone DEFAULT "now"() NOT NULL,
    "created_at" timestamp(3) with time zone DEFAULT "now"() NOT NULL
);


--
-- Name: feedback_forms_blocks_choice_input; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE "public"."feedback_forms_blocks_choice_input" (
    "_order" integer NOT NULL,
    "_parent_id" integer NOT NULL,
    "_path" "text" NOT NULL,
    "id" character varying NOT NULL,
    "name" character varying NOT NULL,
    "label" character varying NOT NULL,
    "ui_type" "public"."enum_feedback_forms_blocks_choice_input_ui_type" DEFAULT 'radio'::"public"."enum_feedback_forms_blocks_choice_input_ui_type" NOT NULL,
    "is_required" boolean DEFAULT false,
    "block_name" character varying
);


--
-- Name: feedback_forms_blocks_choice_input_options; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE "public"."feedback_forms_blocks_choice_input_options" (
    "_order" integer NOT NULL,
    "_parent_id" character varying NOT NULL,
    "id" character varying NOT NULL,
    "label" character varying NOT NULL,
    "value" character varying NOT NULL
);


--
-- Name: feedback_forms_blocks_survey_matrix; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE "public"."feedback_forms_blocks_survey_matrix" (
    "_order" integer NOT NULL,
    "_parent_id" integer NOT NULL,
    "_path" "text" NOT NULL,
    "id" character varying NOT NULL,
    "name" character varying NOT NULL,
    "question" character varying NOT NULL,
    "is_required" boolean DEFAULT false,
    "block_name" character varying
);


--
-- Name: feedback_forms_blocks_survey_matrix_columns; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE "public"."feedback_forms_blocks_survey_matrix_columns" (
    "_order" integer NOT NULL,
    "_parent_id" character varying NOT NULL,
    "id" character varying NOT NULL,
    "label" character varying NOT NULL,
    "value" character varying NOT NULL
);


--
-- Name: feedback_forms_blocks_survey_matrix_rows; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE "public"."feedback_forms_blocks_survey_matrix_rows" (
    "_order" integer NOT NULL,
    "_parent_id" character varying NOT NULL,
    "id" character varying NOT NULL,
    "statement" character varying NOT NULL,
    "value" character varying NOT NULL
);


--
-- Name: feedback_forms_blocks_text_input; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE "public"."feedback_forms_blocks_text_input" (
    "_order" integer NOT NULL,
    "_parent_id" integer NOT NULL,
    "_path" "text" NOT NULL,
    "id" character varying NOT NULL,
    "name" character varying NOT NULL,
    "label" character varying NOT NULL,
    "placeholder" character varying,
    "format" "public"."enum_feedback_forms_blocks_text_input_format" DEFAULT 'text'::"public"."enum_feedback_forms_blocks_text_input_format",
    "is_required" boolean DEFAULT false,
    "block_name" character varying
);


--
-- Name: feedback_forms_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE "public"."feedback_forms_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: feedback_forms_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE "public"."feedback_forms_id_seq" OWNED BY "public"."feedback_forms"."id";


--
-- Name: feedback_submissions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE "public"."feedback_submissions" (
    "id" integer NOT NULL,
    "form_id" integer NOT NULL,
    "course_id" integer NOT NULL,
    "trainee_id" integer NOT NULL,
    "responses" "jsonb" NOT NULL,
    "updated_at" timestamp(3) with time zone DEFAULT "now"() NOT NULL,
    "created_at" timestamp(3) with time zone DEFAULT "now"() NOT NULL
);


--
-- Name: feedback_submissions_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE "public"."feedback_submissions_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: feedback_submissions_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE "public"."feedback_submissions_id_seq" OWNED BY "public"."feedback_submissions"."id";


--
-- Name: instructors; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE "public"."instructors" (
    "id" integer NOT NULL,
    "user_id" integer NOT NULL,
    "specialization" character varying NOT NULL,
    "years_experience" numeric,
    "certifications" "jsonb",
    "office_hours" character varying,
    "contact_email" character varying,
    "updated_at" timestamp(3) with time zone DEFAULT "now"() NOT NULL,
    "created_at" timestamp(3) with time zone DEFAULT "now"() NOT NULL,
    "teaching_permissions" "jsonb"
);


--
-- Name: instructors_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE "public"."instructors_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: instructors_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE "public"."instructors_id_seq" OWNED BY "public"."instructors"."id";


--
-- Name: lesson_materials; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE "public"."lesson_materials" (
    "id" integer NOT NULL,
    "lesson_id" integer NOT NULL,
    "material_id" integer NOT NULL,
    "order" numeric DEFAULT 1,
    "is_required" boolean DEFAULT false,
    "updated_at" timestamp(3) with time zone DEFAULT "now"() NOT NULL,
    "created_at" timestamp(3) with time zone DEFAULT "now"() NOT NULL
);


--
-- Name: lesson_materials_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE "public"."lesson_materials_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: lesson_materials_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE "public"."lesson_materials_id_seq" OWNED BY "public"."lesson_materials"."id";


--
-- Name: materials; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE "public"."materials" (
    "id" integer NOT NULL,
    "title" character varying NOT NULL,
    "description" character varying,
    "material_source" "public"."enum_materials_material_source" DEFAULT 'media'::"public"."enum_materials_material_source" NOT NULL,
    "external_url" character varying,
    "metadata" "jsonb",
    "updated_at" timestamp(3) with time zone DEFAULT "now"() NOT NULL,
    "created_at" timestamp(3) with time zone DEFAULT "now"() NOT NULL
);


--
-- Name: materials_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE "public"."materials_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: materials_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE "public"."materials_id_seq" OWNED BY "public"."materials"."id";


--
-- Name: materials_rels; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE "public"."materials_rels" (
    "id" integer NOT NULL,
    "order" integer,
    "parent_id" integer NOT NULL,
    "path" character varying NOT NULL,
    "media_id" integer
);


--
-- Name: materials_rels_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE "public"."materials_rels_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: materials_rels_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE "public"."materials_rels_id_seq" OWNED BY "public"."materials_rels"."id";


--
-- Name: media; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE "public"."media" (
    "id" integer NOT NULL,
    "alt" character varying,
    "updated_at" timestamp(3) with time zone DEFAULT "now"() NOT NULL,
    "created_at" timestamp(3) with time zone DEFAULT "now"() NOT NULL,
    "url" character varying,
    "thumbnail_u_r_l" character varying,
    "filename" character varying,
    "mime_type" character varying,
    "filesize" numeric,
    "width" numeric,
    "height" numeric,
    "focal_x" numeric,
    "focal_y" numeric,
    "cloudinary_public_id" character varying,
    "cloudinary_u_r_l" character varying
);


--
-- Name: media_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE "public"."media_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: media_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE "public"."media_id_seq" OWNED BY "public"."media"."id";


--
-- Name: notification_templates; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE "public"."notification_templates" (
    "id" integer NOT NULL,
    "name" character varying NOT NULL,
    "code" character varying NOT NULL,
    "category" "public"."enum_notification_templates_category" DEFAULT 'learning'::"public"."enum_notification_templates_category" NOT NULL,
    "title_template" character varying NOT NULL,
    "body_template" character varying,
    "default_link" character varying,
    "automatic" boolean DEFAULT false,
    "manual" boolean DEFAULT true,
    "metadata_schema" "jsonb",
    "updated_at" timestamp(3) with time zone DEFAULT "now"() NOT NULL,
    "created_at" timestamp(3) with time zone DEFAULT "now"() NOT NULL
);


--
-- Name: notification_templates_channels; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE "public"."notification_templates_channels" (
    "order" integer NOT NULL,
    "parent_id" integer NOT NULL,
    "value" "public"."enum_notification_templates_channels",
    "id" integer NOT NULL
);


--
-- Name: notification_templates_channels_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE "public"."notification_templates_channels_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: notification_templates_channels_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE "public"."notification_templates_channels_id_seq" OWNED BY "public"."notification_templates_channels"."id";


--
-- Name: notification_templates_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE "public"."notification_templates_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: notification_templates_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE "public"."notification_templates_id_seq" OWNED BY "public"."notification_templates"."id";


--
-- Name: notifications; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE "public"."notifications" (
    "id" integer NOT NULL,
    "template_id" integer,
    "category" "public"."enum_notifications_category" NOT NULL,
    "title" character varying NOT NULL,
    "body" character varying,
    "metadata" "jsonb",
    "source_type" character varying,
    "source_id" character varying,
    "actor_id" integer,
    "origin" "public"."enum_notifications_origin" DEFAULT 'automatic'::"public"."enum_notifications_origin" NOT NULL,
    "audience_type" "public"."enum_notifications_audience_type" NOT NULL,
    "audience_role" "public"."enum_notifications_audience_role",
    "segment_definition" "jsonb",
    "scheduled_at" timestamp(3) with time zone,
    "expires_at" timestamp(3) with time zone,
    "status" "public"."enum_notifications_status" DEFAULT 'draft'::"public"."enum_notifications_status" NOT NULL,
    "updated_at" timestamp(3) with time zone DEFAULT "now"() NOT NULL,
    "created_at" timestamp(3) with time zone DEFAULT "now"() NOT NULL
);


--
-- Name: notifications_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE "public"."notifications_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: notifications_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE "public"."notifications_id_seq" OWNED BY "public"."notifications"."id";


--
-- Name: notifications_rels; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE "public"."notifications_rels" (
    "id" integer NOT NULL,
    "order" integer,
    "parent_id" integer NOT NULL,
    "path" character varying NOT NULL,
    "users_id" integer
);


--
-- Name: notifications_rels_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE "public"."notifications_rels_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: notifications_rels_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE "public"."notifications_rels_id_seq" OWNED BY "public"."notifications_rels"."id";


--
-- Name: payload_kv; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE "public"."payload_kv" (
    "id" integer NOT NULL,
    "key" character varying NOT NULL,
    "data" "jsonb" NOT NULL
);


--
-- Name: payload_kv_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE "public"."payload_kv_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: payload_kv_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE "public"."payload_kv_id_seq" OWNED BY "public"."payload_kv"."id";


--
-- Name: payload_locked_documents; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE "public"."payload_locked_documents" (
    "id" integer NOT NULL,
    "global_slug" character varying,
    "updated_at" timestamp(3) with time zone DEFAULT "now"() NOT NULL,
    "created_at" timestamp(3) with time zone DEFAULT "now"() NOT NULL
);


--
-- Name: payload_locked_documents_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE "public"."payload_locked_documents_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: payload_locked_documents_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE "public"."payload_locked_documents_id_seq" OWNED BY "public"."payload_locked_documents"."id";


--
-- Name: payload_locked_documents_rels; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE "public"."payload_locked_documents_rels" (
    "id" integer NOT NULL,
    "order" integer,
    "parent_id" integer NOT NULL,
    "path" character varying NOT NULL,
    "users_id" integer,
    "media_id" integer,
    "posts_id" integer,
    "instructors_id" integer,
    "trainees_id" integer,
    "admins_id" integer,
    "user_events_id" integer,
    "emergency_contacts_id" integer,
    "post_categories_id" integer,
    "course_modules_id" integer,
    "course_lessons_id" integer,
    "materials_id" integer,
    "course_materials_id" integer,
    "lesson_materials_id" integer,
    "announcements_id" integer,
    "questions_id" integer,
    "assessments_id" integer,
    "course_item_progress_id" integer,
    "certificates_id" integer,
    "certificate_templates_id" integer,
    "chats_id" integer,
    "chat_messages_id" integer,
    "chat_message_status_id" integer,
    "chat_typing_status_id" integer,
    "courses_id" integer,
    "course_categories_id" integer,
    "course_enrollments_id" integer,
    "wishlists_id" integer,
    "recently_viewed_courses_id" integer,
    "assessment_submissions_id" integer,
    "submission_answers_id" integer,
    "notification_templates_id" integer,
    "notifications_id" integer,
    "user_notifications_id" integer,
    "support_tickets_id" integer,
    "support_ticket_messages_id" integer,
    "assignments_id" integer,
    "assignment_submissions_id" integer,
    "feedback_forms_id" integer,
    "feedback_submissions_id" integer,
    "web_push_subscriptions_id" integer,
    "coupon_codes_id" integer,
    "coupon_redemptions_id" integer
);


--
-- Name: payload_locked_documents_rels_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE "public"."payload_locked_documents_rels_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: payload_locked_documents_rels_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE "public"."payload_locked_documents_rels_id_seq" OWNED BY "public"."payload_locked_documents_rels"."id";


--
-- Name: payload_migrations; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE "public"."payload_migrations" (
    "id" integer NOT NULL,
    "name" character varying,
    "batch" numeric,
    "updated_at" timestamp(3) with time zone DEFAULT "now"() NOT NULL,
    "created_at" timestamp(3) with time zone DEFAULT "now"() NOT NULL
);


--
-- Name: payload_migrations_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE "public"."payload_migrations_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: payload_migrations_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE "public"."payload_migrations_id_seq" OWNED BY "public"."payload_migrations"."id";


--
-- Name: payload_preferences; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE "public"."payload_preferences" (
    "id" integer NOT NULL,
    "key" character varying,
    "value" "jsonb",
    "updated_at" timestamp(3) with time zone DEFAULT "now"() NOT NULL,
    "created_at" timestamp(3) with time zone DEFAULT "now"() NOT NULL
);


--
-- Name: payload_preferences_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE "public"."payload_preferences_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: payload_preferences_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE "public"."payload_preferences_id_seq" OWNED BY "public"."payload_preferences"."id";


--
-- Name: payload_preferences_rels; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE "public"."payload_preferences_rels" (
    "id" integer NOT NULL,
    "order" integer,
    "parent_id" integer NOT NULL,
    "path" character varying NOT NULL,
    "users_id" integer
);


--
-- Name: payload_preferences_rels_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE "public"."payload_preferences_rels_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: payload_preferences_rels_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE "public"."payload_preferences_rels_id_seq" OWNED BY "public"."payload_preferences_rels"."id";


--
-- Name: post_categories; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE "public"."post_categories" (
    "id" integer NOT NULL,
    "name" character varying NOT NULL,
    "slug" character varying NOT NULL,
    "description" character varying,
    "icon_id" integer,
    "color_code" character varying,
    "display_order" numeric DEFAULT 0,
    "is_active" boolean DEFAULT true,
    "metadata" "jsonb",
    "updated_at" timestamp(3) with time zone DEFAULT "now"() NOT NULL,
    "created_at" timestamp(3) with time zone DEFAULT "now"() NOT NULL
);


--
-- Name: post_categories_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE "public"."post_categories_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: post_categories_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE "public"."post_categories_id_seq" OWNED BY "public"."post_categories"."id";


--
-- Name: posts; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE "public"."posts" (
    "id" integer NOT NULL,
    "title" character varying,
    "slug" character varying,
    "content" "jsonb",
    "excerpt" character varying,
    "featured_image_id" integer,
    "status" "public"."enum_posts_status" DEFAULT 'draft'::"public"."enum_posts_status",
    "published_at" timestamp(3) with time zone,
    "author_id" integer,
    "seo_title" character varying,
    "seo_description" character varying,
    "seo_focus_keyword" character varying,
    "updated_at" timestamp(3) with time zone DEFAULT "now"() NOT NULL,
    "created_at" timestamp(3) with time zone DEFAULT "now"() NOT NULL,
    "_status" "public"."enum_posts_status" DEFAULT 'draft'::"public"."enum_posts_status",
    "is_featured" boolean DEFAULT false
);


--
-- Name: posts_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE "public"."posts_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: posts_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE "public"."posts_id_seq" OWNED BY "public"."posts"."id";


--
-- Name: posts_rels; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE "public"."posts_rels" (
    "id" integer NOT NULL,
    "order" integer,
    "parent_id" integer NOT NULL,
    "path" character varying NOT NULL,
    "post_categories_id" integer
);


--
-- Name: posts_rels_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE "public"."posts_rels_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: posts_rels_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE "public"."posts_rels_id_seq" OWNED BY "public"."posts_rels"."id";


--
-- Name: posts_tags; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE "public"."posts_tags" (
    "_order" integer NOT NULL,
    "_parent_id" integer NOT NULL,
    "id" character varying NOT NULL,
    "tag" character varying
);


--
-- Name: questions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE "public"."questions" (
    "id" integer NOT NULL,
    "prompt" character varying NOT NULL,
    "type" "public"."enum_questions_type" DEFAULT 'single_choice'::"public"."enum_questions_type" NOT NULL,
    "explanation" character varying,
    "difficulty" "public"."enum_questions_difficulty" DEFAULT 'medium'::"public"."enum_questions_difficulty" NOT NULL,
    "status" "public"."enum_questions_status" DEFAULT 'active'::"public"."enum_questions_status" NOT NULL,
    "updated_at" timestamp(3) with time zone DEFAULT "now"() NOT NULL,
    "created_at" timestamp(3) with time zone DEFAULT "now"() NOT NULL,
    "true_false_correct" "public"."enum_questions_true_false_correct"
);


--
-- Name: questions_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE "public"."questions_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: questions_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE "public"."questions_id_seq" OWNED BY "public"."questions"."id";


--
-- Name: questions_options; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE "public"."questions_options" (
    "_order" integer NOT NULL,
    "_parent_id" integer NOT NULL,
    "id" character varying NOT NULL,
    "label" character varying,
    "is_correct" boolean DEFAULT false
);


--
-- Name: questions_texts; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE "public"."questions_texts" (
    "id" integer NOT NULL,
    "order" integer NOT NULL,
    "parent_id" integer NOT NULL,
    "path" character varying NOT NULL,
    "text" character varying
);


--
-- Name: questions_texts_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE "public"."questions_texts_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: questions_texts_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE "public"."questions_texts_id_seq" OWNED BY "public"."questions_texts"."id";


--
-- Name: recent_searches; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE "public"."recent_searches" (
    "id" integer NOT NULL,
    "user_id" integer NOT NULL,
    "query" character varying NOT NULL,
    "normalized_query" character varying NOT NULL,
    "scope" character varying DEFAULT 'courses'::character varying NOT NULL,
    "composite_key" character varying,
    "frequency" numeric DEFAULT 1 NOT NULL,
    "source" character varying DEFAULT 'unknown'::character varying,
    "device_id" character varying,
    "updated_at" timestamp(3) with time zone DEFAULT "now"() NOT NULL,
    "created_at" timestamp(3) with time zone DEFAULT "now"() NOT NULL
);


--
-- Name: recent_searches_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE "public"."recent_searches_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: recent_searches_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE "public"."recent_searches_id_seq" OWNED BY "public"."recent_searches"."id";


--
-- Name: recently_viewed_courses; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE "public"."recently_viewed_courses" (
    "id" integer NOT NULL,
    "user_id" integer NOT NULL,
    "course_id" integer NOT NULL,
    "viewed_at" timestamp(3) with time zone,
    "view_count" numeric DEFAULT 1,
    "composite_key" character varying,
    "updated_at" timestamp(3) with time zone DEFAULT "now"() NOT NULL,
    "created_at" timestamp(3) with time zone DEFAULT "now"() NOT NULL
);


--
-- Name: recently_viewed_courses_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE "public"."recently_viewed_courses_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: recently_viewed_courses_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE "public"."recently_viewed_courses_id_seq" OWNED BY "public"."recently_viewed_courses"."id";


--
-- Name: site_settings; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE "public"."site_settings" (
    "id" integer NOT NULL,
    "site_name" character varying DEFAULT 'Grandline Maritime'::character varying NOT NULL,
    "description" character varying,
    "logo_id" integer,
    "favicon_id" integer,
    "email" character varying,
    "phone" character varying,
    "address" character varying,
    "updated_at" timestamp(3) with time zone,
    "created_at" timestamp(3) with time zone
);


--
-- Name: site_settings_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE "public"."site_settings_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: site_settings_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE "public"."site_settings_id_seq" OWNED BY "public"."site_settings"."id";


--
-- Name: site_settings_social_links; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE "public"."site_settings_social_links" (
    "_order" integer NOT NULL,
    "_parent_id" integer NOT NULL,
    "id" character varying NOT NULL,
    "platform" "public"."enum_site_settings_social_links_platform" NOT NULL,
    "url" character varying NOT NULL
);


--
-- Name: submission_answers; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE "public"."submission_answers" (
    "id" integer NOT NULL,
    "submission_id" integer NOT NULL,
    "question_id" integer NOT NULL,
    "question_type" "public"."enum_submission_answers_question_type" NOT NULL,
    "response" "jsonb" NOT NULL,
    "is_correct" boolean DEFAULT false,
    "points_earned" numeric DEFAULT 0,
    "feedback" character varying,
    "updated_at" timestamp(3) with time zone DEFAULT "now"() NOT NULL,
    "created_at" timestamp(3) with time zone DEFAULT "now"() NOT NULL,
    "is_feedback_read" boolean DEFAULT false
);


--
-- Name: submission_answers_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE "public"."submission_answers_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: submission_answers_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE "public"."submission_answers_id_seq" OWNED BY "public"."submission_answers"."id";


--
-- Name: support_ticket_messages; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE "public"."support_ticket_messages" (
    "id" integer NOT NULL,
    "ticket_id" integer NOT NULL,
    "sender_id" integer NOT NULL,
    "message" "jsonb" NOT NULL,
    "is_internal" boolean DEFAULT false,
    "updated_at" timestamp(3) with time zone DEFAULT "now"() NOT NULL,
    "created_at" timestamp(3) with time zone DEFAULT "now"() NOT NULL
);


--
-- Name: support_ticket_messages_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE "public"."support_ticket_messages_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: support_ticket_messages_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE "public"."support_ticket_messages_id_seq" OWNED BY "public"."support_ticket_messages"."id";


--
-- Name: support_ticket_messages_rels; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE "public"."support_ticket_messages_rels" (
    "id" integer NOT NULL,
    "order" integer,
    "parent_id" integer NOT NULL,
    "path" character varying NOT NULL,
    "media_id" integer
);


--
-- Name: support_ticket_messages_rels_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE "public"."support_ticket_messages_rels_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: support_ticket_messages_rels_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE "public"."support_ticket_messages_rels_id_seq" OWNED BY "public"."support_ticket_messages_rels"."id";


--
-- Name: support_tickets; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE "public"."support_tickets" (
    "id" integer NOT NULL,
    "subject" character varying NOT NULL,
    "status" "public"."enum_support_tickets_status" DEFAULT 'open'::"public"."enum_support_tickets_status" NOT NULL,
    "priority" "public"."enum_support_tickets_priority" DEFAULT 'medium'::"public"."enum_support_tickets_priority" NOT NULL,
    "category" "public"."enum_support_tickets_category" NOT NULL,
    "user_id" integer NOT NULL,
    "assigned_to_id" integer,
    "last_message_at" timestamp(3) with time zone,
    "updated_at" timestamp(3) with time zone DEFAULT "now"() NOT NULL,
    "created_at" timestamp(3) with time zone DEFAULT "now"() NOT NULL
);


--
-- Name: support_tickets_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE "public"."support_tickets_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: support_tickets_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE "public"."support_tickets_id_seq" OWNED BY "public"."support_tickets"."id";


--
-- Name: support_tickets_rels; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE "public"."support_tickets_rels" (
    "id" integer NOT NULL,
    "order" integer,
    "parent_id" integer NOT NULL,
    "path" character varying NOT NULL,
    "media_id" integer
);


--
-- Name: support_tickets_rels_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE "public"."support_tickets_rels_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: support_tickets_rels_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE "public"."support_tickets_rels_id_seq" OWNED BY "public"."support_tickets_rels"."id";


--
-- Name: trainees; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE "public"."trainees" (
    "id" integer NOT NULL,
    "user_id" integer NOT NULL,
    "updated_at" timestamp(3) with time zone DEFAULT "now"() NOT NULL,
    "created_at" timestamp(3) with time zone DEFAULT "now"() NOT NULL,
    "enrollment_date" timestamp(3) with time zone,
    "current_level" "public"."enum_trainees_current_level" DEFAULT 'standard'::"public"."enum_trainees_current_level",
    "srn" character varying NOT NULL,
    "coupon_code" character varying
);


--
-- Name: trainees_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE "public"."trainees_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: trainees_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE "public"."trainees_id_seq" OWNED BY "public"."trainees"."id";


--
-- Name: user_events; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE "public"."user_events" (
    "id" integer NOT NULL,
    "user_id" integer NOT NULL,
    "event_type" "public"."enum_user_events_event_type" NOT NULL,
    "event_data" "jsonb" NOT NULL,
    "triggered_by_id" integer,
    "timestamp" timestamp(3) with time zone,
    "ip_address" character varying,
    "user_agent" character varying,
    "updated_at" timestamp(3) with time zone DEFAULT "now"() NOT NULL,
    "created_at" timestamp(3) with time zone DEFAULT "now"() NOT NULL
);


--
-- Name: user_events_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE "public"."user_events_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: user_events_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE "public"."user_events_id_seq" OWNED BY "public"."user_events"."id";


--
-- Name: user_notifications; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE "public"."user_notifications" (
    "id" integer NOT NULL,
    "user_id" integer NOT NULL,
    "notification_id" integer NOT NULL,
    "category" "public"."enum_user_notifications_category" NOT NULL,
    "title" character varying NOT NULL,
    "body" character varying,
    "link" character varying,
    "metadata" "jsonb",
    "read_at" timestamp(3) with time zone,
    "seen_at" timestamp(3) with time zone,
    "delivered_at" timestamp(3) with time zone,
    "channel" "public"."enum_user_notifications_channel" DEFAULT 'in-app'::"public"."enum_user_notifications_channel" NOT NULL,
    "archived" boolean DEFAULT false,
    "updated_at" timestamp(3) with time zone DEFAULT "now"() NOT NULL,
    "created_at" timestamp(3) with time zone DEFAULT "now"() NOT NULL
);


--
-- Name: user_notifications_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE "public"."user_notifications_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: user_notifications_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE "public"."user_notifications_id_seq" OWNED BY "public"."user_notifications"."id";


--
-- Name: users; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE "public"."users" (
    "id" integer NOT NULL,
    "first_name" character varying NOT NULL,
    "last_name" character varying NOT NULL,
    "role" "public"."enum_users_role" DEFAULT 'trainee'::"public"."enum_users_role" NOT NULL,
    "is_active" boolean DEFAULT true,
    "last_login" timestamp(3) with time zone,
    "updated_at" timestamp(3) with time zone DEFAULT "now"() NOT NULL,
    "created_at" timestamp(3) with time zone DEFAULT "now"() NOT NULL,
    "email" character varying NOT NULL,
    "reset_password_token" character varying,
    "reset_password_expiration" timestamp(3) with time zone,
    "salt" character varying,
    "hash" character varying,
    "login_attempts" numeric DEFAULT 0,
    "lock_until" timestamp(3) with time zone,
    "middle_name" character varying,
    "name_extension" character varying,
    "username" character varying,
    "nationality" character varying,
    "birth_date" timestamp(3) with time zone,
    "place_of_birth" character varying,
    "complete_address" character varying,
    "gender" "public"."enum_users_gender",
    "civil_status" "public"."enum_users_civil_status",
    "profile_picture_id" integer,
    "biography" "jsonb",
    "enable_a_p_i_key" boolean,
    "api_key" character varying,
    "api_key_index" character varying,
    "phone" character varying,
    "push_notifications_enabled" boolean DEFAULT true,
    "security_alerts_email_enabled" boolean DEFAULT true
);


--
-- Name: users_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE "public"."users_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: users_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE "public"."users_id_seq" OWNED BY "public"."users"."id";


--
-- Name: users_reset_password_tokens; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE "public"."users_reset_password_tokens" (
    "_order" integer NOT NULL,
    "_parent_id" integer NOT NULL,
    "id" character varying NOT NULL,
    "token" character varying NOT NULL,
    "expires_at" timestamp(3) with time zone NOT NULL
);


--
-- Name: users_sessions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE "public"."users_sessions" (
    "_order" integer NOT NULL,
    "_parent_id" integer NOT NULL,
    "id" character varying NOT NULL,
    "created_at" timestamp(3) with time zone,
    "expires_at" timestamp(3) with time zone NOT NULL
);


--
-- Name: web_push_subscriptions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE "public"."web_push_subscriptions" (
    "id" integer NOT NULL,
    "user_id" integer NOT NULL,
    "endpoint" character varying NOT NULL,
    "p256dh" character varying NOT NULL,
    "auth" character varying NOT NULL,
    "user_agent" character varying,
    "browser" character varying,
    "platform" character varying,
    "device_label" character varying,
    "permission_state" "public"."enum_web_push_subscriptions_permission_state" DEFAULT 'granted'::"public"."enum_web_push_subscriptions_permission_state" NOT NULL,
    "is_active" boolean DEFAULT true NOT NULL,
    "last_seen_at" timestamp(3) with time zone,
    "last_subscribed_at" timestamp(3) with time zone,
    "last_success_at" timestamp(3) with time zone,
    "last_failure_at" timestamp(3) with time zone,
    "failure_reason" character varying,
    "subscription_j_s_o_n" "jsonb",
    "updated_at" timestamp(3) with time zone DEFAULT "now"() NOT NULL,
    "created_at" timestamp(3) with time zone DEFAULT "now"() NOT NULL
);


--
-- Name: web_push_subscriptions_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE "public"."web_push_subscriptions_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: web_push_subscriptions_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE "public"."web_push_subscriptions_id_seq" OWNED BY "public"."web_push_subscriptions"."id";


--
-- Name: wishlists; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE "public"."wishlists" (
    "id" integer NOT NULL,
    "user_id" integer NOT NULL,
    "course_id" integer NOT NULL,
    "composite_key" character varying,
    "updated_at" timestamp(3) with time zone DEFAULT "now"() NOT NULL,
    "created_at" timestamp(3) with time zone DEFAULT "now"() NOT NULL
);


--
-- Name: wishlists_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE "public"."wishlists_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: wishlists_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE "public"."wishlists_id_seq" OWNED BY "public"."wishlists"."id";


--
-- Name: messages; Type: TABLE; Schema: realtime; Owner: -
--

CREATE TABLE "realtime"."messages" (
    "topic" "text" NOT NULL,
    "extension" "text" NOT NULL,
    "payload" "jsonb",
    "event" "text",
    "private" boolean DEFAULT false,
    "updated_at" timestamp without time zone DEFAULT "now"() NOT NULL,
    "inserted_at" timestamp without time zone DEFAULT "now"() NOT NULL,
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL
)
PARTITION BY RANGE ("inserted_at");


--
-- Name: messages_2026_05_19; Type: TABLE; Schema: realtime; Owner: -
--

CREATE TABLE "realtime"."messages_2026_05_19" (
    "topic" "text" NOT NULL,
    "extension" "text" NOT NULL,
    "payload" "jsonb",
    "event" "text",
    "private" boolean DEFAULT false,
    "updated_at" timestamp without time zone DEFAULT "now"() NOT NULL,
    "inserted_at" timestamp without time zone DEFAULT "now"() NOT NULL,
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL
);


--
-- Name: messages_2026_05_20; Type: TABLE; Schema: realtime; Owner: -
--

CREATE TABLE "realtime"."messages_2026_05_20" (
    "topic" "text" NOT NULL,
    "extension" "text" NOT NULL,
    "payload" "jsonb",
    "event" "text",
    "private" boolean DEFAULT false,
    "updated_at" timestamp without time zone DEFAULT "now"() NOT NULL,
    "inserted_at" timestamp without time zone DEFAULT "now"() NOT NULL,
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL
);


--
-- Name: messages_2026_05_21; Type: TABLE; Schema: realtime; Owner: -
--

CREATE TABLE "realtime"."messages_2026_05_21" (
    "topic" "text" NOT NULL,
    "extension" "text" NOT NULL,
    "payload" "jsonb",
    "event" "text",
    "private" boolean DEFAULT false,
    "updated_at" timestamp without time zone DEFAULT "now"() NOT NULL,
    "inserted_at" timestamp without time zone DEFAULT "now"() NOT NULL,
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL
);


--
-- Name: messages_2026_05_22; Type: TABLE; Schema: realtime; Owner: -
--

CREATE TABLE "realtime"."messages_2026_05_22" (
    "topic" "text" NOT NULL,
    "extension" "text" NOT NULL,
    "payload" "jsonb",
    "event" "text",
    "private" boolean DEFAULT false,
    "updated_at" timestamp without time zone DEFAULT "now"() NOT NULL,
    "inserted_at" timestamp without time zone DEFAULT "now"() NOT NULL,
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL
);


--
-- Name: messages_2026_05_23; Type: TABLE; Schema: realtime; Owner: -
--

CREATE TABLE "realtime"."messages_2026_05_23" (
    "topic" "text" NOT NULL,
    "extension" "text" NOT NULL,
    "payload" "jsonb",
    "event" "text",
    "private" boolean DEFAULT false,
    "updated_at" timestamp without time zone DEFAULT "now"() NOT NULL,
    "inserted_at" timestamp without time zone DEFAULT "now"() NOT NULL,
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL
);


--
-- Name: messages_2026_05_24; Type: TABLE; Schema: realtime; Owner: -
--

CREATE TABLE "realtime"."messages_2026_05_24" (
    "topic" "text" NOT NULL,
    "extension" "text" NOT NULL,
    "payload" "jsonb",
    "event" "text",
    "private" boolean DEFAULT false,
    "updated_at" timestamp without time zone DEFAULT "now"() NOT NULL,
    "inserted_at" timestamp without time zone DEFAULT "now"() NOT NULL,
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL
);


--
-- Name: messages_2026_05_25; Type: TABLE; Schema: realtime; Owner: -
--

CREATE TABLE "realtime"."messages_2026_05_25" (
    "topic" "text" NOT NULL,
    "extension" "text" NOT NULL,
    "payload" "jsonb",
    "event" "text",
    "private" boolean DEFAULT false,
    "updated_at" timestamp without time zone DEFAULT "now"() NOT NULL,
    "inserted_at" timestamp without time zone DEFAULT "now"() NOT NULL,
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL
);


--
-- Name: schema_migrations; Type: TABLE; Schema: realtime; Owner: -
--

CREATE TABLE "realtime"."schema_migrations" (
    "version" bigint NOT NULL,
    "inserted_at" timestamp(0) without time zone
);


--
-- Name: subscription; Type: TABLE; Schema: realtime; Owner: -
--

CREATE TABLE "realtime"."subscription" (
    "id" bigint NOT NULL,
    "subscription_id" "uuid" NOT NULL,
    "entity" "regclass" NOT NULL,
    "filters" "realtime"."user_defined_filter"[] DEFAULT '{}'::"realtime"."user_defined_filter"[] NOT NULL,
    "claims" "jsonb" NOT NULL,
    "claims_role" "regrole" GENERATED ALWAYS AS ("realtime"."to_regrole"(("claims" ->> 'role'::"text"))) STORED NOT NULL,
    "created_at" timestamp without time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL,
    "action_filter" "text" DEFAULT '*'::"text",
    CONSTRAINT "subscription_action_filter_check" CHECK (("action_filter" = ANY (ARRAY['*'::"text", 'INSERT'::"text", 'UPDATE'::"text", 'DELETE'::"text"])))
);


--
-- Name: subscription_id_seq; Type: SEQUENCE; Schema: realtime; Owner: -
--

ALTER TABLE "realtime"."subscription" ALTER COLUMN "id" ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME "realtime"."subscription_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: buckets; Type: TABLE; Schema: storage; Owner: -
--

CREATE TABLE "storage"."buckets" (
    "id" "text" NOT NULL,
    "name" "text" NOT NULL,
    "owner" "uuid",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "public" boolean DEFAULT false,
    "avif_autodetection" boolean DEFAULT false,
    "file_size_limit" bigint,
    "allowed_mime_types" "text"[],
    "owner_id" "text",
    "type" "storage"."buckettype" DEFAULT 'STANDARD'::"storage"."buckettype" NOT NULL
);


--
-- Name: COLUMN "buckets"."owner"; Type: COMMENT; Schema: storage; Owner: -
--

COMMENT ON COLUMN "storage"."buckets"."owner" IS 'Field is deprecated, use owner_id instead';


--
-- Name: buckets_analytics; Type: TABLE; Schema: storage; Owner: -
--

CREATE TABLE "storage"."buckets_analytics" (
    "name" "text" NOT NULL,
    "type" "storage"."buckettype" DEFAULT 'ANALYTICS'::"storage"."buckettype" NOT NULL,
    "format" "text" DEFAULT 'ICEBERG'::"text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "deleted_at" timestamp with time zone
);


--
-- Name: buckets_vectors; Type: TABLE; Schema: storage; Owner: -
--

CREATE TABLE "storage"."buckets_vectors" (
    "id" "text" NOT NULL,
    "type" "storage"."buckettype" DEFAULT 'VECTOR'::"storage"."buckettype" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


--
-- Name: migrations; Type: TABLE; Schema: storage; Owner: -
--

CREATE TABLE "storage"."migrations" (
    "id" integer NOT NULL,
    "name" character varying(100) NOT NULL,
    "hash" character varying(40) NOT NULL,
    "executed_at" timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- Name: objects; Type: TABLE; Schema: storage; Owner: -
--

CREATE TABLE "storage"."objects" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "bucket_id" "text",
    "name" "text",
    "owner" "uuid",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "last_accessed_at" timestamp with time zone DEFAULT "now"(),
    "metadata" "jsonb",
    "path_tokens" "text"[] GENERATED ALWAYS AS ("string_to_array"("name", '/'::"text")) STORED,
    "version" "text",
    "owner_id" "text",
    "user_metadata" "jsonb"
);


--
-- Name: COLUMN "objects"."owner"; Type: COMMENT; Schema: storage; Owner: -
--

COMMENT ON COLUMN "storage"."objects"."owner" IS 'Field is deprecated, use owner_id instead';


--
-- Name: s3_multipart_uploads; Type: TABLE; Schema: storage; Owner: -
--

CREATE TABLE "storage"."s3_multipart_uploads" (
    "id" "text" NOT NULL,
    "in_progress_size" bigint DEFAULT 0 NOT NULL,
    "upload_signature" "text" NOT NULL,
    "bucket_id" "text" NOT NULL,
    "key" "text" NOT NULL COLLATE "pg_catalog"."C",
    "version" "text" NOT NULL,
    "owner_id" "text",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "user_metadata" "jsonb",
    "metadata" "jsonb"
);


--
-- Name: s3_multipart_uploads_parts; Type: TABLE; Schema: storage; Owner: -
--

CREATE TABLE "storage"."s3_multipart_uploads_parts" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "upload_id" "text" NOT NULL,
    "size" bigint DEFAULT 0 NOT NULL,
    "part_number" integer NOT NULL,
    "bucket_id" "text" NOT NULL,
    "key" "text" NOT NULL COLLATE "pg_catalog"."C",
    "etag" "text" NOT NULL,
    "owner_id" "text",
    "version" "text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


--
-- Name: vector_indexes; Type: TABLE; Schema: storage; Owner: -
--

CREATE TABLE "storage"."vector_indexes" (
    "id" "text" DEFAULT "gen_random_uuid"() NOT NULL,
    "name" "text" NOT NULL COLLATE "pg_catalog"."C",
    "bucket_id" "text" NOT NULL,
    "data_type" "text" NOT NULL,
    "dimension" integer NOT NULL,
    "distance_metric" "text" NOT NULL,
    "metadata_configuration" "jsonb",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


--
-- Name: messages_2026_05_19; Type: TABLE ATTACH; Schema: realtime; Owner: -
--

ALTER TABLE ONLY "realtime"."messages" ATTACH PARTITION "realtime"."messages_2026_05_19" FOR VALUES FROM ('2026-05-19 00:00:00') TO ('2026-05-20 00:00:00');


--
-- Name: messages_2026_05_20; Type: TABLE ATTACH; Schema: realtime; Owner: -
--

ALTER TABLE ONLY "realtime"."messages" ATTACH PARTITION "realtime"."messages_2026_05_20" FOR VALUES FROM ('2026-05-20 00:00:00') TO ('2026-05-21 00:00:00');


--
-- Name: messages_2026_05_21; Type: TABLE ATTACH; Schema: realtime; Owner: -
--

ALTER TABLE ONLY "realtime"."messages" ATTACH PARTITION "realtime"."messages_2026_05_21" FOR VALUES FROM ('2026-05-21 00:00:00') TO ('2026-05-22 00:00:00');


--
-- Name: messages_2026_05_22; Type: TABLE ATTACH; Schema: realtime; Owner: -
--

ALTER TABLE ONLY "realtime"."messages" ATTACH PARTITION "realtime"."messages_2026_05_22" FOR VALUES FROM ('2026-05-22 00:00:00') TO ('2026-05-23 00:00:00');


--
-- Name: messages_2026_05_23; Type: TABLE ATTACH; Schema: realtime; Owner: -
--

ALTER TABLE ONLY "realtime"."messages" ATTACH PARTITION "realtime"."messages_2026_05_23" FOR VALUES FROM ('2026-05-23 00:00:00') TO ('2026-05-24 00:00:00');


--
-- Name: messages_2026_05_24; Type: TABLE ATTACH; Schema: realtime; Owner: -
--

ALTER TABLE ONLY "realtime"."messages" ATTACH PARTITION "realtime"."messages_2026_05_24" FOR VALUES FROM ('2026-05-24 00:00:00') TO ('2026-05-25 00:00:00');


--
-- Name: messages_2026_05_25; Type: TABLE ATTACH; Schema: realtime; Owner: -
--

ALTER TABLE ONLY "realtime"."messages" ATTACH PARTITION "realtime"."messages_2026_05_25" FOR VALUES FROM ('2026-05-25 00:00:00') TO ('2026-05-26 00:00:00');


--
-- Name: refresh_tokens id; Type: DEFAULT; Schema: auth; Owner: -
--

ALTER TABLE ONLY "auth"."refresh_tokens" ALTER COLUMN "id" SET DEFAULT "nextval"('"auth"."refresh_tokens_id_seq"'::"regclass");


--
-- Name: _posts_v id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."_posts_v" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."_posts_v_id_seq"'::"regclass");


--
-- Name: _posts_v_rels id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."_posts_v_rels" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."_posts_v_rels_id_seq"'::"regclass");


--
-- Name: _posts_v_version_tags id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."_posts_v_version_tags" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."_posts_v_version_tags_id_seq"'::"regclass");


--
-- Name: admins id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."admins" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."admins_id_seq"'::"regclass");


--
-- Name: announcements id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."announcements" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."announcements_id_seq"'::"regclass");


--
-- Name: assessment_submissions id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."assessment_submissions" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."assessment_submissions_id_seq"'::"regclass");


--
-- Name: assessments id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."assessments" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."assessments_id_seq"'::"regclass");


--
-- Name: assignment_submissions id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."assignment_submissions" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."assignment_submissions_id_seq"'::"regclass");


--
-- Name: assignment_submissions_rels id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."assignment_submissions_rels" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."assignment_submissions_rels_id_seq"'::"regclass");


--
-- Name: assignments id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."assignments" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."assignments_id_seq"'::"regclass");


--
-- Name: assignments_allowed_file_types id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."assignments_allowed_file_types" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."assignments_allowed_file_types_id_seq"'::"regclass");


--
-- Name: assignments_rels id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."assignments_rels" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."assignments_rels_id_seq"'::"regclass");


--
-- Name: certificate_templates id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."certificate_templates" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."certificate_templates_id_seq"'::"regclass");


--
-- Name: certificates id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."certificates" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."certificates_id_seq"'::"regclass");


--
-- Name: chat_message_status id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."chat_message_status" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."chat_message_status_id_seq"'::"regclass");


--
-- Name: chat_messages id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."chat_messages" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."chat_messages_id_seq"'::"regclass");


--
-- Name: chat_messages_rels id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."chat_messages_rels" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."chat_messages_rels_id_seq"'::"regclass");


--
-- Name: chat_typing_status id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."chat_typing_status" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."chat_typing_status_id_seq"'::"regclass");


--
-- Name: chats id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."chats" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."chats_id_seq"'::"regclass");


--
-- Name: chats_rels id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."chats_rels" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."chats_rels_id_seq"'::"regclass");


--
-- Name: coupon_codes id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."coupon_codes" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."coupon_codes_id_seq"'::"regclass");


--
-- Name: coupon_codes_rels id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."coupon_codes_rels" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."coupon_codes_rels_id_seq"'::"regclass");


--
-- Name: coupon_redemptions id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."coupon_redemptions" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."coupon_redemptions_id_seq"'::"regclass");


--
-- Name: course_categories id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."course_categories" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."course_categories_id_seq"'::"regclass");


--
-- Name: course_enrollments id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."course_enrollments" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."course_enrollments_id_seq"'::"regclass");


--
-- Name: course_item_progress id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."course_item_progress" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."course_item_progress_id_seq"'::"regclass");


--
-- Name: course_item_progress_rels id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."course_item_progress_rels" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."course_item_progress_rels_id_seq"'::"regclass");


--
-- Name: course_lessons id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."course_lessons" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."course_lessons_id_seq"'::"regclass");


--
-- Name: course_materials id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."course_materials" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."course_materials_id_seq"'::"regclass");


--
-- Name: course_modules id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."course_modules" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."course_modules_id_seq"'::"regclass");


--
-- Name: course_modules_rels id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."course_modules_rels" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."course_modules_rels_id_seq"'::"regclass");


--
-- Name: courses id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."courses" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."courses_id_seq"'::"regclass");


--
-- Name: courses_rels id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."courses_rels" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."courses_rels_id_seq"'::"regclass");


--
-- Name: emergency_contacts id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."emergency_contacts" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."emergency_contacts_id_seq"'::"regclass");


--
-- Name: feedback_forms id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."feedback_forms" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."feedback_forms_id_seq"'::"regclass");


--
-- Name: feedback_submissions id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."feedback_submissions" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."feedback_submissions_id_seq"'::"regclass");


--
-- Name: instructors id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."instructors" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."instructors_id_seq"'::"regclass");


--
-- Name: lesson_materials id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."lesson_materials" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."lesson_materials_id_seq"'::"regclass");


--
-- Name: materials id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."materials" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."materials_id_seq"'::"regclass");


--
-- Name: materials_rels id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."materials_rels" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."materials_rels_id_seq"'::"regclass");


--
-- Name: media id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."media" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."media_id_seq"'::"regclass");


--
-- Name: notification_templates id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."notification_templates" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."notification_templates_id_seq"'::"regclass");


--
-- Name: notification_templates_channels id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."notification_templates_channels" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."notification_templates_channels_id_seq"'::"regclass");


--
-- Name: notifications id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."notifications" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."notifications_id_seq"'::"regclass");


--
-- Name: notifications_rels id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."notifications_rels" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."notifications_rels_id_seq"'::"regclass");


--
-- Name: payload_kv id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."payload_kv" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."payload_kv_id_seq"'::"regclass");


--
-- Name: payload_locked_documents id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."payload_locked_documents" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."payload_locked_documents_id_seq"'::"regclass");


--
-- Name: payload_locked_documents_rels id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."payload_locked_documents_rels" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."payload_locked_documents_rels_id_seq"'::"regclass");


--
-- Name: payload_migrations id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."payload_migrations" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."payload_migrations_id_seq"'::"regclass");


--
-- Name: payload_preferences id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."payload_preferences" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."payload_preferences_id_seq"'::"regclass");


--
-- Name: payload_preferences_rels id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."payload_preferences_rels" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."payload_preferences_rels_id_seq"'::"regclass");


--
-- Name: post_categories id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."post_categories" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."post_categories_id_seq"'::"regclass");


--
-- Name: posts id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."posts" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."posts_id_seq"'::"regclass");


--
-- Name: posts_rels id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."posts_rels" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."posts_rels_id_seq"'::"regclass");


--
-- Name: questions id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."questions" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."questions_id_seq"'::"regclass");


--
-- Name: questions_texts id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."questions_texts" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."questions_texts_id_seq"'::"regclass");


--
-- Name: recent_searches id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."recent_searches" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."recent_searches_id_seq"'::"regclass");


--
-- Name: recently_viewed_courses id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."recently_viewed_courses" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."recently_viewed_courses_id_seq"'::"regclass");


--
-- Name: site_settings id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."site_settings" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."site_settings_id_seq"'::"regclass");


--
-- Name: submission_answers id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."submission_answers" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."submission_answers_id_seq"'::"regclass");


--
-- Name: support_ticket_messages id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."support_ticket_messages" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."support_ticket_messages_id_seq"'::"regclass");


--
-- Name: support_ticket_messages_rels id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."support_ticket_messages_rels" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."support_ticket_messages_rels_id_seq"'::"regclass");


--
-- Name: support_tickets id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."support_tickets" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."support_tickets_id_seq"'::"regclass");


--
-- Name: support_tickets_rels id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."support_tickets_rels" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."support_tickets_rels_id_seq"'::"regclass");


--
-- Name: trainees id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."trainees" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."trainees_id_seq"'::"regclass");


--
-- Name: user_events id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."user_events" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."user_events_id_seq"'::"regclass");


--
-- Name: user_notifications id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."user_notifications" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."user_notifications_id_seq"'::"regclass");


--
-- Name: users id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."users" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."users_id_seq"'::"regclass");


--
-- Name: web_push_subscriptions id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."web_push_subscriptions" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."web_push_subscriptions_id_seq"'::"regclass");


--
-- Name: wishlists id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."wishlists" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."wishlists_id_seq"'::"regclass");


--
-- Name: mfa_amr_claims amr_id_pk; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY "auth"."mfa_amr_claims"
    ADD CONSTRAINT "amr_id_pk" PRIMARY KEY ("id");


--
-- Name: audit_log_entries audit_log_entries_pkey; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY "auth"."audit_log_entries"
    ADD CONSTRAINT "audit_log_entries_pkey" PRIMARY KEY ("id");


--
-- Name: custom_oauth_providers custom_oauth_providers_identifier_key; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY "auth"."custom_oauth_providers"
    ADD CONSTRAINT "custom_oauth_providers_identifier_key" UNIQUE ("identifier");


--
-- Name: custom_oauth_providers custom_oauth_providers_pkey; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY "auth"."custom_oauth_providers"
    ADD CONSTRAINT "custom_oauth_providers_pkey" PRIMARY KEY ("id");


--
-- Name: flow_state flow_state_pkey; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY "auth"."flow_state"
    ADD CONSTRAINT "flow_state_pkey" PRIMARY KEY ("id");


--
-- Name: identities identities_pkey; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY "auth"."identities"
    ADD CONSTRAINT "identities_pkey" PRIMARY KEY ("id");


--
-- Name: identities identities_provider_id_provider_unique; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY "auth"."identities"
    ADD CONSTRAINT "identities_provider_id_provider_unique" UNIQUE ("provider_id", "provider");


--
-- Name: instances instances_pkey; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY "auth"."instances"
    ADD CONSTRAINT "instances_pkey" PRIMARY KEY ("id");


--
-- Name: mfa_amr_claims mfa_amr_claims_session_id_authentication_method_pkey; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY "auth"."mfa_amr_claims"
    ADD CONSTRAINT "mfa_amr_claims_session_id_authentication_method_pkey" UNIQUE ("session_id", "authentication_method");


--
-- Name: mfa_challenges mfa_challenges_pkey; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY "auth"."mfa_challenges"
    ADD CONSTRAINT "mfa_challenges_pkey" PRIMARY KEY ("id");


--
-- Name: mfa_factors mfa_factors_last_challenged_at_key; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY "auth"."mfa_factors"
    ADD CONSTRAINT "mfa_factors_last_challenged_at_key" UNIQUE ("last_challenged_at");


--
-- Name: mfa_factors mfa_factors_pkey; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY "auth"."mfa_factors"
    ADD CONSTRAINT "mfa_factors_pkey" PRIMARY KEY ("id");


--
-- Name: oauth_authorizations oauth_authorizations_authorization_code_key; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY "auth"."oauth_authorizations"
    ADD CONSTRAINT "oauth_authorizations_authorization_code_key" UNIQUE ("authorization_code");


--
-- Name: oauth_authorizations oauth_authorizations_authorization_id_key; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY "auth"."oauth_authorizations"
    ADD CONSTRAINT "oauth_authorizations_authorization_id_key" UNIQUE ("authorization_id");


--
-- Name: oauth_authorizations oauth_authorizations_pkey; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY "auth"."oauth_authorizations"
    ADD CONSTRAINT "oauth_authorizations_pkey" PRIMARY KEY ("id");


--
-- Name: oauth_client_states oauth_client_states_pkey; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY "auth"."oauth_client_states"
    ADD CONSTRAINT "oauth_client_states_pkey" PRIMARY KEY ("id");


--
-- Name: oauth_clients oauth_clients_pkey; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY "auth"."oauth_clients"
    ADD CONSTRAINT "oauth_clients_pkey" PRIMARY KEY ("id");


--
-- Name: oauth_consents oauth_consents_pkey; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY "auth"."oauth_consents"
    ADD CONSTRAINT "oauth_consents_pkey" PRIMARY KEY ("id");


--
-- Name: oauth_consents oauth_consents_user_client_unique; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY "auth"."oauth_consents"
    ADD CONSTRAINT "oauth_consents_user_client_unique" UNIQUE ("user_id", "client_id");


--
-- Name: one_time_tokens one_time_tokens_pkey; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY "auth"."one_time_tokens"
    ADD CONSTRAINT "one_time_tokens_pkey" PRIMARY KEY ("id");


--
-- Name: refresh_tokens refresh_tokens_pkey; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY "auth"."refresh_tokens"
    ADD CONSTRAINT "refresh_tokens_pkey" PRIMARY KEY ("id");


--
-- Name: refresh_tokens refresh_tokens_token_unique; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY "auth"."refresh_tokens"
    ADD CONSTRAINT "refresh_tokens_token_unique" UNIQUE ("token");


--
-- Name: saml_providers saml_providers_entity_id_key; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY "auth"."saml_providers"
    ADD CONSTRAINT "saml_providers_entity_id_key" UNIQUE ("entity_id");


--
-- Name: saml_providers saml_providers_pkey; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY "auth"."saml_providers"
    ADD CONSTRAINT "saml_providers_pkey" PRIMARY KEY ("id");


--
-- Name: saml_relay_states saml_relay_states_pkey; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY "auth"."saml_relay_states"
    ADD CONSTRAINT "saml_relay_states_pkey" PRIMARY KEY ("id");


--
-- Name: schema_migrations schema_migrations_pkey; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY "auth"."schema_migrations"
    ADD CONSTRAINT "schema_migrations_pkey" PRIMARY KEY ("version");


--
-- Name: sessions sessions_pkey; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY "auth"."sessions"
    ADD CONSTRAINT "sessions_pkey" PRIMARY KEY ("id");


--
-- Name: sso_domains sso_domains_pkey; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY "auth"."sso_domains"
    ADD CONSTRAINT "sso_domains_pkey" PRIMARY KEY ("id");


--
-- Name: sso_providers sso_providers_pkey; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY "auth"."sso_providers"
    ADD CONSTRAINT "sso_providers_pkey" PRIMARY KEY ("id");


--
-- Name: users users_phone_key; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY "auth"."users"
    ADD CONSTRAINT "users_phone_key" UNIQUE ("phone");


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY "auth"."users"
    ADD CONSTRAINT "users_pkey" PRIMARY KEY ("id");


--
-- Name: webauthn_challenges webauthn_challenges_pkey; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY "auth"."webauthn_challenges"
    ADD CONSTRAINT "webauthn_challenges_pkey" PRIMARY KEY ("id");


--
-- Name: webauthn_credentials webauthn_credentials_pkey; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY "auth"."webauthn_credentials"
    ADD CONSTRAINT "webauthn_credentials_pkey" PRIMARY KEY ("id");


--
-- Name: _posts_v _posts_v_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."_posts_v"
    ADD CONSTRAINT "_posts_v_pkey" PRIMARY KEY ("id");


--
-- Name: _posts_v_rels _posts_v_rels_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."_posts_v_rels"
    ADD CONSTRAINT "_posts_v_rels_pkey" PRIMARY KEY ("id");


--
-- Name: _posts_v_version_tags _posts_v_version_tags_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."_posts_v_version_tags"
    ADD CONSTRAINT "_posts_v_version_tags_pkey" PRIMARY KEY ("id");


--
-- Name: admins admins_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."admins"
    ADD CONSTRAINT "admins_pkey" PRIMARY KEY ("id");


--
-- Name: announcements announcements_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."announcements"
    ADD CONSTRAINT "announcements_pkey" PRIMARY KEY ("id");


--
-- Name: assessment_submissions assessment_submissions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."assessment_submissions"
    ADD CONSTRAINT "assessment_submissions_pkey" PRIMARY KEY ("id");


--
-- Name: assessments_items assessments_items_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."assessments_items"
    ADD CONSTRAINT "assessments_items_pkey" PRIMARY KEY ("id");


--
-- Name: assessments assessments_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."assessments"
    ADD CONSTRAINT "assessments_pkey" PRIMARY KEY ("id");


--
-- Name: assignment_submissions assignment_submissions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."assignment_submissions"
    ADD CONSTRAINT "assignment_submissions_pkey" PRIMARY KEY ("id");


--
-- Name: assignment_submissions_rels assignment_submissions_rels_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."assignment_submissions_rels"
    ADD CONSTRAINT "assignment_submissions_rels_pkey" PRIMARY KEY ("id");


--
-- Name: assignments_allowed_file_types assignments_allowed_file_types_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."assignments_allowed_file_types"
    ADD CONSTRAINT "assignments_allowed_file_types_pkey" PRIMARY KEY ("id");


--
-- Name: assignments assignments_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."assignments"
    ADD CONSTRAINT "assignments_pkey" PRIMARY KEY ("id");


--
-- Name: assignments_rels assignments_rels_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."assignments_rels"
    ADD CONSTRAINT "assignments_rels_pkey" PRIMARY KEY ("id");


--
-- Name: certificate_templates certificate_templates_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."certificate_templates"
    ADD CONSTRAINT "certificate_templates_pkey" PRIMARY KEY ("id");


--
-- Name: certificates certificates_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."certificates"
    ADD CONSTRAINT "certificates_pkey" PRIMARY KEY ("id");


--
-- Name: chat_message_status chat_message_status_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."chat_message_status"
    ADD CONSTRAINT "chat_message_status_pkey" PRIMARY KEY ("id");


--
-- Name: chat_messages chat_messages_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."chat_messages"
    ADD CONSTRAINT "chat_messages_pkey" PRIMARY KEY ("id");


--
-- Name: chat_messages_reactions chat_messages_reactions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."chat_messages_reactions"
    ADD CONSTRAINT "chat_messages_reactions_pkey" PRIMARY KEY ("id");


--
-- Name: chat_messages_rels chat_messages_rels_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."chat_messages_rels"
    ADD CONSTRAINT "chat_messages_rels_pkey" PRIMARY KEY ("id");


--
-- Name: chat_typing_status chat_typing_status_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."chat_typing_status"
    ADD CONSTRAINT "chat_typing_status_pkey" PRIMARY KEY ("id");


--
-- Name: chats chats_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."chats"
    ADD CONSTRAINT "chats_pkey" PRIMARY KEY ("id");


--
-- Name: chats_rels chats_rels_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."chats_rels"
    ADD CONSTRAINT "chats_rels_pkey" PRIMARY KEY ("id");


--
-- Name: coupon_codes_allowed_emails coupon_codes_allowed_emails_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."coupon_codes_allowed_emails"
    ADD CONSTRAINT "coupon_codes_allowed_emails_pkey" PRIMARY KEY ("id");


--
-- Name: coupon_codes coupon_codes_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."coupon_codes"
    ADD CONSTRAINT "coupon_codes_pkey" PRIMARY KEY ("id");


--
-- Name: coupon_codes_rels coupon_codes_rels_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."coupon_codes_rels"
    ADD CONSTRAINT "coupon_codes_rels_pkey" PRIMARY KEY ("id");


--
-- Name: coupon_redemptions coupon_redemptions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."coupon_redemptions"
    ADD CONSTRAINT "coupon_redemptions_pkey" PRIMARY KEY ("id");


--
-- Name: course_categories course_categories_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."course_categories"
    ADD CONSTRAINT "course_categories_pkey" PRIMARY KEY ("id");


--
-- Name: course_enrollments course_enrollments_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."course_enrollments"
    ADD CONSTRAINT "course_enrollments_pkey" PRIMARY KEY ("id");


--
-- Name: course_item_progress course_item_progress_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."course_item_progress"
    ADD CONSTRAINT "course_item_progress_pkey" PRIMARY KEY ("id");


--
-- Name: course_item_progress_rels course_item_progress_rels_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."course_item_progress_rels"
    ADD CONSTRAINT "course_item_progress_rels_pkey" PRIMARY KEY ("id");


--
-- Name: course_lessons course_lessons_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."course_lessons"
    ADD CONSTRAINT "course_lessons_pkey" PRIMARY KEY ("id");


--
-- Name: course_materials course_materials_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."course_materials"
    ADD CONSTRAINT "course_materials_pkey" PRIMARY KEY ("id");


--
-- Name: course_modules course_modules_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."course_modules"
    ADD CONSTRAINT "course_modules_pkey" PRIMARY KEY ("id");


--
-- Name: course_modules_rels course_modules_rels_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."course_modules_rels"
    ADD CONSTRAINT "course_modules_rels_pkey" PRIMARY KEY ("id");


--
-- Name: courses_learning_objectives courses_learning_objectives_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."courses_learning_objectives"
    ADD CONSTRAINT "courses_learning_objectives_pkey" PRIMARY KEY ("id");


--
-- Name: courses courses_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."courses"
    ADD CONSTRAINT "courses_pkey" PRIMARY KEY ("id");


--
-- Name: courses_prerequisites courses_prerequisites_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."courses_prerequisites"
    ADD CONSTRAINT "courses_prerequisites_pkey" PRIMARY KEY ("id");


--
-- Name: courses_rels courses_rels_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."courses_rels"
    ADD CONSTRAINT "courses_rels_pkey" PRIMARY KEY ("id");


--
-- Name: emergency_contacts emergency_contacts_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."emergency_contacts"
    ADD CONSTRAINT "emergency_contacts_pkey" PRIMARY KEY ("id");


--
-- Name: feedback_forms_blocks_choice_input_options feedback_forms_blocks_choice_input_options_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."feedback_forms_blocks_choice_input_options"
    ADD CONSTRAINT "feedback_forms_blocks_choice_input_options_pkey" PRIMARY KEY ("id");


--
-- Name: feedback_forms_blocks_choice_input feedback_forms_blocks_choice_input_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."feedback_forms_blocks_choice_input"
    ADD CONSTRAINT "feedback_forms_blocks_choice_input_pkey" PRIMARY KEY ("id");


--
-- Name: feedback_forms_blocks_survey_matrix_columns feedback_forms_blocks_survey_matrix_columns_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."feedback_forms_blocks_survey_matrix_columns"
    ADD CONSTRAINT "feedback_forms_blocks_survey_matrix_columns_pkey" PRIMARY KEY ("id");


--
-- Name: feedback_forms_blocks_survey_matrix feedback_forms_blocks_survey_matrix_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."feedback_forms_blocks_survey_matrix"
    ADD CONSTRAINT "feedback_forms_blocks_survey_matrix_pkey" PRIMARY KEY ("id");


--
-- Name: feedback_forms_blocks_survey_matrix_rows feedback_forms_blocks_survey_matrix_rows_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."feedback_forms_blocks_survey_matrix_rows"
    ADD CONSTRAINT "feedback_forms_blocks_survey_matrix_rows_pkey" PRIMARY KEY ("id");


--
-- Name: feedback_forms_blocks_text_input feedback_forms_blocks_text_input_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."feedback_forms_blocks_text_input"
    ADD CONSTRAINT "feedback_forms_blocks_text_input_pkey" PRIMARY KEY ("id");


--
-- Name: feedback_forms feedback_forms_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."feedback_forms"
    ADD CONSTRAINT "feedback_forms_pkey" PRIMARY KEY ("id");


--
-- Name: feedback_submissions feedback_submissions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."feedback_submissions"
    ADD CONSTRAINT "feedback_submissions_pkey" PRIMARY KEY ("id");


--
-- Name: instructors instructors_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."instructors"
    ADD CONSTRAINT "instructors_pkey" PRIMARY KEY ("id");


--
-- Name: lesson_materials lesson_materials_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."lesson_materials"
    ADD CONSTRAINT "lesson_materials_pkey" PRIMARY KEY ("id");


--
-- Name: materials materials_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."materials"
    ADD CONSTRAINT "materials_pkey" PRIMARY KEY ("id");


--
-- Name: materials_rels materials_rels_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."materials_rels"
    ADD CONSTRAINT "materials_rels_pkey" PRIMARY KEY ("id");


--
-- Name: media media_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."media"
    ADD CONSTRAINT "media_pkey" PRIMARY KEY ("id");


--
-- Name: notification_templates_channels notification_templates_channels_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."notification_templates_channels"
    ADD CONSTRAINT "notification_templates_channels_pkey" PRIMARY KEY ("id");


--
-- Name: notification_templates notification_templates_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."notification_templates"
    ADD CONSTRAINT "notification_templates_pkey" PRIMARY KEY ("id");


--
-- Name: notifications notifications_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."notifications"
    ADD CONSTRAINT "notifications_pkey" PRIMARY KEY ("id");


--
-- Name: notifications_rels notifications_rels_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."notifications_rels"
    ADD CONSTRAINT "notifications_rels_pkey" PRIMARY KEY ("id");


--
-- Name: payload_kv payload_kv_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."payload_kv"
    ADD CONSTRAINT "payload_kv_pkey" PRIMARY KEY ("id");


--
-- Name: payload_locked_documents payload_locked_documents_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."payload_locked_documents"
    ADD CONSTRAINT "payload_locked_documents_pkey" PRIMARY KEY ("id");


--
-- Name: payload_locked_documents_rels payload_locked_documents_rels_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."payload_locked_documents_rels"
    ADD CONSTRAINT "payload_locked_documents_rels_pkey" PRIMARY KEY ("id");


--
-- Name: payload_migrations payload_migrations_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."payload_migrations"
    ADD CONSTRAINT "payload_migrations_pkey" PRIMARY KEY ("id");


--
-- Name: payload_preferences payload_preferences_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."payload_preferences"
    ADD CONSTRAINT "payload_preferences_pkey" PRIMARY KEY ("id");


--
-- Name: payload_preferences_rels payload_preferences_rels_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."payload_preferences_rels"
    ADD CONSTRAINT "payload_preferences_rels_pkey" PRIMARY KEY ("id");


--
-- Name: post_categories post_categories_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."post_categories"
    ADD CONSTRAINT "post_categories_pkey" PRIMARY KEY ("id");


--
-- Name: posts posts_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."posts"
    ADD CONSTRAINT "posts_pkey" PRIMARY KEY ("id");


--
-- Name: posts_rels posts_rels_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."posts_rels"
    ADD CONSTRAINT "posts_rels_pkey" PRIMARY KEY ("id");


--
-- Name: posts_tags posts_tags_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."posts_tags"
    ADD CONSTRAINT "posts_tags_pkey" PRIMARY KEY ("id");


--
-- Name: questions_options questions_options_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."questions_options"
    ADD CONSTRAINT "questions_options_pkey" PRIMARY KEY ("id");


--
-- Name: questions questions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."questions"
    ADD CONSTRAINT "questions_pkey" PRIMARY KEY ("id");


--
-- Name: questions_texts questions_texts_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."questions_texts"
    ADD CONSTRAINT "questions_texts_pkey" PRIMARY KEY ("id");


--
-- Name: recent_searches recent_searches_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."recent_searches"
    ADD CONSTRAINT "recent_searches_pkey" PRIMARY KEY ("id");


--
-- Name: recently_viewed_courses recently_viewed_courses_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."recently_viewed_courses"
    ADD CONSTRAINT "recently_viewed_courses_pkey" PRIMARY KEY ("id");


--
-- Name: site_settings site_settings_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."site_settings"
    ADD CONSTRAINT "site_settings_pkey" PRIMARY KEY ("id");


--
-- Name: site_settings_social_links site_settings_social_links_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."site_settings_social_links"
    ADD CONSTRAINT "site_settings_social_links_pkey" PRIMARY KEY ("id");


--
-- Name: submission_answers submission_answers_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."submission_answers"
    ADD CONSTRAINT "submission_answers_pkey" PRIMARY KEY ("id");


--
-- Name: support_ticket_messages support_ticket_messages_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."support_ticket_messages"
    ADD CONSTRAINT "support_ticket_messages_pkey" PRIMARY KEY ("id");


--
-- Name: support_ticket_messages_rels support_ticket_messages_rels_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."support_ticket_messages_rels"
    ADD CONSTRAINT "support_ticket_messages_rels_pkey" PRIMARY KEY ("id");


--
-- Name: support_tickets support_tickets_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."support_tickets"
    ADD CONSTRAINT "support_tickets_pkey" PRIMARY KEY ("id");


--
-- Name: support_tickets_rels support_tickets_rels_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."support_tickets_rels"
    ADD CONSTRAINT "support_tickets_rels_pkey" PRIMARY KEY ("id");


--
-- Name: trainees trainees_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."trainees"
    ADD CONSTRAINT "trainees_pkey" PRIMARY KEY ("id");


--
-- Name: user_events user_events_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."user_events"
    ADD CONSTRAINT "user_events_pkey" PRIMARY KEY ("id");


--
-- Name: user_notifications user_notifications_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."user_notifications"
    ADD CONSTRAINT "user_notifications_pkey" PRIMARY KEY ("id");


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."users"
    ADD CONSTRAINT "users_pkey" PRIMARY KEY ("id");


--
-- Name: users_reset_password_tokens users_reset_password_tokens_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."users_reset_password_tokens"
    ADD CONSTRAINT "users_reset_password_tokens_pkey" PRIMARY KEY ("id");


--
-- Name: users_sessions users_sessions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."users_sessions"
    ADD CONSTRAINT "users_sessions_pkey" PRIMARY KEY ("id");


--
-- Name: web_push_subscriptions web_push_subscriptions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."web_push_subscriptions"
    ADD CONSTRAINT "web_push_subscriptions_pkey" PRIMARY KEY ("id");


--
-- Name: wishlists wishlists_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."wishlists"
    ADD CONSTRAINT "wishlists_pkey" PRIMARY KEY ("id");


--
-- Name: messages messages_pkey; Type: CONSTRAINT; Schema: realtime; Owner: -
--

ALTER TABLE ONLY "realtime"."messages"
    ADD CONSTRAINT "messages_pkey" PRIMARY KEY ("id", "inserted_at");


--
-- Name: messages_2026_05_19 messages_2026_05_19_pkey; Type: CONSTRAINT; Schema: realtime; Owner: -
--

ALTER TABLE ONLY "realtime"."messages_2026_05_19"
    ADD CONSTRAINT "messages_2026_05_19_pkey" PRIMARY KEY ("id", "inserted_at");


--
-- Name: messages_2026_05_20 messages_2026_05_20_pkey; Type: CONSTRAINT; Schema: realtime; Owner: -
--

ALTER TABLE ONLY "realtime"."messages_2026_05_20"
    ADD CONSTRAINT "messages_2026_05_20_pkey" PRIMARY KEY ("id", "inserted_at");


--
-- Name: messages_2026_05_21 messages_2026_05_21_pkey; Type: CONSTRAINT; Schema: realtime; Owner: -
--

ALTER TABLE ONLY "realtime"."messages_2026_05_21"
    ADD CONSTRAINT "messages_2026_05_21_pkey" PRIMARY KEY ("id", "inserted_at");


--
-- Name: messages_2026_05_22 messages_2026_05_22_pkey; Type: CONSTRAINT; Schema: realtime; Owner: -
--

ALTER TABLE ONLY "realtime"."messages_2026_05_22"
    ADD CONSTRAINT "messages_2026_05_22_pkey" PRIMARY KEY ("id", "inserted_at");


--
-- Name: messages_2026_05_23 messages_2026_05_23_pkey; Type: CONSTRAINT; Schema: realtime; Owner: -
--

ALTER TABLE ONLY "realtime"."messages_2026_05_23"
    ADD CONSTRAINT "messages_2026_05_23_pkey" PRIMARY KEY ("id", "inserted_at");


--
-- Name: messages_2026_05_24 messages_2026_05_24_pkey; Type: CONSTRAINT; Schema: realtime; Owner: -
--

ALTER TABLE ONLY "realtime"."messages_2026_05_24"
    ADD CONSTRAINT "messages_2026_05_24_pkey" PRIMARY KEY ("id", "inserted_at");


--
-- Name: messages_2026_05_25 messages_2026_05_25_pkey; Type: CONSTRAINT; Schema: realtime; Owner: -
--

ALTER TABLE ONLY "realtime"."messages_2026_05_25"
    ADD CONSTRAINT "messages_2026_05_25_pkey" PRIMARY KEY ("id", "inserted_at");


--
-- Name: subscription pk_subscription; Type: CONSTRAINT; Schema: realtime; Owner: -
--

ALTER TABLE ONLY "realtime"."subscription"
    ADD CONSTRAINT "pk_subscription" PRIMARY KEY ("id");


--
-- Name: schema_migrations schema_migrations_pkey; Type: CONSTRAINT; Schema: realtime; Owner: -
--

ALTER TABLE ONLY "realtime"."schema_migrations"
    ADD CONSTRAINT "schema_migrations_pkey" PRIMARY KEY ("version");


--
-- Name: buckets_analytics buckets_analytics_pkey; Type: CONSTRAINT; Schema: storage; Owner: -
--

ALTER TABLE ONLY "storage"."buckets_analytics"
    ADD CONSTRAINT "buckets_analytics_pkey" PRIMARY KEY ("id");


--
-- Name: buckets buckets_pkey; Type: CONSTRAINT; Schema: storage; Owner: -
--

ALTER TABLE ONLY "storage"."buckets"
    ADD CONSTRAINT "buckets_pkey" PRIMARY KEY ("id");


--
-- Name: buckets_vectors buckets_vectors_pkey; Type: CONSTRAINT; Schema: storage; Owner: -
--

ALTER TABLE ONLY "storage"."buckets_vectors"
    ADD CONSTRAINT "buckets_vectors_pkey" PRIMARY KEY ("id");


--
-- Name: migrations migrations_name_key; Type: CONSTRAINT; Schema: storage; Owner: -
--

ALTER TABLE ONLY "storage"."migrations"
    ADD CONSTRAINT "migrations_name_key" UNIQUE ("name");


--
-- Name: migrations migrations_pkey; Type: CONSTRAINT; Schema: storage; Owner: -
--

ALTER TABLE ONLY "storage"."migrations"
    ADD CONSTRAINT "migrations_pkey" PRIMARY KEY ("id");


--
-- Name: objects objects_pkey; Type: CONSTRAINT; Schema: storage; Owner: -
--

ALTER TABLE ONLY "storage"."objects"
    ADD CONSTRAINT "objects_pkey" PRIMARY KEY ("id");


--
-- Name: s3_multipart_uploads_parts s3_multipart_uploads_parts_pkey; Type: CONSTRAINT; Schema: storage; Owner: -
--

ALTER TABLE ONLY "storage"."s3_multipart_uploads_parts"
    ADD CONSTRAINT "s3_multipart_uploads_parts_pkey" PRIMARY KEY ("id");


--
-- Name: s3_multipart_uploads s3_multipart_uploads_pkey; Type: CONSTRAINT; Schema: storage; Owner: -
--

ALTER TABLE ONLY "storage"."s3_multipart_uploads"
    ADD CONSTRAINT "s3_multipart_uploads_pkey" PRIMARY KEY ("id");


--
-- Name: vector_indexes vector_indexes_pkey; Type: CONSTRAINT; Schema: storage; Owner: -
--

ALTER TABLE ONLY "storage"."vector_indexes"
    ADD CONSTRAINT "vector_indexes_pkey" PRIMARY KEY ("id");


--
-- Name: audit_logs_instance_id_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX "audit_logs_instance_id_idx" ON "auth"."audit_log_entries" USING "btree" ("instance_id");


--
-- Name: confirmation_token_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE UNIQUE INDEX "confirmation_token_idx" ON "auth"."users" USING "btree" ("confirmation_token") WHERE (("confirmation_token")::"text" !~ '^[0-9 ]*$'::"text");


--
-- Name: custom_oauth_providers_created_at_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX "custom_oauth_providers_created_at_idx" ON "auth"."custom_oauth_providers" USING "btree" ("created_at");


--
-- Name: custom_oauth_providers_enabled_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX "custom_oauth_providers_enabled_idx" ON "auth"."custom_oauth_providers" USING "btree" ("enabled");


--
-- Name: custom_oauth_providers_identifier_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX "custom_oauth_providers_identifier_idx" ON "auth"."custom_oauth_providers" USING "btree" ("identifier");


--
-- Name: custom_oauth_providers_provider_type_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX "custom_oauth_providers_provider_type_idx" ON "auth"."custom_oauth_providers" USING "btree" ("provider_type");


--
-- Name: email_change_token_current_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE UNIQUE INDEX "email_change_token_current_idx" ON "auth"."users" USING "btree" ("email_change_token_current") WHERE (("email_change_token_current")::"text" !~ '^[0-9 ]*$'::"text");


--
-- Name: email_change_token_new_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE UNIQUE INDEX "email_change_token_new_idx" ON "auth"."users" USING "btree" ("email_change_token_new") WHERE (("email_change_token_new")::"text" !~ '^[0-9 ]*$'::"text");


--
-- Name: factor_id_created_at_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX "factor_id_created_at_idx" ON "auth"."mfa_factors" USING "btree" ("user_id", "created_at");


--
-- Name: flow_state_created_at_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX "flow_state_created_at_idx" ON "auth"."flow_state" USING "btree" ("created_at" DESC);


--
-- Name: identities_email_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX "identities_email_idx" ON "auth"."identities" USING "btree" ("email" "text_pattern_ops");


--
-- Name: INDEX "identities_email_idx"; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON INDEX "auth"."identities_email_idx" IS 'Auth: Ensures indexed queries on the email column';


--
-- Name: identities_user_id_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX "identities_user_id_idx" ON "auth"."identities" USING "btree" ("user_id");


--
-- Name: idx_auth_code; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX "idx_auth_code" ON "auth"."flow_state" USING "btree" ("auth_code");


--
-- Name: idx_oauth_client_states_created_at; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX "idx_oauth_client_states_created_at" ON "auth"."oauth_client_states" USING "btree" ("created_at");


--
-- Name: idx_user_id_auth_method; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX "idx_user_id_auth_method" ON "auth"."flow_state" USING "btree" ("user_id", "authentication_method");


--
-- Name: mfa_challenge_created_at_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX "mfa_challenge_created_at_idx" ON "auth"."mfa_challenges" USING "btree" ("created_at" DESC);


--
-- Name: mfa_factors_user_friendly_name_unique; Type: INDEX; Schema: auth; Owner: -
--

CREATE UNIQUE INDEX "mfa_factors_user_friendly_name_unique" ON "auth"."mfa_factors" USING "btree" ("friendly_name", "user_id") WHERE (TRIM(BOTH FROM "friendly_name") <> ''::"text");


--
-- Name: mfa_factors_user_id_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX "mfa_factors_user_id_idx" ON "auth"."mfa_factors" USING "btree" ("user_id");


--
-- Name: oauth_auth_pending_exp_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX "oauth_auth_pending_exp_idx" ON "auth"."oauth_authorizations" USING "btree" ("expires_at") WHERE ("status" = 'pending'::"auth"."oauth_authorization_status");


--
-- Name: oauth_clients_deleted_at_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX "oauth_clients_deleted_at_idx" ON "auth"."oauth_clients" USING "btree" ("deleted_at");


--
-- Name: oauth_consents_active_client_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX "oauth_consents_active_client_idx" ON "auth"."oauth_consents" USING "btree" ("client_id") WHERE ("revoked_at" IS NULL);


--
-- Name: oauth_consents_active_user_client_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX "oauth_consents_active_user_client_idx" ON "auth"."oauth_consents" USING "btree" ("user_id", "client_id") WHERE ("revoked_at" IS NULL);


--
-- Name: oauth_consents_user_order_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX "oauth_consents_user_order_idx" ON "auth"."oauth_consents" USING "btree" ("user_id", "granted_at" DESC);


--
-- Name: one_time_tokens_relates_to_hash_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX "one_time_tokens_relates_to_hash_idx" ON "auth"."one_time_tokens" USING "hash" ("relates_to");


--
-- Name: one_time_tokens_token_hash_hash_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX "one_time_tokens_token_hash_hash_idx" ON "auth"."one_time_tokens" USING "hash" ("token_hash");


--
-- Name: one_time_tokens_user_id_token_type_key; Type: INDEX; Schema: auth; Owner: -
--

CREATE UNIQUE INDEX "one_time_tokens_user_id_token_type_key" ON "auth"."one_time_tokens" USING "btree" ("user_id", "token_type");


--
-- Name: reauthentication_token_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE UNIQUE INDEX "reauthentication_token_idx" ON "auth"."users" USING "btree" ("reauthentication_token") WHERE (("reauthentication_token")::"text" !~ '^[0-9 ]*$'::"text");


--
-- Name: recovery_token_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE UNIQUE INDEX "recovery_token_idx" ON "auth"."users" USING "btree" ("recovery_token") WHERE (("recovery_token")::"text" !~ '^[0-9 ]*$'::"text");


--
-- Name: refresh_tokens_instance_id_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX "refresh_tokens_instance_id_idx" ON "auth"."refresh_tokens" USING "btree" ("instance_id");


--
-- Name: refresh_tokens_instance_id_user_id_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX "refresh_tokens_instance_id_user_id_idx" ON "auth"."refresh_tokens" USING "btree" ("instance_id", "user_id");


--
-- Name: refresh_tokens_parent_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX "refresh_tokens_parent_idx" ON "auth"."refresh_tokens" USING "btree" ("parent");


--
-- Name: refresh_tokens_session_id_revoked_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX "refresh_tokens_session_id_revoked_idx" ON "auth"."refresh_tokens" USING "btree" ("session_id", "revoked");


--
-- Name: refresh_tokens_updated_at_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX "refresh_tokens_updated_at_idx" ON "auth"."refresh_tokens" USING "btree" ("updated_at" DESC);


--
-- Name: saml_providers_sso_provider_id_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX "saml_providers_sso_provider_id_idx" ON "auth"."saml_providers" USING "btree" ("sso_provider_id");


--
-- Name: saml_relay_states_created_at_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX "saml_relay_states_created_at_idx" ON "auth"."saml_relay_states" USING "btree" ("created_at" DESC);


--
-- Name: saml_relay_states_for_email_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX "saml_relay_states_for_email_idx" ON "auth"."saml_relay_states" USING "btree" ("for_email");


--
-- Name: saml_relay_states_sso_provider_id_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX "saml_relay_states_sso_provider_id_idx" ON "auth"."saml_relay_states" USING "btree" ("sso_provider_id");


--
-- Name: sessions_not_after_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX "sessions_not_after_idx" ON "auth"."sessions" USING "btree" ("not_after" DESC);


--
-- Name: sessions_oauth_client_id_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX "sessions_oauth_client_id_idx" ON "auth"."sessions" USING "btree" ("oauth_client_id");


--
-- Name: sessions_user_id_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX "sessions_user_id_idx" ON "auth"."sessions" USING "btree" ("user_id");


--
-- Name: sso_domains_domain_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE UNIQUE INDEX "sso_domains_domain_idx" ON "auth"."sso_domains" USING "btree" ("lower"("domain"));


--
-- Name: sso_domains_sso_provider_id_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX "sso_domains_sso_provider_id_idx" ON "auth"."sso_domains" USING "btree" ("sso_provider_id");


--
-- Name: sso_providers_resource_id_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE UNIQUE INDEX "sso_providers_resource_id_idx" ON "auth"."sso_providers" USING "btree" ("lower"("resource_id"));


--
-- Name: sso_providers_resource_id_pattern_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX "sso_providers_resource_id_pattern_idx" ON "auth"."sso_providers" USING "btree" ("resource_id" "text_pattern_ops");


--
-- Name: unique_phone_factor_per_user; Type: INDEX; Schema: auth; Owner: -
--

CREATE UNIQUE INDEX "unique_phone_factor_per_user" ON "auth"."mfa_factors" USING "btree" ("user_id", "phone");


--
-- Name: user_id_created_at_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX "user_id_created_at_idx" ON "auth"."sessions" USING "btree" ("user_id", "created_at");


--
-- Name: users_email_partial_key; Type: INDEX; Schema: auth; Owner: -
--

CREATE UNIQUE INDEX "users_email_partial_key" ON "auth"."users" USING "btree" ("email") WHERE ("is_sso_user" = false);


--
-- Name: INDEX "users_email_partial_key"; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON INDEX "auth"."users_email_partial_key" IS 'Auth: A partial unique index that applies only when is_sso_user is false';


--
-- Name: users_instance_id_email_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX "users_instance_id_email_idx" ON "auth"."users" USING "btree" ("instance_id", "lower"(("email")::"text"));


--
-- Name: users_instance_id_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX "users_instance_id_idx" ON "auth"."users" USING "btree" ("instance_id");


--
-- Name: users_is_anonymous_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX "users_is_anonymous_idx" ON "auth"."users" USING "btree" ("is_anonymous");


--
-- Name: webauthn_challenges_expires_at_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX "webauthn_challenges_expires_at_idx" ON "auth"."webauthn_challenges" USING "btree" ("expires_at");


--
-- Name: webauthn_challenges_user_id_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX "webauthn_challenges_user_id_idx" ON "auth"."webauthn_challenges" USING "btree" ("user_id");


--
-- Name: webauthn_credentials_credential_id_key; Type: INDEX; Schema: auth; Owner: -
--

CREATE UNIQUE INDEX "webauthn_credentials_credential_id_key" ON "auth"."webauthn_credentials" USING "btree" ("credential_id");


--
-- Name: webauthn_credentials_user_id_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX "webauthn_credentials_user_id_idx" ON "auth"."webauthn_credentials" USING "btree" ("user_id");


--
-- Name: _posts_v_created_at_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "_posts_v_created_at_idx" ON "public"."_posts_v" USING "btree" ("created_at");


--
-- Name: _posts_v_latest_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "_posts_v_latest_idx" ON "public"."_posts_v" USING "btree" ("latest");


--
-- Name: _posts_v_parent_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "_posts_v_parent_idx" ON "public"."_posts_v" USING "btree" ("parent_id");


--
-- Name: _posts_v_rels_order_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "_posts_v_rels_order_idx" ON "public"."_posts_v_rels" USING "btree" ("order");


--
-- Name: _posts_v_rels_parent_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "_posts_v_rels_parent_idx" ON "public"."_posts_v_rels" USING "btree" ("parent_id");


--
-- Name: _posts_v_rels_path_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "_posts_v_rels_path_idx" ON "public"."_posts_v_rels" USING "btree" ("path");


--
-- Name: _posts_v_rels_post_categories_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "_posts_v_rels_post_categories_id_idx" ON "public"."_posts_v_rels" USING "btree" ("post_categories_id");


--
-- Name: _posts_v_updated_at_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "_posts_v_updated_at_idx" ON "public"."_posts_v" USING "btree" ("updated_at");


--
-- Name: _posts_v_version_tags_order_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "_posts_v_version_tags_order_idx" ON "public"."_posts_v_version_tags" USING "btree" ("_order");


--
-- Name: _posts_v_version_tags_parent_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "_posts_v_version_tags_parent_id_idx" ON "public"."_posts_v_version_tags" USING "btree" ("_parent_id");


--
-- Name: _posts_v_version_version__status_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "_posts_v_version_version__status_idx" ON "public"."_posts_v" USING "btree" ("version__status");


--
-- Name: _posts_v_version_version_author_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "_posts_v_version_version_author_idx" ON "public"."_posts_v" USING "btree" ("version_author_id");


--
-- Name: _posts_v_version_version_created_at_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "_posts_v_version_version_created_at_idx" ON "public"."_posts_v" USING "btree" ("version_created_at");


--
-- Name: _posts_v_version_version_featured_image_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "_posts_v_version_version_featured_image_idx" ON "public"."_posts_v" USING "btree" ("version_featured_image_id");


--
-- Name: _posts_v_version_version_slug_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "_posts_v_version_version_slug_idx" ON "public"."_posts_v" USING "btree" ("version_slug");


--
-- Name: _posts_v_version_version_updated_at_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "_posts_v_version_version_updated_at_idx" ON "public"."_posts_v" USING "btree" ("version_updated_at");


--
-- Name: admins_created_at_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "admins_created_at_idx" ON "public"."admins" USING "btree" ("created_at");


--
-- Name: admins_updated_at_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "admins_updated_at_idx" ON "public"."admins" USING "btree" ("updated_at");


--
-- Name: admins_user_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "admins_user_idx" ON "public"."admins" USING "btree" ("user_id");


--
-- Name: announcements_course_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "announcements_course_idx" ON "public"."announcements" USING "btree" ("course_id");


--
-- Name: announcements_created_at_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "announcements_created_at_idx" ON "public"."announcements" USING "btree" ("created_at");


--
-- Name: announcements_created_by_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "announcements_created_by_idx" ON "public"."announcements" USING "btree" ("created_by_id");


--
-- Name: announcements_updated_at_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "announcements_updated_at_idx" ON "public"."announcements" USING "btree" ("updated_at");


--
-- Name: assessment_submissions_assessment_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "assessment_submissions_assessment_idx" ON "public"."assessment_submissions" USING "btree" ("assessment_id");


--
-- Name: assessment_submissions_course_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "assessment_submissions_course_idx" ON "public"."assessment_submissions" USING "btree" ("course_id");


--
-- Name: assessment_submissions_created_at_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "assessment_submissions_created_at_idx" ON "public"."assessment_submissions" USING "btree" ("created_at");


--
-- Name: assessment_submissions_enrollment_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "assessment_submissions_enrollment_idx" ON "public"."assessment_submissions" USING "btree" ("enrollment_id");


--
-- Name: assessment_submissions_trainee_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "assessment_submissions_trainee_idx" ON "public"."assessment_submissions" USING "btree" ("trainee_id");


--
-- Name: assessment_submissions_updated_at_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "assessment_submissions_updated_at_idx" ON "public"."assessment_submissions" USING "btree" ("updated_at");


--
-- Name: assessments_course_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "assessments_course_idx" ON "public"."assessments" USING "btree" ("course_id");


--
-- Name: assessments_created_at_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "assessments_created_at_idx" ON "public"."assessments" USING "btree" ("created_at");


--
-- Name: assessments_items_order_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "assessments_items_order_idx" ON "public"."assessments_items" USING "btree" ("_order");


--
-- Name: assessments_items_parent_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "assessments_items_parent_id_idx" ON "public"."assessments_items" USING "btree" ("_parent_id");


--
-- Name: assessments_items_question_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "assessments_items_question_idx" ON "public"."assessments_items" USING "btree" ("question_id");


--
-- Name: assessments_module_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "assessments_module_idx" ON "public"."assessments" USING "btree" ("module_id");


--
-- Name: assessments_updated_at_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "assessments_updated_at_idx" ON "public"."assessments" USING "btree" ("updated_at");


--
-- Name: assignment_submissions_assignment_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "assignment_submissions_assignment_idx" ON "public"."assignment_submissions" USING "btree" ("assignment_id");


--
-- Name: assignment_submissions_created_at_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "assignment_submissions_created_at_idx" ON "public"."assignment_submissions" USING "btree" ("created_at");


--
-- Name: assignment_submissions_enrollment_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "assignment_submissions_enrollment_idx" ON "public"."assignment_submissions" USING "btree" ("enrollment_id");


--
-- Name: assignment_submissions_graded_by_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "assignment_submissions_graded_by_idx" ON "public"."assignment_submissions" USING "btree" ("graded_by_id");


--
-- Name: assignment_submissions_rels_media_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "assignment_submissions_rels_media_id_idx" ON "public"."assignment_submissions_rels" USING "btree" ("media_id");


--
-- Name: assignment_submissions_rels_order_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "assignment_submissions_rels_order_idx" ON "public"."assignment_submissions_rels" USING "btree" ("order");


--
-- Name: assignment_submissions_rels_parent_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "assignment_submissions_rels_parent_idx" ON "public"."assignment_submissions_rels" USING "btree" ("parent_id");


--
-- Name: assignment_submissions_rels_path_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "assignment_submissions_rels_path_idx" ON "public"."assignment_submissions_rels" USING "btree" ("path");


--
-- Name: assignment_submissions_status_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "assignment_submissions_status_idx" ON "public"."assignment_submissions" USING "btree" ("status");


--
-- Name: assignment_submissions_trainee_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "assignment_submissions_trainee_idx" ON "public"."assignment_submissions" USING "btree" ("trainee_id");


--
-- Name: assignment_submissions_updated_at_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "assignment_submissions_updated_at_idx" ON "public"."assignment_submissions" USING "btree" ("updated_at");


--
-- Name: assignments_allowed_file_types_order_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "assignments_allowed_file_types_order_idx" ON "public"."assignments_allowed_file_types" USING "btree" ("order");


--
-- Name: assignments_allowed_file_types_parent_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "assignments_allowed_file_types_parent_idx" ON "public"."assignments_allowed_file_types" USING "btree" ("parent_id");


--
-- Name: assignments_created_at_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "assignments_created_at_idx" ON "public"."assignments" USING "btree" ("created_at");


--
-- Name: assignments_rels_media_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "assignments_rels_media_id_idx" ON "public"."assignments_rels" USING "btree" ("media_id");


--
-- Name: assignments_rels_order_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "assignments_rels_order_idx" ON "public"."assignments_rels" USING "btree" ("order");


--
-- Name: assignments_rels_parent_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "assignments_rels_parent_idx" ON "public"."assignments_rels" USING "btree" ("parent_id");


--
-- Name: assignments_rels_path_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "assignments_rels_path_idx" ON "public"."assignments_rels" USING "btree" ("path");


--
-- Name: assignments_updated_at_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "assignments_updated_at_idx" ON "public"."assignments" USING "btree" ("updated_at");


--
-- Name: certificate_templates_background_image_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "certificate_templates_background_image_idx" ON "public"."certificate_templates" USING "btree" ("background_image_id");


--
-- Name: certificate_templates_created_at_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "certificate_templates_created_at_idx" ON "public"."certificate_templates" USING "btree" ("created_at");


--
-- Name: certificate_templates_slug_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "certificate_templates_slug_idx" ON "public"."certificate_templates" USING "btree" ("slug");


--
-- Name: certificate_templates_updated_at_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "certificate_templates_updated_at_idx" ON "public"."certificate_templates" USING "btree" ("updated_at");


--
-- Name: certificates_certificate_code_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "certificates_certificate_code_idx" ON "public"."certificates" USING "btree" ("certificate_code");


--
-- Name: certificates_course_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "certificates_course_idx" ON "public"."certificates" USING "btree" ("course_id");


--
-- Name: certificates_created_at_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "certificates_created_at_idx" ON "public"."certificates" USING "btree" ("created_at");


--
-- Name: certificates_enrollment_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "certificates_enrollment_idx" ON "public"."certificates" USING "btree" ("enrollment_id");


--
-- Name: certificates_file_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "certificates_file_idx" ON "public"."certificates" USING "btree" ("file_id");


--
-- Name: certificates_trainee_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "certificates_trainee_idx" ON "public"."certificates" USING "btree" ("trainee_id");


--
-- Name: certificates_updated_at_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "certificates_updated_at_idx" ON "public"."certificates" USING "btree" ("updated_at");


--
-- Name: chat_message_status_created_at_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "chat_message_status_created_at_idx" ON "public"."chat_message_status" USING "btree" ("created_at");


--
-- Name: chat_message_status_message_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "chat_message_status_message_idx" ON "public"."chat_message_status" USING "btree" ("message_id");


--
-- Name: chat_message_status_updated_at_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "chat_message_status_updated_at_idx" ON "public"."chat_message_status" USING "btree" ("updated_at");


--
-- Name: chat_message_status_user_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "chat_message_status_user_idx" ON "public"."chat_message_status" USING "btree" ("user_id");


--
-- Name: chat_messages_chat_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "chat_messages_chat_idx" ON "public"."chat_messages" USING "btree" ("chat_id");


--
-- Name: chat_messages_created_at_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "chat_messages_created_at_idx" ON "public"."chat_messages" USING "btree" ("created_at");


--
-- Name: chat_messages_reactions_order_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "chat_messages_reactions_order_idx" ON "public"."chat_messages_reactions" USING "btree" ("_order");


--
-- Name: chat_messages_reactions_parent_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "chat_messages_reactions_parent_id_idx" ON "public"."chat_messages_reactions" USING "btree" ("_parent_id");


--
-- Name: chat_messages_reactions_user_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "chat_messages_reactions_user_idx" ON "public"."chat_messages_reactions" USING "btree" ("user_id");


--
-- Name: chat_messages_rels_media_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "chat_messages_rels_media_id_idx" ON "public"."chat_messages_rels" USING "btree" ("media_id");


--
-- Name: chat_messages_rels_order_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "chat_messages_rels_order_idx" ON "public"."chat_messages_rels" USING "btree" ("order");


--
-- Name: chat_messages_rels_parent_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "chat_messages_rels_parent_idx" ON "public"."chat_messages_rels" USING "btree" ("parent_id");


--
-- Name: chat_messages_rels_path_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "chat_messages_rels_path_idx" ON "public"."chat_messages_rels" USING "btree" ("path");


--
-- Name: chat_messages_reply_to_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "chat_messages_reply_to_idx" ON "public"."chat_messages" USING "btree" ("reply_to_id");


--
-- Name: chat_messages_sender_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "chat_messages_sender_idx" ON "public"."chat_messages" USING "btree" ("sender_id");


--
-- Name: chat_messages_updated_at_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "chat_messages_updated_at_idx" ON "public"."chat_messages" USING "btree" ("updated_at");


--
-- Name: chat_typing_status_chat_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "chat_typing_status_chat_idx" ON "public"."chat_typing_status" USING "btree" ("chat_id");


--
-- Name: chat_typing_status_created_at_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "chat_typing_status_created_at_idx" ON "public"."chat_typing_status" USING "btree" ("created_at");


--
-- Name: chat_typing_status_user_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "chat_typing_status_user_idx" ON "public"."chat_typing_status" USING "btree" ("user_id");


--
-- Name: chats_created_at_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "chats_created_at_idx" ON "public"."chats" USING "btree" ("created_at");


--
-- Name: chats_created_by_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "chats_created_by_idx" ON "public"."chats" USING "btree" ("created_by_id");


--
-- Name: chats_rels_order_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "chats_rels_order_idx" ON "public"."chats_rels" USING "btree" ("order");


--
-- Name: chats_rels_parent_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "chats_rels_parent_idx" ON "public"."chats_rels" USING "btree" ("parent_id");


--
-- Name: chats_rels_path_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "chats_rels_path_idx" ON "public"."chats_rels" USING "btree" ("path");


--
-- Name: chats_rels_users_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "chats_rels_users_id_idx" ON "public"."chats_rels" USING "btree" ("users_id");


--
-- Name: chats_updated_at_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "chats_updated_at_idx" ON "public"."chats" USING "btree" ("updated_at");


--
-- Name: coupon_codes_allowed_emails_order_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "coupon_codes_allowed_emails_order_idx" ON "public"."coupon_codes_allowed_emails" USING "btree" ("_order");


--
-- Name: coupon_codes_allowed_emails_parent_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "coupon_codes_allowed_emails_parent_id_idx" ON "public"."coupon_codes_allowed_emails" USING "btree" ("_parent_id");


--
-- Name: coupon_codes_code_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "coupon_codes_code_idx" ON "public"."coupon_codes" USING "btree" ("code");


--
-- Name: coupon_codes_created_at_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "coupon_codes_created_at_idx" ON "public"."coupon_codes" USING "btree" ("created_at");


--
-- Name: coupon_codes_expires_at_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "coupon_codes_expires_at_idx" ON "public"."coupon_codes" USING "btree" ("expires_at");


--
-- Name: coupon_codes_rels_course_categories_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "coupon_codes_rels_course_categories_id_idx" ON "public"."coupon_codes_rels" USING "btree" ("course_categories_id");


--
-- Name: coupon_codes_rels_courses_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "coupon_codes_rels_courses_id_idx" ON "public"."coupon_codes_rels" USING "btree" ("courses_id");


--
-- Name: coupon_codes_rels_order_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "coupon_codes_rels_order_idx" ON "public"."coupon_codes_rels" USING "btree" ("order");


--
-- Name: coupon_codes_rels_parent_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "coupon_codes_rels_parent_idx" ON "public"."coupon_codes_rels" USING "btree" ("parent_id");


--
-- Name: coupon_codes_rels_path_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "coupon_codes_rels_path_idx" ON "public"."coupon_codes_rels" USING "btree" ("path");


--
-- Name: coupon_codes_rels_trainees_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "coupon_codes_rels_trainees_id_idx" ON "public"."coupon_codes_rels" USING "btree" ("trainees_id");


--
-- Name: coupon_codes_starts_at_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "coupon_codes_starts_at_idx" ON "public"."coupon_codes" USING "btree" ("starts_at");


--
-- Name: coupon_codes_status_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "coupon_codes_status_idx" ON "public"."coupon_codes" USING "btree" ("status");


--
-- Name: coupon_codes_updated_at_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "coupon_codes_updated_at_idx" ON "public"."coupon_codes" USING "btree" ("updated_at");


--
-- Name: coupon_redemptions_applied_at_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "coupon_redemptions_applied_at_idx" ON "public"."coupon_redemptions" USING "btree" ("applied_at");


--
-- Name: coupon_redemptions_code_snapshot_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "coupon_redemptions_code_snapshot_idx" ON "public"."coupon_redemptions" USING "btree" ("code_snapshot");


--
-- Name: coupon_redemptions_coupon_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "coupon_redemptions_coupon_idx" ON "public"."coupon_redemptions" USING "btree" ("coupon_id");


--
-- Name: coupon_redemptions_course_enrollment_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "coupon_redemptions_course_enrollment_idx" ON "public"."coupon_redemptions" USING "btree" ("course_enrollment_id");


--
-- Name: coupon_redemptions_course_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "coupon_redemptions_course_idx" ON "public"."coupon_redemptions" USING "btree" ("course_id");


--
-- Name: coupon_redemptions_created_at_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "coupon_redemptions_created_at_idx" ON "public"."coupon_redemptions" USING "btree" ("created_at");


--
-- Name: coupon_redemptions_status_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "coupon_redemptions_status_idx" ON "public"."coupon_redemptions" USING "btree" ("status");


--
-- Name: coupon_redemptions_trainee_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "coupon_redemptions_trainee_idx" ON "public"."coupon_redemptions" USING "btree" ("trainee_id");


--
-- Name: coupon_redemptions_updated_at_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "coupon_redemptions_updated_at_idx" ON "public"."coupon_redemptions" USING "btree" ("updated_at");


--
-- Name: coupon_redemptions_user_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "coupon_redemptions_user_idx" ON "public"."coupon_redemptions" USING "btree" ("user_id");


--
-- Name: course_categories_created_at_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "course_categories_created_at_idx" ON "public"."course_categories" USING "btree" ("created_at");


--
-- Name: course_categories_icon_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "course_categories_icon_idx" ON "public"."course_categories" USING "btree" ("icon_id");


--
-- Name: course_categories_parent_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "course_categories_parent_idx" ON "public"."course_categories" USING "btree" ("parent_id");


--
-- Name: course_categories_slug_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "course_categories_slug_idx" ON "public"."course_categories" USING "btree" ("slug");


--
-- Name: course_categories_updated_at_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "course_categories_updated_at_idx" ON "public"."course_categories" USING "btree" ("updated_at");


--
-- Name: course_enrollments_coupon_code_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "course_enrollments_coupon_code_idx" ON "public"."course_enrollments" USING "btree" ("coupon_code");


--
-- Name: course_enrollments_coupon_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "course_enrollments_coupon_idx" ON "public"."course_enrollments" USING "btree" ("coupon_id");


--
-- Name: course_enrollments_course_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "course_enrollments_course_idx" ON "public"."course_enrollments" USING "btree" ("course_id");


--
-- Name: course_enrollments_created_at_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "course_enrollments_created_at_idx" ON "public"."course_enrollments" USING "btree" ("created_at");


--
-- Name: course_enrollments_enrolled_by_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "course_enrollments_enrolled_by_idx" ON "public"."course_enrollments" USING "btree" ("enrolled_by_id");


--
-- Name: course_enrollments_student_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "course_enrollments_student_idx" ON "public"."course_enrollments" USING "btree" ("student_id");


--
-- Name: course_enrollments_updated_at_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "course_enrollments_updated_at_idx" ON "public"."course_enrollments" USING "btree" ("updated_at");


--
-- Name: course_item_progress_course_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "course_item_progress_course_idx" ON "public"."course_item_progress" USING "btree" ("course_id");


--
-- Name: course_item_progress_created_at_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "course_item_progress_created_at_idx" ON "public"."course_item_progress" USING "btree" ("created_at");


--
-- Name: course_item_progress_enrollment_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "course_item_progress_enrollment_idx" ON "public"."course_item_progress" USING "btree" ("enrollment_id");


--
-- Name: course_item_progress_is_completed_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "course_item_progress_is_completed_idx" ON "public"."course_item_progress" USING "btree" ("is_completed");


--
-- Name: course_item_progress_last_accessed_at_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "course_item_progress_last_accessed_at_idx" ON "public"."course_item_progress" USING "btree" ("last_accessed_at");


--
-- Name: course_item_progress_rels_assessments_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "course_item_progress_rels_assessments_id_idx" ON "public"."course_item_progress_rels" USING "btree" ("assessments_id");


--
-- Name: course_item_progress_rels_assignments_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "course_item_progress_rels_assignments_id_idx" ON "public"."course_item_progress_rels" USING "btree" ("assignments_id");


--
-- Name: course_item_progress_rels_course_lessons_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "course_item_progress_rels_course_lessons_id_idx" ON "public"."course_item_progress_rels" USING "btree" ("course_lessons_id");


--
-- Name: course_item_progress_rels_order_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "course_item_progress_rels_order_idx" ON "public"."course_item_progress_rels" USING "btree" ("order");


--
-- Name: course_item_progress_rels_parent_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "course_item_progress_rels_parent_idx" ON "public"."course_item_progress_rels" USING "btree" ("parent_id");


--
-- Name: course_item_progress_rels_path_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "course_item_progress_rels_path_idx" ON "public"."course_item_progress_rels" USING "btree" ("path");


--
-- Name: course_item_progress_status_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "course_item_progress_status_idx" ON "public"."course_item_progress" USING "btree" ("status");


--
-- Name: course_item_progress_trainee_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "course_item_progress_trainee_idx" ON "public"."course_item_progress" USING "btree" ("trainee_id");


--
-- Name: course_item_progress_updated_at_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "course_item_progress_updated_at_idx" ON "public"."course_item_progress" USING "btree" ("updated_at");


--
-- Name: course_lessons_created_at_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "course_lessons_created_at_idx" ON "public"."course_lessons" USING "btree" ("created_at");


--
-- Name: course_lessons_module_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "course_lessons_module_idx" ON "public"."course_lessons" USING "btree" ("module_id");


--
-- Name: course_lessons_updated_at_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "course_lessons_updated_at_idx" ON "public"."course_lessons" USING "btree" ("updated_at");


--
-- Name: course_materials_course_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "course_materials_course_idx" ON "public"."course_materials" USING "btree" ("course_id");


--
-- Name: course_materials_created_at_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "course_materials_created_at_idx" ON "public"."course_materials" USING "btree" ("created_at");


--
-- Name: course_materials_material_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "course_materials_material_idx" ON "public"."course_materials" USING "btree" ("material_id");


--
-- Name: course_materials_updated_at_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "course_materials_updated_at_idx" ON "public"."course_materials" USING "btree" ("updated_at");


--
-- Name: course_modules_created_at_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "course_modules_created_at_idx" ON "public"."course_modules" USING "btree" ("created_at");


--
-- Name: course_modules_rels_assessments_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "course_modules_rels_assessments_id_idx" ON "public"."course_modules_rels" USING "btree" ("assessments_id");


--
-- Name: course_modules_rels_assignments_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "course_modules_rels_assignments_id_idx" ON "public"."course_modules_rels" USING "btree" ("assignments_id");


--
-- Name: course_modules_rels_course_lessons_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "course_modules_rels_course_lessons_id_idx" ON "public"."course_modules_rels" USING "btree" ("course_lessons_id");


--
-- Name: course_modules_rels_order_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "course_modules_rels_order_idx" ON "public"."course_modules_rels" USING "btree" ("order");


--
-- Name: course_modules_rels_parent_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "course_modules_rels_parent_idx" ON "public"."course_modules_rels" USING "btree" ("parent_id");


--
-- Name: course_modules_rels_path_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "course_modules_rels_path_idx" ON "public"."course_modules_rels" USING "btree" ("path");


--
-- Name: course_modules_updated_at_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "course_modules_updated_at_idx" ON "public"."course_modules" USING "btree" ("updated_at");


--
-- Name: courses_banner_image_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "courses_banner_image_idx" ON "public"."courses" USING "btree" ("banner_image_id");


--
-- Name: courses_certificate_template_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "courses_certificate_template_idx" ON "public"."courses" USING "btree" ("certificate_template_id");


--
-- Name: courses_course_code_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "courses_course_code_idx" ON "public"."courses" USING "btree" ("course_code");


--
-- Name: courses_created_at_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "courses_created_at_idx" ON "public"."courses" USING "btree" ("created_at");


--
-- Name: courses_feedback_form_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "courses_feedback_form_idx" ON "public"."courses" USING "btree" ("feedback_form_id");


--
-- Name: courses_instructor_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "courses_instructor_idx" ON "public"."courses" USING "btree" ("instructor_id");


--
-- Name: courses_learning_objectives_order_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "courses_learning_objectives_order_idx" ON "public"."courses_learning_objectives" USING "btree" ("_order");


--
-- Name: courses_learning_objectives_parent_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "courses_learning_objectives_parent_id_idx" ON "public"."courses_learning_objectives" USING "btree" ("_parent_id");


--
-- Name: courses_prerequisites_order_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "courses_prerequisites_order_idx" ON "public"."courses_prerequisites" USING "btree" ("_order");


--
-- Name: courses_prerequisites_parent_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "courses_prerequisites_parent_id_idx" ON "public"."courses_prerequisites" USING "btree" ("_parent_id");


--
-- Name: courses_rels_course_categories_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "courses_rels_course_categories_id_idx" ON "public"."courses_rels" USING "btree" ("course_categories_id");


--
-- Name: courses_rels_course_modules_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "courses_rels_course_modules_id_idx" ON "public"."courses_rels" USING "btree" ("course_modules_id");


--
-- Name: courses_rels_instructors_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "courses_rels_instructors_id_idx" ON "public"."courses_rels" USING "btree" ("instructors_id");


--
-- Name: courses_rels_order_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "courses_rels_order_idx" ON "public"."courses_rels" USING "btree" ("order");


--
-- Name: courses_rels_parent_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "courses_rels_parent_idx" ON "public"."courses_rels" USING "btree" ("parent_id");


--
-- Name: courses_rels_path_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "courses_rels_path_idx" ON "public"."courses_rels" USING "btree" ("path");


--
-- Name: courses_thumbnail_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "courses_thumbnail_idx" ON "public"."courses" USING "btree" ("thumbnail_id");


--
-- Name: courses_updated_at_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "courses_updated_at_idx" ON "public"."courses" USING "btree" ("updated_at");


--
-- Name: emergency_contacts_created_at_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "emergency_contacts_created_at_idx" ON "public"."emergency_contacts" USING "btree" ("created_at");


--
-- Name: emergency_contacts_updated_at_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "emergency_contacts_updated_at_idx" ON "public"."emergency_contacts" USING "btree" ("updated_at");


--
-- Name: emergency_contacts_user_id_unique_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "emergency_contacts_user_id_unique_idx" ON "public"."emergency_contacts" USING "btree" ("user_id");


--
-- Name: emergency_contacts_user_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "emergency_contacts_user_idx" ON "public"."emergency_contacts" USING "btree" ("user_id");


--
-- Name: enrollment_isCompleted_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "enrollment_isCompleted_idx" ON "public"."course_item_progress" USING "btree" ("enrollment_id", "is_completed");


--
-- Name: feedback_forms_blocks_choice_input_options_order_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "feedback_forms_blocks_choice_input_options_order_idx" ON "public"."feedback_forms_blocks_choice_input_options" USING "btree" ("_order");


--
-- Name: feedback_forms_blocks_choice_input_options_parent_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "feedback_forms_blocks_choice_input_options_parent_id_idx" ON "public"."feedback_forms_blocks_choice_input_options" USING "btree" ("_parent_id");


--
-- Name: feedback_forms_blocks_choice_input_order_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "feedback_forms_blocks_choice_input_order_idx" ON "public"."feedback_forms_blocks_choice_input" USING "btree" ("_order");


--
-- Name: feedback_forms_blocks_choice_input_parent_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "feedback_forms_blocks_choice_input_parent_id_idx" ON "public"."feedback_forms_blocks_choice_input" USING "btree" ("_parent_id");


--
-- Name: feedback_forms_blocks_choice_input_path_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "feedback_forms_blocks_choice_input_path_idx" ON "public"."feedback_forms_blocks_choice_input" USING "btree" ("_path");


--
-- Name: feedback_forms_blocks_survey_matrix_columns_order_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "feedback_forms_blocks_survey_matrix_columns_order_idx" ON "public"."feedback_forms_blocks_survey_matrix_columns" USING "btree" ("_order");


--
-- Name: feedback_forms_blocks_survey_matrix_columns_parent_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "feedback_forms_blocks_survey_matrix_columns_parent_id_idx" ON "public"."feedback_forms_blocks_survey_matrix_columns" USING "btree" ("_parent_id");


--
-- Name: feedback_forms_blocks_survey_matrix_order_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "feedback_forms_blocks_survey_matrix_order_idx" ON "public"."feedback_forms_blocks_survey_matrix" USING "btree" ("_order");


--
-- Name: feedback_forms_blocks_survey_matrix_parent_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "feedback_forms_blocks_survey_matrix_parent_id_idx" ON "public"."feedback_forms_blocks_survey_matrix" USING "btree" ("_parent_id");


--
-- Name: feedback_forms_blocks_survey_matrix_path_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "feedback_forms_blocks_survey_matrix_path_idx" ON "public"."feedback_forms_blocks_survey_matrix" USING "btree" ("_path");


--
-- Name: feedback_forms_blocks_survey_matrix_rows_order_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "feedback_forms_blocks_survey_matrix_rows_order_idx" ON "public"."feedback_forms_blocks_survey_matrix_rows" USING "btree" ("_order");


--
-- Name: feedback_forms_blocks_survey_matrix_rows_parent_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "feedback_forms_blocks_survey_matrix_rows_parent_id_idx" ON "public"."feedback_forms_blocks_survey_matrix_rows" USING "btree" ("_parent_id");


--
-- Name: feedback_forms_blocks_text_input_order_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "feedback_forms_blocks_text_input_order_idx" ON "public"."feedback_forms_blocks_text_input" USING "btree" ("_order");


--
-- Name: feedback_forms_blocks_text_input_parent_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "feedback_forms_blocks_text_input_parent_id_idx" ON "public"."feedback_forms_blocks_text_input" USING "btree" ("_parent_id");


--
-- Name: feedback_forms_blocks_text_input_path_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "feedback_forms_blocks_text_input_path_idx" ON "public"."feedback_forms_blocks_text_input" USING "btree" ("_path");


--
-- Name: feedback_forms_created_at_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "feedback_forms_created_at_idx" ON "public"."feedback_forms" USING "btree" ("created_at");


--
-- Name: feedback_forms_updated_at_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "feedback_forms_updated_at_idx" ON "public"."feedback_forms" USING "btree" ("updated_at");


--
-- Name: feedback_submissions_course_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "feedback_submissions_course_idx" ON "public"."feedback_submissions" USING "btree" ("course_id");


--
-- Name: feedback_submissions_created_at_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "feedback_submissions_created_at_idx" ON "public"."feedback_submissions" USING "btree" ("created_at");


--
-- Name: feedback_submissions_form_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "feedback_submissions_form_idx" ON "public"."feedback_submissions" USING "btree" ("form_id");


--
-- Name: feedback_submissions_trainee_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "feedback_submissions_trainee_idx" ON "public"."feedback_submissions" USING "btree" ("trainee_id");


--
-- Name: feedback_submissions_updated_at_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "feedback_submissions_updated_at_idx" ON "public"."feedback_submissions" USING "btree" ("updated_at");


--
-- Name: instructors_created_at_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "instructors_created_at_idx" ON "public"."instructors" USING "btree" ("created_at");


--
-- Name: instructors_updated_at_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "instructors_updated_at_idx" ON "public"."instructors" USING "btree" ("updated_at");


--
-- Name: instructors_user_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "instructors_user_idx" ON "public"."instructors" USING "btree" ("user_id");


--
-- Name: lesson_materials_created_at_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "lesson_materials_created_at_idx" ON "public"."lesson_materials" USING "btree" ("created_at");


--
-- Name: lesson_materials_lesson_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "lesson_materials_lesson_idx" ON "public"."lesson_materials" USING "btree" ("lesson_id");


--
-- Name: lesson_materials_material_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "lesson_materials_material_idx" ON "public"."lesson_materials" USING "btree" ("material_id");


--
-- Name: lesson_materials_updated_at_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "lesson_materials_updated_at_idx" ON "public"."lesson_materials" USING "btree" ("updated_at");


--
-- Name: materials_created_at_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "materials_created_at_idx" ON "public"."materials" USING "btree" ("created_at");


--
-- Name: materials_rels_media_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "materials_rels_media_id_idx" ON "public"."materials_rels" USING "btree" ("media_id");


--
-- Name: materials_rels_order_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "materials_rels_order_idx" ON "public"."materials_rels" USING "btree" ("order");


--
-- Name: materials_rels_parent_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "materials_rels_parent_idx" ON "public"."materials_rels" USING "btree" ("parent_id");


--
-- Name: materials_rels_path_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "materials_rels_path_idx" ON "public"."materials_rels" USING "btree" ("path");


--
-- Name: materials_updated_at_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "materials_updated_at_idx" ON "public"."materials" USING "btree" ("updated_at");


--
-- Name: media_created_at_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "media_created_at_idx" ON "public"."media" USING "btree" ("created_at");


--
-- Name: media_filename_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "media_filename_idx" ON "public"."media" USING "btree" ("filename");


--
-- Name: media_updated_at_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "media_updated_at_idx" ON "public"."media" USING "btree" ("updated_at");


--
-- Name: notification_templates_channels_order_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "notification_templates_channels_order_idx" ON "public"."notification_templates_channels" USING "btree" ("order");


--
-- Name: notification_templates_channels_parent_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "notification_templates_channels_parent_idx" ON "public"."notification_templates_channels" USING "btree" ("parent_id");


--
-- Name: notification_templates_code_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "notification_templates_code_idx" ON "public"."notification_templates" USING "btree" ("code");


--
-- Name: notification_templates_created_at_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "notification_templates_created_at_idx" ON "public"."notification_templates" USING "btree" ("created_at");


--
-- Name: notification_templates_updated_at_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "notification_templates_updated_at_idx" ON "public"."notification_templates" USING "btree" ("updated_at");


--
-- Name: notifications_actor_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "notifications_actor_idx" ON "public"."notifications" USING "btree" ("actor_id");


--
-- Name: notifications_created_at_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "notifications_created_at_idx" ON "public"."notifications" USING "btree" ("created_at");


--
-- Name: notifications_rels_order_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "notifications_rels_order_idx" ON "public"."notifications_rels" USING "btree" ("order");


--
-- Name: notifications_rels_parent_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "notifications_rels_parent_idx" ON "public"."notifications_rels" USING "btree" ("parent_id");


--
-- Name: notifications_rels_path_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "notifications_rels_path_idx" ON "public"."notifications_rels" USING "btree" ("path");


--
-- Name: notifications_rels_users_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "notifications_rels_users_id_idx" ON "public"."notifications_rels" USING "btree" ("users_id");


--
-- Name: notifications_template_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "notifications_template_idx" ON "public"."notifications" USING "btree" ("template_id");


--
-- Name: notifications_updated_at_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "notifications_updated_at_idx" ON "public"."notifications" USING "btree" ("updated_at");


--
-- Name: payload_kv_key_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "payload_kv_key_idx" ON "public"."payload_kv" USING "btree" ("key");


--
-- Name: payload_locked_documents_created_at_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "payload_locked_documents_created_at_idx" ON "public"."payload_locked_documents" USING "btree" ("created_at");


--
-- Name: payload_locked_documents_global_slug_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "payload_locked_documents_global_slug_idx" ON "public"."payload_locked_documents" USING "btree" ("global_slug");


--
-- Name: payload_locked_documents_rels_admins_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "payload_locked_documents_rels_admins_id_idx" ON "public"."payload_locked_documents_rels" USING "btree" ("admins_id");


--
-- Name: payload_locked_documents_rels_announcements_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "payload_locked_documents_rels_announcements_id_idx" ON "public"."payload_locked_documents_rels" USING "btree" ("announcements_id");


--
-- Name: payload_locked_documents_rels_assessment_submissions_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "payload_locked_documents_rels_assessment_submissions_id_idx" ON "public"."payload_locked_documents_rels" USING "btree" ("assessment_submissions_id");


--
-- Name: payload_locked_documents_rels_assessments_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "payload_locked_documents_rels_assessments_id_idx" ON "public"."payload_locked_documents_rels" USING "btree" ("assessments_id");


--
-- Name: payload_locked_documents_rels_assignment_submissions_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "payload_locked_documents_rels_assignment_submissions_id_idx" ON "public"."payload_locked_documents_rels" USING "btree" ("assignment_submissions_id");


--
-- Name: payload_locked_documents_rels_assignments_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "payload_locked_documents_rels_assignments_id_idx" ON "public"."payload_locked_documents_rels" USING "btree" ("assignments_id");


--
-- Name: payload_locked_documents_rels_certificate_templates_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "payload_locked_documents_rels_certificate_templates_id_idx" ON "public"."payload_locked_documents_rels" USING "btree" ("certificate_templates_id");


--
-- Name: payload_locked_documents_rels_certificates_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "payload_locked_documents_rels_certificates_id_idx" ON "public"."payload_locked_documents_rels" USING "btree" ("certificates_id");


--
-- Name: payload_locked_documents_rels_chat_message_status_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "payload_locked_documents_rels_chat_message_status_id_idx" ON "public"."payload_locked_documents_rels" USING "btree" ("chat_message_status_id");


--
-- Name: payload_locked_documents_rels_chat_messages_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "payload_locked_documents_rels_chat_messages_id_idx" ON "public"."payload_locked_documents_rels" USING "btree" ("chat_messages_id");


--
-- Name: payload_locked_documents_rels_chat_typing_status_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "payload_locked_documents_rels_chat_typing_status_id_idx" ON "public"."payload_locked_documents_rels" USING "btree" ("chat_typing_status_id");


--
-- Name: payload_locked_documents_rels_chats_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "payload_locked_documents_rels_chats_id_idx" ON "public"."payload_locked_documents_rels" USING "btree" ("chats_id");


--
-- Name: payload_locked_documents_rels_coupon_codes_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "payload_locked_documents_rels_coupon_codes_id_idx" ON "public"."payload_locked_documents_rels" USING "btree" ("coupon_codes_id");


--
-- Name: payload_locked_documents_rels_coupon_redemptions_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "payload_locked_documents_rels_coupon_redemptions_id_idx" ON "public"."payload_locked_documents_rels" USING "btree" ("coupon_redemptions_id");


--
-- Name: payload_locked_documents_rels_course_categories_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "payload_locked_documents_rels_course_categories_id_idx" ON "public"."payload_locked_documents_rels" USING "btree" ("course_categories_id");


--
-- Name: payload_locked_documents_rels_course_enrollments_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "payload_locked_documents_rels_course_enrollments_id_idx" ON "public"."payload_locked_documents_rels" USING "btree" ("course_enrollments_id");


--
-- Name: payload_locked_documents_rels_course_item_progress_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "payload_locked_documents_rels_course_item_progress_id_idx" ON "public"."payload_locked_documents_rels" USING "btree" ("course_item_progress_id");


--
-- Name: payload_locked_documents_rels_course_lessons_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "payload_locked_documents_rels_course_lessons_id_idx" ON "public"."payload_locked_documents_rels" USING "btree" ("course_lessons_id");


--
-- Name: payload_locked_documents_rels_course_materials_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "payload_locked_documents_rels_course_materials_id_idx" ON "public"."payload_locked_documents_rels" USING "btree" ("course_materials_id");


--
-- Name: payload_locked_documents_rels_course_modules_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "payload_locked_documents_rels_course_modules_id_idx" ON "public"."payload_locked_documents_rels" USING "btree" ("course_modules_id");


--
-- Name: payload_locked_documents_rels_courses_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "payload_locked_documents_rels_courses_id_idx" ON "public"."payload_locked_documents_rels" USING "btree" ("courses_id");


--
-- Name: payload_locked_documents_rels_emergency_contacts_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "payload_locked_documents_rels_emergency_contacts_id_idx" ON "public"."payload_locked_documents_rels" USING "btree" ("emergency_contacts_id");


--
-- Name: payload_locked_documents_rels_feedback_forms_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "payload_locked_documents_rels_feedback_forms_id_idx" ON "public"."payload_locked_documents_rels" USING "btree" ("feedback_forms_id");


--
-- Name: payload_locked_documents_rels_feedback_submissions_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "payload_locked_documents_rels_feedback_submissions_id_idx" ON "public"."payload_locked_documents_rels" USING "btree" ("feedback_submissions_id");


--
-- Name: payload_locked_documents_rels_instructors_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "payload_locked_documents_rels_instructors_id_idx" ON "public"."payload_locked_documents_rels" USING "btree" ("instructors_id");


--
-- Name: payload_locked_documents_rels_lesson_materials_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "payload_locked_documents_rels_lesson_materials_id_idx" ON "public"."payload_locked_documents_rels" USING "btree" ("lesson_materials_id");


--
-- Name: payload_locked_documents_rels_materials_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "payload_locked_documents_rels_materials_id_idx" ON "public"."payload_locked_documents_rels" USING "btree" ("materials_id");


--
-- Name: payload_locked_documents_rels_media_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "payload_locked_documents_rels_media_id_idx" ON "public"."payload_locked_documents_rels" USING "btree" ("media_id");


--
-- Name: payload_locked_documents_rels_notification_templates_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "payload_locked_documents_rels_notification_templates_id_idx" ON "public"."payload_locked_documents_rels" USING "btree" ("notification_templates_id");


--
-- Name: payload_locked_documents_rels_notifications_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "payload_locked_documents_rels_notifications_id_idx" ON "public"."payload_locked_documents_rels" USING "btree" ("notifications_id");


--
-- Name: payload_locked_documents_rels_order_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "payload_locked_documents_rels_order_idx" ON "public"."payload_locked_documents_rels" USING "btree" ("order");


--
-- Name: payload_locked_documents_rels_parent_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "payload_locked_documents_rels_parent_idx" ON "public"."payload_locked_documents_rels" USING "btree" ("parent_id");


--
-- Name: payload_locked_documents_rels_path_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "payload_locked_documents_rels_path_idx" ON "public"."payload_locked_documents_rels" USING "btree" ("path");


--
-- Name: payload_locked_documents_rels_post_categories_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "payload_locked_documents_rels_post_categories_id_idx" ON "public"."payload_locked_documents_rels" USING "btree" ("post_categories_id");


--
-- Name: payload_locked_documents_rels_posts_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "payload_locked_documents_rels_posts_id_idx" ON "public"."payload_locked_documents_rels" USING "btree" ("posts_id");


--
-- Name: payload_locked_documents_rels_questions_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "payload_locked_documents_rels_questions_id_idx" ON "public"."payload_locked_documents_rels" USING "btree" ("questions_id");


--
-- Name: payload_locked_documents_rels_recently_viewed_courses_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "payload_locked_documents_rels_recently_viewed_courses_id_idx" ON "public"."payload_locked_documents_rels" USING "btree" ("recently_viewed_courses_id");


--
-- Name: payload_locked_documents_rels_submission_answers_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "payload_locked_documents_rels_submission_answers_id_idx" ON "public"."payload_locked_documents_rels" USING "btree" ("submission_answers_id");


--
-- Name: payload_locked_documents_rels_support_ticket_messages_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "payload_locked_documents_rels_support_ticket_messages_id_idx" ON "public"."payload_locked_documents_rels" USING "btree" ("support_ticket_messages_id");


--
-- Name: payload_locked_documents_rels_support_tickets_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "payload_locked_documents_rels_support_tickets_id_idx" ON "public"."payload_locked_documents_rels" USING "btree" ("support_tickets_id");


--
-- Name: payload_locked_documents_rels_trainees_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "payload_locked_documents_rels_trainees_id_idx" ON "public"."payload_locked_documents_rels" USING "btree" ("trainees_id");


--
-- Name: payload_locked_documents_rels_user_events_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "payload_locked_documents_rels_user_events_id_idx" ON "public"."payload_locked_documents_rels" USING "btree" ("user_events_id");


--
-- Name: payload_locked_documents_rels_user_notifications_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "payload_locked_documents_rels_user_notifications_id_idx" ON "public"."payload_locked_documents_rels" USING "btree" ("user_notifications_id");


--
-- Name: payload_locked_documents_rels_users_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "payload_locked_documents_rels_users_id_idx" ON "public"."payload_locked_documents_rels" USING "btree" ("users_id");


--
-- Name: payload_locked_documents_rels_web_push_subscriptions_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "payload_locked_documents_rels_web_push_subscriptions_id_idx" ON "public"."payload_locked_documents_rels" USING "btree" ("web_push_subscriptions_id");


--
-- Name: payload_locked_documents_rels_wishlists_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "payload_locked_documents_rels_wishlists_id_idx" ON "public"."payload_locked_documents_rels" USING "btree" ("wishlists_id");


--
-- Name: payload_locked_documents_updated_at_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "payload_locked_documents_updated_at_idx" ON "public"."payload_locked_documents" USING "btree" ("updated_at");


--
-- Name: payload_migrations_created_at_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "payload_migrations_created_at_idx" ON "public"."payload_migrations" USING "btree" ("created_at");


--
-- Name: payload_migrations_updated_at_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "payload_migrations_updated_at_idx" ON "public"."payload_migrations" USING "btree" ("updated_at");


--
-- Name: payload_preferences_created_at_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "payload_preferences_created_at_idx" ON "public"."payload_preferences" USING "btree" ("created_at");


--
-- Name: payload_preferences_key_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "payload_preferences_key_idx" ON "public"."payload_preferences" USING "btree" ("key");


--
-- Name: payload_preferences_rels_order_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "payload_preferences_rels_order_idx" ON "public"."payload_preferences_rels" USING "btree" ("order");


--
-- Name: payload_preferences_rels_parent_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "payload_preferences_rels_parent_idx" ON "public"."payload_preferences_rels" USING "btree" ("parent_id");


--
-- Name: payload_preferences_rels_path_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "payload_preferences_rels_path_idx" ON "public"."payload_preferences_rels" USING "btree" ("path");


--
-- Name: payload_preferences_rels_users_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "payload_preferences_rels_users_id_idx" ON "public"."payload_preferences_rels" USING "btree" ("users_id");


--
-- Name: payload_preferences_updated_at_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "payload_preferences_updated_at_idx" ON "public"."payload_preferences" USING "btree" ("updated_at");


--
-- Name: post_categories_created_at_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "post_categories_created_at_idx" ON "public"."post_categories" USING "btree" ("created_at");


--
-- Name: post_categories_icon_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "post_categories_icon_idx" ON "public"."post_categories" USING "btree" ("icon_id");


--
-- Name: post_categories_slug_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "post_categories_slug_idx" ON "public"."post_categories" USING "btree" ("slug");


--
-- Name: post_categories_updated_at_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "post_categories_updated_at_idx" ON "public"."post_categories" USING "btree" ("updated_at");


--
-- Name: posts__status_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "posts__status_idx" ON "public"."posts" USING "btree" ("_status");


--
-- Name: posts_author_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "posts_author_idx" ON "public"."posts" USING "btree" ("author_id");


--
-- Name: posts_created_at_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "posts_created_at_idx" ON "public"."posts" USING "btree" ("created_at");


--
-- Name: posts_featured_image_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "posts_featured_image_idx" ON "public"."posts" USING "btree" ("featured_image_id");


--
-- Name: posts_rels_order_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "posts_rels_order_idx" ON "public"."posts_rels" USING "btree" ("order");


--
-- Name: posts_rels_parent_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "posts_rels_parent_idx" ON "public"."posts_rels" USING "btree" ("parent_id");


--
-- Name: posts_rels_path_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "posts_rels_path_idx" ON "public"."posts_rels" USING "btree" ("path");


--
-- Name: posts_rels_post_categories_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "posts_rels_post_categories_id_idx" ON "public"."posts_rels" USING "btree" ("post_categories_id");


--
-- Name: posts_slug_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "posts_slug_idx" ON "public"."posts" USING "btree" ("slug");


--
-- Name: posts_tags_order_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "posts_tags_order_idx" ON "public"."posts_tags" USING "btree" ("_order");


--
-- Name: posts_tags_parent_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "posts_tags_parent_id_idx" ON "public"."posts_tags" USING "btree" ("_parent_id");


--
-- Name: posts_updated_at_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "posts_updated_at_idx" ON "public"."posts" USING "btree" ("updated_at");


--
-- Name: questions_created_at_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "questions_created_at_idx" ON "public"."questions" USING "btree" ("created_at");


--
-- Name: questions_options_order_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "questions_options_order_idx" ON "public"."questions_options" USING "btree" ("_order");


--
-- Name: questions_options_parent_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "questions_options_parent_id_idx" ON "public"."questions_options" USING "btree" ("_parent_id");


--
-- Name: questions_texts_order_parent; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "questions_texts_order_parent" ON "public"."questions_texts" USING "btree" ("order", "parent_id");


--
-- Name: questions_updated_at_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "questions_updated_at_idx" ON "public"."questions" USING "btree" ("updated_at");


--
-- Name: recent_searches_composite_key_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "recent_searches_composite_key_idx" ON "public"."recent_searches" USING "btree" ("composite_key");


--
-- Name: recent_searches_created_at_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "recent_searches_created_at_idx" ON "public"."recent_searches" USING "btree" ("created_at");


--
-- Name: recent_searches_updated_at_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "recent_searches_updated_at_idx" ON "public"."recent_searches" USING "btree" ("updated_at");


--
-- Name: recent_searches_user_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "recent_searches_user_idx" ON "public"."recent_searches" USING "btree" ("user_id");


--
-- Name: recently_viewed_courses_composite_key_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "recently_viewed_courses_composite_key_idx" ON "public"."recently_viewed_courses" USING "btree" ("composite_key");


--
-- Name: recently_viewed_courses_course_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "recently_viewed_courses_course_idx" ON "public"."recently_viewed_courses" USING "btree" ("course_id");


--
-- Name: recently_viewed_courses_created_at_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "recently_viewed_courses_created_at_idx" ON "public"."recently_viewed_courses" USING "btree" ("created_at");


--
-- Name: recently_viewed_courses_updated_at_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "recently_viewed_courses_updated_at_idx" ON "public"."recently_viewed_courses" USING "btree" ("updated_at");


--
-- Name: recently_viewed_courses_user_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "recently_viewed_courses_user_idx" ON "public"."recently_viewed_courses" USING "btree" ("user_id");


--
-- Name: site_settings_favicon_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "site_settings_favicon_idx" ON "public"."site_settings" USING "btree" ("favicon_id");


--
-- Name: site_settings_logo_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "site_settings_logo_idx" ON "public"."site_settings" USING "btree" ("logo_id");


--
-- Name: site_settings_social_links_order_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "site_settings_social_links_order_idx" ON "public"."site_settings_social_links" USING "btree" ("_order");


--
-- Name: site_settings_social_links_parent_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "site_settings_social_links_parent_id_idx" ON "public"."site_settings_social_links" USING "btree" ("_parent_id");


--
-- Name: submission_answers_created_at_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "submission_answers_created_at_idx" ON "public"."submission_answers" USING "btree" ("created_at");


--
-- Name: submission_answers_question_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "submission_answers_question_idx" ON "public"."submission_answers" USING "btree" ("question_id");


--
-- Name: submission_answers_submission_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "submission_answers_submission_idx" ON "public"."submission_answers" USING "btree" ("submission_id");


--
-- Name: submission_answers_updated_at_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "submission_answers_updated_at_idx" ON "public"."submission_answers" USING "btree" ("updated_at");


--
-- Name: support_ticket_messages_created_at_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "support_ticket_messages_created_at_idx" ON "public"."support_ticket_messages" USING "btree" ("created_at");


--
-- Name: support_ticket_messages_rels_media_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "support_ticket_messages_rels_media_id_idx" ON "public"."support_ticket_messages_rels" USING "btree" ("media_id");


--
-- Name: support_ticket_messages_rels_order_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "support_ticket_messages_rels_order_idx" ON "public"."support_ticket_messages_rels" USING "btree" ("order");


--
-- Name: support_ticket_messages_rels_parent_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "support_ticket_messages_rels_parent_idx" ON "public"."support_ticket_messages_rels" USING "btree" ("parent_id");


--
-- Name: support_ticket_messages_rels_path_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "support_ticket_messages_rels_path_idx" ON "public"."support_ticket_messages_rels" USING "btree" ("path");


--
-- Name: support_ticket_messages_sender_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "support_ticket_messages_sender_idx" ON "public"."support_ticket_messages" USING "btree" ("sender_id");


--
-- Name: support_ticket_messages_ticket_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "support_ticket_messages_ticket_idx" ON "public"."support_ticket_messages" USING "btree" ("ticket_id");


--
-- Name: support_ticket_messages_updated_at_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "support_ticket_messages_updated_at_idx" ON "public"."support_ticket_messages" USING "btree" ("updated_at");


--
-- Name: support_tickets_assigned_to_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "support_tickets_assigned_to_idx" ON "public"."support_tickets" USING "btree" ("assigned_to_id");


--
-- Name: support_tickets_created_at_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "support_tickets_created_at_idx" ON "public"."support_tickets" USING "btree" ("created_at");


--
-- Name: support_tickets_rels_media_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "support_tickets_rels_media_id_idx" ON "public"."support_tickets_rels" USING "btree" ("media_id");


--
-- Name: support_tickets_rels_order_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "support_tickets_rels_order_idx" ON "public"."support_tickets_rels" USING "btree" ("order");


--
-- Name: support_tickets_rels_parent_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "support_tickets_rels_parent_idx" ON "public"."support_tickets_rels" USING "btree" ("parent_id");


--
-- Name: support_tickets_rels_path_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "support_tickets_rels_path_idx" ON "public"."support_tickets_rels" USING "btree" ("path");


--
-- Name: support_tickets_updated_at_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "support_tickets_updated_at_idx" ON "public"."support_tickets" USING "btree" ("updated_at");


--
-- Name: support_tickets_user_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "support_tickets_user_idx" ON "public"."support_tickets" USING "btree" ("user_id");


--
-- Name: trainee_course_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "trainee_course_idx" ON "public"."course_item_progress" USING "btree" ("trainee_id", "course_id");


--
-- Name: trainees_created_at_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "trainees_created_at_idx" ON "public"."trainees" USING "btree" ("created_at");


--
-- Name: trainees_srn_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "trainees_srn_idx" ON "public"."trainees" USING "btree" ("srn");


--
-- Name: trainees_updated_at_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "trainees_updated_at_idx" ON "public"."trainees" USING "btree" ("updated_at");


--
-- Name: trainees_user_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "trainees_user_idx" ON "public"."trainees" USING "btree" ("user_id");


--
-- Name: user_events_created_at_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "user_events_created_at_idx" ON "public"."user_events" USING "btree" ("created_at");


--
-- Name: user_events_triggered_by_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "user_events_triggered_by_idx" ON "public"."user_events" USING "btree" ("triggered_by_id");


--
-- Name: user_events_updated_at_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "user_events_updated_at_idx" ON "public"."user_events" USING "btree" ("updated_at");


--
-- Name: user_events_user_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "user_events_user_idx" ON "public"."user_events" USING "btree" ("user_id");


--
-- Name: user_notifications_created_at_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "user_notifications_created_at_idx" ON "public"."user_notifications" USING "btree" ("created_at");


--
-- Name: user_notifications_notification_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "user_notifications_notification_idx" ON "public"."user_notifications" USING "btree" ("notification_id");


--
-- Name: user_notifications_updated_at_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "user_notifications_updated_at_idx" ON "public"."user_notifications" USING "btree" ("updated_at");


--
-- Name: user_notifications_user_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "user_notifications_user_idx" ON "public"."user_notifications" USING "btree" ("user_id");


--
-- Name: users_created_at_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "users_created_at_idx" ON "public"."users" USING "btree" ("created_at");


--
-- Name: users_email_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "users_email_idx" ON "public"."users" USING "btree" ("email");


--
-- Name: users_profile_picture_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "users_profile_picture_idx" ON "public"."users" USING "btree" ("profile_picture_id");


--
-- Name: users_reset_password_tokens_order_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "users_reset_password_tokens_order_idx" ON "public"."users_reset_password_tokens" USING "btree" ("_order");


--
-- Name: users_reset_password_tokens_parent_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "users_reset_password_tokens_parent_id_idx" ON "public"."users_reset_password_tokens" USING "btree" ("_parent_id");


--
-- Name: users_sessions_order_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "users_sessions_order_idx" ON "public"."users_sessions" USING "btree" ("_order");


--
-- Name: users_sessions_parent_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "users_sessions_parent_id_idx" ON "public"."users_sessions" USING "btree" ("_parent_id");


--
-- Name: users_updated_at_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "users_updated_at_idx" ON "public"."users" USING "btree" ("updated_at");


--
-- Name: users_username_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "users_username_idx" ON "public"."users" USING "btree" ("username");


--
-- Name: web_push_subscriptions_created_at_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "web_push_subscriptions_created_at_idx" ON "public"."web_push_subscriptions" USING "btree" ("created_at");


--
-- Name: web_push_subscriptions_updated_at_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "web_push_subscriptions_updated_at_idx" ON "public"."web_push_subscriptions" USING "btree" ("updated_at");


--
-- Name: web_push_subscriptions_user_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "web_push_subscriptions_user_idx" ON "public"."web_push_subscriptions" USING "btree" ("user_id");


--
-- Name: wishlists_composite_key_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "wishlists_composite_key_idx" ON "public"."wishlists" USING "btree" ("composite_key");


--
-- Name: wishlists_course_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "wishlists_course_idx" ON "public"."wishlists" USING "btree" ("course_id");


--
-- Name: wishlists_created_at_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "wishlists_created_at_idx" ON "public"."wishlists" USING "btree" ("created_at");


--
-- Name: wishlists_updated_at_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "wishlists_updated_at_idx" ON "public"."wishlists" USING "btree" ("updated_at");


--
-- Name: wishlists_user_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "wishlists_user_idx" ON "public"."wishlists" USING "btree" ("user_id");


--
-- Name: ix_realtime_subscription_entity; Type: INDEX; Schema: realtime; Owner: -
--

CREATE INDEX "ix_realtime_subscription_entity" ON "realtime"."subscription" USING "btree" ("entity");


--
-- Name: messages_inserted_at_topic_index; Type: INDEX; Schema: realtime; Owner: -
--

CREATE INDEX "messages_inserted_at_topic_index" ON ONLY "realtime"."messages" USING "btree" ("inserted_at" DESC, "topic") WHERE (("extension" = 'broadcast'::"text") AND ("private" IS TRUE));


--
-- Name: messages_2026_05_19_inserted_at_topic_idx; Type: INDEX; Schema: realtime; Owner: -
--

CREATE INDEX "messages_2026_05_19_inserted_at_topic_idx" ON "realtime"."messages_2026_05_19" USING "btree" ("inserted_at" DESC, "topic") WHERE (("extension" = 'broadcast'::"text") AND ("private" IS TRUE));


--
-- Name: messages_2026_05_20_inserted_at_topic_idx; Type: INDEX; Schema: realtime; Owner: -
--

CREATE INDEX "messages_2026_05_20_inserted_at_topic_idx" ON "realtime"."messages_2026_05_20" USING "btree" ("inserted_at" DESC, "topic") WHERE (("extension" = 'broadcast'::"text") AND ("private" IS TRUE));


--
-- Name: messages_2026_05_21_inserted_at_topic_idx; Type: INDEX; Schema: realtime; Owner: -
--

CREATE INDEX "messages_2026_05_21_inserted_at_topic_idx" ON "realtime"."messages_2026_05_21" USING "btree" ("inserted_at" DESC, "topic") WHERE (("extension" = 'broadcast'::"text") AND ("private" IS TRUE));


--
-- Name: messages_2026_05_22_inserted_at_topic_idx; Type: INDEX; Schema: realtime; Owner: -
--

CREATE INDEX "messages_2026_05_22_inserted_at_topic_idx" ON "realtime"."messages_2026_05_22" USING "btree" ("inserted_at" DESC, "topic") WHERE (("extension" = 'broadcast'::"text") AND ("private" IS TRUE));


--
-- Name: messages_2026_05_23_inserted_at_topic_idx; Type: INDEX; Schema: realtime; Owner: -
--

CREATE INDEX "messages_2026_05_23_inserted_at_topic_idx" ON "realtime"."messages_2026_05_23" USING "btree" ("inserted_at" DESC, "topic") WHERE (("extension" = 'broadcast'::"text") AND ("private" IS TRUE));


--
-- Name: messages_2026_05_24_inserted_at_topic_idx; Type: INDEX; Schema: realtime; Owner: -
--

CREATE INDEX "messages_2026_05_24_inserted_at_topic_idx" ON "realtime"."messages_2026_05_24" USING "btree" ("inserted_at" DESC, "topic") WHERE (("extension" = 'broadcast'::"text") AND ("private" IS TRUE));


--
-- Name: messages_2026_05_25_inserted_at_topic_idx; Type: INDEX; Schema: realtime; Owner: -
--

CREATE INDEX "messages_2026_05_25_inserted_at_topic_idx" ON "realtime"."messages_2026_05_25" USING "btree" ("inserted_at" DESC, "topic") WHERE (("extension" = 'broadcast'::"text") AND ("private" IS TRUE));


--
-- Name: subscription_subscription_id_entity_filters_action_filter_key; Type: INDEX; Schema: realtime; Owner: -
--

CREATE UNIQUE INDEX "subscription_subscription_id_entity_filters_action_filter_key" ON "realtime"."subscription" USING "btree" ("subscription_id", "entity", "filters", "action_filter");


--
-- Name: bname; Type: INDEX; Schema: storage; Owner: -
--

CREATE UNIQUE INDEX "bname" ON "storage"."buckets" USING "btree" ("name");


--
-- Name: bucketid_objname; Type: INDEX; Schema: storage; Owner: -
--

CREATE UNIQUE INDEX "bucketid_objname" ON "storage"."objects" USING "btree" ("bucket_id", "name");


--
-- Name: buckets_analytics_unique_name_idx; Type: INDEX; Schema: storage; Owner: -
--

CREATE UNIQUE INDEX "buckets_analytics_unique_name_idx" ON "storage"."buckets_analytics" USING "btree" ("name") WHERE ("deleted_at" IS NULL);


--
-- Name: idx_multipart_uploads_list; Type: INDEX; Schema: storage; Owner: -
--

CREATE INDEX "idx_multipart_uploads_list" ON "storage"."s3_multipart_uploads" USING "btree" ("bucket_id", "key", "created_at");


--
-- Name: idx_objects_bucket_id_name; Type: INDEX; Schema: storage; Owner: -
--

CREATE INDEX "idx_objects_bucket_id_name" ON "storage"."objects" USING "btree" ("bucket_id", "name" COLLATE "C");


--
-- Name: idx_objects_bucket_id_name_lower; Type: INDEX; Schema: storage; Owner: -
--

CREATE INDEX "idx_objects_bucket_id_name_lower" ON "storage"."objects" USING "btree" ("bucket_id", "lower"("name") COLLATE "C");


--
-- Name: name_prefix_search; Type: INDEX; Schema: storage; Owner: -
--

CREATE INDEX "name_prefix_search" ON "storage"."objects" USING "btree" ("name" "text_pattern_ops");


--
-- Name: vector_indexes_name_bucket_id_idx; Type: INDEX; Schema: storage; Owner: -
--

CREATE UNIQUE INDEX "vector_indexes_name_bucket_id_idx" ON "storage"."vector_indexes" USING "btree" ("name", "bucket_id");


--
-- Name: messages_2026_05_19_inserted_at_topic_idx; Type: INDEX ATTACH; Schema: realtime; Owner: -
--

ALTER INDEX "realtime"."messages_inserted_at_topic_index" ATTACH PARTITION "realtime"."messages_2026_05_19_inserted_at_topic_idx";


--
-- Name: messages_2026_05_19_pkey; Type: INDEX ATTACH; Schema: realtime; Owner: -
--

ALTER INDEX "realtime"."messages_pkey" ATTACH PARTITION "realtime"."messages_2026_05_19_pkey";


--
-- Name: messages_2026_05_20_inserted_at_topic_idx; Type: INDEX ATTACH; Schema: realtime; Owner: -
--

ALTER INDEX "realtime"."messages_inserted_at_topic_index" ATTACH PARTITION "realtime"."messages_2026_05_20_inserted_at_topic_idx";


--
-- Name: messages_2026_05_20_pkey; Type: INDEX ATTACH; Schema: realtime; Owner: -
--

ALTER INDEX "realtime"."messages_pkey" ATTACH PARTITION "realtime"."messages_2026_05_20_pkey";


--
-- Name: messages_2026_05_21_inserted_at_topic_idx; Type: INDEX ATTACH; Schema: realtime; Owner: -
--

ALTER INDEX "realtime"."messages_inserted_at_topic_index" ATTACH PARTITION "realtime"."messages_2026_05_21_inserted_at_topic_idx";


--
-- Name: messages_2026_05_21_pkey; Type: INDEX ATTACH; Schema: realtime; Owner: -
--

ALTER INDEX "realtime"."messages_pkey" ATTACH PARTITION "realtime"."messages_2026_05_21_pkey";


--
-- Name: messages_2026_05_22_inserted_at_topic_idx; Type: INDEX ATTACH; Schema: realtime; Owner: -
--

ALTER INDEX "realtime"."messages_inserted_at_topic_index" ATTACH PARTITION "realtime"."messages_2026_05_22_inserted_at_topic_idx";


--
-- Name: messages_2026_05_22_pkey; Type: INDEX ATTACH; Schema: realtime; Owner: -
--

ALTER INDEX "realtime"."messages_pkey" ATTACH PARTITION "realtime"."messages_2026_05_22_pkey";


--
-- Name: messages_2026_05_23_inserted_at_topic_idx; Type: INDEX ATTACH; Schema: realtime; Owner: -
--

ALTER INDEX "realtime"."messages_inserted_at_topic_index" ATTACH PARTITION "realtime"."messages_2026_05_23_inserted_at_topic_idx";


--
-- Name: messages_2026_05_23_pkey; Type: INDEX ATTACH; Schema: realtime; Owner: -
--

ALTER INDEX "realtime"."messages_pkey" ATTACH PARTITION "realtime"."messages_2026_05_23_pkey";


--
-- Name: messages_2026_05_24_inserted_at_topic_idx; Type: INDEX ATTACH; Schema: realtime; Owner: -
--

ALTER INDEX "realtime"."messages_inserted_at_topic_index" ATTACH PARTITION "realtime"."messages_2026_05_24_inserted_at_topic_idx";


--
-- Name: messages_2026_05_24_pkey; Type: INDEX ATTACH; Schema: realtime; Owner: -
--

ALTER INDEX "realtime"."messages_pkey" ATTACH PARTITION "realtime"."messages_2026_05_24_pkey";


--
-- Name: messages_2026_05_25_inserted_at_topic_idx; Type: INDEX ATTACH; Schema: realtime; Owner: -
--

ALTER INDEX "realtime"."messages_inserted_at_topic_index" ATTACH PARTITION "realtime"."messages_2026_05_25_inserted_at_topic_idx";


--
-- Name: messages_2026_05_25_pkey; Type: INDEX ATTACH; Schema: realtime; Owner: -
--

ALTER INDEX "realtime"."messages_pkey" ATTACH PARTITION "realtime"."messages_2026_05_25_pkey";


--
-- Name: users user_cleanup_trigger; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER "user_cleanup_trigger" BEFORE DELETE ON "public"."users" FOR EACH ROW EXECUTE FUNCTION "public"."cleanup_role_record"();


--
-- Name: users user_role_change_trigger; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER "user_role_change_trigger" AFTER UPDATE ON "public"."users" FOR EACH ROW EXECUTE FUNCTION "public"."handle_role_change"();


--
-- Name: users user_role_trigger; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER "user_role_trigger" AFTER INSERT ON "public"."users" FOR EACH ROW EXECUTE FUNCTION "public"."create_role_record"();


--
-- Name: subscription tr_check_filters; Type: TRIGGER; Schema: realtime; Owner: -
--

CREATE TRIGGER "tr_check_filters" BEFORE INSERT OR UPDATE ON "realtime"."subscription" FOR EACH ROW EXECUTE FUNCTION "realtime"."subscription_check_filters"();


--
-- Name: buckets enforce_bucket_name_length_trigger; Type: TRIGGER; Schema: storage; Owner: -
--

CREATE TRIGGER "enforce_bucket_name_length_trigger" BEFORE INSERT OR UPDATE OF "name" ON "storage"."buckets" FOR EACH ROW EXECUTE FUNCTION "storage"."enforce_bucket_name_length"();


--
-- Name: buckets protect_buckets_delete; Type: TRIGGER; Schema: storage; Owner: -
--

CREATE TRIGGER "protect_buckets_delete" BEFORE DELETE ON "storage"."buckets" FOR EACH STATEMENT EXECUTE FUNCTION "storage"."protect_delete"();


--
-- Name: objects protect_objects_delete; Type: TRIGGER; Schema: storage; Owner: -
--

CREATE TRIGGER "protect_objects_delete" BEFORE DELETE ON "storage"."objects" FOR EACH STATEMENT EXECUTE FUNCTION "storage"."protect_delete"();


--
-- Name: objects update_objects_updated_at; Type: TRIGGER; Schema: storage; Owner: -
--

CREATE TRIGGER "update_objects_updated_at" BEFORE UPDATE ON "storage"."objects" FOR EACH ROW EXECUTE FUNCTION "storage"."update_updated_at_column"();


--
-- Name: identities identities_user_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY "auth"."identities"
    ADD CONSTRAINT "identities_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;


--
-- Name: mfa_amr_claims mfa_amr_claims_session_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY "auth"."mfa_amr_claims"
    ADD CONSTRAINT "mfa_amr_claims_session_id_fkey" FOREIGN KEY ("session_id") REFERENCES "auth"."sessions"("id") ON DELETE CASCADE;


--
-- Name: mfa_challenges mfa_challenges_auth_factor_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY "auth"."mfa_challenges"
    ADD CONSTRAINT "mfa_challenges_auth_factor_id_fkey" FOREIGN KEY ("factor_id") REFERENCES "auth"."mfa_factors"("id") ON DELETE CASCADE;


--
-- Name: mfa_factors mfa_factors_user_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY "auth"."mfa_factors"
    ADD CONSTRAINT "mfa_factors_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;


--
-- Name: oauth_authorizations oauth_authorizations_client_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY "auth"."oauth_authorizations"
    ADD CONSTRAINT "oauth_authorizations_client_id_fkey" FOREIGN KEY ("client_id") REFERENCES "auth"."oauth_clients"("id") ON DELETE CASCADE;


--
-- Name: oauth_authorizations oauth_authorizations_user_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY "auth"."oauth_authorizations"
    ADD CONSTRAINT "oauth_authorizations_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;


--
-- Name: oauth_consents oauth_consents_client_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY "auth"."oauth_consents"
    ADD CONSTRAINT "oauth_consents_client_id_fkey" FOREIGN KEY ("client_id") REFERENCES "auth"."oauth_clients"("id") ON DELETE CASCADE;


--
-- Name: oauth_consents oauth_consents_user_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY "auth"."oauth_consents"
    ADD CONSTRAINT "oauth_consents_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;


--
-- Name: one_time_tokens one_time_tokens_user_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY "auth"."one_time_tokens"
    ADD CONSTRAINT "one_time_tokens_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;


--
-- Name: refresh_tokens refresh_tokens_session_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY "auth"."refresh_tokens"
    ADD CONSTRAINT "refresh_tokens_session_id_fkey" FOREIGN KEY ("session_id") REFERENCES "auth"."sessions"("id") ON DELETE CASCADE;


--
-- Name: saml_providers saml_providers_sso_provider_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY "auth"."saml_providers"
    ADD CONSTRAINT "saml_providers_sso_provider_id_fkey" FOREIGN KEY ("sso_provider_id") REFERENCES "auth"."sso_providers"("id") ON DELETE CASCADE;


--
-- Name: saml_relay_states saml_relay_states_flow_state_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY "auth"."saml_relay_states"
    ADD CONSTRAINT "saml_relay_states_flow_state_id_fkey" FOREIGN KEY ("flow_state_id") REFERENCES "auth"."flow_state"("id") ON DELETE CASCADE;


--
-- Name: saml_relay_states saml_relay_states_sso_provider_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY "auth"."saml_relay_states"
    ADD CONSTRAINT "saml_relay_states_sso_provider_id_fkey" FOREIGN KEY ("sso_provider_id") REFERENCES "auth"."sso_providers"("id") ON DELETE CASCADE;


--
-- Name: sessions sessions_oauth_client_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY "auth"."sessions"
    ADD CONSTRAINT "sessions_oauth_client_id_fkey" FOREIGN KEY ("oauth_client_id") REFERENCES "auth"."oauth_clients"("id") ON DELETE CASCADE;


--
-- Name: sessions sessions_user_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY "auth"."sessions"
    ADD CONSTRAINT "sessions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;


--
-- Name: sso_domains sso_domains_sso_provider_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY "auth"."sso_domains"
    ADD CONSTRAINT "sso_domains_sso_provider_id_fkey" FOREIGN KEY ("sso_provider_id") REFERENCES "auth"."sso_providers"("id") ON DELETE CASCADE;


--
-- Name: webauthn_challenges webauthn_challenges_user_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY "auth"."webauthn_challenges"
    ADD CONSTRAINT "webauthn_challenges_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;


--
-- Name: webauthn_credentials webauthn_credentials_user_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY "auth"."webauthn_credentials"
    ADD CONSTRAINT "webauthn_credentials_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;


--
-- Name: _posts_v _posts_v_parent_id_posts_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."_posts_v"
    ADD CONSTRAINT "_posts_v_parent_id_posts_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."posts"("id") ON DELETE SET NULL;


--
-- Name: _posts_v_rels _posts_v_rels_parent_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."_posts_v_rels"
    ADD CONSTRAINT "_posts_v_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_posts_v"("id") ON DELETE CASCADE;


--
-- Name: _posts_v_rels _posts_v_rels_post_categories_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."_posts_v_rels"
    ADD CONSTRAINT "_posts_v_rels_post_categories_fk" FOREIGN KEY ("post_categories_id") REFERENCES "public"."post_categories"("id") ON DELETE CASCADE;


--
-- Name: _posts_v _posts_v_version_author_id_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."_posts_v"
    ADD CONSTRAINT "_posts_v_version_author_id_users_id_fk" FOREIGN KEY ("version_author_id") REFERENCES "public"."users"("id") ON DELETE SET NULL;


--
-- Name: _posts_v _posts_v_version_featured_image_id_media_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."_posts_v"
    ADD CONSTRAINT "_posts_v_version_featured_image_id_media_id_fk" FOREIGN KEY ("version_featured_image_id") REFERENCES "public"."media"("id") ON DELETE SET NULL;


--
-- Name: _posts_v_version_tags _posts_v_version_tags_parent_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."_posts_v_version_tags"
    ADD CONSTRAINT "_posts_v_version_tags_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_posts_v"("id") ON DELETE CASCADE;


--
-- Name: admins admins_user_id_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."admins"
    ADD CONSTRAINT "admins_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE SET NULL;


--
-- Name: announcements announcements_course_id_courses_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."announcements"
    ADD CONSTRAINT "announcements_course_id_courses_id_fk" FOREIGN KEY ("course_id") REFERENCES "public"."courses"("id") ON DELETE SET NULL;


--
-- Name: announcements announcements_created_by_id_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."announcements"
    ADD CONSTRAINT "announcements_created_by_id_users_id_fk" FOREIGN KEY ("created_by_id") REFERENCES "public"."users"("id") ON DELETE SET NULL;


--
-- Name: assessment_submissions assessment_submissions_assessment_id_assessments_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."assessment_submissions"
    ADD CONSTRAINT "assessment_submissions_assessment_id_assessments_id_fk" FOREIGN KEY ("assessment_id") REFERENCES "public"."assessments"("id") ON DELETE SET NULL;


--
-- Name: assessment_submissions assessment_submissions_course_id_courses_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."assessment_submissions"
    ADD CONSTRAINT "assessment_submissions_course_id_courses_id_fk" FOREIGN KEY ("course_id") REFERENCES "public"."courses"("id") ON DELETE SET NULL;


--
-- Name: assessment_submissions assessment_submissions_enrollment_id_course_enrollments_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."assessment_submissions"
    ADD CONSTRAINT "assessment_submissions_enrollment_id_course_enrollments_id_fk" FOREIGN KEY ("enrollment_id") REFERENCES "public"."course_enrollments"("id") ON DELETE SET NULL;


--
-- Name: assessment_submissions assessment_submissions_trainee_id_trainees_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."assessment_submissions"
    ADD CONSTRAINT "assessment_submissions_trainee_id_trainees_id_fk" FOREIGN KEY ("trainee_id") REFERENCES "public"."trainees"("id") ON DELETE SET NULL;


--
-- Name: assessments assessments_course_id_courses_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."assessments"
    ADD CONSTRAINT "assessments_course_id_courses_id_fk" FOREIGN KEY ("course_id") REFERENCES "public"."courses"("id") ON DELETE SET NULL;


--
-- Name: assessments_items assessments_items_parent_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."assessments_items"
    ADD CONSTRAINT "assessments_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."assessments"("id") ON DELETE CASCADE;


--
-- Name: assessments_items assessments_items_question_id_questions_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."assessments_items"
    ADD CONSTRAINT "assessments_items_question_id_questions_id_fk" FOREIGN KEY ("question_id") REFERENCES "public"."questions"("id") ON DELETE SET NULL;


--
-- Name: assessments assessments_module_id_course_modules_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."assessments"
    ADD CONSTRAINT "assessments_module_id_course_modules_id_fk" FOREIGN KEY ("module_id") REFERENCES "public"."course_modules"("id") ON DELETE SET NULL;


--
-- Name: assignment_submissions assignment_submissions_assignment_id_assignments_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."assignment_submissions"
    ADD CONSTRAINT "assignment_submissions_assignment_id_assignments_id_fk" FOREIGN KEY ("assignment_id") REFERENCES "public"."assignments"("id") ON DELETE SET NULL;


--
-- Name: assignment_submissions assignment_submissions_enrollment_id_course_enrollments_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."assignment_submissions"
    ADD CONSTRAINT "assignment_submissions_enrollment_id_course_enrollments_id_fk" FOREIGN KEY ("enrollment_id") REFERENCES "public"."course_enrollments"("id") ON DELETE SET NULL;


--
-- Name: assignment_submissions assignment_submissions_graded_by_id_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."assignment_submissions"
    ADD CONSTRAINT "assignment_submissions_graded_by_id_users_id_fk" FOREIGN KEY ("graded_by_id") REFERENCES "public"."users"("id") ON DELETE SET NULL;


--
-- Name: assignment_submissions_rels assignment_submissions_rels_media_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."assignment_submissions_rels"
    ADD CONSTRAINT "assignment_submissions_rels_media_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE CASCADE;


--
-- Name: assignment_submissions_rels assignment_submissions_rels_parent_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."assignment_submissions_rels"
    ADD CONSTRAINT "assignment_submissions_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."assignment_submissions"("id") ON DELETE CASCADE;


--
-- Name: assignment_submissions assignment_submissions_trainee_id_trainees_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."assignment_submissions"
    ADD CONSTRAINT "assignment_submissions_trainee_id_trainees_id_fk" FOREIGN KEY ("trainee_id") REFERENCES "public"."trainees"("id") ON DELETE SET NULL;


--
-- Name: assignments_allowed_file_types assignments_allowed_file_types_parent_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."assignments_allowed_file_types"
    ADD CONSTRAINT "assignments_allowed_file_types_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."assignments"("id") ON DELETE CASCADE;


--
-- Name: assignments_rels assignments_rels_media_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."assignments_rels"
    ADD CONSTRAINT "assignments_rels_media_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE CASCADE;


--
-- Name: assignments_rels assignments_rels_parent_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."assignments_rels"
    ADD CONSTRAINT "assignments_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."assignments"("id") ON DELETE CASCADE;


--
-- Name: certificate_templates certificate_templates_background_image_id_media_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."certificate_templates"
    ADD CONSTRAINT "certificate_templates_background_image_id_media_id_fk" FOREIGN KEY ("background_image_id") REFERENCES "public"."media"("id") ON DELETE SET NULL;


--
-- Name: certificates certificates_course_id_courses_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."certificates"
    ADD CONSTRAINT "certificates_course_id_courses_id_fk" FOREIGN KEY ("course_id") REFERENCES "public"."courses"("id") ON DELETE SET NULL;


--
-- Name: certificates certificates_enrollment_id_course_enrollments_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."certificates"
    ADD CONSTRAINT "certificates_enrollment_id_course_enrollments_id_fk" FOREIGN KEY ("enrollment_id") REFERENCES "public"."course_enrollments"("id") ON DELETE SET NULL;


--
-- Name: certificates certificates_file_id_media_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."certificates"
    ADD CONSTRAINT "certificates_file_id_media_id_fk" FOREIGN KEY ("file_id") REFERENCES "public"."media"("id") ON DELETE SET NULL;


--
-- Name: certificates certificates_trainee_id_trainees_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."certificates"
    ADD CONSTRAINT "certificates_trainee_id_trainees_id_fk" FOREIGN KEY ("trainee_id") REFERENCES "public"."trainees"("id") ON DELETE SET NULL;


--
-- Name: chat_message_status chat_message_status_message_id_chat_messages_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."chat_message_status"
    ADD CONSTRAINT "chat_message_status_message_id_chat_messages_id_fk" FOREIGN KEY ("message_id") REFERENCES "public"."chat_messages"("id") ON DELETE SET NULL;


--
-- Name: chat_message_status chat_message_status_user_id_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."chat_message_status"
    ADD CONSTRAINT "chat_message_status_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE SET NULL;


--
-- Name: chat_messages chat_messages_chat_id_chats_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."chat_messages"
    ADD CONSTRAINT "chat_messages_chat_id_chats_id_fk" FOREIGN KEY ("chat_id") REFERENCES "public"."chats"("id") ON DELETE SET NULL;


--
-- Name: chat_messages_reactions chat_messages_reactions_parent_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."chat_messages_reactions"
    ADD CONSTRAINT "chat_messages_reactions_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."chat_messages"("id") ON DELETE CASCADE;


--
-- Name: chat_messages_reactions chat_messages_reactions_user_id_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."chat_messages_reactions"
    ADD CONSTRAINT "chat_messages_reactions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE SET NULL;


--
-- Name: chat_messages_rels chat_messages_rels_media_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."chat_messages_rels"
    ADD CONSTRAINT "chat_messages_rels_media_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE CASCADE;


--
-- Name: chat_messages_rels chat_messages_rels_parent_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."chat_messages_rels"
    ADD CONSTRAINT "chat_messages_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."chat_messages"("id") ON DELETE CASCADE;


--
-- Name: chat_messages chat_messages_reply_to_id_chat_messages_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."chat_messages"
    ADD CONSTRAINT "chat_messages_reply_to_id_chat_messages_id_fk" FOREIGN KEY ("reply_to_id") REFERENCES "public"."chat_messages"("id") ON DELETE SET NULL;


--
-- Name: chat_messages chat_messages_sender_id_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."chat_messages"
    ADD CONSTRAINT "chat_messages_sender_id_users_id_fk" FOREIGN KEY ("sender_id") REFERENCES "public"."users"("id") ON DELETE SET NULL;


--
-- Name: chat_typing_status chat_typing_status_chat_id_chats_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."chat_typing_status"
    ADD CONSTRAINT "chat_typing_status_chat_id_chats_id_fk" FOREIGN KEY ("chat_id") REFERENCES "public"."chats"("id") ON DELETE SET NULL;


--
-- Name: chat_typing_status chat_typing_status_user_id_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."chat_typing_status"
    ADD CONSTRAINT "chat_typing_status_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE SET NULL;


--
-- Name: chats chats_created_by_id_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."chats"
    ADD CONSTRAINT "chats_created_by_id_users_id_fk" FOREIGN KEY ("created_by_id") REFERENCES "public"."users"("id") ON DELETE SET NULL;


--
-- Name: chats_rels chats_rels_parent_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."chats_rels"
    ADD CONSTRAINT "chats_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."chats"("id") ON DELETE CASCADE;


--
-- Name: chats_rels chats_rels_users_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."chats_rels"
    ADD CONSTRAINT "chats_rels_users_fk" FOREIGN KEY ("users_id") REFERENCES "public"."users"("id") ON DELETE CASCADE;


--
-- Name: coupon_codes_allowed_emails coupon_codes_allowed_emails_parent_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."coupon_codes_allowed_emails"
    ADD CONSTRAINT "coupon_codes_allowed_emails_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."coupon_codes"("id") ON DELETE CASCADE;


--
-- Name: coupon_codes_rels coupon_codes_rels_course_categories_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."coupon_codes_rels"
    ADD CONSTRAINT "coupon_codes_rels_course_categories_fk" FOREIGN KEY ("course_categories_id") REFERENCES "public"."course_categories"("id") ON DELETE CASCADE;


--
-- Name: coupon_codes_rels coupon_codes_rels_courses_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."coupon_codes_rels"
    ADD CONSTRAINT "coupon_codes_rels_courses_fk" FOREIGN KEY ("courses_id") REFERENCES "public"."courses"("id") ON DELETE CASCADE;


--
-- Name: coupon_codes_rels coupon_codes_rels_parent_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."coupon_codes_rels"
    ADD CONSTRAINT "coupon_codes_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."coupon_codes"("id") ON DELETE CASCADE;


--
-- Name: coupon_codes_rels coupon_codes_rels_trainees_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."coupon_codes_rels"
    ADD CONSTRAINT "coupon_codes_rels_trainees_fk" FOREIGN KEY ("trainees_id") REFERENCES "public"."trainees"("id") ON DELETE CASCADE;


--
-- Name: coupon_redemptions coupon_redemptions_coupon_id_coupon_codes_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."coupon_redemptions"
    ADD CONSTRAINT "coupon_redemptions_coupon_id_coupon_codes_id_fk" FOREIGN KEY ("coupon_id") REFERENCES "public"."coupon_codes"("id") ON DELETE SET NULL;


--
-- Name: coupon_redemptions coupon_redemptions_course_enrollment_id_course_enrollments_id_f; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."coupon_redemptions"
    ADD CONSTRAINT "coupon_redemptions_course_enrollment_id_course_enrollments_id_f" FOREIGN KEY ("course_enrollment_id") REFERENCES "public"."course_enrollments"("id") ON DELETE SET NULL;


--
-- Name: coupon_redemptions coupon_redemptions_course_id_courses_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."coupon_redemptions"
    ADD CONSTRAINT "coupon_redemptions_course_id_courses_id_fk" FOREIGN KEY ("course_id") REFERENCES "public"."courses"("id") ON DELETE SET NULL;


--
-- Name: coupon_redemptions coupon_redemptions_trainee_id_trainees_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."coupon_redemptions"
    ADD CONSTRAINT "coupon_redemptions_trainee_id_trainees_id_fk" FOREIGN KEY ("trainee_id") REFERENCES "public"."trainees"("id") ON DELETE SET NULL;


--
-- Name: coupon_redemptions coupon_redemptions_user_id_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."coupon_redemptions"
    ADD CONSTRAINT "coupon_redemptions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE SET NULL;


--
-- Name: course_categories course_categories_icon_id_media_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."course_categories"
    ADD CONSTRAINT "course_categories_icon_id_media_id_fk" FOREIGN KEY ("icon_id") REFERENCES "public"."media"("id") ON DELETE SET NULL;


--
-- Name: course_categories course_categories_parent_id_course_categories_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."course_categories"
    ADD CONSTRAINT "course_categories_parent_id_course_categories_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."course_categories"("id") ON DELETE SET NULL;


--
-- Name: course_enrollments course_enrollments_coupon_id_coupon_codes_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."course_enrollments"
    ADD CONSTRAINT "course_enrollments_coupon_id_coupon_codes_id_fk" FOREIGN KEY ("coupon_id") REFERENCES "public"."coupon_codes"("id") ON DELETE SET NULL;


--
-- Name: course_enrollments course_enrollments_course_id_courses_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."course_enrollments"
    ADD CONSTRAINT "course_enrollments_course_id_courses_id_fk" FOREIGN KEY ("course_id") REFERENCES "public"."courses"("id") ON DELETE SET NULL;


--
-- Name: course_enrollments course_enrollments_enrolled_by_id_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."course_enrollments"
    ADD CONSTRAINT "course_enrollments_enrolled_by_id_users_id_fk" FOREIGN KEY ("enrolled_by_id") REFERENCES "public"."users"("id") ON DELETE SET NULL;


--
-- Name: course_enrollments course_enrollments_student_id_trainees_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."course_enrollments"
    ADD CONSTRAINT "course_enrollments_student_id_trainees_id_fk" FOREIGN KEY ("student_id") REFERENCES "public"."trainees"("id") ON DELETE SET NULL;


--
-- Name: course_item_progress course_item_progress_course_id_courses_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."course_item_progress"
    ADD CONSTRAINT "course_item_progress_course_id_courses_id_fk" FOREIGN KEY ("course_id") REFERENCES "public"."courses"("id") ON DELETE SET NULL;


--
-- Name: course_item_progress course_item_progress_enrollment_id_course_enrollments_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."course_item_progress"
    ADD CONSTRAINT "course_item_progress_enrollment_id_course_enrollments_id_fk" FOREIGN KEY ("enrollment_id") REFERENCES "public"."course_enrollments"("id") ON DELETE SET NULL;


--
-- Name: course_item_progress_rels course_item_progress_rels_assessments_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."course_item_progress_rels"
    ADD CONSTRAINT "course_item_progress_rels_assessments_fk" FOREIGN KEY ("assessments_id") REFERENCES "public"."assessments"("id") ON DELETE CASCADE;


--
-- Name: course_item_progress_rels course_item_progress_rels_assignments_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."course_item_progress_rels"
    ADD CONSTRAINT "course_item_progress_rels_assignments_fk" FOREIGN KEY ("assignments_id") REFERENCES "public"."assignments"("id") ON DELETE CASCADE;


--
-- Name: course_item_progress_rels course_item_progress_rels_course_lessons_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."course_item_progress_rels"
    ADD CONSTRAINT "course_item_progress_rels_course_lessons_fk" FOREIGN KEY ("course_lessons_id") REFERENCES "public"."course_lessons"("id") ON DELETE CASCADE;


--
-- Name: course_item_progress_rels course_item_progress_rels_parent_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."course_item_progress_rels"
    ADD CONSTRAINT "course_item_progress_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."course_item_progress"("id") ON DELETE CASCADE;


--
-- Name: course_item_progress course_item_progress_trainee_id_trainees_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."course_item_progress"
    ADD CONSTRAINT "course_item_progress_trainee_id_trainees_id_fk" FOREIGN KEY ("trainee_id") REFERENCES "public"."trainees"("id") ON DELETE SET NULL;


--
-- Name: course_lessons course_lessons_module_id_course_modules_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."course_lessons"
    ADD CONSTRAINT "course_lessons_module_id_course_modules_id_fk" FOREIGN KEY ("module_id") REFERENCES "public"."course_modules"("id") ON DELETE SET NULL;


--
-- Name: course_materials course_materials_course_id_courses_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."course_materials"
    ADD CONSTRAINT "course_materials_course_id_courses_id_fk" FOREIGN KEY ("course_id") REFERENCES "public"."courses"("id") ON DELETE SET NULL;


--
-- Name: course_materials course_materials_material_id_materials_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."course_materials"
    ADD CONSTRAINT "course_materials_material_id_materials_id_fk" FOREIGN KEY ("material_id") REFERENCES "public"."materials"("id") ON DELETE SET NULL;


--
-- Name: course_modules_rels course_modules_rels_assessments_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."course_modules_rels"
    ADD CONSTRAINT "course_modules_rels_assessments_fk" FOREIGN KEY ("assessments_id") REFERENCES "public"."assessments"("id") ON DELETE CASCADE;


--
-- Name: course_modules_rels course_modules_rels_assignments_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."course_modules_rels"
    ADD CONSTRAINT "course_modules_rels_assignments_fk" FOREIGN KEY ("assignments_id") REFERENCES "public"."assignments"("id") ON DELETE CASCADE;


--
-- Name: course_modules_rels course_modules_rels_course_lessons_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."course_modules_rels"
    ADD CONSTRAINT "course_modules_rels_course_lessons_fk" FOREIGN KEY ("course_lessons_id") REFERENCES "public"."course_lessons"("id") ON DELETE CASCADE;


--
-- Name: course_modules_rels course_modules_rels_parent_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."course_modules_rels"
    ADD CONSTRAINT "course_modules_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."course_modules"("id") ON DELETE CASCADE;


--
-- Name: courses courses_banner_image_id_media_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."courses"
    ADD CONSTRAINT "courses_banner_image_id_media_id_fk" FOREIGN KEY ("banner_image_id") REFERENCES "public"."media"("id") ON DELETE SET NULL;


--
-- Name: courses courses_certificate_template_id_certificate_templates_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."courses"
    ADD CONSTRAINT "courses_certificate_template_id_certificate_templates_id_fk" FOREIGN KEY ("certificate_template_id") REFERENCES "public"."certificate_templates"("id") ON DELETE SET NULL;


--
-- Name: courses courses_feedback_form_id_feedback_forms_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."courses"
    ADD CONSTRAINT "courses_feedback_form_id_feedback_forms_id_fk" FOREIGN KEY ("feedback_form_id") REFERENCES "public"."feedback_forms"("id") ON DELETE SET NULL;


--
-- Name: courses courses_instructor_id_instructors_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."courses"
    ADD CONSTRAINT "courses_instructor_id_instructors_id_fk" FOREIGN KEY ("instructor_id") REFERENCES "public"."instructors"("id") ON DELETE SET NULL;


--
-- Name: courses_learning_objectives courses_learning_objectives_parent_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."courses_learning_objectives"
    ADD CONSTRAINT "courses_learning_objectives_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."courses"("id") ON DELETE CASCADE;


--
-- Name: courses_prerequisites courses_prerequisites_parent_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."courses_prerequisites"
    ADD CONSTRAINT "courses_prerequisites_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."courses"("id") ON DELETE CASCADE;


--
-- Name: courses_rels courses_rels_course_categories_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."courses_rels"
    ADD CONSTRAINT "courses_rels_course_categories_fk" FOREIGN KEY ("course_categories_id") REFERENCES "public"."course_categories"("id") ON DELETE CASCADE;


--
-- Name: courses_rels courses_rels_course_modules_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."courses_rels"
    ADD CONSTRAINT "courses_rels_course_modules_fk" FOREIGN KEY ("course_modules_id") REFERENCES "public"."course_modules"("id") ON DELETE CASCADE;


--
-- Name: courses_rels courses_rels_instructors_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."courses_rels"
    ADD CONSTRAINT "courses_rels_instructors_fk" FOREIGN KEY ("instructors_id") REFERENCES "public"."instructors"("id") ON DELETE CASCADE;


--
-- Name: courses_rels courses_rels_parent_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."courses_rels"
    ADD CONSTRAINT "courses_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."courses"("id") ON DELETE CASCADE;


--
-- Name: courses courses_thumbnail_id_media_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."courses"
    ADD CONSTRAINT "courses_thumbnail_id_media_id_fk" FOREIGN KEY ("thumbnail_id") REFERENCES "public"."media"("id") ON DELETE SET NULL;


--
-- Name: emergency_contacts emergency_contacts_user_id_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."emergency_contacts"
    ADD CONSTRAINT "emergency_contacts_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE SET NULL;


--
-- Name: feedback_forms_blocks_choice_input_options feedback_forms_blocks_choice_input_options_parent_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."feedback_forms_blocks_choice_input_options"
    ADD CONSTRAINT "feedback_forms_blocks_choice_input_options_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."feedback_forms_blocks_choice_input"("id") ON DELETE CASCADE;


--
-- Name: feedback_forms_blocks_choice_input feedback_forms_blocks_choice_input_parent_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."feedback_forms_blocks_choice_input"
    ADD CONSTRAINT "feedback_forms_blocks_choice_input_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."feedback_forms"("id") ON DELETE CASCADE;


--
-- Name: feedback_forms_blocks_survey_matrix_columns feedback_forms_blocks_survey_matrix_columns_parent_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."feedback_forms_blocks_survey_matrix_columns"
    ADD CONSTRAINT "feedback_forms_blocks_survey_matrix_columns_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."feedback_forms_blocks_survey_matrix"("id") ON DELETE CASCADE;


--
-- Name: feedback_forms_blocks_survey_matrix feedback_forms_blocks_survey_matrix_parent_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."feedback_forms_blocks_survey_matrix"
    ADD CONSTRAINT "feedback_forms_blocks_survey_matrix_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."feedback_forms"("id") ON DELETE CASCADE;


--
-- Name: feedback_forms_blocks_survey_matrix_rows feedback_forms_blocks_survey_matrix_rows_parent_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."feedback_forms_blocks_survey_matrix_rows"
    ADD CONSTRAINT "feedback_forms_blocks_survey_matrix_rows_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."feedback_forms_blocks_survey_matrix"("id") ON DELETE CASCADE;


--
-- Name: feedback_forms_blocks_text_input feedback_forms_blocks_text_input_parent_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."feedback_forms_blocks_text_input"
    ADD CONSTRAINT "feedback_forms_blocks_text_input_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."feedback_forms"("id") ON DELETE CASCADE;


--
-- Name: feedback_submissions feedback_submissions_course_id_courses_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."feedback_submissions"
    ADD CONSTRAINT "feedback_submissions_course_id_courses_id_fk" FOREIGN KEY ("course_id") REFERENCES "public"."courses"("id") ON DELETE SET NULL;


--
-- Name: feedback_submissions feedback_submissions_form_id_feedback_forms_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."feedback_submissions"
    ADD CONSTRAINT "feedback_submissions_form_id_feedback_forms_id_fk" FOREIGN KEY ("form_id") REFERENCES "public"."feedback_forms"("id") ON DELETE SET NULL;


--
-- Name: feedback_submissions feedback_submissions_trainee_id_trainees_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."feedback_submissions"
    ADD CONSTRAINT "feedback_submissions_trainee_id_trainees_id_fk" FOREIGN KEY ("trainee_id") REFERENCES "public"."trainees"("id") ON DELETE SET NULL;


--
-- Name: instructors instructors_user_id_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."instructors"
    ADD CONSTRAINT "instructors_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE SET NULL;


--
-- Name: lesson_materials lesson_materials_lesson_id_course_lessons_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."lesson_materials"
    ADD CONSTRAINT "lesson_materials_lesson_id_course_lessons_id_fk" FOREIGN KEY ("lesson_id") REFERENCES "public"."course_lessons"("id") ON DELETE SET NULL;


--
-- Name: lesson_materials lesson_materials_material_id_materials_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."lesson_materials"
    ADD CONSTRAINT "lesson_materials_material_id_materials_id_fk" FOREIGN KEY ("material_id") REFERENCES "public"."materials"("id") ON DELETE SET NULL;


--
-- Name: materials_rels materials_rels_media_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."materials_rels"
    ADD CONSTRAINT "materials_rels_media_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE CASCADE;


--
-- Name: materials_rels materials_rels_parent_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."materials_rels"
    ADD CONSTRAINT "materials_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."materials"("id") ON DELETE CASCADE;


--
-- Name: notification_templates_channels notification_templates_channels_parent_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."notification_templates_channels"
    ADD CONSTRAINT "notification_templates_channels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."notification_templates"("id") ON DELETE CASCADE;


--
-- Name: notifications notifications_actor_id_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."notifications"
    ADD CONSTRAINT "notifications_actor_id_users_id_fk" FOREIGN KEY ("actor_id") REFERENCES "public"."users"("id") ON DELETE SET NULL;


--
-- Name: notifications_rels notifications_rels_parent_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."notifications_rels"
    ADD CONSTRAINT "notifications_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."notifications"("id") ON DELETE CASCADE;


--
-- Name: notifications_rels notifications_rels_users_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."notifications_rels"
    ADD CONSTRAINT "notifications_rels_users_fk" FOREIGN KEY ("users_id") REFERENCES "public"."users"("id") ON DELETE CASCADE;


--
-- Name: notifications notifications_template_id_notification_templates_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."notifications"
    ADD CONSTRAINT "notifications_template_id_notification_templates_id_fk" FOREIGN KEY ("template_id") REFERENCES "public"."notification_templates"("id") ON DELETE SET NULL;


--
-- Name: payload_locked_documents_rels payload_locked_documents_rels_admins_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."payload_locked_documents_rels"
    ADD CONSTRAINT "payload_locked_documents_rels_admins_fk" FOREIGN KEY ("admins_id") REFERENCES "public"."admins"("id") ON DELETE CASCADE;


--
-- Name: payload_locked_documents_rels payload_locked_documents_rels_announcements_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."payload_locked_documents_rels"
    ADD CONSTRAINT "payload_locked_documents_rels_announcements_fk" FOREIGN KEY ("announcements_id") REFERENCES "public"."announcements"("id") ON DELETE CASCADE;


--
-- Name: payload_locked_documents_rels payload_locked_documents_rels_assessment_submissions_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."payload_locked_documents_rels"
    ADD CONSTRAINT "payload_locked_documents_rels_assessment_submissions_fk" FOREIGN KEY ("assessment_submissions_id") REFERENCES "public"."assessment_submissions"("id") ON DELETE CASCADE;


--
-- Name: payload_locked_documents_rels payload_locked_documents_rels_assessments_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."payload_locked_documents_rels"
    ADD CONSTRAINT "payload_locked_documents_rels_assessments_fk" FOREIGN KEY ("assessments_id") REFERENCES "public"."assessments"("id") ON DELETE CASCADE;


--
-- Name: payload_locked_documents_rels payload_locked_documents_rels_assignment_submissions_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."payload_locked_documents_rels"
    ADD CONSTRAINT "payload_locked_documents_rels_assignment_submissions_fk" FOREIGN KEY ("assignment_submissions_id") REFERENCES "public"."assignment_submissions"("id") ON DELETE CASCADE;


--
-- Name: payload_locked_documents_rels payload_locked_documents_rels_assignments_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."payload_locked_documents_rels"
    ADD CONSTRAINT "payload_locked_documents_rels_assignments_fk" FOREIGN KEY ("assignments_id") REFERENCES "public"."assignments"("id") ON DELETE CASCADE;


--
-- Name: payload_locked_documents_rels payload_locked_documents_rels_certificate_templates_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."payload_locked_documents_rels"
    ADD CONSTRAINT "payload_locked_documents_rels_certificate_templates_fk" FOREIGN KEY ("certificate_templates_id") REFERENCES "public"."certificate_templates"("id") ON DELETE CASCADE;


--
-- Name: payload_locked_documents_rels payload_locked_documents_rels_certificates_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."payload_locked_documents_rels"
    ADD CONSTRAINT "payload_locked_documents_rels_certificates_fk" FOREIGN KEY ("certificates_id") REFERENCES "public"."certificates"("id") ON DELETE CASCADE;


--
-- Name: payload_locked_documents_rels payload_locked_documents_rels_chat_message_status_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."payload_locked_documents_rels"
    ADD CONSTRAINT "payload_locked_documents_rels_chat_message_status_fk" FOREIGN KEY ("chat_message_status_id") REFERENCES "public"."chat_message_status"("id") ON DELETE CASCADE;


--
-- Name: payload_locked_documents_rels payload_locked_documents_rels_chat_messages_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."payload_locked_documents_rels"
    ADD CONSTRAINT "payload_locked_documents_rels_chat_messages_fk" FOREIGN KEY ("chat_messages_id") REFERENCES "public"."chat_messages"("id") ON DELETE CASCADE;


--
-- Name: payload_locked_documents_rels payload_locked_documents_rels_chat_typing_status_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."payload_locked_documents_rels"
    ADD CONSTRAINT "payload_locked_documents_rels_chat_typing_status_fk" FOREIGN KEY ("chat_typing_status_id") REFERENCES "public"."chat_typing_status"("id") ON DELETE CASCADE;


--
-- Name: payload_locked_documents_rels payload_locked_documents_rels_chats_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."payload_locked_documents_rels"
    ADD CONSTRAINT "payload_locked_documents_rels_chats_fk" FOREIGN KEY ("chats_id") REFERENCES "public"."chats"("id") ON DELETE CASCADE;


--
-- Name: payload_locked_documents_rels payload_locked_documents_rels_coupon_codes_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."payload_locked_documents_rels"
    ADD CONSTRAINT "payload_locked_documents_rels_coupon_codes_fk" FOREIGN KEY ("coupon_codes_id") REFERENCES "public"."coupon_codes"("id") ON DELETE CASCADE;


--
-- Name: payload_locked_documents_rels payload_locked_documents_rels_coupon_redemptions_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."payload_locked_documents_rels"
    ADD CONSTRAINT "payload_locked_documents_rels_coupon_redemptions_fk" FOREIGN KEY ("coupon_redemptions_id") REFERENCES "public"."coupon_redemptions"("id") ON DELETE CASCADE;


--
-- Name: payload_locked_documents_rels payload_locked_documents_rels_course_categories_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."payload_locked_documents_rels"
    ADD CONSTRAINT "payload_locked_documents_rels_course_categories_fk" FOREIGN KEY ("course_categories_id") REFERENCES "public"."course_categories"("id") ON DELETE CASCADE;


--
-- Name: payload_locked_documents_rels payload_locked_documents_rels_course_enrollments_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."payload_locked_documents_rels"
    ADD CONSTRAINT "payload_locked_documents_rels_course_enrollments_fk" FOREIGN KEY ("course_enrollments_id") REFERENCES "public"."course_enrollments"("id") ON DELETE CASCADE;


--
-- Name: payload_locked_documents_rels payload_locked_documents_rels_course_item_progress_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."payload_locked_documents_rels"
    ADD CONSTRAINT "payload_locked_documents_rels_course_item_progress_fk" FOREIGN KEY ("course_item_progress_id") REFERENCES "public"."course_item_progress"("id") ON DELETE CASCADE;


--
-- Name: payload_locked_documents_rels payload_locked_documents_rels_course_lessons_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."payload_locked_documents_rels"
    ADD CONSTRAINT "payload_locked_documents_rels_course_lessons_fk" FOREIGN KEY ("course_lessons_id") REFERENCES "public"."course_lessons"("id") ON DELETE CASCADE;


--
-- Name: payload_locked_documents_rels payload_locked_documents_rels_course_materials_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."payload_locked_documents_rels"
    ADD CONSTRAINT "payload_locked_documents_rels_course_materials_fk" FOREIGN KEY ("course_materials_id") REFERENCES "public"."course_materials"("id") ON DELETE CASCADE;


--
-- Name: payload_locked_documents_rels payload_locked_documents_rels_course_modules_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."payload_locked_documents_rels"
    ADD CONSTRAINT "payload_locked_documents_rels_course_modules_fk" FOREIGN KEY ("course_modules_id") REFERENCES "public"."course_modules"("id") ON DELETE CASCADE;


--
-- Name: payload_locked_documents_rels payload_locked_documents_rels_courses_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."payload_locked_documents_rels"
    ADD CONSTRAINT "payload_locked_documents_rels_courses_fk" FOREIGN KEY ("courses_id") REFERENCES "public"."courses"("id") ON DELETE CASCADE;


--
-- Name: payload_locked_documents_rels payload_locked_documents_rels_emergency_contacts_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."payload_locked_documents_rels"
    ADD CONSTRAINT "payload_locked_documents_rels_emergency_contacts_fk" FOREIGN KEY ("emergency_contacts_id") REFERENCES "public"."emergency_contacts"("id") ON DELETE CASCADE;


--
-- Name: payload_locked_documents_rels payload_locked_documents_rels_feedback_forms_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."payload_locked_documents_rels"
    ADD CONSTRAINT "payload_locked_documents_rels_feedback_forms_fk" FOREIGN KEY ("feedback_forms_id") REFERENCES "public"."feedback_forms"("id") ON DELETE CASCADE;


--
-- Name: payload_locked_documents_rels payload_locked_documents_rels_feedback_submissions_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."payload_locked_documents_rels"
    ADD CONSTRAINT "payload_locked_documents_rels_feedback_submissions_fk" FOREIGN KEY ("feedback_submissions_id") REFERENCES "public"."feedback_submissions"("id") ON DELETE CASCADE;


--
-- Name: payload_locked_documents_rels payload_locked_documents_rels_instructors_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."payload_locked_documents_rels"
    ADD CONSTRAINT "payload_locked_documents_rels_instructors_fk" FOREIGN KEY ("instructors_id") REFERENCES "public"."instructors"("id") ON DELETE CASCADE;


--
-- Name: payload_locked_documents_rels payload_locked_documents_rels_lesson_materials_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."payload_locked_documents_rels"
    ADD CONSTRAINT "payload_locked_documents_rels_lesson_materials_fk" FOREIGN KEY ("lesson_materials_id") REFERENCES "public"."lesson_materials"("id") ON DELETE CASCADE;


--
-- Name: payload_locked_documents_rels payload_locked_documents_rels_materials_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."payload_locked_documents_rels"
    ADD CONSTRAINT "payload_locked_documents_rels_materials_fk" FOREIGN KEY ("materials_id") REFERENCES "public"."materials"("id") ON DELETE CASCADE;


--
-- Name: payload_locked_documents_rels payload_locked_documents_rels_media_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."payload_locked_documents_rels"
    ADD CONSTRAINT "payload_locked_documents_rels_media_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE CASCADE;


--
-- Name: payload_locked_documents_rels payload_locked_documents_rels_notification_templates_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."payload_locked_documents_rels"
    ADD CONSTRAINT "payload_locked_documents_rels_notification_templates_fk" FOREIGN KEY ("notification_templates_id") REFERENCES "public"."notification_templates"("id") ON DELETE CASCADE;


--
-- Name: payload_locked_documents_rels payload_locked_documents_rels_notifications_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."payload_locked_documents_rels"
    ADD CONSTRAINT "payload_locked_documents_rels_notifications_fk" FOREIGN KEY ("notifications_id") REFERENCES "public"."notifications"("id") ON DELETE CASCADE;


--
-- Name: payload_locked_documents_rels payload_locked_documents_rels_parent_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."payload_locked_documents_rels"
    ADD CONSTRAINT "payload_locked_documents_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."payload_locked_documents"("id") ON DELETE CASCADE;


--
-- Name: payload_locked_documents_rels payload_locked_documents_rels_post_categories_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."payload_locked_documents_rels"
    ADD CONSTRAINT "payload_locked_documents_rels_post_categories_fk" FOREIGN KEY ("post_categories_id") REFERENCES "public"."post_categories"("id") ON DELETE CASCADE;


--
-- Name: payload_locked_documents_rels payload_locked_documents_rels_posts_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."payload_locked_documents_rels"
    ADD CONSTRAINT "payload_locked_documents_rels_posts_fk" FOREIGN KEY ("posts_id") REFERENCES "public"."posts"("id") ON DELETE CASCADE;


--
-- Name: payload_locked_documents_rels payload_locked_documents_rels_questions_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."payload_locked_documents_rels"
    ADD CONSTRAINT "payload_locked_documents_rels_questions_fk" FOREIGN KEY ("questions_id") REFERENCES "public"."questions"("id") ON DELETE CASCADE;


--
-- Name: payload_locked_documents_rels payload_locked_documents_rels_recently_viewed_courses_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."payload_locked_documents_rels"
    ADD CONSTRAINT "payload_locked_documents_rels_recently_viewed_courses_fk" FOREIGN KEY ("recently_viewed_courses_id") REFERENCES "public"."recently_viewed_courses"("id") ON DELETE CASCADE;


--
-- Name: payload_locked_documents_rels payload_locked_documents_rels_submission_answers_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."payload_locked_documents_rels"
    ADD CONSTRAINT "payload_locked_documents_rels_submission_answers_fk" FOREIGN KEY ("submission_answers_id") REFERENCES "public"."submission_answers"("id") ON DELETE CASCADE;


--
-- Name: payload_locked_documents_rels payload_locked_documents_rels_support_ticket_messages_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."payload_locked_documents_rels"
    ADD CONSTRAINT "payload_locked_documents_rels_support_ticket_messages_fk" FOREIGN KEY ("support_ticket_messages_id") REFERENCES "public"."support_ticket_messages"("id") ON DELETE CASCADE;


--
-- Name: payload_locked_documents_rels payload_locked_documents_rels_support_tickets_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."payload_locked_documents_rels"
    ADD CONSTRAINT "payload_locked_documents_rels_support_tickets_fk" FOREIGN KEY ("support_tickets_id") REFERENCES "public"."support_tickets"("id") ON DELETE CASCADE;


--
-- Name: payload_locked_documents_rels payload_locked_documents_rels_trainees_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."payload_locked_documents_rels"
    ADD CONSTRAINT "payload_locked_documents_rels_trainees_fk" FOREIGN KEY ("trainees_id") REFERENCES "public"."trainees"("id") ON DELETE CASCADE;


--
-- Name: payload_locked_documents_rels payload_locked_documents_rels_user_events_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."payload_locked_documents_rels"
    ADD CONSTRAINT "payload_locked_documents_rels_user_events_fk" FOREIGN KEY ("user_events_id") REFERENCES "public"."user_events"("id") ON DELETE CASCADE;


--
-- Name: payload_locked_documents_rels payload_locked_documents_rels_user_notifications_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."payload_locked_documents_rels"
    ADD CONSTRAINT "payload_locked_documents_rels_user_notifications_fk" FOREIGN KEY ("user_notifications_id") REFERENCES "public"."user_notifications"("id") ON DELETE CASCADE;


--
-- Name: payload_locked_documents_rels payload_locked_documents_rels_users_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."payload_locked_documents_rels"
    ADD CONSTRAINT "payload_locked_documents_rels_users_fk" FOREIGN KEY ("users_id") REFERENCES "public"."users"("id") ON DELETE CASCADE;


--
-- Name: payload_locked_documents_rels payload_locked_documents_rels_web_push_subscriptions_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."payload_locked_documents_rels"
    ADD CONSTRAINT "payload_locked_documents_rels_web_push_subscriptions_fk" FOREIGN KEY ("web_push_subscriptions_id") REFERENCES "public"."web_push_subscriptions"("id") ON DELETE CASCADE;


--
-- Name: payload_locked_documents_rels payload_locked_documents_rels_wishlists_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."payload_locked_documents_rels"
    ADD CONSTRAINT "payload_locked_documents_rels_wishlists_fk" FOREIGN KEY ("wishlists_id") REFERENCES "public"."wishlists"("id") ON DELETE CASCADE;


--
-- Name: payload_preferences_rels payload_preferences_rels_parent_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."payload_preferences_rels"
    ADD CONSTRAINT "payload_preferences_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."payload_preferences"("id") ON DELETE CASCADE;


--
-- Name: payload_preferences_rels payload_preferences_rels_users_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."payload_preferences_rels"
    ADD CONSTRAINT "payload_preferences_rels_users_fk" FOREIGN KEY ("users_id") REFERENCES "public"."users"("id") ON DELETE CASCADE;


--
-- Name: post_categories post_categories_icon_id_media_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."post_categories"
    ADD CONSTRAINT "post_categories_icon_id_media_id_fk" FOREIGN KEY ("icon_id") REFERENCES "public"."media"("id") ON DELETE SET NULL;


--
-- Name: posts posts_author_id_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."posts"
    ADD CONSTRAINT "posts_author_id_users_id_fk" FOREIGN KEY ("author_id") REFERENCES "public"."users"("id") ON DELETE SET NULL;


--
-- Name: posts posts_featured_image_id_media_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."posts"
    ADD CONSTRAINT "posts_featured_image_id_media_id_fk" FOREIGN KEY ("featured_image_id") REFERENCES "public"."media"("id") ON DELETE SET NULL;


--
-- Name: posts_rels posts_rels_parent_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."posts_rels"
    ADD CONSTRAINT "posts_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."posts"("id") ON DELETE CASCADE;


--
-- Name: posts_rels posts_rels_post_categories_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."posts_rels"
    ADD CONSTRAINT "posts_rels_post_categories_fk" FOREIGN KEY ("post_categories_id") REFERENCES "public"."post_categories"("id") ON DELETE CASCADE;


--
-- Name: posts_tags posts_tags_parent_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."posts_tags"
    ADD CONSTRAINT "posts_tags_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."posts"("id") ON DELETE CASCADE;


--
-- Name: questions_options questions_options_parent_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."questions_options"
    ADD CONSTRAINT "questions_options_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."questions"("id") ON DELETE CASCADE;


--
-- Name: questions_texts questions_texts_parent_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."questions_texts"
    ADD CONSTRAINT "questions_texts_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."questions"("id") ON DELETE CASCADE;


--
-- Name: recent_searches recent_searches_user_id_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."recent_searches"
    ADD CONSTRAINT "recent_searches_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE SET NULL;


--
-- Name: recently_viewed_courses recently_viewed_courses_course_id_courses_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."recently_viewed_courses"
    ADD CONSTRAINT "recently_viewed_courses_course_id_courses_id_fk" FOREIGN KEY ("course_id") REFERENCES "public"."courses"("id") ON DELETE SET NULL;


--
-- Name: recently_viewed_courses recently_viewed_courses_user_id_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."recently_viewed_courses"
    ADD CONSTRAINT "recently_viewed_courses_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE SET NULL;


--
-- Name: site_settings site_settings_favicon_id_media_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."site_settings"
    ADD CONSTRAINT "site_settings_favicon_id_media_id_fk" FOREIGN KEY ("favicon_id") REFERENCES "public"."media"("id") ON DELETE SET NULL;


--
-- Name: site_settings site_settings_logo_id_media_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."site_settings"
    ADD CONSTRAINT "site_settings_logo_id_media_id_fk" FOREIGN KEY ("logo_id") REFERENCES "public"."media"("id") ON DELETE SET NULL;


--
-- Name: site_settings_social_links site_settings_social_links_parent_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."site_settings_social_links"
    ADD CONSTRAINT "site_settings_social_links_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."site_settings"("id") ON DELETE CASCADE;


--
-- Name: submission_answers submission_answers_question_id_questions_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."submission_answers"
    ADD CONSTRAINT "submission_answers_question_id_questions_id_fk" FOREIGN KEY ("question_id") REFERENCES "public"."questions"("id") ON DELETE SET NULL;


--
-- Name: submission_answers submission_answers_submission_id_assessment_submissions_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."submission_answers"
    ADD CONSTRAINT "submission_answers_submission_id_assessment_submissions_id_fk" FOREIGN KEY ("submission_id") REFERENCES "public"."assessment_submissions"("id") ON DELETE SET NULL;


--
-- Name: support_ticket_messages_rels support_ticket_messages_rels_media_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."support_ticket_messages_rels"
    ADD CONSTRAINT "support_ticket_messages_rels_media_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE CASCADE;


--
-- Name: support_ticket_messages_rels support_ticket_messages_rels_parent_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."support_ticket_messages_rels"
    ADD CONSTRAINT "support_ticket_messages_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."support_ticket_messages"("id") ON DELETE CASCADE;


--
-- Name: support_ticket_messages support_ticket_messages_sender_id_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."support_ticket_messages"
    ADD CONSTRAINT "support_ticket_messages_sender_id_users_id_fk" FOREIGN KEY ("sender_id") REFERENCES "public"."users"("id") ON DELETE SET NULL;


--
-- Name: support_ticket_messages support_ticket_messages_ticket_id_support_tickets_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."support_ticket_messages"
    ADD CONSTRAINT "support_ticket_messages_ticket_id_support_tickets_id_fk" FOREIGN KEY ("ticket_id") REFERENCES "public"."support_tickets"("id") ON DELETE SET NULL;


--
-- Name: support_tickets support_tickets_assigned_to_id_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."support_tickets"
    ADD CONSTRAINT "support_tickets_assigned_to_id_users_id_fk" FOREIGN KEY ("assigned_to_id") REFERENCES "public"."users"("id") ON DELETE SET NULL;


--
-- Name: support_tickets_rels support_tickets_rels_media_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."support_tickets_rels"
    ADD CONSTRAINT "support_tickets_rels_media_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE CASCADE;


--
-- Name: support_tickets_rels support_tickets_rels_parent_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."support_tickets_rels"
    ADD CONSTRAINT "support_tickets_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."support_tickets"("id") ON DELETE CASCADE;


--
-- Name: support_tickets support_tickets_user_id_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."support_tickets"
    ADD CONSTRAINT "support_tickets_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE SET NULL;


--
-- Name: trainees trainees_user_id_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."trainees"
    ADD CONSTRAINT "trainees_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE SET NULL;


--
-- Name: user_events user_events_triggered_by_id_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."user_events"
    ADD CONSTRAINT "user_events_triggered_by_id_users_id_fk" FOREIGN KEY ("triggered_by_id") REFERENCES "public"."users"("id") ON DELETE SET NULL;


--
-- Name: user_events user_events_user_id_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."user_events"
    ADD CONSTRAINT "user_events_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE SET NULL;


--
-- Name: user_notifications user_notifications_notification_id_notifications_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."user_notifications"
    ADD CONSTRAINT "user_notifications_notification_id_notifications_id_fk" FOREIGN KEY ("notification_id") REFERENCES "public"."notifications"("id") ON DELETE SET NULL;


--
-- Name: user_notifications user_notifications_user_id_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."user_notifications"
    ADD CONSTRAINT "user_notifications_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE SET NULL;


--
-- Name: users users_profile_picture_id_media_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."users"
    ADD CONSTRAINT "users_profile_picture_id_media_id_fk" FOREIGN KEY ("profile_picture_id") REFERENCES "public"."media"("id") ON DELETE SET NULL;


--
-- Name: users_reset_password_tokens users_reset_password_tokens_parent_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."users_reset_password_tokens"
    ADD CONSTRAINT "users_reset_password_tokens_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."users"("id") ON DELETE CASCADE;


--
-- Name: users_sessions users_sessions_parent_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."users_sessions"
    ADD CONSTRAINT "users_sessions_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."users"("id") ON DELETE CASCADE;


--
-- Name: web_push_subscriptions web_push_subscriptions_user_id_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."web_push_subscriptions"
    ADD CONSTRAINT "web_push_subscriptions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE SET NULL;


--
-- Name: wishlists wishlists_course_id_courses_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."wishlists"
    ADD CONSTRAINT "wishlists_course_id_courses_id_fk" FOREIGN KEY ("course_id") REFERENCES "public"."courses"("id") ON DELETE SET NULL;


--
-- Name: wishlists wishlists_user_id_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."wishlists"
    ADD CONSTRAINT "wishlists_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE SET NULL;


--
-- Name: objects objects_bucketId_fkey; Type: FK CONSTRAINT; Schema: storage; Owner: -
--

ALTER TABLE ONLY "storage"."objects"
    ADD CONSTRAINT "objects_bucketId_fkey" FOREIGN KEY ("bucket_id") REFERENCES "storage"."buckets"("id");


--
-- Name: s3_multipart_uploads s3_multipart_uploads_bucket_id_fkey; Type: FK CONSTRAINT; Schema: storage; Owner: -
--

ALTER TABLE ONLY "storage"."s3_multipart_uploads"
    ADD CONSTRAINT "s3_multipart_uploads_bucket_id_fkey" FOREIGN KEY ("bucket_id") REFERENCES "storage"."buckets"("id");


--
-- Name: s3_multipart_uploads_parts s3_multipart_uploads_parts_bucket_id_fkey; Type: FK CONSTRAINT; Schema: storage; Owner: -
--

ALTER TABLE ONLY "storage"."s3_multipart_uploads_parts"
    ADD CONSTRAINT "s3_multipart_uploads_parts_bucket_id_fkey" FOREIGN KEY ("bucket_id") REFERENCES "storage"."buckets"("id");


--
-- Name: s3_multipart_uploads_parts s3_multipart_uploads_parts_upload_id_fkey; Type: FK CONSTRAINT; Schema: storage; Owner: -
--

ALTER TABLE ONLY "storage"."s3_multipart_uploads_parts"
    ADD CONSTRAINT "s3_multipart_uploads_parts_upload_id_fkey" FOREIGN KEY ("upload_id") REFERENCES "storage"."s3_multipart_uploads"("id") ON DELETE CASCADE;


--
-- Name: vector_indexes vector_indexes_bucket_id_fkey; Type: FK CONSTRAINT; Schema: storage; Owner: -
--

ALTER TABLE ONLY "storage"."vector_indexes"
    ADD CONSTRAINT "vector_indexes_bucket_id_fkey" FOREIGN KEY ("bucket_id") REFERENCES "storage"."buckets_vectors"("id");


--
-- Name: audit_log_entries; Type: ROW SECURITY; Schema: auth; Owner: -
--

ALTER TABLE "auth"."audit_log_entries" ENABLE ROW LEVEL SECURITY;

--
-- Name: flow_state; Type: ROW SECURITY; Schema: auth; Owner: -
--

ALTER TABLE "auth"."flow_state" ENABLE ROW LEVEL SECURITY;

--
-- Name: identities; Type: ROW SECURITY; Schema: auth; Owner: -
--

ALTER TABLE "auth"."identities" ENABLE ROW LEVEL SECURITY;

--
-- Name: instances; Type: ROW SECURITY; Schema: auth; Owner: -
--

ALTER TABLE "auth"."instances" ENABLE ROW LEVEL SECURITY;

--
-- Name: mfa_amr_claims; Type: ROW SECURITY; Schema: auth; Owner: -
--

ALTER TABLE "auth"."mfa_amr_claims" ENABLE ROW LEVEL SECURITY;

--
-- Name: mfa_challenges; Type: ROW SECURITY; Schema: auth; Owner: -
--

ALTER TABLE "auth"."mfa_challenges" ENABLE ROW LEVEL SECURITY;

--
-- Name: mfa_factors; Type: ROW SECURITY; Schema: auth; Owner: -
--

ALTER TABLE "auth"."mfa_factors" ENABLE ROW LEVEL SECURITY;

--
-- Name: one_time_tokens; Type: ROW SECURITY; Schema: auth; Owner: -
--

ALTER TABLE "auth"."one_time_tokens" ENABLE ROW LEVEL SECURITY;

--
-- Name: refresh_tokens; Type: ROW SECURITY; Schema: auth; Owner: -
--

ALTER TABLE "auth"."refresh_tokens" ENABLE ROW LEVEL SECURITY;

--
-- Name: saml_providers; Type: ROW SECURITY; Schema: auth; Owner: -
--

ALTER TABLE "auth"."saml_providers" ENABLE ROW LEVEL SECURITY;

--
-- Name: saml_relay_states; Type: ROW SECURITY; Schema: auth; Owner: -
--

ALTER TABLE "auth"."saml_relay_states" ENABLE ROW LEVEL SECURITY;

--
-- Name: schema_migrations; Type: ROW SECURITY; Schema: auth; Owner: -
--

ALTER TABLE "auth"."schema_migrations" ENABLE ROW LEVEL SECURITY;

--
-- Name: sessions; Type: ROW SECURITY; Schema: auth; Owner: -
--

ALTER TABLE "auth"."sessions" ENABLE ROW LEVEL SECURITY;

--
-- Name: sso_domains; Type: ROW SECURITY; Schema: auth; Owner: -
--

ALTER TABLE "auth"."sso_domains" ENABLE ROW LEVEL SECURITY;

--
-- Name: sso_providers; Type: ROW SECURITY; Schema: auth; Owner: -
--

ALTER TABLE "auth"."sso_providers" ENABLE ROW LEVEL SECURITY;

--
-- Name: users; Type: ROW SECURITY; Schema: auth; Owner: -
--

ALTER TABLE "auth"."users" ENABLE ROW LEVEL SECURITY;

--
-- Name: messages; Type: ROW SECURITY; Schema: realtime; Owner: -
--

ALTER TABLE "realtime"."messages" ENABLE ROW LEVEL SECURITY;

--
-- Name: buckets; Type: ROW SECURITY; Schema: storage; Owner: -
--

ALTER TABLE "storage"."buckets" ENABLE ROW LEVEL SECURITY;

--
-- Name: buckets_analytics; Type: ROW SECURITY; Schema: storage; Owner: -
--

ALTER TABLE "storage"."buckets_analytics" ENABLE ROW LEVEL SECURITY;

--
-- Name: buckets_vectors; Type: ROW SECURITY; Schema: storage; Owner: -
--

ALTER TABLE "storage"."buckets_vectors" ENABLE ROW LEVEL SECURITY;

--
-- Name: migrations; Type: ROW SECURITY; Schema: storage; Owner: -
--

ALTER TABLE "storage"."migrations" ENABLE ROW LEVEL SECURITY;

--
-- Name: objects; Type: ROW SECURITY; Schema: storage; Owner: -
--

ALTER TABLE "storage"."objects" ENABLE ROW LEVEL SECURITY;

--
-- Name: s3_multipart_uploads; Type: ROW SECURITY; Schema: storage; Owner: -
--

ALTER TABLE "storage"."s3_multipart_uploads" ENABLE ROW LEVEL SECURITY;

--
-- Name: s3_multipart_uploads_parts; Type: ROW SECURITY; Schema: storage; Owner: -
--

ALTER TABLE "storage"."s3_multipart_uploads_parts" ENABLE ROW LEVEL SECURITY;

--
-- Name: vector_indexes; Type: ROW SECURITY; Schema: storage; Owner: -
--

ALTER TABLE "storage"."vector_indexes" ENABLE ROW LEVEL SECURITY;

--
-- Name: supabase_realtime; Type: PUBLICATION; Schema: -; Owner: -
--

CREATE PUBLICATION "supabase_realtime" WITH (publish = 'insert, update, delete, truncate');


--
-- Name: supabase_realtime_messages_publication; Type: PUBLICATION; Schema: -; Owner: -
--

CREATE PUBLICATION "supabase_realtime_messages_publication" WITH (publish = 'insert, update, delete, truncate');


--
-- Name: supabase_realtime chat_message_status; Type: PUBLICATION TABLE; Schema: public; Owner: -
--

ALTER PUBLICATION "supabase_realtime" ADD TABLE ONLY "public"."chat_message_status";


--
-- Name: supabase_realtime chat_messages; Type: PUBLICATION TABLE; Schema: public; Owner: -
--

ALTER PUBLICATION "supabase_realtime" ADD TABLE ONLY "public"."chat_messages";


--
-- Name: supabase_realtime chat_messages_reactions; Type: PUBLICATION TABLE; Schema: public; Owner: -
--

ALTER PUBLICATION "supabase_realtime" ADD TABLE ONLY "public"."chat_messages_reactions";


--
-- Name: supabase_realtime chat_typing_status; Type: PUBLICATION TABLE; Schema: public; Owner: -
--

ALTER PUBLICATION "supabase_realtime" ADD TABLE ONLY "public"."chat_typing_status";


--
-- Name: supabase_realtime chats; Type: PUBLICATION TABLE; Schema: public; Owner: -
--

ALTER PUBLICATION "supabase_realtime" ADD TABLE ONLY "public"."chats";


--
-- Name: supabase_realtime_messages_publication messages; Type: PUBLICATION TABLE; Schema: realtime; Owner: -
--

ALTER PUBLICATION "supabase_realtime_messages_publication" ADD TABLE ONLY "realtime"."messages";


--
-- Name: issue_graphql_placeholder; Type: EVENT TRIGGER; Schema: -; Owner: -
--

CREATE EVENT TRIGGER "issue_graphql_placeholder" ON "sql_drop"
         WHEN TAG IN ('DROP EXTENSION')
   EXECUTE FUNCTION "extensions"."set_graphql_placeholder"();


--
-- Name: issue_pg_cron_access; Type: EVENT TRIGGER; Schema: -; Owner: -
--

CREATE EVENT TRIGGER "issue_pg_cron_access" ON "ddl_command_end"
         WHEN TAG IN ('CREATE EXTENSION')
   EXECUTE FUNCTION "extensions"."grant_pg_cron_access"();


--
-- Name: issue_pg_graphql_access; Type: EVENT TRIGGER; Schema: -; Owner: -
--

CREATE EVENT TRIGGER "issue_pg_graphql_access" ON "ddl_command_end"
         WHEN TAG IN ('CREATE FUNCTION')
   EXECUTE FUNCTION "extensions"."grant_pg_graphql_access"();


--
-- Name: issue_pg_net_access; Type: EVENT TRIGGER; Schema: -; Owner: -
--

CREATE EVENT TRIGGER "issue_pg_net_access" ON "ddl_command_end"
         WHEN TAG IN ('CREATE EXTENSION')
   EXECUTE FUNCTION "extensions"."grant_pg_net_access"();


--
-- Name: pgrst_ddl_watch; Type: EVENT TRIGGER; Schema: -; Owner: -
--

CREATE EVENT TRIGGER "pgrst_ddl_watch" ON "ddl_command_end"
   EXECUTE FUNCTION "extensions"."pgrst_ddl_watch"();


--
-- Name: pgrst_drop_watch; Type: EVENT TRIGGER; Schema: -; Owner: -
--

CREATE EVENT TRIGGER "pgrst_drop_watch" ON "sql_drop"
   EXECUTE FUNCTION "extensions"."pgrst_drop_watch"();


--
-- PostgreSQL database dump complete
--

\unrestrict latZrL8P8ywdD529ocvcMcFA8uWmdjT3pzAIQ8lnNY5AnFlIkZE83vugozcd6TS

