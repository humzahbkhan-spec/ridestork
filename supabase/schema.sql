-- RideStork v1 Schema
-- Run this in the Supabase SQL Editor

-- ══════════════════════════════════════════════════════
-- 1. Tables
-- ══════════════════════════════════════════════════════

-- Profiles — auto-created on signup
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  email TEXT NOT NULL,
  display_name TEXT,
  avatar_initials TEXT,
  phone TEXT,                          -- default contact number
  university TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Rides
CREATE TABLE rides (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  poster_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,

  -- Structured destination
  airport_code TEXT NOT NULL CHECK (airport_code IN ('SFO', 'SJC', 'OAK')),
  pickup_area TEXT NOT NULL,           -- e.g. "Wilbur Hall", "FloMo"
  notes TEXT,                          -- optional free-text

  -- Single departure timestamp + flexibility
  departure_at TIMESTAMPTZ NOT NULL,
  flex_window_minutes INTEGER DEFAULT 60 CHECK (flex_window_minutes >= 0),

  -- Capacity
  seats_total INTEGER NOT NULL DEFAULT 1 CHECK (seats_total BETWEEN 1 AND 6),
  bags INTEGER DEFAULT 1 CHECK (bags BETWEEN 0 AND 10),

  -- Contact: per-ride snapshot (overrides profiles.phone for this ride)
  contact_phone TEXT NOT NULL,

  -- Lifecycle
  status TEXT DEFAULT 'open' CHECK (status IN ('open', 'full', 'cancelled', 'completed')),

  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Ride Requests
CREATE TABLE ride_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ride_id UUID NOT NULL REFERENCES rides(id) ON DELETE CASCADE,
  requester_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'declined', 'cancelled')),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(ride_id, requester_id)
);

-- Contact Reveals — audit log for abuse detection
CREATE TABLE contact_reveals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ride_id UUID NOT NULL REFERENCES rides(id) ON DELETE CASCADE,
  requester_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  revealed_at TIMESTAMPTZ DEFAULT now()
);

-- ══════════════════════════════════════════════════════
-- 2. Indexes
-- ══════════════════════════════════════════════════════

CREATE INDEX idx_rides_poster ON rides(poster_id);
CREATE INDEX idx_rides_status ON rides(status);
CREATE INDEX idx_rides_departure ON rides(departure_at);
CREATE INDEX idx_ride_requests_ride ON ride_requests(ride_id);
CREATE INDEX idx_ride_requests_requester ON ride_requests(requester_id);
CREATE INDEX idx_contact_reveals_requester ON contact_reveals(requester_id);

-- ══════════════════════════════════════════════════════
-- 3. Public ride feed view (hides contact_phone + poster_id)
-- ══════════════════════════════════════════════════════

CREATE OR REPLACE VIEW ride_feed AS
SELECT
  r.id,
  r.airport_code,
  r.pickup_area,
  r.notes,
  r.departure_at,
  r.flex_window_minutes,
  r.seats_total,
  r.bags,
  r.status,
  r.created_at,
  p.display_name,
  p.avatar_initials,
  p.university,
  -- Only approved requests consume seats
  (SELECT COUNT(*) FROM ride_requests rr
   WHERE rr.ride_id = r.id AND rr.status = 'approved') AS seats_taken,
  -- Total interest (pending + approved)
  (SELECT COUNT(*) FROM ride_requests rr
   WHERE rr.ride_id = r.id AND rr.status IN ('pending', 'approved')) AS request_count
FROM rides r
JOIN profiles p ON r.poster_id = p.id;

-- ══════════════════════════════════════════════════════
-- 4. Row Level Security
-- ══════════════════════════════════════════════════════

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE rides ENABLE ROW LEVEL SECURITY;
ALTER TABLE ride_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE contact_reveals ENABLE ROW LEVEL SECURITY;

-- Profiles: users can read all, update own
CREATE POLICY "Profiles are viewable by everyone"
  ON profiles FOR SELECT USING (true);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- Rides: anyone can read, authenticated users can insert/update own
CREATE POLICY "Rides are viewable by everyone"
  ON rides FOR SELECT USING (true);

CREATE POLICY "Authenticated users can create rides"
  ON rides FOR INSERT WITH CHECK (auth.uid() = poster_id);

CREATE POLICY "Users can update own rides"
  ON rides FOR UPDATE USING (auth.uid() = poster_id);

-- Ride Requests: users can see own, posters can see requests on their rides
CREATE POLICY "Users can view own requests"
  ON ride_requests FOR SELECT USING (auth.uid() = requester_id);

CREATE POLICY "Ride posters can view requests on their rides"
  ON ride_requests FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM rides WHERE rides.id = ride_requests.ride_id AND rides.poster_id = auth.uid()
    )
  );

CREATE POLICY "Authenticated users can create requests"
  ON ride_requests FOR INSERT WITH CHECK (auth.uid() = requester_id);

CREATE POLICY "Users can update own requests"
  ON ride_requests FOR UPDATE USING (auth.uid() = requester_id);

CREATE POLICY "Ride posters can update requests on their rides"
  ON ride_requests FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM rides WHERE rides.id = ride_requests.ride_id AND rides.poster_id = auth.uid()
    )
  );

-- Contact Reveals: insert-only by the server (via SECURITY DEFINER function)
CREATE POLICY "No direct access to contact_reveals"
  ON contact_reveals FOR SELECT USING (false);

-- ══════════════════════════════════════════════════════
-- 5. Auto-create profile on signup (trigger)
-- ══════════════════════════════════════════════════════

CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, email, display_name, avatar_initials, university)
  VALUES (
    NEW.id,
    NEW.email,
    split_part(NEW.email, '@', 1),
    UPPER(LEFT(NEW.email, 2)),
    split_part(NEW.email, '@', 2)  -- e.g. "stanford.edu"
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ══════════════════════════════════════════════════════
-- 6. Auto-update updated_at (trigger)
-- ══════════════════════════════════════════════════════

CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER profiles_updated_at BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER rides_updated_at BEFORE UPDATE ON rides
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER ride_requests_updated_at BEFORE UPDATE ON ride_requests
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ══════════════════════════════════════════════════════
-- 7. RPC: request_to_join
--    - Overbooking protection (checks seats_total vs approved)
--    - Rate limits: max 10 requests per user per hour
--    - Cannot request own ride
--    - Logs the contact reveal
--    - Returns phone only (not email)
--    - Auto-marks ride 'full' when last seat fills
-- ══════════════════════════════════════════════════════

CREATE OR REPLACE FUNCTION request_to_join(p_ride_id UUID, p_requester_id UUID)
RETURNS JSON AS $$
DECLARE
  v_ride RECORD;
  v_approved_count INTEGER;
  v_recent_requests INTEGER;
  v_poster RECORD;
BEGIN
  -- 1. Fetch the ride
  SELECT * INTO v_ride FROM rides WHERE id = p_ride_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Ride not found';
  END IF;

  -- 2. Cannot request your own ride
  IF v_ride.poster_id = p_requester_id THEN
    RAISE EXCEPTION 'Cannot request your own ride';
  END IF;

  -- 3. Ride must be open
  IF v_ride.status != 'open' THEN
    RAISE EXCEPTION 'This ride is no longer accepting requests (status: %)', v_ride.status;
  END IF;

  -- 4. Rate limit: max 10 requests per user in the last hour
  SELECT COUNT(*) INTO v_recent_requests
  FROM ride_requests
  WHERE requester_id = p_requester_id
    AND created_at > now() - INTERVAL '1 hour';

  IF v_recent_requests >= 10 THEN
    RAISE EXCEPTION 'Rate limit exceeded. Try again later.';
  END IF;

  -- 5. Overbooking check: count approved requests
  SELECT COUNT(*) INTO v_approved_count
  FROM ride_requests
  WHERE ride_id = p_ride_id AND status = 'approved';

  IF v_approved_count >= v_ride.seats_total THEN
    -- Auto-mark ride as full if not already
    UPDATE rides SET status = 'full' WHERE id = p_ride_id AND status = 'open';
    RAISE EXCEPTION 'This ride is full';
  END IF;

  -- 6. Create the request (UNIQUE constraint prevents duplicates)
  INSERT INTO ride_requests (ride_id, requester_id, status)
  VALUES (p_ride_id, p_requester_id, 'pending');

  -- 7. Log the contact reveal
  INSERT INTO contact_reveals (ride_id, requester_id)
  VALUES (p_ride_id, p_requester_id);

  -- 8. Get poster display name
  SELECT display_name INTO v_poster FROM profiles WHERE id = v_ride.poster_id;

  -- 9. Return phone only (not email) to limit exposure
  RETURN json_build_object(
    'contact', json_build_object(
      'phone', v_ride.contact_phone,
      'name', v_poster.display_name
    )
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ══════════════════════════════════════════════════════
-- 8. Helper: check active rides for a user (for max-rides limit)
-- ══════════════════════════════════════════════════════

CREATE OR REPLACE FUNCTION count_active_rides(p_user_id UUID)
RETURNS INTEGER AS $$
  SELECT COUNT(*)::INTEGER FROM rides
  WHERE poster_id = p_user_id AND status = 'open';
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- ══════════════════════════════════════════════════════
-- 9. Auth Hook: restrict signups to @stanford.edu
--
--    This is a "Before User Created" hook. It runs inside
--    Supabase Auth before a new user row is inserted.
--    If the email domain is not stanford.edu, the hook
--    returns an error and the signup is blocked.
--
--    After running this SQL, register the hook in the
--    Supabase dashboard:
--      Auth → Hooks → Before User Created → Postgres Function
--      Schema: public
--      Function: enforce_stanford_domain
-- ══════════════════════════════════════════════════════

CREATE OR REPLACE FUNCTION enforce_stanford_domain(event JSONB)
RETURNS JSONB AS $$
DECLARE
  user_email TEXT;
BEGIN
  user_email := event->'record'->>'email';

  IF user_email IS NULL OR NOT user_email LIKE '%@stanford.edu' THEN
    RETURN jsonb_build_object(
      'decision', 'reject',
      'message', 'Only @stanford.edu email addresses are allowed.'
    );
  END IF;

  RETURN jsonb_build_object('decision', 'continue');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
