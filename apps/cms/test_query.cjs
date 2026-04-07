const { Client } = require('pg');
const dotenv = require('dotenv');
dotenv.config();

const client = new Client({
  connectionString: process.env.DATABASE_URI
});

async function test() {
  await client.connect();
  try {
    await client.query(`
      select "payload_locked_documents"."id", "payload_locked_documents"."global_slug", "payload_locked_documents"."updated_at", "payload_locked_documents__rels"."data" as "_rels" from "payload_locked_documents" "payload_locked_documents" left join lateral (select coalesce(json_agg(json_build_array("payload_locked_documents__rels"."order", "payload_locked_documents__rels"."path", "payload_locked_documents__rels"."users_id", "payload_locked_documents__rels"."instructors_id", "payload_locked_documents__rels"."trainees_id", "payload_locked_documents__rels"."admins_id", "payload_locked_documents__rels"."user_events_id", "payload_locked_documents__rels"."emergency_contacts_id", "payload_locked_documents__rels"."media_id", "payload_locked_documents__rels"."posts_id", "payload_locked_documents__rels"."post_categories_id", "payload_locked_documents__rels"."courses_id", "payload_locked_documents__rels"."course_categories_id", "payload_locked_documents__rels"."course_enrollments_id", "payload_locked_documents__rels"."certificates_id", "payload_locked_documents__rels"."certificate_templates_id", "payload_locked_documents__rels"."course_modules_id", "payload_locked_documents__rels"."course_lessons_id", "payload_locked_documents__rels"."materials_id", "payload_locked_documents__rels"."course_materials_id", "payload_locked_documents__rels"."lesson_materials_id", "payload_locked_documents__rels"."announcements_id", "payload_locked_documents__rels"."course_feedbacks_id", "payload_locked_documents__rels"."wishlists_id", "payload_locked_documents__rels"."recently_viewed_courses_id", "payload_locked_documents__rels"."course_item_progress_id", "payload_locked_documents__rels"."questions_id", "payload_locked_documents__rels"."assessments_id", "payload_locked_documents__rels"."assessment_submissions_id", "payload_locked_documents__rels"."submission_answers_id", "payload_locked_documents__rels"."notification_templates_id", "payload_locked_documents__rels"."notifications_id", "payload_locked_documents__rels"."user_notifications_id", "payload_locked_documents__rels"."support_tickets_id", "payload_locked_documents__rels"."support_ticket_messages_id", "payload_locked_documents__rels"."chats_id", "payload_locked_documents__rels"."chat_messages_id", "payload_locked_documents__rels"."chat_message_status_id", "payload_locked_documents__rels"."chat_typing_status_id") order by "payload_locked_documents__rels"."order" asc), '[]'::json) as "data" from (select * from "payload_locked_documents_rels" "payload_locked_documents__rels" where "payload_locked_documents__rels"."parent_id" = "payload_locked_documents"."id" order by "payload_locked_documents__rels"."order" asc) "payload_locked_documents__rels") "payload_locked_documents__rels" on true where "payload_locked_documents"."global_slug" is not null order by "payload_locked_documents"."created_at" desc limit 1
    `);
    console.log("Query succeeded!");
  } catch (err) {
    console.error("DB Error:", err.message);
  } finally {
    await client.end();
  }
}
test();
