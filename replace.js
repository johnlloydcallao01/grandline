const fs = require('fs');
let content = fs.readFileSync('apps/cms/src/collections/Users.ts', 'utf8');
const searchStr =     {
      name: 'completeAddress',
      type: 'textarea',
      admin: {
        description: 'Complete address',
      },
    },;
const newBlock =     {
      name: 'completeAddress',
      type: 'textarea',
      admin: {
        description: 'Complete address',
      },
    },
    {
      name: 'biography',
      type: 'textarea',
      admin: {
        description: 'Public biography or professional background',
      },
    },;

let normalizedContent = content.replace(/\r\n/g, '\n');
let replaced = normalizedContent.replace(searchStr, newBlock);
fs.writeFileSync('apps/cms/src/collections/Users.ts', replaced);
console.log('Done!');
