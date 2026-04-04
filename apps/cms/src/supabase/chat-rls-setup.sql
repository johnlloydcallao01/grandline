-- ============================================================================
-- Supabase Row Level Security (RLS) Policies for Chat System
-- ============================================================================
-- 
-- IMPORTANT: Your CMS uses Payload's built-in auth with integer IDs,
-- not Supabase Auth UUIDs. These policies are permissive for realtime
-- subscriptions while security is enforced at the Payload API layer.
--
-- Execute this in your Supabase SQL Editor after enabling realtime tables.
-- ============================================================================

-- Enable RLS on all chat tables (required for realtime to function)
ALTER TABLE chats ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_message_status ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_typing_status ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages_reactions ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- PERMISSIVE POLICIES
-- ============================================================================
-- These allow anon key access for realtime subscriptions.
-- Payload's access control handles actual authorization.

-- Chats: Allow all operations (Payload validates participant access)
CREATE POLICY "Allow anon access" ON chats
  FOR ALL
  TO anon
  USING (true)
  WITH CHECK (true);

-- Chat Messages: Allow all operations
CREATE POLICY "Allow anon access" ON chat_messages
  FOR ALL
  TO anon
  USING (true)
  WITH CHECK (true);

-- Chat Message Status: Allow all operations
CREATE POLICY "Allow anon access" ON chat_message_status
  FOR ALL
  TO anon
  USING (true)
  WITH CHECK (true);

-- Chat Typing Status: Allow all operations
CREATE POLICY "Allow anon access" ON chat_typing_status
  FOR ALL
  TO anon
  USING (true)
  WITH CHECK (true);

-- Chat Messages Reactions: Allow all operations
CREATE POLICY "Allow anon access" ON chat_messages_reactions
  FOR ALL
  TO anon
  USING (true)
  WITH CHECK (true);

-- ============================================================================
-- ALTERNATIVE: More Restrictive Policies (If Needed Later)
-- ============================================================================
/*
-- If you want to add JWT-based filtering in the future,
-- you can use these policies with a custom claim:

CREATE POLICY "Users read own participant chats" ON chats
  FOR SELECT
  TO anon
  USING (
    EXISTS (
      SELECT 1 FROM chats_rels
      WHERE parent_id = chats.id
      AND users_id = (current_setting('request.jwt.claims', true)::json->>'user_id')::int
    )
  );

-- Note: Requires sending user_id in JWT claims from frontend
*/

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
