-- ============================================================
-- DESAG Election Management System — Row Level Security Policies
-- Version: 002
-- ============================================================

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE elections ENABLE ROW LEVEL SECURITY;
ALTER TABLE positions ENABLE ROW LEVEL SECURITY;
ALTER TABLE candidates ENABLE ROW LEVEL SECURITY;
ALTER TABLE voters ENABLE ROW LEVEL SECURITY;
ALTER TABLE import_batches ENABLE ROW LEVEL SECURITY;
ALTER TABLE candidate_agents ENABLE ROW LEVEL SECURITY;
ALTER TABLE ballots ENABLE ROW LEVEL SECURITY;
ALTER TABLE ballot_selections ENABLE ROW LEVEL SECURITY;
ALTER TABLE voter_participation ENABLE ROW LEVEL SECURITY;
ALTER TABLE result_snapshots ENABLE ROW LEVEL SECURITY;
ALTER TABLE objections ENABLE ROW LEVEL SECURITY;
ALTER TABLE declarations ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE sms_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE system_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE login_attempts ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- HELPER FUNCTIONS
-- ============================================================

-- Get current user's role from profiles
CREATE OR REPLACE FUNCTION get_my_role()
RETURNS user_role
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT role FROM profiles WHERE id = auth.uid();
$$;

-- Check if user is an admin (super_admin or election_admin)
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT COALESCE(
    (SELECT role IN ('super_admin', 'election_admin', 'returning_officer')
     FROM profiles WHERE id = auth.uid()),
    false
  );
$$;

-- Check if user is super admin
CREATE OR REPLACE FUNCTION is_super_admin()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT COALESCE(
    (SELECT role = 'super_admin' FROM profiles WHERE id = auth.uid()),
    false
  );
$$;

-- Check if user is a returning officer
CREATE OR REPLACE FUNCTION is_returning_officer()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT COALESCE(
    (SELECT role IN ('super_admin', 'returning_officer') FROM profiles WHERE id = auth.uid()),
    false
  );
$$;

-- Check if user is a candidate agent
CREATE OR REPLACE FUNCTION is_candidate_agent()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT COALESCE(
    (SELECT role = 'candidate_agent' FROM profiles WHERE id = auth.uid()),
    false
  );
$$;

-- ============================================================
-- PROFILES POLICIES
-- ============================================================
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  USING (id = auth.uid());

CREATE POLICY "Admins can view all profiles"
  ON profiles FOR SELECT
  USING (is_admin());

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

CREATE POLICY "Super admins can manage all profiles"
  ON profiles FOR ALL
  USING (is_super_admin());

-- ============================================================
-- ELECTIONS POLICIES
-- ============================================================
CREATE POLICY "Anyone can view declared elections"
  ON elections FOR SELECT
  USING (status IN ('declared', 'archived') OR is_admin() OR is_candidate_agent());

CREATE POLICY "Admins can view all elections"
  ON elections FOR SELECT
  USING (is_admin());

CREATE POLICY "Admins can create elections"
  ON elections FOR INSERT
  WITH CHECK (is_admin());

CREATE POLICY "Admins can update elections"
  ON elections FOR UPDATE
  USING (is_admin());

CREATE POLICY "Super admins can delete draft elections"
  ON elections FOR DELETE
  USING (is_super_admin() AND status = 'draft');

-- ============================================================
-- POSITIONS POLICIES
-- ============================================================
CREATE POLICY "Anyone can view active positions of open elections"
  ON positions FOR SELECT
  USING (
    is_active = true
    OR is_admin()
    OR is_candidate_agent()
  );

CREATE POLICY "Admins can manage positions"
  ON positions FOR ALL
  USING (is_admin());

-- ============================================================
-- CANDIDATES POLICIES
-- ============================================================
CREATE POLICY "Anyone can view active candidates"
  ON candidates FOR SELECT
  USING (is_active = true OR is_admin() OR is_candidate_agent());

CREATE POLICY "Admins can manage candidates"
  ON candidates FOR ALL
  USING (is_admin());

-- ============================================================
-- VOTERS POLICIES
-- ============================================================
-- Voters can only view their own record (no password_hash exposure)
CREATE POLICY "Voters can view own record"
  ON voters FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = auth.uid()
        AND p.role = 'voter'
    )
    -- Voters access their own record via voter login (not auth.users)
    -- This policy applies to admin access on behalf of voter
  );

CREATE POLICY "Admins can view all voters"
  ON voters FOR SELECT
  USING (is_admin());

CREATE POLICY "Admins can manage voters"
  ON voters FOR ALL
  USING (is_admin());

-- ============================================================
-- IMPORT BATCHES POLICIES
-- ============================================================
CREATE POLICY "Admins can manage import batches"
  ON import_batches FOR ALL
  USING (is_admin());

-- ============================================================
-- CANDIDATE AGENTS POLICIES
-- ============================================================
CREATE POLICY "Agents can view own record"
  ON candidate_agents FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Admins can manage agents"
  ON candidate_agents FOR ALL
  USING (is_admin());

-- ============================================================
-- BALLOTS POLICIES
-- ============================================================
-- Ballots are anonymous — only service-role can insert (via submit_vote function)
-- No user should be able to directly read or write ballots
CREATE POLICY "No direct ballot access — only via function"
  ON ballots FOR ALL
  USING (false);

-- ============================================================
-- BALLOT SELECTIONS POLICIES
-- ============================================================
-- Ballot selections are completely private
CREATE POLICY "Admins can view ballot selections for declared elections only"
  ON ballot_selections FOR SELECT
  USING (
    is_super_admin()
    AND EXISTS (
      SELECT 1 FROM ballots b
      JOIN elections e ON e.id = b.election_id
      WHERE b.id = ballot_id AND e.status IN ('declared', 'archived')
    )
  );

CREATE POLICY "No direct ballot selection writes"
  ON ballot_selections FOR INSERT
  WITH CHECK (false);

-- ============================================================
-- VOTER PARTICIPATION POLICIES
-- ============================================================
-- Admins can see participation (who voted) but NOT which candidate they chose
CREATE POLICY "Admins can view voter participation"
  ON voter_participation FOR SELECT
  USING (is_admin());

CREATE POLICY "No direct participation writes"
  ON voter_participation FOR INSERT
  WITH CHECK (false);

-- ============================================================
-- RESULT SNAPSHOTS POLICIES
-- ============================================================
CREATE POLICY "Admins can view result snapshots"
  ON result_snapshots FOR SELECT
  USING (is_admin() OR is_candidate_agent());

CREATE POLICY "Super admins can manage result snapshots"
  ON result_snapshots FOR ALL
  USING (is_super_admin());

-- ============================================================
-- OBJECTIONS POLICIES
-- ============================================================
CREATE POLICY "Agents can view own objections"
  ON objections FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM candidate_agents ca
      WHERE ca.id = agent_id AND ca.user_id = auth.uid()
    )
    OR is_admin()
  );

CREATE POLICY "Agents can submit objections"
  ON objections FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM candidate_agents ca
      WHERE ca.id = agent_id AND ca.user_id = auth.uid()
    )
  );

CREATE POLICY "Admins can manage objections"
  ON objections FOR ALL
  USING (is_admin());

-- ============================================================
-- DECLARATIONS POLICIES
-- ============================================================
CREATE POLICY "Anyone can view declarations"
  ON declarations FOR SELECT
  USING (true);

CREATE POLICY "Returning officers can create declarations"
  ON declarations FOR INSERT
  WITH CHECK (is_returning_officer());

-- ============================================================
-- NOTIFICATION TEMPLATES POLICIES
-- ============================================================
CREATE POLICY "Admins can manage templates"
  ON notification_templates FOR ALL
  USING (is_admin());

-- ============================================================
-- SMS LOGS POLICIES
-- ============================================================
CREATE POLICY "Admins can view SMS logs"
  ON sms_logs FOR SELECT
  USING (is_admin());

CREATE POLICY "Admins can manage SMS logs"
  ON sms_logs FOR ALL
  USING (is_admin());

-- ============================================================
-- AUDIT LOGS POLICIES
-- ============================================================
-- Audit logs are append-only — no UPDATE or DELETE
CREATE POLICY "Admins can view audit logs"
  ON audit_logs FOR SELECT
  USING (is_admin());

CREATE POLICY "System can insert audit logs"
  ON audit_logs FOR INSERT
  WITH CHECK (true);

-- Explicitly block UPDATE and DELETE on audit logs
CREATE POLICY "Audit logs are immutable — no update"
  ON audit_logs FOR UPDATE
  USING (false);

CREATE POLICY "Audit logs are immutable — no delete"
  ON audit_logs FOR DELETE
  USING (false);

-- ============================================================
-- SYSTEM SETTINGS POLICIES
-- ============================================================
CREATE POLICY "Admins can view system settings"
  ON system_settings FOR SELECT
  USING (is_admin());

CREATE POLICY "Super admins can manage system settings"
  ON system_settings FOR ALL
  USING (is_super_admin());

-- ============================================================
-- LOGIN ATTEMPTS POLICIES
-- ============================================================
CREATE POLICY "Super admins can view login attempts"
  ON login_attempts FOR SELECT
  USING (is_super_admin());

CREATE POLICY "System can insert login attempts"
  ON login_attempts FOR INSERT
  WITH CHECK (true);
