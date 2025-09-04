import * as migration_20250811_093559_add_focus_keyword_to_posts from './20250811_093559_add_focus_keyword_to_posts';
import * as migration_20250826_020303 from './20250826_020303';
import * as migration_20250826_060505 from './20250826_060505';
import * as migration_20250826_065630 from './20250826_065630';
import * as migration_20250826_083543 from './20250826_083543';
import * as migration_20250826_132231 from './20250826_132231';
import * as migration_20250826_performance_views from './20250826_performance_views';
import * as migration_20250831_safe_courses_schema_fix from './20250831_safe_courses_schema_fix';

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
    up: migration_20250826_performance_views.up,
    down: migration_20250826_performance_views.down,
    name: '20250826_performance_views'
  },
  {
    up: migration_20250831_safe_courses_schema_fix.up,
    down: migration_20250831_safe_courses_schema_fix.down,
    name: '20250831_safe_courses_schema_fix'
  },
];
