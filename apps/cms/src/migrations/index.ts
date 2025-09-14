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
    name: '20250914_115512'
  },
];
