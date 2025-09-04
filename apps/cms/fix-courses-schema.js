import { execSync } from 'child_process';

console.log('🔧 Running migration to fix courses schema conflicts...');

try {
  // Run the PayloadCMS migration command
  execSync('pnpm payload migrate', { 
    stdio: 'inherit',
    cwd: process.cwd()
  });
  
  console.log('✅ Migration completed successfully!');
  console.log('🚀 You can now run your development server with: pnpm dev');
} catch (error) {
  console.error('❌ Migration failed:', error.message);
  console.log('💡 Try running the migration manually with: pnpm payload migrate');
  process.exit(1);
}