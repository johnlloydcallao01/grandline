const fs = require('fs')
let file = fs.readFileSync('apps/cms/src/collections/Users.ts', 'utf8')
file = file.replace(/name: 'biography',[\s\S]*?\},[\r\n]{1,4}\s+\},/m, \
ame: 'biography',
      type: 'richText',
      editor: lexicalEditor(),
      admin: {
        description: 'Public biography or professional background',
        components: {
          Field: '/components/fields/CourseDescriptionEditor#CourseDescriptionEditor',
        },
      },
    },\)
fs.writeFileSync('apps/cms/src/collections/Users.ts', file)
