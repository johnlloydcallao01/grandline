const fs = require('fs');
const path = require('path');

const files = [
  'src/app/(main)/menu/page.tsx',
  'src/app/(main)/music/page.tsx',
  'src/app/(main)/news/page.tsx',
  'src/app/(main)/playlists/page.tsx',
  'src/app/(main)/shorts/ShortsClient.tsx',
  'src/app/(main)/sports/page.tsx',
  'src/app/(main)/subscriptions/page.tsx',
  'src/app/(main)/trending/page.tsx',
  'src/components/layout/Header.tsx',
  'src/components/ui/VideoCard.tsx'
];

files.forEach(filePath => {
  const fullPath = path.join(__dirname, filePath);
  if (fs.existsSync(fullPath)) {
    let content = fs.readFileSync(fullPath, 'utf8');
    
    // Replace next/image import with our wrapper
    content = content.replace(
      /import Image from ["']next\/image["'];?/g,
      'import Image from "@/components/ui/ImageWrapper";'
    );
    
    fs.writeFileSync(fullPath, content);
    console.log(`Fixed: ${filePath}`);
  } else {
    console.log(`File not found: ${filePath}`);
  }
});

console.log('All Image imports fixed!');
