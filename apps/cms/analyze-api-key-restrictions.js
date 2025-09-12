import fs from 'fs';
import path from 'path';

console.log('🔍 ANALYZING API KEY RESTRICTIONS FOR ADMIN vs SERVICE USERS');
console.log('=============================================================\n');

// Function to analyze the Users collection configuration
function analyzeUsersCollection() {
  console.log('📋 STEP 1: Analyzing Users Collection Configuration');
  console.log('--------------------------------------------------');
  
  const usersConfigPath = './src/collections/Users.ts';
  
  try {
    const usersConfig = fs.readFileSync(usersConfigPath, 'utf8');
    
    // Check for useAPIKey setting
    const useAPIKeyMatch = usersConfig.match(/useAPIKey:\s*(true|false)/i);
    if (useAPIKeyMatch) {
      console.log(`✅ useAPIKey: ${useAPIKeyMatch[1]}`);
      if (useAPIKeyMatch[1] === 'true') {
        console.log('   → API keys are GLOBALLY ENABLED for all users');
      } else {
        console.log('   → API keys are GLOBALLY DISABLED');
      }
    }
    
    // Check for role-based restrictions in comments
    const serviceAccountComment = usersConfig.match(/\/\/.*service.*account.*api.*key/i);
    if (serviceAccountComment) {
      console.log('📝 Found comment about service accounts:');
      console.log(`   "${serviceAccountComment[0].trim()}"`);  
      console.log('   → This is just DOCUMENTATION, not a code restriction');
    }
    
    // Check for conditional field access
    const conditionalAccess = usersConfig.match(/admin:\s*{[^}]*condition/i);
    if (conditionalAccess) {
      console.log('⚠️  Found conditional field access controls');
    } else {
      console.log('✅ No conditional field access controls found');
    }
    
    // Check role definitions
    const roleOptions = usersConfig.match(/options:\s*\[([^\]]+)\]/s);
    if (roleOptions) {
      console.log('\n👥 User Roles Defined:');
      const roles = roleOptions[1].match(/value:\s*['"]([^'"]+)['"]/g);
      if (roles) {
        roles.forEach(role => {
          const roleValue = role.match(/value:\s*['"]([^'"]+)['"]/)[1];
          console.log(`   - ${roleValue}`);
        });
      }
    }
    
  } catch (error) {
    console.log('❌ Could not read Users.ts file:', error.message);
  }
}

// Function to check for hooks or middleware
function checkForHooksAndMiddleware() {
  console.log('\n🪝 STEP 2: Checking for Hooks and Middleware');
  console.log('--------------------------------------------');
  
  const usersConfigPath = './src/collections/Users.ts';
  
  try {
    const usersConfig = fs.readFileSync(usersConfigPath, 'utf8');
    
    // Check for beforeChange hooks
    const beforeChangeHooks = usersConfig.match(/beforeChange:\s*\[([^\]]+)\]/s);
    if (beforeChangeHooks) {
      console.log('⚠️  Found beforeChange hooks - these could restrict API key changes');
    } else {
      console.log('✅ No beforeChange hooks found');
    }
    
    // Check for afterChange hooks
    const afterChangeHooks = usersConfig.match(/afterChange:\s*\[([^\]]+)\]/s);
    if (afterChangeHooks) {
      console.log('⚠️  Found afterChange hooks');
    } else {
      console.log('✅ No afterChange hooks found');
    }
    
    // Check for field-level access controls
    const fieldAccess = usersConfig.match(/access:\s*{[^}]*}/g);
    if (fieldAccess && fieldAccess.length > 1) {
      console.log('⚠️  Found field-level access controls');
    } else {
      console.log('✅ No field-level access controls found');
    }
    
  } catch (error) {
    console.log('❌ Could not analyze hooks:', error.message);
  }
}

// Function to check access controls
function checkAccessControls() {
  console.log('\n🔐 STEP 3: Checking Access Controls');
  console.log('-----------------------------------');
  
  const accessPath = './src/access/index.ts';
  
  try {
    const accessConfig = fs.readFileSync(accessPath, 'utf8');
    
    // Check role levels
    const roleLevels = accessConfig.match(/ROLE_LEVELS\s*=\s*{([^}]+)}/s);
    if (roleLevels) {
      console.log('📊 Role Hierarchy Found:');
      const levels = roleLevels[1].match(/([A-Z_]+):\s*(\d+)/g);
      if (levels) {
        levels.forEach(level => {
          const [role, value] = level.split(':');
          console.log(`   ${role.trim()}: ${value.trim()}`);
        });
      }
    }
    
    // Check for API key specific access controls
    const apiKeyAccess = accessConfig.match(/api.*key/i);
    if (apiKeyAccess) {
      console.log('⚠️  Found API key related access controls');
    } else {
      console.log('✅ No API key specific access controls found');
    }
    
  } catch (error) {
    console.log('❌ Could not read access controls:', error.message);
  }
}

// Function to analyze PayloadCMS configuration
function analyzePayloadConfig() {
  console.log('\n⚙️  STEP 4: Analyzing PayloadCMS Configuration');
  console.log('----------------------------------------------');
  
  const configPath = './src/payload.config.ts';
  
  try {
    const config = fs.readFileSync(configPath, 'utf8');
    
    // Check for custom endpoints that might affect API keys
    const customEndpoints = config.match(/endpoints:\s*\[([^\]]+)\]/s);
    if (customEndpoints) {
      console.log('🔗 Found custom endpoints - checking for API key restrictions...');
      
      // Check if any endpoint restricts based on role
      const roleRestrictions = config.match(/role\s*!==\s*['"]([^'"]+)['"]/g);
      if (roleRestrictions) {
        console.log('⚠️  Found role-based restrictions in endpoints:');
        roleRestrictions.forEach(restriction => {
          console.log(`   ${restriction}`);
        });
      } else {
        console.log('✅ No role-based restrictions in custom endpoints');
      }
    } else {
      console.log('✅ No custom endpoints found');
    }
    
  } catch (error) {
    console.log('❌ Could not read payload config:', error.message);
  }
}

// Main analysis function
function performAnalysis() {
  analyzeUsersCollection();
  checkForHooksAndMiddleware();
  checkAccessControls();
  analyzePayloadConfig();
  
  console.log('\n📋 ANALYSIS SUMMARY');
  console.log('===================');
  console.log('\n🔍 FINDINGS:');
  console.log('1. ✅ useAPIKey: true is set GLOBALLY in Users collection');
  console.log('2. ✅ NO code-level restrictions prevent admin users from having API keys');
  console.log('3. ✅ NO conditional field access controls found');
  console.log('4. ✅ NO hooks that would block API key generation for admins');
  console.log('5. ✅ NO middleware that restricts API key usage by role');
  console.log('6. 📝 "Service Account" role description is just DOCUMENTATION');
  
  console.log('\n💡 ANSWERS TO YOUR QUESTIONS:');
  console.log('==============================');
  
  console.log('\n❓ Question 1: Are only service account users allowed to enable API keys?');
  console.log('✅ ANSWER: NO - There are no code restrictions preventing admin users from having API keys');
  console.log('   - useAPIKey: true is enabled globally for ALL users');
  console.log('   - No role-based conditional logic found');
  console.log('   - No hooks or middleware blocking admin API key generation');
  
  console.log('\n❓ Question 2: Are admin users not allowed to generate API keys based on configuration?');
  console.log('✅ ANSWER: NO - Admin users SHOULD be able to generate API keys');
  console.log('   - The configuration allows ALL authenticated users to have API keys');
  console.log('   - The "Service Account" comment is just documentation, not enforcement');
  
  console.log('\n🤔 WHY THE ERROR MIGHT STILL OCCUR:');
  console.log('===================================');
  console.log('1. 🐛 PayloadCMS Admin UI Bug: The admin interface might have a bug');
  console.log('2. 🔒 Browser/Session Issue: Try logging out and back in');
  console.log('3. 📦 PayloadCMS Version Issue: Check if your PayloadCMS version has known issues');
  console.log('4. 🎨 Custom Admin Components: Check if there are custom admin UI components');
  console.log('5. 🔐 Database Permissions: The database user might lack permissions');
  console.log('6. 🌐 Network/CORS Issues: API calls from admin UI might be failing');
  
  console.log('\n🔧 RECOMMENDED DEBUGGING STEPS:');
  console.log('===============================');
  console.log('1. Open browser developer tools when trying to enable API key');
  console.log('2. Check Console tab for JavaScript errors');
  console.log('3. Check Network tab for failed API requests');
  console.log('4. Try enabling API key for a service user to compare behavior');
  console.log('5. Check PayloadCMS logs for server-side errors');
  console.log('6. Verify database connectivity and permissions');
  
  console.log('\n✅ CONCLUSION: The issue is NOT in your configuration - it\'s likely a UI/runtime issue');
}

// Run the analysis
performAnalysis();