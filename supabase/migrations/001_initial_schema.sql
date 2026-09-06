-- ============================================================
-- DESAG Election Management System — Initial Schema Migration
-- Version: 001
-- ============================================================

-- ============================================================
-- EXTENSIONS
-- ============================================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================
-- ENUMS
-- ============================================================
CREATE TYPE user_role AS ENUM (
  'super_admin',
  'election_admin',
  'returning_officer',
  'candidate_agent',
  'voter'
);

CREATE TYPE election_status AS ENUM (
  'draft',
  'scheduled',
  'open',
  'closed',
  'under_review',
  'awaiting_declaration',
  'declared',
  'archived'
);

CREATE TYPE agent_review_status AS ENUM (
  'pending',
  'accepted',
  'objected',
  'no_response_deemed_accepted'
);

CREATE TYPE objection_status AS ENUM (
  'open',
  'under_review',
  'resolved',
  'dismissed'
);

CREATE TYPE sms_status AS ENUM (
  'pending',
  'sent',
  'delivered',
  'failed'
);

CREATE TYPE credential_mode AS ENUM (
  'secure',
  'legacy'
);

CREATE TYPE voter_status AS ENUM (
  'active',
  'inactive',
  'suspended'
);

-- ============================================================
-- PROFILES (extends auth.users)
-- ============================================================
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  full_name TEXT,
  phone TEXT,
  role user_role NOT NULL DEFAULT 'voter',
  is_active BOOLEAN NOT NULL DEFAULT true,
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- ELECTIONS
-- ============================================================
CREATE TABLE elections (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT,
  academic_year TEXT NOT NULL,
  region TEXT NOT NULL DEFAULT 'Central Region',
  election_date DATE NOT NULL,
  voting_start_time TIMESTAMPTZ NOT NULL,
  voting_end_time TIMESTAMPTZ NOT NULL,
  timezone TEXT NOT NULL DEFAULT 'Africa/Accra',
  voting_instructions TEXT,
  voting_rules TEXT,
  status election_status NOT NULL DEFAULT 'draft',
  logo_url TEXT,
  banner_url TEXT,
  show_live_results_to_agents BOOLEAN NOT NULL DEFAULT false,
  agent_review_duration_minutes INT NOT NULL DEFAULT 30,
  result_published BOOLEAN NOT NULL DEFAULT false,
  election_reference TEXT UNIQUE,
  created_by UUID REFERENCES profiles(id),
  declared_by UUID REFERENCES profiles(id),
  declared_at TIMESTAMPTZ,
  declaration_statement TEXT,
  result_snapshot_taken_at TIMESTAMPTZ,
  agent_review_started_at TIMESTAMPTZ,
  agent_review_deadline TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- POSITIONS
-- ============================================================
CREATE TABLE positions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  election_id UUID NOT NULL REFERENCES elections(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  display_order INT NOT NULL DEFAULT 0,
  max_selections INT NOT NULL DEFAULT 1,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(election_id, name)
);

-- ============================================================
-- CANDIDATES
-- ============================================================
CREATE TABLE candidates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  election_id UUID NOT NULL REFERENCES elections(id) ON DELETE CASCADE,
  position_id UUID NOT NULL REFERENCES positions(id) ON DELETE CASCADE,
  candidate_code TEXT,
  full_name TEXT NOT NULL,
  photo_url TEXT,
  biography TEXT,
  slogan TEXT,
  manifesto TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  display_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- VOTERS
-- ============================================================
CREATE TABLE voters (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  election_id UUID NOT NULL REFERENCES elections(id) ON DELETE CASCADE,
  student_id TEXT NOT NULL,
  index_number TEXT,
  first_name TEXT NOT NULL,
  middle_name TEXT,
  last_name TEXT NOT NULL,
  full_name TEXT GENERATED ALWAYS AS (
    CASE
      WHEN middle_name IS NOT NULL AND middle_name <> '' THEN first_name || ' ' || middle_name || ' ' || last_name
      ELSE first_name || ' ' || last_name
    END
  ) STORED,
  phone TEXT NOT NULL,
  email TEXT,
  study_centre TEXT,
  programme TEXT,
  level TEXT,
  username TEXT NOT NULL,
  -- Passwords stored as bcrypt hash, never plaintext
  password_hash TEXT,
  -- Encrypted temp credential for operational recovery (restricted access)
  encrypted_temp_credential TEXT,
  credential_mode credential_mode NOT NULL DEFAULT 'secure',
  status voter_status NOT NULL DEFAULT 'active',
  is_eligible BOOLEAN NOT NULL DEFAULT true,
  has_voted BOOLEAN NOT NULL DEFAULT false,
  voted_at TIMESTAMPTZ,
  credential_generated_at TIMESTAMPTZ,
  credential_sent_at TIMESTAMPTZ,
  credential_sent_to TEXT,
  credential_sms_status sms_status,
  confirmation_sms_sent_at TIMESTAMPTZ,
  confirmation_sms_status sms_status,
  last_login_at TIMESTAMPTZ,
  import_batch_id UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(election_id, username),
  UNIQUE(election_id, phone),
  UNIQUE(election_id, student_id)
);

-- ============================================================
-- IMPORT BATCHES
-- ============================================================
CREATE TABLE import_batches (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  election_id UUID NOT NULL REFERENCES elections(id) ON DELETE CASCADE,
  filename TEXT NOT NULL,
  total_records INT NOT NULL DEFAULT 0,
  valid_records INT NOT NULL DEFAULT 0,
  imported_records INT NOT NULL DEFAULT 0,
  failed_records INT NOT NULL DEFAULT 0,
  duplicate_records INT NOT NULL DEFAULT 0,
  errors JSONB,
  imported_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- CANDIDATE AGENTS
-- ============================================================
CREATE TABLE candidate_agents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  election_id UUID NOT NULL REFERENCES elections(id) ON DELETE CASCADE,
  candidate_id UUID NOT NULL REFERENCES candidates(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id),
  full_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT,
  username TEXT NOT NULL,
  password_hash TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  review_status agent_review_status NOT NULL DEFAULT 'pending',
  review_decision_at TIMESTAMPTZ,
  review_notified_at TIMESTAMPTZ,
  acceptance_statement TEXT,
  digital_signature TEXT,
  device_metadata JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(election_id, username)
);

-- ============================================================
-- BALLOTS (anonymized — NOT linked to voter identity after creation)
-- Each ballot is a sealed anonymous record. The ballot_token is a
-- random UUID generated at submission and returned to the voter as
-- their receipt. It cannot be reverse-engineered to a voter.
-- ============================================================
CREATE TABLE ballots (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  election_id UUID NOT NULL REFERENCES elections(id) ON DELETE RESTRICT,
  ballot_token TEXT NOT NULL UNIQUE DEFAULT encode(gen_random_bytes(16), 'hex'),
  submitted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  is_valid BOOLEAN NOT NULL DEFAULT true
);

-- ============================================================
-- BALLOT SELECTIONS (which candidate each anonymous ballot voted for)
-- These records are NOT linked to any voter row.
-- ============================================================
CREATE TABLE ballot_selections (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  ballot_id UUID NOT NULL REFERENCES ballots(id) ON DELETE RESTRICT,
  position_id UUID NOT NULL REFERENCES positions(id) ON DELETE RESTRICT,
  candidate_id UUID NOT NULL REFERENCES candidates(id) ON DELETE RESTRICT,
  UNIQUE(ballot_id, position_id)
);

-- ============================================================
-- VOTER PARTICIPATION (records that a voter HAS voted — no ballot link)
-- This is intentionally SEPARATE from ballot_selections to ensure
-- anonymity. There is NO foreign key from ballots to voters.
-- ============================================================
CREATE TABLE voter_participation (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  election_id UUID NOT NULL REFERENCES elections(id) ON DELETE RESTRICT,
  voter_id UUID NOT NULL REFERENCES voters(id) ON DELETE RESTRICT,
  voted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  -- Confirmation token shown to the voter. Cannot be used to find their ballot.
  confirmation_reference TEXT NOT NULL UNIQUE DEFAULT encode(gen_random_bytes(8), 'hex'),
  session_metadata JSONB,
  UNIQUE(election_id, voter_id)
);

-- ============================================================
-- RESULT SNAPSHOTS (immutable, taken when voting closes)
-- ============================================================
CREATE TABLE result_snapshots (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  election_id UUID NOT NULL REFERENCES elections(id) ON DELETE RESTRICT,
  snapshot_data JSONB NOT NULL,
  total_registered_voters INT NOT NULL,
  total_votes_cast INT NOT NULL,
  turnout_percentage NUMERIC(5,2) NOT NULL,
  taken_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  taken_by UUID REFERENCES profiles(id)
);

-- ============================================================
-- OBJECTIONS
-- ============================================================
CREATE TABLE objections (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  election_id UUID NOT NULL REFERENCES elections(id) ON DELETE RESTRICT,
  agent_id UUID NOT NULL REFERENCES candidate_agents(id),
  candidate_id UUID NOT NULL REFERENCES candidates(id),
  position_id UUID NOT NULL REFERENCES positions(id),
  category TEXT NOT NULL,
  reason TEXT NOT NULL,
  evidence_url TEXT,
  status objection_status NOT NULL DEFAULT 'open',
  resolution_notes TEXT,
  resolved_by UUID REFERENCES profiles(id),
  resolved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- DECLARATIONS
-- ============================================================
CREATE TABLE declarations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  election_id UUID NOT NULL UNIQUE REFERENCES elections(id) ON DELETE RESTRICT,
  declared_by UUID NOT NULL REFERENCES profiles(id),
  declaring_officer_name TEXT NOT NULL,
  declaration_statement TEXT NOT NULL,
  declared_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  election_reference TEXT,
  checklist_data JSONB
);

-- ============================================================
-- NOTIFICATION TEMPLATES
-- ============================================================
CREATE TABLE notification_templates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  election_id UUID REFERENCES elections(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  template_key TEXT NOT NULL,
  body TEXT NOT NULL,
  is_global BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(template_key, COALESCE(election_id::text, 'global'))
);

-- ============================================================
-- SMS LOGS
-- ============================================================
CREATE TABLE sms_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  election_id UUID REFERENCES elections(id),
  recipient_name TEXT,
  recipient_phone TEXT NOT NULL,
  message_body TEXT NOT NULL,
  template_key TEXT,
  status sms_status NOT NULL DEFAULT 'pending',
  provider_message_id TEXT,
  provider_response JSONB,
  sent_by UUID REFERENCES profiles(id),
  sent_at TIMESTAMPTZ,
  delivered_at TIMESTAMPTZ,
  retry_count INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- AUDIT LOGS (append-only — NO UPDATE/DELETE policies)
-- ============================================================
CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  election_id UUID REFERENCES elections(id),
  actor_id UUID REFERENCES profiles(id),
  actor_role user_role,
  actor_email TEXT,
  action TEXT NOT NULL,
  entity_type TEXT,
  entity_id TEXT,
  metadata JSONB,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- SYSTEM SETTINGS
-- ============================================================
CREATE TABLE system_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  key TEXT NOT NULL UNIQUE,
  value JSONB NOT NULL,
  description TEXT,
  updated_by UUID REFERENCES profiles(id),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- LOGIN ATTEMPTS (for rate limiting / brute-force detection)
-- ============================================================
CREATE TABLE login_attempts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  username TEXT NOT NULL,
  ip_address INET,
  user_agent TEXT,
  success BOOLEAN NOT NULL DEFAULT false,
  attempted_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- INDEXES
-- ============================================================
CREATE INDEX idx_voters_election_id ON voters(election_id);
CREATE INDEX idx_voters_username ON voters(username);
CREATE INDEX idx_voters_phone ON voters(phone);
CREATE INDEX idx_voters_has_voted ON voters(election_id, has_voted);
CREATE INDEX idx_ballots_election_id ON ballots(election_id);
CREATE INDEX idx_ballot_selections_ballot_id ON ballot_selections(ballot_id);
CREATE INDEX idx_ballot_selections_position_id ON ballot_selections(position_id);
CREATE INDEX idx_ballot_selections_candidate_id ON ballot_selections(candidate_id);
CREATE INDEX idx_voter_participation_election_id ON voter_participation(election_id);
CREATE INDEX idx_voter_participation_voter_id ON voter_participation(voter_id);
CREATE INDEX idx_audit_logs_election_id ON audit_logs(election_id);
CREATE INDEX idx_audit_logs_actor_id ON audit_logs(actor_id);
CREATE INDEX idx_audit_logs_action ON audit_logs(action);
CREATE INDEX idx_sms_logs_election_id ON sms_logs(election_id);
CREATE INDEX idx_sms_logs_status ON sms_logs(status);
CREATE INDEX idx_login_attempts_username ON login_attempts(username);
CREATE INDEX idx_login_attempts_attempted_at ON login_attempts(attempted_at);
CREATE INDEX idx_candidates_election_id ON candidates(election_id);
CREATE INDEX idx_candidates_position_id ON candidates(position_id);
CREATE INDEX idx_positions_election_id ON positions(election_id);
CREATE INDEX idx_objections_election_id ON objections(election_id);
CREATE INDEX idx_candidate_agents_election_id ON candidate_agents(election_id);
CREATE INDEX idx_candidate_agents_candidate_id ON candidate_agents(candidate_id);

-- ============================================================
-- UPDATED_AT TRIGGER FUNCTION
-- ============================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_elections_updated_at BEFORE UPDATE ON elections
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_positions_updated_at BEFORE UPDATE ON positions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_candidates_updated_at BEFORE UPDATE ON candidates
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_voters_updated_at BEFORE UPDATE ON voters
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_candidate_agents_updated_at BEFORE UPDATE ON candidate_agents
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_objections_updated_at BEFORE UPDATE ON objections
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_notification_templates_updated_at BEFORE UPDATE ON notification_templates
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_sms_logs_updated_at BEFORE UPDATE ON sms_logs
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_system_settings_updated_at BEFORE UPDATE ON system_settings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================
-- NEW PROFILE TRIGGER (auto-create profile on auth.users insert)
-- ============================================================
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', '')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ============================================================
-- SECURE VOTE SUBMISSION FUNCTION
-- Atomically: checks eligibility, inserts ballot + selections,
-- marks voter as voted. Uses advisory lock to prevent race conditions.
-- ============================================================
CREATE OR REPLACE FUNCTION submit_vote(
  p_voter_id UUID,
  p_election_id UUID,
  p_selections JSONB  -- [{"position_id": "...", "candidate_id": "..."}]
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_voter voters%ROWTYPE;
  v_election elections%ROWTYPE;
  v_ballot_id UUID;
  v_ballot_token TEXT;
  v_confirmation_ref TEXT;
  v_selection JSONB;
  v_lock_acquired BOOLEAN;
BEGIN
  -- Acquire advisory lock per voter to prevent concurrent submissions
  SELECT pg_try_advisory_xact_lock(hashtext(p_voter_id::text)) INTO v_lock_acquired;
  IF NOT v_lock_acquired THEN
    RAISE EXCEPTION 'CONCURRENT_VOTE_ATTEMPT';
  END IF;

  -- Fetch voter with lock
  SELECT * INTO v_voter FROM voters WHERE id = p_voter_id AND election_id = p_election_id FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'VOTER_NOT_FOUND';
  END IF;

  IF v_voter.has_voted THEN
    RAISE EXCEPTION 'ALREADY_VOTED';
  END IF;

  IF NOT v_voter.is_eligible OR v_voter.status <> 'active' THEN
    RAISE EXCEPTION 'VOTER_INELIGIBLE';
  END IF;

  -- Fetch election
  SELECT * INTO v_election FROM elections WHERE id = p_election_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'ELECTION_NOT_FOUND';
  END IF;

  IF v_election.status <> 'open' THEN
    RAISE EXCEPTION 'ELECTION_NOT_OPEN';
  END IF;

  IF NOW() < v_election.voting_start_time OR NOW() > v_election.voting_end_time THEN
    RAISE EXCEPTION 'OUTSIDE_VOTING_WINDOW';
  END IF;

  -- Create anonymous ballot
  INSERT INTO ballots (election_id)
  VALUES (p_election_id)
  RETURNING id, ballot_token INTO v_ballot_id, v_ballot_token;

  -- Insert selections
  FOR v_selection IN SELECT * FROM jsonb_array_elements(p_selections) LOOP
    INSERT INTO ballot_selections (ballot_id, position_id, candidate_id)
    VALUES (
      v_ballot_id,
      (v_selection->>'position_id')::UUID,
      (v_selection->>'candidate_id')::UUID
    );
  END LOOP;

  -- Mark voter as voted (separate from ballot — preserves anonymity)
  UPDATE voters
  SET has_voted = true, voted_at = NOW()
  WHERE id = p_voter_id;

  -- Record participation (with confirmation reference, no ballot link)
  INSERT INTO voter_participation (election_id, voter_id)
  VALUES (p_election_id, p_voter_id)
  RETURNING confirmation_reference INTO v_confirmation_ref;

  RETURN jsonb_build_object(
    'success', true,
    'confirmation_reference', v_confirmation_ref,
    'submitted_at', NOW()
  );
END;
$$;

-- ============================================================
-- RESULT CALCULATION VIEW
-- ============================================================
CREATE OR REPLACE VIEW candidate_results AS
SELECT
  c.id AS candidate_id,
  c.election_id,
  c.position_id,
  c.full_name AS candidate_name,
  c.photo_url,
  c.candidate_code,
  p.name AS position_name,
  p.display_order AS position_order,
  COUNT(bs.id) AS vote_count,
  ROUND(
    COUNT(bs.id)::NUMERIC /
    NULLIF(SUM(COUNT(bs.id)) OVER (PARTITION BY c.position_id), 0) * 100,
    2
  ) AS vote_percentage,
  RANK() OVER (PARTITION BY c.position_id ORDER BY COUNT(bs.id) DESC) AS ranking
FROM candidates c
JOIN positions p ON p.id = c.position_id
LEFT JOIN ballot_selections bs ON bs.candidate_id = c.id
WHERE c.is_active = true
GROUP BY c.id, c.election_id, c.position_id, c.full_name, c.photo_url, c.candidate_code, p.name, p.display_order;

-- ============================================================
-- ELECTION STATS VIEW
-- ============================================================
CREATE OR REPLACE VIEW election_stats AS
SELECT
  e.id AS election_id,
  e.title,
  e.status,
  e.voting_start_time,
  e.voting_end_time,
  COUNT(DISTINCT v.id) AS total_registered_voters,
  COUNT(DISTINCT vp.voter_id) AS total_votes_cast,
  ROUND(
    COUNT(DISTINCT vp.voter_id)::NUMERIC /
    NULLIF(COUNT(DISTINCT v.id), 0) * 100,
    2
  ) AS turnout_percentage,
  COUNT(DISTINCT v.id) - COUNT(DISTINCT vp.voter_id) AS remaining_voters
FROM elections e
LEFT JOIN voters v ON v.election_id = e.id AND v.is_eligible = true AND v.status = 'active'
LEFT JOIN voter_participation vp ON vp.election_id = e.id
GROUP BY e.id, e.title, e.status, e.voting_start_time, e.voting_end_time;
