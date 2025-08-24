import * as migration_20250811_093559_add_focus_keyword_to_posts from './20250811_093559_add_focus_keyword_to_posts';

export const migrations = [
  {
    up: migration_20250811_093559_add_focus_keyword_to_posts.up,
    down: migration_20250811_093559_add_focus_keyword_to_posts.down,
    name: '20250811_093559_add_focus_keyword_to_posts'
  },
];
