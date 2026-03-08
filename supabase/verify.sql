-- RideStork Post-Deploy Verification
-- Run these queries in the Supabase SQL Editor after deploying schema.sql
-- Every query should return results. If any returns empty, something is missing.

-- ══════════════════════════════════════════════════════
-- 1. Verify all tables exist
-- ══════════════════════════════════════════════════════

SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_name IN ('profiles', 'rides', 'ride_requests', 'contact_reveals')
ORDER BY table_name;
-- Expected: 4 rows

-- ══════════════════════════════════════════════════════
-- 2. Verify ride_feed view exists
-- ══════════════════════════════════════════════════════

SELECT table_name
FROM information_schema.views
WHERE table_schema = 'public'
  AND table_name = 'ride_feed';
-- Expected: 1 row

-- ══════════════════════════════════════════════════════
-- 3. Verify RLS is enabled on all tables
-- ══════════════════════════════════════════════════════

SELECT tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename IN ('profiles', 'rides', 'ride_requests', 'contact_reveals');
-- Expected: all 4 rows show rowsecurity = true

-- ══════════════════════════════════════════════════════
-- 4. Verify RLS policies exist
-- ══════════════════════════════════════════════════════

SELECT tablename, policyname, cmd
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;
-- Expected: policies for profiles (3), rides (3), ride_requests (5), contact_reveals (1)

-- ══════════════════════════════════════════════════════
-- 5. Verify functions exist
-- ══════════════════════════════════════════════════════

SELECT routine_name
FROM information_schema.routines
WHERE routine_schema = 'public'
  AND routine_name IN (
    'handle_new_user',
    'set_updated_at',
    'request_to_join',
    'count_active_rides',
    'enforce_stanford_domain'
  )
ORDER BY routine_name;
-- Expected: 5 rows

-- ══════════════════════════════════════════════════════
-- 6. Verify triggers exist
-- ══════════════════════════════════════════════════════

SELECT trigger_name, event_object_table, action_timing
FROM information_schema.triggers
WHERE trigger_schema = 'public'
ORDER BY event_object_table, trigger_name;
-- Expected: triggers on profiles, rides, ride_requests (updated_at)

-- Also verify the auth trigger:
SELECT tgname, tgrelid::regclass
FROM pg_trigger
WHERE tgname = 'on_auth_user_created';
-- Expected: 1 row pointing to auth.users

-- ══════════════════════════════════════════════════════
-- 7. Verify indexes exist
-- ══════════════════════════════════════════════════════

SELECT indexname, tablename
FROM pg_indexes
WHERE schemaname = 'public'
  AND indexname LIKE 'idx_%'
ORDER BY tablename, indexname;
-- Expected: 6 indexes (rides: 3, ride_requests: 2, contact_reveals: 1)

-- ══════════════════════════════════════════════════════
-- 8. Verify CHECK constraints on rides
-- ══════════════════════════════════════════════════════

SELECT conname, contype, pg_get_constraintdef(oid)
FROM pg_constraint
WHERE conrelid = 'public.rides'::regclass
  AND contype = 'c';
-- Expected: constraints for airport_code, seats_total, bags, status

-- ══════════════════════════════════════════════════════
-- 9. IMPORTANT: Verify auth hook is registered
--    This cannot be checked via SQL alone.
--    Go to: Supabase Dashboard → Auth → Hooks
--    Confirm "Before User Created" hook is set to:
--      Schema: public
--      Function: enforce_stanford_domain
-- ══════════════════════════════════════════════════════
