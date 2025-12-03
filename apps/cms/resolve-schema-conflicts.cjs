#!/usr/bin/env node

/**
 * PayloadCMS Schema Conflict Resolver
 * 
 * This script automatically resolves schema conflicts by creating new columns
 * instead of renaming existing ones, following the recommended approach.
 */

const { spawn } = require('child_process');
const { setTimeout } = require('timers');

console.log('🔧 Starting PayloadCMS Schema Conflict Resolution...');
console.log('📋 This script will automatically select "create column/enum" options');
console.log('');

// Start the dev process
const devProcess = spawn('pnpm', ['dev'], {
  stdio: ['pipe', 'pipe', 'pipe'],
  shell: true,
  cwd: process.cwd()
});


// Handle stdout (normal output)
devProcess.stdout.on('data', (data) => {
  const output = data.toString();
  process.stdout.write(output);
  
  // Check if we're being asked about schema conflicts
  if (output.includes('created or renamed')) {
    setTimeout(() => {
      console.log('🤖 Auto-selecting: CREATE column/enum (recommended option)');
      devProcess.stdin.write('\n');
    }, 1000);
  }
  
  // Check if the server is ready
  if (output.includes('Ready in') || output.includes('Local:')) {
    console.log('✅ PayloadCMS is starting...');
  }
});

// Handle stderr (error output)
devProcess.stderr.on('data', (data) => {
  const output = data.toString();
  process.stderr.write(output);
});

// Handle process exit
devProcess.on('close', (code) => {
  if (code === 0) {
    console.log('✅ PayloadCMS development server started successfully!');
    console.log('🌐 Access your CMS at: http://localhost:3001/admin');
  } else {
    console.log(`❌ Process exited with code ${code}`);
  }
});

// Handle process errors
devProcess.on('error', (error) => {
  console.error('❌ Error starting PayloadCMS:', error.message);
});

// Handle Ctrl+C gracefully
process.on('SIGINT', () => {
  console.log('\n🛑 Stopping PayloadCMS development server...');
  devProcess.kill('SIGINT');
  process.exit(0);
});

console.log('⏳ Starting PayloadCMS development server...');
console.log('💡 If prompted about schema conflicts, this script will automatically select "create" options');
console.log('🔄 Please wait while schema conflicts are resolved...');
console.log('');
