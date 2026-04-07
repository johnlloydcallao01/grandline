-- ============================================================================
-- Supabase Row Level Security (RLS) Policies for Chat System
-- ============================================================================
-- 
-- Execute this in your Supabase SQL Editor after enabling realtime tables.
-- ============================================================================

-- Drop existing permissive policies if they exist to apply new restricted policies
DROP POLICY IF EXISTS "Allow anon access" ON chats;
DROP POLICY IF EXISTS "Allow anon access" ON chat_messages;
DROP POLICY IF EXISTS "Allow anon access" ON chat_message_status;
DROP POLICY IF EXISTS "Allow anon access" ON chat_typing_status;
DROP POLICY IF EXISTS "Allow anon access" ON chat_messages_reactions;

-- Drop new policies if this file is run multiple times to ensure idempotency
DROP POLICY IF EXISTS "Users can read their chats" ON chats;
DROP POLICY IF EXISTS "Users can read chat messages" ON chat_messages;
DROP POLICY IF EXISTS "Users can read their message status" ON chat_message_status;
DROP POLICY IF EXISTS "Users can read typing status" ON chat_typing_status;

-- Enable RLS on all chat tables
alter table chats enable row level security;
alter table chat_messages enable row level security;
alter table chat_message_status enable row level security;
alter table chat_typing_status enable row level security;

-- Policy: Users can read chats where they are participants
create policy "Users can read their chats" on chats
for select to authenticated
using (
  exists (
    select 1 from chats_rels 
    where parent_id = chats.id 
    and users_id = COALESCE(
      current_setting('request.jwt.claims', true)::json->>'user_id',
      current_setting('request.jwt.claims', true)::json->>'sub',
      current_setting('request.jwt.claims', true)::json->>'id'
    )::integer
  )
);

-- Policy: Users can read messages from chats they participate in
create policy "Users can read chat messages" on chat_messages
for select to authenticated
using (
  exists (
    select 1 from chats_rels cr
    join chat_messages cm on cm.chat_id = cr.parent_id
    where cm.id = chat_messages.id
    and cr.users_id = COALESCE(
      current_setting('request.jwt.claims', true)::json->>'user_id',
      current_setting('request.jwt.claims', true)::json->>'sub',
      current_setting('request.jwt.claims', true)::json->>'id'
    )::integer
  )
);

-- Policy: Users can read their own message status
create policy "Users can read their message status" on chat_message_status
for select to authenticated
using (user_id = COALESCE(
  current_setting('request.jwt.claims', true)::json->>'user_id',
  current_setting('request.jwt.claims', true)::json->>'sub',
  current_setting('request.jwt.claims', true)::json->>'id'
)::integer);

-- Policy: Users can read typing status from chats they participate in
create policy "Users can read typing status" on chat_typing_status
for select to authenticated
using (
  exists (
    select 1 from chats_rels
    where parent_id = chat_typing_status.chat_id
    and users_id = COALESCE(
      current_setting('request.jwt.claims', true)::json->>'user_id',
      current_setting('request.jwt.claims', true)::json->>'sub',
      current_setting('request.jwt.claims', true)::json->>'id'
    )::integer
  )
);

-- ============================================================================
-- VERIFICATION
-- ============================================================================
-- Verify policies are created
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual
FROM pg_policies 
WHERE tablename IN ('chats', 'chat_messages', 'chat_message_status', 'chat_typing_status', 'chat_messages_reactions')
ORDER BY tablename, policyname;
