-- Fix API Key Issue for johnlloydcallao@gmail.com
-- This script clears the corrupted API key data that's causing "Invalid initialization vector" error

-- Step 1: Check current state
SELECT 
    id, 
    email, 
    role, 
    enable_a_p_i_key, 
    api_key, 
    api_key_index,
    updated_at
FROM users 
WHERE email = 'johnlloydcallao@gmail.com';

-- Step 2: Clear the corrupted API key data
UPDATE users 
SET 
    enable_a_p_i_key = false,
    api_key = NULL,
    api_key_index = NULL,
    updated_at = NOW()
WHERE email = 'johnlloydcallao@gmail.com';

-- Step 3: Verify the fix
SELECT 
    id, 
    email, 
    role, 
    enable_a_p_i_key, 
    api_key, 
    api_key_index,
    updated_at
FROM users 
WHERE email = 'johnlloydcallao@gmail.com';

-- After running this script:
-- 1. The user should be able to login normally
-- 2. You can re-enable API key in the admin panel if needed
-- 3. PayloadCMS will generate a new, properly encrypted API key