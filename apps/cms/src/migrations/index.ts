import * as migration_20250811_093559_add_focus_keyword_to_posts from './20250811_093559_add_focus_keyword_to_posts';
import * as migration_20250826_020303 from './20250826_020303';
import * as migration_20250826_060505 from './20250826_060505';
import * as migration_20250826_065630 from './20250826_065630';
import * as migration_20250826_083543 from './20250826_083543';
import * as migration_20250826_132231 from './20250826_132231';
import * as migration_20250826_add_missing_user_fields from './20250826_add_missing_user_fields';
import * as migration_20250826_create_emergency_contacts from './20250826_create_emergency_contacts';
import * as migration_20250826_fix_enum_values_in_triggers from './20250826_fix_enum_values_in_triggers';
import * as migration_20250826_fix_role_triggers from './20250826_fix_role_triggers';
import * as migration_20250826_performance_views from './20250826_performance_views';
import * as migration_20250826_remove_department_access from './20250826_remove_department_access';
import * as migration_20250826_remove_services_tables from './20250826_remove_services_tables';
import * as migration_20250826_remove_unnecessary_trainee_fields from './20250826_remove_unnecessary_trainee_fields';
import * as migration_20250826_remove_user_relationships from './20250826_remove_user_relationships';
import * as migration_20250826_safe_relations_cleanup from './20250826_safe_relations_cleanup';
import * as migration_20250827_fix_trigger_schema from './20250827_fix_trigger_schema';
import * as migration_20250828_fix_emergency_contact_middlename from './20250828_fix_emergency_contact_middlename';
import * as migration_20250831_remove_supabase_auth_columns from './20250831_remove_supabase_auth_columns';
import * as migration_20250831_safe_courses_schema_fix from './20250831_safe_courses_schema_fix';
import * as migration_20250832_fix_course_enrollments_amount_paid from './20250832_fix_course_enrollments_amount_paid';
import * as migration_20250904_fix_emergency_contacts from './20250904_fix_emergency_contacts';
import * as migration_20250904_fix_serial_type_error from './20250904_fix_serial_type_error';
import * as migration_20250904_re_enable_trainee_trigger from './20250904_re_enable_trainee_trigger';
import * as migration_20250911_add_service_role from './20250911_add_service_role';
import * as migration_20250911_fix_service_role_trigger from './20250911_fix_service_role_trigger';
import * as migration_20250914_115512 from './20250914_115512';
import * as migration_20250916_103718 from './20250916_103718';
import * as migration_20251204_112549_enable_multiple_categories from './20251204_112549_enable_multiple_categories';
import * as migration_20251206_135946 from './20251206_135946';
import * as migration_20251207_131842 from './20251207_131842';
import * as migration_20251208_181200_change_recent_searches_scope_to_text from './20251208_181200_change_recent_searches_scope_to_text';
import * as migration_20251211_134800_fk_cascade from './20251211_134800_fk_cascade';
import * as migration_20251211_140410_courses_instructor_cascade from './20251211_140410_courses_instructor_cascade';
import * as migration_20251211_155634 from './20251211_155634';
import * as migration_20251211_fix_cleanup_service_role from './20251211_fix_cleanup_service_role';
import * as migration_20251211_fix_users_api_keys from './20251211_fix_users_api_keys';
import * as migration_20251212_000000_fix_remaining_fks from './20251212_000000_fix_remaining_fks';
import * as migration_20251212_000001_force_cascade_delete from './20251212_000001_force_cascade_delete';
import * as migration_20251215_141702 from './20251215_141702';
import * as migration_20251228_114011 from './20251228_114011';
import * as migration_20251228_115048 from './20251228_115048';
import * as migration_20251229_124749 from './20251229_124749';
import * as migration_20251229_161038 from './20251229_161038';
import * as migration_20260105_122707 from './20260105_122707';
import * as migration_20260105_130917 from './20260105_130917';
import * as migration_20260106_041829 from './20260106_041829';
import * as migration_20260106_054302 from './20260106_054302';
import * as migration_20260106_103058 from './20260106_103058';
import * as migration_20260106_104305 from './20260106_104305';
import * as migration_20260112_120820 from './20260112_120820';
import * as migration_20260112_130501_assessments_course_final_exam from './20260112_130501_assessments_course_final_exam';
import * as migration_20260112_140201_remove_quizzes from './20260112_140201_remove_quizzes';
import * as migration_20260114_120001_add_assessments_description from './20260114_120001_add_assessments_description';
import * as migration_20260114_120101_add_course_modules_description from './20260114_120101_add_course_modules_description';
import * as migration_20260115_090000_add_courses_estimated_duration_unit from './20260115_090000_add_courses_estimated_duration_unit';
import * as migration_20260116_024259 from './20260116_024259';
import * as migration_20260116_065844 from './20260116_065844';
import * as migration_20260201_092442 from './20260201_092442';
import * as migration_20260204_041555_add_items_to_course_modules from './20260204_041555_add_items_to_course_modules';
import * as migration_20260204_043328_remove_order_fields from './20260204_043328_remove_order_fields';
import * as migration_20260205_091817_add_show_correct_answer from './20260205_091817_add_show_correct_answer';
import * as migration_20260205_115601_add_modules_to_courses from './20260205_115601_add_modules_to_courses';
import * as migration_20260205_122212_remove_course_and_order_from_modules from './20260205_122212_remove_course_and_order_from_modules';
import * as migration_20260206_072527_add_evaluation_mode from './20260206_072527_add_evaluation_mode';
import * as migration_20260206_080033_add_completed_lessons_to_enrollments from './20260206_080033_add_completed_lessons_to_enrollments';
import * as migration_20260206_095021_remove_completed_lessons from './20260206_095021_remove_completed_lessons';
import * as migration_20260206_101113_add_course_item_progress from './20260206_101113_add_course_item_progress';
import * as migration_20260207_121500_remove_company_members from './20260207_121500_remove_company_members';
import * as migration_20260208_120000_add_support_tickets from './20260208_120000_add_support_tickets';
import * as migration_20260210_000000_add_enrollment_category from './20260210_000000_add_enrollment_category';
import * as migration_20260212_143056_add_final_evaluation_field from './20260212_143056_add_final_evaluation_field';
import * as migration_20260213_120933_remove_user_certifications from './20260213_120933_remove_user_certifications';
import * as migration_20260213_124627_create_certificates_collection from './20260213_124627_create_certificates_collection';

export const migrations = [
  {
    up: migration_20250811_093559_add_focus_keyword_to_posts.up,
    down: migration_20250811_093559_add_focus_keyword_to_posts.down,
    name: '20250811_093559_add_focus_keyword_to_posts',
  },
  {
    up: migration_20250826_020303.up,
    down: migration_20250826_020303.down,
    name: '20250826_020303',
  },
  {
    up: migration_20250826_060505.up,
    down: migration_20250826_060505.down,
    name: '20250826_060505',
  },
  {
    up: migration_20250826_065630.up,
    down: migration_20250826_065630.down,
    name: '20250826_065630',
  },
  {
    up: migration_20250826_083543.up,
    down: migration_20250826_083543.down,
    name: '20250826_083543',
  },
  {
    up: migration_20250826_132231.up,
    down: migration_20250826_132231.down,
    name: '20250826_132231',
  },
  {
    up: migration_20250826_add_missing_user_fields.up,
    down: migration_20250826_add_missing_user_fields.down,
    name: '20250826_add_missing_user_fields',
  },
  {
    up: migration_20250826_create_emergency_contacts.up,
    down: migration_20250826_create_emergency_contacts.down,
    name: '20250826_create_emergency_contacts',
  },
  {
    up: migration_20250826_fix_enum_values_in_triggers.up,
    down: migration_20250826_fix_enum_values_in_triggers.down,
    name: '20250826_fix_enum_values_in_triggers',
  },
  {
    up: migration_20250826_fix_role_triggers.up,
    down: migration_20250826_fix_role_triggers.down,
    name: '20250826_fix_role_triggers',
  },
  {
    up: migration_20250826_performance_views.up,
    down: migration_20250826_performance_views.down,
    name: '20250826_performance_views',
  },
  {
    up: migration_20250826_remove_department_access.up,
    down: migration_20250826_remove_department_access.down,
    name: '20250826_remove_department_access',
  },
  {
    up: migration_20250826_remove_services_tables.up,
    down: migration_20250826_remove_services_tables.down,
    name: '20250826_remove_services_tables',
  },
  {
    up: migration_20250826_remove_unnecessary_trainee_fields.up,
    down: migration_20250826_remove_unnecessary_trainee_fields.down,
    name: '20250826_remove_unnecessary_trainee_fields',
  },
  {
    up: migration_20250826_remove_user_relationships.up,
    down: migration_20250826_remove_user_relationships.down,
    name: '20250826_remove_user_relationships',
  },
  {
    up: migration_20250826_safe_relations_cleanup.up,
    down: migration_20250826_safe_relations_cleanup.down,
    name: '20250826_safe_relations_cleanup',
  },
  {
    up: migration_20250827_fix_trigger_schema.up,
    down: migration_20250827_fix_trigger_schema.down,
    name: '20250827_fix_trigger_schema',
  },
  {
    up: migration_20250828_fix_emergency_contact_middlename.up,
    down: migration_20250828_fix_emergency_contact_middlename.down,
    name: '20250828_fix_emergency_contact_middlename',
  },
  {
    up: migration_20250831_remove_supabase_auth_columns.up,
    down: migration_20250831_remove_supabase_auth_columns.down,
    name: '20250831_remove_supabase_auth_columns',
  },
  {
    up: migration_20250831_safe_courses_schema_fix.up,
    down: migration_20250831_safe_courses_schema_fix.down,
    name: '20250831_safe_courses_schema_fix',
  },
  {
    up: migration_20250832_fix_course_enrollments_amount_paid.up,
    down: migration_20250832_fix_course_enrollments_amount_paid.down,
    name: '20250832_fix_course_enrollments_amount_paid',
  },
  {
    up: migration_20250904_fix_emergency_contacts.up,
    down: migration_20250904_fix_emergency_contacts.down,
    name: '20250904_fix_emergency_contacts',
  },
  {
    up: migration_20250904_fix_serial_type_error.up,
    down: migration_20250904_fix_serial_type_error.down,
    name: '20250904_fix_serial_type_error',
  },
  {
    up: migration_20250904_re_enable_trainee_trigger.up,
    down: migration_20250904_re_enable_trainee_trigger.down,
    name: '20250904_re_enable_trainee_trigger',
  },
  {
    up: migration_20250911_add_service_role.up,
    down: migration_20250911_add_service_role.down,
    name: '20250911_add_service_role',
  },
  {
    up: migration_20250911_fix_service_role_trigger.up,
    down: migration_20250911_fix_service_role_trigger.down,
    name: '20250911_fix_service_role_trigger',
  },
  {
    up: migration_20250914_115512.up,
    down: migration_20250914_115512.down,
    name: '20250914_115512',
  },
  {
    up: migration_20250916_103718.up,
    down: migration_20250916_103718.down,
    name: '20250916_103718',
  },
  {
    up: migration_20251204_112549_enable_multiple_categories.up,
    down: migration_20251204_112549_enable_multiple_categories.down,
    name: '20251204_112549_enable_multiple_categories',
  },
  {
    up: migration_20251206_135946.up,
    down: migration_20251206_135946.down,
    name: '20251206_135946',
  },
  {
    up: migration_20251207_131842.up,
    down: migration_20251207_131842.down,
    name: '20251207_131842',
  },
  {
    up: migration_20251208_181200_change_recent_searches_scope_to_text.up,
    down: migration_20251208_181200_change_recent_searches_scope_to_text.down,
    name: '20251208_181200_change_recent_searches_scope_to_text',
  },
  {
    up: migration_20251211_134800_fk_cascade.up,
    down: migration_20251211_134800_fk_cascade.down,
    name: '20251211_134800_fk_cascade',
  },
  {
    up: migration_20251211_140410_courses_instructor_cascade.up,
    down: migration_20251211_140410_courses_instructor_cascade.down,
    name: '20251211_140410_courses_instructor_cascade',
  },
  {
    up: migration_20251211_155634.up,
    down: migration_20251211_155634.down,
    name: '20251211_155634',
  },
  {
    up: migration_20251211_fix_cleanup_service_role.up,
    down: migration_20251211_fix_cleanup_service_role.down,
    name: '20251211_fix_cleanup_service_role',
  },
  {
    up: migration_20251211_fix_users_api_keys.up,
    down: migration_20251211_fix_users_api_keys.down,
    name: '20251211_fix_users_api_keys',
  },
  {
    up: migration_20251212_000000_fix_remaining_fks.up,
    down: migration_20251212_000000_fix_remaining_fks.down,
    name: '20251212_000000_fix_remaining_fks',
  },
  {
    up: migration_20251212_000001_force_cascade_delete.up,
    down: migration_20251212_000001_force_cascade_delete.down,
    name: '20251212_000001_force_cascade_delete',
  },
  {
    up: migration_20251215_141702.up,
    down: migration_20251215_141702.down,
    name: '20251215_141702',
  },
  {
    up: migration_20251228_114011.up,
    down: migration_20251228_114011.down,
    name: '20251228_114011',
  },
  {
    up: migration_20251228_115048.up,
    down: migration_20251228_115048.down,
    name: '20251228_115048',
  },
  {
    up: migration_20251229_124749.up,
    down: migration_20251229_124749.down,
    name: '20251229_124749',
  },
  {
    up: migration_20251229_161038.up,
    down: migration_20251229_161038.down,
    name: '20251229_161038',
  },
  {
    up: migration_20260105_122707.up,
    down: migration_20260105_122707.down,
    name: '20260105_122707',
  },
  {
    up: migration_20260105_130917.up,
    down: migration_20260105_130917.down,
    name: '20260105_130917',
  },
  {
    up: migration_20260106_041829.up,
    down: migration_20260106_041829.down,
    name: '20260106_041829',
  },
  {
    up: migration_20260106_054302.up,
    down: migration_20260106_054302.down,
    name: '20260106_054302',
  },
  {
    up: migration_20260106_103058.up,
    down: migration_20260106_103058.down,
    name: '20260106_103058',
  },
  {
    up: migration_20260106_104305.up,
    down: migration_20260106_104305.down,
    name: '20260106_104305',
  },
  {
    up: migration_20260112_120820.up,
    down: migration_20260112_120820.down,
    name: '20260112_120820',
  },
  {
    up: migration_20260112_130501_assessments_course_final_exam.up,
    down: migration_20260112_130501_assessments_course_final_exam.down,
    name: '20260112_130501_assessments_course_final_exam',
  },
  {
    up: migration_20260112_140201_remove_quizzes.up,
    down: migration_20260112_140201_remove_quizzes.down,
    name: '20260112_140201_remove_quizzes',
  },
  {
    up: migration_20260114_120001_add_assessments_description.up,
    down: migration_20260114_120001_add_assessments_description.down,
    name: '20260114_120001_add_assessments_description',
  },
  {
    up: migration_20260114_120101_add_course_modules_description.up,
    down: migration_20260114_120101_add_course_modules_description.down,
    name: '20260114_120101_add_course_modules_description',
  },
  {
    up: migration_20260115_090000_add_courses_estimated_duration_unit.up,
    down: migration_20260115_090000_add_courses_estimated_duration_unit.down,
    name: '20260115_090000_add_courses_estimated_duration_unit',
  },
  {
    up: migration_20260116_024259.up,
    down: migration_20260116_024259.down,
    name: '20260116_024259',
  },
  {
    up: migration_20260116_065844.up,
    down: migration_20260116_065844.down,
    name: '20260116_065844',
  },
  {
    up: migration_20260201_092442.up,
    down: migration_20260201_092442.down,
    name: '20260201_092442',
  },
  {
    up: migration_20260204_041555_add_items_to_course_modules.up,
    down: migration_20260204_041555_add_items_to_course_modules.down,
    name: '20260204_041555_add_items_to_course_modules',
  },
  {
    up: migration_20260204_043328_remove_order_fields.up,
    down: migration_20260204_043328_remove_order_fields.down,
    name: '20260204_043328_remove_order_fields',
  },
  {
    up: migration_20260205_091817_add_show_correct_answer.up,
    down: migration_20260205_091817_add_show_correct_answer.down,
    name: '20260205_091817_add_show_correct_answer',
  },
  {
    up: migration_20260205_115601_add_modules_to_courses.up,
    down: migration_20260205_115601_add_modules_to_courses.down,
    name: '20260205_115601_add_modules_to_courses',
  },
  {
    up: migration_20260205_122212_remove_course_and_order_from_modules.up,
    down: migration_20260205_122212_remove_course_and_order_from_modules.down,
    name: '20260205_122212_remove_course_and_order_from_modules',
  },
  {
    up: migration_20260206_072527_add_evaluation_mode.up,
    down: migration_20260206_072527_add_evaluation_mode.down,
    name: '20260206_072527_add_evaluation_mode',
  },
  {
    up: migration_20260206_080033_add_completed_lessons_to_enrollments.up,
    down: migration_20260206_080033_add_completed_lessons_to_enrollments.down,
    name: '20260206_080033_add_completed_lessons_to_enrollments',
  },
  {
    up: migration_20260206_095021_remove_completed_lessons.up,
    down: migration_20260206_095021_remove_completed_lessons.down,
    name: '20260206_095021_remove_completed_lessons',
  },
  {
    up: migration_20260206_101113_add_course_item_progress.up,
    down: migration_20260206_101113_add_course_item_progress.down,
    name: '20260206_101113_add_course_item_progress',
  },
  {
    up: migration_20260207_121500_remove_company_members.up,
    down: migration_20260207_121500_remove_company_members.down,
    name: '20260207_121500_remove_company_members',
  },
  {
    up: migration_20260208_120000_add_support_tickets.up,
    down: migration_20260208_120000_add_support_tickets.down,
    name: '20260208_120000_add_support_tickets',
  },
  {
    up: migration_20260210_000000_add_enrollment_category.up,
    down: migration_20260210_000000_add_enrollment_category.down,
    name: '20260210_000000_add_enrollment_category',
  },
  {
    up: migration_20260212_143056_add_final_evaluation_field.up,
    down: migration_20260212_143056_add_final_evaluation_field.down,
    name: '20260212_143056_add_final_evaluation_field',
  },
  {
    up: migration_20260213_120933_remove_user_certifications.up,
    down: migration_20260213_120933_remove_user_certifications.down,
    name: '20260213_120933_remove_user_certifications',
  },
  {
    up: migration_20260213_124627_create_certificates_collection.up,
    down: migration_20260213_124627_create_certificates_collection.down,
    name: '20260213_124627_create_certificates_collection'
  },
];
